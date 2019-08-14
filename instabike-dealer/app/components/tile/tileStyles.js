import { StyleSheet } from 'react-native';

export const imageTextStyles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 10,
    paddingRight: 10,
    height: 70
  }
});

export const gradientCountTile = StyleSheet.create({
  container: {
    borderRadius: 2,
    shadowColor: 'black',
    shadowOffset: {
      width: 3,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 2,
  },
  loading: {
    position: 'absolute',
    left: 75,
  },
  tileView: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 0,
  },
  content: {
    justifyContent: 'center'
  },
  countStyle: {
    fontSize: 20,
    color: 'white',
    alignItems: 'center',
  },
  tileTextStyle: {
    fontSize: 20, color: 'white',
  },
  secondCountStyle: {
    fontSize: 10,
    marginLeft: -3,
    color: 'white',
  },
  textStyle: {
    color: 'white',
    fontSize: 13,
  },
  innerTextStyle: {
    color: 'white',
    fontSize: 13,
    alignSelf: 'center',
  }
});

export const horizontalTextStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 10,
    paddingRight: 10
  },
  leftTextStyle: {
    fontSize: 18,
  },
  rightTextStyle: {
    fontSize: 20,
  }
});

export const horizontalImageTextStyles = StyleSheet.create({
  container: {
    backgroundColor: '#ECF4FD',
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 10,
    paddingRight: 10
  },
  circle: {
    width: 40,
    height: 40,
    borderRadius: 40 / 2,
    backgroundColor: '#D6EAFD'
  },
  rightContainer: {
    marginLeft: 20,
    justifyContent: 'space-around'
  },
  rightTextStyle: {
    color: '#99ACB8',
    fontSize: 16,
  },
  countTextStyle: {
    backgroundColor: '#859CB8',
    paddingLeft: 10,
    paddingRight: 10,
    alignSelf: 'center',
    marginTop: 2
  }
});

export const tileStyles = StyleSheet.create({
  cardTile: {
    flexDirection: 'column',
    padding: 10,
    justifyContent: 'center',
    backgroundColor: '#EAF2FE',
    paddingRight: 10
  },
  darkTile: {
    backgroundColor: '#F3F6FA'
  },
  lightTile: {
    backgroundColor: '#E4EFFE'
  },
  textSize: {
    fontSize: 10
  }
});
