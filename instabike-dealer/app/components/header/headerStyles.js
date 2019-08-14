import { StyleSheet } from 'react-native';

const headerStyles = StyleSheet.create({
  appHeaderContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
    backgroundColor: 'white',
    shadowOffset: {
      width: 10,
      height: 10,
    }
  },
  gradient: {
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
    backgroundColor: 'white',
    shadowOffset: {
      width: 10,
      height: 10,
    },
    zIndex: 9999,
    height: 60
  },
  image: {
    height: 65,
    left: -10,
    top: -3,
    width: 145,
  },
  headerBellNotify: {
    flex: 1,
    width: 4,
    height: 4,
    alignSelf: 'center',
    borderRadius: 50
  },
});

export default headerStyles;
