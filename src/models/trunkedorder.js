import {
  getOrderList,
  getTrunkedOrderStatistic,
  updateCarFee,
  updateCarStatus,
  cancelEntrunk,
} from '@/services/api';

export default {
  namespace: 'trunkedorder',

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
    *updateCarFeeAction({ payload }, { call, put }) {
      console.log(payload);
      return yield call(updateCarFee, payload); // post
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
