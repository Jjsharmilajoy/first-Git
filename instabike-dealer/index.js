import React from 'react';
import { AppRegistry } from 'react-native';
import { Provider } from 'react-redux';
import App from './app/App';
import configureStore from './app/redux/store';
import Toaster from './app/components/toast/Toaster';

const store = configureStore();

const InstaBikeApp = () => (
  <Provider store={store}>
    <React.Fragment>
      <App />
      <Toaster />
    </React.Fragment>
  </Provider>
);

AppRegistry.registerComponent('InstaBike', () => InstaBikeApp);

export default store;
