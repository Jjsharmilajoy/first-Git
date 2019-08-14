import { StyleSheet, Dimensions } from 'react-native';
import fonts from '../../theme/fonts';
import variables from '../../theme/variables';

const DEVICE_WIDTH = Dimensions.get('screen').width;
const DEVICE_HEIGHT = Dimensions.get('screen').height;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flatListViewStyles: {
    marginTop: 15,
    height: '75%',
    width: '100%'
  },
  cardViewStyle: {
    flex: 1,
    width: DEVICE_WIDTH - 365,
    elevation: 5,
    backgroundColor: '#ffffff',
    marginTop: 15,
    marginBottom: 10,
    marginLeft: 20,
  },
  vehicleCard: {
    flex: 1,
    elevation: 5,
    marginHorizontal: 5,
  },
  vehicleName: {
    color: variables.headerBackgroundColor,
    fontSize: 14,
    marginLeft: 10,
    fontFamily: fonts.sourceSansProBoldItalic
  },
  fieldTitle: {
    marginTop: 10,
    marginLeft: 10,
    color: variables.dustyOrange,
    alignItems: 'center',
    fontSize: 15,
    fontFamily: fonts.sourceSansProSemiBold
  },
  pickerViewStyles: {
    height: 30,
    borderColor: variables.lightGrey,
    borderBottomWidth: 1,
    marginTop: 10,
    marginRight: 10,
    justifyContent: 'center'
  },
  pickerStyle: {
    color: variables.primaryTextColor,
    marginHorizontal: 2
  },
  continueBtnStyle: {
    marginHorizontal: 10
  },
  PickerStyle: {
    height: 30,
    width: DEVICE_WIDTH / 3,
    color: 'black',
    backgroundColor: 'red',
    borderColor: 'red',
  },
  colorFlatListStyle: {
    width: (DEVICE_WIDTH / 3) - 40,
    marginLeft: 20,
    marginTop: 5,
  },
  colorCellStyle: {
    height: 30,
    width: 30,
    marginRight: 20,
    borderColor: 'gray',
    borderWidth: 2
  },
  bookNowTestRideBtnStyle: {
    height: 30,
    backgroundColor: '#f37730',
    width: (DEVICE_WIDTH / 6) - 40,
    marginRight: 10,
    marginBottom: 20,
    marginTop: 10
  },
  bookNowTestRideBtnTextStyle: {
    color: 'white',
    fontFamily: fonts.sourceSansProRegular,
    fontSize: 14
  },
  fianceOptionBtnStyle: {
    height: 40,
    backgroundColor: '#ffffff',
    width: (DEVICE_WIDTH / 3) - 70,
    marginRight: 10,
    marginBottom: 10,
    borderColor: '#f37730',
    borderWidth: 1
  },
  financeOptionBtnTextStyle: {
    color: '#f37730',
    fontFamily: fonts.sourceSansProRegular,
    fontSize: 14
  },
  addButtonStyle: {
    backgroundColor: '#f37730',
    width: 60,
    height: 40
  },
  addButtonTextStyle: {
    fontFamily: fonts.sourceSansProBold,
    fontSize: 15
  },
  saveBtnStyle: {
    height: 40,
    width: 75,
    marginRight: 10,
    marginBottom: 20,
    marginTop: 10,
    zIndex: 99
  },
  addBtnStyle: {
    height: 30,
    width: 75,
    marginRight: 10,
    zIndex: 99
  },
  addBtnTextStyle: {
    color: variables.dustyOrange,
    fontSize: 14,
    paddingTop: 6,
    paddingRight: 10
  },
  specTitleTextStyle: {
    color: '#454545',
    alignItems: 'center',
    fontSize: 14,
    fontFamily: fonts.sourceSansProRegular
  },
  specTitleDesTextStyle: {
    color: '#4a4a4a',
    alignItems: 'center',
    fontSize: 15,
    fontFamily: fonts.sourceSansProBold
  },
  documentsView: {
    flex: 5,
  },
  detailTitleTextStyle: {
    color: '#454545',
    textAlign: 'left',
    fontFamily: fonts.sourceSansProSemiBold,
    fontSize: 14,
    marginLeft: 30
  },
  documentsTextStyle: {
    color: '#454545',
    fontFamily: fonts.sourceSansProRegular,
    fontSize: 13,
    marginVertical: 4,
    marginLeft: 30,
    width: DEVICE_WIDTH / 3
  },
  doneBtnStyle: {
    marginVertical: 10
  },
  testRideStatus: {
    marginHorizontal: 12
  },
  triangle: {
    backgroundColor: 'gray',
    width: 8,
    height: 8,
    transform: [{
      translateY: -4,
    }, {
      rotate: '45deg',
    }],
  },
  triangleContainer: {
    width: 12,
    height: 6,
    overflow: 'hidden',
    alignItems: 'center',

    backgroundColor: 'transparent', /* XXX: Required */
  },
  accessory: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeFinancierContainer: {
    backgroundColor: 'grey',
    opacity: 0.9,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  removeFinancierView: {
    width: DEVICE_WIDTH / 3,
    height: 160,
    backgroundColor: 'white'
  },
  fieldContainer: {
    borderColor: '#EF7432',
    borderWidth: 1,
    width: (DEVICE_WIDTH / 3) - 36,
    height: 40,
    fontSize: 15,
    fontFamily: fonts.sourceSansProRegular,
    paddingLeft: 10,
    alignSelf: 'center',
    marginTop: 5,
  },
  reasonTitleText: {
    fontSize: 15,
    fontFamily: fonts.sourceSansProBold,
    flex: 1,
    marginLeft: 17,
    color: 'black',
    marginTop: 8
  },
  cancelBtnStyle: {
    width: 120
  },
  cancelBtnTextStyle: {
    fontSize: 16,
    fontFamily: fonts.sourceSansProBold,
  },
  okBtnStyle: {
    width: 120
  },
  okBtnTextStyle: {
    fontSize: 16,
    fontFamily: fonts.sourceSansProBold,
  },
  commentTextStyle: {
    marginLeft: 15,
    height: 20
  },
  refNumberStyle: {
    margin: 10,
    fontSize: 16,
    fontFamily: fonts.sourceSansProBold,
  },
  modalconatiner: {
    flex: 1,
    backgroundColor: 'grey'
  },
  modalMainContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#e6e6e7',
    height: DEVICE_HEIGHT
  },
  closeBtnView: {
    width: 40,
    height: 40,
    right: 0,
    top: 0,
    alignItems: 'center',
    backgroundColor: '#f26537',
    alignSelf: 'flex-end'
  },
  vehicleDetailView: {
    flex: 0.3,
    marginVertical: 30,
    backgroundColor: 'white',
    elevation: 3,
    marginLeft: 80
  },
  vehicleImageStyle: {
    marginTop: 20,
    height: 150,
    width: 250,
    resizeMode: 'contain',
    backgroundColor: 'white',
    padding: 10,
  },
  specificationViewStyle: {
    marginHorizontal: 30,
    marginVertical: 5,
  },
  specheadertextStyle: {
    color: '#9c9c9c',
    alignItems: 'center',
    fontSize: 14,
    fontFamily: fonts.sourceSansProRegular
  },
  specsDetailTextStyle: {
    color: '#454545',
    alignItems: 'center',
    fontSize: 16,
    fontFamily: fonts.sourceSansProSemiBold,
  },
  dataContainerView: {
    flex: 0.7,
    marginLeft: 30,
    backgroundColor: 'white',
    marginVertical: 30,
    elevation: 3,
    marginRight: 80
  },
  offerTextStyle: {
    color: 'gray',
    alignItems: 'center',
    fontSize: 16,
    fontFamily: fonts.sourceSansProSemiBold,
    margin: 20,
  },
  seperator: {
    backgroundColor: '#c0c0c0',
    height: 1,
  },
  OTPTotalViewStyle: {
    height: 120,
    marginHorizontal: 30,
    backgroundColor: 'white',
    elevation: 3,
    marginVertical: 30,
  },
  OTPInputView: {
    justifyContent: 'space-between',
    flex: 1,
    flexDirection: 'row',
    height: 40,
    alignItems: 'center',
    marginLeft: 20,
    marginRight: 50
  },
  otpTF: {
    height: 40,
    width: 200,
    borderColor: '#f79426',
    borderWidth: 1,
  },

  resendBtnStyle: {
    height: 40,
    justifyContent: 'center',
    backgroundColor: 'white',
    width: 100,
  },
  resendBtnTextStyle: {
    fontFamily: fonts.sourceSansProBold,
    fontSize: 16,
    color: '#f58b59'
  },
  verifyBtnStyle: {
    height: 50,
    backgroundColor: '#f37730',
    width: 150,
  },
  verifyBtnTextStyle: {
    fontFamily: fonts.sourceSansProBold,
    fontSize: 16,
    color: 'white'
  },
  nameTextView: {
    flexDirection: 'row'

  },
  nameTextStyle: {
    backgroundColor: '#d8d8d8',
    fontFamily: fonts.sourceSansProRegular,
    fontSize: 16,
    color: '#464646'
  },
  nameNumberSeperator: {
    width: 1,
    backgroundColor: '#979797',
  },
});

export default styles;
