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

import styles from './OrderList.less';
import { element } from 'prop-types';
import { async } from 'q';

const FormItem = Form.Item;
const { Step } = Steps;
const { TextArea } = Input;
const { Option } = Select;
const RadioGroup = Radio.Group;
const getValue = obj =>
  Object.keys(obj)
    .map(key => obj[key])
    .join(',');

const CacheSite = JSON.parse(localStorage.getItem('site') || '{}');
const CacheUser = JSON.parse(localStorage.getItem('user') || '{}');

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
                <Select placeholder="请选择" style={{ width: '150px' }}>
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
    this.state = {};
  }

  onCompanySelect = (value, option) => {
    const { dispatch, form } = this.props;
    dispatch({
      type: 'car/getCarListAction',
      payload: {
        pageNo: 1,
        pageSize: 500,
        company_id: value,
      },
    });
    // 清空勾选的货车信息
    form.resetFields(['car_id', 'driver_name', 'driver_mobile', 'car_code', 'car_date', 'car_fee']);

    // 重新获取货车编号
    dispatch({
      type: 'car/getLastCarCodeAction',
      payload: {
        company_id: value,
      },
    });
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
        driver_plate: currentDriver.driver_plate,
        driver_name: currentDriver.driver_name,
        driver_mobile: currentDriver.driver_mobile,
      });
    }
  };

  // 渲染autocomplete的option
  renderCustomerOption = item => {
    const AutoOption = AutoComplete.Option;
    return (
      <AutoOption key={item.driver_id} driverid={item.driver_id} text={item.driver_plate}>
        {item.driver_plate}
      </AutoOption>
    );
  };

  getModalContent = () => {
    const {
      form: { getFieldDecorator },
      branchCompanyList,
      currentCompany,
      driverList,
      lastCar,
    } = this.props;

    return (
      <Form layout="inline">
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={12} sm={24}>
            <FormItem label="分公司">
              {getFieldDecorator('company_id', {
                rules: [{ required: true, message: '请选择分公司' }],
                initialValue: currentCompany.company_id,
              })(
                <Select
                  placeholder="请选择"
                  onSelect={this.onCompanySelect}
                  style={{ width: '100%' }}
                >
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
          </Col>
          <Col md={12} sm={24}>
            <FormItem label="车牌号">
              {getFieldDecorator('driver_id', {
                rules: [{ required: true, message: '请填写收车牌号' }],
              })(
                <AutoComplete
                  size="large"
                  style={{ width: '100%' }}
                  dataSource={driverList.map(this.renderCustomerOption)}
                  onSelect={this.onCarSelect}
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
              })(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
          <Col md={12} sm={24}>
            <FormItem label="联系电话">
              {getFieldDecorator('driver_mobile', {
                rules: [{ required: true, message: '请填写联系电话' }],
              })(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
          <Col md={12} sm={24}>
            <FormItem label="货车编号">
              {getFieldDecorator('car_code', {
                initialValue: lastCar.order_status > 2 ? lastCar.car_code + 1 : lastCar.car_code,
                rules: [{ required: true, message: '请填写货车编号' }],
              })(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
          <Col md={12} sm={24}>
            <FormItem label="拉货日期">
              {getFieldDecorator('car_date', {
                rules: [{ required: true, message: '请填写拉货日期' }],
                initialValue: moment(new Date().getTime()),
              })(<DatePicker placeholder="请选择" format="YYYY-MM-DD" style={{ width: '100%' }} />)}
            </FormItem>
          </Col>
          <Col md={12} sm={24}>
            <FormItem label="货车费用">
              {getFieldDecorator('car_fee', {
                rules: [{ required: true, message: '请填写货车费用' }],
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
    } = this.props;
    form.validateFields(async (err, fieldsValue) => {
      if (err) return;
      const orderIds = selectedRows.map(item => {
        return item.order_id;
      });
      if (fieldsValue.car_date && fieldsValue.car_date.valueOf) {
        fieldsValue.car_date = fieldsValue.car_date.valueOf() + '';
      }
      const drivers = driverList.filter(item => {
        if (item.driver_id == fieldsValue.driver_id) {
          return item;
        }
      });

      if (drivers.length <= 0) {
        fieldsValue.driver_plate = fieldsValue.driver_id;
        fieldsValue.driver_id = 0;
      } else {
        fieldsValue.driver_plate = drivers[0].driver_plate;
        fieldsValue.driver_id = Number(fieldsValue.driver_id);
      }

      fieldsValue.car_fee = Number(fieldsValue.car_fee || 0);
      fieldsValue.shipsite_id = CacheSite.site_id;

      console.log(fieldsValue);
      const result = await dispatch({
        type: 'untrunkorder/entrunkOrderAction',
        payload: { order_id: orderIds, car: fieldsValue },
      });

      if (result.code == 0) {
        onSearch();
        onEntrunkModalCancel();
      }
    });
  };

  render() {
    const { modalVisible, onEntrunkModalCancel } = this.props;
    return (
      <Modal
        title="货物装车"
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
    formValues: {},
    current: 1,
    pageSize: 20,
    receiverModalVisible: false,
    entrunkModalVisible: false,
    cancelShipModalVisible: false,
    currentCompany: {},
  };

  columns = [
    {
      title: '分公司',
      dataIndex: 'company_name',
    },
    {
      title: '录票时间',
      dataIndex: 'create_date',
      render: val => <span>{moment(Number(val || 0)).format('YYYY-MM-DD HH:mm:ss')}</span>,
    },
    {
      title: '货单号',
      dataIndex: 'order_code',
      sorter: true,
      align: 'right',
      render: val => `${val}`,
      // mark to display a total number
      needTotal: true,
    },
    {
      title: '发货客户',
      dataIndex: 'sendcustomer_name',
    },
    {
      title: '收获客户',
      dataIndex: 'getcustomer_name',
      sorter: true,
    },
    {
      title: '应收货款',
      dataIndex: 'order_amount',
      sorter: true,
    },
    {
      title: '运费',
      dataIndex: 'trans_amount',
      sorter: true,
    },
    {
      title: '折后运费',
      dataIndex: 'trans_discount',
      sorter: true,
    },
    {
      title: '运费方式',
      dataIndex: 'trans_type',
      sorter: true,
      render: val => `${val == 1 ? '现付' : '回付'}`,
    },
    {
      title: '垫付',
      dataIndex: 'order_advancepay_amount',
      sorter: true,
    },
    {
      title: '送货费',
      dataIndex: 'deliver_amount',
      sorter: true,
    },
    {
      title: '保价费',
      dataIndex: 'insurance_fee',
      sorter: true,
    },
    {
      title: '货物名称',
      dataIndex: 'order_name',
      sorter: true,
    },
    {
      title: '经办人',
      dataIndex: 'operator_name',
      sorter: true,
    },
    {
      title: '接货人',
      dataIndex: 'receiver_name',
      sorter: true,
    },
    {
      title: '装配站',
      dataIndex: 'shipsite_name',
      sorter: true,
    },
    {
      title: '站点',
      dataIndex: 'site_name',
      sorter: true,
    },
    {
      title: '中转',
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

    const branchCompanyList = await dispatch({
      type: 'company/getCompanyList',
      payload: {},
    });

    dispatch({
      type: 'site/getSiteListAction',
      payload: {},
    });

    dispatch({
      type: 'customer/sendCustomerListAction',
      payload: { pageNo: 1, pageSize: 100 },
    });

    dispatch({
      type: 'receiver/getReceiverListAction',
      payload: { pageNo: 1, pageSize: 100, type: 1, filter: {} },
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

      dispatch({
        type: 'driver/getDriverListAction',
        payload: {
          pageNo: 1,
          pageSize: 500,
          company_id: branchCompanyList[0].company_id,
        },
      });

      dispatch({
        type: 'car/getCarCodeAction',
        payload: {
          company_id: branchCompanyList[0].company_id,
        },
      });
    }
  }

  handleStandardTableChange = (pagination, filtersArg, sorter) => {
    const { dispatch } = this.props;
    const { formValues } = this.state;

    const filters = Object.keys(filtersArg).reduce((obj, key) => {
      const newObj = { ...obj };
      newObj[key] = getValue(filtersArg[key]);
      return newObj;
    }, {});

    const params = {
      currentPage: pagination.current,
      pageSize: pagination.pageSize,
      ...formValues,
      ...filters,
    };
    if (sorter.field) {
      params.sorter = `${sorter.field}_${sorter.order}`;
    }

    dispatch({
      type: 'rule/fetch',
      payload: params,
    });
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

  handleSearch = e => {
    e && e.preventDefault();

    const {
      dispatch,
      form,
      company: { branchCompanyList },
    } = this.props;

    form.validateFields((err, fieldsValue) => {
      if (err) return;

      const values = {
        ...fieldsValue,
        updatedAt: fieldsValue.updatedAt && fieldsValue.updatedAt.valueOf(),
      };

      const currentCompany = branchCompanyList.filter(item => {
        if (item.company_id == fieldsValue.company_id) {
          return item;
        }
      });
      if (currentCompany.length > 0) {
        this.setState({
          currentCompany: currentCompany[0],
        });
      }
      this.setState({
        formValues: values,
      });

      dispatch({
        type: 'untrunkorder/getOrderListAction',
        payload: { pageNo: 1, pageSize: 20, filter: values },
      });

      dispatch({
        type: 'untrunkorder/getSiteOrderStatisticAction',
        payload: { company_id: fieldsValue.company_id, site_id: fieldsValue.site_id },
      });
    });
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

  renderSimpleForm() {
    const {
      form: { getFieldDecorator },
      company: { branchCompanyList },
      site: { entrunkSiteList, normalSiteList },
      receiver: { receiverList },
    } = this.props;
    const companyOption = {};
    // 默认勾选第一个公司
    if (branchCompanyList.length > 0) {
      companyOption.initialValue = branchCompanyList[0].company_id || '';
    }
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={8} sm={24}>
            <FormItem label="分公司">
              {getFieldDecorator('company_id', companyOption)(
                <Select
                  placeholder="请选择"
                  onSelect={this.onCompanySelect}
                  style={{ width: '100%' }}
                >
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
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="站点">
              {getFieldDecorator('site_id', { initialValue: CacheSite.site_id })(
                <Select placeholder="请选择" style={{ width: '100%' }}>
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
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="配载部">
              {getFieldDecorator('shipsite_id', {})(
                <Select placeholder="请选择" style={{ width: '150px' }}>
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
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="接货人">
              {getFieldDecorator('receiver_id', {})(
                <Select placeholder="请选择" style={{ width: '150px' }}>
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
          <Col md={8} sm={24}>
            <span className={styles.submitButtons}>
              <Button type="primary" htmlType="submit">
                查询
              </Button>
            </span>
          </Col>
        </Row>
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
      car: { carCode },
      driver: { driverList },
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
    } = this.state;

    return (
      <div>
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>{this.renderForm()}</div>
            <div className={styles.tableListOperator}>
              {selectedRows.length > 0 && (
                <span>
                  <Button onClick={this.onCancelShip}>取消装回</Button>
                  <Button onClick={this.onReceiverModalShow}>更改接货人</Button>
                  <Button onClick={this.onEntrunkModalShow}>装车</Button>
                  <Button onClick={this.onPrintOrder}>打印清单</Button>
                  <Button onClick={this.onDownloadOrder}>下载清单</Button>
                </span>
              )}
            </div>
            <StandardTable
              selectedRows={selectedRows}
              loading={loading}
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
              footer={() => `货款总额：${totalOrderAmount}   运费总额：${totalTransAmount}`}
            />
          </div>
        </Card>
        <CreateEntrunkForm
          modalVisible={entrunkModalVisible}
          selectedRows={selectedRows}
          branchCompanyList={branchCompanyList}
          currentCompany={currentCompany}
          onEntrunkModalCancel={this.onEntrunkModalCancel}
          driverList={driverList}
          lastCar={carCode}
          onSearch={this.handleSearch}
        />
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
