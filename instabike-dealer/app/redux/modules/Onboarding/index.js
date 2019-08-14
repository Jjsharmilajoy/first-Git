import {
  DEALER_DETAILS_LOAD,
  DEALER_DETAILS_SUCCESS,
  DEALER_DETAILS_FAIL,
  SAVE_DEALERSHIP_LOAD,
  SAVE_DEALERSHIP_SUCCESS,
  SAVE_DEALERSHIP_FAIL,
} from '../../actions/Onboarding/actionTypes';
import LoadingGroup from '../../../utils/LoadingGroup';

const initialState = {
  error: false,
  dealer: null,
  loadingGroup: false,
  loader: new LoadingGroup()
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case DEALER_DETAILS_LOAD: {
      return {
        ...state,
        loadingGroup: state.loader.startFetch(),
        dealer: null
      };
    }
    case DEALER_DETAILS_SUCCESS: {
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        dealer: action.response
      };
    }
    case DEALER_DETAILS_FAIL: {
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        dealer: null
      };
    }
    case SAVE_DEALERSHIP_LOAD:
      return {
        ...state,
        loadingGroup: state.loader.startFetch(),
        dealer: null
      };
    case SAVE_DEALERSHIP_SUCCESS:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        dealer: action.response
      };
    case SAVE_DEALERSHIP_FAIL:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        error: true,
        dealer: null
      };
    default:
      return state;
  }
}
