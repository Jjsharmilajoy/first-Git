import { StyleSheet, Dimensions } from 'react-native';
import fonts from '../../theme/fonts';
import variables from '../../theme/variables';

const { width, height } = Dimensions.get('screen');
const modalHeight = height;
const modalWidth = width;

const styles = StyleSheet.create({
  renderedTable: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
    marginHorizontal: 60,
    paddingHorizontal: 30,
    backgroundColor: 'white',
    borderBottomWidth: 2,
    borderBottomColor: '#F4F4F4',
    elevation: 2
  },
  tableName: {
    flex: 26,
    alignItems: 'flex-start',
    paddingRight: 5
  },
  tableNameTextStyle: {
    fontFamily: 'SourceSansPro-Regular',
    color: '#454545',
    fontSize: 13
  },
  tableItemCode: {
    flex: 25,
    alignItems: 'flex-start',
    paddingHorizontal: 2,
    justifyContent: 'center'
  },
  tableItemCodeText: {
    fontSize: 13,
    color: '#4a4a4a',
    fontFamily: 'SourceSansPro-Bold'
  },
  tablePrice: {
    flex: 10,
    alignItems: 'flex-start',
    paddingHorizontal: 5
  },
  tablePriceText: {
    fontFamily: 'SourceSansPro-Regular',
    color: '#4a4a4a',
    fontSize: 13
  },
  tableEdit: {
    flex: 10,
    marginLeft: 5,
    alignItems: 'flex-start',
    marginTop: 2,
    paddingHorizontal: 5
  },
  directionRow: {
    flexDirection: 'row'
  },
  tableEditImageStyle: {
    marginTop: 3
  },
  tableEditText: {
    marginLeft: 5,
    color: '#f79426',
    fontSize: 12,
    fontFamily: 'SourceSansPro-SemiBold'
  },
  tableAvailable: {
    flex: 15,
    alignItems: 'center',
    marginRight: 5
  },
  checkboxImageStyle: {
    height: 21,
    width: 21,
    marginTop: 3
  },
  tableMandatoryStyle: {
    flex: 15,
    alignItems: 'center',
    marginRight: 8
  },
  mainContainer: {
    backgroundColor: '#ffffff',
    paddingTop: 20,
    flex: 10
  },
  modalAndHeaderWrapper: {
    flex: 8,
    marginBottom: 100
  },
  modalContentWrapper: {
    backgroundColor: 'black',
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
    alignItems: 'flex-start',
    justifyContent: 'space-around',
    padding: 20
  },
  modalCloseIcon: {
    position: 'absolute',
    right: 0,
    top: 0
  },
  closeIconDimensions: {
    height: 30,
    width: 30
  },
  modalHeader: {
    fontFamily: 'SourceSansPro-SemiBold',
    fontSize: 15,
    color: '#4a4a4a',
    borderBottomWidth: 2,
    borderBottomColor: '#f79426',
    paddingBottom: 5
  },
  textOneStyle: {
    fontFamily: 'SourceSansPro-Regular',
    fontSize: 12,
    color: '#6f6f6f',
    paddingBottom: 4
  },
  textTwoStyle: {
    fontFamily: 'SourceSansPro-SemiBold',
    fontSize: 13,
    color: '#383737'
  },
  textThreeStyle: {
    fontFamily: 'SourceSansPro-Regular',
    fontSize: 12,
    color: 'red',
    bottom: 15
  },
  widthHundred: {
    width: 100
  },
  userInputTextStyle: {
    borderColor: '#ff9926',
    borderWidth: 1,
    width: 100
  },
  modalAvailableDimensions: {
    height: 21,
    width: 21
  },
  ml10: {
    marginLeft: 10
  },
  modalAvailableText: {
    fontFamily: 'SourceSansPro-Regular',
    fontSize: 13,
    color: '#4a4a4a'
  },
  accessoriesHeader: {
    flexDirection: 'row',
    justifyContent: 'center'
  },
  chooseAccessoriesWrapper: {
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center'
  },
  chooseAccessoriesText: {
    fontFamily: 'SourceSansPro-SemiBold',
    fontSize: 15,
    color: '#645e5c'
  },
  dropdownWrapper: {
    elevation: 1,
    borderColor: 'white',
    paddingLeft: 30
  },
  pickerStyle: {
    height: 35,
    width: 120
  },
  ml40: {
    marginLeft: 40
  },
  pt20: {
    paddingTop: 20
  },
  tableHeaderWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 60,
    backgroundColor: 'white',
    borderWidth: 0,
    borderColor: 'white',
    alignItems: 'center',
    elevation: 2,
    paddingHorizontal: 30,
    paddingVertical: 10
  },
  tableHeaderName: {
    flex: 25.5,
    alignItems: 'flex-start',
    flexDirection: 'row'
  },
  tableHeaderNameText: {
    fontFamily: 'SourceSansPro-SemiBold',
    fontSize: 13,
    color: '#454545',
    justifyContent: 'center'
  },
  height15: {
    height: 15
  },
  tableHeaderItemCode: {
    flex: 25.5,
    alignItems: 'flex-start',
    flexDirection: 'row'
  },
  tableHeaderItemCodeText: {
    fontFamily: 'SourceSansPro-SemiBold',
    fontSize: 13,
    color: '#454545'
  },
  tableHeaderPrice: {
    flex: 21,
    alignItems: 'flex-start',
    flexDirection: 'row',
  },
  tableHeaderText: {
    fontFamily: 'SourceSansPro-SemiBold',
    fontSize: 13,
    color: '#454545'
  },
  tableHeaderAvailable: {
    flex: 15,
    alignItems: 'center'
  },
  tableHeaderMandatory: {
    flex: 15,
    alignItems: 'center',
    marginRight: 5
  },
  noAccessories: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  flexTwo: {
    flex: 2
  },
  selfCenter: {
    alignSelf: 'center'
  },
  paddingVerticalTen: {
    paddingVertical: 10
  },
  tabSelectedStyle: {
    borderBottomColor: '#F17C3A',
    borderBottomWidth: 2,
    marginHorizontal: 15
  },
  tabTextStyle: {
    color: '#aaaeb3',
    fontSize: 15,
    fontFamily: fonts.sourceSansProRegular
  },
  tabSelectedTextStyle: {
    color: '#F17C3A',
    fontSize: 16,
    fontFamily: fonts.sourceSansProSemiBold
  },
  tabStyle: {
    marginHorizontal: 15
  },
  tabViewStyles: {
    height: 40,
    // backgroundColor: '#282121',
    flex: 7,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 15,
    shadowColor: variables.primaryIosShadowColor,
    shadowOffset: {
      width: 3,
      height: 3,
    },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    backgroundColor: '#fff',
  },
  tabBtnStyle: {
    width: modalWidth / 6,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center'
  },
  tabBtnTextStyle: {
    color: '#848588',
    alignSelf: 'center',
    fontFamily: fonts.sourceSansProRegular
  },
  scrollViewStyles: {
    flex: 1,
    backgroundColor: 'white',
  },
  leadOverviewStyle: {
    flex: 1,
    flexDirection: 'row',
    marginRight: 20,
  },
  leadCardOverviewStyle: {
    width: (modalWidth / 3),
    flex: 1,
    backgroundColor: '#e6e6e6',
    marginLeft: 20,
    marginTop: 20,
    marginRight: 20,
    marginBottom: 10,
    borderRadius: 4,
  },
  cardViewStyle: {
    flex: 1,
    backgroundColor: '#ffffff',
    margin: 20,
    marginBottom: 0,
    elevation: 2,
    borderRadius: 4,
  },
  leadHeaderView: {
    height: 50,
    width: modalWidth / 3,
    backgroundColor: '#ffa166',
    flexDirection: 'row',
    elevation: 4,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  pendingTextStyle: {
    alignSelf: 'center',
    marginLeft: 20,
    color: 'white',
    fontFamily: fonts.sourceSansProSemiBold
  },
  flatListViewStyles: {
    marginBottom: 10,
  },
  reasonView: {
    backgroundColor: '#F3F3F3',
    flex: 1,
    justifyContent: 'space-around',
    flexDirection: 'row',
  },
  reasonRowItem: {
    flexDirection: 'row',
    marginTop: 10,
    alignItems: 'center',
    paddingVertical: 5
  },
  radioNormal: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderColor: '#ee4b40',
    borderWidth: 2,
    marginHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center'
  },
  radioSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ee4b40'
  },
  actionLabel: {
    color: variables.greyishBrown,
    fontFamily: fonts.sourceSansProBold,
    fontSize: 14,
  },
  tabviewStyle: {
    marginTop: 20,
    height: 30
  },
  tabDataInnerView: {
    flexDirection: 'row',
    flex: 1
  },
});

export default styles;
