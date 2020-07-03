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
import { getSelectedAccount } from '@/utils/account';
import StandardTable from '@/components/StandardTable';
import OrderEditForm from '@/components/EditOrderForm';
import styles from './Account.less';
import { locale } from '@/utils';
import { CacheSite, CacheUser, CacheCompany, CacheRole } from '../../utils/storage';
import {
  setCustomerFieldValue,
  fetchGetCustomerList,
  fetchSendCustomerList,
  onSendCustomerChange,
  onGetCustomerChange,
  onGetCustomerSelect,
  onSendCustomerSelect,
  customerAutoCompleteState,
} from '@/utils/customer';

const FormItem = Form.Item;
const { Option } = Select;

/* eslint react/no-multi-comp:0 */
@connect(({ common, customer, company, accountlist, site, car, receiver, loading }) => {
  return {
    common,
    customer,
    company,
    accountlist,
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
    accountStatistic: {},
    formValues: {},
    current: 1,
    pageSize: 20,
    record: {},
    updateOrderModalVisible: false,
    settleModalVisible: false,
    signModalVisible: false,
    cancelSignModalVisible: false,
    downloadModalVisible: false,
    printModalVisible: false,
    currentCompany: {},
    currentShipSite: {},
    ...customerAutoCompleteState,
  };

  columns = [
    {
      title: '货单号',
      width: '80px',
      dataIndex: 'order_code',
      align: 'right',
      sorter: true,
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
      dataIndex: 'getcustomer_name',
      sorter: true,
    },
    {
      title: '应收货款',
      width: '80px',
      sorter: true,
      dataIndex: 'order_amount',
    },
    {
      title: '实收货款',
      dataIndex: 'order_real',
      width: '80px',
      sorter: true,
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
      sorter: true,
      dataIndex: 'order_advancepay_amount',
    },
    {
      title: '送货费',
      width: '80px',
      sorter: true,
      dataIndex: 'deliver_amount',
    },
    {
      title: '保价费',
      width: '80px',
      sorter: true,
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
      render: val => <span>{(val && moment(val).format('YYYY-MM-DD HH:mm:ss')) || ''}</span>,
    },
    {
      title: '结算时间',
      width: '170px',
      dataIndex: 'settle_date',
      render: val => <span>{(val && moment(val).format('YYYY-MM-DD HH:mm:ss')) || ''}</span>,
    },
    {
      title: '付款时间',
      width: '170px',
      dataIndex: 'pay_date',
      render: val => <span>{(val && moment(val).format('YYYY-MM-DD HH:mm:ss')) || ''}</span>,
    },
    {
      title: '分公司',
      width: '80px',
      dataIndex: 'company_name',
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

  async componentDidMount() {
    const { dispatch } = this.props;
    // 下站只显示当前分公司
    const branchCompanyList = await dispatch({
      type: 'company/getBranchCompanyList',
      payload: { ...CacheCompany },
    });

    const siteList = await dispatch({
      type: 'site/getSiteListAction',
      payload: { pageNo: 1, pageSize: 100 },
    });

    if (CacheCompany.company_type == 2) {
      // 分公司进来先初始化收货人列表
      fetchGetCustomerList(this, { company_id: CacheCompany.company_id });
      this.setState({
        currentCompany: CacheCompany,
      });
    }
    fetchSendCustomerList(this, {});

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

    dispatch({
      type: 'common/initOrderListAction',
    });
  }

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
    // 获取当前公司的客户列表
    fetchGetCustomerList(this, { company_id: value });
  };

  handleSearch = e => {
    e && e.preventDefault();
    this.setState({ current: 1 });
    this.getOrderList({ sorter: 'create_date|desc' }, 1);
  };

  // 调用table子组件
  onRefTable = ref => {
    this.standardTable = ref;
  };

  /**
   * 获取订单信息
   */
  getOrderList = (data = {}, pageNo) => {
    const { dispatch, form } = this.props;
    const {
      current,
      pageSize,
      sendCustomerSearch,
      getCustomerSearch,
      btnSearchClicked,
    } = this.state;

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
      fieldsValue = await setCustomerFieldValue(this, fieldsValue);

      // 未结算
      if (fieldsValue.order_status == 5) {
        fieldsValue.order_status = [3, 5];
      }
      // 已结算
      else if (fieldsValue.order_status == 6) {
        fieldsValue.order_status = [6, 7];
      } else {
        fieldsValue.order_status = [3, 7];
      }

      if (fieldsValue.settle_date) {
        fieldsValue.settle_date = fieldsValue.settle_date.valueOf();
      }

      // 上站非总部只能查看当前站点的
      if (CacheCompany.company_type == 1 && CacheSite.site_type != 3) {
        fieldsValue.site_id = CacheSite.site_id;
      }

      const searchParams = Object.assign({ filter: fieldsValue }, data);
      await dispatch({
        type: 'accountlist/getOrderListAction',
        payload: { pageNo: pageNo || current, pageSize, ...searchParams },
      });
      this.setState({
        btnSearchClicked: false,
      });
      dispatch({
        type: 'accountlist/getOrderStatisticAction',
        payload: { ...searchParams },
      });

      this.standardTable.cleanSelectedKeys();
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

  // 签字
  onSignOk = async () => {
    const { dispatch } = this.props;
    const { selectedRows } = this.state;
    const orderIds = selectedRows.map(item => {
      return item.order_id;
    });
    let result = await dispatch({
      type: 'unsettle/signAction',
      payload: { order_id: orderIds },
    });
    if (result.code == 0) {
      message.success('签字成功！');
      this.handleSearch();
      this.onSignCancel();
    } else {
      message.error(result.msg);
    }
  };

  onSign = async () => {
    this.setState({
      signModalVisible: true,
    });
  };

  onSignCancel = async () => {
    this.setState({
      signModalVisible: false,
    });
  };

  // 账目核对
  onSettle = async () => {
    const { selectedRows } = this.state;
    let accountStatistic = getSelectedAccount(selectedRows);
    this.setState({ accountStatistic, settleModalVisible: true });
  };

  onSettleCancel = async () => {
    this.setState({
      settleModalVisible: false,
    });
  };

  onSettleOk = async () => {
    const { dispatch } = this.props;
    const { selectedRows } = this.state;
    const orderIds = selectedRows.map(item => {
      return item.order_id;
    });
    const result = await dispatch({
      type: 'unsettle/settleOrderAction',
      payload: {
        order_id: orderIds,
      },
    });
    if (result.code == 0) {
      message.success('核对成功！');

      this.onSettleCancel();
      this.handleSearch();
    } else {
      message.error(result.msg);
    }
  };

  // 取消签字
  onCancelSign = async () => {
    this.setState({
      cancelSignModalVisible: true,
    });
  };

  onCancelSignCancel = async () => {
    this.setState({
      cancelSignModalVisible: false,
    });
  };

  onCancelSignOk = async () => {
    const { dispatch } = this.props;
    const { selectedRows } = this.state;
    const orderIds = selectedRows.map(item => {
      return item.order_id;
    });
    const result = await dispatch({
      type: 'unsettle/cancelSignAction',
      payload: {
        order_id: orderIds,
      },
    });
    if (result.code == 0) {
      message.success('取消签字成功！');
      this.handleSearch();
      this.onCancelSignCancel();
    } else {
      message.error(result.msg);
    }
  };

  // 打印
  onPrint = async () => {
    this.setState({
      printModalVisible: true,
    });
  };

  onPrintCancel = async () => {
    this.setState({
      printModalVisible: false,
    });
  };

  onPrintOk = async () => {
    const { selectedRows } = this.state;
    const orderIds = selectedRows.map(item => {
      return item.order_id;
    });
    let result = await dispatch({
      type: 'accountlist/printAction',
      payload: {
        order_id: orderIds,
      },
    });
    if (result.code == 0) {
      message.success('打印成功！');

      this.onPrintCancel();
    } else {
      message.error(result.msg);
    }
  };

  // 下载
  onDownload = async () => {
    this.setState({
      downloadModalVisible: true,
    });
  };

  onDownloadCancel = async () => {
    this.setState({
      downloadModalVisible: false,
    });
  };

  onDownloadOk = async () => {
    const { selectedRows } = this.state;
    const orderIds = selectedRows.map(item => {
      return item.order_id;
    });
    let result = await dispatch({
      type: 'accountlist/downloadAction',
      payload: {
        order_id: orderIds,
      },
    });
    if (result.code == 0) {
      message.success('下载成功！');

      this.onDownloadCancel();
    } else {
      message.error(result.msg);
    }
  };

  /**
   * 修改订单信息弹窗
   */
  onUpdateOrderModalShow = () => {
    this.setState({
      updateOrderModalVisible: true,
    });
  };

  onUpdateOrderModalCancel = () => {
    // setTimeout(() => this.addBtn.blur(), 0);
    this.setState({
      updateOrderModalVisible: false,
    });
  };

  // 编辑订单信息
  onRowDoubleClick = (record, index, event) => {
    this.setState({
      record,
    });
    this.onUpdateOrderModalShow();
  };

  // 已结算账目核对中，计算付款日期
  onRowClick = (record, index, event) => {};

  tableFooter = () => {
    const {
      accountlist: {
        total,
        totalOrderAmount,
        totalRealOrderAmount,
        totalTransAmount,
        totalInsurancefee,
        totalAdvancepayAmount,
        totalDeliverAmount,
        totalLatefee,
        totalBonusfee,
      },
    } = this.props;
    return (
      <div className={styles.tableFooter}>
        <span>货款总额：{totalOrderAmount || '0'}</span>
        <span className={styles.footerSplit}>实收货款：{totalRealOrderAmount || '0'}</span>
        <span className={styles.footerSplit}>运费总额：{totalTransAmount || '0'}</span>
        <span className={styles.footerSplit}>垫付总额：{totalAdvancepayAmount || '0'}</span>
        <span className={styles.footerSplit}>送货费总额：{totalDeliverAmount || '0'}</span>
        <span className={styles.footerSplit}>保价费总额：{totalInsurancefee || '0'}</span>
        <span className={styles.footerSplit}>票数：{total || '0'}</span>
        <span className={styles.footerSplit}>滞纳金：{totalLatefee || '0'}</span>
        <span className={styles.footerSplit}>奖金：{totalBonusfee || '0'}</span>
      </div>
    );
  };

  renderSimpleForm() {
    const {
      form: { getFieldDecorator },
      customer: { getCustomerList, sendCustomerList },
      company: { branchCompanyList },
      site: { entrunkSiteList },
    } = this.props;
    const { currentShipSite, btnSearchClicked } = this.state;
    const formItemLayout = {};
    const companyOption = {};
    const allowClearFlag = CacheCompany.company_type == 1 ? true : false;
    // 默认勾选第一个公司
    if (CacheCompany.company_type != 1) {
      companyOption.initialValue = CacheCompany.company_id || ''; // 分公司进来先初始化收货人列表
    }
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <FormItem label="分公司" {...formItemLayout}>
          {getFieldDecorator('company_id', companyOption)(
            <Select
              placeholder="全部"
              onSelect={this.onCompanySelect}
              style={{ width: '100px' }}
              allowClear={allowClearFlag}
            >
              {(CacheCompany.company_type == 2 ? [CacheCompany] : branchCompanyList).map(ele => {
                return (
                  <Option key={ele.company_id} value={ele.company_id}>
                    {ele.company_name}
                  </Option>
                );
              })}
            </Select>
          )}
        </FormItem>

        <FormItem label="有无货款" {...formItemLayout}>
          {getFieldDecorator('order_amount', { initialValue: -1 })(
            <Select placeholder="全部" style={{ width: '100px' }} allowClear>
              <Option value={-2}>无</Option>
              <Option value={-1}>有</Option>
            </Select>
          )}
        </FormItem>
        <FormItem label="收货人姓名" {...formItemLayout}>
          {getFieldDecorator('getcustomer_id')(
            <AutoComplete
              size="large"
              style={{ width: '100%' }}
              dataSource={getCustomerList.map(item => {
                const AutoOption = AutoComplete.Option;
                return (
                  <AutoOption
                    key={`${item.customer_id}`}
                    value={`${item.customer_id}`}
                    customerid={`${item.customer_id}`}
                    label={item.customer_name}
                  >
                    {item.customer_name}
                  </AutoOption>
                );
              })}
              onSelect={value => {
                onGetCustomerSelect(this, value);
              }}
              onChange={value => {
                onGetCustomerChange(this, value);
              }}
              allowClear
              optionLabelProp="label"
              placeholder="请输入"
              filterOption={(inputValue, option) =>
                option.props.children.indexOf(inputValue) !== -1
              }
            >
              {' '}
            </AutoComplete>
          )}
        </FormItem>
        <FormItem label="收货人电话" {...formItemLayout}>
          {getFieldDecorator('getcustomer_mobile', {})(
            <Input placeholder="请输入" style={{ width: '130px' }} />
          )}
        </FormItem>
        <FormItem label="发货人姓名" {...formItemLayout}>
          {getFieldDecorator('sendcustomer_id')(
            <AutoComplete
              size="large"
              style={{ width: '100%' }}
              dataSource={sendCustomerList.map(item => {
                const AutoOption = AutoComplete.Option;
                return (
                  <AutoOption
                    key={`${item.customer_id}`}
                    value={`${item.customer_id}`}
                    customerid={`${item.customer_id}`}
                    label={item.customer_name}
                  >
                    {item.customer_name}
                  </AutoOption>
                );
              })}
              onSelect={value => {
                onSendCustomerSelect(this, value);
              }}
              onChange={value => {
                onSendCustomerChange(this, value);
              }}
              allowClear
              placeholder="请输入"
              filterOption={(inputValue, option) =>
                option.props.children.indexOf(inputValue) !== -1
              }
            >
              {' '}
            </AutoComplete>
          )}
        </FormItem>
        <FormItem label="发货人电话" {...formItemLayout}>
          {getFieldDecorator('sendcustomer_mobile', {})(
            <Input placeholder="请输入" style={{ width: '130px' }} />
          )}
        </FormItem>
        <FormItem label="结算状态" {...formItemLayout}>
          {getFieldDecorator('order_status')(
            <Select placeholder="全部" style={{ width: '80px' }} allowClear>
              <Option value={6}>已结算</Option>
              <Option value={5}>未结算</Option>
            </Select>
          )}
        </FormItem>
        <FormItem label="日期" {...formItemLayout}>
          {getFieldDecorator('settle_date', { initialValue: moment() })(
            <DatePicker locale={locale} format={'YYYY-MM-DD'} />
          )}
        </FormItem>
        <FormItem label="运单号" {...formItemLayout}>
          {getFieldDecorator('order_code', {})(
            <Input placeholder="请输入" style={{ width: '220px' }} />
          )}
        </FormItem>
        <Form.Item {...formItemLayout} className={styles.tableListOperator}>
          <Button type="primary" htmlType="submit" loading={btnSearchClicked}>
            查询
          </Button>
        </Form.Item>
      </Form>
    );
  }

  renderForm() {
    return this.renderSimpleForm();
  }

  render() {
    const {
      accountlist: { orderList, total, totalOrderAmount, totalTransAmount },
      company: { branchCompanyList },
      car: { carList, lastCar },
      loading,
    } = this.props;

    const {
      selectedRows,
      accountStatistic,
      current,
      pageSize,
      updateOrderModalVisible,
      settleModalVisible,
      signModalVisible,
      cancelSignModalVisible,
      downloadModalVisible,
      printModalVisible,
      record,
    } = this.state;

    return (
      <div>
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>{this.renderForm()}</div>

            <StandardTable
              onRef={this.onRefTable}
              selectedRows={selectedRows}
              loading={loading}
              className={styles.dataTable}
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
              onChange={this.handleStandardTableChange}
              onClickHander={this.onRowClick}
              onDoubleClickHander={this.onRowDoubleClick}
              rowClassNameHandler={(record, index) => {
                if (record.order_status === 6) {
                  return styles.settleColor;
                } else if (record.order_status === 7) {
                  return styles.payColor;
                } else {
                  return '';
                }
              }}
            />
          </div>
          {this.tableFooter()}
        </Card>
        <OrderEditForm
          modalVisible={updateOrderModalVisible}
          record={record}
          onCancelModal={this.onUpdateOrderModalCancel}
          handleSearch={this.handleSearch}
        />
        <Modal
          title="确认结账"
          okText="确认"
          cancelText="取消"
          visible={settleModalVisible}
          onOk={this.onSettleOk}
          onCancel={this.onSettleCancel}
        >
          <p>{`结算货款条数${selectedRows.length}，结算总额 ${accountStatistic.totalAccount} `}</p>
          <p>您确认结账么？</p>
        </Modal>
        <Modal
          title="确认"
          okText="确认"
          cancelText="取消"
          visible={signModalVisible}
          onOk={this.onSignOk}
          onCancel={this.onSignCancel}
        >
          <p>您确认签字么？</p>
        </Modal>
        <Modal
          title="确认"
          okText="确认"
          cancelText="取消"
          visible={cancelSignModalVisible}
          onOk={this.onCancelSignOk}
          onCancel={this.onCancelSignCancel}
        >
          <p>您确认取消签字么？</p>
        </Modal>
        <Modal
          title="确认"
          okText="确认"
          cancelText="取消"
          visible={printModalVisible}
          onOk={this.onPrintOk}
          onCancel={this.onPrintCancel}
        >
          <p>您确认结账打印么？</p>
        </Modal>
        <Modal
          title="确认"
          okText="确认"
          cancelText="取消"
          visible={downloadModalVisible}
          onOk={this.onDownloadOk}
          onCancel={this.onDownloadCancel}
        >
          <p>您确认要下载么？</p>
        </Modal>
      </div>
    );
  }
}

export default TableList;
