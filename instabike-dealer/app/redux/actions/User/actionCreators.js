import * as ActionTypes from './actionTypes';

export function setUser(user) {
  return {
    type: ActionTypes.USER_LOAD,
    user
  };
}

export function sessionExpired() {
  return {
    type: ActionTypes.SESSION_EXPIRED
  };
}

export function resetSession() {
  return {
    type: ActionTypes.RESET_SESSION
  };
}

export function getManufacturer(id) {
  return {
    types: [
      ActionTypes.MANUFACTURER_LOAD,
      ActionTypes.MANUFACTURER_LOAD_SUCCESS,
      ActionTypes.MANUFACTURER_LOAD_FAIL
    ],
    promise: ({ client }) => client.get(`/Manufacturers/${id}`)
  };
}

export function clearUser() {
  return {
    type: ActionTypes.CLEAR_USER,
  };
}

export function logOutUser() {
  return {
    types: [
      ActionTypes.LOGOUT_LOAD, ActionTypes.LOGOUT_SUCCESS, ActionTypes.LOGOUT_FAIL
    ],
    promise: ({ client }) => client.post('/Users/logout', {})
  };
}

