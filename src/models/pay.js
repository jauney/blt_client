import {
  getOrderList,
  getOrderStatistic,
  getTodayPayList,
  getTodayPayStatistic,
  cancelSettleOrder,
  downAccount,
  cancelDownAccountOrder,
  updateOrder,
} from '@/services/api';

export default {
  namespace: 'pay',

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
  },

  effects: {
    *getOrderListAction({ payload }, { call, put }) {
      payload.filter = payload.filter || {};
      payload.filter.order_status = payload.filter.order_status || 6;

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
    *getTodayPayListAction({ payload }, { call, put }) {
      const response = yield call(getTodayPayList, payload);
      yield put({
        type: 'getTodayPayListReducer',
        payload: response,
      });
    },
    *getTodayPayStatisticAction({ payload }, { call, put }) {
      payload.order_status = [6, 7];

      const response = yield call(getTodayPayStatistic, payload);
      yield put({
        type: 'getTodayPayStatisticReducer',
        payload: response,
      });
    },
    *updatePayAbnormalAction({ payload }, { call, put }) {
      console.log(payload);
      return yield call(updateOrder, payload); // post
    },
    *downAccountAction({ payload }, { call, put }) {
      return yield call(downAccount, payload); // post
    },
    *cancelDownAccountAction({ payload }, { call, put }) {
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
    getTodayPayListReducer(state, action) {
      return {
        ...state,
        todayPayList: action.payload.todaypays,
        todayPayTotal: action.payload.total,
      };
    },
    getOrderStatisticReducer(state, action) {
      return {
        ...state,
        ...action.payload,
      };
    },
    getTodayPayStatisticReducer(state, action) {
      return {
        ...state,
        todayPayStatistic: action.payload,
      };
    },
  },
};
