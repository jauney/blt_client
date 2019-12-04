import React, { PureComponent, Fragment } from 'react';
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
import styles from './index.less';
import { CacheRole } from '@/utils/storage';
import { isTemplateElement } from '@babel/types';

const FormItem = Form.Item;
const { Option } = Select;
@Form.create()
class OrderEditForm extends PureComponent {
  constructor(props) {
    super(props);

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
   * 计算运费折扣
   */
  computeTransDiscount = changeType => {
    const { currentCompany, currentGetCustomer, currentSendCustomer, form } = this.props;

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
      transDiscount = (
        Number(originalTransAmount) *
        Number(transVipRatio) *
        Number(transRegionalRatio)
      ).toFixed(2);
      form.setFieldsValue({
        trans_discount: transDiscount || '',
      });
    } else if (changeType == 'original') {
      if (originalTransAmount && transRegionalRatio) {
        transAmount = (Number(originalTransAmount) * Number(transRegionalRatio)).toFixed(2);
      }
      if (transVipRatio && transRegionalRatio) {
        // 折后运费=地域系数*客户VIP*小票费
        transDiscount = (
          Number(originalTransAmount) *
          Number(transVipRatio) *
          Number(transRegionalRatio)
        ).toFixed(2);
        form.setFieldsValue({
          trans_discount: transDiscount || '',
          trans_amount: transAmount || '',
        });
      }
    } else if (transVipRatio && transRegionalRatio) {
      // 折后运费=地域系数*客户VIP*小票费
      transDiscount = (Number(transAmount) * Number(transVipRatio)).toFixed(2);
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

  okHandle = () => {
    const { form, record, dispatch, onCancelModal, handleSearch } = this.props;
    form.validateFields(async (err, fieldsValue) => {
      if (err) return;

      Object.keys(fieldsValue).forEach(item => {
        if (item.indexOf('amount') >= 0) {
          fieldsValue[item] = Number(fieldsValue[item] || 0);
        }
      });

      fieldsValue['trans_type'] = Number(fieldsValue['trans_type']);
      fieldsValue['transfer_type'] = Number(fieldsValue['transfer_type']);

      const result = await dispatch({
        type: 'order/updateOrderAction',
        payload: {
          orderIds: [record.order_id],
          order: fieldsValue,
        },
      });
      if (result.code == 0) {
        message.success('修改成功！');
        handleSearch();
        onCancelModal();
      } else {
        message.error(result.msg);
      }

      form.resetFields();
    });
  };

  render() {
    const { record, modalVisible, onCancelModal, form, isEdit = 0 } = this.props;
    const buttons = [
      <Button key="btn-cancel" onClick={() => onCancelModal()}>
        取 消
      </Button>,
    ];
    if (isEdit) {
      buttons.push(
        <Button key="btn-save" type="primary" onClick={this.okHandle}>
          保 存
        </Button>
      );
    }

    let payRoles = CacheRole.filter(item => {
      return [('site_pay', 'site_admin')].indexOf(item.role_value) >= 0;
    });

    console.log(payRoles, CacheRole);

    return (
      <Modal
        destroyOnClose
        title="编辑托运单"
        visible={modalVisible}
        onCancel={() => onCancelModal()}
        footer={buttons}
        width={800}
        className={styles.modalForm}
      >
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col {...this.col2Layout}>
            <FormItem {...this.formItemLayout} label="分公司">
              {record.company_name}
            </FormItem>
          </Col>
          <Col {...this.col2Layout}>
            <FormItem {...this.formItemLayout} label="站点">
              {record.site_name}
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
              {record.getcustomer_mobile}
            </FormItem>
          </Col>
          <Col {...this.col2Layout}>
            <FormItem {...this.formItemLayout} label="收货人姓名">
              {record.getcustomer_name}
            </FormItem>
          </Col>
          <Col>
            {record.customer_type == 1 ? (
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
              {record.sendcustomer_mobile}
            </FormItem>
          </Col>
          <Col {...this.col2Layout}>
            <FormItem {...this.formItemLayout} label="发货人姓名">
              {record.sendcustomer_name}
            </FormItem>
          </Col>
        </Row>
        {payRoles.length > 0 ? (
          <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
            <Col span={38} className={styles.formItemFloat}>
              <FormItem
                style={{ width: '220px', display: 'inline-block' }}
                labelCol={{ span: 7 }}
                wrapperCol={{ span: 7 }}
                label="小票运费"
              >
                {form.getFieldDecorator('trans_originalamount', {
                  initialValue: record.trans_originalamount,
                })(
                  <Input
                    placeholder="请输入小票运费"
                    onBlur={this.onTransOriginalBlur}
                    style={{ width: '100px' }}
                  />
                )}
              </FormItem>
              <FormItem
                style={{ width: '180px', display: 'inline-block' }}
                labelCol={{ span: 7 }}
                wrapperCol={{ span: 7 }}
                label="运费"
              >
                {form.getFieldDecorator('trans_amount', { initialValue: record.trans_amount })(
                  <Input
                    placeholder="请输入运费"
                    onBlur={this.onTransBlur}
                    style={{ width: '100px' }}
                    tabIndex={-1}
                  />
                )}
              </FormItem>
              <FormItem
                label=""
                style={{ width: '100px', display: 'inline-block' }}
                labelCol={{ span: 0 }}
                wrapperCol={{ span: 4 }}
              >
                {form.getFieldDecorator('trans_type', { initialValue: record.trans_type })(
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
              <FormItem
                style={{ width: '210px', display: 'inline-block' }}
                labelCol={{ span: 7 }}
                wrapperCol={{ span: 10 }}
                label="折后运费"
              >
                {form.getFieldDecorator('trans_discount', { initialValue: record.trans_discount })(
                  <Input placeholder="" tabIndex={-1} style={{ width: '80px' }} disabled />
                )}
              </FormItem>
            </Col>
          </Row>
        ) : (
          <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
            <Col {...this.col2Layout}>
              <FormItem {...this.formItemLayout} label="运费">
                {record.trans_amount}({record.trans_type == 1 ? '现付' : '回付'})
              </FormItem>
            </Col>
            <Col {...this.col2Layout}>
              <FormItem {...this.formItemLayout} label="折后运费">
                {record.trans_discount}
              </FormItem>
            </Col>
          </Row>
        )}
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col {...this.col2Layout}>
            <FormItem {...this.formItemLayout} label="货款">
              {record.order_amount}
            </FormItem>
          </Col>
          <Col {...this.col2Layout}>
            <FormItem {...this.formItemLayout} label="银行账号">
              {record.bank_account}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col {...this.col2Layout}>
            <FormItem {...this.formItemLayout} label="保价金额">
              {record.insurance_amount}
            </FormItem>
          </Col>
          <Col {...this.col2Layout}>
            <FormItem {...this.formItemLayout} label="保价费">
              {record.insurance_fee}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col {...this.col2Layout}>
            <FormItem {...this.formItemLayout} label="送货费">
              {record.deliver_amount}
            </FormItem>
          </Col>
          <Col {...this.col2Layout}>
            <FormItem {...this.formItemLayout} label="垫付金额">
              {record.order_advancepay_amount}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col {...this.col2Layout}>
            <FormItem {...this.formItemLayout} label="货物名称">
              {record.order_name}
            </FormItem>
          </Col>
          <Col {...this.col2Layout}>
            <FormItem {...this.formItemLayout} label="数量">
              {record.order_num}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col {...this.col2Layout}>
            <FormItem {...this.formItemLayout} label="转进/转出">
              {form.getFieldDecorator('transfer_type', {
                initialValue: record.transfer_type ? record.transfer_type : '',
              })(
                <Select placeholder="请选择" style={{ width: '100%' }} tabIndex={-1}>
                  <Option value={1}>转出</Option>
                  <Option value={2}>转进</Option>
                </Select>
              )}
            </FormItem>
          </Col>
          <Col {...this.col2Layout}>
            <FormItem {...this.formItemLayout} label="中转费">
              {form.getFieldDecorator('transfer_amount', { initialValue: record.transfer_amount })(
                <Input placeholder="请输入" tabIndex={-1} />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col {...this.col2Layout}>
            <FormItem {...this.formItemLayout} label="中转地址">
              {form.getFieldDecorator('transfer_address', {
                initialValue: record.transfer_address,
              })(<Input placeholder="请输入" tabIndex={-1} />)}
            </FormItem>
          </Col>
          <Col {...this.col2Layout}>
            <FormItem {...this.formItemLayout} label="中转物流">
              {form.getFieldDecorator('transfer_company_name', {
                initialValue: record.transfer_company_name,
              })(<Input placeholder="请输入" tabIndex={-1} />)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col {...this.col2Layout}>
            <FormItem {...this.formItemLayout} label="中转单号">
              {form.getFieldDecorator('transfer_order_code', {
                initialValue: record.transfer_order_code,
              })(<Input placeholder="请输入" tabIndex={-1} />)}
            </FormItem>
          </Col>
          <Col {...this.col2Layout}>
            <FormItem {...this.formItemLayout} label="中转电话">
              {form.getFieldDecorator('transfer_company_mobile', {
                initialValue: record.transfer_company_mobile,
              })(<Input placeholder="请输入" tabIndex={-1} />)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col {...this.col2Layout}>
            <FormItem {...this.formItemLayout} label="实收货款">
              {form.getFieldDecorator('order_real', { initialValue: record.order_real })(
                <Input placeholder="请输入" />
              )}
            </FormItem>
          </Col>
          <Col {...this.col2Layout}>
            <FormItem {...this.formItemLayout} label="实收运费">
              {form.getFieldDecorator('trans_discount', { initialValue: record.trans_discount })(
                <Input placeholder="请输入" />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col {...this.colLargeLayout}>
            <FormItem {...this.formItemMiniLayout} label="备注">
              {form.getFieldDecorator('remark', { initialValue: record.remark })(
                <Input placeholder="请输入" />
              )}
            </FormItem>
          </Col>
        </Row>
      </Modal>
    );
  }
}

export default OrderEditForm;
