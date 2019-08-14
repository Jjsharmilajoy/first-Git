import {
  GET_FIANANCIERLIST_LOAD,
  GET_FIANANCIERLIST_SUCCESS,
  GET_FIANANCIERLIST_FAIL,
  GET_FIANANCIER_REP_LIST_LOAD,
  GET_FIANANCIER_REP_LIST_SUCCESS,
  GET_FIANANCIER_REP_LIST_FAIL,
  CREATE_FIANANCIER_LEAD_LOAD,
  CREATE_FIANANCIER_LEAD_SUCCESS,
  CREATE_FIANANCIER_LEAD_FAIL,
  GET_FINANCIER_LEAD_LOAD,
  GET_FINANCIER_LEAD_SUCCESS,
  GET_FINANCIER_LEAD_FAIL,
} from '../../actions/FinancierListing/actionTypes';
import LoadingGroup from '../../../utils/LoadingGroup';

const initialState = {
  loadingGroup: false,
  error: false,
  financierList: [],
  financierRepresentativeList: [],
  financierLead: {},
  loader: new LoadingGroup()
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case GET_FIANANCIERLIST_LOAD:
      return {
        ...state,
        loadingGroup: state.loader.startFetch(),
        financierList: []
      };
    case GET_FIANANCIERLIST_SUCCESS:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        financierList: action.response
      };
    case GET_FIANANCIERLIST_FAIL:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        error: true,
        financierList: []
      };
    case GET_FIANANCIER_REP_LIST_LOAD:
      return {
        ...state,
        loadingGroup: state.loader.startFetch(),
        financierRepresentativeList: []
      };
    case GET_FIANANCIER_REP_LIST_SUCCESS:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        financierRepresentativeList: action.response
      };
    case GET_FIANANCIER_REP_LIST_FAIL:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        error: true,
        financierRepresentativeList: []
      };
    case CREATE_FIANANCIER_LEAD_LOAD:
      return {
        ...state,
        loadingGroup: state.loader.startFetch(),
        financierLead: {}
      };
    case CREATE_FIANANCIER_LEAD_SUCCESS:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        financierLead: action.response
      };
    case CREATE_FIANANCIER_LEAD_FAIL:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        error: true,
        financierLead: {}
      };
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
    default:
      return state;
  }
}
