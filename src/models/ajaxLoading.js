
export default {
  namespace: 'ajaxLoading',

  state: {
    isShowLoading: false
  },

  effects: {
    *showLoading ({ payload }, { call, put }) {
      yield put({
        type: 'setLoadingReducer',
        payload: { isShowLoading: true },
      });
    },
    *hideLoading ({ payload }, { call, put }) {
      yield put({
        type: 'setLoadingReducer',
        payload: { isShowLoading: false },
      });
    },
  },

  reducers: {
    setLoadingReducer (state, action) {
      return {
        ...state,
        isShowLoading: action.payload.isShowLoading
      };
    }
  },
};
