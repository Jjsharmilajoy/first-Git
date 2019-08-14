import { StyleSheet } from 'react-native';
import variables from '../../theme/variables';
import fonts from '../../theme/fonts';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column'
  },
  selectedCard: {
    borderColor: variables.mango,
    borderWidth: 2,
    borderRadius: 2,
  },
  salariedCard: {
    flex: 0.5,
    flexDirection: 'column',
    backgroundColor: '#efefef',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 60,
    elevation: 10,
  },
  selfEmployedCard: {
    flex: 0.5,
    flexDirection: 'column',
    backgroundColor: '#efefef',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 60,
    elevation: 10
  },
  cardText: {
    fontSize: 16,
    fontFamily: fonts.sourceSansProRegular,
    color: '#454545'
  },
  continueBtnContainer: {
    flex: 3,
    marginHorizontal: 50,
    alignItems: 'flex-end',
  },
  errorTextStyle: {
    position: 'absolute',
    bottom: 120,
    left: 100,
    color: 'red',
    fontSize: 14,
    marginBottom: 5,
    marginLeft: 10,
    height: 18,
    fontFamily: fonts.sourceSansProRegular
  },
  salaryRangeBtnView: {
    height: 50,
    flexDirection: 'row',
    elevation: 3,
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    width: 300
  },
  salaryRangeHeaderTextStyle: {
    fontSize: 14,
    fontFamily: fonts.sourceSansProBold,
    color: '#4a4a4a',
    marginHorizontal: 20
  },
  showSalaryWrapper: {
    marginHorizontal: 10
  },
  arrowImageStyle: {
    // marginRight: 50,
    // alignSelf: 'flex-end',
    color: 'grey',
    // marginLeft: 50
  },
  detailValueTextStyle: {
    flex: 1,
    textAlign: 'left',
    fontFamily: fonts.sourceSansProRegular,
    fontSize: 16,
    marginLeft: 5,
    alignSelf: 'center',
    textAlignVertical: 'center',
    color: '#191919'
  },
});

export default styles;
