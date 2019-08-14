import { StyleSheet } from 'react-native';
import variables from '../../theme/variables';
import fonts from '../../theme/fonts';

const userInputStyles = StyleSheet.create({
  inputWrapper: {
    flexDirection: 'column',
    backgroundColor: variables.white,
  },
  input: {
    height: 40,
    color: '#949EA0',
  },
  inlineImg: {
    position: 'absolute',
    zIndex: 99,
    width: 22,
    height: 15,
    left: 15,
    top: 9,
  },
  rearInlineImg: {
    position: 'absolute',
    zIndex: 99,
    height: 22,
    right: 15,
    top: 9,
  },
  errorTextStyle: {
    color: 'red',
    fontSize: 11,
    marginBottom: 5,
    height: 14,
    fontFamily: fonts.sourceSansProRegular
  }
});

export default userInputStyles;
