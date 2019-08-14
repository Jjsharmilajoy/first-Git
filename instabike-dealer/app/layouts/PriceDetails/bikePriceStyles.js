import { StyleSheet, Dimensions } from 'react-native';
import fonts from '../../theme/fonts';
import colors from '../../theme/variables';

const DEVICE_HEIGHT = Dimensions.get('screen').height;
const DEVICE_WIDTH = Dimensions.get('screen').width;

const { width, height } = Dimensions.get('screen');
const modalHeight = height;
const modalWidth = width;

const bikePriceStyles = StyleSheet.create({
  container: {
    backgroundColor: '#F2F2F2',
    flex: 1,
  },
  scrollView: {
    paddingHorizontal: 72
  },
  closeIconDimensions: {
    width: 50,
    height: 50,
    borderRadius: 4
  },
  header: {
    backgroundColor: colors.headerBackgroundColor,
    flexDirection: 'row',
    height: 50
  },
  loanSplitView: {
    elevation: 4,
    marginTop: 20,
    marginHorizontal: 6,
    marginBottom: 6,
    backgroundColor: 'white'
  },
  loanSplitLabelView: {
    flexDirection: 'row',
    backgroundColor: '#e9e9e9',
  },
  loanSplitLabel: {
    color: '#5f5f5f',
    fontSize: 12,
    fontFamily: fonts.sourceSansProSemiBold,
    flex: 1,
    paddingVertical: 12,
    textAlign: 'center'
  },
  loanSplitValueView: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center'
  },
  loanSplitValue: {
    flex: 1,
    color: '#959595',
    fontSize: 12,
    textAlign: 'center',
    paddingVertical: 10
  },
  mainContainer: {
    // flexDirection: 'row',
    flex: 1,
    marginHorizontal: 40,
    marginVertical: 10,
  },
  bikeContainer: {
    flex: 2,
    backgroundColor: 'white',
    elevation: 4,
  },
  bikeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 22,
    marginVertical: 22
  },
  bikeSpecsView: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  bikeSpecsBoldText: {
    fontFamily: fonts.sourceSansProBold,
    fontSize: 14,
    color: colors.blackColor
  },
  bikeSpecLightText: {
    color: colors.warmGrey,
    fontSize: 10,
    marginLeft: 2,
    fontFamily: fonts.sourceSansProRegular
  },
  specLabelText: {
    fontFamily: fonts.sourceSansProRegular,
    fontSize: 14,
    color: colors.blackBikeSpec
  },
  bikeNameText: {
    fontFamily: fonts.sourceSansProSemiBold,
    fontSize: 12,
    color: colors.greyishBrown
  },
  bikeModelText: {
    fontFamily: fonts.sourceSansProBold,
    fontSize: 18,
    color: colors.greyishBrown
  },
  bikePriceLabel: {
    fontFamily: fonts.sourceSansProRegular,
    fontSize: 12,
    color: colors.warmGrey
  },
  bikePrice: {
    fontFamily: fonts.sourceSansProSemiBold,
    fontSize: 18,
    color: colors.charcoalGrey
  },
  breakdownContainer: {
    flex: 1,
    backgroundColor: 'white',
    elevation: 4,
    marginLeft: 10,
  },
  priceBreakdownText: {
    fontSize: 18,
    fontFamily: fonts.sourceSansProSemiBold,
    color: '#454545',
    marginLeft: 12,
    paddingVertical: 12
  },
  nameText: {
    fontSize: 12,
    fontFamily: fonts.sourceSansProRegular,
    color: 'white'
  },
  line: {
    height: 1,
    backgroundColor: '#E2E2E2'
  },
  breakdownLabelView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    alignItems: 'center',
  },
  priceText: {
    // fontFamily: fonts.sourceSansProSemiBold,
    fontSize: 12,
    color: colors.greyishBrown,
  },
  onRoadPrice: {
    fontFamily: fonts.sourceSansProSemiBold,
    fontSize: 15,
    color: colors.offerBlack,
  },
  onRoadPriceLabel: {
    fontFamily: fonts.sourceSansProSemiBold,
    fontSize: 15,
    color: colors.offerBlack,
  },
  financeText: {
    fontFamily: fonts.sourceSansProSemiBold,
    fontSize: 14,
    color: '#464646',
    marginTop: 12
  },
  modalContentWrapper: {
    backgroundColor: 'gray',
    position: 'absolute',
    width: modalWidth,
    height: modalHeight,
    opacity: 0.8
  },
  modalContent: {
    backgroundColor: 'white',
    width: modalWidth / 2.75,
    marginTop: 40,
    height: modalHeight / 2,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
    elevation: 3,
    shadowColor: 'gray'
  },
  accessoryModalContent: {
    backgroundColor: 'white',
    width: modalWidth / 2.75,
    marginTop: 40,
    justifyContent: 'space-between',
    height: modalHeight / 2,
    alignSelf: 'center',
    borderRadius: 4,
    elevation: 3,
    shadowColor: 'gray'
  },
  offerView: {
    flex: 1
  },
  onRoadView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5
  },
  offerAppliedView: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 14,
    height: 25,
  },
  offerBackground: {
    backgroundColor: '#6aec5130',
    flexDirection: 'row',
    padding: 2,
    alignItems: 'center',
    width: 80
  },
  offerTextStyle: {
    color: 'gray',
    fontSize: 12,
    fontFamily: fonts.sourceSansProSemiBold,
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
  deleteView: {
    flexDirection: 'row',
    marginLeft: 5,
    alignItems: 'center',
  },
  offerSavingText: {
    fontSize: 11,
    color: '#7f7f7f',
    marginHorizontal: 14,
    marginTop: 5,
    marginBottom: 5,
    fontFamily: fonts.sourceSansProRegular
  },
  savingPercentageBold: {
    fontSize: 12,
    fontFamily: fonts.sourceSansProBold,
    color: '#6fc511'
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

  offerInputStyle: {
    width: 200,
    borderColor: '#FDD2B8',
    borderWidth: 1,
    alignSelf: 'center',
  },
  offerAppliedText: {
    fontSize: 10,
    fontFamily: fonts.sourceSansProRegular,
    color: colors.offerBlack,
    marginLeft: 2
  },
  headerBack: {
    flex: 0.5,
    backgroundColor: '#4C4949',
    elevation: 4,
    alignItems: 'center',
    justifyContent: 'center'
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
  exchangeBikeValueStyle: {
    borderLeftColor: fonts.headerLine,
    borderLeftWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  bookTestRideView: {
    flex: 1,
    backgroundColor: '#494847',
    justifyContent: 'center',
    alignItems: 'center'
  },
  bookTestRideText: {
    color: colors.warmGrey,
    fontSize: 12,
    fontFamily: fonts.sourceSansProRegular
  },
  saveView: {
    flex: 0.5,
    display: 'none',
    backgroundColor: '#f79426',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4
  },
  bikePriceView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 22,
    alignItems: 'center',
    marginBottom: 30
  },
  availableColorView: {
    justifyContent: 'center',
    flex: 1,
    marginLeft: 10,
    alignItems: 'center',
  },
  amountPayableView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 14,
    paddingVertical: 10
  },
  helpFinanceText: {
    color: colors.warmGrey,
    fontSize: 10
  },
  applyButtonStyle: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 10
  },
  accessoriesView: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    flex: 1
  },
  accessoryTextView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2
  },
  accessoryText: {
    paddingHorizontal: 10,
    paddingVertical: 15,
    fontFamily: fonts.sourceSansProRegular,
    fontSize: 12,
    color: colors.offerBlack
  },
  availableColorText: {
    color: colors.greyishBrown,
    fontSize: 12,
    fontFamily: fonts.sourceSansProSemiBold
  },
  colorView: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorNormalView: {
    width: 20,
    height: 20,
    borderColor: 'grey',
    borderWidth: 2,
  },
  colorSelectedView: {
    width: 20,
    height: 20,
    borderColor: 'orange',
    borderWidth: 2,
  },
  onRoadPriceView: {
    flex: 1,
    marginLeft: 20
  },
  accessoryNameText: {
    flex: 1.5,
    fontSize: 12,
    color: colors.warmGrey,
    fontFamily: fonts.sourceSansProRegular
  },
  accessoryPriceText: {
    flex: 1,
    fontSize: 12,
    color: colors.warmGrey,
    fontFamily: fonts.sourceSansProRegular
  },
  accessoryRowView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    alignItems: 'center'
  },
  checkBoxView: {
    flex: 0.3,
    alignItems: 'center'
  },
  bikeSpecValueView: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  bikeImageStyle: {
    alignSelf: 'center',
    width: 500,
    height: 250
  },
  variantDropdownView: {
    borderColor: 'grey',
    borderWidth: 1,
    flex: 1,
  },
  variantView: {
    flex: 1,
    backgroundColor: '#6aec5130',
    justifyContent: 'center',
    height: 30
  },
  detailSectionView: {
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
    justifyContent: 'center',
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
  editBtnTextViewStyle: {
    color: '#EF7432',
    padding: 5,
    backgroundColor: 'white',
    fontFamily: fonts.sourceSansProSemiBold,
    fontSize: 18
  },
  modalMainContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#e6e6e7',
    height: DEVICE_HEIGHT,
  },
  closeBtnView: {
    width: 40,
    height: 40,
    right: 0,
    top: 0,
    alignItems: 'center',
    backgroundColor: '#f26537',
    alignSelf: 'flex-end',
    borderRadius: 4
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
  goToHome: {
    backgroundColor: colors.dustyOrange
  },
  modalconatiner: {
    flex: 1,
    backgroundColor: 'white'
  },
  trashIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 5,
    marginVertical: 5
  },
  continueBtnStyle: {
    marginHorizontal: 10
  },
  testRideStatus: {
    marginHorizontal: 12
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
  modalContainer: {
    flex: 1,
    backgroundColor: '#8c8d91',
  },
  scrollViewContainer: {
    width: DEVICE_WIDTH,
    height: DEVICE_HEIGHT
  },
  modalDataContainer: {
    flex: 1,
    margin: 30,
    backgroundColor: 'white'
  },
  modalHeaderText: {
    color: '#1c1c1c',
    fontFamily: fonts.sourceSansProSemiBold,
    fontSize: 17,
    marginHorizontal: 20,
    marginVertical: 10,
  },
  calculateExchangeBtnStyle: {
    height: 40,
    backgroundColor: '#f37730',
    width: 200,
    marginRight: 10,
    marginLeft: 20,
    alignSelf: 'center',
    marginVertical: 20
  },
  calculateBtnStyle: {
    height: 40,
    width: 300,
    backgroundColor: 'white',
    borderColor: '#f37730',
    borderWidth: 1,
    alignItems: 'center'
  },
  calculateBtnTextStyle: {
    color: '#f37730'
  },
  editBtnViewStyle: {
    position: 'absolute',
    left: 215,
    top: 11,
    height: 25
  },
  financierEditBtnViewStyle: {
    width: 50,
    margin: 2,
    alignItems: 'center',
    justifyContent: 'center'
  },
  editBtntextStyle: {
    color: '#EF7432',
    padding: 5,
    backgroundColor: 'white',
    fontFamily: fonts.sourceSansProSemiBold,
    fontSize: 14
  },
  detailTextInputStyle: {
    color: '#4a4a4a',
    fontFamily: fonts.sourceSansProSemiBold,
    fontSize: 14,
  },
  headerBikeValueStyle: {
    flex: 1,
    borderLeftColor: fonts.headerLine,
    borderLeftWidth: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  headerBikeValueTextStyle: {
    color: colors.warmGrey,
    fontSize: 12,
    fontFamily: fonts.sourceSansProSemiBold,
  },
  cellContainer: {
    flex: 1,
    backgroundColor: 'white',
    height: 60,
    flexDirection: 'row'
  },
  iconView: {
    flex: 0.5,
    alignItems: 'center',
    justifyContent: 'center'
  },
  exchangeVehicleDetailView: {
    elevation: 3,
    backgroundColor: 'white',
    margin: 10
  },
  vehicleDropDownView: {
    flex: 1,
    flexDirection: 'row'
  },
  dropDowmOverView: {
    margin: 20,
    flex: 1
  },
  ecxhangeDetailOverView: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  exchangeValueDropDown: {
    width: 300,
    marginLeft: 10,
    marginTop: 0
  },
  sourceContainer: {
    // alignSelf: 'center',
    width: DEVICE_WIDTH / 2.5,
    marginHorizontal: 40,
    marginVertical: 10
  },
  actionLabel: {
    color: colors.greyishBrown,
    fontFamily: fonts.sourceSansProBold,
    fontSize: 14,
  },
  commentView: {
    borderColor: colors.commentBorderColor,
    borderWidth: 2,
    borderRadius: 2,
    marginTop: 10,
    backgroundColor: colors.commentBackground
  },
  saveBtnView: {
    margin: 10,
    marginTop: 30,
    flex: 1,
    flexDirection: 'row-reverse'
  },
  deleteIconView: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10
  },
  thrashIconStyle: {
    alignSelf: 'center',
    marginHorizontal: 5
  },
  exchangeOldBikeViewStyle: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center'
  },
  calculateBtnView: {
    flex: 1,
    flexDirection: 'row-reverse',
    margin: 10
  },
  continueBtnView: {
    flex: 1,
    flexDirection: 'row-reverse',
    alignItems: 'flex-end'
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
  PickerBorderView: {
    height: 35,
    marginHorizontal: 0,
  },
  PickerView: {
    flex: 1,
    justifyContent: 'center',
  },
  dropdownContainer: {
    marginBottom: 20,
    borderRadius: 6,
    width: DEVICE_WIDTH / 4,
    alignContent: 'center',
    alignSelf: 'center',
    marginTop: (DEVICE_HEIGHT / 2) - 100
  },
  selectDropdownTextField: {
    fontSize: 12,
    fontFamily: fonts.sourceSansProRegular,
    color: colors.charcoalGrey,
  },
  confirmBtn: {
    backgroundColor: colors.apricot
  },
  exchangeContentText: {
    paddingTop: 10,
    height: 40,
    color: 'white',
  },
  toolTipViewStyle: {
    width: 100,
    height: 100,
    position: 'absolute',
    top: 100,
    left: 50,
    zIndex: 99
  },
  toolTipBtnStyle: {
    width: 100,
    height: 100
  },
  toolTipImageStyle: {
    width: 100,
    height: 100
  },
  removeFinancierContainer: {
    backgroundColor: 'white',
    opacity: 0.9,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  removeFinancierView: {
    width: DEVICE_WIDTH / 3,
    height: 170,
    backgroundColor: 'white'
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
  reasonFieldContainer: {
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
  removefinancierBtnStyle: {
    width: 150
  },
  otherChargesReasonInputStyle: {
    width: 300,
    borderColor: '#FDD2B8',
    borderWidth: 1,
    alignSelf: 'center',
  },
  totalInsuranceStyle: {
    width: DEVICE_WIDTH / 6,
    alignSelf: 'center',
    justifyContent: 'center',
    borderColor: '#FDD2B8',
    borderWidth: 1,
    borderRadius: 4,
    marginHorizontal: 10,
    marginVertical: 5
  },
  otherChargesBackground: {
    flexDirection: 'row',
    padding: 2,
    alignItems: 'center',
  },
  offerTitleText: {
    paddingHorizontal: 10,
    paddingVertical: 15,
    fontFamily: fonts.sourceSansProRegular,
    fontSize: 15,
    color: colors.offerBlack,
    textAlign: 'left',
  },
  offerTitleModalContent: {
    width: modalWidth / 2.75,
    height: 50,
    borderRadius: 4
  },
  offerModalContent: {
    backgroundColor: 'white',
    width: modalWidth / 2.75,
    marginTop: 40,
    height: modalHeight / 2,
    alignSelf: 'center',
    alignItems: 'center',
    borderRadius: 4,
    elevation: 3,
    shadowColor: 'gray'
  },
  emialModalContent: {
    backgroundColor: 'white',
    width: modalWidth / 2.75,
    marginTop: 40,
    height: modalHeight / 3,
    alignSelf: 'center',
    alignItems: 'center'
  },
  offerModelContentView: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center'
  },
  emailIconStyle: {
    width: 50,
    borderLeftColor: fonts.headerLine,
    borderLeftWidth: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  followUpDateView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: 10,
  },
  dateView: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  followUpDone: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  scheduleFollowView: {
    flexDirection: 'row',
    margin: 10,
    marginHorizontal: 20,
    justifyContent: 'space-between',
  },
  newScheduleView: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  dateTimeView: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  actionLabel: {
    color: colors.greyishBrown,
    fontFamily: fonts.sourceSansProBold,
    fontSize: 14,
  },
  accessoryTappableIcon: {
    marginLeft: 10,
    width: 25,
    height: 25,
    alignItems: 'center',
    justifyContent: 'center',

  },
  accessoryImageIcon: {
    // marginLeft: 5,
    width: 20,
    height: 20,

  }
});

export default bikePriceStyles;
