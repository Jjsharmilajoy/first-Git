import {
  CREATE_OFFER,
  CREATE_OFFER_SUCCESS,
  CREATE_OFFER_FAILURE,
  DELETE_OFFER,
  DELETE_OFFER_SUCCESS,
  DELETE_OFFER_FAILURE,
  PROFORMA_ACCESSORIES,
  PROFORMA_ACCESSORIES_SUCCESS,
  PROFORMA_ACCESSORIES_FAILURE,
  PROFORMA_COLOR,
  PROFORMA_COLOR_SUCCESS,
  PROFORMA_COLOR_FAILURE,
  GET_INVOICE,
  GET_INVOICE_SUCCESS,
  GET_INVOICE_FAILURE,
  GET_VEHICLE_DETAILS,
  GET_VEHICLE_DETAILS_SUCCESS,
  GET_VEHICLE_DETAILS_FAILURE,
  CREATE_OTHERCHARGES,
  CREATE_OTHERCHARGES_SUCCESS,
  CREATE_OTHERCHARGES_FAILURE,
  DELETE_OTHERCHARGES,
  DELETE_OTHERCHARGES_SUCCESS,
  DELETE_OTHERCHARGES_FAILURE,
  SEND_EMAIL,
  SEND_EMAIL_SUCCESS,
  SEND_EMAIL_FAILURE,
  SEND_SMS,
  SEND_SMS_SUCCESS,
  SEND_SMS_FAILURE,
  GET_USER,
  GET_USER_SUCCESS,
  GET_USER_FAILURE
} from '../../actions/PriceBreakdown/actionTypes';
import LoadingGroup from '../../../utils/LoadingGroup';

const initialState = {
  loader: new LoadingGroup(),
  loadingGroup: false,
  error: false,
  createOfferResponse: {},
  deleteOfferResponse: {},
  accessoriesResponse: {},
  updateResponse: {},
  proformaResponse: {},
  vehicleResponse: {},
  createOtherChargeResponse: {},
  deleteOtherChargeResponse: {},
  sendEmailResponse: null,
  sendSmsResponse: null,
  userObjResponse: {}
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case CREATE_OFFER:
      return {
        ...state,
        loadingGroup: state.loader.startFetch(),
        createOfferResponse: {}
      };
    case CREATE_OFFER_SUCCESS:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        createOfferResponse: action.response
      };
    case CREATE_OFFER_FAILURE:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        error: action.error,
        createOfferResponse: {}
      };
    case DELETE_OFFER:
      return {
        ...state,
        loadingGroup: state.loader.startFetch(),
        deleteOfferResponse: {}
      };
    case DELETE_OFFER_SUCCESS:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        deleteOfferResponse: action.response
      };
    case DELETE_OFFER_FAILURE:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        error: action.error,
        deleteOfferResponse: {}
      };
    case PROFORMA_ACCESSORIES:
      return {
        ...state,
        loadingGroup: state.loader.startFetch(),
        accessoriesResponse: {}
      };
    case PROFORMA_ACCESSORIES_SUCCESS:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        accessoriesResponse: action.response
      };
    case PROFORMA_ACCESSORIES_FAILURE:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        error: action.error,
        accessoriesResponse: {}
      };
    case PROFORMA_COLOR:
      return {
        ...state,
        loadingGroup: state.loader.startFetch(),
        updateResponse: {}
      };
    case PROFORMA_COLOR_SUCCESS:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        updateResponse: action.response
      };
    case PROFORMA_COLOR_FAILURE:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        error: action.error,
        updateResponse: {}
      };
    case GET_INVOICE:
      return {
        ...state,
        loadingGroup: state.loader.startFetch(),
        proformaResponse: {}
      };
    case GET_INVOICE_SUCCESS:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        proformaResponse: { ...action.response }
      };
    case GET_INVOICE_FAILURE:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        error: action.error,
        proformaResponse: {}
      };
    case GET_VEHICLE_DETAILS:
      return {
        ...state,
        loadingGroup: state.loader.startFetch(),
        vehicleResponse: {}
      };
    case GET_VEHICLE_DETAILS_SUCCESS:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        vehicleResponse: action.response
      };
    case GET_VEHICLE_DETAILS_FAILURE:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        error: action.error,
        vehicleResponse: {}
      };
    case CREATE_OTHERCHARGES:
      return {
        ...state,
        loadingGroup: state.loader.startFetch(),
        createOtherChargeResponse: {}
      };
    case CREATE_OTHERCHARGES_SUCCESS:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        createOtherChargeResponse: action.response
      };
    case CREATE_OTHERCHARGES_FAILURE:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        error: action.error,
        createOtherChargeResponse: {}
      };
    case DELETE_OTHERCHARGES:
      return {
        ...state,
        loadingGroup: state.loader.startFetch(),
        deleteOtherChargeResponse: {}
      };
    case DELETE_OTHERCHARGES_SUCCESS:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        deleteOtherChargeResponse: action.response
      };
    case DELETE_OTHERCHARGES_FAILURE:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        error: action.error,
        deleteOtherChargeResponse: {}
      };
    case SEND_EMAIL:
      return {
        ...state,
        loadingGroup: state.loader.startFetch(),
        sendEmailResponse: {}
      };
    case SEND_EMAIL_SUCCESS:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        sendEmailResponse: action.response
      };
    case SEND_EMAIL_FAILURE:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        error: action.error,
        sendEmailResponse: {}
      };
    case SEND_SMS:
      return {
        ...state,
        loadingGroup: state.loader.startFetch(),
        sendSmsResponse: {}
      };
    case SEND_SMS_SUCCESS:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        sendSmsResponse: action.response
      };
    case SEND_SMS_FAILURE:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        error: action.error,
        sendSmsResponse: {}
      };
    case GET_USER:
      return {
        ...state,
        loadingGroup: state.loader.startFetch(),
        userObjResponse: {}
      };
    case GET_USER_SUCCESS:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        userObjResponse: action.response
      };
    case GET_USER_FAILURE:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        error: action.error,
        userObjResponse: {}
      };
    default:
      return state;
  }
}
