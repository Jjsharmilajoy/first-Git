import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  bodyLayout: {
    flex: 9,
  },
  innerLayout: {
    flex: 1,
    backgroundColor: '#fff',
    alignContent: 'center'
  },
  innerSection: {
    flex: 0.10,
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 20
  },
  timingsSection: {
    marginTop: 20
  },
  title: {
    fontSize: 16,
    color: '#4a4a4a',
    alignSelf: 'center',
    marginTop: 20,
    marginBottom: 10
  },
  timingSelect: {
    flexDirection: 'row',
    marginVertical: 10,
    marginHorizontal: 200,
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  weekDays: {
    flex: 0.5
  },
  weekDaysTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4a4a4a'
  },
  timeSlot: {
    width: 90,
    textAlign: 'center',
    marginLeft: 10,
    marginTop: 5,
    fontSize: 12,
    fontWeight: 'bold',
    backgroundColor: '#fff',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#e6e6e6',
    color: '#aaaeb3',
    paddingHorizontal: 15,
    paddingVertical: 7
  },
  weeklyHoliday: {
    flexDirection: 'row',
    paddingTop: 10,
    marginVertical: 40,
    marginHorizontal: 200,
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  dayPicker: {
    height: 40,
    width: 180,
    color: '#4a4a4a',
    marginHorizontal: 2
  },
  dropDown: {
    position: 'absolute',
    right: 110,
    top: 0,
    elevation: 3,
    backgroundColor: 'white',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#fff'
  }
});

export default styles;
