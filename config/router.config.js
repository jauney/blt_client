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
        icon: '单',
        authority: ['site_orderuser', 'site_admin', 'site_searchuser', 'company_account', 'company_admin'],
        routes: [
          {
            path: '/order/untrunklist',
            name: 'untrunklist',
            component: './Order/UntrunkList',
          },
          {
            path: '/order/siteorder',
            name: 'siteorder',
            component: './Order/SiteOrder',
            authority: ['site_orderuser', 'site_admin', 'site_searchuser'],
          },
          {
            path: '/order/untrunkorder',
            name: 'untrunkorder',
            component: './Order/UntrunkOrder',
            authority: ['site_orderuser', 'site_admin', 'site_searchuser', 'company_account', 'company_admin'],
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
        icon: '核',
        name: 'account',
        authority: ['company_account', 'company_admin', 'site_admin', 'site_searchuser', 'site_orderuser', 'site_pay', 'site_receipt'],
        routes: [
          {
            path: '/account/unsettle',
            name: 'unsettle',
            component: './Account/UnSettle',
            authority: [
              'company_account',
              'company_admin',
              'site_admin',
              'site_searchuser',
              'site_orderuser',
              'site_pay',
              'site_receipt'
            ],
          },
          {
            path: '/account/settle',
            name: 'settle',
            component: './Account/Settle',
            authority: [
              'company_account',
              'company_admin',
              'site_admin',
              'site_searchuser',
              'site_orderuser',
              'site_pay',
              'site_receipt'
            ],
          },
          {
            path: '/account/unsettlegoods',
            name: 'unsettlegoods',
            component: './Account/UnSettleGoods',
            authority: [
              'company_account',
              'company_admin',
              'site_admin',
              'site_searchuser',
              'site_orderuser',
              'site_pay',
              'site_receipt'
            ],
          },
          {
            path: '/account/accountlist',
            name: 'accountlist',
            component: './Account/AccountList',
            authority: [
              'company_account',
              'company_admin',
              'site_admin',
              'site_searchuser',
              'site_orderuser',
              'site_pay',
              'site_receipt'
            ],
          },
        ],
      },
      // 付款管理
      {
        path: '/pay',
        icon: '付',
        name: 'pay',
        authority: ['site_pay', 'site_admin', 'site_searchuser', 'site_receipt'],
        routes: [
          {
            path: '/pay/pay',
            name: 'pay',
            component: './Pay/Pay',
            authority: ['site_pay', 'site_receipt', 'site_searchuser', 'site_admin'],
          },
          {
            path: '/pay/payabnormal',
            name: 'payabnormal',
            component: './Pay/PayAbnormal',
            authority: ['site_pay', 'site_receipt', 'site_searchuser', 'site_admin'],
          },
          {
            path: '/pay/paysearch',
            name: 'paysearch',
            component: './Pay/PaySearch',
            authority: ['site_pay', 'site_receipt', 'site_searchuser', 'site_admin'],
          },
          {
            path: '/pay/paytoday',
            name: 'paytoday',
            component: './Pay/PayToday',
            authority: ['site_pay', 'site_receipt', 'site_searchuser', 'site_admin'],
          },
        ],
      },
      // abnormal
      {
        path: '/abnormal',
        icon: '异',
        name: 'abnormal',
        authority: ['site_pay', 'site_searchuser', 'site_receipt', 'site_admin', 'company_account', 'company_admin', 'site_orderuser'],
        routes: [
          {
            path: '/abnormal/addabnormal',
            name: 'addabnormal',
            component: './Abnormal/AddAbnormal',
            authority: [
              'site_pay',
              'site_searchuser',
              'site_receipt',
              'site_admin',
              'company_account',
              'company_admin',
              'site_orderuser',
            ],
          },
          {
            path: '/abnormal/unresolvedabnormal',
            name: 'unresolvedabnormal',
            component: './Abnormal/UnResolvedAbnormal',
            authority: [
              'site_pay',
              'site_receipt',
              'site_admin',
              'site_searchuser',
              'company_account',
              'company_admin',
              'site_orderuser',
            ],
          },
          {
            path: '/abnormal/resolvedabnormal',
            name: 'resolvedabnormal',
            component: './Abnormal/ResolvedAbnormal',
            authority: [
              'site_pay',
              'site_searchuser',
              'site_receipt',
              'site_admin',
              'company_account',
              'company_admin',
              'site_orderuser',
            ],
          },
        ],
      },
      // finance
      {
        path: '/finance',
        icon: '财',
        name: 'finance',
        authority: ['site_admin', 'site_searchuser', 'company_admin', 'site_pay'],
        routes: [
          {
            path: '/finance/income',
            name: 'income',
            component: './Finance/Income',
            authority: ['site_admin', 'site_searchuser', 'company_admin', 'site_pay'],
          },
          {
            path: '/finance/expense',
            name: 'expense',
            component: './Finance/Expense',
            authority: ['site_admin', 'site_searchuser', 'company_admin', 'site_pay'],
          },
          {
            path: '/finance/debt',
            name: 'debt',
            component: './Finance/Debt',
            authority: ['site_admin', 'site_searchuser', 'company_admin', 'site_pay'],
          },
        ],
      },
      // 打款管理
      {
        path: '/transfer',
        name: 'transfer',
        icon: '款',
        authority: ['site_user', 'site_admin', 'site_searchuser', 'site_pay', 'company_admin', 'site_orderuser'],
        routes: [
          // transfer
          {
            path: '/transfer/company',
            name: 'company',
            component: './Transfer/Company',
            authority: ['company_admin', 'site_pay'],
          },
          {
            path: '/transfer/site',
            name: 'site',
            component: './Transfer/Site',
            authority: ['site_user', 'site_admin', 'site_searchuser', 'site_pay', 'site_orderuser'],
          },
        ],
      },
      {
        path: '/customer',
        name: 'customer',
        icon: '客',
        authority: ['company_admin', 'company_account', 'site_admin', 'site_searchuser', 'site_orderuser', 'site_pay', 'site_receipt'],
        routes: [
          // transfer
          {
            path: '/customer/getcustomer',
            name: 'getcustomer',
            component: './Customer/GetCustomer',
            authority: ['company_admin', 'company_account'],
          },
          {
            path: '/customer/sendcustomer',
            name: 'sendcustomer',
            component: './Customer/SendCustomer',
            authority: ['site_admin', 'site_searchuser', 'site_orderuser', 'site_pay', 'site_receipt'],
          },
        ],
      },
      {
        path: '/courier',
        name: 'courier',
        icon: '工',
        authority: ['company_admin', 'site_admin', 'site_searchuser', 'company_account'],
        routes: [
          // transfer
          {
            path: '/courier/sender',
            name: 'sender',
            component: './Courier/Sender',
            authority: ['company_admin', 'company_account'],
          },
          {
            path: '/courier/receiver',
            name: 'receiver',
            component: './Courier/Receiver',
            authority: ['site_admin', 'site_searchuser'],
          },
          {
            path: '/courier/operator',
            name: 'operator',
            component: './Courier/Operator',
            authority: ['site_admin', 'site_searchuser', 'company_account'],
          },
          {
            path: '/courier/sendermng',
            name: 'sendermng',
            component: './Courier/SenderMng',
            authority: ['company_admin', 'company_account'],
          },
          {
            path: '/courier/receivermng',
            name: 'receivermng',
            component: './Courier/ReceiverMng',
            authority: ['site_admin', 'site_searchuser'],
          },
        ],
      },
      {
        path: '/search',
        name: 'search',
        icon: '查',
        authority: ['company_admin', 'site_admin', 'site_pay', 'site_receipt'],
        routes: [
          // transfer
          {
            path: '/search/account',
            name: 'todayaccount',
            component: './Search/Account',
            authority: ['company_admin', 'site_admin', 'site_pay', 'site_receipt'],
          },
          {
            path: '/search/stock',
            name: 'stock',
            component: './Search/Stock',
            authority: ['company_admin', 'site_admin', 'site_pay'],
          },
        ],
      },
      {
        path: '/transconfirm',
        name: 'transconfirm',
        icon: '结',
        authority: ['site_admin', 'site_searchuser', 'site_pay', 'site_receipt'],
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
        icon: '系',
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
