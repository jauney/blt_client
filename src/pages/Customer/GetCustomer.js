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
import { getSelectedAccount, getSelectedDownAccount } from '@/utils/account';
import StandardTable from '@/components/StandardTable';
import EditableTable from '@/components/EditableTable';
import styles from './Customer.less';
import { async } from 'q';
import { CacheSite, CacheUser, CacheCompany, CacheRole } from '../../utils/storage';

const { RangePicker } = DatePicker;
const FormItem = Form.Item;
const { Option } = Select;

@Form.create()
class AddFormDialog extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      dataSource: [],
    };
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

    this.col2Layout = {
      md: 10,
      sm: 26,
    };
  }

  onAddHandler = () => {
    const { handleSearch, form, record, dispatch, onCancelModal, currentCompany } = this.props;
    const { dataSource = [] } = this.state;
    let currentMobile;
    dataSource.forEach(item => {
      if (item.mobile_id && item.mobile_id.indexOf('TMP-') >= 0) {
        item.mobile_id = 0;
      }
      if (item.mobile_type == 1) {
        currentMobile = item;
      }
    });
    if (!currentMobile && dataSource.length > 0) {
      currentMobile = dataSource[0];
      dataSource[0].mobile_type = 1;
    }
    form.validateFields(async (err, fieldsValue) => {
      if (err) return;

      fieldsValue.customer_mobile = (currentMobile && currentMobile.mobile) || '';
      fieldsValue.customerMobiles = dataSource;
      fieldsValue.company_id = currentCompany.company_id;
      console.log(fieldsValue);

      let result;
      if (!record || !record.customer_id) {
        result = await dispatch({
          type: 'customer/createCustomerAction',
          payload: { customer: fieldsValue, type: 2 },
        });
      }

      if (result && result.code == 0) {
        onCancelModal();
        handleSearch();
        message.success('添加成功');
      } else {
        message.error('添加失败');
      }
    });
  };

  // 更新手机号列表
  notifyDataSource = mobiles => {
    this.setState({
      dataSource: mobiles,
    });
  };

  render() {
    const { modalVisible, onCancelModal, record, form, mobileList = [] } = this.props;
    console.log(record);
    return (
      <Modal
        destroyOnClose
        title="添加收货客户"
        visible={modalVisible}
        onCancel={() => onCancelModal()}
        footer={[
          <Button key="btn-cancel" onClick={() => onCancelModal()}>
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
            <Col {...this.col2Layout}>
              <FormItem {...this.formItemLayout} label="姓名">
                {form.getFieldDecorator('customer_name', {
                  initialValue: record.customer_name,
                  rules: [{ required: true, message: '请填写姓名' }],
                })(<Input placeholder="请输入" style={{ width: '150px' }} />)}
              </FormItem>
            </Col>
            <Col {...this.col2Layout}>
              <FormItem {...this.formItemLayout} label="类型">
                {form.getFieldDecorator('customer_type', { initialValue: record.customer_type })(
                  <Select placeholder="请选择" style={{ width: '150px' }} allowClear>
                    <Option value={0}>普通用户</Option>
                    <Option value={1}>VIP</Option>
                    <Option value={9}>黑名单</Option>
                  </Select>
                )}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
            <Col {...this.col2Layout}>
              <FormItem {...this.formItemLayout} label="账户">
                {form.getFieldDecorator('bank_account', { initialValue: record.bank_account })(
                  <Input placeholder="请输入" style={{ width: '200px' }} />
                )}
              </FormItem>
            </Col>
            <Col {...this.col2Layout}>
              <FormItem {...this.formItemLayout} label="地址">
                {form.getFieldDecorator('customer_address', {
                  initialValue: record.customer_address,
                })(<Input placeholder="请输入" style={{ width: '250px' }} />)}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
            <Col {...this.col2Layout}>
              <FormItem {...this.formItemLayout} label="登录账号">
                {form.getFieldDecorator('username', { initialValue: record.username })(
                  <Input placeholder="请输入" style={{ width: '150px' }} />
                )}
              </FormItem>
            </Col>
            <Col {...this.col2Layout}>
              <FormItem {...this.formItemLayout} label="密码">
                {form.getFieldDecorator('password', { initialValue: record.password })(
                  <Input placeholder="请输入" style={{ width: '150px' }} />
                )}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
            <Col span={20}>
              <FormItem wrapperCol={{ span: 16 }} labelCol={{ span: 4 }} label="备注">
                {form.getFieldDecorator('remark', { initialValue: record.remark })(
                  <Input placeholder="请输入" style={{ width: '280px' }} />
                )}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
            <Col span={20}>
              <FormItem wrapperCol={{ span: 16 }} labelCol={{ span: 4 }} label="手机号">
                <EditableTable
                  dataSource={record.customerMobiles}
                  notifyDataSource={this.notifyDataSource}
                />
              </FormItem>
            </Col>
          </Row>
        </Form>
      </Modal>
    );
  }
}

/* eslint react/no-multi-comp:0 */
@connect(({ customer, company, site, receiver, loading }) => {
  return {
    customer,
    company,
    site,
    receiver,
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
    currentCompany: {},
  };

  columns = [
    {
      title: '客户类型',
      dataIndex: 'customer_type',
      sorter: true,
      align: 'right',
      render: val => `${val}`,
      // mark to display a total number
      needTotal: true,
    },
    {
      title: '姓名',
      dataIndex: 'customer_name',
    },
    {
      title: '电话',
      dataIndex: 'customer_mobile',
      sorter: true,
    },
    {
      title: '账户',
      dataIndex: 'bank_account',
      sorter: true,
    },
    {
      title: '收货地址',
      dataIndex: 'customer_address',
      sorter: true,
    },
    {
      title: '备注',
      dataIndex: 'remark',
    },
  ];

  async componentDidMount() {
    const { dispatch } = this.props;
    // 下站只显示当前分公司
    const branchCompanyList = await dispatch({
      type: 'company/getCompanyList',
      payload: {},
    });
    if (branchCompanyList && branchCompanyList.length > 0) {
      this.setState({
        currentCompany: branchCompanyList[0],
      });
    }

    dispatch({
      type: 'site/getSiteListAction',
      payload: { pageNo: 1, pageSize: 100 },
    });

    // 页面初始化获取一次订单信息，否则会显示其他页面的缓存信息
    this.getOrderList();
  }

  handleSelectRows = rows => {
    this.setState({
      selectedRows: rows,
    });
  };

  fetchGetCustomerList = async companyId => {
    const { dispatch } = this.props;
    dispatch({
      type: 'customer/getCustomerListAction',
      payload: {
        pageNo: 1,
        pageSize: 100,
        filter: { company_id: companyId },
      },
    });
  };

  onCompanySelect = async (value, option) => {};

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
      const searchParams = Object.assign({ filter: fieldsValue, type: 2 }, data);
      dispatch({
        type: 'customer/queryCustomerListAction',
        payload: { pageNo: pageNo || current, pageSize, ...searchParams },
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

  // 下账
  downAccountHandle = async data => {
    console.log(data);
    const { dispatch } = this.props;
    const { selectedRows } = this.state;
    const orderIds = selectedRows.map(item => {
      return item.order_id;
    });
    const result = await dispatch({
      type: 'pay/downAccountAction',
      payload: {
        order_id: orderIds,
        rate: data.rate,
        bank_account: data.bank_account,
      },
    });
    if (result.code == 0) {
      message.success('下账成功！');

      this.onDownCancel();
      this.handleSearch();
    } else {
      message.error(result.msg);
    }
  };

  // 打开下账对话框
  onDownAccount = async () => {
    this.setState({
      downModalVisible: true,
    });
  };

  onDownCancel = async () => {
    this.setState({
      downModalVisible: false,
    });
  };

  // 取消账户核对
  onSettle = async () => {
    const { selectedRows } = this.state;
    let accountStatistic = getSelectedAccount(selectedRows);
    this.setState({ accountStatistic, settleModalVisible: true });
  };

  onSettleCancel = async () => {
    this.setState({
      settleModalVisible: false,
    });
  };

  onSettleOk = async () => {
    const { dispatch } = this.props;
    const { selectedRows } = this.state;
    const orderIds = selectedRows.map(item => {
      return item.order_id;
    });
    let result = await dispatch({
      type: 'settle/cancelSettleOrderAction',
      payload: {
        order_id: orderIds,
      },
    });
    if (result.code == 0) {
      message.success('取消结算成功！');

      this.onSettleCancel();
      this.handleSearch();
    } else {
      message.error(result.msg);
    }
  };

  onAddAbnormal = async () => {
    const { dispatch } = this.props;
    const { selectedRows } = this.state;
    const orderIds = selectedRows.map(item => {
      return item.order_id;
    });
    const result = await dispatch({
      type: 'pay/updatePayAbnormalAction',
      payload: {
        order_id: orderIds,
        order: { pay_status: 1 },
      },
    });
    if (result.code == 0) {
      message.success('添加异常成功！');
      this.handleSearch();
    } else {
      message.error(result.msg);
    }
  };

  onAddNormalModal = async () => {
    Modal.confirm({
      title: '确认',
      content: '确定将所选订单添加为异常吗？',
      okText: '确认',
      cancelText: '取消',
      onOk: this.onAddAbnormal,
    });
  };

  // 取消签字
  onCancelSign = async () => {
    this.setState({
      cancelDownAccountModalVisible: true,
    });
  };

  onCancelDownAccountCancel = async () => {
    this.setState({
      cancelDownAccountModalVisible: false,
    });
  };

  onCancelDownAccountOk = async () => {
    const { dispatch } = this.props;
    const { selectedRows } = this.state;
    const orderIds = selectedRows.map(item => {
      return item.order_id;
    });
    let result = await dispatch({
      type: 'pay/cancelDownAccountAction',
      payload: {
        order_id: orderIds,
      },
    });
    if (result && result.code == 0) {
      message.success('取消下账成功！');
      this.handleSearch();
      this.onCancelDownAccountCancel();
    } else {
      message.error(result.msg);
    }
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
      type: 'pay/printAction',
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
      type: 'pay/downloadAction',
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

  /**
   * 添加客户信息
   */
  onUpdateOrderModalShow = () => {
    const { currentCompany } = this.state;
    if (!currentCompany.company_id) {
      Modal.info({
        content: '请先选择分公司',
      });
      return;
    }
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
      site: { entrunkSiteList = [], normalSiteList = [] },
      customer: { getCustomerList, sendCustomerList },
      company: { branchCompanyList },
    } = this.props;
    const companyOption = {};
    // 默认勾选第一个公司
    if (branchCompanyList.length > 0) {
      companyOption.initialValue = branchCompanyList[0].company_id || '';
    }
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <FormItem label="分公司">
          {getFieldDecorator('company_id', companyOption)(
            <Select placeholder="请选择" onSelect={this.onCompanySelect} style={{ width: '150px' }}>
              {branchCompanyList.map(ele => {
                return (
                  <Option key={ele.company_id} value={ele.company_id}>
                    {ele.company_name}
                  </Option>
                );
              })}
            </Select>
          )}
        </FormItem>
        <FormItem label="时间段">
          {getFieldDecorator('search_date', {})(<RangePicker style={{ width: '250px' }} />)}
        </FormItem>
        <FormItem label="客户分类">
          {getFieldDecorator('customer_type', {})(
            <Select placeholder="请选择" style={{ width: '150px' }} allowClear>
              <Option value={0}>普通用户</Option>
              <Option value={1}>VIP</Option>
              <Option value={9}>黑名单</Option>
            </Select>
          )}
        </FormItem>
        <FormItem label="站点">
          {getFieldDecorator('site_id', {})(
            <Select placeholder="请选择" style={{ width: '150px' }} allowClear>
              {normalSiteList.map(ele => {
                return (
                  <Option key={ele.site_id} value={ele.site_id}>
                    {ele.site_name}
                  </Option>
                );
              })}
            </Select>
          )}
        </FormItem>
        <FormItem label="姓名">
          {getFieldDecorator('customer_name', {})(
            <Input placeholder="请输入" style={{ width: '150px' }} />
          )}
        </FormItem>
        <FormItem label="电话">
          {getFieldDecorator('customer_mobile', {})(
            <Input placeholder="请输入" style={{ width: '150px' }} />
          )}
        </FormItem>
        <FormItem>
          <Button type="primary" htmlType="submit">
            查询
          </Button>
        </FormItem>
      </Form>
    );
  }

  renderForm() {
    return this.renderSimpleForm();
  }

  render() {
    const {
      customer: { customers, total, totalOrderAmount, totalTransAmount },
      loading,
      dispatch,
    } = this.props;

    const {
      selectedRows,
      current,
      pageSize,
      updateOrderModalVisible,
      record,
      currentCompany,
    } = this.state;

    return (
      <div>
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>{this.renderForm()}</div>
            <div className={styles.tableListOperator}>
              <Button onClick={this.onUpdateOrderModalShow}>添加</Button>
              {selectedRows.length > 0 && (
                <span>
                  <Button onClick={this.onCancelSign}>取消下账</Button>
                  <Button onClick={this.onAddNormalModal}>添加异常</Button>
                  <Button onClick={this.onPrint}>打印</Button>
                </span>
              )}
            </div>
            <StandardTable
              selectedRows={selectedRows}
              loading={loading}
              className={styles.dataTable}
              scroll={{ x: 900 }}
              rowKey="customer_id"
              data={{
                list: customers,
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
        <AddFormDialog
          modalVisible={updateOrderModalVisible}
          record={record}
          dispatch={dispatch}
          onCancelModal={this.onUpdateOrderModalCancel}
          handleSearch={this.handleSearch}
          currentCompany={currentCompany}
        />
      </div>
    );
  }
}

export default TableList;
