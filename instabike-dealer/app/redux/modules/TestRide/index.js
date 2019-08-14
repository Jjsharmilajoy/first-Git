import {
  GET_LEAD_LOAD,
  GET_LEAD_SUCESS,
  GET_LEAD_FAILURE,
  GET_TEST_RIDE_DATE,
  GET_TEST_RIDE_DATE_SUCCESS,
  GET_TEST_RIDE_DATE_FAILURE,
  GET_TEST_RIDE_SLOTS,
  GET_TEST_RIDE_SLOTS_SUCCESS,
  GET_TEST_RIDE_SLOTS_FAILURE,
  GET_TEST_RIDE_AVAILED_LEADS,
  GET_TEST_RIDE_AVAILED_LEADS_SUCCESS,
  GET_TEST_RIDE_AVAILED_LEADS_FAILURE,
  ADD_DOCUMENT_LOAD,
  ADD_DOCUMENT_SUCCESS,
  ADD_DOCUMENT_FAILURE,
  DELETE_DOCUMENT_LOAD,
  DELETE_DOCUMENT_SUCCESS,
  DELETE_DOCUMENT_FAILURE,
  UDPATE_DOCUMENT_LOAD,
  UPDATE_DOCUMENT_SUCCESS,
  UPDATE_DOCUMENT_FAILURE,
  GET_TEST_RIDE_COUNT_LOAD,
  GET_TEST_RIDE_COUNT_SUCCESS,
  GET_TEST_RIDE_COUNT_FAILURE,
  BOOK_TEST_RIDE_LOAD,
  BOOK_TEST_RIDE_SUCCESS,
  BOOK_TEST_RIDE_FAILURE,
  CLEAR_TEST_RIDE_SLOTS,
  MARK_ALL_VERIFIED_LOAD,
  MARK_ALL_VERIFIED_SUCCESS,
  MARK_ALL_VERIFIED_FAILURE
} from '../../actions/TestRide/actionTypes';
import LoadingGroup from '../../../utils/LoadingGroup';

const initialState = {
  loadingGroup: false,
  error: false,
  lead: {},
  testRideDates: {},
  count: {},
  testRideSlots: {},
  document: null,
  verifiedData: [],
  loader: new LoadingGroup()
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case GET_LEAD_LOAD:
      return {
        ...state,
        loadingGroup: state.loader.startFetch(),
        lead: {}
      };
    case GET_LEAD_SUCESS:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        lead: action.response
      };
    case GET_LEAD_FAILURE:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        error: true,
        lead: {}
      };
    case GET_TEST_RIDE_DATE:
      return {
        ...state,
        loadingGroup: state.loader.startFetch(),
        testRideDates: {}
      };
    case GET_TEST_RIDE_DATE_SUCCESS:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        testRideDates: action.response
      };
    case GET_TEST_RIDE_DATE_FAILURE:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        error: true,
        testRideDates: {}
      };
    case GET_TEST_RIDE_COUNT_LOAD:
      return {
        ...state,
        loadingGroup: state.loader.startFetch(),
        count: {}
      };
    case GET_TEST_RIDE_COUNT_SUCCESS:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        count: action.response
      };
    case GET_TEST_RIDE_COUNT_FAILURE:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        error: true,
        count: {}
      };
    case GET_TEST_RIDE_SLOTS:
      return {
        ...state,
        loadingGroup: state.loader.startFetch(),
        testRideSlots: {}
      };
    case GET_TEST_RIDE_SLOTS_SUCCESS:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        testRideSlots: action.response
      };
    case GET_TEST_RIDE_SLOTS_FAILURE:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        error: true,
        testRideSlots: {}
      };
    case GET_TEST_RIDE_AVAILED_LEADS:
      return {
        ...state,
        loadingGroup: state.loader.startFetch(),
        testRideAvailedLeads: []
      };
    case GET_TEST_RIDE_AVAILED_LEADS_SUCCESS:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        testRideAvailedLeads: action.response
      };
    case GET_TEST_RIDE_AVAILED_LEADS_FAILURE:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        error: true,
        testRideAvailedLeads: []
      };
    case ADD_DOCUMENT_LOAD:
      return {
        ...state,
        loadingGroup: state.loader.startFetch(),
        document: null
      };
    case ADD_DOCUMENT_SUCCESS:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        document: action.response
      };
    case ADD_DOCUMENT_FAILURE:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        error: true,
        document: null
      };
    case DELETE_DOCUMENT_LOAD:
      return {
        ...state,
        loadingGroup: state.loader.startFetch(),
      };
    case DELETE_DOCUMENT_SUCCESS:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
      };
    case DELETE_DOCUMENT_FAILURE:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        error: true
      };
    case UDPATE_DOCUMENT_LOAD:
      return {
        ...state,
        loadingGroup: state.loader.startFetch(),
        document: null
      };
    case UPDATE_DOCUMENT_SUCCESS:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        document: action.response
      };
    case UPDATE_DOCUMENT_FAILURE:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        error: true,
        document: null
      };
    case BOOK_TEST_RIDE_LOAD:
      return {
        ...state,
        loadingGroup: state.loader.startFetch(),
      };
    case BOOK_TEST_RIDE_SUCCESS:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
      };
    case BOOK_TEST_RIDE_FAILURE:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        error: true
      };
    case CLEAR_TEST_RIDE_SLOTS:
      return {
        ...state,
        testRideSlots: {}
      };
    case MARK_ALL_VERIFIED_LOAD:
      return {
        ...state,
        loadingGroup: state.loader.startFetch(),
        verifiedData: []
      };
    case MARK_ALL_VERIFIED_SUCCESS:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        verifiedData: action.response
      };
    case MARK_ALL_VERIFIED_FAILURE:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        error: true,
        verifiedData: []
      };
    default:
      return state;
  }
}
