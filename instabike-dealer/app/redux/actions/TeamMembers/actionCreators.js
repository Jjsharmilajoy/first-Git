import * as ActionTypes from './actionTypes';

export function getTeamMembers(dealerId) {
  return {
    types: [
      ActionTypes.GET_TEAM_MEMBERS_LOAD, ActionTypes.GET_TEAM_MEMBERS_SUCCESS, ActionTypes.GET_TEAM_MEMBERS_FAILURE
    ],
    promise: ({ client }) => client.get(`/Dealers/${dealerId}/teamMembers`)
  };
}

export function getDirectReportingMember(dealerId) {
  return {
    types: [
      ActionTypes.DIRECT_REPORTING_LOAD, ActionTypes.DIRECT_REPORTING_SUCCESS, ActionTypes.DIRECT_REPORTING_FAILURE
    ],
    promise: ({ client }) => client.get(`/Dealers/${dealerId}/directReportingMembers`)
  };
}

export function createSalesHead(dealerId, data) {
  return {
    types: [
      ActionTypes.CREATE_TEAM_HEAD_LOAD,
      ActionTypes.CREATE_TEAM_HEAD_SUCCESS,
      ActionTypes.CREATE_TEAM_HEAD_FAILURE
    ],
    promise: ({ client }) =>
      client.post(`/Dealers/${dealerId}/salesMemberHead/create`, data)
  };
}

export function createSalesMember(dealerId, data) {
  return {
    types: [
      ActionTypes.CREATE_TEAM_MEMBER_LOAD,
      ActionTypes.CREATE_TEAM_MEMBER_SUCCESS,
      ActionTypes.CREATE_TEAM_MEMBER_FAILURE
    ],
    promise: ({ client }) => client.post(`/Dealers/${dealerId}/salesMember/create`, data)
  };
}

export function sendCredential(dealerId, userId, data) {
  return {
    types: [
      ActionTypes.CREATE_TEAM_HEAD_LOAD,
      ActionTypes.CREATE_TEAM_HEAD_SUCCESS,
      ActionTypes.CREATE_TEAM_HEAD_FAILURE
    ],
    promise: ({ client }) =>
      client.put(`/Dealers/${dealerId}/user/${userId}/sendCredentials`, data)
  };
}

export function resendCredential(dealerId, userId, data) {
  return {
    types: [
      ActionTypes.CREATE_TEAM_HEAD_LOAD,
      ActionTypes.CREATE_TEAM_HEAD_SUCCESS,
      ActionTypes.CREATE_TEAM_HEAD_FAILURE
    ],
    promise: ({ client }) =>
      client.put(`/Dealers/${dealerId}/user/${userId}/resendCredentials`, data)
  };
}

export function deleteTeamMember(userId) {
  return {
    types: [
      ActionTypes.DELETE_TEAM_MEMBER_LOAD,
      ActionTypes.DELETE_TEAM_MEMBER_SUCCESS,
      ActionTypes.DELETE_TEAM_MEMBER_FAILURE
    ],
    promise: ({ client }) => client.delete(`/Dealers/${userId}/salesMember/delete`)
  };
}

export function editTeamMember(userId, data) {
  return {
    types: [
      ActionTypes.EDIT_TEAM_MEMBER_LOAD,
      ActionTypes.EDIT_TEAM_MEMBER_SUCCESS,
      ActionTypes.EDIT_TEAM_MEMBER_FAILURE
    ],
    promise: ({ client }) =>
      client.put(`/Dealers/${userId}/salesMember/update`, data)
  };
}

export function editTeamHead(userId, data) {
  return {
    types: [
      ActionTypes.EDIT_TEAM_HEAD_LOAD,
      ActionTypes.EDIT_TEAM_HEAD_SUCCESS,
      ActionTypes.EDIT_TEAM_HEAD_FAILURE
    ],
    promise: ({ client }) =>
      client.put(`/Dealers/${userId}/salesMemberHead/update`, data)
  };
}
