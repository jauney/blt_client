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
    const { addFormDataHandle, form, debtTypes, customerList } = this.props;
    form.validateFields((err, fieldsValue) => {
      console.log(fieldsValue);
      if (err) return;
      let newDebtType = true;
      debtTypes.forEach(item => {
        if (item.debttype_id == fieldsValue['debttype_id']) {
          newDebtType = false;
        }
      });
      if (newDebtType) {
        fieldsValue.debttype = fieldsValue.debttype_id;
        fieldsValue.debttype_id = 0;
      } else {
        fieldsValue.debttype_id = Number(fieldsValue.debttype_id);
      }

      customerList.forEach(item => {
        if (item.customer_id == fieldsValue.customer_id) {
          fieldsValue.customer_name = item.customer_name;
        }
      });
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

  render() {
    const {
      modalVisible,
      onCancelHandler,
      onCustomerScroll,
      form,
      customerList = [],
      debtTypes = [],
    } = this.props;

    return (
      <Modal
        destroyOnClose
        title="添加收欠条"
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
              <FormItem {...this.formItemLayout} label="客户">
                {form.getFieldDecorator('customer_id')(
                  <Select
                    placeholder="请选择"
                    style={{ width: '150px' }}
                    showSearch
                    optionLabelProp="children"
                    onPopupScroll={onCustomerScroll}
                    filterOption={(input, option) =>
                      option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                  >
                    {customerList.map(ele => {
                      return (
                        <Option key={ele.customer_id} value={ele.customer_id}>
                          {ele.customer_name}
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
              <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 14 }} label="类型">
                {form.getFieldDecorator('debttype_id', {
                  rules: [{ required: true, message: '请填写类型' }],
                })(
                  <AutoComplete
                    size="large"
                    style={{ width: '280px' }}
                    dataSource={debtTypes.map(this.renderCustomerOption)}
                    onSelect={this.onDebtTypeSelect}
                    placeholder="请输入"
                    optionLabelProp="text"
                    allowClear
                  >
                    {' '}
                  </AutoComplete>
                )}
                {form.getFieldDecorator('debttype_type', { initialValue: 0 })(
                  <Select
                    placeholder="请选择"
                    style={{ width: '70px' }}
                    tabIndex={-1}
                    onSelect={this.onTransTypeSelect}
                  >
                    <Option value={0}>支</Option>
                    <Option value={1}>收</Option>
                  </Select>
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
    currentCompany: {},
    currentSite: {},
    orderModalVisible: false,
    addDebtModalVisible: false,
  };

  columns = [
    {
      title: '日期',
      dataIndex: 'debt_date',
      render: val => <span>{moment(Number(val || 0)).format('YYYY-MM-DD HH:mm:ss')}</span>,
    },
    {
      title: '金额',
      dataIndex: 'debt_money',
    },
    {
      title: '类型',
      dataIndex: 'debttype',
      sorter: true,
    },
    {
      title: '客户姓名',
      dataIndex: 'customer_name',
      sorter: true,
    },
    {
      title: '收/支',
      dataIndex: 'debttype_type',
      sorter: true,
      render: val => (val == 0 ? '支' : '收'),
    },
    {
      title: '备注',
      dataIndex: 'remark',
      sorter: true,
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

    this.fetchDebtTypeList({});

    dispatch({
      type: 'customer/getCustomerListAction',
      payload: {
        filter: {
          company_id: currentCompany.company_id || 0,
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

  handleSelectRows = rows => {
    this.setState({
      selectedRows: rows,
    });
  };

  fetchDebtTypeList = async () => {
    const { dispatch } = this.props;
    const { currentSite, currentCompany } = this.state;
    dispatch({
      type: 'debt/getDebtTypesAction',
      payload: {
        company_id: (currentCompany && currentCompany.company_id) || 0,
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

  fetchGetCustomerList = async companyId => {
    const { dispatch, branchCompanyList } = this.props;
    let { currentCompany } = this.state;
    if (!currentCompany || !currentCompany.company_id) {
      currentCompany = branchCompanyList && branchCompanyList[0];
    }

    dispatch({
      type: 'customer/getCustomerListAction',
      payload: {
        filter: { company_id: companyId || (currentCompany && currentCompany.company_id) || 0 },
      },
    });
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

  onCompanySelect = async (value, option) => {
    const {
      company: { branchCompanyList },
    } = this.props;
    // 获取当前公司的客户列表
    // this.fetchGetCustomerList(value);

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

    this.fetchDebtTypeList();
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

      if (fieldsValue.debt_date && fieldsValue.debt_date.length > 0) {
        fieldsValue.debt_date = fieldsValue.debt_date.map(item => {
          return `${item.valueOf()}`;
        });
      }
      // 查询必须带上公司参数，否则查询出全部记录
      fieldsValue.company_id = currentCompany.company_id;

      const searchParams = Object.assign({ filter: fieldsValue }, data);
      dispatch({
        type: 'debt/getDebtsAction',
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

    const result = await dispatch({
      type: 'debt/addDebtAction',
      payload: {
        ...data,
        company_id: currentCompany.company_id,
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
  onRowClick = (record, index, event) => {};

  // 编辑订单信息
  onRowDoubleClick = (record, index, event) => {
    this.setState({
      record,
    });
    this.onEntrunkModalShow();
  };

  onGetCustomerScroll = e => {
    if (e.target.scrollHeight <= e.target.scrollTop + e.currentTarget.scrollHeight) {
      this.fetchGetCustomerList();
    }
  };

  onSendCustomerScroll = e => {
    if (e.target.scrollHeight <= e.target.scrollTop + e.currentTarget.scrollHeight) {
      this.fetchSendCustomerList();
    }
  };

  renderSimpleForm() {
    const {
      form: { getFieldDecorator },
      site: { entrunkSiteList = [], normalSiteList = [] },
      company: { branchCompanyList = [] },
      customer: { getCustomerList, sendCustomerList },
      debt: { debtTypes },
    } = this.props;
    const { currentSite } = this.state;
    const companyList = [CacheCompany];
    const companyOption = {};
    // 默认勾选第一个公司
    if (companyList.length > 0) {
      companyOption.initialValue = companyList[0].company_id || '';
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
              >
                {companyList.map(ele => {
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
            {getFieldDecorator('site_id', { initialValue: currentSite.site_id })(
              <Select
                placeholder="请选择"
                onSelect={this.onSiteSelect}
                onChange={this.onSiteChange}
                style={{ width: '150px' }}
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

        {CacheCompany.company_type == 2 && (
          <FormItem label="客户">
            {getFieldDecorator('customer_id')(
              <Select
                placeholder="请选择"
                onSelect={this.onGetCustomerSelect}
                style={{ width: '150px' }}
                allowClear
                showSearch
                optionLabelProp="children"
                onPopupScroll={this.onGetCustomerScroll}
                filterOption={(input, option) =>
                  option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              >
                {getCustomerList.map(ele => {
                  return (
                    <Option key={ele.customer_id} value={ele.customer_id}>
                      {ele.customer_name}
                    </Option>
                  );
                })}
              </Select>
            )}
          </FormItem>
        )}

        {CacheCompany.company_type == 1 && (
          <FormItem label="客户">
            {getFieldDecorator('customer_id')(
              <Select
                placeholder="请选择"
                onSelect={this.onSendCustomerSelect}
                style={{ width: '150px' }}
                allowClear
                showSearch
                optionLabelProp="children"
                onPopupScroll={this.onSendCustomerScroll}
                filterOption={(input, option) =>
                  option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              >
                {sendCustomerList.map(ele => {
                  return (
                    <Option key={ele.customer_id} value={ele.customer_id}>
                      {ele.customer_name}
                    </Option>
                  );
                })}
              </Select>
            )}
          </FormItem>
        )}
        <FormItem label="支出日期">
          {getFieldDecorator('debt_date', {})(<RangePicker style={{ width: '250px' }} />)}
        </FormItem>

        <FormItem label="分类">
          {getFieldDecorator('debttype_id')(
            <Select placeholder="请选择" style={{ width: '150px' }} allowClear>
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
      debt: { debtList, total, debtTypes },
      customer: { sendCustomerList, getCustomerList },
      loading,
    } = this.props;

    const {
      selectedRows,
      current,
      pageSize,
      orderModalVisible,
      addDebtModalVisible,
      record,
    } = this.state;

    return (
      <div>
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>{this.renderForm()}</div>
            <div className={styles.tableListOperator}>
              <Button icon="plus" type="primary" onClick={() => this.onAddDebtClick(true)}>
                添加
              </Button>
            </div>
            <StandardTable
              selectedRows={selectedRows}
              loading={loading}
              className={styles.dataTable}
              scroll={{ x: 900 }}
              rowKey="debt_id"
              data={{
                list: debtList,
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
              footer={() => `欠条总额： `}
            />
          </div>
        </Card>
        <AddFormDialog
          modalVisible={addDebtModalVisible}
          addFormDataHandle={this.addFormDataHandle}
          onCancelHandler={this.onCancelDebtClick}
          selectedRows={selectedRows}
          debtTypes={debtTypes}
          onCustomerScroll={
            CacheCompany.company_type == 1 ? this.onSendCustomerScroll : this.onGetCustomerScroll
          }
          customerList={CacheCompany.company_type == 1 ? sendCustomerList : getCustomerList}
        />
      </div>
    );
  }
}

export default TableList;
