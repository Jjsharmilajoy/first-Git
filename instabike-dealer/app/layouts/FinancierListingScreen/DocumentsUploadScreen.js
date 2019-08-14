/**
 * The Document upload Screen Component gets the document from lead
 * and uploads. The OTP is also integrated in this screen in order to
 * verify.
 */
import React, { Component } from 'react';
import {
  View, Text, TouchableOpacity, FlatList, PermissionsAndroid,
  Image, Modal, TextInput, ScrollView, Picker, Alert, BackHandler
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import ImagePicker from 'react-native-image-picker';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { requestPermission, checkPermission } from '../../helpers/Permissions';
import constants from '../../utils/constants';

// Styles
import styles from './documentsUploadStyles';

// Header HOC
import AppHeader from '../../components/header/Header';

// Action Methods
import {
  getFinancierLeadDetails,
  updateFinancierLeadDetails,
  sendOtp,
  resendOtp,
  verifyOtp
} from '../../redux/actions/DocumentUpload/actionCreators';
import {
  uploadDocument,
  deleteDocumentById,
  markAllDocumentsAsVerified
} from '../../redux/actions/TestRide/actionCreators';
import { disableButton } from '../../redux/actions/Global/actionCreators';

// Component
import {
  GradientButtonLarge,
  ButtonWithPlainText
} from '../../components/button/Button';
import { currencyFormatter, interestValidator, isNumeric } from '../../utils/validations';
import Loader from '../../components/loader/Loader';

// Images
import Close from '../../assets/images/close.png';
import Pdf from '../../assets/images/pdf.png';

const AdvancedEmiArray = ['0', '1', '2', '3'];
const DocumentsHeader = [
  'Upload the following documents',
  '',
  'Actions',
  'Original Seen & Verified'
];
@connect(
  state => ({
    financierLead: state.documentUpload.financierLead,
    loading: state.documentUpload.loadingGroup || state.testRide.loadingGroup,
    document: state.testRide.document,
    verifiedData: state.testRide.verifiedData,
    currentUser: state.user.currentUser,
    lead: state.global.lead,
    sendOtpObj: state.documentUpload.sendOtpObj,
    resendOtpObj: state.documentUpload.resendOtpObj,
    verifyOtpObj: state.documentUpload.verifyOtpObj,
    buttonState: state.global.buttonState
  }),
  {
    getFinancierLeadDetails,
    updateFinancierLeadDetails,
    uploadDocument,
    deleteDocumentById,
    markAllDocumentsAsVerified,
    sendOtp,
    resendOtp,
    verifyOtp,
    disableButton
  }
)

export default class DocumentsUploadScreen extends Component {
  static propTypes = {
    navigation: PropTypes.object.isRequired,
    getFinancierLeadDetails: PropTypes.func.isRequired,
    financierLead: PropTypes.object,
    updateFinancierLeadDetails: PropTypes.func.isRequired,
    document: PropTypes.object,
    uploadDocument: PropTypes.func.isRequired,
    currentUser: PropTypes.object.isRequired,
    verifiedData: PropTypes.array.isRequired,
    deleteDocumentById: PropTypes.func.isRequired,
    markAllDocumentsAsVerified: PropTypes.func.isRequired,
    sendOtp: PropTypes.func.isRequired,
    sendOtpObj: PropTypes.object,
    resendOtp: PropTypes.func.isRequired,
    verifyOtp: PropTypes.func.isRequired,
    verifyOtpObj: PropTypes.object,
    loading: PropTypes.bool.isRequired,
    buttonState: PropTypes.bool.isRequired,
    disableButton: PropTypes.func.isRequired
  }

  static defaultProps = {
    financierLead: {},
    sendOtpObj: {},
    verifyOtpObj: {},
    document: null,
  }

  constructor(props) {
    super(props);
    this.state = {
      otpTF: '',
      photos: [],
      modalVisible: false,
      AdvancedEmiVal: '',
      emiVal: '',
      tenureVal: '',
      ROIVal: '',
      loanAmount: '',
      downpayment: '',
      localfinancierLead: {},
      documentsArray: {},
      imagesObject: [],
      lead: {},
      dirty: false,
      // showVerified: false,
      DetailHeaderArray: ['Financier', 'Loan', 'Interest', 'Downpayments', 'EMI', 'Tenure', 'Advance EMI'],
      currentModel: 'SendOtpView',
      disableVerifyBtn: false
    };
    // stateless variable to handle image picker multiple taps.
    this.imagePickerCalled = false;
    this._didFocusSubscription = props.navigation.addListener('didFocus', payload => BackHandler.addEventListener('hardwareBackPress', () => this.onBackButtonPressAndroid(payload)));
  }

  static getDerivedStateFromProps(nextProps) {
    if (nextProps.lead) {
      return {
        lead: nextProps.lead,
      };
    }
    return null;
  }

  componentWillMount() {
    this._willBlurSubscription = this.props.navigation.addListener('willBlur', payload => BackHandler.removeEventListener('hardwareBackPress', () => this.onBackButtonPressAndroid(payload)));
    this.onInitialLoad(false);
  }

  componentDidMount() {
    this._willBlurSubscription = this.props.navigation.addListener('willBlur', payload => BackHandler.removeEventListener('hardwareBackPress', () => this.onBackButtonPressAndroid(payload)));
    this.willFocusSubscription = this.props.navigation.addListener(
      'willFocus',
      () => {
        this.onInitialLoad(false);
      }
    );
  }

  componentWillUnmount() {
    this.willFocusSubscription.remove();
  }

  onInitialLoad = isDelete => {
    this.props.getFinancierLeadDetails(this.props.navigation.state.params.financierLeadId).then(() => {
      if (this.props.financierLead && this.props.financierLead.status === 500
        && this.state.DetailHeaderArray.length === 7) {
        this.state.DetailHeaderArray.push('');
      }
      this.setState({
        DetailHeaderArray: this.state.DetailHeaderArray,
        localfinancierLead: this.props.financierLead,
        AdvancedEmiVal: `${this.props.financierLead.advance_emi}`,
        emiVal: `${this.props.financierLead.emi}`,
        tenureVal: this.props.financierLead.tenure,
        loanAmount: this.props.financierLead.loan_amount,
        downpayment: `${this.props.financierLead.down_payment}`,
        ROIVal: `${this.props.financierLead.interest_percentage}`,
        documentsArray: this.props.financierLead.documents,
        photos: this.props.financierLead.document_details
      }, (() => {
          this.groupingPhotosBasedOnType(isDelete);
        }));
    }).catch(() => { });
  }

  /*
    This should replace later
     onBackButtonPressAndroid = payload => {
  */

  onBackButtonPressAndroid = () => {
    this.setState({
      modalVisible: false,
      AdvancedEmiVal: `${this.props.financierLead.advance_emi}`,
      emiVal: `${this.props.financierLead.emi}`,
      tenureVal: this.props.financierLead.tenure,
      loanAmount: this.props.financierLead.loan_amount,
      downpayment: this.props.financierLead.down_payment,
      ROIVal: `${this.props.financierLead.interest_percentage}`,
      dirty: false
    }, () => {
      if (this.props.navigation.state.params.fromScreen === 'FromFinanceDocuments') {
        const currentLeadDetailObj = this.state.lead && this.state.lead.lead_details && this.state.lead.lead_details.length > 0 && this.state.lead.lead_details.find(currentleaddetail => this.props.navigation.state.params.leadDetailId === currentleaddetail.id);
        this.props.navigation.navigate('BikePriceScreen', { leadDetail: currentLeadDetailObj, fromScreen: 'fromUploadDocument' });
      } else {
        this.props.navigation.goBack();
      }
    });
  }

  onDeleteAllIconPress = () => {
    this.setState({
      photos: []
    });
  }

  onDeleteIconPress = currentItem => {
    this.props.deleteDocumentById(currentItem.id).then(() => {
      this.onInitialLoad(true);
    }).catch(error => {
      console.log('ERROR:::::::', error);
    });
  }

  onVerifiedBtnPress = mainIndex => {
    if (this.state.imagesObject[mainIndex].imagesArray.length > 0) {
      const uploadDocumentIds = [];
      this.state.imagesObject[mainIndex].imagesArray.forEach(eachImage => {
        uploadDocumentIds.push(eachImage.id);
      });
      const { id } = this.state.localfinancierLead;
      Promise.all([
        this.props.markAllDocumentsAsVerified(uploadDocumentIds)
      ]).then(() => {
        this.state.imagesObject[mainIndex].imagesArray = this.props.verifiedData;
        this.state.imagesObject[mainIndex].showVerified = true;
        this.setState({
          imagesObject: this.state.imagesObject
        }, () => {
          // updating financier status on each verify after setState
          this.props.updateFinancierLeadDetails(id, {
            id,
            is_osv_done: this.statusCheckForOSVVerified()
          }).catch(() => {});
        });
      }).catch(() => {});
    } else {
      Alert.alert(
        'Alert',
        'Add documents to verify..',
        [
          { text: 'OK', onPress: () => { } },
        ],
        { cancelable: false }
      );
    }
  }

  onPickerChange = currentItem => {
    this.setState({
      AdvancedEmiVal: currentItem,
      dirty: true,
    });
  }

  getDetailHeaderArray = () => (
    <View style={[styles.detailHeaderView, { flex: 1 }]}>
      {
        this.state.DetailHeaderArray.map(currentheader => (
          <View style={styles.detailHeaderTitleView}>
            <Text style={styles.detailTitleTextStyle}>
              {currentheader}
            </Text>
          </View>
        ))
      }
    </View>
  )

  getDocumentsHeaderArray = () => (
    <View style={[styles.detailHeaderView, { height: 40 }]}>
      {
        DocumentsHeader.map(currentheader => (
          <View style={styles.detailHeaderTitleView}>
            <Text style={styles.detailTitleTextStyle}>
              {currentheader}
            </Text>
          </View>
        ))
      }
    </View>
  )

  getUploadedImage = (item, mainIndex) => (
    <ScrollView style={styles.uploadDocumentView} horizontal>
      {item.length > 0
        ? item.map((eachItem, index) => (
          <View style={styles.uploadDocumentView}>
            {
              eachItem.file_name.includes('.pdf')
                ? (
                  <Image
                    style={styles.uploadDocImageStyle}
                    source={Pdf}
                />
                )
                : (
                  <Image
                    style={styles.uploadDocImageStyle}
                    source={{
                      uri:
                      `${constants.BASEURL}/Documents/${eachItem.id}/small?access_token=${this.props.currentUser.documentToken}`
                    }}
                />
                )
            }
            {
            this.state.localfinancierLead.status === 500 &&
            <TouchableOpacity
              style={styles.deleteBtnStyle}
              onPress={() => this.onDeleteIconPress(eachItem, index, mainIndex)}>
              <Icon
                name="trash"
                size={21}
                color="#ff7561"
                style={styles.thrashIconStyle} />
            </TouchableOpacity>
          }
          </View>
        ))
        : null
      }
    </ScrollView>
  );

  getOptionalDocument = isDelete => {
    const { photos, documentsArray } = this.state;
    if (documentsArray && documentsArray.includes('bank_statement')) {
      this.state.imagesObject.push({
        name: 'bank_statement',
        label: 'Bank Statement (Last 3 months)',
        imagesArray: photos && photos.length > 0
          ? photos.filter(currentObj => currentObj.name === 'bank_statement') : [],
        showVerified:
          photos && photos.length > 0
            ? this.shouldThisBeDisabled(photos.filter(currentObj => currentObj.name === 'bank_statement')) : false,
        limit: 10,
      });
    }
    if (documentsArray && documentsArray.includes('cheque_leaf')) {
      this.state.imagesObject.push({
        name: 'cheque_leaf',
        label: 'Cheque Leaf',
        imagesArray: photos && photos.length > 0
          ? photos.filter(currentObj => currentObj.name === 'cheque_leaf') : [],
        showVerified:
          photos && photos.length > 0
            ? this.shouldThisBeDisabled(photos.filter(currentObj => currentObj.name === 'cheque_leaf')) : false,
        limit: 2,
      });
    }
    if (documentsArray && documentsArray.includes('credit_card_statement')) {
      this.state.imagesObject.push({
        name: 'credit_card_statement',
        label: 'Credit Card Statement',
        imagesArray: photos && photos.length > 0
          ? photos.filter(currentObj => currentObj.name === 'credit_card_statement') : [],
        showVerified: photos && photos.length > 0
          ? this.shouldThisBeDisabled(photos.filter(currentObj => currentObj.name === 'credit_card_statement')) : false,
        limit: 3,
      });
    }
    if (documentsArray && documentsArray.includes('driving_licence')) {
      this.state.imagesObject.push({
        name: 'driving_licence',
        label: 'Driving Licence',
        imagesArray: photos && photos.length > 0
          ? photos.filter(currentObj => currentObj.name === 'driving_licence') : [],
        showVerified: photos && photos.length > 0
          ? this.shouldThisBeDisabled(photos.filter(currentObj => currentObj.name === 'driving_licence')) : false,
        limit: 2,
      });
    }
    if (documentsArray && documentsArray.includes('eb_card')) {
      this.state.imagesObject.push({
        name: 'eb_card',
        label: 'EB Card',
        imagesArray: photos && photos.length > 0
          ? photos.filter(currentObj => currentObj.name === 'eb_card') : [],
        showVerified: photos && photos.length > 0
          ? this.shouldThisBeDisabled(photos.filter(currentObj => currentObj.name === 'eb_card')) : false,
        limit: 2,
      });
    }
    if (documentsArray && documentsArray.includes('employee_id_card')) {
      this.state.imagesObject.push({
        name: 'employee_id_card',
        label: 'Employee ID Card',
        imagesArray: photos && photos.length > 0
          ? photos.filter(currentObj => currentObj.name === 'employee_id_card') : [],
        showVerified: photos && photos.length > 0
          ? this.shouldThisBeDisabled(photos.filter(currentObj => currentObj.name === 'employee_id_card')) : false,
        limit: 2,
      });
    }
    if (documentsArray && documentsArray.includes('form_16')) {
      this.state.imagesObject.push({
        name: 'form_16',
        label: 'Form 16',
        imagesArray: photos && photos.length > 0
          ? photos.filter(currentObj => currentObj.name === 'form_16') : [],
        showVerified: photos && photos.length > 0
          ? this.shouldThisBeDisabled(photos.filter(currentObj => currentObj.name === 'form_16')) : false,
        limit: 4,
      });
    }
    if (documentsArray && documentsArray.includes('hr_letter')) {
      this.state.imagesObject.push({
        name: 'hr_letter',
        label: 'HR Letter',
        imagesArray: photos && photos.length > 0
          ? photos.filter(currentObj => currentObj.name === 'hr_letter') : [],
        showVerified: photos && photos.length > 0
          ? this.shouldThisBeDisabled(photos.filter(currentObj => currentObj.name === 'hr_letter')) : false,
        limit: 1,
      });
    }
    if (documentsArray && documentsArray.includes('it_returns_latest')) {
      this.state.imagesObject.push({
        name: 'it_returns_latest',
        label: 'IT Returns - Latest',
        imagesArray: photos && photos.length > 0
          ? photos.filter(currentObj => currentObj.name === 'it_returns_latest') : [],
        showVerified: photos && photos.length > 0
          ? this.shouldThisBeDisabled(photos.filter(currentObj => currentObj.name === 'it_returns_latest')) : false,
        limit: 3,
      });
    }
    if (documentsArray && documentsArray.includes('lic_policy')) {
      this.state.imagesObject.push({
        name: 'lic_policy',
        label: 'LIC Policy',
        imagesArray: photos && photos.length > 0
          ? photos.filter(currentObj => currentObj.name === 'lic_policy') : [],
        showVerified: photos && photos.length > 0
          ? this.shouldThisBeDisabled(photos.filter(currentObj => currentObj.name === 'lic_policy')) : false,
        limit: 4,
      });
    }
    if (documentsArray && documentsArray.includes('passport')) {
      this.state.imagesObject.push({
        name: 'passport',
        label: 'Passport',
        imagesArray: photos && photos.length > 0
          ? photos.filter(currentObj => currentObj.name === 'passport') : [],
        showVerified: photos && photos.length > 0
          ? this.shouldThisBeDisabled(photos.filter(currentObj => currentObj.name === 'passport')) : false,
        limit: 4,
      });
    }
    if (documentsArray && documentsArray.includes('ration_card')) {
      this.state.imagesObject.push({
        name: 'ration_card',
        label: 'Ration Card',
        imagesArray: photos && photos.length > 0
          ? photos.filter(currentObj => currentObj.name === 'ration_card') : [],
        showVerified: photos && photos.length > 0
          ? this.shouldThisBeDisabled(photos.filter(currentObj => currentObj.name === 'ration_card')) : false,
        limit: 2,
      });
    }
    if (documentsArray && documentsArray.includes('rental_agreement')) {
      this.state.imagesObject.push({
        name: 'rental_agreement',
        label: 'Rental Agreement',
        imagesArray: photos && photos.length > 0
          ? photos.filter(currentObj => currentObj.name === 'rental_agreement') : [],
        showVerified: photos && photos.length > 0
          ? this.shouldThisBeDisabled(photos.filter(currentObj => currentObj.name === 'rental_agreement')) : false,
        limit: 10,
      });
    }
    if (documentsArray && documentsArray.includes('salary_slip')) {
      this.state.imagesObject.push({
        name: 'salary_slip',
        label: 'Salary Slip',
        imagesArray: photos && photos.length > 0
          ? photos.filter(currentObj => currentObj.name === 'salary_slip') : [],
        showVerified: photos && photos.length > 0
          ? this.shouldThisBeDisabled(photos.filter(currentObj => currentObj.name === 'salary_slip')) : false,
        limit: 6,
      });
    }
    if (documentsArray && documentsArray.includes('utility_bills')) {
      this.state.imagesObject.push({
        name: 'utility_bills',
        label: 'Utility Bills',
        imagesArray: photos && photos.length > 0
          ? photos.filter(currentObj => currentObj.name === 'utility_bills') : [],
        showVerified: photos && photos.length > 0
          ? this.shouldThisBeDisabled(photos.filter(currentObj => currentObj.name === 'utility_bills')) : false,
        limit: 4,
      });
    }
    if (documentsArray && documentsArray.includes('voter_id')) {
      this.state.imagesObject.push({
        name: 'voter_id',
        label: 'Voter ID',
        imagesArray: photos && photos.length > 0
          ? photos.filter(currentObj => currentObj.name === 'voter_id') : [],
        showVerified: photos && photos.length > 0
          ? this.shouldThisBeDisabled(photos.filter(currentObj => currentObj.name === 'voter_id')) : false,
        limit: 2,
      });
    }
    this.setState({
      imagesObject: this.state.imagesObject,
    }, () => {
      if (isDelete) {
        const { id } = this.state.localfinancierLead;
        this.props.updateFinancierLeadDetails(id, {
          id,
          is_osv_done: this.statusCheckForOSVVerified(),
          is_doc_uploaded: this.statusCheckForOverallDocUpload()
        });
      }
    });
  }

  captureImage = async mainIndex => {
    const options = {
      title: 'Select Image',
      storageOptions: {
        skipBackup: true,
        path: 'images'
      }
    };
    ImagePicker.showImagePicker(options, response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
        this.imagePickerCalled = false;
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
        this.imagePickerCalled = false;
      } else {
        let data = [];
        data = [
          {
            name: 'lead',
            data: JSON.stringify({
              lead_id: this.state.localfinancierLead.id,
              type: 'Financier',
              name: this.state.imagesObject[mainIndex].name
            })
          },
          {
            name: 'file',
            filename: response.fileName,
            data: response.data
          }
        ];
        const { id } = this.state.localfinancierLead;
        Promise.all([
          this.props.uploadDocument(this.state.localfinancierLead.user_id, data)]).then(() => {
          // const { id } = this.state.localfinancierLead;
          this.state.imagesObject[mainIndex].imagesArray.push(this.props.document);
          this.state.imagesObject[mainIndex].showVerified = false;
          this.setState({
            imagesObject: this.state.imagesObject,
          }, () => {
            this.imagePickerCalled = false;
            // updating financier status on each doc upload after setState
            this.props.updateFinancierLeadDetails(id, {
              id,
              is_osv_done: this.statusCheckForOSVVerified(),
              is_doc_uploaded: this.statusCheckForOverallDocUpload()
            }).catch(() => {});
          });
        }).catch(error => { console.log('Error', error); });
      }
    });
  }

  statusCheckForOverallDocUpload = () => {
    this.state.imagesObject.forEach(curObj => {
      if (curObj.imagesArray.length === 0) {
        return false;
      }
    });
    return true;
  }

  statusCheckForOSVVerified = () => {
    let status = true;
    this.state.imagesObject.some(curObj => {
      if (!curObj.showVerified) {
        status = false;
      }
      return !curObj.showVerified;
    });
    return status;
  }

  handleImagePicker = async mainIndex => {
    if (!this.imagePickerCalled) {
      this.imagePickerCalled = true;
      const permissionGranted = await checkPermission(PermissionsAndroid.PERMISSIONS.CAMERA)
        && await checkPermission(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
      if (permissionGranted) {
        this.captureImage(mainIndex);
      } else {
        const givePermissionRequest = await requestPermission();
        if (PermissionsAndroid.RESULTS.GRANTED === givePermissionRequest) {
          this.captureImage(mainIndex);
        } else if (PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN === givePermissionRequest) {
          Alert.alert(
            'Info',
            'Go to Settings and enable necessary permissions to proceed.',
            [
              { text: 'Ok', onPress: () => { } },
            ],
            { cancelable: false }
          );
        }
      }
    }
  }

  groupingPhotosBasedOnType = isDelete => {
    const { photos } = this.state;
    this.state.imagesObject = [
      {
        name: 'aadhaar_card',
        label: 'Aadhaar Card',
        imagesArray: photos && photos.length > 0
          ? photos.filter(currentObj => currentObj.name === 'aadhaar_card') : [],
        showVerified: photos && photos.length > 0
          ? this.shouldThisBeDisabled(photos.filter(currentObj => currentObj.name === 'aadhaar_card')) : false,
        limit: 2
      },
      {
        name: 'pan_card',
        label: 'PAN Card',
        imagesArray: photos && photos.length > 0
          ? photos.filter(currentObj => currentObj.name === 'pan_card') : [],
        showVerified: photos && photos.length > 0
          ? this.shouldThisBeDisabled(photos.filter(currentObj => currentObj.name === 'pan_card')) : false,
        limit: 2
      },
      {
        name: 'passport_size_photograph',
        label: 'Passport Size Photograph',
        imagesArray: photos && photos.length > 0
          ? photos.filter(currentObj => currentObj.name === 'passport_size_photograph') : [],
        showVerified: photos && photos.length > 0 ? this.shouldThisBeDisabled(photos.filter(currentObj => currentObj.name === 'passport_size_photograph')) : false,
        limit: 2
      }
    ];
    this.getOptionalDocument(isDelete);
  }

  calculateEmiValue = () => {
    let errMessage = '';
    if (!isNumeric(this.state.loanAmount) || this.state.loanAmount === '0') {
      errMessage = 'Invalid loanAmount';
    } else if (!isNumeric(this.state.downpayment) || parseInt(this.state.downpayment, 10) < 0) {
      errMessage = 'Invalid downpayment';
    } else if (!isNumeric(this.state.tenureVal) || this.state.tenureVal === '0') {
      errMessage = 'Invalid tenure';
    } else if (!interestValidator(this.state.ROIVal) || this.state.ROIVal === '0') {
      errMessage = 'Invalid rate of interest';
    }
    if (errMessage.length === 0) {

      // const r = this.state.ROIVal / 12 / 100;
      // const emi = this.state.localfinancierLead.loan_amount * r *
      //   (Math.pow((1 + r), this.state.tenureVal) / (Math.pow((1 + r), this.state.tenureVal) - 1));
      // this.setState({
      //   emiVal: `${parseInt(emi, 10)}`,
      //   dirty: true,
      // });
    } else {
      Alert.alert(
        'Info',
        errMessage,
        [
          {
            text: 'OK',
            onPress: () => {
              this.setState({
                dirty: true,
              });
            }
          },
        ],
        { cancelable: false }
      );
    }
  }

  resendOtpBtnTapped = () => {
    try {
      this.props.disableButton();
      this.props.resendOtp(this.props.financierLead.assignedTo.id, this.props.sendOtpObj)
        .then(res => {
          if (res.response && res.response.pinId) {
            Alert.alert(
              'Message',
              'OTP Sent Successfully', [{
                text: 'OK',
                onPress: () => { }
              }], {
                cancelable: false
              }
            );
          } else if (res.response && res.response.message.includes('Sending Failed')) {
            Alert.alert(
              'Message',
              'Failed to send OTP, Please try again later', [{
                text: 'OK',
                onPress: () => { }
              }], {
                cancelable: false
              }
            );
          }
        });
    } catch (error) {
      console.log(error);
    }
  }

  verifyBtnTapped = () => {
    this.props.disableButton();
    // this.setState({
    //   currentModel: 'OTPView',
    //   modalVisible: false,
    //   dirty: false,
    //   otpTF: ''
    // });
    this.setState({
      disableVerifyBtn: true
    });
    const data = {
      pinId: this.props.sendOtpObj.pinId,
      pin: this.state.otpTF
    };
    this.props.verifyOtp(this.state.localfinancierLead.assignedTo.id, data).then(() => {
      if (this.props.verifyOtpObj && this.props.verifyOtpObj.verified) {
        this.setState({
          currentModel: 'OTPView',
          modalVisible: false,
          otpTF: '',
          disableVerifyBtn: false
        });
      } else {
        Alert.alert(
          'Alert',
          'Please enter valid OTP',
          [
            {
              text: 'OK',
              onPress: () => {
                this.setState({
                  otpTF: '',
                  disableVerifyBtn: false
                });
              }
            },
          ],
          { cancelable: false }
        );
      }
    });
  }

  sendOtpBtntapped = () => {
    this.props.disableButton();
    this.props.sendOtp(this.props.financierLead.assignedTo.id).then(() => {
      if (this.props.sendOtpObj && this.props.sendOtpObj.pinId) {
        Alert.alert(
          'Message',
          'OTP Sent Successfully', [{
            text: 'OK',
            onPress: () => {
              this.setState({
                currentModel: 'OTPView',
              });
            }
          }], {
            cancelable: false
          }
        );
      } else if (this.props.sendOtpObj && this.props.sendOtpObj.message.includes('Sending Failed')) {
        Alert.alert(
          'Message',
          'Failed to send OTP, Please try again later', [{
            text: 'OK',
            onPress: () => { }
          }], {
            cancelable: false
          }
        );
      }
    });
  }

  modalCloseBtnTapped = () => {
    this.setState({
      modalVisible: false,
      AdvancedEmiVal: `${this.props.financierLead.advance_emi}`,
      emiVal: `${this.props.financierLead.emi}`,
      tenureVal: this.props.financierLead.tenure,
      loanAmount: this.props.financierLead.loan_amount,
      downpayment: this.props.financierLead.down_payment,
      ROIVal: `${this.props.financierLead.interest_percentage}`,
      dirty: false
    }, () => {
      if (this.state.currentModel !== 'EditEmiView') {
        this.props.navigation.goBack();
      }
    });
  }

  doneBtnTapped = () => {
    let errMessage = '';
    if (!isNumeric(this.state.loanAmount) || this.state.loanAmount === '0') {
      errMessage = 'Invalid loanAmount';
    } else if (!isNumeric(this.state.downpayment) || parseInt(this.state.downpayment, 10) < 0) {
      errMessage = 'Invalid downpayment';
    } else if (!isNumeric(this.state.tenureVal) || this.state.tenureVal === '0') {
      errMessage = 'Invalid tenure';
    } else if (!interestValidator(this.state.ROIVal) || this.state.ROIVal === '0') {
      errMessage = 'Invalid rate of interest';
    } else if (!isNumeric(this.state.emiVal) || this.state.emiVal === '0') {
      errMessage = 'Invalid Emi value';
    }
    if (errMessage.length === 0) {
      const { localfinancierLead } = this.state;
      localfinancierLead.loan_amount = this.state.loanAmount;
      localfinancierLead.down_payment = this.state.downpayment;
      localfinancierLead.emi = this.state.emiVal;
      localfinancierLead.interest_percentage = this.state.ROIVal;
      localfinancierLead.tenure = this.state.tenureVal;

      localfinancierLead.advance_emi = this.state.AdvancedEmiVal;
      this.props.updateFinancierLeadDetails(this.state.localfinancierLead.id, localfinancierLead).then(() => {
        this.setState({
          localfinancierLead: this.props.financierLead,
          modalVisible: false,
          dirty: false
        });
      });
      // });
    } else {
      Alert.alert(
        'Info',
        errMessage,
        [
          {
            text: 'OK',
            onPress: () => {
              this.setState({
                dirty: true,
              });
            }
          },
        ],
        { cancelable: false }
      );
    }
  }

  getCurrentView = () => {
    switch (this.state.currentModel) {
      case 'EditEmiView':
        return (
          <ScrollView>
            <View style={{
              flex: 1
            }}>
              <View style={styles.textInputOverView}>
                <View style={styles.textInputContainer}>
                  <Text style={[styles.detailTextInputStyle]}>
                    Loan Amount
                  </Text>
                  <TextInput
                    keyboardType="numeric"
                    maxLength={6}
                    style={styles.fieldContainer}
                    onChangeText={text => this.setState({ loanAmount: text, dirty: true })}
                    value={`${this.state.loanAmount}`}
                    underlineColorAndroid="transparent" />
                </View>
                <View style={styles.textInputContainer}>
                  <Text style={[styles.detailTextInputStyle]}>
                    Downpayment
                  </Text>
                  <TextInput
                    keyboardType="numeric"
                    maxLength={6}
                    style={styles.fieldContainer}
                    onChangeText={text => this.setState({ downpayment: text, dirty: true })}
                    value={this.state.downpayment}
                    underlineColorAndroid="transparent" />
                </View>
              </View>
              <View style={styles.textInputOverView}>
                <View style={styles.textInputContainer}>
                  <Text style={[styles.detailTextInputStyle]}>
                    Tenure
                  </Text>
                  <TextInput
                    keyboardType="numeric"
                    maxLength={2}
                    style={styles.fieldContainer}
                    onChangeText={text => this.setState({ tenureVal: text, dirty: true })}
                    value={`${this.state.tenureVal}`}
                    underlineColorAndroid="transparent" />
                </View>
                <View style={styles.textInputContainer}>
                  <Text style={[styles.detailTextInputStyle]}>
                    Advanced EMI
                  </Text>
                  <View style={styles.pickerOverView}
                  >
                    <Picker
                      style={{ height: 35 }}
                      selectedValue={(this.state.AdvancedEmiVal) ? this.state.AdvancedEmiVal : 0
                      }
                      mode="dropdown"
                      onValueChange={itemValue => this.onPickerChange(itemValue)}
                    >
                      {
                        AdvancedEmiArray && AdvancedEmiArray.map(currentItem => (
                          <Picker.Item
                            label={currentItem}
                            value={currentItem}
                            key={currentItem} />
                        ))
                      }
                    </Picker>
                  </View>
                </View>
              </View>
              <View style={styles.textInputOverView}>
                <View style={styles.textInputContainer}>
                  <Text style={[styles.detailTextInputStyle]}>
                    EMI
                  </Text>
                  <TextInput
                    keyboardType="numeric"
                    style={styles.fieldContainer}
                    onChangeText={text => this.setState({ emiVal: text, dirty: true })}
                    value={this.state.emiVal}
                    underlineColorAndroid="transparent" />
                </View>
                <ButtonWithPlainText
                  disabled={!this.state.dirty}
                  title="DONE"
                  style={[styles.doneBtnStyle, { backgroundColor: (this.state.dirty) ? '#f37730' : 'gray' }]}
                  handleSubmit={() => { this.doneBtnTapped(); }}
                  textStyle={styles.doneBtnTextStyle}
                />
              </View>
            </View>
          </ScrollView>
        );
      case 'OTPView':
        return (
          <View style={{ flex: 1 }}>
            <View style={styles.OTPTotalViewStyle}>
              <Text style={styles.offerTextStyle}>
                {`Enter the OTP sent to the number ending with '${this.state.localfinancierLead
                  && this.state.localfinancierLead.assignedTo
                  && this.state.localfinancierLead.assignedTo.mobile_no
                  ? (this.state.localfinancierLead.assignedTo.mobile_no).substring(6) : ''}'`}
              </Text>
              <View style={styles.OTPInputView}>
                <TextInput
                  maxLength={4}
                  keyboardType="numeric"
                  underlineColorAndroid="transparent"
                  style={styles.otpTF}
                  onChangeText={text => this.setState({ otpTF: text })}
                  value={this.state.otpTF}
                />
              </View>
            </View>
            <View style={{
              flexDirection: 'row', height: 60, marginTop: 10, justifyContent: 'space-between', marginHorizontal: 30,
            }}
            >

              <ButtonWithPlainText
                title="RESEND OTP?"
                disabled={this.props.buttonState}
                style={styles.resendBtnStyle}
                handleSubmit={this.resendOtpBtnTapped}
                textStyle={styles.resendBtnTextStyle}
              />
              <ButtonWithPlainText
                title="VERIFY"
                disabled={this.props.buttonState || this.state.disableVerifyBtn}
                style={styles.verifyBtnStyle}
                handleSubmit={this.verifyBtnTapped}
                textStyle={styles.verifyBtnTextStyle}
              />
            </View>
          </View>
        );
      case 'SendOtpView':
        return (
          <View style={{ flex: 1 }}>
            <View style={styles.OTPTotalViewStyle}>
              <Text style={styles.offerTextStyle}>
                {`Representative from ${this.state.localfinancierLead
                  && this.state.localfinancierLead.financier
                  && this.state.localfinancierLead.financier.name
                  ? this.state.localfinancierLead.financier.name : ''}`}
              </Text>
              <View style={styles.nameTextView}>
                <Text style={[styles.nameTextStyle, { paddingRight: 10, marginLeft: 20 }]}>
                  {this.state.localfinancierLead
                    && this.state.localfinancierLead.assignedTo
                    && this.state.localfinancierLead.assignedTo.first_name
                    ? this.state.localfinancierLead.assignedTo.first_name : ''}
                </Text>
                <View style={styles.nameNumberSeperator} />
                <Text style={[styles.nameTextStyle, { paddingLeft: 10 }]}>
                  {this.state.localfinancierLead
                    && this.state.localfinancierLead.assignedTo
                    && this.state.localfinancierLead.assignedTo.mobile_no
                    ? this.state.localfinancierLead.assignedTo.mobile_no : ''}
                </Text>
              </View>
            </View>
            <View style={{
              flexDirection: 'row', height: 60, marginTop: 10, justifyContent: 'flex-end', marginHorizontal: 30,
            }}
            >
              <ButtonWithPlainText
                title="SEND OTP"
                disabled={this.props.buttonState}
                style={styles.verifyBtnStyle}
                handleSubmit={() => this.sendOtpBtntapped()}
                textStyle={styles.verifyBtnTextStyle}
              />
            </View>
          </View>
        );
      default:
    }
  }

  header = () => (
    <View style={styles.headerContainer}>
      <View style={styles.headerNameView}>
        {
          this.state.lead
            ? <Text style={styles.nameText}>{this.state.lead.name}</Text>
            : <Text style={styles.nameText}>N/A</Text>
        }
        <Text style={[styles.nameText, { marginLeft: 12 }]}>
          {
            this.state.lead
              ? (this.state.lead.mobile_number)
                ? <Text style={styles.nameText}>{this.state.lead.mobile_number}</Text>
                : <Text style={styles.nameText}>N/A</Text>
              : null
          }
        </Text>
      </View>
    </View>
  )

  _keyExtractor = item => item.id;

  validateIsOSV = docArray => (docArray.filter(item => item.is_osv_verified === true)).length > 0;

  viewFinalPriceBtnTapped = () => {
    const { navigation } = this.props;
    const { lead } = this.state;
    const currentLeadDetailObj = lead &&
      lead.lead_details &&
      lead.lead_details.length > 0 &&
      lead.lead_details.find(currentleaddetail =>
        navigation.state.params.leadDetailId === currentleaddetail.id);
    console.log('=================:::::::::::::::::::::::::::::::::::::::::::::::', currentLeadDetailObj);
    navigation.navigate('BikePriceScreen', { leadDetail: currentLeadDetailObj, fromScreen: 'fromUploadDocument' });
  }

  shouldThisBeDisabled = data => {
    if (data.length === 0) {
      return false;
    }
    return data.length === data.filter(currentObj => currentObj.is_osv_verified === true).length;
  }

  renderSeparator = () => (
    <View
      style={styles.lineSeperator}
    />
  );

  renderItem = (item, mainIndex) => (
    <View
      style={styles.cellContainer}>
      <Text style={[styles.detailValueTextStyle, { flex: 1 }]}>
        {item.label}
      </Text>
      <View style={[styles.detailValueTextStyle, styles.totalImageView]}>
        {
          this.getUploadedImage(item.imagesArray, mainIndex)
        }
      </View>
      {/* {this.state.localfinancierLead && this.state.localfinancierLead.status && this.state.localfinancierLead.status === 500 && */}
      <View style={[styles.chooseFileBtnViewStyle]}>
        {(item.imagesArray.length < item.limit)
            && (
            <TouchableOpacity
              style={[styles.chooseFileBtnStyle, { justifyContent: 'flex-start' }]}
              disabled={this.props.loading || (this.state.localfinancierLead && this.state.localfinancierLead.status &&
                this.state.localfinancierLead.status !== 500)}
              onPress={() => this.handleImagePicker(mainIndex)}>
              <View style={[styles.chooseFileView,
                {
                  backgroundColor: this.state.localfinancierLead && this.state.localfinancierLead.status &&
                this.state.localfinancierLead.status !== 500 ? '#D3D3D3' : '#ffefe5'
                }]}>
                <Text style={[styles.chooseFileBtnTextStyle,
                  {
                    color: this.state.localfinancierLead && this.state.localfinancierLead.status &&
                      this.state.localfinancierLead.status !== 500 ? '#ffffff' : '#f16736'
                  }
                ]}>
                  CHOOSE FILE
                </Text>
              </View>
            </TouchableOpacity>
            )
          }
      </View>
      {/* } */}
      <TouchableOpacity
        style={styles.veficationBtnStyle}
        disabled={item.showVerified || this.state.localfinancierLead.status > 500 || this.props.loading}
        onPress={() => this.onVerifiedBtnPress(mainIndex)}>
        <View style={[styles.verifiedBtnView,
          { backgroundColor: item.showVerified ? '#e2fbe5' : '#f7dde0' }]}>
          <Icon
            name={item.showVerified ? 'check-circle' : 'commenting'}
            size={21}
            color={item.showVerified ? '#7ed321' : '#ff7561'}
            style={{ alignSelf: 'center', marginHorizontal: 5 }} />
          <Text style={[styles.verificationBtntextStyle]}>
            {
              item.showVerified ? 'Verified' : 'Not Verified'
            }
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  )

  render() {
    const currentLeadDetailObj = this.state.lead && this.state.lead.lead_details && this.state.lead.lead_details.length > 0 && this.state.lead.lead_details.find(currentleaddetail => this.props.navigation.state.params.leadDetailId === currentleaddetail.id);
    return (
      <View style={styles.container}>
        <Loader showIndicator={this.props.loading} />
        <AppHeader
          backEnabled
          navigation={this.props.navigation}
          onBackClick={() => {
            this.onBackButtonPressAndroid();
          }}
          isLeadExists={false}>
          {this.header()}
        </AppHeader>
        <Modal
          animationType="slide"
          transparent
          visible={this.state.modalVisible}
          onRequestClose={() => {
            this.modalCloseBtnTapped();
          }}
        >
          <View style={styles.modalconatiner}>
            <TouchableOpacity
              style={styles.closeBtnView}
              onPress={() => {
                this.modalCloseBtnTapped();
              }}
            >
              <Image
                style={{ resizeMode: 'center' }}
                source={Close}
              />
            </TouchableOpacity>
            <View style={styles.modalMainContainer}>
              <View style={styles.vehicleDetailView}>
                <Image
                  source={{
                    uri: (currentLeadDetailObj && currentLeadDetailObj.vehicle
                      && currentLeadDetailObj.vehicle.name) ? currentLeadDetailObj.vehicle.image_url : 'http://'
                  }}
                  style={styles.vehicleImageStyle}
                  resizeMode="contain"
                />
                <View style={styles.specificationViewStyle}>
                  <Text style={styles.specsDetailTextStyle}>
                    {(currentLeadDetailObj && currentLeadDetailObj.vehicle
                      && currentLeadDetailObj.vehicle.name) ? currentLeadDetailObj.vehicle.name : ''}
                  </Text>
                </View>
                <View style={styles.specificationViewStyle}>
                  <Text style={styles.specheadertextStyle}>
                    Financier
                  </Text>
                  <Text style={styles.specsDetailTextStyle}>
                    {(this.state.localfinancierLead
                      && this.state.localfinancierLead.financier
                      && this.state.localfinancierLead.financier.name)
                      ? this.state.localfinancierLead.financier.name : ''}
                  </Text>
                </View>
                <View style={styles.specificationViewStyle}>
                  <Text style={styles.specheadertextStyle}>
                    Loan Amount
                  </Text>
                  <Text style={styles.specsDetailTextStyle}>
                    {this.state.localfinancierLead.loan_amount
                      && (`${this.state.localfinancierLead.loan_amount}`.includes('.')
                        ? `${this.state.localfinancierLead.loan_amount}`.split('.')[0]
                        : `${currencyFormatter(this.state.localfinancierLead.loan_amount)}`)
                    }
                  </Text>
                </View>
                <View style={styles.specificationViewStyle}>
                  <Text style={styles.specheadertextStyle}>
                    Interest
                  </Text>
                  <Text style={styles.specsDetailTextStyle}>
                    {this.state.ROIVal}%
                  </Text>
                </View>
              </View>
              <View style={styles.dataContainerView}>
                <Text style={styles.offerTextStyle}>
                  Finance options
                </Text>
                <View style={styles.seperator} />
                <View style={{ flex: 1 }}>
                  {
                    this.getCurrentView()
                  }
                </View>
              </View>
            </View>
          </View>
        </Modal>
        <View style={styles.detailSectionView}>
          <View style={{ flex: 1 }}>
            {
              this.getDetailHeaderArray()
            }
          </View>
          <View style={styles.detailValueView}>
            <Text style={styles.detailValueTextStyle}>
              {(this.state.localfinancierLead
                && this.state.localfinancierLead.financier
                && this.state.localfinancierLead.financier.name)
                ? this.state.localfinancierLead.financier.name : ''}
            </Text>
            <Text style={styles.detailValueTextStyle}>
              {this.state.localfinancierLead.loan_amount
                && (`${this.state.localfinancierLead.loan_amount}`.includes('.')
                  ? `${this.state.localfinancierLead.loan_amount}`.split('.')[0]
                  : `${currencyFormatter(this.state.localfinancierLead.loan_amount)}`)}
            </Text>
            <Text style={styles.detailValueTextStyle}>
              {this.state.localfinancierLead.interest_percentage}
%
            </Text>
            <Text style={styles.detailValueTextStyle}>
              {this.state.localfinancierLead.down_payment
                && (`${this.state.localfinancierLead.down_payment}`.includes('.')
                  ? `${this.state.localfinancierLead.down_payment}`.split('.')[0]
                  : `${currencyFormatter(this.state.localfinancierLead.down_payment)}`)}
            </Text>
            <Text style={styles.detailValueTextStyle}>
              {this.state.localfinancierLead.emi
                && (`${this.state.localfinancierLead.emi}`.includes('.')
                  ? `${this.state.localfinancierLead.emi}`.split('.')[0]
                  : `${currencyFormatter(this.state.localfinancierLead.emi)}`)}
            </Text>
            <Text style={styles.detailValueTextStyle}>
              {this.state.localfinancierLead.tenure}
              {' '}
Months
            </Text>
            <Text style={styles.detailValueTextStyle}>
              {(this.state.localfinancierLead && this.state.localfinancierLead.advance_emi)
                && (`${this.state.localfinancierLead.advance_emi}`.includes('.')
                  ? `${this.state.localfinancierLead.advance_emi}`.split('.')[0]
                  : `${this.state.localfinancierLead.advance_emi}`)}
              {' '}
Month(s)
            </Text>
            {this.state.localfinancierLead.status === 500
              && (
              <View style={styles.detailValueTextStyle}>
                <TouchableOpacity
                  onPress={() => {
                    this.setState({
                      modalVisible: true,
                      currentModel: 'EditEmiView',
                      AdvancedEmiVal: `${this.state.localfinancierLead.advance_emi}`,
                      emiVal: `${this.state.localfinancierLead.emi}`,
                      tenureVal: this.state.localfinancierLead.tenure,
                      ROIVal: this.state.localfinancierLead.interest_percentage,
                    });
                  }
                  }
                >
                  <View style={styles.editBtnViewStyle}>
                    <Text style={styles.editBtnTextViewStyle}>
                      Edit
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
              )
            }
          </View>
        </View>
        <View style={styles.documentListSection}>
          <View style={styles.docuemntTableView}>
            {
              this.getDocumentsHeaderArray()
            }
            <FlatList
              style={{ flex: 1 }}
              ItemSeparatorComponent={this.renderSeparator}
              keyExtractor={this._keyExtractor}
              data={this.state.imagesObject}
              renderItem={({ item, index }) => this.renderItem(item, index)}
              extraData={this.state}
            />
          </View>
        </View>

        <View style={styles.continueSection}>
          <View style={styles.viewFinalpriceBtnViewStyle}>
            <GradientButtonLarge
              style={styles.viewFinalpriceBtnStyle}
              title="VIEW FINAL PRICE"
              handleSubmit={() => this.viewFinalPriceBtnTapped()}
            />
          </View>
        </View>
      </View>
    );
  }
}

