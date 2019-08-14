import * as ActionTypes from './actionTypes';

export default function loadDealership(dealerID) {
  return {
    types: [
      ActionTypes.LOAD_DEALERSHIP_DETAIL,
      ActionTypes.LOAD_DEALERSHIP_DETAIL_SUCCESS,
      ActionTypes.LOAD_DEALERSHIP_DETAIL_FAIL
    ],
    promise: ({ client }) =>
      client.get(`/Dealers/${dealerID}/details`)
  };
}
