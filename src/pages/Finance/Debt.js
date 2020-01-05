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
import styles from './Finance.less';
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
      currentDebtUserName: '',
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

  onAddHandler = () => {
    const { addFormDataHandle, form, debtTypes, debtUserList } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      let debtType;
      debtTypes.forEach(item => {
        if (item.debttype_id == fieldsValue['debttype_id']) {
          debtType = item;
        }
      });
      // 如果选择了类型，则添加时带上类型名称
      if (!debtType) {
        fieldsValue.debttype = fieldsValue.debttype_id;
        fieldsValue.debttype_id = 0;
      } else {
        fieldsValue.debttype_id = Number(fieldsValue.debttype_id);
        fieldsValue.debttype = debtType.debttype;
        fieldsValue.debttype_type = debtType.debttype_type;
      }

      // 如果姓名不在列表中，则使用姓名查询
      let debtUser;
      debtUserList.forEach(item => {
        if (item.debtuser_id == fieldsValue.debtuser_id) {
          debtUser = item;
        }
      });
      if (!debtUser) {
        fieldsValue.debtuser_name = fieldsValue.debtuser_id;
        fieldsValue.debtuser_id = 0;
      } else {
        fieldsValue.debtuser_name = debtUser.debtuser_name;
      }

      addFormDataHandle(fieldsValue);
    });
  };

  renderCustomerOption = item => {
    const AutoOption = AutoComplete.Option;
    return (
      <AutoOption key={item.debttype_id} debttype_id={item.debttype_id} text={item.debttype}>
        {item.debttype}
      </AutoOption>
    );
  };

  onDebtTypeSelect = value => {
    const { debtTypes = [], form } = this.props;
    debtTypes.forEach(item => {
      if (item.debttype_id == value) {
        form.setFieldsValue({
          debttype_type: item.debttype_type,
        });
      }
    });
  };

  onDebtUserSearch = async value => {
    if (value) {
      this.setState({
        currentDebtUserName: value,
      });
    }
  };

  onDebtUserBlur = value => {
    const { form, debtUserList } = this.props;
    const { currentDebtUserName } = this.state;

    let curCustomer;
    for (let i = 0; i < debtUserList.length; i++) {
      const customer = debtUserList[i];
      if (
        customer.debtuser_name == currentDebtUserName ||
        customer.debtuser_name == value ||
        customer.debtuser_id == value
      ) {
        curCustomer = customer;
        break;
      }
    }
    if (!curCustomer) {
      form.setFieldsValue({
        debtuser_id: currentDebtUserName,
      });
    }
  };

  render() {
    const {
      modalVisible,
      onCancelHandler,
      onCustomerScroll,
      form,
      debtUserList = [],
      debtTypes = [],
    } = this.props;

    return (
      <Modal
        destroyOnClose
        title="添加收欠条"
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
              <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 14 }} label="类型">
                {form.getFieldDecorator('debttype_id', {
                  rules: [{ required: true, message: '请填写类型' }],
                })(
                  <Select
                    placeholder="请选择"
                    style={{ width: '150px' }}
                  >
                    {debtTypes.map(ele => {
                      return (
                        <Option key={ele.debttype_id} value={ele.debttype_id}>
                          {ele.debttype}
                        </Option>
                      );
                    })}
                  </Select>
                )}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
            <Col>
              <FormItem {...this.formItemLayout} label="姓名">
                {form.getFieldDecorator('debtuser_id', {
                  rules: [{ required: true, message: '请填写姓名' }],
                })(
                  <Select
                    placeholder="请选择"
                    onSelect={this.onGetCustomerSelect}
                    style={{ width: '150px' }}
                    allowClear
                    showSearch
                    onSearch={this.onDebtUserSearch}
                    onBlur={this.onDebtUserBlur}
                    optionLabelProp="children"
                    onPopupScroll={onCustomerScroll}
                    filterOption={(input, option) =>
                      option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                  >
                    {debtUserList.map(ele => {
                      return (
                        <Option key={ele.debtuser_id} value={ele.debtuser_id}>
                          {ele.debtuser_name}
                        </Option>
                      );
                    })}
                  </Select>
                )}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
            <Col>
              <FormItem {...this.formItemLayout} label="金额">
                {form.getFieldDecorator('debt_money', {
                  initialValue: '',
                  rules: [{ required: true, message: '请填写金额' }],
                })(<Input placeholder="请输入" style={{ width: '280px' }} />)}
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
@connect(({ customer, company, debt, site, loading }) => {
  return {
    customer,
    company,
    debt,
    site,
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
    currentDebtUserName: '',
    currentSite: {},
    addDebtModalVisible: false,
  };

  columns = [
    {
      title: '日期',
      dataIndex: 'debt_date',
      width: '170px',
      render: val => <span>{moment(Number(val || 0)).format('YYYY-MM-DD HH:mm:ss')}</span>,
    },
    {
      title: '金额',
      dataIndex: 'debt_money',
      width: '80px',
    },
    {
      title: '类型',
      dataIndex: 'debttype',
      width: '80px',
    },
    {
      title: '客户姓名',
      dataIndex: 'debtuser_name',
      width: '80px',
    },
    {
      title: '备注',
      width: '150px',
      dataIndex: 'remark',
    },
  ];

  async componentDidMount() {
    await this.fetchCompanySiteList(CacheCompany.company_id);
    await this.fetchDebtUserList();
    await this.fetchDebtTypeList({});
    // 页面初始化获取一次订单信息，否则会显示其他页面的缓存信息
    this.getOrderList();
  }

  handleSelectRows = rows => {
    this.setState({
      selectedRows: rows,
    });
  };

  fetchDebtTypeList = async () => {
    const { dispatch } = this.props;
    const { currentSite } = this.state;
    dispatch({
      type: 'debt/getDebtTypesAction',
      payload: {
        company_id: CacheCompany.company_id,
        site_id: (currentSite && currentSite.site_id) || 0,
      },
    });
  };

  fetchCompanySiteList = async companyId => {
    const { dispatch } = this.props;
    const siteList = await dispatch({
      type: 'site/getSiteListAction',
      payload: { pageNo: 1, pageSize: 100, filter: { company_id: companyId } },
    });

    if (siteList.length > 0) {
      this.setState({
        currentSite: siteList[0],
      });
    }
  };

  fetchDebtUserList = async companyId => {
    const { dispatch } = this.props;
    const { currentSite = {} } = this.state;
    const filter = { company_id: CacheCompany.company_id };
    if (currentSite.site_id) {
      filter.site_id = currentSite.site_id;
    }
    dispatch({
      type: 'debt/getDebtUsersAction',
      payload: {
        filter,
      },
    });
  };

  onSiteSelect = async (value, option) => {
    const {
      site: { normalSiteList = [] },
      dispatch,
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
    // 清空姓名列表
    dispatch({
      type: 'debt/resetDebtUserPageNoAction',
      payload: {},
    });
    this.fetchDebtTypeList();
    this.fetchDebtUserList();
  };

  handleSearch = e => {
    e && e.preventDefault();

    this.getOrderList();
  };

  /**
   * 获取订单信息
   */
  getOrderList = (data = {}, pageNo = 1) => {
    const {
      dispatch,
      form,
      debt: { debtUserList = [] },
    } = this.props;
    const { current, pageSize } = this.state;

    form.validateFields((err, fieldsValue) => {
      if (err) return;

      if (fieldsValue.debt_date && fieldsValue.debt_date.length > 0) {
        fieldsValue.debt_date = fieldsValue.debt_date.map(item => {
          return `${item.valueOf()}`;
        });
      }
      // 如果姓名不在列表中，则使用姓名查询
      let debtUserFlag = false;
      debtUserList.forEach(item => {
        if (item.debtuser_id == fieldsValue.debtuser_id) {
          debtUserFlag = true;
        }
      });
      if (!debtUserFlag) {
        fieldsValue.debtuser_name = fieldsValue.debtuser_id;
        delete fieldsValue.debtuser_id;
      }

      // 查询必须带上公司参数，否则查询出全部记录
      fieldsValue.company_id = CacheCompany.company_id;

      const searchParams = Object.assign({ filter: fieldsValue }, data);
      dispatch({
        type: 'debt/getDebtsAction',
        payload: { pageNo: pageNo || current, pageSize, ...searchParams },
      });

      dispatch({
        type: 'debt/getDebtsStatisticAction',
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

  // 添加收入
  addFormDataHandle = async data => {
    const { dispatch } = this.props;
    const { currentSite = {} } = this.state;

    const result = await dispatch({
      type: 'debt/addDebtAction',
      payload: {
        ...data,
        company_id: CacheCompany.company_id,
        site_id: currentSite.site_id,
      },
    });
    if (result && result.code == 0) {
      message.success('添加成功！');
      this.handleSearch();
      this.onCancelDebtClick();
      this.fetchDebtTypeList();
    } else {
      message.error(result.msg);
    }
  };

  // 打开添加对话框
  onAddDebtClick = async () => {
    const { currentSite } = this.state;
    // 添加前先选择客户、站点
    if (CacheCompany.company_type == 1 && (!currentSite || !currentSite.site_id)) {
      Modal.info({
        content: '请先选择站点',
      });
      return;
    }

    this.setState({
      addDebtModalVisible: true,
    });
  };

  onCancelDebtClick = async () => {
    this.setState({
      addDebtModalVisible: false,
    });
  };

  // 已结算账目核对中，计算付款日期
  onRowClick = (record, index, event) => { };

  // 编辑订单信息
  onRowDoubleClick = (record, index, event) => {
    // this.setState({
    //   record,
    // });
    // this.onEntrunkModalShow();
  };

  onDebtUserScroll = e => {
    if (e.target.scrollHeight <= e.target.scrollTop + e.currentTarget.scrollHeight) {
      this.fetchDebtUserList();
    }
  };

  onDebtUserSearch = async value => {
    if (value) {
      this.setState({
        currentDebtUserName: value,
      });
    }
  };

  onDebtUserBlur = value => {
    const {
      form,
      debt: { debtUserList },
    } = this.props;
    const { currentDebtUserName } = this.state;

    let curCustomer;
    for (let i = 0; i < debtUserList.length; i++) {
      const customer = debtUserList[i];
      if (
        customer.debtuser_name == currentDebtUserName ||
        customer.debtuser_name == value ||
        customer.debtuser_id == value
      ) {
        curCustomer = customer;
        break;
      }
    }
    if (!curCustomer) {
      form.setFieldsValue({
        debtuser_id: currentDebtUserName,
      });
    }
  };

  onDebtUserSelect = () => { };

  // 归零
  onSettleModal = () => {
    Modal.confirm({
      title: '确认',
      content: '确定将勾选记录归零吗？',
      okText: '确认',
      cancelText: '取消',
      onOk: this.onSettleDebt,
    });
  };

  onSettleDebt = async () => {
    const { dispatch } = this.props;
    const { selectedRows } = this.state;
    const debtIds = selectedRows.map(item => {
      return item.debt_id;
    });
    const result = await dispatch({
      type: 'debt/settleDebtAction',
      payload: { debt_id: debtIds },
    });
    if (result.code == 0) {
      message.success('归零成功！');
      this.handleSearch();
    } else {
      message.error(result.msg);
    }
  };

  tableFooter = () => {
    const {
      debt: { total, totalDebtMoney = 0, totalIncome, totalExpense },
    } = this.props;
    console.log(this.props.debt, totalExpense);
    return (
      <div className={styles.tableFooter}>
        <span>收入总额：{totalIncome || '0'}</span>
        <span className={styles.footerSplit}>支出总额：{totalExpense || '0'}</span>
        <span className={styles.footerSplit}>票数：{total || '0'}</span>
      </div>
    );
  };

  renderSimpleForm() {
    const {
      form: { getFieldDecorator },
      site: { entrunkSiteList = [], normalSiteList = [] },
      debt: { debtTypes, debtUserList },
    } = this.props;
    const { currentSite, currentDebtUserName } = this.state;
    const companyList = [CacheCompany];
    const companyOption = {};
    // 默认勾选第一个公司
    if (companyList.length > 0) {
      companyOption.initialValue = companyList[0].company_id || '';
    }
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        {CacheCompany.company_type == 1 && (
          <FormItem label="站点">
            {getFieldDecorator('site_id', { initialValue: CacheSite.site_id })(
              <Select
                placeholder="请选择"
                onSelect={this.onSiteSelect}
                onChange={this.onSiteChange}
                style={{ width: '100px' }}
              >
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
        <FormItem label="姓名">
          {getFieldDecorator('debtuser_id')(
            <Select
              placeholder="请选择"
              onSelect={this.onDebtUserSelect}
              style={{ width: '100px' }}
              allowClear
              showSearch
              onBlur={this.onDebtUserBlur}
              onSearch={this.onDebtUserSearch}
              optionLabelProp="children"
              onPopupScroll={this.onDebtUserScroll}
              filterOption={(input, option) =>
                option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {debtUserList.map(ele => {
                return (
                  <Option key={ele.debtuser_id} value={ele.debtuser_id}>
                    {ele.debtuser_name}
                  </Option>
                );
              })}
            </Select>
          )}
        </FormItem>
        <FormItem label="日期">
          {getFieldDecorator('debt_date', {})(<RangePicker style={{ width: '250px' }} />)}
        </FormItem>

        <FormItem label="分类">
          {getFieldDecorator('debttype_id')(
            <Select placeholder="请选择" style={{ width: '100px' }} allowClear>
              {debtTypes.map(ele => {
                return (
                  <Option key={ele.debttype_id} value={ele.debttype_id}>
                    {ele.debttype}
                  </Option>
                );
              })}
            </Select>
          )}
        </FormItem>
        <FormItem label="归零项">
          {getFieldDecorator('debt_status')(
            <Select placeholder="请选择" style={{ width: '80px' }} allowClear>
              <Option value={0}>未归零</Option>
              <Option value={1}>已归零</Option>
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
      debt: { debtList, total, debtTypes, debtUserList },
      loading,
    } = this.props;

    const { selectedRows, current, pageSize, addDebtModalVisible, record } = this.state;

    return (
      <div>
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>{this.renderForm()}</div>
            <div className={styles.tableListOperator}>
              <Button icon="plus" type="primary" onClick={() => this.onAddDebtClick(true)}>
                添加
              </Button>
              {selectedRows.length > 0 && (
                <span>
                  <Button onClick={this.onSettleModal}>归零</Button>
                </span>
              )}
            </div>
            <StandardTable
              selectedRows={selectedRows}
              loading={loading}
              className={styles.dataTable}
              scroll={{ x: 900, y: 350 }}
              rowKey="debt_id"
              data={{
                list: debtList,
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
                if (record.debt_status === 1) {
                  return styles.payColor;
                } else {
                  return '';
                }
              }}
            />
          </div>
          {this.tableFooter()}
        </Card>
        <AddFormDialog
          modalVisible={addDebtModalVisible}
          addFormDataHandle={this.addFormDataHandle}
          onCancelHandler={this.onCancelDebtClick}
          selectedRows={selectedRows}
          debtTypes={debtTypes}
          onCustomerScroll={this.onGetDebtUserScroll}
          debtUserList={debtUserList}
        />
      </div>
    );
  }
}

export default TableList;
