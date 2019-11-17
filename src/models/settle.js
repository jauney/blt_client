import {
  getOrderList,
  getOrderStatistic,
  cancelSettleOrder,
  downAccount,
  cancelDownAccountOrder,
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
    *getOrderStatisticAction({ payload }, { call, put }) {
      payload.order_status = [6, 7];
      const response = yield call(getOrderStatistic, payload);
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
    *cancelDownAccountAction({ payload }, { call, put }) {
      payload.sign_status = 0;
      return yield call(cancelDownAccountOrder, payload); // post
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
