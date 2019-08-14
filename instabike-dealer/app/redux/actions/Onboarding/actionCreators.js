import * as ActionTypes from './actionTypes';

export function getDealerDetailsById(dealerId) {
  return {
    types: [
      ActionTypes.DEALER_DETAILS_LOAD, ActionTypes.DEALER_DETAILS_SUCCESS, ActionTypes.DEALER_DETAILS_FAIL
    ],
    promise: ({ client }) => client.get(`/Dealers/${dealerId}/details`)
  };
}

export function saveDealership(data) {
  return {
    types: [
      ActionTypes.SAVE_DEALERSHIP_LOAD, ActionTypes.SAVE_DEALERSHIP_SUCCESS, ActionTypes.SAVE_DEALERSHIP_FAIL
    ],
    promise: ({ client }) =>
      client.put(`/Dealers/${data.dealer.id}/user/${data.user.id}/updateDealerWithManager`, data)
  };
}
