import {
  GET_FINANCIER_LEAD_LOAD,
  GET_FINANCIER_LEAD_SUCCESS,
  GET_FINANCIER_LEAD_FAIL,
  UPDATE_FINANCIER_LEAD_LOAD,
  UPDATE_FINANCIER_LEAD_SUCCESS,
  UPDATE_FINANCIER_LEAD_FAIL,
  SEND_OTP_LOAD,
  SEND_OTP_SUCCESS,
  SEND_OTP_FAIL,
  RESEND_OTP_LOAD,
  RESEND_OTP_SUCCESS,
  RESEND_OTP_FAIL,
  VERIFY_OTP_LOAD,
  VERIFY_OTP_SUCCESS,
  VERIFY_OTP_FAIL
} from '../../actions/DocumentUpload/actionTypes';
import LoadingGroup from '../../../utils/LoadingGroup';

const initialState = {
  loadingGroup: false,
  error: false,
  financierLead: {},
  sendOtpObj: {},
  resendOtpObj: {},
  verifyOtpObj: {},
  loader: new LoadingGroup()
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case GET_FINANCIER_LEAD_LOAD:
      return {
        ...state,
        loadingGroup: state.loader.startFetch(),
        financierLead: {}
      };
    case GET_FINANCIER_LEAD_SUCCESS:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        financierLead: action.response
      };
    case GET_FINANCIER_LEAD_FAIL:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        error: true,
        financierLead: {}
      };
    case UPDATE_FINANCIER_LEAD_LOAD:
      return {
        ...state,
        loadingGroup: state.loader.startFetch(),
        financierLead: {}
      };
    case UPDATE_FINANCIER_LEAD_SUCCESS:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        financierLead: action.response
      };
    case UPDATE_FINANCIER_LEAD_FAIL:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        error: true,
        financierLead: {}
      };
    case SEND_OTP_LOAD:
      return {
        ...state,
        loadingGroup: state.loader.startFetch(),
        sendOtpObj: {}
      };
    case SEND_OTP_SUCCESS:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        sendOtpObj: action.response
      };
    case SEND_OTP_FAIL:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        error: true,
        sendOtpObj: {}
      };
    case RESEND_OTP_LOAD:
      return {
        ...state,
        loadingGroup: state.loader.startFetch(),
        resendOtpObj: {}
      };
    case RESEND_OTP_SUCCESS:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        resendOtpObj: action.response
      };
    case RESEND_OTP_FAIL:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        error: true,
        resendOtpObj: {}
      };
    case VERIFY_OTP_LOAD:
      return {
        ...state,
        loadingGroup: state.loader.startFetch(),
        verifyOtpObj: {}
      };
    case VERIFY_OTP_SUCCESS:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        verifyOtpObj: action.response
      };
    case VERIFY_OTP_FAIL:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        error: true,
        verifyOtpObj: {}
      };
    default:
      return state;
  }
}
