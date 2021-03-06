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
import { locale } from '@/utils';
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
        okText="确认"
        cancelText="取消"
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
                  <Select placeholder="全部" style={{ width: '150px' }}>
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
    btnSearchClicked: false,
  };

  columns = [
    {
      title: '经办人',
      width: '80px',
      dataIndex: 'operator_name',
      sorter: true,
    },
    {
      title: '货单号',
      width: '80px',
      dataIndex: 'order_code',
      sorter: true,
    },
    {
      title: '发货客户',
      width: '80px',
      dataIndex: 'sendcustomer_name',
      sorter: true,
    },
    {
      title: '收货客户',
      width: '80px',
      dataIndex: 'getcustomer_name',
      sorter: true,
    },
    {
      title: '应收货款',
      width: '80px',
      dataIndex: 'order_amount',
      sorter: true,
    },
    {
      title: '实收货款',
      dataIndex: 'order_real',
      width: '80px',
      sorter: true,
    },
    {
      title: '折后运费',
      width: '80px',
      dataIndex: 'trans_discount',
      sorter: true,
    },
    {
      title: '运费方式',
      width: '80px',
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
      width: '80px',
      dataIndex: 'order_advancepay_amount',
    },
    {
      title: '送货费',
      width: '80px',
      dataIndex: 'deliver_amount',
    },
    {
      title: '保价费',
      width: '80px',
      dataIndex: 'insurance_fee',
    },
    {
      title: '货物名称',
      width: '150px',
      dataIndex: 'order_name',
    },
    {
      title: '录票时间',
      width: '170px',
      dataIndex: 'create_date',
      render: val => <span>{(val && moment(val).format('YYYY-MM-DD HH:mm:ss')) || ''}</span>,
    },
    {
      title: '结算时间',
      width: '170px',
      dataIndex: 'settle_date',
      render: val => <span>{(val && moment(val).format('YYYY-MM-DD HH:mm:ss')) || ''}</span>,
    },
    {
      title: '付款日期',
      width: '170px',
      dataIndex: 'pay_date',
      render: val => <span>{(val && moment(val).format('YYYY-MM-DD HH:mm:ss')) || ''}</span>,
    },
    {
      title: '分公司',
      width: '80px',
      dataIndex: 'company_name',
    },
    {
      title: '站点',
      width: '80px',
      dataIndex: 'site_name',
    },
    {
      title: '配载站',
      width: '80px',
      dataIndex: 'shipsite_name',
    },
    {
      title: '中转',
      width: '80px',
      dataIndex: 'transfer_type',

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
      width: '80px',
      dataIndex: 'abnormal_type',
    },
    {
      title: '备注',
      width: '150px',
      dataIndex: 'remark',
    },
  ];

  async componentDidMount() {
    const { dispatch } = this.props;

    dispatch({
      type: 'courier/initOrderListAction',
    });
    // 下站只显示当前分公司
    await dispatch({
      type: 'company/getBranchCompanyList',
      payload: { ...CacheCompany },
    });
    await this.fetchCompanySiteList();
    this.fetchOperatorList();
  }

  handleSelectRows = rows => {
    this.setState({
      selectedRows: rows,
    });
  };

  fetchCompanySiteList = async () => {
    const { dispatch } = this.props;
    const siteList = await dispatch({
      type: 'site/getSiteListAction',
      payload: { pageNo: 1, pageSize: 100, filter: {} },
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

  // 调用table子组件
  onRefTable = ref => {
    this.standardTable = ref;
  };

  /**
   * 获取订单信息
   */
  getOrderList = (data = {}, pageNo = 1) => {
    const { dispatch, form } = this.props;
    const { current, pageSize, btnSearchClicked } = this.state;

    form.validateFields(async (err, fieldsValue) => {
      if (err) {
        this.setState({
          btnSearchClicked: false,
        });
        return;
      }
      if (btnSearchClicked) {
        return;
      }
      this.setState({
        btnSearchClicked: true,
      });

      Object.keys(fieldsValue).forEach(key => {
        const item = fieldsValue[key];
        if (!item) {
          delete fieldsValue[key];
        }
      });

      const searchParams = Object.assign({ filter: fieldsValue }, data);
      await dispatch({
        type: 'courier/getOrderListAction',
        payload: { pageNo: pageNo || current, pageSize, ...searchParams },
      });

      await dispatch({
        type: 'courier/getOrderStatisticAction',
        payload: { ...searchParams },
      });

      this.setState({
        btnSearchClicked: false,
      });

      this.standardTable.cleanSelectedKeys();
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

  tableFooter = () => {
    const {
      courier: {
        total,
        totalOrderAmount,
        totalTransAmount,
        totalInsurancefee,
        totalRealTransAmount,
        totalRealOrderAmount,
        totalAdvancepayAmount,
        totalDeliverAmount,
        totalTifuTransAmount,
        totalXianTransAmount,
        totalLatefee,
        totalBonusfee,
        totalCarFeeConfirm,
        totalCarFee,
        totalTifuInsurance,
        totalXianInsurence,
      },
    } = this.props;
    return (
      <div className={styles.tableFooter}>
        <span>货款总额：{totalOrderAmount || '0'}</span>
        <span className={styles.footerSplit}>实收货款：{totalRealOrderAmount || '0'}</span>
        <span className={styles.footerSplit}>运费总额：{totalTransAmount || '0'}</span>
        <span className={styles.footerSplit}>提付运费：{totalTifuTransAmount || '0'}</span>
        <span className={styles.footerSplit}>西安运费：{totalXianTransAmount || '0'}</span>
        <span className={styles.footerSplit}>垫付货款：{totalAdvancepayAmount || '0'}</span>
        <span className={styles.footerSplit}>送货费：{totalDeliverAmount || '0'}</span>
        <span className={styles.footerSplit}>西安保费：{totalXianInsurence || '0'}</span>
        <span className={styles.footerSplit}>提付保费：{totalTifuInsurance || '0'}</span>
        <span className={styles.footerSplit}>滞纳金：{totalLatefee || '0'}</span>
        <span className={styles.footerSplit}>奖金：{totalBonusfee || '0'}</span>
        <span className={styles.footerSplit}>未结算货车运费：{totalCarFee || '0'}</span>
        <span className={styles.footerSplit}>已结算货车运费：{totalCarFeeConfirm || '0'}</span>
        <span className={styles.footerSplit}>票数：{total || '0'}</span>
      </div>
    );
  };

  renderSimpleForm() {
    const {
      form: { getFieldDecorator },
      customer: { getCustomerList, sendCustomerList },
      company: { branchCompanyList = [] },
      courier: { operatorList },
      site: { siteList, entrunkSiteList },
    } = this.props;
    const { btnSearchClicked } = this.state;

    const formItemLayout = {};
    let companyOption = { initialValue: CacheCompany.company_id };
    const siteOption = {};
    // 默认勾选第一个站点
    if (siteList.length > 0) {
      siteOption.initialValue = siteList[0].company_id || '';
    }
    let allowClear = false;
    if (CacheCompany.company_type == 1) {
      allowClear = true;
      companyOption = {
        initialValue: branchCompanyList.length > 0 ? branchCompanyList[0].company_id : '',
      };
    }

    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <FormItem label="分公司" {...formItemLayout}>
          {getFieldDecorator('company_id', companyOption)(
            <Select
              placeholder="全部"
              onSelect={this.onCompanySelect}
              style={{ width: '100px' }}
              allowClear={allowClear}
            >
              {(CacheCompany.company_type == 2 ? [CacheCompany] : branchCompanyList).map(ele => {
                return (
                  <Option key={ele.company_id} value={ele.company_id}>
                    {ele.company_name}
                  </Option>
                );
              })}
            </Select>
          )}
        </FormItem>
        {CacheCompany.company_type == 1 && (
          <FormItem label="站点" {...formItemLayout}>
            {getFieldDecorator('site_id', siteOption)(
              <Select
                placeholder="全部"
                onSelect={this.onSiteSelect}
                onChange={this.onSiteSelect}
                style={{ width: '100px' }}
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
          {getFieldDecorator('create_date', {})(
            <RangePicker locale={locale} style={{ width: '250px' }} />
          )}
        </FormItem>
        <FormItem label="运单号" {...formItemLayout}>
          {getFieldDecorator('order_code', {})(
            <Input placeholder="请输入" style={{ width: '150px' }} />
          )}
        </FormItem>
        <FormItem label="货车编号" {...formItemLayout}>
          {getFieldDecorator('shipsite_id', {})(
            <Select
              placeholder="全部"
              onSelect={this.onShipSiteSelect}
              style={{ width: '100px' }}
              allowClear
            >
              {(entrunkSiteList || []).map(ele => {
                return (
                  <Option key={ele.site_id} value={ele.site_id}>
                    {ele.site_name}
                  </Option>
                );
              })}
            </Select>
          )}
          {getFieldDecorator('car_code', {})(
            <Input placeholder="请输入" style={{ width: '100px' }} />
          )}
        </FormItem>
        <FormItem label="经办人" {...formItemLayout}>
          {getFieldDecorator('operator_id', {})(
            <Select placeholder="全部" style={{ width: '100px' }}>
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
          <Button type="primary" htmlType="submit" loading={btnSearchClicked}>
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
              onRef={this.onRefTable}
              selectedRows={selectedRows}
              loading={loading}
              className={styles.dataTable}
              rowKey="order_id"
              data={{
                list: orderList,
                pagination: {
                  total,
                  pageSize,
                  current,
                  onShowSizeChange: (currentPage, pageSize) => {
                    this.setState({ pageSize });
                  },
                },
              }}
              rowClassNameHandler={(record, index) => {
                if (record.order_status === 6) {
                  return styles.settleColor;
                } else if (record.order_status === 7) {
                  return styles.payColor;
                } else {
                  return '';
                }
              }}
              columns={this.columns}
              onSelectRow={this.handleSelectRows}
              onChange={this.handleStandardTableChange}
              onClickHander={this.onRowClick}
              onDoubleClickHander={this.onRowDoubleClick}
            />
          </div>
          {this.tableFooter()}
        </Card>
        <OrderEditForm
          modalVisible={updateOrderModalVisible}
          record={record}
          onCancelModal={this.onUpdateOrderModalCancel}
          handleSearch={this.handleSearch}
          isEdit={0}
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
          okText="确认"
          cancelText="取消"
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
