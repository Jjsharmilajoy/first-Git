import {
  StyleSheet
} from 'react-native';

const sideNavStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFF',
    elevation: 20,
    shadowColor: '#DFE5F0',
    shadowOffset: {
      width: 0,
      height: 2
    }
  },
  tileImage: {
    flex: 1,
  },
  tileGradientText: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
  },
  tileGradientBorder: {
    width: 7,
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch'
  },
  tile: {
    flex: 1,
    flexDirection: 'row'
  },
  tileContainer: {
    width: 7,
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 99,
    backgroundColor: '#383737'
  },
  headerStyle: {
    justifyContent: 'center',
    padding: 10
  },
  textStyle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4F749B',
    alignSelf: 'center'
  },
  buttonStyle: {
    marginTop: 20
  },
  unSelectedTile: {
    backgroundColor: '#373636'
  },
  selectedTile: {
    backgroundColor: '#EF7432',
  },
  leadButtonStyle: {
    padding: 10,
    borderRadius: 5
  },
  navButton: {
    padding: 10,
    borderRadius: 5
  },
  gradient: {
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
    backgroundColor: 'white',
    shadowOffset: {
      width: 10,
      height: 10,
    },
    height: 50,
  },
  image: {
    height: 50,
    left: -5,
    width: 100,
  }
});

export default sideNavStyles;
