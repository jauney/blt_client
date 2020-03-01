import {
  getOrderList,
  getOrderStatistic,
  settleOrder,
  updateCarStatus,
  cancelEntrunk,
  updateOrderSign,
} from '@/services/api';

export default {
  namespace: 'unsettle',

  state: {
    orderList: [],
    total: 0,
    totalOrderAmount: 0,
    totalTransAmount: 0,
    totalInsurancefee: 0,
    totalAdvancepayAmount: 0,
    totalDeliverAmount: 0,
    totalRealOrderAmount: 0,
    totalLatefee: 0,
    totalBonusfee: 0,
  },

  effects: {
    *getOrderListAction({ payload }, { call, put }) {
      payload.filter = payload.filter || {};
      payload.filter.order_status = [4, 5];

      const response = yield call(getOrderList, payload);
      yield put({
        type: 'getOrderListReducer',
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
    *settleOrderAction({ payload }, { call, put }) {
      console.log(payload);
      return yield call(settleOrder, payload); // post
    },
    *signAction({ payload }, { call, put }) {
      payload.sign_status = 1;
      return yield call(updateOrderSign, payload); // post
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
    getOrderStatisticReducer(state, action) {
      return {
        ...state,
        ...action.payload,
      };
    },
  },
};
