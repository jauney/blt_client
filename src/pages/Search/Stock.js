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
import { locale } from '@/utils'
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
      sorter: true,
    },
    {
      title: '类型项目',
      dataIndex: 'account_name',
    },
    {
      title: '金额',
      dataIndex: 'account_amount',
      sorter: true,
    },
    {
      title: '用户名',
      dataIndex: 'operator_name',
      sorter: true,
    },
    {
      title: '站点',
      dataIndex: 'site_name',
      sorter: true,
    },
    {
      title: '分公司',
      dataIndex: 'company_name',
      sorter: true,
    },
    {
      title: '日期',
      dataIndex: 'account_date',
      render: val => (
        <span>{(val && moment(val).format('YYYY-MM-DD HH:mm:ss')) || ''}</span>
      ),
    },
  ];

  async componentDidMount () {
    const { dispatch } = this.props;
    this.fetchCompanySiteList();
    this.fetchOperatorList();
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
    dispatch({
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
    dispatch({
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

  onCompanySelect = async (value, option) => { };

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
      fieldsValue.company_id = CacheCompany.company_id;
      if (fieldsValue.account_date && fieldsValue.account_date.valueOf) {
        fieldsValue.account_date = [
          `${new Date(0).getTime()}`,
          `${fieldsValue.account_date.valueOf()}`,
        ];
      }
      const searchParams = Object.assign({ filter: fieldsValue }, data);

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
  onRowClick = (record, index, event) => { };

  tableFooter = () => {
    const {
      search: { totalAccount, totalIncomeAccount, totalExpenseAccount },
    } = this.props;
    return (
      <div>
        <span>库存总额：{totalAccount || ''}</span>
        <span className={styles.footerSplit}>收入总额：{totalIncomeAccount || ''}</span>
        <span className={styles.footerSplit}>支出总额：{totalExpenseAccount || ''}</span>
      </div>
    );
  };

  renderSimpleForm () {
    const {
      form: { getFieldDecorator },
      site: { siteList = [], normalSiteList = [] },
      courier: { operatorList = [] },
    } = this.props;

    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        {CacheCompany.company_type == 1 && (
          <FormItem label="站点">
            {getFieldDecorator('site_id', {})(
              <Select placeholder="全部" style={{ width: '150px' }} allowClear>
                {siteList.map(ele => {
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

        <FormItem label="日期">
          {getFieldDecorator('account_date', {
            rules: [{ required: true, message: '请填写日期' }],
            initialValue: moment(new Date().getTime()),
          })(<DatePicker placeholder="请填写日期" locale={locale} format="YYYY-MM-DD" style={{ width: '100%' }} />)}
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
      search: { accounts, accountTotal },
      loading,
    } = this.props;

    const { selectedRows, current, pageSize } = this.state;

    return (
      <div>
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>{this.renderForm()}</div>
            {this.tableFooter()}
          </div>
        </Card>
      </div>
    );
  }
}

export default TableList;
