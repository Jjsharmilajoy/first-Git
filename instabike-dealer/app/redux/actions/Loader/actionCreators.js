import * as ActionTypes from './actionTypes';

export function showIndicator() {
  return {
    type: ActionTypes.SHOW_INDICATOR
  };
}

export function hideIndicator() {
  return {
    type: ActionTypes.HIDE_INDICATOR
  };
}
