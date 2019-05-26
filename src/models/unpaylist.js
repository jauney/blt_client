import {
  getOrderList,
  getTrunkedOrderStatistic,
  cancelSettleOrder,
  downAccount,
  updateOrderSign,
} from '@/services/api';

export default {
  namespace: 'unpaylist',

  state: {
    orderList: [],
    total: 0,
    totalOrderAmount: 0,
    totalTransAmount: 0,
    totalInsurancefee: 0,
  },

  effects: {
    *getOrderListAction({ payload }, { call, put }) {
      payload.filter = payload.filter || {};
      payload.filter.order_status = [6];

      const response = yield call(getOrderList, payload);
      yield put({
        type: 'getOrderListReducer',
        payload: response,
      });
    },
    *getUntrunkOrderStatisticAction({ payload }, { call, put }) {
      payload.order_status = 0;
      const response = yield call(getTrunkedOrderStatistic, payload);
      yield put({
        type: 'getUntrunkOrderStatisticReducer',
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
    getOrderListReducer(state, action) {
      return {
        ...state,
        orderList: action.payload.orders,
        total: action.payload.total,
      };
    },
    getUntrunkOrderStatisticReducer(state, action) {
      return {
        ...state,
        ...action.payload,
      };
    },
  },
};
