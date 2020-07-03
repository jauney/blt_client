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
import styles from './TransConfirm.less';
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

/* eslint react/no-multi-comp:0 */
@connect(({ customer, company, transconfirm, site, car, receiver, loading }) => {
  return {
    customer,
    company,
    transconfirm,
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
    record: {},
    updateOrderModalVisible: false,
    btnSearchClicked: false,
    ...customerAutoCompleteState,
  };

  ButtonClicked = false;

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
      sorter: true,
      dataIndex: 'sendcustomer_name',
      width: '80px',
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
      dataIndex: 'trans_real',
      sorter: true,
      width: '80px',
    },
    {
      title: '折后运费',
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
      sorter: true,
      width: '80px',
    },
    {
      title: '送货费',
      dataIndex: 'deliver_amount',
      sorter: true,
      width: '80px',
    },
    {
      title: '保价费',
      dataIndex: 'insurance_fee',
      sorter: true,
      width: '80px',
    },
    {
      title: '货物名称',
      dataIndex: 'order_name',
      sorter: true,
      width: '200px',
    },
    {
      title: '录票时间',
      dataIndex: 'create_date',
      render: val => <span>{(val && moment(val).format('YYYY-MM-DD HH:mm:ss')) || ''}</span>,
      width: '190px',
    },
    {
      title: '发车时间',
      dataIndex: 'depart_date',
      render: val => <span>{(val && moment(val).format('YYYY-MM-DD HH:mm:ss')) || ''}</span>,
      width: '190px',
    },
    {
      title: '结算时间',
      dataIndex: 'settle_date',
      render: val => <span>{(val && moment(val).format('YYYY-MM-DD HH:mm:ss')) || ''}</span>,
      width: '190px',
    },
    {
      title: '结算人',
      dataIndex: 'settle_user_name',
      width: '80px',
    },
    {
      title: '站点',
      dataIndex: 'site_name',
      sorter: true,
      width: '80px',
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
    const branchCompanyList = await dispatch({
      type: 'company/getBranchCompanyList',
      payload: CacheCompany,
    });

    await dispatch({
      type: 'site/getSiteListAction',
      payload: {},
    });

    fetchSendCustomerList(this, {});

    // 初始渲染的是否，先加载第一个分公司的收货人信息
    if (branchCompanyList && branchCompanyList.length > 0) {
      this.setState({
        currentCompany: branchCompanyList[0],
      });
    }

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

  onSiteSelect = async (value, option) => {
    const {
      dispatch,
      site: { siteList },
    } = this.props;

    const currentSite = siteList.filter(item => {
      if (item.site_id == value) {
        return item;
      }
    });
    if (currentSite.length > 0) {
      this.setState({
        currentSite: currentSite[0],
      });
    }
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
  };

  handleSearch = e => {
    e && e.preventDefault();
    this.setState({ current: 1 });
    this.getOrderList();
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
    const { current, pageSize, btnSearchClicked } = this.state;

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

      // TODO:回付运费有货款的订单不在这里确认运费，而是在下账的时候减去运费
      fieldsValue.trans_status = 0;
      if (!fieldsValue.trans_type) {
        fieldsValue.trans_type = 9;
      }

      fieldsValue = await setCustomerFieldValue(this, fieldsValue);

      const searchParams = Object.assign({ filter: fieldsValue }, data);

      await dispatch({
        type: 'transconfirm/getOrderListAction',
        payload: { pageNo: pageNo || current, pageSize, ...searchParams },
      });

      await dispatch({
        type: 'transconfirm/getOrderStatisticAction',
        payload: { ...searchParams },
      });

      this.setState({
        btnSearchClicked: false,
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

  onConfirmTransModal = () => {
    const { selectedRows, currentSite = CacheSite } = this.state;
    // 计算需要确认的运费
    const account = getSelectedAccount(selectedRows);
    Modal.confirm({
      title: '确认',
      content: `确定确认所选订单的运费吗(总计：${account.totalXianInsurance +
        account.totalXianSettleTransFunds})？`,
      okText: '确认',
      cancelText: '取消',
      onOk: this.onConfirmTrans,
    });
  };

  onConfirmTrans = async () => {
    if (this.ButtonClicked) {
      return;
    }
    this.ButtonClicked = true;
    setTimeout(() => {
      this.ButtonClicked = false;
    }, 2000);

    const { dispatch } = this.props;
    const { selectedRows, currentSite = CacheSite } = this.state;
    const orderIds = selectedRows.map(item => {
      return item.order_id;
    });
    const order = { order_id: orderIds, company_id: CacheCompany.company_id };

    const result = await dispatch({
      type: 'transconfirm/confirmTransAction',
      payload: order,
    });
    if (result.code == 0) {
      message.success('确认成功！');
      setTimeout(() => {
        this.handleSearch();
      }, 1000);
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

  onTransSign = () => {
    Modal.confirm({
      title: '确认',
      content: '确定要签字吗？',
      okText: '确认',
      cancelText: '取消',
      onOk: this.onTransSignOk,
    });
  };

  onTransSignOk = async () => {
    const { dispatch } = this.props;
    const { selectedRows } = this.state;
    const orderIds = selectedRows.map(item => {
      return item.order_id;
    });
    let result = await dispatch({
      type: 'transconfirm/signAction',
      payload: { order_id: orderIds },
    });

    if (result.code == 0) {
      message.success('签字成功！');
      this.handleSearch();
    } else {
      message.error(result.msg);
    }
  };

  onCancelTransSign = () => {
    Modal.confirm({
      title: '确认',
      content: '确定要取消签字吗？',
      okText: '确认',
      cancelText: '取消',
      onOk: this.onCancelTransSignOk,
    });
  };

  onCancelTransSignOk = async () => {
    const { dispatch } = this.props;
    const { selectedRows } = this.state;
    const orderIds = selectedRows.map(item => {
      return item.order_id;
    });
    let result = await dispatch({
      type: 'transconfirm/cancelSignAction',
      payload: { order_id: orderIds },
    });

    if (result.code == 0) {
      message.success('取消签字成功！');
      this.handleSearch();
    } else {
      message.error(result.msg);
    }
  };

  // 已结算账目核对中，计算付款日期
  onRowClick = (record, index, event) => {};

  tableFooter = () => {
    const {
      transconfirm: {
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
        <span>实收货款：{totalRealOrderAmount || '0'}</span>
        <span className={styles.footerSplit}>运费总额：{totalTransAmount || '0'}</span>
        <span className={styles.footerSplit}>西安运费：{totalXianTransAmount || '0'}</span>
        <span className={styles.footerSplit}>垫付货款：{totalAdvancepayAmount || '0'}</span>
        <span className={styles.footerSplit}>西安保费：{totalXianInsurence || '0'}</span>
        <span className={styles.footerSplit}>票数：{total || '0'}</span>
      </div>
    );
  };

  renderSimpleForm() {
    const {
      form: { getFieldDecorator },
      customer: { getCustomerList, sendCustomerList },
      company: { branchCompanyList },
      site: { siteList },
    } = this.props;
    const { btnSearchClicked } = this.state;
    const companyOption = {};

    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <FormItem label="分公司">
          {getFieldDecorator('company_id', companyOption)(
            <Select
              placeholder="全部"
              onSelect={this.onCompanySelect}
              style={{ width: '200px' }}
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
          {getFieldDecorator('site_id', {})(
            <Select
              placeholder="全部"
              style={{ width: '150px' }}
              onSelect={this.onSiteSelect}
              allowClear
            >
              {(CacheSite.site_type == 3 ? siteList : [CacheSite]).map(ele => {
                return (
                  <Option key={ele.site_id} value={ele.site_id}>
                    {ele.site_name}
                  </Option>
                );
              })}
            </Select>
          )}
        </FormItem>
        <FormItem label="运费">
          {getFieldDecorator('trans_type', {})(
            <Select placeholder="全部" style={{ width: '150px' }} allowClear>
              <Option value={1}>现付</Option>
              <Option value={2}>回付</Option>
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
        <FormItem label="发货人电话">
          {getFieldDecorator('sendcustomer_mobile', {})(
            <Input placeholder="请输入" style={{ width: '150px' }} />
          )}
        </FormItem>
        <FormItem label="运单号">
          {getFieldDecorator('order_code', {})(
            <Input placeholder="请输入" style={{ width: '250px' }} allowClear />
          )}
        </FormItem>
        <FormItem label="有无货款">
          {getFieldDecorator('order_amount', { initialValue: -1 })(
            <Select placeholder="全部" style={{ width: '100px' }} allowClear>
              <Option value={-2}>无</Option>
              <Option value={-1}>有</Option>
            </Select>
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
      transconfirm: { orderList, total, totalOrderAmount, totalTransAmount },
      loading,
    } = this.props;

    const { selectedRows, current, pageSize, updateOrderModalVisible, record } = this.state;
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
                  <Button onClick={this.onConfirmTransModal}>确认运费</Button>
                  <Button onClick={this.onTransSign}>签字</Button>
                  <Button onClick={this.onCancelTransSign}>取消签字</Button>
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
              rowClassNameHandler={(record, index) => {
                return record.trans_sign == 1 ? styles.signColor : '';
              }}
              onDoubleClickHander={this.onRowDoubleClick}
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
      </div>
    );
  }
}

export default TableList;
