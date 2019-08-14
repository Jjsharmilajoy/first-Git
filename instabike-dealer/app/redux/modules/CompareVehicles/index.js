import {
  VEHICLEDETAIL_SUCCESS,
  VEHICLEDETAIL_LOAD,
  VEHICLEDETAIL_FAIL,
  GETVEHICLES_LOAD,
  GETVEHICLES_SUCCESS,
  GETVEHICLES_FAIL,
  GETVEHICLES_PROPERTY_LOAD,
  GETVEHICLES_PROPERTY_SUCCESS,
  GETVEHICLES_PROPERTY_FAIL
} from '../../actions/CompareVehicles/actionTypes';
import LoadingGroup from '../../../utils/LoadingGroup';

const initialState = {
  error: false,
  vehicleDetail: {},
  vehiclePropertyList: [],
  loader: new LoadingGroup(),
  loadingGroup: false
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case VEHICLEDETAIL_LOAD:
      return {
        ...state,
        vehicleDetail: {},
        loadingGroup: state.loader.startFetch(),
      };
    case VEHICLEDETAIL_SUCCESS:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        vehicleDetail: action.response
      };
    case VEHICLEDETAIL_FAIL:
      return {
        ...state,
        vehicleDetail: {},
        loadingGroup: state.loader.completeFetch(),
        error: true
      };
    case GETVEHICLES_LOAD:
      return {
        ...state,
        loadingGroup: state.loader.startFetch(),
        vehicleData: []
      };
    case GETVEHICLES_SUCCESS:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        vehicleData: action.response
      };
    case GETVEHICLES_FAIL:
      return {
        ...state,
        vehicleData: [],
        loadingGroup: state.loader.completeFetch(),
        error: true
      };
    case GETVEHICLES_PROPERTY_LOAD:
      return {
        ...state,
        loadingGroup: state.loader.startFetch(),
      };
    case GETVEHICLES_PROPERTY_SUCCESS:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        vehiclePropertyList: action.response
      };
    case GETVEHICLES_PROPERTY_FAIL:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        error: true
      };
    default:
      return state;
  }
}
