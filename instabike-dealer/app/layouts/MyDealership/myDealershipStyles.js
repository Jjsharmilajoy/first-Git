import { StyleSheet } from 'react-native';
import Dimensions from 'Dimensions';
import variables from '../../theme/variables';
import fonts from '../../theme/fonts';

const DEVICE_HEIGHT = Dimensions.get('screen').height;
const DEVICE_WIDTH = Dimensions.get('screen').width;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F1F2'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#1C1C1C'
  },
  directionRow: {
    flex: 1,
    flexDirection: 'row',
  },
  sectionOneWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    borderRightColor: '#2E2C2C',
    borderRightWidth: 1
  },
  headerText: {
    color: 'white',
    fontSize: 16,
    fontFamily: fonts.sourceSansProBold
  },
  searchBoxStyle: {
    height: 50,
    color: 'white',
    width: 190,
  },
  body: {
    flex: 1,
    flexDirection: 'column'
  },
  bodyContent: {
    flex: 1
  },
  updateInventoryButton: {
    shadowOffset: {
      width: 5,
      height: 5,
    },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
    justifyContent: 'center',
    marginRight: 50,
    flex: 1,
  },
  editLinearButton: {
    borderRadius: 5,
    margin: 2,
    paddingTop: 4,
    paddingBottom: 4,
    flexDirection: 'row',
  },
  dealer_sec: {
    flex: 1,
    margin: 20,
    paddingHorizontal: 10,
    flexDirection: 'column'
  },
  dealer_hdr_sec: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  dealer_title: {
    color: '#4a4a4a',
    fontSize: 18,
    fontFamily: fonts.sourceSansProSemiBold
  },
  dealer_det_sec: {
    backgroundColor: 'white',
    padding: 20,
    marginTop: 10,
    borderRadius: 5,
    flexDirection: 'row',
    elevation: 2
  },
  dealer_logo: {
    borderRadius: 5,
    justifyContent: 'center',
    width: 130,
    height: 110,
    alignItems: 'center'
  },
  dealer_det_title: {
    fontFamily: fonts.sourceSansProRegular,
    color: '#7f7f7f',
    fontSize: 14,
    width: 110
  },
  dealer_det_desc: {
    fontFamily: fonts.sourceSansProSemiBold,
    color: '#282828',
    fontSize: 12,
    marginLeft: 30
  },
  mainDataContainer: {
    // margin: (DEVICE_WIDTH * 0.05),
    margin: 30,
    marginTop: 10,
    flex: 1,
    elevation: 4,
    shadowOffset: {
      width: 3,
      height: 3,
    },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    backgroundColor: '#FFFFFF',
    borderRadius: 3,
    height: (DEVICE_HEIGHT * 0.35),
  },
  textStyles: {
    color: '#224873',
  },
  financierListContainer: {
    height: (DEVICE_HEIGHT * 0.25),
    marginHorizontal: 10,
    marginVertical: (DEVICE_HEIGHT * 0.05),
  },
  financierItemContainer: {
    height: (DEVICE_HEIGHT * 0.22),
    width: (DEVICE_HEIGHT * 0.22),
    margin: DEVICE_HEIGHT * 0.02,
    borderRadius: 5,
    backgroundColor: 'white',
    elevation: 5,
    shadowOffset: {
      width: 3,
      height: 3,
    },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  financierItemImageStyle: {
    height: (DEVICE_HEIGHT * 0.16),
    width: (DEVICE_HEIGHT * 0.16),
    margin: 18,
    resizeMode: 'center',
  },
  unSelectedItemBlock: {
    flexDirection: 'row',
    paddingBottom: 5,
    borderWidth: 1,
    borderColor: '#DCE8FA',
    backgroundColor: '#FFFFFF',
  },
  selectedItemBlock: {
    flexDirection: 'row',
    paddingBottom: 5,
    borderWidth: 1,
    borderColor: '#d6d7da',
    backgroundColor: '#F1F6FD',
  },
  selectedRadioBtnView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unSelectedRadioBtnView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unSelectedRadioBtnStyle: {
    paddingTop: 10,
    backgroundColor: 'red',
    width: 20,
    height: 20,
    justifyContent: 'center',
    marginHorizontal: 20
  },
  selectedrRadioBtnStyle: {
    paddingTop: 10,
    backgroundColor: 'green',
    width: 20,
    height: 20,
    justifyContent: 'center',
    marginHorizontal: 20
  },
  sliderHeaderStyles: {
    marginHorizontal: 0,
    height: 50
  },
  headerInstabikeBgViewStyle: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 5,
    margin: 10,
    width: 100,
    alignItems: 'center'
  },
  headerSeperatorStyle: {
    width: 1,
    marginHorizontal: 20,
    backgroundColor: 'lightgray'
  },
  seperatorView: {
    height: 2,
    backgroundColor: '#F1F1F1',
    marginBottom: 10,
    marginHorizontal: 10,
  },
  popUpViewStyle: {
    marginHorizontal: (DEVICE_WIDTH * 0.25),
    marginVertical: (DEVICE_HEIGHT * 0.1),
    backgroundColor: 'white',
    flex: 1,
    borderRadius: 10,
    flexDirection: 'column',
    elevation: 5,
    shadowOffset: {
      width: 3,
      height: 3,
    },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  resetViewStyle: {
    marginHorizontal: (DEVICE_WIDTH * 0.25),
    marginVertical: (DEVICE_HEIGHT * 0.05),
    borderRadius: 0,
  },
  resetHeaderText: {
    fontSize: 16
  },
  userInputContainer: {
    marginTop: 0,
    marginBottom: 0,
    backgroundColor: '#fff',
    width: DEVICE_WIDTH / 3,
  },
  addNewBtnStyle: {
    width: (DEVICE_WIDTH * 0.3),
    height: 50,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: '#007CDA',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#fff',
    alignSelf: 'center',
    marginVertical: 20
  },
  withFinancierSelected: {
    width: (DEVICE_WIDTH * 0.5) / 4,
    height: (DEVICE_WIDTH * 0.5) / 4,
    borderRadius: 5,
    borderColor: '#ee4b40',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    margin: (DEVICE_WIDTH * 0.015),
  },
  withoutFinancierSelected: {
    width: (DEVICE_WIDTH * 0.5) / 4,
    height: (DEVICE_WIDTH * 0.5) / 4,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    margin: (DEVICE_WIDTH * 0.015),
    elevation: 2,
    shadowOffset: {
      width: 1,
      height: 1,
    },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  imageStyle: {
    width: (DEVICE_WIDTH * 0.6) / 6,
    height: (DEVICE_WIDTH * 0.2) / 4,
    resizeMode: 'center',
  },
  addNewFinancierStyle: {
    width: (DEVICE_WIDTH * 0.3),
    height: 50,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#fff',
    alignSelf: 'center',
    paddingBottom: 10
  },
  closeBtnStyle: {
    width: 40,
    height: 40,
    position: 'absolute',
    right: 0,
    top: 0,
    alignItems: 'center',
    backgroundColor: '#f26537'
  },
  chooseFianancierTitleTextStyle: {
    fontFamily: fonts.sourceSansProSemiBold,
    fontSize: 18,
    color: '#645e5c',
    textAlign: 'center',
    marginTop: 20,
  },
  yourFinancierTextStyle: {
    fontFamily: fonts.sourceSansProSemiBold,
    fontSize: 14,
    color: '#4a4a4a',
    padding: 10,
    marginLeft: 20
  },
  continuosSectionView: {
    backgroundColor: 'white',
    height: 60
  },
  addFinancierView: {
    backgroundColor: '#fff8ee',
    borderColor: '#ff5a11',
    borderWidth: 2,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  addFinancierImageStyle: {
    width: 40,
    height: 40,
    resizeMode: 'center',
  },
  closeIconView: {
    width: 20,
    height: 20,
    position: 'absolute',
    right: 0,
    top: 0,
    backgroundColor: '#f26537',
    alignItems: 'center',
    justifyContent: 'center'
  },
  addFinancierHeaderTextStyle: {
    fontFamily: fonts.sourceSansProSemiBold,
    fontSize: 16,
    color: '#4a4a4a',
    marginLeft: 20,
    marginTop: 20
  },
  toastView: {
    backgroundColor: '#EF7432',
    height: 50,
    position: 'absolute',
    top: 50,
    right: 30,
    justifyContent: 'center',
  },
  toastTextStyle: {
    padding: 10,
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold'
  },
  product_sum_sec: {
    marginHorizontal: 30
  },
  product_sum_title: {
    fontFamily: fonts.sourceSansProSemiBold,
    fontSize: 14,
    color: '#4a4a4a'
  },
  product_sum_scroll: {
    height: 300,
    backgroundColor: 'blue'
  },
  product_card: {
    height: 160,
    backgroundColor: 'white',
    borderRadius: 5,
    elevation: 3,
    marginBottom: 15,
    marginRight: 17,
    flexDirection: 'row',
    padding: 10
  },
  product_name: {
    fontFamily: fonts.sourceSansProSemiBold,
    fontSize: 14,
    color: '#282828'
  },
  product_variant: {
    fontFamily: fonts.sourceSansProRegular,
    fontSize: 12,
    color: '#a4a4a4'
  },
  bikeImageResolution: {
    width: 140,
    height: 100,
    marginTop: 10
  },
  units_sold: {
    marginBottom: 10,
    elevation: 1
  },
  units_sold_title: {
    fontFamily: fonts.sourceSansProRegular,
    fontSize: 12,
    color: 'white'
  },
  units_value: {
    fontFamily: fonts.sourceSansProBold,
    fontSize: 14,
    color: '#fff'
  },
  leads_created: {
    backgroundColor: '#e9e9e9',
    borderRadius: 5,
    marginBottom: 10,
    elevation: 1,
    paddingHorizontal: 5,
    paddingVertical: 2
  },
  leads_created_title: {
    fontFamily: fonts.sourceSansProRegular,
    fontSize: 12,
    color: '#5f5b5b',
    marginBottom: 0
  },
  leads_created_value: {
    fontFamily: fonts.sourceSansProBold,
    fontSize: 14,
    color: '#4a4a4a'
  },
  filterDateContainer: {
    width: 200,
    flexDirection: 'row',
    elevation: 5,
    shadowOffset: {
      width: 10,
      height: 10,
    },
    backgroundColor: 'white',
    shadowRadius: 5,
    borderRadius: 2,
    shadowOpacity: 0.8,
    borderColor: '#ff743f',
    borderWidth: 1
  },
  filterDateContent: {
    width: 100,
    height: 38,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
    borderRightWidth: 1,
    borderRightColor: '#ff743f',
    flexDirection: 'row'
  },
  filterDateText: {
    fontSize: 12,
    alignSelf: 'center',
    color: '#475fdd'
  },
  filterDateFormattedText: {
    fontSize: 14,
    alignSelf: 'center',
    color: '#3e3939'
  },
  filter_rgt_sec: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end'
  },
  product_sum_pos_set: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  dropdownContainer: {
    marginBottom: 20,
    borderRadius: 6,
    width: DEVICE_WIDTH / 3,
    maxHeight: 400,
    flex: 1,
  },
  selectDropdownTextField: {
    fontSize: 14,
    fontFamily: fonts.sourceSansProRegular,
    color: variables.charcoalGrey,
  },
  confirmBtn: {
    backgroundColor: variables.apricot,
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6
  },
  confirmText: {
    fontSize: 16,
    fontFamily: fonts.sourceSansProBold,
    color: variables.charcoalGrey,
  },
  selectToggle: {
    width: 200,
    marginHorizontal: 10
  },
  greenTickImageStyle: {
    height: 20,
    width: 20,
    marginLeft: 5
  },
  noFinanciersText: {
    marginVertical: 80,
    alignSelf: 'center',
    fontFamily: fonts.sourceSansProBold,
    fontSize: 22,
    flex: 1
  },
  fieldContainer: {
    width: (DEVICE_WIDTH / 3) + 90,
    borderWidth: 1,
    borderColor: variables.textInputBorderColor
  },
  fieldValue: {
    fontSize: 15,
    fontFamily: fonts.sourceSansProRegular,
    color: variables.charcoalGrey,
  },
  addInfo: {
    alignSelf: 'flex-start',
    fontSize: 14,
    color: variables.addInfoTextColor,
    marginHorizontal: 5,
    marginVertical: 5
  },
  dateTimeView: {
    alignItems: 'center',
    width: DEVICE_WIDTH / 4,
    justifyContent: 'center'
  },
  detailTextInputStyle: {
    color: '#4a4a4a',
    fontFamily: fonts.sourceSansProSemiBold,
    fontSize: 17,
  },
  emailFieldContainer: {
    borderColor: '#bdbdbf',
    borderWidth: 1,
    width: 200,
    height: 40,
    fontSize: 15,
    fontFamily: fonts.sourceSansProRegular,
    marginTop: 10,
  },
  leadReportApplyView: {
    alignItems: 'center',
    width: DEVICE_WIDTH / 4,
    justifyContent: 'flex-end',
    marginRight: 15,
  }
});

export const HeaderStyles = StyleSheet.create({
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
    color: '#f16238',
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
});
