import { StyleSheet, Dimensions } from 'react-native';
import fonts from '../../theme/fonts';

const DEVICE_HEIGHT = Dimensions.get('screen').height;
const DEVICE_WIDTH = Dimensions.get('screen').width;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  headerView: {
    backgroundColor: 'white',
    height: 50,
    justifyContent: 'center',
    flexDirection: 'row',
  },
  dataContainer: {
    backgroundColor: 'white',
    flex: 1
  },
  mainDataContainer: {
    margin: (DEVICE_WIDTH * 0.05),
    marginTop: 10,
    flex: 1,
    elevation: 4,
    shadowOffset: {
      width: 3,
      height: 3,
    },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    backgroundColor: '#FFFFFF',
    borderRadius: 3,
    height: (DEVICE_HEIGHT * 0.45),
  },
  textStyles: {
    color: '#224873',
  },
  financierListContainer: {
    height: (DEVICE_HEIGHT * 0.25),
    marginHorizontal: 10,
    marginVertical: (DEVICE_HEIGHT * 0.05),
  },
  financierItemContainer: {
    height: (DEVICE_HEIGHT * 0.22),
    width: (DEVICE_HEIGHT * 0.22),
    margin: DEVICE_HEIGHT * 0.02,
    borderRadius: 5,
    backgroundColor: 'white',
    elevation: 5,
    shadowOffset: {
      width: 3,
      height: 3,
    },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  financierItemImageStyle: {
    height: (DEVICE_HEIGHT * 0.16),
    width: (DEVICE_HEIGHT * 0.16),
    margin: DEVICE_HEIGHT * 0.02,
    resizeMode: 'center',
  },
  unSelectedItemBlock: {
    flexDirection: 'row',
    paddingBottom: 5,
    borderWidth: 1,
    borderColor: '#DCE8FA',
    backgroundColor: '#FFFFFF',
  },
  selectedItemBlock: {
    flexDirection: 'row',
    paddingBottom: 5,
    borderWidth: 1,
    borderColor: '#d6d7da',
    backgroundColor: '#F1F6FD',
  },
  selectedRadioBtnView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unSelectedRadioBtnView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unSelectedRadioBtnStyle: {
    paddingTop: 10,
    backgroundColor: 'red',
    width: 20,
    height: 20,
    justifyContent: 'center',
    marginHorizontal: 20
  },
  selectedrRadioBtnStyle: {
    paddingTop: 10,
    backgroundColor: 'green',
    width: 20,
    height: 20,
    justifyContent: 'center',
    marginHorizontal: 20
  },
  sliderHeaderStyles: {
    marginHorizontal: 0,
    height: 50
  },
  headerInstabikeBgViewStyle: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 5,
    margin: 10,
    width: 100,
    alignItems: 'center'
  },
  headerSeperatorStyle: {
    width: 1,
    marginHorizontal: 20,
    backgroundColor: 'lightgray'
  },
  seperatorView: {
    height: 2,
    backgroundColor: '#F1F1F1',
    marginBottom: 10,
    marginHorizontal: 10,
  },
  popUpViewStyle: {
    marginHorizontal: (DEVICE_WIDTH * 0.25),
    marginVertical: (DEVICE_HEIGHT * 0.1),
    backgroundColor: 'white',
    flex: 1,
    borderRadius: 10,
    flexDirection: 'column',
    elevation: 5,
    shadowOffset: {
      width: 3,
      height: 3,
    },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  addNewBtnStyle: {
    width: (DEVICE_WIDTH * 0.3),
    height: 50,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: '#007CDA',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#fff',
    alignSelf: 'center',
    marginVertical: 20
  },
  withFinancierSelected: {
    width: (DEVICE_WIDTH * 0.5) / 4,
    height: (DEVICE_WIDTH * 0.5) / 4,
    borderRadius: 5,
    borderColor: '#ee4b40',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    margin: (DEVICE_WIDTH * 0.015),
  },
  withoutFinancierSelected: {
    width: (DEVICE_WIDTH * 0.5) / 4,
    height: (DEVICE_WIDTH * 0.5) / 4,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    margin: (DEVICE_WIDTH * 0.015),
    elevation: 2,
    shadowOffset: {
      width: 1,
      height: 1,
    },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  imageStyle: {
    width: (DEVICE_WIDTH * 0.6) / 6,
    height: (DEVICE_WIDTH * 0.2) / 4,
    resizeMode: 'center',
  },
  addNewFinancierStyle: {
    width: (DEVICE_WIDTH * 0.3),
    height: 50,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#fff',
    alignSelf: 'center',
    paddingBottom: 10
  },
  closeBtnStyle: {
    width: 40,
    height: 40,
    position: 'absolute',
    right: 10,
    top: 10,
    alignItems: 'center',
    backgroundColor: '#f26537',
  },
  chooseFianancierTitleTextStyle: {
    fontFamily: fonts.sourceSansProSemiBold,
    fontSize: 18,
    color: '#645e5c',
    textAlign: 'center',
    marginTop: 20,
  },
  yourFinancierTextStyle: {
    fontFamily: fonts.sourceSansProRegular,
    fontSize: 14,
    color: '#4a4a4a',
    textAlign: 'left',
    height: 40,
    justifyContent: 'center',
    padding: 10
  },
  continuosSectionView: {
    backgroundColor: 'white',
    height: 60
  },
  addFinancierView: {
    backgroundColor: '#fff8ee',
    borderColor: '#ff5a11',
    borderWidth: 2,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  addFinancierImageStyle: {
    width: 40,
    height: 40,
    resizeMode: 'center',
  },
  closeIconView: {
    width: 20,
    height: 20,
    position: 'absolute',
    right: 0,
    top: 0,
    alignItems: 'center',
    backgroundColor: '#f26537'
  },
  addFinancierHeaderTextStyle: {
    fontFamily: fonts.sourceSansProSemiBold,
    fontSize: 16,
    color: '#4a4a4a',
    marginLeft: 20,
    marginTop: 20,
  },
  noFinanciersText: {
    marginVertical: 80,
    alignSelf: 'center',
    fontFamily: fonts.sourceSansProBold,
    fontSize: 22,
    flex: 1
  },
  addIconImageStyle: {
    width: 40,
    height: 40,
    position: 'absolute',
    right: 0,
    top: 0,
    borderRadius: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f26537'
  }
});
export default styles;
