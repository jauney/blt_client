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
      const result = await dispatch({
        type: 'trunkedorder/updateCarFeeAction',
        payload: Object.assign(lastCar, fieldsValue),
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
  };

  columns = [
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
      title: '实收货款',
      dataIndex: 'order_real',
      sorter: true,
    },
    {
      title: '实收运费',
      dataIndex: 'trans_real',
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
      title: '录票时间',
      dataIndex: 'create_date',
      render: val => <span>{moment(Number(val || 0)).format('YYYY-MM-DD HH:mm:ss')}</span>,
    },
    {
      title: '发车时间',
      dataIndex: 'depart_date',
      render: val => <span>{moment(Number(val || 0)).format('YYYY-MM-DD HH:mm:ss')}</span>,
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

    // 初始渲染的是否，先加载第一个分公司的收货人信息
    if (branchCompanyList && branchCompanyList.length > 0) {
      this.setState({
        currentCompany: branchCompanyList[0],
      });

      await dispatch({
        type: 'car/getLastCarCodeAction',
        payload: {
          company_id: branchCompanyList[0].company_id,
        },
      });
    }
  }

  /**
   * 获取订单信息
   */
  getOrderList = (data, pageNo) => {
    const { dispatch } = this.props;
    const { current, pageSize } = this.state;
    dispatch({
      type: 'trunkedorder/getOrderListAction',
      payload: { pageNo: pageNo || current, pageSize, ...data },
    });

    dispatch({
      type: 'trunkedorder/getSiteOrderStatisticAction',
      payload: { ...data },
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
      car: { lastCar },
    } = this.props;

    // 自动更新货车编号
    const carInfo = await dispatch({
      type: 'car/getLastCarCodeAction',
      payload: {
        company_id: value,
      },
    });
    console.log(carInfo);
    form.setFieldsValue({
      car_code: carInfo.car_code,
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
  };

  handleSearch = e => {
    e && e.preventDefault();

    const { dispatch, form } = this.props;
    const { currentCompany } = this.state;

    // 获取当前货车编号信息
    dispatch({
      type: 'car/getLastCarCodeAction',
      payload: {
        company_id: currentCompany.company_id,
        car_code: form.getFieldValue('car_code') || '',
      },
    });

    form.validateFields((err, fieldsValue) => {
      if (err) return;

      const values = {
        ...fieldsValue,
        updatedAt: fieldsValue.updatedAt && fieldsValue.updatedAt.valueOf(),
      };

      this.getOrderList({ filter: values }, 1);
    });
  };

  // 取消装车
  onCancelEntrunkOk = async () => {
    const {
      dispatch,
      selectedRows,
      car: { lastCar },
    } = this.props;
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

      // 自动更新货车编号
      await dispatch({
        type: 'car/getLastCarCodeAction',
        payload: {
          company_id: currentCompany.company_id,
        },
      });
      this.onDepartCancel();
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

      // 自动更新货车编号
      await dispatch({
        type: 'car/getLastCarCodeAction',
        payload: {
          company_id: currentCompany.company_id,
        },
      });
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

  renderSimpleForm() {
    const {
      form: { getFieldDecorator },
      company: { branchCompanyList },
      site: { entrunkSiteList, normalSiteList },
      car: { lastCar },
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
            <Select
              placeholder="请选择"
              onSelect={this.onCompanySelect}
              allowClear
              style={{ width: '150px' }}
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
        <FormItem label="站点">
          {getFieldDecorator('site_id', { initialValue: CacheSite.site_id })(
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

        <FormItem label="配载部">
          {getFieldDecorator('shipsite_id', {})(
            <Select placeholder="请选择" style={{ width: '150px' }} allowClear>
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
              <Button type="primary" onClick={this.onEntrunkModalShow}>
                货车运费结算
              </Button>
              {lastCar.car_status < 3 && <Button onClick={this.onDepark}>发车</Button>}
              {lastCar.car_status == 3 && <Button onClick={this.onCancelDepark}>取消发车</Button>}
              {lastCar.car_status == 3 && <Button onClick={this.onArrive}>到车确认</Button>}
              {lastCar.car_status == 4 && <Button onClick={this.onCancelArrive}>取消到车</Button>}
              {selectedRows.length > 0 && (
                <span>
                  <Button onClick={this.onCancelEntrunk}>取消货物装车</Button>
                  <Button onClick={this.onPrintOrder}>货物清单打印</Button>
                  <Button onClick={this.onDownloadOrder}>货物清单下载</Button>
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
