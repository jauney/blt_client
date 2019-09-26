import { querySiteList, addSite } from '@/services/api';

export default {
  namespace: 'site',

  state: {
    // site_type: 1 普通站点， 2 装载站点
    siteList: [],
    entrunkSiteList: [],
    normalSiteList: [],
    site: {},
  },

  effects: {
    *getSiteListAction({ payload }, { call, put }) {
      const response = yield call(querySiteList, payload);
      const list = response.sites;
      yield put({
        type: 'getSiteListReducer',
        payload: Array.isArray(list) ? list : [],
      });
      return list;
    },
    *getEntrunkSiteListAction({ payload }, { call, put }) {
      const response = yield call(querySiteList, payload);
      const list = response.sites;
      yield put({
        type: 'getEntrunkSiteListReducer',
        payload: Array.isArray(list) ? list : [],
      });
    },
    *getNormalSiteListAction({ payload }, { call, put }) {
      const response = yield call(querySiteList, payload);
      const list = response.sites;
      yield put({
        type: 'getNormalSiteListReducer',
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
    getSiteListReducer(state, action) {
      const entrunkSiteList = action.payload.filter(item => {
        if (item.site_type == 2) {
          return item;
        }
      });
      const normalSiteList = action.payload.filter(item => {
        if (item.site_type != 2) {
          return item;
        }
      });
      return {
        ...state,
        siteList: action.payload,
        normalSiteList,
        entrunkSiteList,
        site: JSON.parse(localStorage.getItem('site') || '{}'),
      };
    },
    getEntrunkSiteListReducer(state, action) {
      return {
        ...state,
        entrunkSiteList: action.payload,
      };
    },
    getNormalSiteListReducer(state, action) {
      return {
        ...state,
        normalSiteList: action.payload,
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
