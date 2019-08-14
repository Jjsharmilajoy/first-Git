
import { StyleSheet } from 'react-native';

const targetGraphStyles = StyleSheet.create({
  targetSummaryHeader: {
    marginTop: 10,
    marginLeft: 20,
    color: 'black'
  },
  targetSummaryContainer: {
    backgroundColor: 'white',
    elevation: 2,
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    margin: 20,
    padding: 20,
    shadowColor: '#DFE5F0',
    shadowOffset: { width: 3, height: 3 },
    borderRadius: 4,
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  targetFirstRowContent: {
    textAlign: 'left',
    color: '#494949',
    paddingTop: 15,
    paddingBottom: 10,
    width: 300,
    fontSize: 12,
    backgroundColor: 'white'
  },
  targetFirstRowContentTextInitial: {
    textAlign: 'left',
    color: 'gray',
    fontSize: 10,
    backgroundColor: 'white',
    position: 'absolute',
    paddingTop: 20,
    marginLeft: -35
  },
  targetFirstRowContentTextSecondary: {
    textAlign: 'left',
    color: 'gray',
    fontSize: 10,
    backgroundColor: 'white',
    position: 'absolute',
    paddingTop: 20,
    marginLeft: -30
  },
  percentagetText: {
    textAlign: 'center',
    color: 'white',
    paddingVertical: 15,
    paddingHorizontal: 3,
    fontSize: 10,
  },
  targetLineGraph: {
    width: 3,
    marginLeft: 1,
    position: 'absolute',
    textAlign: 'center',
    color: '#c2c2c2',
    backgroundColor: '#c2c2c2',
    borderRadius: 5,
    top: 1
  },
  primaryTargetFlex: {
    flex: 7,
    marginLeft: 5,
    borderRadius: 5,
    flexDirection: 'row'
  },
  targetGradient: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
    margin: 2,
  },
  targetOpacity: {
    textAlign: 'left',
    color: 'white',
    padding: 2,
    justifyContent: 'flex-start',
    fontSize: 10
  },
  secondaryTargetContent: {
    width: 3,
    marginLeft: 1,
    position: 'absolute',
    textAlign: 'center',
    color: '#c2c2c2',
    backgroundColor: '#c2c2c2',
    borderRadius: 5,
    top: 1
  },
  zeroPercentText: {
    height: 20,
    width: 20,
    marginLeft: 1,
    fontSize: 10,
    textAlign: 'left',
    color: 'black',
    backgroundColor: 'white',
  },
  percentText: {
    height: 20,
    width: 100,
    left: -20,
    textAlign: 'left',
    fontSize: 10,
    color: 'black',
    backgroundColor: 'white',
  },
  actualPercentage: {
    height: 20,
    marginLeft: 1,
    textAlign: 'left',
    fontSize: 10,
    color: 'black',
    backgroundColor: 'white',
  },
  secondaryTargetActuals: {
    height: 20,
    width: 100,
    marginLeft: 1,
    marginTop: 1,
    position: 'absolute',
    textAlign: 'left',
    color: 'black',
    fontSize: 10,
    backgroundColor: 'white',
    borderRadius: 5
  },
  secondaryTargetActualText: {
    height: 20,
    width: 3,
    marginLeft: 1,
    position: 'absolute',
    textAlign: 'left',
    color: 'black',
    fontSize: 10,
    backgroundColor: 'white',
    borderRadius: 5
  }
});

export default targetGraphStyles;
