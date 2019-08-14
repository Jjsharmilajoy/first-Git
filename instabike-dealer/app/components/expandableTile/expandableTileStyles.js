import { StyleSheet } from 'react-native';

const expandableTileStyles = StyleSheet.create({
  unitSoldSelectedStyle: {
    elevation: 6,
    shadowColor: 'gray',
    shadowOffset: { width: 6, height: 0 }
  },
  unitSoldSelectedTextStyle: {
    color: '#FDFEFD'
  },
  bikeDetailStyle: {
    elevation: 3,
    shadowColor: 'gray',
    shadowOffset: { width: 3, height: 0 }
  },
  bikeDetailTextStyle: {
    color: '#FDFEFD'
  },
  scooterTileStyle: {
  },
  shadowTile: {
    justifyContent: 'center',
    shadowColor: 'gray',
    elevation: 5,
    shadowOffset: {
      width: 3,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  tileWidth: {
    width: 150
  }
});

export default expandableTileStyles;
