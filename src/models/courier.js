import {
  getCourierList,
  getReceiverList,
  getOperatorList,
  removeCourier,
  createCourier,
  updateCourier,
  updateCustomerCourier,
  getOrderStatistic,
  getOrderList,
} from '@/services/api';
import { replace } from 'react-router-redux';

export default {
  namespace: 'courier',

  state: {
    senderList: [],
    receiverList: [],
    operatorList: [],
    senderTotal: 0,
    receiverTotal: 0,
    operatorTotal: 0,
    orderList: [],
    total: 0,
    current: 1,
    totalOrderAmount: 0,
    totalTransAmount: 0,
    totalRealOrderAmount: 0,
    totalDeliverAmount: 0,
    totalLatefee: 0,
    totalBonusfee: 0,
  },

  effects: {
    *initOrderListAction({ payload }, { call, put }) {
      yield put({
        type: 'initOrderListReducer',
        payload: { orders: [], total: 0 },
      });
    },
    *getCourierListAction({ payload }, { call, put, select }) {
      const response = yield call(getCourierList, payload);

      yield put({
        type: 'getCourierReducer',
        payload: { ...payload, response },
      });
    },
    *getOperatorListAction({ payload }, { call, put, select }) {
      const response = yield call(getOperatorList, payload);

      yield put({
        type: 'getOperatorReducer',
        payload: response,
      });
    },
    *getOrderListAction({ payload }, { call, put }) {
      payload.filter = payload.filter || {};
      payload.filter.order_status = [2, 8];
      const response = yield call(getOrderList, payload);
      yield put({
        type: 'getOrderListReducer',
        payload: response,
        params: payload,
      });
    },
    *getOrderStatisticAction({ payload }, { call, put }) {
      payload.order_status = [2, 8];
      const response = yield call(getOrderStatistic, payload);
      yield put({
        type: 'getSiteOrderStatisticReducer',
        payload: response,
      });
    },
    *queryCustomerTypesAction({ payload }, { call, put, select }) {
      const response = yield call(getCustomerTypes, payload);
      yield put({
        type: 'queryGetCustomerTypesReducer',
        payload: response,
      });
    },
    *createCourierAction({ payload }, { call, put }) {
      const response = yield call(createCourier, payload);
      return response;
    },
    // 更新客户关联送货人/接货人
    *updateCustomerCourierAction({ payload }, { call, put }) {
      const response = yield call(updateCustomerCourier, payload);
      return response;
    },
    *updateCourierAction({ payload }, { call, put }) {
      const response = yield call(updateCourier, payload);
      return response;
    },
  },

  reducers: {
    initOrderListReducer(state, action) {
      return {
        ...state,
        senderList: [],
        receiverList: [],
        operatorList: [],
        senderTotal: 0,
        receiverTotal: 0,
        operatorTotal: 0,
        orderList: [],
        total: 0,
        current: 1,
        totalOrderAmount: 0,
        totalTransAmount: 0,
        totalInsurancefee: 0,
      };
    },
    getCourierReducer(state, action) {
      const { type, response } = action.payload;
      let courier = {};

      if (type == 'sender') {
        courier = { senderList: response.couriers, senderTotal: response.total };
      } else {
        courier = { receiverList: response.couriers, receiverTotal: response.total };
      }
      return {
        ...state,
        ...courier,
      };
    },
    getOperatorReducer(state, action) {
      return {
        ...state,
        operatorList: action.payload.users || [],
        operatorTotal: action.payload.total,
      };
    },
    getOrderListReducer(state, action) {
      const orders = action.payload.orders;

      return {
        ...state,
        orderList: orders,
        total: action.payload.total,
      };
    },
    getSiteOrderStatisticReducer(state, action) {
      return {
        ...state,
        ...action.payload,
      };
    },
  },
};
