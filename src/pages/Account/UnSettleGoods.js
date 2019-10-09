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
import styles from './Account.less';
import { CacheSite, CacheUser, CacheCompany, CacheRole } from '../../utils/storage';

const FormItem = Form.Item;
const { Option } = Select;

@Form.create()
class CreateForm extends PureComponent {
  constructor(props) {
    super(props);

    this.formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 8 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
      },
    };
    // label列可以放下4个字
    this.formItemSmallLayout = {
      labelCol: {
        xs: { span: 25 },
        sm: { span: 9 },
      },
      wrapperCol: {
        xs: { span: 23 },
        sm: { span: 15 },
      },
    };

    this.colLayout = {
      md: 8,
      sm: 24,
    };

    this.colSmallLayout = {
      md: 4,
      sm: 20,
    };
    this.col2Layout = {
      md: 10,
      sm: 26,
    };
    // colLargeLayout && formItemMiniLayout
    this.colLargeLayout = {
      md: 16,
      sm: 32,
    };
    this.formItemMiniLayout = {
      labelCol: {
        xs: { span: 22 },
        sm: { span: 6 },
      },
      wrapperCol: {
        xs: { span: 26 },
        sm: { span: 18 },
      },
    };

    this.formLayout = {
      labelCol: { span: 7 },
      wrapperCol: { span: 13 },
    };
  }

  okHandle = () => {
    const { form, record, onUpdateOrder } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;

      form.resetFields();
      onUpdateOrder(record, fieldsValue);
    });
  };

  render() {
    const { record, modalVisible, onCancelModal, form } = this.props;

    return (
      <Modal
        destroyOnClose
        title="编辑托运单"
        visible={modalVisible}
        onCancel={() => onCancelModal()}
        footer={[
          <Button key="btn-cancel" onClick={() => onCancelModal()}>
            取 消
          </Button>,
          <Button key="btn-print" onClick={this.onOrderPrint}>
            打 印
          </Button>,
          <Button key="btn-save" type="primary" onClick={this.okHandle}>
            保 存
          </Button>,
        ]}
        width={800}
        className={styles.modalForm}
      >
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col {...this.col2Layout}>
            <FormItem {...this.formItemLayout} label="分公司">
              {record.company_name}
            </FormItem>
          </Col>
          <Col {...this.col2Layout}>
            <FormItem {...this.formItemLayout} label="站点">
              {record.site_name}
            </FormItem>
          </Col>
          {/* <Col {...this.colLayout}>
          <FormItem {...this.formItemLayout} label="运单号">
            {getFieldDecorator('orderCode', { initialValue: orderCode.order_code })(
              <Input placeholder="" />
            )}
          </FormItem>
        </Col> */}
        </Row>
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col {...this.col2Layout}>
            <FormItem {...this.formItemLayout} label="收货人电话">
              {record.getcustomer_mobile}
            </FormItem>
          </Col>
          <Col {...this.col2Layout}>
            <FormItem {...this.formItemLayout} label="收货人姓名">
              {record.getcustomer_name}
            </FormItem>
          </Col>
          <Col>
            {record.customer_type == 1 ? (
              <Tag color="orange" style={{ marginTop: 10 }}>
                VIP
              </Tag>
            ) : (
              ''
            )}
          </Col>
        </Row>
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col {...this.col2Layout}>
            <FormItem {...this.formItemLayout} label="发货人电话">
              {record.sendcustomer_mobile}
            </FormItem>
          </Col>
          <Col {...this.col2Layout}>
            <FormItem {...this.formItemLayout} label="发货人姓名">
              {record.sendcustomer_name}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col {...this.colLayout}>
            <FormItem {...this.formItemLayout} label="运费">
              {record.trans_amount}
            </FormItem>
          </Col>
          <Col {...this.colSmallLayout}>
            <FormItem label="">{record.trans_type == 1 ? '现付' : '回付'}</FormItem>
          </Col>
          <Col {...this.col2Layout}>
            <FormItem {...this.formItemLayout} label="折后运费">
              {record.trans_discount}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col {...this.colLayout}>
            <FormItem {...this.formItemLayout} label="货款">
              {record.order_amount}
            </FormItem>
          </Col>
          <Col {...this.colLayout}>
            <FormItem label="">{record.bank_account}</FormItem>
          </Col>
        </Row>
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col {...this.col2Layout}>
            <FormItem {...this.formItemLayout} label="保价金额">
              {record.insurance_amount}
            </FormItem>
          </Col>
          <Col {...this.col2Layout}>
            <FormItem {...this.formItemLayout} label="保价费">
              {record.insurance_fee}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col {...this.col2Layout}>
            <FormItem {...this.formItemLayout} label="送货费">
              {record.deliver_amount}
            </FormItem>
          </Col>
          <Col {...this.col2Layout}>
            <FormItem {...this.formItemLayout} label="垫付金额">
              {record.order_advancepay_amount}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col {...this.colLargeLayout}>
            <FormItem {...this.formItemMiniLayout} label="货物名称">
              {record.order_name}
            </FormItem>
          </Col>
          <Col {...this.colSmallLayout}>
            <FormItem {...this.formItemLayout} label="">
              {record.order_num}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col {...this.col2Layout}>
            <FormItem {...this.formItemLayout} label="转进/转出">
              {record.transfer_type == 1 ? '转出' : '转入'}
            </FormItem>
          </Col>
          <Col {...this.col2Layout}>
            <FormItem {...this.formItemLayout} label="中转费">
              {record.transfer_amount}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col {...this.col2Layout}>
            <FormItem {...this.formItemLayout} label="中转地址">
              {record.transfer_address}
            </FormItem>
          </Col>

          <Col {...this.col2Layout}>
            <FormItem {...this.formItemLayout} label="中转物流">
              {record.transfer_company_name}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col {...this.col2Layout}>
            <FormItem {...this.formItemLayout} label="中转单号">
              {record.transfer_order_code}
            </FormItem>
          </Col>
          <Col {...this.col2Layout}>
            <FormItem {...this.formItemLayout} label="中转电话">
              {record.transfer_company_mobile}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col {...this.col2Layout}>
            <FormItem {...this.formItemLayout} label="实收货款">
              {form.getFieldDecorator('order_real', { initialValue: record.order_real })(
                <Input placeholder="请输入" />
              )}
            </FormItem>
          </Col>
          <Col {...this.col2Layout}>
            <FormItem {...this.formItemLayout} label="实收运费">
              {form.getFieldDecorator('trans_real', { initialValue: record.trans_real })(
                <Input placeholder="请输入" />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col {...this.colLargeLayout}>
            <FormItem {...this.formItemMiniLayout} label="备注">
              {form.getFieldDecorator('remark', { initialValue: record.remark })(
                <Input placeholder="请输入" />
              )}
            </FormItem>
          </Col>
        </Row>
      </Modal>
    );
  }
}

/* eslint react/no-multi-comp:0 */
@connect(({ trunkedorder }) => {
  return {
    trunkedorder,
  };
})
/* eslint react/no-multi-comp:0 */
@connect(({ customer, company, unsettlegoods, site, car, receiver, loading }) => {
  return {
    customer,
    company,
    unsettlegoods,
    site,
    car,
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
    orderModalVisible: false,
    settleModalVisible: false,
    signModalVisible: false,
    cancelSignModalVisible: false,
    downloadModalVisible: false,
    printModalVisible: false,
    currentCompany: {},
  };

  columns = [
    {
      title: '货单号',
      width: 60,
      dataIndex: 'order_code',
      sorter: true,
      align: 'right',
      render: val => `${val}`,
      // mark to display a total number
      needTotal: true,
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
      title: '滞纳金',
      width: 60,
      dataIndex: 'late_fee',
      sorter: true,
    },
    {
      title: '货车编号',
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
      title: '备注',
      dataIndex: 'remark',
    },
  ];

  async componentDidMount() {
    const { dispatch } = this.props;
    // 下站只显示当前分公司
    let branchCompanyList = [CacheCompany];
    if (CacheCompany.company_type != 2) {
      branchCompanyList = await dispatch({
        type: 'company/getCompanyList',
        payload: {},
      });
    }

    dispatch({
      type: 'site/getSiteListAction',
      payload: {},
    });

    dispatch({
      type: 'customer/sendCustomerListAction',
      payload: { pageNo: 1, pageSize: 100 },
    });

    // 初始渲染的是否，先加载第一个分公司的收货人信息
    if (branchCompanyList && branchCompanyList.length > 0) {
      this.setState({
        currentCompany: branchCompanyList[0],
      });

      dispatch({
        type: 'customer/getCustomerListAction',
        payload: {
          pageNo: 1,
          pageSize: 100,
          filter: { company_id: branchCompanyList[0].company_id },
        },
      });
    }

    // 页面初始化获取一次订单信息，否则会显示其他页面的缓存信息
    this.getOrderList();
  }

  handleFormReset = () => {
    const { form, dispatch } = this.props;
    form.resetFields();
    this.setState({
      formValues: {},
    });
    dispatch({
      type: 'rule/fetch',
      payload: {},
    });
  };

  handleSelectRows = rows => {
    this.setState({
      selectedRows: rows,
    });
  };

  onGetCustomerScroll = e => {
    if (e.target.scrollHeight <= e.target.scrollTop + e.currentTarget.scrollHeight) {
      this.fetchGetCustomerList();
    }
  };

  onSendCustomerScroll = e => {
    if (e.target.scrollHeight <= e.target.scrollTop + e.currentTarget.scrollHeight) {
      this.fetchSendCustomerList();
    }
  };

  fetchGetCustomerList = async companyId => {
    const { dispatch, branchCompanyList } = this.props;
    let { currentCompany } = this.state;
    if (!currentCompany || !currentCompany.company_id) {
      currentCompany = branchCompanyList && branchCompanyList[0];
    }

    dispatch({
      type: 'customer/getCustomerListAction',
      payload: {
        filter: { company_id: companyId || (currentCompany && currentCompany.company_id) || 0 },
      },
    });
  };

  fetchSendCustomerList = async companyId => {
    const { dispatch } = this.props;

    dispatch({
      type: 'customer/sendCustomerListAction',
      payload: {
        filter: {},
      },
    });
  };

  onCompanySelect = async (value, option) => {
    const {
      dispatch,
      company: { branchCompanyList },
      car: { lastCar },
    } = this.props;
    // 清空原公司收获客户
    dispatch({
      type: 'customer/resetCustomerPageNo',
      payload: { type: 'Get' },
    });
    // 获取当前公司的客户列表
    this.fetchGetCustomerList(value);

    const currentCompany = branchCompanyList.filter(item => {
      if (item.company_id == value) {
        return item;
      }
    });
    if (currentCompany.length > 0) {
      this.setState({
        currentCompany: currentCompany[0],
      });
    }
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
      fieldsValue.order_amount = -1;
      fieldsValue.order_amount = -1;
      const searchParams = Object.assign({ filter: fieldsValue }, data);
      dispatch({
        type: 'unsettlegoods/getOrderListAction',
        payload: { pageNo: pageNo || current, pageSize, ...searchParams },
      });

      dispatch({
        type: 'unsettlegoods/getOrderStatisticAction',
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

  // 签字
  onSignOk = async () => {
    const { dispatch } = this.props;
    const { selectedRows } = this.state;
    const orderIds = selectedRows.map(item => {
      return item.order_id;
    });
    let result = await dispatch({
      type: 'unsettle/signAction',
      payload: { order_id: orderIds },
    });
    if (result.code == 0) {
      message.success('签字成功！');
      this.handleSearch();
      this.onSignCancel();
    } else {
      message.error(result.msg);
    }
  };

  onSign = async () => {
    this.setState({
      signModalVisible: true,
    });
  };

  onSignCancel = async () => {
    this.setState({
      signModalVisible: false,
    });
  };

  // 账户核对
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
    const result = await dispatch({
      type: 'unsettle/settleOrderAction',
      payload: {
        order_id: orderIds,
      },
    });
    if (result.code == 0) {
      message.success('核对成功！');

      this.onSettleCancel();
      this.handleSearch();
    } else {
      message.error(result.msg);
    }
  };

  // 取消签字
  onCancelSign = async () => {
    this.setState({
      cancelSignModalVisible: true,
    });
  };

  onCancelSignCancel = async () => {
    this.setState({
      cancelSignModalVisible: false,
    });
  };

  onCancelSignOk = async () => {
    const { dispatch } = this.props;
    const { selectedRows } = this.state;
    const orderIds = selectedRows.map(item => {
      return item.order_id;
    });
    const result = await dispatch({
      type: 'unsettle/cancelSignAction',
      payload: {
        order_id: orderIds,
      },
    });
    if (result.code == 0) {
      message.success('取消签字成功！');
      this.handleSearch();
      this.onCancelSignCancel();
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
      type: 'unsettlegoods/printAction',
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

  /**
   * 修改订单信息弹窗
   */
  onEntrunkModalShow = () => {
    this.setState({
      orderModalVisible: true,
    });
  };

  onEntrunkModalCancel = () => {
    // setTimeout(() => this.addBtn.blur(), 0);
    this.setState({
      orderModalVisible: false,
    });
  };

  // 更新订单
  onUpdateOrder = async (record, fieldsValue) => {
    const { dispatch } = this.props;
    console.log(record, fieldsValue);
    const result = await dispatch({
      type: 'order/updateOrderAction',
      payload: {
        order_id: record.order_id,
        order: { trans_real: fieldsValue.trans_real, order_real: fieldsValue.order_real },
      },
    });
    if (result.code == 0) {
      message.success('修改成功！');
      this.onEntrunkModalCancel();
    } else {
      message.error(result.msg);
    }
  };

  // 已结算账目核对中，计算付款日期
  onRowClick = (record, index, event) => {};

  // 编辑订单信息
  onRowDoubleClick = (record, index, event) => {
    this.setState({
      record,
    });
    this.onEntrunkModalShow();
  };

  renderSimpleForm() {
    const {
      form: { getFieldDecorator },
      customer: { getCustomerList, sendCustomerList },
      company: { branchCompanyList },
    } = this.props;
    const formItemLayout = {};
    const companyOption = {};
    // 默认勾选第一个公司
    if (branchCompanyList.length > 0) {
      companyOption.initialValue = branchCompanyList[0].company_id || '';
    }
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <FormItem label="分公司" {...formItemLayout}>
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
        <FormItem label="收货人姓名" {...formItemLayout}>
          {getFieldDecorator('getcustomer_id')(
            <Select
              placeholder="请选择"
              onSelect={this.onGetCustomerSelect}
              style={{ width: '200px' }}
              allowClear
              showSearch
              optionLabelProp="children"
              onPopupScroll={this.onGetCustomerScroll}
              filterOption={(input, option) =>
                option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {getCustomerList.map(ele => {
                return (
                  <Option key={ele.customer_id} value={ele.customer_id}>
                    {ele.customer_name}
                  </Option>
                );
              })}
            </Select>
          )}
        </FormItem>
        <FormItem label="收货人电话" {...formItemLayout}>
          {getFieldDecorator('getcustomer_mobile', {})(
            <Input placeholder="请输入" style={{ width: '150px' }} />
          )}
        </FormItem>
        <FormItem label="发货人姓名" {...formItemLayout}>
          {getFieldDecorator('sendcustomer_id')(
            <Select
              placeholder="请选择"
              onSelect={this.onSendCustomerSelect}
              style={{ width: '150px' }}
              allowClear
              showSearch
              optionLabelProp="children"
              onPopupScroll={this.onSendCustomerScroll}
              filterOption={(input, option) =>
                option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {sendCustomerList.map(ele => {
                return (
                  <Option key={ele.get} value={ele.customer_id}>
                    {ele.customer_name}
                  </Option>
                );
              })}
            </Select>
          )}
        </FormItem>
        <FormItem label="收货人电话" {...formItemLayout}>
          {getFieldDecorator('sendcustomer_mobile', {})(
            <Input placeholder="请输入" style={{ width: '150px' }} />
          )}
        </FormItem>
        <Form.Item {...formItemLayout} className={styles.tableListOperator}>
          <Button type="primary" htmlType="submit">
            查询
          </Button>
          <Button onClick={this.onDownload}>下载</Button>
        </Form.Item>
      </Form>
    );
  }

  renderForm() {
    return this.renderSimpleForm();
  }

  render() {
    const {
      unsettlegoods: { orderList, total, totalOrderAmount, totalTransAmount },
      company: { branchCompanyList },
      car: { carList, lastCar },
      loading,
    } = this.props;

    const {
      selectedRows,
      accountStatistic,
      current,
      pageSize,
      orderModalVisible,
      settleModalVisible,
      signModalVisible,
      cancelSignModalVisible,
      downloadModalVisible,
      printModalVisible,
      record,
    } = this.state;

    return (
      <div>
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>{this.renderForm()}</div>

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
              rowClassName={(record, index) => {
                return record.sign_status == 1 ? styles.signColor : '';
              }}
              footer={() => `货款总额：${totalOrderAmount}   运费总额：${totalTransAmount}`}
            />
          </div>
        </Card>
        <CreateForm
          modalVisible={orderModalVisible}
          record={record}
          onCancelModal={this.onEntrunkModalCancel}
          onUpdateOrder={this.onUpdateOrder}
        />
        <Modal
          title="确认结账"
          visible={settleModalVisible}
          onOk={this.onSettleOk}
          onCancel={this.onSettleCancel}
        >
          <p>{`结算货款条数${selectedRows.length}，结算总额 ${accountStatistic.totalAccount} `}</p>
          <p>您确认结账么？</p>
        </Modal>
        <Modal
          title="确认"
          visible={signModalVisible}
          onOk={this.onSignOk}
          onCancel={this.onSignCancel}
        >
          <p>您确认签字么？</p>
        </Modal>
        <Modal
          title="确认"
          visible={cancelSignModalVisible}
          onOk={this.onCancelSignOk}
          onCancel={this.onCancelSignCancel}
        >
          <p>您确认取消签字么？</p>
        </Modal>
        <Modal
          title="确认"
          visible={printModalVisible}
          onOk={this.onPrintOk}
          onCancel={this.onPrintCancel}
        >
          <p>您确认结账打印么？</p>
        </Modal>
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
