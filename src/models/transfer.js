import {
  getTransfers,
  getTransferStatistic,
  addTransfer,
  updateTransfer,
  updateTransferType,
  delTransfer,
} from '@/services/api';

export default {
  namespace: 'transfer',

  state: {
    transferList: [],
    total: 0,
    totalTransferAmount: 0,
    totalShouldTransfer: 0,
    totalTransferConfirmAmount: 0,
    totalTransferUnConfirmAmount: 0,
  },

  effects: {
    *getTransferAction({ payload }, { call, put }) {
      const response = yield call(getTransfers, payload);
      yield put({
        type: 'getTransfersReducer',
        payload: response,
      });
    },
    *getTransferStatisticAction({ payload }, { call, put }) {
      const response = yield call(getTransferStatistic, payload);
      yield put({
        type: 'getTransferStatisticReducer',
        payload: response,
      });
    },
    *confirmTransferAction({ payload }, { call, put }) {
      return yield call(updateTransferType, Object.assign(payload, { transfer: { transfer_type: 1 } })); // post
    },
    *cancelConfirmTransferAction({ payload }, { call, put }) {
      return yield call(updateTransferType, Object.assign(payload, { transfer: { transfer_type: 0 } })); // post
    },
    *delTransferAction({ payload }, { call, put }) {
      return yield call(delTransfer, payload); // post
    },
    *addTransferAction({ payload }, { call, put }) {
      return yield call(addTransfer, payload); // post
    },
    *updateTransferAction({ payload }, { call, put }) {
      return yield call(updateTransfer, payload); // post
    },
  },

  reducers: {
    getTransfersReducer(state, action) {
      return {
        ...state,
        transferList: action.payload.transfers,
        total: action.payload.total,
      };
    },
    getTransferStatisticReducer(state, action) {
      return {
        ...state,
        ...action.payload,
      };
    },
  },
};
