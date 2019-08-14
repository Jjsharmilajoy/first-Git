import * as ActionTypes from './actionTypes';

export function getFinancierLeadDetails(financierLeadId) {
  return {
    types: [
      ActionTypes.GET_FINANCIER_LEAD_LOAD,
      ActionTypes.GET_FINANCIER_LEAD_SUCCESS,
      ActionTypes.GET_FINANCIER_LEAD_FAIL
    ],
    promise: ({ client }) =>
      client.get(`/FinancierLeads/${financierLeadId}`)
  };
}

export function updateFinancierLeadDetails(financierLeadId, data) {
  return {
    types: [
      ActionTypes.UPDATE_FINANCIER_LEAD_LOAD,
      ActionTypes.UPDATE_FINANCIER_LEAD_SUCCESS,
      ActionTypes.UPDATE_FINANCIER_LEAD_FAIL
    ],
    promise: ({ client }) =>
      client.patch(`/FinancierLeads/${financierLeadId}`, data)
  };
}

export function sendOtp(userId) {
  return {
    types: [
      ActionTypes.SEND_OTP_LOAD,
      ActionTypes.SEND_OTP_SUCCESS,
      ActionTypes.SEND_OTP_FAIL
    ],
    promise: ({ client }) =>
      client.post(`/Users/${userId}/otp/send`)
  };
}

export function resendOtp(userId, data) {
  return {
    types: [
      ActionTypes.RESEND_OTP_LOAD,
      ActionTypes.RESEND_OTP_SUCCESS,
      ActionTypes.RESEND_OTP_FAIL
    ],
    promise: ({ client }) =>
      client.post(`/Users/${userId}/otp/resend`, data)
  };
}

export function verifyOtp(userId, data) {
  return {
    types: [
      ActionTypes.VERIFY_OTP_LOAD,
      ActionTypes.VERIFY_OTP_SUCCESS,
      ActionTypes.VERIFY_OTP_FAIL
    ],
    promise: ({ client }) =>
      client.post(`/Users/${userId}/otp/validate`, data)
  };
}
