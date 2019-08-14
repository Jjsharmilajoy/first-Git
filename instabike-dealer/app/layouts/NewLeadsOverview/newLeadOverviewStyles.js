import { StyleSheet, Dimensions } from 'react-native';
import fonts from '../../theme/fonts';

const DEVICE_WIDTH = Dimensions.get('screen').width;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overviewStyle: {
    height: 70,
    marginLeft: 20
  },
  overviewtextStyle: {
    color: '#4a4a4a',
    fontFamily: fonts.sourceSansProSemiBold,
    fontSize: 12,
    marginTop: 10
  },
  flatListViewStyles: {
    marginBottom: 10
  },
  tabSelectedStyle: {
    borderBottomColor: '#F17C3A',
    borderBottomWidth: 2,
    marginHorizontal: 20
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
    marginHorizontal: 20,
  },
  tabviewStyle: {
    marginTop: 20,
    height: 30
  },
  scrollViewStyles: {
    flex: 1,
    backgroundColor: 'white',
  },
  leadOverviewStyle: {
    flex: 1,
    flexDirection: 'row',
    marginRight: 20
  },
  leadCardOverviewStyle: {
    width: DEVICE_WIDTH / 3,
    flex: 1,
    backgroundColor: '#e6e6e6',
    marginLeft: 20,
    marginTop: 20,
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
    width: DEVICE_WIDTH / 3,
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
  assignPickerViewStyle: {
    flexDirection: 'row',
    width: 250,
    height: 30,
    marginRight: 10,
    marginVertical: 20,
    marginLeft: 20,
    justifyContent: 'flex-end',
    backgroundColor: '#F8F8F8',
  },
  assignPickerStyle: {
    height: 30,
    marginRight: 0,
    marginLeft: 0,
    width: 250,
    color: '#4a4a4a'
  },
  assignAvatarImageView: {
    height: 15,
    width: 15,
    alignSelf: 'center',
  },
  cardVehicleNametext: {
    alignSelf: 'flex-start',
    marginLeft: 20,
    color: '#454545',
    fontFamily: fonts.sourceSansProBold,
    fontSize: 14,
    flex: 1,
    marginTop: 10
  },
  specTitleTextStyle: {
    color: '#888888',
    alignItems: 'center',
    fontSize: 12,
    fontFamily: fonts.sourceSansProRegular
  },
  specTitleDesTextStyle: {
    color: '#454545',
    alignItems: 'center',
    fontSize: 17,
    fontFamily: fonts.sourceSansProSemiBold
  },
  viewButtonStyle: {
    width: (DEVICE_WIDTH / 3) - 40,
    height: 40,
    alignItems: 'center',
    backgroundColor: '#ffefe5',
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4
  },
  viewButtonTextStyle: {
    width: 40,
    color: '#f26a35',
    fontFamily: fonts.sourceSansProSemiBold,
    fontSize: 15,
  },
  leadCreatedTextStyle: {
    color: '#63a719',
    fontFamily: fonts.sourceSansProRegular,
    fontSize: 12,
    marginLeft: 5
  },
  greenTickImageStyle: {
    height: 20,
    width: 20,
    alignSelf: 'center',
  },
  timeTextStyle: {
    color: '#8c8c8c',
    fontFamily: fonts.sourceSansProRegular,
    fontSize: 12
  },
  leadDetailsTextStyle: {
    color: '#464646',
    fontFamily: fonts.sourceSansProRegular,
    fontSize: 12,
    maxWidth: 160,
    height: 15
  },
  leadCreatedViewStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginLeft: 20
  },
  tabDataInnerView: {
    flexDirection: 'row',
    flex: 1
  },
  dateTimeView: {
    flexDirection: 'row',
    margin: 10,
    marginHorizontal: 20
  },
  dateTimeSeperatorView: {
    height: 20,
    width: 1,
    backgroundColor: '#e6e6e6',
    marginHorizontal: 5
  },
  nameAssignView: {
    flexDirection: 'column',
    height: 100,
    alignItems: 'flex-start'
  },
  cardVerticalSeperator: {
    height: 1,
    width: (DEVICE_WIDTH / 3) - 40,
    backgroundColor: '#e6e6e6'
  },
  addCommentTextStyle: {
    color: '#8c8c8c',
    fontFamily: fonts.sourceSansProRegular,
    fontSize: 12,
    marginLeft: 20,
    marginVertical: 10
  },
  rieContactView: {
    height: 60,
    flexDirection: 'row'
  },
  testRideView: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginLeft: 20
  },
  rideContactSeperator: {
    height: 60,
    width: 1,
    backgroundColor: '#e6e6e6'
  },
  leadDetailView: {
    height: 70,
    justifyContent: 'flex-start',
    marginHorizontal: 20
  },
  nameGenderView: {
    flexDirection: 'row',
    height: 50,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start'
  },
  dotView: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#979797',
    marginHorizontal: 20
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
  noLeadsText: {
    marginVertical: 80,
    alignSelf: 'center',
    fontFamily: fonts.sourceSansProBold,
    fontSize: 22
  },
  newLeadsView: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  }
});

export default styles;
