import { getTransfers, addTransfer, confirmTransfer } from '@/services/api';

export default {
  namespace: 'transfer',

  state: {
    transferList: [],
    transferTotal: 0,
  },

  effects: {
    *getTransfersAction({ payload }, { call, put }) {
      const response = yield call(getTransfers, payload);
      yield put({
        type: 'getTransfersReducer',
        payload: response,
      });
    },
    *addTransferAction({ payload }, { call, put }) {
      return yield call(addTransfer, payload); // post
    },
  },

  reducers: {
    getTransfersReducer(state, action) {
      return {
        ...state,
        transferList: action.payload.transfers,
        transferTotal: action.payload.total,
      };
    },
  },
};
