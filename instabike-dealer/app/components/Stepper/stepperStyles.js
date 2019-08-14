import { StyleSheet, Dimensions } from 'react-native';
import fonts from '../../theme/fonts';
import variables from '../../theme/variables';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  detailImage: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    width: 40,
    height: 40,
    borderRadius: 40 / 2,
    elevation: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: variables.mango,
  },
  inProgress: {
    backgroundColor: variables.mango
  },
  modifyText: {
    color: variables.mango
  },
  modifyPositionText: {
    color: variables.white
  },
  circleText: {
    fontSize: 16,
    color: variables.greyish,
    fontWeight: '500',
    fontFamily: fonts.sourceSansProSemiBold
  },
  progress: {
    position: 'absolute',
    height: 10
  },
  progress2: {
    position: 'absolute',
    height: 10,
    width: Dimensions.get('screen').width / 3,
    top: 40,
    right: 140
  },
  bar: {
    backgroundColor: variables.greyish,
    height: 2
  },
  title: {
    fontSize: 12,
    color: variables.greyish,
    fontWeight: '500',
    fontFamily: fonts.sourceSansProSemiBold
  }
});

export default styles;
