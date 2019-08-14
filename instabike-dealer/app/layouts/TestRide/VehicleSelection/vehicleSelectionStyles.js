import { StyleSheet } from 'react-native';
import fonts from '../../../theme/fonts';
import colors from '../../../theme/variables';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  text: {
    fontFamily: fonts.sourceSansProRegular,
    fontSize: 14,
    color: colors.warmGreyTwo,
    textAlign: 'center'
  },
  textSelected: {
    fontFamily: fonts.sourceSansProSemiBold,
    fontSize: 16,
    color: colors.blackFour,
    textAlign: 'center'
  },
  bikeText: {
    fontFamily: fonts.sourceSansProBold,
    fontSize: 24,
    color: colors.blackFour
  },
  backButtonStyle: {
    // width: 30,
    height: 40,
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: 'transparent'
  },
  backButtonTextStyle: {
    // width: 40,
    color: '#f16537',
  },
  bikeActivated: {
    width: 220,
    height: 220,
  },
  bike: {
    width: 200,
    height: 200
  },
  bikeRowStyle: {
    marginHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerView: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center'
  },
  mainView: {
    flex: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerView: {
    flex: 2,
    justifyContent: 'center'
  }
});

export default styles;
