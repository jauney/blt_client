import { querySiteList, addSite, updateSite } from '@/services/api';

export default {
  namespace: 'site',

  state: {
    // site_type: 1 普通站点， 2 装载站点
    siteList: [],
    site: {},
  },

  effects: {
    *getSiteList({ payload }, { call, put }) {
      const response = yield call(querySiteList, payload);
      const list = response.sites;
      yield put({
        type: 'querySiteList',
        payload: Array.isArray(list) ? list : [],
      });
    },
    *addSite({ payload }, { call, put }) {
      const response = yield call(addSite, payload);

      yield put({
        type: 'addSite',
        payload: response ? [response] : [],
      });
    },
  },

  reducers: {
    querySiteList(state, action) {
      return {
        ...state,
        siteList: action.payload,
        site: JSON.parse(localStorage.getItem('site') || '{}'),
      };
    },
    addSite(state, action) {
      return {
        ...state,
        site: action.payload,
      };
    },
  },
};
