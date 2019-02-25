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
    authority: ['admin', 'user'],
    routes: [
      // dashboard

      { path: '/', redirect: '/order/siteorder' },
      {
        path: '/order',
        name: 'order',
        icon: 'ordered-list',
        routes: [
          {
            path: '/order/siteorder',
            name: 'siteorder',
            component: './Order/SiteOrder',
          },
          {
            path: '/order/untrunkorder',
            name: 'untrunkorder',
            component: './Order/UntrunkOrder',
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
            path: '/account/unsettlelist',
            name: 'unsettlelist',
            authority: ['admin'],
            component: './Account/UnsettleList',
          },
          {
            path: '/account/accountlist',
            name: 'accountlist',
            authority: ['admin'],
            component: './Account/AccountList',
          },
        ],
      },
      // list
      {
        path: '/list',
        icon: 'table',
        name: 'list',
        routes: [
          {
            path: '/list/table-list',
            name: 'searchtable',
            component: './List/TableList',
          },
          {
            path: '/list/basic-list',
            name: 'basiclist',
            component: './List/BasicList',
          },
          {
            path: '/list/card-list',
            name: 'cardlist',
            component: './List/CardList',
          },
          {
            path: '/list/search',
            name: 'searchlist',
            component: './List/List',
            routes: [
              {
                path: '/list/search',
                redirect: '/list/search/articles',
              },
              {
                path: '/list/search/articles',
                name: 'articles',
                component: './List/Articles',
              },
              {
                path: '/list/search/projects',
                name: 'projects',
                component: './List/Projects',
              },
              {
                path: '/list/search/applications',
                name: 'applications',
                component: './List/Applications',
              },
            ],
          },
        ],
      },
      {
        path: '/profile',
        name: 'profile',
        icon: 'profile',
        routes: [
          // profile
          {
            path: '/profile/basic',
            name: 'basic',
            component: './Profile/BasicProfile',
          },
          {
            path: '/profile/advanced',
            name: 'advanced',
            authority: ['admin'],
            component: './Profile/AdvancedProfile',
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
