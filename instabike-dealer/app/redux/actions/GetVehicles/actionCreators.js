import * as ActionTypes from './actionTypes';

export function getManufacturerId(id) {
  return {
    types: [
      ActionTypes.GETMANUFACTURERID_LOAD, ActionTypes.GETMANUFACTURERID_SUCCESS, ActionTypes.GETMANUFACTURERID_FAIL
    ],
    promise: ({ client }) => client.get(`/Dealers/${id}`)
  };
}

export function getVehicles(dealerId) {
  return {
    types: [
      ActionTypes.GETVEHICLES_LOAD, ActionTypes.GETVEHICLES_SUCCESS, ActionTypes.GETVEHICLES_FAIL
    ],
    promise: ({ client }) => client.get(`/Dealers/${dealerId}/allVehicles`)
  };
}

export function updatePreferedVehicles(vehicleId, dealerId) {
  return {
    types: [
      ActionTypes.UPDATE_VEHICLEPREFERED_LOAD, ActionTypes.UPDATE_VEHICLEPREFERED_SUCCESS, ActionTypes.UPDATE_VEHICLEPREFERED_FAIL

    ],
    promise: ({ client }) => client.post(`/Vehicles/${vehicleId}/dealer/${dealerId}/updatePrefered`)
  };
}

