import { StyleSheet, Dimensions } from 'react-native';
import colors from '../../theme/variables';
import fonts from '../../theme/fonts';

const DEVICE_WIDTH = Dimensions.get('screen').width;

const leadDetailActionStyles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  commentWrapper: {

  },
  actionLabel: {
    color: colors.greyishBrown,
    fontFamily: fonts.sourceSansProBold,
    fontSize: 14,
  },
  reasonLabel: {
    color: colors.greyishBrown,
    fontFamily: fonts.sourceSansProSemiBold,
    fontSize: 14,
  },
  commentLabel: {
    color: colors.greyishBrown,
    fontFamily: fonts.sourceSansProSemiBoldItalic,
    fontSize: 12,
    marginTop: 10
  },
  commentView: {
    borderColor: colors.commentBorderColor,
    borderWidth: 2,
    borderRadius: 2,
    backgroundColor: colors.commentBackground
  },
  categoriesViewNormal: {

  },
  categoriesTextNormal: {
    fontSize: 12,
    fontFamily: fonts.sourceSansProSemiBold,
    color: colors.lightGrey,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderColor: colors.warmGreyEight,
    borderWidth: 1,
    borderRadius: 2
  },
  categoriesTextActivated: {
    fontSize: 12,
    fontFamily: fonts.sourceSansProSemiBold,
    color: 'white',
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  moveToView: {
    flexDirection: 'row',
    marginTop: 10
  },
  moveToWrapper: {
    marginTop: 10
  },
  followUpDateView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20
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
    flexDirection: DEVICE_WIDTH > 900 ? 'row' : 'column',
    marginTop: 20,
    justifyContent: 'space-between'
  },
  newScheduleView: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  dateTimeView: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  reasonHeader: {
    backgroundColor: 'white',
    elevation: 2,
    borderRadius: 2,
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 10
  },
  reasonView: {
    backgroundColor: '#F3F3F3'
  },
  reasonRowItem: {
    flexDirection: 'row',
    marginTop: 10,
    alignItems: 'center',
    paddingVertical: 5
  },
  categoryLabel: {
    paddingHorizontal: 10,
    paddingVertical: 2,
    color: 'white'
  },
  bikeName: {
    color: colors.charcoalGrey,
    fontFamily: fonts.sourceSansProRegular,
    fontSize: 12,
    alignSelf: 'center',
    justifyContent: 'center'
  },
  timelineDay: {
    color: colors.greyishBrown,
    fontFamily: fonts.sourceSansProSemiBold,
    fontSize: 14
  },
  timelineMonth: {
    color: colors.greyishThree,
    fontFamily: fonts.sourceSansProRegular,
    fontSize: 12
  },
  timelineTime: {
    color: colors.greyishBrown,
    fontFamily: fonts.sourceSansProRegular,
    fontSize: 12
  },
  doneBy: {
    flex: 1,
    color: colors.greyishBrownThree,
    fontFamily: fonts.sourceSansProRegular,
    fontSize: 12,
    marginTop: 10
  },
  testRideTime: {
    color: colors.headerBackgroundColor,
    fontSize: 12,
    marginLeft: 10,
    fontFamily: fonts.sourceSansProBoldItalic
  },
  categoryView: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  categoryWrapper: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
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
  activityText: {
    marginTop: 20,
    borderBottomColor: 'grey',
    borderBottomWidth: 1,
    paddingVertical: 5,
    fontFamily: fonts.sourceSansProRegular,
    fontSize: 14
  },
  timelineCard: {
    backgroundColor: 'white',
    width: '95%',
    elevation: 4,
    borderRadius: 2,
    margin: 2,
    padding: 10
  },
  removeFinancierContainer: {
    backgroundColor: 'grey',
    opacity: 0.9,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  removeFinancierView: {
    width: DEVICE_WIDTH / 3,
    height: 225,
    backgroundColor: 'white'
  },
  fieldContainer: {
    borderColor: '#EF7432',
    borderWidth: 1,
    width: (DEVICE_WIDTH / 3) - 36,
    height: 80,
    fontSize: 15,
    fontFamily: fonts.sourceSansProRegular,
    paddingLeft: 10,
    alignSelf: 'center',
    marginTop: 5,
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
});

export default leadDetailActionStyles;

