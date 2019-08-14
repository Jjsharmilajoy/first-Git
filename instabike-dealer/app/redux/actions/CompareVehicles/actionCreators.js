import * as ActionTypes from './actionTypes';

export function getVehicleDetails(vehicleId) {
  return {
    types: [
      ActionTypes.VEHICLEDETAIL_LOAD, ActionTypes.VEHICLEDETAIL_SUCCESS, ActionTypes.VEHICLEDETAIL_FAIL
    ],
    promise: ({ client }) =>
      client.get(`/Vehicles/${vehicleId}/detail`)
  };
}

export function getSimilarVehicles(data) {
  return {
    types: [
      ActionTypes.GETVEHICLES_LOAD, ActionTypes.GETVEHICLES_SUCCESS, ActionTypes.GETVEHICLES_FAIL
    ],
    promise: ({ client }) => client.post('/Vehicles/similarVehicles', data)
  };
}

export function getVehiclePropertyList(dealerId) {
  return {
    types: [
      ActionTypes.GETVEHICLES_PROPERTY_LOAD, ActionTypes.GETVEHICLES_PROPERTY_SUCCESS, ActionTypes.GETVEHICLES_PROPERTY_FAIL
    ],
    promise: ({ client }) => client.get(`/Dealers/${dealerId}/vehicle/properties`)
  };
}
