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
    this.state = {};
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

  onAbnormalSelect = (value, option) => {};

  onAddHandler = () => {
    const { addFormDataHandle, form, record = {} } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      const data = {
        site: fieldsValue,
      };
      if (record.site_id) {
        data.ids = [record.site_id];
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
    const { modalVisible, onCancelHandler, record, form } = this.props;
    return (
      <Modal
        destroyOnClose
        title="添加站点"
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
              <FormItem {...this.formItemLayout} label="站点名称">
                {form.getFieldDecorator('site_name', {
                  initialValue: record.site_name,
                  rules: [{ required: true, message: '请填写站点名称' }],
                })(<Input placeholder="请输入" style={{ width: '280px' }} />)}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
            <Col>
              <FormItem {...this.formItemLayout} label="站点类型">
                {form.getFieldDecorator('site_type', {
                  initialValue: record.site_type || 1,
                  rules: [{ required: true, message: '请填写站点类型' }],
                })(
                  <Select placeholder="请选择" style={{ width: '150px' }}>
                    <Option key={1} value={1}>
                      普通站点
                    </Option>
                    <Option key={2} value={2}>
                      配载站
                    </Option>
                  </Select>
                )}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
            <Col>
              <FormItem {...this.formItemLayout} label="订单号前缀">
                {form.getFieldDecorator('site_orderprefix', {
                  initialValue: record.site_orderprefix,
                  rules: [{ required: true, message: '请填写该站点的订单号前缀' }],
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
@connect(({ site, company, loading }) => {
  return {
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
      title: '站点名称',
      dataIndex: 'site_name',
      width: '100px',
    },
    {
      title: '站点类型',
      dataIndex: 'site_type',
      width: '80px',
      render: val => {
        return val == 1 ? '普通站点' : '装配站';
      },
    },
    {
      title: '订单号前缀',
      dataIndex: 'site_orderprefix',
      width: '80px',
    },
  ];

  async componentDidMount() {
    const { dispatch } = this.props;

    // 页面初始化获取一次订单信息，否则会显示其他页面的缓存信息
    this.getOrderList();
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
      company: { branchCompanyList },
      form,
    } = this.props;

    // 获取当前公司的站点
    this.fetchCompanySiteList(value);

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
    const { current, pageSize, currentCompany } = this.state;

    form.validateFields((err, fieldsValue) => {
      if (err) return;

      dispatch({
        type: 'site/getSiteListAction',
        payload: {},
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
  addFormDataHandle = async ({ site, ids }) => {
    const { dispatch } = this.props;

    const result = await dispatch({
      type: 'site/addSite',
      payload: {
        site,
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
      this.onModalCancel();
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
    this.onModalShow();
  };

  render() {
    const {
      company: { branchCompanyList, branchTotal },
      site: { siteList = [], siteTotal = 0 },
      loading,
    } = this.props;

    const { selectedRows, current, pageSize, addModalVisible, record } = this.state;

    return (
      <div>
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListOperator}>
              <Button icon="plus" type="primary" onClick={() => this.onAddClick(true)}>
                添加
              </Button>
            </div>
            <StandardTable
              selectedRows={selectedRows}
              loading={loading}
              className={styles.dataTable}
              scroll={{ x: 900, y: 350 }}
              rowKey="site_id"
              data={{
                list: siteList,
                pagination: {
                  siteTotal,
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
              footer={() => {}}
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
