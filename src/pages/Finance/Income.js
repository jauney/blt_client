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
import styles from './Finance.less';
const { RangePicker } = DatePicker;

const FormItem = Form.Item;
const { Option } = Select;
import { CacheSite, CacheUser, CacheCompany, CacheRole } from '../../utils/storage';

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
    this.setState({
      abnormal_type_id: option.props.abnormal_type_id,
      abnormal_type: option.props.text,
    });
  };

  onAddHandler = () => {
    const { addFormDataHandle, form, incomeTypes = [], record = {} } = this.props;
    form.validateFields(async (err, fieldsValue) => {
      if (err) return;
      let newIncomeType = true;
      let incomeType = '';
      incomeTypes.forEach(item => {
        if (item.incometype_id == fieldsValue['incometype_id']) {
          newIncomeType = false;
          incomeType = item.incometype;
        }
      });

      await addFormDataHandle({
        income_id: record.income_id || 0,
        income_money: Number(fieldsValue.income_money),
        incometype_id: newIncomeType ? '' : fieldsValue.incometype_id,
        incometype: newIncomeType ? fieldsValue.incometype_id : incomeType,
        income_reason: fieldsValue.income_reason,
        remark: fieldsValue.remark,
      });

      if (!record.income_id) {
        form.setFieldsValue({
          income_money: '',
          income_reason: '',
          remark: ''
        })
      }
    });
  };

  renderCustomerOption = item => {
    const AutoOption = AutoComplete.Option;
    return (
      <AutoOption
        key={item.incometype_id}
        incometype_id={item.incometype_id}
        value={`${item.incometype_id}`}
        text={item.incometype}
      >
        {item.incometype}
      </AutoOption>
    );
  };

  render() {
    const { modalVisible, onCancelHandler, record = {}, form, incomeTypes = [] } = this.props;
    return (
      <Modal
        destroyOnClose
        title="添加收入"
        okText="确认"
        cancelText="取消"
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
              <FormItem {...this.formItemLayout} label="收入金额">
                {form.getFieldDecorator('income_money', {
                  initialValue: record.income_money,
                  rules: [{ required: true, message: '请填写收入金额' }],
                })(<Input placeholder="请输入" style={{ width: '280px' }} />)}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
            <Col>
              <FormItem {...this.formItemLayout} label="收入类型">
                {form.getFieldDecorator('incometype_id', {
                  initialValue: `${record.incometype_id || ''}`,
                  rules: [{ required: true, message: '请填写收入类型' }],
                })(
                  <AutoComplete
                    size="large"
                    style={{ width: '280px' }}
                    dataSource={incomeTypes.map(this.renderCustomerOption)}
                    placeholder="请输入"
                    optionLabelProp="text"
                    allowClear
                  >
                    {' '}
                  </AutoComplete>
                )}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
            <Col>
              <FormItem {...this.formItemLayout} label="收入原因">
                {form.getFieldDecorator('income_reason', { initialValue: record.income_reason })(
                  <Input placeholder="请输入" style={{ width: '280px' }} />
                )}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
            <Col>
              <FormItem labelCol={{ span: 3, offset: 2 }} label="备注">
                {form.getFieldDecorator('remark', { initialValue: record.remark })(
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
@connect(({ customer, company, income, site, car, receiver, loading }) => {
  return {
    customer,
    company,
    income,
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
    currentCompany: {},
    currentSite: {},
    settleModalVisible: false,
    addIncomeModalVisible: false,
    signModalVisible: false,
    cancelSignModalVisible: false,
    downloadModalVisible: false,
    printModalVisible: false,
  };

  columns = [
    {
      title: '收入日期',
      dataIndex: 'income_date',
      width: '170px',
      sorter: true,
      render: val => <span>{val && moment(Number(val || 0)).format('YYYY-MM-DD HH:mm:ss')}</span>,
    },
    {
      title: '收入金额',
      width: '80px',
      sorter: true,
      dataIndex: 'income_money',
    },
    {
      title: '收入类型',
      width: '140px',
      dataIndex: 'incometype',
      sorter: true,
    },
    {
      title: '收入原因',
      width: '120px',
      dataIndex: 'income_reason',
      sorter: true,
    },
    {
      title: '站点',
      width: '80px',
      dataIndex: 'site_name',
      sorter: true,
    },
    {
      title: '分公司',
      width: '80px',
      dataIndex: 'company_name',
      sorter: true,
    },
    {
      title: '操作用户',
      dataIndex: 'operator_name',
      sorter: true,
    },
    {
      title: '备注',
      width: '150px',
      dataIndex: 'remark',
    },
  ];

  async componentDidMount() {
    const { dispatch } = this.props;

    this.fetchCompanySiteList(CacheCompany.company_id);

    await this.fetchIncomeTypeList();

    await dispatch({
      type: 'income/getIncomeDetailsAction',
      payload: {},
    });

    // 页面初始化获取一次订单信息，否则会显示其他页面的缓存信息
    this.getOrderList();
  }

  handleSelectRows = rows => {
    this.setState({
      selectedRows: rows,
    });
  };

  fetchIncomeTypeList = async () => {
    const { dispatch } = this.props;
    const filter = {};
    //
    // 查询类型必须带上公司参数
    filter.company_id = CacheCompany.company_id || -1;
    if (CacheCompany.company_type == 1) {
      filter.site_id = CacheSite.site_id;
    }
    const list = await dispatch({
      type: 'income/getIncomeTypesAction',
      payload: filter,
    });

    return list;
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

  onSiteSelect = async (value, option) => {
    const {
      site: { normalSiteList = [] },
    } = this.props;

    const currentSite = normalSiteList.filter(item => {
      if (item.site_id == value) {
        return item;
      }
    });
    if (currentSite.length > 0) {
      this.setState({
        currentSite: currentSite[0],
      });
    }
    // 重新获取收入类型
    this.fetchIncomeTypeList({ siteId: value });
  };

  handleSearch = e => {
    e && e.preventDefault();

    this.getOrderList();
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

      if (fieldsValue.income_date && fieldsValue.income_date.length > 0) {
        fieldsValue.income_date = fieldsValue.income_date.map(item => {
          return `${item.valueOf()}`;
        });
      }
      // 查询必须带上公司参数，否则查询出全部记录
      fieldsValue.company_id = CacheCompany.company_id;

      const searchParams = Object.assign({ filter: fieldsValue }, data);
      dispatch({
        type: 'income/getIncomesAction',
        payload: { pageNo: pageNo || current, pageSize, ...searchParams },
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

  // 添加收入
  addFormDataHandle = async data => {
    const { dispatch } = this.props;
    const income = {
      ...data,
      company_id: CacheCompany.company_id,
      company_name: CacheCompany.company_name,
    };
    if (CacheSite.site_id) {
      Object.assign(income, { site_id: CacheSite.site_id, site_name: CacheSite.site_name });
    }
    const result = await dispatch({
      type: 'income/addIncomeAction',
      payload: income,
    });
    if (result && result.code == 0) {
      message.success(income.income_id ? '编辑成功' : '添加成功！');
      income.income_id && this.onIncomeModalCancel()
      this.handleSearch()
      this.fetchIncomeTypeList()
    } else {
      message.error((result && result.msg) || '添加失败');
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
      record: {},
    });
  };

  onCancelIncomeClick = async () => {
    this.setState({
      addIncomeModalVisible: false,
    });
  };

  /**
   * 修改订单信息弹窗
   */
  onIncomeModalShow = () => {
    this.setState({
      addIncomeModalVisible: true,
    });
  };

  onIncomeModalCancel = () => {
    // setTimeout(() => this.addBtn.blur(), 0);
    this.setState({
      addIncomeModalVisible: false,
    });
  };

  // 已结算账目核对中，计算付款日期
  onRowClick = (record, index, event) => { };

  // 编辑订单信息
  onRowDoubleClick = (record, index, event) => {
    let startDate = moment(Number(record.income_date));
    let endDate = moment(Number(new Date().getTime()));
    let diffHours = endDate.diff(startDate, 'hours');

    if (diffHours >= 24) {
      message.error('超过24小时记录不可编辑');
      return;
    }
    this.setState({
      record,
    });
    this.onIncomeModalShow();
  };

  tableFooter = () => {
    const {
      income: { total, totalIncome }
    } = this.props;
    return (
      <div className={styles.tableFooter}>
        <span>收入总额：{totalIncome || '0'}</span>
        <span className={styles.footerSplit}>票数：{total || '0'}</span>
      </div>
    );
  };


  renderSimpleForm() {
    const {
      form: { getFieldDecorator },
      site: { entrunkSiteList = [], normalSiteList = [] },
      company: { branchCompanyList = [] },
      income: { incomeTypes = [] },
    } = this.props;
    const companyOption = {};
    // 默认勾选第一个公司
    if (branchCompanyList.length > 0) {
      companyOption.initialValue = branchCompanyList[0].company_id || '';
    }

    const dateFormat = 'YYYY/MM/DD';
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        {CacheCompany.company_type == 1 && (
          <FormItem label="站点">
            {getFieldDecorator('site_id', { initialValue: CacheSite.site_id })(
              <Select placeholder="全部" onSelect={this.onSiteSelect} style={{ width: '150px' }}>
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

        <FormItem label="收入日期">
          {getFieldDecorator('income_date', { initialValue: [moment(new Date(), 'YYYY-MM-DD'), moment(new Date(), 'YYYY-MM-DD')] })(<RangePicker style={{ width: '250px' }} />)}
        </FormItem>

        <FormItem label="收入分类">
          {getFieldDecorator('incometype_id')(
            <Select placeholder="全部" style={{ width: '150px' }} allowClear>
              {incomeTypes.map(ele => {
                return (
                  <Option key={ele.incometype_id} value={ele.incometype_id}>
                    {ele.incometype}
                  </Option>
                );
              })}
            </Select>
          )}
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
      income: { incomeList, total, incomeTypes, totalIncome },
      loading,
    } = this.props;

    const {
      selectedRows,
      current,
      pageSize,
      addIncomeModalVisible,
      downloadModalVisible,
      printModalVisible,
      record,
    } = this.state;

    // 是否显示操作按钮
    let showOperateButton = true
    if (['site_searchuser', 'site_admin'].indexOf(CacheRole.role_value) >= 0) {
      showOperateButton = false
    }
    return (
      <div>
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>{this.renderForm()}</div>
            <div className={styles.tableListOperator}>
              {showOperateButton && < Button icon="plus" type="primary" onClick={() => this.onAddIncomeClick(true)}>
                添加
              </Button>}
            </div>
            <StandardTable
              onRef={this.onRefTable}
              selectedRows={selectedRows}
              loading={loading}
              className={styles.dataTable}
              rowKey="income_id"
              data={{
                list: incomeList,
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
            />
          </div>
          {this.tableFooter()}
        </Card>
        <AddFormDialog
          modalVisible={addIncomeModalVisible}
          addFormDataHandle={this.addFormDataHandle}
          onCancelHandler={this.onCancelIncomeClick}
          incomeTypes={incomeTypes}
          selectedRows={selectedRows}
          record={record}
        />
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
      </div >
    );
  }
}

export default TableList;
