import {
  INVENTORY_INFO_LOAD,
  INVENTORY_INFO_SUCCESS,
  INVENTORY_INFO_FAIL,
  VARIANT_INFO_LOAD,
  VARIANT_INFO_SUCCESS,
  VARIANT_INFO_FAIL,
  VARIANTPRICE_INFO_LOAD,
  VARIANTPRICE_INFO_SUCCESS,
  VARIANTPRICE_INFO_FAIL,
  UPDATEVARIANTPRICE_INFO_LOAD,
  UPDATEVARIANTPRICE_INFO_SUCCESS,
  UPDATEVARIANTPRICE_INFO_FAIL,
  VARIANTSTOCK_INFO_LOAD,
  VARIANTSTOCK_INFO_SUCCESS,
  VARIANTSTOCK_INFO_FAIL,
  INCENTIVEOFFER_INFO_LOAD,
  INCENTIVEOFFER_INFO_SUCCESS,
  INCENTIVEOFFER_INFO_FAIL,
  UPDATE_INCENTIVEOFFER_INFO_LOAD,
  UPDATE_INCENTIVEOFFER_INFO_SUCCESS,
  UDPATE_INCENTIVEOFFER_INFO_FAIL,
  GETINSURANCEPRICE_INFO_LOAD,
  GETINSURANCEPRICE_INFO_SUCCESS,
  GETINSURANCEPRICE_INFO_FAIL,
  UPDATEINSURANCEPRICE_INFO_LOAD,
  UPDATEINSURANCEPRICE_INFO_SUCCESS,
  UPDATEINSURANCEPRICE_INFO_FAIL,
  CLEAR_VARIANT_DETAILS,
  CLEAR_INVENTORY_LIST } from '../../actions/Inventory/actionTypes';
import LoadingGroup from '../../../utils/LoadingGroup';

const initialState = {
  loadingGroup: false,
  error: false,
  inventoryList: [],
  variantList: [],
  variantPriceDetails: {},
  variantStockList: [],
  incentiveOfferDetails: {},
  currentVariantVehicleDetails: {},
  loader: new LoadingGroup()
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case INVENTORY_INFO_LOAD:
      return {
        ...state,
        loadingGroup: state.loader.startFetch(),
        inventoryList: []
      };
    case INVENTORY_INFO_SUCCESS:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        inventoryList: action.response
      };
    case INVENTORY_INFO_FAIL:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        error: true,
        inventoryList: []
      };
    case CLEAR_VARIANT_DETAILS:
      return {
        ...state,
        variantList: []
      };
    case CLEAR_INVENTORY_LIST:
      return {
        ...state,
        inventoryList: [],
        variantList: [],
        variantPriceDetails: {},
        variantStockList: [],
        incentiveOfferDetails: {},
        currentVariantVehicleDetails: {},
      };
    case VARIANT_INFO_LOAD:
      return {
        ...state,
        loadingGroup: state.loader.startFetch(),
        variantList: []
      };
    case VARIANT_INFO_SUCCESS:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        variantList: action.response
      };
    case VARIANT_INFO_FAIL:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        error: true,
        variantList: []
      };
    case VARIANTPRICE_INFO_LOAD:
      return {
        ...state,
        loadingGroup: state.loader.startFetch(),
        variantPriceDetails: {}
      };
    case VARIANTPRICE_INFO_SUCCESS:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        variantPriceDetails: action.response
      };
    case VARIANTPRICE_INFO_FAIL:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        error: true,
        variantPriceDetails: {}
      };
    case UPDATEVARIANTPRICE_INFO_LOAD:
      return {
        ...state,
        loadingGroup: state.loader.startFetch(),
        variantPriceDetails: {}
      };
    case UPDATEVARIANTPRICE_INFO_SUCCESS:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        variantPriceDetails: action.response
      };
    case UPDATEVARIANTPRICE_INFO_FAIL:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        error: true,
        variantPriceDetails: {}
      };
    case VARIANTSTOCK_INFO_LOAD:
      return {
        ...state,
        loadingGroup: state.loader.startFetch(),
        variantStockList: []
      };
    case VARIANTSTOCK_INFO_SUCCESS:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        variantStockList: action.response
      };
    case VARIANTSTOCK_INFO_FAIL:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        error: true,
        variantStockList: []
      };
    case INCENTIVEOFFER_INFO_LOAD:
      return {
        ...state,
        loadingGroup: state.loader.startFetch(),
        incentiveOfferDetails: {}
      };
    case INCENTIVEOFFER_INFO_SUCCESS:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        incentiveOfferDetails: action.response[0].dealer_vehicles[0]
      };
    case INCENTIVEOFFER_INFO_FAIL:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        error: true,
        incentiveOfferDetails: {}
      };
    case UPDATE_INCENTIVEOFFER_INFO_LOAD:
      return {
        ...state,
        loadingGroup: state.loader.startFetch(),
      };
    case UPDATE_INCENTIVEOFFER_INFO_SUCCESS:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
      };
    case UDPATE_INCENTIVEOFFER_INFO_FAIL:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        error: true
      };
    case GETINSURANCEPRICE_INFO_LOAD:
      return {
        ...state,
        loadingGroup: state.loader.startFetch(),
        insurancePriceDetails: [],
        isInsuranceSplit: true
      };
    case GETINSURANCEPRICE_INFO_SUCCESS:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        insurancePriceDetails: action.response.insurances,
        isInsuranceSplit: action.response.isInsuranceSplit
      };
    case GETINSURANCEPRICE_INFO_FAIL:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        error: true,
        insurancePriceDetails: [],
        isInsuranceSplit: true
      };
    case UPDATEINSURANCEPRICE_INFO_LOAD:
      return {
        ...state,
        loadingGroup: state.loader.startFetch(),
        insurancePriceDetails: []
      };
    case UPDATEINSURANCEPRICE_INFO_SUCCESS:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        insurancePriceDetails: action.response.insurances,
        isInsuranceSplit: action.response.isInsuranceSplit
      };
    case UPDATEINSURANCEPRICE_INFO_FAIL:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        error: true,
        insurancePriceDetails: []
      };
    default:
      return state;
  }
}
