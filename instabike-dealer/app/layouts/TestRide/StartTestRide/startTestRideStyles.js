import { StyleSheet } from 'react-native';
import fonts from '../../../theme/fonts';
import colors from '../../../theme/variables';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  body: {
    flex: 1,
    flexDirection: 'row',
    marginVertical: 40
  },
  bikeSection: {
    flex: 4,
    flexDirection: 'column',
    elevation: 4,
    backgroundColor: 'white',
    marginHorizontal: 15,
  },
  documentSection: {
    flex: 6,
    backgroundColor: 'white',
    elevation: 4,
    justifyContent: 'space-between',
    paddingHorizontal: 30,
    marginHorizontal: 15,
  },
  bikeImage: {
    width: 400, height: 250
  },
  category: {
    color: 'white',
    backgroundColor: '#02baf0',
    paddingVertical: 2,
    paddingHorizontal: 10,
    alignSelf: 'flex-start',
  },
  bikeDetail: {
    marginLeft: 20,
    marginRight: 20,
    marginTop: 10
  },
  bikeAssigneeWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bikeName: {
    fontFamily: fonts.sourceSansProSemiBold,
    fontSize: 14,
    color: colors.greyishBrown
  },
  bikeSectionLabelText: {
    fontFamily: fonts.sourceSansProRegular,
    fontSize: 12,
    color: colors.warmGreyNine
  },
  bikeSectionTextBold: {
    fontFamily: fonts.sourceSansProBold,
    fontSize: 14,
    color: colors.greyishBrown
  },
  leadContactView: {
    marginTop: 20
  },
  userDetailText: {
    fontFamily: fonts.sourceSansProRegular,
    fontSize: 12,
    color: colors.greyishBrownThree
  },
  circle: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginHorizontal: 10,
    backgroundColor: colors.whiteFive
  },
  photoUploadText: {
    fontFamily: fonts.sourceSansProRegular,
    fontSize: 14,
    marginTop: 20,
    color: colors.primaryTextColor
  },
  photoView: {
    flexDirection: 'row',
    marginTop: 20,
  },
  backButtonStyle: {
    width: 30,
    height: 40,
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: 'transparent'
  },
  backButtonTextStyle: {
    width: 40,
    color: '#f16537',
  },
  deleteText: {
    fontFamily: fonts.sourceSansProBold,
    fontSize: 12,
    color: colors.mango,
    marginLeft: 5,
  },
  licenseText: {
    fontFamily: fonts.sourceSansProBold,
    fontSize: 14,
    color: colors.greyishBrown
  },
  licenseInput: {
    height: 40,
    width: 200,
    marginTop: 10,
    borderColor: 'gray',
    borderWidth: 1
  },
  documentFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40
  },
  deleteImageWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10
  },
  photoStyle: {
    width: 150,
    height: 80,
    marginRight: 20
  },
  dropdownWrapper: {
    flexDirection: 'row',
    backgroundColor: '#F8F8F8',
    height: 25,
    alignItems: 'center'
  },
  addIcon: {
    width: 80,
    height: 80,
    borderColor: '#f79426',
    borderWidth: 1,
    backgroundColor: '#FFF7ED',
    justifyContent: 'center',
    alignItems: 'center'
  },
  disabledAddIcon: {
    width: 80,
    height: 80,
    borderColor: '#f79426',
    borderWidth: 1,
    backgroundColor: '#a89d9d',
    justifyContent: 'center',
    alignItems: 'center'
  },
  userIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 5,
    marginVertical: 5
  },
  assigneeName: {
    fontFamily: fonts.sourceSansProRegular,
    color: colors.charcoalGrey,
    fontSize: 15,
    marginHorizontal: 3
  },
});

export default styles;
