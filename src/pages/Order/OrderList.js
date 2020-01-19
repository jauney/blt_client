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
    currentShipSite: {},
  };

  columns = [
    {
      title: '货单号',
      width: '80px',
      dataIndex: 'order_code',
      sorter: true,
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
      dataIndex: 'order_real',
    },
    {
      title: '折后运费',
      width: '80px',
      sorter: true,
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
      render: val => <span>{val ? moment(Number(val)).format('YYYY-MM-DD HH:mm:ss') : ''}</span>,
    },
    {
      title: '站点',
      width: '80px',
      dataIndex: 'site_name',
    },
    {
      title: '分公司',
      width: '80px',
      dataIndex: 'company_name',
    },
    {
      title: '结算日期',
      width: '100px',
      dataIndex: 'settle_date',
      render: val => <span>{val ? moment(Number(val)).format('YYYY-MM-DD') : ''}</span>,
    },
    {
      title: '付款日期',
      width: '100px',
      dataIndex: 'pay_date',
      render: val => <span>{val ? moment(Number(val)).format('YYYY-MM-DD') : ''}</span>,
    },
    {
      title: '滞纳金',
      width: '80px',
      dataIndex: 'late_fee',
    },
    {
      title: '奖励金',
      width: '80px',
      dataIndex: 'bonus_amount',
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

    this.getLastCarInfo();
    // 页面初始化获取一次订单信息，否则会显示其他页面的缓存信息
    this.getOrderList();
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

  getLastCarInfo = async () => {
    const { dispatch } = this.props;
    const { currentCompany = {}, currentShipSite = {} } = this.state;
    const carInfo = await dispatch({
      type: 'car/getLastCarCodeAction',
      payload: {
        company_id: currentCompany.company_id,
        shipsite_id: currentShipSite.site_id,
      },
    });

    return carInfo;
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

    // 自动更新货车编号
    await this.getLastCarInfo();
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

  handleSearch = e => {
    e && e.preventDefault();

    const { dispatch, form } = this.props;
    const { currentCompany } = this.state;

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

      const filter = fieldsValue;
      Object.keys(filter).forEach(item => {
        if (!filter[item]) {
          delete filter[item];
        }
      });

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
    this.getLastCarInfo();
  };

  tableFooter = () => {
    const {
      orderlist: {
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
      car: { lastCar },
    } = this.props;
    return (
      <div className={styles.tableFooter}>
        <span>货款总额：{totalOrderAmount || '0'}</span>
        <span className={styles.footerSplit}>实收货款：{totalRealOrderAmount || '0'}</span>
        <span className={styles.footerSplit}>运费总额：{totalTransAmount || '0'}</span>
        <span className={styles.footerSplit}>提付运费：{totalTifuTransAmount || '0'}</span>
        <span className={styles.footerSplit}>西安运费：{totalXianTransAmount || '0'}</span>
        <span className={styles.footerSplit}>垫付运费：{totalAdvancepayAmount || '0'}</span>
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
      company: { branchCompanyList },
      site: { entrunkSiteList, siteList },
      car: { lastCar },
    } = this.props;
    const { currentCompany = {}, currentShipSite = {} } = this.state;
    const companyOption = {};
    // 默认勾选第一个公司
    companyOption.initialValue =
      CacheCompany.company_type == 1 ? currentCompany.company_id || '' : CacheCompany.company_id;

    let allowClearSite = true
    let siteSelectList = siteList
    let siteOption = {}
    if (CacheSite.site_type != 3 || CacheCompany.company_type == 2) {
      siteOption.initialValue = CacheSite.site_id;
      allowClearSite = false
      siteSelectList = [CacheSite]
    }

    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <FormItem label="分公司">
          {getFieldDecorator('company_id', companyOption)(
            <Select
              placeholder="请选择"
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
        {CacheCompany.company_type == 1 && (
          <FormItem label="站点">
            {getFieldDecorator('site_id', siteOption)(
              <Select placeholder="请选择" style={{ width: '100px' }} allowClear={allowClearSite}>
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
              placeholder="请选择"
              style={{ width: '100px' }}
              onSelect={this.onShipSiteSelect}
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
        <FormItem label="录入日期">
          {getFieldDecorator('create_date', {
            initialValue: moment(new Date().getTime()),
          })(<DatePicker placeholder="请选择" format="YYYY-MM-DD" style={{ width: '130px' }} />)}
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

        <Modal
          title="确认"
          okText="确认"
          cancelText="取消"
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
