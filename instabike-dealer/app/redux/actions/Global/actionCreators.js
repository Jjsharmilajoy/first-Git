import * as ActionTypes from './actionTypes';

export function toggleSideNav() {
  return {
    type: ActionTypes.ON_SIDENAV_TOGGLE
  };
}

export function handleSideNav(isSideNavOpen) {
  return {
    type: ActionTypes.HANDLE_SIDENAV,
    isSideNavOpen
  };
}

export function setLead(lead) {
  return {
    type: ActionTypes.SETLEAD,
    lead
  };
}

export function updateClickedPosition(position) {
  return {
    type: ActionTypes.UPDATE_CLICKED_POSITION,
    position
  };
}

export function createLead(dealerId, data) {
  return {
    types: [
      ActionTypes.CREATE_LEAD_LOAD, ActionTypes.CREATE_LEAD_SUCCESS, ActionTypes.CREATE_LEAD_FAIL
    ],
    promise: ({ client }) =>
      client.post(`/Dealers/${dealerId}/lead/create`, data)
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

export function updateLeadDetail(leadId, data) {
  return {
    types: [
      ActionTypes.UPDATE_LEAD_DETAIL_LOAD, ActionTypes.UPDATE_LEAD_DETAIL_SUCCESS, ActionTypes.UPDATE_LEAD_DETAIL_FAIL
    ],
    promise: ({ client }) =>
      client.put(`/Leads/${leadId}/update`, data)
  };
}

export function getLead(id) {
  return {
    types: [
      ActionTypes.GETLEAD_LOAD,
      ActionTypes.GETLEAD_SUCCESS,
      ActionTypes.GETLEAD_FAIL
    ],
    promise: ({ client }) =>
      client.get(`/Leads/${id}`)
  };
}

export function clearLead() {
  return {
    type: ActionTypes.CLEAR_CURRENT_LEAD
  };
}

export function clearToast() {
  return {
    type: ActionTypes.CLEAR_TOAST_MESSAGE
  };
}

export function callToast(message) {
  return {
    type: ActionTypes.CALL_TOAST_MESSAGE,
    message
  };
}
export function updateNetstatus(status) {
  return {
    type: ActionTypes.CHECKNETSTATUS,
    status
  };
}

export function saveErrors(data) {
  return {
    types: [
      ActionTypes.SAVE_ERROR_LOAD,
      ActionTypes.SAVE_ERROR_SUCCESS,
      ActionTypes.SAVE_ERROR_FAIL
    ],
    promise: ({ client }) =>
      client.post('/Errors', data)
  };
}

export function disableButton(timeOutDuration) {
  return {
    type: ActionTypes.DISABLE_BUTTON,
    timeOutDuration
  };
}

export function enableButton() {
  return {
    type: ActionTypes.ENABLE_BUTTON
  };
}
