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
import { CacheSite, CacheUser, CacheCompany, CacheRole } from '../../utils/storage';
import { print } from '@/utils/print'
import { async } from 'q';

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
  componentDidMount() {
    const { form, selectedOrder = {} } = this.props;
    const formFileds = form.getFieldsValue();
    const formKeys = Object.keys(formFileds);
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

      if (getCustomer) {
        fieldsValue.getcustomer_name = getCustomer.customer_name;
        fieldsValue.sender_id = getCustomer.sender_id;
        fieldsValue.sender_name = getCustomer.sender_name;
      } else {
        fieldsValue.getcustomer_name = fieldsValue.getcustomer_id;
        fieldsValue.getcustomer_id = 0;
      }

      if (sendCustomer) {
        fieldsValue.sendcustomer_name = sendCustomer.customer_name;
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
    // let customer;
    // for (let i = 0; i < sendCustomerList.length; i++) {
    //   customer = sendCustomerList[i];
    //   const mobiles = customer.customerMobiles || [];

    //   if (event.target.value == customer.customer_mobile) {
    //     flag = true;
    //     break;
    //   } else {
    //     for (let j = 0; j < mobiles.length; j++) {
    //       const mobile = mobiles[j];
    //       if (event.target.value == mobile.mobile) {
    //         flag = true;
    //         break;
    //       }
    //     }
    //   }
    // }

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

  onGetCustomerMobileBlur = event => {
    const { getCustomerList } = this.props;
    let flag = false;
    let customer;
    for (let i = 0; i < getCustomerList.length; i++) {
      customer = getCustomerList[i];
      const mobiles = customer.customerMobiles || [];
      if (event.target.value == customer.customer_mobile) {
        flag = true;
        break;
      } else {
        for (let j = 0; j < mobiles.length; j++) {
          const mobile = mobiles[j];
          if (event.target.value == mobile.mobile) {
            flag = true;
            break;
          }
        }
      }
    }
    if (flag) {
      this.setSelectedCustomer('getcustomer_id', customer);
      this.setState({
        currentGetCustomer: customer,
      });
    } else if (event.target.value) {
      this.setSelectedCustomer('getcustomer_id', {});
    }
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
  computeTransDiscount = changeType => {
    const { branchCompanyList } = this.props;
    let { currentCompany, currentGetCustomer, currentSendCustomer } = this.state;
    const { form } = this.props;

    let originalTransAmount = form.getFieldValue('trans_originalamount') || 0;
    let transAmount = form.getFieldValue('trans_amount') || 0;
    let transType = form.getFieldValue('trans_type') || 0;
    let getCustomerTransVipRatio = currentGetCustomer.trans_vip_ratio || 1;
    let sendCustomerTransVipRatio = currentSendCustomer.trans_vip_ratio || 1;
    let transRegionalRatio = currentCompany.trans_regional_ratio || 1;
    let transDiscount = transAmount;

    let transVipRatio;
    if (transType == 0) {
      transVipRatio = getCustomerTransVipRatio;
    } else {
      transVipRatio = sendCustomerTransVipRatio;
    }

    if (changeType == 'type') {
      // 折后运费=地域系数*客户VIP*小票费
      transDiscount = Math.ceil(
        Number(originalTransAmount) *
        Number(transVipRatio) *
        Number(transRegionalRatio)
      );
      form.setFieldsValue({
        trans_discount: transDiscount || '',
      });
    } else if (changeType == 'original') {
      if (originalTransAmount && transRegionalRatio) {
        transAmount = Math.ceil(Number(originalTransAmount) * Number(transRegionalRatio));
      }
      if (transVipRatio && transRegionalRatio) {
        // 折后运费=地域系数*客户VIP*小票费
        transDiscount = Math.ceil(
          Number(originalTransAmount) *
          Number(transVipRatio) *
          Number(transRegionalRatio)
        );
        form.setFieldsValue({
          trans_discount: transDiscount || '',
          trans_amount: transAmount || '',
        });
      }
    } else if (transVipRatio && transRegionalRatio) {
      // 折后运费=地域系数*客户VIP*小票费
      transDiscount = Math.ceil(Number(transAmount) * Number(transVipRatio));
      form.setFieldsValue({
        trans_discount: transDiscount || '',
      });
    }
  };

  onTransTypeSelect = () => {
    this.computeTransDiscount('type');
  };

  // 小票运费变更，自动计算折后运费
  onTransOriginalBlur = event => {
    this.computeTransDiscount('original');
  };

  // 运费变更，自动计算折后运费
  onTransBlur = event => {
    this.computeTransDiscount();
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
    } = this.props;
    const {
      selectedGetCustomerMobile,
      selectedSendCustomerMobile,
      currentGetCustomer,
      currentSendCustomer,
      currentCompany,
      currentSite,
    } = this.state;

    const companyOption = {
      rules: [{ required: true, message: '请选择分公司' }],
    };
    // 默认勾选第一个公司
    if (currentCompany && currentCompany.company_id) {
      companyOption.initialValue = currentCompany.company_id || '';
    } else if (branchCompanyList.length > 0) {
      this.setState({
        currentCompany: branchCompanyList[0],
      });

      companyOption.initialValue = branchCompanyList[0].company_id || '';
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
        footer={[
          <Button key="btn-cancel" onClick={() => handleModalVisible()} tabIndex={-1}>
            取 消
          </Button>,
          <Button key="btn-print" onClick={this.onOrderPrint}>
            打 印
          </Button>,
          <Button key="btn-save" type="primary" onClick={this.okHandle} tabIndex={-1}>
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
              {form.getFieldDecorator('site_id', { initialValue: CacheSite.site_id })(
                <Select placeholder="请选择" style={{ width: '100%' }} tabIndex={-1}>
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
                <Select
                  placeholder="请选择"
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
                  placeholder="请选择"
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
                  placeholder="请选择"
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
            <FormItem {...this.formItemLayout} label="保价费">
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
                <Select placeholder="请选择" style={{ width: '100%' }} tabIndex={-1}>
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
@connect(({ site, order }) => {
  return {
    site,
    order,
  };
})
@Form.create()
class CreateEntrunkForm extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }

  getEntrunkModalContent = () => {
    const {
      form: { getFieldDecorator },
      receiverList,
      entrunkSiteList,
      selectedRows,
    } = this.props;

    const getSelectRowText = () => {
      let totalOrders = 0;
      selectedRows.forEach(order => {
        totalOrders += order.order_num;
      });
      return `合计 ${selectedRows.length} 票，共计 ${totalOrders} 件`;
    };
    return (
      <Form layout="inline">
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={12} sm={24}>
            <FormItem label="配载站">
              {getFieldDecorator('shipsite_id', {
                rules: [{ required: true, message: '请选择配载站' }],
              })(
                <Select placeholder="请选择" style={{ width: '150px' }}>
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
                <Select placeholder="请选择" style={{ width: '150px' }}>
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
      onEntrunkModalCancel,
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
        onEntrunkModalCancel();
        setTimeout(() => {
          handleSearch();
        }, 1000);
      }
    });
  };

  render() {
    const { modalVisible, onEntrunkModalCancel } = this.props;
    return (
      <Modal
        title="装回配载部"
        okText="确认"
        cancelText="取消"
        className={styles.standardListForm}
        width={640}
        destroyOnClose
        visible={modalVisible}
        onOk={this.onEntruck}
        onCancel={onEntrunkModalCancel}
      >
        {this.getEntrunkModalContent()}
      </Modal>
    );
  }
}

/* eslint react/no-multi-comp:0 */
@connect(({ customer, company, order, site, receiver, loading }) => {
  return {
    customer,
    company,
    site,
    order,
    receiver,
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
    entrunkModalVisible: false,
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
      dataIndex: 'remark',
    },
  ];

  async componentDidMount() {
    const { dispatch } = this.props;

    const branchCompanyList = await dispatch({
      type: 'company/getBranchCompanyList',
      payload: { ...CacheCompany },
    });

    dispatch({
      type: 'site/getSiteListAction',
      payload: { pageNo: 1, pageSize: 100 },
    });

    dispatch({
      type: 'receiver/getReceiverListAction',
      payload: { pageNo: 1, pageSize: 100, type: 'receiver', filter: {} },
    });

    dispatch({
      type: 'customer/resetCustomerPageNoAction',
      payload: {},
    });

    dispatch({
      type: 'customer/getCustomerListAction',
      payload: {
        filter: {
          company_id: (branchCompanyList.length > 0 && branchCompanyList[0].company_id) || 0,
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

      const searchParams = Object.assign({ filter: fieldsValue }, data);
      dispatch({
        type: 'order/getOrderListAction',
        payload: { pageNo: pageNo || current, pageSize, ...searchParams },
      });

      dispatch({
        type: 'order/getOrderStatisticAction',
        payload: { ...searchParams },
      });
    });
  };

  handleModalVisible = flag => {
    this.setState({
      selectedOrder: {},
      modalVisible: !!flag,
    });
  };

  // 添加托运单
  handleAdd = async (fields, selectedOrder = {}, option) => {
    const { dispatch } = this.props;

    // 更新订单号
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

      // TODO: 拿到order_code用于打印
      console.log(result.data);

      if (option.type == 'print') {
        this.printOrder(Object.assign({ order_code: result && result.data && result.data.order_code || '' }, fields, option))
      }

      if (result && result.code == 0) {
        message.success('添加成功');
      } else {
        message.error('添加失败');
      }
    }
    setTimeout(() => {
      this.handleSearch();
    }, 1000);
  };


  // 打印订单
  printOrder = (data) => {
    let styles = `
    <style>
    .header: {

    }
    </style>`
    let html = `
    <div class=“header”>陕西远诚宝路通物流</div>
    <table>
      <tbody>
      <tr>
        <td>到货站:${data.company_name}</td>
        <td>发货站:${data.site_name}</td>
        <td>单号:${data.order_code}</td>
      </tr>
      </tbody>
      <tbody>
      <tr>
        <th>${data.getcustomer_type}</th>
        <td>收货人:${data.getcustomer_name}</td>
        <td>电话:${data.getcustomer_mobile}</td>
      </tr>
      <tr>
        <th>${data.sendcustomer_type}</th>
        <td>发货人:${data.sendcustomer_name}</td>
        <td>电话:${data.sendcustomer_mobile}</td>
      </tr>
      </tbody>
      <tbody>
      <tr>
        <th></th>
      </tr>
      </tbody>
      <tbody>
      <tr>
        <td>货款:${data.order_amount}</td>
        <td>运费:${data.trans_amount}</td>
        <td>运价:</td>
        <td>折后:${data.trans_discount}</td>
      </tr>
      <tr>
        <td>保额:${data.insurance_amount}</td>
        <td>保费:${data.insurance_fee}</td>
        <td>垫付:${data.order_advancepay_amount}</td>
        <td>送货费:${data.deliver_amount}</td>
      </tr>
      </tbody>
      <tbody>
      <tr>
        <td>合计:</td>
        <td>账号:${data.bank_account}</td>
      </tr>
      </tbody>
      <tbody>
      <tr>
        <th></th>
      </tr>
      </tbody>
      <tbody>
      <tr>
        <td>货物名称:${data.order_name}</td>
        <td>标签:${data.order_label_num}</td>
      </tr>
      </tbody>
      <tbody>
      <tr>
        <td>收货地址:${data.getcustomer_address}</td>
      </tr>
      <tr>
        <td>备注:${data.remark}</td>
      </tr>
      </tbody>
      <tbody>
      <tr>
        <th></th>
      </tr>
      </tbody>
      <tbody>
      <tr>
        <td>转进:</td>
        <td>中转费:</td>
        <td>地址:</td>
      </tr>
      <tr>
        <td>物流:</td>
        <td>单号:</td>
        <td>电话:</td>
      </tr>
      <tbody>
      <tr>
        <th></th>
      </tr>
      </tbody>
      <tbody>
      <tr>
        <td>到货站:</td>
        <td>电话:</td>
      </tr>
      <tr>
        <td>发货站:</td>
        <td>电话:</td>
      </tr>
      <tr>
        <td>申明：1.托运方必须如实提供货物类型、名称、数量，要求包装完好、捆扎牢固；交货只负责包装无损，不负责包装内质量与数量问题。2.公司严禁托运危险品及国家禁运品，若经欺瞒货品造成损失则由托运方承担。3.所有货品均实行自愿投保，若出现货损，3%以内的货损为正常损耗，不予赔付；若未保价出现货损或丢失，承运方则按运费的1-5倍赔付；若保价后出现货损或丢失，承运方则按货物平均保价金额进行赔付，且不超过货物价值的80%。4.文物、珠宝、陶瓷、玻璃、水果、海鲜、鲜肉制品等易碎、易腐烂变质的货品不在保险范围内（投保无效），本公司只负责丢失责任，不负责损坏、变质等赔偿。5.收货方接到提货通知后须及时取货，提货后出现的任何货物问题公司概不受理；到货通知后一周任不提货则原货返货，运费翻倍。6.承运期间若因人为无法控制的自然灾害而造成的损失，承运方不承担任何责任。7.托运单经开出，且托运方继续托运货物，则默认托运方同意公司托运协议，本协议及时生效；货物确认收货，运费及货款结算清后，本协议终止，且该托运单作废。</td>
      </tr>
      <tr>
        <td>
          <img src="https://sf3-ttcdn-tos.pstatp.com/obj/dump-v2-public/2019/12/31/ca7ea0aee0567014386fda40e67de226.jpeg" width="50px" height="50px">
        </td>
        <td>
          <div>总公司地址：西安市港务区港务南路百利威国际电商产业园</div>
          <div>公司网址：www.bltwlgs.com</div>
          <div>业务电话：02986253988，13309221294</div>
          <div>财务电话：02986237928</div>
          <div>客服电话：13324583349</div>
          <div>投诉电话：15389278107</div>
        </td>
      </tr>
      </tbody>
    </table>
    `
    print({ html: '<div class=“header”>陕西远诚宝路通物流</div>' })
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

  showEntruckModal = () => {
    this.setState({
      entrunkModalVisible: true,
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

  hideEntrunckModal = () => {
    // setTimeout(() => this.addBtn.blur(), 0);
    this.setState({
      entrunkModalVisible: false,
    });
  };

  onEntrunkModalCancel = () => {
    this.hideEntrunckModal();
  };

  onEntruckModalShow = () => {
    this.showEntruckModal();
  };

  renderSimpleForm() {
    const {
      form: { getFieldDecorator },
      company: { branchCompanyList },
      site: { siteList },
    } = this.props;
    const companyOption = {};

    // 默认勾选第一个公司
    if (branchCompanyList.length > 0) {
      companyOption.initialValue = branchCompanyList[0].company_id || '';
    }
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <FormItem label="分公司">
          {getFieldDecorator('company_id', companyOption)(
            <Select
              placeholder="请选择"
              onSelect={this.onCompanySelect}
              allowClear={CacheCompany.company_type == 1 ? true : false}
              style={{ width: '100px' }}
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

        <FormItem label="站点">
          {getFieldDecorator('site_id', { initialValue: CacheSite.site_id })(
            <Select placeholder="请选择" style={{ width: '100px' }}>
              {(CacheSite.site_type == 3 ? siteList : [CacheSite]).map(item => {
                return <Option value={item.site_id}>{item.site_name}</Option>;
              })}
            </Select>
          )}
        </FormItem>

        <FormItem label="经办人">
          {getFieldDecorator('operator_id', { initialValue: CacheUser.user_id })(
            <Select placeholder="请选择" style={{ width: '100px' }} allowClear>
              <Option value={CacheUser.user_id} selected>
                {CacheUser.user_name}
              </Option>
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
      loading,
    } = this.props;

    const {
      selectedRows,
      selectedOrder,
      modalVisible,
      current = 1,
      pageSize = 2,
      entrunkModalVisible,
    } = this.state;

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
                  <Button onClick={this.onEntruckModalShow}>装回配载部</Button>
                </span>
              )}
            </div>
            <StandardTable
              selectedRows={selectedRows}
              className={styles.dataTable}
              scroll={{ x: 900, y: 350 }}
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
              footer={() => `货款总额：${totalOrderAmount}   运费总额：${totalTransAmount}`}
            />
          </div>
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
          />
        )}

        <CreateEntrunkForm
          receiverList={receiverList}
          entrunkSiteList={entrunkSiteList}
          modalVisible={entrunkModalVisible}
          selectedRows={selectedRows}
          handleSearch={this.handleSearch}
          onEntrunkModalCancel={this.onEntrunkModalCancel}
        />
      </div>
    );
  }
}

export default TableList;
