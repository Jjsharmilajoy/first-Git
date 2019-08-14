import moment from 'moment';
import {
  TARGET_DETAILS_LOAD,
  TARGET_DETAILS_SUCCESS,
  TARGET_DETAILS_FAIL,
  UPDATE_TARGET_DETAILS_LOAD,
  UPDATE_TARGET_DETAILS_SUCCESS,
  UPDATE_TARGET_DETAILS_FAIL,
  TARGET_DETAILS_SUMMARY_LOAD,
  TARGET_DETAILS_SUMMARY_SUCCESS,
  TARGET_DETAILS_SUMMARY_FAIL,
  LEAD_DETAILS_SUMMARY_LOAD,
  LEAD_DETAILS_SUMMARY_SUCCESS,
  LEAD_DETAILS_SUMMARY_FAIL,
  DEALER_TARGET_DETAILS_LOAD,
  DEALER_TARGET_DETAILS_SUCCESS,
  DEALER_TARGET_DETAILS_FAIL
} from '../../actions/Target/actionTypes';
import LoadingGroup from '../../../utils/LoadingGroup';

const defaultTargetSummary = [
  {
    vehicle_type: 0,
    manufacturer_target: 0,
    sold_count: 0,
    dealer_target: 0
  },
  {
    vehicle_type: 1,
    manufacturer_target: 0,
    sold_count: 0,
    dealer_target: 0
  }
];

const defaultLeadSummary = {
  pending_leads: 0,
  overdue_leads: 0,
  scheduled_test_ride: 0,
  inprogress_test_ride: 0,
  completed_test_ride: 0
};

const initialState = {
  error: false,
  dealerTargets: [],
  targetList: [],
  leadSummary: defaultLeadSummary,
  targetSummary: null,
  variantPriceDetails: {},
  loadingGroup: false,
  loader: new LoadingGroup()
};

const getFormatedDealerTarget = targets => targets.map(target => {
  target.fromDate = moment(target.target_from_date).format('YYYY-MM-DD');
  target.toDate = moment(target.target_to_date).format('YYYY-MM-DD');
  return target;
});

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case TARGET_DETAILS_LOAD:
      return {
        ...state,
        loadingGroup: state.loader.startFetch(),
        targetList: []
      };
    case TARGET_DETAILS_SUCCESS:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        targetList: action.response
      };
    case TARGET_DETAILS_FAIL:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        error: true,
        targetList: []
      };
    case UPDATE_TARGET_DETAILS_LOAD:
      return {
        ...state,
        loadingGroup: state.loader.startFetch(),
        variantPriceDetails: {}
      };
    case UPDATE_TARGET_DETAILS_SUCCESS:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        variantPriceDetails: action.response
      };
    case UPDATE_TARGET_DETAILS_FAIL:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        error: true,
        variantPriceDetails: {}
      };
    case TARGET_DETAILS_SUMMARY_LOAD: {
      return {
        ...state,
        loadingGroup: state.loader.startFetch(),
        targetSummary: null
      };
    }
    case TARGET_DETAILS_SUMMARY_SUCCESS: {
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        targetSummary: Array.isArray(action.response) && action.response.length > 0
          ?
          action.response : defaultTargetSummary
      };
    }
    case TARGET_DETAILS_SUMMARY_FAIL: {
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        targetSummary: defaultTargetSummary
      };
    }
    case LEAD_DETAILS_SUMMARY_LOAD: {
      return {
        ...state,
        loadingGroup: state.loader.startFetch(),
        leadSummary: defaultLeadSummary
      };
    }
    case LEAD_DETAILS_SUMMARY_SUCCESS: {
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        leadSummary: action.response
      };
    }
    case LEAD_DETAILS_SUMMARY_FAIL: {
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        leadSummary: defaultLeadSummary
      };
    }
    case DEALER_TARGET_DETAILS_LOAD: {
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        dealerTargets: []
      };
    }
    case DEALER_TARGET_DETAILS_SUCCESS: {
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        dealerTargets: action.response ? getFormatedDealerTarget(action.response) : []
      };
    }
    case DEALER_TARGET_DETAILS_FAIL: {
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        dealerTargets: initialState.dealerTargets
      };
    }
    default:
      return state;
  }
}
