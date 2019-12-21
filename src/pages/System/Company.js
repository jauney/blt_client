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
        xs: { span: 6 },
        sm: { span: 3 },
      },
      wrapperCol: {
        xs: { span: 30 },
        sm: { span: 20 },
      },
    };
  }

  onAbnormalSelect = (value, option) => {};

  onAddHandler = () => {
    const { addFormDataHandle, form, record = {} } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) {
        const ratios = ['1', '2', '3'];
        for (let i = 0; i < 3; i++) {
          const index = ratios[i];
          if (err[`sendfee_ratio_${index}`]) {
            const error = err[`sendfee_ratio_${index}`].errors[0] || {};
            message.error(error.message);
            return;
          }
        }
        return;
      }

      fieldsValue.trans_regional_ratio = Number(fieldsValue.trans_regional_ratio || 1);
      fieldsValue.remember_sender = Number(fieldsValue.remember_sender);
      fieldsValue.late_fee_days = Number(fieldsValue.late_fee_days);
      fieldsValue.late_fee_beginamount = Number(fieldsValue.late_fee_beginamount);
      fieldsValue.late_fee_rate = Number(fieldsValue.late_fee_rate);
      fieldsValue.rewards_24h = Number(fieldsValue.rewards_24h);
      fieldsValue.rewards_48h = Number(fieldsValue.rewards_48h);
      fieldsValue.rewards_72h = Number(fieldsValue.rewards_72h);
      fieldsValue.alarm_days = Number(fieldsValue.alarm_days);
      fieldsValue.agency_fee = Number(fieldsValue.agency_fee);
      fieldsValue.bonus_type = Number(fieldsValue.bonus_type);
      fieldsValue.sendfee_ratio = Number(fieldsValue[`sendfee_ratio_${fieldsValue.bonus_type}`]);
      fieldsValue.unsendfee_ratio = Number(
        fieldsValue[`unsendfee_ratio_${fieldsValue.bonus_type}`]
      );
      ['1', '2', '3'].forEach(index => {
        delete fieldsValue[`sendfee_ratio_${index}`];
        delete fieldsValue[`unsendfee_ratio_${index}`];
      });
      const data = {
        company: fieldsValue,
      };
      if (record.company_id) {
        data.ids = [record.company_id];
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
        title="添加公司"
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
        width={900}
        className={styles.modalForm}
      >
        <Form>
          <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
            <Col>
              <FormItem {...this.formItemLayout} label="公司名称">
                {form.getFieldDecorator('company_name', {
                  initialValue: record.company_name,
                  rules: [{ required: true, message: '请填写公司名称' }],
                })(<Input placeholder="请输入" style={{ width: '280px' }} />)}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
            <Col>
              <FormItem {...this.formItemLayout} label="应打款">
                {form.getFieldDecorator('bonus_type', {
                  initialValue: record.bonus_type,
                  rules: [
                    { required: true, message: '请选择应打款' },
                    { pattern: /^\d+(\.\d+)?$/, message: '应打款格式错误' },
                  ],
                })(
                  <Radio.Group>
                    <Radio value={1}>
                      <strong>平分法：</strong> (运费总额-大车运费)/2 + 送货运费 ✕
                      {form.getFieldDecorator('sendfee_ratio_1', {
                        initialValue: record.bonus_type == 1 ? record.sendfee_ratio || 0.06 : 0.06,
                        rules: [
                          { required: true, message: '请填写送货运费率' },
                          { pattern: /^\d+(\.\d+)?$/, message: '送货运费率格式错误' },
                        ],
                      })(<Input placeholder="" style={{ width: '60px' }} />)}
                      + 不送货运费 ✕
                      {form.getFieldDecorator('unsendfee_ratio_1', {
                        initialValue:
                          record.bonus_type == 1 ? record.unsendfee_ratio || 0.11 : 0.11,
                        rules: [
                          { required: true, message: '请填写不送货运费率' },
                          { pattern: /^\d+(\.\d+)?$/, message: '不送货运费率格式错误' },
                        ],
                      })(<Input placeholder="" style={{ width: '60px' }} />)}
                      - 西安收运费 + 实收货款 - 打款总额
                    </Radio>
                    <Radio value={2}>
                      <strong>多劳多得：</strong> 运费总额 - 送货运费 ✕
                      {form.getFieldDecorator('sendfee_ratio_2', {
                        initialValue: record.bonus_type == 2 ? record.sendfee_ratio || 0.22 : 0.22,
                        rules: [
                          { required: true, message: '请填写送货运费率' },
                          { pattern: /^\d+(\.\d+)?$/, message: '送货运费率格式错误' },
                        ],
                      })(<Input placeholder="" style={{ width: '60px' }} />)}
                      - 不送货运费 ✕
                      {form.getFieldDecorator('unsendfee_ratio_2', {
                        initialValue:
                          record.bonus_type == 2 ? record.unsendfee_ratio || 0.12 : 0.12,
                        rules: [
                          { required: true, message: '请填写不送货运费率' },
                          { pattern: /^\d+(\.\d+)?$/, message: '不送货运费率格式错误' },
                        ],
                      })(<Input placeholder="" style={{ width: '60px' }} />)}
                      - 大车运费 - 西安收运费 + 实收货款 - 打款总额
                    </Radio>
                    <Radio value={3}>
                      <strong>优惠法：</strong> 送货运费 ✕
                      {form.getFieldDecorator('sendfee_ratio_3', {
                        initialValue: record.bonus_type == 3 ? record.sendfee_ratio || 0.25 : 0.25,
                        rules: [
                          { required: true, message: '请填写送货运费率' },
                          { pattern: /^\d+(\.\d+)?$/, message: '送货运费率格式错误' },
                        ],
                      })(<Input placeholder="" style={{ width: '60px' }} />)}
                      + 不送货运费 ✕
                      {form.getFieldDecorator('unsendfee_ratio_3', {
                        initialValue: record.bonus_type == 3 ? record.unsendfee_ratio || 0.3 : 0.3,
                        rules: [
                          { required: true, message: '请填写不送货运费率' },
                          { pattern: /^\d+(\.\d+)?$/, message: '不送货运费率格式错误' },
                        ],
                      })(<Input placeholder="" style={{ width: '60px' }} />)}
                      - 上站运费 + 实收货款 - 打款总额
                    </Radio>
                  </Radio.Group>
                )}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
            <Col>
              <FormItem {...this.formItemLayout} label="运费费率">
                {form.getFieldDecorator('trans_regional_ratio', {
                  initialValue: record.trans_regional_ratio || 1,
                  rules: [
                    { required: true, message: '' },
                    { pattern: /^\d+(\.\d+)?$/, message: '运费费率格式错误' },
                  ],
                })(<Input placeholder="" style={{ width: '80px' }} />)}
                <strong className="inner-form-label">&nbsp;代办费率：</strong>
                {form.getFieldDecorator('agency_fee', {
                  initialValue: record.agency_fee || 0.4,
                  rules: [
                    { required: true, message: '' },
                    { pattern: /^\d+(\.\d+)?$/, message: '代办费率格式错误' },
                  ],
                })(<Input placeholder="" style={{ width: '62px' }} />)}
                &permil;
                <strong className="inner-form-label">&nbsp;报警天数：</strong>
                {form.getFieldDecorator('alarm_days', {
                  initialValue: record.alarm_days || 0,
                  rules: [
                    { required: true, message: '' },
                    { pattern: /^\d+(\.\d+)?$/, message: '报警天数格式错误' },
                  ],
                })(<Input placeholder="" style={{ width: '80px' }} />)}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
            <Col>
              <FormItem {...this.formItemLayout} label="24H奖金">
                {form.getFieldDecorator('rewards_24h', {
                  initialValue: record.rewards_24h || 1,
                  rules: [
                    { required: true, message: '' },
                    { pattern: /^\d+(\.\d+)?$/, message: '奖金格式错误' },
                  ],
                })(<Input placeholder="" style={{ width: '62px' }} />)}
                &permil;
                <strong className="inner-form-label">&nbsp;48H奖金：</strong>
                {form.getFieldDecorator('rewards_48h', {
                  initialValue: record.rewards_48h || 0.04,
                  rules: [
                    { required: true, message: '' },
                    { pattern: /^\d+(\.\d+)?$/, message: '奖金格式错误' },
                  ],
                })(<Input placeholder="" style={{ width: '62px' }} />)}
                &permil;
                <strong className="inner-form-label">&nbsp;72H奖金：</strong>
                {form.getFieldDecorator('rewards_72h', {
                  initialValue: record.rewards_72h || 0.01,
                  rules: [
                    { required: true, message: '' },
                    { pattern: /^\d+(\.\d+)?$/, message: '奖金格式错误' },
                  ],
                })(<Input placeholder="" style={{ width: '80px' }} />)}
                &permil;
              </FormItem>
            </Col>
          </Row>
          <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
            <Col>
              <FormItem {...this.formItemLayout} label="滞纳金天数">
                {form.getFieldDecorator('late_fee_days', {
                  initialValue: record.late_fee_days || 12,
                  rules: [
                    { required: true, message: '' },
                    { pattern: /^\d+(\.\d+)?$/, message: '滞纳金格式错误' },
                  ],
                })(<Input placeholder="" style={{ width: '80px' }} />)}
                <strong className="inner-form-label">&nbsp;滞纳金起始金额：</strong>
                {form.getFieldDecorator('late_fee_beginamount', {
                  initialValue: record.late_fee_beginamount || 10,
                  rules: [
                    { required: true, message: '' },
                    { pattern: /^\d+(\.\d+)?$/, message: '滞纳金金额格式错误' },
                  ],
                })(<Input placeholder="" style={{ width: '80px' }} />)}
                <strong className="inner-form-label">&nbsp;滞纳金费率：</strong>
                {form.getFieldDecorator('late_fee_rate', {
                  initialValue: record.late_fee_rate || 0.5,
                  rules: [
                    { required: true, message: '' },
                    { pattern: /^\d+(\.\d+)?$/, message: '滞纳金费率格式错误' },
                  ],
                })(<Input placeholder="" style={{ width: '80px' }} />)}
                &permil;
              </FormItem>
            </Col>
          </Row>
          <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
            <Col>
              <FormItem {...this.formItemLayout} label="公司电话">
                {form.getFieldDecorator('company_mobile', {
                  initialValue: record.company_mobile,
                  rules: [{ required: true, message: '请填写公司电话' }],
                })(<Input placeholder="请输入" style={{ width: '280px' }} />)}
                <strong className="inner-form-label">&nbsp;送货人是否记忆：</strong>
                {form.getFieldDecorator('remember_sender', {
                  initialValue: record.remember_sender || 1,
                  rules: [{ required: true, message: '' }],
                })(
                  <Select placeholder="请选择" style={{ width: '100px' }}>
                    <Option value={1}>是</Option>
                    <Option value={0}>否</Option>
                  </Select>
                )}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
            <Col>
              <FormItem {...this.formItemLayout} label="地址">
                {form.getFieldDecorator('company_address', {
                  initialValue: record.company_address,
                })(<Input placeholder="请输入" style={{ width: '280px' }} />)}
                <strong className="inner-form-label">&nbsp;保价费率：</strong>
                {form.getFieldDecorator('insurance_ratio', {
                  initialValue: record.insurance_ratio || 2,
                  rules: [
                    { required: true, message: '' },
                    { pattern: /^\d+(\.\d+)?$/, message: '保价费率格式错误' },
                  ],
                })(<Input placeholder="" style={{ width: '80px' }} />)}
                &permil;
              </FormItem>
            </Col>
          </Row>
        </Form>
      </Modal>
    );
  }
}

/* eslint react/no-multi-comp:0 */
@connect(({ customer, company, loading }) => {
  return {
    customer,
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
      title: '公司名称',
      width: '100px',
      dataIndex: 'company_name',
    },
    {
      title: '公司电话',
      dataIndex: 'company_mobile',
      width: '130px',
    },
    {
      title: '地域系数',
      dataIndex: 'trans_regional_ratio',
      width: '80px',
    },
    {
      title: '地址',
      dataIndex: 'company_address',
      width: '100px',
    },
  ];

  async componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'company/getBranchCompanyList',
      payload: { company_type: 1 },
    });

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
        type: 'company/getBranchCompanyList',
        payload: { company_type: 1 },
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
  addFormDataHandle = async ({ company, ids }) => {
    const { dispatch } = this.props;

    const result = await dispatch({
      type: 'company/addCompany',
      payload: {
        company,
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
              rowKey="company_id"
              data={{
                list: branchCompanyList,
                pagination: {
                  total: branchTotal,
                  pageSize,
                  current,
                  onShowSizeChange: (currentPage, pageSize)=>{
                    this.setState({pageSize})
                  }
                },
              }}
              columns={this.columns}
              onSelectRow={this.handleSelectRows}
              onChange={this.handleStandardTableChange}
              onClickHander={this.onRowClick}
              onDoubleClickHander={this.onRowDoubleClick}
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
