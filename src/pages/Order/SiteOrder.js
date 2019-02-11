import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import {
  Row,
  Col,
  Card,
  Form,
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
import PageHeaderWrapper from '@/components/PageHeaderWrapper';

import styles from './SiteOrder.less';
import { element } from 'prop-types';

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

const site = JSON.parse(localStorage.getItem('site') || '{}');
const user = JSON.parse(localStorage.getItem('user') || '{}');

/* eslint react/no-multi-comp:0 */
@connect(({ customer }) => {
  return {
    customer,
  };
})
@Form.create()
class CreateForm extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      // 缓存收货人列表，筛选的时候可以动态调整
      optionGetCustomer: [...props.getCustomerList],
      optionSendCustomer: [...props.sendCustomerList],
      selectedGetCustomerMobile: '',
      selectedSendCustomerMobile: '',
      currentSendCustomer: {},
      currentGetCustomer: {},
      currentCompany: props.branchCompanyList[0],
    };
    this.formItemLayout = {
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
    this.formItemSmallLayout = {
      labelCol: {
        xs: { span: 25 },
        sm: { span: 9 },
      },
      wrapperCol: {
        xs: { span: 23 },
        sm: { span: 15 },
      },
    };

    this.colLayout = {
      md: 8,
      sm: 24,
    };

    this.colSmallLayout = {
      md: 4,
      sm: 20,
    };
    this.col2Layout = {
      md: 10,
      sm: 26,
    };
    // colLargeLayout && formItemMiniLayout
    this.colLargeLayout = {
      md: 16,
      sm: 32,
    };
    this.formItemMiniLayout = {
      labelCol: {
        xs: { span: 22 },
        sm: { span: 6 },
      },
      wrapperCol: {
        xs: { span: 26 },
        sm: { span: 18 },
      },
    };

    this.formLayout = {
      labelCol: { span: 7 },
      wrapperCol: { span: 13 },
    };
  }

  okHandle = () => {
    const { form, handleAdd, branchCompanyList, getCustomerList, sendCustomerList } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;

      form.resetFields();
      // 完善公司信息
      const company = branchCompanyList.find(item => {
        return item.company_id == fieldsValue.company_id;
      });

      const getCustomer = getCustomerList.find(item => {
        return item.customer_id == fieldsValue.getcustomer_id;
      });

      const sendCustomer = sendCustomerList.find(item => {
        return item.customer_id == fieldsValue.sendcustomer_id;
      });

      fieldsValue.company_name = company.company_name;
      console.log(getCustomer);
      if (getCustomer) {
        fieldsValue.getcustomer_name = getCustomer.customer_name;
      } else {
        fieldsValue.getcustomer_name = fieldsValue.getcustomer_id;
        fieldsValue.getcustomer_id = 0;
      }

      if (sendCustomer) {
        fieldsValue.sendcustomer_name = sendCustomer.customer_name;
      } else {
        fieldsValue.sendcustomer_name = fieldsValue.sendcustomer_id;
        fieldsValue.sendcustomer_id = 0;
      }

      fieldsValue.site_name = site.site_name;

      handleAdd(fieldsValue);
    });
  };

  fetchGetCustomerList = async companyId => {
    const { dispatch } = this.props;
    const { currentCompany } = this.state;
    dispatch({
      type: 'customer/getCustomerListAction',
      payload: {
        pageNo: 1,
        pageSize: 100,
        filter: { company_id: companyId },
      },
    });
  };

  // 分公司改变时响应函数
  onCompanySelect = async company_id => {
    const { branchCompanyList } = this.props;
    // 获取当前公司的客户列表
    this.fetchGetCustomerList(company_id);

    // 重新计算折后运费
    let company;
    for (let i = 0; i < branchCompanyList.length; i++) {
      let c = branchCompanyList[i];
      if (c.company_id == company_id) {
        company = c;
        break;
      }
    }
    if (company) {
      await this.setState({
        currentCompany: company,
      });
    }
    this.computeTransDiscount();
  };

  onSendCustomerBlur = event => {
    console.log(event);
  };

  onGetCustomerBlur = keyWords => {};

  // 设置选中的客户
  setSelectedCustomer = async (fieldName, customer) => {
    const { form } = this.props;
    const fieldObject = {};
    fieldObject[fieldName] = customer.customer_name; // customer.customer_id;
    form.setFieldsValue(fieldObject);
    // setFieldsValue不会触发select的onSelect事件，因此需要手动再触发一次计算：
    // 1）是否VIP 2）计算折后运费 3）发货人银行账号
    if (fieldName == 'sendcustomer_id') {
      // update bankaccoount
      // 设置发货人账号
      form.setFieldsValue({
        bank_account: customer.bank_account,
      });
    } else {
      await this.setState({
        currentGetCustomer: customer,
      });
      this.computeTransDiscount();
    }
  };

  onSendCustomerMobileBlur = event => {
    const { sendCustomerList } = this.props;
    for (let i = 0; i < sendCustomerList.length; i++) {
      const customer = sendCustomerList[i];
      const mobiles = customer.customerMobiles || [];
      let flag = false;
      if (event.target.value == customer.customer_mobile) {
        this.setSelectedCustomer('sendcustomer_id', customer);
        break;
      } else {
        for (let j = 0; j < mobiles.length; j++) {
          const mobile = mobiles[j];
          if (event.target.value == mobile.mobile) {
            this.setSelectedCustomer('sendcustomer_id', customer);
            flag = true;
            break;
          }
        }
      }
      if (flag) {
        break;
      }
    }
  };

  onGetCustomerMobileBlur = event => {
    const { getCustomerList } = this.props;
    for (let i = 0; i < getCustomerList.length; i++) {
      const customer = getCustomerList[i];
      const mobiles = customer.customerMobiles || [];
      let flag = false;
      if (event.target.value == customer.customer_mobile) {
        this.setSelectedCustomer('getcustomer_id', customer);
        break;
      } else {
        for (let j = 0; j < mobiles.length; j++) {
          const mobile = mobiles[j];
          if (event.target.value == mobile.mobile) {
            this.setSelectedCustomer('getcustomer_id', customer);
            flag = true;
            break;
          }
        }
      }
      if (flag) {
        break;
      }
    }
  };

  onSendCustomerSelect = async (value, option) => {
    const { props } = option;
    const { sendCustomerList, form } = this.props;
    let customer;
    for (let i = 0; i < sendCustomerList.length; i++) {
      customer = sendCustomerList[i];
      if (customer.customer_id == props.customerid) {
        form.setFieldsValue({
          sendcustomer_mobile: customer.customer_mobile,
        });

        break;
      }
    }
    if (customer) {
      // 设置发货人账号
      form.setFieldsValue({
        bank_account: customer.bank_account,
      });
      await this.setState({
        currentSendCustomer: customer,
      });
    }
  };

  onGetCustomerSelect = async (value, option) => {
    const { props } = option;
    const { getCustomerList, form } = this.props;
    let customer;
    for (let i = 0; i < getCustomerList.length; i++) {
      customer = getCustomerList[i];
      if (customer.customer_id == props.customerid) {
        form.setFieldsValue({
          getcustomer_mobile: customer.customer_mobile,
        });

        break;
      }
    }
    if (customer) {
      await this.setState({
        currentGetCustomer: customer,
      });

      // 计算折后运费
      this.computeTransDiscount();
    }
  };

  onGetCustomerSearch = async value => {};

  onSendCustomerSearch = async value => {};

  computeTransDiscount = () => {
    const { branchCompanyList } = this.props;
    let { currentCompany, currentGetCustomer } = this.state;
    const { form } = this.props;

    if (!currentCompany) {
      currentCompany = branchCompanyList[0];
      this.setState({
        currentCompany,
      });
    }
    let transAmount = form.getFieldValue('trans_amount') || '';
    let transVipRatio = currentGetCustomer.trans_vip_ratio || 1;
    let transRegionalRatio = currentCompany.trans_regional_ratio || 1;
    let transDiscount = transAmount;
    console.log('transamount', transAmount);
    if (transVipRatio && transRegionalRatio) {
      // 折后运费=地域系数*客户VIP*小票费
      transDiscount = (
        Number(transAmount) *
        Number(transVipRatio) *
        Number(transRegionalRatio)
      ).toFixed(2);
      form.setFieldsValue({
        trans_discount: transDiscount || '',
      });
    }
  };

  // 运费变更，自动计算折后运费
  onTransBlur = event => {
    this.computeTransDiscount();
  };

  onOrderPrint = () => {};

  onGetCustomerFilter = (inputValue, option) => {
    console.log(inputValue, option);
  };

  // 渲染autocomplete的option
  renderCustomerOption = item => {
    const AutoOption = AutoComplete.Option;
    return (
      <AutoOption key={item.customer_id} customerid={item.customer_id} text={item.customer_name}>
        {item.customer_name}
      </AutoOption>
    );
  };

  render() {
    const {
      form,
      modalVisible,
      handleModalVisible,
      branchCompanyList,
      getCustomerList,
      sendCustomerList,
    } = this.props;
    const {
      selectedGetCustomerMobile,
      selectedSendCustomerMobile,
      currentGetCustomer,
    } = this.state;

    const companyOption = {
      rules: [{ required: true, message: '请选择分公司' }],
    };
    // 默认勾选第一个公司
    if (branchCompanyList.length > 0) {
      companyOption.initialValue = branchCompanyList[0].company_id || '';
    }

    return (
      <Modal
        destroyOnClose
        title="新建托运单"
        visible={modalVisible}
        footer={[
          <Button key="btn-cancel" onClick={() => handleModalVisible()}>
            取 消
          </Button>,
          <Button key="btn-print" onClick={this.onOrderPrint}>
            打 印
          </Button>,
          <Button key="btn-save" type="primary" onClick={this.okHandle}>
            保 存
          </Button>,
        ]}
        width={800}
      >
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col {...this.col2Layout}>
            <FormItem {...this.formItemLayout} label="分公司">
              {form.getFieldDecorator('company_id', companyOption)(
                <Select
                  placeholder="请选择"
                  onSelect={this.onCompanySelect}
                  style={{ width: '100%' }}
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
          </Col>
          <Col {...this.col2Layout}>
            <FormItem {...this.formItemLayout} label="站点">
              {form.getFieldDecorator('site_id', { initialValue: site.site_id })(
                <Select placeholder="请选择" style={{ width: '100%' }}>
                  <Option value={site.site_id} selected>
                    {site.site_name}
                  </Option>
                </Select>
              )}
            </FormItem>
          </Col>
          {/* <Col {...this.colLayout}>
          <FormItem {...this.formItemLayout} label="运单号">
            {getFieldDecorator('orderCode', { initialValue: orderCode.order_code })(
              <Input placeholder="" />
            )}
          </FormItem>
        </Col> */}
        </Row>
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col {...this.col2Layout}>
            <FormItem {...this.formItemLayout} label="收货人电话">
              {form.getFieldDecorator('getcustomer_mobile', {
                initialValue: selectedGetCustomerMobile,
                rules: [{ required: true, message: '请填写收货人电话' }],
              })(<Input onBlur={this.onGetCustomerMobileBlur} placeholder="请输入" />)}
            </FormItem>
          </Col>
          <Col {...this.col2Layout}>
            <FormItem {...this.formItemLayout} label="收货人姓名">
              {form.getFieldDecorator('getcustomer_id', {
                rules: [{ required: true, message: '请填写收货人姓名' }],
              })(
                <AutoComplete
                  size="large"
                  style={{ width: '100%' }}
                  dataSource={getCustomerList.map(this.renderCustomerOption)}
                  onSelect={this.onGetCustomerSelect}
                  onSearch={this.onGetCustomerSearch}
                  onBlur={this.onGetCustomerBlur}
                  placeholder="请输入"
                  optionLabelProp="text"
                  filterOption={(inputValue, option) =>
                    option.props.children.indexOf(inputValue) !== -1
                  }
                >
                  {' '}
                </AutoComplete>
              )}
            </FormItem>
          </Col>
          <Col>
            {currentGetCustomer.customer_type == 1 ? (
              <Tag color="orange" style={{ marginTop: 10 }}>
                VIP
              </Tag>
            ) : (
              ''
            )}
          </Col>
        </Row>
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col {...this.col2Layout}>
            <FormItem {...this.formItemLayout} label="发货人电话">
              {form.getFieldDecorator('sendcustomer_mobile', {
                initialValue: selectedSendCustomerMobile,
                rules: [{ required: true, message: '请填写发货人电话' }],
              })(<Input onBlur={this.onSendCustomerMobileBlur} placeholder="请输入" />)}
            </FormItem>
          </Col>
          <Col {...this.col2Layout}>
            <FormItem {...this.formItemLayout} label="发货人姓名">
              {form.getFieldDecorator('sendcustomer_id', {
                rules: [{ required: true, message: '请填写发货人姓名' }],
              })(
                <AutoComplete
                  size="large"
                  style={{ width: '100%' }}
                  dataSource={sendCustomerList.map(this.renderCustomerOption)}
                  onSelect={this.onSendCustomerSelect}
                  onSearch={this.onSendCustomerSearch}
                  onBlur={this.onSendCustomerBlur}
                  placeholder="请输入"
                  optionLabelProp="text"
                  filterOption={(inputValue, option) =>
                    option.props.children.indexOf(inputValue) !== -1
                  }
                >
                  {' '}
                </AutoComplete>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col {...this.colLayout}>
            <FormItem {...this.formItemLayout} label="运费">
              {form.getFieldDecorator('trans_amount', {})(
                <Input placeholder="请输入运费" onBlur={this.onTransBlur} />
              )}
            </FormItem>
          </Col>
          <Col {...this.colSmallLayout}>
            <FormItem label="">
              {form.getFieldDecorator('trans_type')(
                <Select placeholder="请选择" style={{ width: '100%' }}>
                  <Option value="1">现付</Option>
                  <Option value="2">回付</Option>
                </Select>
              )}
            </FormItem>
          </Col>
          <Col {...this.col2Layout}>
            <FormItem {...this.formItemLayout} label="折后运费">
              {form.getFieldDecorator('trans_discount', {})(<Input placeholder="" />)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col {...this.colLayout}>
            <FormItem {...this.formItemLayout} label="货款">
              {form.getFieldDecorator('order_amount', {})(<Input placeholder="请输入货款" />)}
            </FormItem>
          </Col>
          <Col {...this.colLayout}>
            <FormItem label="">
              {form.getFieldDecorator('bank_account')(<Input placeholder="请输入银行账号" />)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col {...this.col2Layout}>
            <FormItem {...this.formItemLayout} label="保价金额">
              {form.getFieldDecorator('insurance_amount', {})(<Input placeholder="" />)}
            </FormItem>
          </Col>
          <Col {...this.col2Layout}>
            <FormItem {...this.formItemLayout} label="保价费">
              {form.getFieldDecorator('insurance_fee', {})(<Input placeholder="" />)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col {...this.col2Layout}>
            <FormItem {...this.formItemLayout} label="送货费">
              {form.getFieldDecorator('deliver_amount', {})(<Input placeholder="" />)}
            </FormItem>
          </Col>
          <Col {...this.col2Layout}>
            <FormItem {...this.formItemLayout} label="垫付金额">
              {form.getFieldDecorator('order_advancepay_amount', {})(<Input placeholder="" />)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col {...this.colLargeLayout}>
            <FormItem {...this.formItemMiniLayout} label="货物名称">
              {form.getFieldDecorator('order_name', {})(
                <Input placeholder="请输入" style={{ width: '400' }} />
              )}
            </FormItem>
          </Col>
          <Col {...this.colSmallLayout}>
            <FormItem {...this.formItemLayout} label="">
              {form.getFieldDecorator('order_num')(
                <InputNumber placeholder="件数" style={{ width: '200' }} />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col {...this.col2Layout}>
            <FormItem {...this.formItemLayout} label="转进/转出">
              {form.getFieldDecorator('transfer_type')(
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
          <Col {...this.col2Layout}>
            <FormItem {...this.formItemLayout} label="中转费">
              {form.getFieldDecorator('transfer_amount', {})(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col {...this.col2Layout}>
            <FormItem {...this.formItemLayout} label="中转地址">
              {form.getFieldDecorator('transfer_address', {})(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>

          <Col {...this.col2Layout}>
            <FormItem {...this.formItemLayout} label="中转物流">
              {form.getFieldDecorator('transfer_company_name')(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col {...this.col2Layout}>
            <FormItem {...this.formItemLayout} label="中转单号">
              {form.getFieldDecorator('transfer_order_code', {})(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
          <Col {...this.col2Layout}>
            <FormItem {...this.formItemLayout} label="中转电话">
              {form.getFieldDecorator('transfer_company_mobile', {})(
                <Input placeholder="请输入" />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col {...this.col2Layout}>
            <FormItem {...this.formItemLayout} label="实收货款">
              {form.getFieldDecorator('order_real')(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
          <Col {...this.col2Layout}>
            <FormItem {...this.formItemLayout} label="实收运费">
              {form.getFieldDecorator('trans_real', {})(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col {...this.colLargeLayout}>
            <FormItem {...this.formItemMiniLayout} label="备注">
              {form.getFieldDecorator('remark', {})(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
        </Row>
      </Modal>
    );
  }
}

/* eslint react/no-multi-comp:0 */
@connect(({ customer, company, order, loading }) => {
  return {
    customer,
    company,
    site,
    order,
    loading: loading.models.rule,
  };
})
@Form.create()
class TableList extends PureComponent {
  state = {
    modalVisible: false,
    selectedRows: [],
    formValues: {},
    current: 1,
    pageSize: 20,
  };

  columns = [
    {
      title: '分公司',
      dataIndex: 'company_name',
    },
    {
      title: '录票时间',
      dataIndex: 'create_date',
      render: val => <span>{moment(Number(val || 0)).format('YYYY-MM-DD HH:mm:ss')}</span>,
    },
    {
      title: '货单号',
      dataIndex: 'order_code',
      sorter: true,
      align: 'right',
      render: val => `${val}`,
      // mark to display a total number
      needTotal: true,
    },
    {
      title: '发货客户',
      dataIndex: 'sendcustomer_name',
    },
    {
      title: '收获客户',
      dataIndex: 'getcustomer_name',
      sorter: true,
    },
    {
      title: '应收货款',
      dataIndex: 'order_amount',
      sorter: true,
    },
    {
      title: '运费',
      dataIndex: 'trans_amount',
      sorter: true,
    },
    {
      title: '折后运费',
      dataIndex: 'trans_discount',
      sorter: true,
    },
    {
      title: '运费方式',
      dataIndex: 'trans_type',
      sorter: true,
      render: val => `${val == 1 ? '现付' : '回付'}`,
    },
    {
      title: '垫付',
      dataIndex: 'order_advancepay_amount',
      sorter: true,
    },
    {
      title: '送货费',
      dataIndex: 'deliver_amount',
      sorter: true,
    },
    {
      title: '保价费',
      dataIndex: 'insurance_fee',
      sorter: true,
    },
    {
      title: '货物名称',
      dataIndex: 'order_name',
      sorter: true,
    },
    {
      title: '经办人',
      dataIndex: 'operator_name',
      sorter: true,
    },
    {
      title: '站点',
      dataIndex: 'site_name',
      sorter: true,
    },
    {
      title: '中转',
      dataIndex: 'transfer_type',
      sorter: true,
      render: val => {
        let $transferType = '';
        if (val == 1) {
          $transferType = '转出';
        } else if (val == 2) {
          $transferType = '转入';
        }
        return $transferType;
      },
    },
    {
      title: '备注',
      dataIndex: 'remark',
    },
  ];

  async componentDidMount() {
    const { dispatch } = this.props;

    const branchCompanyList = await dispatch({
      type: 'company/getCompanyList',
      payload: {},
    });

    dispatch({
      type: 'site/getSiteList',
      payload: {},
    });

    dispatch({
      type: 'customer/sendCustomerListAction',
      payload: { pageNo: 1, pageSize: 100 },
    });

    // 初始渲染的是否，先加载第一个分公司的收货人信息
    if (branchCompanyList.length > 0) {
      dispatch({
        type: 'customer/getCustomerListAction',
        payload: {
          pageNo: 1,
          pageSize: 100,
          filter: { company_id: branchCompanyList[0].company_id },
        },
      });
    }
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
        type: 'order/getOrderListAction',
        payload: { pageNo: 1, pageSize: 20, filter: values },
      });

      dispatch({
        type: 'order/getSiteOrderStatisticAction',
        payload: { company_id: fieldsValue.company_id, site_id: fieldsValue.site_id },
      });
    });
  };

  handleModalVisible = flag => {
    this.setState({
      modalVisible: !!flag,
    });
  };

  // 添加托运单
  handleAdd = fields => {
    const { dispatch } = this.props;
    console.log(fields);
    // 更新订单号
    dispatch({
      type: 'order/createOrderAction',
      payload: fields,
    });

    message.success('添加成功');
    //this.handleModalVisible();
  };

  onDelete = () => {
    const { selectedRows } = this.state;
    const { dispatch } = this.props;
    const orderIds = [];
    selectedRows.forEach(item => {
      orderIds.push(item.order_id);
    });
    dispatch({
      type: 'order/deleteOrderAction',
      payload: { orderId: orderIds, isDelete: 1 },
    });
    console.log('delete', selectedRows);
  };

  onEntruck = () => {
    const { selectedRows } = this.state;

    console.log('entrunk', selectedRows);
  };

  renderSimpleForm() {
    const {
      form: { getFieldDecorator },
      company: { branchCompanyList },
    } = this.props;
    const companyOption = {};
    // 默认勾选第一个公司
    if (branchCompanyList.length > 0) {
      companyOption.initialValue = branchCompanyList[0].company_id || '';
    }
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={8} sm={24}>
            <FormItem label="分公司">
              {getFieldDecorator('company_id', companyOption)(
                <Select
                  placeholder="请选择"
                  onSelect={this.onCompanySelect}
                  style={{ width: '100%' }}
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
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="站点">
              {getFieldDecorator('site_id', { initialValue: site.site_id })(
                <Select placeholder="请选择" style={{ width: '100%' }}>
                  <Option value={site.site_id} selected>
                    {site.site_name}
                  </Option>
                </Select>
              )}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="经办人">
              {getFieldDecorator('operator_id', { initialValue: user.user_id })(
                <Select placeholder="请选择" style={{ width: '100%' }}>
                  <Option value={user.user_id} selected>
                    {user.user_name}
                  </Option>
                </Select>
              )}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <span className={styles.submitButtons}>
              <Button type="primary" htmlType="submit">
                查询
              </Button>
            </span>
          </Col>
        </Row>
      </Form>
    );
  }

  renderForm() {
    return this.renderSimpleForm();
  }

  render() {
    const {
      order: { orderList, total, totalOrderAmount, totalTransAmount, totalInsurancefee },
      company: { branchCompanyList },
      customer: { getCustomerList, sendCustomerList },
      loading,
    } = this.props;

    const { selectedRows, modalVisible, current, pageSize } = this.state;

    const parentMethods = {
      handleAdd: this.handleAdd,
      handleModalVisible: this.handleModalVisible,
    };
    return (
      <div>
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>{this.renderForm()}</div>
            <div className={styles.tableListOperator}>
              <Button icon="plus" type="primary" onClick={() => this.handleModalVisible(true)}>
                录入托运单
              </Button>

              {selectedRows.length > 0 && (
                <span>
                  <Button onClick={this.onDelete}>删除托运单</Button>
                  <Button onClick={this.onEntruck}>装回配载部</Button>
                </span>
              )}
            </div>
            <StandardTable
              selectedRows={selectedRows}
              loading={loading}
              rowKey="order_id"
              data={{
                list: orderList,
                pagination: {
                  total,
                  pageSize,
                  current,
                },
              }}
              columns={this.columns}
              onSelectRow={this.handleSelectRows}
              onChange={this.handleStandardTableChange}
              footer={() => `货款总额：${totalOrderAmount}   运费总额：${totalTransAmount}`}
            />
          </div>
        </Card>
        <CreateForm
          {...parentMethods}
          branchCompanyList={branchCompanyList}
          sendCustomerList={sendCustomerList}
          getCustomerList={getCustomerList}
          modalVisible={modalVisible}
        />
      </div>
    );
  }
}

export default TableList;
