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
import styles from './Transfer.less';
import { locale } from '@/utils'
import { fileToObject } from 'antd/lib/upload/utils';
import { async } from 'q';
import { CacheSite, CacheUser, CacheCompany, CacheRole } from '../../utils/storage';

const { RangePicker } = DatePicker;
const FormItem = Form.Item;
const { Option } = Select;

@Form.create()
class AddFormDialog extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      abnormal_type_id: '',
      abnormal_type: '',
    };
    this.formItemLayout = {
      labelCol: {
        xs: { span: 18 },
        sm: { span: 5 },
      },
      wrapperCol: {
        xs: { span: 18 },
        sm: { span: 8 },
      },
    };
  }

  onAbnormalSelect = (value, option) => {
    console.log('####', option.props.abnormal_type_id);
    this.setState({
      abnormal_type_id: option.props.abnormal_type_id,
      abnormal_type: option.props.text,
    });
    console.log(value, option);
    console.log(this.state);
  };

  onAddHandler = () => {
    const { addFormDataHandle, form } = this.props;
    form.validateFields((err, fieldsValue) => {
      console.log(fieldsValue);
      if (err) return;

      addFormDataHandle({
        transfer_money: fieldsValue.transfer_money,
        transfer_status: 0,
        transfer_user: fieldsValue.transfer_user,
        remark: fieldsValue.remark,
      });
    });
  };

  renderCustomerOption = item => {
    const AutoOption = AutoComplete.Option;
    return (
      <AutoOption
        key={item.incometype_id}
        incometype_id={item.incometype_id}
        text={item.incometype}
      >
        {item.incometype}
      </AutoOption>
    );
  };

  render () {
    const { modalVisible, onCancelHandler, selectedRows, form, incomeTypes = [] } = this.props;
    return (
      <Modal
        destroyOnClose
        title="添加打款"
        visible={modalVisible}
        onCancel={() => onCancelHandler()}
        footer={[
          <Button key="btn-cancel" onClick={() => onCancelHandler()}>
            取 消
          </Button>,
          <Button key="btn-save" type="primary" onClick={this.onAddHandler}>
            保 存
          </Button>,
        ]}
        width={800}
        className={styles.modalForm}
      >
        <Form>
          <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
            <Col>
              <FormItem {...this.formItemLayout} label="打款金额">
                {form.getFieldDecorator('transfer_money', {
                  initialValue: '',
                  rules: [{ required: true, message: '请填写打款金额' }],
                })(<Input placeholder="请输入" style={{ width: '280px' }} />)}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
            <Col>
              <FormItem {...this.formItemLayout} label="打款人">
                {form.getFieldDecorator('transfer_user', { initialValue: '' })(
                  <Input placeholder="请输入" style={{ width: '280px' }} />
                )}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
            <Col>
              <FormItem labelCol={{ span: 3, offset: 2 }} label="备注">
                {form.getFieldDecorator('remark', { initialValue: '' })(
                  <Input placeholder="请输入" style={{ width: '280px' }} />
                )}
              </FormItem>
            </Col>
          </Row>
        </Form>
      </Modal>
    );
  }
}

/* eslint react/no-multi-comp:0 */
@connect(({ customer, company, transfer, site, car, receiver, loading }) => {
  return {
    customer,
    company,
    transfer,
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
    current: 1,
    pageSize: 20,
    record: {},
    currentSite: {},
    orderModalVisible: false,
    settleModalVisible: false,
    cancelConfirmTransferModalVisible: false,
    delTransferModalVisible: false,
    addIncomeModalVisible: false,
    signModalVisible: false,
    cancelSignModalVisible: false,
    downloadModalVisible: false,
    printModalVisible: false,
  };

  columns = [
    {
      title: '打款日期',
      dataIndex: 'transfer_date',
      render: val => (
        <span>{(val && moment(Number(val || 0)).format('YYYY-MM-DD HH:mm:ss')) || ''}</span>
      ),
      width: '170px',
    },
    {
      title: '打款金额',
      dataIndex: 'transfer_money',
      width: '80px',
    },
    {
      title: '打款人',
      dataIndex: 'transfer_user',
      width: '80px',
    },
    {
      title: '确认人',
      dataIndex: 'confirm_operator_name',
      width: '80px',
    },
    {
      title: '确认日期',
      dataIndex: 'confirm_date',
      render: val => (
        <span>{(val && moment(Number(val || 0)).format('YYYY-MM-DD HH:mm:ss')) || ''}</span>
      ),
      width: '170px',
    },
    {
      title: '打款公司',
      dataIndex: 'site_name',
      width: '80px',
    },
    {
      title: '备注',
      width: '150px',
      dataIndex: 'remark',
    },
  ];

  btnClicked = false

  async componentDidMount () {
    const { dispatch } = this.props;
    this.fetchCompanySiteList(CacheCompany.company_id);
    this.setState({ currentSite: CacheSite })
    this.handleSearch();
  }

  handleSelectRows = rows => {
    this.setState({
      selectedRows: rows,
    });
  };

  fetchIncomeTypeList = async ({ companyId, siteId }) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'income/getIncomeTypesAction',
      payload: { company_id: companyId, site_id: siteId },
    });
  };

  fetchCompanySiteList = async companyId => {
    const { dispatch } = this.props;
    dispatch({
      type: 'site/getSiteListAction',
      payload: { pageNo: 1, pageSize: 100, filter: { company_id: companyId } },
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

  handleSearch = e => {
    e && e.preventDefault();
    this.getOrderList();
  };

  onSiteSelect = async (value, option) => {
    const {
      site: { siteList = [] },
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

  // 调用table子组件
  onRefTable = (ref) => {
    this.standardTable = ref
  }

  /**
   * 获取订单信息
   */
  getOrderList = (data = {}, pageNo = 1) => {
    const { dispatch, form } = this.props;
    const { current, pageSize } = this.state;

    form.validateFields((err, fieldsValue) => {
      if (err) return;

      if (fieldsValue.transfer_date && fieldsValue.transfer_date.length > 0) {
        fieldsValue.transfer_date = fieldsValue.transfer_date.map(item => {
          return `${item.valueOf()}`;
        });
      }
      fieldsValue.company_id = CacheCompany.company_id;
      fieldsValue.transfer_type = 1

      const searchParams = Object.assign({ filter: fieldsValue }, data);
      dispatch({
        type: 'transfer/getTransferAction',
        payload: { pageNo: pageNo || current, pageSize, ...searchParams },
      });

      dispatch({
        type: 'transfer/getTransferStatisticAction',
        payload: { ...searchParams },
      });

      this.standardTable.cleanSelectedKeys()
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

  // 添加收入
  addFormDataHandle = async data => {
    if (this.btnClicked) {
      return
    }
    this.btnClicked = true
    setTimeout(() => { this.btnClicked = false }, 2000)

    const { dispatch } = this.props;
    const { currentSite = {} } = this.state;
    const result = await dispatch({
      type: 'transfer/addTransferAction',
      payload: {
        ...data,
        company_id: CacheCompany.company_id,
        company_name: CacheCompany.company_name,
        transfer_type: 1,
        site_id: currentSite.site_id,
        site_name: currentSite.site_name,
      },
    });
    if (result.code == 0) {
      message.success('添加成功！');
      this.handleSearch();
      this.onCancelIncomeClick();
    } else {
      message.error(result.msg);
    }
  };

  // 打开添加收入对话框
  onAddIncomeClick = async () => {
    const { currentSite = {} } = this.state;
    if (CacheCompany.company_id == 1 && !currentSite.site_id) {
      Modal.info({
        content: '请先选择站点',
      });
      return;
    }
    this.setState({
      addIncomeModalVisible: true,
    });
  };

  onCancelIncomeClick = async () => {
    this.setState({
      addIncomeModalVisible: false,
    });
  };

  // 确认打款
  onConfirmTransfer = async () => {
    const { selectedRows } = this.state;
    const confirmedRecords = selectedRows.filter(item => {
      return item.transfer_status == 1
    })
    if (confirmedRecords.length > 0) {
      Modal.info({
        content: '已经确认的打款不能重复确认！',
      });
      return
    }
    let accountStatistic = getSelectedAccount(selectedRows);
    this.setState({ accountStatistic, settleModalVisible: true });
  };

  onSettleCancel = async () => {
    this.setState({
      settleModalVisible: false,
    });
  };

  onSettleOk = async () => {
    if (this.btnClicked) {
      return
    }
    this.btnClicked = true
    setTimeout(() => { this.btnClicked = false }, 2000)

    const { dispatch } = this.props;
    const { selectedRows } = this.state;
    const orderIds = selectedRows.map(item => {
      return item.transfer_id;
    });
    let result = await dispatch({
      type: 'transfer/confirmTransferAction',
      payload: {
        transfer_id: orderIds,
      },
    });
    if (result.code == 0) {
      message.success('确认打款成功！');

      this.onSettleCancel();
      this.handleSearch()
    } else {
      message.error(result.msg);
    }
  };

  // 取消确认打款
  onCancelConfirmTransfer = async () => {
    const { selectedRows } = this.state;
    const confirmedRecords = selectedRows.filter(item => {
      return item.transfer_status == 0
    })
    if (confirmedRecords.length > 0) {
      Modal.info({
        content: '未确认的打款不能取消确认！',
      });
      return
    }
    let accountStatistic = getSelectedAccount(selectedRows);
    this.setState({ accountStatistic, cancelConfirmTransferModalVisible: true });
  };

  onCancelConfirmTransferCancel = async () => {
    this.setState({
      cancelConfirmTransferModalVisible: false,
    });
  };

  onCancelConfirmTransferOk = async () => {
    if (this.btnClicked) {
      return
    }
    this.btnClicked = true
    setTimeout(() => { this.btnClicked = false }, 2000)

    const { dispatch } = this.props;
    const { selectedRows } = this.state;
    const orderIds = selectedRows.map(item => {
      return item.transfer_id;
    });
    let result = await dispatch({
      type: 'transfer/cancelConfirmTransferAction',
      payload: {
        transfer_id: orderIds,
      },
    });
    if (result.code == 0) {
      message.success('取消确认打款成功！');

      this.handleSearch()
      this.onCancelConfirmTransferCancel();
    } else {
      message.error(result.msg);
    }
  };

  onDelTransfer = async () => {
    const { selectedRows } = this.state;
    const confirmedRecords = selectedRows.filter(item => {
      return item.transfer_status == 1
    })
    if (confirmedRecords.length > 0) {
      Modal.info({
        content: '已经确认的打款不能删除！'
      });
      return
    }
    let accountStatistic = getSelectedAccount(selectedRows);
    this.setState({ accountStatistic, delTransferModalVisible: true });
  };

  onDelConfirmTransferCancel = async () => {
    this.setState({
      delTransferModalVisible: false,
    });
  };

  onDelConfirmTransferOk = async () => {
    const { dispatch } = this.props;
    const { selectedRows } = this.state;
    const orderIds = selectedRows.map(item => {
      return item.transfer_id;
    });
    let result = await dispatch({
      type: 'transfer/delTransferAction',
      payload: {
        transfer_id: orderIds,
      },
    });
    if (result.code == 0) {
      message.success('删除确认打款成功！');

      this.onDelConfirmTransferCancel();
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
    let result = await dispatch({
      type: 'settle/cancelSignAction',
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
      type: 'settle/printAction',
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
      type: 'settle/downloadAction',
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

  // 已结算账目核对中，计算付款日期
  onRowClick = (record, index, event) => { };

  // 编辑订单信息
  onRowDoubleClick = (record, index, event) => {
    if (record.site_id != CacheSite.site_id) {
      return
    }
    this.setState({
      record,
    });
  };

  tableFooter = () => {
    const {
      transfer: { total, totalTransferAmount, totalTransferConfirmAmount, totalTransferUnConfirmAmount, totalShouldTransfer },
    } = this.props;
    return (
      <div className={styles.tableFooter}>
        <span>打款总额：{totalTransferAmount || 0}</span>
        <span className={styles.footerSplit}>
          未确认打款总额：{totalTransferUnConfirmAmount || 0}
        </span>
        <span className={styles.footerSplit}>
          已确认打款总额：{totalTransferConfirmAmount || 0}
        </span>
        <span className={styles.footerSplit}>
          应打款总额：{totalShouldTransfer || 0}
        </span>
        <span className={styles.footerSplit}>票数：{total || '0'}</span>
      </div>
    );
  };

  renderSimpleForm () {
    const {
      form: { getFieldDecorator },
      site: { siteList = [] },
      company: { branchCompanyList = [] },
    } = this.props;
    const companyOption = {};
    // 默认勾选第一个公司
    if (branchCompanyList.length > 0) {
      companyOption.initialValue = branchCompanyList[0].company_id || '';
    }
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <FormItem label="站点">
          {getFieldDecorator('site_id', { initialValue: CacheSite.site_id })(
            <Select
              placeholder="全部"
              style={{ width: '100px' }}
              onSelect={this.onSiteSelect}
              allowClear={CacheRole.role_value == 'site_pay' ? true : false}
            >
              {(CacheRole.role_value == 'site_pay' ? siteList : [CacheSite]).map(ele => {
                return (
                  <Option key={ele.site_id} value={ele.site_id}>
                    {ele.site_name}
                  </Option>
                );
              })}
            </Select>
          )}
        </FormItem>
        <FormItem label="确认打款">
          {getFieldDecorator('transfer_status', { initialValue: '0' })(
            <Select placeholder="全部" style={{ width: '100px' }} allowClear>
              <Option value="1">已确认打款</Option>
              <Option value="0">未确认打款</Option>
            </Select>
          )}
        </FormItem>
        <FormItem label="打款日期">
          {getFieldDecorator('transfer_date', {})(<RangePicker locale={locale} style={{ width: '250px' }} />)}
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
      transfer: { transferList, total },
      loading,
    } = this.props;

    const {
      selectedRows,
      accountStatistic,
      current,
      pageSize,
      orderModalVisible,
      settleModalVisible,
      cancelConfirmTransferModalVisible,
      delTransferModalVisible,
      addIncomeModalVisible,
      signModalVisible,
      cancelSignModalVisible,
      downloadModalVisible,
      printModalVisible,
      record,
    } = this.state;

    // 是否显示操作按钮
    let showOperateButton = false
    if (['site_pay'].indexOf(CacheRole.role_value) >= 0) {
      showOperateButton = true
    }

    let showAddOperateButton = true
    if (['site_searchuser', 'site_pay'].indexOf(CacheRole.role_value) >= 0) {
      showAddOperateButton = false
    }
    return (
      <div>
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>{this.renderForm()}</div>
            <div className={styles.tableListOperator}>
              {showAddOperateButton &&
                <Button icon="plus" type="primary" onClick={() => this.onAddIncomeClick(true)}>
                  添加
              </Button>}
              {selectedRows.length > 0 && showOperateButton && <div>
                <Button onClick={this.onConfirmTransfer}>打款确认</Button>
                <Button onClick={this.onCancelConfirmTransfer}>取消确认</Button>
              </div>}
              {selectedRows.length > 0 && showAddOperateButton && <Button onClick={this.onDelTransfer}>删除打款</Button>}
            </div>
            <StandardTable
              onRef={this.onRefTable}
              selectedRows={selectedRows}
              loading={loading}
              className={styles.dataTable}
              rowKey="transfer_id"
              data={{
                list: transferList,
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
                if (record.transfer_status === 1) {
                  return styles.payColor;
                }
              }}
            />
          </div>
          {this.tableFooter()}
        </Card>
        <AddFormDialog
          modalVisible={addIncomeModalVisible}
          addFormDataHandle={this.addFormDataHandle}
          onCancelHandler={this.onCancelIncomeClick}
          selectedRows={selectedRows}
        />
        <Modal
          title="确认打款"
          okText="确认"
          cancelText="取消"
          visible={settleModalVisible}
          onOk={this.onSettleOk}
          onCancel={this.onSettleCancel}
        >
          <p>{`您确定要对${selectedRows.length}条记录确认打款么？ `}</p>
        </Modal>
        <Modal
          title="取消确认打款"
          okText="确认"
          cancelText="取消"
          visible={cancelConfirmTransferModalVisible}
          onOk={this.onCancelConfirmTransferOk}
          onCancel={this.onCancelConfirmTransferCancel}
        >
          <p>{`您确定要对${selectedRows.length}条记录取消确认打款么？ `}</p>
        </Modal>
        <Modal
          title="删除确认打款"
          okText="确认"
          cancelText="取消"
          visible={delTransferModalVisible}
          onOk={this.onDelConfirmTransferOk}
          onCancel={this.onDelConfirmTransferCancel}
        >
          <p>{`您确定要删除${selectedRows.length}条确认打款记录么？ `}</p>
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
