import { queryReceiverList } from '@/services/api';

export default {
  namespace: 'sender',

  state: {
    senderList: [],
  },

  effects: {
    *getSenderListAction({ payload }, { call, put }) {
      const response = yield call(queryReceiverList, payload);
      const list = response.sites;
      yield put({
        type: 'getSenderListReducer',
        payload: Array.isArray(list) ? list : [],
      });
    },
  },

  reducers: {
    getSenderListReducer(state, action) {
      return {
        ...state,
        receiverList: action.payload,
      };
    },
  },
};
