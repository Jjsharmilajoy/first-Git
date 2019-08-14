import {
  GETVEHICLEACCESORIES_LOAD,
  GETVEHICLEACCESORIES_SUCCESS,
  GETVEHICLEACCESORIES_FAIL,
  SAVEVEHICLEACCESORIES_LOAD,
  SAVEVEHICLEACCESORIES_SUCCESS,
  SAVEVEHICLEACCESORIES_FAIL
} from '../../actions/VehicleAccessories/actionTypes';
import LoadingGroup from '../../../utils/LoadingGroup';

const initialState = {
  error: false,
  accessories: [],
  savedAccessories: [],
  loadingGroup: false,
  loader: new LoadingGroup()
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case GETVEHICLEACCESORIES_LOAD:
      return {
        ...state,
        loadingGroup: state.loader.startFetch(),
        accessories: []
      };
    case GETVEHICLEACCESORIES_SUCCESS:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        accessories: action.response
      };
    case GETVEHICLEACCESORIES_FAIL:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        error: true,
        accessories: []
      };
    case SAVEVEHICLEACCESORIES_LOAD:
      return {
        ...state,
        loadingGroup: state.loader.startFetch(),
        savedAccessories: []
      };
    case SAVEVEHICLEACCESORIES_SUCCESS:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        savedAccessories: action.response
      };
    case SAVEVEHICLEACCESORIES_FAIL:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        error: true,
        savedAccessories: []
      };
    default:
      return state;
  }
}
