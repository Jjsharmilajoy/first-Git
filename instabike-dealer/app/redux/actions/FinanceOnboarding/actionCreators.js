import * as ActionTypes from './actionTypes';

export function createExchangeVehicle(dealerId, leadId, data) {
  return {
    types: [
      ActionTypes.CREATEEXCHANGEVEHICLE_LOAD,
      ActionTypes.CREATEEXCHANGEVEHICLE_SUCCESS,
      ActionTypes.CREATEEXCHANGEVEHICLE_FAIL
    ],
    promise: ({ client }) => client.post(`/Dealers/${dealerId}/lead/${leadId}/exchangeVehicle`, data)
  };
}

export function getExchangeVehicle(dealerId, leadId, proformaInvoiceId) {
  return {
    types: [
      ActionTypes.GET_EXCHANGEVEHICLE_LOAD,
      ActionTypes.GET_EXCHANGEVEHICLE_SUCCESS,
      ActionTypes.GET_EXCHANGEVEHICLE_FAIL
    ],
    promise: ({ client }) =>
      client.get(`/Dealers/${dealerId}/lead/${leadId}/proformaInvoice/${proformaInvoiceId}/exchangeVehicle`)
  };
}

export function updateExchangeVehicle(dealerId, leadId, data) {
  return {
    types: [
      ActionTypes.UPDATE_EXCHANGEVEHICLE_LOAD,
      ActionTypes.UPDATE_EXCHANGEVEHICLE_SUCCESS,
      ActionTypes.UPDATE_EXCHANGEVEHICLE_FAIL
    ],
    promise: ({ client }) => client.put(`/Dealers/${dealerId}/lead/${leadId}/exchangeVehicle`, data)
  };
}

export function getManufacturerList() {
  return {
    types: [
      ActionTypes.GET_MANUFACTURER_LIST_LOAD,
      ActionTypes.GET_MANUFACTURER_LIST_SUCCESS,
      ActionTypes.GET_MANUFACTURER_LIST_FAIL
    ],
    promise: ({ client }) => client.get('/ExchangeVehicleLookups/manufacturers')
  };
}

export function getExchangeVehicleList(data) {
  return {
    types: [
      ActionTypes.GET_EXCHANGE_VEHICLE_LIST_LOAD,
      ActionTypes.GET_EXCHANGE_VEHICLE_LIST_SUCCESS,
      ActionTypes.GET_EXCHANGE_VEHICLE_LIST_FAIL
    ],
    promise: ({ client }) => client.post('/ExchangeVehicleLookups/vehicles', data)
  };
}

export function getExchangeVariantList(data) {
  return {
    types: [
      ActionTypes.GET_EXCHANGE_VARIANT_LIST_LOAD,
      ActionTypes.GET_EXCHANGE_VARIANT_LIST_SUCCESS,
      ActionTypes.GET_EXCHANGE_VARIANT_LIST_FAIL
    ],
    promise: ({ client }) => client.post('/ExchangeVehicleLookups/variants', data)
  };
}
export function getExchangePrice(data) {
  return {
    types: [
      ActionTypes.GET_EXCHANGE_PRICE_LOAD,
      ActionTypes.GET_EXCHANGE_PRICE_SUCCESS,
      ActionTypes.GET_EXCHANGE_PRICE_FAIL
    ],
    promise: ({ client }) => client.post('/ExchangeVehicleLookups/price', data)
  };
}

