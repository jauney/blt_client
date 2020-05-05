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

const APIHOST = `http://${location.hostname}:8002`
const APIURL = `http://${location.hostname}:8002/graphql`
console.log(APIURL)
// 线上
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
  }
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
}
const cache = new InMemoryCache();
const client = new ApolloClient({
  link: httpLink,
  cache,
  defaultOptions: defaultOptions
});

async function ajaxFetch (api, data = {}) {
  const result = await axios({
    method: 'post',
    url: api,
    data,
    headers: {
      authorization: localStorage.getItem('token') || ''
    }
  }).catch(e => {
    console.log(e)
    showErrorMessage(e)
    return {
      status: 200,
      data: { code: 9999, msg: '系统繁忙，请稍后再试' }
    }
  });

  if (result.status === 200) {
    return result.data
  }
  showErrorMessage(result)
}
/**
 * 登录校验跳转。后端接口没登录，则跳转到登录
 * @param {*} data
 */
function gotoLogin (data) {
  if (data.errors && data.errors.length > 0 && data.errors[0].message == 'login') {
    router.push('/User/Login');
    return false;
  }
  return true;
}

function showErrorMessage (error = {}) {
  console.log(error)
  let msg = JSON.stringify(error)
  Modal.error({
    content: `系统繁忙，请稍后再试-${msg}`,
    okText: '我知道了'
  });
  //message.error(`系统繁忙，请稍后再试-${msg}`);
}

export async function fakeAccountLogin (params) {
  return client
    .query({
      query: gql`
        query login($userName: String, $password: String, $mac_id: String) {
          login(user_name: $userName, user_pass: $password, mac_id: $mac_id) {
            token
            user {
              user_id
              user_name
            }
            site {
              site_id
              site_name
              site_type
            }
            company {
              company_id
              company_name
              company_address
              company_type
              company_mobile
              trans_regional_ratio
              remember_sender
              late_fee_days
              late_fee_beginamount
              late_fee_rate
              rewards_24h
              rewards_48h
              rewards_72h
              alarm_days
              agency_fee
              bonus_type
              sendfee_ratio
              unsendfee_ratio
              insurance_ratio
              transfee_ratio
            }
            roles {
              role_id
              role_name
              role_value
              role_desc
            }
          }
        }
      `,
      variables: params,
    })
    .then(data => {
      if (data.errors && data.errors.length > 0 && data.errors[0].extensions && data.errors[0].extensions.exception) {
        return data.errors[0].extensions.exception.data
      }
      return data.data.login;
    })
    .catch(error => {
      showErrorMessage(error)
    });
}

// company
export async function queryCompanyList (params) {
  return client
    .query({
      query: gql`
        query getCompanys($pageNo: Int, $pageSize: Int, $filter: CompanyInput) {
          getCompanys(pageNo: $pageNo, pageSize: $pageSize, filter: $filter) {
            total
            companys {
              company_id
              company_name
              company_address
              company_type
              company_mobile
              trans_regional_ratio
              remember_sender
              late_fee_days
              late_fee_beginamount
              late_fee_rate
              rewards_24h
              rewards_48h
              rewards_72h
              alarm_days
              agency_fee
              bonus_type
              sendfee_ratio
              unsendfee_ratio
              insurance_ratio
              transfee_ratio
            }
          }
        }
      `,
      variables: params,
    })
    .then(data => {
      gotoLogin(data);
      return data.data.getCompanys;
    })
    .catch(error => {
      showErrorMessage(error)
    });
}

export async function addCompany (params) {
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
      showErrorMessage(error)
    });
}

export async function createCourier ({ courier, type }) {
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
      showErrorMessage(error)
    });
}

export async function updateCourier ({ courier, ids, type }) {
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
      showErrorMessage(error)
    });
}

export async function updateCustomerCourier ({ courier, order_id, customer_id, type }) {
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
      showErrorMessage(error)
    });
}

export async function getCourierList (params) {
  return client
    .query({
      query: gql`
        query getCourierList($pageNo: Int, $pageSize: Int, $type: String, $filter: CourierInput) {
          getCourierList(pageNo: $pageNo, pageSize: $pageSize, type: $type, filter: $filter) {
            total
            couriers {
              courier_id
              courier_name
              courier_mobile
              site_id
              company_id
              company_name
              site_name
            }
          }
        }
      `,
      variables: params,
    })
    .then(data => {
      gotoLogin(data);
      return data.data.getCourierList;
    })
    .catch(error => {
      showErrorMessage(error)
    });
}

export async function getOperatorList (params) {
  return client
    .query({
      query: gql`
        query getUserList($pageNo: Int, $pageSize: Int, $filter: UserInput) {
          getUserList(pageNo: $pageNo, pageSize: $pageSize, filter: $filter) {
            total
            users {
              user_id
              user_name
              user_mobile
              user_pass
              user_type
              site_id
              company_id
            }
          }
        }
      `,
      variables: params,
    })
    .then(data => {
      gotoLogin(data);
      return data.data.getUserList;
    })
    .catch(error => {
      showErrorMessage(error)
    });
}

export async function getRoleList (params) {
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
      showErrorMessage(error)
    });
}

export async function getUserInfos (params) {
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
      showErrorMessage(error)
    });
}

export async function addUser (params) {
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
      showErrorMessage(error)
    });
}

export async function createCustomer ({ customer, type }) {
  return client
    .mutate({
      mutation: gql`
        mutation createCustomer($customer: CustomerInput, $type: Int) {
          createCustomer(customer: $customer, type: $type) {
            code
            msg
          }
        }
      `,
      variables: { customer, type },
    })
    .then(data => {
      gotoLogin(data);
      return data.data.createCustomer;
    })
    .catch(error => {
      showErrorMessage(error)
    });
}

export async function updateCustomer ({ customer, customer_id, type }) {
  if (!customer_id) {
    customer_id = [customer.customer_id];
  }
  return client
    .mutate({
      mutation: gql`
        mutation updateCustomer($customer_id: [Int], $customer: CustomerInput, $type: Int) {
          updateCustomer(customer_id: $customer_id, customer: $customer, type: $type) {
            code
            msg
          }
        }
      `,
      variables: { customer_id, customer, type },
    })
    .then(data => {

      gotoLogin(data);
      return data.data.updateCustomer;
    })
    .catch(error => {
      showErrorMessage(error)
    });
}

export async function queryCustomerList (params) {
  return client
    .query({
      query: gql`
        query getCustomers($pageNo: Int, $pageSize: Int, $type: Int, $filter: CustomerInput) {
          getCustomers(pageNo: $pageNo, pageSize: $pageSize, type: $type, filter: $filter) {
            total
            customers {
              customer_id
              customer_name
              customer_mobile
              bank_account
              company_id
              customer_mobile
              trans_vip_ratio
              customer_type
              customertype_name
              customerMobiles {
                mobile
                mobile_id
                mobile_type
                customer_id
              }
            }
          }
        }
      `,
      variables: params,
    })
    .then(data => {
      gotoLogin(data);
      return data.data.getCustomers;
    })
    .catch(error => {
      showErrorMessage(error)
    });
}

// site
export async function querySiteList (params) {
  return client
    .query({
      query: gql`
        query getSites($pageNo: Int, $pageSize: Int, $filter: SiteInput) {
          getSites(pageNo: $pageNo, pageSize: $pageSize, filter: $filter) {
            total
            sites {
              site_id
              site_name
              site_mobile
              site_type
              company_id
              site_orderprefix
              trans_ratio
            }
          }
        }
      `,
      variables: params,
    })
    .then(data => {
      gotoLogin(data);
      return data.data.getSites;
    })
    .catch(error => {
      showErrorMessage(error)
    });
}

// site
export async function addSite (params) {
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
      showErrorMessage(error)
    });
}

// order
export async function getOrderCode (params) {
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
      showErrorMessage(error)
    });
}

export async function createOrderAxios (params) {
  return await ajaxFetch(`${APIHOST}/openapi/createorder`, {
    order: params
  })
}

export async function createOrder (params) {
  params.getcustomer_id = Number(params.getcustomer_id);
  params.sendcustomer_id = Number(params.sendcustomer_id);
  params.trans_originalamount = Number(params.trans_originalamount || 0);
  params.trans_amount = Number(params.trans_amount || 0);
  params.trans_real = Number(params.trans_real || 0);
  params.trans_type = Number(params.trans_type || 0);
  params.trans_discount = Number(params.trans_discount || 0);
  params.deliver_amount = Number(params.deliver_amount || 0);
  params.insurance_amount = Number(params.insurance_amount || 0);
  params.insurance_fee = Number(params.insurance_fee || 0);
  params.order_advancepay_amount = Number(params.order_advancepay_amount || 0);
  params.order_amount = Number(params.order_amount || 0);
  params.order_num = Number(params.order_num || 1);
  params.order_real = Number(params.order_real || 0);
  params.transfer_amount = Number(params.transfer_amount || 0);
  params.transfer_type = Number(params.transfer_type || 0);
  params.is_delete = 0;

  return client
    .mutate({
      mutation: gql`
        mutation createOrder($order: OrderInput) {
          createOrder(order: $order) {
            code
            msg
            data {
              order_id
              company_id
              company_name
              order_code
              car_code
              getcustomer_name
              getcustomer_id
              getcustomer_mobile
              sendcustomer_id
              sendcustomer_name
              sendcustomer_mobile
              order_amount
              order_real
              bank_account
              getcustomer_address
              sendcustomer_address
              pay_status
              trans_originalamount
              trans_amount
              trans_real
              trans_discount
              trans_type
              deliver_amount
              insurance_amount
              insurance_fee
              order_name
              create_date
              depart_date
              pay_date
              settle_date
              site_id
              site_name
              shipsite_name
              shipsite_id
              operator_name
              operator_id
              sender_name
              sender_id
              receiver_name
              receiver_id
              settle_user_name
              pay_user_name
              settle_user_id
              pay_user_id
              late_fee
              getcustomer_type
              sendcustomer_type
              order_advancepay_amount
              order_num
              order_label_num
              transfer_amount
              transfer_type
              transfer_order_code
              transfer_address
              transfer_company_name
              transfer_company_mobile
              order_status
              remark
              bonus_amount
              abnormal_type
              abnormal_amount
              abnormal_resolve_type
              abnormal_remark
              abnormal_type_id
              abnormal_status
              sign_status
              trans_status
              create_user_id
              create_user_name
              trans_show_amount
              pay_abnormal
            }
          }
        }
      `,
      variables: { order: params },
    })
    .then(data => {
      gotoLogin(data);
      return data.data.createOrder;
    })
    .catch(error => {
      showErrorMessage(error)
    });
}

export async function updateOrder ({ order, order_id }) {
  if (order.trans_real) {
    order.trans_real = Number(order.trans_real || 0);
  }
  if (order.order_real) {
    order.order_real = Number(order.order_real || 0);
  }
  if (order.trans_discount) {
    order.trans_discount = Number(order.trans_discount || 0);
  }

  return client
    .mutate({
      mutation: gql`
        mutation updateOrder($order_id: Int, $order: OrderInput) {
          updateOrder(order_id: $order_id, order: $order) {
            code
            msg
          }
        }
      `,
      variables: { order_id, order },
    })
    .then(data => {
      gotoLogin(data);
      return data.data.updateOrder;
    })
    .catch(error => {
      showErrorMessage(error)
    });
}

export async function settleOrder (params) {
  return client
    .mutate({
      mutation: gql`
        mutation settleOrder($order_id: [Int]) {
          settleOrder(order_id: $order_id) {
            code
            msg
          }
        }
      `,
      variables: params,
    })
    .then(data => {
      gotoLogin(data);
      return data.data.settleOrder;
    })
    .catch(error => {
      showErrorMessage(error)
    });
}

export async function cancelSettleOrder (params) {
  return client
    .mutate({
      mutation: gql`
        mutation cancelSettleOrder($order_id: [Int]) {
          cancelSettleOrder(order_id: $order_id) {
            code
            msg
          }
        }
      `,
      variables: params,
    })
    .then(data => {
      gotoLogin(data);
      return data.data.cancelSettleOrder;
    })
    .catch(error => {
      showErrorMessage(error)
    });
}

export async function downAccount (params) {
  return client
    .mutate({
      mutation: gql`
        mutation downAccountOrder($order_id: [Int], $rate: Float, $bank_account: String) {
          downAccountOrder(order_id: $order_id, rate: $rate, bank_account: $bank_account) {
            code
            msg
          }
        }
      `,
      variables: params,
    })
    .then(data => {
      gotoLogin(data);
      return data.data.downAccountOrder;
    })
    .catch(error => {
      showErrorMessage(error)
    });
}

export async function cancelTodayDownAccountOrder (params) {
  return client
    .mutate({
      mutation: gql`
        mutation cancelTodayDownAccountOrder($pay_id: [Int]) {
          cancelTodayDownAccountOrder(pay_id: $pay_id) {
            code
            msg
          }
        }
      `,
      variables: params,
    })
    .then(data => {
      gotoLogin(data);
      return data.data.cancelTodayDownAccountOrder;
    })
    .catch(error => {
      showErrorMessage(error)
    });
}

export async function cancelDownAccountOrder (params) {
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
      showErrorMessage(error)
    });
}

// 签字、取消签字
export async function updateTransSign (params) {
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
      showErrorMessage(error)
    });
}

// 签字、取消签字
export async function updateOrderSign (params) {
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
      showErrorMessage(error)
    });
}

export async function getCustomerList (params) {
  return client
    .query({
      query: gql`
        query getCustomerList(
          $pageNo: Int
          $pageSize: Int
          $filter: CustomerInput
          $type: Int
          $sorter: String
        ) {
          getCustomerList(
            pageNo: $pageNo
            pageSize: $pageSize
            filter: $filter
            type: $type
            sorter: $sorter
          ) {
            total
            customers {
              customer_id
              customer_name
              customer_address
              customer_type
              customertype_name
              customer_mobile
              bank_account
              company_id
              sender_id
              receiver_id
              password
              username
              site_ids
              site_names
              total_trans
              total_order
              customerMobiles {
                mobile_id
                mobile
                mobile_type
                customer_id
              }
            }
          }
        }
      `,
      variables: params,
    })
    .then(data => {
      gotoLogin(data);
      return data.data.getCustomerList;
    })
    .catch(error => {
      showErrorMessage(error)
    });
}

export async function getCustomer (params) {
  return client
    .query({
      query: gql`
        query getCustomer(
          $type: Int
          $getcustomer_id: Int
          $sendcustomer_id: Int
          $customer_mobile: String
          $company_id: Int
        ) {
          getCustomer(
            type: $type
            getcustomer_id: $getcustomer_id
            sendcustomer_id: $sendcustomer_id
            customer_mobile: $customer_mobile
            company_id: $company_id
          ) {
            getCustomer {
              customer_id
              customer_name
              customer_address
              customer_type
              customertype_name
              customer_mobile
              bank_account
              company_id
              sender_id
              sender_name
              receiver_id
              password
              username
              site_ids
              site_names
              total_trans
              total_order
              trans_vip_ratio
              customertype_name
              customerMobiles {
                mobile_id
                mobile
                mobile_type
                customer_id
              }
            }
            sendCustomer {
              customer_id
              customer_name
              customer_address
              customer_type
              customertype_name
              customer_mobile
              bank_account
              company_id
              sender_id
              receiver_id
              password
              username
              site_ids
              site_names
              total_trans
              total_order
              trans_vip_ratio
              customertype_name
              customerMobiles {
                mobile_id
                mobile
                mobile_type
                customer_id
              }
            }
          }
        }
      `,
      variables: params,
    })
    .then(data => {
      gotoLogin(data);
      return data.data.getCustomer;
    })
    .catch(error => {
      showErrorMessage(error)
    });
}

export async function getCustomerTypes (params) {
  return client
    .query({
      query: gql`
        query getCustomerTypes(
          $pageNo: Int
          $pageSize: Int
          $filter: CustomerTypeInput
          $sorter: String
        ) {
          getCustomerTypes(pageNo: $pageNo, pageSize: $pageSize, filter: $filter, sorter: $sorter) {
            customerTypesTotal
            customerTypes {
              customertype_id
              customertype
              customertype_name
              trans_vip_ratio
            }
          }
        }
      `,
      variables: params,
    })
    .then(data => {
      gotoLogin(data);
      return data.data.getCustomerTypes;
    })
    .catch(error => {
      showErrorMessage(error)
    });
}


export async function getOrderListAxios (params) {
  if (params.filter && params.filter.order_status && !Array.isArray(params.filter.order_status)) {
    params.filter.order_status = [params.filter.order_status];
  }
  if (params.filter && params.filter.abnormal_status) {
    params.filter.abnormal_status = Number(params.filter.abnormal_status);
  }

  if (!params.filter.getcustomer_id) {
    delete params.filter.getcustomer_id;
  }
  if (!params.filter.sendcustomer_id) {
    delete params.filter.sendcustomer_id;
  }
  if (!params.filter.getcustomer_mobile) {
    delete params.filter.getcustomer_mobile;
  }
  if (!params.filter.sendcustomer_mobile) {
    delete params.filter.sendcustomer_mobile;
  }
  if (!params.filter.settle_date) {
    delete params.filter.settle_date
  }

  return await ajaxFetch(`${APIHOST}/openapi/getorders`, {
    ...params
  })
}
export async function getOrderList (params) {
  if (params.filter && params.filter.order_status && !Array.isArray(params.filter.order_status)) {
    params.filter.order_status = [params.filter.order_status];
  }
  if (params.filter && params.filter.abnormal_status) {
    params.filter.abnormal_status = Number(params.filter.abnormal_status);
  }

  if (!params.filter.getcustomer_id) {
    delete params.filter.getcustomer_id;
  }
  if (!params.filter.sendcustomer_id) {
    delete params.filter.sendcustomer_id;
  }
  if (!params.filter.getcustomer_mobile) {
    delete params.filter.getcustomer_mobile;
  }
  if (!params.filter.sendcustomer_mobile) {
    delete params.filter.sendcustomer_mobile;
  }
  if (!params.filter.settle_date) {
    delete params.filter.settle_date
  }
  return client
    .query({
      query: gql`
        query getOrders($pageNo: Int, $pageSize: Int, $filter: OrderInput, $sorter: String) {
          getOrders(pageNo: $pageNo, pageSize: $pageSize, filter: $filter, sorter: $sorter) {
            total
            orders {
              order_id
              company_id
              company_name
              order_code
              car_code
              getcustomer_name
              getcustomer_id
              getcustomer_mobile
              sendcustomer_id
              sendcustomer_name
              sendcustomer_mobile
              order_amount
              order_real
              bank_account
              getcustomer_address
              sendcustomer_address
              pay_status
              trans_originalamount
              trans_amount
              trans_real
              trans_discount
              trans_type
              trans_sign
              deliver_amount
              insurance_amount
              insurance_fee
              order_name
              create_date
              depart_date
              pay_date
              settle_date
              site_id
              site_name
              shipsite_name
              shipsite_id
              operator_name
              operator_id
              sender_name
              sender_id
              receiver_name
              receiver_id
              settle_user_name
              pay_user_name
              settle_user_id
              pay_user_id
              late_fee
              getcustomer_type
              sendcustomer_type
              order_advancepay_amount
              order_num
              order_label_num
              transfer_amount
              transfer_type
              transfer_order_code
              transfer_address
              transfer_company_name
              transfer_company_mobile
              order_status
              remark
              bonus_amount
              abnormal_type
              abnormal_amount
              abnormal_resolve_type
              abnormal_remark
              abnormal_type_id
              abnormal_status
              abnormal_reason
              sign_status
              trans_status
              create_user_id
              create_user_name
              trans_show_amount
              pay_abnormal
              arrive_date
            }
          }
        }
      `,
      variables: params,
    })
    .then(data => {
      gotoLogin(data);
      return data.data.getOrders;
    })
    .catch(error => {
      showErrorMessage(error)
    });
}

export async function getTodayPayList (params) {
  return client
    .query({
      query: gql`
        query getTodayPays($pageNo: Int, $pageSize: Int, $filter: TodayPayInput, $sorter: String) {
          getTodayPays(pageNo: $pageNo, pageSize: $pageSize, filter: $filter, sorter: $sorter) {
            total
            todaypays {
              pay_id
              operator_id
              operator_name
              company_id
              serial_id
              pay_amount
              pay_type
              site_id
              pay_date
              company_name
              bank_account
              getcustomer_id
              getcustomer_name
              sendcustomer_id
              sendcustomer_name
              order_id
              agency_fee
              order_amount
              trans_amount
              order_code
              insurance_amount
            }
          }
        }
      `,
      variables: params,
    })
    .then(data => {
      gotoLogin(data);
      return data.data.getTodayPays;
    })
    .catch(error => {
      showErrorMessage(error)
    });
}

export async function deleteOrder (params) {
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
      showErrorMessage(error)
    });
}


export async function getOrderStatisticAxios (params) {
  if (params.filter && params.filter.order_status && !Array.isArray(params.filter.order_status)) {
    params.filter.order_status = [params.filter.order_status];
  }
  if (params.filter && params.filter.abnormal_status) {
    params.filter.abnormal_status = Number(params.filter.abnormal_status);
  }

  if (!params.filter.getcustomer_id) {
    delete params.filter.getcustomer_id;
  }
  if (!params.filter.sendcustomer_id) {
    delete params.filter.sendcustomer_id;
  }
  if (!params.filter.getcustomer_mobile) {
    delete params.filter.getcustomer_mobile;
  }
  if (!params.filter.sendcustomer_mobile) {
    delete params.filter.sendcustomer_mobile;
  }
  if (!params.filter.settle_date) {
    delete params.filter.settle_date
  }

  return await ajaxFetch(`${APIHOST}/openapi/getorderstatistic`, {
    ...params
  })
}

export async function getOrderStatistic (params) {
  if (params.filter && params.filter.order_status && !Array.isArray(params.filter.order_status)) {
    params.filter.order_status = [params.filter.order_status];
  }
  if (params.filter && params.filter.abnormal_status) {
    params.filter.abnormal_status = Number(params.filter.abnormal_status);
  }

  if (!params.filter.getcustomer_id) {
    delete params.filter.getcustomer_id;
  }
  if (!params.filter.sendcustomer_id) {
    delete params.filter.sendcustomer_id;
  }
  if (!params.filter.getcustomer_mobile) {
    delete params.filter.getcustomer_mobile;
  }
  if (!params.filter.sendcustomer_mobile) {
    delete params.filter.sendcustomer_mobile;
  }
  if (!params.filter.settle_date) {
    delete params.filter.settle_date
  }

  return client
    .query({
      query: gql`
        query getOrderStatistic($filter: OrderInput) {
          getOrderStatistic(filter: $filter) {
            totalOrderAmount
            totalTransAmount
            totalRealTransAmount
            totalRealOrderAmount
            totalInsurancefee
            totalAdvancepayAmount
            totalDeliverAmount
            totalTifuTransAmount
            totalXianTransAmount
            totalLatefee
            totalBonusfee
            totalAbnormalAmount
            totalCarFeeConfirm
            totalCarFee
            totalXianInsurence
            totalTifuInsurance
          }
        }
      `,
      variables: params,
    })
    .then(data => {

      gotoLogin(data);
      return data.data.getOrderStatistic;
    })
    .catch(error => {
      showErrorMessage(error)
    });
}

export async function getTodayPayStatistic (params) {
  return client
    .query({
      query: gql`
        query getTodayPayStatistic($filter: TodayPayInput) {
          getTodayPayStatistic(filter: $filter) {
            totalOrderAmount
            totalPayAmount
            totalTransAmount
            totalAgencyFee
            totalRecord
          }
        }
      `,
      variables: params,
    })
    .then(data => {

      gotoLogin(data);
      return data.data.getTodayPayStatistic;
    })
    .catch(error => {
      showErrorMessage(error)
    });
}

export async function shipOrderAxios (params) {
  return await ajaxFetch(`${APIHOST}/openapi/shiporder`, {
    ...params
  })
}

export async function shipOrder (params) {
  return client
    .mutate({
      mutation: gql`
        mutation shipOrder(
          $order_id: [Int]
          $shipsite_id: Int
          $shipsite_name: String
          $receiver_id: Int
          $receiver_name: String
        ) {
          shipOrder(
            order_id: $order_id
            shipsite_id: $shipsite_id
            receiver_id: $receiver_id
            shipsite_name: $shipsite_name
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
      return data.data.shipOrder;
    })
    .catch(error => {
      showErrorMessage(error)
    });
}

export async function cancelShipOrder (params) {
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
      showErrorMessage(error)
    });
}

export async function entrunkOrder (params) {
  return client
    .mutate({
      mutation: gql`
        mutation entrunkOrder($order_id: [Int], $car: CarInput) {
          entrunkOrder(order_id: $order_id, car: $car) {
            code
            msg
          }
        }
      `,
      variables: params,
    })
    .then(data => {

      gotoLogin(data);
      return data.data.entrunkOrder;
    })
    .catch(error => {
      showErrorMessage(error)
    });
}

export async function departOrder (params) {
  return client
    .mutate({
      mutation: gql`
        mutation departOrder($car_id: Int, $car: CarInput) {
          departOrder(car_id: $car_id, car: $car) {
            code
            msg
          }
        }
      `,
      variables: params,
    })
    .then(data => {
      gotoLogin(data);
      return data.data.departOrder;
    })
    .catch(error => {
      showErrorMessage(error)
    });
}

export async function cancelEntrunk (params = {}) {
  if (params.car && params.car['__typename']) {
    delete params.car['__typename'];
  }
  return client
    .mutate({
      mutation: gql`
        mutation cancelEntrunk($order_id: [Int], $car: CarInput) {
          cancelEntrunk(order_id: $order_id, car: $car) {
            code
            msg
          }
        }
      `,
      variables: params,
    })
    .then(data => {

      gotoLogin(data);
      return data.data.cancelEntrunk;
    })
    .catch(error => {
      showErrorMessage(error)
    });
}

export async function changeOrderReceiver (params) {
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
      showErrorMessage(error)
    });
}

export async function updateCarFee ({ car = {} }) {
  delete car['__typename'];
  return client
    .mutate({
      mutation: gql`
        mutation updateCarFee($car: CarInput) {
          updateCarFee(car: $car) {
            code
            msg
          }
        }
      `,
      variables: { car },
    })
    .then(data => {
      gotoLogin(data);
      return data.data.updateCarFee;
    })
    .catch(error => {
      showErrorMessage(error)
    });
}

export async function updateCarStatus (params) {
  return client
    .mutate({
      mutation: gql`
        mutation updateCarStatus(
          $car_id: Int
          $car_status: Int
          $car_code: String
          $company_id: Int
          $shipsite_id: Int
        ) {
          updateCarStatus(
            car_id: $car_id
            car_status: $car_status
            car_code: $car_code
            company_id: $company_id
            shipsite_id: $shipsite_id
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
      return data.data.updateCarStatus;
    })
    .catch(error => {
      showErrorMessage(error)
    });
}
// 接货人
export async function queryReceiverList (params) {
  return client
    .query({
      query: gql`
        query getCourierList($pageNo: Int, $pageSize: Int, $filter: CourierInput, $type: String) {
          getCourierList(pageNo: $pageNo, pageSize: $pageSize, filter: $filter, type: $type) {
            total
            couriers {
              courier_id
              courier_name
            }
          }
        }
      `,
      variables: params,
    })
    .then(data => {

      gotoLogin(data);
      return data.data.getCourierList;
    })
    .catch(error => {
      showErrorMessage(error)
    });
}

// car
export async function queryCarList (params) {
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
      showErrorMessage(error)
    });
}

export async function getCarCode (params) {
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
      showErrorMessage(error)
    });
}

export async function getLastCarCode (params) {
  return client
    .query({
      query: gql`
        query getLastCarCode($company_id: Int, $shipsite_id: Int, $car_code: String) {
          getLastCarCode(company_id: $company_id, shipsite_id: $shipsite_id, car_code: $car_code) {
            car_id
            car_fee
            car_code
            car_date
            driver_id
            driver_name
            driver_mobile
            driver_plate
            confirm
            company_id
            shipsite_id
            shipsite_name
            car_status
          }
        }
      `,
      variables: params,
    })
    .then(data => {
      gotoLogin(data);
      return data.data.getLastCarCode;
    })
    .catch(error => {
      showErrorMessage(error)
    });
}

export async function getCarInfo (params) {
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
      showErrorMessage(error)
    });
}

// driver
export async function queryDriverList (params) {
  return client
    .query({
      query: gql`
        query getDrivers($pageNo: Int, $pageSize: Int, $company_id: Int) {
          getDrivers(pageNo: $pageNo, pageSize: $pageSize, company_id: $company_id) {
            total
            drivers {
              driver_id
              driver_name
              driver_mobile
              driver_plate
            }
          }
        }
      `,
      variables: params,
    })
    .then(data => {

      gotoLogin(data);
      return data.data.getDrivers;
    })
    .catch(error => {
      showErrorMessage(error)
    });
}

export async function updateAbnormal (params) {
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
      showErrorMessage(error)
    });
}

export async function updatePayStatus (params) {
  return client
    .mutate({
      mutation: gql`
        mutation updatePayStatus(
          $order_id: [Int]
          $order: OrderInput
        ) {
          updatePayStatus(
            order_id: $order_id
            order: $order
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
      return data.data.updatePayStatus;
    })
    .catch(error => {
      showErrorMessage(error)
    });
}

export async function cancelAbnormal (params) {
  return client
    .mutate({
      mutation: gql`
        mutation cancelAbnormal(
          $order_id: [Int]
          $abnormal_status: Int
        ) {
          cancelAbnormal(
            order_id: $order_id
            abnormal_status: $abnormal_status
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
      return data.data.cancelAbnormal;
    })
    .catch(error => {
      showErrorMessage(error)
    });
}

export async function getAbnormalTypes (params) {
  return client
    .query({
      query: gql`
        query getAbnormalTypes($pageNo: Int, $pageSize: Int, $company_id: Int) {
          getAbnormalTypes(pageNo: $pageNo, pageSize: $pageSize, company_id: $company_id) {
            total
            abnormal_types {
              abnormal_type_id
              abnormal_type
              company_id
            }
          }
        }
      `,
      variables: params,
    })
    .then(data => {

      gotoLogin(data);
      return data.data.getAbnormalTypes;
    })
    .catch(error => {
      showErrorMessage(error)
    });
}

// incomes
export async function getIncomes (params) {
  return client
    .query({
      query: gql`
        query getIncomes($pageNo: Int, $pageSize: Int, $filter: IncomeInput, $sorter: String) {
          getIncomes(pageNo: $pageNo, pageSize: $pageSize, filter: $filter, sorter: $sorter) {
            total
            incomes {
              income_id
              company_id
              company_name
              incometype_id
              incometype
              site_id
              site_name
              incomedetail_id
              incomedetail
              income_date
              income_money
              income_reason
              remark
              operator_name
            }
            totalIncome
          }
        }
      `,
      variables: params,
    })
    .then(data => {

      gotoLogin(data);
      return data.data.getIncomes;
    })
    .catch(error => {
      showErrorMessage(error)
    });
}

// income types
export async function getIncomeTypes (params) {
  return client
    .query({
      query: gql`
        query getIncomeTypes($pageNo: Int, $pageSize: Int, $company_id: Int, $site_id: Int) {
          getIncomeTypes(
            pageNo: $pageNo
            pageSize: $pageSize
            company_id: $company_id
            site_id: $site_id
          ) {
            total
            incomeTypes {
              incometype_id
              company_id
              incometype
              site_id
              site_name
            }
          }
        }
      `,
      variables: params,
    })
    .then(data => {

      gotoLogin(data);
      return data.data.getIncomeTypes;
    })
    .catch(error => {
      showErrorMessage(error)
    });
}

export async function getDebtTypes (params) {
  return client
    .query({
      query: gql`
        query getDebtTypes($pageNo: Int, $pageSize: Int, $company_id: Int, $site_id: Int) {
          getDebtTypes(
            pageNo: $pageNo
            pageSize: $pageSize
            company_id: $company_id
            site_id: $site_id
          ) {
            total
            debtTypes {
              debttype_id
              company_id
              debttype
              debttype_type
              site_id
              site_name
            }
          }
        }
      `,
      variables: params,
    })
    .then(data => {

      gotoLogin(data);
      return data.data.getDebtTypes;
    })
    .catch(error => {
      showErrorMessage(error)
    });
}

export async function addIncome (params) {
  console.log('api.... ', params);
  params.company_id = isNaN(Number(params.company_id)) ? 0 : Number(params.company_id);
  params.incometype_id = isNaN(Number(params.incometype_id)) ? 0 : Number(params.incometype_id);
  params.site_id = isNaN(Number(params.site_id)) ? 0 : Number(params.site_id);

  return client
    .mutate({
      mutation: gql`
        mutation addIncome($income: IncomeInput) {
          addIncome(income: $income) {
            code
            msg
          }
        }
      `,
      variables: { income: params },
    })
    .then(data => {
      gotoLogin(data);
      return data.data.addIncome;
    })
    .catch(error => {
      showErrorMessage(error)
    });
}

// expenses
export async function getExpenses (params) {
  return client
    .query({
      query: gql`
        query getExpenses($pageNo: Int, $pageSize: Int, $filter: ExpenseInput, $sorter: String) {
          getExpenses(pageNo: $pageNo, pageSize: $pageSize, filter: $filter, sorter: $sorter) {
            total
            expenses {
              expense_id
              company_id
              company_name
              expensetype_id
              expensetype
              site_id
              site_name
              expensedetail_id
              expensedetail
              expense_date
              expense_money
              expense_reason
              remark
            }
            totalExpense
          }
        }
      `,
      variables: params,
    })
    .then(data => {

      gotoLogin(data);
      return data.data.getExpenses;
    })
    .catch(error => {
      showErrorMessage(error)
    });
}

// expense types
export async function getExpenseTypes (params) {
  return client
    .query({
      query: gql`
        query getExpenseTypes($pageNo: Int, $pageSize: Int, $company_id: Int, $site_id: Int) {
          getExpenseTypes(
            pageNo: $pageNo
            pageSize: $pageSize
            company_id: $company_id
            site_id: $site_id
          ) {
            total
            expenseTypes {
              expensetype_id
              company_id
              expensetype
              site_id
              site_name
            }
          }
        }
      `,
      variables: params,
    })
    .then(data => {

      gotoLogin(data);
      return data.data.getExpenseTypes;
    })
    .catch(error => {
      showErrorMessage(error)
    });
}

export async function addExpense (params) {
  params.company_id = isNaN(Number(params.company_id)) ? 0 : Number(params.company_id);
  params.expensetype_id = isNaN(Number(params.expensetype_id)) ? 0 : Number(params.expensetype_id);
  params.site_id = isNaN(Number(params.site_id)) ? 0 : Number(params.site_id);

  return client
    .mutate({
      mutation: gql`
        mutation addExpense($expense: ExpenseInput) {
          addExpense(expense: $expense) {
            code
            msg
          }
        }
      `,
      variables: { expense: params },
    })
    .then(data => {
      gotoLogin(data);
      return data.data.addExpense;
    })
    .catch(error => {
      showErrorMessage(error)
    });
}

// debts
export async function getDebtUsers (params) {
  return client
    .query({
      query: gql`
        query getDebtUsers($pageNo: Int, $pageSize: Int, $filter: DebtUserInput) {
          getDebtUsers(pageNo: $pageNo, pageSize: $pageSize, filter: $filter) {
            total
            debtUsers {
              debtuser_id
              debtuser_name
              company_id
              company_name
              site_id
              site_name
            }
          }
        }
      `,
      variables: params,
    })
    .then(data => {
      gotoLogin(data);
      return data.data.getDebtUsers;
    })
    .catch(error => {
      showErrorMessage(error)
    });
}

// debts
export async function getDebts (params) {
  return client
    .query({
      query: gql`
        query getDebts($pageNo: Int, $pageSize: Int, $filter: DebtInput, $sorter: String) {
          getDebts(pageNo: $pageNo, pageSize: $pageSize, filter: $filter, sorter: $sorter) {
            total
            debts {
              debt_id
              company_id
              debttype
              debttype_type
              debttype_id
              site_id
              debt_money
              debt_date
              debtuser_id
              debtuser_name
              remark
              settle_date
              debt_status
            }
          }
        }
      `,
      variables: params,
    })
    .then(data => {

      gotoLogin(data);
      return data.data.getDebts;
    })
    .catch(error => {
      showErrorMessage(error)
    });
}

export async function getDebtsStatistic (params) {
  return client
    .query({
      query: gql`
        query getDebtsStatistic($filter: DebtInput) {
          getDebtsStatistic(filter: $filter) {
            totalDebtMoney
            totalIncome
            totalExpense
          }
        }
      `,
      variables: params,
    })
    .then(data => {
      gotoLogin(data);
      return data.data.getDebtsStatistic;
    })
    .catch(error => {
      showErrorMessage(error)
    });
}

export async function settleDebt (params) {
  return client
    .mutate({
      mutation: gql`
        mutation settleDebt($debt_id: [Int]) {
          settleDebt(debt_id: $debt_id) {
            code
            msg
          }
        }
      `,
      variables: params,
    })
    .then(data => {

      gotoLogin(data);
      return data.data.settleDebt;
    })
    .catch(error => {
      showErrorMessage(error)
    });
}

export async function addDebt (params) {
  params.company_id = isNaN(Number(params.company_id)) ? 0 : Number(params.company_id);
  params.site_id = isNaN(Number(params.site_id)) ? 0 : Number(params.site_id);
  params.debt_money = isNaN(Number(params.debt_money)) ? 0 : Number(params.debt_money);

  return client
    .mutate({
      mutation: gql`
        mutation addDebt($debt: DebtInput) {
          addDebt(debt: $debt) {
            code
            msg
          }
        }
      `,
      variables: { debt: params },
    })
    .then(data => {
      gotoLogin(data);
      return data.data.addDebt;
    })
    .catch(error => {
      showErrorMessage(error)
    });
}

// getTransfers
export async function getTransfers (params) {
  if (params.filter && params.filter.transfer_status) {
    params.filter.transfer_status = Number(params.filter.transfer_status);
  }
  return client
    .query({
      query: gql`
        query getTransfers($pageNo: Int, $pageSize: Int, $filter: TransferInput) {
          getTransfers(pageNo: $pageNo, pageSize: $pageSize, filter: $filter) {
            total
            transfers {
              transfer_id
              company_id
              company_name
              transfer_money
              transfer_date
              transfer_status
              transfer_type
              transfer_user
              confirm_operator_name
              confirm_date
              site_id
              site_name
              remark
            }
          }
        }
      `,
      variables: params,
    })
    .then(data => {
      gotoLogin(data);
      return data.data.getTransfers;
    })
    .catch(error => {
      showErrorMessage(error)
    });
}

// getTransferStatistic
export async function getTransferStatistic (params) {
  if (params.filter && params.filter.transfer_status) {
    delete params.filter.transfer_status
  }
  return client
    .query({
      query: gql`
        query getTransferStatistic($filter: TransferInput) {
          getTransferStatistic(filter: $filter) {
            totalTransferAmount
            totalTransferConfirmAmount
            totalTransferUnConfirmAmount
            totalShouldTransfer
          }
        }
      `,
      variables: params,
    })
    .then(data => {
      gotoLogin(data);
      return data.data.getTransferStatistic;
    })
    .catch(error => {
      showErrorMessage(error)
    });
}

export async function addTransfer (params) {
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
      showErrorMessage(error)
    });
}

export async function updateTransfer (params) {
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
      showErrorMessage(error)
    });
}


export async function updateTransferType (params) {
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
      showErrorMessage(error)
    });
}

export async function delTransfer (params) {
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
      showErrorMessage(error)
    });
}

// todayaccount
export async function getTodayAccountList (params) {
  return client
    .query({
      query: gql`
        query getTodayAccountList($pageNo: Int, $pageSize: Int, $filter: AccountInput, $sorter: String) {
          getTodayAccountList(pageNo: $pageNo, pageSize: $pageSize, filter: $filter, sorter: $sorter) {
            total
            accounts {
              account_id
              operator_id
              operator_name
              company_id
              company_name
              account_name
              account_reason
              serial_id
              origin_id
              origin_table
              account_amount
              account_type
              site_id
              site_name
              account_date
              account_customer
            }
          }
        }
      `,
      variables: params,
    })
    .then(data => {
      gotoLogin(data);
      return data.data.getTodayAccountList;
    })
    .catch(error => {
      showErrorMessage(error)
    });
}

// todayaccount
export async function getTodayAccountStatistic (params) {
  return client
    .query({
      query: gql`
        query getTodayAccountStatistic($pageNo: Int, $pageSize: Int, $filter: AccountInput, $sorter: String) {
          getTodayAccountStatistic(pageNo: $pageNo, pageSize: $pageSize, filter: $filter, sorter: $sorter) {
            totalAccount
            totalIncomeAccount
            totalExpenseAccount
          }
        }
      `,
      variables: params,
    })
    .then(data => {
      gotoLogin(data);
      return data.data.getTodayAccountStatistic;
    })
    .catch(error => {
      showErrorMessage(error)
    });
}

export async function cancelConfirmTrans (params) {
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
      showErrorMessage(error)
    });
}

export async function confirmTrans (params) {
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
      showErrorMessage(error)
    });
}
