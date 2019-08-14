import { callToast } from '../actions/Global/actionCreators';
import { sessionExpired } from '../actions/User/actionCreators';
import { CHECKNETSTATUS } from '../actions/Global/actionTypes';
import storage from '../../helpers/AsyncStorage';
import { hideIndicator } from '../actions/Loader/actionCreators';
import Constants from '../../utils/constants';

let prevStatusCode;

export default function clientMiddleware({ client }) {
  return ({ dispatch, getState }) => next => action => {
    const state = getState();
    let responseStatus;
    if (action.type === CHECKNETSTATUS || (state && state.global && state.global.connection === true)) {
      if (typeof action === 'function') {
        return action(dispatch, getState);
      }

      const { promise, types, ...rest } = action;
      if (!promise) {
        return next(action);
      }
      const [REQUEST, SUCCESS, FAILURE] = types;
      next({ ...rest, type: REQUEST });
      return new Promise((resolve, reject) => {
        const actionPromise = promise({ client }, dispatch);
        actionPromise
          .then(result => {
            if (result.respInfo !== undefined) {
              responseStatus = result.respInfo.status;
            } else if (result.status === 204) {
              responseStatus = result.status;
              return null;
            } else {
              responseStatus = result.status;
            }
            return result.json();
          }).then(response => {
            // Success
            if (responseStatus < 400 || responseStatus > 599) {
              prevStatusCode = responseStatus;
              if (response && (Object.keys(response).length > 0) && response.accessToken !== undefined) {
                client.setAuthToken(response.accessToken.id);
              }
              resolve(next({ ...rest, response, type: SUCCESS }));
            // Failure
            } else if (responseStatus > 399 && responseStatus < 600) {
              if (response.error) {
                const err = response.error;
                if (err.statusCode === 401 && prevStatusCode !== 401) {
                  err.message = 'invalidaccesstoken';
                  storage.clearValues();
                  dispatch(sessionExpired());
                  dispatch(hideIndicator());
                  client.removeAuthToken();
                  dispatch(callToast(Constants.SESSION_EXPIRED));
                  reject(next({ ...rest, err, type: FAILURE }));
                } else {
                  reject(next({ ...rest, err, type: FAILURE }));
                }
                prevStatusCode = err.statusCode;
              }
            }
          }).catch(err => {
            // May be used
            dispatch(hideIndicator());
            err.message = 'invalidaccesstoken';
            reject(next({ ...rest, err, type: FAILURE }));
          });
        return actionPromise;
      });
    }
  };
}
