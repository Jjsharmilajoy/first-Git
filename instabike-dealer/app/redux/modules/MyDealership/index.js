import {
  LOAD_PRODUCT_SUMMARY,
  LOAD_PRODUCT_SUMMARY_SUCCESS,
  LOAD_PRODUCT_SUMMARY_FAIL,
  LOAD_PRODUCTS,
  LOAD_PRODUCTS_SUCCESS,
  LOAD_PRODUCTS_FAIL,
  UPDATE_DEALERSHIP_LOAD,
  UPDATE_DEALERSHIP_SUCCESS,
  UPDATE_DEALERSHIP_FAIL,
  SEND_LEADREPORT_LOAD,
  SEND_LEADREPORT_SUCCESS,
  SEND_LEADREPORT_FAIL
} from '../../actions/MyDealership/actionTypes';
import LoadingGroup from '../../../utils/LoadingGroup';

const initialState = {
  productSummary: [],
  productList: [],
  loading: false,
  loaded: false,
  error: false,
  data: {},
  leadreportObj: {},
  loader: new LoadingGroup(),
  loadingGroup: false
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case LOAD_PRODUCT_SUMMARY:
      return {
        ...state,
        loadingGroup: state.loader.startFetch(),
        productSummary: []
      };
    case LOAD_PRODUCT_SUMMARY_SUCCESS:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        productSummary: action.response
      };
    case LOAD_PRODUCT_SUMMARY_FAIL:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        error: true,
        productSummary: []
      };
    case LOAD_PRODUCTS:
      return {
        ...state,
        loadingGroup: state.loader.startFetch(),
        productSummary: [],
        productList: [],
      };
    case LOAD_PRODUCTS_SUCCESS:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        productList: action.response,
        productSummary: action.response
      };
    case LOAD_PRODUCTS_FAIL:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        error: true,
        productSummary: [],
        productList: [],
      };
    case UPDATE_DEALERSHIP_LOAD:
      return {
        ...state,
        loadingGroup: state.loader.startFetch(),
        data: {}
      };
    case UPDATE_DEALERSHIP_SUCCESS:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        data: action.response
      };
    case UPDATE_DEALERSHIP_FAIL:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        error: true,
        data: {}
      };
    case SEND_LEADREPORT_LOAD:
      return {
        ...state,
        loadingGroup: state.loader.startFetch(),
        leadreportObj: {}
      };
    case SEND_LEADREPORT_SUCCESS:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        leadreportObj: action.response,
      };
    case SEND_LEADREPORT_FAIL:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        error: true,
        leadreportObj: {}
      };
    default:
      return state;
  }
}

