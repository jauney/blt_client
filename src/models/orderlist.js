import { getOrderList, getOrderStatistic } from '@/services/api';

export default {
  namespace: 'orderlist',

  state: {
    orderList: [],
    total: 0,
    totalOrderAmount: 0,
    totalTransAmount: 0,
    totalInsurancefee: 0,
  },

  effects: {
    *getOrderListAction({ payload }, { call, put }) {
      const response = yield call(getOrderList, payload);
      yield put({
        type: 'getOrderListReducer',
        payload: response || [],
      });
    },
    *getOrderStatisticAction({ payload }, { call, put }) {
      const response = yield call(getOrderStatistic, payload);
      yield put({
        type: 'getOrderStatisticReducer',
        payload: response,
      });
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
