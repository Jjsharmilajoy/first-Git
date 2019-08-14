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
    borderRadius: 2,
    elevation: 4
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
    borderColor: '#e6e6e6',
    borderTopWidth: 1,
    borderBottomWidth: 1
  },
  testRideView: {
    flex: 1,
    paddingVertical: 8,
    borderColor: '#e6e6e6',
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
    color: colors.greyishBrownThree,
    maxWidth: 160,
    height: 15
  },
  viewButton: {
    flexDirection: 'row',
    backgroundColor: colors.veryLightPink,
    justifyContent: 'center',
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4
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
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
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
  }
});

export default styles;

