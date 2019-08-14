import { StyleSheet, Dimensions } from 'react-native';
import fonts from '../../theme/fonts';
import variables from '../../theme/variables';

const DEVICE_HEIGHT = Dimensions.get('screen').height;
const DEVICE_WIDTH = Dimensions.get('screen').width;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
  headerDateContent: {
    color: 'gray',
    justifyContent: 'center',
    paddingHorizontal: 5,
    borderRightColor: '#2E2C2C',
    borderRightWidth: 1
  },
  headerSearchContent: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRightColor: '#2E2C2C',
    borderRightWidth: 1
  },
  headerBellNotify: {
    flex: 1,
    width: 4,
    height: 4,
    alignSelf: 'center',
    borderRadius: 50
  },
  headerSearchContentText: {
    paddingTop: 10,
    height: 40,
    color: 'white',
    width: 190
  },
  mainView: {
    flex: 1,
    margin: 40,
    backgroundColor: 'white',
    elevation: 3
  },
  detailSectionView: {
    backgroundColor: 'white',
    elevation: 3,
    height: 100
  },
  detailHeaderView: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#e9e9e9'
  },
  detailValueView: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#ffffff'
  },
  detailHeaderTitleView: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center'
  },
  detailTitleTextStyle: {
    color: '#454545',
    textAlign: 'left',
    fontFamily: fonts.sourceSansProSemiBold,
    fontSize: 14,
    marginLeft: 15
  },
  detailValueTextStyle: {
    flex: 1,
    color: '#454545',
    textAlign: 'left',
    fontFamily: fonts.sourceSansProRegular,
    fontSize: 16,
    marginLeft: 15,
    alignSelf: 'center',
    textAlignVertical: 'center'
  },
  editView: {
    flex: 1,
    marginLeft: 20,
    alignSelf: 'center',
  },
  editBtnViewStyle: {
    width: 50,
    margin: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBtnTextViewStyle: {
    color: '#EF7432',
    padding: 5,
    backgroundColor: 'white',
    fontFamily: fonts.sourceSansProSemiBold,
    fontSize: 18
  },
  continueSection: {
    flex: 3,
    flexDirection: 'row',
    marginHorizontal: 0,
    alignItems: 'center',
  },
  documentsRequiredView: {
    flex: 6,
    flexDirection: 'row',
  },
  documentsView: {
    width: 200,
  },
  documentScrollView: {
    width: 200,
    height: 250
  },
  optionaldocsView: {
    flex: 1,
  },
  optionalDocumentsView: {
    flex: 1
  },

  documentsTextStyle: {
    color: '#454545',
    fontFamily: fonts.sourceSansProRegular,
    fontSize: 13,
    marginVertical: 4,
    marginLeft: 5
  },
  optionalHeadertext: {
    color: '#aaaeb3',
    fontFamily: fonts.sourceSansProRegular,
    fontSize: 12,
    marginLeft: 20
  },
  conatiner: {
    flex: 1,
    backgroundColor: 'grey'
  },
  headerNameView: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16
  },
  headerNameStyle: {
    color: '#F5F5F4',
    fontSize: 12
  },
  headerBikeValueStyle: {
    flex: 1,
    borderLeftColor: fonts.headerLine,
    borderLeftWidth: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  headerBikeValueTextStyle: {
    color: variables.warmGrey,
    fontSize: 12,
    fontFamily: fonts.sourceSansProSemiBold,
  },
  nameText: {
    fontSize: 12,
    fontFamily: fonts.sourceSansProRegular,
    color: 'white'
  },
  optionalDocTileStyle: {
    flexDirection: 'row',
    height: 25,
    width: (DEVICE_WIDTH - 300) / 3,
    marginLeft: 20
  },
  resendandverifyView: {
    flexDirection: 'row',
    height: 60,
    marginTop: 10,
    justifyContent: 'space-between',
    marginHorizontal: 30,
  },
  sendOtpView: {
    flexDirection: 'row',
    height: 60,
    marginTop: 10,
    justifyContent: 'flex-end',
    marginHorizontal: 30,
  },
  finrepOverView: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 30
  },
  verifyRepBtn: {
    height: 30,
    marginLeft: 20,
    alignItems: 'center',
    justifyContent: 'center'
  },
  finRepNameTextStyle: {
    backgroundColor: '#d8d8d8',
    color: '#454545',
    marginLeft: 15,
    height: 30,
    textAlignVertical: 'center',
    textAlign: 'center',
    paddingHorizontal: 10
  },
  finRepMobileNumberTextStyle: {
    backgroundColor: '#d8d8d8',
    color: '#454545',
    height: 30,
    textAlignVertical: 'center',
    textAlign: 'center',
    paddingHorizontal: 10
  },
  pickerOverView: {
    width: 200,
    borderColor: '#EF7432',
    borderWidth: 1,
    height: 40,
    marginLeft: 20,
    marginVertical: 0,
    backgroundColor: 'white'
  },
  continueBtnView: {
    flex: 1,
    flexDirection: 'row-reverse',
    alignItems: 'flex-end',
    paddingRight: 20,
    marginRight: 20
  },
  FinRepView: {
    flex: 1,
    alignItems: 'flex-start',
  },
  pickerView: {
    height: 35
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
  detailTextInputStyle: {
    color: '#4a4a4a',
    fontFamily: fonts.sourceSansProSemiBold,
    fontSize: 17,
  },
});
export default styles;
