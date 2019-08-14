import {
  LEADOVERVIEW_LOAD,
  LEADOVERVIEW_SUCCESS,
  LEADOVERVIEW_FAIL,
  LEADASSIGN_LOAD,
  LEADASSIGN_SUCCESS,
  LEADASSIGN_FAIL,
  UPDATE_LEAD_LOAD,
  UPDATE_LEAD_SUCCESS,
  UPDATE_LEAD_FAIL,
  GET_LEADCOUNT_LOAD,
  GET_LEADCOUNT_SUCCESS,
  GET_LEADCOUNT_FAIL
} from '../../actions/NewLeadOverView/actionTypes';
import LoadingGroup from '../../../utils/LoadingGroup';

const initialState = {
  error: false,
  leadCreatedList: {},
  assignedToList: [],
  leadCountDetails: {},
  loader: new LoadingGroup(),
  loadingGroup: false
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case LEADOVERVIEW_LOAD:
      return {
        ...state,
        loadingGroup: state.loader.startFetch(),
        leadCreatedList: {}
      };
    case LEADOVERVIEW_SUCCESS:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        leadCreatedList: action.response
      };
    case LEADOVERVIEW_FAIL:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        error: true,
        leadCreatedList: {}
      };
    case LEADASSIGN_LOAD:
      return {
        ...state,
        loadingGroup: state.loader.startFetch(),
        assignedToList: []
      };
    case LEADASSIGN_SUCCESS:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        assignedToList: action.response
      };
    case LEADASSIGN_FAIL:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        error: true,
        assignedToList: []
      };
    case UPDATE_LEAD_LOAD:
      return {
        ...state,
        loadingGroup: state.loader.startFetch(),
      };
    case UPDATE_LEAD_SUCCESS:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
      };
    case UPDATE_LEAD_FAIL:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        error: true
      };
    case GET_LEADCOUNT_LOAD:
      return {
        ...state,
        loadingGroup: state.loader.startFetch(),
        leadCountDetails: {}
      };
    case GET_LEADCOUNT_SUCCESS:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        leadCountDetails: action.response,
      };
    case GET_LEADCOUNT_FAIL:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        error: true,
        leadCountDetails: {}
      };
    default:
      return state;
  }
}
