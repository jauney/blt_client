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
import { locale } from '@/utils';
import { printOrder, getPrintOrderConent } from '@/utils/print';
import { CacheSite, CacheUser, CacheCompany, CacheRole } from '../../utils/storage';
import {
  setCustomerFieldValue,
  fetchGetCustomerList,
  fetchSendCustomerList,
  onSendCustomerChange,
  onGetCustomerChange,
  onGetCustomerSelect,
  onSendCustomerSelect,
  customerAutoCompleteState,
  setCourierFieldValue2Mng,
  onCourierChange,
  onCourierSelect,
} from '@/utils/customer';

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
    addCourierModalVisible: false,
    currentCompany: {},
    btnSearchClicked: false,
    ...customerAutoCompleteState,
  };

  columns = [
    {
      title: '送货人',
      width: '80px',
      dataIndex: 'sender_name',
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
    const branchCompanyList = await dispatch({
      type: 'company/getBranchCompanyList',
      payload: { ...CacheCompany },
    });

    const siteList = await dispatch({
      type: 'site/getSiteListAction',
      payload: {},
    });

    if (siteList && siteList.length > 0) {
      const shipSiteList = siteList.filter(item => {
        return item.site_type == 3 || item.site_type == 2;
      });
      if (shipSiteList.length > 0) {
        this.setState({
          currentShipSite: shipSiteList[0],
        });
      }
    }

    let currentCompany = this.setCurrentCompany(branchCompanyList);

    dispatch({
      type: 'customer/getCustomerListAction',
      payload: {
        pageNo: 1,
        pageSize: 100,
        filter: { company_id: currentCompany.company_id },
      },
    });

    this.fetchSenderList();

    // 获取最后一车信息
    this.getLastCarInfo();
  }

  // 设置当前公司
  setCurrentCompany = (branchCompanyList = []) => {
    // 初始渲染的是否，先加载第一个分公司的收货人信息
    if (CacheCompany.company_type == 2) {
      this.setState({
        currentCompany: CacheCompany,
      });

      return CacheCompany;
    } else if (branchCompanyList && branchCompanyList.length > 0) {
      this.setState({
        currentCompany: branchCompanyList[0],
      });

      return branchCompanyList[0];
    }

    return {};
  };

  getLastCarInfo = async option => {
    const isUseCarCode = (option && option.isUseCarCode) || false;
    const { dispatch, form } = this.props;
    const { currentCompany = {}, currentShipSite = {} } = this.state;
    const carCode = form.getFieldValue('car_code');
    const param = {
      company_id: currentCompany.company_id,
      shipsite_id: currentShipSite.site_id,
    };
    if (carCode && isUseCarCode) {
      param.car_code = carCode;
    }
    const carInfo = await dispatch({
      type: 'car/getLastCarCodeAction',
      payload: param,
    });

    return carInfo;
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

  fetchSenderList = async companyId => {
    const {
      dispatch,
      branchCompanyList,
      courier: { senderList = [] },
    } = this.props;
    let { currentCompany } = this.state;
    if (!currentCompany || !currentCompany.company_id) {
      currentCompany = branchCompanyList && branchCompanyList[0];
    }

    await dispatch({
      type: 'courier/getCourierListAction',
      payload: {
        pageNo: 1,
        pageSize: 100,
        type: 'sender',
        filter: { company_id: currentCompany.company_id },
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
    // 清空原公司收货客户
    dispatch({
      type: 'customer/resetCustomerPageNo',
      payload: { type: 'Get' },
    });

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
    this.fetchSenderList();
    // 获取当前公司的客户列表
    this.fetchGetCustomerList(value);
  };

  handleSearch = e => {
    e && e.preventDefault();
    this.setState({
      current: 1,
    });
    this.getOrderList();
  };

  // 调用table子组件
  onRefTable = ref => {
    this.standardTable = ref;
  };

  /**
   * 获取订单信息
   */
  getOrderList = (data = {}, pageNo) => {
    const { dispatch, form } = this.props;
    const { current, pageSize, btnSearchClicked } = this.state;

    this.getLastCarInfo({ isUseCarCode: true });

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
      // create_date
      Object.keys(fieldsValue).forEach(key => {
        const item = fieldsValue[key];
        if (!item) {
          delete fieldsValue[key];
        }
      });
      fieldsValue = await setCourierFieldValue2Mng(this, fieldsValue);
      fieldsValue = await setCustomerFieldValue(this, fieldsValue);
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

  onShipSiteSelect = async value => {
    const {
      site: { entrunkSiteList = [] },
    } = this.props;

    let site = {};
    for (let i = 0; i < entrunkSiteList.length; i++) {
      const c = entrunkSiteList[i];
      if (c.site_id == value) {
        site = c;
        break;
      }
    }

    await this.setState({
      currentShipSite: site,
    });
    this.getLastCarInfo();
  };

  // 打印托运单
  onPrintCheckList = async () => {
    const {
      company: { branchCompanyList },
      site: { siteList },
      dispatch,
    } = this.props;
    const { selectedRows } = this.state;
    if (selectedRows.length <= 0) {
      message.info('请选择需要打印的记录');
      return;
    }
    let printHtml = '';
    for (var i = 0; i < selectedRows.length; i++) {
      const data = selectedRows[i];
      // 获取收货人信息
      const { getCustomer = {}, sendCustomer = {} } = await dispatch({
        type: 'customer/queryCustomerAction',
        payload: {
          getcustomer_id: data.getcustomer_id,
          sendcustomer_id: data.sendcustomer_id,
        },
      });
      let printCompany = {};
      branchCompanyList.forEach(item => {
        if (item.company_id == data.company_id) {
          printCompany = item;
        }
      });
      printHtml += getPrintOrderConent({
        getCustomer,
        sendCustomer,
        data,
        printCompany,
        siteList,
        footer: true,
      });
    }

    printOrder(printHtml);
  };

  // 到货通知
  onArriveNotify = () => {};

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
    if (!this.canEditSender()) {
      return;
    }
    this.setState({
      addFormModalVisible: true,
    });
  };

  canEditSender = () => {
    const { selectedRows = [] } = this.state;
    const orderIds = [];
    const customerIds = [];
    let endDate = moment(Number(new Date().getTime()));
    let cannotEditFlag = false;
    selectedRows.forEach(item => {
      orderIds.push(item.order_id);
      customerIds.push(item.getcustomer_id);
      if (item.arrive_date) {
        let startDate = moment(
          isNaN(Number(item.arrive_date)) ? item.arrive_date : Number(item.arrive_date)
        );
        let diffHours = endDate.diff(startDate, 'hours');
        console.log(startDate);
        if (diffHours >= 48) {
          cannotEditFlag = true;
        }
      }
      if (!cannotEditFlag && item.create_date) {
        let startDate = moment(
          isNaN(Number(item.create_date)) ? item.create_date : Number(item.create_date)
        );
        let diffHours = endDate.diff(startDate, 'hours');

        if (diffHours >= 120) {
          cannotEditFlag = true;
        }
      }
    });
    if (cannotEditFlag) {
      message.error('已经超出更改时间，不可更改送货人');
      return false;
    }

    return true;
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
      setTimeout(() => {
        this.getOrderList();
      }, 800);
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
    if (!this.canEditSender()) {
      return;
    }
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
      setTimeout(() => {
        this.getOrderList();
      }, 800);
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
      company: { branchCompanyList },
      courier: { senderList = [] },
      site: { entrunkSiteList = [] },
      car: { lastCar },
    } = this.props;
    const { currentCompany, btnSearchClicked } = this.state;
    const formItemLayout = {};
    const companyOption = {};
    // 默认勾选第一个公司
    companyOption.initialValue = currentCompany.company_id || '';
    // 默认勾选第一个公司
    if (CacheCompany.company_type != 1) {
      companyOption.initialValue = CacheCompany.company_id || '';
    }

    // senderList增加未送货
    let hasUnSender = false;
    senderList.forEach(item => {
      if (item.courier_id === -1) {
        hasUnSender = true;
      }
    });
    if (!hasUnSender) {
      senderList.unshift({ courier_id: -1, courier_name: '未送货' });
    }
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <FormItem label="分公司" {...formItemLayout}>
          {getFieldDecorator('company_id', companyOption)(
            <Select
              placeholder="全部"
              onSelect={this.onCompanySelect}
              style={{ width: '100px' }}
              allowClear={CacheCompany.company_type == 1 ? true : false}
            >
              {(CacheCompany.company_type == 1 ? branchCompanyList : [CacheCompany]).map(ele => {
                return (
                  <Option key={ele.company_id} value={ele.company_id}>
                    {ele.company_name}
                  </Option>
                );
              })}
            </Select>
          )}
        </FormItem>
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
          {getFieldDecorator(
            'shipsite_id',
            entrunkSiteList.length > 0 ? { initialValue: entrunkSiteList[0].site_id } : {}
          )(
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
          {getFieldDecorator('car_code', { initialValue: lastCar.car_code })(
            <Input placeholder="请输入" style={{ width: '80px' }} />
          )}
        </FormItem>
        <FormItem label="送货人" {...formItemLayout}>
          {getFieldDecorator('sender_id', {})(
            <AutoComplete
              size="large"
              style={{ width: '100%' }}
              dataSource={senderList.map(item => {
                const AutoOption = AutoComplete.Option;
                return (
                  <AutoOption
                    key={`${item.courier_id}`}
                    value={`${item.courier_id}`}
                    courierid={`${item.courier_id}`}
                    label={item.courier_name}
                  >
                    {item.courier_name}
                  </AutoOption>
                );
              })}
              onSelect={value => {
                onCourierSelect(this, value, 'sender');
              }}
              onChange={value => {
                onCourierChange(this, value, 'sender');
              }}
              allowClear
              placeholder="请输入"
              filterOption={(inputValue, option) =>
                option.props.children.indexOf(inputValue) !== -1
              }
            >
              {' '}
            </AutoComplete>
          )}
        </FormItem>
        <FormItem label="收货人姓名" {...formItemLayout}>
          {getFieldDecorator('getcustomer_id')(
            <AutoComplete
              size="large"
              style={{ width: '100%' }}
              dataSource={getCustomerList.map(item => {
                const AutoOption = AutoComplete.Option;
                return (
                  <AutoOption
                    key={`${item.customer_id}`}
                    value={`${item.customer_id}`}
                    customerid={`${item.customer_id}`}
                    label={item.customer_name}
                  >
                    {item.customer_name}
                  </AutoOption>
                );
              })}
              onSelect={value => {
                onGetCustomerSelect(this, value);
              }}
              onChange={value => {
                onGetCustomerChange(this, value);
              }}
              allowClear
              placeholder="请输入"
              filterOption={(inputValue, option) =>
                option.props.children.indexOf(inputValue) !== -1
              }
            >
              {' '}
            </AutoComplete>
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
      car: { lastCar },
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
            <div className={styles.tableListOperator}>
              {selectedRows.length > 0 && (
                <span>
                  <Button onClick={this.onUpdateSenderModal}>更改送货人</Button>
                  <Button onClick={this.onDelSender}>取消送货人</Button>
                  <Button onClick={this.onDownload}>下载</Button>
                  <Button onClick={this.onPrintCheckList}>托运单打印</Button>
                  <Button onClick={this.onArriveNotify}>到货通知</Button>
                </span>
              )}
            </div>
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
