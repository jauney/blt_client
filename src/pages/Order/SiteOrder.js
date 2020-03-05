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
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import styles from './OrderList.less';
import { element } from 'prop-types';
import { CacheSite, CacheUser, CacheCompany, CacheRole } from '@/utils/storage';
import { async } from 'q';
import { printOrder, printPayOrder, printDownLoad, printLabel, getPrintOrderConent } from '@/utils/print'
const { ipcRenderer } = window.require('electron')

const FormItem = Form.Item;
const { Option } = Select;
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
      selectedGetCustomerMobile: '',
      selectedSendCustomerMobile: '',
      currentSendCustomerName: '',
      currentSendCustomer: {},
      currentGetCustomerName: '',
      currentGetCustomer: {},
      currentCompany: {},
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

  /**
   * 编辑的时候初始化赋值表单
   */
  async componentDidMount() {
    const { form, selectedOrder = {}, dispatch, currentCompany = {}, branchCompanyList } = this.props;
    const formFileds = form.getFieldsValue();
    const formKeys = Object.keys(formFileds);
    // 列表页传过来的当前公司，用于获取地狱系数
    let curCompany = currentCompany
    if (!currentCompany.company_id) {
      curCompany = branchCompanyList[0]
      this.fetchGetCustomerList()
    }
    this.setState({
      currentCompany: curCompany
    })
    if (selectedOrder && selectedOrder.getcustomer_id) {
      await dispatch({
        type: 'customer/queryCustomerAction',
        payload: {
          sendcustomer_id: selectedOrder.sendcustomer_id, getcustomer_id: selectedOrder.getcustomer_id
        }
      });
    }
    if (formKeys.length > 0) {
      Object.keys(formFileds).forEach(item => {
        if (selectedOrder[item]) {
          const fieldValue = {};
          fieldValue[item] = selectedOrder[item];
          form.setFieldsValue(fieldValue);
        }
      });
    }
  }

  okHandle = (options = {}) => {
    const {
      form,
      handleAdd,
      selectedOrder,
      branchCompanyList,
      getCustomerList,
      sendCustomerList,
    } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;

      // 有货款必须有银行账号
      if (fieldsValue.order_amount && !fieldsValue.bank_account) {
        message.error('请填写银行账号');
        return;
      }
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

      Object.keys(fieldsValue).forEach(item => {
        if (item.indexOf('amount') >= 0) {
          fieldsValue[item] = Number(fieldsValue[item] || 0);
        }
      });

      if (!fieldsValue.order_num) {
        fieldsValue.order_num = 0
      }
      if (!fieldsValue.order_label_num) {
        fieldsValue.order_label_num = 0
      }

      if (getCustomer) {
        fieldsValue.getcustomer_name = getCustomer.customer_name;
        fieldsValue.getcustomer_address = getCustomer.customer_address
        fieldsValue.sender_id = getCustomer.sender_id;
        fieldsValue.sender_name = getCustomer.sender_name;
      } else {
        fieldsValue.getcustomer_name = fieldsValue.getcustomer_id;
        fieldsValue.getcustomer_id = 0;
      }

      if (sendCustomer) {
        fieldsValue.sendcustomer_name = sendCustomer.customer_name;
        fieldsValue.sendcustomer_address = sendCustomer.customer_address
        fieldsValue.receiver_id = sendCustomer.receiver_id;
        fieldsValue.receiver_name = sendCustomer.receiver_name;
      } else {
        fieldsValue.sendcustomer_name = fieldsValue.sendcustomer_id;
        fieldsValue.sendcustomer_id = 0;
      }

      fieldsValue.site_name = CacheSite.site_name;

      handleAdd(fieldsValue, selectedOrder, Object.assign({}, options, { getcustomer_type: getCustomer && getCustomer.customer_type || '', sendcustomer_type: sendCustomer && sendCustomer.customer_type || '' }));

      form.resetFields();
      this.setState({
        currentSendCustomer: {},
        currentGetCustomer: {}
      })
    });
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

  // 分公司改变时响应函数
  onCompanySelect = async company_id => {
    const { branchCompanyList, dispatch } = this.props;

    // 重新计算折后运费
    let company;
    for (let i = 0; i < branchCompanyList.length; i++) {
      const c = branchCompanyList[i];
      if (c.company_id == company_id) {
        company = c;
        break;
      }
    }
    if (company) {
      await this.setState({
        currentCompany: company,
      });

      dispatch({
        type: 'customer/resetCustomerPageNoAction',
        payload: { type: 'Get' },
      });

      // 获取当前公司的客户列表
      this.fetchGetCustomerList();
      this.computeInsuranceFee();
      this.computeTransDiscount();
    }
  };

  onSendCustomerBlur = value => {
    const { form, sendCustomerList } = this.props;
    const { currentSendCustomerName } = this.state;

    let curCustomer;
    for (let i = 0; i < sendCustomerList.length; i++) {
      const customer = sendCustomerList[i];
      if (
        customer.customer_name == currentSendCustomerName ||
        customer.customer_name == value ||
        customer.customer_id == value
      ) {
        curCustomer = customer;
        break;
      }
    }
    if (!curCustomer) {
      form.setFieldsValue({
        sendcustomer_id: currentSendCustomerName,
      });
    }
  };

  onGetCustomerBlur = value => {
    const { form, getCustomerList } = this.props;
    const { currentGetCustomerName } = this.state;

    let curCustomer;
    for (let i = 0; i < getCustomerList.length; i++) {
      const customer = getCustomerList[i];
      if (
        customer.customer_name == currentGetCustomerName ||
        customer.customer_name == value ||
        customer.customer_id == value
      ) {
        curCustomer = customer;
        break;
      }
    }
    if (!curCustomer) {
      form.setFieldsValue({
        getcustomer_id: currentGetCustomerName,
      });
    }
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

  // 设置选中的客户
  setSelectedCustomer = async (fieldName, customer = {}) => {
    const { form } = this.props;
    const fieldObject = {};
    const orderAmount = form.getFieldValue('order_amount');
    fieldObject[fieldName] = customer.customer_id || ''; // customer.customer_id;
    form.setFieldsValue(fieldObject);

    // setFieldsValue不会触发select的onSelect事件，因此需要手动再触发一次计算：
    // 1）是否VIP 2）计算折后运费 3）发货人银行账号
    if (fieldName == 'sendcustomer_id') {
      // update bankaccoount
      // 设置发货人账号
      if (+orderAmount > 0) {
        form.setFieldsValue({
          bank_account: customer.bank_account || '',
        });
      }
    } else {
      await this.setState({
        currentGetCustomer: customer,
      });
      this.computeTransDiscount();
    }
  };

  onSendCustomerMobileBlur = async event => {
    const { sendCustomerList, dispatch } = this.props;
    const { currentCompany } = this.state
    let flag = false;
    let mobile = event && event.target && event.target.value

    let sendCustomer = await dispatch({
      type: 'customer/queryCustomerAction',
      payload: {
        type: 1, customer_mobile: mobile, company_id: currentCompany.company_id
      },
    });

    this.setSelectedCustomer('sendcustomer_id', sendCustomer.sendCustomer || {});
    this.setState({
      currentSendCustomer: sendCustomer.sendCustomer || {},
    });
  };

  onGetCustomerMobileBlur = async event => {
    const { getCustomerList, dispatch } = this.props;
    const { currentCompany } = this.state
    let flag = false;
    let mobile = event && event.target && event.target.value


    let customer = await dispatch({
      type: 'customer/queryCustomerAction',
      payload: {
        type: 0, customer_mobile: mobile, company_id: currentCompany.company_id
      },
    });
    this.setSelectedCustomer('getcustomer_id', customer.getCustomer || {});
    this.setState({
      currentGetCustomer: customer.getCustomer || {},
    });

  };

  onSendCustomerSelect = async (value, option) => {
    const { props } = option;
    const { sendCustomerList, form } = this.props;
    const orderAmount = form.getFieldValue('order_amount');
    let currentCustomer;
    for (let i = 0; i < sendCustomerList.length; i++) {
      const customer = sendCustomerList[i];
      if (customer.customer_id == props.value) {
        currentCustomer = customer;
        form.setFieldsValue({
          sendcustomer_mobile: customer.customer_mobile,
        });

        break;
      }
    }
    if (currentCustomer) {
      // 设置发货人账号
      if (+orderAmount > 0) {
        form.setFieldsValue({
          bank_account: currentCustomer.bank_account,
        });
      }
      await this.setState({
        currentSendCustomer: currentCustomer,
      });
    }
  };

  onGetCustomerSelect = async (value, option) => {
    const { props } = option;
    const { getCustomerList, form } = this.props;
    let currentCustomer;
    for (let i = 0; i < getCustomerList.length; i++) {
      const customer = getCustomerList[i];
      if (customer.customer_id == props.value) {
        currentCustomer = customer;
        form.setFieldsValue({
          getcustomer_mobile: customer.customer_mobile,
        });

        break;
      }
    }
    if (currentCustomer) {
      await this.setState({
        currentGetCustomer: currentCustomer,
      });

      // 计算折后运费
      this.computeTransDiscount();
    }
  };

  /**
   * TODO: 逻辑太复杂，暂时先不处理
   */
  onGetCustomerSearch = async value => {
    if (value) {
      this.setState({
        currentGetCustomerName: value,
      });
    }
  };

  onSendCustomerSearch = async value => {
    if (value) {
      this.setState({
        currentSendCustomerName: value,
      });
    }
  };

  /**
   * 计算保价费
   */
  computeInsuranceFee = () => {
    const { form } = this.props;
    const { currentCompany = {} } = this.state;
    let transAmount = form.getFieldValue('insurance_amount') || 0;
    let transFee = Math.ceil((transAmount * (currentCompany.insurance_ratio || 2)) / 1000);

    form.setFieldsValue({ insurance_fee: transFee });
  };

  /**
   * 计算运费折扣
   */
  computeTransDiscount = (options = {}) => {
    const { changeType = '' } = options
    const { branchCompanyList } = this.props;
    let { currentCompany, currentGetCustomer, currentSendCustomer } = this.state;
    const { form } = this.props;

    let originalTransAmount = form.getFieldValue('trans_originalamount') || 0;
    let transAmount = form.getFieldValue('trans_amount') || 0;
    let transType = form.getFieldValue('trans_type') || 0;
    let getCustomerTransVipRatio = currentGetCustomer.trans_vip_ratio || 1;
    let sendCustomerTransVipRatio = currentSendCustomer.trans_vip_ratio || 1;
    let transRegionalRatio = currentCompany.trans_regional_ratio || 1;
    if (changeType != 'transAmount') {
      transAmount = Math.ceil(
        Number(originalTransAmount) *
        Number(transRegionalRatio)
      );
    }

    let transDiscount = transAmount;
    console.log(getCustomerTransVipRatio, currentCompany, changeType)
    let transVipRatio = 1
    if (transType == 0) {
      transVipRatio = getCustomerTransVipRatio;
    } else {
      transVipRatio = sendCustomerTransVipRatio;
    }
    transDiscount = Math.ceil(
      Number(transAmount) *
      Number(transVipRatio)
    );
    form.setFieldsValue({
      trans_discount: transDiscount || '',
      trans_amount: transAmount || '',
    });
  };

  onTransTypeSelect = () => {
    this.computeTransDiscount();
  };

  // 小票运费变更，自动计算折后运费
  onTransOriginalBlur = event => {
    this.computeTransDiscount();
  };

  // 运费变更，自动计算折后运费，但是不改变小票运费
  onTransBlur = event => {
    this.computeTransDiscount({ changeType: 'transAmount' });
  };

  // 有货款时自动补齐银行账号
  onOrderAmountBlur = event => {
    const { form } = this.props;

    const { currentSendCustomer } = this.state;
    const totalAmount = event.target.value;
    if (+totalAmount > 0) {
      form.setFieldsValue({
        bank_account: currentSendCustomer.bank_account || '',
      });
    } else {
      form.setFieldsValue({
        bank_account: '',
      });
    }
  };

  onOrderNumBlur = event => {
    const { form } = this.props;
    const orderNum = event.target.value;
    form.setFieldsValue({
      order_label_num: orderNum,
    });
  }

  // 打印订单
  onOrderPrint = () => {
    this.okHandle({ type: 'print' });
  };

  onGetCustomerFilter = (inputValue, option) => {
    console.log(inputValue, option);
  };

  getCustomerTag = (customer = {}) => {
    let tag = '';
    if (customer.customer_type == 1) {
      tag = (
        <Tag color="orange" style={{ marginTop: 10 }}>
          VIP
        </Tag>
      );
    } else if (customer.customer_type == 9) {
      tag = (
        <Tag color="orange" style={{ marginTop: 10 }}>
          黑
        </Tag>
      );
    }
    return tag;
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
      siteList,
      selectedOrder,
      currentSite,
    } = this.props;
    const {
      selectedGetCustomerMobile,
      selectedSendCustomerMobile,
      currentGetCustomer,
      currentSendCustomer,
      currentCompany
    } = this.state;

    const companyOption = {
      rules: [{ required: true, message: '请选择分公司' }],
    };
    // 默认勾选第一个公司
    companyOption.initialValue = currentCompany.company_id || '';

    const transTypeMap = {
      0: '提', 1: '现', 2: '回'
    }
    let footer = [
      <Button key="btn-cancel" onClick={() => handleModalVisible()} tabIndex={-1}>
        取 消
      </Button>,
      <Button key="btn-print" onClick={this.onOrderPrint}>
        打 印
      </Button>,
      <Button key="btn-save" type="primary" onClick={this.okHandle} tabIndex={-1}>
        保 存
      </Button>,
    ]
    if (CacheCompany.company_type == 2) {
      footer = [
        <Button key="btn-cancel" onClick={() => handleModalVisible()} tabIndex={-1}>
          取 消
        </Button>
      ]
    }
    return (
      <Modal
        destroyOnClose
        title="新建托运单"
        okText="确认"
        cancelText="取消"
        visible={modalVisible}
        className={styles.modalForm}
        onCancel={() => handleModalVisible()}
        footer={footer}
        width={800}
      >
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col {...this.col2Layout}>
            <FormItem {...this.formItemLayout} label="分公司">
              {form.getFieldDecorator('company_id', companyOption)(
                <Select
                  placeholder="全部"
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
              {form.getFieldDecorator('site_id', { initialValue: CacheSite.site_id })(
                <Select placeholder="全部" style={{ width: '100%' }} tabIndex={-1} >
                  {(CacheSite.site_type == 3 ? siteList : [CacheSite]).map(ele => {
                    return (
                      <Option key={ele.site_id} value={ele.site_id}>
                        {ele.site_name}
                      </Option>
                    );
                  })}
                </Select>
              )}
            </FormItem>
          </Col>
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
                <Select
                  placeholder="全部"
                  onSelect={this.onGetCustomerSelect}
                  style={{ width: '100%' }}
                  allowClear
                  showSearch
                  optionLabelProp="children"
                  onSearch={this.onGetCustomerSearch}
                  onBlur={this.onGetCustomerBlur}
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
          </Col>
          <Col {...this.colSmallLayout}>{this.getCustomerTag(currentGetCustomer)}</Col>
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
                <Select
                  placeholder="全部"
                  onSelect={this.onSendCustomerSelect}
                  style={{ width: '100%' }}
                  allowClear
                  showSearch
                  optionLabelProp="children"
                  onSearch={this.onSendCustomerSearch}
                  onBlur={this.onSendCustomerBlur}
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
          </Col>
          <Col {...this.colSmallLayout}>{this.getCustomerTag(currentSendCustomer)}</Col>
        </Row>
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col span={38} className={styles.formItemFloat}>
            <FormItem labelCol={{ span: 10 }} wrapperCol={{ span: 10 }} label="小票运费">
              {form.getFieldDecorator('trans_originalamount', {})(
                <Input
                  placeholder="请输入小票运费"
                  onBlur={this.onTransOriginalBlur}
                  style={{ width: '100px' }}
                />
              )}
            </FormItem>
            <FormItem
              style={{ width: '180px' }}
              labelCol={{ span: 10 }}
              wrapperCol={{ span: 12 }}
              label="运费"
            >
              {form.getFieldDecorator('trans_amount', {})(
                <Input
                  placeholder="请输入运费"
                  onBlur={this.onTransBlur}
                  style={{ width: '100px' }}
                  tabIndex={-1}
                />
              )}
            </FormItem>
            <FormItem label="" labelCol={{ span: 0 }} wrapperCol={{ span: 4 }}>
              {form.getFieldDecorator('trans_type', { initialValue: 0 })(
                <Select
                  placeholder="全部"
                  style={{ width: '70px' }}
                  tabIndex={-1}
                  onSelect={this.onTransTypeSelect}
                >
                  <Option value={0}>提付</Option>
                  <Option value={1}>现付</Option>
                  <Option value={2}>回付</Option>
                </Select>
              )}
            </FormItem>
          </Col>
          <Col {...this.col2Layout}>
            <FormItem {...this.formItemLayout} label="折后运费">
              {form.getFieldDecorator('trans_discount', {})(
                <Input placeholder="" tabIndex={-1} style={{ width: '80px' }} disabled />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col {...this.col2Layout}>
            <FormItem {...this.formItemLayout} label="货款">
              {form.getFieldDecorator('order_amount', {})(
                <Input placeholder="请输入货款" onBlur={this.onOrderAmountBlur} tabIndex={-1} />
              )}
            </FormItem>
          </Col>
          <Col {...this.col2Layout}>
            <FormItem {...this.formItemLayout} label="银行账号">
              {form.getFieldDecorator('bank_account')(
                <Input placeholder="请输入银行账号" tabIndex={-1} />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col {...this.col2Layout}>
            <FormItem {...this.formItemLayout} label="保价金额">
              {form.getFieldDecorator('insurance_amount', {})(
                <Input placeholder="" tabIndex={-1} onBlur={this.computeInsuranceFee} />
              )}
            </FormItem>
          </Col>
          <Col {...this.col2Layout}>
            <FormItem {...this.formItemLayout} label={`保价费[${transTypeMap[form.getFieldValue('trans_type')]}]`}>
              {form.getFieldDecorator('insurance_fee', {})(<Input placeholder="" tabIndex={-1} />)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col {...this.col2Layout}>
            <FormItem {...this.formItemLayout} label="送货费">
              {form.getFieldDecorator('deliver_amount', {})(<Input placeholder="" tabIndex={-1} />)}
            </FormItem>
          </Col>
          <Col {...this.col2Layout}>
            <FormItem {...this.formItemLayout} label="垫付金额">
              {form.getFieldDecorator('order_advancepay_amount', {})(
                <Input placeholder="" tabIndex={-1} />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col span="13">
            <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 12 }} label="货物名称">
              {form.getFieldDecorator('order_name', {})(
                <Input placeholder="请输入" style={{ width: '340px' }} />
              )}
            </FormItem>
          </Col>
          <Col span="4">
            <FormItem labelCol={{ span: 12 }} wrapperCol={{ span: 12 }} label="件数">
              {form.getFieldDecorator('order_num', { initialValue: 1 })(
                <InputNumber placeholder="件数" onBlur={this.onOrderNumBlur} style={{ width: '60px' }} />
              )}
            </FormItem>
          </Col>
          <Col span="4">
            <FormItem labelCol={{ span: 12 }} wrapperCol={{ span: 12 }} label="标签数">
              {form.getFieldDecorator('order_label_num', { initialValue: 1 })(
                <InputNumber placeholder="" style={{ width: '60px' }} />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col {...this.col2Layout}>
            <FormItem {...this.formItemLayout} label="转进/转出">
              {form.getFieldDecorator('transfer_type')(
                <Select placeholder="全部" style={{ width: '100%' }} tabIndex={-1}>
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
              {form.getFieldDecorator('transfer_amount', {})(
                <Input placeholder="请输入" tabIndex={-1} />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col {...this.col2Layout}>
            <FormItem {...this.formItemLayout} label="中转地址">
              {form.getFieldDecorator('transfer_address', {})(
                <Input placeholder="请输入" tabIndex={-1} />
              )}
            </FormItem>
          </Col>

          <Col {...this.col2Layout}>
            <FormItem {...this.formItemLayout} label="中转物流">
              {form.getFieldDecorator('transfer_company_name')(
                <Input placeholder="请输入" tabIndex={-1} />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col {...this.col2Layout}>
            <FormItem {...this.formItemLayout} label="中转单号">
              {form.getFieldDecorator('transfer_order_code', {})(
                <Input placeholder="请输入" tabIndex={-1} />
              )}
            </FormItem>
          </Col>
          <Col {...this.col2Layout}>
            <FormItem {...this.formItemLayout} label="中转电话">
              {form.getFieldDecorator('transfer_company_mobile', {})(
                <Input placeholder="请输入" tabIndex={-1} />
              )}
            </FormItem>
          </Col>
        </Row>
        {/* <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col {...this.col2Layout}>
            <FormItem {...this.formItemLayout} label="实收货款">
              {form.getFieldDecorator('order_real')(<Input placeholder="请输入" tabIndex={-1} />)}
            </FormItem>
          </Col>
          <Col {...this.col2Layout}>
            <FormItem {...this.formItemLayout} label="实收运费">
              {form.getFieldDecorator('trans_real', {})(
                <Input placeholder="请输入" tabIndex={-1} />
              )}
            </FormItem>
          </Col>
        </Row> */}
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col {...this.colLargeLayout}>
            <FormItem {...this.formItemMiniLayout} label="备注">
              {form.getFieldDecorator('remark', {})(<Input placeholder="请输入" tabIndex={-1} />)}
            </FormItem>
          </Col>
        </Row>
      </Modal>
    );
  }
}

/* eslint react/no-multi-comp:0 */
@connect(({ untrunkorder }) => {
  return {
    untrunkorder,
  };
})
@Form.create()
class CreateEntrunkForm extends PureComponent {
  constructor(props) {
    super(props);
  }

  /**
   * 编辑的时候初始化赋值表单
   */
  componentDidMount() { }

  onCarChange = value => {
    const { driverList, form } = this.props;
    let currentDriver;
    for (let i = 0; i < driverList.length; i++) {
      const driver = driverList[i];
      if (driver.driver_plate == value) {
        currentDriver = driver;
        break;
      }
    }
    if (!currentDriver) {
      // 设置发货人账号
      form.setFieldsValue({
        // driver_plate: currentDriver.driver_plate,
        driver_id: '',
        driver_name: '',
        driver_mobile: '',
      });
    }
  };

  onCarSelect = (value, option) => {
    const { props } = option;
    const { driverList, form } = this.props;
    let currentDriver;
    for (let i = 0; i < driverList.length; i++) {
      const driver = driverList[i];
      if (driver.driver_id == props.driverid) {
        currentDriver = driver;

        break;
      }
    }
    if (currentDriver) {
      // 设置发货人账号
      form.setFieldsValue({
        // driver_plate: currentDriver.driver_plate,
        driver_name: currentDriver.driver_name,
        driver_mobile: currentDriver.driver_mobile,
      });
    }
  };

  // 渲染autocomplete的option
  renderCustomerOption = item => {
    const AutoOption = AutoComplete.Option;
    return (
      <AutoOption
        key={item.driver_id}
        driverid={item.driver_id}
        value={`${item.driver_id}`}
        text={item.driver_plate}
      >
        {item.driver_plate}
      </AutoOption>
    );
  };

  getModalContent = () => {
    let {
      form: { getFieldDecorator },
      branchCompanyList,
      currentCompany,
      driverList,
      lastCar = {},
    } = this.props;
    let currentDriver = {};
    console.log(driverList, lastCar)
    driverList.forEach(item => {
      if (item.driver_id == lastCar.driver_id && Number(lastCar.car_status) < 3) {
        currentDriver = item;
      }
    });

    if (Number(lastCar.car_status) >= 3) {
      lastCar = { car_code: Number(lastCar.car_code) + 1 };
    }
    return (
      <Form layout="inline" className={styles.entrunkForm}>
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={12} sm={24}>
            <FormItem label="车牌号">
              {getFieldDecorator('driver_id', {
                rules: [{ required: true, message: '请填写收车牌号' }],
                initialValue: `${lastCar.driver_id || ''}`,
              })(
                <AutoComplete
                  size="large"
                  style={{ width: '100%' }}
                  dataSource={driverList.map(this.renderCustomerOption)}
                  onSelect={this.onCarSelect}
                  onChange={this.onCarChange}
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
          <Col md={12} sm={24}>
            <FormItem label="车主姓名">
              {getFieldDecorator('driver_name', {
                rules: [{ required: true, message: '请填写车主姓名' }],
                initialValue: currentDriver.driver_name,
              })(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col md={12} sm={24}>
            <FormItem label="联系电话">
              {getFieldDecorator('driver_mobile', {
                rules: [{ required: true, message: '请填写联系电话' }],
                initialValue: currentDriver.driver_mobile,
              })(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
          <Col md={12} sm={24}>
            <FormItem label="货车编号">
              {getFieldDecorator('car_code', {
                initialValue: lastCar.car_code,
                rules: [{ required: true, message: '请填写货车编号' }],
              })(<Input placeholder="请输入" disabled />)}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col md={12} sm={24}>
            <FormItem label="拉货日期">
              {getFieldDecorator('car_date', {
                rules: [{ required: true, message: '请填写拉货日期' }],
                initialValue: moment(new Date().getTime()),
              })(<DatePicker placeholder="全部" format="YYYY-MM-DD" style={{ width: '100%' }} />)}
            </FormItem>
          </Col>
          <Col md={12} sm={24}>
            <FormItem label="货车费用">
              {getFieldDecorator('car_fee', {
                rules: [{ required: true, message: '请填写货车费用' }],
                initialValue: lastCar.car_fee || '',
              })(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  };

  onOkHandler = e => {
    e.preventDefault();
    const {
      dispatch,
      form,
      selectedRows,
      onEntrunkModalCancel,
      driverList = [],
      onSearch,
      currentShipSite = {},
      currentCompany = {},
    } = this.props;
    form.validateFields(async (err, fieldsValue) => {
      if (err) return;

      const formValues = fieldsValue;
      let shipSiteId = 0;
      let shipSiteName = ''
      const orderIds = selectedRows.map(item => {
        shipSiteId = item.shipsite_id
        shipSiteName = item.shipsite_name
        return item.order_id;
      });
      if (formValues.car_date && formValues.car_date.valueOf) {
        formValues.car_date = `${formValues.car_date.valueOf()}`;
      }
      const drivers = driverList.filter(item => {
        if (item.driver_id == formValues.driver_id) {
          return item;
        }
      });

      if (drivers.length <= 0) {
        formValues.driver_plate = formValues.driver_id;
        formValues.driver_id = 0;
      } else {
        formValues.driver_plate = drivers[0].driver_plate;
        formValues.driver_id = Number(formValues.driver_id);
      }

      formValues.car_fee = Number(formValues.car_fee || 0);
      formValues.shipsite_id = shipSiteId;
      formValues.shipsite_name = shipSiteName;
      formValues.car_code = formValues.car_code + '';
      formValues.company_id = currentCompany.company_id;

      const result = await dispatch({
        type: 'untrunkorder/entrunkOrderAction',
        payload: { order_id: orderIds, car: formValues },
      });

      if (result.code == 0) {
        message.success('装车成功');
        onSearch();
        onEntrunkModalCancel();
      } else {
        message.error(result.msg || '装车失败');
      }
    });
  };

  render() {
    const { modalVisible, onEntrunkModalCancel } = this.props;
    return (
      <Modal
        title="货物装车"
        okText="确认"
        cancelText="取消"
        className={styles.standardListForm}
        width={700}
        destroyOnClose
        visible={modalVisible}
        onOk={this.onOkHandler}
        onCancel={onEntrunkModalCancel}
      >
        {this.getModalContent()}
      </Modal>
    );
  }
}

/* eslint react/no-multi-comp:0 */
@connect(({ untrunkorder }) => {
  return {
    untrunkorder,
  };
})
@Form.create()
class CreateReceiverForm extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }

  getModalContent = () => {
    const {
      form: { getFieldDecorator },
      receiverList,
    } = this.props;

    return (
      <Form layout="inline">
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={12} sm={24}>
            <FormItem label="接货人">
              {getFieldDecorator('receiver_id', {})(
                <Select placeholder="全部" style={{ width: '150px' }}>
                  {receiverList.map(ele => {
                    return (
                      <Option key={ele.courier_id} value={ele.courier_id}>
                        {ele.courier_name}
                      </Option>
                    );
                  })}
                </Select>
              )}
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  };

  onOkHandler = e => {
    e.preventDefault();
    const { dispatch, form, receiverList, selectedRows, onReceiverModalCancel } = this.props;
    form.validateFields(async (err, fieldsValue) => {
      if (err) return;
      const orderIds = selectedRows.map(item => {
        return item.order_id;
      });
      const receivers = receiverList.filter(item => {
        if (item.courier_id == fieldsValue.receiver_id) {
          return item;
        }
      });

      fieldsValue.order_id = orderIds;
      fieldsValue.receiver_name = receivers[0] && receivers[0].courier_name;
      console.log(fieldsValue);
      const result = await dispatch({
        type: 'untrunkorder/changeOrderReceiverAction',
        payload: fieldsValue,
      });

      if (result.code == 0) {
        onReceiverModalCancel();
      }
    });
  };

  render() {
    const { modalVisible, onReceiverModalCancel } = this.props;
    return (
      <Modal
        title="更改接货人"
        okText="确认"
        cancelText="取消"
        className={styles.standardListForm}
        width={640}
        destroyOnClose
        visible={modalVisible}
        onOk={this.onOkHandler}
        onCancel={onReceiverModalCancel}
      >
        {this.getModalContent()}
      </Modal>
    );
  }
}


/* eslint react/no-multi-comp:0 */
@connect(({ site, order }) => {
  return {
    site,
    order,
  };
})
@Form.create()
class CreateShipForm extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }

  getEntrunkModalContent = () => {
    const {
      form: { getFieldDecorator },
      receiverList,
      entrunkSiteList = [],
      selectedRows,
      currentShipSite = {}
    } = this.props;

    const getSelectRowText = () => {
      let totalOrders = 0;
      selectedRows.forEach(order => {
        totalOrders += order.order_num;
      });
      return `合计 ${selectedRows.length} 票，共计 ${totalOrders} 件`;
    };

    let shipSiteOption = { rules: [{ required: true, message: '请选择配载站' }] }
    shipSiteOption.initialValue = currentShipSite.site_id || (entrunkSiteList.length > 0 && entrunkSiteList[0].site_id)

    return (
      <Form layout="inline">
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={12} sm={24}>
            <FormItem label="配载站">
              {getFieldDecorator('shipsite_id', shipSiteOption)(
                <Select placeholder="全部" style={{ width: '150px' }}>
                  {entrunkSiteList.map(ele => {
                    return (
                      <Option key={ele.site_id} value={ele.site_id}>
                        {ele.site_name}
                      </Option>
                    );
                  })}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col md={12} sm={24}>
            <FormItem label="接货人">
              {getFieldDecorator('receiver_id', {
                rules: [{ required: true, message: '请选择接货人' }],
              })(
                <Select placeholder="全部" style={{ width: '150px' }}>
                  {receiverList.map(ele => {
                    return (
                      <Option key={ele.courier_id} value={ele.courier_id}>
                        {ele.courier_name}
                      </Option>
                    );
                  })}
                </Select>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={24} sm={24}>
            <Alert message={getSelectRowText()} type="info" />
          </Col>
        </Row>
      </Form>
    );
  };

  onEntruck = e => {
    e.preventDefault();
    const {
      dispatch,
      form,
      selectedRows,
      receiverList,
      entrunkSiteList,
      onShipModalCancel,
      handleSearch,
    } = this.props;
    form.validateFields(async (err, fieldsValue, options) => {
      if (err) return;
      const orderIds = selectedRows.map(item => {
        return item.order_id;
      });
      const receivers = receiverList.filter(item => {
        if (item.courier_id == fieldsValue.receiver_id) {
          return item;
        }
      });
      const shipSites = entrunkSiteList.filter(item => {
        if (item.site_id == fieldsValue.shipsite_id) {
          return item;
        }
      });

      fieldsValue.order_id = orderIds;
      fieldsValue.shipsite_name = shipSites[0] && shipSites[0].site_name;
      fieldsValue.receiver_name = receivers[0] && receivers[0].courier_name;

      const result = await dispatch({
        type: 'order/shipOrderAction',
        payload: fieldsValue,
      });

      if (result && result.code == 0) {
        message.success('操作成功');
        onShipModalCancel();
        setTimeout(() => {
          handleSearch();
        }, 1000);
      }
    });
  };

  render() {
    const { modalVisible, onShipModalCancel } = this.props;
    return (
      <Modal
        title="装回配载站"
        okText="确认"
        cancelText="取消"
        className={styles.standardListForm}
        width={640}
        destroyOnClose
        visible={modalVisible}
        onOk={this.onEntruck}
        onCancel={onShipModalCancel}
      >
        {this.getEntrunkModalContent()}
      </Modal>
    );
  }
}

/* eslint react/no-multi-comp:0 */
@connect(({ customer, company, order, site, car, driver, receiver, loading }) => {
  return {
    customer,
    company,
    site,
    order,
    receiver,
    car,
    driver,
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
    shipModalVisible: false,
    receiverModalVisible: false,
    cancelShipModalVisible: false,
    currentSite: {},
    currentCompany: {},
    currentShipSite: {},
    labelPrinterName: 'TSC_TTP_244CE'
  };

  columns = [
    {
      title: '分公司',
      width: '60px',
      dataIndex: 'company_name',
    },
    {
      title: '录票时间',
      width: '170px',
      dataIndex: 'create_date',
      render: val => <span>{moment(Number(val || 0)).format('YYYY-MM-DD HH:mm:ss')}</span>,
    },
    {
      title: '货单号',
      width: '70px',
      dataIndex: 'order_code',

      align: 'right',
      render: val => `${val}`,
      // mark to display a total number
      needTotal: true,
    },
    {
      title: '发货客户',
      width: '80px',
      dataIndex: 'sendcustomer_name',
    },
    {
      title: '收获客户',
      width: '80px',
      dataIndex: 'getcustomer_name',
    },
    {
      title: '应收货款',
      width: '80px',
      dataIndex: 'order_amount',
    },
    {
      title: '运费',
      width: '80px',
      dataIndex: 'trans_amount',
    },
    {
      title: '折后运费',
      width: '80px',
      dataIndex: 'trans_discount',
    },
    {
      title: '运费方式',
      width: '60px',
      dataIndex: 'trans_type',

      render: val => {
        let transType = '';
        if (val === 1) {
          transType = '现付';
        } else if (val === 2) {
          transType = '回付';
        } else {
          transType = '提付';
        }
        return transType;
      },
    },
    {
      title: '垫付',
      width: '80px',
      dataIndex: 'order_advancepay_amount',
    },
    {
      title: '送货费',
      width: '80px',
      dataIndex: 'deliver_amount',
    },
    {
      title: '保价费',
      width: '80px',
      dataIndex: 'insurance_fee',
    },
    {
      title: '货物名称',
      width: '150px',
      dataIndex: 'order_name',
    },
    {
      title: '经办人',
      width: '80px',
      dataIndex: 'operator_name',
    },
    {
      title: '站点',
      width: '80px',
      dataIndex: 'site_name',
    },
    {
      title: '中转',
      width: '80px',
      dataIndex: 'transfer_type',

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
      width: '150px',
      dataIndex: 'remark',
    },
  ];

  async componentDidMount() {
    const { dispatch } = this.props;

    const branchCompanyList = await dispatch({
      type: 'company/getCompanyList',
      payload: {},
    });

    let currentCompany = await this.setCurrentCompany(branchCompanyList)
    const siteList = await dispatch({
      type: 'site/getSiteListAction',
      payload: { pageNo: 1, pageSize: 100 },
    });

    this.getReceiverList()
    dispatch({
      type: 'customer/resetCustomerPageNoAction',
      payload: {},
    });

    this.fetchGetCustomerList()
    this.fetchSendCustomerList()

    this.getDriverList()

    if (siteList && siteList.length > 0) {
      const shipSiteList = siteList.filter(item => {
        return item.site_type == 3 || item.site_type == 2;
      });
      if (shipSiteList.length > 0) {
        this.setState({
          currentShipSite: shipSiteList[0],
        });
      }
    }
    await this.getLastCarInfo();

    // 页面初始化获取一次订单信息，否则会显示其他页面的缓存信息
    this.getOrderList();
    // 获取打印机列表
    this.getPrinterList()
  }

  getReceiverList = async () => {
    const { dispatch } = this.props;
    const { currentCompany = {} } = this.state;
    dispatch({
      type: 'receiver/getReceiverListAction',
      payload: { pageNo: 1, pageSize: 100, type: 'receiver', filter: {} },
    });
  }


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

  // 设置当前公司
  setCurrentCompany = async (branchCompanyList = []) => {
    // 初始渲染的是否，先加载第一个分公司的收货人信息
    if (CacheCompany.company_type == 2) {
      await this.setState({
        currentCompany: CacheCompany
      });

      return CacheCompany
    }
    else if (branchCompanyList && branchCompanyList.length > 0) {
      await this.setState({
        currentCompany: branchCompanyList[0]
      });

      return branchCompanyList[0]
    }

    return {}
  }

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

  handleSelectRows = rows => {
    this.setState({
      selectedRows: rows,
    });
  };

  handleSearch = e => {
    if (e) {
      e.preventDefault();
    }
    this.getOrderList();
  };

  /**
   * 获取订单信息
   */
  getOrderList = (data = {}, pageNo = 1) => {
    const { dispatch } = this.props;
    const { current, pageSize } = this.state;

    const { form } = this.props;

    form.validateFields((err, fieldsValue) => {
      if (err) return;

      fieldsValue.order_status = [0, 1]

      const searchParams = Object.assign({ filter: fieldsValue, sorter: "order_status|ascend" }, data);

      dispatch({
        type: 'order/getOrderListAction',
        payload: { pageNo: pageNo || current, pageSize, ...searchParams },
      });

      dispatch({
        type: 'order/getOrderStatisticAction',
        payload: { ...searchParams },
      });

      this.standardTable.cleanSelectedKeys()
    });
  };

  // 调用table子组件
  onRefTable = (ref) => {
    this.standardTable = ref
  }

  handleModalVisible = flag => {
    const { currentCompany, currentSite } = this.state
    // // 选择公司、站点
    // if (!currentCompany || !currentCompany.company_id) {
    //   message.info('请选择分公司')
    //   return
    // }

    this.setState({
      selectedOrder: {},
      modalVisible: !!flag,
    });
  };

  // 添加托运单
  handleAdd = async (fields, selectedOrder = {}, option) => {
    const { dispatch } = this.props;

    // 更新订单号
    let orderCode = selectedOrder.order_code
    if (selectedOrder.order_id) {
      const result = await dispatch({
        type: 'order/updateOrderAction',
        payload: {
          order: Object.assign(fields, { order_id: selectedOrder.order_id }),
          orderIds: [selectedOrder.order_id],
        },
      });

      if (result && result.code == 0) {
        message.success('编辑成功');
      } else {
        message.error('编辑失败');
      }
      this.handleModalVisible(false);
    } else {
      const result = await dispatch({
        type: 'order/createOrderAction',
        payload: fields,
      });
      orderCode = result && result.data && result.data.order_code || ''
      // TODO: 拿到order_code用于打印
      console.log(result.data);
      if (result && result.code == 0) {
        message.success('添加成功');
      } else {
        message.error('添加失败');
      }
    }

    if (option.type == 'print') {
      this.printOrder(Object.assign({ order_code: orderCode }, fields, option))
    }
    setTimeout(() => {
      this.handleSearch();
    }, 1000);
  };

  // 打印订单
  printOrder = async (data) => {
    const {
      company: { branchCompanyList },
      site: { siteList },
    } = this.props;
    const { dispatch } = this.props;
    const { labelPrinterName } = this.state;
    // 获取收货人信息
    const { getCustomer = {}, sendCustomer = {} } = await dispatch({
      type: 'customer/queryCustomerAction',
      payload: {
        getcustomer_id: data.getcustomer_id,
        sendcustomer_id: data.sendcustomer_id
      },
    });
    let printHtml = getPrintOrderConent({ getCustomer, sendCustomer, data, branchCompanyList, siteList, footer: true })
    printOrder(printHtml)
    printLabel(data, data.order_label_num, labelPrinterName)
  }

  onDelete = async () => {
    const { selectedRows } = this.state;
    const { dispatch } = this.props;
    const orderIds = [];
    selectedRows.forEach(item => {
      orderIds.push(item.order_id);
    });
    const self = this;
    Modal.confirm({
      title: '确认',
      content: '你确认删除所勾选订单信息么？',
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        const result = await dispatch({
          type: 'order/deleteOrderAction',
          payload: { orderId: orderIds, isDelete: 1 },
        });

        if (result && result.code == 0) {
          message.success('删除成功');
        } else {
          message.error('删除失败');
        }

        setTimeout(() => {
          self.handleSearch();
        }, 1000);
      },
    });
  };

  /**
   * 双击修改
   */
  onRowDoubleClick = (record, rowIndex, event) => {
    this.setState({
      selectedOrder: record,
      modalVisible: true,
    });
  };

  // 取消装回
  onCancelShipOk = async () => {
    const { selectedRows } = this.state;
    const { dispatch } = this.props;
    const orderIds = [];
    selectedRows.forEach(item => {
      if (item.order_status == 1) {
        orderIds.push(item.order_id);
      }
    });
    if (orderIds.length < selectedRows.length) {
      message.info('只能取消已经装车的订单')
      return false
    }

    const result = await dispatch({
      type: 'untrunkorder/cancelShipAction',
      payload: { order_id: orderIds },
    });

    if (result.code == 0) {
      this.handleSearch();
      message.success('取消装回成功');
      this.onCancelShipCancel();
    }
  };

  onCancelShipCancel = () => {
    this.setState({
      cancelShipModalVisible: false,
    });
  };

  onCancelShip = () => {
    const { selectedRows } = this.state;
    const orderIds = [];
    selectedRows.forEach(item => {
      if (item.order_status == 1) {
        orderIds.push(item.order_id);
      }
    });
    if (orderIds.length < selectedRows.length) {
      message.info('当前选择的部分订单未装回配载站，请重新选择')
      return false
    }
    this.setState({
      cancelShipModalVisible: true,
    });
  };

  /**
   * 装车弹窗
   */
  onShipModalShow = () => {
    const { form } = this.props
    const { currentShipSite = {}, currentCompany = {}, selectedRows } = this.state;
    const orderIds = [];
    selectedRows.forEach(item => {
      if (item.order_status == 0) {
        orderIds.push(item.order_id);
      }
    });
    if (orderIds.length < selectedRows.length) {
      message.info('当前选择的部分订单已经装回配载站，请重新选择')
      return false
    }
    // if (!currentCompany.company_id || !form.getFieldValue('company_id')) {
    //   message.error('请先选择公司');
    //   return;
    // }

    this.setState({
      shipModalVisible: true,
    });
  };

  onShipModalCancel = () => {
    // setTimeout(() => this.addBtn.blur(), 0);
    this.setState({
      shipModalVisible: false,
    });
  };

  /**
   * 接货人弹窗
   */
  onReceiverModalCancel = () => {
    this.setState({
      receiverModalVisible: false,
    });
  };

  onReceiverModalShow = () => {
    this.setState({
      receiverModalVisible: true,
    });
  };

  getPrinterList = () => {
    // 改用ipc异步方式获取列表，解决打印列数量多的时候导致卡死的问题
    ipcRenderer.send('getPrinterList')
    ipcRenderer.once('getPrinterList', (event, data) => {
      // 过滤可用打印机
      console.log('print list...', data)
      let printList = data.filter(element => element.name.includes('244'))
      console.log(printList)

      // 1.判断是否有打印服务
      if (printList.length <= 0) {
        console.log('标签打印服务异常,请尝试重启电脑')
      } else {
        this.setState({
          labelPrinterName: printList[0].name
        })
      }
    })
  }
  // 打印货物清单
  onPrintOrder = () => {
    const { selectedRows } = this.state
    printDownLoad({ selectedRows })
  }

  // 下载货物清单
  onDownloadOrder = () => {
    const { selectedRows } = this.state
    printDownLoad({ selectedRows, type: 'pdf' })
  }

  resetCustomerPage = async (type = 'Get') => {
    const { dispatch } = this.props;
    dispatch({
      type: 'customer/resetCustomerPageNoAction',
      payload: { type },
    });
  }
  onCompanySelect = async (value, option) => {
    const {
      company: { branchCompanyList = [] },
    } = this.props;

    // 重新计算折后运费
    let company = {};
    for (let i = 0; i < branchCompanyList.length; i++) {
      const c = branchCompanyList[i];
      if (c.company_id == value) {
        company = c;
        break;
      }
    }

    await this.setState({
      currentCompany: company,
    });
    await this.resetCustomerPage()

    this.fetchGetCustomerList()
    this.getLastCarInfo();
    this.getOrderList();
  };

  getLastCarInfo = async (option) => {
    const isUseCarCode = option && option.isUseCarCode || false
    const { dispatch, form } = this.props;
    const { currentCompany = {}, currentShipSite = {} } = this.state;
    const carCode = form.getFieldValue('car_code');
    const param = {
      company_id: currentCompany.company_id,
      shipsite_id: currentShipSite.site_id,
    };
    if (carCode && isUseCarCode) {
      param.car_code = carCode;
    }
    const carInfo = await dispatch({
      type: 'car/getLastCarCodeAction',
      payload: param,
    });

    this.getDriverList()

    return carInfo;
  };

  getDriverList = () => {
    const { dispatch, form } = this.props;
    const { currentCompany } = this.state
    if (!currentCompany || !currentCompany.company_id) {
      return
    }
    dispatch({
      type: 'driver/getDriverListAction',
      payload: {
        pageNo: 1,
        pageSize: 500,
        company_id: currentCompany.company_id,
      },
    });
  }

  onShipSiteSelect = async value => {
    const {
      site: { entrunkSiteList = [] },
    } = this.props;

    let site = {};
    for (let i = 0; i < entrunkSiteList.length; i++) {
      const c = entrunkSiteList[i];
      if (c.site_id == value) {
        site = c;
        break;
      }
    }

    await this.setState({
      currentShipSite: site,
    });
    this.getLastCarInfo();
    this.getOrderList();
  };

  onSiteSelect = async value => {
    const {
      site: { siteList = [] },
    } = this.props;

    let site = {};
    for (let i = 0; i < siteList.length; i++) {
      const c = siteList[i];
      if (c.site_id == value) {
        site = c;
        break;
      }
    }
    this.setState({
      currentSite: site,
    });
    this.getOrderList();
  }

  /**
   * 装车弹窗
   */
  onEntrunkModalShow = () => {
    const { form, car: { lastCar } } = this.props
    const { currentShipSite = {}, currentCompany = {}, selectedRows } = this.state;
    const orderIds = [];
    let orderCompanyId = ''
    let shipSiteId = ''
    let isSameComapny = true
    let isSameShipSite = true

    selectedRows.forEach(item => {
      if (item.order_status == 1) {
        orderIds.push(item.order_id);
      }
      if (!orderCompanyId) {
        orderCompanyId = item.company_id
      }
      if (!shipSiteId) {
        shipSiteId = item.shipsite_id
      }
      if (orderCompanyId && orderCompanyId != item.company_id) {
        isSameComapny = false
      }
      if (shipSiteId && shipSiteId != item.shipsite_id) {
        isSameShipSite = false
      }
    });
    if (orderIds.length < selectedRows.length) {
      message.error('只能对装回配载站的订单进行装车');
      return
    }
    if (!isSameComapny) {
      message.error('只能对相同分公司订单进行装车');
      return
    }
    if (!currentCompany.company_id) {
      message.error('请先选择公司');
      return;
    }
    if (!currentShipSite.site_id) {
      message.error('请先选择配载站');
      return;
    }
    if (currentCompany.company_id != orderCompanyId) {
      Modal.info({
        content: '选择的订单所属分公司和当前选择的分公司不一致，请重新勾选订单进行装车',
        onOk: () => {
          this.handleSearch();
        }
      })
      return;
    }
    if (!isSameShipSite) {
      message.error('请选择相同配载站的订单进行装车');
      return
    }

    this.setState({
      entrunkModalVisible: true,
    });
  };

  onEntrunkModalCancel = () => {
    // setTimeout(() => this.addBtn.blur(), 0);
    this.setState({
      entrunkModalVisible: false,
    });
  };

  tableFooter = () => {
    const {
      order: {
        total,
        totalOrderAmount,
        totalTransAmount,
        totalInsurancefee,
        totalRealTransAmount,
        totalRealOrderAmount,
        totalAdvancepayAmount,
        totalDeliverAmount,
        totalTifuTransAmount,
        totalXianTransAmount,
        totalLatefee,
        totalBonusfee,
        totalCarFeeConfirm,
        totalCarFee,
        totalTifuInsurance,
        totalXianInsurence,
      }
    } = this.props;
    return (
      <div className={styles.tableFooter}>
        <span>货款总额：{totalOrderAmount || '0'}</span>
        <span className={styles.footerSplit}>实收货款：{totalRealOrderAmount || '0'}</span>
        <span className={styles.footerSplit}>运费总额：{totalTransAmount || '0'}</span>
        <span className={styles.footerSplit}>提付运费：{totalTifuTransAmount || '0'}</span>
        <span className={styles.footerSplit}>西安运费：{totalXianTransAmount || '0'}</span>
        <span className={styles.footerSplit}>垫付运费：{totalAdvancepayAmount || '0'}</span>
        <span className={styles.footerSplit}>送货费：{totalDeliverAmount || '0'}</span>
        <span className={styles.footerSplit}>西安保费：{totalXianInsurence || '0'}</span>
        <span className={styles.footerSplit}>提付保费：{totalTifuInsurance || '0'}</span>
        <span className={styles.footerSplit}>滞纳金：{totalLatefee || '0'}</span>
        <span className={styles.footerSplit}>奖金：{totalBonusfee || '0'}</span>
        <span className={styles.footerSplit}>未结算货车运费：{totalCarFee || '0'}</span>
        <span className={styles.footerSplit}>已结算货车运费：{totalCarFeeConfirm || '0'}</span>
        <span className={styles.footerSplit}>票数：{total || '0'}</span>
      </div>
    );
  };

  renderSimpleForm() {
    const {
      form: { getFieldDecorator },
      company: { branchCompanyList },
      site: { entrunkSiteList, siteList },
      receiver: { receiverList },
    } = this.props;
    const { currentShipSite = {}, currentCompany = {} } = this.state;
    const companyOption = { initialValue: currentCompany.company_id };
    let allowClear = false
    let siteOption = { initialValue: CacheSite.site_id }
    let selectSites = [CacheSite]
    if (CacheSite.site_type == 3 || CacheSite.site_type == 2 || CacheCompany.company_type == 2) {
      selectSites = siteList
      allowClear = true
      siteOption = {}
    }
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <FormItem label="分公司">
          {getFieldDecorator('company_id', companyOption)(
            <Select
              placeholder="全部"
              onChange={this.onCompanySelect}
              allowClear={CacheCompany.company_type == 1 ? true : false}
              style={{ width: '100px' }}
            >
              {(CacheCompany.company_type == 1 ? branchCompanyList : [CacheCompany]).map(ele => {
                return (
                  <Option key={ele.company_id} value={ele.company_id}>
                    {ele.company_name}
                  </Option>
                );
              })}
            </Select>
          )}
        </FormItem>

        <FormItem label="站点">
          {getFieldDecorator('site_id', siteOption)(
            <Select placeholder="全部" onSelect={this.onSiteSelect} style={{ width: '100px' }} allowClear={allowClear}>
              {selectSites.map(item => {
                return <Option value={item.site_id}>{item.site_name}</Option>;
              })}
            </Select>
          )}
        </FormItem>

        <FormItem label="经办人">
          {getFieldDecorator('operator_id', {})(
            <Select placeholder="全部" style={{ width: '100px' }} allowClear>
              <Option value={CacheUser.user_id} selected>
                {CacheUser.user_name}
              </Option>
            </Select>
          )}
        </FormItem>
        <FormItem label="配载站">
          {getFieldDecorator('shipsite_id', {})(
            <Select
              placeholder="全部"
              style={{ width: '100px' }}
              onChange={this.onShipSiteSelect}
              allowClear
            >
              {entrunkSiteList.map(ele => {
                return (
                  <Option key={ele.site_id} value={ele.site_id}>
                    {ele.site_name}
                  </Option>
                );
              })}
            </Select>
          )}
        </FormItem>

        <FormItem label="接货人">
          {getFieldDecorator('receiver_id', {})(
            <Select placeholder="全部" style={{ width: '100px' }} allowClear>
              {receiverList.map(ele => {
                return (
                  <Option key={ele.courier_id} value={ele.courier_id}>
                    {ele.courier_name}
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
      order: { orderList, total, totalOrderAmount, totalTransAmount },
      company: { branchCompanyList },
      customer: { getCustomerList, sendCustomerList, getCustomerPageNo, sendCustomerPageNo },
      receiver: { receiverList },
      site: { entrunkSiteList, siteList },
      driver: { driverList },
      car: { lastCar },
      loading,
    } = this.props;

    const {
      selectedRows,
      selectedOrder,
      modalVisible,
      current = 1,
      pageSize = 2,
      shipModalVisible,
      receiverModalVisible,
      entrunkModalVisible,
      currentCompany,
      currentSite,
      currentShipSite,
      cancelShipModalVisible
    } = this.state;

    const parentMethods = {
      handleAdd: this.handleAdd,
      handleModalVisible: this.handleModalVisible,
    };

    // 是否显示操作按钮
    let showOperateButton = true
    let showPrintButton = true
    let showCreateOrderButton = true
    let showShipButon = true
    let showDelButton = true
    if (CacheCompany.company_type != 1) {
      showOperateButton = false
      showPrintButton = false
      showCreateOrderButton = false
      showShipButon = false
      showDelButton = false
    }
    if (['site_searchuser', 'site_orderuser'].indexOf(CacheRole.role_value) >= 0) {
      showOperateButton = false
      showShipButon = false
    }

    if (['site_searchuser'].indexOf(CacheRole.role_value) >= 0) {
      showPrintButton = false
      showCreateOrderButton = false
      showShipButon = false
      showDelButton = false
    }

    if (['site_orderuser'].indexOf(CacheRole.role_value) >= 0) {
      showShipButon = true
    }

    // 是否都勾选了装回配载部的订单
    let unShipOrderIds = [], shipedOrderIds = [];
    selectedRows.forEach(item => {
      if (item.order_status == 0) {
        unShipOrderIds.push(item)
      }
      if (item.order_status == 1) {
        shipedOrderIds.push(item)
      }
    })
    return (
      <div>
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>{this.renderForm()}</div>
            <div className={styles.tableListOperator}>
              {showCreateOrderButton && <Button icon="plus" type="primary" onClick={() => this.handleModalVisible(true)}>
                录入托运单
              </Button>}

              {selectedRows.length > 0 && showDelButton && unShipOrderIds.length == selectedRows.length && (
                <span>
                  <Button onClick={this.onDelete}>删除托运单</Button>
                </span>
              )}

              {selectedRows.length > 0 && showShipButon && unShipOrderIds.length == selectedRows.length && (
                <span>
                  <Button onClick={this.onShipModalShow}>装回配载站</Button>
                </span>
              )}

              {selectedRows.length > 0 && showShipButon && shipedOrderIds.length == selectedRows.length && (
                <span>
                  <Button onClick={this.onCancelShip}>取消装回配载站</Button>
                </span>
              )}

              {selectedRows.length > 0 && showOperateButton && shipedOrderIds.length == selectedRows.length && (
                <span>
                  <Button onClick={this.onReceiverModalShow}>更改接货人</Button>
                  <Button onClick={this.onEntrunkModalShow}>装车</Button>
                </span>
              )}

              {selectedRows.length > 0 && showPrintButton && (
                <span>
                  <Button onClick={this.onPrintOrder}>打印清单</Button>
                  <Button onClick={this.onDownloadOrder}>下载清单</Button>
                </span>
              )}
            </div>
            <StandardTable
              onRef={this.onRefTable}
              selectedRows={selectedRows}
              className={styles.dataTable}
              loading={loading}
              rowKey="order_id"
              data={{
                list: orderList,
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
              onClickHander={this.onRowClick}
              onDoubleClickHander={this.onRowDoubleClick}
              onSelectRow={this.handleSelectRows}
              onChange={this.handleStandardTableChange}
              rowClassNameHandler={(record, index) => {
                if (record.order_status === 1) {
                  return styles.shipColor;
                } else {
                  return '';
                }
              }}
            />
          </div>
          {this.tableFooter()}
        </Card>
        {modalVisible && (
          <CreateForm
            {...parentMethods}
            branchCompanyList={branchCompanyList}
            sendCustomerList={sendCustomerList}
            getCustomerList={getCustomerList}
            modalVisible={modalVisible}
            selectedOrder={selectedOrder}
            siteList={siteList}
            currentSite={currentSite}
            currentCompany={currentCompany}
          />
        )}
        <CreateEntrunkForm
          modalVisible={entrunkModalVisible}
          selectedRows={selectedRows}
          branchCompanyList={branchCompanyList}
          currentCompany={currentCompany}
          onEntrunkModalCancel={this.onEntrunkModalCancel}
          driverList={driverList}
          lastCar={lastCar}
          onSearch={this.handleSearch}
          currentShipSite={currentShipSite}
        />
        <CreateReceiverForm
          receiverList={receiverList}
          entrunkSiteList={entrunkSiteList}
          modalVisible={receiverModalVisible}
          selectedRows={selectedRows}
          currentCompany={currentCompany}
          onReceiverModalCancel={this.onReceiverModalCancel}
        />
        <CreateShipForm
          receiverList={receiverList}
          entrunkSiteList={entrunkSiteList}
          modalVisible={shipModalVisible}
          selectedRows={selectedRows}
          handleSearch={this.handleSearch}
          onShipModalCancel={this.onShipModalCancel}
          currentShipSite={currentShipSite}
        />
        <Modal
          title="确认"
          okText="确认"
          cancelText="取消"
          visible={cancelShipModalVisible}
          onOk={this.onCancelShipOk}
          onCancel={this.onCancelShipCancel}
        >
          <p>您确认要取消装回么？</p>
        </Modal>
      </div>
    );
  }
}

export default TableList;
