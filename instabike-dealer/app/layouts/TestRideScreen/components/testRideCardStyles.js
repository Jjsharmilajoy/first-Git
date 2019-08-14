import { StyleSheet, Dimensions } from 'react-native';
import fonts from '../../../theme/fonts';
import variables from '../../../theme/variables';

const DEVICE_WIDTH = Dimensions.get('screen').width;

const styles = StyleSheet.create({
  lostIconAlignment: {
    marginLeft: 0
  },
  directionRow: {
    flexDirection: 'row'
  },
  leadCreatedTextStyle: {
    paddingTop: 2
  },
  leadLostColor: {
    color: '#D5180D'
  },
  dateStyle: {
    flexDirection: 'row',
    marginVertical: 5
  },
  monthStyle: {
    height: 20,
    width: 1,
    backgroundColor: '#e6e6e6',
    marginHorizontal: 5
  },
  leadCreatedTextColor: {
    color: '#454545',
    paddingTop: 2
  },
  flexOne: {
    flex: 1
  },
  cardContainer: {
    marginHorizontal: 10,
    marginVertical: 10,
    backgroundColor: 'white',
    elevation: 4,
    borderRadius: 4
  },
  cardWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginVertical: 10
  },
  leadDetailsCountWrapper: {
    justifyContent: 'space-between',
    flex: 1,
    marginHorizontal: 18,
    flexDirection: 'column'
  },
  leadDetailsCountText: {
    fontFamily: fonts.sourceSansProBold,
    color: variables.charcoalGrey,
    fontSize: 18,
  },
  invoicedLostWrapper: {
    flexDirection: 'row',
    flex: 1,
    marginTop: 5
  },
  avatarImage: {
    marginRight: 5,
    marginVertical: 5
  },
  invoicedLostText: {
    paddingTop: 3
  },
  generalCardsWrapper: {
    marginTop: 10,
    flexDirection: 'row',
    alignSelf: 'center',
    justifyContent: 'center',
    padding: 5,
    backgroundColor: '#FCFCFC'
  },
  generalCardsAvatar: {
    margin: 5
  },
  generalCardsDropdown: {
    height: 20,
    width: 220
  },
  currentLeadStatusWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 15
  },
  currentLeadStatusComments: {
    flex: 1,
    marginLeft: 40,
    marginBottom: 10
  },
  countColor: {
    color: '#f3795c',
    marginTop: 2
  },
  addCommentText: {
    color: '#f3795c',
    paddingTop: 5
  },
  lostReason: {
    paddingLeft: 20,
    fontSize: 14,
    fontFamily: 'SourceSansPro-Regular',
    paddingBottom: 10,
    color: '#D5180D'
  },
  lostReasonDefaultText: {
    paddingLeft: 20,
    fontSize: 14,
    fontFamily: 'SourceSansPro-Regular',
    paddingBottom: 10,
    color: '#D5180D'
  },
  testRideViewWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    borderTopColor: '#e6e6e6',
    borderTopWidth: 0.5,
    borderBottomColor: '#e6e6e6',
    borderBottomWidth: 0.5,
    paddingHorizontal: 20
  },
  testRideViewWrapperSpacing: {
    paddingVertical: 10
  },
  testRideText: {
    color: '#8c8c8c',
    fontSize: 12,
    fontFamily: fonts.sourceSansProLight,
  },
  leadDetailsCount: {
    color: variables.charcoalGrey,
    fontFamily: fonts.sourceSansProSemiBold,
    fontSize: 15,
  },
  leadContactWrapper: {
    marginHorizontal: 8,
    paddingLeft: 20,
    borderLeftWidth: 0.5,
    borderLeftColor: '#e6e6e6',
    paddingVertical: 10
  },
  leadContactText: {
    color: '#8c8c8c',
    fontSize: 12,
    fontFamily: fonts.sourceSansProLight,
  },
  leadContactNumber: {
    color: variables.charcoalGrey,
    fontFamily: fonts.sourceSansProSemiBold,
    fontSize: 15,
  },
  leadDetailsWrapper: {
    flexDirection: 'column',
    marginVertical: 5
  },
  leadDetailsText: {
    color: '#8c8c8c',
    fontSize: 12,
    fontFamily: fonts.sourceSansProSemiBold,
    marginLeft: 20,
    marginBottom: 5
  },
  leadNameWrapper: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginHorizontal: 20,
    paddingRight: 20
  },
  leadNameStyle: {
    color: '#464646',
    fontSize: 13,
    fontFamily: 'SourceSansPro-Regular',
  },
  genderView: {
    borderColor: '#D9D9D9',
    borderWidth: 5,
    borderRadius: 5,
    marginTop: 5,
    marginBottom: 7,
    marginHorizontal: 10
  },
  genderText: {
    color: '#464646',
    fontSize: 13,
    fontFamily: 'SourceSansPro-Regular'
  },
  viewButtonWrapper: {
    flexDirection: 'row',
    borderBottomRightRadius: 5,
    borderBottomLeftRadius: 5,
    paddingVertical: 8,
    paddingHorizontal: 8,
    justifyContent: 'center'
  },
  wrapper: {
    flexDirection: 'row'
  },
  buttonView: {
    height: 25,
    alignItems: 'center',
    backgroundColor: 'transparent'
  },
  buttonText: {
    color: variables.white,
    fontFamily: fonts.sourceSansProSemiBold,
    fontSize: 14,
  },
  assigneeWrapper: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
    flexDirection: 'row'
  },
  assigneeName: {
    fontFamily: fonts.sourceSansProRegular,
    color: variables.charcoalGrey,
    fontSize: 15,
    marginHorizontal: 3
  },
  userIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 5,
    marginVertical: 5
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
});

export default styles;
