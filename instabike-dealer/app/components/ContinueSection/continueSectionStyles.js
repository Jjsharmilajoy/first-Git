import { StyleSheet, Dimensions } from 'react-native';

const { height } = Dimensions.get('window');
const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  imageContainer: {
    flex: 10,
    flexDirection: 'row'
  },
  box1: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  box2: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  btnFirstWhiteBox: {
    width: width / 3,
    height: height / 6,
    marginRight: 20,
    justifyContent: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
  },
  btnSecondWhiteBox: {
    width: width / 3,
    height: height / 6,
    marginLeft: 20,
    justifyContent: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
  },
  continueBtnStyle: {
    width: 200,
    height: 40,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#fff'
  },
  backButtonStyle: {
    maxWidth: 80,
    height: 40,
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: 'transparent'
  },
  backButtonTextStyle: {
    width: 40,
    color: '#f16537',
  }
});

export default styles;
