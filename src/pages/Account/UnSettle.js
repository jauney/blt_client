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
import { getSelectedAccount, calLateFee, calBonusFee } from '@/utils/account';
import StandardTable from '@/components/StandardTable';
import OrderEditForm from '@/components/EditOrderForm';
import styles from './Account.less';
import { CacheSite, CacheUser, CacheCompany, CacheRole } from '@/utils/storage';
import { setCustomerFieldValue, fetchGetCustomerList, fetchSendCustomerList, onSendCustomerChange, onGetCustomerChange, onGetCustomerSelect, onSendCustomerSelect, customerAutoCompleteState } from '@/utils/customer'
import { printOrder, printPayOrder, printDownLoad, printLabel, getPrintOrderConent, printSiteOrder } from '@/utils/print'
const FormItem = Form.Item;
const { Option } = Select;

/* eslint react/no-multi-comp:0 */
@connect(({ common, customer, company, unsettle, site, car, receiver, loading }) => {
  return {
    common,
    customer,
    company,
    unsettle,
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
    // 缓存输入框中手动输入的收货人姓名
    getCustomerSearch: '',
    sendCustomerSearch: '',
    ...customerAutoCompleteState
  };

  columns = [
    {
      title: '货单号',
      width: '80px',
      dataIndex: 'order_code',
      sorter: true,
    },
    {
      title: '发货客户',
      width: '80px',
      dataIndex: 'sendcustomer_name',
      sorter: true,
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
      dataIndex: 'order_amount',
      sorter: true,
    },
    {
      title: '实收货款',
      width: '80px',
      dataIndex: 'order_real',
      sorter: true,
    },
    {
      title: '折后运费',
      width: '80px',
      dataIndex: 'trans_discount',
      sorter: true,
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
      sorter: true,
      dataIndex: 'create_date',
      render: val => (
        <span>{(val && moment(Number(val || 0)).format('YYYY-MM-DD HH:mm:ss')) || ''}</span>
      ),
    },
    {
      title: '滞纳金',
      width: '80px',
      sorter: true,
      dataIndex: 'late_fee',
    },
    {
      title: '货车编号',
      width: '80px',
      dataIndex: 'car_code',
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
    // 下站只显示当前分公司
    const branchCompanyList = await dispatch({
      type: 'company/getBranchCompanyList',
      payload: { ...CacheCompany },
    });

    if (CacheCompany.company_type == 2) {
      // 分公司进来先初始化收货人列表
      fetchGetCustomerList(this, { company_id: CacheCompany.company_id })
      this.setState({
        currentCompany: CacheCompany
      })
    }

    const siteList = await dispatch({
      type: 'site/getSiteListAction',
      payload: { pageNo: 1, pageSize: 100 },
    });

    fetchSendCustomerList(this, {})

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
    fetchGetCustomerList(this, { company_id: value })
  };

  handleSearch = e => {
    e && e.preventDefault();
    this.setState({ current: 1 })
    this.getOrderList({ sorter: "create_date|ascend" }, 1);
  };

  /**
   * 获取订单信息
   */
  getOrderList = (data = {}, pageNo) => {
    const { dispatch, form } = this.props;
    const { current, pageSize, sendCustomerSearch, getCustomerSearch } = this.state;

    form.validateFields(async (err, fieldsValue) => {
      if (err) return;

      fieldsValue = await setCustomerFieldValue(this, fieldsValue)

      const searchParams = Object.assign({ filter: fieldsValue }, data);

      dispatch({
        type: 'unsettle/getOrderListAction',
        payload: { pageNo: pageNo || current, pageSize, ...searchParams },
      });

      dispatch({
        type: 'unsettle/getOrderStatisticAction',
        payload: { ...searchParams },
      });

      this.standardTable.cleanSelectedKeys()
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
      this.getOrderList();
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
    this.setState({ loading: true })
    const result = await dispatch({
      type: 'unsettle/settleOrderAction',
      payload: {
        order_id: orderIds,
      },
    });

    this.setState({ loading: false })
    if (result.code == 0) {
      message.success('核对成功！');

      this.onSettleCancel();
      setTimeout(() => {
        this.getOrderList();
      }, 800)
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
      setTimeout(() => {
        this.getOrderList();
      }, 800)
      this.onCancelSignCancel();
    } else {
      message.error(result.msg);
    }
  };

  // 打印货物清单
  onPrintOrder = () => {
    const { selectedRows } = this.state
    printSiteOrder({ selectedRows })
  }

  // 下载货物清单
  onDownloadOrder = () => {
    const { selectedRows } = this.state
    printDownLoad({ selectedRows, type: 'pdf' })
  }

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
  onRowDoubleClick = async (record, index, event) => {
    const { dispatch } = this.props;
    // 回单用户不可以双击编辑
    if (['site_receipt'].includes(CacheRole.role_value)) {
      return
    }
    // 查询当前收货人、送货人
    const customer = await dispatch({
      type: 'customer/getCustomerAction',
      payload: {
        getcustomer_id: record.getcustomer_id,
        sendcustomer_id: record.sendcustomer_id,
      },
    });

    this.setState({
      record,
      currentGetCustomer: customer.getCustomer,
      currentSendCustomer: customer.sendCustomer,
    });

    this.onUpdateOrderModalShow();
  };

  // 已结算账目核对中，计算付款日期
  onRowClick = (record, index, event) => { };

  // 调用table子组件
  onRefTable = (ref) => {
    this.standardTable = ref
  }

  tableFooter = () => {
    const {
      unsettle: {
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

  renderCustomerOption = (item) => {
    const AutoOption = AutoComplete.Option;
    return (
      <AutoOption key={`${item.customer_id}`} value={`${item.customer_id}`} customerid={`${item.customer_id}`} label={item.customer_name}>
        {item.customer_name}
      </AutoOption>
    );
  };


  renderSimpleForm() {
    const {
      form: { getFieldDecorator },
      customer: { getCustomerList = [], sendCustomerList = [] },
      company: { branchCompanyList },
      site: { entrunkSiteList },
    } = this.props;
    const { currentShipSite = {}, currentCompany = {} } = this.state;
    const formItemLayout = {};

    const companyOption = {};
    // 默认勾选第一个公司
    if (CacheCompany.company_type != 1) {
      companyOption.initialValue = CacheCompany.company_id || '';
    }
    const allowClearFlag = CacheCompany.company_type == 1 ? true : false;
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <FormItem label="分公司" {...formItemLayout}>
          {getFieldDecorator('company_id', companyOption)(
            <Select placeholder="全部" onSelect={this.onCompanySelect} style={{ width: '100px' }} allowClear={allowClearFlag}>
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
        <FormItem label="货车编号" {...formItemLayout}>
          {getFieldDecorator('shipsite_id', {})(
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
          {getFieldDecorator('car_code', {})(
            <Input placeholder="请输入" style={{ width: '80px' }} />
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
                  <AutoOption key={`${item.customer_id}`} value={`${item.customer_id}`} customerid={`${item.customer_id}`} label={item.customer_name}>
                    {item.customer_name}
                  </AutoOption>
                );
              })}
              onSelect={(value) => { onGetCustomerSelect(this, value) }}
              onChange={(value) => { onGetCustomerChange(this, value) }}
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
                  <AutoOption key={`${item.customer_id}`} value={`${item.customer_id}`} customerid={`${item.customer_id}`} label={item.customer_name}>
                    {item.customer_name}
                  </AutoOption>
                );
              })}
              onSelect={(value) => { onSendCustomerSelect(this, value) }}
              onChange={(value) => { onSendCustomerChange(this, value) }}
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
        <FormItem label="运单号" {...formItemLayout}>
          {getFieldDecorator('order_code', {})(
            <Input placeholder="请输入" style={{ width: '220px' }} />
          )}
        </FormItem>
        <Form.Item {...formItemLayout}>
          <Button type="primary" htmlType="submit">
            查询
          </Button>
        </Form.Item>
      </Form>
    );
  }

  render() {
    const {
      unsettle: { orderList, total },
      loading,
      dispatch,
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
      currentGetCustomer = {},
      currentSendCustomer = {},
      currentCompany,
    } = this.state;

    // 是否显示操作按钮
    let showOperateButton = true
    if (['site_admin', 'site_orderuser', 'site_pay', 'site_receipt', 'site_searchuser'].indexOf(CacheRole.role_value) >= 0) {
      showOperateButton = false
    }

    return (
      <div>
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>{this.renderSimpleForm()}</div>
            <div className={styles.tableListOperator}>
              {selectedRows.length > 0 && showOperateButton && (
                <span>
                  <Button onClick={this.onSettle}>账目核对</Button>
                  <Button onClick={this.onSign}>签字</Button>
                  <Button onClick={this.onCancelSign}>取消签字</Button>
                  <Button onClick={this.onPrintOrder}>结账打印</Button>
                  <Button onClick={this.onDownloadOrder}>下载</Button>
                </span>
              )}
            </div>
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
                    this.setState({ pageSize })
                  }
                },
              }}
              columns={this.columns}
              onSelectRow={this.handleSelectRows}
              onChange={this.handleStandardTableChange}
              onClickHander={this.onRowClick}
              onDoubleClickHander={this.onRowDoubleClick}
              rowClassNameHandler={(record, index) => {
                return record.sign_status == 1 ? styles.signColor : '';
              }}
            />
          </div>
          {this.tableFooter()}
        </Card>
        <OrderEditForm
          modalVisible={updateOrderModalVisible}
          record={record}
          onCancelModal={this.onUpdateOrderModalCancel}
          handleSearch={this.getOrderList}
          isEdit={['site_pay', 'site_receipt', 'company_account', 'company_admin'].indexOf(CacheRole.role_value) >= 0 ? 1 : 0}
          dispatch={dispatch}
          currentCompany={currentCompany}
          currentGetCustomer={currentGetCustomer}
          currentSendCustomer={currentSendCustomer}
        />
        <Spin spinning={this.state.loading}>
          <Modal
            title="确认结账"
            okText="确认"
            cancelText="取消"
            visible={settleModalVisible}
            onOk={this.onSettleOk}
            onCancel={this.onSettleCancel}
          >
            <p>{`结算货款条数${selectedRows.length}，结算总额 ${accountStatistic.totalAccount} `}</p>
            <p>{`奖金${calBonusFee(selectedRows, currentCompany)}，滞纳金 ${calLateFee(selectedRows, currentCompany)} `}</p>
            <p>您确认结账么？</p>
          </Modal>
        </Spin>

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
