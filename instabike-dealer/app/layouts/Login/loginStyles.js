import { StyleSheet } from 'react-native';
import Dimensions from 'Dimensions';

import variables from '../../theme/variables';

const DEVICE_WIDTH = Dimensions.get('window').width;
const DEVICE_HEIGHT = Dimensions.get('window').height;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: variables.primaryBackgroundColor
  },
  loginBody: {
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    height: '100%',
    marginTop: 5
  },
  formBody: {
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    height: '90%',
    marginTop: 25
  },
  form: {
    paddingVertical: 0,
    flexDirection: 'column',
    elevation: 15,
    shadowColor: variables.primaryIosShadowColor,
    shadowOffset: {
      width: 3,
      height: 3
    },
    alignSelf: 'flex-end',
    shadowOpacity: 0.5,
    shadowRadius: 10,
    backgroundColor: '#fff',
    paddingLeft: 25,
    paddingRight: 25,
    borderRadius: 5
  },
  formResetPassword: {
    // paddingVertical: 10,
    flexDirection: 'column',
    elevation: 15,
    shadowColor: variables.primaryIosShadowColor,
    shadowOffset: {
      width: 3,
      height: 3
    },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    backgroundColor: '#FFFFFF',
    paddingLeft: 25,
    paddingRight: 25,
    height: '100%',
    borderRadius: 5
  },
  userInputContainer: {
    marginTop: 0,
    marginBottom: 0,
    backgroundColor: '#fff',
    width: '100%'
  },
  textInputStyle: {
    width: DEVICE_WIDTH / 3,
  },
  viewHeight: {
    height: DEVICE_HEIGHT / 0.5
  }
});

export default styles;
