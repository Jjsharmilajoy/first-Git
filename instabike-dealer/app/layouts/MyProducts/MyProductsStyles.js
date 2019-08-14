
import { StyleSheet, Dimensions } from 'react-native';
import fonts from '../../theme/fonts';
import colors from '../../theme/variables';
const DEVICE_WIDTH = Dimensions.get('screen').width;
const { width, height } = Dimensions.get('screen');

const modalHeight = height;
const modalWidth = width;

const styles = StyleSheet.create({
  paddingTen: {
    padding: 10
  },
  cardWrapper: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    elevation: 2,
    borderRadius: 3
  },
  cardImage: {
    padding: 20,
    justifyContent: 'center',
    flexDirection: 'row',
    flex: 3
  },
  imageResolution: {
    width: 75,
    height: 75
  },
  vehicleName: {
    color: '#282828',
    fontSize: 14,
    fontFamily: 'SourceSansPro-Semibold'
  },
  vehicleSlug: {
    fontSize: 12,
    color: '#C0CCD8'
  },
  cardRightWrapper: {
    justifyContent: 'space-around',
    paddingRight: 10,
    paddingVertical: 10,
    flex: 1.6
  },
  displacementWrapper: {
    flexDirection: 'row'
  },
  displacement: {
    height: 50,
    width: 50,
    backgroundColor: '#E9EEF8',
    marginRight: 10
  },
  displacementStyles: {
    color: '#898989',
    fontSize: 13
  },
  engineWrapper: {
    marginLeft: 2,
    marginBottom: 2,
    color: '#898989',
    fontWeight: 'normal',
    fontSize: 7
  },
  engine: {
    color: '#6784A0',
    fontSize: 14
  },
  rightPaneWrapper: {
    flexDirection: 'row'
  },
  fuelEfficiencyWrapper: {
    height: 50,
    width: 50,
    backgroundColor: '#898989',
    marginRight: 10
  },
  fuelEfficiencyText: {
    color: '#898989',
    fontSize: 13
  },
  mileageLabelStyle: {
    color: '#6784A0',
    fontSize: 14
  },
  rowMarginRight10: {
    flexDirection: 'row'
  },
  weightWrapper: {
    height: 50,
    width: 50,
    backgroundColor: '#E9EEF8',
    marginRight: 10
  },
  weightStyle: {
    color: '#898989',
    fontSize: 13
  },
  weightLabel: {
    color: '#6784A0',
    fontSize: 14
  },
  rowCenter: {
    flexDirection: 'row',
    justifyContent: 'center'
  },
  addToCompareCheckbox: {
    flexDirection: 'column',
    justifyContent: 'space-around',
    marginLeft: 10
  },
  marginTop10: {
    marginTop: 10
  },
  flexOne: {
    flex: 1,
    backgroundColor: '#F1F1F2'
  },
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  directionRow: {
    flexDirection: 'row',
  },
  backButtonWrapper: {
    paddingRight: 10,
    justifyContent: 'center'
  },
  backButtonStyle: {
    width: 40,
    height: 40
  },
  searchTextBox: {
    backgroundColor: '#D6DCEC'
  },
  paddingRight10: {
    paddingRight: 10
  },
  saveButtonWrapper: {
    padding: 10,
    backgroundColor: '#E9EEF8'
  },
  sectionTwoWrapper: {
    elevation: 3,
    marginRight: 21,
    marginLeft: 17,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10
  },
  vehicleCheckbox: {
    backgroundColor: '#FFF7ED',
    borderColor: '#f79426',
    borderRadius: 5,
    borderWidth: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    marginLeft: 10,
    paddingHorizontal: 3
  },
  vehicleNameWrapper: {
    borderRadius: 15,
    borderColor: '#EBF4FB',
    borderWidth: 15
  },
  vehicleNameView: {
    marginTop: 3,
    paddingHorizontal: 5
  },
  vehicleTextColor: {
    fontSize: 12,
    fontFamily: 'SourceSansPro-Regular',
    color: '#191919'
  },
  cancelVehicleWrapper: {
    width: 70
  },
  leftArrowContainer: {
    height: 20,
    width: 20
  },
  SectionTworightPaneWrapper: {
    backgroundColor: '#3F92DD',
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 25
  },
  compareButtonWrapper: {
    marginTop: 3
  },
  compareButtonColor: {
    color: 'white'
  },
  activeVehicleCheckbox: {
    marginLeft: 5,
    backgroundColor: '#116ACC',
    paddingHorizontal: 8,
    paddingVertical: 2,
    justifyContent: 'center'
  },
  activeCheckBox: {
    color: 'white',
    textAlign: 'center'
  },
  cardName: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20
  },
  paddingTopTen: {
    paddingTop: 10
  },
  checkboxTextStyle: {
    fontFamily: 'SourceSansPro-Semibold',
    fontSize: 13,
    color: '#f79426',
    borderRadius: 4
  },
  bikeCardImage: {
    flexDirection: 'row',
    justifyContent: 'flex-start'
  },
  cardListWrapper: {
    flex: 1,
    backgroundColor: '#f2f2f2',
    marginLeft: 6
  },
  buttonLeftImage: {
    height: 20, width: 20
  },
  buttonLeftImageText: {
    color: '#13426C'
  },
  bikeImageResolution: {
    width: 190,
    height: 110,
  },
  cardBottomView: {
    flexDirection: 'row',
    borderTopColor: '#F1F1F1',
    borderTopWidth: 0.5,
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginHorizontal: 10,
    justifyContent: 'flex-start',
    alignItems: 'center'
  },
  onRoadPrice: {
    color: '#a4a4a4',
    fontSize: 11
  },
  priceValue: {
    color: '#34323b',
    fontSize: 15,
    fontWeight: 'bold'
  },
  testRideButtonColor: {
    backgroundColor: '#f79426'
  },
  testRideButtonTextStyle: {
    color: '#ffffff',
    fontSize: 11
  },
  compareButtonWrapperCenter: {
    justifyContent: 'center',
    paddingHorizontal: 8
  },
  clearAllButton: {
    borderBottomWidth: 1,
    borderBottomColor: '#191919',
    alignSelf: 'center'
  },
  clearAllText: {
    fontFamily: 'SourceSansPro-Regular',
    fontSize: 13
  },
  sectionOneWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    borderRightColor: '#2E2C2C',
    borderRightWidth: 1
  },
  whiteColor: {
    color: 'white',
  },
  searchBoxStyle: {
    height: 40,
    color: 'white',
    width: DEVICE_WIDTH - 310,
    alignContent: 'center',
    alignSelf: 'center',
  },
  checkBoxTouchable: {
    width: 18,
    height: 18,
    borderRadius: 20,
    borderColor: '#d5d5d5',
    borderWidth: 2,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center'
  },
  starContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 2,
    justifyContent: 'space-between',
    flexDirection: 'row'
  },
  preferTextView: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 5
  },
  preferTextStyle: {
    fontSize: 12,
    color: '#f36e35',
    fontWeight: 'normal'
  },
  closeIconDimensions: {
    width: 50,
    height: 50,
    borderRadius: 4
  },closeBtnView: {
    width: 40,
    height: 40,
    right: 0,
    top: 0,
    alignItems: 'center',
    backgroundColor: '#f26537',
    alignSelf: 'flex-end',
    borderRadius: 4
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
  }, offerTitleModalContent: {
    width: modalWidth / 2.75,
    height: 50,
    borderRadius: 4
  },offerTitleText: {
    paddingHorizontal: 10,
    paddingVertical: 15,
    fontFamily: fonts.sourceSansProRegular,
    fontSize: 15,
    color: colors.offerBlack,
    textAlign: 'left',
  },modalCloseView: {
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
