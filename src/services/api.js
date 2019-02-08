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
  //defaultOptions,
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
        query getCustomers($pageNo: Int, $pageSize: Int, $type: Int) {
          getCustomers(pageNo: $pageNo, pageSize: $pageSize, type: $type) {
            total
            customers {
              customer_id
              customer_name
              customer_mobile
              bank_account
              company_id
              customer_mobile
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
