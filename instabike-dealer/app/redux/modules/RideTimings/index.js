import {
  TIMINGS_LOAD,
  TIMINGS_SUCCESS,
  TIMINGS_FAIL
} from '../../actions/TestRideTimings/actionTypes';
import LoadingGroup from '../../../utils/LoadingGroup';

const initialState = {
  data: [],
  error: false,
  loadingGroup: false,
  loader: new LoadingGroup()
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case TIMINGS_LOAD:
      return {
        ...state,
        loadingGroup: state.loader.startFetch(),
        data: []
      };
    case TIMINGS_SUCCESS:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        data: action.response
      };
    case TIMINGS_FAIL:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        error: true,
        data: []
      };
    default:
      return state;
  }
}

