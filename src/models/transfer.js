import { getTransfers, addTransfer, updateTransfer, delTransfer } from '@/services/api';

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
    *confirmTransferAction({ payload }, { call, put }) {
      return yield call(updateTransfer, Object.assign(payload, { transfer_type: 1 })); // post
    },
    *cancelConfirmTransferAction({ payload }, { call, put }) {
      return yield call(updateTransfer, Object.assign(payload, { transfer_type: 0 })); // post
    },
    *delTransferAction({ payload }, { call, put }) {
      return yield call(delTransfer, payload); // post
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