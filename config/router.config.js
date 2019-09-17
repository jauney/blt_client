export default [
  // user
  {
    path: '/user',
    component: '../layouts/UserLayout',
    routes: [
      { path: '/user', redirect: '/user/login' },
      { path: '/user/login', component: './User/Login' },
      { path: '/user/register', component: './User/Register' },
      { path: '/user/register-result', component: './User/RegisterResult' },
    ],
  },
  // app
  {
    path: '/',
    component: '../layouts/BasicLayout',
    Routes: ['src/pages/Authorized'],
    routes: [
      { path: '/', component: './Index' },
      {
        path: '/order',
        name: 'order',
        icon: 'ordered-list',
        routes: [
          {
            path: '/order/siteorder',
            name: 'siteorder',
            component: './Order/SiteOrder',
            authority: ['admin', 'site_user', 'site_admin', 'site_account'],
          },
          {
            path: '/order/untrunkorder',
            name: 'untrunkorder',
            component: './Order/UntrunkOrder',
            authority: ['admin', 'site_user', 'site_admin', 'site_account'],
          },
          {
            path: '/order/trunkedorder',
            name: 'trunkedorder',
            component: './Order/TrunkedOrder',
            authority: ['admin', 'site_user', 'site_admin', 'site_account'],
          },
          {
            path: '/order/orderlist',
            name: 'orderlist',
            component: './Order/OrderList',
          },
        ],
      },
      // forms
      {
        path: '/account',
        icon: 'form',
        name: 'account',
        routes: [
          {
            path: '/account/unsettle',
            name: 'unsettle',
            component: './Account/Unsettle',
          },
          {
            path: '/account/settle',
            name: 'settle',
            component: './Account/Settle',
          },
          {
            path: '/account/unpaylist',
            name: 'unpaylist',
            authority: ['admin'],
            component: './Account/UnPayList',
          },
          {
            path: '/account/accountlist',
            name: 'accountlist',
            authority: ['admin'],
            component: './Account/AccountList',
          },
        ],
      },
      // abnormal
      {
        path: '/abnormal',
        icon: 'table',
        name: 'abnormal',
        routes: [
          {
            path: '/abnormal/addabnormal',
            name: 'addabnormal',
            component: './Abnormal/AddAbnormal',
          },
          {
            path: '/abnormal/unresolvedabnormal',
            name: 'unresolvedabnormal',
            component: './Abnormal/UnResolvedAbnormal',
          },
          {
            path: '/abnormal/resolvedabnormal',
            name: 'resolvedabnormal',
            component: './Abnormal/ResolvedAbnormal',
          },
        ],
      },
      // finance
      {
        path: '/finance',
        icon: 'table',
        name: 'finance',
        routes: [
          {
            path: '/finance/income',
            name: 'income',
            component: './Finance/Income',
          },
          {
            path: '/finance/expense',
            name: 'expense',
            component: './Finance/Expense',
          },
          {
            path: '/finance/debt',
            name: 'debt',
            component: './Finance/Debt',
          },
        ],
      },
      {
        path: '/transfer',
        name: 'transfer',
        icon: 'profile',
        routes: [
          // transfer
          {
            path: '/transfer/company',
            name: 'company',
            component: './Transfer/Company',
          },
          {
            path: '/transfer/site',
            name: 'site',
            component: './Transfer/Site',
            authority: ['admin1'],
          },
        ],
      },
      {
        name: 'result',
        icon: 'check-circle-o',
        path: '/result',
        routes: [
          // result
          {
            path: '/result/success',
            name: 'success',
            component: './Result/Success',
          },
          { path: '/result/fail', name: 'fail', component: './Result/Error' },
        ],
      },
      {
        name: 'exception',
        icon: 'warning',
        path: '/exception',
        routes: [
          // exception
          {
            path: '/exception/403',
            name: 'not-permission',
            component: './Exception/403',
          },
          {
            path: '/exception/404',
            name: 'not-find',
            component: './Exception/404',
          },
          {
            path: '/exception/500',
            name: 'server-error',
            component: './Exception/500',
          },
          {
            path: '/exception/trigger',
            name: 'trigger',
            hideInMenu: true,
            component: './Exception/TriggerException',
          },
        ],
      },
      {
        component: '404',
      },
    ],
  },
];
