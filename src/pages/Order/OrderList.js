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
const { RangePicker } = DatePicker;

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
@connect(({ customer, company, orderlist, site, car, receiver, loading }) => {
  return {
    customer,
    company,
    orderlist,
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
    formValues: {},
    current: 1,
    pageSize: 20,
    departModalVisible: false,
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
      width: 60,
      dataIndex: 'order_real',
      sorter: true,
    },
    {
      title: '实收运费',
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
      dataIndex: 'order_name',
      sorter: true,
    },
    {
      title: '录票时间',
      width: 60,
      dataIndex: 'create_date',
      render: val => <span>{val ? moment(Number(val)).format('YYYY-MM-DD HH:mm:ss') : ''}</span>,
    },
    {
      title: '发车时间',
      width: 80,
      dataIndex: 'depart_date',
      render: val => <span>{val ? moment(Number(val)).format('YYYY-MM-DD HH:mm:ss') : ''}</span>,
    },
    {
      title: '站点',
      width: 60,
      dataIndex: 'site_name',
      sorter: true,
    },
    {
      title: '结算日期',
      width: 80,
      dataIndex: 'settle_date',
      render: val => <span>{val ? moment(Number(val)).format('YYYY-MM-DD') : ''}</span>,
    },
    {
      title: '付款日期',
      width: 80,
      dataIndex: 'pay_date',
      render: val => <span>{val ? moment(Number(val)).format('YYYY-MM-DD') : ''}</span>,
    },
    {
      title: '滞纳金',
      width: 60,
      dataIndex: 'late_fee',
    },
    {
      title: '奖励金',
      width: 60,
      dataIndex: 'bonus_amount',
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

    // 页面初始化获取一次订单信息，否则会显示其他页面的缓存信息
    this.getOrderList();
  }

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

    this.getOrderList();
  };

  /**
   * 获取订单信息
   */
  getOrderList = (data = {}, pageNo = 1) => {
    const { dispatch, form } = this.props;
    const { current, pageSize } = this.state;
    let searchParams = {};
    form.validateFields((err, fieldsValue) => {
      if (err) return;

      const filter = {};
      if (fieldsValue.company_id) {
        filter.company_id = fieldsValue.company_id;
      }

      if (fieldsValue.site_id) {
        filter.site_id = fieldsValue.site_id;
      }

      if (fieldsValue.shipsite_id) {
        filter.shipsite_id = fieldsValue.shipsite_id;
      }

      if (fieldsValue.abnormal_status) {
        filter.abnormal_status = fieldsValue.abnormal_status;
      }

      if (fieldsValue.create_date) {
        filter.create_date = [`${fieldsValue.create_date.valueOf()}`];
      }

      if (fieldsValue.entrunk_date && fieldsValue.entrunk_date.length > 0) {
        filter.entrunk_date = fieldsValue.entrunk_date.map(item => {
          return `${item.valueOf()}`;
        });
      }

      filter.order_status = [3, 10];
      searchParams = filter;
      searchParams = Object.assign({ filter: searchParams }, data);
      dispatch({
        type: 'orderlist/getOrderListAction',
        payload: { pageNo: pageNo || current, pageSize, ...searchParams },
      });

      dispatch({
        type: 'orderlist/getOrderStatisticAction',
        payload: { ...searchParams },
      });
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
              style={{ width: '150px' }}
              allowClear
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

        <FormItem label="异常状态">
          {getFieldDecorator('abnormal_status')(
            <Select placeholder="请选择" style={{ width: '150px' }} allowClear>
              <Option value="1">异常</Option>
            </Select>
          )}
        </FormItem>
        <FormItem label="录入日期">
          {getFieldDecorator('create_date', {
            initialValue: moment(new Date().getTime()),
          })(<DatePicker placeholder="请选择" format="YYYY-MM-DD" style={{ width: '150px' }} />)}
        </FormItem>

        <FormItem label="托运日期">
          {getFieldDecorator('entrunk_date', {})(<RangePicker style={{ width: '250px' }} />)}
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
      orderlist: { orderList, total, totalOrderAmount, totalTransAmount },
      loading,
    } = this.props;

    const { selectedRows, current, pageSize, currentCompany, departModalVisible } = this.state;

    return (
      <div>
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>{this.renderForm()}</div>
            <div className={styles.tableListOperator}>
              {selectedRows.length > 0 && (
                <span>
                  <Button onClick={this.onDownloadOrder}>货物清单下载</Button>
                </span>
              )}
            </div>
            <StandardTable
              className={styles.dataTable}
              scroll={{ x: 900 }}
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

        <Modal
          title="确认"
          visible={departModalVisible}
          onOk={this.onDepartOk}
          onCancel={this.onDepartCancel}
        >
          <p />
          <p>您确认发车么？</p>
        </Modal>
      </div>
    );
  }
}

export default TableList;
