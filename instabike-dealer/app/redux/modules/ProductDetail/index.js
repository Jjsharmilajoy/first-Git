import {
  VEHICLEOVERVIEW_LOAD,
  VEHICLEOVERVIEW_SUCCESS,
  VEHICLEOVERVIEW_FAIL,
  IMAGE360_LOAD,
  IMAGE360_SUCCESS,
  IMAGE360_FAIL,
  LEADDETAILUPDATE_LOAD,
  LEADDETAILUPDATE_SUCCESS,
  LEADDETAILUPDATE_FAIL,
  CREATELEADDETAIL_LOAD,
  CREATELEADDETAIL_SUCCESS,
  CREATELEADDETAIL_FAIL,
  PERSIST_VEHICLE_DETAILS
} from '../../actions/ProductDetail/actionTypes';
import LoadingGroup from '../../../utils/LoadingGroup';

const initialState = {
  loadingGroup: false,
  error: false,
  productDetail: {},
  images360Array: [],
  leadDetailObj: {},
  vehicleDetails: {},
  loader: new LoadingGroup()
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case PERSIST_VEHICLE_DETAILS: {
      return {
        ...state,
        vehicleDetails: action.vehicleDetails
      };
    }
    case VEHICLEOVERVIEW_LOAD:
      return {
        ...state,
        productDetail: {},
        loadingGroup: state.loader.startFetch(),
      };
    case VEHICLEOVERVIEW_SUCCESS:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        productDetail: action.response
      };
    case VEHICLEOVERVIEW_FAIL:
      return {
        ...state,
        productDetail: {},
        loadingGroup: state.loader.completeFetch(),
        error: action.error
      };
    case IMAGE360_LOAD:
      return {
        ...state,
        loadingGroup: state.loader.startFetch(),
        images360Array: []
      };
    case IMAGE360_SUCCESS:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        images360Array: action.response
      };
    case IMAGE360_FAIL:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        error: action.error,
        images360Array: []
      };
    case CREATELEADDETAIL_LOAD:
      return {
        ...state,
        loadingGroup: state.loader.startFetch(),
        leadDetailObj: {}
      };
    case CREATELEADDETAIL_SUCCESS:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        leadDetailObj: action.response
      };
    case CREATELEADDETAIL_FAIL:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        error: action.error,
        leadDetailObj: {}
      };
    case LEADDETAILUPDATE_LOAD:
      return {
        ...state,
        loadingGroup: state.loader.startFetch(),
        leadDetailObj: {}
      };
    case LEADDETAILUPDATE_SUCCESS:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        leadDetailObj: action.response
      };
    case LEADDETAILUPDATE_FAIL:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        error: action.error,
        leadDetailObj: {}
      };
    default:
      return state;
  }
}
