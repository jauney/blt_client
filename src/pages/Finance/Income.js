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
    console.log('####', option.props.abnormal_type_id);
    this.setState({
      abnormal_type_id: option.props.abnormal_type_id,
      abnormal_type: option.props.text,
    });
    console.log(value, option);
    console.log(this.state);
  };

  onAddHandler = () => {
    const { addFormDataHandle, form, incomeTypes = [] } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      let newIncomeType = true;
      let incomeType = '';
      incomeTypes.forEach(item => {
        if (item.incometype_id == fieldsValue['incometype_id']) {
          newIncomeType = false;
          incomeType = item.incometype;
        }
      });

      addFormDataHandle({
        income_money: fieldsValue.income_money,
        incometype_id: newIncomeType ? '' : fieldsValue.incometype_id,
        incometype: newIncomeType ? fieldsValue.incometype_id : incomeType,
        income_reason: fieldsValue.income_reason,
        remark: fieldsValue.income_reason,
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

  render() {
    const { modalVisible, onCancelHandler, selectedRows, form, incomeTypes = [] } = this.props;
    return (
      <Modal
        destroyOnClose
        title="添加收入"
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
                  initialValue: '',
                  rules: [{ required: true, message: '请填写收入金额' }],
                })(<Input placeholder="请输入" style={{ width: '280px' }} />)}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
            <Col>
              <FormItem {...this.formItemLayout} label="收入类型">
                {form.getFieldDecorator('incometype_id', {
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
                {form.getFieldDecorator('income_reason', { initialValue: '' })(
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
    orderModalVisible: false,
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
      render: val => <span>{val && moment(Number(val || 0)).format('YYYY-MM-DD HH:mm:ss')}</span>,
    },
    {
      title: '收入金额',
      dataIndex: 'income_money',
    },
    {
      title: '收入类型',
      dataIndex: 'incometype',
      sorter: true,
    },
    {
      title: '收入原因',
      dataIndex: 'income_reason',
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
    // 下站只显示当前分公司
    let branchCompanyList = [CacheCompany];

    let currentCompany = {};
    // 初始渲染的是否，先加载第一个分公司的收货人信息
    if (CacheCompany.company_type == 2 && branchCompanyList && branchCompanyList.length > 0) {
      currentCompany = branchCompanyList[0];
    } else {
      currentCompany = CacheCompany;
    }
    this.setState({
      currentCompany: currentCompany,
    });

    this.fetchCompanySiteList(currentCompany.company_id);

    this.fetchIncomeTypeList({});

    dispatch({
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

  fetchIncomeTypeList = async ({ siteId = -1 }) => {
    const { dispatch } = this.props;
    const { currentCompany } = this.state;
    const filter = {};
    //
    // 查询类型必须带上公司参数
    filter.company_id = currentCompany.company_id || -1;
    if (CacheCompany.company_type == 1) {
      filter.site_id = siteId;
    }
    const list = dispatch({
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

  onCompanySelect = async (value, option) => {
    const {
      company: { branchCompanyList },
      form,
    } = this.props;
    // 获取当前公司的客户列表
    // this.fetchGetCustomerList(value);

    // 获取当前公司的站点
    this.fetchCompanySiteList(value);

    // 重新获取收入类型
    this.fetchIncomeTypeList({ companyId: value });
    // 清空勾选的收入类型
    form.setFieldsValue({
      income_type_id: '',
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
    console.log(normalSiteList, value);
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

  /**
   * 获取订单信息
   */
  getOrderList = (data = {}, pageNo = 1) => {
    const { dispatch, form } = this.props;
    const { current, pageSize, currentCompany } = this.state;

    form.validateFields((err, fieldsValue) => {
      if (err) return;

      if (fieldsValue.income_date && fieldsValue.income_date.length > 0) {
        fieldsValue.income_date = fieldsValue.income_date.map(item => {
          return `${item.valueOf()}`;
        });
      }
      // 查询必须带上公司参数，否则查询出全部记录
      fieldsValue.company_id = currentCompany.company_id;

      const searchParams = Object.assign({ filter: fieldsValue }, data);
      dispatch({
        type: 'income/getIncomesAction',
        payload: { pageNo: pageNo || current, pageSize, ...searchParams },
      });

      // dispatch({
      //   type: 'abnormal/getSiteOrderStatisticAction',
      //   payload: { ...searchParams },
      // });
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

    const { currentCompany = {}, currentSite = {} } = this.state;
    console.log(currentCompany, currentSite);
    const result = await dispatch({
      type: 'income/addIncomeAction',
      payload: {
        ...data,
        company_id: currentCompany.company_id,
        company_name: currentCompany.company_name,
        site_id: currentSite.site_id,
        site_name: currentSite.site_name,
      },
    });
    if (result && result.code == 0) {
      message.success('添加成功！');

      this.onCancelIncomeClick();
    } else {
      message.error((result && result.msg) || '添加失败');
    }
  };

  // 打开添加收入对话框
  onAddIncomeClick = async () => {
    const { currentCompany = {}, currentSite = {} } = this.state;
    if (currentCompany.company_id == 1 && !currentSite.site_id) {
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

  /**
   * 修改订单信息弹窗
   */
  onIncomeModalShow = () => {
    this.setState({
      orderModalVisible: true,
    });
  };

  onIncomeModalCancel = () => {
    // setTimeout(() => this.addBtn.blur(), 0);
    this.setState({
      orderModalVisible: false,
    });
  };

  // 更新订单
  onUpdateOrder = async (record, fieldsValue) => {
    const { dispatch } = this.props;
    console.log(record, fieldsValue);
    const result = await dispatch({
      type: 'order/updateOrderAction',
      payload: {
        order_id: record.order_id,
        order: { trans_real: fieldsValue.trans_real, order_real: fieldsValue.order_real },
      },
    });
    if (result.code == 0) {
      message.success('修改成功！');
      this.onIncomeModalCancel();
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
    this.onIncomeModalShow();
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
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        {CacheCompany.company_type == 2 && (
          <FormItem label="分公司">
            {getFieldDecorator('company_id', companyOption)(
              <Select
                placeholder="请选择"
                onSelect={this.onCompanySelect}
                style={{ width: '150px' }}
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
        )}

        {CacheCompany.company_type == 1 && (
          <FormItem label="站点">
            {getFieldDecorator('site_id', {})(
              <Select
                placeholder="请选择"
                onSelect={this.onSiteSelect}
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

        <FormItem label="收入日期">
          {getFieldDecorator('income_date', {})(<RangePicker style={{ width: '250px' }} />)}
        </FormItem>

        <FormItem label="一级分类">
          {getFieldDecorator('incometype_id')(
            <Select placeholder="请选择" style={{ width: '150px' }} allowClear>
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
      income: { incomeList, total, incomeTypes, totalIncomeAmount },
      loading,
    } = this.props;

    const {
      selectedRows,
      current,
      pageSize,
      orderModalVisible,
      addIncomeModalVisible,
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
              <Button icon="plus" type="primary" onClick={() => this.onAddIncomeClick(true)}>
                添加
              </Button>
            </div>
            <StandardTable
              selectedRows={selectedRows}
              loading={loading}
              className={styles.dataTable}
              scroll={{ x: 900 }}
              rowKey="income_id"
              data={{
                list: incomeList,
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
              footer={() => `收入总额：${totalIncomeAmount || ''}`}
            />
          </div>
        </Card>
        <AddFormDialog
          modalVisible={addIncomeModalVisible}
          addFormDataHandle={this.addFormDataHandle}
          onCancelHandler={this.onCancelIncomeClick}
          incomeTypes={incomeTypes}
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
