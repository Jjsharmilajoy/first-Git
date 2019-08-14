import { StyleSheet } from 'react-native';
import colors from '../../../theme/variables';
import fonts from '../../../theme/fonts';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between'
  },
  bikeSection: {
    flex: 8,
    marginTop: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerSection: {
    flex: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 80,
    alignItems: 'center',
  },
  bikeName: {
    fontSize: 14,
    fontFamily: fonts.sourceSansProSemiBold,
    color: colors.greyishBrown
  },
  userName: {
    fontSize: 14,
    fontFamily: fonts.sourceSansProRegular,
    color: colors.greyishBrown
  },
  testRideTime: {
    fontSize: 18,
    fontFamily: fonts.sourceSansProRegular,
    color: colors.greyishBrown
  },
  backButtonStyle: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: 'transparent'
  },
  backButtonTextStyle: {
    color: colors.mango,
    fontFamily: fonts.sourceSansProBlack,
    fontSize: 14
  },
});

export default styles;
