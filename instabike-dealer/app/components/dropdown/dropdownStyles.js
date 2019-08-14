import { StyleSheet } from 'react-native';

const DropDownStyles = StyleSheet.create({

  MainContainer: {
    backgroundColor: 'grey',
    width: 100
  },
  buttonStyle: {
    padding: 10,
    backgroundColor: 'white',
    width: 150
  },
  textStyle: {
    color: '#3E6288',
    fontSize: 10
  },
  dropdownWrapper: {
    marginTop: 10,
    flexDirection: 'row',
    position: 'absolute',
    zIndex: 95,
    height: 100,
    elevation: 130
  },
  dropDownLabel: {
    backgroundColor: '#EAF2FE',
    fontSize: 10,
    padding: 5,
    color: '#A2B0C5'
  },
  buttonWithRightImageStyle: {
    backgroundColor: '#EAF2FE',
    flexDirection: 'row',
    height: 24,
    width: 140
  },
  buttonWithRightImageTextStyle: {
    color: '#2B547B',
    fontSize: 10,
    paddingTop: 5
  },
  scrollViewStyle: {
    position: 'absolute',
    top: 25,
    zIndex: 99,
    borderWidth: 1,
    borderColor: '#EAF2FE',
    right: 0,
    height: 80
  }
});

export default DropDownStyles;
