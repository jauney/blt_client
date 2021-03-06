import {
  getOrderCode,
  createOrderAxios,
  updateOrder,
  getOrderListAxios,
  deleteOrder,
  getOrderStatisticAxios,
  shipOrder,
  shipOrderAxios,
  cancelShipOrder,
} from '@/services/api';

export default {
  namespace: 'order',

  state: {
    orderListMap: {},
    orderList: [],
    orderCode: {},
    total: 0,
    totalOrderAmount: 0,
    totalTransAmount: 0,
    totalInsurancefee: 0,
    totalRealTransAmount: 0,
    totalRealOrderAmount: 0,
    totalAdvancepayAmount: 0,
    totalDeliverAmount: 0,
    totalTifuTransAmount: 0,
    totalXianTransAmount: 0,
    totalLatefee: 0,
    totalBonusfee: 0,
    totalCarFeeConfirm: 0,
    totalCarFee: 0,
    totalXianInsurence: 0,
    totalTifuInsurance: 0,
  },

  effects: {
    *getOrderCodeAction({ payload }, { call, put }) {
      const response = yield call(getOrderCode, { order: payload });
      yield put({
        type: 'getOrderCodeReducer',
        payload: response,
      });
    },
    *createOrderAction({ payload }, { call, put }) {
      const response = yield call(createOrderAxios, payload);

      yield put({
        type: 'appendListReducer',
        payload: response,
      });
      return response;
    },
    *updateOrderAction({ payload }, { call, put }) {
      console.log('update', payload);
      const response = yield call(updateOrder, payload);

      return response;
    },
    *getOrderListAction({ payload }, { call, put }) {
      payload.filter = payload.filter || {};
      if (!payload.filter.order_status) {
        payload.filter.order_status = 0;
      }
      const response = yield call(getOrderListAxios, payload);
      yield put({
        type: 'getOrderListReducer',
        payload: response,
        params: payload,
      });
    },
    *deleteOrderAction({ payload }, { call, put }) {
      payload.is_delete = 1;
      return yield call(deleteOrder, payload); // post
    },
    *getOrderStatisticAction({ payload }, { call, put }) {
      payload.order_status = 0;
      const response = yield call(getOrderStatisticAxios, payload);
      yield put({
        type: 'getSiteOrderStatisticReducer',
        payload: response,
      });
    },
    *shipOrderAction({ payload }, { call, put }) {
      return yield call(shipOrderAxios, payload); // post
    },
    *cancelShipAction({ payload }, { call, put }) {
      return yield call(cancelShipOrder, payload); // post
    },
  },

  reducers: {
    getOrderCodeReducer(state, action) {
      return {
        ...state,
        orderCode: action.payload,
      };
    },
    getOrderListReducer(state, action) {
      const orders = action.payload.orders;
      if (action.params && action.params.pageNo == 1) {
        return {
          ...state,
          orderList: orders,
          total: action.payload.total,
        };
      }
      const orderMap = state.orderListMap;
      const orderList = state.orderList;
      orders.forEach(item => {
        if (!orderMap[item.order_id]) {
          orderMap[item.order_id] = item;
          orderList.push(item);
        }
      });
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
