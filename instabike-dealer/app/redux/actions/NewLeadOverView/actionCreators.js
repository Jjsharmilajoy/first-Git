import * as ActionTypes from './actionTypes';

export function getLeadCreatedList() {
  return {
    types: [
      ActionTypes.LEADOVERVIEW_LOAD, ActionTypes.LEADOVERVIEW_SUCCESS, ActionTypes.LEADOVERVIEW_FAIL
    ],
    promise: ({ client }) => client.get('/Leads/inShowroom')
  };
}
export function getAssigneList(dealerId) {
  return {
    types: [
      ActionTypes.LEADASSIGN_LOAD, ActionTypes.LEADASSIGN_SUCCESS, ActionTypes.LEADASSIGN_FAIL
    ],
    promise: ({ client }) => client.get(`/Dealers/${dealerId}/users/keyvalue`)
  };
}
export function getLeadTypeCount() {
  return {
    types: [
      ActionTypes.GET_LEADCOUNT_LOAD, ActionTypes.GET_LEADCOUNT_SUCCESS, ActionTypes.GET_LEADCOUNT_FAIL
    ],
    promise: ({ client }) =>
      client.get('/Leads/type/count')
  };
}

export function updateLead(leadId, data) {
  return {
    types: [
      ActionTypes.UPDATE_LEAD_LOAD, ActionTypes.UPDATE_LEAD_SUCCESS, ActionTypes.UPDATE_LEAD_FAIL
    ],
    promise: ({ client }) =>
      client.patch(`/Leads/${leadId}`, data)
  };
}
