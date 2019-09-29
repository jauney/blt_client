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
    const { form, selectedOrder } = this.props;
    const formFileds = form.getFieldsValue();

    if (selectedOrder) {
      Object.keys(formFileds).forEach(item => {
        if (selectedOrder[item]) {
          const fieldValue = {};
          fieldValue[item] = selectedOrder[item];
          form.setFieldsValue(fieldValue);
        }
      });
    }
  }

  okHandle = () => {
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

      fieldsValue.site_name = CacheSite.site_name;

      handleAdd(fieldsValue, selectedOrder);

      form.resetFields();
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
    const { branchCompanyList } = this.props;

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
        currentSendCustomerPageNo: 1,
      });

      // 获取当前公司的客户列表
      this.fetchGetCustomerList();
    }
    this.computeTransDiscount();
  };

  onSendCustomerBlur = value => {
    const { form, sendCustomerList } = this.props;
    const { currentSendCustomerName } = this.state;

    let curCustomer;
    for (let i = 0; i < sendCustomerList.length; i++) {
      const customer = sendCustomerList[i];
      if (customer.customer_name == currentSendCustomerName || customer.customer_id == value) {
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
      if (customer.customer_name == currentGetCustomerName || customer.customer_id == value) {
        curCustomer = customer;
        break;
      }
    }
    if (!curCustomer) {
      console.log(777777777777, curCustomer, currentGetCustomerName, value);
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
    fieldObject[fieldName] = customer.customer_name || ''; // customer.customer_id;
    form.setFieldsValue(fieldObject);
    // setFieldsValue不会触发select的onSelect事件，因此需要手动再触发一次计算：
    // 1）是否VIP 2）计算折后运费 3）发货人银行账号
    if (fieldName == 'sendcustomer_id') {
      // update bankaccoount
      // 设置发货人账号
      form.setFieldsValue({
        bank_account: customer.bank_account || '',
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
    let flag = false;
    let customer;
    for (let i = 0; i < sendCustomerList.length; i++) {
      customer = sendCustomerList[i];
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
      this.setSelectedCustomer('sendcustomer_id', customer);
      this.setState({
        currentSendCustomer: customer,
      });
    } else if (event.target.value) {
      this.setSelectedCustomer('sendcustomer_id', {});
    }
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
      form.setFieldsValue({
        bank_account: currentCustomer.bank_account,
      });
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
   * 计算运费折扣
   */
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
      selectedOrder,
    } = this.props;
    const {
      selectedGetCustomerMobile,
      selectedSendCustomerMobile,
      currentGetCustomer,
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
      companyOption.initialValue = branchCompanyList[0].company_id || '';
    }

    return (
      <Modal
        destroyOnClose
        title="新建托运单"
        visible={modalVisible}
        className={styles.modalForm}
        onCancel={() => handleModalVisible()}
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
              {form.getFieldDecorator('site_id', { initialValue: CacheSite.site_id })(
                <Select placeholder="请选择" style={{ width: '100%' }}>
                  <Option value={CacheSite.site_id} selected>
                    {CacheSite.site_name}
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
          <Col {...this.colSmallLayout}>
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
          <Col {...this.col2Layout}>
            <FormItem {...this.formItemLayout} label="货款">
              {form.getFieldDecorator('order_amount', {})(<Input placeholder="请输入货款" />)}
            </FormItem>
          </Col>
          <Col {...this.col2Layout}>
            <FormItem {...this.formItemLayout} label="银行账号">
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
            <FormItem label="装回">
              {getFieldDecorator('shipsite_id', {})(
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
              {getFieldDecorator('receiver_id', {})(
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

      if (result.code == 0) {
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
      type: 'company/getBranchCompanyList',
      payload: { ...CacheCompany },
    });

    dispatch({
      type: 'site/getSiteListAction',
      payload: { pageNo: 1, pageSize: 100 },
    });

    dispatch({
      type: 'receiver/getReceiverListAction',
      payload: { pageNo: 1, pageSize: 100, type: 1, filter: {} },
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
    const { form } = this.props;

    form.validateFields((err, fieldsValue) => {
      if (err) return;

      const values = {
        ...fieldsValue,
        updatedAt: fieldsValue.updatedAt && fieldsValue.updatedAt.valueOf(),
      };

      this.setState({
        formValues: values,
      });

      this.getOrderList({ filter: values }, 1);
    });
  };

  /**
   * 获取订单信息
   */
  getOrderList = (data, pageNo) => {
    const { dispatch } = this.props;
    const { current, pageSize } = this.state;
    dispatch({
      type: 'order/getOrderListAction',
      payload: { pageNo: pageNo || current, pageSize, ...data },
    });

    dispatch({
      type: 'order/getSiteOrderStatisticAction',
      payload: { ...data },
    });
  };

  handleModalVisible = flag => {
    this.setState({
      modalVisible: !!flag,
    });
  };

  // 添加托运单
  handleAdd = async (fields, selectedOrder = {}) => {
    const { dispatch } = this.props;

    // 更新订单号
    if (selectedOrder.order_id) {
      const result = await dispatch({
        type: 'order/updateOrderAction',
        payload: Object.assign(fields, { order_id: selectedOrder.order_id }),
      });

      if (result.code == 0) {
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

      if (result.code == 0) {
        message.success('添加成功');
      } else {
        message.error('添加失败');
      }
    }
    setTimeout(() => {
      this.handleSearch();
    }, 1000);
  };

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

        if (result.code == 0) {
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
            <Select placeholder="请选择" onSelect={this.onCompanySelect} style={{ width: '150px' }}>
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
            <Select placeholder="请选择" style={{ width: '150px' }}>
              <Option value={CacheSite.site_id} selected>
                {CacheSite.site_name}
              </Option>
            </Select>
          )}
        </FormItem>

        <FormItem label="经办人">
          {getFieldDecorator('operator_id', { initialValue: CacheUser.user_id })(
            <Select placeholder="请选择" style={{ width: '150px' }}>
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
      site: { entrunkSiteList },
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
              onRow={(record, rowIndex) => {
                return {
                  onClick: event => {
                    // this.onRowClick(record, rowIndex, event);
                  },
                  onDoubleClick: event => {
                    this.onRowDoubleClick(record, rowIndex, event);
                  },
                };
              }}
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
