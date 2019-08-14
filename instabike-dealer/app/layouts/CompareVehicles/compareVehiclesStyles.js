import { StyleSheet, Dimensions } from 'react-native';
import fonts from '../../theme/fonts';
import variables from '../../theme/variables';

const DEVICE_WIDTH = Dimensions.get('screen').width;
const DEVICE_HEIGHT = Dimensions.get('screen').height;

const styles = StyleSheet.create({
  scrollContainer: {
    height: DEVICE_HEIGHT,
    width: DEVICE_WIDTH,
    backgroundColor: '#ececec'
  },
  topCardView: {
    flex: 1,
    width: DEVICE_WIDTH,
    backgroundColor: 'white',
    flexDirection: 'row'
  },
  currentVehicleNameView: {
    height: 50,
    width: (DEVICE_WIDTH) / 3,
    backgroundColor: '#fff8ee',
    textAlign: 'center',
    textAlignVertical: 'center',
    borderColor: '#f99e76',
    borderWidth: 1,
    marginTop: 5,
    fontFamily: fonts.sourceSansProBold,
    fontSize: 16
  },
  vehicleNameViewStyles: {
    justifyContent: 'center',
    alignItems:'center',
    height: 40
  },
  vehicleNameViewTextStyles: {
    textAlign: 'center',
    color: '#454545',
    fontFamily: fonts.sourceSansProBold,
    fontSize: 16,
  },
  vehicleCardView: {
    width: (DEVICE_WIDTH) / (DEVICE_WIDTH >= 640 && DEVICE_WIDTH <= 760 ? 3.45 : 3),
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    margin: 5,
    borderRadius: 5
  },
  vehicleImageStyle: {
    width: (DEVICE_WIDTH - 230) / 3,
    height: DEVICE_HEIGHT / 4
  },
  vehiclePriceTextStyle: {
    color: '#34323b',
    fontFamily: fonts.sourceSansProBold,
    fontSize: 17,
  },
  vehiclePriceTitleTextStyle: {
    color: '#a4a4a4',
    fontFamily: fonts.sourceSansProRegular,
    fontSize: 12,
  },
  viewDetailsButtonTextStyle: {
    color: '#f36e35',
    fontFamily: fonts.sourceSansProSemiBold,
    fontSize: 14,
  },
  viewDetailsBtnStyle: {
    backgroundColor: 'white',
    marginRight: 10
  },
  scheduleTestRideBtnStyle: {
    height: 30,
    backgroundColor: '#f37730',
    flex: 1,
    marginLeft: 10,
    marginBottom: 20,
    marginRight: 5,
    borderRadius: 5
  },
  financeBtnStyle: {
    height: 35,
    justifyContent: 'center',
    borderWidth: 1,
    backgroundColor: 'white',
    borderColor: '#f8d9d9',
    marginRight: 10,
    marginLeft: 5,

    borderRadius: 5,
    flex: 1
  },
  scheduleTestRideBtnTextStyle: {
    color: 'white',
    fontFamily: fonts.sourceSansProBold,
    fontSize: 10,
  },
  financeBtnTextStyle: {
    color: '#f58b59',
    fontFamily: fonts.sourceSansProBold,
    fontSize: 11,
  },
  closeBtnStyle: {
    position: 'absolute',
    width: 30,
    height: 30,
    right: 10,
    top: 10,
    zIndex: 999,
  },
  addVehicleBtnView: {
    alignSelf: 'center',
    width: 50,
    height: 50,
    borderColor: '#f8d9d9',
    borderWidth: 1,
    backgroundColor: '#fff8ee',
    alignItems: 'center',
    justifyContent: 'center'
  },
  addImageIconView: {
    width: 30,
    height: 30
  },
  addNewBtnTextColor: {
    color: '#f36e35',
    fontFamily: fonts.sourceSansProBold,
    fontSize: 13,
    margin: 10
  },
  specsView: {
    marginTop: 10,
  },
  SpecBtnStyle: {
    height: 30,
    flex: 1,
    flexDirection: 'row',
    elevation: 2,
    alignItems: 'center',
    backgroundColor: 'gray'
  },
  specTitleFlatListStyle: {
    width: 200,
    borderTopWidth: 1,
    borderColor: '#e5e5e5'
  },
  vehicleSpecFlatListStyle: {
    width: (DEVICE_WIDTH - 200) / 3,
    borderTopWidth: 1,
    borderColor: '#e5e5e5'
  },
  SpecsMainTitleTextStyle: {
    color: 'white',
    fontFamily: fonts.sourceSansProSemiBold,
    fontSize: 15,
    marginLeft: 10,
  },
  specArrowImageStyle: {
    width: 20,
    height: 20,
    marginRight: 20
  },
  dummyView: {
    width: (DEVICE_WIDTH - 200) / 3
  },
  showOrHideIconTextStyle: {
    fontFamily: fonts.sourceSansProBold,
    fontSize: 25,
    marginRight: 20,
    elevation: 3,
    color: 'white',
  },
  VehiclesFlatlistViewStyles: {
    position: 'absolute',
    top: 0,
    marginBottom: 0,
    justifyContent: 'center',
    height: DEVICE_HEIGHT / 2,
    width: DEVICE_WIDTH,
    backgroundColor: '#0f0b0b'
  },
  vehiclesFlatListTextStyle: {
    color: 'white',
    textAlign: 'center'
  },
  vehicleNameHeaderViewStyle: {
    position: 'absolute',
    width: DEVICE_WIDTH,
    height: 40,
    flexDirection: 'row',
    backgroundColor: '#fff8ee',
    marginTop: 40
  },
  headerVehicleNameTextStyle: {
    color: '#f58b59',
    fontFamily: fonts.sourceSansProSemiBold,
    fontSize: 18,
    width: (DEVICE_WIDTH - 200) / 3,
    textAlign: 'left',
    textAlignVertical: 'center',
    paddingLeft: 10,
    borderLeftColor: '#c0c0c0',
  },
  specTitleFlatListCellView: {
    height: 50,
    borderColor: '#c0c0c0',
    borderRightWidth: 1,
    borderBottomWidth: 1,
    backgroundColor: '#ececec',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  specFlatListTitleTextStyle: {
    marginLeft: 10,
    color: '#8b8989'
  },
  specValueFlatListCellView: {
    height: 50,
    borderColor: '#c0c0c0',
    borderRightWidth: 1,
    borderBottomWidth: 1,
    alignItems: 'flex-start',
    justifyContent: 'center'
  },
  specValueFlatListTitleTextStyle: {
    marginLeft: 10,
    color: '#4a4a4a'
  },
  vehicleImageFlatList: {
    height: ((DEVICE_HEIGHT - 100) / 2) - 70,
    width: ((DEVICE_HEIGHT - 100) / 2) - 50,
    resizeMode: 'contain',
  },
  onroadPriceView: {
    flexDirection: 'column',
    height: 40,
    alignItems: 'flex-start',
    marginLeft: 10,
    flex: 1
  },
  variantPickerView: {
    flexDirection: 'row',
    height: 50,
    marginTop: 10,
  },
  variantPickerBorderView: {
    flex: 1,
    borderColor: '#f8d9d9',
    borderWidth: 1,
    height: 35,
    marginHorizontal: 10,
    borderRadius: 5,
  },
  showOrHideView: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end'
  },
  arrowImageStyle: {
    marginRight: 20
  },
  toolTipStyle: {
    marginLeft: 5
  },
  headerTextContent: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 30,
    borderRightColor: '#2E2C2C',
    borderRightWidth: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    flex: 1,
  },
  proceedButtonTextStyle: {
    color: 'white',
    fontFamily: fonts.sourceSansProBold,
    fontSize: 17,
  },
  proceedBtnStyle: {
    width: 200,
    marginBottom: 10
  },
  leadText: {
    justifyContent: 'center',
    paddingHorizontal: 5,
    fontFamily: fonts.sourceSansProRegular,
    fontSize: 12,
    color: variables.white
  },
  headerView: {
    height: 40,
    backgroundColor: '#2d2a29',
    flexDirection: 'row',
    zIndex: 3,
    elevation: 2
  },
  backbuttonStyle: {
    backgroundColor: '#2d2a29',
    width: 50,
    alignItems: 'center',
    justifyContent: 'center'
  },
  backArrowImageStyle: {
    width: 15,
    height: 15,
    alignSelf: 'center'
  },
  headerInlineSeperator: {
    width: 1,
    height: 40,
    backgroundColor: 'grey'
  },
  headerTextStyle: {
    fontSize: 15,
    fontFamily: fonts.sourceSansProRegular,
    color: 'white',
    marginHorizontal: 20,
    alignSelf: 'center'
  },
});
export default styles;
