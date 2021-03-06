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
import StandardTable from '@/components/StandardTable';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import { locale } from '@/utils';
import styles from './OrderList.less';
import { element } from 'prop-types';
import { async } from 'q';
import { CacheSite, CacheUser, CacheCompany, CacheRole } from '@/utils/storage';

const FormItem = Form.Item;
const { Step } = Steps;
const { TextArea } = Input;
const { Option } = Select;
const RadioGroup = Radio.Group;
const getValue = obj =>
  Object.keys(obj)
    .map(key => obj[key])
    .join(',');

/* eslint react/no-multi-comp:0 */
@connect(({ untrunkorder }) => {
  return {
    untrunkorder,
  };
})
@Form.create()
class CreateReceiverForm extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }

  getModalContent = () => {
    const {
      form: { getFieldDecorator },
      receiverList,
    } = this.props;

    return (
      <Form layout="inline">
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={12} sm={24}>
            <FormItem label="接货人">
              {getFieldDecorator('receiver_id', {})(
                <Select placeholder="全部" style={{ width: '150px' }}>
                  {receiverList.map(ele => {
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
    );
  };

  onOkHandler = e => {
    e.preventDefault();
    const { dispatch, form, receiverList, selectedRows, onReceiverModalCancel } = this.props;
    form.validateFields(async (err, fieldsValue) => {
      if (err) return;
      const orderIds = selectedRows.map(item => {
        return item.order_id;
      });
      const receivers = receiverList.filter(item => {
        if (item.courier_id == fieldsValue.receiver_id) {
          return item;
        }
      });

      fieldsValue.order_id = orderIds;
      fieldsValue.receiver_name = receivers[0] && receivers[0].courier_name;
      console.log(fieldsValue);
      const result = await dispatch({
        type: 'untrunkorder/changeOrderReceiverAction',
        payload: fieldsValue,
      });

      if (result.code == 0) {
        onReceiverModalCancel();
      }
    });
  };

  render() {
    const { modalVisible, onReceiverModalCancel } = this.props;
    return (
      <Modal
        title="更改接货人"
        okText="确认"
        cancelText="取消"
        className={styles.standardListForm}
        width={640}
        destroyOnClose
        visible={modalVisible}
        onOk={this.onOkHandler}
        onCancel={onReceiverModalCancel}
      >
        {this.getModalContent()}
      </Modal>
    );
  }
}

/* eslint react/no-multi-comp:0 */
@connect(({ untrunkorder }) => {
  return {
    untrunkorder,
  };
})
@Form.create()
class CreateEntrunkForm extends PureComponent {
  constructor(props) {
    super(props);
  }

  /**
   * 编辑的时候初始化赋值表单
   */
  componentDidMount() {}

  onCarChange = value => {
    const { driverList, form } = this.props;
    let currentDriver;
    for (let i = 0; i < driverList.length; i++) {
      const driver = driverList[i];
      if (driver.driver_plate == value) {
        currentDriver = driver;
        break;
      }
    }
    if (!currentDriver) {
      // 设置发货人账号
      form.setFieldsValue({
        // driver_plate: currentDriver.driver_plate,
        driver_id: '',
        driver_name: '',
        driver_mobile: '',
      });
    }
  };

  onCarSelect = (value, option) => {
    const { props } = option;
    const { driverList, form } = this.props;
    let currentDriver;
    for (let i = 0; i < driverList.length; i++) {
      const driver = driverList[i];
      if (driver.driver_id == props.driverid) {
        currentDriver = driver;

        break;
      }
    }
    if (currentDriver) {
      // 设置发货人账号
      form.setFieldsValue({
        // driver_plate: currentDriver.driver_plate,
        driver_name: currentDriver.driver_name,
        driver_mobile: currentDriver.driver_mobile,
      });
    }
  };

  // 渲染autocomplete的option
  renderCustomerOption = item => {
    const AutoOption = AutoComplete.Option;
    return (
      <AutoOption
        key={item.driver_id}
        driverid={item.driver_id}
        value={`${item.driver_id}`}
        text={item.driver_plate}
      >
        {item.driver_plate}
      </AutoOption>
    );
  };

  getModalContent = () => {
    let {
      form: { getFieldDecorator },
      branchCompanyList,
      currentCompany,
      driverList,
      lastCar = {},
    } = this.props;
    let currentDriver = {};
    driverList.forEach(item => {
      if (item.driver_id == lastCar.driver_id && Number(lastCar.car_status) < 3) {
        currentDriver = item;
      }
    });
    if (Number(lastCar.car_status) >= 3) {
      lastCar = { car_code: Number(lastCar.car_code) + 1 };
    }
    return (
      <Form layout="inline" className={styles.modalForm}>
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={12} sm={24}>
            <FormItem label="车牌号">
              {getFieldDecorator('driver_id', {
                rules: [{ required: true, message: '请填写收车牌号' }],
                initialValue: `${lastCar.driver_id || ''}`,
              })(
                <AutoComplete
                  size="large"
                  style={{ width: '100%' }}
                  dataSource={driverList.map(this.renderCustomerOption)}
                  onSelect={this.onCarSelect}
                  onChange={this.onCarChange}
                  placeholder="请输入"
                  optionLabelProp="text"
                  filterOption={(inputValue, option) =>
                    option.props.children.indexOf(inputValue) !== -1
                  }
                >
                  {' '}
                </AutoComplete>
              )}
            </FormItem>
          </Col>
          <Col md={12} sm={24}>
            <FormItem label="车主姓名">
              {getFieldDecorator('driver_name', {
                rules: [{ required: true, message: '请填写车主姓名' }],
                initialValue: currentDriver.driver_name,
              })(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col md={12} sm={24}>
            <FormItem label="联系电话">
              {getFieldDecorator('driver_mobile', {
                rules: [{ required: true, message: '请填写联系电话' }],
                initialValue: currentDriver.driver_mobile,
              })(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
          <Col md={12} sm={24}>
            <FormItem label="货车编号">
              {getFieldDecorator('car_code', {
                initialValue: lastCar.car_code,
                rules: [{ required: true, message: '请填写货车编号' }],
              })(<Input placeholder="请输入" disabled />)}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col md={12} sm={24}>
            <FormItem label="拉货日期">
              {getFieldDecorator('car_date', {
                rules: [{ required: true, message: '请填写拉货日期' }],
                initialValue: moment(new Date().getTime()),
              })(
                <DatePicker
                  placeholder="全部"
                  format="YYYY-MM-DD"
                  locale={locale}
                  style={{ width: '100%' }}
                />
              )}
            </FormItem>
          </Col>
          <Col md={12} sm={24}>
            <FormItem label="货车费用">
              {getFieldDecorator('car_fee', {
                rules: [{ required: true, message: '请填写货车费用' }],
                initialValue: lastCar.car_fee || '',
              })(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  };

  onOkHandler = e => {
    e.preventDefault();
    const {
      dispatch,
      form,
      selectedRows,
      onEntrunkModalCancel,
      driverList = [],
      onSearch,
      currentShipSite = {},
      currentCompany = {},
    } = this.props;
    form.validateFields(async (err, fieldsValue) => {
      if (err) return;

      const formValues = fieldsValue;
      const orderIds = selectedRows.map(item => {
        return item.order_id;
      });
      if (formValues.car_date && formValues.car_date.valueOf) {
        formValues.car_date = `${formValues.car_date.valueOf()}`;
      }
      const drivers = driverList.filter(item => {
        if (item.driver_id == formValues.driver_id) {
          return item;
        }
      });

      if (drivers.length <= 0) {
        formValues.driver_plate = formValues.driver_id;
        formValues.driver_id = 0;
      } else {
        formValues.driver_plate = drivers[0].driver_plate;
        formValues.driver_id = Number(formValues.driver_id);
      }

      formValues.car_fee = Number(formValues.car_fee || 0);
      formValues.shipsite_id = currentShipSite.site_id;
      formValues.shipsite_name = currentShipSite.site_name;
      formValues.car_code = formValues.car_code + '';
      formValues.company_id = currentCompany.company_id;

      const result = await dispatch({
        type: 'untrunkorder/entrunkOrderAction',
        payload: { order_id: orderIds, car: formValues },
      });

      if (result.code == 0) {
        message.success('装车成功');
        onSearch();
        onEntrunkModalCancel();
      } else {
        message.error(result.msg || '装车失败');
      }
    });
  };

  render() {
    const { modalVisible, onEntrunkModalCancel } = this.props;
    return (
      <Modal
        title="货物装车"
        okText="确认"
        cancelText="取消"
        className={styles.standardListForm}
        width={700}
        destroyOnClose
        visible={modalVisible}
        onOk={this.onOkHandler}
        onCancel={onEntrunkModalCancel}
      >
        {this.getModalContent()}
      </Modal>
    );
  }
}

/* eslint react/no-multi-comp:0 */
@connect(({ customer, company, untrunkorder, site, car, driver, receiver, loading }) => {
  return {
    customer,
    company,
    untrunkorder,
    site,
    car,
    driver,
    receiver,
    loading: loading.models.rule,
  };
})
@Form.create()
class TableList extends PureComponent {
  state = {
    selectedRows: [],
    current: 1,
    pageSize: 20,
    receiverModalVisible: false,
    entrunkModalVisible: false,
    cancelShipModalVisible: false,
    currentCompany: {},
    currentShipSite: {},
    btnSearchClicked: false,
  };

  columns = [
    {
      title: '分公司',
      width: '80px',
      dataIndex: 'company_name',
    },
    {
      title: '录票时间',
      width: '170px',
      dataIndex: 'create_date',
      render: val => <span>{moment(val).format('YYYY-MM-DD HH:mm:ss')}</span>,
    },
    {
      title: '货单号',
      width: '80px',
      dataIndex: 'order_code',

      align: 'right',
      render: val => `${val}`,
      // mark to display a total number
      needTotal: true,
    },
    {
      title: '发货客户',
      width: '80px',
      dataIndex: 'sendcustomer_name',
    },
    {
      title: '收货客户',
      width: '80px',
      dataIndex: 'getcustomer_name',
    },
    {
      title: '应收货款',
      width: '80px',
      dataIndex: 'order_amount',
    },
    {
      title: '运费',
      width: '80px',
      dataIndex: 'trans_amount',
    },
    {
      title: '折后运费',
      width: '80px',
      dataIndex: 'trans_discount',
    },
    {
      title: '运费方式',
      width: '80px',
      dataIndex: 'trans_type',

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
      title: '经办人',
      width: '80px',
      dataIndex: 'operator_name',
    },
    {
      title: '接货人',
      width: '80px',
      dataIndex: 'receiver_name',
    },
    {
      title: '装配站',
      width: '100px',
      dataIndex: 'shipsite_name',
    },
    {
      title: '站点',
      width: '100px',
      dataIndex: 'site_name',
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
      title: '备注',
      width: '150px',
      dataIndex: 'remark',
    },
  ];

  async componentDidMount() {
    const { dispatch } = this.props;

    const branchCompanyList = await dispatch({
      type: 'company/getCompanyList',
      payload: {},
    });

    const siteList = await dispatch({
      type: 'site/getSiteListAction',
      payload: {},
    });

    dispatch({
      type: 'customer/sendCustomerListAction',
      payload: { pageNo: 1, pageSize: 100 },
    });

    dispatch({
      type: 'receiver/getReceiverListAction',
      payload: { pageNo: 1, pageSize: 100, type: 'receiver', filter: {} },
    });

    let currentCompany = await this.setCurrentCompany(branchCompanyList);
    dispatch({
      type: 'customer/getCustomerListAction',
      payload: {
        pageNo: 1,
        pageSize: 100,
        filter: { company_id: currentCompany.company_id },
      },
    });

    dispatch({
      type: 'driver/getDriverListAction',
      payload: {
        pageNo: 1,
        pageSize: 500,
        company_id: currentCompany.company_id,
      },
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
    await this.getLastCarInfo();
    // 页面初始化获取一次订单信息，否则会显示其他页面的缓存信息
    this.getOrderList();
  }

  // 设置当前公司
  setCurrentCompany = async (branchCompanyList = []) => {
    // 初始渲染的是否，先加载第一个分公司的收货人信息
    if (CacheCompany.company_type == 2) {
      await this.setState({
        currentCompany: CacheCompany,
      });

      return CacheCompany;
    } else if (branchCompanyList && branchCompanyList.length > 0) {
      await this.setState({
        currentCompany: branchCompanyList[0],
      });

      return branchCompanyList[0];
    }

    return {};
  };

  handleFormReset = () => {
    const { form, dispatch } = this.props;
    form.resetFields();
  };

  handleSelectRows = rows => {
    this.setState({
      selectedRows: rows,
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
    const { dispatch } = this.props;
    const { current, pageSize, btnSearchClicked } = this.state;
    const { form } = this.props;

    this.getLastCarInfo();
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

      if (!fieldsValue.site_id) {
        delete fieldsValue.site_id;
      }
      const searchParams = Object.assign({ filter: fieldsValue }, data);
      await dispatch({
        type: 'untrunkorder/getOrderListAction',
        payload: { pageNo: pageNo || current, pageSize, ...searchParams },
      });

      this.setState({
        btnSearchClicked: false,
      });

      dispatch({
        type: 'untrunkorder/getOrderStatisticAction',
        payload: { ...searchParams },
      });
    });

    this.standardTable.cleanSelectedKeys();
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

  // 取消装回
  onCancelShipOk = async () => {
    const { selectedRows } = this.state;
    const { dispatch } = this.props;
    const orderIds = [];
    selectedRows.forEach(item => {
      orderIds.push(item.order_id);
    });

    const result = await dispatch({
      type: 'untrunkorder/cancelShipAction',
      payload: { order_id: orderIds },
    });

    if (result.code == 0) {
      this.handleSearch();
      message.success('取消装回成功');
      this.onCancelShipCancel();
    }
  };

  onCancelShipCancel = () => {
    this.setState({
      cancelShipModalVisible: false,
    });
  };

  onCancelShip = () => {
    this.setState({
      cancelShipModalVisible: true,
    });
  };

  onChangeReceiver = () => {};

  /**
   * 装车弹窗
   */
  onEntrunkModalShow = () => {
    const { form } = this.props;
    const { currentShipSite = {}, currentCompany = {} } = this.state;
    if (!currentCompany.company_id || !form.getFieldValue('company_id')) {
      message.error('请先选择公司');
      return;
    }
    if (!currentShipSite.site_id) {
      message.error('请先选择配载站');
      return;
    }
    this.setState({
      entrunkModalVisible: true,
    });
  };

  onEntrunkModalCancel = () => {
    // setTimeout(() => this.addBtn.blur(), 0);
    this.setState({
      entrunkModalVisible: false,
    });
  };

  /**
   * 接货人弹窗
   */
  onReceiverModalCancel = () => {
    this.setState({
      receiverModalVisible: false,
    });
  };

  onReceiverModalShow = () => {
    this.setState({
      receiverModalVisible: true,
    });
  };

  onCompanySelect = async (value, option) => {
    const {
      company: { branchCompanyList = [] },
    } = this.props;

    // 重新计算折后运费
    let company = {};
    for (let i = 0; i < branchCompanyList.length; i++) {
      const c = branchCompanyList[i];
      if (c.company_id == value) {
        company = c;
        break;
      }
    }

    await this.setState({
      currentCompany: company,
    });

    this.getLastCarInfo();
    this.handleSearch();
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

    this.getDriverList();

    return carInfo;
  };

  getDriverList = () => {
    const { dispatch, form } = this.props;
    const { currentCompany } = this.state;
    dispatch({
      type: 'driver/getDriverListAction',
      payload: {
        pageNo: 1,
        pageSize: 500,
        company_id: currentCompany.company_id,
      },
    });
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
    this.handleSearch();
  };

  onSiteSelect = async value => {
    this.handleSearch();
  };

  // 点击勾选
  selectRow = record => {
    const { selectedRows, selectedRowKeys } = this.state;
    let recordFlag = false;
    let recordIndex;

    selectedRowKeys.forEach((item, index) => {
      if (item == record.order_id) {
        recordFlag = true;
        recordIndex = index;
      }
    });
    if (recordFlag) {
      selectedRows.splice(recordIndex, 1);
      selectedRowKeys.splice(recordIndex, 1);
    } else {
      selectedRows.push(record);
      selectedRowKeys.push(record.order_id);
    }

    this.setState({ selectedRows, selectedRowKeys });
  };

  onSelectedRowKeysChange = selectedRowKeys => {
    console.log(selectedRowKeys);
    //this.setState({ selectedRowKeys });
  };

  // 调用table子组件
  onRefTable = ref => {
    this.standardTable = ref;
  };

  tableFooter = () => {
    const {
      untrunkorder: {
        total,
        totalOrderAmount,
        totalTransAmount,
        totalInsurancefee,
        totalRealTransAmount,
        totalRealOrderAmount,
        totalAdvancepayAmount,
        totalDeliverAmount,
      },
    } = this.props;
    return (
      <div className={styles.tableFooter}>
        <span>货款总额：{totalOrderAmount || '0'}</span>
        <span className={styles.footerSplit}>运费总额：{totalTransAmount || '0'}</span>
        <span className={styles.footerSplit}>垫付总额：{totalAdvancepayAmount || '0'}</span>
        <span className={styles.footerSplit}>送货费总额：{totalDeliverAmount || '0'}</span>
        <span className={styles.footerSplit}>保价费总额：{totalInsurancefee || '0'}</span>
        <span className={styles.footerSplit}>票数：{total || '0'}</span>
      </div>
    );
  };

  renderSimpleForm() {
    const {
      form: { getFieldDecorator },
      company: { branchCompanyList },
      site: { entrunkSiteList, siteList },
      receiver: { receiverList },
    } = this.props;
    const { currentShipSite = {}, btnSearchClicked } = this.state;
    const companyOption = {};
    const siteOption = { initialValue: CacheSite.site_id };
    // 默认勾选第一个公司
    if (CacheCompany.company_type != 1) {
      companyOption.initialValue = CacheCompany.company_id;
    }

    let allowClearSite = true;
    let siteSelectList = siteList;
    if (CacheSite.site_type == 1) {
      allowClearSite = false;
      siteSelectList = [CacheSite];
    }

    // 当前配载部只能装当前的车，不能装其他配载部的，所以用entrunkSiteList = [CacheSite]
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <FormItem label="分公司">
          {getFieldDecorator('company_id', companyOption)(
            <Select
              placeholder="全部"
              onChange={this.onCompanySelect}
              style={{ width: '100px' }}
              allowClear={CacheCompany.company_type == 2 ? false : true}
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

        <FormItem label="站点">
          {getFieldDecorator('site_id', siteOption)(
            <Select
              placeholder="全部"
              style={{ width: '100px' }}
              onChange={this.onSiteSelect}
              allowClear={allowClearSite}
            >
              {siteSelectList.map(ele => {
                return (
                  <Option key={ele.site_id} value={ele.site_id}>
                    {ele.site_name}
                  </Option>
                );
              })}
            </Select>
          )}
        </FormItem>

        <FormItem label="配载部">
          {getFieldDecorator('shipsite_id', { initialValue: currentShipSite.site_id })(
            <Select
              placeholder="全部"
              style={{ width: '100px' }}
              onChange={this.onShipSiteSelect}
              allowClear
            >
              {entrunkSiteList.map(ele => {
                return (
                  <Option key={ele.site_id} value={ele.site_id}>
                    {ele.site_name}
                  </Option>
                );
              })}
            </Select>
          )}
        </FormItem>

        <FormItem label="接货人">
          {getFieldDecorator('receiver_id', {})(
            <Select placeholder="全部" style={{ width: '100px' }} allowClear>
              {receiverList.map(ele => {
                return (
                  <Option key={ele.courier_id} value={ele.courier_id}>
                    {ele.courier_name}
                  </Option>
                );
              })}
            </Select>
          )}
        </FormItem>
        <FormItem>
          <Button type="primary" htmlType="submit" loading={btnSearchClicked}>
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
      untrunkorder: { orderList, total, totalOrderAmount, totalTransAmount },
      company: { branchCompanyList },
      receiver: { receiverList },
      site: { entrunkSiteList },
      driver: { driverList },
      car: { lastCar },
      loading,
    } = this.props;

    const {
      selectedRows,
      receiverModalVisible,
      current,
      pageSize,
      entrunkModalVisible,
      currentCompany,
      cancelShipModalVisible,
      currentShipSite,
    } = this.state;

    // 是否显示操作按钮
    let showOperateButton = true;
    let showPrintButton = true;
    if (CacheCompany.company_type != 1) {
      showOperateButton = false;
      showPrintButton = false;
    }
    if (['site_searchuser', 'site_orderuser'].indexOf(CacheRole.role_value) >= 0) {
      showOperateButton = false;
    }
    if (['site_searchuser'].indexOf(CacheRole.role_value) >= 0) {
      showPrintButton = false;
    }
    return (
      <div>
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>{this.renderForm()}</div>
            <div className={styles.tableListOperator}>
              {selectedRows.length > 0 && showOperateButton && (
                <span>
                  <Button onClick={this.onCancelShip}>取消装回</Button>
                  <Button onClick={this.onReceiverModalShow}>更改接货人</Button>
                  <Button onClick={this.onEntrunkModalShow}>装车</Button>
                </span>
              )}
              {selectedRows.length > 0 && showPrintButton && (
                <span>
                  <Button onClick={this.onPrintOrder}>打印清单</Button>
                  <Button onClick={this.onDownloadOrder}>下载清单</Button>
                </span>
              )}
            </div>
            <StandardTable
              onRef={this.onRefTable}
              className={styles.dataTable}
              selectedRows={selectedRows}
              loading={loading}
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
              columns={this.columns}
              onSelectRow={this.handleSelectRows}
              onClickRow={this.onClickRow}
              onChange={this.handleStandardTableChange}
            />
          </div>
          {this.tableFooter()}
        </Card>
        {entrunkModalVisible && (
          <CreateEntrunkForm
            modalVisible={entrunkModalVisible}
            selectedRows={selectedRows}
            branchCompanyList={branchCompanyList}
            currentCompany={currentCompany}
            onEntrunkModalCancel={this.onEntrunkModalCancel}
            driverList={driverList}
            lastCar={lastCar}
            onSearch={this.handleSearch}
            currentShipSite={currentShipSite}
          />
        )}
        <CreateReceiverForm
          receiverList={receiverList}
          entrunkSiteList={entrunkSiteList}
          modalVisible={receiverModalVisible}
          selectedRows={selectedRows}
          currentCompany={currentCompany}
          onReceiverModalCancel={this.onReceiverModalCancel}
        />
        <Modal
          title="确认"
          okText="确认"
          cancelText="取消"
          visible={cancelShipModalVisible}
          onOk={this.onCancelShipOk}
          onCancel={this.onCancelShipCancel}
        >
          <p>您确认要取消装回么？</p>
        </Modal>
      </div>
    );
  }
}

export default TableList;
