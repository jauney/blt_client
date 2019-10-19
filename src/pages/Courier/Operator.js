import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import {
  Row,
  Col,
  Card,
  Form,
  Alert,
  Input,
  AutoComplete,
  Select,
  Icon,
  Button,
  Dropdown,
  Menu,
  InputNumber,
  DatePicker,
  Modal,
  message,
  Badge,
  Divider,
  Steps,
  Radio,
  Tag,
} from 'antd';
import { getSelectedAccount } from '@/utils/account';
import StandardTable from '@/components/StandardTable';
import OrderEditForm from '@/components/EditOrderForm';
import styles from './Courier.less';
import { CacheSite, CacheUser, CacheCompany, CacheRole } from '../../utils/storage';

const FormItem = Form.Item;
const { Option } = Select;
const { RangePicker } = DatePicker;

@Form.create()
class AddFormDialog extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
    this.formItemLayout = {
      labelCol: {
        xs: { span: 18 },
        sm: { span: 5 },
      },
      wrapperCol: {
        xs: { span: 18 },
        sm: { span: 8 },
      },
    };
  }

  onAddHandler = () => {
    const { addFormDataHandle, form, senderList = [] } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      let sender;
      senderList.forEach(item => {
        if (item.courier_id == fieldsValue['courier_id']) {
          sender = item;
        }
      });

      delete sender['__typename'];

      addFormDataHandle(sender);
    });
  };

  renderCustomerOption = item => {
    const AutoOption = AutoComplete.Option;
    return (
      <AutoOption
        key={item.expensetype_id}
        expensetype_id={item.expensetype_id}
        text={item.expensetype}
      >
        {item.expensetype}
      </AutoOption>
    );
  };

  render() {
    const { modalVisible, onCancelHandler, senderList, form } = this.props;
    return (
      <Modal
        destroyOnClose
        title="更改送货人"
        visible={modalVisible}
        onCancel={() => onCancelHandler()}
        footer={[
          <Button key="btn-cancel" onClick={() => onCancelHandler()}>
            取 消
          </Button>,
          <Button key="btn-save" type="primary" onClick={this.onAddHandler}>
            保 存
          </Button>,
        ]}
        width={800}
        className={styles.modalForm}
      >
        <Form>
          <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
            <Col>
              <FormItem {...this.formItemLayout} label="送货人">
                {form.getFieldDecorator('courier_id', {
                  initialValue: '',
                  rules: [{ required: true, message: '请选择送货人' }],
                })(
                  <Select placeholder="请选择" style={{ width: '150px' }}>
                    {senderList.map(ele => {
                      return (
                        <Option key={ele.courier_id} value={ele.courier_id}>
                          {ele.courier_name}
                        </Option>
                      );
                    })}
                  </Select>
                )}
              </FormItem>
            </Col>
          </Row>
        </Form>
      </Modal>
    );
  }
}

/* eslint react/no-multi-comp:0 */
@connect(({ customer, company, order, site, car, courier, loading }) => {
  return {
    customer,
    company,
    order,
    site,
    car,
    courier,
    loading: loading.models.rule,
  };
})
@Form.create()
class TableList extends PureComponent {
  state = {
    selectedRows: [],
    accountStatistic: {},
    formValues: {},
    current: 1,
    pageSize: 20,
    record: {},
    updateOrderModalVisible: false,
    downloadModalVisible: false,
    addFormModalVisible: false,
    currentSite: {},
  };

  columns = [
    {
      title: '经办人',
      width: 60,
      dataIndex: 'operator_name',
      sorter: true,
    },
    {
      title: '货单号',
      width: 60,
      dataIndex: 'order_code',
      sorter: true,
    },
    {
      title: '发货客户',
      width: 60,
      dataIndex: 'sendcustomer_name',
    },
    {
      title: '收获客户',
      width: 60,
      dataIndex: 'getcustomer_name',
      sorter: true,
    },
    {
      title: '应收货款',
      width: 60,
      dataIndex: 'order_amount',
      sorter: true,
    },
    {
      title: '实收货款',
      dataIndex: 'order_real',
      sorter: true,
    },
    {
      title: '运费',
      width: 60,
      dataIndex: 'trans_real',
      sorter: true,
    },
    {
      title: '折后运费',
      width: 60,
      dataIndex: 'trans_discount',
      sorter: true,
    },
    {
      title: '运费方式',
      width: 60,
      dataIndex: 'trans_type',
      sorter: true,
      render: val => {
        let transType = '';
        if (val === 1) {
          transType = '现付';
        } else if (val === 2) {
          transType = '回付';
        } else {
          transType = '提付';
        }
        return transType;
      },
    },
    {
      title: '垫付',
      width: 60,
      dataIndex: 'order_advancepay_amount',
      sorter: true,
    },
    {
      title: '送货费',
      width: 60,
      dataIndex: 'deliver_amount',
      sorter: true,
    },
    {
      title: '保价费',
      width: 60,
      dataIndex: 'insurance_fee',
      sorter: true,
    },
    {
      title: '货物名称',
      width: 100,
      dataIndex: 'order_name',
      sorter: true,
    },
    {
      title: '录票时间',
      width: 80,
      dataIndex: 'create_date',
      render: val => (
        <span>{(val && moment(Number(val || 0)).format('YYYY-MM-DD HH:mm:ss')) || ''}</span>
      ),
    },
    {
      title: '发车时间',
      width: 100,
      dataIndex: 'depart_date',
      render: val => (
        <span>{(val && moment(Number(val || 0)).format('YYYY-MM-DD HH:mm:ss')) || ''}</span>
      ),
    },
    {
      title: '结算时间',
      width: 100,
      dataIndex: 'settle_date',
      render: val => (
        <span>{(val && moment(Number(val || 0)).format('YYYY-MM-DD HH:mm:ss')) || ''}</span>
      ),
    },
    {
      title: '付款日期',
      width: 60,
      dataIndex: 'pay_date',
      sorter: true,
    },
    {
      title: '分公司',
      width: 60,
      dataIndex: 'car_code',
      sorter: true,
    },
    {
      title: '站点',
      width: 60,
      dataIndex: 'site_name',
      sorter: true,
    },
    {
      title: '配载站',
      width: 60,
      dataIndex: 'shipsite_name',
      sorter: true,
    },
    {
      title: '中转',
      width: 60,
      dataIndex: 'transfer_type',
      sorter: true,
      render: val => {
        let $transferType = '';
        if (val == 1) {
          $transferType = '转出';
        } else if (val == 2) {
          $transferType = '转入';
        }
        return $transferType;
      },
    },
    {
      title: '异常情况',
      width: 60,
      dataIndex: 'abnormal_type',
      sorter: true,
    },
    {
      title: '备注',
      dataIndex: 'remark',
    },
  ];

  async componentDidMount() {
    const { dispatch } = this.props;

    this.fetchCompanySiteList();
    this.fetchOperatorList();

    // 页面初始化获取一次订单信息，否则会显示其他页面的缓存信息
    this.getOrderList();
  }

  handleSelectRows = rows => {
    this.setState({
      selectedRows: rows,
    });
  };

  fetchCompanySiteList = async () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'site/getSiteListAction',
      payload: { pageNo: 1, pageSize: 100, filter: { company_id: CacheCompany.company_id } },
    });
  };

  fetchOperatorList = async companyId => {
    const { dispatch } = this.props;
    const { currentSite } = this.state;
    const filter = {};
    filter.company_id = CacheCompany.company_id;

    if (currentSite && currentSite.site_id) {
      filter.site_id = currentSite.site_id;
    }
    dispatch({
      type: 'courier/getOperatorListAction',
      payload: {
        pageNo: 1,
        pageSize: 100,
        filter,
      },
    });
  };

  onCompanySelect = async (value, option) => {};

  onSiteSelect = async (value, option) => {
    const {
      dispatch,
      site: { siteList },
    } = this.props;

    const currentSite = siteList.filter(item => {
      if (item.site_id == value) {
        return item;
      }
    });
    if (currentSite.length > 0) {
      this.setState({
        currentSite: currentSite[0],
      });
    }
    this.fetchOperatorList();
  };

  handleSearch = e => {
    e && e.preventDefault();
    this.getOrderList();
  };

  /**
   * 获取订单信息
   */
  getOrderList = (data = {}, pageNo = 1) => {
    const { dispatch, form } = this.props;
    const { current, pageSize } = this.state;

    form.validateFields((err, fieldsValue) => {
      if (err) return;
      // create_date
      Object.keys(fieldsValue).forEach(key => {
        const item = fieldsValue[key];
        if (!item) {
          delete fieldsValue[key];
        }
      });

      const searchParams = Object.assign({ filter: fieldsValue }, data);
      dispatch({
        type: 'courier/getOrderListAction',
        payload: { pageNo: pageNo || current, pageSize, ...searchParams },
      });

      dispatch({
        type: 'courier/getOrderStatisticAction',
        payload: { ...searchParams },
      });
    });
  };

  /**
   * 表格排序、分页响应
   */
  handleStandardTableChange = async (pagination, filtersArg, sorter) => {
    const { dispatch } = this.props;
    const { formValues, pageSize } = this.state;

    let sort = {};
    let current = 1;
    // 变更排序
    if (sorter.field) {
      sort = { sorter: `${sorter.field}|${sorter.order}` };
    }
    // 变更pageSize
    if (pagination && pagination.pageSize != pageSize) {
      current = 1;

      await this.setState({
        pageSize: pagination.pageSize,
      });
    }
    // 切换页数
    else if (pagination && pagination.current) {
      current = pagination.current;
    }
    await this.setState({
      current,
    });
    this.getOrderList(sort, current);
  };

  // 打印
  onPrint = async () => {
    this.setState({
      printModalVisible: true,
    });
  };

  onPrintCancel = async () => {
    this.setState({
      printModalVisible: false,
    });
  };

  onPrintOk = async () => {
    const { selectedRows } = this.state;
    const orderIds = selectedRows.map(item => {
      return item.order_id;
    });
    let result = await dispatch({
      type: 'unsettle/printAction',
      payload: {
        order_id: orderIds,
      },
    });
    if (result.code == 0) {
      message.success('打印成功！');

      this.onPrintCancel();
    } else {
      message.error(result.msg);
    }
  };

  // 下载
  onDownload = async () => {
    this.setState({
      downloadModalVisible: true,
    });
  };

  onDownloadCancel = async () => {
    this.setState({
      downloadModalVisible: false,
    });
  };

  onDownloadOk = async () => {
    const { selectedRows } = this.state;
    const orderIds = selectedRows.map(item => {
      return item.order_id;
    });
    let result = await dispatch({
      type: 'unsettle/downloadAction',
      payload: {
        order_id: orderIds,
      },
    });
    if (result.code == 0) {
      message.success('下载成功！');

      this.onDownloadCancel();
    } else {
      message.error(result.msg);
    }
  };

  // 更改送货人
  onUpdateSenderModal = () => {
    this.setState({
      addFormModalVisible: true,
    });
  };

  // 添加送货人
  addFormDataHandle = async data => {
    const { dispatch } = this.props;
    const { selectedRows = [] } = this.state;
    const orderIds = [];
    const customerIds = [];
    selectedRows.forEach(item => {
      orderIds.push(item.order_id);
      customerIds.push(item.getcustomer_id);
    });

    const result = await dispatch({
      type: 'courier/updateCustomerCourierAction',
      payload: {
        type: 'sender',
        order_id: orderIds,
        customer_id: customerIds,
        courier: data,
      },
    });
    if (result && result.code == 0) {
      message.success('更新成功！');
      this.handleSearch();
      this.onCancelAddFormClick();
    } else {
      message.error((result && result.msg) || '更新失败');
    }
  };

  onCancelAddFormClick = async () => {
    this.setState({
      addFormModalVisible: false,
    });
  };

  // 删除送货人
  onDelSender = async () => {
    Modal.confirm({
      title: '确认',
      content: '确定要取消勾选订单、收货客户关联的送货人吗？',
      okText: '确认',
      cancelText: '取消',
      onOk: this.onDelSenderConfirm,
    });
  };

  onDelSenderConfirm = async () => {
    const { dispatch } = this.props;
    const { selectedRows = [] } = this.state;
    const orderIds = [];
    const customerIds = [];
    selectedRows.forEach(item => {
      orderIds.push(item.order_id);
      customerIds.push(item.getcustomer_id);
    });

    const result = await dispatch({
      type: 'courier/updateCustomerCourierAction',
      payload: {
        type: 'sender',
        order_id: orderIds,
        customer_id: customerIds,
        courier: {},
      },
    });
    if (result && result.code == 0) {
      message.success('取消成功！');
      this.handleSearch();
    } else {
      message.error((result && result.msg) || '取消失败');
    }
  };

  /**
   * 修改订单信息弹窗
   */
  onUpdateOrderModalShow = () => {
    this.setState({
      updateOrderModalVisible: true,
    });
  };

  onUpdateOrderModalCancel = () => {
    // setTimeout(() => this.addBtn.blur(), 0);
    this.setState({
      updateOrderModalVisible: false,
    });
  };

  // 编辑订单信息
  onRowDoubleClick = (record, index, event) => {
    this.setState({
      record,
    });
    this.onUpdateOrderModalShow();
  };

  // 已结算账目核对中，计算付款日期
  onRowClick = (record, index, event) => {};

  renderSimpleForm() {
    const {
      form: { getFieldDecorator },
      customer: { getCustomerList, sendCustomerList },
      company: { branchCompanyList },
      courier: { operatorList },
      site: { siteList },
    } = this.props;
    const formItemLayout = {};
    const companyOption = { initialValue: CacheCompany.company_id };
    const siteOption = {};
    // 默认勾选第一个站点
    if (siteList.length > 0) {
      siteOption.initialValue = siteList[0].company_id || '';
    }

    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        {CacheCompany.company_type == 2 && (
          <FormItem label="分公司" {...formItemLayout}>
            {getFieldDecorator('company_id', companyOption)(
              <Select
                placeholder="请选择"
                onSelect={this.onCompanySelect}
                style={{ width: '150px' }}
              >
                {[CacheCompany].map(ele => {
                  return (
                    <Option key={ele.company_id} value={ele.company_id}>
                      {ele.company_name}
                    </Option>
                  );
                })}
              </Select>
            )}
          </FormItem>
        )}
        {CacheCompany.company_type == 1 && (
          <FormItem label="站点" {...formItemLayout}>
            {getFieldDecorator('site_id', siteOption)(
              <Select
                placeholder="请选择"
                onSelect={this.onSiteSelect}
                onChange={this.onSiteSelect}
                style={{ width: '150px' }}
                allowClear
              >
                {siteList.map(ele => {
                  return (
                    <Option key={ele.site_id} value={ele.site_id}>
                      {ele.site_name}
                    </Option>
                  );
                })}
              </Select>
            )}
          </FormItem>
        )}
        <FormItem label="运单日期">
          {getFieldDecorator('create_date', {})(<RangePicker style={{ width: '250px' }} />)}
        </FormItem>
        <FormItem label="运单号" {...formItemLayout}>
          {getFieldDecorator('order_code', {})(
            <Input placeholder="请输入" style={{ width: '150px' }} />
          )}
        </FormItem>
        <FormItem label="货车编号" {...formItemLayout}>
          {getFieldDecorator('car_code', {})(
            <Input placeholder="请输入" style={{ width: '150px' }} />
          )}
        </FormItem>
        <FormItem label="经办人" {...formItemLayout}>
          {getFieldDecorator('operator_id', {})(
            <Select placeholder="请选择" style={{ width: '150px' }}>
              {operatorList.map(ele => {
                return (
                  <Option key={ele.user_id} value={ele.user_id}>
                    {ele.user_name}
                  </Option>
                );
              })}
            </Select>
          )}
        </FormItem>
        <Form.Item {...formItemLayout}>
          <Button type="primary" htmlType="submit">
            查询
          </Button>
        </Form.Item>
      </Form>
    );
  }

  renderForm() {
    return this.renderSimpleForm();
  }

  render() {
    const {
      courier: { orderList, total, totalOrderAmount, totalTransAmount },
      courier: { senderList },
      loading,
      dispatch,
    } = this.props;

    const {
      selectedRows,
      current,
      pageSize,
      updateOrderModalVisible,
      downloadModalVisible,
      addFormModalVisible,
      record,
    } = this.state;

    return (
      <div>
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>{this.renderForm()}</div>
            <div className={styles.tableListOperator} />
            <StandardTable
              selectedRows={selectedRows}
              loading={loading}
              className={styles.dataTable}
              scroll={{ x: 900 }}
              rowKey="order_id"
              data={{
                list: orderList,
                pagination: {
                  total,
                  pageSize,
                  current,
                },
              }}
              columns={this.columns}
              onSelectRow={this.handleSelectRows}
              onChange={this.handleStandardTableChange}
              onRow={(record, rowIndex) => {
                return {
                  onClick: event => {
                    this.onRowClick(record, rowIndex, event);
                  },
                  onDoubleClick: event => {
                    this.onRowDoubleClick(record, rowIndex, event);
                  },
                };
              }}
              rowClassName={(record, index) => {}}
              footer={() => `货款总额：${totalOrderAmount}   运费总额：${totalTransAmount}`}
            />
          </div>
        </Card>
        <OrderEditForm
          modalVisible={updateOrderModalVisible}
          record={record}
          onCancelModal={this.onUpdateOrderModalCancel}
          handleSearch={this.handleSearch}
          isEdit={1}
          dispatch={dispatch}
        />
        <AddFormDialog
          modalVisible={addFormModalVisible}
          addFormDataHandle={this.addFormDataHandle}
          onCancelHandler={this.onCancelAddFormClick}
          senderList={senderList}
          selectedRows={selectedRows}
        />

        <Modal
          title="确认"
          visible={downloadModalVisible}
          onOk={this.onDownloadOk}
          onCancel={this.onDownloadCancel}
        >
          <p>您确认要下载么？</p>
        </Modal>
      </div>
    );
  }
}

export default TableList;
