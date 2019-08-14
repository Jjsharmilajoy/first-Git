import React, { Component } from 'react';
import {
  View, TouchableOpacity, ScrollView, Alert, Text, Modal, Image, Platform, TextInput
} from 'react-native';
import { Dropdown } from 'react-native-material-dropdown';
import Icon from 'react-native-vector-icons/FontAwesome';
import { TextField } from 'react-native-material-textfield';
import { connect } from 'react-redux';
import { uniqBy } from 'lodash';
import PropTypes from 'prop-types';
import moment from 'moment';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import styles from './vehicleEnquiredStyles';
import {
  BookTestRideButton,
  SecondaryButton,
  ButtonWithPlainText
} from '../../components/button/Button';
import {
  updateLeadDetail,
  createLeadDetail,
  updateLeadDetailStatus,
  deleteLeadDetail,
  getAllVehicles
} from '../../redux/actions/LeadHistory/actionCreators';
import {
  getFinancierRepresentativeList,
} from '../../redux/actions/FinancierListing/actionCreators';
import {
  getFinancierLeadDetails,
  updateFinancierLeadDetails,
  sendOtp,
  resendOtp,
  verifyOtp
} from '../../redux/actions/DocumentUpload/actionCreators';
import {
  setLead, updateLead, callToast, disableButton, getLead
} from '../../redux/actions/Global/actionCreators';
import { currencyFormatter, trimExtraspaces } from '../../utils/validations';
// import { showIndicator, hideIndicator } from '../../redux/actions/Loader/actionCreators';

import variables from '../../theme/variables';
import fonts from '../../theme/fonts';
// Images
import Close from '../../assets/images/close.png';
import Loader from '../../components/loader/Loader';

@connect(state => ({
  lead: state.global.lead,
  loading: state.leadHistory.loadingGroup || state.documentUpload.loadingGroup
  || state.financierListing.loadingGroup,
  vehicleList: state.leadHistory.vehicleList,
  currentUser: state.user.currentUser,
  financierLead: state.documentUpload.financierLead,
  error: state.leadHistory.error,
  sendOtpObj: state.documentUpload.sendOtpObj,
  resendOtpObj: state.documentUpload.resendOtpObj,
  verifyOtpObj: state.documentUpload.verifyOtpObj,
  financierRepresentativeList: state.financierListing.financierRepresentativeList,
  buttonState: state.global.buttonState
}), {
  setLead,
  getLead,
  updateLeadDetail,
  createLeadDetail,
  updateLeadDetailStatus,
  updateLead,
  deleteLeadDetail,
  getFinancierLeadDetails,
  updateFinancierLeadDetails,
  callToast,
  sendOtp,
  resendOtp,
  verifyOtp,
  getAllVehicles,
  getFinancierRepresentativeList,
  disableButton
})
class VehicleEnquired extends Component {
  static propTypes = {
    screenProps: PropTypes.object.isRequired,
    lead: PropTypes.object.isRequired,
    vehicleList: PropTypes.array,
    callToast: PropTypes.func.isRequired,
    deleteLeadDetail: PropTypes.func.isRequired,
    updateLeadDetail: PropTypes.func.isRequired,
    getAllVehicles: PropTypes.func.isRequired,
    setLead: PropTypes.func.isRequired,
    getLead: PropTypes.func.isRequired,
    updateLeadDetailStatus: PropTypes.func.isRequired,
    createLeadDetail: PropTypes.func.isRequired,
    currentUser: PropTypes.object.isRequired,
    navigation: PropTypes.object.isRequired,
    getFinancierLeadDetails: PropTypes.func.isRequired,
    updateFinancierLeadDetails: PropTypes.func.isRequired,
    financierLead: PropTypes.object,
    error: PropTypes.object,
    sendOtp: PropTypes.func.isRequired,
    sendOtpObj: PropTypes.object,
    resendOtp: PropTypes.func.isRequired,
    resendOtpObj: PropTypes.object,
    verifyOtp: PropTypes.func.isRequired,
    verifyOtpObj: PropTypes.object,
    getFinancierRepresentativeList: PropTypes.func.isRequired,
    financierRepresentativeList: PropTypes.array,
    disableButton: PropTypes.func.isRequired,
    buttonState: PropTypes.bool.isRequired
  }

  static defaultProps = {
    vehicleList: null,
    financierLead: {},
    error: {},
    sendOtpObj: {},
    resendOtpObj: {},
    verifyOtpObj: {},
    financierRepresentativeList: [],
  }

  constructor(props) {
    super(props);
    this.state = {
      photos: [],
      documentsArray: {},
      enquiredVehicles: [],
      modalVisible: false,
      localfinancierLead: {},
      imagesObject: [],
      isShowFinanceOption: false,
      reasonText: '',
      currentLeaddetailIndex: null,
      currentRefView: '',
      disableVerifyBtn: false,
      statusList: [
        {
          label: 'Enquired',
          status: 200
        },
        {
          label: 'Booked',
          status: 450
        },
        {
          label: 'Invoiced',
          status: 600
        }
      ],
      statusListWithoutEnquired: [
        {
          label: 'Booked',
          status: 450
        },
        {
          label: 'Invoiced',
          status: 600
        }
      ],
      otpTF: '',
      currentModel: 'SendOtpView',
      showOtpView: false,
      currentFinancierRep: {},
    };
  }

  static getDerivedStateFromProps(nextProps) {
    if (nextProps.vehicleList && nextProps.lead && nextProps.lead.lead_details) {
      return {
        enquiredVehicles: [...nextProps.lead.lead_details],
        vehicleList: nextProps.vehicleList
      };
    }
    return null;
  }

  componentDidMount() {
    const { currentUser: { dealerId } } = this.props;
    this.props.getAllVehicles(dealerId).catch(error => {
      console.log(error);
    });
  }

  onVehicleChange = (param, value, index, item) => {
    const { enquiredVehicles } = this.state;
    const variants = this.getVariantList(param === 'vehicle_id' ? value : item.vehicle_id);
    if (param === 'vehicle_id') {
      enquiredVehicles[index].variant_id = variants.length > 0 ? variants[0].id : '';
      enquiredVehicles[index].variant_colour_id = variants.length > 0 ? variants[0].colors.length > 0
        ? variants[0].colors[0].id : '' : '';
    }
    if (param === 'variant_id') {
      enquiredVehicles[index].variant_colour_id = this.getColorList(item.vehicle_id, value, variants)[0].id;
    }
    enquiredVehicles[index][param] = value;
    enquiredVehicles[index].dirty = true;
    this.setState({ enquiredVehicles });
  }

  onStatusChange = (status, item, index) => {
    if (status !== (item && item.vehicle_status)) {
      if (status === 600) {
        Alert.alert(
          '',
          'Would you like to invoice the vehicle?',
          [
            {
              text: 'Yes',
              onPress: () => {
                if (this.checkLeadDetailhassFinanceOption(this.state.enquiredVehicles[index])
                    && this.state.enquiredVehicles[index].financier_lead[0].status !== 520) {
                  Alert.alert(
                    'Info',
                    // 'Vehicle is under loan processing',
                    'Vehicle cannot be invoiced as loan is applied.',
                    [
                      {
                        text: 'Ok',
                        onPress: () => { }
                      }
                    ],
                    { cancelable: false }
                  );
                } else {
                  this.setState({
                    modalVisible: true,
                    currentRefView: 'Invoice',
                    currentLeaddetailIndex: index,
                  });
                  // this.invoicingLead(status, item);
                }
              }
            },
            {
              text: 'No',
              onPress: () => {
                this.cancelStatusChange();
              },
              style: 'cancel'
            },
          ],
          { cancelable: false }
        );
      } else if (status === 450) {
        this.setState({
          modalVisible: true,
          currentRefView: 'Book',
          currentLeaddetailIndex: index,
        });
      } else {
        const { enquiredVehicles } = this.state;
        enquiredVehicles[index].vehicle_status = status;
        this.setState({
          enquiredVehicles: this.state.enquiredVehicles
        }, () => {
          this.updateLeadDetail(index);
        });
      }
    }
  }

  getFinancierLeadDetails = (leaddetailId, index) => {
    const { lead } = this.props;
    const currentLeadDetailObj = lead && lead.lead_details && lead.lead_details.length > 0
      && lead.lead_details.find(currentleadDetail => leaddetailId === currentleadDetail.id);
    const financierLeadObj = currentLeadDetailObj.financier_lead;
    if (financierLeadObj.length > 0) {
      this.props.getFinancierLeadDetails(financierLeadObj[0].id).then(() => {
        this.setState({
          localfinancierLead: this.props.financierLead,
          photos: this.props.financierLead.document_details,
          documentsArray: this.props.financierLead.documents,
          modalVisible: true,
          isShowFinanceOption: true,
          currentLeaddetailIndex: index
        }, (() => {
            this.groupingPhotosBasedOnType();
          }));
      });
    }
  }

  getVariantList = vehicleId => {
    const { vehicleList } = this.props;
    const vehicles = vehicleList.filter(vehicle => vehicle.id === vehicleId);
    return vehicles.length !== 0 ? vehicles[0].variants : [];
  }

  getColorList = (vehicleId, variantId, variantList = []) => {
    variantList = variantList.length === 0 ? this.getVariantList(vehicleId) : variantList;
    const variants = variantList.filter(variant => variant.id === variantId);
    return variants.length !== 0 ? variants[0].colors : [];
  }

  getVehicle = vehicleId => {
    const { vehicleList } = this.props;
    const result = vehicleList && vehicleList.length > 0 && vehicleList.find(vehicle => vehicle.id === vehicleId);
    return result && result.name;
  }

  getStatus = vehicleStatus => {
    const result = this.state.statusList.find(data => data.status === vehicleStatus);
    return result && result.label;
  }

  getDocumentsArray = () => (
    <View style={styles.documentsView}>
      {this.state.localfinancierLead.documents
        && this.state.localfinancierLead.documents.map((currentheader, index) => (
          <Text style={styles.documentsTextStyle}>
            {index + 1}
.
            {this.textFormatter(currentheader)}
          </Text>
        ))
      }
    </View>
  )

  getOptionalDocument = () => {
    const { photos, documentsArray } = this.state;
    if (documentsArray && documentsArray.includes('bank_statement')) {
      this.state.imagesObject.push({
        name: 'bank_statement',
        label: 'Bank Statement (Last 3 months)',
        imagesArray: photos && photos.length > 0 ? photos.filter(currentObj => currentObj.name === 'bank_statement') : [],
        showVerified: photos && photos.length > 0 ? this.shouldThisBeDisabled(photos.filter(currentObj => currentObj.name === 'bank_statement')) : false
      });
    }
    if (documentsArray && documentsArray.includes('cheque_leaf')) {
      this.state.imagesObject.push({
        name: 'cheque_leaf',
        label: 'Cheque Leaf',
        imagesArray: photos && photos.length > 0 ? photos.filter(currentObj => currentObj.name === 'cheque_leaf') : [],
        showVerified: photos && photos.length > 0 ? this.shouldThisBeDisabled(photos.filter(currentObj => currentObj.name === 'cheque_leaf')) : false
      });
    }
    if (documentsArray && documentsArray.includes('credit_card_statement')) {
      this.state.imagesObject.push({
        name: 'credit_card_statement',
        label: 'Credit Card Statement',
        imagesArray: photos && photos.length > 0 ? photos.filter(currentObj => currentObj.name === 'credit_card_statement') : [],
        showVerified: photos && photos.length > 0 ? this.shouldThisBeDisabled(photos.filter(currentObj => currentObj.name === 'credit_card_statement')) : false
      });
    }
    if (documentsArray && documentsArray.includes('driving_licence')) {
      this.state.imagesObject.push({
        name: 'driving_licence',
        label: 'Driving Licence',
        imagesArray: photos && photos.length > 0 ? photos.filter(currentObj => currentObj.name === 'driving_licence') : [],
        showVerified: photos && photos.length > 0 ? this.shouldThisBeDisabled(photos.filter(currentObj => currentObj.name === 'driving_licence')) : false
      });
    }
    if (documentsArray && documentsArray.includes('eb_card')) {
      this.state.imagesObject.push({
        name: 'eb_card',
        label: 'EB Card',
        imagesArray: photos && photos.length > 0 ? photos.filter(currentObj => currentObj.name === 'eb_card') : [],
        showVerified: photos && photos.length > 0 ? this.shouldThisBeDisabled(photos.filter(currentObj => currentObj.name === 'eb_card')) : false
      });
    }
    if (documentsArray && documentsArray.includes('employee_id_card')) {
      this.state.imagesObject.push({
        name: 'employee_id_card',
        label: 'Employee ID Card',
        imagesArray: photos && photos.length > 0 ? photos.filter(currentObj => currentObj.name === 'employee_id_card') : [],
        showVerified: photos && photos.length > 0 ? this.shouldThisBeDisabled(photos.filter(currentObj => currentObj.name === 'employee_id_card')) : false
      });
    }
    if (documentsArray && documentsArray.includes('form_16')) {
      this.state.imagesObject.push({
        name: 'form_16',
        label: 'Form 16',
        imagesArray: photos && photos.length > 0 ? photos.filter(currentObj => currentObj.name === 'form_16') : [],
        showVerified: photos && photos.length > 0 ? this.shouldThisBeDisabled(photos.filter(currentObj => currentObj.name === 'form_16')) : false
      });
    }
    if (documentsArray && documentsArray.includes('hr_letter')) {
      this.state.imagesObject.push({
        name: 'hr_letter',
        label: 'HR Letter',
        imagesArray: photos && photos.length > 0 ? photos.filter(currentObj => currentObj.name === 'hr_letter') : [],
        showVerified: photos && photos.length > 0 ? this.shouldThisBeDisabled(photos.filter(currentObj => currentObj.name === 'hr_letter')) : false
      });
    }
    if (documentsArray && documentsArray.includes('it_returns_latest')) {
      this.state.imagesObject.push({
        name: 'it_returns_latest',
        label: 'IT Returns - Latest',
        imagesArray: photos && photos.length > 0 ? photos.filter(currentObj => currentObj.name === 'it_returns_latest') : [],
        showVerified: photos && photos.length > 0 ? this.shouldThisBeDisabled(photos.filter(currentObj => currentObj.name === 'it_returns_latest')) : false
      });
    }
    if (documentsArray && documentsArray.includes('lic_policy')) {
      this.state.imagesObject.push({
        name: 'lic_policy',
        label: 'LIC Policy',
        imagesArray: photos && photos.length > 0 ? photos.filter(currentObj => currentObj.name === 'lic_policy') : [],
        showVerified: photos && photos.length > 0 ? this.shouldThisBeDisabled(photos.filter(currentObj => currentObj.name === 'lic_policy')) : false
      });
    }
    if (documentsArray && documentsArray.includes('passport')) {
      this.state.imagesObject.push({
        name: 'passport',
        label: 'Passport',
        imagesArray: photos && photos.length > 0 ? photos.filter(currentObj => currentObj.name === 'passport') : [],
        showVerified: photos && photos.length > 0 ? this.shouldThisBeDisabled(photos.filter(currentObj => currentObj.name === 'passport')) : false
      });
    }
    if (documentsArray && documentsArray.includes('ration_card')) {
      this.state.imagesObject.push({
        name: 'ration_card',
        label: 'Ration Card',
        imagesArray: photos && photos.length > 0 ? photos.filter(currentObj => currentObj.name === 'ration_card') : [],
        showVerified: photos && photos.length > 0 ? this.shouldThisBeDisabled(photos.filter(currentObj => currentObj.name === 'ration_card')) : false
      });
    }
    if (documentsArray && documentsArray.includes('rental_agreement')) {
      this.state.imagesObject.push({
        name: 'rental_agreement',
        label: 'Rental Agreement',
        imagesArray: photos && photos.length > 0 ? photos.filter(currentObj => currentObj.name === 'rental_agreement') : [],
        showVerified: photos && photos.length > 0 ? this.shouldThisBeDisabled(photos.filter(currentObj => currentObj.name === 'rental_agreement')) : false
      });
    }
    if (documentsArray && documentsArray.includes('salary_slip')) {
      this.state.imagesObject.push({
        name: 'salary_slip',
        label: 'Salary Slip',
        imagesArray: photos && photos.length > 0 ? photos.filter(currentObj => currentObj.name === 'salary_slip') : [],
        showVerified: photos && photos.length > 0 ? this.shouldThisBeDisabled(photos.filter(currentObj => currentObj.name === 'salary_slip')) : false
      });
    }
    if (documentsArray && documentsArray.includes('utility_bills')) {
      this.state.imagesObject.push({
        name: 'utility_bills',
        label: 'Utility Bills',
        imagesArray: photos && photos.length > 0 ? photos.filter(currentObj => currentObj.name === 'utility_bills') : [],
        showVerified: photos && photos.length > 0 ? this.shouldThisBeDisabled(photos.filter(currentObj => currentObj.name === 'utility_bills')) : false
      });
    }
    if (documentsArray && documentsArray.includes('voter_id')) {
      this.state.imagesObject.push({
        name: 'voter_id',
        label: 'Voter ID',
        imagesArray: photos && photos.length > 0 ? photos.filter(currentObj => currentObj.name === 'voter_id') : [],
        showVerified: photos && photos.length > 0 ? this.shouldThisBeDisabled(photos.filter(currentObj => currentObj.name === 'voter_id')) : false
      });
    }
    this.setState({
      imagesObject: this.state.imagesObject
    });
  }

  getOptionalDocumentsArray = () => (
    <View style={styles.documentsView}>
      {
        this.state.optionalDocumentsArray && this.state.optionalDocumentsArray.map((currentObject, index) => (
          <TouchableOpacity
            style={styles.optionalDocTileStyle}
            onPress={() => {
              const { optionalDocumentsArray } = this.state;
              optionalDocumentsArray[index].isSelected = !this.state.optionalDocumentsArray[index].isSelected;
              this.setState({
                optionalDocumentsArray: this.state.optionalDocumentsArray
              });
            }}
          >
            <Icon
              name={(currentObject.isSelected) ? 'check-square-o' : 'square-o'}
              size={22}
              color="#f37e2e" />
            <Text style={styles.documentsTextStyle}>
              {this.textFormatter(currentObject.name)}

            </Text>
          </TouchableOpacity>
        ))
      }
    </View>
  )

  showDocument = (item, index) => (
    <View>
      <Text style={styles.documentsTextStyle}>
        {index + 1}
.
        {this.textFormatter(item)}
      </Text>
    </View>
  )

  invoicingLead = item => {
    const { lead } = this.props;
    const getMessage = name => `lead ${name} updated successfully!!`;
    if (this.state.enquiredVehicles && this.state.enquiredVehicles.length === 1) {
      this.props.updateLeadDetailStatus(lead.id, item.id, { markAsNew: false, invoice_id: trimExtraspaces(this.state.reasonText) })
        .then(({ response }) => {
          const updatedLead = response;
          this.props.setLead(updatedLead);
          this.props.callToast(`lead ${updatedLead.name} updated successfully!!`);
          this.setState({
            enquiredVehicles: updatedLead.lead_details,
            reasonText: ''
          });
        }, error => {
          if (error && error.err && !error.err.message.includes('invalidaccesstoken')) {
            Alert.alert(
              '',
              error && error.err ? error.err.message : '',
              [
                {
                  text: 'ok',
                  onPress: () => {
                    this.setState({
                      reasonText: ''
                    });
                  }
                },
              ],
              { cancelable: false }
            );
          }
        });
    } else {
      Alert.alert(
        '',
        'Would you like to buy any other enquired vehicle(s)?',
        [
          {
            text: 'Yes',
            onPress: () => this.props.updateLeadDetailStatus(lead.id, item.id, { markAsNew: true, invoice_id: trimExtraspaces(this.state.reasonText) })
              .then(({ response }) => {
                const updatedLead = response;
                this.props.setLead(updatedLead);
                this.props.callToast(getMessage(updatedLead.name));
                this.setState({
                  enquiredVehicles: updatedLead.lead_details,
                  reasonText: ''
                });
              }, error => {
                if (error && error.err && !error.err.message.includes('invalidaccesstoken')) {
                  Alert.alert(
                    '',
                    error && error.err ? error.err.message : '',
                    [
                      {
                        text: 'ok',
                        onPress: () => {
                          const { navigation } = this.props;
                          if (error && error.err
                          && (error.err.message === 'Lead already invoiced' || error.err.message === 'Lead already lost')) {
                            navigation.goBack();
                          }
                        }
                      },
                    ],
                    { cancelable: false }
                  );
                }
              })
          },
          {
            text: 'No',
            onPress: () => {
              if (!this.checkForFinanceOptiontOfOtherLeaddetails(item)) {
                this.props.updateLeadDetailStatus(lead.id, item.id, { markAsNew: false, invoice_id: this.state.reasonText })
                  .then(({ response }) => {
                    const updatedLead = response;
                    this.props.setLead(updatedLead);
                    this.props.callToast(getMessage(updatedLead.name));
                    this.setState({
                      enquiredVehicles: updatedLead.lead_details,
                      reasonText: ''
                    });
                  }, error => {
                    if (error && error.err && !error.err.message.includes('invalidaccesstoken')) {
                      Alert.alert(
                        '',
                        error && error.err ? error.err.message : '',
                        [
                          {
                            text: 'ok',
                            onPress: () => {
                              const { navigation } = this.props;
                              if (error && error.err
                            && (error.err.message === 'Lead already invoiced' || error.err.message === 'Lead already lost')) {
                                navigation.goBack();
                              }
                            }
                          },
                        ],
                        { cancelable: false }
                      );
                    }
                  });
              } else {
                Alert.alert(
                  'Info',
                  'Loan is applied for other vehicles.',
                  // 'Loan is under process for the other vehicles.',
                  [
                    {
                      text: 'Ok',
                      onPress: () => {
                        this.setState({
                          reasonText: ''
                        });
                      }
                    },
                  ],
                  { cancelable: false }
                );
              }
            },
            style: 'cancel'
          }
        ],
        { cancelable: false }
      );
    }
  }

  cancelStatusChange = () => {
    this.setState({
      enquiredVehicles: this.state.enquiredVehicles
    });
  }

  textFormatter = phrase => phrase
    .toLowerCase()
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  groupingPhotosBasedOnType = () => {
    const { photos } = this.state;
    this.state.imagesObject = [
      {
        name: 'pan_card',
        label: 'PAN Card',
        imagesArray: photos && photos.length > 0 ? photos.filter(currentObj => currentObj.name === 'pan_card') : [],
        showVerified: photos && photos.length > 0 ? this.shouldThisBeDisabled(photos.filter(currentObj => currentObj.name === 'pan_card')) : false
      },
      {
        name: 'aadhaar_card',
        label: 'Aadhaar Card',
        imagesArray: photos && photos.length > 0 ? photos.filter(currentObj => currentObj.name === 'aadhaar_card') : [],
        showVerified: photos && photos.length > 0 ? this.shouldThisBeDisabled(photos.filter(currentObj => currentObj.name === 'aadhaar_card')) : false
      },
      {
        name: 'passport_size_photograph',
        label: 'Passport Size Photograph',
        imagesArray: photos && photos.length > 0 ? photos.filter(currentObj => currentObj.name === 'passport_size_photograph') : [],
        showVerified: photos && photos.length > 0 ? this.shouldThisBeDisabled(photos.filter(currentObj => currentObj.name === 'passport_size_photograph')) : false
      }
    ];
    this.getOptionalDocument();
  }

  shouldThisBeDisabled = data => {
    if (data.length === 0) {
      return false;
    }
    return data.length === data.filter(currentObj => currentObj.is_osv_verified === true).length;
  }

  statusCheckForOverallDocUpload = () => {
    let status = true;
    this.state.imagesObject.some(curObj => {
      if (curObj.imagesArray.length === 0) {
        status = false;
      }
      return curObj.imagesArray.length === 0;
    });
    return status;
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

  updateLeadDetail = index => {
    this.props.disableButton();
    const { navigation } = this.props.screenProps;
    const id = navigation.state.params.leadId;
    const { enquiredVehicles } = this.state;
    const leadDetailId = enquiredVehicles[index].id;
    const doesVehicleAlreadyExists = enquiredVehicles.findIndex(item => item.id && (item.vehicle_id === enquiredVehicles[index].vehicle_id));
    if (doesVehicleAlreadyExists === -1 || (leadDetailId && leadDetailId.length > 0)) {
      if (leadDetailId) {
        delete enquiredVehicles[index].dirty;
        this.props.updateLeadDetail(leadDetailId, enquiredVehicles[index])
          .then(() => {
            this.props.getLead(this.props.lead.id);
          }).catch(() => { });
        this.setState({ enquiredVehicles, reasonText: '' });
      } else {
        delete enquiredVehicles[index].dirty;
        let existingVehicle = null;
        enquiredVehicles.some(vehicle => {
          if (vehicle.vehicle_id === enquiredVehicles[index].vehicle_id && vehicle.id) {
            existingVehicle = vehicle;
            return true;
          }
          return false;
        });
        if (existingVehicle) {
          enquiredVehicles[index] = {
            ...enquiredVehicles[index],
            test_ride_on: existingVehicle.test_ride_on,
            test_ride_status: existingVehicle.test_ride_status,
          };
        }
        this.props.createLeadDetail(id, enquiredVehicles[index]).then(({ response }) => {
          enquiredVehicles[index] = response;
          const lead = {
            ...this.props.lead,
            lead_details: [...enquiredVehicles]
          };
          this.props.setLead(lead);
          this.setState({ enquiredVehicles, reasonText: '' });
        }).catch(error => {
          console.log(error);
          if (error && error.err && !error.err.message.includes('invalidaccesstoken')) {
            Alert.alert(
              'Info',
              error.err.message,
              [
                { text: 'Ok', onPress: () => { } },
              ],
              { cancelable: false }
            );
          }
        });
      }
    } else {
      Alert.alert(
        'Info',
        'Vehicle Details already exists.',
        [
          { text: 'Ok', onPress: () => { } },
        ],
        { cancelable: false }
      );
    }
  }

  checkDuplicateLeadDetail = (item, position) => {
    const { enquiredVehicles } = this.state;
    let isDuplicateExists = true;
    enquiredVehicles.forEach((vehicle, index) => {
      isDuplicateExists = (position !== index && vehicle.vehicle_id === item.vehicle_id);
    });
    return isDuplicateExists;
  }

  goToProductDetail = item => {
    this.props.disableButton();
    const { navigation } = this.props.screenProps;
    // eslint-disable-next-line prefer-destructuring
    const { id } = this.props.lead;
    const vehicleId = item.vehicle_id;
    const variantId = item.variant_id;
    const colorId = item.variant_colour_id;
    navigation.navigate('ProductDetailScreen', {
      id, vehicleId, variantId, colorId, previousScreen: 'LeadHistory'
    });
  }

  nextBtnTapped = () => {
    if (this.props.currentUser && this.props.currentUser.dealerId) {
      this.props.getFinancierRepresentativeList(
        this.props.currentUser.dealerId,
        this.state.localfinancierLead.financier.id
      ).then(() => {
        if (this.props.financierRepresentativeList.length === 0) {
          this.state.currentFinancierRep = {
            user: {
              id: 1,
              first_name: 'No financier rep'
            }
          };
        }
        this.setState({
          currentFinancierRep: this.props.financierRepresentativeList.length === 0
            ? this.state.currentFinancierRep : this.props.financierRepresentativeList[0],
          modalVisible: true,
          showOtpView: true,
          isShowFinanceOption: false,
          currentModel: 'SendOtpView'
        });
      })
        .catch(error => {
          console.log('ERROR:::', error);
        });
    }
  }

  goToDocumentUpload = () => {
    this.setState({
      modalVisible: false,
    }, (() => {
        const { navigation } = this.props.screenProps;
        const financierLeadId = this.state.localfinancierLead.id;
        const leadDetailId = this.state.localfinancierLead.lead_detail_id;
        navigation.navigate('DocumentsUpload', { financierLeadId, leadDetailId });
      }));
  }

  financeBtnTapped = (item, index) => {
    this.getFinancierLeadDetails(item.id, index);
  }

  removeFinanceBtntapped = (item, index) => {
    this.setState({
      modalVisible: true,
      currentLeaddetailIndex: index,
      currentRefView: 'reason'
    });
  }

  goToVehicleSelection = leadDetail => {
    const { navigation } = this.props.screenProps;
    let { enquiredVehicles } = this.state;
    leadDetail = {
      ...leadDetail,
      test_ride_on: null
    };
    const temp = uniqBy(enquiredVehicles, 'vehicle.id');
    enquiredVehicles = temp;
    if (leadDetail && leadDetail.vehicle && leadDetail.vehicle.dealer_vehicles
      && leadDetail.vehicle.dealer_vehicles.length > 0
      && leadDetail.vehicle.dealer_vehicles[0].test_ride_vehicle > 0) {
      navigation.navigate('VehicleSelectionScreen', {
        lead: this.props.lead,
        leadDetail,
        enquiredVehicles,
        source: 'Vehicle-Enquired'
      });
    } else {
      Alert.alert(
        'Info',
        'No test ride vehicles available.',
        [
          { text: 'Ok', onPress: () => { } },
        ],
        { cancelable: false }
      );
    }
  }

  okBtnAction = () => {
    const {
      currentLeaddetailIndex, reasonText, enquiredVehicles, currentRefView
    } = this.state;
    const currentDetailObj = enquiredVehicles[currentLeaddetailIndex];
    if (trimExtraspaces(reasonText).length > 0) {
      if (currentRefView === 'reason') {
        const finLeadObj = {
          id: (currentDetailObj && currentDetailObj.financier_lead
            && currentDetailObj.financier_lead.length > 0) ? currentDetailObj.financier_lead[0].id : 0,
          lost_reason: 'Others',
          lost_reason_comment: trimExtraspaces(reasonText).length > 0 ? reasonText : 'Not Interested',
          lost_on: moment.utc(new Date()).utcOffset('+05:30').format(),
          status: 930
        };
        this.props.updateFinancierLeadDetails(currentDetailObj.financier_lead[0].id, finLeadObj)
          .then(() => {
            enquiredVehicles[currentLeaddetailIndex].financier_lead = [];
            const lead = {
              ...this.props.lead,
              lead_details: enquiredVehicles
            };
            this.props.setLead(lead);
            this.setState({
              enquiredVehicles,
              modalVisible: false,
              reasonText: ''
            });
          }).catch(() => { });
      } else if (currentRefView === 'Invoice' || currentRefView === 'Book') {
        if (this.state.currentRefView === 'Book') {
          enquiredVehicles[currentLeaddetailIndex].vehicle_status = 450;
          enquiredVehicles[currentLeaddetailIndex].booking_id = trimExtraspaces(this.state.reasonText);
          enquiredVehicles[currentLeaddetailIndex].booked_on = new Date();
        }
        this.setState({
          enquiredVehicles: this.state.enquiredVehicles,
          modalVisible: false,
        }, () => {
          if (this.state.currentRefView === 'Invoice') {
            this.invoicingLead(enquiredVehicles[currentLeaddetailIndex]);
          } else {
            this.updateLeadDetail(currentLeaddetailIndex);
          }
        });
      }
    } else {
      let msgDes = '';
      if (this.state.currentRefView === 'reason') {
        msgDes = 'Please provide reason to remove finance';
      } else if (this.state.currentRefView === 'Invoice') {
        msgDes = 'Please provide the Invoice reference Number';
      } else {
        msgDes = 'Please provide the booking reference Number';
      }
      Alert.alert(
        'Info',
        msgDes,
        [
          { text: 'Ok', onPress: () => { } },
        ],
        { cancelable: false }
      );
    }
  }

  cancelBtnAction = () => {
    this.setState({
      modalVisible: false,
      isShowFinanceOption: false,
      reasonText: ''
    });
  }

  checkLeadDetailhassFinanceOption = detailObj => {
    // To check whether financier lead status is converted
    if (detailObj && ('financier_lead' in detailObj) &&
      detailObj.financier_lead.length > 0 &&
      detailObj.financier_lead[0].status !== 520) {
      return true;
    }
    return false;
  }

  checkForFinanceOptiontOfOtherLeaddetails = item => {
    let findLeadExist = false;
    if (this.props.lead && this.props.lead.lead_details) {
      this.props.lead.lead_details.map(currentEnq => {
        if (currentEnq.vehicle_id !== item.vehicle_id) {
          if (currentEnq && ('financier_lead' in currentEnq) &&
            currentEnq.financier_lead.length > 0) {
            findLeadExist = true;
          }
        }
        return currentEnq;
      });
    }
    return findLeadExist;
  }

  deleteLeadEnquiredVehicle = index => {
    Alert.alert(
      '',
      'Do you want to delete the Vehicle?',
      [
        {
          text: 'Ok',
          onPress: () => {
            if (this.checkLeadDetailhassFinanceOption(this.state.enquiredVehicles[index])) {
              Alert.alert(
                'Info',
                'Vehicle is under loan processing',
                [
                  {
                    text: 'Ok',
                    onPress: () => { }
                  },
                  { text: 'Cancel', onPress: () => { }, style: 'cancel' }
                ],
                { cancelable: false }
              );
            } else {
              this.lostingLeadDetail(index);
            }
          }
        },
        { text: 'Cancel', onPress: () => { }, style: 'cancel' }
      ],
      { cancelable: false }
    );
  }

  removeLeadDetail = async index => {
    const { enquiredVehicles } = this.state;
    const leadDetail = enquiredVehicles[index];
    if (leadDetail && leadDetail.financier_lead.length > 0
      && leadDetail.financier_lead[0].status === 500) {
      this.setState({
        modalVisible: true,
        currentLeaddetailIndex: index
      });
    } else {
      this.lostingLeadDetail(index);
    }
  }

  lostingLeadDetail = index => {
    const { enquiredVehicles } = this.state;
    const leadDetailId = enquiredVehicles[index].id;
    if (leadDetailId) {
      enquiredVehicles[index].vehicle_status = 900;
      delete enquiredVehicles[index].dirty;
      this.props.deleteLeadDetail(leadDetailId, enquiredVehicles[index]).then(() => {
        enquiredVehicles.splice(index, 1);
        const lead = {
          ...this.props.lead,
          lead_details: enquiredVehicles
        };
        this.props.setLead(lead);
        this.setState({ enquiredVehicles });
      }, error => {
        console.log(error);
      });
    } else {
      enquiredVehicles.splice(index, 1);
      this.setState({ enquiredVehicles });
    }
  }

  showModelView = visible => {
    this.setState({
      modalVisible: visible,

    });
  }

  addNewCard = () => {
    const { navigation } = this.props.screenProps;
    const { vehicleList } = this.props;
    const { leadId } = navigation.state.params;
    const { enquiredVehicles } = this.state;
    if (vehicleList && vehicleList.length > 0) {
      if (enquiredVehicles && enquiredVehicles.length < 5) {
        const tempObject = {
          dealer_id: this.props.currentUser.dealerId,
          vehicle_status: 200,
          lead_id: leadId,
          vehicle_id: vehicleList[0].id,
          variant_id: vehicleList[0].variants[0].id,
          variant_colour_id: vehicleList[0].variants[0].colors[0].id,
          dirty: true
        };
        enquiredVehicles.unshift(tempObject);
        this.setState({
          enquiredVehicles
        });
      } else {
        Alert.alert(
          '',
          'You cannot add more than 5 vehicles. Remove 1 to add!',
          [
            { text: 'Ok' }
          ],
          { cancelable: false }
        );
      }
    }
  }

  enableFinanceOption = (item, index) => {
    if (item.financier_lead[0].status === 520) {
      return (
        <SecondaryButton
          iconName="check"
          iconColor="green"
          iconSize={12}
          title="Loan Approved"
          buttonStyle={[styles.testRideStatus, { width: 120 }]}
          handleSubmit={() => this.financeBtnTapped(item, index)}
        />
      );
    }
    return (
      <SecondaryButton
        title="Finance Options"
        buttonStyle={styles.continueBtnStyle}
        handleSubmit={() => this.financeBtnTapped(item, index)}
      />
    );
  }

  enableTestRide = item => {
    if (item.test_ride_status === 400) {
      return (
        <SecondaryButton
          iconName="check"
          iconColor="green"
          iconSize={12}
          disabled
          title="Testride Taken"
          buttonStyle={[styles.testRideStatus, { width: 120 }]}
          handleSubmit={() => { }}
        />
      );
    } if (item.test_ride_status !== 200 && item.test_ride_status !== 400 && item.test_ride_status !== 300) {
      return (
        <SecondaryButton
          title="Book a test ride"
          buttonStyle={styles.continueBtnStyle}
          handleSubmit={() => this.goToVehicleSelection(item)}
      />
      );
    }
  }

  renderVehicleStatusBase = ({ ...props }, item) => {
    const dropdownOffset = {
      top: 32,
      left: 0,
    };
    return (
      <TextField
        label=""
        labelHeight={dropdownOffset.top - Platform.select({ ios: 1, android: 2 })}
        {...props}
        value={this.getStatus(item.vehicle_status)}
        editable={false}
        onChangeText={undefined}
        renderAccessory={this.renderAccessory}
      />
    );
  }

  renderAccessory = () => (
    <View style={styles.accessory}>
      <View style={styles.triangleContainer}>
        <View style={[styles.triangle]} />
      </View>
    </View>
  );

  doesLoanApproved = item => {
    if (item.financier_lead && item.financier_lead.length > 0) {
      return item.financier_lead[0].status === 520;
    }
    return false;
  }

  renderItem = (item, index) => {
    const { vehicleList } = this.props;
    return (
      item
      && (
      <View
        style={styles.vehicleCard}
        >
        <View style={{
          flex: 1,
          flexDirection: 'column',
          backgroundColor: variables.white,
          marginVertical: 10,
          marginHorizontal: 10,
          padding: 5,
          elevation: 5,
        }}>
          {
            item.vehicle_status < 450 && !this.doesLoanApproved(item)
            && (
            <TouchableOpacity
              style={{
                width: 20,
                height: 20,
                position: 'absolute',
                right: 0,
                top: 0,
                alignItems: 'center',
                backgroundColor: variables.warmGreyFour
              }}
              onPress={() => this.deleteLeadEnquiredVehicle(index)}
              >
              <Icon
                style={{
                  top: 3,
                  zIndex: 99
                }}
                name="times"
                size={12}
                color="white" />
            </TouchableOpacity>
            )
          }
          <View style={{
            flex: 1,
            flexDirection: 'column',
          }}>
            <View style={{ flex: 1, flexDirection: 'row' }}>
              <View style={[{
                flex: 1,
                flexDirection: 'column',
              }]}>
                {
                  item.id !== undefined
                  && (
                  <View>
                    <Text style={styles.fieldTitle}>Vehicle</Text>
                    <Text style={styles.vehicleName}>{this.getVehicle(item.vehicle_id)}</Text>
                  </View>
                  )
                }
                {
                  item.id === undefined
                  && (
                  <Dropdown
                    label="Vehicle"
                    labelFontSize={15}
                    disabled={this.props.buttonState}
                    disabledItemColor="red"
                    containerStyle={{ flex: 1, marginHorizontal: 10 }}
                    fontSize={13}
                    itemTextStyle={{ fontSize: 10, fontFamily: fonts.sourceSansProBoldItalic }}
                    data={vehicleList || []}
                    baseColor={variables.lightGrey}
                    value={item.vehicle_id || ''}
                    onFocus={item.id ? this.props.disableButton : () => {}}
                    onChangeText={value => this.onVehicleChange('vehicle_id', value, index, item)}
                    labelExtractor={({ name }) => name}
                        // eslint-disable-next-line camelcase
                    valueExtractor={({ id }) => id}
                  />
                  )
                }
              </View>
              <View style={[{
                flex: 1,
                flexDirection: 'column',
              }]}>
                {
                  item.vehicle_status < 450 && !(item && ('financier_lead' in item) &&
                  item.financier_lead.length > 0 &&
                  item.financier_lead[0].status >= 500)
                    ? (
                      <Dropdown
                        label="Variant"
                        labelFontSize={15}
                        disabled={this.props.buttonState}
                        containerStyle={{ flex: 1, marginHorizontal: 10 }}
                        fontSize={13}
                        itemTextStyle={{ fontSize: 10, fontFamily: fonts.sourceSansProBoldItalic }}
                        data={this.getVariantList(item.vehicle_id)}
                        baseColor={variables.lightGrey}
                        value={item.variant_id || ''}
                        onFocus={item.id ? this.props.disableButton : () => {}}
                        onChangeText={value => this.onVehicleChange('variant_id', value, index, item)}
                        // eslint-disable-next-line camelcase
                        labelExtractor={({ name }) => name}
                        valueExtractor={({ id }) => id}
                      />
                    )
                    : (
                      <View>
                        <Text style={styles.fieldTitle}>Variant</Text>
                        <Text style={styles.vehicleName}>
                          {
                        this.getVariantList(item.vehicle_id).map(variant => variant.id === item.variant_id ? variant.name : '')
                      }
                        </Text>
                      </View>
                    )
                }
              </View>
            </View>
            <View style={{ flex: 1, flexDirection: 'row' }}>
              <View style={[{
                flex: 1,
                flexDirection: 'column',
              }]}>
                {
                  // enabling to switch color even after opting finance options
                  // !this.checkLeadDetailhassFinanceOption(item)
                  item.vehicle_status < 600
                    ? (
                      <Dropdown
                        label="Color"
                        labelFontSize={15}
                        disabled={this.props.buttonState}
                        containerStyle={{ flex: 1, marginHorizontal: 10 }}
                        fontSize={13}
                        itemTextStyle={{ fontSize: 10, fontFamily: fonts.sourceSansProBoldItalic }}
                        data={this.getColorList(item.vehicle_id, item.variant_id)}
                        baseColor={variables.lightGrey}
                        value={item.variant_colour_id || ''}
                        onFocus={item.id ? this.props.disableButton : () => {}}
                        onChangeText={value => this.onVehicleChange('variant_colour_id', value, index, item)}
                        // eslint-disable-next-line camelcase
                        labelExtractor={({ color }) => color}
                        valueExtractor={({ id }) => id}
                      />
                    )
                    : (
                      <View>
                        <Text style={styles.fieldTitle}>Color</Text>
                        <Text style={styles.vehicleName}>
                          {
                        this.getColorList(item.vehicle_id, item.variant_id).map(color => color.id === item.variant_colour_id ? color.color : '')
                      }
                        </Text>
                      </View>
                    )
                }
              </View>
              <View style={[{
                flex: 1,
                flexDirection: 'column',
                height: 60,
              }]}>
                {
                  item.vehicle_status === 600 && !this.checkLeadDetailhassFinanceOption(item)
                  && (
                  <View>
                    <Text style={styles.fieldTitle}>Status</Text>
                    <Text style={styles.vehicleName}>{this.getStatus(item.vehicle_status)}</Text>
                  </View>
                  )
                }
                {
                  item.vehicle_status === 900
                  && (
                  <View>
                    <Text style={styles.fieldTitle}>Status</Text>
                    <Text style={styles.vehicleName}>Closed</Text>
                  </View>
                  )
                }
                {
                  item.dirty
                  && (
                  <View>
                    <Text style={styles.fieldTitle}>Status</Text>
                    <Text style={[styles.vehicleName, { fontFamily: fonts.sourceSansProLight }]}>{this.getStatus(item.vehicle_status)}</Text>
                  </View>
                  )
                }
                {
                  item.vehicle_status < 600 && !item.dirty
                  && (
                    <Dropdown
                      label="Status"
                      labelFontSize={15}
                      disabled={this.props.buttonState}
                      containerStyle={{ flex: 1, marginHorizontal: 10 }}
                      fontSize={13}
                      itemTextStyle={{ fontSize: 10, fontFamily: fonts.sourceSansProBoldItalic }}
                      data={item.vehicle_status === 450 ? this.state.statusListWithoutEnquired : this.state.statusList}
                      baseColor={variables.lightGrey}
                      value={item.vehicle_status}
                      onFocus={item.id ? this.props.disableButton : () => {}}
                      onChangeText={value => this.onStatusChange(value, item, index)}
                      renderBase={props => this.renderVehicleStatusBase(props, item)}
                      // eslint-disable-next-line camelcase
                      labelExtractor={({ label }) => label}
                      valueExtractor={({ status }) => status}
                      />
                  )
                }
              </View>
            </View>
            <View style={{ flexDirection: 'row' }}>
              {item && item.booking_id !== null && item.vehicle_status > 200
                && (
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldTitle}>BOOKED REF NO:</Text>
                  <Text style={styles.vehicleName}>{item.booking_id}</Text>
                </View>
                )
              }
              {item && item.vehicle_status === 600 && this.props.lead && this.props.lead.invoice_id
                && this.props.lead.invoice_id.length > 0
                && (
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldTitle}>INVOICED REF NO:</Text>
                  <Text style={styles.vehicleName}>{this.props.lead.invoice_id}</Text>
                </View>
                )
              }
            </View>
            {
              item && item.test_ride_status >= 200 && item.test_ride_status < 500 && item.test_ride_on
              && (
              <View style={{ flex: 1, flexDirection: 'row' }}>
                <View style={[{
                  flex: 1,
                  flexDirection: 'column',
                }]}>
                  <View>
                    <Text style={styles.fieldTitle}>{item.test_ride_status === 400 ? 'Test Ride Completed' : 'Test Ride'}</Text>
                    <Text style={styles.vehicleName}>
                      {`${moment(item.test_ride_on).utc().format('DD-MMM-YYYY')}  ${moment(item.test_ride_on).utc().format('h:mm a')} - ${moment(item.test_ride_on).add(30, 'minutes').utc().format('h:mm a')}`}
                    </Text>
                  </View>
                </View>
              </View>
              )
            }
            <View style={{
              flexDirection: 'row', justifyContent: 'flex-end', marginVertical: 10
            }}>
              <ScrollView horizontal style={{ flexDirection: 'row-reverse' }}>     
                {item.dirty
                        && (
                        <SecondaryButton
                          title="Update"
                          disabled={this.props.buttonState}
                          handleSubmit={() => this.updateLeadDetail(index)}
                          buttonStyle={styles.continueBtnStyle}
                          />
                        )
                      }
                {item.financier_lead && item.financier_lead.length > 0
                  && item.financier_lead[0].status === 500 && !item.dirty && this.props.lead && !this.props.lead.is_lost
                  && item.vehicle_status < 600
                  && (
                  <SecondaryButton
                    title="Remove Finance"
                    buttonStyle={styles.continueBtnStyle}
                    handleSubmit={() => this.removeFinanceBtntapped(item, index)}
                    />
                  )
                }
                {item.vehicle_status < 600 && !item.dirty
                  && item.financier_lead && item.financier_lead.length > 0
                  && this.enableFinanceOption(item, index)
                }
                {
                  item.vehicle_status < 600 && !item.dirty
                  && this.enableTestRide(item)
                }
                {
                  item.vehicle_status < 600 && !item.dirty
                  && (
                  <BookTestRideButton
                    customStyles={styles.continueBtnStyle}
                    disabled={this.props.buttonState}
                    title="View Vehicle"
                    handleSubmit={() => this.goToProductDetail(item)}
                    />
                  )
                }
              </ScrollView>
            </View>
          </View>
        </View>
      </View>
      )
    );
  }

  updateCurrentView = () => {
    switch (this.state.currentModel) {
      case 'OTPView':
        return (
          <View style={{ flex: 1 }}>
            <View style={styles.OTPTotalViewStyle}>
              <Text style={styles.offerTextStyle}>
                {`Enter the OTP sent to the number ending with '${this.state.currentFinancierRep
                    && this.state.currentFinancierRep.user
                    && this.state.currentFinancierRep.user.mobile_no
                  ? (this.state.currentFinancierRep.user.mobile_no).substring(6) : ''}'`}
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
              <Text style={[styles.offerTextStyle, { fontSize: 16, marginHorizontal: 20, marginVertical: 10 }]}>
                {`Representative from ${this.state.currentFinancier
                  && this.state.currentFinancier.name
                  ? this.state.currentFinancier.name : ''}`}
              </Text>
              <View style={styles.nameTextView}>
                <Text style={[styles.nameTextStyle, { paddingRight: 10, marginLeft: 20 }]}>
                  {this.state.currentFinancierRep
                    && this.state.currentFinancierRep.user
                    && this.state.currentFinancierRep.user.first_name
                    ? this.state.currentFinancierRep.user.first_name : ''}
                </Text>
                <View style={styles.nameNumberSeperator} />
                <Text style={[styles.nameTextStyle, { paddingLeft: 10 }]}>
                  {this.state.currentFinancierRep
                    && this.state.currentFinancierRep.user
                    && this.state.currentFinancierRep.user.mobile_no
                    ? this.state.currentFinancierRep.user.mobile_no : ''}
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

  resendOtpBtnTapped = () => {
    const { currentFinancierRep } = this.state;
    this.props.disableButton();
    try {
      if (currentFinancierRep && currentFinancierRep.user
        && currentFinancierRep.user.id && currentFinancierRep.user.id.length > 0) {
        this.props.resendOtp(this.state.currentFinancierRep.user.id, this.props.sendOtpObj)
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
      }
    } catch (error) {
      console.log('errrrrrrrr', error);
    }
  }

  verifyBtnTapped = () => {
    this.props.disableButton();
    this.setState({
      disableVerifyBtn: true
    });
    // this.setState({
    //   currentModel: 'OTPView',
    //   modalVisible: false,
    //   showOtpView: false,
    //   otpTF: ''
    // }, () => {
    //   this.goToDocumentUpload();
    // });
    const data = {
      pinId: this.props.sendOtpObj.pinId,
      pin: this.state.otpTF
    };
    this.props.verifyOtp(this.state.currentFinancierRep.user.id, data)
      .then(() => {
        if (this.props.verifyOtpObj && this.props.verifyOtpObj.verified) {
          this.setState({
            currentModel: 'OTPView',
            showOtpView: false,
            modalVisible: false,
            otpTF: '',
            disableVerifyBtn: false
          }, () => {
            this.goToDocumentUpload();
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
    // this.setState({
    //   currentModel: 'OTPView',
    // });
    this.props.disableButton();
    this.props.sendOtp(this.state.currentFinancierRep.user.id).then(() => {
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
    }).catch(() => { });
  }

  render() {
    const { enquiredVehicles, currentLeaddetailIndex } = this.state;
    const { lead, vehicleList } = this.props;
    return (
      <View style={{
        flexDirection: 'column',
        backgroundColor: 'white'
      }}>
        <Loader showIndicator={this.props.loading} />
        {
          this.state.showOtpView
          && (
          <Modal
            animationType="slide"
            transparent
            visible={this.state.modalVisible}
            onRequestClose={() => {
              this.setState({
                modalVisible: false,
                showOtpView: false
              });
            }}
            >
            <KeyboardAwareScrollView
              keyboardShouldPersistTaps="always">
              <View style={styles.modalconatiner}>
                <TouchableOpacity
                  style={styles.closeBtnView}
                  onPress={() => {
                    this.setState({
                      modalVisible: false,
                      showOtpView: false
                    });
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
                        uri: (enquiredVehicles[currentLeaddetailIndex] && enquiredVehicles[currentLeaddetailIndex].vehicle
                          && enquiredVehicles[currentLeaddetailIndex].vehicle.name) ? enquiredVehicles[currentLeaddetailIndex].vehicle.image_url : 'http://'
                      }}
                      style={styles.vehicleImageStyle}
                      resizeMode="contain"
                    />
                    <View style={styles.specificationViewStyle}>
                      <Text style={styles.specsDetailTextStyle}>
                        {(enquiredVehicles[currentLeaddetailIndex] && enquiredVehicles[currentLeaddetailIndex].vehicle
                          && enquiredVehicles[currentLeaddetailIndex].vehicle.name) ? enquiredVehicles[currentLeaddetailIndex].vehicle.name : ''}
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
                        {this.state.localfinancierLead.interest_percentage
                          ? (`${this.state.localfinancierLead.interest_percentage}%`) : '0'
                        }
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
                        this.updateCurrentView()
                      }
                    </View>
                  </View>
                </View>
              </View>
            </KeyboardAwareScrollView>
          </Modal>
          )
        }
        {this.state.isShowFinanceOption
          && (
          <Modal
            animationType="slide"
            transparent
            visible={this.state.modalVisible}
            onRequestClose={() => {
              this.setState({
                modalVisible: false,
                isShowFinanceOption: false
              });
            }}>
            <View style={{ flex: 1, backgroundColor: 'grey', opacity: 0.9 }}>
              <View style={{
                flex: 1,
                margin: 50,
                backgroundColor: 'white',
              }}>
                <View style={{
                  margin: 5,
                  height: 30,
                  flexDirection: 'row',
                  alignItems: 'center'
                }}>
                  <Text style={[styles.detailTitleTextStyle, { fontSize: 18 }]}>
                    Finance & Documents Needed
                  </Text>
                  <View style={{ flex: 1, flexDirection: 'row-reverse' }}>
                    <TouchableOpacity
                      style={[styles.closeBtnView]}
                      onPress={() => {
                        this.setState({
                          modalVisible: false,
                          isShowFinanceOption: false
                        });
                      }}>
                      <Image
                        style={{ resizeMode: 'center' }}
                        source={Close} />
                    </TouchableOpacity>
                  </View>

                </View>
                <View style={{ height: 1, backgroundColor: '#D3D3D3', marginHorizontal: 30 }} />
                <ScrollView>
                  <View style={{
                    flexDirection: 'row', marginHorizontal: 30, height: 60
                  }}>
                    <View style={{ marginTop: 10, flex: 1 }}>
                      <Text style={styles.specTitleDesTextStyle}>
                        Financier
                      </Text>
                      <Text style={styles.specTitleTextStyle}>
                        {(this.state.localfinancierLead
                          && this.state.localfinancierLead.financier
                          && this.state.localfinancierLead.financier.name)
                          ? this.state.localfinancierLead.financier.name : ''}
                      </Text>
                    </View>
                    <View style={{ marginTop: 10, flex: 1 }}>
                      <Text style={styles.specTitleDesTextStyle}>
                        Loan Amount
                      </Text>
                      <Text style={styles.specTitleTextStyle}>
                        {currencyFormatter(this.state.localfinancierLead
                          && this.state.localfinancierLead.loan_amount ? this.state.localfinancierLead.loan_amount : '0')}
                      </Text>
                    </View>
                    <View style={{ marginTop: 10, flex: 1 }}>
                      <Text style={styles.specTitleDesTextStyle}>
                        Tenure
                      </Text>
                      <Text style={styles.specTitleTextStyle}>
                        {this.state.localfinancierLead ? `${this.state.localfinancierLead.tenure}` : ''}
                        {' '}
Month(s)
                      </Text>
                    </View>
                    <View style={{ marginTop: 10, flex: 1 }}>
                      <Text style={styles.specTitleDesTextStyle}>
                        Interest
                      </Text>
                      <Text style={styles.specTitleTextStyle}>
                        {this.state.localfinancierLead.interest_percentage}
%
                      </Text>
                    </View>
                  </View>
                  <View style={{
                    flexDirection: 'row', marginHorizontal: 30, height: 60
                  }}>
                    <View style={{ marginTop: 10, flex: 1 }}>
                      <Text style={styles.specTitleDesTextStyle}>
                        EMI
                      </Text>
                      <Text style={styles.specTitleTextStyle}>
                        {currencyFormatter(this.state.localfinancierLead
                          && this.state.localfinancierLead.emi ? this.state.localfinancierLead.emi : '0')}
                      </Text>
                    </View>
                    <View style={{ marginTop: 10, flex: 1 }}>
                      <Text style={styles.specTitleDesTextStyle}>
                        Advance EMI
                      </Text>
                      <Text style={styles.specTitleTextStyle}>
                        {(this.state.localfinancierLead && this.state.localfinancierLead.advance_emi)
                          && (`${this.state.localfinancierLead.advance_emi}`.includes('.')
                            ? `${this.state.localfinancierLead.advance_emi}`.split('.')[0]
                            : `${this.state.localfinancierLead.advance_emi}`)}
                        {' '}
Month(s)
                      </Text>
                    </View>
                    <View style={{ marginTop: 10, flex: 1 }}>
                      <Text style={styles.specTitleDesTextStyle}>
                        Downpayment
                      </Text>
                      <Text style={styles.specTitleTextStyle}>
                        {currencyFormatter(this.state.localfinancierLead
                          && this.state.localfinancierLead.down_payment ? this.state.localfinancierLead.down_payment : '0')}
                      </Text>
                    </View>
                    <View style={{ marginTop: 10, flex: 1 }} />
                  </View>
                  <View style={styles.documentsView}>
                    <Text style={[styles.detailTitleTextStyle, { fontSize: 18, marginVertical: 10 }]}>
                      Documents Required
                    </Text>
                    {
                      this.getDocumentsArray()
                    }
                    <View style={{ flexDirection: 'row', flex: 2 }}>
                      <View style={{ flex: 1, marginBottom: 20 }}>
                        <View style={{
                          flexDirection: 'row', alignItems: 'center', height: 30
                        }}>
                          <Text style={[styles.detailTitleTextStyle, { fontSize: 18, marginVertical: 20 }]}>
                            Financier Representative
                          </Text>
                          <TouchableOpacity
                            style={{
                              height: 30, marginLeft: 20, alignItems: 'center', justifyContent: 'center'
                            }}
                            onPress={() => {
                              this.setState({
                                modalVisible: true
                              });
                            }}
                          >
                            <Icon
                              name={(this.state.localfinancierLead
                                && this.state.localfinancierLead.assignedTo
                                && this.state.localfinancierLead.assignedTo.first_name)
                                ? 'check-circle' : 'exclamation-circle'}
                              size={22}
                              color={(this.state.localfinancierLead
                                && this.state.localfinancierLead.assignedTo
                                && this.state.localfinancierLead.assignedTo.first_name) ? '#63a719' : '#f37e2e'}
                            />
                          </TouchableOpacity>
                        </View>
                        <View style={{
                          flexDirection: 'row'
                        }}>
                          <Text style={{
                            backgroundColor: '#d8d8d8',
                            color: '#454545',
                            marginLeft: 30,
                            height: 30,
                            textAlignVertical: 'center',
                            textAlign: 'center',
                            paddingHorizontal: 10
                          }}>
                            {(this.state.localfinancierLead
                            && this.state.localfinancierLead.assignedTo
                            && this.state.localfinancierLead.assignedTo.first_name)
                              ? this.state.localfinancierLead.assignedTo.first_name : ''}
                          </Text>
                          <View style={{ width: 1, backgroundColor: '#979797' }} />
                          <Text style={{
                            backgroundColor: '#d8d8d8',
                            color: '#454545',
                            height: 30,
                            textAlignVertical: 'center',
                            textAlign: 'center',
                            paddingHorizontal: 10
                          }}>
                            {(this.state.localfinancierLead
                            && this.state.localfinancierLead.assignedTo
                            && this.state.localfinancierLead.assignedTo.mobile_no)
                              ? this.state.localfinancierLead.assignedTo.mobile_no : ''}
                          </Text>
                        </View>
                      </View>
                      <View style={{ flex: 1, marginBottom: 20 }}>
                        <View style={{
                          flexDirection: 'row', alignItems: 'center', height: 30
                        }}>
                          <Text style={[styles.detailTitleTextStyle, { fontSize: 18, marginVertical: 20 }]}>
                            Document Upload
                          </Text>
                          <TouchableOpacity
                            style={{
                              height: 30, marginLeft: 20, alignItems: 'center', justifyContent: 'center'
                            }}
                            onPress={() => {
                              this.setState({
                                modalVisible: true
                              });
                            }}
                          >
                            <Icon
                              name={(this.statusCheckForOverallDocUpload()) ? 'check-circle' : 'exclamation-circle'}
                              size={22}
                              color={(this.statusCheckForOverallDocUpload()) ? '#63a719' : '#f37e2e'}
                            />
                          </TouchableOpacity>
                        </View>
                        <Text style={{
                          backgroundColor: this.statusCheckForOverallDocUpload() ? '#00b050' : '#d8d8d8',
                          color: this.statusCheckForOverallDocUpload() ? 'white' : '#454545',
                          marginLeft: 30,
                          height: 30,
                          textAlignVertical: 'center',
                          textAlign: 'center',
                          paddingHorizontal: 10,
                          width: 100
                        }}>
                          {this.statusCheckForOverallDocUpload() ? 'completed' : 'Pending'}
                        </Text>
                      </View>
                      <View style={{ flex: 1, marginBottom: 20 }}>
                        <View style={{
                          flexDirection: 'row', alignItems: 'center', height: 30
                        }}>
                          <Text style={[styles.detailTitleTextStyle, { fontSize: 18, marginVertical: 20 }]}>
                            OSV
                          </Text>
                          <TouchableOpacity
                            style={{
                              height: 30, marginLeft: 20, alignItems: 'center', justifyContent: 'center'
                            }}
                            onPress={() => {
                              this.setState({
                                modalVisible: true
                              });
                            }}
                          >
                            <Icon
                              name={(this.statusCheckForOSVVerified()) ? 'check-circle' : 'exclamation-circle'}
                              size={22}
                              color={(this.statusCheckForOSVVerified()) ? '#63a719' : '#f37e2e'}
                            />
                          </TouchableOpacity>
                        </View>

                        <Text style={{
                          backgroundColor: this.statusCheckForOSVVerified() ? '#00b050' : '#d8d8d8',
                          color: this.statusCheckForOSVVerified() ? 'white' : '#454545',
                          marginLeft: 30,
                          height: 30,
                          textAlignVertical: 'center',
                          textAlign: 'center',
                          paddingHorizontal: 10,
                          width: 100
                        }}>
                          {this.statusCheckForOSVVerified() ? 'completed' : 'Pending'}
                        </Text>
                      </View>
                    </View>
                  </View>
                  {
                    this.state.localfinancierLead.status !== 520
                    && (
                    <View style={{ flex: 2, alignItems: 'center', justifyContent: 'center' }}>
                      <BookTestRideButton
                        disabled={this.props.buttonState}
                        customStyles={styles.doneBtnStyle}
                        title="Next"
                        handleSubmit={() => this.nextBtnTapped()}
                      />
                    </View>
                    )
                  }
                </ScrollView>
              </View>
            </View>
          </Modal>
          )
        }
        {!this.state.isShowFinanceOption && !this.state.showOtpView
          && (
          <Modal
            animationType="slide"
            transparent
            visible={this.state.modalVisible}
            onRequestClose={() => {
              this.setState({
                modalVisible: false,
                isShowFinanceOption: false,
                reasonText: ''
              });
            }}>
            <View style={styles.removeFinancierContainer}>
              <View style={styles.removeFinancierView}>
                <View style={{ flexDirection: 'row' }}>
                  <Text style={styles.reasonTitleText}>{this.state.currentRefView === 'reason' ? 'Reason' : ` To ${this.state.currentRefView}`}</Text>
                  <TouchableOpacity
                    style={[styles.closeBtnView, { alignSelf: 'flex-end', width: 40 }]}
                    onPress={() => {
                      this.setState({
                        modalVisible: false,
                        isShowFinanceOption: false,
                        reasonText: ''
                      });
                    }}>
                    <Image
                      style={{ resizeMode: 'center' }}
                      source={Close} />
                  </TouchableOpacity>
                </View>
                <Text style={styles.commentTextStyle}>
                  {' '}
                  {this.state.currentRefView === 'reason' ? 'Comment:' : 'Reference No:'}
                </Text>
                <TextInput
                  maxLength={100}
                  style={styles.fieldContainer}
                  onChangeText={text => this.setState({ reasonText: text })}
                  value={this.state.reasonText}
                  underlineColorAndroid="transparent" />
                <View style={{ flexDirection: 'row', marginVertical: 20 }}>
                  <View style={{ flex: 1, alignItems: 'center' }}>
                    <BookTestRideButton
                      title="Ok"
                      disabled={this.props.loading || this.props.buttonState}
                      customStyles={styles.okBtnStyle}
                      customTextStyles={styles.okBtnTextStyle}
                      handleSubmit={this.okBtnAction} />
                  </View>
                  <View style={{ flex: 1, alignItems: 'center' }}>
                    <SecondaryButton
                      title="Cancel"
                      textStyle={styles.cancelBtnTextStyle}
                      buttonStyle={styles.cancelBtnStyle}
                      handleSubmit={this.cancelBtnAction} />
                  </View>
                </View>
              </View>
            </View>
          </Modal>
          )
        }
        {
          lead && (!lead.is_invoiced && !lead.is_lost)
          && (
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              justifyContent: 'flex-end',
              marginRight: 10,
              marginTop: 20,
            }}
            onPress={this.addNewCard}
            >
            <Icon
              style={{
                position: 'absolute',
                right: 40,
                top: 10,
                zIndex: 99
              }}
              name="plus"
              size={12}
              color={variables.dustyOrange} />
            <Text style={styles.addBtnTextStyle}>Add</Text>
          </TouchableOpacity>
          )
        }
        <ScrollView style={styles.flatListViewStyles}>
          {
            enquiredVehicles && enquiredVehicles.length === 0
            && (
            <Text style={{
              marginVertical: 80,
              alignSelf: 'center',
              fontFamily: fonts.sourceSansProBold,
              fontSize: 22
            }}
              >
              No vehicles to show
            </Text>
            )
          }
          {
            enquiredVehicles && enquiredVehicles.length > 0 && vehicleList && vehicleList.length > 0
            && enquiredVehicles.map((item, index) => this.renderItem(item, index))
          }
        </ScrollView>
      </View>
    );
  }
}
export default VehicleEnquired;
