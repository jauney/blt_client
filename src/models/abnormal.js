import {
  getOrderList,
  getTrunkedOrderStatistic,
  cancelSettleOrder,
  downAccount,
  updateOrderSign,
  addAbnormal,
  getAbnormalTypes,
} from '@/services/api';

export default {
  namespace: 'abnormal',

  state: {
    orderList: [],
    total: 0,
    totalOrderAmount: 0,
    totalTransAmount: 0,
    totalInsurancefee: 0,
    abnormalTypes: [],
    abnormalTotal: 0,
  },

  effects: {
    *getOrderListAction({ payload }, { call, put }) {
      payload.filter = payload.filter || {};
      payload.filter.order_status = [6, 7];

      const response = yield call(getOrderList, payload);
      yield put({
        type: 'getOrderListReducer',
        payload: response,
      });
    },
    *addAbnormalAction({ payload }, { call, put }) {
      return yield call(addAbnormal, payload); // post
    },
    *getAbnormalTypeListAction({ payload }, { call, put }) {
      const response = yield call(getAbnormalTypes, payload); // post
      yield put({
        type: 'getAbnormalTypeListReducer',
        payload: response,
      });
    },
    *getOrderStatisticAction({ payload }, { call, put }) {
      payload.order_status = 0;
      const response = yield call(getTrunkedOrderStatistic, payload);
      yield put({
        type: 'getOrderStatisticReducer',
        payload: response,
      });
    },
    *cancelSettleOrderAction({ payload }, { call, put }) {
      console.log(payload);
      return yield call(cancelSettleOrder, payload); // post
    },
    *downAccountAction({ payload }, { call, put }) {
      return yield call(downAccount, payload); // post
    },
    *cancelSignAction({ payload }, { call, put }) {
      payload.sign_status = 0;
      return yield call(updateOrderSign, payload); // post
    },
  },

  reducers: {
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
