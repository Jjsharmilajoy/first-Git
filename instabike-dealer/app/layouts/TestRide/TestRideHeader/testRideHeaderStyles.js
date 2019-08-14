import { StyleSheet } from 'react-native';
import colors from '../../../theme/variables';

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    flex: 1,
  },
  headerTextContent: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 30,
    borderRightColor: '#2E2C2C',
    borderRightWidth: 1
  },
  headerSearchContent: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRightColor: '#2E2C2C',
    borderRightWidth: 1
  },
  headerSearchContentText: {
    paddingTop: 10,
    height: 40,
    color: 'white',
    width: 190
  },
  gradient: {
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
    backgroundColor: colors.white,
    paddingHorizontal: 10,
    shadowOffset: {
      width: 10,
      height: 10,
    },
    height: 50,
  },
  image: {
    height: 80,
    left: -15,
    top: 0,
    width: 110,
  }
});

export default styles;
