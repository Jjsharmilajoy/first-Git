import { StyleSheet, Dimensions } from 'react-native';
import variables from '../../theme/variables';
import fonts from '../../theme/fonts';

const DEVICE_WIDTH = Dimensions.get('screen').width;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column'
  },
  body: {
    flex: 1,
    flexDirection: 'column'
  },
  panelContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20
  },
  pageTitle: {
    color: variables.charcoalGrey,
    fontSize: 18,
    fontFamily: fonts.sourceSansProSemiBold,
    marginTop: 5,
    justifyContent: 'center',
    alignSelf: 'center'
  },
  fieldTitle: {
    paddingHorizontal: 5,
    color: variables.lightGrey,
    alignItems: 'center',
    fontSize: 15,
    fontFamily: fonts.sourceSansProSemiBold
  },
  fieldValue: {
    height: DEVICE_WIDTH > 750 ? 35 : 25,
    fontSize: DEVICE_WIDTH > 750 ? 14 : 12,
    fontFamily: fonts.sourceSansProRegular,
    color: variables.charcoalGrey,
    paddingVertical: 0
  },
  fieldContainer: {
    width: DEVICE_WIDTH / 5,
  },
  pickerStyle: {
    color: variables.charcoalGrey,
    marginHorizontal: 2
  },
  gender: {
    marginTop: 10,
    flexDirection: 'row',
    marginHorizontal: 5
  },
  pickerViewStyles: {
    height: 30,
    borderColor: variables.lightGrey,
    borderBottomWidth: 1,
    marginTop: 10,
    justifyContent: 'center'
  },
  PickerStyle: {
    height: 30,
    width: DEVICE_WIDTH / 3,
    color: 'black',
    backgroundColor: 'red',
    borderColor: 'red',
  },
  saveBtnStyle: {
    width: 75,
    height: 35,
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#fff'
  },
  saveBtnTextStyle: {
    color: 'white',
    fontFamily: fonts.sourceSansProRegular,
    fontSize: 14
  },
  selectedCard: {
    borderColor: variables.mango,
    borderWidth: 2
  },
  genderCard: {
    marginRight: 10,
    flexDirection: 'column',
    backgroundColor: '#efefef',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
    elevation: 2
  },
  cardText: {
    fontSize: 10,
    fontFamily: fonts.sourceSansProRegular
  },
  errorTextStyle: {
    color: 'red',
    marginHorizontal: 5,
    fontSize: 11,
    fontFamily: fonts.sourceSansProRegular
  },
  dropdownContainer: {
    // overflow: 'hidden',
    // marginBottom: 20,
    borderRadius: 6,
    width: DEVICE_WIDTH / 3,
    maxHeight: 400,
    alignContent: 'center',
    flex: 1,
  },
  selectDropdownTextField: {
    fontSize: 14,
    fontFamily: fonts.sourceSansProRegular,
    color: variables.charcoalGrey,
  },
  confirmBtn: {
    backgroundColor: variables.apricot
  },
  confirmText: {
    fontSize: 16,
    fontFamily: fonts.sourceSansProBold,
    color: variables.charcoalGrey,
  },
  assigneNameView: {
    height: 30,
    marginVertical: 10,
    marginHorizontal: 5
  },
  assigneeLineSeperator: {
    height: 1,
    backgroundColor: variables.lightGrey,
  },
  textfieldContainer: {
    justifyContent: 'flex-end',
    marginVertical: 5,
    flexDirection: 'column',
    borderColor: variables.dustyOrange,
    borderWidth: 1,
    borderRadius: 5
  },
  mobilefieldContainer: {
    justifyContent: 'flex-start',
    marginVertical: 5,
    flexDirection: 'row',
    borderColor: variables.dustyOrange,
    borderWidth: 1,
    borderRadius: 6,
    width: DEVICE_WIDTH * 15 / 100,
    marginLeft: 4
  },
  instantTextfieldContainer: {
    marginVertical: 5,
    marginHorizontal: 10,
    flexDirection: 'column',
    borderColor: variables.dustyOrange,
    borderWidth: 1,
    borderRadius: 5
  }
});

export default styles;
