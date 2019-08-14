import * as ActionTypes from './actionTypes';

export function persistVehicleDetails(vehicleDetails) {
  return {
    type: ActionTypes.PERSIST_VEHICLE_DETAILS,
    vehicleDetails
  };
}

export function getProductDetails(vehicleId) {
  return {
    types: [
      ActionTypes.VEHICLEOVERVIEW_LOAD, ActionTypes.VEHICLEOVERVIEW_SUCCESS, ActionTypes.VEHICLEOVERVIEW_FAIL
    ],
    promise: ({ client }) =>
      client.get(`/Vehicles/${vehicleId}/detail`)
  };
}

export function get360ImageDetails(vehicleId) {
  return {
    types: [
      ActionTypes.IMAGE360_LOAD, ActionTypes.IMAGE360_SUCCESS, ActionTypes.IMAGE360_FAIL
    ],
    promise: ({ client }) =>
      client.get(`/Vehicles/${vehicleId}/threeSixtyDegree`)
  };
}

export function updateLeadInfo(leadId, data) {
  return {
    types: [
      ActionTypes.UPDATE_LEAD_LOAD, ActionTypes.UPDATE_LEAD_SUCCESS, ActionTypes.UPDATE_LEAD_FAIL
    ],
    promise: ({ client }) =>
      client.patch(`/Leads/${leadId}`, data)
  };
}

export function updateLeadDetailsObject(leadDetailId, data) {
  return {
    types: [
      ActionTypes.LEADDETAILUPDATE_LOAD, ActionTypes.LEADDETAILUPDATE_SUCCESS, ActionTypes.LEADDETAILUPDATE_FAIL
    ],
    promise: ({ client }) =>
      client.put(`/LeadDetails/${leadDetailId}`, data)
  };
}

export function createLeadDetailsObject(leadId, data) {
  return {
    types: [
      ActionTypes.CREATELEADDETAIL_LOAD, ActionTypes.CREATELEADDETAIL_SUCCESS, ActionTypes.CREATELEADDETAIL_FAIL
    ],
    promise: ({ client }) =>
      client.post(`/Leads/${leadId}/leadDetail`, data)
  };
}

export function sendEmail(dealer_id, vehicle_id, emailDataObj) {
  return {
    types: [
      ActionTypes.SEND_EMAIL,
      ActionTypes.SEND_EMAIL_SUCCESS,
      ActionTypes.SEND_EMAIL_FAILURE
    ],
    promise: ({ client }) =>
      client.post(`/Dealers/${dealer_id}/vehicle/${vehicle_id}/sendBrocher`, emailDataObj)
  };
}
