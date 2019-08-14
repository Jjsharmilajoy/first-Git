import * as ActionTypes from './actionTypes';

export function getManufacturerId(id) {
  return {
    types: [
      ActionTypes.GETMANUFACTURERID_LOAD, ActionTypes.GETMANUFACTURERID_SUCCESS, ActionTypes.GETMANUFACTURERID_FAIL
    ],
    promise: ({ client }) => client.get(`/Dealers/${id}`)
  };
}

export function getVehicles(dealerId, manufacturerId, searchOption) {
  return {
    types: [
      ActionTypes.GETVEHICLES_LOAD, ActionTypes.GETVEHICLES_SUCCESS, ActionTypes.GETVEHICLES_FAIL
    ],
    promise: ({ client }) =>
      client.post(`/Vehicles/manufacturer/${manufacturerId}/dealer/${dealerId}/searchVehicle`, searchOption)
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

