import { StyleSheet } from 'react-native';
import fonts from '../../theme/fonts';

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
    flexDirection: 'column',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
    marginTop: 15
  },
  leadDetailsCountWrapper: {
    marginTop: 5,
    justifyContent: 'space-between',
    flex: 1,
    marginHorizontal: 18,
    flexDirection: 'column'
  },
  leadDetailsCountText: {
    fontFamily: 'SourceSansPro-Bold',
    color: '#3A3A3A',
    fontSize: 15,
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
    backgroundColor: '#FCFCFC',
    marginHorizontal: 20
  },
  generalCardsAvatar: {
    margin: 5
  },
  generalCardsDropdown: {
    height: 20,
    width: '100%'
  },
  currentLeadStatusWrapper: {
    flex: 2,
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
    marginBottom: 10,
    alignItems: 'flex-end'
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
    paddingHorizontal: 20,
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
    fontFamily: 'SourceSansPro-Regular',
  },
  leadDetailsCount: {
    color: '#454545',
    fontFamily: 'SourceSansPro-SemiBold',
    fontSize: 17,
  },
  leadContactWrapper: {
    marginHorizontal: 20,
    paddingLeft: 20,
    borderLeftWidth: 0.5,
    borderLeftColor: '#e6e6e6',
    paddingVertical: 10
  },
  leadContactText: {
    color: '#8c8c8c',
    fontSize: 12,
    fontFamily: 'SourceSansPro-Regular',
  },
  leadContactNumber: {
    color: '#454545',
    fontFamily: 'SourceSansPro-SemiBold',
    fontSize: 17,
  },
  leadDetailsWrapper: {
    flexDirection: 'column',
    marginVertical: 5
  },
  leadDetailsText: {
    color: '#8c8c8c',
    fontSize: 13,
    fontFamily: 'SourceSansPro-Regular',
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
    fontSize: 12,
    fontFamily: 'SourceSansPro-Regular',
    maxWidth: 160,
    height: 15
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
    fontSize: 12,
    fontFamily: 'SourceSansPro-Regular'
  },
  viewButtonWrapper: {
    flexDirection: 'row',
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 10,
    justifyContent: 'center'
  },
  buttonView: {
    height: 30,
    alignItems: 'center',
    backgroundColor: '#ffefe5'
  },
  buttonText: {
    color: '#f26a35',
    fontFamily: fonts.sourceSansProSemiBold,
    fontSize: 14,
  }
});

export default styles;
