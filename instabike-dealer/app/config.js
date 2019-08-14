import constants from './utils/constants';

require('babel-polyfill');

const environment = {
  development: {
    isProduction: false
  },
  production: {
    isProduction: true
  }
}[process.env.NODE_ENV || 'development'];

module.exports = Object.assign(
  {
    apiHost: process.env.APIHOST || constants.API_HOST,
    apiPort: process.env.APIPORT || constants.API_PORT,
    apiBase: constants.API_BASE,
    app: {
      title: 'InstaBike',
      description: 'A mobile application by CAMS',
    }
  },
  environment
);
