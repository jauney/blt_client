import { routerRedux } from 'dva/router';
import { stringify } from 'qs';
import { fakeAccountLogin, getFakeCaptcha } from '@/services/api';
import { setAuthority } from '@/utils/authority';
import { getPageQuery } from '@/utils/utils';
import { reloadAuthorized } from '@/utils/Authorized';

export default {
  namespace: 'login',

  state: {
    status: undefined,
  },

  effects: {
    *login({ payload }, { call, put }) {
      const response = yield call(fakeAccountLogin, payload);
      if (response.code) {
        return response;
      }
      yield put({
        type: 'changeLoginStatus',
        payload: response,
      });
      // Login successfully
      if (response.token) {
        reloadAuthorized();
        const urlParams = new URL(window.location.href);
        const params = getPageQuery();
        let { redirect } = params;

        if (redirect) {
          const redirectUrlParams = new URL(redirect);
          if (redirectUrlParams.origin === urlParams.origin) {
            redirect = redirect.substr(urlParams.origin.length);
            if (redirect.match(/^\/.*#/)) {
              redirect = redirect.substr(redirect.indexOf('#') + 1);
            }
          } else {
            window.location.href = redirect;
            return;
          }
        }

        window.location.href = redirect || '/';
        // yield put(routerRedux.replace({ pathname: redirect || '/' }));
      }
      return { code: 0 }
    },

    *getCaptcha({ payload }, { call }) {
      yield call(getFakeCaptcha, payload);
    },

    *logout(_, { put }) {
      yield put({
        type: 'changeLoginStatus',
        payload: {
          status: false,
          currentAuthority: 'guest',
        },
      });
      reloadAuthorized();
      yield put(
        window.location.replace('/user/login')
        // routerRedux.push({
        //   pathname: '/user/login',
        //   search: stringify({
        //     redirect: window.location.href,
        //   }),
        // })
      );
    },
  },

  reducers: {
    changeLoginStatus(state, { payload }) {
      setAuthority(payload);
      return {
        ...state,
        status: payload.token && payload.token.length > 0,
      };
    },
  },
};
