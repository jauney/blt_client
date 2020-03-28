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
  Spin
} from 'antd';
import StandardTable from '@/components/StandardTable';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import { locale } from '@/utils'

import styles from './OrderList.less';
import { element } from 'prop-types';
import { async } from 'q';
import { printDownLoad } from '@/utils/print'
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

  render () {
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
@connect(({ trunkorder }) => {
  return {
    trunkorder,
  };
})
@Form.create()
class CreateDepartForm extends PureComponent {
  constructor(props) {
    super(props);
  }

  /**
   * 编辑的时候初始化赋值表单
   */
  componentDidMount () { }

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
      lastCar,
    } = this.props;
    let currentDriver = {};
    driverList.forEach(item => {
      if (item.driver_id == lastCar.driver_id && Number(lastCar.car_status) < 3) {
        currentDriver = item;
      }
    });


    return (
      <Form layout="inline" className={styles.entrunkForm}>
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
              })(<DatePicker placeholder="全部" locale={locale} format="YYYY-MM-DD" style={{ width: '100%' }} />)}
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
      driverList = [],
      onOk
    } = this.props;
    form.validateFields(async (err, fieldsValue) => {
      if (err) return;
      const formValues = fieldsValue;

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
      formValues.car_code = formValues.car_code + '';

      onOk(formValues)

    });
  };

  render () {
    const { modalVisible, onCancel } = this.props;
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
        onCancel={onCancel}
      >
        {this.getModalContent()}
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
@Form.create()
class CreateEntrunkForm extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }

  getModalContent = () => {
    const {
      form: { getFieldDecorator },
      currentCompany,
      lastCar,
      carFeeModalEditable,
    } = this.props;
    let isDisabled = currentCompany.company_type == 2 || !carFeeModalEditable ? true : false
    return (
      <Form layout="inline">
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={12} sm={24}>
            <FormItem label="分公司">{currentCompany.company_name}</FormItem>
          </Col>
          <Col md={12} sm={24}>
            <FormItem label="车牌号">{lastCar.driver_plate}</FormItem>
          </Col>
          <Col md={12} sm={24}>
            <FormItem label="车主姓名">{lastCar.driver_name}</FormItem>
          </Col>
          <Col md={12} sm={24}>
            <FormItem label="联系电话">{lastCar.driver_mobile}</FormItem>
          </Col>
          <Col md={12} sm={24}>
            <FormItem label="货车编号">{lastCar.car_code}</FormItem>
          </Col>
          <Col md={12} sm={24}>
            <FormItem label="拉货日期">
              {moment(Number(lastCar.car_date || 0)).format('YYYY-MM-DD HH:mm:ss')}
            </FormItem>
          </Col>
          <Col md={12} sm={24}>
            <FormItem label="货车费用">
              {getFieldDecorator('car_fee', {
                rules: [{ required: true, message: '请填写货车费用' }],
                initialValue: lastCar.car_fee,
              })(<Input placeholder="请输入" disabled={isDisabled} />)}
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  };

  onOkHandler = e => {
    e.preventDefault();
    const { dispatch, form, onEntrunkModalCancel, lastCar, onSearch } = this.props;
    form.validateFields(async (err, fieldsValue) => {
      if (err) return;

      fieldsValue.car_fee = Number(fieldsValue.car_fee);
      fieldsValue.confirm = 1;
      const result = await dispatch({
        type: 'trunkedorder/updateCarFeeAction',
        payload: { car: Object.assign(lastCar, fieldsValue) },
      });

      if (result.code == 0) {
        message.success('运费结算成功');
        onSearch();
        onEntrunkModalCancel();
      }
    });
  };

  render () {
    const { modalVisible, onEntrunkModalCancel, carFeeModalEditable } = this.props;
    const buttons = [
      <Button key="btn-cancel" onClick={onEntrunkModalCancel}>
        取 消
      </Button>,
    ];
    if (carFeeModalEditable) {
      buttons.push(
        <Button key="btn-save" type="primary" onClick={this.onOkHandler}>
          保 存
        </Button>
      );
    }
    return (
      <Modal
        title="货物装车"
        className={styles.standardListForm}
        width={700}
        destroyOnClose
        visible={modalVisible}
        footer={buttons}
        onCancel={onEntrunkModalCancel}
      >
        {this.getModalContent()}
      </Modal>
    );
  }
}

/* eslint react/no-multi-comp:0 */
@connect(({ customer, driver, company, trunkedorder, site, car, receiver, loading }) => {
  return {
    customer,
    driver,
    company,
    trunkedorder,
    site,
    car,
    receiver,
    loading: loading.models.rule,
  };
})
@Form.create()
class TableList extends PureComponent {
  state = {
    loading: false,
    selectedRows: [],
    current: 1,
    pageSize: 20,
    entrunkModalVisible: false,
    carFeeModalEditable: true,
    departModalVisible: false,
    cancelDepartModalVisible: false,
    arriveModalVisible: false,
    cancelArriveModalVisible: false,
    cancelEntrunkModalVisible: false,
    currentCompany: {},
    currentShipSite: {},
  };

  columns = [
    {
      title: '货单号',
      width: '80px',
      sorter: true,
      dataIndex: 'order_code',

      align: 'right',
      render: val => `${val}`,
      // mark to display a total number
      needTotal: true,
    },
    {
      title: '发货客户',
      width: '80px',
      sorter: true,
      dataIndex: 'sendcustomer_name',
    },
    {
      title: '收获客户',
      width: '80px',
      sorter: true,
      dataIndex: 'getcustomer_name',
    },
    {
      title: '应收货款',
      width: '80px',
      sorter: true,
      dataIndex: 'order_amount',
    },
    {
      title: '实收货款',
      width: '80px',
      sorter: true,
      dataIndex: 'order_real',
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
      render: val => <span>{moment(Number(val || 0)).format('YYYY-MM-DD HH:mm:ss')}</span>,
    },
    {
      title: '发车时间',
      width: '170px',
      dataIndex: 'depart_date',
      render: val => <span>{moment(Number(val || 0)).format('YYYY-MM-DD HH:mm:ss')}</span>,
    },
    {
      title: '站点',
      width: '80px',
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

  async componentDidMount () {
    const { dispatch } = this.props;

    const branchCompanyList = await dispatch({
      type: 'company/getCompanyList',
      payload: {},
    });

    const siteList = await dispatch({
      type: 'site/getSiteListAction',
      payload: {},
    });

    this.setCurrentCompany(branchCompanyList)

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
    this.handleSearch();
    this.getDriverList()
  }

  // 设置当前公司
  setCurrentCompany = (branchCompanyList = []) => {
    // 初始渲染的是否，先加载第一个分公司的收货人信息
    if (CacheCompany.company_type == 2) {
      this.setState({
        currentCompany: CacheCompany
      });

      return CacheCompany
    }
    else if (branchCompanyList && branchCompanyList.length > 0) {
      this.setState({
        currentCompany: branchCompanyList[0]
      });

      return branchCompanyList[0]
    }

    return {}
  }

  getDriverList = () => {
    const { dispatch, form } = this.props;
    const { currentCompany } = this.state
    dispatch({
      type: 'driver/getDriverListAction',
      payload: {
        pageNo: 1,
        pageSize: 500,
        company_id: currentCompany.company_id,
      },
    });
  }

  /**
   * 获取订单信息
   */
  getOrderList = (data = {}, pageNo) => {
    const { dispatch, form } = this.props;
    const { current, pageSize } = this.state;

    this.getLastCarInfo({ isUseCarCode: true });
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      Object.keys(fieldsValue).forEach(item => {
        if (!fieldsValue[item]) {
          delete fieldsValue[item];
        }
      });

      const searchParams = Object.assign({ filter: fieldsValue }, data);
      dispatch({
        type: 'trunkedorder/getOrderListAction',
        payload: { pageNo: pageNo || current, pageSize, ...searchParams },
      });

      dispatch({
        type: 'trunkedorder/getOrderStatisticAction',
        payload: { ...searchParams },
      });
    });

    this.standardTable.cleanSelectedKeys()
  };

  // 调用table子组件
  onRefTable = (ref) => {
    this.standardTable = ref
  }

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

  onCompanySelect = async (value, option) => {
    const {
      dispatch,
      company: { branchCompanyList },
      form,
    } = this.props;

    const currentCompany = branchCompanyList.filter(item => {
      if (item.company_id == value) {
        return item;
      }
    });
    if (currentCompany.length > 0) {
      await this.setState({
        currentCompany: currentCompany[0],
      });
    }
    await this.getLastCarInfo();
    this.getDriverList()
    this.handleSearch()
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

  getLastCarInfo = async (option) => {
    const isUseCarCode = option && option.isUseCarCode || false
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

  handleSearch = e => {
    e && e.preventDefault();
    this.setState({
      current: 1,
    });
    this.getOrderList({}, 1);
  };

  // 取消装车
  onCancelEntrunkOk = async () => {
    const {
      dispatch,
      car: { lastCar },
    } = this.props;
    const { selectedRows } = this.state;

    const orderIds = selectedRows.map(item => {
      return item.order_id;
    });
    let result = await dispatch({
      type: 'trunkedorder/cancelEntrunkAction',
      payload: { order_id: orderIds, car: lastCar },
    });
    if (result.code == 0) {
      message.success('取消装车成功！');
      this.onCancelEntrunkCancel();
      setTimeout(() => {
        this.handleSearch()
      }, 1000)
    } else {
      message.error(result.msg);
    }
  };

  onCancelEntrunk = async () => {
    const { selectedRows } = this.state;
    let canCancelFlag = true;
    selectedRows.forEach(item => {
      if (item.order_status >= 3) {
        canCancelFlag = false;
      }
    });
    if (!canCancelFlag) {
      message.error('已发车订单不能取消装车');
      return;
    }
    this.setState({
      cancelEntrunkModalVisible: true,
    });
  };

  onCancelEntrunkCancel = async () => {
    this.setState({
      cancelEntrunkModalVisible: false,
    });
  };

  // 发车
  onDepark = async () => {
    this.setState({
      departModalVisible: true,
    });
  };

  onDepartCancel = async () => {
    this.setState({
      departModalVisible: false,
    });
  };

  onDepartOk = async (formValues) => {
    const {
      dispatch,
      car: { lastCar },
    } = this.props;
    const { currentCompany, currentShipSite } = this.state;

    formValues.shipsite_id = currentShipSite.site_id;
    formValues.shipsite_name = currentShipSite.site_name;
    formValues.company_id = currentCompany.company_id;

    let result = await dispatch({
      type: 'trunkedorder/departOrderAction',
      payload: {
        car_id: lastCar.car_id,
        car: formValues
      },
    });
    if (result.code == 0) {
      message.success('发车成功！');

      this.onDepartCancel();
      setTimeout(() => {
        this.getLastCarInfo();
        this.handleSearch();
      }, 1000)
    } else {
      message.error(result.msg);
    }
  };

  // 取消发车
  onCancelDepark = async () => {
    this.setState({
      cancelDepartModalVisible: true,
    });
  };

  onCancelDepartCancel = async () => {
    this.setState({
      cancelDepartModalVisible: false,
    });
  };

  onCancelDepartOk = async () => {
    const {
      dispatch,
      car: { lastCar },
    } = this.props;
    const { currentCompany } = this.state;
    this.setState({ loading: true })
    let result = await dispatch({
      type: 'trunkedorder/updateCarStatusAction',
      payload: {
        car_id: lastCar.car_id,
        car_status: 2,
        car_code: lastCar.car_code,
        company_id: currentCompany.company_id,
        shipsite_id: lastCar.shipsite_id
      },
    });
    this.setState({ loading: false })
    if (result.code == 0) {
      message.success('取消发车成功！');

      this.onCancelDepartCancel();
      setTimeout(() => {
        this.getLastCarInfo();
        this.handleSearch()
      }, 1000)
    } else {
      message.error(result.msg);
    }
  };

  // 到车
  onArrive = async () => {
    this.setState({
      arriveModalVisible: true,
    });
  };

  onArriveCancel = async () => {
    this.setState({
      arriveModalVisible: false,
    });
  };

  onArriveOk = async () => {
    const {
      dispatch,
      car: { lastCar },
    } = this.props;
    const { currentCompany, currentShipSite } = this.state;
    let result = await dispatch({
      type: 'trunkedorder/updateCarStatusAction',
      payload: {
        car_id: lastCar.car_id,
        car_status: 4,
        car_code: lastCar.car_code,
        company_id: currentCompany.company_id,
        shipsite_id: currentShipSite.site_id
      },
    });
    if (result.code == 0) {
      message.success('到车确认成功！');

      // 自动更新货车编号
      await dispatch({
        type: 'car/getLastCarCodeAction',
        payload: {
          company_id: currentCompany.company_id,
          shipsite_id: currentShipSite.site_id
        },
      });
      this.onArriveCancel();
    } else {
      message.error(result.msg);
    }
  };

  // 取消到车
  onCancelArrive = async () => {
    this.setState({
      cancelArriveModalVisible: true,
    });
  };

  onCancelArriveCancel = async () => {
    this.setState({
      cancelArriveModalVisible: false,
    });
  };

  onCancelArriveOk = async () => {
    const {
      dispatch,
      car: { lastCar },
    } = this.props;
    const { currentCompany, currentShipSite } = this.state;
    let result = await dispatch({
      type: 'trunkedorder/updateCarStatusAction',
      payload: {
        car_id: lastCar.car_id,
        car_status: 3,
        car_code: lastCar.car_code,
        company_id: currentCompany.company_id,
        shipsite_id: currentShipSite.site_id
      },
    });
    if (result.code == 0) {
      message.success('取消到车成功！');

      // 自动更新货车编号
      await dispatch({
        type: 'car/getLastCarCodeAction',
        payload: {
          company_id: currentCompany.company_id,
          shipsite_id: currentShipSite.site_id
        },
      });
      this.onCancelArriveCancel();
    } else {
      message.error(result.msg);
    }
  };

  /**
   * 装车弹窗
   */
  onCarFeeModalShow = () => {
    this.setState({
      entrunkModalVisible: true,
      carFeeModalEditable: true
    });
  };

  onCarFeeOnlyShow = () => {
    this.setState({
      entrunkModalVisible: true,
      carFeeModalEditable: false
    });
  }

  /**
   * 取消运费结算
   */
  onCancelCarFeeConfirmModalShow = () => {
    const {
      car: { lastCar },
    } = this.props;
    Modal.confirm({
      title: '确认',
      content: `确定要取消第 ${lastCar.car_code} 车的运费么`,
      okText: '确认',
      cancelText: '取消',
      onOk: this.onCancelCarFeeConfirm,
    });
  };

  onCancelCarFeeConfirm = async () => {
    const {
      dispatch,
      car: { lastCar },
    } = this.props;
    const result = await dispatch({
      type: 'trunkedorder/updateCarFeeAction',
      payload: { car: Object.assign(lastCar, { confirm: 0 }) },
    });

    if (result.code == 0) {
      message.success('取消运费结算成功');
      this.getLastCarInfo();
    }
  };

  // 打印货物清单
  onPrintOrder = () => {
    const {
      car: { lastCar },
      company: { branchCompanyList },
    } = this.props;
    const { selectedRows } = this.state
    let company = CacheCompany
    branchCompanyList.forEach(item => {
      if (item.company_id == lastCar.company_id) {
        company = item
      }
    })
    Modal.confirm({
      title: '确认',
      content: `确定打印${company.company_name}第${lastCar.car_code}车的所有货物清单么？`,
      okText: '确认',
      cancelText: '取消',
      onOk: () => { this.onPrintOrderConfirm() },
    });
  }
  onPrintOrderConfirm = async (type = '') => {
    const {
      car: { lastCar },
      company: { branchCompanyList },
      dispatch
    } = this.props;
    let company = CacheCompany
    branchCompanyList.forEach(item => {
      if (item.company_id == lastCar.company_id) {
        company = item
      }
    })
    let orderList = await dispatch({
      type: 'trunkedorder/queryOrderListAction',
      payload: { pageNo: 0, pageSize: 1000, sorter: 'getcustomer_name|ascend', filter: { company_id: company.company_id, car_code: lastCar.car_code, shipsite_id: lastCar.shipsite_id } },
    });
    console.log(orderList)
    printDownLoad({ selectedRows: orderList.orders, lastCar, type })
  }

  // 下载货物清单
  onDownloadOrder = () => {
    const {
      car: { lastCar },
      company: { branchCompanyList },
    } = this.props;
    const { selectedRows } = this.state
    let company = CacheCompany
    branchCompanyList.forEach(item => {
      if (item.company_id == lastCar.company_id) {
        company = item
      }
    })
    Modal.confirm({
      title: '确认',
      content: `确定下载${company.company_name}第${lastCar.car_code}车的所有货物清单么？`,
      okText: '确认',
      cancelText: '取消',
      onOk: () => { this.onPrintOrderConfirm('pdf') },
    });
  }

  onEntrunkModalCancel = () => {
    this.setState({
      entrunkModalVisible: false,
    });
  };

  tableFooter = () => {
    const {
      trunkedorder: {
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

  renderSimpleForm () {
    const {
      form: { getFieldDecorator },
      company: { branchCompanyList },
      site: { entrunkSiteList, siteList },
      car: { lastCar = {} },
    } = this.props;

    const { currentCompany = {}, currentShipSite = {} } = this.state;

    let allowClearSite = true
    let siteSelectList = siteList
    let siteOption = {}
    if (CacheSite.site_type == 1 || CacheCompany.company_type == 2) {
      allowClearSite = false
      siteSelectList = [CacheSite]
      siteOption.initialValue = CacheSite.site_id
    }

    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <FormItem label="分公司">
          {getFieldDecorator('company_id', { initialValue: currentCompany.company_id })(
            <Select
              placeholder="全部"
              onSelect={this.onCompanySelect}
              allowClear={CacheCompany.company_type == 1 ? true : false}
              style={{ width: '100px' }}
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
        {CacheCompany.company_type == 1 && (
          <FormItem label="站点">
            {getFieldDecorator('site_id', siteOption)(
              <Select placeholder="全部" style={{ width: '100px' }} allowClear={allowClearSite}>
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
        )}
        <FormItem label="配载部">
          {getFieldDecorator('shipsite_id', { initialValue: currentShipSite.site_id })(
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
        </FormItem>

        <FormItem label="货车编号">
          {getFieldDecorator('car_code', { initialValue: lastCar.car_code })(
            <Input placeholder="请输入" style={{ width: '100px' }} />
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

  renderForm () {
    return this.renderSimpleForm();
  }

  render () {
    const {
      trunkedorder: { orderList, total, totalOrderAmount, totalTransAmount },
      company: { branchCompanyList },
      car: { carList, lastCar },
      driver: { driverList },
      loading,
    } = this.props;

    const {
      selectedRows,
      current,
      pageSize,
      entrunkModalVisible,
      currentCompany,
      departModalVisible,
      cancelDepartModalVisible,
      arriveModalVisible,
      cancelArriveModalVisible,
      cancelEntrunkModalVisible,
      carFeeModalEditable
    } = this.state;
    let showOperateButton = true
    let showPrintButton = true
    if (['site_searchuser', 'site_orderuser'].indexOf(CacheRole.role_value) >= 0) {
      showOperateButton = false
    }
    if (['site_searchuser'].indexOf(CacheRole.role_value) >= 0) {
      showPrintButton = false
    }
    // 未发车时，下站不允许操作
    if (lastCar.car_status < 2 && CacheCompany.company_type == 2) {
      showOperateButton = false
    }
    return (
      <div>
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>{this.renderForm()}</div>

            <div className={styles.tableListOperator}>
              {showOperateButton && (
                <span>
                  {lastCar.confirm == 0 && CacheCompany.company_type == 2 && (
                    <Button type="primary" onClick={this.onCarFeeModalShow}>货车运费结算</Button>
                  )}
                  {lastCar.confirm == 1 && CacheCompany.company_type == 2 && (
                    <Button type="primary" onClick={this.onCancelCarFeeConfirmModalShow}>取消货车运费结算</Button>
                  )}
                  <Button onClick={this.onCarFeeOnlyShow}>查看货车信息</Button>
                  {lastCar.car_status < 3 && CacheCompany.company_type == 1 && (
                    <Button onClick={this.onDepark}>发车</Button>
                  )}
                  {lastCar.car_status == 3 && CacheCompany.company_type == 1 && (
                    <Button onClick={this.onCancelDepark}>取消发车</Button>
                  )}
                  {lastCar.car_status == 3 && CacheCompany.company_type != 1 && (
                    <Button onClick={this.onArrive}>到车确认</Button>
                  )}
                  {lastCar.car_status == 4 && CacheCompany.company_type != 1 && (
                    <Button onClick={this.onCancelArrive}>取消到车</Button>
                  )}
                  {selectedRows.length > 0 && CacheCompany.company_type == 1 && (
                    <Button onClick={this.onCancelEntrunk}>取消货物装车</Button>
                  )}
                </span>)}
              {showPrintButton && (
                <span>
                  <Button onClick={this.onPrintOrder}>货物清单打印</Button>
                  <Button onClick={this.onDownloadOrder}>货物清单下载</Button>
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
                    this.setState({ pageSize })
                  }
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
            />
          </div>
          {this.tableFooter()}
        </Card>
        <CreateEntrunkForm
          modalVisible={entrunkModalVisible}
          carFeeModalEditable={carFeeModalEditable}
          selectedRows={selectedRows}
          branchCompanyList={branchCompanyList}
          currentCompany={currentCompany}
          onEntrunkModalCancel={this.onEntrunkModalCancel}
          carList={carList}
          lastCar={lastCar}
          onSearch={this.handleSearch}
        />
        <CreateDepartForm
          modalVisible={departModalVisible}
          carList={carList}
          lastCar={lastCar}
          driverList={driverList}
          onOk={this.onDepartOk}
          onCancel={this.onDepartCancel}
        />
        <Spin spinning={this.state.loading} delay={100}>
          <Modal
            title="确认"
            okText="确认"
            cancelText="取消"
            visible={cancelDepartModalVisible}
            onOk={this.onCancelDepartOk}
            onCancel={this.onCancelDepartCancel}
          >
            <p>{`${currentCompany.company_name}，第 ${lastCar.car_code} 车`}</p>
            <p>您确认取消发车么？</p>
          </Modal>
        </Spin>
        <Modal
          title="确认"
          okText="确认"
          cancelText="取消"
          visible={arriveModalVisible}
          onOk={this.onArriveOk}
          onCancel={this.onArriveCancel}
        >
          <p>{`${lastCar.shipsite_name}—》${currentCompany.company_name}，第 ${lastCar.car_code} 车`}</p>
          <p>您确认该车已经抵达了么？</p>
        </Modal>
        <Modal
          title="确认"
          okText="确认"
          cancelText="取消"
          visible={cancelArriveModalVisible}
          onOk={this.onCancelArriveOk}
          onCancel={this.onCancelArriveCancel}
        >
          <p>{`${currentCompany.company_name}，第 ${lastCar.car_code} 车`}</p>
          <p>您确认取消该车抵达状态么？</p>
        </Modal>
        <Modal
          title="确认"
          okText="确认"
          cancelText="取消"
          visible={cancelEntrunkModalVisible}
          onOk={this.onCancelEntrunkOk}
          onCancel={this.onCancelEntrunkCancel}
        >
          <p>您确认要取消勾选的 {`${selectedRows.length}`}单 货物装车么？</p>
        </Modal>
      </div>
    );
  }
}

export default TableList;
