import {
  LEAD_MONTHLY_SUMMARY_LOAD,
  LEAD_MONTHLY_SUMMARY_SUCCESS,
  LEAD_MONTHLY_SUMMARY_FAIL,
  TEAM_PERFORMANCE_LOAD,
  TEAM_PERFORMANCE_SUCCESS,
  TEAM_PERFORMANCE_FAIL
} from '../../actions/HomeDashBoard/actionTypes.js';
import LoadingGroup from '../../../utils/LoadingGroup';

const defaultLeadsSummaryCount = {
  followup: 0,
  followupDone: 0,
  newLeads: 0,
  invoicedLeads: 0
};
const initialState = {
  leadsSummaryCount: null,
  teamPerformance: null,
  loading: false,
  loader: new LoadingGroup(),
  loadingGroup: false
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case LEAD_MONTHLY_SUMMARY_LOAD:
      return {
        ...state,
        loadingGroup: state.loader.startFetch(),
        leadsSummaryCount: defaultLeadsSummaryCount
      };
    case LEAD_MONTHLY_SUMMARY_SUCCESS:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        leadsSummaryCount: action.response
      };
    case LEAD_MONTHLY_SUMMARY_FAIL:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        leadsSummaryCount: defaultLeadsSummaryCount
      };
    case TEAM_PERFORMANCE_LOAD: {
      return {
        ...state,
        loadingGroup: state.loader.startFetch(),
        teamPerformance: null
      };
    }
    case TEAM_PERFORMANCE_SUCCESS: {
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        teamPerformance: action.response
      };
    }
    case TEAM_PERFORMANCE_FAIL: {
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        teamPerformance: null
      };
    }
    default:
      return state;
  }
}
