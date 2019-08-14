import { StyleSheet } from 'react-native';
import variables from '../../theme/variables';

const styles = StyleSheet.create({
  buttonStyles: {
    backgroundColor: variables.primaryButtonColor,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1
  },
  buttonStyle: {
    backgroundColor: variables.primaryButtonColor,
    justifyContent: 'center',
    alignItems: 'center',
  },
  plainButton: {
    backgroundColor: variables.primaryButtonColor,
    alignItems: 'center',
    justifyContent: 'center'
  },
  textColor: {
    color: '#FFF'
  },
  alignRow: {
    flexDirection: 'row'
  },
  textStyle: {
    color: '#FFF'
  },
  bgColor: {
    backgroundColor: variables.primaryButtonColor
  },
  alignColumn: {
    flexDirection: 'column'
  },
  roundButtonStyle: {
    backgroundColor: '#FFFFFF',
    elevation: 6,
    flexDirection: 'row',
    shadowColor: variables.shadowColor,
    shadowOffset: { width: 6, height: 6 },
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 5,
    paddingBottom: 5,
    paddingLeft: 10,
    paddingRight: 10
  },
  roundButtonLeftTextStyle: {
    fontSize: 24,
    color: '#1F4E84'
  },
  roundButtonRightTextStyle: {
    color: '#949DAC',
    fontSize: 16,
    marginLeft: 16
  },
  alignRowAndJustifyStart: {
    flexDirection: 'row',
    justifyContent: 'flex-start'
  },
  activeCheckboxWrapper: {
    borderColor: '#f79426',
    borderWidth: 1,
    width: 12,
    height: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 3
  },
  activeCheckbox: {
    borderColor: '#f79426',
    backgroundColor: '#f79426',
    width: 6,
    height: 6,
    borderWidth: 1
  },
  marginLeft10: {
    marginLeft: 10
  },
  loading: {
    position: 'absolute',
    left: 75,
  },
  buttonLargeText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFF',
    textAlign: 'center',
    fontFamily: 'SourceSansPro-Semibold'
  },
  buttonMediumText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
    fontFamily: 'SourceSansPro-Semibold'
  },
  bookTestRideButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
    fontFamily: 'SourceSansPro-Semibold'
  },
  secondaryButtonAlignCenter: {
    alignItems: 'center'
  },
  secondaryButtonGradientStyle: {
    height: 35,
    width: 100,
    borderRadius: 2,
    borderLeftWidth: 0.5,
    borderRightWidth: 0.5,
    borderTopWidth: 0.5,
    borderBottomWidth: 1,
    borderColor: 'transparent'
  },
  secondaryButtonWrapper: {
    flex: 1,
    /*     marginTop: 1,
    marginLeft: 1,
    marginBottom: 2,
    marginRight: 2, */
    margin: 1,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row'
  },
  secondaryButtonTitleText: {
    color: '#fd5742',
    fontSize: 12,
    textAlign: 'center'
  },
  secondaryImageStyle: {
    height: 20,
    width: 20
  }
});

export default styles;
