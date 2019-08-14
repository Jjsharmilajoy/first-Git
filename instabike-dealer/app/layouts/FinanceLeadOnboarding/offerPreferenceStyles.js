import { StyleSheet, Dimensions } from 'react-native';
import fonts from '../../theme/fonts';
import variables from '../../theme/variables';

const DEVICE_WIDTH = Dimensions.get('screen').width;
const DEVICE_HEIGHT = Dimensions.get('screen').height;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  continueBtnContainer: {
    flex: 3,
    flexDirection: 'row',
    marginHorizontal: 50,
    alignItems: 'center',
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
    left: 180,
    top: 40,
    height: 30
  },
  editBtntextStyle: {
    color: '#EF7432',
    padding: 5,
    backgroundColor: 'white',
    fontFamily: fonts.sourceSansProSemiBold,
    fontSize: 14
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
  }

});
export default styles;
