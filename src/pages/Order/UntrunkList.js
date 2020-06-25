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
import { CacheSite, CacheUser, CacheCompany, CacheRole } from '@/utils/storage';
import { async } from 'q';
import { printOrder, printPayOrder, printDownLoad } from '@/utils/print';
import { locale } from '@/utils';
const FormItem = Form.Item;
const { Option } = Select;

/* eslint react/no-multi-comp:0 */
@connect(({ customer, company, order, site, receiver, loading }) => {
  return {
    customer,
    company,
    site,
    order,
    receiver,
    loading: loading.models.rule,
  };
})
@Form.create()
class TableList extends PureComponent {
  state = {
    modalVisible: false,
    selectedRows: [],
    formValues: {},
    current: 1,
    pageSize: 20,
    entrunkModalVisible: false,
    btnSearchClicked: false,
  };

  columns = [
    {
      title: '分公司',
      width: '60px',
      dataIndex: 'company_name',
      sorter: true,
    },
    {
      title: '录票时间',
      width: '170px',
      dataIndex: 'create_date',
      sorter: true,
      render: val => <span>{moment(val).format('YYYY-MM-DD HH:mm:ss')}</span>,
    },
    {
      title: '货单号',
      width: '70px',
      dataIndex: 'order_code',
      sorter: true,
      align: 'right',
      render: val => `${val}`,
      // mark to display a total number
      needTotal: true,
    },
    {
      sorter: true,
      title: '发货客户',
      width: '80px',
      dataIndex: 'sendcustomer_name',
    },
    {
      sorter: true,
      title: '收货客户',
      width: '80px',
      dataIndex: 'getcustomer_name',
    },
    {
      sorter: true,
      title: '应收货款',
      width: '80px',
      dataIndex: 'order_amount',
    },
    {
      sorter: true,
      title: '运费',
      width: '80px',
      dataIndex: 'trans_amount',
    },
    {
      sorter: true,
      title: '折后运费',
      width: '80px',
      dataIndex: 'trans_discount',
    },
    {
      title: '运费方式',
      width: '60px',
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
      sorter: true,
      title: '垫付',
      width: '80px',
      dataIndex: 'order_advancepay_amount',
    },
    {
      sorter: true,
      title: '送货费',
      width: '80px',
      dataIndex: 'deliver_amount',
    },
    {
      sorter: true,
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
      sorter: true,
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

  async componentDidMount() {
    const { dispatch } = this.props;

    const branchCompanyList = await dispatch({
      type: 'company/getBranchCompanyList',
      payload: { ...CacheCompany },
    });

    dispatch({
      type: 'site/getSiteListAction',
      payload: { pageNo: 1, pageSize: 100 },
    });

    dispatch({
      type: 'receiver/getReceiverListAction',
      payload: { pageNo: 1, pageSize: 100, type: 'receiver', filter: {} },
    });

    dispatch({
      type: 'customer/resetCustomerPageNoAction',
      payload: {},
    });

    dispatch({
      type: 'customer/getCustomerListAction',
      payload: {
        filter: {
          company_id: (branchCompanyList.length > 0 && branchCompanyList[0].company_id) || 0,
        },
      },
    });

    dispatch({
      type: 'customer/sendCustomerListAction',
      payload: {
        filter: {},
      },
    });

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

  handleSelectRows = rows => {
    this.setState({
      selectedRows: rows,
    });
  };

  handleSearch = e => {
    if (e) {
      e.preventDefault();
    }
    this.getOrderList();
  };

  /**
   * 获取订单信息
   */
  getOrderList = (data = {}, pageNo = 1) => {
    const { dispatch } = this.props;
    const { current, pageSize, btnSearchClicked } = this.state;

    const { form } = this.props;

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
      fieldsValue.order_status = [0, 8];
      if (fieldsValue.create_date) {
        fieldsValue.create_date = [`${fieldsValue.create_date.valueOf()}`];
      }
      const searchParams = Object.assign({ filter: fieldsValue }, data);

      await dispatch({
        type: 'order/getOrderListAction',
        payload: { pageNo: pageNo || current, pageSize, ...searchParams },
      });
      this.setState({
        btnSearchClicked: false,
      });
      dispatch({
        type: 'order/getOrderStatisticAction',
        payload: { ...searchParams },
      });
    });
  };

  handleModalVisible = flag => {
    this.setState({
      selectedOrder: {},
      modalVisible: !!flag,
    });
  };

  // 打印货物清单
  onPrintOrder = () => {
    const { selectedRows } = this.state;
    printDownLoad({ selectedRows });
  };

  // 下载货物清单
  onDownloadOrder = () => {
    const { selectedRows } = this.state;
    printDownLoad({ selectedRows, type: 'pdf' });
  };

  tableFooter = () => {
    const {
      order: {
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
      company: { branchCompanyList },
      site: { siteList },
    } = this.props;
    const { selectedRows, btnSearchClicked } = this.state;

    let companyOption = {};
    let companyOptions = branchCompanyList;
    let allowClearCompany = true;
    let allowClear = false;
    let siteOption = { initialValue: CacheSite.site_id };
    let selectSites = [CacheSite];
    if (CacheSite.site_type == 3 || CacheSite.site_type == 2 || CacheCompany.company_type == 2) {
      selectSites = siteList;
      allowClear = true;
      siteOption = {};
    }
    if (CacheCompany.company_type == 2) {
      companyOption = { initialValue: CacheCompany.company_id };
      companyOptions = [CacheCompany];
      allowClearCompany = false;
    }
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <FormItem label="分公司">
          {getFieldDecorator('company_id', companyOption)(
            <Select
              placeholder="全部"
              onSelect={this.onCompanySelect}
              allowClear={allowClearCompany}
              style={{ width: '100px' }}
            >
              {companyOptions.map(ele => {
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
            <Select placeholder="全部" style={{ width: '100px' }} allowClear={allowClear}>
              {selectSites.map(item => {
                return <Option value={item.site_id}>{item.site_name}</Option>;
              })}
            </Select>
          )}
        </FormItem>
        <FormItem label="运费类别">
          {getFieldDecorator('trans_type', {})(
            <Select placeholder="全部" style={{ width: '150px' }} allowClear>
              <Option value={0}>提付</Option>
              <Option value={1}>现付</Option>
              <Option value={2}>回付</Option>
            </Select>
          )}
        </FormItem>
        <FormItem label="录入日期">
          {getFieldDecorator('create_date', { initialValue: moment() })(
            <DatePicker locale={locale} format={'YYYY-MM-DD'} allowClear={false} />
          )}
        </FormItem>
        <FormItem>
          <Button type="primary" htmlType="submit" loading={btnSearchClicked}>
            查询
          </Button>
          &nbsp;
          {selectedRows.length > 0 && (
            <span>
              <Button onClick={this.onPrintOrder}>打印清单</Button>
              &nbsp;
              <Button onClick={this.onDownloadOrder}>下载清单</Button>
            </span>
          )}
        </FormItem>
      </Form>
    );
  }

  renderForm() {
    return this.renderSimpleForm();
  }

  render() {
    const {
      order: { orderList, total, totalOrderAmount, totalTransAmount },
      company: { branchCompanyList },
      customer: { getCustomerList, sendCustomerList, getCustomerPageNo, sendCustomerPageNo },
      receiver: { receiverList },
      site: { entrunkSiteList, siteList },
      loading,
    } = this.props;

    const {
      selectedRows,
      selectedOrder,
      modalVisible,
      current = 1,
      pageSize = 2,
      entrunkModalVisible,
    } = this.state;

    const parentMethods = {
      handleAdd: this.handleAdd,
      handleModalVisible: this.handleModalVisible,
    };

    let showOperateButton = true;
    if (['site_searchuser'].indexOf(CacheRole.role_value) >= 0) {
      showOperateButton = false;
    }
    return (
      <div>
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>{this.renderForm()}</div>

            <StandardTable
              selectedRows={selectedRows}
              className={styles.dataTable}
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
              onClickHander={this.onRowClick}
              onDoubleClickHander={this.onRowDoubleClick}
              onSelectRow={this.handleSelectRows}
              onChange={this.handleStandardTableChange}
            />
          </div>
          {this.tableFooter()}
        </Card>
      </div>
    );
  }
}

export default TableList;
