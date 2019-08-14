import * as ActionTypes from './actionTypes';

export function getFinancierList(dealerId, data) {
  return {
    types: [
      ActionTypes.GET_FIANANCIERLIST_LOAD,
      ActionTypes.GET_FIANANCIERLIST_SUCCESS,
      ActionTypes.GET_FIANANCIERLIST_FAIL
    ],
    promise: ({ client }) => client.post(`/Dealers/${dealerId}/financiers/interestDetails`, data)
  };
}

export function getFinancierRepresentativeList(dealerId, financierId) {
  return {
    types: [
      ActionTypes.GET_FIANANCIER_REP_LIST_LOAD,
      ActionTypes.GET_FIANANCIER_REP_LIST_SUCCESS,
      ActionTypes.GET_FIANANCIER_REP_LIST_FAIL
    ],
    promise: ({ client }) => client.get(`/Dealers/${dealerId}/financiers/${financierId}/salesExecutives`)
  };
}

export function createFinancierLead(financierId, data) {
  return {
    types: [
      ActionTypes.CREATE_FIANANCIER_LEAD_LOAD,
      ActionTypes.CREATE_FIANANCIER_LEAD_SUCCESS,
      ActionTypes.CREATE_FIANANCIER_LEAD_FAIL
    ],
    promise: ({ client }) => client.post(`/Financiers/${financierId}/lead/create`, data)
  };
}

export function updateFinancierLead(financierId, data) {
  return {
    types: [
      ActionTypes.CREATE_FIANANCIER_LEAD_LOAD,
      ActionTypes.CREATE_FIANANCIER_LEAD_SUCCESS,
      ActionTypes.CREATE_FIANANCIER_LEAD_FAIL
    ],
    promise: ({ client }) => client.patch(`/FinancierLeads/${financierId}`, data)
  };
}

export function getFinancierLeadDetails(financierLeadId) {
  return {
    types: [
      ActionTypes.GET_FINANCIER_LEAD_LOAD,
      ActionTypes.GET_FINANCIER_LEAD_SUCCESS,
      ActionTypes.GET_FINANCIER_LEAD_FAIL
    ],
    promise: ({ client }) =>
      client.get(`/FinancierLeads/${financierLeadId}`)
  };
}
