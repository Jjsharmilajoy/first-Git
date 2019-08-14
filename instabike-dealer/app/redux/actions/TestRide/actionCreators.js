import * as ActionTypes from './actionTypes';

const headers = {
  Accept: 'application/json',
  'Content-Type': 'multipart/form-data',
};

export function getLead(leadId) {
  return {
    types: [
      ActionTypes.GET_LEAD_LOAD, ActionTypes.GET_LEAD_SUCESS, ActionTypes.GET_LEAD_FAILURE
    ],
    promise: ({ client }) => client.get(`/Leads/${leadId}`)
  };
}

export function getTestRideDates(dealerId, vehicleId) {
  return {
    types: [
      ActionTypes.GET_TEST_RIDE_DATE, ActionTypes.GET_TEST_RIDE_DATE_SUCCESS, ActionTypes.GET_TEST_RIDE_DATE_FAILURE
    ],
    promise: ({ client }) => client.get(`/LeadDetails/dealer/${dealerId}/vehicle/${vehicleId}`)
  };
}

export function getTestRideSlots(dealerId, vehicleId, data) {
  return {
    types: [
      ActionTypes.GET_TEST_RIDE_SLOTS,
      ActionTypes.GET_TEST_RIDE_SLOTS_SUCCESS,
      ActionTypes.GET_TEST_RIDE_SLOTS_FAILURE
    ],
    promise: ({ client }) => client.post(`/LeadDetails/dealer/${dealerId}/vehicle/${vehicleId}`, data)
  };
}

export function getTestRideBookedLeads(status, data) {
  return {
    types: [
      ActionTypes.GET_TEST_RIDE_AVAILED_LEADS,
      ActionTypes.GET_TEST_RIDE_AVAILED_LEADS_SUCCESS,
      ActionTypes.GET_TEST_RIDE_AVAILED_LEADS_FAILURE
    ],
    promise: ({ client }) => client.post(`/LeadDetails/status/${status}`, data)
  };
}

export function getTestRideCount(data) {
  return {
    types: [
      ActionTypes.GET_TEST_RIDE_COUNT_LOAD,
      ActionTypes.GET_TEST_RIDE_COUNT_SUCCESS,
      ActionTypes.GET_TEST_RIDE_COUNT_FAILURE
    ],
    promise: ({ client }) => client.post('/LeadDetails/testRideCount', data)
  };
}

export function uploadDocument(userId, data) {
  return {
    types: [
      ActionTypes.ADD_DOCUMENT_LOAD,
      ActionTypes.ADD_DOCUMENT_SUCCESS,
      ActionTypes.ADD_DOCUMENT_FAILURE
    ],
    promise: ({ client }) => client.post(`/Documents/Users/${userId}/upload`, data, headers)
  };
}

export function deleteDocumentById(documentId) {
  return {
    types: [
      ActionTypes.DELETE_DOCUMENT_LOAD,
      ActionTypes.DELETE_DOCUMENT_SUCCESS,
      ActionTypes.DELETE_DOCUMENT_FAILURE
    ],
    promise: ({ client }) => client.delete(`/Documents/${documentId}`)
  };
}

export function updateDocumentById(documentId, data) {
  return {
    types: [
      ActionTypes.UDPATE_DOCUMENT_LOAD,
      ActionTypes.UPDATE_DOCUMENT_SUCCESS,
      ActionTypes.UPDATE_DOCUMENT_FAILURE
    ],
    promise: ({ client }) => client.patch(`/Documents/${documentId}`, data)
  };
}

export function markAllDocumentsAsVerified(documentIds) {
  return {
    types: [
      ActionTypes.MARK_ALL_VERIFIED_LOAD,
      ActionTypes.MARK_ALL_VERIFIED_SUCCESS,
      ActionTypes.MARK_ALL_VERIFIED_FAILURE
    ],
    promise: ({ client }) => client.post('/Documents/markAsVerified', documentIds)
  };
}

export function updateTestRideStatus(leadDetailId, data) {
  return {
    types: [
      ActionTypes.BOOK_TEST_RIDE_LOAD,
      ActionTypes.BOOK_TEST_RIDE_SUCCESS,
      ActionTypes.BOOK_TEST_RIDE_FAILURE
    ],
    promise: ({ client }) => client.put(`/LeadDetails/${leadDetailId}/bookTestRide`, data)
  };
}

export function clearTestRideSlots() {
  return {
    type: ActionTypes.CLEAR_TEST_RIDE_SLOTS
  };
}
