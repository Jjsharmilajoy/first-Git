import {
  SHOW_INDICATOR,
  HIDE_INDICATOR
}
  from '../../actions/Loader/actionTypes';

const initialState = {
  showIndicator: false
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case SHOW_INDICATOR:
      return {
        ...state,
        showIndicator: true
      };
    case HIDE_INDICATOR:
      return {
        ...state,
        showIndicator: false
      };
    default:
      return state;
  }
}
