import {
  getOrderListAxios,
  getOrderStatisticAxios,
  cancelSettleOrder,
  downAccount,
} from '@/services/api';

export default {
  namespace: 'settle',

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
      payload.filter.order_status = [6, 7];

      const response = yield call(getOrderListAxios, payload);
      yield put({
        type: 'getOrderListReducer',
        payload: response,
      });
    },
    *getOrderStatisticAction({ payload }, { call, put }) {
      payload.order_status = [6, 7];
      const response = yield call(getOrderStatisticAxios, payload);
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
