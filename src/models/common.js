export default {
  namespace: 'common',

  state: {
    orderList: [],
    total: 0,
    totalOrderAmount: 0,
    totalTransAmount: 0,
    totalInsurancefee: 0,
    totalAdvancepayAmount: 0,
    totalDeliverAmount: 0,
  },

  effects: {
    *initOrderListAction({ payload }, { call, put }) {
      yield put({
        type: 'initOrderListReducer',
        payload: { orders: [], total: 0 },
      });
    },
  },

  reducers: {
    initOrderListReducer(state, action) {
      return {
        ...state,
        orderList: action.payload.orders,
        total: action.payload.total,
        totalOrderAmount: 0,
        totalTransAmount: 0,
        totalInsurancefee: 0,
        totalAdvancepayAmount: 0,
        totalDeliverAmount: 0,
      };
    },
  },
};
