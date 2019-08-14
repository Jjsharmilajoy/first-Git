import * as ActionTypes from './actionTypes';

export function getFinancierList(dealerId) {
  return {
    types: [
      ActionTypes.FINANCIER_INFO_LOAD,
      ActionTypes.FINANCIER_INFO_SUCCESS,
      ActionTypes.FINANCIER_INFO_FAIL
    ],
    promise: ({ client }) => client.get(`/Dealers/${dealerId}/financiers`)
  };
}

export function updateFinancierList(dealerId, data) {
  return {
    types: [
      ActionTypes.UPDATEFINANCIER_INFO_LOAD,
      ActionTypes.UPDATEFINANCIER_INFO_SUCCESS,
      ActionTypes.UPDATEFINANCIER_INFO_FAIL
    ],
    promise: ({ client }) => client.post(`/Dealers/${dealerId}/updateFinancier`, data)
  };
}

export function updateUserStatus(id, data) {
  return {
    types: [
      ActionTypes.UPDATEUSERINFO_INFO_LOAD,
      ActionTypes.UPDATEUSERINFO_INFO_SUCCESS,
      ActionTypes.UPDATEUSERINFO_INFO_FAIL
    ],
    promise: ({ client }) => client.patch(`/Users/${id}`, data)
  };
}
