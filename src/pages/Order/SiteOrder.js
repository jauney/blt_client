import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import {
  Row,
  Col,
  Card,
  Form,
  Input,
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
} from 'antd';
import StandardTable from '@/components/StandardTable';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';

import styles from './SiteOrder.less';

const FormItem = Form.Item;
const { Step } = Steps;
const { TextArea } = Input;
const { Option } = Select;
const RadioGroup = Radio.Group;
const getValue = obj =>
  Object.keys(obj)
    .map(key => obj[key])
    .join(',');
const statusMap = ['default', 'processing', 'success', 'error'];
const status = ['关闭', '运行中', '已上线', '异常'];

const CreateForm = Form.create()(props => {
  const { modalVisible, form, handleAdd, handleModalVisible } = props;
  const {
    form: { getFieldDecorator },
  } = props;
  const okHandle = () => {
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      form.resetFields();
      handleAdd(fieldsValue);
    });
  };
  const formItemLayout = {
    labelCol: {
      xs: { span: 24 },
      sm: { span: 8 },
    },
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 16 },
    },
  };
  // label列可以放下4个字
  const formItemSmallLayout = {
    labelCol: {
      xs: { span: 25 },
      sm: { span: 9 },
    },
    wrapperCol: {
      xs: { span: 23 },
      sm: { span: 15 },
    },
  };

  const colLayout = {
    md: 8,
    sm: 24,
  };

  const colSmallLayout = {
    md: 4,
    sm: 20,
  };
  const col2Layout = {
    md: 10,
    sm: 26,
  };
  // colLargeLayout && formItemMiniLayout
  const colLargeLayout = {
    md: 16,
    sm: 32,
  };
  const formItemMiniLayout = {
    labelCol: {
      xs: { span: 22 },
      sm: { span: 6 },
    },
    wrapperCol: {
      xs: { span: 26 },
      sm: { span: 18 },
    },
  };
  return (
    <Modal
      destroyOnClose
      title="新建托运单"
      visible={modalVisible}
      onOk={okHandle}
      onCancel={() => handleModalVisible()}
      width={710}
    >
      <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
        <Col {...colLayout}>
          <FormItem {...formItemLayout} label="分公司">
            {getFieldDecorator('company')(
              <Select placeholder="请选择" style={{ width: '100%' }}>
                <Option value="0">关闭</Option>
                <Option value="1">运行中</Option>
              </Select>
            )}
          </FormItem>
        </Col>
        <Col {...colLayout}>
          <FormItem {...formItemLayout} label="站点">
            {getFieldDecorator('site')(
              <Select placeholder="请选择" style={{ width: '100%' }}>
                <Option value="0" sele>
                  关闭
                </Option>
              </Select>
            )}
          </FormItem>
        </Col>
        <Col {...colLayout}>
          <FormItem {...formItemLayout} label="运单号">
            {getFieldDecorator('orderCode')(<Input placeholder="请输入运费" />)}
          </FormItem>
        </Col>
      </Row>
      <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
        <Col {...col2Layout}>
          <FormItem {...formItemLayout} label="收货人电话">
            {getFieldDecorator('getCustomerMobile')(<Input placeholder="请输入" />)}
          </FormItem>
        </Col>
        <Col {...col2Layout}>
          <FormItem {...formItemLayout} label="收货人姓名">
            {getFieldDecorator('getCustomerName')(
              <Select placeholder="请选择" style={{ width: '100%' }}>
                <Option value="0" sele>
                  关闭
                </Option>
              </Select>
            )}
          </FormItem>
        </Col>
      </Row>
      <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
        <Col {...col2Layout}>
          <FormItem {...formItemLayout} label="发货人电话">
            {getFieldDecorator('sendCustomerMobile')(<Input placeholder="请输入" />)}
          </FormItem>
        </Col>
        <Col {...col2Layout}>
          <FormItem {...formItemLayout} label="发货人姓名">
            {getFieldDecorator('sendCustomerName')(
              <Select placeholder="请选择" style={{ width: '100%' }}>
                <Option value="0" sele>
                  关闭
                </Option>
              </Select>
            )}
          </FormItem>
        </Col>
      </Row>
      <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
        <Col {...colLayout}>
          <FormItem {...formItemLayout} label="运费">
            {getFieldDecorator('trans_amount', {
              rules: [{ required: true, message: '', min: 5 }],
            })(<Input placeholder="请输入运费" />)}
          </FormItem>
        </Col>
        <Col {...colSmallLayout}>
          <FormItem label="">
            {getFieldDecorator('sendCustomerName')(
              <Select placeholder="请选择" style={{ width: '100%' }}>
                <Option value="0">提付</Option>
                <Option value="0">垫付</Option>
              </Select>
            )}
          </FormItem>
        </Col>
        <Col {...col2Layout}>
          <FormItem {...formItemLayout} label="折后运费">
            {getFieldDecorator('trans_discount', {
              rules: [{ required: true, message: '', min: 5 }],
            })(<Input placeholder="" />)}
          </FormItem>
        </Col>
      </Row>
      <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
        <Col {...colLayout}>
          <FormItem {...formItemLayout} label="货款">
            {getFieldDecorator('order_amount', {
              rules: [{ required: true, message: '', min: 5 }],
            })(<Input placeholder="请输入货款" />)}
          </FormItem>
        </Col>
        <Col {...colLayout}>
          <FormItem label="">
            {getFieldDecorator('bank_account')(<Input placeholder="请输入银行账号" />)}
          </FormItem>
        </Col>
      </Row>
      <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
        <Col {...col2Layout}>
          <FormItem {...formItemLayout} label="保价金额">
            {getFieldDecorator('insurance_amount', {
              rules: [{ required: true, message: '', min: 5 }],
            })(<Input placeholder="" />)}
          </FormItem>
        </Col>
        <Col {...col2Layout}>
          <FormItem {...formItemLayout} label="保价费">
            {getFieldDecorator('insurance_fee', {
              rules: [{ required: true, message: '', min: 5 }],
            })(<Input placeholder="" />)}
          </FormItem>
        </Col>
      </Row>
      <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
        <Col {...col2Layout}>
          <FormItem {...formItemLayout} label="送货费">
            {getFieldDecorator('deliver_amount', {
              rules: [{ required: true, message: '', min: 5 }],
            })(<Input placeholder="" />)}
          </FormItem>
        </Col>
        <Col {...col2Layout}>
          <FormItem {...formItemLayout} label="垫付金额">
            {getFieldDecorator('order_advancepay_amount', {
              rules: [{ required: true, message: '', min: 5 }],
            })(<Input placeholder="" />)}
          </FormItem>
        </Col>
      </Row>
      <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
        <Col {...colLargeLayout}>
          <FormItem {...formItemMiniLayout} label="货物名称">
            {form.getFieldDecorator('order_name', {
              rules: [{ required: true, message: '', min: 5 }],
            })(<Input placeholder="请输入" style={{ width: '400' }} />)}
          </FormItem>
        </Col>
        <Col {...colSmallLayout}>
          <FormItem {...formItemLayout} label="">
            {getFieldDecorator('order_num')(
              <InputNumber placeholder="件数" style={{ width: '200' }} />
            )}
          </FormItem>
        </Col>
      </Row>
      <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
        <Col {...col2Layout}>
          <FormItem {...formItemLayout} label="转进/转出">
            {getFieldDecorator('transfer_type')(
              <Select placeholder="请选择" style={{ width: '100%' }}>
                <Option value="1" sele>
                  转出
                </Option>
                <Option value="2" sele>
                  转进
                </Option>
              </Select>
            )}
          </FormItem>
        </Col>
        <Col {...col2Layout}>
          <FormItem {...formItemLayout} label="中转费">
            {form.getFieldDecorator('transfer_amount', {
              rules: [{ required: true, message: '', min: 5 }],
            })(<Input placeholder="请输入" />)}
          </FormItem>
        </Col>
      </Row>
      <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
        <Col {...col2Layout}>
          <FormItem {...formItemLayout} label="中转地址">
            {form.getFieldDecorator('transfer_address', {
              rules: [{ required: true, message: '', min: 5 }],
            })(<Input placeholder="请输入" />)}
          </FormItem>
        </Col>

        <Col {...col2Layout}>
          <FormItem {...formItemLayout} label="中转物流">
            {getFieldDecorator('transfer_company_name')(<Input placeholder="请输入" />)}
          </FormItem>
        </Col>
      </Row>
      <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
        <Col {...col2Layout}>
          <FormItem {...formItemLayout} label="中转单号">
            {form.getFieldDecorator('transfer_order_code', {
              rules: [{ required: true, message: '', min: 5 }],
            })(<Input placeholder="请输入" />)}
          </FormItem>
        </Col>
        <Col {...col2Layout}>
          <FormItem {...formItemLayout} label="中转电话">
            {form.getFieldDecorator('transfer_company_mobile', {
              rules: [{ required: true, message: '', min: 5 }],
            })(<Input placeholder="请输入" />)}
          </FormItem>
        </Col>
      </Row>
      <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
        <Col {...col2Layout}>
          <FormItem {...formItemLayout} label="实收货款">
            {getFieldDecorator('order_real')(<Input placeholder="请输入" />)}
          </FormItem>
        </Col>
        <Col {...col2Layout}>
          <FormItem {...formItemLayout} label="实收运费">
            {form.getFieldDecorator('trans_real', {
              rules: [{ required: true, message: '', min: 5 }],
            })(<Input placeholder="请输入" />)}
          </FormItem>
        </Col>
      </Row>
      <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
        <Col {...colLargeLayout}>
          <FormItem {...formItemMiniLayout} label="备注">
            {form.getFieldDecorator('remark', {
              rules: [{ required: true, message: '', min: 5 }],
            })(<Input placeholder="请输入" />)}
          </FormItem>
        </Col>
      </Row>
    </Modal>
  );
});

@Form.create()
class UpdateForm extends PureComponent {
  static defaultProps = {
    handleUpdate: () => {},
    handleUpdateModalVisible: () => {},
    values: {},
  };

  constructor(props) {
    super(props);

    this.state = {
      formVals: {
        name: props.values.name,
        desc: props.values.desc,
        key: props.values.key,
        target: '0',
        template: '0',
        type: '1',
        time: '',
        frequency: 'month',
      },
      currentStep: 0,
    };

    this.formLayout = {
      labelCol: { span: 7 },
      wrapperCol: { span: 13 },
    };
  }

  handleNext = currentStep => {
    const { form, handleUpdate } = this.props;
    const { formVals: oldValue } = this.state;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      const formVals = { ...oldValue, ...fieldsValue };
      this.setState(
        {
          formVals,
        },
        () => {
          if (currentStep < 2) {
            this.forward();
          } else {
            handleUpdate(formVals);
          }
        }
      );
    });
  };

  backward = () => {
    const { currentStep } = this.state;
    this.setState({
      currentStep: currentStep - 1,
    });
  };

  forward = () => {
    const { currentStep } = this.state;
    this.setState({
      currentStep: currentStep + 1,
    });
  };

  renderContent = (currentStep, formVals) => {
    const { form } = this.props;
    if (currentStep === 1) {
      return [
        <FormItem key="target" {...this.formLayout} label="监控对象">
          {form.getFieldDecorator('target', {
            initialValue: formVals.target,
          })(
            <Select style={{ width: '100%' }}>
              <Option value="0">表一</Option>
              <Option value="1">表二</Option>
            </Select>
          )}
        </FormItem>,
        <FormItem key="template" {...this.formLayout} label="规则模板">
          {form.getFieldDecorator('template', {
            initialValue: formVals.template,
          })(
            <Select style={{ width: '100%' }}>
              <Option value="0">规则模板一</Option>
              <Option value="1">规则模板二</Option>
            </Select>
          )}
        </FormItem>,
        <FormItem key="type" {...this.formLayout} label="规则类型">
          {form.getFieldDecorator('type', {
            initialValue: formVals.type,
          })(
            <RadioGroup>
              <Radio value="0">强</Radio>
              <Radio value="1">弱</Radio>
            </RadioGroup>
          )}
        </FormItem>,
      ];
    }
    if (currentStep === 2) {
      return [
        <FormItem key="time" {...this.formLayout} label="开始时间">
          {form.getFieldDecorator('time', {
            rules: [{ required: true, message: '请选择开始时间！' }],
          })(
            <DatePicker
              style={{ width: '100%' }}
              showTime
              format="YYYY-MM-DD HH:mm:ss"
              placeholder="选择开始时间"
            />
          )}
        </FormItem>,
        <FormItem key="frequency" {...this.formLayout} label="调度周期">
          {form.getFieldDecorator('frequency', {
            initialValue: formVals.frequency,
          })(
            <Select style={{ width: '100%' }}>
              <Option value="month">月</Option>
              <Option value="week">周</Option>
            </Select>
          )}
        </FormItem>,
      ];
    }
    return [
      <FormItem key="name" {...this.formLayout} label="规则名称">
        {form.getFieldDecorator('name', {
          rules: [{ required: true, message: '请输入规则名称！' }],
          initialValue: formVals.name,
        })(<Input placeholder="请输入" />)}
      </FormItem>,
      <FormItem key="desc" {...this.formLayout} label="规则描述">
        {form.getFieldDecorator('desc', {
          rules: [{ required: true, message: '请输入至少五个字符的规则描述！', min: 5 }],
          initialValue: formVals.desc,
        })(<TextArea rows={4} placeholder="请输入至少五个字符" />)}
      </FormItem>,
    ];
  };

  renderFooter = currentStep => {
    const { handleUpdateModalVisible, values } = this.props;
    if (currentStep === 1) {
      return [
        <Button key="back" style={{ float: 'left' }} onClick={this.backward}>
          上一步
        </Button>,
        <Button key="cancel" onClick={() => handleUpdateModalVisible(false, values)}>
          取消
        </Button>,
        <Button key="forward" type="primary" onClick={() => this.handleNext(currentStep)}>
          下一步
        </Button>,
      ];
    }
    if (currentStep === 2) {
      return [
        <Button key="back" style={{ float: 'left' }} onClick={this.backward}>
          上一步
        </Button>,
        <Button key="cancel" onClick={() => handleUpdateModalVisible(false, values)}>
          取消
        </Button>,
        <Button key="submit" type="primary" onClick={() => this.handleNext(currentStep)}>
          完成
        </Button>,
      ];
    }
    return [
      <Button key="cancel" onClick={() => handleUpdateModalVisible(false, values)}>
        取消
      </Button>,
      <Button key="forward" type="primary" onClick={() => this.handleNext(currentStep)}>
        下一步
      </Button>,
    ];
  };

  render() {
    const { updateModalVisible, handleUpdateModalVisible, values } = this.props;
    const { currentStep, formVals } = this.state;

    return (
      <Modal
        width={640}
        bodyStyle={{ padding: '32px 40px 48px' }}
        destroyOnClose
        title="规则配置"
        visible={updateModalVisible}
        footer={this.renderFooter(currentStep)}
        onCancel={() => handleUpdateModalVisible(false, values)}
        afterClose={() => handleUpdateModalVisible()}
      >
        <Steps style={{ marginBottom: 28 }} size="small" current={currentStep}>
          <Step title="基本信息" />
          <Step title="配置规则属性" />
          <Step title="设定调度周期" />
        </Steps>
        {this.renderContent(currentStep, formVals)}
      </Modal>
    );
  }
}

/* eslint react/no-multi-comp:0 */
@connect(({ rule, customer, loading }) => ({
  rule,
  customer,
  loading: loading.models.rule,
}))
@Form.create()
class TableList extends PureComponent {
  state = {
    modalVisible: false,
    updateModalVisible: false,
    expandForm: false,
    selectedRows: [],
    formValues: {},
    stepFormValues: {},
  };

  columns = [
    {
      title: '规则名称',
      dataIndex: 'name',
    },
    {
      title: '描述',
      dataIndex: 'desc',
    },
    {
      title: '服务调用次数',
      dataIndex: 'callNo',
      sorter: true,
      align: 'right',
      render: val => `${val} 万`,
      // mark to display a total number
      needTotal: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      filters: [
        {
          text: status[0],
          value: 0,
        },
        {
          text: status[1],
          value: 1,
        },
        {
          text: status[2],
          value: 2,
        },
        {
          text: status[3],
          value: 3,
        },
      ],
      render(val) {
        return <Badge status={statusMap[val]} text={status[val]} />;
      },
    },
    {
      title: '上次调度时间',
      dataIndex: 'updatedAt',
      sorter: true,
      render: val => <span>{moment(val).format('YYYY-MM-DD HH:mm:ss')}</span>,
    },
    {
      title: '操作',
      render: (text, record) => (
        <Fragment>
          <a onClick={() => this.handleUpdateModalVisible(true, record)}>配置</a>
          <Divider type="vertical" />
          <a href="">订阅警报</a>
        </Fragment>
      ),
    },
  ];

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'rule/fetch',
    });
    dispatch({
      type: 'customer/fetch',
      payload: { type: 2, pageNo: 1, pageSize: 20, filter: {} },
    });
  }

  handleStandardTableChange = (pagination, filtersArg, sorter) => {
    const { dispatch } = this.props;
    const { formValues } = this.state;

    const filters = Object.keys(filtersArg).reduce((obj, key) => {
      const newObj = { ...obj };
      newObj[key] = getValue(filtersArg[key]);
      return newObj;
    }, {});

    const params = {
      currentPage: pagination.current,
      pageSize: pagination.pageSize,
      ...formValues,
      ...filters,
    };
    if (sorter.field) {
      params.sorter = `${sorter.field}_${sorter.order}`;
    }

    dispatch({
      type: 'rule/fetch',
      payload: params,
    });
  };

  handleFormReset = () => {
    const { form, dispatch } = this.props;
    form.resetFields();
    this.setState({
      formValues: {},
    });
    dispatch({
      type: 'rule/fetch',
      payload: {},
    });
  };

  toggleForm = () => {
    const { expandForm } = this.state;
    this.setState({
      expandForm: !expandForm,
    });
  };

  handleMenuClick = e => {
    const { dispatch } = this.props;
    const { selectedRows } = this.state;

    if (selectedRows.length === 0) return;
    switch (e.key) {
      case 'remove':
        dispatch({
          type: 'rule/remove',
          payload: {
            key: selectedRows.map(row => row.key),
          },
          callback: () => {
            this.setState({
              selectedRows: [],
            });
          },
        });
        break;
      default:
        break;
    }
  };

  handleSelectRows = rows => {
    this.setState({
      selectedRows: rows,
    });
  };

  handleSearch = e => {
    e.preventDefault();

    const { dispatch, form } = this.props;

    form.validateFields((err, fieldsValue) => {
      if (err) return;

      const values = {
        ...fieldsValue,
        updatedAt: fieldsValue.updatedAt && fieldsValue.updatedAt.valueOf(),
      };

      this.setState({
        formValues: values,
      });

      dispatch({
        type: 'rule/fetch',
        payload: values,
      });
    });
  };

  handleModalVisible = flag => {
    this.setState({
      modalVisible: !!flag,
    });
  };

  handleUpdateModalVisible = (flag, record) => {
    this.setState({
      updateModalVisible: !!flag,
      stepFormValues: record || {},
    });
  };

  handleAdd = fields => {
    const { dispatch } = this.props;
    dispatch({
      type: 'rule/add',
      payload: {
        desc: fields.desc,
      },
    });

    message.success('添加成功');
    this.handleModalVisible();
  };

  handleUpdate = fields => {
    const { dispatch } = this.props;
    const { formValues } = this.state;
    dispatch({
      type: 'rule/update',
      payload: {
        query: formValues,
        body: {
          name: fields.name,
          desc: fields.desc,
          key: fields.key,
        },
      },
    });

    message.success('配置成功');
    this.handleUpdateModalVisible();
  };

  renderSimpleForm() {
    const {
      form: { getFieldDecorator },
    } = this.props;
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={8} sm={24}>
            <FormItem label="规则名称">
              {getFieldDecorator('name')(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="使用状态">
              {getFieldDecorator('status')(
                <Select placeholder="请选择" style={{ width: '100%' }}>
                  <Option value="0">关闭</Option>
                  <Option value="1">运行中</Option>
                </Select>
              )}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <span className={styles.submitButtons}>
              <Button type="primary" htmlType="submit">
                查询
              </Button>
              <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
                重置
              </Button>
              <a style={{ marginLeft: 8 }} onClick={this.toggleForm}>
                展开 <Icon type="down" />
              </a>
            </span>
          </Col>
        </Row>
      </Form>
    );
  }

  renderAdvancedForm() {
    const {
      form: { getFieldDecorator },
    } = this.props;
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={8} sm={24}>
            <FormItem label="规则名称">
              {getFieldDecorator('name')(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="使用状态">
              {getFieldDecorator('status')(
                <Select placeholder="请选择" style={{ width: '100%' }}>
                  <Option value="0">关闭</Option>
                  <Option value="1">运行中</Option>
                </Select>
              )}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="调用次数">
              {getFieldDecorator('number')(<InputNumber style={{ width: '100%' }} />)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={8} sm={24}>
            <FormItem label="更新日期">
              {getFieldDecorator('date')(
                <DatePicker style={{ width: '100%' }} placeholder="请输入更新日期" />
              )}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="使用状态">
              {getFieldDecorator('status3')(
                <Select placeholder="请选择" style={{ width: '100%' }}>
                  <Option value="0">关闭</Option>
                  <Option value="1">运行中</Option>
                </Select>
              )}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="使用状态">
              {getFieldDecorator('status4')(
                <Select placeholder="请选择" style={{ width: '100%' }}>
                  <Option value="0">关闭</Option>
                  <Option value="1">运行中</Option>
                </Select>
              )}
            </FormItem>
          </Col>
        </Row>
        <div style={{ overflow: 'hidden' }}>
          <div style={{ float: 'right', marginBottom: 24 }}>
            <Button type="primary" htmlType="submit">
              查询
            </Button>
            <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
              重置
            </Button>
            <a style={{ marginLeft: 8 }} onClick={this.toggleForm}>
              收起 <Icon type="up" />
            </a>
          </div>
        </div>
      </Form>
    );
  }

  renderForm() {
    const { expandForm } = this.state;
    return expandForm ? this.renderAdvancedForm() : this.renderSimpleForm();
  }

  render() {
    const {
      rule: { data },
      loading,
    } = this.props;
    const { selectedRows, modalVisible, updateModalVisible, stepFormValues } = this.state;
    const menu = (
      <Menu onClick={this.handleMenuClick} selectedKeys={[]}>
        <Menu.Item key="remove">删除</Menu.Item>
        <Menu.Item key="approval">批量审批</Menu.Item>
      </Menu>
    );

    const parentMethods = {
      handleAdd: this.handleAdd,
      handleModalVisible: this.handleModalVisible,
    };
    const updateMethods = {
      handleUpdateModalVisible: this.handleUpdateModalVisible,
      handleUpdate: this.handleUpdate,
    };
    return (
      <div>
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>{this.renderForm()}</div>
            <div className={styles.tableListOperator}>
              <Button icon="plus" type="primary" onClick={() => this.handleModalVisible(true)}>
                新建
              </Button>
              {selectedRows.length > 0 && (
                <span>
                  <Button>批量操作</Button>
                  <Dropdown overlay={menu}>
                    <Button>
                      更多操作 <Icon type="down" />
                    </Button>
                  </Dropdown>
                </span>
              )}
            </div>
            <StandardTable
              selectedRows={selectedRows}
              loading={loading}
              data={data}
              columns={this.columns}
              onSelectRow={this.handleSelectRows}
              onChange={this.handleStandardTableChange}
            />
          </div>
        </Card>
        <CreateForm {...parentMethods} modalVisible={modalVisible} />
        {stepFormValues && Object.keys(stepFormValues).length ? (
          <UpdateForm
            {...updateMethods}
            updateModalVisible={updateModalVisible}
            values={stepFormValues}
          />
        ) : null}
      </div>
    );
  }
}

export default TableList;
