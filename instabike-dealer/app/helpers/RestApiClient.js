import rnFetchBlob from 'rn-fetch-blob';
import config from '../config';
import storage from './AsyncStorage';
import constants from '../utils/constants';

let protocol;

if (config.environment === 'development') {
  protocol = null;
} else {
  protocol = constants.PROTOCOL;
}

const hostUrl = `${protocol + config.apiHost}:${config.apiPort}${config.apiBase}`;

const methods = constants.HttpMethdosArray;

const headers = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
};

export default class APICLIENT {
  constructor() {
    methods.forEach(method => {
      this[method] = async (path, data, headerConfig) => {
        if (headerConfig) {
          headerConfig = await this.setAuthToken('', headerConfig);
          return new Promise((resolve, reject) => {
            rnFetchBlob.fetch(method, hostUrl + path, headerConfig, data)
              .then(res => {
                resolve(res);
              }).catch(error => {
                reject(error);
              });
          });
        }
        headerConfig = await this.setAuthToken('', headers);
        return new Promise((resolve, reject) => {
          // eslint-disable-next-line no-undef
          fetch(hostUrl + path, {
            method,
            body: JSON.stringify(data),
            headers: headerConfig
          }).then(res => {
            resolve(res);
          }).catch(error => {
            reject(error);
          });
        });
      };
    });
  }

  setAuthToken = async (token, header) => {
    if (!header && token) {
      headers.Authorization = token;
      return headers;
    }
    await storage.getItem('currentUser').then(response => {
      if (response && (Object.keys(response).length > 0) && response.token) {
        header.Authorization = response.token;
      }
    }, () => { });
    return header;
  }

  removeAuthToken = () => {
    delete headers.Authorization;
    return headers;
  }
}
