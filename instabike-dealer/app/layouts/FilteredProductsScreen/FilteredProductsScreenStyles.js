import { StyleSheet, Dimensions } from 'react-native';
import fonts from '../../theme/fonts';
import colors from '../../theme/variables';

const { width, height } = Dimensions.get('screen');
const modalHeight = height;
const modalWidth = width;

const styles = StyleSheet.create({
  activeColorStyle: {
    flex: 1,
    borderColor: 'black',
    borderWidth: 1,
  },
  colorStyle: {
    flex: 1,
    borderColor: '#f79426',
    borderWidth: 3,
  },
  emailIconStyle: {
    width: 50,   
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContentWrapper: {
    backgroundColor: 'gray',
    position: 'absolute',
    width: modalWidth,
    height: modalHeight,
    opacity: 0.8
  },
  emialModalContent: {
    backgroundColor: 'white',
    width: modalWidth / 2.75,
    marginTop: 40,
    height: modalHeight / 3,
    alignSelf: 'center',
    alignItems: 'center'
  },
  offerTitleModalContent: {
    width: modalWidth / 2.75,
    height: 50,
    borderRadius: 4
  },
  offerTitleText: {
    paddingHorizontal: 10,
    paddingVertical: 15,
    fontFamily: fonts.sourceSansProRegular,
    fontSize: 15,
    color: colors.offerBlack,
    textAlign: 'left',
  },
  modalCloseView: {
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: '#f79426',
    height: 45,
    width: 45,
    borderRadius: 4
  },
  closeIconDimensions: {
    width: 50,
    height: 50,
    borderRadius: 4
  },
  line: {
    height: 1,
    backgroundColor: '#E2E2E2'
  },
  offerModelContentView: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center'
  },
  commentTextStyle: {
    marginLeft: 15,
    height: 20
  },
  otherChargesReasonInputStyle: {
    width: 300,
    borderColor: '#FDD2B8',
    borderWidth: 1,
    alignSelf: 'center',
  }, 
  emailIconStyle: {
    width: 50,   
    justifyContent: 'center',
    alignItems: 'center'
  }
});
export default styles;
