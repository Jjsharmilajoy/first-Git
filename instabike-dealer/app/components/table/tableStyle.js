import { StyleSheet } from 'react-native';
import fonts from '../../theme/fonts';

const tableStyles = StyleSheet.create({
  headerContainer: {
    height: 50,
    flexDirection: 'row',
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4
  },
  headerColumnContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowContainer: {
    backgroundColor: 'white',
    height: 50,
    flexDirection: 'row',
    alignSelf: 'center'
  },
  rowContentStyle: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  rowTextContentStyle: {
    fontSize: 14,
    color: '#34323b',
    textAlign: 'center',
    alignSelf: 'center',
    fontFamily: fonts.sourceSansProRegular,
  },
  tableContainer: {
    backgroundColor: '#f3f3f2',
    elevation: 2,
    shadowOffset: {
      width: 10,
      height: 10,
    },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    borderRadius: 5,
  },
  footerText: {
    marginLeft: 20,
    borderColor: '#f37e2e',
    borderBottomWidth: 2,
    color: '#4a4a4a',
    fontWeight: 'bold'
  },
  footerContainer: {
    borderTopWidth: 1,
    borderColor: '#e3e3e3',
    backgroundColor: 'white',
    height: 50,
    justifyContent: 'center',
    borderRadius: 5
  }
});

export default tableStyles;
