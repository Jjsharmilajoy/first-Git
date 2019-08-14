import { StyleSheet } from 'react-native';
import Dimensions from 'Dimensions';

import variables from '../../theme/variables';
import fonts from '../../theme/fonts';

const DEVICE_WIDTH = Dimensions.get('screen').width;

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  bodyLayout: {
    flex: 9,
  },
  form: {
    flex: 1,
    alignContent: 'center',
    backgroundColor: variables.white,
  },
  formTitle: {
    alignSelf: 'center',
    marginVertical: 10,
    fontSize: 20,
    fontFamily: fonts.sourceSansProSemiBold,
    color: variables.secondaryTextColor
  },
  fieldTitle: {
    alignSelf: 'flex-start',
    fontSize: 14,
    color: variables.titleColor,
    fontFamily: fonts.sourceSansProRegular,
    marginLeft: 10
  },
  fieldValue: {
    fontSize: 15,
    fontFamily: fonts.sourceSansProRegular,
    color: variables.charcoalGrey,
  },
  pincodeValue: {
    fontSize: 15,
    fontFamily: fonts.sourceSansProRegular,
    color: variables.greyish
  },
  pincodeContainer: {
    width: DEVICE_WIDTH / 3,
    marginTop: 10,
    marginBottom: 10,
    marginLeft: 10,
    borderWidth: 1,
    backgroundColor: variables.whiteFour,
    borderColor: variables.textInputBorderColor
  },
  fieldContainer: {
    width: DEVICE_WIDTH / 3,
    marginTop: 10,
    marginBottom: 10,
    marginLeft: 10,
    borderWidth: 1,
    borderColor: variables.textInputBorderColor
  },
  code: {
    color: variables.primaryTextColor,
    fontSize: 18,
    marginLeft: 10,
    marginTop: 20
  },
  addInfo: {
    alignSelf: 'flex-start',
    fontSize: 14,
    color: variables.addInfoTextColor,
    marginHorizontal: 5,
    marginVertical: 5
  },
  location: {
    alignSelf: 'flex-start',
    fontSize: 14,
    color: variables.addInfoTextColor,
    marginHorizontal: 10,
    marginTop: 5
  },
  addressContainer: {
    width: DEVICE_WIDTH * 0.75,
    marginTop: 10,
    marginBottom: 10,
    marginLeft: 10,
    borderWidth: 1,
    borderColor: variables.textInputBorderColor
  },
  addressText: {
    fontSize: 15,
    fontFamily: fonts.sourceSansProRegular,
    color: variables.charcoalGrey
  },
  pickerWrapper: {
    marginHorizontal: 10,
    width: DEVICE_WIDTH / 3,
    borderColor: variables.textInputBorderColor,
    borderWidth: 1,
    backgroundColor: variables.whiteFour
  },
  pickerStyle: {
    height: 40,
    width: DEVICE_WIDTH / 3,
    color: variables.greyish
  },
  nameBlock: {
    flex: 0.8,
    marginVertical: 15,
    marginLeft: 60
  },
  salesManagerWrap: {
    flex: 0.8,
    marginVertical: 15,
    marginLeft: 60
  },
  detailsWrap: {
    flex: 0.8,
    marginLeft: 60
  },
  locationWrap: {
    flex: 0.8,
    marginHorizontal: 60,
    flexDirection: 'row',
    marginVertical: 20
  },
  locationField: {
    marginBottom: 11
  },
  continueBtnContainer: {
    flex: 1,
    backgroundColor: 'white',
    height: 70,
    marginRight: 70
  },
  mandatoryField: {
    color: 'red',
    lineHeight: 18,
    marginLeft: 2
  }
});

export default styles;
