import { StyleSheet, Dimensions } from 'react-native';

const DEVICE_HEIGHT = Dimensions.get('screen').height;
const DEVICE_WIDTH = Dimensions.get('screen').width;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#363434',
  },
  dataContainer: {
    flex: 1,
    marginHorizontal: (DEVICE_WIDTH * 0.05),
    marginVertical: 0
  },
  headerView: {
    height: DEVICE_HEIGHT * 0.1,
    marginHorizontal: (DEVICE_WIDTH * 0.05),
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerView: {
    height: DEVICE_HEIGHT * 0.08,
    marginHorizontal: (DEVICE_WIDTH * 0.05),
    flexDirection: 'row'
  },
  privacyPolicyView: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center'
  },
  logoView: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  seperatorView: {
    width: 1,
    height: DEVICE_HEIGHT * 0.03,
    backgroundColor: 'white',
    marginHorizontal: DEVICE_WIDTH * 0.01,
  },
  logoImage: {
    height: DEVICE_HEIGHT * 0.05,
    width: 120,
    resizeMode: 'contain'
  },
  brandLogoView: {
    alignItems: 'center'
  },
  brandLogoImage: {
    height: DEVICE_HEIGHT * 0.05,
    width: 120,
    resizeMode: 'contain'
  },
  mainDataContainer: {
    flex: 1,
    backgroundColor: '#ffffff'
  },
  continueBtnSection: {
    height: 100
  }
});

export default styles;
