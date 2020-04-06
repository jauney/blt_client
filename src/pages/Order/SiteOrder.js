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
import { setCustomerFieldValue } from '@/utils/customer'
import { locale } from '@/utils'
import { async } from 'q';
import { printOrder, printPayOrder, printDownLoad, printLabel, getPrintOrderConent, printSiteOrder } from '@/utils/print'
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
      getCustomerNameChangeTimer: 0,
      sendCustomerNameChangeTimer: 0,
      initSendCustomerValue: '',
      initGetCustomerValue: ''
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
  async componentDidMount () {
    const { form, selectedOrder = {}, dispatch, currentCompany = {}, branchCompanyList, customer: { getCustomerList } } = this.props;
    const formFileds = form.getFieldsValue();
    const formKeys = Object.keys(formFileds);
    // 列表页传过来的当前公司，用于获取地狱系数
    let curCompany = currentCompany
    if (!currentCompany.company_id) {
      curCompany = branchCompanyList[0]
    }
    this.setState({
      currentCompany: curCompany
    })

    this.fetchGetCustomerList({ company_id: curCompany.company_id })
    this.fetchSendCustomerList()

    if (formKeys.length > 0) {
      Object.keys(formFileds).forEach(item => {
        if (selectedOrder[item] && !['getcustomer_id', 'sendcustomer_id'].includes(item)) {
          const fieldValue = {};
          fieldValue[item] = selectedOrder[item];
          if (item == 'transfer_type') {
            fieldValue[item] = `${fieldValue[item]}`
          }
          form.setFieldsValue(fieldValue);
        }
        if (item == 'getcustomer_id') {
          this.setState({
            initGetCustomerValue: selectedOrder[item]
          })
        }
        if (item == 'sendcustomer_id') {
          this.setState({
            initSendCustomerValue: selectedOrder[item]
          })
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
      customer: { getCustomerList, sendCustomerList },
    } = this.props;
    const { currentSendCustomer, currentGetCustomer } = this.state
    form.validateFields(async (err, fieldsValue) => {
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

      fieldsValue.company_name = company.company_name;

      Object.keys(fieldsValue).forEach(item => {
        if (item.indexOf('amount') >= 0) {
          fieldsValue[item] = Number(fieldsValue[item] || 0);
        }
      });

      fieldsValue.order_num = Number(fieldsValue.order_num || 0)
      fieldsValue.order_label_num = Number(fieldsValue.order_label_num || 0)
      if (fieldsValue.transfer_type) {
        fieldsValue.transfer_type = Number(fieldsValue.transfer_type)
      }
      fieldsValue = await setCustomerFieldValue(this, fieldsValue, 'edit')
      // 编辑的时候防止客户姓名变为数字customer_id
      if (Number(fieldsValue.getcustomer_name) >= 0 || Number(fieldsValue.sendcustomer_name)) {
        message.error('客户姓名不能为数字，请重新选择/输入')
        return
      }
      fieldsValue.site_name = CacheSite.site_name;

      handleAdd(fieldsValue, selectedOrder, options);

      form.resetFields();
      this.setState({
        currentSendCustomer: {},
        currentGetCustomer: {},
        initGetCustomerValue: '',
        initSendCustomerValue: ''
      })
    });
  };

  fetchGetCustomerList = async (filter = {}) => {
    const { dispatch } = this.props;

    await dispatch({
      type: 'customer/getCustomerListAction',
      payload: {
        filter,
      },
    });
  };

  fetchSendCustomerList = async (filter = {}) => {
    const { dispatch } = this.props;

    await dispatch({
      type: 'customer/sendCustomerListAction',
      payload: {
        filter,
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
      this.fetchGetCustomerList({ company_id: company.company_id });
      this.computeInsuranceFee();
      this.computeTransDiscount();
    }
  };

  // 设置选中的客户
  setSelectedCustomer = async (fieldName, customer = {}) => {
    const { form } = this.props;
    const fieldObject = {};
    const orderAmount = form.getFieldValue('order_amount');

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
      this.setState({
        initSendCustomerValue: customer.customer_id
      })
    } else {
      await this.setState({
        currentGetCustomer: customer,
        initGetCustomerValue: customer.customer_id
      });
      this.computeTransDiscount();
    }
  };

  onSendCustomerMobileBlur = async event => {
    const { dispatch } = this.props;
    const { currentCompany } = this.state
    let flag = false;
    let mobile = event && event.target && event.target.value

    let sendCustomer = await dispatch({
      type: 'customer/queryCustomerAction',
      payload: {
        type: 1, customer_mobile: mobile, company_id: currentCompany.company_id
      },
    });
    if (sendCustomer.sendCustomer && sendCustomer.sendCustomer.customer_id) {
      this.setSelectedCustomer('sendcustomer_id', sendCustomer.sendCustomer || {});
      this.setState({
        currentSendCustomer: sendCustomer.sendCustomer || {},
      });
    }
  };

  onGetCustomerMobileBlur = async event => {
    const { dispatch } = this.props;
    const { currentCompany } = this.state
    let flag = false;
    let mobile = event && event.target && event.target.value


    let customer = await dispatch({
      type: 'customer/queryCustomerAction',
      payload: {
        type: 0, customer_mobile: mobile, company_id: currentCompany.company_id
      },
    });
    if (customer.getCustomer && customer.getCustomer.customer_id) {
      this.setSelectedCustomer('getcustomer_id', customer.getCustomer || {});
      this.setState({
        currentGetCustomer: customer.getCustomer || {},
      });
    }
  };

  onSendCustomerSelect = async (value, option) => {
    const { customer: { getCustomerList, sendCustomerList }, form } = this.props;
    const orderAmount = form.getFieldValue('order_amount');
    let currentCustomer;
    for (let i = 0; i < sendCustomerList.length; i++) {
      const customer = sendCustomerList[i];
      if (customer.customer_id == value) {
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
    const { customer: { getCustomerList, sendCustomerList }, form } = this.props;
    let currentCustomer;
    for (let i = 0; i < getCustomerList.length; i++) {
      const customer = getCustomerList[i];
      if (customer.customer_id == value) {
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

  onSendCustomerChange = async value => {
    this.setState({
      sendCustomerNameChangeTimer: (new Date()).getTime()
    })
    setTimeout(() => {
      const { sendCustomerNameChangeTimer } = this.state
      if (new Date().getTime() - sendCustomerNameChangeTimer > 300) {
        this.fetchSendCustomerList({ customer_name: value })
      }
    }, 350)
  };

  onGetCustomerChange = async value => {
    this.setState({
      getCustomerNameChangeTimer: (new Date()).getTime()
    })
    setTimeout(() => {
      const { getCustomerNameChangeTimer, currentCompany } = this.state
      if (new Date().getTime() - getCustomerNameChangeTimer > 300) {
        this.fetchGetCustomerList({ customer_name: value, company_id: currentCompany.company_id })
      }
    }, 350)
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
      <AutoOption value={`${item.customer_id}`} customerid={`${item.customer_id}`} text={item.customer_name}>
        {item.customer_name}
      </AutoOption>
    );
  };

  render () {
    const {
      form,
      modalVisible,
      handleModalVisible,
      branchCompanyList,
      customer: { getCustomerList, sendCustomerList },
      siteList,
      selectedOrder,
      selectedGetCustomer,
      selectedSendCustomer,
      currentSite,
    } = this.props;
    const {
      selectedGetCustomerMobile,
      selectedSendCustomerMobile,
      currentGetCustomer,
      currentSendCustomer,
      currentCompany,
      initSendCustomerValue = '',
      initGetCustomerValue = ''
    } = this.state;

    const companyOption = {
      rules: [{ required: true, message: '请选择分公司' }],
    };
    // 默认勾选第一个公司
    companyOption.initialValue = currentCompany.company_id || '';
    let siteOptionList = [CacheSite]
    if (CacheSite.site_type == 3 || (selectedOrder && selectedOrder.getcustomer_id)) {
      siteOptionList = siteList
    }
    if (selectedOrder && selectedOrder.getcustomer_id) {
      let isFetchGetCustomer = false
      getCustomerList.forEach(item => {
        if (item.customer_id == selectedGetCustomer.customer_id) {
          isFetchGetCustomer = true
        }
      })
      if (!isFetchGetCustomer && selectedGetCustomer.customer_id) {
        getCustomerList.unshift(selectedGetCustomer)
      }
      let isFetchSendCustomer = false
      sendCustomerList.forEach(item => {
        if (item.customer_id == selectedSendCustomer.customer_id) {
          isFetchSendCustomer = true
        }
      })

      if (!isFetchSendCustomer && selectedSendCustomer.customer_id) {
        sendCustomerList.unshift(selectedSendCustomer)
      }
    }

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
      <Button key="btn-save" type="primary" onClick={() => { this.okHandle() }} tabIndex={-1}>
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
                  {siteOptionList.map(ele => {
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
              })(<Input onBlur={this.onGetCustomerMobileBlur} placeholder="请输入" maxLength={15} />)}
            </FormItem>
          </Col>
          <Col {...this.col2Layout}>
            <FormItem {...this.formItemLayout} label="收货人姓名">
              {form.getFieldDecorator('getcustomer_id', {
                rules: [{ required: true, message: '请填写收货人姓名' }],
                initialValue: `${initGetCustomerValue}`
              })(
                <AutoComplete
                  size="large"
                  style={{ width: '100%' }}
                  dataSource={getCustomerList.map(this.renderCustomerOption)}
                  onSelect={this.onGetCustomerSelect}
                  onChange={this.onGetCustomerChange}
                  allowClear
                  placeholder="请输入"
                  filterOption={(inputValue, option) =>
                    option.props.children.indexOf(inputValue) !== -1
                  }
                >
                  {' '}
                </AutoComplete>
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
              })(<Input onBlur={this.onSendCustomerMobileBlur} placeholder="请输入" maxLength={15} />)}
            </FormItem>
          </Col>
          <Col {...this.col2Layout}>
            <FormItem {...this.formItemLayout} label="发货人姓名">
              {form.getFieldDecorator('sendcustomer_id', {
                rules: [{ required: true, message: '请填写发货人姓名' }],
                initialValue: `${initSendCustomerValue}`
              })(
                <AutoComplete
                  size="large"
                  style={{ width: '100%' }}
                  dataSource={sendCustomerList.map(this.renderCustomerOption)}
                  onSelect={this.onSendCustomerSelect}
                  onChange={this.onSendCustomerChange}
                  placeholder="请输入"
                  allowClear
                  filterOption={(inputValue, option) =>
                    option.props.children.indexOf(inputValue) !== -1
                  }
                >
                  {' '}
                </AutoComplete>
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
                  maxLength={10}
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
                  maxLength={10}
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
                <Input placeholder="请输入货款" onBlur={this.onOrderAmountBlur} tabIndex={-1} maxLength={10} />
              )}
            </FormItem>
          </Col>
          <Col {...this.col2Layout}>
            <FormItem {...this.formItemLayout} label="银行账号">
              {form.getFieldDecorator('bank_account')(
                <Input placeholder="请输入银行账号" tabIndex={-1} maxLength={25} />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col {...this.col2Layout}>
            <FormItem {...this.formItemLayout} label="保价金额">
              {form.getFieldDecorator('insurance_amount', {})(
                <Input placeholder="" tabIndex={-1} onBlur={this.computeInsuranceFee} maxLength={10} />
              )}
            </FormItem>
          </Col>
          <Col {...this.col2Layout}>
            <FormItem {...this.formItemLayout} label={`保价费[${transTypeMap[form.getFieldValue('trans_type')]}]`}>
              {form.getFieldDecorator('insurance_fee', {})(<Input readOnly placeholder="" tabIndex={-1} maxLength={10} />)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col {...this.col2Layout}>
            <FormItem {...this.formItemLayout} label="送货费">
              {form.getFieldDecorator('deliver_amount', {})(<Input placeholder="" tabIndex={-1} maxLength={10} />)}
            </FormItem>
          </Col>
          <Col {...this.col2Layout}>
            <FormItem {...this.formItemLayout} label="垫付金额">
              {form.getFieldDecorator('order_advancepay_amount', {})(
                <Input placeholder="" tabIndex={-1} maxLength={10} />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col span="13">
            <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 12 }} label="货物名称">
              {form.getFieldDecorator('order_name', {})(
                <Input placeholder="请输入" style={{ width: '340px' }} maxLength={100} />
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
                  <Option value="1">
                    转出
                  </Option>
                  <Option value="2">
                    转进
                  </Option>
                </Select>
              )}
            </FormItem>
          </Col>
          <Col {...this.col2Layout}>
            <FormItem {...this.formItemLayout} label="中转费">
              {form.getFieldDecorator('transfer_amount', {})(
                <Input placeholder="请输入" tabIndex={-1} maxLength={10} />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col {...this.col2Layout}>
            <FormItem {...this.formItemLayout} label="中转地址">
              {form.getFieldDecorator('transfer_address', {})(
                <Input placeholder="请输入" tabIndex={-1} maxLength={100} />
              )}
            </FormItem>
          </Col>

          <Col {...this.col2Layout}>
            <FormItem {...this.formItemLayout} label="中转物流">
              {form.getFieldDecorator('transfer_company_name')(
                <Input placeholder="请输入" tabIndex={-1} maxLength={100} />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col {...this.col2Layout}>
            <FormItem {...this.formItemLayout} label="中转单号">
              {form.getFieldDecorator('transfer_order_code', {})(
                <Input placeholder="请输入" tabIndex={-1} maxLength={20} />
              )}
            </FormItem>
          </Col>
          <Col {...this.col2Layout}>
            <FormItem {...this.formItemLayout} label="中转电话">
              {form.getFieldDecorator('transfer_company_mobile', {})(
                <Input placeholder="请输入" tabIndex={-1} maxLength={15} />
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
              {form.getFieldDecorator('remark', {})(<Input placeholder="请输入" tabIndex={-1} maxLength={100} />)}
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
  componentDidMount () { }

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
              })(<DatePicker placeholder="全部" locale={locale} format="YYYY-MM-DD" style={{ width: '100%' }} />)}
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

  render () {
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
                <AutoComplete
                  size="large"
                  style={{ width: '100%' }}
                  dataSource={receiverList.map(item => {
                    const AutoOption = AutoComplete.Option;
                    return (
                      <AutoOption key={`${item.courier_id}`} value={`${item.courier_id}`} customerid={`${item.courier_id}`} label={item.courier_name}>
                        {item.courier_name}
                      </AutoOption>
                    );
                  })}
                  allowClear
                  optionLabelProp="label"
                  placeholder="请输入"
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
      if (receivers.length <= 0) {
        message.error('请选择正确的接货人')
        return
      }
      fieldsValue.order_id = orderIds;
      fieldsValue.receiver_name = receivers[0] && receivers[0].courier_name;
      fieldsValue.receiver_id = receivers[0] && receivers[0].courier_id;

      const result = await dispatch({
        type: 'untrunkorder/changeOrderReceiverAction',
        payload: fieldsValue,
      });

      if (result.code == 0) {
        onReceiverModalCancel();
      }
    });
  };

  render () {
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
                <AutoComplete
                  size="large"
                  style={{ width: '100%' }}
                  dataSource={receiverList.map(item => {
                    const AutoOption = AutoComplete.Option;
                    return (
                      <AutoOption key={`${item.courier_id}`} value={`${item.courier_id}`} customerid={`${item.courier_id}`} label={item.courier_name}>
                        {item.courier_name}
                      </AutoOption>
                    );
                  })}
                  allowClear
                  optionLabelProp="label"
                  placeholder="请输入"
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
      fieldsValue.receiver_id = receivers[0] && receivers[0].courier_id;
      fieldsValue.receiver_name = receivers[0] && receivers[0].courier_name;
      if (receivers.length <= 0) {
        message.error('请选择正确的接货人')
        return
      }
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

  render () {
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
    labelPrinterName: 'TSC_TTP_244CE',
    selectedGetCustomer: {},
    selectedSendCustomer: {}
  };

  columns = [
    {
      title: '分公司',
      width: '60px',
      sorter: true,
      dataIndex: 'company_name',
    },
    {
      title: '接货人',
      width: '80px',
      dataIndex: 'receiver_name',
      sorter: true,
    },
    {
      title: '录票时间',
      width: '170px',
      sorter: true,
      dataIndex: 'create_date',
      render: val => <span>{moment(Number(val || 0)).format('YYYY-MM-DD HH:mm:ss')}</span>,
    },
    {
      title: '货单号',
      width: '70px',
      sorter: true,
      dataIndex: 'order_code',
      align: 'right',
      render: val => `${val}`,
      // mark to display a total number
      needTotal: true,
    },
    {
      title: '发货客户',
      width: '80px',
      sorter: true,
      dataIndex: 'sendcustomer_name',
    },
    {
      title: '收获客户',
      width: '80px',
      sorter: true,
      dataIndex: 'getcustomer_name',
    },
    {
      title: '应收货款',
      width: '80px',
      sorter: true,
      dataIndex: 'order_amount',
    },
    {
      title: '运费',
      width: '80px',
      sorter: true,
      dataIndex: 'trans_amount',
    },
    {
      title: '折后运费',
      width: '80px',
      sorter: true,
      dataIndex: 'trans_discount',
    },
    {
      title: '运费方式',
      width: '60px',
      dataIndex: 'trans_type',
      sorter: true,
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
      sorter: true,
      dataIndex: 'order_advancepay_amount',
    },
    {
      title: '送货费',
      width: '80px',
      sorter: true,
      dataIndex: 'deliver_amount',
    },
    {
      title: '保价费',
      width: '80px',
      sorter: true,
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
      sorter: true,
      dataIndex: 'operator_name',
    },
    {
      title: '站点',
      width: '80px',
      sorter: true,
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

  async componentDidMount () {
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
    this.handleSearch();
    this.getDriverList()
  }

  getReceiverList = async () => {
    const { dispatch } = this.props;
    const { currentCompany = {} } = this.state;
    dispatch({
      type: 'receiver/getReceiverListAction',
      payload: { pageNo: 1, pageSize: 100, type: 'receiver', filter: {} },
    });
  }

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
    this.setState({ current: 1 })
    this.getOrderList({ sorter: "order_status|ascend,create_date|desc" });
  };

  /**
   * 获取订单信息
   */
  getOrderList = (data = {}, pageNo) => {
    const { dispatch, form, receiver: { receiverList } } = this.props;
    const { current, pageSize } = this.state;

    form.validateFields((err, fieldsValue) => {
      if (err) return;

      fieldsValue.order_status = [0, 1]

      if (fieldsValue.receiver_id) {
        const receivers = receiverList.filter(item => {
          if (item.courier_id == fieldsValue.receiver_id) {
            return item;
          }
        });
        if (receivers.length <= 0) {
          message.error('请选择正确的接货人')
          return
        }
        fieldsValue.receiver_id = receivers[0] && receivers[0].courier_id;
      }
      else {
        delete fieldsValue.receiver_id
      }
      const searchParams = Object.assign({ filter: fieldsValue }, data);

      dispatch({
        type: 'order/getOrderListAction',
        payload: { pageNo: pageNo || current, pageSize, ...searchParams },
      });

      dispatch({
        type: 'order/getOrderStatisticAction',
        payload: { ...searchParams },
      });

      this.getLastCarInfo()

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
    if (!flag) {
      this.getOrderList()
    }
  };

  // 添加托运单
  handleAdd = async (fields, selectedOrder = {}, option) => {
    const { dispatch } = this.props;

    // 更新订单号
    let orderCode = selectedOrder.order_code
    // 打印是增加时间
    let createDate = new Date().getTime()
    if (selectedOrder.order_id) {
      const result = await dispatch({
        type: 'order/updateOrderAction',
        payload: {
          order: Object.assign(fields, { order_id: selectedOrder.order_id }),
          order_id: selectedOrder.order_id,
        },
      });

      if (result && result.code == 0) {
        message.success('编辑成功');
      } else {
        message.error('编辑失败');
      }
      createDate = selectedOrder.create_date
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
      this.printOrder(Object.assign({ order_code: orderCode }, Object.assign(fields, { create_date: createDate }), option))
    }
    setTimeout(() => {
      this.getOrderList();
    }, 1000);
  };

  // 打印订单
  printOrder = async (data) => {
    const {
      company: { branchCompanyList },
      site: { siteList },
    } = this.props;
    const { dispatch } = this.props;
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
    printLabel(data, data.order_label_num, localStorage.getItem('LabelPrinterName'))
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
          payload: { order_id: orderIds, is_delete: 1 },
        });

        if (result && result.code == 0) {
          message.success('删除成功');
        } else {
          message.error('删除失败');
        }

        setTimeout(() => {
          self.getOrderList();
        }, 1000);
      },
    });
  };

  /**
   * 双击修改
   */
  onRowDoubleClick = async (record, rowIndex, event) => {
    const { dispatch } = this.props
    // 先查询客户信息
    let customers = await dispatch({
      type: 'customer/queryCustomerAction',
      payload: {
        sendcustomer_id: record.sendcustomer_id, getcustomer_id: record.getcustomer_id
      }
    });
    let getCustomer = customers.getCustomer
    let sendCustomer = customers.sendCustomer
    if (!getCustomer || !getCustomer.customer_id) {
      getCustomer = { customer_id: record.getcustomer_id, customer_name: record.getcustomer_name, customer_mobile: record.getcustomer_mobile }
    }
    if (!sendCustomer || !sendCustomer.customer_id) {
      sendCustomer = { customer_id: record.sendcustomer_id, customer_name: record.sendcustomer_name, customer_mobile: record.sendcustomer_mobile }
    }
    await this.setState({
      selectedGetCustomer: getCustomer,
      selectedSendCustomer: sendCustomer,
      selectedOrder: record,
      modalVisible: true
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
      setTimeout(() => { this.getOrderList(); }, 500)

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

  // 打印货物清单
  onPrintOrder = () => {
    const { selectedRows } = this.state
    printSiteOrder({ selectedRows })
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

    this.getLastCarInfo();
    this.handleSearch();
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
    this.handleSearch();
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
    this.handleSearch();
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

    // 重新获取一次最新货车信息

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
    if (!currentShipSite.site_id || !form.getFieldValue('shipsite_id')) {
      message.error('请先选择配载站');
      return;
    }
    if (currentCompany.company_id != orderCompanyId) {
      Modal.info({
        content: '选择的订单所属分公司和当前选择的分公司不一致，请重新勾选订单进行装车',
        onOk: () => {
          this.getOrderList();
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

  renderSimpleForm () {
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
            <AutoComplete
              size="large"
              style={{ width: '100%' }}
              dataSource={receiverList.map(item => {
                const AutoOption = AutoComplete.Option;
                return (
                  <AutoOption key={`${item.courier_id}`} value={`${item.courier_id}`} customerid={`${item.courier_id}`} label={item.courier_name}>
                    {item.courier_name}
                  </AutoOption>
                );
              })}
              allowClear
              optionLabelProp="label"
              placeholder="请输入"
              filterOption={(inputValue, option) =>
                option.props.children.indexOf(inputValue) !== -1
              }
            >
              {' '}
            </AutoComplete>
          )}
        </FormItem>
        <FormItem label="运单号">
          {getFieldDecorator('order_code', {})(
            <Input placeholder="请输入" style={{ width: '250px' }} allowClear />
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

  renderForm () {
    return this.renderSimpleForm();
  }

  render () {
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
      selectedGetCustomer,
      selectedSendCustomer,
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
    if (['site_searchuser', 'site_orderuser', 'site_pay', 'site_receipt'].indexOf(CacheRole.role_value) >= 0) {
      showOperateButton = false
      showShipButon = false
    }

    if (['site_searchuser', 'site_pay', 'site_receipt'].indexOf(CacheRole.role_value) >= 0) {
      showPrintButton = false
      showCreateOrderButton = false
      showShipButon = false
      showDelButton = false
    }

    if (['site_orderuser'].indexOf(CacheRole.role_value) >= 0) {
      showShipButon = true
    }

    if (['site_pay', 'site_receipt'].indexOf(CacheRole.role_value) >= 0) {
      showPrintButton = true
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
            modalVisible={modalVisible}
            selectedOrder={selectedOrder}
            selectedGetCustomer={selectedGetCustomer}
            selectedSendCustomer={selectedSendCustomer}
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
