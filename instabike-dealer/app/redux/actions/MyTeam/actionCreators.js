import * as ActionTypes from './actionTypes';

export default function getTeam(dealerId) {
  return {
    types: [
      ActionTypes.GETTEAM_LOAD,
      ActionTypes.GETTEAM_SUCCESS,
      ActionTypes.GETTEAM_FAIL
    ],
    promise: ({ client }) =>
      client.get(`/Dealers/${dealerId}/salesTeamMembers`)
  };
}
