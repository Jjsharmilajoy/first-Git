import {
  GETLEADS_LOAD,
  GETLEADS_SUCCESS,
  GETLEADS_FAIL,
  GETEXECUTIVES_LOAD,
  GETEXECUTIVES_SUCCESS,
  GETEXECUTIVES_FAIL,
  GETCOUNT_LOAD,
  GETCOUNT_SUCCESS,
  GETCOUNT_FAIL,
  FILTERLEAD_LOAD,
  FILTERLEAD_SUCCESS,
  FILTERLEAD_FAIL,
  CLEAR_LEAD,
  CLEAR_SEARCH_TEXT
}
  from '../../actions/Leads/actionTypes';

import LoadingGroup from '../../../utils/LoadingGroup';

const initialState = {
  data: [],
  count: [],
  error: false,
  searchedLeads: {},
  leads: null,
  loadingGroup: false,
  loader: new LoadingGroup()
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case GETLEADS_LOAD:
      return {
        ...state,
        loadingGroup: state.loader.startFetch()
      };
    case GETLEADS_SUCCESS:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        leads: action.response
      };
    case GETLEADS_FAIL:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        error: true,
        leads: null
      };
    case GETEXECUTIVES_LOAD:
      return {
        ...state,
        loadingGroup: state.loader.startFetch(),
        // executives: []
      };
    case GETEXECUTIVES_SUCCESS:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        executives: [...action.response]
      };
    case GETEXECUTIVES_FAIL:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        error: true,
        executives: []
      };
    case GETCOUNT_LOAD:
      return {
        ...state,
        loadingGroup: state.loader.startFetch(),
        count: null
      };
    case GETCOUNT_SUCCESS:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        count: action.response
      };
    case GETCOUNT_FAIL:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        error: true,
        count: null
      };
    case FILTERLEAD_LOAD:
      return {
        ...state,
        loadingGroup: state.loader.startFetch(),
        searchLoading: true,
        searchLoaded: false,
        searchedLeads: {}
      };
    case FILTERLEAD_SUCCESS:
      return {
        ...state,
        searchLoading: false,
        searchLoaded: true,
        loadingGroup: state.loader.completeFetch(),
        searchedLeads: action.response ? action.response.leads : []
      };
    case FILTERLEAD_FAIL:
      return {
        ...state,
        searchLoading: false,
        searchLoaded: true,
        loadingGroup: state.loader.completeFetch(),
        searchedLeads: {}
      };
    case CLEAR_LEAD: {
      return {
        ...state,
        leads: null,
        searchedLeads: {}
      };
    }
    case CLEAR_SEARCH_TEXT: {
      return {
        ...state,
        searsearchLoading: false,
        searchLoaded: false,
      };
    }
    default:
      return state;
  }
}
