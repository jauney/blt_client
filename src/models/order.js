import { getOrderCode, createOrder } from '@/services/api';

export default {
  namespace: 'order',

  state: {
    orderList: [],
    orderCode: {},
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
      const response = yield call(createOrder, payload);
      yield put({
        type: 'appendListReducer',
        payload: response,
      });
      return response;
    },
    *appendFetch({ payload }, { call, put }) {
      const response = yield call(queryFakeList, payload);
      yield put({
        type: 'appendList',
        payload: Array.isArray(response) ? response : [],
      });
    },
    *submit({ payload }, { call, put }) {
      let callback;
      if (payload.id) {
        callback = Object.keys(payload).length === 1 ? removeFakeList : updateFakeList;
      } else {
        callback = addFakeList;
      }
      const response = yield call(callback, payload); // post
      yield put({
        type: 'queryList',
        payload: response,
      });
    },
  },

  reducers: {
    getOrderCodeReducer(state, action) {
      return {
        ...state,
        orderCode: action.payload,
      };
    },
    appendListReducer(state, action) {
      let newList = state.orderList;
      if (action.data && action.data.order_id) {
        newList = newList.concat([action.data]);
      }
      return {
        ...state,
        orderList: newList,
      };
    },
    queryListReducer(state, action) {
      return {
        ...state,
        orderList: action.payload,
      };
    },
  },
};
