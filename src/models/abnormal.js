import {
  getOrderList,
  getOrderStatistic,
  downAccount,
  updateOrderSign,
  updateAbnormal,
  updateOrder,
  getAbnormalTypes,
} from '@/services/api';

export default {
  namespace: 'abnormal',

  state: {
    orderList: [],
    total: 0,
    todayPayList: [],
    todayPayTotal: 0,
    totalOrderAmount: 0,
    totalTransAmount: 0,
    totalInsurancefee: 0,
    todayPayStatistic: {},
    totalRealTransAmount: 0,
    totalRealOrderAmount: 0,
    totalAdvancepayAmount: 0,
    totalDeliverAmount: 0,
    abnormalTypes: [],
    abnormalTotal: 0,
  },

  effects: {
    *initOrderListAction({ payload }, { call, put }) {
      yield put({
        type: 'initOrderListReducer',
        payload: { orders: [], total: 0 },
      });
    },
    *getOrderListAction({ payload }, { call, put }) {
      payload.filter = payload.filter || {};

      const response = yield call(getOrderList, payload);
      yield put({
        type: 'getOrderListReducer',
        payload: response,
      });
    },
    *addAbnormalAction({ payload }, { call, put }) {
      return yield call(updateAbnormal, payload); // post
    },
    *getAbnormalTypeListAction({ payload }, { call, put }) {
      const response = yield call(getAbnormalTypes, payload); // post
      yield put({
        type: 'getAbnormalTypeListReducer',
        payload: response,
      });
    },
    *getOrderStatisticAction({ payload }, { call, put }) {
      const response = yield call(getOrderStatistic, payload);
      yield put({
        type: 'getOrderStatisticReducer',
        payload: response,
      });
    },
    *cancelAbnormalAction({ payload }, { call, put }) {
      return yield call(updateOrder, payload); // post
    },
    *resolveAbnormalAction({ payload }, { call, put }) {
      return yield call(updateAbnormal, payload); // post
    },
    *cancelSignAction({ payload }, { call, put }) {
      payload.sign_status = 0;
      return yield call(updateOrderSign, payload); // post
    },
  },

  reducers: {
    initOrderListReducer(state, action) {
      return {
        ...state,
        orderList: action.payload.orders,
        total: action.payload.total,
        totalOrderAmount: 0,
        totalTransAmount: 0,
        totalInsurancefee: 0,
        totalAdvancepayAmount: 0,
        totalDeliverAmount: 0,
      };
    },
    getAbnormalTypeListReducer(state, action) {
      return {
        ...state,
        abnormalTypes: action.payload.abnormal_types,
        abnormalTotal: action.payload.total,
      };
    },
    getOrderListReducer(state, action) {
      return {
        ...state,
        orderList: action.payload.orders,
        total: action.payload.total,
      };
    },
    getOrderStatisticReducer(state, action) {
      return {
        ...state,
        ...action.payload,
      };
    },
  },
};
