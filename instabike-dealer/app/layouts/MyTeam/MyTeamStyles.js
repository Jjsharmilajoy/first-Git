import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  addButtonAlignment: {
    alignItems: 'flex-end'
  },
  tableWrapper: {
    backgroundColor: 'white',
    paddingHorizontal: 15,
    elevation: 4,
    marginTop: 20,
    marginBottom: 2
  },
  flexOne: {
    flex: 1,
    alignItems: 'center'
  },
  flexOneRow: {
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center'
  },
  flexTwo: {
    flex: 2
  },
  tableHeaderWrapper: {
    paddingVertical: 10,
    flexDirection: 'row',
  },
  textSpacing: {
    marginHorizontal: 5,
    fontSize: 14,
    color: '#f16736',
    fontFamily: 'SourceSansPro-Regular',
  },
  tableHeaderTextStyle: {
    fontSize: 14,
    color: '#f16736',
    fontFamily: 'SourceSansPro-Regular'
  }
});

export default styles;
