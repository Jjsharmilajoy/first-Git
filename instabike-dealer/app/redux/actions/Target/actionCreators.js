import * as ActionTypes from './actionTypes';

export function getTargetList(dealerId) {
  return {
    types: [
      ActionTypes.TARGET_DETAILS_LOAD, ActionTypes.TARGET_DETAILS_SUCCESS, ActionTypes.TARGET_DETAILS_FAIL
    ],
    promise: ({ client }) =>
      client.get(`/DealerTargets/dealers/${dealerId}/target`)
  };
}

export function getDealerTargets() {
  return {
    types: [
      ActionTypes.DEALER_TARGET_DETAILS_LOAD,
      ActionTypes.DEALER_TARGET_DETAILS_SUCCESS,
      ActionTypes.DEALER_TARGET_DETAILS_FAIL
    ],
    promise: ({ client }) =>
      client.get('/DealerTargets')
  };
}

export function updateTargetDetails(dealerId, dealerSalesId, data) {
  return {
    types: [
      ActionTypes.UPDATE_TARGET_DETAILS_LOAD,
      ActionTypes.UPDATE_TARGET_DETAILS_SUCCESS,
      ActionTypes.UPDATE_TARGET_DETAILS_FAIL
    ],
    promise: ({ client }) =>
      client.post(`/DealerTargets/dealerSales/${dealerSalesId}/updateTarget`, data)
  };
}

export function getTargetSummary(dealerId, fromDate, toDate) {
  return {
    types: [
      ActionTypes.TARGET_DETAILS_SUMMARY_LOAD,
      ActionTypes.TARGET_DETAILS_SUMMARY_SUCCESS,
      ActionTypes.TARGET_DETAILS_SUMMARY_FAIL
    ],
    promise: ({ client }) =>
      client.post(`/dealers/${dealerId}/targetSummary`, { fromDate, toDate })
  };
}

export function getLeadSummary(dealerId) {
  return {
    types: [
      ActionTypes.LEAD_DETAILS_SUMMARY_LOAD,
      ActionTypes.LEAD_DETAILS_SUMMARY_SUCCESS,
      ActionTypes.LEAD_DETAILS_SUMMARY_FAIL
    ],
    promise: ({ client }) =>
      client.get(`/dealers/${dealerId}/leadSummary`)
  };
}

