import {
  LOGIN_LOAD,
  LOGIN_SUCCESS,
  LOGIN_FAIL,
  RESET_PASSWORD_LOAD,
  RESET_PASSWORD_SUCCESS,
  RESET_PASSWORD_FAIL,
  UPDATE_PASSWORD_LOAD,
  UPDATE_PASSWORD_SUCCESS,
  UPDATE_PASSWORD_FAIL
} from '../../actions/Login/actionTypes';
import LoadingGroup from '../../../utils/LoadingGroup';

const initialState = {
  error: false,
  token: '',
  user: {},
  documentToken: '',
  newAuthToken: '',
  loadingGroup: false,
  loader: new LoadingGroup()
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case LOGIN_LOAD:
      return {
        ...state,
        loadingGroup: state.loader.startFetch(),
        token: '',
        user: {},
        documentToken: ''
      };
    case LOGIN_SUCCESS:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        token: action.response && action.response.accessToken
        && action.response.accessToken.id && action.response.accessToken.id.length > 0
          ? action.response.accessToken.id : '',
        user: action.response.user,
        documentToken: action.response.documentToken.id
      };
    case LOGIN_FAIL:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        error: action.error,
        token: '',
        user: {},
        documentToken: ''
      };
    case RESET_PASSWORD_LOAD:
      return {
        ...state,
        loadingGroup: state.loader.startFetch(),
        newAuthToken: ''
      };
    case RESET_PASSWORD_SUCCESS:
      return {
        ...state,
        newAuthToken: action.response.accessToken.id,
        documentToken: action.response.documentToken.id,
        loadingGroup: state.loader.completeFetch(),
        user: action.response.user
      };
    case RESET_PASSWORD_FAIL:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        error: action.error,
        newAuthToken: ''
      };
    case UPDATE_PASSWORD_LOAD:
      return {
        ...state,
        loadingGroup: state.loader.startFetch(),
        newAuthToken: ''
      };
    case UPDATE_PASSWORD_SUCCESS:
      return {
        ...state,
        newAuthToken: action.response.accessToken.id,
        loadingGroup: state.loader.completeFetch(),
      };
    case UPDATE_PASSWORD_FAIL:
      return {
        ...state,
        error: action.error,
        loadingGroup: state.loader.completeFetch(),
        newAuthToken: ''
      };
    default:
      return state;
  }
}
