import { StyleSheet, Dimensions } from 'react-native';
import variables from '../../theme/variables';
import fonts from '../../theme/fonts';

const DEVICE_WIDTH = Dimensions.get('screen').width;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column'
  },
  nameContainer: {
    alignSelf: 'center',
    width: DEVICE_WIDTH / (DEVICE_WIDTH > 900 ? 2.5 : 3.5),
    marginHorizontal: 40
  },
  sourceContainer: {
    alignSelf: 'center',
    width: DEVICE_WIDTH / (DEVICE_WIDTH > 900 ? 2.5 : 3.5),
    marginHorizontal: 40,
    marginVertical: 10
  },
  gender: {
    flex: 1,
    alignSelf: 'center',
    width: DEVICE_WIDTH / (DEVICE_WIDTH > 900 ? 2.5 : 3.5)
  },
  fieldTitle: {
    alignSelf: 'flex-start',
    fontSize: 14,
    color: variables.titleColor,
    fontFamily: fonts.sourceSansProRegular
  },
  fieldValue: {
    fontSize: 15,
    fontFamily: fonts.sourceSansProSemiBold,
    color: variables.primaryTextColor
  },
  fieldContainer: {
    width: DEVICE_WIDTH / (DEVICE_WIDTH > 900 ? 2.5 : 3.5),
    // marginTop: 5,
    borderWidth: 1,
    borderColor: variables.titleColor,
    borderRadius: 2
  },
  mandatoryField: {
    color: 'red',
    lineHeight: 18,
    marginLeft: 2
  },
  selectedCard: {
    borderColor: variables.mango,
    borderWidth: 2,
    borderRadius: 2
  },
  genderCard: {
    marginHorizontal: 10,
    flexDirection: 'column',
    backgroundColor: '#efefef',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    elevation: 2
  },
  cardText: {
    fontSize: 14,
    fontFamily: fonts.sourceSansProRegular
  },
  continueBtnContainer: {
    marginHorizontal: 50,
    marginVertical: 20
  },
  errorTextStyle: {
    color: 'red',
    fontSize: 11,
    marginBottom: 5,
    marginLeft: 10,
    height: 14,
    fontFamily: fonts.sourceSansProRegular
  }
});

export default styles;
