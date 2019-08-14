import { StyleSheet, Dimensions } from 'react-native';
import colors from '../../theme/variables';
import fonts from '../../theme/fonts';

const DEVICE_WIDTH = Dimensions.get('screen').width;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.whiteFour,
  },
  scrollContainer: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    flexDirection: 'row'
  },
  tab: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingHorizontal: 16
  },
  tabTitle: {
    fontSize: 12,
    fontFamily: fonts.sourceSansProSemiBold,
    color: colors.warmGrey,
    paddingVertical: 10,
    borderColor: 'black',
    borderBottomWidth: 2
  },
  cardContainer: {
    width: DEVICE_WIDTH / 3,
    marginHorizontal: 16,
    backgroundColor: colors.whiteThree
  },
  overdueHeader: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    height: 50,
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 4,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  freshHeader: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    backgroundColor: colors.apricot,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 2,
    elevation: 4
  },
  sortPicker: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  card: {
    backgroundColor: 'white',
    elevation: 2,
    marginHorizontal: 16,
    marginVertical: 10,
    borderRadius: 4
  },
  bikeNameContainer: {
    paddingHorizontal: 12,
    marginTop: 18
  },
  bikeName: {
    flex: 1,
    color: colors.black,
    fontSize: 16,
    fontFamily: fonts.sourceSansProBold
  },
  namePicker: {
    flex: 1,
    marginTop: 10
  },
  followCommentView: {
    flexDirection: 'row',
    marginTop: 15,
    alignItems: 'center'
  },
  followView: {
    flex: 1,
    borderRadius: 2,
    flexDirection: 'row',
    paddingVertical: 4,
    paddingLeft: 12,
  },
  followUpLabelView: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  followUpDateView: {
    flexDirection: 'row',
    justifyContent: 'center'
  },
  followUpDate: {
    fontSize: 10,
    marginTop: 4,
    color: colors.whiteSixty
  },
  followUpGreyDate: {
    fontSize: 12,
    marginTop: 4,
    color: colors.warmGreyFour
  },
  followUpDateBorder: {
    borderColor: colors.whiteSixty,
    borderRightWidth: 1,
    paddingRight: 4,
    marginRight: 4
  },
  followUpDateGreyBorder: {
    borderColor: colors.warmGreyFour,
    borderRightWidth: 1,
    paddingRight: 4,
    marginRight: 4
  },
  followUpLabel: {
    color: 'white',
    fontSize: 10,
    fontFamily: fonts.sourceSansProSemiBold,
    marginLeft: 4
  },
  followUpGreenLabel: {
    color: colors.sapGreen,
    fontSize: 12,
    fontFamily: fonts.sourceSansProSemiBold,
    marginLeft: 4
  },
  commentView: {
    flex: 1,
    paddingLeft: 12
  },
  commentLabelView: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  commentLabel: {
    color: colors.fadedOrange,
    fontSize: 12,
    marginLeft: 4,
    fontFamily: fonts.sourceSansProRegular
  },
  addCommentLabel: {
    color: colors.warmGreyFour,
    fontFamily: fonts.sourceSansProSemiBold,
    fontSize: 12,
    marginTop: 4,
  },
  testRideLeadContactView: {
    flexDirection: 'row',
    marginTop: 18,
    borderColor: colors.warmGrey,
    borderTopWidth: 1,
    borderBottomWidth: 1
  },
  testRideView: {
    flex: 1,
    paddingVertical: 8,
    borderColor: colors.warmGrey,
    borderRightWidth: 1,
    paddingLeft: 12
  },
  cardSectionLabel: {
    fontFamily: fonts.sourceSansProRegular,
    fontSize: 12,
    color: colors.warmGreyFive
  },
  contactView: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12
  },
  leadDetailsView: {
    paddingHorizontal: 12,
    marginVertical: 12
  },
  userDetailsView: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  greyCircle: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.whiteFive,
    marginHorizontal: 10
  },
  userName: {
    fontSize: 12,
    fontFamily: fonts.sourceSansProRegular,
    color: colors.greyishBrownThree
  },
  viewButton: {
    flexDirection: 'row',
    backgroundColor: colors.veryLightPink,
    justifyContent: 'center',
    paddingVertical: 16,
    alignItems: 'center'
  },
  overdueText: {
    fontSize: 12,
    fontFamily: fonts.sourceSansProSemiBold,
    color: colors.greyishBrown
  },
  freshText: {
    fontSize: 12,
    fontFamily: fonts.sourceSansProSemiBold,
    color: 'white'
  },
  status: {
    fontSize: 11,
    fontFamily: fonts.sourceSansProSemiBold,
    color: colors.warmGreySix
  },
  sort: {
    fontSize: 11,
    fontFamily: fonts.sourceSansProSemiBold,
    color: 'white'
  },
  view: {
    fontSize: 14,
    color: colors.dustyOrange,
    fontFamily: fonts.sourceSansProSemiBold,
    marginLeft: 4
  },
  hotHeader: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    height: 50,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 2,
    elevation: 4
  },
  warmHeader: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    backgroundColor: colors.aquamarine,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 2,
    elevation: 4
  },
  lostHeader: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    backgroundColor: colors.warmGreySeven,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 2,
    elevation: 4
  },
  testRideStatus: {
    fontSize: 14,
    fontFamily: fonts.sourceSansProSemiBold,
    color: colors.greyishBrown
  },
  assigneePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8'
  },
  headerDate: {
    color: 'white',
    fontFamily: fonts.sourceSansProRegular,
    fontSize: 14
  },
  header: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  tabStyle: {
    paddingVertical: 10,
    paddingHorizontal: 5,
    fontSize: 14,
    fontFamily: fonts.sourceSansProRegular,
    color: colors.coolGrey
  },
  tabSelectedStyle: {
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderBottomColor: '#ee4b40',
    borderBottomWidth: 2,
    color: '#ee4b40',
    fontSize: 14,
    fontFamily: fonts.sourceSansProRegular
  },

  appHeaderContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
    backgroundColor: 'white',
    shadowOffset: {
      width: 10,
      height: 10,
    }
  },
  gradient: {
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
    backgroundColor: 'white',
    shadowOffset: {
      width: 10,
      height: 10,
    },
    zIndex: 9999,
    height: 50
  },

  withVehicleSelected: {
    width: (DEVICE_WIDTH * 0.5) / 5,
    height: (DEVICE_WIDTH * 0.5) / 5,
    borderRadius: 5,
    margin: (DEVICE_WIDTH * 0.01),
  },
  withoutVehicleSelected: {
    width: (DEVICE_WIDTH * 0.5) / 5,
    height: (DEVICE_WIDTH * 0.5) / 5,
    borderRadius: 5,
    margin: (DEVICE_WIDTH * 0.01),
    elevation: 2,
    shadowOffset: {
      width: 1,
      height: 1,
    },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  imageStyle: {
    width: (DEVICE_WIDTH * 0.7) / 5,
    height: (DEVICE_WIDTH * 0.3) / 5,
    resizeMode: 'center',
  },
  // header Text
  appHeaderTextContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRightColor: '#2E2C2C',
    borderRightWidth: 1,
  },
  filterIcon: {
    alignSelf: 'flex-end',
    height: 50,
    width: 70,
    borderLeftWidth: 1,
    borderLeftColor: '#2E2C2C',
    justifyContent: 'center'
  },
  filterContainer: {
    alignSelf: 'center',
    marginLeft: 2,
    height: 450,
    elevation: 10,
    shadowOffset: {
      width: 10,
      height: 10,
    },
    backgroundColor: 'white',
    shadowRadius: 5,
    borderRadius: 2,
    position: 'absolute',
    top: 49,
  },
  filterContent: {
    flex: 1,
    flexDirection: 'row',
    borderRadius: 2,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    alignItems: 'center'
  },
  filterHeaderText: {
    fontFamily: 'SourceSansPro-Bold',
    fontSize: 15,
    justifyContent: 'center',
    alignSelf: 'center',
    color: '#4a4a4a',
  },
  filterCloseIcon: {
    backgroundColor: 'white',
    height: 30,
    width: 30,
    elevation: 4,
    shadowRadius: 5,
    borderRadius: 2,
    shadowOpacity: 0.8,
    justifyContent: 'center',
  },
  showLeadText: {
    fontFamily: 'SourceSansPro-Bold',
    fontSize: 13,
    paddingTop: 20,
    paddingLeft: 35,
    alignSelf: 'flex-start',
    color: '#4a4a4a'
  },
  filterDateContainer: {
    flex: 1,
    marginHorizontal: 30,
    marginVertical: 50,
    flexDirection: 'row',
    elevation: 10,
    shadowOffset: {
      width: 10,
      height: 10,
    },
    backgroundColor: 'white',
    shadowRadius: 5,
    borderRadius: 2,
    shadowOpacity: 0.8
  },
  filterDateContent: {
    flex: 1,
    padding: 5,
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
    borderRightWidth: 1,
    borderRightColor: '#ddd'
  },
  filterDateText: {
    fontSize: 12,
    paddingTop: 15,
    alignSelf: 'center',
    color: '#475fdd'
  },
  filterDateFormattedText: {
    fontSize: 15,
    paddingTop: 10,
    alignSelf: 'center',
    color: '#3e3939'
  },
  leadsFilterText: {
    marginLeft: 15,
    marginRight: 55,
    color: '#4a4a4a',
    fontFamily: 'SourceSansPro-Regular',
    fontSize: 15
  },
  checkBoxView: {
    width: 200,
    flexDirection: 'row',
    marginHorizontal: 10,
    marginVertical: 5
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
  leadsOwnerHeader: {
    fontFamily: 'SourceSansPro-Bold',
    fontSize: 13,
    paddingLeft: 35,
    paddingTop: 20,
    alignSelf: 'flex-start',
    color: '#4a4a4a'
  },
  leadsOwnerContent: {
    flex: 1,
    marginVertical: 20,
    marginHorizontal: 20,
    elevation: 10,
    shadowOffset: {
      width: 10,
      height: 10,
    },
    shadowRadius: 5,
    borderRadius: 2,
    shadowOpacity: 0.8,
    shadowColor: 'black',
    backgroundColor: '#f4f4f4'
  },
  leadsOwnerTouchableView: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingVertical: 10,
    paddingLeft: 15,
    marginVertical: 5
  },
  leadsOwnerTouchableText: {
    marginLeft: 15,
    marginRight: 55,
    color: '#4a4a4a',
    fontFamily: 'SourceSansPro-Regular',
    fontSize: 15
  },
  leadsOwnedHeaderText: {
    fontFamily: 'SourceSansPro-Bold',
    fontSize: 13,
    paddingLeft: 35,
    paddingTop: 20,
    alignSelf: 'flex-start',
    color: '#4a4a4a'
  },
  leadsOwnedFlatListView: {
    flex: 1,
    marginVertical: 20,
    marginHorizontal: 20,
    elevation: 10,
    shadowOffset: {
      width: 10,
      height: 10,
    },
    shadowRadius: 5,
    borderRadius: 2,
    shadowOpacity: 0.8,
    shadowColor: 'black',
    backgroundColor: '#f4f4f4'
  },
  resetFilterView: {
    flex: 0.5,
    backgroundColor: 'white',
    justifyContent: 'flex-end',
    padding: 20,
    borderRadius: 2,
    flexDirection: 'row',
    alignItems: 'flex-end'
  },
  resetFilterText: {
    color: '#7f7f7f',
    borderBottomColor: '#7f7f7f',
    borderBottomWidth: 1,
    fontSize: 12
  },
  checkBoxSelectedTouchable: {
    top: -1,
    width: 10,
    paddingTop: 3,
    height: 10,
    borderRadius: 10
  },
  sectionTwoWrapper: {
    elevation: 3,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    height: 55,
  },
  directionRow: {
    flexDirection: 'row',
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
  vehicleNameView: {
    marginTop: 3,
    paddingHorizontal: 5
  },
  vehicleTextColor: {
    fontSize: 12,
    fontFamily: 'SourceSansPro-Regular',
    color: '#191919'
  },
  compareButtonWrapperCenter: {
    justifyContent: 'center',
    paddingHorizontal: 8
  },
  clearAllText: {
    fontFamily: 'SourceSansPro-Regular',
    fontSize: 13
  },
});

export default styles;

