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
      // 账目结算
      {
        path: '/account',
        icon: 'form',
        name: 'account',
        routes: [
          {
            path: '/account/unsettle',
            name: 'unsettle',
            component: './Account/UnSettle',
          },
          {
            path: '/account/settle',
            name: 'settle',
            component: './Account/Settle',
          },
          {
            path: '/account/unsettlegoods',
            name: 'unsettlegoods',
            component: './Account/UnSettleGoods',
          },
          {
            path: '/account/accountlist',
            name: 'accountlist',
            component: './Account/AccountList',
          },
        ],
      },
      // 付款管理
      {
        path: '/pay',
        icon: 'form',
        name: 'pay',
        routes: [
          {
            path: '/pay/pay',
            name: 'pay',
            component: './Pay/Pay',
          },
          {
            path: '/pay/payabnormal',
            name: 'payabnormal',
            component: './Pay/PayAbnormal',
          },
          {
            path: '/pay/paysearch',
            name: 'paysearch',
            component: './Pay/PaySearch',
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
            authority: ['admin', 'site_user', 'site_admin', 'site_account'],
          },
        ],
      },
      {
        path: '/customer',
        name: 'customer',
        icon: 'profile',
        routes: [
          // transfer
          {
            path: '/customer/getcustomer',
            name: 'getcustomer',
            component: './Customer/GetCustomer',
          },
          {
            path: '/customer/sendcustomer',
            name: 'sendcustomer',
            component: './Customer/SendCustomer',
            authority: ['admin', 'site_user', 'site_admin', 'site_account'],
          },
        ],
      },
      {
        path: '/courier',
        name: 'courier',
        icon: 'profile',
        routes: [
          // transfer
          {
            path: '/courier/sender',
            name: 'sender',
            component: './Courier/Sender',
          },
          {
            path: '/courier/receiver',
            name: 'receiver',
            component: './Courier/Receiver',
          },
          {
            path: '/courier/operator',
            name: 'operator',
            component: './Courier/Operator',
          },
        ],
      },
      {
        path: '/search',
        name: 'search',
        icon: 'profile',
        routes: [
          // transfer
          {
            path: '/search/account',
            name: 'todayaccount',
            component: './Search/Account',
          },
          {
            path: '/search/stock',
            name: 'stock',
            component: './Search/Stock',
          },
        ],
      },
      {
        path: '/transconfirm',
        name: 'transconfirm',
        icon: 'profile',
        routes: [
          // transfer
          {
            path: '/transconfirm/transunconfirm',
            name: 'transunconfirm',
            component: './TransConfirm/TransUnconfirm',
          },
          {
            path: '/transconfirm/transconfirmed',
            name: 'transconfirmed',
            component: './TransConfirm/TransConfirmed',
          },
        ],
      },
      {
        path: '/system',
        name: 'system',
        icon: 'profile',
        routes: [
          // transfer
          {
            path: '/system/company',
            name: 'companymng',
            component: './System/Company',
          },
          {
            path: '/system/site',
            name: 'sitemng',
            component: './System/Site',
          },
          {
            path: '/system/user',
            name: 'usermng',
            component: './System/User',
          },
        ],
      },
      {
        component: '404',
      },
    ],
  },
];
