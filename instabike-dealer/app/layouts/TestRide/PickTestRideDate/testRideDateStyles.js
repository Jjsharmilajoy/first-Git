import { StyleSheet } from 'react-native';
import fonts from '../../../theme/fonts';
import colors from '../../../theme/variables';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white'
  },
  dateView: {
    width: 80,
    height: 80,
    borderColor: colors.pinkishGrey,
    backgroundColor: colors.aquamarine,
    elevation: 4,
    borderRadius: 4,
    marginRight: 20,
    marginBottom: 5,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateSelectedView: {
    width: 80,
    height: 80,
    borderColor: colors.squash,
    borderRadius: 4,
    marginRight: 20,
    marginBottom: 5,
    borderWidth: 1,
    elevation: 8,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  day: {
    fontFamily: fonts.sourceSansProRegular,
    fontSize: 12,
    color: colors.blackFour
  },
  date: {
    fontFamily: fonts.sourceSansProSemiBold,
    fontSize: 18,
    color: colors.blackFour
  },
  slotStatus: {
    fontFamily: fonts.sourceSansProRegular,
    fontSize: 12,
    color: '#f16537',
  },
  disabled: {
    borderColor: colors.coolGrey28,
    backgroundColor: colors.coolGrey28,
    elevation: 0
  },
  slotView: {
    height: 30,
    width: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
    marginBottom: 5,
    marginTop: 10,
    borderColor: colors.pinkishGrey,
    backgroundColor: colors.aquamarine,
    elevation: 4,
    borderRadius: 4,
    borderWidth: 1
  },
  slotSelectedView: {
    height: 30,
    width: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
    marginBottom: 5,
    marginTop: 10,
    borderColor: colors.squash,
    backgroundColor: colors.white,
    elevation: 4,
    borderRadius: 4,
    borderWidth: 1
  },
  backButtonStyle: {
    height: 40,
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: 'transparent'
  },
  backButtonTextStyle: {
    width: 40,
    color: '#f16537',
  },
  selectDate: {
    fontFamily: fonts.sourceSansProBold,
    fontSize: 18,
    color: colors.blackFour
  },
  testRideLabel: {
    fontFamily: fonts.sourceSansProRegular,
    fontSize: 14,
    color: colors.primaryTextColor,
    height: 15
  },
  headerView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  mainView: {
    flex: 6,
    paddingHorizontal: 60
  },
  footerView: {
    flex: 2,
    justifyContent: 'center'
  },
  slotWrapper: {
    height: 160,
    marginTop: 0
  }
});

export default styles;
