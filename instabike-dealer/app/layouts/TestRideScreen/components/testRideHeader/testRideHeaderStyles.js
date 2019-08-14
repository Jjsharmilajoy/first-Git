import { StyleSheet } from 'react-native';
import fonts from '../../../../theme/fonts';
import variables from '../../../../theme/variables';

const myLeadHeaderStyles = StyleSheet.create({
  cardContainer: {
    elevation: 6,
    height: 60,
    flexDirection: 'row',
    shadowColor: variables.shadowColor,
    shadowOffset: { width: 6, height: 3 },
    zIndex: 500
  },
  gradientConainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
  },
  leftContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 16,
  },
  rightContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  leftTextWrapper: {
    flexDirection: 'row',
  },
  staticTextStyle: {
    color: '#486C8E',
    fontSize: 18,
  },
  dateTextStyle: {
    color: '#6D89A5',
    fontSize: 16
  },
  searchStyle: {
    flex: 3,
    flexDirection: 'row',
    backgroundColor: '#E9EEF8',
    alignItems: 'center'
  },
  searchTextStyle: {
    color: '#708AA7',
    fontSize: 14
  },
  imageOneStyle: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightColor: '#F0F4FB',
    borderRightWidth: 2
  },
  imageTwoStyle: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  imageThreeStyle: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#3F92DD'
  },
  container: {
    backgroundColor: '#F8FAFF',
    paddingTop: 32
  },
  rowContainer: {
    flexDirection: 'row'
  },
  overviewContainer: {
    flexDirection: 'column',
    marginLeft: 16
  },
  titleTextStyle: {
    color: '#365B80',
    fontSize: 16,
    fontWeight: '600'
  },
  overviewTileContainer: {
    flexDirection: 'row',
    borderRightColor: '#EBF3FC',
    borderRightWidth: 2,
    marginTop: 8
  },
  overviewTileOneStyle: {
    backgroundColor: null,
    borderColor: '#B3D7FB',
    borderWidth: 2,
  },
  overviewTileTwoStyle: {
    backgroundColor: null,
    borderColor: '#B3D7FB',
    borderWidth: 2,
    marginLeft: 16,
    marginRight: 16

  },
  targetContainer: {
    flexDirection: 'column',
    marginLeft: 16
  },
  targetTextStyle: {
    color: '#365B80',
    fontSize: 16,
    fontWeight: '600'
  },
  targetTileContainer: {
    flexDirection: 'row',
    marginTop: 8
  },
  tabContainer: {
    flexDirection: 'row',
    marginLeft: 16,
    marginTop: 24
  },
  tabStyle: {
    marginRight: 24
  },
  tabSelectedStyle: {
    borderBottomColor: '#F17C3A',
    borderBottomWidth: 2,
    marginRight: 24
  },
  tabTextStyle: {
    color: '#aaaeb3',
    fontSize: 15,
    fontFamily: fonts.sourceSansProRegular
  },
  tabSelectedTextStyle: {
    color: '#4a4a4a',
    fontSize: 16,
    fontFamily: fonts.sourceSansProSemiBold
  }
});

export default myLeadHeaderStyles;
