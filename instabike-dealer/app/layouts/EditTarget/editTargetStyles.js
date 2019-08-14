import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('screen');
const modalHeight = height;
const modalWidth = width;

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    flex: 1,
  },
  headerTextContent: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 30,
    borderRightColor: '#2E2C2C',
    borderRightWidth: 1,
    width: (width / 2) - 100
  },
  headerDateContent: {
    color: 'gray',
    justifyContent: 'center',
    paddingHorizontal: 5,
    borderRightColor: '#2E2C2C',
    borderRightWidth: 1
  },
  headerSearchContent: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRightColor: '#2E2C2C',
    borderRightWidth: 1
  },
  headerBellNotify: {
    flex: 1,
    color: '#f16238',
    width: 4,
    height: 4,
    alignSelf: 'center',
    borderRadius: 50
  },
  headerSearchContentText: {
    paddingTop: 10,
    height: 40,
    color: 'white',
    width: 190
  },
  modalContentWrapper: {
    backgroundColor: '#0000004d',
    position: 'absolute',
    width: modalWidth,
    height: modalHeight,
    borderRadius: 2
  },
  modalContent: {
    backgroundColor: 'white',
    width: modalWidth / 2.75,
    marginTop: 80,
    height: modalHeight / 2.5,
    alignSelf: 'center',
    justifyContent: 'center',
    opacity: 1,
    borderRadius: 2
  },
  modalCloseIcon: {
    position: 'absolute',
    right: 0,
    top: 0
  },
  closeIconDimensions: {
    height: 30,
    width: 30,
    padding: 5
  },
  modalHeader: {
    fontFamily: 'SourceSansPro-SemiBold',
    fontSize: 13,
    color: '#4a4a4a',
    borderBottomWidth: 2,
    borderBottomColor: '#f79426',
    paddingTop: 10,
    marginLeft: 15
  },
  textStyle: {
    fontFamily: 'SourceSansPro-Regular',
    fontSize: 14,
    color: '#4a4a4a',
    paddingBottom: 4,
    paddingTop: 5,
    alignSelf: 'flex-start'
  },
  widthHundred: {
    width: 100
  },
  userInputStyle: {
    borderColor: '#ff9926',
    borderWidth: 1,
    color: '#4a4a4a',
    borderRadius: 4,
    paddingLeft: 10,
    width: 100
  },
  errorMessage: {
    fontFamily: 'SourceSansPro-Regular',
    fontSize: 10,
    paddingBottom: 40,
    alignSelf: 'center',
    color: 'red',
    position: 'absolute'
  },
  center: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  footerCount: {
    marginRight: 20,
    color: '#4b4b4b',
    fontWeight: 'bold',
    fontSize: 22
  }
});

export default styles;
