
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    height: 100,
    width: 100,
  },
  horizontal: {
    flexDirection: 'row',
    padding: 10
  },
  modalBackground: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'space-around',
    backgroundColor: '#00000040',
    zIndex: 9999
  },
  activityIndicatorWrapper: {
    height: 100,
    width: 100,
    backgroundColor: 'transparent',
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around'
  },
  spinnerTextStyle: {
    color: '#FFF'
  },
});

export default styles;
