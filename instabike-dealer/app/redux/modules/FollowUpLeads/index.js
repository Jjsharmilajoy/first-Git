import {
  FOLLOW_UP_DONE_LOAD,
  FOLLOW_UP_DONE_SUCCESS,
  FOLLOW_UP_DONE_FAILURE,
  FOLLOW_UP_TODAY_LOAD,
  FOLLOW_UP_TODAY_SUCCESS,
  FOLLOW_UP_TODAY_FAILURE,
  FOLLOW_UP_ASSIGNEE_LOAD,
  FOLLOW_UP_ASSIGNEE_SUCCESS,
  FOLLOW_UP_ASSIGNEE_FAILURE,
  UPDATE_LEAD_LOAD,
  UPDATE_LEAD_SUCCESS,
  UPDATE_LEAD_FAIL,
  FOLLOW_COUNT_LOAD,
  FOLLOW_COUNT_SUCCESS,
  FOLLOW_COUNT_FAILURE
} from '../../actions/FollowUpLeads/actionTypes';

import LoadingGroup from '../../../utils/LoadingGroup';

const initialState = {
  error: false,
  followUpDoneResponse: {},
  followUpTodayResponse: {},
  assignees: [],
  updateResponse: {},
  followCount: {},
  loadingGroup: false,
  loader: new LoadingGroup()
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case FOLLOW_UP_DONE_LOAD:
      return {
        ...state,
        loadingGroup: state.loader.startFetch(),
        followUpDoneResponse: {}
      };
    case FOLLOW_UP_DONE_SUCCESS:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        followUpDoneResponse: action.response,
      };
    case FOLLOW_UP_DONE_FAILURE:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        error: true,
        followUpDoneResponse: {}
      };
    case FOLLOW_UP_TODAY_LOAD:
      return {
        ...state,
        loadingGroup: state.loader.startFetch(),
        followUpTodayResponse: {},
      };
    case FOLLOW_UP_TODAY_SUCCESS:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        followUpTodayResponse: action.response,
      };
    case FOLLOW_UP_TODAY_FAILURE:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        error: true,
        followUpTodayResponse: {},
      };
    case FOLLOW_UP_ASSIGNEE_LOAD:
      return {
        ...state,
        loadingGroup: state.loader.startFetch()
      };
    case FOLLOW_UP_ASSIGNEE_SUCCESS:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        assignees: action.response,
      };
    case FOLLOW_UP_ASSIGNEE_FAILURE:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        error: true,
        assignees: []
      };
    case UPDATE_LEAD_LOAD:
      return {
        ...state,
        loadingGroup: state.loader.startFetch(),
        updateResponse: {}
      };
    case UPDATE_LEAD_SUCCESS:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        updateResponse: action.response,
      };
    case UPDATE_LEAD_FAIL:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        error: true,
        updateResponse: {}
      };
    case FOLLOW_COUNT_LOAD:
      return {
        ...state,
        loadingGroup: state.loader.startFetch(),
        followCount: {}
      };
    case FOLLOW_COUNT_SUCCESS:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        followCount: action.response,
      };
    case FOLLOW_COUNT_FAILURE:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        error: true,
        followCount: {}
      };
    default:
      return state;
  }
}
