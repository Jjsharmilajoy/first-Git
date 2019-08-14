import * as ActionTypes from './actionTypes';

export function getLeadsMonthlySummaryCount() {
  return {
    types: [
      ActionTypes.LEAD_MONTHLY_SUMMARY_LOAD,
      ActionTypes.LEAD_MONTHLY_SUMMARY_SUCCESS,
      ActionTypes.LEAD_MONTHLY_SUMMARY_FAIL
    ],
    promise: ({ client }) =>
      client.get('/Leads/monthlySummary/count')
  };
}

export function getTeamPerformance(dealerId) {
  return {
    types: [
      ActionTypes.TEAM_PERFORMANCE_LOAD,
      ActionTypes.TEAM_PERFORMANCE_SUCCESS,
      ActionTypes.TEAM_PERFORMANCE_FAIL
    ],
    promise: ({ client }) =>
      client.get(`/Dealers/${dealerId}/teamPerformance`)
  };
}

