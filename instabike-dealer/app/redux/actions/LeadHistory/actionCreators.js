import * as ActionTypes from './actionTypes';

export function getTeamMembers(dealerId) {
  return {
    types: [
      ActionTypes.GET_TEAM_MEMBERS_LOAD,
      ActionTypes.GET_TEAM_MEMBERS_SUCCESS,
      ActionTypes.GET_TEAM_MEMBERS_FAIL
    ],
    promise: ({ client }) =>
      client.get(`/Dealers/${dealerId}/users/keyvalue`)
  };
}

export function getAllVehicles(dealerId) {
  return {
    types: [
      ActionTypes.GET_ALLVEHICLES_LOAD,
      ActionTypes.GET_ALLVEHICLES_SUCCESS,
      ActionTypes.GET_ALLVEHICLES_FAIL
    ],
    promise: ({ client }) =>
      client.get(`/Dealers/${dealerId}/vehicles/keyvalue`)
  };
}

export function updateLeadDetail(leadDetailId, data) {
  return {
    types: [
      ActionTypes.UPDATE_LEADDETAIL_LOAD,
      ActionTypes.UPDATE_LEADDETAIL_SUCCESS,
      ActionTypes.UPDATE_LEADDETAIL_FAIL
    ],
    promise: ({ client }) =>
      client.put(`/LeadDetails/${leadDetailId}`, data)
  };
}

export function deleteLeadDetail(leadDetailId) {
  return {
    types: [
      ActionTypes.DELETE_LEADDETAIL_LOAD,
      ActionTypes.DELETE_LEADDETAIL_SUCCESS,
      ActionTypes.DELETE_LEADDETAIL_FAIL
    ],
    promise: ({ client }) =>
      client.put(`/LeadDetails/${leadDetailId}/delete`)
  };
}

export function createLeadDetail(leadId, data) {
  return {
    types: [
      ActionTypes.CREATE_LEADDETAIL_LOAD,
      ActionTypes.CREATE_LEADDETAIL_SUCCESS,
      ActionTypes.CREATE_LEADDETAIL_FAIL
    ],
    promise: ({ client }) =>
      client.post(`/Leads/${leadId}/leadDetail`, data)
  };
}

export function updateLeadDetailStatus(leadId, leadDetailId, saveLead) {
  return {
    types: [
      ActionTypes.UPDATE_LEADDETAIL_STATUS_LOAD,
      ActionTypes.UPDATE_LEADDETAIL_STATUS_SUCCESS,
      ActionTypes.UPDATE_LEADDETAIL_STATUS_FAIL
    ],
    promise: ({ client }) =>
      client.put(`/Leads/${leadId}/leadDetail/${leadDetailId}/invoiced`, saveLead)
  };
}

export function getLostReasons() {
  return {
    types: [
      ActionTypes.LOST_REASON_LOAD,
      ActionTypes.LOST_REASON_SUCCESS,
      ActionTypes.LOST_REASON_FAILURE
    ],
    promise: ({ client }) => client.get('/LostReasons/list')
  };
}

export function postLeadFollowUp(leadId, data) {
  return {
    types: [
      ActionTypes.LEAD_FOLLOW_UP_LOAD,
      ActionTypes.LEAD_FOLLOW_UP_SUCCESS,
      ActionTypes.LEAD_FOLLOW_UP_FAILURE
    ],
    promise: ({ client }) => client.post(`/Leads/${leadId}/followup`, data)
  };
}

export function updateLeadFollowUp(leadId, followUpId, data) {
  return {
    types: [
      ActionTypes.UPDATE_LEAD_FOLLOW_LOAD,
      ActionTypes.UPDATE_LEAD_FOLLOW_SUCCESS,
      ActionTypes.UPDATE_LEAD_FOLLOW_FAILURE
    ],
    promise: ({ client }) => client.put(`/Leads/${leadId}/followup/${followUpId}`, data)
  };
}

export function postComment(leadId, data) {
  return {
    types: [
      ActionTypes.ACTION_COMMENT_LOAD,
      ActionTypes.ACTION_COMMENT_SUCCESS,
      ActionTypes.ACTION_COMMENT_FAILURE
    ],
    promise: ({ client }) => client.post(`/Leads/${leadId}/comment`, data)
  };
}

export function getLeadActivities(leadId) {
  return {
    types: [
      ActionTypes.LEAD_ACTIVITIES_LOAD,
      ActionTypes.LEAD_ACTIVITIES_SUCCESS,
      ActionTypes.LEAD_ACTIVITIES_FAILURE
    ],
    promise: ({ client }) => client.get(`/Leads/${leadId}/activities`)
  };
}

export function lostLead(leadId, lostReasonId, data) {
  return {
    types: [
      ActionTypes.LEAD_LOST_LOAD,
      ActionTypes.LEAD_LOST_SUCCESS,
      ActionTypes.LEAD_LOST_FAILURE
    ],
    promise: ({ client }) => client.put(`/Leads/${leadId}/lostReason/${lostReasonId}`, data)
  };
}

export function clearLeadActivities() {
  return {
    type: ActionTypes.CLEAR_LEAD_ACTIVITIES
  };
}
