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
import OrderEditForm from '@/components/EditOrderForm';
import styles from './Search.less';
import { async } from 'q';
import { CacheSite, CacheUser, CacheCompany, CacheRole } from '../../utils/storage';

const FormItem = Form.Item;
const { Option } = Select;

/* eslint react/no-multi-comp:0 */
@connect(({ customer, company, courier, site, search, receiver, loading }) => {
  return {
    customer,
    company,
    courier,
    site,
    search,
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
    updateOrderModalVisible: false,
    settleModalVisible: false,
    downModalVisible: false,
    signModalVisible: false,
    cancelDownAccountModalVisible: false,
    downloadModalVisible: false,
    printModalVisible: false,
    currentCompany: {},
  };

  columns = [
    {
      title: '收支',
      dataIndex: 'account_type',
      width: '80px',
      render: val => {
        return val == 0 ? '支出' : '收入';
      },
    },
    {
      title: '类型项目',
      dataIndex: 'account_name',
      width: '150px',
    },
    {
      title: '原因',
      dataIndex: 'account_reason',
      width: '100px',
    },
    {
      title: '金额',
      dataIndex: 'account_amount',
      width: '80px',
    },
    {
      title: '用户名',
      dataIndex: 'operator_name',
      width: '80px',
    },
    {
      title: '站点',
      dataIndex: 'site_name',
      width: '100px',
    },
    {
      title: '分公司',
      dataIndex: 'company_name',
      width: '80px',
    },
    {
      title: '日期',
      dataIndex: 'account_date',
      width: '170px',
      render: val => (
        <span>{(val && moment(Number(val || 0)).format('YYYY-MM-DD HH:mm:ss')) || ''}</span>
      ),
    },
  ];

  async componentDidMount() {
    const { dispatch } = this.props;
    await this.fetchCompanySiteList();
    await this.fetchOperatorList();
    // 页面初始化获取一次订单信息，否则会显示其他页面的缓存信息
    this.getOrderList();
  }

  handleSelectRows = rows => {
    this.setState({
      selectedRows: rows,
    });
  };

  fetchCompanySiteList = async () => {
    const { dispatch } = this.props;
    await dispatch({
      type: 'site/getSiteListAction',
      payload: { pageNo: 1, pageSize: 100, filter: { company_id: CacheCompany.company_id } },
    });
  };

  fetchOperatorList = async companyId => {
    const { dispatch } = this.props;
    const { currentSite } = this.state;
    const filter = {};
    filter.company_id = CacheCompany.company_id;

    if (currentSite && currentSite.site_id) {
      filter.site_id = currentSite.site_id;
    }
    await dispatch({
      type: 'courier/getOperatorListAction',
      payload: {
        pageNo: 1,
        pageSize: 100,
        filter,
      },
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

  onCompanySelect = async (value, option) => {};

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
      if (fieldsValue.account_date && fieldsValue.account_date.valueOf) {
        fieldsValue.account_date = [`${fieldsValue.account_date.valueOf()}`];
      }
      fieldsValue.company_id = CacheCompany.company_id;
      if (CacheCompany.company_type == 1) {
        fieldsValue.site_id = CacheSite.site_id;
      }
      const searchParams = Object.assign({ filter: fieldsValue }, data);
      dispatch({
        type: 'search/getTodayAccountListAction',
        payload: { pageNo: pageNo || current, pageSize, ...searchParams },
      });

      dispatch({
        type: 'search/getTodayAccountStatisticAction',
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

  // 编辑订单信息
  onRowDoubleClick = (record, index, event) => {
    this.setState({
      record,
    });
  };

  // 已结算账目核对中，计算付款日期
  onRowClick = (record, index, event) => {};

  tableFooter = () => {
    const {
      search: { totalAccount, totalIncomeAccount, totalExpenseAccount },
    } = this.props;
    return (
      <div>
        <span>总额：{totalAccount || ''}</span>
        <span className={styles.footerSplit}>收入总额：{totalIncomeAccount || ''}</span>
        <span className={styles.footerSplit}>支出总额：{totalExpenseAccount || ''}</span>
      </div>
    );
  };

  renderSimpleForm() {
    const {
      form: { getFieldDecorator },
      site: { siteList = [], normalSiteList = [] },
      courier: { operatorList = [] },
    } = this.props;
    const companyOption = { initialValue: CacheCompany.company_id || '' };

    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        {CacheCompany.company_type == 2 && (
          <FormItem label="分公司">
            {getFieldDecorator('company_id', companyOption)(
              <Select
                placeholder="请选择"
                onSelect={this.onCompanySelect}
                style={{ width: '200px' }}
              >
                {[CacheCompany].map(ele => {
                  return (
                    <Option key={ele.company_id} value={ele.company_id}>
                      {ele.company_name}
                    </Option>
                  );
                })}
              </Select>
            )}
          </FormItem>
        )}
        {CacheCompany.company_type == 1 && (
          <FormItem label="站点">
            {getFieldDecorator('site_id', { initialValue: CacheSite.site_id })(
              <Select placeholder="请选择" style={{ width: '150px' }}>
                {[CacheSite].map(ele => {
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
        <FormItem label="经办人">
          {getFieldDecorator('operator_id', {})(
            <Select placeholder="请选择" style={{ width: '150px' }} allowClear>
              {operatorList.map(ele => {
                return (
                  <Option key={ele.user_id} value={ele.user_id}>
                    {ele.user_name}
                  </Option>
                );
              })}
            </Select>
          )}
        </FormItem>
        <FormItem label="日期">
          {getFieldDecorator('account_date', {
            rules: [{ required: true, message: '请填写日期' }],
            initialValue: moment(new Date().getTime()),
          })(<DatePicker placeholder="请选择" format="YYYY-MM-DD" style={{ width: '100%' }} />)}
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
      search: { accounts, accountTotal },
      loading,
    } = this.props;

    const { selectedRows, current, pageSize } = this.state;

    return (
      <div>
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>{this.renderForm()}</div>
            <StandardTable
              selectedRows={selectedRows}
              loading={loading}
              className={styles.dataTable}
              scroll={{ x: 900, y: 350 }}
              rowKey="account_id"
              data={{
                list: accounts,
                pagination: {
                  total: accountTotal,
                  pageSize,
                  current,
                  onShowSizeChange: (currentPage, pageSize)=>{
                    this.setState({pageSize})
                  },
                },
              }}
              columns={this.columns}
              onSelectRow={this.handleSelectRows}
              onChange={this.handleStandardTableChange}
              onClickHander={this.onRowClick}
              onDoubleClickHander={this.onRowDoubleClick}
              footer={this.tableFooter}
            />
          </div>
        </Card>
      </div>
    );
  }
}

export default TableList;
