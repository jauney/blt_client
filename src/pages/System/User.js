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
import styles from './System.less';
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

  onAbnormalSelect = (value, option) => { };

  onAddHandler = () => {
    const { addFormDataHandle, form, record = {} } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;

      const data = {
        user: fieldsValue,
      };
      if (record.user_id) {
        data.ids = [record.user_id];
        fieldsValue.user_id = record.user_id;
      }
      addFormDataHandle(data);
    });
  };

  renderCustomerOption = item => {
    const AutoOption = AutoComplete.Option;
    return (
      <AutoOption
        key={item.expensetype_id}
        expensetype_id={item.expensetype_id}
        text={item.expensetype}
      >
        {item.expensetype}
      </AutoOption>
    );
  };

  render() {
    const { modalVisible, onCancelHandler, record, form, roleList, currentCompany } = this.props;

    return (
      <Modal
        destroyOnClose
        title="添加用户"
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
              <FormItem {...this.formItemLayout} label="用户名">
                {form.getFieldDecorator('user_name', {
                  initialValue: record.user_name,
                  rules: [{ required: true, message: '请填写用户名' }],
                })(<Input placeholder="请输入" style={{ width: '280px' }} />)}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
            <Col>
              <FormItem {...this.formItemLayout} label="用户密码">
                {form.getFieldDecorator('user_pass', {
                  initialValue: record.user_pass ? '******' : '',
                  rules: [{ required: true, message: '请填写用户密码' }],
                })(<Input placeholder="请输入" style={{ width: '280px' }} />)}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
            <Col>
              <FormItem {...this.formItemLayout} label="用户角色">
                {form.getFieldDecorator('role_id', {
                  initialValue: (record.role && record.role.role_id) || '',
                  rules: [{ required: true, message: '请选择用户角色' }],
                })(
                  <Select placeholder="全部" style={{ width: '150px' }}>
                    {roleList.map(ele => {
                      return (
                        ele.company_type == currentCompany.company_type && (
                          <Option key={ele.role_id} value={ele.role_id}>
                            {ele.role_name}
                          </Option>
                        )
                      );
                    })}
                  </Select>
                )}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
            <Col>
              <FormItem {...this.formItemLayout} label="用户电话">
                {form.getFieldDecorator('user_mobile', {
                  initialValue: record.user_mobile,
                  rules: [{ required: true, message: '请填写用户电话' }],
                })(<Input placeholder="请输入" style={{ width: '280px' }} />)}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
            <Col>
              <FormItem {...this.formItemLayout} label="电脑锁定">
                {form.getFieldDecorator('lock_pc', {
                  initialValue: record.lock_pc,
                  rules: [{ required: true, message: '' }],
                })(<Select placeholder="" style={{ width: '80px' }}>
                  {[0, 1].map(ele => {
                    return (
                      <Option key={ele} value={ele}>
                        {ele == 0 ? '否' : '是'}
                      </Option>
                    );
                  })}
                </Select>)}
              </FormItem>
            </Col>
          </Row>
        </Form>
      </Modal>
    );
  }
}

/* eslint react/no-multi-comp:0 */
@connect(({ customer, user, site, company, loading }) => {
  return {
    customer,
    user,
    site,
    company,
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
    addModalVisible: false,
  };

  columns = [
    {
      title: '用户名',
      dataIndex: 'user_name',
      width: '80px',
    },
    {
      title: '用户电话',
      dataIndex: 'user_mobile',
      width: '130px',
    },
    {
      title: '站点',
      dataIndex: 'site_name',
      width: '100px',
    },
    {
      title: '角色',
      dataIndex: 'role.role_name',
      width: '100px',
    },
  ];

  async componentDidMount() {
    const { dispatch } = this.props;

    const companyList = await dispatch({
      type: 'company/getCompanyList',
      payload: { filter: {} },
    });
    await dispatch({
      type: 'user/getRoleListAction',
      payload: {},
    });

    this.setState({
      currentCompany: companyList[0],
    });
  }

  handleSelectRows = rows => {
    this.setState({
      selectedRows: rows,
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

  onCompanySelect = async (value, option) => {
    const {
      company: { companyList },
      form,
    } = this.props;

    // 获取当前公司的站点
    this.fetchCompanySiteList(value);

    const currentCompany = companyList.filter(item => {
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
    const { current, pageSize, currentCompany = {}, currentSite = {} } = this.state;

    form.validateFields((err, fieldsValue) => {
      if (err) return;
      const param = { company_id: currentCompany.company_id };
      if (currentCompany.company_type == 1 && currentSite.site_id) {
        param.site_id = currentSite.site_id;
      }
      dispatch({
        type: 'user/getUserListAction',
        payload: { pageNo: pageNo || current, pageSize, filter: param },
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

  // 添加支出
  addFormDataHandle = async ({ user, ids }) => {
    const { dispatch } = this.props;
    const { currentCompany = {}, currentSite = {} } = this.state;

    if (!user.company_id) {
      user.company_id = currentCompany.company_id;
    }
    if (!user.site_id && currentCompany.company_type == 1 && currentSite.site_id) {
      user.site_id = currentSite.site_id;
    }
    const result = await dispatch({
      type: 'user/addUserAction',
      payload: {
        user,
        ids,
      },
    });
    if (result && result.code == 0) {
      message.success('添加成功！');
      this.handleSearch();
      this.onCancelModalClick();
    } else {
      message.error((result && result.msg) || '添加失败');
    }
  };

  // 打开添加对话框
  onAddClick = async () => {
    const { currentCompany = {}, currentSite = {} } = this.state;
    if (!currentCompany.company_id) {
      Modal.info({
        content: '请先选择公司',
      });
      return;
    }

    if (currentCompany.company_type == 1 && !currentSite.site_id) {
      Modal.info({
        content: '请先选择站点',
      });
      return;
    }

    this.setState({
      addModalVisible: true,
      record: {},
    });
  };

  onCancelModalClick = async () => {
    this.setState({
      addModalVisible: false,
    });
  };

  /**
   * 修改订单信息弹窗
   */
  onModalShow = () => {
    this.setState({
      addModalVisible: true,
    });
  };

  onModalCancel = () => {
    // setTimeout(() => this.addBtn.blur(), 0);
    this.setState({
      addModalVisible: false,
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


  // 已结算账目核对中，计算付款日期
  onRowClick = (record, index, event) => { };

  // 编辑订单信息
  onRowDoubleClick = (record, index, event) => {
    this.setState({
      record,
    });
    this.onModalShow();
  };

  render() {
    const {
      form: { getFieldDecorator },
      company: { companyList },
      user: { userList, total, roleList },
      site: { siteList, siteTotal },
      loading,
    } = this.props;

    const { selectedRows, current, pageSize, addModalVisible, record, currentCompany } = this.state;
    const companyOption = {};
    // 默认勾选第一个公司
    if (companyList.length > 0) {
      companyOption.initialValue = companyList[0].company_id || '';
    }
    return (
      <div>
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListOperator}>
              <Form onSubmit={this.handleSearch} layout="inline">
                <FormItem label="公司">
                  {getFieldDecorator('company_id', companyOption)(
                    <Select
                      placeholder="全部"
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
                {currentCompany.company_type == 1 && (
                  <FormItem label="站点">
                    <Select
                      placeholder="全部"
                      onSelect={this.onSiteSelect}
                      style={{ width: '150px' }}
                      allowClear
                    >
                      {siteList.map(ele => {
                        return (
                          <Option key={ele.site_id} value={ele.site_id}>
                            {ele.site_name}
                          </Option>
                        );
                      })}
                    </Select>
                  </FormItem>
                )}
                <FormItem>
                  <Button type="primary" htmlType="submit">
                    查询
                  </Button>
                </FormItem>
                <FormItem>
                  <Button icon="plus" type="primary" onClick={() => this.onAddClick(true)}>
                    添加
                  </Button>
                </FormItem>
              </Form>
            </div>
            <StandardTable
              onRef={this.onRefTable}
              selectedRows={selectedRows}
              loading={loading}
              className={styles.dataTable}
              rowKey="user_id"
              data={{
                list: userList,
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
              footer={() => { }}
            />
          </div>
        </Card>
        <AddFormDialog
          modalVisible={addModalVisible}
          addFormDataHandle={this.addFormDataHandle}
          onCancelHandler={this.onCancelModalClick}
          record={record}
          selectedRows={selectedRows}
          roleList={roleList}
          currentCompany={currentCompany}
        />
      </div>
    );
  }
}

export default TableList;
