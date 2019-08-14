import { StyleSheet, Dimensions } from 'react-native';

const { height, width } = Dimensions.get('window');
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff'
  },
  formTitle: {
    fontSize: 16,
    color: '#645e5c',
    alignSelf: 'center',
    fontFamily: 'SourceSansPro-SemiBold'
  },
  addTeamButton: {
    position: 'absolute',
    right: 25
  },
  addTeamMember: {
    paddingHorizontal: 20,
    paddingVertical: 5,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#FCE7DB'
  },
  item: {
    flexDirection: 'row',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#d8e8fb',
    alignItems: 'center',
    justifyContent: 'center'
  },
  cell: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  cellText: {
    fontSize: 12,
    color: '#454545',
    fontFamily: 'SourceSansPro-Regular'
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#e9e9e9',
    paddingVertical: 10
  },
  tableHeaderCell: {
    flex: 1,
    justifyContent: 'center'
  },
  tableHeaderText: {
    alignSelf: 'center',
    fontSize: 14,
    color: '#454545',
    fontFamily: 'SourceSansPro-SemiBold',
  },
  addTeamMemberText: {
    color: '#f79426',
    fontFamily: 'SourceSansPro-Bold',
    fontSize: 12
  },
  sendCredentialsBtn: {
    justifyContent: 'center',
    alignItems: 'stretch',
    paddingVertical: 6,
    backgroundColor: '#ffefe5',
    borderRadius: 2
  },
  resendButton: {
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 6,
  },
  sendCredentialsText: {
    color: '#f16736',
    fontFamily: 'SourceSansPro-Bold',
    fontSize: 12,
  },
  editTouchWrapper: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignSelf: 'center',
    marginHorizontal: 20
  },
  editView: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  editTextStyle: {
    marginLeft: 2,
    color: '#f79426',
    fontSize: 12,
  },
  deleteTouchWrapper: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignSelf: 'center',
    marginHorizontal: 20
  },
  modalButtonViewStyle: {
    alignItems: 'center',
    marginTop: 20
  },
  modalButtonStyle: {
    paddingVertical: 10
  },
  deleteView: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  deleteTextStyle: {
    marginLeft: 2,
    color: '#f79426',
    fontSize: 12
  },
  backgroundOverlay: {
    width,
    height,
    backgroundColor: '#000',
    opacity: 0.8,
    position: 'absolute'
  },
  teamAddView: {
    width: width / 2,
    backgroundColor: 'white',
    alignSelf: 'center',
    zIndex: 10
  },
  addViewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomColor: '#979797',
    borderBottomWidth: 1,
    elevation: 4,
    backgroundColor: 'white'
  },
  addMemberTextStyle: {
    marginLeft: 34,
    paddingTop: 15,
    paddingBottom: 10,
    borderBottomColor: '#f79426',
    borderBottomWidth: 4
  },
  hideModalStyle: {
    // backgroundColor: '#f79426',
    width: 50,
    height: 50,
    justifyContent: 'center'
  },
  closeButton: {
    width: 30,
    height: 30,
    alignSelf: 'center'
  },
  memberInfoView: {
    marginHorizontal: 34,
    marginTop: 24,
  },
  nameTextView: {
    flexDirection: 'row'
  },
  nameText: {
    fontSize: 12,
    fontFamily: 'SourceSansPro-Regular',
    color: '#6f6f6f',
    lineHeight: 22
  },
  requiredStyle: {
    color: '#f79426',
    lineHeight: 16,
    marginLeft: 2
  },
  nameInput: {
    borderColor: '#bdbdbf',
    marginTop: 4,
    borderWidth: 1,
    borderRadius: 1,
  },
  roleTouchWrapper: {
    flexDirection: 'row',
    marginTop: 6
  },
  normalRoleStyle: {
    width: 70,
    height: 68,
    backgroundColor: '#f4f4f4',
    marginRight: 10,
    justifyContent: 'center',
    borderColor: '#f79426',
    borderWidth: 1
  },
  activatedRoleStyle: {
    borderColor: '#B3856C',
    borderWidth: 1,
    width: 70,
    height: 68,
    backgroundColor: '#f79426',
    elevation: 8,
    marginRight: 10,
    justifyContent: 'center'
  },
  roleText: {
    textAlign: 'center',
    fontFamily: 'SourceSansPro-Regular',
    fontSize: 12
  },
  roleActivatedTextColor: {
    textAlign: 'center',
    fontFamily: 'SourceSansPro-Regular',
    fontSize: 12,
    color: 'white'
  },
  phoneBorder: {
    borderColor: '#bdbdbf',
    marginTop: 6,
    borderWidth: 1,
    borderRadius: 1
  },
  phoneDialCode: {
    backgroundColor: '#bdbdbf',
    paddingHorizontal: 10,
    justifyContent: 'center'
  },
  phoneDialCodeText: {
    color: 'gray',
    fontSize: 12
  },
  passwordText: {
    color: '#6f6f6f',
    fontSize: 12,
    marginTop: 10
  },
  passwordBoldText: {
    color: '#6f6f6f',
    fontSize: 12,
    fontFamily: 'SourceSansPro-Bold'
  },
  addTeamMemberButton: {
    position: 'absolute',
    right: 40,
    backgroundColor: 'white'
  },
  gridContainer: {
    flex: 6,
    justifyContent: 'center',
    backgroundColor: 'white',
    elevation: 4,
    // marginTop: 28,
    height: 700
  },
  tableView: {
    // elevation: 4,
    height: 220,
    backgroundColor: 'white',
    // borderWidth: 1,
    // borderRadius: 5,
    borderColor: 'grey',
    // marginHorizontal: 40,
    marginBottom: 10,
    zIndex: 4,
  },
  flexDirectionRow: {
    flexDirection: 'row',
  },
  flexOne: {
    flex: 1,
  },
  errorTextStyle: {
    fontSize: 10,
    fontFamily: 'SourceSansPro-Regular',
    color: 'red',
  },
  continueSectionView: {
    paddingTop: 15,
    flex: 2
  },
});

export default styles;
