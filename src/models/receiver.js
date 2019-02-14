import { queryReceiverList } from '@/services/api';

export default {
  namespace: 'receiver',

  state: {
    receiverList: [],
  },

  effects: {
    *getReceiverListAction({ payload }, { call, put }) {
      const response = yield call(queryReceiverList, payload);
      const list = response.couriers;
      yield put({
        type: 'getReceiverListReducer',
        payload: Array.isArray(list) ? list : [],
      });
    },
  },

  reducers: {
    getReceiverListReducer(state, action) {
      return {
        ...state,
        receiverList: action.payload,
      };
    },
  },
};
