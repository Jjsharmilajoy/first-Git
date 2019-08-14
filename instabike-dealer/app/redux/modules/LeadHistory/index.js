import {
  GET_TEAM_MEMBERS_LOAD,
  GET_TEAM_MEMBERS_SUCCESS,
  GET_TEAM_MEMBERS_FAIL,
  GET_ALLVEHICLES_LOAD,
  GET_ALLVEHICLES_SUCCESS,
  GET_ALLVEHICLES_FAIL,
  UPDATE_LEADDETAIL_LOAD,
  UPDATE_LEADDETAIL_SUCCESS,
  UPDATE_LEADDETAIL_FAIL,
  CREATE_LEADDETAIL_LOAD,
  CREATE_LEADDETAIL_SUCCESS,
  CREATE_LEADDETAIL_FAIL,
  UPDATE_LEADDETAIL_STATUS_LOAD,
  UPDATE_LEADDETAIL_STATUS_SUCCESS,
  UPDATE_LEADDETAIL_STATUS_FAIL,
  DELETE_LEADDETAIL_LOAD,
  DELETE_LEADDETAIL_SUCCESS,
  DELETE_LEADDETAIL_FAIL,
  LOST_REASON_LOAD,
  LOST_REASON_SUCCESS,
  LOST_REASON_FAILURE,
  LEAD_FOLLOW_UP_LOAD,
  LEAD_FOLLOW_UP_SUCCESS,
  LEAD_FOLLOW_UP_FAILURE,
  UPDATE_LEAD_FOLLOW_LOAD,
  UPDATE_LEAD_FOLLOW_SUCCESS,
  UPDATE_LEAD_FOLLOW_FAILURE,
  ACTION_COMMENT_LOAD,
  ACTION_COMMENT_SUCCESS,
  ACTION_COMMENT_FAILURE,
  LEAD_ACTIVITIES_LOAD,
  LEAD_ACTIVITIES_SUCCESS,
  LEAD_ACTIVITIES_FAILURE,
  LEAD_LOST_LOAD,
  LEAD_LOST_SUCCESS,
  LEAD_LOST_FAILURE,
  CLEAR_LEAD_ACTIVITIES
} from '../../actions/LeadHistory/actionTypes';
import LoadingGroup from '../../../utils/LoadingGroup';

const initialState = {
  loading: false,
  loaded: false,
  error: false,
  teamMembers: [],
  leadDetail: [],
  vehicleList: [],
  lead: {},
  lostReasonResponse: [],
  leadActivitiesResponse: [],
  loader: new LoadingGroup(),
  loadingGroup: false
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case GET_TEAM_MEMBERS_LOAD:
      return {
        ...state,
        loadingGroup: state.loader.startFetch(),
        teamMembers: []
      };
    case GET_TEAM_MEMBERS_SUCCESS:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        teamMembers: action.response
      };
    case GET_TEAM_MEMBERS_FAIL:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        error: action.error,
        teamMembers: []
      };
    case UPDATE_LEADDETAIL_LOAD:
      return {
        ...state,
        loadingGroup: state.loader.startFetch(),
        leadDetail: []
      };
    case UPDATE_LEADDETAIL_SUCCESS:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        leadDetail: action.response
      };
    case UPDATE_LEADDETAIL_FAIL:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        error: action.error,
        leadDetail: []
      };
    case CREATE_LEADDETAIL_LOAD:
      return {
        ...state,
        loadingGroup: state.loader.startFetch(),
        leadDetail: []
      };
    case CREATE_LEADDETAIL_SUCCESS:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        leadDetail: action.response
      };
    case CREATE_LEADDETAIL_FAIL:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        error: action.error,
        leadDetail: []
      };
    case DELETE_LEADDETAIL_LOAD:
      return {
        ...state,
        loadingGroup: state.loader.startFetch(),
      };
    case DELETE_LEADDETAIL_SUCCESS:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
      };
    case DELETE_LEADDETAIL_FAIL:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        error: action.error
      };
    case GET_ALLVEHICLES_LOAD:
      return {
        ...state,
        loadingGroup: state.loader.startFetch(),
        vehicleList: []
      };
    case GET_ALLVEHICLES_SUCCESS:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        vehicleList: action.response
      };
    case GET_ALLVEHICLES_FAIL:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        error: action.error,
        vehicleList: []
      };
    case UPDATE_LEADDETAIL_STATUS_LOAD:
      return {
        ...state,
        loadingGroup: state.loader.startFetch(),
      };
    case UPDATE_LEADDETAIL_STATUS_SUCCESS:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        lead: action.response
      };
    case UPDATE_LEADDETAIL_STATUS_FAIL:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        error: action.error
      };
    case LOST_REASON_LOAD:
      return {
        ...state,
        loadingGroup: state.loader.startFetch(),
        lostReasonResponse: []
      };
    case LOST_REASON_SUCCESS:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        lostReasonResponse: action.response
      };
    case LOST_REASON_FAILURE:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        error: true,
        lostReasonResponse: []
      };
    case LEAD_FOLLOW_UP_LOAD:
      return {
        ...state,
        loadingGroup: state.loader.startFetch(),
        followUpResponse: {}
      };
    case LEAD_FOLLOW_UP_SUCCESS:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        lead: {
          ...state.lead,
          follow_up: [action.response]
        },
        followUpResponse: action.response
      };
    case LEAD_FOLLOW_UP_FAILURE:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        error: true,
        followUpResponse: {}
      };
    case UPDATE_LEAD_FOLLOW_LOAD:
      return {
        ...state,
        loadingGroup: state.loader.startFetch(),
        updateLeadFollowResponse: {}
      };
    case UPDATE_LEAD_FOLLOW_SUCCESS:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        lead: {
          ...state.lead,
          follow_up: [],
          next_followup_on: null
        },
        updateLeadFollowResponse: action.response
      };
    case UPDATE_LEAD_FOLLOW_FAILURE:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        error: true,
        updateLeadFollowResponse: {}
      };
    case ACTION_COMMENT_LOAD:
      return {
        ...state,
        loadingGroup: state.loader.startFetch(),
        actionCommentResponse: {}
      };
    case ACTION_COMMENT_SUCCESS:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        actionCommentResponse: action.response
      };
    case ACTION_COMMENT_FAILURE:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        error: true,
        actionCommentResponse: {}
      };
    case LEAD_ACTIVITIES_LOAD:
      return {
        ...state,
        loadingGroup: state.loader.startFetch(),
        leadActivitiesResponse: []
      };
    case LEAD_ACTIVITIES_SUCCESS:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        leadActivitiesResponse: action.response
      };
    case LEAD_ACTIVITIES_FAILURE:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        error: true,
        leadActivitiesResponse: []
      };
    case LEAD_LOST_LOAD:
      return {
        ...state,
        loadingGroup: state.loader.startFetch(),
      };
    case LEAD_LOST_SUCCESS:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
      };
    case LEAD_LOST_FAILURE:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        error: true
      };
    case CLEAR_LEAD_ACTIVITIES:
      return {
        ...state,
        leadActivitiesResponse: []
      };
    default:
      return state;
  }
}
