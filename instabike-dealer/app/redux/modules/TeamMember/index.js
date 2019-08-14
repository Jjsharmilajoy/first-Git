import {
  GET_TEAM_MEMBERS_LOAD,
  GET_TEAM_MEMBERS_SUCCESS,
  GET_TEAM_MEMBERS_FAILURE,
  CREATE_TEAM_MEMBER_LOAD,
  CREATE_TEAM_MEMBER_SUCCESS,
  CREATE_TEAM_MEMBER_FAILURE,
  CREATE_TEAM_HEAD_LOAD,
  CREATE_TEAM_HEAD_SUCCESS,
  CREATE_TEAM_HEAD_FAILURE,
  EDIT_TEAM_MEMBER_LOAD,
  EDIT_TEAM_MEMBER_SUCCESS,
  EDIT_TEAM_MEMBER_FAILURE,
  EDIT_TEAM_HEAD_LOAD,
  EDIT_TEAM_HEAD_SUCCESS,
  EDIT_TEAM_HEAD_FAILURE,
  SEND_CRENDENTIAL_LOAD,
  SEND_CRENDENTIAL_SUCCESS,
  SEND_CRENDENTIAL_FAILURE,
  RESEND_CRENDENTIAL_LOAD,
  RESEND_CRENDENTIAL_SUCCESS,
  RESEND_CRENDENTIAL_FAILURE,
  DIRECT_REPORTING_LOAD,
  DIRECT_REPORTING_SUCCESS,
  DIRECT_REPORTING_FAILURE,
  DELETE_TEAM_MEMBER_LOAD,
  DELETE_TEAM_MEMBER_SUCCESS,
  DELETE_TEAM_MEMBER_FAILURE
} from '../../actions/TeamMembers/actionTypes';
import LoadingGroup from '../../../utils/LoadingGroup';

const initialState = {
  error: false,
  directReportingMembers: [],
  loadingGroup: false,
  loader: new LoadingGroup()
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case GET_TEAM_MEMBERS_LOAD:
      return {
        ...state,
        loadingGroup: state.loader.startFetch(),
        users: []
      };
    case GET_TEAM_MEMBERS_SUCCESS:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        users: action.response
      };
    case GET_TEAM_MEMBERS_FAILURE:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        error: action.error,
        users: []
      };
    case CREATE_TEAM_MEMBER_LOAD:
      return {
        ...state,
        loadingGroup: state.loader.startFetch(),
        salesMember: []
      };
    case CREATE_TEAM_MEMBER_SUCCESS:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        salesMember: action.response
      };
    case CREATE_TEAM_MEMBER_FAILURE:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        error: action.error,
        salesMember: []
      };
    case CREATE_TEAM_HEAD_LOAD:
      return {
        ...state,
        loadingGroup: state.loader.startFetch(),
        salesLead: {}
      };
    case CREATE_TEAM_HEAD_SUCCESS:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        salesLead: action.response
      };
    case CREATE_TEAM_HEAD_FAILURE:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        error: action.error,
        salesLead: {}
      };
    case EDIT_TEAM_MEMBER_LOAD:
      return {
        ...state,
        loadingGroup: state.loader.startFetch(),
        editTeamMemberResponse: {}
      };
    case EDIT_TEAM_MEMBER_SUCCESS:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        editTeamMemberResponse: action.response
      };
    case EDIT_TEAM_MEMBER_FAILURE:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        error: action.error,
        editTeamMemberResponse: {}
      };
    case EDIT_TEAM_HEAD_LOAD:
      return {
        ...state,
        loadingGroup: state.loader.startFetch(),
        editTeamHeadResponse: {}
      };
    case EDIT_TEAM_HEAD_SUCCESS:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        editTeamHeadResponse: action.response
      };
    case EDIT_TEAM_HEAD_FAILURE:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        error: action.error,
        editTeamHeadResponse: {}
      };
    case SEND_CRENDENTIAL_LOAD:
      return {
        ...state,
        loadingGroup: state.loader.startFetch(),
        sendCredentialResponse: ''
      };
    case SEND_CRENDENTIAL_SUCCESS:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        sendCredentialResponse: action.response
      };
    case SEND_CRENDENTIAL_FAILURE:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        error: action.error,
        sendCredentialResponse: ''
      };
    case RESEND_CRENDENTIAL_LOAD:
      return {
        ...state,
        loadingGroup: state.loader.startFetch(),
        resendCredentialResponse: {}
      };
    case RESEND_CRENDENTIAL_SUCCESS:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        resendCredentialResponse: action.response
      };
    case RESEND_CRENDENTIAL_FAILURE:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        error: action.error,
        resendCredentialResponse: {}
      };
    case DIRECT_REPORTING_LOAD:
      return {
        ...state,
        loadingGroup: state.loader.startFetch(),
        directReportingMembers: []
      };
    case DIRECT_REPORTING_SUCCESS:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        directReportingMembers: action.response
      };
    case DIRECT_REPORTING_FAILURE:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        error: action.error,
        directReportingMembers: []
      };
    case DELETE_TEAM_MEMBER_LOAD:
      return {
        ...state,
        loadingGroup: state.loader.startFetch(),
        deleteTeamMember: {}
      };
    case DELETE_TEAM_MEMBER_SUCCESS:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        deleteTeamMember: action.response
      };
    case DELETE_TEAM_MEMBER_FAILURE:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        error: action.error,
        deleteTeamMember: {}
      };
    default:
      return state;
  }
}
