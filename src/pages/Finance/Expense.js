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
    const { addFormDataHandle, form, expenseTypes = [], record } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      let newExpenseType = true;
      let expenseType = '';
      expenseTypes.forEach(item => {
        if (item.expensetype_id == fieldsValue['expensetype_id']) {
          newExpenseType = false;
          expenseType = item.expensetype;
        }
      });

      addFormDataHandle({
        expense_id: record.expense_id || 0,
        expense_money: fieldsValue.expense_money,
        expensetype_id: newExpenseType ? '' : fieldsValue.expensetype_id,
        expensetype: newExpenseType ? fieldsValue.expensetype_id : expenseType,
        expense_reason: fieldsValue.expense_reason,
        remark: fieldsValue.expense_reason,
      });
    });
  };

  renderCustomerOption = item => {
    const AutoOption = AutoComplete.Option;
    return (
      <AutoOption
        key={item.expensetype_id}
        expensetype_id={item.expensetype_id}
        value={item.expensetype_id}
        text={item.expensetype}
      >
        {item.expensetype}
      </AutoOption>
    );
  };

  render() {
    const { modalVisible, onCancelHandler, record, form, expenseTypes = [] } = this.props;
    return (
      <Modal
        destroyOnClose
        title="添加支出"
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
              <FormItem {...this.formItemLayout} label="支出金额">
                {form.getFieldDecorator('expense_money', {
                  initialValue: record.expense_money,
                  rules: [{ required: true, message: '请填写支出金额' }],
                })(<Input placeholder="请输入" style={{ width: '280px' }} />)}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
            <Col>
              <FormItem {...this.formItemLayout} label="支出类型">
                {form.getFieldDecorator('expensetype_id', {
                  initialValue: record.expensetype_id,
                  rules: [{ required: true, message: '请填写支出类型' }],
                })(
                  <AutoComplete
                    size="large"
                    style={{ width: '280px' }}
                    dataSource={expenseTypes.map(this.renderCustomerOption)}
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
              <FormItem {...this.formItemLayout} label="支出原因">
                {form.getFieldDecorator('expense_reason', { initialValue: record.expense_reason })(
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
@connect(({ customer, company, expense, site, car, receiver, loading }) => {
  return {
    customer,
    company,
    expense,
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
    addExpenseModalVisible: false,
    signModalVisible: false,
    cancelSignModalVisible: false,
    downloadModalVisible: false,
    printModalVisible: false,
  };

  columns = [
    {
      title: '支出日期',
      dataIndex: 'expense_date',
      render: val => <span>{val && moment(Number(val || 0)).format('YYYY-MM-DD HH:mm:ss')}</span>,
    },
    {
      title: '支出金额',
      dataIndex: 'expense_money',
    },
    {
      title: '支出类型',
      dataIndex: 'expensetype',
      sorter: true,
    },
    {
      title: '支出原因',
      dataIndex: 'expense_reason',
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
      title: '操作用户',
      dataIndex: 'operator_name',
      sorter: true,
    },
    {
      title: '备注',
      dataIndex: 'remark',
    },
  ];

  async componentDidMount() {
    const { dispatch } = this.props;

    this.fetchCompanySiteList(CacheCompany.company_id);

    this.fetchExpenseTypeList({});

    dispatch({
      type: 'expense/getExpenseDetailsAction',
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

  fetchExpenseTypeList = async ({ siteId = -1 }) => {
    const { dispatch } = this.props;
    const filter = {};
    //
    // 查询类型必须带上公司参数
    filter.company_id = CacheCompany.company_id || -1;
    if (CacheCompany.company_type == 1) {
      filter.site_id = siteId;
    }
    const list = dispatch({
      type: 'expense/getExpenseTypesAction',
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

  onCompanySelect = async (value, option) => {
    const {
      company: { branchCompanyList },
      form,
    } = this.props;
    // 获取当前公司的客户列表
    // this.fetchGetCustomerList(value);

    // 获取当前公司的站点
    this.fetchCompanySiteList(value);

    // 重新获取支出类型
    this.fetchExpenseTypeList({ companyId: value });
    // 清空勾选的支出类型
    form.setFieldsValue({
      expense_type_id: '',
    });

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
    // 重新获取支出类型
    this.fetchExpenseTypeList({ siteId: value });
  };

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

      if (fieldsValue.expense_date && fieldsValue.expense_date.length > 0) {
        fieldsValue.expense_date = fieldsValue.expense_date.map(item => {
          return `${item.valueOf()}`;
        });
      }
      // 查询必须带上公司参数，否则查询出全部记录
      fieldsValue.company_id = CacheCompany.company_id;

      const searchParams = Object.assign({ filter: fieldsValue }, data);
      dispatch({
        type: 'expense/getExpensesAction',
        payload: { pageNo: pageNo || current, pageSize, ...searchParams },
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

  // 添加支出
  addFormDataHandle = async data => {
    const { dispatch } = this.props;

    const { currentSite = {} } = this.state;
    const result = await dispatch({
      type: 'expense/addExpenseAction',
      payload: {
        ...data,
        company_id: CacheCompany.company_id,
        company_name: CacheCompany.company_name,
        site_id: currentSite.site_id,
        site_name: currentSite.site_name,
      },
    });
    if (result && result.code == 0) {
      message.success('添加成功！');

      this.onCancelExpenseClick();
    } else {
      message.error((result && result.msg) || '添加失败');
    }
  };

  // 打开添加支出对话框
  onAddExpenseClick = async () => {
    const { currentSite = {} } = this.state;
    if (CacheCompany.company_id == 1 && !currentSite.site_id) {
      Modal.info({
        content: '请先选择站点',
      });
      return;
    }
    if (!CacheCompany.company_id) {
      Modal.info({
        content: '请先选择公司',
      });
      return;
    }

    this.setState({
      addExpenseModalVisible: true,
      record: {},
    });
  };

  onCancelExpenseClick = async () => {
    this.setState({
      addExpenseModalVisible: false,
    });
  };

  /**
   * 修改订单信息弹窗
   */
  onExpenseModalShow = () => {
    this.setState({
      addExpenseModalVisible: true,
    });
  };

  onExpenseModalCancel = () => {
    // setTimeout(() => this.addBtn.blur(), 0);
    this.setState({
      addExpenseModalVisible: false,
    });
  };

  onSiteChange = value => {
    console.log('site', value);
    if (!value) {
      this.setState({
        currentSite: {},
      });
    }
  };

  onCompanyChange = value => {
    console.log('company', value);
    if (!value) {
      this.setState({
        currentCompany: {},
      });
    }
  };

  // 更新订单
  onUpdateOrder = async (record, fieldsValue) => {
    const { dispatch } = this.props;
    console.log(record, fieldsValue);
    const result = await dispatch({
      type: 'order/updateOrderAction',
      payload: {
        orderIds: [record.order_id],
        order: { trans_real: fieldsValue.trans_real, order_real: fieldsValue.order_real },
      },
    });
    if (result.code == 0) {
      message.success('修改成功！');
      this.onExpenseModalCancel();
    } else {
      message.error(result.msg);
    }
  };

  // 已结算账目核对中，计算付款日期
  onRowClick = (record, index, event) => {};

  // 编辑订单信息
  onRowDoubleClick = (record, index, event) => {
    this.setState({
      record,
    });
    this.onExpenseModalShow();
  };

  renderSimpleForm() {
    const {
      form: { getFieldDecorator },
      site: { entrunkSiteList = [], normalSiteList = [] },
      company: { branchCompanyList = [] },
      expense: { expenseTypes = [] },
    } = this.props;
    const companyOption = {};
    // 默认勾选第一个公司
    if (branchCompanyList.length > 0) {
      companyOption.initialValue = branchCompanyList[0].company_id || '';
    }
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        {CacheCompany.company_type == 1 && (
          <FormItem label="站点">
            {getFieldDecorator('site_id', {})(
              <Select
                placeholder="请选择"
                onSelect={this.onSiteSelect}
                onChange={this.onSiteChange}
                style={{ width: '150px' }}
                allowClear
              >
                {normalSiteList.map(ele => {
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

        <FormItem label="支出日期">
          {getFieldDecorator('expense_date', {})(<RangePicker style={{ width: '250px' }} />)}
        </FormItem>

        <FormItem label="支出类型">
          {getFieldDecorator('expensetype_id')(
            <Select placeholder="请选择" style={{ width: '150px' }} allowClear>
              {expenseTypes.map(ele => {
                return (
                  <Option key={ele.expensetype_id} value={ele.expensetype_id}>
                    {ele.expensetype}
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
      expense: { expenseList, total, expenseTypes, totalExpenseAmount },
      loading,
    } = this.props;

    const {
      selectedRows,
      current,
      pageSize,
      addExpenseModalVisible,
      downloadModalVisible,
      printModalVisible,
      record,
    } = this.state;

    return (
      <div>
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>{this.renderForm()}</div>
            <div className={styles.tableListOperator}>
              <Button icon="plus" type="primary" onClick={() => this.onAddExpenseClick(true)}>
                添加
              </Button>
            </div>
            <StandardTable
              selectedRows={selectedRows}
              loading={loading}
              className={styles.dataTable}
              scroll={{ x: 900, y: 350 }}
              rowKey="expense_id"
              data={{
                list: expenseList,
                pagination: {
                  total,
                  pageSize,
                  current,
                },
              }}
              columns={this.columns}
              onSelectRow={this.handleSelectRows}
              onChange={this.handleStandardTableChange}
              onRow={(record, rowIndex) => {
                return {
                  onClick: event => {
                    this.onRowClick(record, rowIndex, event);
                  },
                  onDoubleClick: event => {
                    this.onRowDoubleClick(record, rowIndex, event);
                  },
                };
              }}
              rowClassName={(record, index) => {}}
              footer={() => `支出总额：${totalExpenseAmount || ''}`}
            />
          </div>
        </Card>
        <AddFormDialog
          modalVisible={addExpenseModalVisible}
          addFormDataHandle={this.addFormDataHandle}
          onCancelHandler={this.onCancelExpenseClick}
          expenseTypes={expenseTypes}
          record={record}
          selectedRows={selectedRows}
        />
        <Modal
          title="确认"
          visible={printModalVisible}
          onOk={this.onPrintOk}
          onCancel={this.onPrintCancel}
        >
          <p>您确认结账打印么？</p>
        </Modal>
        <Modal
          title="确认"
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
