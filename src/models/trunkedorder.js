import {
  getOrderList,
  getTrunkedOrderStatistic,
  cancelTrunkedOrder,
  departCar,
  cancelDepartCar,
  arriveCar,
  cancelArriceCar,
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
      const response = yield call(getUntrunkOrderStatistic, payload);
      yield put({
        type: 'getUntrunkOrderStatisticReducer',
        payload: response,
      });
    },
    *cancelShipAction({ payload }, { call, put }) {
      return yield call(cancelShipOrder, payload); // post
    },
    *entrunkOrderAction({ payload }, { call, put }) {
      return yield call(entrunkOrder, payload); // post
    },
    *changeOrderReceiverAction({ payload }, { call, put }) {
      return yield call(changeOrderReceiver, payload); // post
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
