import { StyleSheet, Dimensions } from 'react-native';
import fonts from '../../theme/fonts';
import variables from '../../theme/variables';

const DEVICE_HEIGHT = Dimensions.get('screen').height;

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
    marginVertical: 10,
    marginHorizontal: 30,
    backgroundColor: 'white',
    elevation: 3,
    height: 100
  },
  detailHeaderView: {
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
  editBtnViewStyle: {
    width: 50,
    margin: 2,
    alignItems: 'center',
    justifyContent: 'center'
  },
  editBtnTextViewStyle: {
    color: '#EF7432',
    padding: 5,
    backgroundColor: 'white',
    fontFamily: fonts.sourceSansProSemiBold,
    fontSize: 18
  },
  continueSection: {
    flex: 2,
    flexDirection: 'row',
  },
  documentListSection: {
    flex: 6,
  },
  docuemntTableView: {
    flex: 1,
    margin: 30,
    backgroundColor: 'white',
    elevation: 3,
    marginVertical: 10
  },
  chooseFileBtnStyle: {
    flex: 1,
    height: 35,
    alignSelf: 'center',
    justifyContent: 'center'
  },
  chooseFileBtnTextStyle: {
    color: '#f16736',
    fontFamily: fonts.sourceSansProBold,
    fontSize: 12,
    textAlign: 'center',
    textAlignVertical: 'center',
    alignSelf: 'center'
  },
  veficationBtnStyle: {
    flex: 1,
    width: 50,
    height: 35,
    alignSelf: 'center',
  },
  verificationBtntextStyle: {
    color: '#454545',
    fontFamily: fonts.sourceSansProRegular,
    fontSize: 12,
    alignSelf: 'center',
    textAlignVertical: 'center'
  },
  backBtnStyle: {
    width: 100,
    height: 35,
    alignSelf: 'center',
    backgroundColor: 'transparent',
  },
  backButtonTextStyle: {
    width: 40,
    color: '#f16537',
  },
  chooseFileBtnViewStyle: {
    flex: 1,
    color: '#454545',
    textAlign: 'left',
    fontFamily: fonts.sourceSansProRegular,
    fontSize: 16,
    marginLeft: 20,
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'flex-start',
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
  fieldContainer: {
    borderColor: '#bdbdbf',
    borderWidth: 1,
    width: 200,
    height: 40,
    fontSize: 15,
    fontFamily: fonts.sourceSansProRegular,
    paddingLeft: 10,
    marginTop: 10,
  },
  calculateExchangeBtnStyle: {
    height: 40,
    backgroundColor: '#f37730',
    flex: 1,
    marginRight: 10,
    marginLeft: 20,
    alignSelf: 'center',
    marginVertical: 20
  },
  calculateExchangeBtnTextStyle: {
    color: 'white'
  },
  doneBtnStyle: {
    height: 40,
    backgroundColor: '#f37730',
    flex: 1,
    marginRight: 20,
    marginLeft: 10,
    alignSelf: 'flex-end',
    marginVertical: 20
  },
  doneBtnTextStyle: {
    color: 'white'
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
  uploadDocumentView: {
    flexDirection: 'row',
    margin: 5,
  },
  uploadDocImageStyle: {
    width: 40,
    height: 40,
    marginHorizontal: 10
  },
  deleteBtnStyle: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  thrashIconStyle: {
    alignSelf: 'center',
    marginHorizontal: 5
  },
  textInputOverView: {
    flex: 1,
    flexDirection: 'row'
  },
  textInputContainer: {
    margin: 20,
    flex: 1
  },
  pickerOverView: {
    width: 200,
    borderColor: '#bdbdbf',
    borderWidth: 1,
    height: 40,
    marginLeft: 0,
    marginVertical: 10,
    backgroundColor: 'white'
  },
  lineSeperator: {
    height: 1,
    width: '100%',
    backgroundColor: '#CED0CE',
    marginLeft: '0%'
  },
  cellContainer: {
    flex: 1,
    backgroundColor: 'white',
    height: 60,
    flexDirection: 'row'
  },
  totalImageView: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    flex: 1
  },
  chooseFileView: {
    flexDirection: 'row',
    width: 120,
    backgroundColor: '#ffefe5',
    height: 35,
    justifyContent: 'center',
    alignSelf: 'flex-start'
  },
  verifiedBtnView: {
    flexDirection: 'row',
    width: 100,
    justifyContent: 'center',
    height: 30,
    marginLeft: 10
  },
  viewFinalpriceBtnStyle: {
    marginHorizontal: 30,
    marginBottom: 10,
    alignSelf: 'center'
  },
  viewFinalpriceBtnViewStyle: {
    flexDirection: 'row-reverse',
    flex: 6
  }
});
export default styles;
