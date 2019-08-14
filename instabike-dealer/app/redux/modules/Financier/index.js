import {
  FINANCIER_INFO_LOAD,
  FINANCIER_INFO_SUCCESS,
  FINANCIER_INFO_FAIL,
  UPDATEFINANCIER_INFO_LOAD,
  UPDATEFINANCIER_INFO_SUCCESS,
  UPDATEFINANCIER_INFO_FAIL,
  UPDATEUSERINFO_INFO_LOAD,
  UPDATEUSERINFO_INFO_SUCCESS,
  UPDATEUSERINFO_INFO_FAIL
} from '../../actions/Financier/actionTypes';
import LoadingGroup from '../../../utils/LoadingGroup';

const initialState = {
  data: [],
  error: false,
  addedFinancierList: [],
  unaddedFinancierList: [],
  loadingGroup: false,
  loader: new LoadingGroup()
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case FINANCIER_INFO_LOAD:
      return {
        ...state,
        loadingGroup: state.loader.startFetch(),
        addedFinancierList: [],
        unaddedFinancierList: []
      };
    case FINANCIER_INFO_SUCCESS:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        addedFinancierList: action.response ? action.response.dealerFinanciers : [],
        unaddedFinancierList: action.response ? action.response.financiers : []
      };
    case FINANCIER_INFO_FAIL:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        error: true,
        addedFinancierList: [],
        unaddedFinancierList: []
      };
    case UPDATEFINANCIER_INFO_LOAD:
      return {
        ...state,
        loadingGroup: state.loader.startFetch(),
        addedFinancierList: [],
        unaddedFinancierList: []
      };
    case UPDATEFINANCIER_INFO_SUCCESS:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        addedFinancierList: action.response.dealerFinanciers,
        unaddedFinancierList: action.response.financiers
      };
    case UPDATEFINANCIER_INFO_FAIL:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        error: true,
        addedFinancierList: [],
        unaddedFinancierList: []
      };
    case UPDATEUSERINFO_INFO_LOAD:
      return {
        ...state,
        loadingGroup: state.loader.startFetch(),
        data: []
      };
    case UPDATEUSERINFO_INFO_SUCCESS:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        data: action.response
      };
    case UPDATEUSERINFO_INFO_FAIL:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        error: true,
        data: []
      };
    default:
      return state;
  }
}
