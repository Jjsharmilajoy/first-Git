import {
  GETTEAM_LOAD,
  GETTEAM_SUCCESS,
  GETTEAM_FAIL
} from '../../actions/MyTeam/actionTypes';
import LoadingGroup from '../../../utils/LoadingGroup';

const initialState = {
  loadingGroup: false,
  loader: new LoadingGroup(),
  error: false,
  searchedLeads: {},
  leads: [],
  team: []
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case GETTEAM_LOAD:
      return {
        ...state,
        loadingGroup: state.loader.startFetch(),
        team: []
      };
    case GETTEAM_SUCCESS:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        team: action.response
      };
    case GETTEAM_FAIL:
      return {
        ...state,
        loadingGroup: state.loader.completeFetch(),
        error: true,
        team: []
      };
    default:
      return state;
  }
}
