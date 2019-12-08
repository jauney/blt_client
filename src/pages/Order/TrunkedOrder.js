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
import { CacheCompany } from '@/utils/storage';

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
@connect(({ trunkedorder }) => {
  return {
    trunkedorder,
  };
})
@Form.create()
class CreateDepartForm extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }

  getModalContent = () => {
    const { lastCar, currentCompany } = this.props;

    return (
      <Form layout="inline">
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={12} sm={24}>
            {`${currentCompany.company_name}，第 ${lastCar.car_code} 车`}
          </Col>
        </Row>
      </Form>
    );
  };

  onOkHandler = e => {
    e.preventDefault();
    const { dispatch, form, onDepartModalCancel, lastCar, onSearch } = this.props;
    form.validateFields(async (err, fieldsValue) => {
      const result = await dispatch({
        type: 'trunkedorder/departCarAction',
        payload: fieldsValue,
      });

      if (result.code == 0) {
        onDepartModalCancel();
        onSearch();
      }
    });
  };

  render() {
    const { modalVisible, onDepartModalCancel } = this.props;
    return (
      <Modal
        title="发车"
        className={styles.standardListForm}
        width={640}
        destroyOnClose
        visible={modalVisible}
        onOk={this.onOkHandler}
        onCancel={onDepartModalCancel}
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
    } = this.props;

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
              })(<Input placeholder="请输入" />)}
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
@connect(({ customer, company, trunkedorder, site, car, receiver, loading }) => {
  return {
    customer,
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
    selectedRows: [],
    current: 1,
    pageSize: 20,
    entrunkModalVisible: false,
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
      title: '收获客户',
      width: '80px',
      dataIndex: 'getcustomer_name',
    },
    {
      title: '应收货款',
      width: '80px',
      dataIndex: 'order_amount',
    },
    {
      title: '实收货款',
      width: '80px',
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

    // 初始渲染的是否，先加载第一个分公司的收货人信息
    if (branchCompanyList && branchCompanyList.length > 0) {
      this.setState({
        currentCompany: branchCompanyList[0],
      });
    }

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

  /**
   * 获取订单信息
   */
  getOrderList = (data = {}, pageNo = 1) => {
    const { dispatch, form } = this.props;
    const { current, pageSize } = this.state;

    this.getLastCarInfo();
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
      this.setState({
        currentCompany: currentCompany[0],
      });
    }
    this.getLastCarInfo();
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

  getLastCarInfo = async companyId => {
    const { dispatch, form } = this.props;
    const { currentCompany = {}, currentShipSite = {} } = this.state;
    const carCode = form.getFieldValue('car_code');
    const param = {
      company_id: companyId || currentCompany.company_id,
      shipsite_id: currentShipSite.site_id,
    };
    if (carCode) {
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
    this.getOrderList();
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

  onDepartOk = async () => {
    const {
      dispatch,
      car: { lastCar },
    } = this.props;
    const { currentCompany } = this.state;
    let result = await dispatch({
      type: 'trunkedorder/updateCarStatusAction',
      payload: {
        car_id: lastCar.car_id,
        car_status: 3,
        car_code: lastCar.car_code,
        company_id: currentCompany.company_id,
      },
    });
    if (result.code == 0) {
      message.success('发车成功！');

      this.getLastCarInfo();
      this.onDepartCancel();
      this.handleSearch();
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
    let result = await dispatch({
      type: 'trunkedorder/updateCarStatusAction',
      payload: {
        car_id: lastCar.car_id,
        car_status: 2,
        car_code: lastCar.car_code,
        company_id: currentCompany.company_id,
      },
    });
    if (result.code == 0) {
      message.success('取消发车成功！');

      this.getLastCarInfo();
      this.onCancelDepartCancel();
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
    const { currentCompany } = this.state;
    let result = await dispatch({
      type: 'trunkedorder/updateCarStatusAction',
      payload: {
        car_id: lastCar.car_id,
        car_status: 4,
        car_code: lastCar.car_code,
        company_id: currentCompany.company_id,
      },
    });
    if (result.code == 0) {
      message.success('到车确认成功！');

      // 自动更新货车编号
      await dispatch({
        type: 'car/getLastCarCodeAction',
        payload: {
          company_id: currentCompany.company_id,
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
    const { currentCompany } = this.state;
    let result = await dispatch({
      type: 'trunkedorder/updateCarStatusAction',
      payload: {
        car_id: lastCar.car_id,
        car_status: 3,
        car_code: lastCar.car_code,
        company_id: currentCompany.company_id,
      },
    });
    if (result.code == 0) {
      message.success('取消到车成功！');

      // 自动更新货车编号
      await dispatch({
        type: 'car/getLastCarCodeAction',
        payload: {
          company_id: currentCompany.company_id,
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
    });
  };

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

  onEntrunkModalCancel = () => {
    // setTimeout(() => this.addBtn.blur(), 0);
    this.setState({
      entrunkModalVisible: false,
    });
  };

  tableFooter = () => {
    const {
      trunkedorder: {
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
      <div>
        <span>货款总额：{totalOrderAmount || '0'}</span>
        <span className={styles.footerSplit}>运费总额：{totalTransAmount || '0'}</span>
        <span className={styles.footerSplit}>垫付总额：{totalAdvancepayAmount || '0'}</span>
        <span className={styles.footerSplit}>送货费总额：{totalDeliverAmount || '0'}</span>
        <span className={styles.footerSplit}>保价费总额：{totalInsurancefee || '0'}</span>
      </div>
    );
  };

  renderSimpleForm() {
    const {
      form: { getFieldDecorator },
      company: { branchCompanyList },
      site: { entrunkSiteList, siteList },
      car: { lastCar = {} },
    } = this.props;

    const { currentCompany = {}, currentShipSite = {} } = this.state;
    // 默认勾选第一个公司

    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <FormItem label="分公司">
          {getFieldDecorator('company_id', { initialValue: currentCompany.company_id })(
            <Select
              placeholder="请选择"
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
            {getFieldDecorator('site_id', { initialValue: CacheSite.site_id })(
              <Select placeholder="请选择" style={{ width: '100px' }} allowClear>
                {(CacheSite.site_type != 3 ? [CacheSite] : siteList).map(ele => {
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
              placeholder="请选择"
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

  renderForm() {
    return this.renderSimpleForm();
  }

  render() {
    const {
      trunkedorder: { orderList, total, totalOrderAmount, totalTransAmount },
      company: { branchCompanyList },
      car: { carList, lastCar },
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
    } = this.state;

    return (
      <div>
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>{this.renderForm()}</div>
            <div className={styles.tableListOperator}>
              {lastCar.confirm == 0 && CacheCompany.company_type == 2 && (
                <Button type="primary" onClick={this.onCarFeeModalShow}>
                  货车运费结算
                </Button>
              )}
              {lastCar.confirm == 1 && CacheCompany.company_type == 2 && (
                <Button type="primary" onClick={this.onCancelCarFeeConfirmModalShow}>
                  取消货车运费结算
                </Button>
              )}
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
              {selectedRows.length > 0 && (
                <span>
                  {CacheCompany.company_type == 1 && (
                    <Button onClick={this.onCancelEntrunk}>取消货物装车</Button>
                  )}
                  <Button onClick={this.onPrintOrder}>货物清单打印</Button>
                  <Button onClick={this.onDownloadOrder}>货物清单下载</Button>
                </span>
              )}
            </div>
            <StandardTable
              className={styles.dataTable}
              scroll={{ x: 900, y: 350 }}
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
              footer={this.tableFooter}
            />
          </div>
        </Card>
        <CreateEntrunkForm
          modalVisible={entrunkModalVisible}
          selectedRows={selectedRows}
          branchCompanyList={branchCompanyList}
          currentCompany={currentCompany}
          onEntrunkModalCancel={this.onEntrunkModalCancel}
          carList={carList}
          lastCar={lastCar}
          onSearch={this.handleSearch}
        />
        <Modal
          title="确认"
          visible={departModalVisible}
          onOk={this.onDepartOk}
          onCancel={this.onDepartCancel}
        >
          <p>{`${currentCompany.company_name}，第 ${lastCar.car_code} 车`}</p>
          <p>{`车牌号：${lastCar.driver_plate}      司机姓名： ${lastCar.driver_name} `}</p>
          <p>{`司机电话：${lastCar.driver_mobile}   司机运费： ${lastCar.car_fee} `}</p>
          <p>您确认发车么？</p>
        </Modal>
        <Modal
          title="确认"
          visible={cancelDepartModalVisible}
          onOk={this.onCancelDepartOk}
          onCancel={this.onCancelDepartCancel}
        >
          <p>{`${currentCompany.company_name}，第 ${lastCar.car_code} 车`}</p>
          <p>您确认取消发车么？</p>
        </Modal>
        <Modal
          title="确认"
          visible={arriveModalVisible}
          onOk={this.onArriveOk}
          onCancel={this.onArriveCancel}
        >
          <p>{`${currentCompany.company_name}，第 ${lastCar.car_code} 车`}</p>
          <p>您确认该车已经抵达了么？</p>
        </Modal>
        <Modal
          title="确认"
          visible={cancelArriveModalVisible}
          onOk={this.onCancelArriveOk}
          onCancel={this.onCancelArriveCancel}
        >
          <p>{`${currentCompany.company_name}，第 ${lastCar.car_code} 车`}</p>
          <p>您确认取消该车抵达状态么？</p>
        </Modal>
        <Modal
          title="确认"
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
