import {
  GETMANUFACTURERID_LOAD,
  GETMANUFACTURERID_SUCCESS,
  GETMANUFACTURERID_FAIL,
  GETVEHICLES_LOAD,
  GETVEHICLES_SUCCESS,
  GETVEHICLES_FAIL,
  UPDATE_VEHICLEPREFERED_LOAD,
  UPDATE_VEHICLEPREFERED_SUCCESS,
  UPDATE_VEHICLEPREFERED_FAIL
}
  from '../../actions/GetVehicles/actionTypes';
import LoadingGroup from '../../../utils/LoadingGroup';

const initialState = {
  error: false,
  manufacturer_id: '',
  vehicleData: [],
  loadingGroup: false,
  loader: new LoadingGroup()
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case GETMANUFACTURERID_LOAD:
      return {
        ...state,
        loadingGroup: state.loader.startFetch(),
        manufacturer_id: '',
        accessories: []
      };
    case GETMANUFACTURERID_SUCCESS:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        accessories: action.response,
        manufacturer_id: action.response.manufacturer_id
      };
    case GETMANUFACTURERID_FAIL:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        error: true,
        accessories: [],
        manufacturer_id: ''
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
    case UPDATE_VEHICLEPREFERED_LOAD:
      return {
        ...state,
        loadingGroup: state.loader.startFetch(),
      };
    case UPDATE_VEHICLEPREFERED_SUCCESS:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
      };
    case UPDATE_VEHICLEPREFERED_FAIL:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        error: true
      };

    default:
      return state;
  }
}
