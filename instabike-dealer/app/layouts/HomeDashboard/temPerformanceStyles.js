import { StyleSheet } from 'react-native';

const teamPerformaceStyles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    elevation: 4,
    flex: 1,
    margin: 10,
    borderRadius: 4,
  },
  headerStyle: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10
  },
  userImageStyle: {
    backgroundColor: '#edeefc',
    borderRadius: 50,
  },
  userImageText: {
    paddingVertical: 15,
    paddingHorizontal: 15,
    fontSize: 15,
    fontWeight: '400',
    color: '#5264df',
  },
  nameContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  nameStyle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#494949',
    paddingHorizontal: 15,
  },
  activeUser: {
    width: 8,
    height: 8,
    borderRadius: 10,
    backgroundColor: '#89da30',
    marginLeft: 5,
    marginTop: 5,
  },
  followUpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingHorizontal: 10,
  },
  followUpText: {
    fontSize: 13,
    fontWeight: '400',
    color: '#494949'
  },
  followUpDoneText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#494949'
  },
  followUpTarget: {
    fontSize: 12,
    fontWeight: '400',
    color: '#494949'
  },
  dealerTargetPillContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f4f4f4',
  },
  dealerTargetPillContent: {
    flex: 1,
    padding: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: 4,
    marginHorizontal: 5,
    paddingHorizontal: 5,
    marginTop: 10
  },
  dealerTargetPillContentLabel: {
    fontSize: 12,
    color: 'white',
    alignSelf: 'center',
  },
  dealerTargetPillContentValue: {
    fontSize: 13,
    fontWeight: 'bold',
    alignSelf: 'center',
    color: 'white'
  },
  newLeadsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginTop: 10,
    borderBottomWidth: 1,
    paddingBottom: 10,
    borderBottomColor: '#f4f4f4',
  },
  newLeadsLabel: {
    fontWeight: '400',
    fontSize: 13,
    color: '#494949'
  },
  newLeadsValue: {
    fontWeight: '600',
    fontSize: 15,
    color: '#494949'
  },
  monthlyUnitsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginTop: 10,
  },
  monthlyUnitsLabel: {
    fontWeight: '400',
    fontSize: 12,
    justifyContent: 'center',
    paddingVertical: 5,
    color: '#573bda'
  },
  monthlyUnitsValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#573bda',
    justifyContent: 'center',
  },
  monthlyUnitsTagetValue: {
    fontSize: 12,
    fontWeight: '400',
    color: '#494949'
  },
  monthlyUnitsPerformance: {
    marginTop: 5,
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
  },
  monthlyUnitsPerformanceGradient: {
    alignItems: 'center',
    justifyContent: 'center',
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
    margin: 2,
    height: 13
  },
  teamPerformance: {
    flex: 5,
    alignSelf: 'center',
    paddingLeft: 10,
    color: '#000',
    fontWeight: '400',
    fontSize: 15
  },
  teamPerformanceSpringButton: {
    justifyContent: 'center',
    flex: 1,
    marginRight: 10
  },
  teamPerformanceEditLinearButton: {
    borderRadius: 5,
    margin: 2,
    paddingTop: 4,
    paddingBottom: 4,
    flexDirection: 'row',
    backgroundColor: 'white',
  },
  teamPerformanceEditTargetLinearButton: {
    borderRadius: 5,
    margin: 2,
    paddingTop: 4,
    paddingBottom: 4,
    flexDirection: 'row',
  }
});

export default teamPerformaceStyles;

