import { StyleSheet, Dimensions } from 'react-native';
import fonts from '../../theme/fonts';

const DEVICE_HEIGHT = Dimensions.get('screen').height;
const DEVICE_WIDTH = Dimensions.get('screen').width;

const styles = StyleSheet.create({
  mainView: {
    flex: 1,
    backgroundColor: 'white'
  },
  mainContainer: {
    flex: 1,
    backgroundColor: 'white'
  },
  headerViewStyles: {
    height: 50,
    flexDirection: 'row',
    shadowOffset: {
      width: 3,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    backgroundColor: 'white',
  },
  addBtnStyle: {
    backgroundColor: '#4E92F3',
    height: 50,
    width: 50,
    alignItems: 'center',
    justifyContent: 'center'
  },
  notificationBtnStyle: {
    backgroundColor: 'white',
    width: 50,
  },
  overViewStyles: {
    display: 'none',
    backgroundColor: 'white',
  },
  flatListHeaderViewStyles: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    backgroundColor: '#5054DA',

  },
  flatListCellViewStyles: {
    backgroundColor: 'white',
    height: 69,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center'
  },
  itemSeparatorStyle: {
    backgroundColor: 'lightgray',
    height: 1.0,
    marginHorizontal: 20,
  },
  flatListHeaderTitleViewStyle: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flatListHeaderViewTextStyle: {
    color: '#34323b',
    paddingHorizontal: 10,
    textAlign: 'center',
    fontFamily: fonts.sourceSansProRegular,
    fontSize: 14,
  },
  unitScrollStyles: {
    height: DEVICE_HEIGHT - 260,
  },
  flatListViewStyles: {
    backgroundColor: 'lightgray',
    height: DEVICE_HEIGHT - 260,
  },
  FlatListCellStyle: {
    height: 70,
  },
  expandableTileContainer: {
    marginTop: 5,
    height: 50,
    width: 300,
    flexDirection: 'row'
  },
  springView: {
    borderRadius: 4,
    alignSelf: 'stretch',
    shadowOffset: {
      width: 3,
      height: 3,
    },
    backgroundColor: 'white',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 2,
    flex: 1,
    marginLeft: 10,
    marginRight: 10
  },
  searchBoxContainer: {
    flex: 0.8,
    backgroundColor: '#E9EEF8',
    justifyContent: 'flex-start',
    flexDirection: 'row',
  },
  searchTextStyle: {
    marginLeft: 16,
    color: '#8A9BB0'
  },
  searchTouchStyle: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  doneBtnStyle: {
    height: 40,
    width: 100,
    backgroundColor: '#4E92DF'
  },
  slotBtnStyle: {
    height: 40,
    backgroundColor: '#F2F6FC',
    marginHorizontal: 20,
    width: 100
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
  flatListContainerStyle: {
    margin: 20,
    backgroundColor: 'white',
    elevation: 2,
    shadowOffset: {
      width: 1,
      height: 1,
    },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  flatlistTextEntryView: {
    color: '#EF7432',
    marginHorizontal: 15,
    marginVertical: 3,
    backgroundColor: 'white',
    fontFamily: fonts.sourceSansProSemiBold,
    fontSize: 14
  },
  updateBtnStyle: {
    width: (DEVICE_WIDTH * 0.2),
    height: 50,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#fff',
    alignSelf: 'center',
  },
  detailTextStyle: {
    color: '#454545',
    fontSize: 14,
    fontFamily: fonts.sourceSansProRegular
  },
  detailTextInputStyle: {
    color: '#2c2c2c',
    fontFamily: fonts.sourceSansProSemiBold,
    fontSize: 17,
  },
  fieldContainer: {
    borderColor: '#EF7432',
    borderWidth: 1,
    width: DEVICE_WIDTH * 0.1,
    height: 40,
    fontSize: 15,
    fontFamily: fonts.sourceSansProRegular,
    paddingLeft: 10,
  },
  userInputTextStyle: {
    color: 'blue'
  },
  textInputViewStyle: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    margin: 20,
    alignItems: 'center'
  },
  modalMainContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#e6e6e7',
    height: DEVICE_HEIGHT
  },
  bikeInfoView: {
    width: DEVICE_WIDTH * 0.2,
    margin: 20,
    marginRight: 0,
    marginTop: 50,
    backgroundColor: 'white',
    height: DEVICE_HEIGHT - 140
  },
  offerFieldContainer: {
    borderColor: '#EF7432',
    borderWidth: 2,
    fontSize: 16,
    fontFamily: fonts.sourceSansProRegular,
    height: 100,
    marginTop: 10,
    position: 'absolute',
    top: 0,
    left: 0,
    marginRight: 30,
    width: DEVICE_WIDTH * 0.6

  },
  tabCurrentViewStyle: {
    height: (DEVICE_HEIGHT * 0.5),
  },
  rightTabView: {
    width: DEVICE_WIDTH * 0.6,
  },
  searchBoxStyle: {
    marginHorizontal: 10,
    height: 40,
    flex: 1,
  },
  toastView: {
    position: 'absolute',
    backgroundColor: '#EF7432',
    height: 30,
    top: 100,
    right: 50,
    justifyContent: 'center',
    zIndex: 9999
  },
  toastTextStyle: {
    marginLeft: 10,
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold'
  },
  searchViewStyle: {
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: '#D3D3D3',
    height: 40,
    marginTop: 20,
    flexDirection: 'row',
    marginBottom: 0,
  },
  searchImageStyle: {
    width: 20,
    height: 20,
    alignSelf: 'center',
    marginLeft: 10
  },
  flatListSeperator: {
    height: 1,
    flex: 1,
    backgroundColor: '#D3D3D3'
  },
  noProductsText: {
    marginVertical: 80,
    alignSelf: 'center',
    fontFamily: fonts.sourceSansProBold,
    fontSize: 22
  },
  noProductsView: {
    alignItems: 'center',
    justifyContent: 'center',
    height: DEVICE_HEIGHT - 360,
    width: DEVICE_WIDTH,
  },
  eachRowView: {
    height: 50,
    flexDirection: 'row'
  },
  eachRowTitleView: {
    flex: 1,
    flexDirection: 'row',
    marginHorizontal: 20,
    marginVertical: 10,
    justifyContent: 'flex-start'
  },
  onroadPricetextStyle: {
    color: '#2c2c2c',
    fontSize: 14,
    fontFamily: fonts.sourceSansProSemiBold
  },
  productImageViewFlatListCell: {
    flexDirection: 'row',
    flex: 2,
    alignItems: 'center',
  },
  productImageIconFlatListCell: {
    height: 40,
    width: 40,
    resizeMode: 'center',
    backgroundColor: 'white',
    marginLeft: 15
  },
  editBtnViewStyle: {
    borderColor: '#EF7432',
    borderWidth: 1,
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'center'
  },
  vehicleImageStyle: {
    height: 150,
    resizeMode: 'center',
    backgroundColor: 'white',
    padding: 10
  },
  vehicleDetailView: {
    flexDirection: 'column',
    height: 40,
    alignItems: 'flex-start',
    justifyContent: 'center'
  },
  vehicleNameTextStyle: {
    marginLeft: 30,
    fontSize: 16,
    fontFamily: fonts.sourceSansProSemiBold,
    flex: 4,
    color: '#454545',
  },
  vehicleVariantTextStyle: {
    fontSize: 14,
    fontFamily: fonts.sourceSansProRegular,
    textAlign: 'left',
    marginLeft: 20,
  },
  rightDetailCategoryView: {
    flex: 7,
    margin: 20,
    marginTop: 50,
    backgroundColor: 'white'
  },
  rightTabViewStyle: {
    flexDirection: 'row',
    margin: 20
  },
  rightDataContainerView: {
    height: 400,
    justifyContent: 'space-between'
  },
  updateBtnViewStyle: {
    alignSelf: 'flex-end',
    paddingRight: 20,
    paddingBottom: 20
  },
  closeBtnView: {
    width: 40,
    height: 40,
    position: 'absolute',
    right: 0,
    top: 0,
    alignItems: 'center',
    backgroundColor: '#f26537'
  },
  overviewTextStyles: {
    color: '#4a4a4a',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 20,
    marginTop: 20
  },
  gradientBtnstyle: {
    flex: 1,
    justifyContent: 'center',
    borderRadius: 5
  },
  gradientBtncountStyle: {
    fontSize: 22,
    alignSelf: 'center'
  },
  gradientBtntextStyle: {
    fontSize: 15,
    fontWeight: '400'
  },
  insuranceModeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    marginHorizontal: DEVICE_WIDTH / 6,
    width: DEVICE_WIDTH / 3
  },
  insuranceRadioButton: {
    flex: 1,
    borderColor: '#f26537',
    borderWidth: 1
  },
  insuranceRadioName: {
    margin: 10,
    alignSelf: 'center',
    color: '#cfd8dc',
    fontWeight: 'bold'
  }
});

export default styles;
