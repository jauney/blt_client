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
import styles from './Pay.less';
import { async } from 'q';
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

@Form.create()
class DownAccountForm extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      agencyFee: 4,
      btnDownClicked: false,
    };
  }

  onAgencyFeeSelect = (value, option) => {
    this.setState({
      agencyFee: parseFloat(value),
    });
  };

  onDownAccountHandler = () => {
    const { downAccountHandle, form } = this.props;
    const { agencyFee, btnDownClicked } = this.state;
    form.validateFields(async (err, fieldsValue) => {
      if (err) {
        this.setState({
          btnDownClicked: false,
        });
        return;
      }
      if (btnDownClicked) {
        return;
      }
      this.setState({
        btnDownClicked: true,
      });

      await downAccountHandle({ rate: agencyFee, bank_account: fieldsValue.bank_account });

      this.setState({
        btnDownClicked: false,
      });
    });
  };

  render() {
    const { modalVisible, downCancel, selectedRows, form } = this.props;
    const accountData = getSelectedDownAccount(selectedRows);
    const record = selectedRows.length > 0 ? selectedRows[0] : {};
    const { agencyFee, btnDownClicked } = this.state;
    return (
      <Modal
        destroyOnClose
        title="下账"
        okText="确认"
        cancelText="取消"
        visible={modalVisible}
        onCancel={() => downCancel()}
        footer={[
          <Button key="btn-cancel" onClick={() => downCancel()}>
            取 消
          </Button>,
          <Button
            key="btn-save"
            loading={btnDownClicked}
            type="primary"
            onClick={this.onDownAccountHandler}
          >
            保 存
          </Button>,
        ]}
        width={800}
        className={styles.modalForm}
      >
        <Form>
          <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
            <Col>
              <FormItem labelCol={{ span: 3, offset: 2 }} label="下账条数">
                {selectedRows.length}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
            <Col>
              <FormItem labelCol={{ span: 3, offset: 2 }} label="下账总金额">
                {accountData.totalActualGoodsFund || '0'} - 代办费 * &nbsp;
                <Select
                  placeholder="全部"
                  defaultValue="4"
                  onSelect={this.onAgencyFeeSelect}
                  style={{ width: '80px' }}
                >
                  <Option value="0">0‰</Option>
                  <Option value="1">1‰</Option>
                  <Option value="2">2‰</Option>
                  <Option value="3">3‰</Option>
                  <Option value="4">4‰</Option>
                  <Option value="5">5‰</Option>
                </Select>
                &nbsp;-&nbsp;回付运费 {accountData.totalPayTransFunds}
                &nbsp;-&nbsp;回付保费 {accountData.totalPayInsurance}
                &nbsp;=&nbsp;
                {accountData.totalActualGoodsFund -
                  Math.ceil((accountData.totalShouldGoodsFund * agencyFee) / 1000) -
                  accountData.totalPayTransFunds -
                  accountData.totalPayInsurance}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
            <Col>
              <FormItem labelCol={{ span: 3, offset: 2 }} label="户主">
                {record.getcustomer_name || ''}
              </FormItem>
            </Col>
            <Col>
              <FormItem labelCol={{ span: 3, offset: 2 }} label="账户">
                {form.getFieldDecorator('bank_account', { initialValue: record.bank_account })(
                  <Input placeholder="请输入" style={{ width: '280px' }} />
                )}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
            <Col>
              <FormItem
                labelCol={{ span: 3, offset: 2 }}
                className={styles.tableDetail}
                label="明细"
              >
                <table>
                  <thead>
                    <tr>
                      <th>运单号</th>
                      <th>实收货款</th>
                      <th>应收货款</th>
                      <th>运费</th>
                      <th>保价费</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedRows.map(item => {
                      return (
                        <tr>
                          <td>{item.order_code}</td>
                          <td>{item.order_real}</td>
                          <td>{item.order_amount}</td>
                          <td>{item.trans_discount || item.trans_amount}</td>
                          <td>{item.insurance_fee}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </FormItem>
            </Col>
          </Row>
        </Form>
      </Modal>
    );
  }
}

/* eslint react/no-multi-comp:0 */
@connect(({ customer, company, pay, site, car, receiver, loading }) => {
  return {
    customer,
    company,
    pay,
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
    downModalVisible: false,
    signModalVisible: false,
    cancelDownAccountModalVisible: false,
    downloadModalVisible: false,
    printModalVisible: false,
    currentCompany: {},
    btnSearchClicked: false,
    ...customerAutoCompleteState,
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
      width: '80px',
    },
    {
      title: '发货客户',
      dataIndex: 'sendcustomer_name',
      width: '80px',
      sorter: true,
    },
    {
      title: '收货客户',
      dataIndex: 'getcustomer_name',
      sorter: true,
      width: '80px',
    },
    {
      title: '应收货款',
      dataIndex: 'order_amount',
      sorter: true,
      width: '80px',
    },
    {
      title: '实收货款',
      dataIndex: 'order_real',
      sorter: true,
      width: '80px',
    },
    {
      title: '实收运费',
      dataIndex: 'trans_discount',
      sorter: true,
      width: '80px',
    },
    {
      title: '运费方式',
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
      width: '80px',
    },
    {
      title: '垫付',
      dataIndex: 'order_advancepay_amount',

      width: '80px',
    },
    {
      title: '送货费',
      dataIndex: 'deliver_amount',

      width: '80px',
    },
    {
      title: '保价费',
      dataIndex: 'insurance_fee',

      width: '80px',
    },
    {
      title: '货物名称',
      dataIndex: 'order_name',

      width: '150px',
    },
    {
      title: '录票时间',
      dataIndex: 'create_date',
      render: val => <span>{(val && moment(val).format('YYYY-MM-DD HH:mm:ss')) || ''}</span>,
      width: '170px',
    },
    {
      title: '结算时间',
      dataIndex: 'settle_date',
      render: val => <span>{(val && moment(val).format('YYYY-MM-DD HH:mm:ss')) || ''}</span>,
      width: '170px',
    },
    {
      title: '付款时间',
      dataIndex: 'pay_date',
      render: val => <span>{(val && moment(val).format('YYYY-MM-DD HH:mm:ss')) || ''}</span>,
      width: '170px',
    },
    {
      title: '站点',
      dataIndex: 'site_name',

      width: '80px',
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
    await dispatch({
      type: 'company/getBranchCompanyList',
      payload: { ...CacheCompany },
    });

    dispatch({
      type: 'site/getSiteListAction',
      payload: { pageNo: 1, pageSize: 100 },
    });

    this.fetchSendCustomerList();

    // 页面初始化获取一次订单信息，否则会显示其他页面的缓存信息
    this.getOrderList();
  }

  handleSelectRows = rows => {
    this.setState({
      selectedRows: rows,
    });
  };

  onSendCustomerScroll = e => {
    if (e.target.scrollHeight <= e.target.scrollTop + e.currentTarget.scrollHeight) {
      this.fetchSendCustomerList();
    }
  };

  fetchSendCustomerList = async companyId => {
    const { dispatch } = this.props;

    dispatch({
      type: 'customer/sendCustomerListAction',
      payload: {
        filter: {},
      },
    });
  };

  onCompanySelect = async (value, option) => {};

  handleSearch = e => {
    e && e.preventDefault();

    this.getOrderList();
  };
  // 调用table子组件
  onRefTable = ref => {
    this.standardTable = ref;
  };
  /**
   * 获取订单信息
   */
  getOrderList = (data = {}, pageNo = 1) => {
    const { dispatch, form } = this.props;
    const { current, pageSize, btnSearchClicked } = this.state;

    form.validateFields(async (err, fieldsValue) => {
      if (err) {
        this.setState({
          btnSearchClicked: true,
        });
        return;
      }
      if (btnSearchClicked) {
        return;
      }
      this.setState({
        btnSearchClicked: true,
      });
      fieldsValue.pay_status = 1;

      fieldsValue = await setCustomerFieldValue(this, fieldsValue);

      const searchParams = Object.assign({ filter: fieldsValue }, data);
      await dispatch({
        type: 'pay/getOrderListAction',
        payload: { pageNo: pageNo || current, pageSize, ...searchParams },
      });
      this.setState({
        btnSearchClicked: false,
      });
      dispatch({
        type: 'pay/getOrderStatisticAction',
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

  // 下账
  downAccountHandle = async data => {
    const { dispatch } = this.props;
    const { selectedRows } = this.state;
    const orderIds = selectedRows.map(item => {
      return item.order_id;
    });
    const result = await dispatch({
      type: 'pay/downAccountAction',
      payload: {
        order_id: orderIds,
        rate: data.rate,
        bank_account: data.bank_account,
      },
    });
    if (result.code == 0) {
      message.success('下账成功！');

      this.onDownCancel();
      this.handleSearch();
    } else {
      message.error(result.msg);
    }
  };

  // 打开下账对话框
  onDownAccount = async () => {
    const { selectedRows } = this.state;
    const accountData = getSelectedDownAccount(selectedRows);
    if (!accountData.isSameSendCustomer) {
      message.error('请选择相同客户的订单进行下账');
      return;
    }
    if (!accountData.isSettled) {
      message.error('只能选择已经结算的订单进行下账');
      return;
    }
    this.setState({
      downModalVisible: true,
    });
  };

  onDownCancel = async () => {
    this.setState({
      downModalVisible: false,
    });
  };

  // 取消账户核对
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
    let result = await dispatch({
      type: 'settle/cancelSettleOrderAction',
      payload: {
        order_id: orderIds,
      },
    });
    if (result.code == 0) {
      message.success('取消结算成功！');

      this.onSettleCancel();
      this.handleSearch();
    } else {
      message.error(result.msg);
    }
  };

  onAddAbnormal = async () => {
    const { dispatch } = this.props;
    const { selectedRows } = this.state;
    const orderIds = selectedRows.map(item => {
      return item.order_id;
    });
    const result = await dispatch({
      type: 'pay/updatePayAbnormalAction',
      payload: {
        order_id: orderIds,
        order: { pay_status: 0 },
      },
    });
    if (result.code == 0) {
      message.success('取消异常成功！');
      this.handleSearch();
    } else {
      message.error(result.msg);
    }
  };

  onAddNormalModal = async () => {
    Modal.confirm({
      title: '确认',
      content: '确定将所选订单取消异常吗？',
      okText: '确认',
      cancelText: '取消',
      onOk: this.onAddAbnormal,
    });
  };

  // 取消签字
  onCancelSign = async () => {
    this.setState({
      cancelDownAccountModalVisible: true,
    });
  };

  onCancelDownAccountCancel = async () => {
    this.setState({
      cancelDownAccountModalVisible: false,
    });
  };

  onCancelDownAccountOk = async () => {
    const { dispatch } = this.props;
    const { selectedRows } = this.state;
    const orderIds = selectedRows.map(item => {
      return item.order_id;
    });
    let result = await dispatch({
      type: 'pay/cancelDownAccountAction',
      payload: {
        order_id: orderIds,
      },
    });
    if (result && result.code == 0) {
      message.success('取消下账成功！');
      this.handleSearch();
      this.onCancelDownAccountCancel();
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
      type: 'pay/printAction',
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
      type: 'pay/downloadAction',
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
    // 回单用户不可以双击编辑
    if (['site_receipt'].includes(CacheRole.role_value)) {
      return;
    }
    this.setState({
      record,
    });
    this.onUpdateOrderModalShow();
  };

  // 已结算账目核对中，计算付款日期
  onRowClick = (record, index, event) => {};

  tableFooter = () => {
    const {
      pay: {
        total,
        totalOrderAmount,
        totalTransAmount,
        totalInsurancefee,
        totalAdvancepayAmount,
        totalDeliverAmount,
      },
    } = this.props;
    return (
      <div className={styles.tableFooter}>
        <span>货款总额：{totalOrderAmount || '0'}</span>
        <span className={styles.footerSplit}>运费总额：{totalTransAmount || '0'}</span>
        <span className={styles.footerSplit}>垫付总额：{totalAdvancepayAmount || '0'}</span>
        <span className={styles.footerSplit}>送货费总额：{totalDeliverAmount || '0'}</span>
        <span className={styles.footerSplit}>保价费总额：{totalInsurancefee || '0'}</span>
        <span className={styles.footerSplit}>票数：{total || '0'}</span>
      </div>
    );
  };

  renderSimpleForm() {
    const {
      form: { getFieldDecorator },
      site: { entrunkSiteList = [], siteList = [] },
      customer: { getCustomerList, sendCustomerList },
      company: { branchCompanyList },
    } = this.props;
    const { btnSearchClicked } = this.state;
    const companyOption = {};
    // 默认勾选第一个公司
    // if (branchCompanyList.length > 0) {
    //   companyOption.initialValue = branchCompanyList[0].company_id || '';
    // }
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <FormItem label="分公司">
          {getFieldDecorator('company_id', companyOption)(
            <Select
              placeholder="全部"
              onSelect={this.onCompanySelect}
              style={{ width: '80px' }}
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
        <FormItem label="运单号">
          {getFieldDecorator('order_code', {})(
            <Input placeholder="请输入" style={{ width: '150px' }} />
          )}
        </FormItem>
        <FormItem label="站点">
          {getFieldDecorator('site_id', {})(
            <Select placeholder="全部" style={{ width: '80px' }} allowClear>
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
        <FormItem label="发货人姓名">
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
        <FormItem label="发货人电话">
          {getFieldDecorator('sendcustomer_mobile', {})(
            <Input placeholder="请输入" style={{ width: '130px' }} />
          )}
        </FormItem>
        <FormItem>
          <Button type="primary" htmlType="submit" loading={btnSearchClicked}>
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
      pay: { orderList, total, totalOrderAmount, totalTransAmount },
      loading,
    } = this.props;

    const {
      selectedRows,
      accountStatistic,
      current,
      pageSize,
      updateOrderModalVisible,
      settleModalVisible,
      downModalVisible,
      signModalVisible,
      cancelDownAccountModalVisible,
      downloadModalVisible,
      printModalVisible,
      record,
    } = this.state;
    // 是否显示操作按钮
    let showOperateButton = true;
    if (['site_searchuser', 'site_admin'].indexOf(CacheRole.role_value) >= 0) {
      showOperateButton = false;
    }
    return (
      <div>
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>{this.renderForm()}</div>
            <div className={styles.tableListOperator}>
              {selectedRows.length > 0 && showOperateButton && (
                <span>
                  <Button onClick={this.onDownAccount}>下账</Button>
                  <Button onClick={this.onAddNormalModal}>取消异常</Button>
                  <Button onClick={this.onPrint}>打印</Button>
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
        <DownAccountForm
          modalVisible={downModalVisible}
          downAccountHandle={this.downAccountHandle}
          downCancel={this.onDownCancel}
          selectedRows={selectedRows}
        />
        <Modal
          title="取消结算"
          okText="确认"
          cancelText="取消"
          visible={settleModalVisible}
          onOk={this.onSettleOk}
          onCancel={this.onSettleCancel}
        >
          <p>
            {`取消结算货款条数${selectedRows.length}，取消结算总额 ${
              accountStatistic.totalAccount
            } `}
          </p>
          <p>您确认结算么？</p>
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
          visible={cancelDownAccountModalVisible}
          onOk={this.onCancelDownAccountOk}
          onCancel={this.onCancelDownAccountCancel}
        >
          <p>您确认取消下账么？</p>
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
