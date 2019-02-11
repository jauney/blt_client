import { stringify } from 'qs';
import request from '@/utils/request';
// import ApolloClient from 'apollo-boost';

// import { async } from 'q';
// const client = new ApolloClient({
//   uri: 'http://127.0.0.1:3002/graphql',
// });

import { HttpLink } from 'apollo-link-http';
import { ApolloClient } from 'apollo-client';
import { ApolloLink, concat } from 'apollo-link';
import gql from 'graphql-tag';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { async } from 'q';

const httpLink = new HttpLink({ uri: 'http://127.0.0.1:3002/graphql' });

const authMiddleware = new ApolloLink((operation, forward) => {
  // add the authorization to the headers
  operation.setContext({
    headers: {
      authorization: localStorage.getItem('token') || null,
    },
  });

  return forward(operation);
});
// 加上这个配置，可以发送多次相同请求，否则，前端会将相同请求缓存，不发送
const defaultOptions = {
  watchQuery: {
    fetchPolicy: 'network-only',
    errorPolicy: 'ignore',
  },
  query: {
    fetchPolicy: 'network-only',
    errorPolicy: 'all',
  },
};
const client = new ApolloClient({
  link: concat(authMiddleware, httpLink),
  cache: new InMemoryCache(),
  defaultOptions,
});

export async function fakeAccountLogin(params) {
  return client
    .query({
      query: gql`
        query login($userName: String, $password: String) {
          login(user_name: $userName, user_pass: $password) {
            token
            user {
              user_id
              user_name
            }
            site {
              site_id
              site_name
            }
            company {
              company_id
              company_name
              company_type
            }
          }
        }
      `,
      variables: params,
    })
    .then(data => {
      return data.data.login;
    })
    .catch(error => {
      return { code: 9999, msg: '系统繁忙，请稍后再试' };
    });
}

// company
export async function queryCompanyList(params) {
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
              trans_regional_ratio
            }
          }
        }
      `,
      variables: params,
    })
    .then(data => {
      return data.data.getCompanys;
    })
    .catch(error => {
      return { code: 9999, msg: '系统繁忙，请稍后再试' };
    });
}

export async function addCompany(params) {
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
            }
          }
        }
      `,
      variables: params,
    })
    .then(data => {
      return data.data.getCompanys;
    })
    .catch(error => {
      return { code: 9999, msg: '系统繁忙，请稍后再试' };
    });
}

export async function addCustomer(params = {}) {
  return {};
}

export async function queryCustomerList(params) {
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
              customerMobiles {
                mobile
              }
            }
          }
        }
      `,
      variables: params,
    })
    .then(data => {
      return data.data.getCustomers;
    })
    .catch(error => {
      return { code: 9999, msg: '系统繁忙，请稍后再试' };
    });
}

// site
export async function querySiteList(params) {
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
            }
          }
        }
      `,
      variables: params,
    })
    .then(data => {
      return data.data.getSites;
    })
    .catch(error => {
      return { code: 9999, msg: '系统繁忙，请稍后再试' };
    });
}

// site
export async function addSite(params) {
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
            }
          }
        }
      `,
      variables: params,
    })
    .then(data => {
      return data.data.getSites;
    })
    .catch(error => {
      return { code: 9999, msg: '系统繁忙，请稍后再试' };
    });
}

// site
export async function updateSite(params) {
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
            }
          }
        }
      `,
      variables: params,
    })
    .then(data => {
      return data.data.getSites;
    })
    .catch(error => {
      return { code: 9999, msg: '系统繁忙，请稍后再试' };
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
      return data.data.getOrderCode;
    })
    .catch(error => {
      return { code: 9999, msg: '系统繁忙，请稍后再试' };
    });
}

export async function createOrder(params) {
  params.getcustomer_id = Number(params.getcustomer_id);
  params.sendcustomer_id = Number(params.sendcustomer_id);
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
              pay_type
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
      console.log(data);
      return data.data.createOrder;
    })
    .catch(error => {
      return { code: 9999, msg: '系统繁忙，请稍后再试' };
    });
}

export async function getOrderList(params) {
  return client
    .query({
      query: gql`
        query getOrders($pageNo: Int, $pageSize: Int, $filter: OrderInput) {
          getOrders(pageNo: $pageNo, pageSize: $pageSize, filter: $filter) {
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
              pay_type
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
      variables: params,
    })
    .then(data => {
      return data.data.getOrders;
    })
    .catch(error => {
      return { code: 9999, msg: '系统繁忙，请稍后再试' };
    });
}

export async function deleteOrder(params) {
  return client
    .mutate({
      mutation: gql`
        mutation deleteOrder($orderId: [Int], $isDelete: Int) {
          deleteOrder(order_id: $orderId, is_delete: $isDelete) {
            code
            msg
          }
        }
      `,
      variables: params,
    })
    .then(data => {
      console.log(data);
      return data.data.createOrder;
    })
    .catch(error => {
      return { code: 9999, msg: '系统繁忙，请稍后再试' };
    });
}

export async function getSiteOrderStatistic(params) {
  return client
    .query({
      query: gql`
        query getSiteOrderStatistic(
          $company_id: Int
          $site_id: Int
          $operator_id: Int
          $shipsite_id: Int
          $car_code: String
          $receiver_id: Int
        ) {
          getSiteOrderStatistic(
            company_id: $company_id
            site_id: $site_id
            operator_id: $operator_id
            shipsite_id: $shipsite_id
            car_code: $car_code
            receiver_id: $receiver_id
          ) {
            totalOrderAmount
            totalTransAmount
            totalInsurancefee
          }
        }
      `,
      variables: params,
    })
    .then(data => {
      console.log(data);
      return data.data.getSiteOrderStatistic;
    })
    .catch(error => {
      return { code: 9999, msg: '系统繁忙，请稍后再试' };
    });
}
