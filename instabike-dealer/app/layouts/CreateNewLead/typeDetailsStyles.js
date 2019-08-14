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
  bikeCard: {
    flex: 0.5,
    flexDirection: 'column',
    backgroundColor: '#efefef',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 60,
    elevation: 10
  },
  scooterCard: {
    flex: 0.5,
    flexDirection: 'column',
    backgroundColor: '#efefef',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 60,
    elevation: 10
  },
  cardText: {
    fontSize: 18,
    fontFamily: fonts.sourceSansProBold
  },
  continueBtnContainer: {
    flex: 3,
    flexDirection: 'row',
    marginHorizontal: 50,
    alignItems: 'center',
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
  }
});

export default styles;
