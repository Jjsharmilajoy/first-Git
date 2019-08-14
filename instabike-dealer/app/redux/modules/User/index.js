import {
  USER_LOAD,
  CLEAR_USER,
  MANUFACTURER_LOAD,
  MANUFACTURER_LOAD_SUCCESS,
  MANUFACTURER_LOAD_FAIL,
  LOGOUT_LOAD,
  LOGOUT_FAIL,
  SESSION_EXPIRED,
  RESET_SESSION
} from '../../actions/User/actionTypes';
import LoadingGroup from '../../../utils/LoadingGroup';

const initialState = {
  currentUser: {},
  loading: false,
  error: false,
  isSessionExpired: false,
  manufacturer: null,
  loader: new LoadingGroup(),
  loadingGroup: false
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case USER_LOAD:
      return {
        ...state,
        currentUser: action.user
      };
    case CLEAR_USER: {
      return {
        ...state,
        currentUser: {}
      };
    }
    case MANUFACTURER_LOAD: {
      return {
        ...state,
        loadingGroup: state.loader.startFetch(),
        manufacturer: {}
      };
    }
    case MANUFACTURER_LOAD_SUCCESS: {
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        manufacturer: action.response
      };
    }
    case MANUFACTURER_LOAD_FAIL: {
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        manufacturer: {}
      };
    }
    case LOGOUT_LOAD: {
      return {
        ...state,
        loadingGroup: state.loader.startFetch(),
      };
    }
    case LOGOUT_FAIL: {
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
      };
    }
    case SESSION_EXPIRED:
      return {
        ...state,
        isSessionExpired: true,
        error: true
      };
    case RESET_SESSION:
      return {
        ...state,
        isSessionExpired: false,
        error: false
      };
    default:
      return state;
  }
}
