import * as ActionTypes from './actionTypes';

export function loadProductSummary(dealerId, data) {
  return {
    types: [
      ActionTypes.LOAD_PRODUCT_SUMMARY,
      ActionTypes.LOAD_PRODUCT_SUMMARY_SUCCESS,
      ActionTypes.LOAD_PRODUCT_SUMMARY_FAIL
    ],
    promise: ({ client }) =>
      client.post(`/Dealers/${dealerId}/vehicles/summary`, data)
  };
}

export function loadProducts(dealerId, data) {
  return {
    types: [
      ActionTypes.LOAD_PRODUCTS,
      ActionTypes.LOAD_PRODUCTS_SUCCESS,
      ActionTypes.LOAD_PRODUCTS_FAIL
    ],
    promise: ({ client }) =>
      client.post(`/Dealers/${dealerId}/vehicles/summary`, data)
  };
}

export function updateDealershipDetails(data) {
  const { id } = data;
  return {
    types: [
      ActionTypes.UPDATE_DEALERSHIP_LOAD,
      ActionTypes.UPDATE_DEALERSHIP_SUCCESS,
      ActionTypes.UPDATE_DEALERSHIP_FAIL
    ],
    promise: ({ client }) => client.patch(`/Dealers/${id}`, data)
  };
}

export function sendLeadReport(dealerId, data) {
  return {
    types: [
      ActionTypes.SEND_LEADREPORT_LOAD,
      ActionTypes.SEND_LEADREPORT_SUCCESS,
      ActionTypes.SEND_LEADREPORT_FAIL
    ],
    promise: ({ client }) => client.post(`/Dealers/${dealerId}/leadReport`, data)
  };
}
