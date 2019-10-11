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
import styles from './Transfer.less';
import { fileToObject } from 'antd/lib/upload/utils';
import { async } from 'q';
const { RangePicker } = DatePicker;

const FormItem = Form.Item;
const { Option } = Select;
const getValue = obj =>
  Object.keys(obj)
    .map(key => obj[key])
    .join(',');

const CacheSite = JSON.parse(localStorage.getItem('site') || '{}');
const CacheCompany = JSON.parse(localStorage.getItem('company') || '{}');
const CacheUser = JSON.parse(localStorage.getItem('user') || '{}');

@Form.create()
class AddFormDialog extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      abnormal_type_id: '',
      abnormal_type: '',
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
  }

  onAbnormalSelect = (value, option) => {
    console.log('####', option.props.abnormal_type_id);
    this.setState({
      abnormal_type_id: option.props.abnormal_type_id,
      abnormal_type: option.props.text,
    });
    console.log(value, option);
    console.log(this.state);
  };

  onAddHandler = () => {
    const { addFormDataHandle, form } = this.props;
    form.validateFields((err, fieldsValue) => {
      console.log(fieldsValue);
      if (err) return;

      addFormDataHandle({
        transfer_money: fieldsValue.transfer_money,
        transfer_type: 0,
        transfer_user: fieldsValue.transfer_user,
        remark: fieldsValue.remark,
      });
    });
  };

  renderCustomerOption = item => {
    const AutoOption = AutoComplete.Option;
    return (
      <AutoOption
        key={item.incometype_id}
        incometype_id={item.incometype_id}
        text={item.incometype}
      >
        {item.incometype}
      </AutoOption>
    );
  };

  render() {
    const { modalVisible, onCancelHandler, selectedRows, form, incomeTypes = [] } = this.props;
    return (
      <Modal
        destroyOnClose
        title="添加打款"
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
              <FormItem {...this.formItemLayout} label="打款金额">
                {form.getFieldDecorator('transfer_money', {
                  initialValue: '',
                  rules: [{ required: true, message: '请填写打款金额' }],
                })(<Input placeholder="请输入" style={{ width: '280px' }} />)}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
            <Col>
              <FormItem {...this.formItemLayout} label="打款人">
                {form.getFieldDecorator('transfer_user', { initialValue: '' })(
                  <Input placeholder="请输入" style={{ width: '280px' }} />
                )}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
            <Col>
              <FormItem labelCol={{ span: 3, offset: 2 }} label="备注">
                {form.getFieldDecorator('remark', { initialValue: '' })(
                  <Input placeholder="请输入" style={{ width: '280px' }} />
                )}
              </FormItem>
            </Col>
          </Row>
        </Form>
      </Modal>
    );
  }
}

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
@connect(({ customer, company, transfer, site, car, receiver, loading }) => {
  return {
    customer,
    company,
    transfer,
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
    current: 1,
    pageSize: 20,
    record: {},
    orderModalVisible: false,
    settleModalVisible: false,
    cancelConfirmTransferModalVisible: false,
    delTransferModalVisible: false,
    addIncomeModalVisible: false,
    signModalVisible: false,
    cancelSignModalVisible: false,
    downloadModalVisible: false,
    printModalVisible: false,
    currentCompany: {},
  };

  columns = [
    {
      title: '打款日期',
      dataIndex: 'transfer_date',
      render: val => <span>{moment(Number(val || 0)).format('YYYY-MM-DD HH:mm:ss')}</span>,
    },
    {
      title: '打款金额',
      dataIndex: 'transfer_money',
    },
    {
      title: '打款人',
      dataIndex: 'transfer_user',
      sorter: true,
    },
    {
      title: '确认人',
      dataIndex: 'confirm_operator_name',
      sorter: true,
    },
    {
      title: '确认日期',
      dataIndex: 'confirm_date',
      sorter: true,
    },
    {
      title: '打款公司',
      dataIndex: 'company_name',
      sorter: true,
    },
    {
      title: '备注',
      dataIndex: 'remark',
    },
  ];

  async componentDidMount() {
    const { dispatch } = this.props;
    await dispatch({
      type: 'company/getBranchCompanyList',
      payload: { ...CacheCompany },
    });

    this.handleSearch();
  }

  handleSelectRows = rows => {
    this.setState({
      selectedRows: rows,
    });
  };

  fetchIncomeTypeList = async ({ companyId, siteId }) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'income/getIncomeTypesAction',
      payload: { company_id: companyId, site_id: siteId },
    });
  };

  fetchCompanySiteList = async companyId => {
    const { dispatch } = this.props;
    dispatch({
      type: 'site/getSiteListAction',
      payload: { pageNo: 1, pageSize: 100, filter: { company_id: companyId } },
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

  handleSearch = e => {
    e && e.preventDefault();
    this.getOrderList();
  };

  /**
   * 获取订单信息
   */
  getOrderList = (data = {}, pageNo = 1) => {
    const { dispatch, form } = this.props;
    const { current, pageSize, currentCompany } = this.state;

    form.validateFields((err, fieldsValue) => {
      if (err) return;

      if (fieldsValue.transfer_date && fieldsValue.transfer_date.length > 0) {
        fieldsValue.transfer_date = fieldsValue.transfer_date.map(item => {
          return `${item.valueOf()}`;
        });
      }
      fieldsValue.company_id = currentCompany.company_id || CacheCompany.company_id;

      const searchParams = Object.assign({ filter: fieldsValue }, data);
      dispatch({
        type: 'transfer/getTransferAction',
        payload: { pageNo: pageNo || current, pageSize, ...searchParams },
      });

      dispatch({
        type: 'transfer/getTransferStatisticAction',
        payload: { ...searchParams },
      });
    });
  };

  /**
   * 表格排序、分页响应
   */
  handleStandardTableChange = async (pagination, filtersArg, sorter) => {
    const { pageSize } = this.state;

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

  // 添加收入
  addFormDataHandle = async data => {
    const { dispatch } = this.props;
    const result = await dispatch({
      type: 'transfer/addTransferAction',
      payload: {
        ...data,
        company_id: CacheCompany.company_id,
        company_name: CacheCompany.company_name,
      },
    });
    if (result.code == 0) {
      message.success('添加成功！');
      this.handleSearch();
      this.onCancelIncomeClick();
    } else {
      message.error(result.msg);
    }
  };

  // 打开添加收入对话框
  onAddIncomeClick = async () => {
    this.setState({
      addIncomeModalVisible: true,
    });
  };

  onCancelIncomeClick = async () => {
    this.setState({
      addIncomeModalVisible: false,
    });
  };

  // 确认打款
  onConfirmTransfer = async () => {
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
      return item.transfer_id;
    });
    let result = await dispatch({
      type: 'transfer/confirmTransferAction',
      payload: {
        transfer_id: orderIds,
      },
    });
    if (result.code == 0) {
      message.success('确认打款成功！');

      this.onSettleCancel();
    } else {
      message.error(result.msg);
    }
  };

  // 取消确认打款
  onCancelConfirmTransfer = async () => {
    const { selectedRows } = this.state;

    let accountStatistic = getSelectedAccount(selectedRows);
    this.setState({ accountStatistic, cancelConfirmTransferModalVisible: true });
  };

  onCancelConfirmTransferCancel = async () => {
    this.setState({
      cancelConfirmTransferModalVisible: false,
    });
  };

  onCancelConfirmTransferOk = async () => {
    const { dispatch } = this.props;
    const { selectedRows } = this.state;
    const orderIds = selectedRows.map(item => {
      return item.transfer_id;
    });
    let result = await dispatch({
      type: 'transfer/cancelConfirmTransferAction',
      payload: {
        transfer_id: orderIds,
      },
    });
    if (result.code == 0) {
      message.success('取消确认打款成功！');

      this.onCancelConfirmTransferCancel();
    } else {
      message.error(result.msg);
    }
  };

  onDelTransfer = async () => {
    const { selectedRows } = this.state;

    let accountStatistic = getSelectedAccount(selectedRows);
    this.setState({ accountStatistic, delTransferModalVisible: true });
  };

  onDelConfirmTransferCancel = async () => {
    this.setState({
      delTransferModalVisible: false,
    });
  };

  onDelConfirmTransferOk = async () => {
    const { dispatch } = this.props;
    const { selectedRows } = this.state;
    const orderIds = selectedRows.map(item => {
      return item.transfer_id;
    });
    let result = await dispatch({
      type: 'transfer/delTransferAction',
      payload: {
        transfer_id: orderIds,
      },
    });
    if (result.code == 0) {
      message.success('删除确认打款成功！');

      this.onDelConfirmTransferCancel();
    } else {
      message.error(result.msg);
    }
  };

  onCompanySelect = async companyId => {
    const {
      company: { branchCompanyList },
    } = this.props;

    const currentCompany = branchCompanyList.filter(item => {
      if (item.company_id == companyId) {
        return item;
      }
    });
    if (currentCompany.length > 0) {
      this.setState({
        currentCompany: currentCompany[0],
      });
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
    let result = await dispatch({
      type: 'settle/cancelSignAction',
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
      type: 'settle/printAction',
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
      type: 'settle/downloadAction',
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

  tableFooter = () => {
    const {
      transfer: { totalTransferAmount, totalTransferConfirmAmount, totalTransferUnConfirmAmount },
    } = this.props;
    return (
      <div>
        <span>打款总额：{totalTransferAmount || 0}</span>
        <span className={styles.footerSplit}>
          未确认打款总额：{totalTransferUnConfirmAmount || 0}
        </span>
        <span className={styles.footerSplit}>
          已确认打款总额：{totalTransferConfirmAmount || 0}
        </span>
      </div>
    );
  };

  renderSimpleForm() {
    const {
      form: { getFieldDecorator },
      company: { branchCompanyList },
    } = this.props;
    // 上站需要对下站打款确认
    const companyList = CacheCompany.company_type == 1 ? branchCompanyList : [CacheCompany];
    const companyOption = { initialValue: companyList.length > 0 ? companyList[0].company_id : '' };
    this.setState({
      currentCompany: companyList[0],
    });

    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <FormItem label="分公司">
          {getFieldDecorator('company_id', companyOption)(
            <Select placeholder="请选择" style={{ width: '150px' }} onSelect={this.onCompanySelect}>
              {companyList.map(ele => {
                return (
                  <Option key={ele.company_id} value={ele.company_id}>
                    {ele.company_name}
                  </Option>
                );
              })}
            </Select>
          )}
        </FormItem>

        <FormItem label="确认打款">
          {getFieldDecorator('transfer_type', {})(
            <Select placeholder="请选择" style={{ width: '200px' }} allowClear>
              <Option value="1">已确认打款</Option>
              <Option value="2">未确认打款</Option>
            </Select>
          )}
        </FormItem>
        <FormItem label="打款日期">
          {getFieldDecorator('transfer_date', {})(<RangePicker style={{ width: '250px' }} />)}
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
      transfer: { transferList, total, totalOrderAmount, totalTransAmount },
      loading,
    } = this.props;

    const {
      selectedRows,
      accountStatistic,
      current,
      pageSize,
      orderModalVisible,
      settleModalVisible,
      cancelConfirmTransferModalVisible,
      delTransferModalVisible,
      addIncomeModalVisible,
      signModalVisible,
      cancelSignModalVisible,
      downloadModalVisible,
      printModalVisible,
      record,
    } = this.state;

    let buttons;
    if (selectedRows.length > 0 && CacheCompany.company_type == 2) {
      buttons = <Button onClick={this.onDelTransfer}>删除打款</Button>;
    } else if (selectedRows.length > 0 && CacheCompany.company_type == 1) {
      buttons = (
        <span>
          <Button onClick={this.onConfirmTransfer}>确认打款</Button>
          <Button onClick={this.onCancelConfirmTransfer}>取消确认</Button>
        </span>
      );
    }
    return (
      <div>
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>{this.renderForm()}</div>
            <div className={styles.tableListOperator}>
              {CacheCompany.company_type == 2 ? (
                <Button icon="plus" type="primary" onClick={() => this.onAddIncomeClick(true)}>
                  添加
                </Button>
              ) : null}

              {buttons}
            </div>
            <StandardTable
              selectedRows={selectedRows}
              className={styles.dataTable}
              scroll={{ x: 900 }}
              loading={loading}
              rowKey="transfer_id"
              data={{
                list: transferList,
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
                if (record.transfer_type === 1) {
                  return styles.payColor;
                }
              }}
              footer={this.tableFooter}
            />
          </div>
        </Card>
        <CreateForm
          modalVisible={orderModalVisible}
          record={record}
          onCancelModal={this.onEntrunkModalCancel}
          onUpdateOrder={this.onUpdateOrder}
        />
        <AddFormDialog
          modalVisible={addIncomeModalVisible}
          addFormDataHandle={this.addFormDataHandle}
          onCancelHandler={this.onCancelIncomeClick}
          selectedRows={selectedRows}
        />
        <Modal
          title="确认打款"
          visible={settleModalVisible}
          onOk={this.onSettleOk}
          onCancel={this.onSettleCancel}
        >
          <p>{`您确定要对${selectedRows.length}条记录确认打款么？ `}</p>
        </Modal>
        <Modal
          title="取消确认打款"
          visible={cancelConfirmTransferModalVisible}
          onOk={this.onCancelConfirmTransferOk}
          onCancel={this.onCancelConfirmTransferCancel}
        >
          <p>{`您确定要对${selectedRows.length}条记录取消确认打款么？ `}</p>
        </Modal>
        <Modal
          title="删除确认打款"
          visible={delTransferModalVisible}
          onOk={this.onDelConfirmTransferOk}
          onCancel={this.onDelConfirmTransferCancel}
        >
          <p>{`您确定要删除${selectedRows.length}条确认打款记录么？ `}</p>
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
