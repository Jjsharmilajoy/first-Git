import {
  CREATEEXCHANGEVEHICLE_LOAD,
  CREATEEXCHANGEVEHICLE_SUCCESS,
  CREATEEXCHANGEVEHICLE_FAIL,
  GET_EXCHANGEVEHICLE_LOAD,
  GET_EXCHANGEVEHICLE_SUCCESS,
  GET_EXCHANGEVEHICLE_FAIL,
  UPDATE_EXCHANGEVEHICLE_LOAD,
  UPDATE_EXCHANGEVEHICLE_SUCCESS,
  UPDATE_EXCHANGEVEHICLE_FAIL,
  GET_MANUFACTURER_LIST_LOAD,
  GET_MANUFACTURER_LIST_SUCCESS,
  GET_MANUFACTURER_LIST_FAIL,
  GET_EXCHANGE_VEHICLE_LIST_LOAD,
  GET_EXCHANGE_VEHICLE_LIST_SUCCESS,
  GET_EXCHANGE_VEHICLE_LIST_FAIL,
  GET_EXCHANGE_VARIANT_LIST_LOAD,
  GET_EXCHANGE_VARIANT_LIST_SUCCESS,
  GET_EXCHANGE_VARIANT_LIST_FAIL,
  GET_EXCHANGE_PRICE_LOAD,
  GET_EXCHANGE_PRICE_SUCCESS,
  GET_EXCHANGE_PRICE_FAIL
} from '../../actions/FinanceOnboarding/actionTypes';
import LoadingGroup from '../../../utils/LoadingGroup';

const initialState = {
  loadingGroup: false,
  error: false,
  exchangeVehicle: {},
  manufacturerList: [],
  exchangeVehicleList: [],
  exchangePrice: {},
  loader: new LoadingGroup()
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case CREATEEXCHANGEVEHICLE_LOAD:
      return {
        ...state,
        loadingGroup: state.loader.startFetch(),
        exchangeVehicle: {}
      };
    case CREATEEXCHANGEVEHICLE_SUCCESS:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        exchangeVehicle: action.response
      };
    case CREATEEXCHANGEVEHICLE_FAIL:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        error: true,
        exchangeVehicle: {}
      };
    case GET_EXCHANGEVEHICLE_LOAD:
      return {
        ...state,
        loadingGroup: state.loader.startFetch(),
        exchangeVehicle: {}
      };
    case GET_EXCHANGEVEHICLE_SUCCESS:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        exchangeVehicle: action.response
      };
    case GET_EXCHANGEVEHICLE_FAIL:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        error: true,
        exchangeVehicle: {}
      };
    case UPDATE_EXCHANGEVEHICLE_LOAD:
      return {
        ...state,
        loadingGroup: state.loader.startFetch(),
        exchangeVehicle: {}
      };
    case UPDATE_EXCHANGEVEHICLE_SUCCESS:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        exchangeVehicle: action.response
      };
    case UPDATE_EXCHANGEVEHICLE_FAIL:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        error: true,
        exchangeVehicle: {}
      };
    case GET_MANUFACTURER_LIST_LOAD:
      return {
        ...state,
        loadingGroup: state.loader.startFetch(),
        manufacturerList: []
      };
    case GET_MANUFACTURER_LIST_SUCCESS:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        manufacturerList: action.response
      };
    case GET_MANUFACTURER_LIST_FAIL:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        error: true,
        manufacturerList: []
      };
    case GET_EXCHANGE_VEHICLE_LIST_LOAD:
      return {
        ...state,
        loadingGroup: state.loader.startFetch(),
        exchangeVehicleList: []
      };
    case GET_EXCHANGE_VEHICLE_LIST_SUCCESS:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        exchangeVehicleList: action.response
      };
    case GET_EXCHANGE_VEHICLE_LIST_FAIL:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        error: true,
        exchangeVehicleList: []
      };
    case GET_EXCHANGE_VARIANT_LIST_LOAD:
      return {
        ...state,
        loadingGroup: state.loader.startFetch(),
        exchangeVartiantList: []
      };
    case GET_EXCHANGE_VARIANT_LIST_SUCCESS:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        exchangeVartiantList: action.response
      };
    case GET_EXCHANGE_VARIANT_LIST_FAIL:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        error: true,
        exchangeVartiantList: []
      };
    case GET_EXCHANGE_PRICE_LOAD:
      return {
        ...state,
        loadingGroup: state.loader.startFetch(),
        exchangePrice: {}
      };
    case GET_EXCHANGE_PRICE_SUCCESS:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        exchangePrice: action.response
      };
    case GET_EXCHANGE_PRICE_FAIL:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        error: true,
        exchangePrice: {}
      };
    default:
      return state;
  }
}
