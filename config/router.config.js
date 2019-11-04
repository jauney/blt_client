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
        authority: ['site_orderuser', 'site_admin', 'company_account', 'company_admin'],
        routes: [
          {
            path: '/order/siteorder',
            name: 'siteorder',
            component: './Order/SiteOrder',
            authority: ['site_orderuser', 'site_admin'],
          },
          {
            path: '/order/untrunkorder',
            name: 'untrunkorder',
            component: './Order/UntrunkOrder',
            authority: ['site_orderuser', 'site_admin'],
          },
          {
            path: '/order/trunkedorder',
            name: 'trunkedorder',
            component: './Order/TrunkedOrder',
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
        authority: ['company_account', 'company_admin'],
        routes: [
          {
            path: '/account/unsettle',
            name: 'unsettle',
            component: './Account/UnSettle',
            authority: ['company_account', 'company_admin'],
          },
          {
            path: '/account/settle',
            name: 'settle',
            component: './Account/Settle',
            authority: ['company_account', 'company_admin'],
          },
          {
            path: '/account/unsettlegoods',
            name: 'unsettlegoods',
            component: './Account/UnSettleGoods',
            authority: ['company_account', 'company_admin'],
          },
          {
            path: '/account/accountlist',
            name: 'accountlist',
            component: './Account/AccountList',
            authority: ['company_account', 'company_admin'],
          },
        ],
      },
      // 付款管理
      {
        path: '/pay',
        icon: 'form',
        name: 'pay',
        authority: ['site_pay', 'site_admin'],
        routes: [
          {
            path: '/pay/pay',
            name: 'pay',
            component: './Pay/Pay',
            authority: ['site_pay', 'site_admin'],
          },
          {
            path: '/pay/payabnormal',
            name: 'payabnormal',
            component: './Pay/PayAbnormal',
            authority: ['site_pay', 'site_admin'],
          },
          {
            path: '/pay/paysearch',
            name: 'paysearch',
            component: './Pay/PaySearch',
            authority: ['site_pay', 'site_admin'],
          },
        ],
      },
      // abnormal
      {
        path: '/abnormal',
        icon: 'table',
        name: 'abnormal',
        authority: ['site_pay', 'site_admin', 'company_account', 'company_admin'],
        routes: [
          {
            path: '/abnormal/addabnormal',
            name: 'addabnormal',
            component: './Abnormal/AddAbnormal',
            authority: ['site_pay', 'site_admin', 'company_account', 'company_admin'],
          },
          {
            path: '/abnormal/unresolvedabnormal',
            name: 'unresolvedabnormal',
            component: './Abnormal/UnResolvedAbnormal',
            authority: ['site_pay', 'site_admin', 'company_account', 'company_admin'],
          },
          {
            path: '/abnormal/resolvedabnormal',
            name: 'resolvedabnormal',
            component: './Abnormal/ResolvedAbnormal',
            authority: ['site_pay', 'site_admin', 'company_account', 'company_admin'],
          },
        ],
      },
      // finance
      {
        path: '/finance',
        icon: 'table',
        name: 'finance',
        authority: ['site_admin', 'company_admin'],
        routes: [
          {
            path: '/finance/income',
            name: 'income',
            component: './Finance/Income',
            authority: ['site_admin', 'company_admin'],
          },
          {
            path: '/finance/expense',
            name: 'expense',
            component: './Finance/Expense',
            authority: ['site_admin', 'company_admin'],
          },
          {
            path: '/finance/debt',
            name: 'debt',
            component: './Finance/Debt',
            authority: ['site_admin', 'company_admin'],
          },
        ],
      },
      {
        path: '/transfer',
        name: 'transfer',
        icon: 'profile',
        authority: ['site_user', 'site_admin', 'site_pay', 'company_admin', 'company_account'],
        routes: [
          // transfer
          {
            path: '/transfer/company',
            name: 'company',
            component: './Transfer/Company',
            authority: ['site_user', 'site_admin', 'site_pay', 'company_admin', 'company_account'],
          },
          {
            path: '/transfer/site',
            name: 'site',
            component: './Transfer/Site',
            authority: ['site_user', 'site_admin', 'site_pay'],
          },
        ],
      },
      {
        path: '/customer',
        name: 'customer',
        icon: 'profile',
        authority: ['company_admin', 'site_admin'],
        routes: [
          // transfer
          {
            path: '/customer/getcustomer',
            name: 'getcustomer',
            component: './Customer/GetCustomer',
            authority: ['company_admin'],
          },
          {
            path: '/customer/sendcustomer',
            name: 'sendcustomer',
            component: './Customer/SendCustomer',
            authority: ['site_admin'],
          },
        ],
      },
      {
        path: '/courier',
        name: 'courier',
        icon: 'profile',
        authority: ['company_admin', 'site_admin', 'site_admin'],
        routes: [
          // transfer
          {
            path: '/courier/sender',
            name: 'sender',
            component: './Courier/Sender',
            authority: ['company_admin'],
          },
          {
            path: '/courier/receiver',
            name: 'receiver',
            component: './Courier/Receiver',
            authority: ['site_admin'],
          },
          {
            path: '/courier/operator',
            name: 'operator',
            component: './Courier/Operator',
            authority: ['company_admin', 'site_admin'],
          },
          {
            path: '/courier/sendermng',
            name: 'sendermng',
            component: './Courier/SenderMng',
            authority: ['company_admin'],
          },
          {
            path: '/courier/receivermng',
            name: 'receivermng',
            component: './Courier/ReceiverMng',
            authority: ['site_admin'],
          },
        ],
      },
      {
        path: '/search',
        name: 'search',
        icon: 'profile',
        authority: ['company_admin', 'site_admin', 'site_pay', 'company_account'],
        routes: [
          // transfer
          {
            path: '/search/account',
            name: 'todayaccount',
            component: './Search/Account',
            authority: ['company_admin', 'site_admin', 'site_pay', 'company_account'],
          },
          {
            path: '/search/stock',
            name: 'stock',
            component: './Search/Stock',
            authority: ['company_admin', 'site_admin'],
          },
        ],
      },
      {
        path: '/transconfirm',
        name: 'transconfirm',
        icon: 'profile',
        authority: ['company_admin', 'site_admin', 'site_pay', 'company_account'],
        routes: [
          // transfer
          {
            path: '/transconfirm/transunconfirm',
            name: 'transunconfirm',
            component: './TransConfirm/TransUnconfirm',
            authority: ['company_admin', 'site_admin', 'site_pay', 'company_account'],
          },
          {
            path: '/transconfirm/transconfirmed',
            name: 'transconfirmed',
            component: './TransConfirm/TransConfirmed',
            authority: ['company_admin', 'site_admin', 'site_pay', 'company_account'],
          },
        ],
      },
      {
        path: '/system',
        name: 'system',
        icon: 'profile',
        authority: ['admin'],
        routes: [
          // transfer
          {
            path: '/system/company',
            name: 'companymng',
            component: './System/Company',
            authority: ['admin'],
          },
          {
            path: '/system/site',
            name: 'sitemng',
            component: './System/Site',
            authority: ['admin'],
          },
          {
            path: '/system/user',
            name: 'usermng',
            component: './System/User',
            authority: ['admin'],
          },
        ],
      },
      {
        component: '404',
      },
    ],
  },
];
