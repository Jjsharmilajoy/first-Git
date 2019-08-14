import { StyleSheet } from 'react-native';
import variables from '../../theme/variables';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column'
  },
  header: {
    flex: 1,
    flexDirection: 'row',
  },
  body: {
    flex: 9,
    flexDirection: 'row'
  },
  add: {
    flex: 0.08,
    alignItems: 'center'
  },
  buttonStyles: {
    backgroundColor: variables.primaryButtonColor,
    justifyContent: 'center',
    alignSelf: 'center',
    paddingLeft: 14,
    paddingRight: 14,
    paddingTop: 30,
    paddingBottom: 30
  },
  customBtnStyles: {
    justifyContent: 'center',
    alignSelf: 'center',
    padding: 10,
  },
  tabWrapper: {
    flexDirection: 'row',
    justifyContent: 'flex-start'
  }
});

export default styles;
