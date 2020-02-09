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
import styles from './Courier.less';
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
        courier: fieldsValue,
      };
      if (record.courier_id) {
        data.ids = [record.courier_id];
        fieldsValue.courier_id = record.courier_id;
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
    const { modalVisible, onCancelHandler, record, form, roleList } = this.props;
    return (
      <Modal
        destroyOnClose
        title="添加接货人"
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
              <FormItem {...this.formItemLayout} label="姓名">
                {form.getFieldDecorator('courier_name', {
                  initialValue: record.courier_name,
                  rules: [{ required: true, message: '请填写姓名' }],
                })(<Input placeholder="请输入" style={{ width: '280px' }} />)}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
            <Col>
              <FormItem {...this.formItemLayout} label="电话">
                {form.getFieldDecorator('courier_mobile', {
                  initialValue: record.courier_mobile,
                  rules: [{ required: true, message: '请填写电话' }],
                })(<Input placeholder="请输入" style={{ width: '280px' }} />)}
              </FormItem>
            </Col>
          </Row>
        </Form>
      </Modal>
    );
  }
}

/* eslint react/no-multi-comp:0 */
@connect(({ customer, courier, site, company, loading }) => {
  return {
    customer,
    courier,
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
      title: '姓名',
      dataIndex: 'courier_name',
      width: '100px',
    },
    {
      title: '用户电话',
      dataIndex: 'courier_mobile',
      width: '150px',
    },
  ];

  async componentDidMount() {
    this.fetchCompanySiteList();
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
      payload: { pageNo: 1, pageSize: 100, filter: { company_id: CacheCompany.company_id } },
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
    const { current, pageSize, currentSite } = this.state;

    form.validateFields((err, fieldsValue) => {
      if (err) return;
      const filter = { company_id: CacheCompany.company_id };
      if (currentSite && currentSite.site_id) {
        filter.site_id = currentSite.site_id;
      }
      dispatch({
        type: 'courier/getCourierListAction',
        payload: {
          pageNo: pageNo || current,
          pageSize,
          type: 'receiver',
          filter,
        },
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
  addFormDataHandle = async ({ courier = {}, ids }) => {
    const { dispatch } = this.props;
    const { currentSite = {} } = this.state;
    if (!courier.company_id) {
      courier.company_id = CacheCompany.company_id;
    }

    if (!courier.site_id && currentSite.site_id) {
      courier.site_id = currentSite.site_id;
      courier.site_name = currentSite.site_name;
    }

    const result = await dispatch({
      type: 'courier/updateCourierAction',
      payload: {
        courier,
        ids,
        type: 'receiver',
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
    const { currentSite = {} } = this.state
    if (!currentSite.site_id) {
      message.info('请选择站点')
      return
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
      site: { siteList },
      courier: { receiverList, receiverTotal },
      loading,
    } = this.props;

    const { selectedRows, current, pageSize, addModalVisible, record, currentCompany } = this.state;
    // 是否显示操作按钮
    let showOperateButton = true
    if (['site_searchuser'].indexOf(CacheRole.role_value) >= 0) {
      showOperateButton = false
    }
    return (
      <div>
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListOperator}>
              <Form onSubmit={this.handleSearch} layout="inline">
                <FormItem label="站点">
                  <Select
                    placeholder="全部"
                    onSelect={this.onSiteSelect}
                    onChange={this.onSiteChange}
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
                <FormItem>
                  <Button type="primary" htmlType="submit">
                    查询
                  </Button>
                </FormItem>
                <FormItem>
                  {showOperateButton && <Button icon="plus" type="primary" onClick={() => this.onAddClick(true)}>
                    添加
                  </Button>}
                </FormItem>
              </Form>
            </div>
            <StandardTable
              onRef={this.onRefTable}
              selectedRows={selectedRows}
              loading={loading}
              className={styles.dataTable}
              rowKey="courier_id"
              data={{
                list: receiverList,
                pagination: {
                  total: receiverTotal,
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
        </Card>
        <AddFormDialog
          modalVisible={addModalVisible}
          addFormDataHandle={this.addFormDataHandle}
          onCancelHandler={this.onCancelModalClick}
          record={record}
          selectedRows={selectedRows}
        />
      </div>
    );
  }
}

export default TableList;
