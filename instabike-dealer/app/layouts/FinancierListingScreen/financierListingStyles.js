import { StyleSheet } from 'react-native';
import Dimensions from 'Dimensions';
import variables from '../../theme/variables';
import fonts from '../../theme/fonts';

const DEVICE_HEIGHT = Dimensions.get('screen').height;
const DEVICE_WIDTH = Dimensions.get('screen').width;

const styles = StyleSheet.create({
  conatainer: {
    flex: 1,
    backgroundColor: '#f2f2f2'
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
  exchangeContentText: {
    paddingTop: 10,
    height: 40,
    color: 'white',
  },
  detailsSection: {
    flex: 2,
  },
  bankListSection: {
    flex: 8,
  },
  continueSection: {
    flex: 2,
    flexDirection: 'row',
    marginHorizontal: 50,
    alignItems: 'center',
  },
  detailSectionView: {
    flex: 1,
    backgroundColor: 'white',
    elevation: 3
  },
  detailHeaderView: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#e9e9e9'
  },
  detailValueView: {
    flex: 5,
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
    fontSize: 16,
    marginLeft: 8
  },
  detailValueTextStyle: {
    flex: 1,
    color: '#454545',
    // textAlign: 'left',
    fontFamily: fonts.sourceSansProRegular,
    fontSize: 16,
    marginLeft: 20,
    alignSelf: 'center',
    textAlignVertical: 'center',
    textAlign: 'center'
  },
  bankListTableView: {
    margin: 30
  },
  bankListHeaderView: {
    flex: 1,
    marginVertical: 10,
    marginHorizontal: 30,
    backgroundColor: 'white',
    height: 100
  },
  fieldContainer: {
    borderColor: '#bdbdbf',
    borderWidth: 1,
    width: 100,
    height: 30,
    fontSize: 15,
    fontFamily: fonts.sourceSansProRegular,
    paddingLeft: 10,
    marginTop: 10,
    padding: 0
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
  closeBtnView: {
    width: 40,
    height: 40,
    position: 'absolute',
    right: 0,
    top: 0,
    alignItems: 'center',
    backgroundColor: '#f26537'
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#8c8d91'
  },
  modalDataContainer: {
    flex: 1,
    margin: 50,
    backgroundColor: 'white'
  },
  modalHeaderText: {
    color: '#1c1c1c',
    fontFamily: fonts.sourceSansProSemiBold,
    fontSize: 17,
    marginHorizontal: 20,
    marginVertical: 30,
  },
  calculateExchangeBtnStyle: {
    height: 40,
    width: 300,
    backgroundColor: '#f37730',
    alignItems: 'center'
  },
  calculateExchangeBtnTextStyle: {
    color: 'white'
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
    backgroundColor: 'white',
    elevation: 3,
    margin: 10,
    flexDirection: 'row',
    alignItems: 'center'
  },
  exchangeValueDropDown: {
    width: 300,
    marginLeft: 10,
    marginTop: 0
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
  financierEditBtnViewStyle: {
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
    fontSize: 15
  },
  ApplyBtnStyle: {
    height: 25,
    width: 50,
    backgroundColor: '#f37730',
    alignItems: 'center',
    justifyContent: 'center'
  },
  ApplyBtnTextStyle: {
    color: 'white'
  },
  noLeadsText: {
    marginVertical: 80,
    alignSelf: 'center',
    fontFamily: fonts.sourceSansProBold,
    fontSize: 22
  },
  newLeadsView: {
    height: DEVICE_HEIGHT / 3,
    alignItems: 'center',
    justifyContent: 'center'
  }
});
export default styles;
