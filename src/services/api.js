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

const client = new ApolloClient({
  link: concat(authMiddleware, httpLink),
  cache: new InMemoryCache(),
});

export async function queryProjectNotice() {
  return request('/api/project/notice');
}

export async function queryActivities() {
  return request('/api/activities');
}

export async function queryRule(params) {
  return request(`/api/rule?${stringify(params)}`);
}

export async function removeRule(params) {
  return request('/api/rule', {
    method: 'POST',
    body: {
      ...params,
      method: 'delete',
    },
  });
}

export async function addRule(params) {
  return request('/api/rule', {
    method: 'POST',
    body: {
      ...params,
      method: 'post',
    },
  });
}

export async function updateRule(params = {}) {
  return request(`/api/rule?${stringify(params.query)}`, {
    method: 'POST',
    body: {
      ...params.body,
      method: 'update',
    },
  });
}

export async function fakeSubmitForm(params) {
  return request('/api/forms', {
    method: 'POST',
    body: params,
  });
}

export async function fakeChartData() {
  return request('/api/fake_chart_data');
}

export async function queryTags() {
  return request('/api/tags');
}

export async function queryBasicProfile() {
  return request('/api/profile/basic');
}

export async function queryAdvancedProfile() {
  return request('/api/profile/advanced');
}

export async function queryFakeList(params) {
  return request(`/api/fake_list?${stringify(params)}`);
}

export async function removeFakeList(params) {
  const { count = 5, ...restParams } = params;
  return request(`/api/fake_list?count=${count}`, {
    method: 'POST',
    body: {
      ...restParams,
      method: 'delete',
    },
  });
}

export async function addFakeList(params) {
  const { count = 5, ...restParams } = params;
  return request(`/api/fake_list?count=${count}`, {
    method: 'POST',
    body: {
      ...restParams,
      method: 'post',
    },
  });
}

export async function updateFakeList(params) {
  const { count = 5, ...restParams } = params;
  return request(`/api/fake_list?count=${count}`, {
    method: 'POST',
    body: {
      ...restParams,
      method: 'update',
    },
  });
}

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

export async function fakeRegister(params) {
  return request('/api/register', {
    method: 'POST',
    body: params,
  });
}

export async function queryNotices(params = {}) {
  return request(`/api/notices?${stringify(params)}`);
}

export async function getFakeCaptcha(mobile) {
  return request(`/api/captcha?mobile=${mobile}`);
}

export async function addCustomer(params = {}) {
  return {};
}

export async function queryCustomerList(params) {
  return client
    .query({
      query: gql`
        query getCustomers($pageNo: Int, $pageSize: Int, $filter: CustomerInput, $type: Int) {
          getCustomers(pageNo: $pageNo, pageSize: $pageSize, filter: $filter, type: $type) {
            total
            customers {
              customer_id
              customer_name
              customer_mobile
              bank_account
              company_id
              customer_mobile
              mobiles {
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
