import { queryCompanyList, addCompany, updateCompany } from '@/services/api';
import { CacheSite, CacheUser, CacheCompany, CacheRole } from '../utils/storage';

export default {
  namespace: 'company',

  state: {
    // 分公司，company_type=2
    branchCompanyList: [],
    // 总公司，company_type=1
    companyList: [],
  },

  effects: {
    *getCompanyList({ payload }, { call, put }) {
      let companyType = 2;
      if (!payload || !payload.filter) {
        payload = { filter: { company_type: 2 } };
      } else {
        companyType = payload.filter.company_type;
      }
      const response = yield call(queryCompanyList, payload);
      const list = response.companys;
      console.log('########', response);
      const action = companyType === 2 ? 'queryBranchCompanyList' : 'queryCompanyList';
      yield put({
        type: action,
        payload: Array.isArray(list) ? list : [],
      });

      return list;
    },
    *getBranchCompanyList({ payload }, { call, put }) {
      let list = [payload];
      if (payload.company_type == 1) {
        payload = { filter: { company_type: 2 } };
        const response = yield call(queryCompanyList, payload);
        list = response.companys;
      }

      yield put({
        type: 'queryBranchCompanyList',
        payload: Array.isArray(list) ? list : [],
      });

      return list;
    },
    *addCompany({ payload }, { call, put }) {
      const response = yield call(addCompany, payload);

      yield put({
        type: 'addCompany',
        payload: response ? [response] : [],
      });
    },
  },

  reducers: {
    queryBranchCompanyList(state, action) {
      return {
        ...state,
        branchCompanyList: action.payload,
      };
    },
    queryCompanyList(state, action) {
      return {
        ...state,
        companyList: action.payload,
      };
    },
    addCompany(state, action) {
      return {
        ...state,
        getCustomerList: state.getCustomerList.concat(action.payload),
      };
    },
  },
};
