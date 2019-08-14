import * as ActionTypes from './actionTypes';

export function getFollowUpToday() {
  return {
    types: [
      ActionTypes.FOLLOW_UP_TODAY_LOAD,
      ActionTypes.FOLLOW_UP_TODAY_SUCCESS,
      ActionTypes.FOLLOW_UP_TODAY_FAILURE
    ],
    promise: ({ client }) => client.get('/Leads/followup/today')
  };
}

export function getFollowUpDone() {
  return {
    types: [
      ActionTypes.FOLLOW_UP_DONE_LOAD,
      ActionTypes.FOLLOW_UP_DONE_SUCCESS,
      ActionTypes.FOLLOW_UP_DONE_FAILURE
    ],
    promise: ({ client }) => client.get('/Leads/followup/done')
  };
}

export function getFollowUpAssignee(dealerId) {
  return {
    types: [
      ActionTypes.FOLLOW_UP_ASSIGNEE_LOAD,
      ActionTypes.FOLLOW_UP_ASSIGNEE_SUCCESS,
      ActionTypes.FOLLOW_UP_ASSIGNEE_FAILURE
    ],
    promise: ({ client }) => client.get(`/Dealers/${dealerId}/users/keyvalue`)
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

export function getFollowUpCount() {
  return {
    types: [
      ActionTypes.FOLLOW_COUNT_LOAD, ActionTypes.FOLLOW_COUNT_SUCCESS, ActionTypes.FOLLOW_COUNT_FAILURE
    ],
    promise: ({ client }) =>
      client.get('/Leads/followup/count')
  };
}
