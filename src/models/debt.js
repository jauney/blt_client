import { getDebts, addDebt } from '@/services/api';

export default {
  namespace: 'debt',

  state: {
    debtList: [],
    debtTotal: 0,
    incomeTypes: [],
    incomeDetails: [],
  },

  effects: {
    *getDebtsAction({ payload }, { call, put }) {
      const response = yield call(getDebts, payload);
      yield put({
        type: 'getDebtsReducer',
        payload: response,
      });
    },
    *addDebtAction({ payload }, { call, put }) {
      return yield call(addDebt, payload); // post
    },
  },

  reducers: {
    getDebtsReducer(state, action) {
      return {
        ...state,
        debtList: action.payload.debts,
        debtTotal: action.payload.total,
      };
    },
  },
};
