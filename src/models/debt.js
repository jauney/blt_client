import { getDebts, getDebtTypes, addDebt } from '@/services/api';

export default {
  namespace: 'debt',

  state: {
    debtList: [],
    debtTotal: 0,
    debtTypes: [],
    debtTypesTotal: 0,
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
    *getDebtTypesAction({ payload }, { call, put }) {
      const response = yield call(getDebtTypes, {
        pageNo: 1,
        pageSize: 100,
        company_id: payload.company_id || 0,
        site_id: payload.site_id || 0,
      });
      yield put({
        type: 'getDebtTypesReducer',
        payload: response,
      });
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
    getDebtTypesReducer(state, action) {
      return {
        ...state,
        debtTypes: action.payload.debtTypes,
        debtTypesTotal: action.payload.total,
      };
    },
  },
};
