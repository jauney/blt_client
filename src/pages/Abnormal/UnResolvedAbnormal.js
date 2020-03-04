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
import { getSelectedAccount, getSelectedDownAccount } from '@/utils/account';
import StandardTable from '@/components/StandardTable';
import OrderEditForm from '@/components/EditOrderForm';
import styles from './Abnormal.less';
import { async } from 'q';
import { fileToObject } from 'antd/lib/upload/utils';
import { CacheSite, CacheUser, CacheCompany, CacheRole } from '../../utils/storage';
const { RangePicker } = DatePicker;

const FormItem = Form.Item;
const { Option } = Select;

@Form.create()
class AbnormalForm extends PureComponent {
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

  onAbnormalSelect = (value, option) => {
    this.setState({
      abnormal_type_id: option.props.abnormal_type_id,
      abnormal_type: option.props.text,
    });
  };

  onDownAccountHandler = () => {
    const { onResolveAbnormal, form, abnormalTypes = [] } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      let abnormal;
      abnormalTypes.forEach(item => {
        if (item.abnormal_type_id == fieldsValue.abnormal_type_id) {
          abnormal = item;
        }
      });

      if (!abnormal) {
        abnormal = { abnormal_type: fieldsValue.abnormal_type, abnormal_type_id: 0 };
      }
      onResolveAbnormal({
        abnormal_status: 2,
        abnormal_reason: fieldsValue.abnormal_reason,
        abnormal_amount: fieldsValue.abnormal_amount,
        abnormal_resolve_type: fieldsValue.abnormal_resolve_type,
        abnormal_remark: fieldsValue.abnormal_remark,
        ...abnormal,
      });
    });
  };

  renderCustomerOption = item => {
    const AutoOption = AutoComplete.Option;
    return (
      <AutoOption
        key={item.abnormal_type_id}
        abnormal_type_id={item.abnormal_type_id}
        value={`${item.abnormal_type_id}`}
        text={item.abnormal_type}
      >
        {item.abnormal_type}
      </AutoOption>
    );
  };

  render() {
    const {
      modalVisible,
      onResolveAbnormalModalCancel,
      selectedRows,
      form,
      abnormalTypes,
    } = this.props;

    console.log(selectedRows);
    return (
      <Modal
        destroyOnClose
        title="处理异常"
        okText="确认"
        cancelText="取消"
        visible={modalVisible}
        onCancel={() => onResolveAbnormalModalCancel()}
        footer={[
          <Button key="btn-cancel" onClick={() => onResolveAbnormalModalCancel()}>
            取 消
          </Button>,
          <Button key="btn-save" type="primary" onClick={this.onDownAccountHandler}>
            保 存
          </Button>,
        ]}
        width={800}
        className={styles.modalForm}
      >
        <Form>
          <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
            <Col>
              <FormItem {...this.formItemLayout} label="异常类型">
                {form.getFieldDecorator('abnormal_type_id', {
                  rules: [{ required: true, message: '请填写异常类型' }],
                  initialValue:
                    selectedRows.length > 0 ? `${selectedRows[0].abnormal_type_id}` : '',
                })(
                  <AutoComplete
                    size="large"
                    style={{ width: '100%' }}
                    dataSource={abnormalTypes.map(this.renderCustomerOption)}
                    onSelect={this.onAbnormalSelect}
                    placeholder="请输入"
                    optionLabelProp="text"
                    filterOption={(inputValue, option) =>
                      option.props.children.indexOf(inputValue) !== -1
                    }
                  />
                )}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
            <Col>
              <FormItem labelCol={{ span: 3, offset: 2 }} label="异常原因">
                {form.getFieldDecorator('abnormal_reason', {
                  initialValue: selectedRows.length > 0 ? selectedRows[0].abnormal_reason : '',
                })(<Input placeholder="请输入" style={{ width: '280px' }} />)}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
            <Col>
              <FormItem labelCol={{ span: 3, offset: 2 }} label="产生金额">
                {form.getFieldDecorator('abnormal_amount', { initialValue: '' })(
                  <Input placeholder="请输入" style={{ width: '280px' }} />
                )}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
            <Col>
              <FormItem labelCol={{ span: 3, offset: 2 }} label="处理方式">
                {form.getFieldDecorator('abnormal_resolve_type', { initialValue: '' })(
                  <Input placeholder="请输入" style={{ width: '280px' }} />
                )}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
            <Col>
              <FormItem labelCol={{ span: 3, offset: 2 }} label="备注">
                {form.getFieldDecorator('abnormal_remark', { initialValue: '' })(
                  <Input placeholder="请输入" style={{ width: '280px' }} />
                )}
              </FormItem>
            </Col>
          </Row>
        </Form>
      </Modal>
    );
  }
}

/* eslint react/no-multi-comp:0 */
@connect(({ customer, company, abnormal, site, car, receiver, loading }) => {
  return {
    customer,
    company,
    abnormal,
    site,
    car,
    receiver,
    loading: loading.models.rule,
  };
})
@Form.create()
class TableList extends PureComponent {
  state = {
    selectedRows: [],
    accountStatistic: {},
    formValues: {},
    current: 1,
    pageSize: 20,
    record: {},
    updateOrderModalVisible: false,
    settleModalVisible: false,
    abnormalModalVisible: false,
    signModalVisible: false,
    cancelSignModalVisible: false,
    downloadModalVisible: false,
    printModalVisible: false,
  };

  columns = [
    {
      title: '货单号',
      dataIndex: 'order_code',
      width: '80px',
      align: 'right',
      render: val => `${val}`,
      // mark to display a total number
      needTotal: true,
    },
    {
      title: '发货客户',
      dataIndex: 'sendcustomer_name',
      width: '80px',
    },
    {
      title: '收获客户',
      dataIndex: 'getcustomer_name',
      sorter: true,
      width: '80px',
    },
    {
      title: '应收货款',
      dataIndex: 'order_amount',
      width: '80px',
    },
    {
      title: '实收货款',
      dataIndex: 'order_real',
      width: '80px',
    },
    {
      title: '折后运费',
      dataIndex: 'trans_discount',
      width: '80px',
    },
    {
      title: '运费方式',
      dataIndex: 'trans_type',
      width: '80px',
      render: val => {
        if (val == 1) {
          return '现付';
        } else if (val == 2) {
          return '回付';
        }
        return '提付';
      },
    },
    {
      title: '垫付',
      dataIndex: 'order_advancepay_amount',
      width: '80px',
    },
    {
      title: '送货费',
      dataIndex: 'deliver_amount',
      width: '80px',
    },
    {
      title: '保价费',
      dataIndex: 'insurance_fee',
      width: '80px',
    },
    {
      title: '货物名称',
      dataIndex: 'order_name',
      width: '150px',
    },
    {
      title: '录票时间',
      width: '170px',
      dataIndex: 'create_date',
      render: val => <span>{val && moment(Number(val || 0)).format('YYYY-MM-DD HH:mm:ss')}</span>,
    },
    {
      title: '站点',
      dataIndex: 'site_name',
      width: '80px',
    },
    {
      title: '中转',
      dataIndex: 'transfer_type',
      width: '80px',
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

    await dispatch({
      type: 'abnormal/initOrderListAction',
    });

    // 下站只显示当前分公司
    const branchCompanyList = await dispatch({
      type: 'company/getBranchCompanyList',
      payload: { ...CacheCompany },
    });

    dispatch({
      type: 'site/getSiteListAction',
      payload: { pageNo: 1, pageSize: 100 },
    });

    let currentCompany = this.setCurrentCompany(branchCompanyList)
    await dispatch({
      type: 'abnormal/getAbnormalTypeListAction',
      payload: {
        pageNo: 1,
        pageSize: 100,
        company_id: currentCompany.company_id,
      },
    });

  }

  // 设置当前公司
  setCurrentCompany = (branchCompanyList = []) => {
    // 初始渲染的是否，先加载第一个分公司的收货人信息
    if (CacheCompany.company_type == 2) {
      this.setState({
        currentCompany: CacheCompany
      });

      return CacheCompany
    }
    else if (branchCompanyList && branchCompanyList.length > 0) {
      this.setState({
        currentCompany: branchCompanyList[0]
      });

      return branchCompanyList[0]
    }

    return {}
  }


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

  handleSelectRows = rows => {
    this.setState({
      selectedRows: rows,
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
    } = this.props;

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
    const { current, pageSize } = this.state;

    form.validateFields((err, fieldsValue) => {
      if (err) return;
      fieldsValue.abnormal_status = 1;

      Object.keys(fieldsValue).forEach(item => {
        if (!fieldsValue[item]) {
          delete fieldsValue[item];
        }
      });

      // TODO: 后续放开时间查询，目前方便测试，暂时关闭
      if (fieldsValue.entrunk_date && fieldsValue.entrunk_date.length > 0) {
        // values.entrunk_date = fieldsValue.entrunk_date.map(item => {
        //   return `${item.valueOf()}`;
        // });
      }

      const searchParams = Object.assign({ filter: fieldsValue }, data);
      dispatch({
        type: 'abnormal/getOrderListAction',
        payload: { pageNo: pageNo || current, pageSize, ...searchParams },
      });

      dispatch({
        type: 'abnormal/getOrderStatisticAction',
        payload: { ...searchParams },
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

  // 取消异常
  onCancelAbnormal = async data => {
    const { dispatch } = this.props;
    const { selectedRows } = this.state;
    const orderIds = selectedRows.map(item => {
      return item.order_id;
    });
    const result = await dispatch({
      type: 'abnormal/cancelAbnormalAction',
      payload: {
        abnormal_status: 0,
        order_id: orderIds,
      },
    });
    if (result.code == 0) {
      message.success('取消异常成功！');
      this.handleSearch();
    } else {
      message.error(result.msg);
    }
    return Promise.resolve();
  };

  // 打开下账对话框
  onCancelAbnormalModal = async () => {
    Modal.confirm({
      title: '确认',
      content: '确定取消异常吗？',
      okText: '确认',
      cancelText: '取消',
      onOk: this.onCancelAbnormal,
    });
  };

  onResolveAbnormal = async data => {
    const { dispatch } = this.props;
    const { selectedRows } = this.state;
    const orderIds = selectedRows.map(item => {
      return item.order_id;
    });
    const result = await dispatch({
      type: 'abnormal/resolveAbnormalAction',
      payload: Object.assign(data, { order_id: orderIds }),
    });
    if (result.code == 0) {
      message.success('处理异常成功！');
      this.onResolveAbnormalModalCancel();
      this.handleSearch();
    } else {
      message.error(result.msg);
    }
    return Promise.resolve();
  };

  /**
   * 异常处理弹窗
   */
  onResolveAbnormalModal = () => {
    this.setState({
      abnormalModalVisible: true,
    });
  };

  /**
   * 关闭异常处理弹窗
   */
  onResolveAbnormalModalCancel = () => {
    this.setState({
      abnormalModalVisible: false,
    });
  };

  /**
   * 修改订单信息弹窗
   */
  onUpdateOrderModalShow = () => {
    this.setState({
      updateOrderModalVisible: true,
    });
  };

  onUpdateOrderModalCancel = () => {
    // setTimeout(() => this.addBtn.blur(), 0);
    this.setState({
      updateOrderModalVisible: false,
    });
  };

  // 编辑订单信息
  onRowDoubleClick = (record, index, event) => {
    this.setState({
      record,
    });
    this.onUpdateOrderModalShow();
  };

  // 已结算账目核对中，计算付款日期
  onRowClick = (record, index, event) => { };

  tableFooter = () => {
    const {
      abnormal: {
        total,
        totalOrderAmount,
        totalTransAmount,
        totalInsurancefee,
        totalAdvancepayAmount,
        totalDeliverAmount,
      },
    } = this.props;
    return (
      <div className={styles.tableFooter}>
        <span>货款总额：{totalOrderAmount || '0'}</span>
        <span className={styles.footerSplit}>运费总额：{totalTransAmount || '0'}</span>
        <span className={styles.footerSplit}>垫付总额：{totalAdvancepayAmount || '0'}</span>
        <span className={styles.footerSplit}>送货费总额：{totalDeliverAmount || '0'}</span>
        <span className={styles.footerSplit}>保价费总额：{totalInsurancefee || '0'}</span>
        <span className={styles.footerSplit}>票数：{total || '0'}</span>
      </div>
    );
  };

  renderSimpleForm() {
    const {
      form: { getFieldDecorator },
      site: { entrunkSiteList, normalSiteList },
      company: { branchCompanyList },
      abnormal: { abnormalTypes },
    } = this.props;
    const companyOption = {};
    // 默认勾选第一个公司
    if (branchCompanyList.length > 0 && CacheCompany.company_type != 1) {
      companyOption.initialValue = branchCompanyList[0].company_id || '';
    }
    // 默认勾选第一个公司
    if (CacheCompany.company_type != 1) {
      companyOption.initialValue = CacheCompany.company_id || '';
    }
    const allowClearFlag = CacheCompany.company_type == 1 ? true : false;
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <FormItem label="分公司">
          {getFieldDecorator('company_id', companyOption)(
            <Select placeholder="全部" onSelect={this.onCompanySelect} style={{ width: '100px' }} allowClear={allowClearFlag}>
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
        <FormItem label="运单号">
          {getFieldDecorator('order_code', {})(
            <Input placeholder="请输入" style={{ width: '150px' }} />
          )}
        </FormItem>
        <FormItem label="站点">
          {getFieldDecorator('site_id', { initialValue: CacheSite.site_id })(
            <Select placeholder="全部" style={{ width: '100px' }}>
              {normalSiteList.map(ele => {
                return (
                  <Option key={ele.site_id} value={ele.site_id}>
                    {ele.site_name}
                  </Option>
                );
              })}
            </Select>
          )}
        </FormItem>
        <FormItem label="异常类型">
          {getFieldDecorator('abnormal_type_id')(
            <Select placeholder="全部" style={{ width: '100px' }}>
              {abnormalTypes.map(ele => {
                return (
                  <Option key={ele.abnormal_type_id} value={ele.abnormal_type_id}>
                    {ele.abnormal_type}
                  </Option>
                );
              })}
            </Select>
          )}
        </FormItem>
        <FormItem label="托运日期">
          {getFieldDecorator('entrunk_date', {})(<RangePicker style={{ width: '250px' }} />)}
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
      abnormal: { orderList, total, totalOrderAmount, totalTransAmount },
      loading,
      abnormal: { abnormalTypes },
    } = this.props;

    const {
      selectedRows,
      accountStatistic,
      current,
      pageSize,
      updateOrderModalVisible,
      settleModalVisible,
      abnormalModalVisible,
      signModalVisible,
      cancelSignModalVisible,
      downloadModalVisible,
      printModalVisible,
      record,
    } = this.state;
    // 是否显示操作按钮
    let showOperateButton = true
    if (['site_searchuser'].indexOf(CacheRole.role_value) >= 0) {
      showOperateButton = false
    }
    return (
      <div>
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>{this.renderForm()}</div>
            <div className={styles.tableListOperator}>
              {selectedRows.length > 0 && showOperateButton && (
                <span>
                  <Button onClick={this.onCancelAbnormalModal}>取消异常</Button>
                  <Button onClick={this.onResolveAbnormalModal}>处理异常</Button>
                </span>
              )}
            </div>
            <StandardTable
              onRef={this.onRefTable}
              selectedRows={selectedRows}
              loading={loading}
              className={styles.dataTable}
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
              onSelectRow={this.handleSelectRows}
              onChange={this.handleStandardTableChange}
              onClickHander={this.onRowClick}
              onDoubleClickHander={this.onRowDoubleClick}
              rowClassNameHandler={(record, index) => { }}
            />
          </div>
          {this.tableFooter()}
        </Card>
        <OrderEditForm
          modalVisible={updateOrderModalVisible}
          record={record}
          onCancelModal={this.onUpdateOrderModalCancel}
          handleSearch={this.handleSearch}
        />
        <AbnormalForm
          modalVisible={abnormalModalVisible}
          onResolveAbnormal={this.onResolveAbnormal}
          onResolveAbnormalModalCancel={this.onResolveAbnormalModalCancel}
          selectedRows={selectedRows}
          abnormalTypes={abnormalTypes}
        />
        <Modal
          title="取消结账"
          okText="确认"
          cancelText="取消"
          visible={settleModalVisible}
          onOk={this.onSettleOk}
          onCancel={this.onSettleCancel}
        >
          <p>{`取消结算货款条数${selectedRows.length}，取消结算总额 ${
            accountStatistic.totalAccount
            } `}</p>
          <p>您确认结账么？</p>
        </Modal>
        <Modal
          title="确认"
          okText="确认"
          cancelText="取消"
          visible={signModalVisible}
          onOk={this.onSignOk}
          onCancel={this.onSignCancel}
        >
          <p>您确认签字么？</p>
        </Modal>
        <Modal
          title="确认"
          okText="确认"
          cancelText="取消"
          visible={cancelSignModalVisible}
          onOk={this.onCancelSignOk}
          onCancel={this.onCancelSignCancel}
        >
          <p>您确认取消签字么？</p>
        </Modal>
        <Modal
          title="确认"
          okText="确认"
          cancelText="取消"
          visible={printModalVisible}
          onOk={this.onPrintOk}
          onCancel={this.onPrintCancel}
        >
          <p>您确认结账打印么？</p>
        </Modal>
        <Modal
          title="确认"
          okText="确认"
          cancelText="取消"
          visible={downloadModalVisible}
          onOk={this.onDownloadOk}
          onCancel={this.onDownloadCancel}
        >
          <p>您确认要下载么？</p>
        </Modal>
      </div>
    );
  }
}

export default TableList;
