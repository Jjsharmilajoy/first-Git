import {
  ON_SIDENAV_TOGGLE,
  HANDLE_SIDENAV,
  GETLEAD_LOAD,
  GETLEAD_SUCCESS,
  GETLEAD_FAIL,
  CLEAR_CURRENT_LEAD,
  SETLEAD,
  CLEAR_TOAST_MESSAGE,
  CALL_TOAST_MESSAGE,
  CREATE_LEAD_LOAD,
  CREATE_LEAD_SUCCESS,
  CREATE_LEAD_FAIL,
  UPDATE_LEAD_LOAD,
  UPDATE_LEAD_SUCCESS,
  UPDATE_LEAD_FAIL,
  UPDATE_LEAD_DETAIL_LOAD,
  UPDATE_LEAD_DETAIL_SUCCESS,
  UPDATE_LEAD_DETAIL_FAIL,
  UPDATE_CLICKED_POSITION,
  CHECKNETSTATUS,
  SAVE_ERROR_LOAD,
  SAVE_ERROR_SUCCESS,
  SAVE_ERROR_FAIL,
  ENABLE_BUTTON,
  DISABLE_BUTTON
} from '../../actions/Global/actionTypes';
import LoadingGroup from '../../../utils/LoadingGroup';
import store from '../../../../index.js';
import constants from '../../../utils/constants';

const initialState = {
  isSideNavOpen: true,
  clickedPosition: 1,
  toastMessage: null,
  lead: {},
  connection: false,
  errorSaved: {},
  loader: new LoadingGroup(),
  loadingGroup: false
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case CREATE_LEAD_LOAD:
      return {
        ...state,
        loadingGroup: state.loader.startFetch(),
        lead: {},
        mobileNumber: ''
      };
    case CREATE_LEAD_SUCCESS:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        lead: action.response,
        mobileNumber: action.response.mobile_number,
        email: action.response.email,
        pincode: action.response.pincode,
        source_of_enquiry: action.response.source_of_enquiry
      };
    case CREATE_LEAD_FAIL:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        error: true,
        lead: {},
        mobileNumber: '',
        email: '',
        pincode: ''
      };
    case UPDATE_LEAD_LOAD:
      return {
        ...state,
        loadingGroup: state.loader.startFetch()
        // lead: {},
        // mobileNumber: ''
      };
    case UPDATE_LEAD_SUCCESS:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        lead: action.response,
        mobileNumber: action.response.mobile_number,
        name: action.response.name,
        gender: action.response.gender,
        email: action.response.email,
        pincode: action.response.pincode,
        source_of_enquiry: action.response.source_of_enquiry
      };
    case UPDATE_LEAD_FAIL:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        error: true
        // lead: {},
        // mobileNumber: ''
      };
    case GETLEAD_LOAD:
      return {
        ...state,
        loadingGroup: state.loader.startFetch(),
        mobileNumber: '',
        name: '',
        gender: '',
        email: '',
        pincode: '',
        source_of_enquiry: ''
      };
    case GETLEAD_SUCCESS:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        lead: action.response,
        mobileNumber: action.response.mobile_number,
        name: action.response.name,
        gender: action.response.gender,
        email: action.response.email,
        pincode: action.response.pincode,
        source_of_enquiry: action.response.source_of_enquiry
      };
    case GETLEAD_FAIL:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        error: true,
        mobileNumber: '',
        name: '',
        gender: '',
        email: '',
        pincode: '',
        source_of_enquiry: ''
      };
    case ON_SIDENAV_TOGGLE:
      return {
        ...state,
        isSideNavOpen: !state.isSideNavOpen
      };
    case HANDLE_SIDENAV:
      return {
        ...state,
        isSideNavOpen: action.isSideNavOpen
      };
    case SETLEAD:
      return {
        ...state,
        lead: action.lead
      };
    case CLEAR_CURRENT_LEAD:
      return {
        ...state,
        lead: {}
      };
    case CLEAR_TOAST_MESSAGE: {
      return {
        ...state,
        toastMessage: null
      };
    }
    case CALL_TOAST_MESSAGE: {
      return {
        ...state,
        toastMessage: action.message
      };
    }
    case UPDATE_LEAD_DETAIL_LOAD:
      return {
        ...state,
        loadingGroup: state.loader.startFetch(),
        lead: {},
        mobileNumber: '',
        name: '',
        gender: '',
        email: '',
        pincode: '',
        source_of_enquiry: ''
      };
    case UPDATE_LEAD_DETAIL_SUCCESS:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        lead: action.response,
        mobileNumber: action.response.mobile_number,
        name: action.response.name,
        gender: action.response.gender,
        email: action.response.email,
        pincode: action.response.pincode,
        source_of_enquiry: action.response.source_of_enquiry
      };
    case UPDATE_LEAD_DETAIL_FAIL:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        error: true,
        lead: {},
        mobileNumber: '',
        name: '',
        gender: '',
        email: '',
        pincode: '',
        source_of_enquiry: ''
      };
    case UPDATE_CLICKED_POSITION:
      return {
        ...state,
        clickedPosition: action.position
      };
    case CHECKNETSTATUS:
      return {
        ...state,
        connection: action.status
      };
    case SAVE_ERROR_LOAD:
      return {
        ...state,
        loadingGroup: state.loader.startFetch(),
        errorSaved: {}
      };
    case SAVE_ERROR_SUCCESS:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        errorSaved: action.response
      };
    case SAVE_ERROR_FAIL:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        error: true,
        errorSaved: {}
      };
    case DISABLE_BUTTON:
      setTimeout(() => ((
        store.dispatch({ type: ENABLE_BUTTON })
      )), action.timeOutDuration || constants.buttonDisabledDuration);
      return {
        ...state,
        buttonState: true
      };
    case ENABLE_BUTTON:
      return {
        ...state,
        buttonState: false
      };
    default:
      return state;
  }
}
