import { stringify } from 'qs';
import { message, Modal } from 'antd';
import request from '@/utils/request';
import axios from 'axios';
import router from 'umi/router';
import { HttpLink } from 'apollo-link-http';
import { ApolloClient } from 'apollo-client';
import { ApolloLink, concat } from 'apollo-link';
import gql from 'graphql-tag';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { async } from 'q';

let APIHOST = ``;
// TODO: fortest
// APIHOST = 'http://127.0.0.1:8005';
let APIURL = `/graphql`;

// 线上
// APIURL = 'http://118.190.100.113:8002/graphql'
// const httpLink = new HttpLink({ uri: 'http://118.190.100.113:8002/graphql' });
// 测试
// const httpLink = new HttpLink({ uri: 'http://47.105.84.59:8002/graphql' });
// 本地调试
const httpLink = new HttpLink({
  uri: APIURL,
  headers: {
    'Access-Control-Allow-Origin': '*',
    Accept: 'application/json',
    authorization: localStorage.getItem('token') || '',
  },
});
const defaultOptions = {
  watchQuery: {
    fetchPolicy: 'no-cache',
    errorPolicy: 'ignore',
  },
  query: {
    fetchPolicy: 'no-cache',
    errorPolicy: 'all',
  },
};
const cache = new InMemoryCache();
const client = new ApolloClient({
  link: httpLink,
  cache,
  defaultOptions: defaultOptions,
});

async function ajaxFetch(api, data = {}) {
  const result = await axios({
    method: 'post',
    url: api,
    data,
    headers: {
      authorization: localStorage.getItem('token') || '',
    },
  }).catch(e => {
    console.log(e);
    showErrorMessage(e);
    return {
      status: 200,
      data: { code: 9999, msg: '系统繁忙，请稍后再试' },
    };
  });

  if (/20[0-9]/.test(result.status)) {
    return result.data;
  }
  showErrorMessage(result);
}
/**
 * 登录校验跳转。后端接口没登录，则跳转到登录
 * @param {*} data
 */
function gotoLogin(data) {
  if (data.errors && data.errors.length > 0 && data.errors[0].message == 'login') {
    router.push('/User/Login');
    return false;
  }
  return true;
}

function showErrorMessage(error = {}) {
  console.log(error);
  let msg = JSON.stringify(error);
  Modal.error({
    content: `系统繁忙，请稍后再试-${msg}`,
    okText: '我知道了',
  });
  //message.error(`系统繁忙，请稍后再试-${msg}`);
}

export async function fakeAccountLogin(params) {
  return await ajaxFetch(`${APIHOST}/api/Login`, {
    ...params,
  });
}

// company
export async function queryCompanyList(params) {
  params.company = params.filter;
  delete params.filter;
  return await ajaxFetch(`${APIHOST}/api/GetCompanys`, {
    ...params,
  });
}

export async function addCompany(params) {
  return client
    .mutate({
      mutation: gql`
        mutation addCompany($company: CompanyInput, $ids: [Int]) {
          addCompany(company: $company, ids: $ids) {
            code
            msg
          }
        }
      `,
      variables: params,
    })
    .then(data => {
      gotoLogin(data);
      return data.data.addCompany;
    })
    .catch(error => {
      showErrorMessage(error);
    });
}

export async function createCourier({ courier, type }) {
  return client
    .mutate({
      mutation: gql`
        mutation createCourier($courier: CourierInput, $type: Int) {
          createCourier(courier: $courier, type: $type) {
            code
            msg
          }
        }
      `,
      variables: { courier, type },
    })
    .then(data => {
      gotoLogin(data);
      return data.data.createCourier;
    })
    .catch(error => {
      showErrorMessage(error);
    });
}

export async function updateCourier({ courier, ids, type }) {
  return client
    .mutate({
      mutation: gql`
        mutation updateCourier($ids: [Int], $courier: CourierInput, $type: String) {
          updateCourier(ids: $ids, courier: $courier, type: $type) {
            code
            msg
          }
        }
      `,
      variables: { ids, courier, type },
    })
    .then(data => {
      gotoLogin(data);
      return data.data.updateCourier;
    })
    .catch(error => {
      showErrorMessage(error);
    });
}

export async function updateCustomerCourier({ courier, order_id, customer_id, type }) {
  return client
    .mutate({
      mutation: gql`
        mutation updateCustomerCourier(
          $order_id: [Int]
          $customer_id: [Int]
          $courier: CourierInput
          $type: String
        ) {
          updateCustomerCourier(
            order_id: $order_id
            customer_id: $customer_id
            courier: $courier
            type: $type
          ) {
            code
            msg
          }
        }
      `,
      variables: { courier, order_id, customer_id, type },
    })
    .then(data => {
      gotoLogin(data);
      return data.data.updateCustomerCourier;
    })
    .catch(error => {
      showErrorMessage(error);
    });
}

export async function getCourierList(params) {
  if (params.filter) {
    params.courier = params.filter;
  }
  return await ajaxFetch(`${APIHOST}/api/GetCourierList`, {
    ...params,
  });
}

export async function getOperatorList(params) {
  if (params.filter) {
    params.user = params.filter;
  }
  return await ajaxFetch(`${APIHOST}/api/GetUserList`, {
    ...params,
  });
}

export async function getRoleList(params) {
  return client
    .query({
      query: gql`
        query getRoleList($pageNo: Int, $pageSize: Int, $filter: RoleInput) {
          getRoleList(pageNo: $pageNo, pageSize: $pageSize, filter: $filter) {
            roleTotal
            roleList {
              role_id
              role_name
              role_value
              role_desc
              company_type
            }
          }
        }
      `,
      variables: params,
    })
    .then(data => {
      gotoLogin(data);
      return data.data.getRoleList;
    })
    .catch(error => {
      showErrorMessage(error);
    });
}

export async function getUserInfos(params) {
  return client
    .query({
      query: gql`
        query getUserInfos($pageNo: Int, $pageSize: Int, $filter: UserInput) {
          getUserInfos(pageNo: $pageNo, pageSize: $pageSize, filter: $filter) {
            total
            userList {
              user_id
              user_name
              user_mobile
              user_pass
              user_type
              site_id
              company_id
              lock_pc
              role {
                role_id
                role_value
                role_name
                role_desc
              }
            }
          }
        }
      `,
      variables: params,
    })
    .then(data => {
      gotoLogin(data);
      return data.data.getUserInfos;
    })
    .catch(error => {
      showErrorMessage(error);
    });
}

export async function addUser(params) {
  return client
    .mutate({
      mutation: gql`
        mutation addUser($user: UserInput, $ids: [Int]) {
          addUser(user: $user, ids: $ids) {
            code
            msg
          }
        }
      `,
      variables: params,
    })
    .then(data => {
      gotoLogin(data);
      return data.data.addUser;
    })
    .catch(error => {
      showErrorMessage(error);
    });
}

export async function createCustomer({ customer, type }) {
  return await ajaxFetch(`${APIHOST}/api/CreateCustomer`, {
    customer,
    type,
  });
}

export async function updateCustomer({ customer, customer_id, type }) {
  if (!customer_id) {
    customer_id = [customer.customer_id];
  }

  return await ajaxFetch(`${APIHOST}/api/UpdateCustomer`, {
    customer,
    customer_id,
    type,
  });
}

export async function queryCustomerList(params) {
  params.customer = params.filter;
  delete params.filter;
  return await ajaxFetch(`${APIHOST}/api/GetCustomers`, {
    ...params,
  });
}

export async function getCustomerMobiles(params) {
  return await ajaxFetch(`${APIHOST}/api/GetCustomerMobiles`, {
    ...params,
  });
}

// site
export async function querySiteList(params) {
  params.site = params.filter;
  delete params.filter;
  return await ajaxFetch(`${APIHOST}/api/GetSites`, {
    ...params,
  });
}

// site
export async function addSite(params) {
  return client
    .mutate({
      mutation: gql`
        mutation addSite($ids: [Int], $site: SiteInput) {
          addSite(ids: $ids, site: $site) {
            code
            msg
          }
        }
      `,
      variables: params,
    })
    .then(data => {
      gotoLogin(data);
      return data.data.addSite;
    })
    .catch(error => {
      showErrorMessage(error);
    });
}

// order
export async function getOrderCode(params) {
  return client
    .query({
      query: gql`
        query getOrderCode($site_id: Int) {
          getOrderCode(site_id: $site_id) {
            order_code
            site_id
            site_orderprefix
          }
        }
      `,
      variables: params,
    })
    .then(data => {
      gotoLogin(data);
      return data.data.getOrderCode;
    })
    .catch(error => {
      showErrorMessage(error);
    });
}

export async function createOrderAxios(params) {
  return await ajaxFetch(`${APIHOST}/api/CreateOrder`, {
    order: params,
  });
}

export async function updateOrder({ order, order_id }) {
  if (order.trans_real) {
    order.trans_real = Number(order.trans_real || 0);
  }
  if (order.order_real) {
    order.order_real = Number(order.order_real || 0);
  }
  if (order.trans_discount) {
    order.trans_discount = Number(order.trans_discount || 0);
  }

  return await ajaxFetch(`${APIHOST}/api/UpdateOrder`, {
    order_id,
    order,
  });
}

export async function settleOrder(params) {
  return await ajaxFetch(`${APIHOST}/api/SettleOrder`, {
    ...params,
  });
}

export async function cancelSettleOrder(params) {
  return await ajaxFetch(`${APIHOST}/api/CancelSettleOrder`, {
    ...params,
  });
}

export async function downAccount(params) {
  return await ajaxFetch(`${APIHOST}/api/DownAccountOrder`, {
    ...params,
  });
}

export async function cancelTodayDownAccountOrder(params) {
  return await ajaxFetch(`${APIHOST}/api/CancelTodayPay`, {
    ...params,
  });
}

export async function cancelDownAccountOrder(params) {
  return client
    .mutate({
      mutation: gql`
        mutation cancelDownAccountOrder($order_id: [Int]) {
          cancelDownAccountOrder(order_id: $order_id) {
            code
            msg
          }
        }
      `,
      variables: params,
    })
    .then(data => {
      gotoLogin(data);
      return data.data.cancelDownAccountOrder;
    })
    .catch(error => {
      showErrorMessage(error);
    });
}

// 签字、取消签字
export async function updateTransSign(params) {
  return client
    .mutate({
      mutation: gql`
        mutation updateTransSign($order_id: [Int], $trans_sign: Int) {
          updateTransSign(order_id: $order_id, trans_sign: $trans_sign) {
            code
            msg
          }
        }
      `,
      variables: params,
    })
    .then(data => {
      gotoLogin(data);
      return data.data.updateTransSign;
    })
    .catch(error => {
      showErrorMessage(error);
    });
}

// 签字、取消签字
export async function updateOrderSign(params) {
  return client
    .mutate({
      mutation: gql`
        mutation updateOrderSign($order_id: [Int], $sign_status: Int) {
          updateOrderSign(order_id: $order_id, sign_status: $sign_status) {
            code
            msg
          }
        }
      `,
      variables: params,
    })
    .then(data => {
      gotoLogin(data);
      return data.data.updateOrderSign;
    })
    .catch(error => {
      showErrorMessage(error);
    });
}

export async function getCustomerList(params) {
  params.customer = params.filter;
  delete params.filter;
  return await ajaxFetch(`${APIHOST}/api/GetCustomers`, {
    ...params,
  });
}

export async function getCustomer(params) {
  return await ajaxFetch(`${APIHOST}/api/GetCustomer`, {
    ...params,
  });
}

export async function getCustomerTypes(params) {
  return await ajaxFetch(`${APIHOST}/api/GetCustomerTypes`, {
    ...params,
  });
}

function convertOrderFieldType(order = {}) {
  const fieldInt = [
    'car_id',
    'is_delete',
    'create_user_id',
    'sign_status',
    'abnormal_status',
    'abnormal_type_id',
    'abnormal_type',
    'transfer_type',
    'order_label_num',
    'order_num',
    'sendcustomer_type',
    'getcustomer_type',
    'pay_user_id',
    'settle_user_id',
    'receiver_id',
    'sender_id',
    'operator_id',
    'shipsite_id',
    'site_id',
    'order_id',
    'company_id',
    'getcustomer_id',
    'sendcustomer_id',
    'pay_status',
    'trans_type',
    'trans_status',
    'trans_sign',
    'trans_operatorid',
  ];
  const fieldFloat = [
    'agency_fee',
    'pay_abnormal',
    'trans_show_amount',
    'abnormal_amount',
    'bonus_amount',
    'transfer_amount',
    'order_advancepay_amount',
    'late_fee',
    'order_amount',
    'order_real',
    'trans_originalamount',
    'trans_amount',
    'trans_real',
    'trans_discount',
    'deliver_amount',
    'insurance_amount',
    'insurance_fee',
  ];
  const fieldStr = [
    'update_date',
    'arrive_date',
    'create_user_name',
    'abnormal_reason',
    'abnormal_remark',
    'abnormal_resolve_type',
    'remark',
    'transfer_company_mobile',
    'transfer_company_name',
    'transfer_address',
    'transfer_order_code',
    'pay_user_name',
    'settle_user_name',
    'receiver_name',
    'sender_name',
    'operator_name',
    'shipsite_name',
    'site_name',
    'settle_date',
    'depart_date',
    'company_name',
    'order_code',
    'car_code',
    'getcustomer_name',
    'getcustomer_mobile',
    'sendcustomer_name',
    'sendcustomer_mobile',
    'bank_account',
    'getcustomer_address',
    'sendcustomer_address',
    'trans_confirmdate',
    'trans_operatorname',
    'order_name',
    'pay_date',
  ];
  const fieldArrStr = ['create_date', 'entrunk_date'];
  const fieldArrInt = ['order_status'];

  Object.keys(order).forEach(key => {
    if (!order[key] || order[key] == 'undefined' || order[key] == 'null') {
      delete order[key];
      return;
    }
    if (fieldInt.includes(key)) {
      order[key] = parseInt(`${order[key]}`, 10) || 0;
    } else if (fieldStr.includes(key)) {
      order[key] = `${order[key]}`;
    } else if (fieldFloat.includes(key)) {
      order[key] = parseFloat(`${order[key]}`, 10) || 0;
    } else if (fieldArrInt.includes(key)) {
      order[key] = Array.isArray(order[key]) ? order[key] : [order[key]];
      for (let i = 0; i < order[key].length; i++) {
        order[key][i] = parseInt(`${order[key][i]}`, 10) || 0;
      }
    } else if (fieldArrStr.includes(key)) {
      order[key] = Array.isArray(order[key]) ? order[key] : [order[key]];
      for (let i = 0; i < order[key].length; i++) {
        order[key][i] = `${order[key][i]}`;
      }
    }
  });

  return order;
}

export async function getOrderListAxios(params) {
  params.order = params.filter;
  delete params.filter;

  params.order = convertOrderFieldType(params.order);

  return await ajaxFetch(`${APIHOST}/api/GetOrders`, {
    ...params,
  });
}

export async function getTodayPayList(params) {
  if (params.filter) {
    params.todaypay = params.filter;
    if (params.todaypay && params.todaypay.pay_date) {
      params.todaypay.pay_date = `${params.todaypay.pay_date}`;
    }
  }
  return await ajaxFetch(`${APIHOST}/api/GetTodayPays`, {
    ...params,
  });
}

export async function deleteOrder(params) {
  return client
    .mutate({
      mutation: gql`
        mutation deleteOrder($order_id: [Int], $is_delete: Int) {
          deleteOrder(order_id: $order_id, is_delete: $is_delete) {
            code
            msg
          }
        }
      `,
      variables: params,
    })
    .then(data => {
      gotoLogin(data);
      return data.data.deleteOrder;
    })
    .catch(error => {
      showErrorMessage(error);
    });
}

export async function getOrderStatisticAxios(params) {
  params.order = params.filter;
  delete params.filter;
  console.log(params.order);
  params.order = convertOrderFieldType(params.order);

  console.log(params.order);
  return await ajaxFetch(`${APIHOST}/api/GetOrderStatistic`, {
    ...params,
  });
}

export async function getTodayPayStatistic(params) {
  if (params.filter) {
    params.todaypay = params.filter;
  }
  return await ajaxFetch(`${APIHOST}/api/GetTodayPayStatistic`, {
    ...params,
  });
}

export async function shipOrderAxios(params) {
  return await ajaxFetch(`${APIHOST}/api/ShipOrder`, {
    ...params,
  });
}

export async function cancelShipOrder(params) {
  return client
    .mutate({
      mutation: gql`
        mutation cancelShipOrder($order_id: [Int]) {
          cancelShipOrder(order_id: $order_id) {
            code
            msg
          }
        }
      `,
      variables: params,
    })
    .then(data => {
      gotoLogin(data);
      return data.data.cancelShipOrder;
    })
    .catch(error => {
      showErrorMessage(error);
    });
}

export async function entrunkOrder(params) {
  return await ajaxFetch(`${APIHOST}/api/EntrunkOrder`, {
    ...params,
  });
}

export async function departOrder(params) {
  return await ajaxFetch(`${APIHOST}/api/DepartOrder`, {
    ...params,
  });
}

export async function cancelEntrunk(params = {}) {
  if (params.car && params.car['__typename']) {
    delete params.car['__typename'];
  }
  return await ajaxFetch(`${APIHOST}/api/CancelEntrunk`, {
    ...params,
  });
}

export async function changeOrderReceiver(params) {
  return client
    .mutate({
      mutation: gql`
        mutation changeOrderReceiver($order_id: [Int], $receiver_id: Int, $receiver_name: String) {
          changeOrderReceiver(
            order_id: $order_id
            receiver_id: $receiver_id
            receiver_name: $receiver_name
          ) {
            code
            msg
          }
        }
      `,
      variables: params,
    })
    .then(data => {
      gotoLogin(data);
      return data.data.changeOrderReceiver;
    })
    .catch(error => {
      showErrorMessage(error);
    });
}

export async function updateCarFee({ car = {} }) {
  delete car['__typename'];
  return await ajaxFetch(`${APIHOST}/api/UpdateCarFee`, {
    car,
  });
}

export async function updateCarStatus(car) {
  return await ajaxFetch(`${APIHOST}/api/UpdateCarStatus`, {
    car,
  });
}
// 接货人
export async function queryReceiverList(params) {
  params.courier = params.filter;
  delete params.filter;
  return await ajaxFetch(`${APIHOST}/api/GetCouriers`, {
    ...params,
  });
}

// car
export async function queryCarList(params) {
  return client
    .query({
      query: gql`
        query getCars($pageNo: Int, $pageSize: Int, $company_id: Int) {
          getCars(pageNo: $pageNo, pageSize: $pageSize, company_id: $company_id) {
            total
            cars {
              car_id
              driver_plate
              car_fee
              car_code
              car_date
              driver_name
              driver_mobile
              confirm
              company_id
              shipsite_id
              car_status
            }
          }
        }
      `,
      variables: params,
    })
    .then(data => {
      gotoLogin(data);
      return data.data.getCars;
    })
    .catch(error => {
      showErrorMessage(error);
    });
}

export async function getCarCode(params) {
  return client
    .query({
      query: gql`
        query getCarCode($company_id: Int) {
          getCarCode(company_id: $company_id) {
            car_code
            order_status
          }
        }
      `,
      variables: params,
    })
    .then(data => {
      gotoLogin(data);
      return data.data.getCarCode;
    })
    .catch(error => {
      showErrorMessage(error);
    });
}

export async function getLastCarCode(params) {
  return await ajaxFetch(`${APIHOST}/api/GetLastCarCode`, {
    ...params,
  });
}

export async function getCarInfo(params) {
  return client
    .query({
      query: gql`
        query getCarInfo($company_id: Int, $car_code: String) {
          getCarInfo(company_id: $company_id, car_code: $car_code) {
            car_id
            car_fee
            car_code
            car_date
            driver_name
            driver_mobile
            driver_plate
            confirm
            company_id
            shipsite_id
            car_status
          }
        }
      `,
      variables: params,
    })
    .then(data => {
      gotoLogin(data);
      return data.data.getCarInfo;
    })
    .catch(error => {
      showErrorMessage(error);
    });
}

// driver
export async function queryDriverList(params) {
  return await ajaxFetch(`${APIHOST}/api/GetDrivers`, {
    ...params,
  });
}

export async function updateAbnormal(params) {
  if (typeof params.abnormal_type_id == 'undefined') {
    params.abnormal_type_id = 0;
  }
  if (typeof params.abnormal_reason == 'undefined') {
    params.abnormal_reason = '';
  }
  if (typeof params.abnormal_resolve_type == 'undefined') {
    params.abnormal_resolve_type = '';
  }
  if (typeof params.abnormal_amount == 'undefined') {
    params.abnormal_amount = '';
  }
  if (typeof params.abnormal_remark == 'undefined') {
    params.abnormal_remark = '';
  }
  return client
    .mutate({
      mutation: gql`
        mutation updateAbnormal(
          $order_id: [Int]
          $abnormal_type: String
          $abnormal_type_id: Int
          $abnormal_reason: String
          $abnormal_status: Int
          $abnormal_resolve_type: String
          $abnormal_amount: String
          $abnormal_remark: String
        ) {
          updateAbnormal(
            order_id: $order_id
            abnormal_type: $abnormal_type
            abnormal_type_id: $abnormal_type_id
            abnormal_reason: $abnormal_reason
            abnormal_status: $abnormal_status
            abnormal_resolve_type: $abnormal_resolve_type
            abnormal_amount: $abnormal_amount
            abnormal_remark: $abnormal_remark
          ) {
            code
            msg
          }
        }
      `,
      variables: params,
    })
    .then(data => {
      gotoLogin(data);
      return data.data.updateAbnormal;
    })
    .catch(error => {
      showErrorMessage(error);
    });
}

export async function updatePayStatus(params) {
  return client
    .mutate({
      mutation: gql`
        mutation updatePayStatus($order_id: [Int], $order: OrderInput) {
          updatePayStatus(order_id: $order_id, order: $order) {
            code
            msg
          }
        }
      `,
      variables: params,
    })
    .then(data => {
      gotoLogin(data);
      return data.data.updatePayStatus;
    })
    .catch(error => {
      showErrorMessage(error);
    });
}

export async function cancelAbnormal(params) {
  return client
    .mutate({
      mutation: gql`
        mutation cancelAbnormal($order_id: [Int], $abnormal_status: Int) {
          cancelAbnormal(order_id: $order_id, abnormal_status: $abnormal_status) {
            code
            msg
          }
        }
      `,
      variables: params,
    })
    .then(data => {
      gotoLogin(data);
      return data.data.cancelAbnormal;
    })
    .catch(error => {
      showErrorMessage(error);
    });
}

export async function getAbnormalTypes(params) {
  return await ajaxFetch(`${APIHOST}/api/GetAbnormalTypes`, {
    ...params,
  });
}

// incomes
export async function getIncomes(params) {
  params.income = params.filter;
  delete params.filter;
  return await ajaxFetch(`${APIHOST}/api/GetIncomes`, {
    ...params,
  });
}

// income types
export async function getIncomeTypes(params) {
  return await ajaxFetch(`${APIHOST}/api/GetIncomeTypes`, {
    ...params,
  });
}

export async function getDebtTypes(params) {
  return await ajaxFetch(`${APIHOST}/api/GetDebtTypes`, {
    ...params,
  });
}

export async function addIncome(params) {
  console.log('api.... ', params);
  params.company_id = isNaN(Number(params.company_id)) ? 0 : Number(params.company_id);
  params.incometype_id = isNaN(Number(params.incometype_id)) ? 0 : Number(params.incometype_id);
  params.site_id = isNaN(Number(params.site_id)) ? 0 : Number(params.site_id);
  return await ajaxFetch(`${APIHOST}/api/AddIncome`, {
    income: params,
  });
}

// expenses
export async function getExpenses(params) {
  params.expense = params.filter;
  delete params.filter;
  return await ajaxFetch(`${APIHOST}/api/GetExpenses`, {
    ...params,
  });
}

// expense types
export async function getExpenseTypes(params) {
  return await ajaxFetch(`${APIHOST}/api/GetExpenseTypes`, {
    ...params,
  });
}

export async function addExpense(params) {
  params.company_id = isNaN(Number(params.company_id)) ? 0 : Number(params.company_id);
  params.expensetype_id = isNaN(Number(params.expensetype_id)) ? 0 : Number(params.expensetype_id);
  params.site_id = isNaN(Number(params.site_id)) ? 0 : Number(params.site_id);
  return await ajaxFetch(`${APIHOST}/api/AddExpense`, {
    expense: params,
  });
}

// debts
export async function getDebtUsers(params) {
  return await ajaxFetch(`${APIHOST}/api/GetDebtUsers`, {
    ...params,
  });
}

// debts
export async function getDebts(params) {
  params.debt = params.filter;
  delete params.filter;
  return await ajaxFetch(`${APIHOST}/api/GetDebts`, {
    ...params,
  });
}

export async function getDebtsStatistic(params) {
  const debt = params.filter;
  return await ajaxFetch(`${APIHOST}/api/GetDebtStatistic`, {
    ...debt,
  });
}

export async function settleDebt(params) {
  params.debt = params.filter;
  delete params.filter;
  return await ajaxFetch(`${APIHOST}/api/SettleDebt`, {
    ...params,
  });
}

export async function addDebt(params) {
  params.company_id = isNaN(Number(params.company_id)) ? 0 : Number(params.company_id);
  params.site_id = isNaN(Number(params.site_id)) ? 0 : Number(params.site_id);
  params.debt_money = isNaN(Number(params.debt_money)) ? 0 : Number(params.debt_money);
  return await ajaxFetch(`${APIHOST}/api/AddDebt`, {
    debt: params,
  });
}

// getTransfers
export async function getTransfers(params) {
  // if (params.filter && params.filter.transfer_status) {
  //   params.filter.transfer_status = Number(params.filter.transfer_status);
  // }
  params.transfer = params.filter;
  delete params.filter;
  return await ajaxFetch(`${APIHOST}/api/GetTransfers`, {
    ...params,
  });
}

// getTransferStatistic
export async function getTransferStatistic(params) {
  // if (params.filter && params.filter.transfer_status) {
  //   delete params.filter.transfer_status
  // }
  params.transfer = params.filter;
  delete params.filter;
  return await ajaxFetch(`${APIHOST}/api/GetTransferStatistic`, {
    ...params,
  });
}

export async function addTransfer(params) {
  params.company_id = isNaN(Number(params.company_id)) ? 0 : Number(params.company_id);
  params.site_id = isNaN(Number(params.site_id)) ? 0 : Number(params.site_id);
  params.transfer_money = isNaN(Number(params.transfer_money)) ? 0 : Number(params.transfer_money);

  return client
    .mutate({
      mutation: gql`
        mutation addTransfer($transfer: TransferInput) {
          addTransfer(transfer: $transfer) {
            code
            msg
          }
        }
      `,
      variables: { transfer: params },
    })
    .then(data => {
      gotoLogin(data);
      return data.data.addTransfer;
    })
    .catch(error => {
      showErrorMessage(error);
    });
}

export async function updateTransfer(params) {
  return client
    .mutate({
      mutation: gql`
        mutation updateTransfer($transfer_id: [Int], $transfer: TransferInput) {
          updateTransfer(transfer_id: $transfer_id, transfer: $transfer) {
            code
            msg
          }
        }
      `,
      variables: params,
    })
    .then(data => {
      gotoLogin(data);
      return data.data.updateTransfer;
    })
    .catch(error => {
      showErrorMessage(error);
    });
}

export async function updateTransferType(params) {
  return client
    .mutate({
      mutation: gql`
        mutation updateTransferType($transfer_id: [Int], $transfer: TransferInput) {
          updateTransferType(transfer_id: $transfer_id, transfer: $transfer) {
            code
            msg
          }
        }
      `,
      variables: params,
    })
    .then(data => {
      gotoLogin(data);
      return data.data.updateTransferType;
    })
    .catch(error => {
      showErrorMessage(error);
    });
}

export async function delTransfer(params) {
  return client
    .mutate({
      mutation: gql`
        mutation delTransfer($transfer_id: [Int]) {
          delTransfer(transfer_id: $transfer_id) {
            code
            msg
          }
        }
      `,
      variables: params,
    })
    .then(data => {
      gotoLogin(data);
      return data.data.delTransfer;
    })
    .catch(error => {
      showErrorMessage(error);
    });
}

// todayaccount
export async function getTodayAccountList(params) {
  params.account = params.filter;
  delete params.filter;
  return await ajaxFetch(`${APIHOST}/api/GetTodayAccounts`, {
    ...params,
  });
}

// todayaccount
export async function getTodayAccountStatistic(params) {
  params.account = params.filter;
  delete params.filter;
  return await ajaxFetch(`${APIHOST}/api/GetTodayAccountStatistic`, {
    ...params,
  });
}

export async function cancelConfirmTrans(params) {
  return client
    .mutate({
      mutation: gql`
        mutation cancelConfirmTrans($order_id: [Int], $company_id: Int, $site_id: Int) {
          cancelConfirmTrans(order_id: $order_id, company_id: $company_id, site_id: $site_id) {
            code
            msg
          }
        }
      `,
      variables: params,
    })
    .then(data => {
      gotoLogin(data);
      return data.data.cancelConfirmTrans;
    })
    .catch(error => {
      showErrorMessage(error);
    });
}

export async function confirmTrans(params) {
  return client
    .mutate({
      mutation: gql`
        mutation confirmTrans($order_id: [Int], $company_id: Int, $site_id: Int) {
          confirmTrans(order_id: $order_id, company_id: $company_id, site_id: $site_id) {
            code
            msg
          }
        }
      `,
      variables: params,
    })
    .then(data => {
      gotoLogin(data);
      return data.data.confirmTrans;
    })
    .catch(error => {
      showErrorMessage(error);
    });
}
