import {
  LOAD_DEALERSHIP_DETAIL,
  LOAD_DEALERSHIP_DETAIL_SUCCESS,
  LOAD_DEALERSHIP_DETAIL_FAIL
} from '../../actions/DealershipDetails/actionTypes';
import LoadingGroup from '../../../utils/LoadingGroup';

const initialState = {
  loadingGroup: false,
  error: false,
  detail: null,
  loader: new LoadingGroup()
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case LOAD_DEALERSHIP_DETAIL:
      return {
        ...state,
        loadingGroup: state.loader.startFetch(),
        detail: null
      };
    case LOAD_DEALERSHIP_DETAIL_SUCCESS:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        detail: action.response,
        manufacturerSlug: action.response.manufacturer.slug
      };
    case LOAD_DEALERSHIP_DETAIL_FAIL:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        error: true,
        detail: null
      };
    default:
      return state;
  }
}
