import {
  getOrderList,
  getTrunkedOrderStatistic,
  settleOrder,
  updateCarStatus,
  cancelEntrunk,
} from '@/services/api';

export default {
  namespace: 'unsettle',

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
      payload.filter.order_status = 2;

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
    *settleOrderAction({ payload }, { call, put }) {
      console.log(payload);
      return yield call(settleOrder, payload); // post
    },
    *updateCarStatusAction({ payload }, { call, put }) {
      console.log(payload);
      return yield call(updateCarStatus, payload); // post
    },
    *cancelEntrunkAction({ payload }, { call, put }) {
      console.log(payload);
      return yield call(cancelEntrunk, payload); // post
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
