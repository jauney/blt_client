import { queryDriverList } from '@/services/api';

export default {
  namespace: 'driver',

  state: {
    driverList: [],
    total: 0,
  },

  effects: {
    *getDriverListAction({ payload }, { call, put }) {
      const response = yield call(queryDriverList, payload);
      const list = response.drivers;
      yield put({
        type: 'getDriverListReducer',
        payload: Array.isArray(list) ? list : [],
      });
    },
  },

  reducers: {
    getDriverListReducer(state, action) {
      return {
        ...state,
        driverList: action.payload,
      };
    },
  },
};
