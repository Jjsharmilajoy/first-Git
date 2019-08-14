import
{
  GETMANUFACTURERID_LOAD,
  GETMANUFACTURERID_SUCCESS,
  GETMANUFACTURERID_FAIL,
  GETVEHICLES_LOAD,
  GETVEHICLES_SUCCESS,
  GETVEHICLES_FAIL
}
  from '../../actions/filteredVehicles/actionTypes';
import LoadingGroup from '../../../utils/LoadingGroup';

const initialState = {
  error: false,
  manufacturer_id: '',
  vehicleList: [],
  loadingGroup: false,
  loader: new LoadingGroup()
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case GETMANUFACTURERID_LOAD:
      return {
        ...state,
        loadingGroup: state.loader.startFetch(),
        manufacturer_id: ''
      };
    case GETMANUFACTURERID_SUCCESS:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        manufacturer_id: action.response.manufacturer_id
      };
    case GETMANUFACTURERID_FAIL:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        error: true,
        manufacturer_id: ''
      };
    case GETVEHICLES_LOAD:
      return {
        ...state,
        loadingGroup: state.loader.startFetch(),
        vehicleList: []
      };
    case GETVEHICLES_SUCCESS:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        vehicleList: action.response
      };
    case GETVEHICLES_FAIL:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        error: true,
        vehicleList: []
      };
    default:
      return state;
  }
}
