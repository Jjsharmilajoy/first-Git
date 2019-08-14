import { StyleSheet } from 'react-native';
import variables from '../../theme/variables';
import fonts from '../../theme/fonts';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column'
  },
  buttonStyle: {
    backgroundColor: variables.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    elevation: 10,
    marginHorizontal: 10,
    padding: 10
  },
  selectedCard: {
    borderColor: variables.mango,
    borderWidth: 2
  },
  dataContainer: {
    flex: 6,
    flexDirection: 'column',
    margin: 60
  },
  amountRangeViewStyle: {
    flex: 1,
    flexDirection: 'row',
  },
  sliderViewStyle: {
    flexDirection: 'column',
    marginVertical: 20,
    marginHorizontal: 20
  },
  sliderStyle: {
    // flex: 0.6,
    // justifyContent: 'space-between',
    color: variables.dustyOrange
  },
  sliderValue: {
    fontFamily: fonts.sourceSansProBold,
    fontSize: 15,
    color: variables.dustyOrange,
    marginVertical: 20,
    marginHorizontal: 20
  },
  sliderThumbStyle: {
    borderRadius: 2,
    backgroundColor: 'red',
    borderColor: 'black',
    borderWidth: 1,
  },
  selectedStyle: {
    backgroundColor: variables.mango,
  },
  unselectedStyle: {
    backgroundColor: variables.coolOrange,
  },
  trackStyle: {
    height: 4
  },
  customMarker: {
    alignSelf: 'center',
    justifyContent: 'center',
    width: 20,
    height: 20,
    borderRadius: 20 / 2,
    // elevation: 2,
    backgroundColor: variables.dustyOrange,
  }
});

export default styles;
