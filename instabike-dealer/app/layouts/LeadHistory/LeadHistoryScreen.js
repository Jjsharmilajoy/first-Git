/* eslint-disable no-multi-spaces */
/**
 * The Lead History Screen shows the information when lead card VIEW button is
 * tapped.
 * The Actions and Vehicles tab rendering are also controlled by this component.
 */
import React, { Component } from 'react';
import {
  View, Text,
  Image,
  TouchableHighlight,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  Linking,
  Platform,
  PermissionsAndroid
} from 'react-native';
import { connect } from 'react-redux';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Call from 'react-native-vector-icons/Zocial';
import { Dropdown } from 'react-native-material-dropdown';
import PropTypes from 'prop-types';
import { NavigationActions } from 'react-navigation';
import SectionedMultiSelect from '../../components/multiSelectDropdown/sectioned-multi-select';
import LeadHistoryTab from './LeadHistoryTab';
import styles from './leadHistoryStyles';
import { checkPermission, requestCallPermission } from '../../helpers/Permissions';

import {
  BookTestRideButton
} from '../../components/button/Button';
import {
  getLostReasons,
  getTeamMembers, getLeadActivities, getAllVehicles, clearLeadActivities
} from '../../redux/actions/LeadHistory/actionCreators';
import {
  getLead, updateLead, setLead, clearLead, updateLeadDetail
} from '../../redux/actions/Global/actionCreators';
import { showIndicator, hideIndicator } from '../../redux/actions/Loader/actionCreators';

// import Loader from '../../components/loader/Loader';
import {
  // mobileNumberValidator,
  isAlphaOnly,
  isStringEmpty,
  trimExtraspaces,
  landlineOrmobileNumberValidator,
  emailValidator,
  pincodeValidator
} from '../../utils/validations';
import variables from '../../theme/variables';
import constant from '../../utils/constants';
import fonts from '../../theme/fonts';

@connect(state => ({
  currentUser: state.user.currentUser,
  lead: state.global.lead,
  leadName: state.global.name,
  leadGender: state.global.gender,
  email: state.global.email,
  pincode: state.global.pincode,
  mobileNumber: state.global.mobileNumber,
  loading: state.global.loadingGroup,
  teamMembers: state.leadHistory.teamMembers,
  vehicleList: state.leadHistory.vehicleList,
  lostReasonResponse: state.leadHistory.lostReasonResponse,
  leadActivitiesResponse: state.leadHistory.leadActivitiesResponse,
  buttonState: state.global.buttonState
}), {
  getLostReasons,
  getLead,
  getTeamMembers,
  updateLead,
  clearLead,
  setLead,
  getLeadActivities,
  updateLeadDetail,
  getAllVehicles,
  clearLeadActivities,
  showIndicator,
  hideIndicator
})
class LeadHistoryScreen extends Component {
  static propTypes = {
    // loading: PropTypes.bool.isRequired,
    setLead: PropTypes.func.isRequired,
    showIndicator: PropTypes.func.isRequired,
    hideIndicator: PropTypes.func.isRequired,
    getLostReasons: PropTypes.func.isRequired,
    navigation: PropTypes.object.isRequired,
    currentUser: PropTypes.object.isRequired,
    mobileNumber: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    pincode: PropTypes.string.isRequired,
    leadGender: PropTypes.string.isRequired,
    leadName: PropTypes.string.isRequired,
    lead: PropTypes.object.isRequired,
    getLead: PropTypes.func.isRequired,
    clearLead: PropTypes.func.isRequired,
    getTeamMembers: PropTypes.func.isRequired,
    updateLead: PropTypes.func.isRequired,
    getLeadActivities: PropTypes.func.isRequired,
    clearLeadActivities: PropTypes.func.isRequired,
    vehicleList: PropTypes.array.isRequired,
    lostReasonResponse: PropTypes.array.isRequired,
    leadActivitiesResponse: PropTypes.array.isRequired,
    teamMembers: PropTypes.array.isRequired,
    buttonState: PropTypes.bool.isRequired
  }

  constructor(props) {
    super(props);
    this.state = {
      lead: {},
      leadFieldError: false,
      mobileFieldError: false,
      genderFieldError: false,
      emailFieldError: false,
      pincodeFieldError: false,
      pincodeErrorMessage: 'Invalid Pincode',
      emailErrorMessage: 'Invalid Email',
      basicErrorMessage: 'Enter a valid name.',
      mobileErrorMessage: 'Invalid mobile number',
      genderErrorMessage: 'Please select gender',
      selectedItems: [],
      dirty: false,
      enquirySources: [
        {
          id: 1,
          label: 'Walk-In',
          value: 'walk-in'
        },
        {
          id: 2,
          label: 'Phone',
          value: 'phone'
        },
        {
          id: 3,
          label: 'Campaign',
          value: 'campaign'
        }
      ],
      genderData: [
        {
          id: 1,
          label: 'male',
          value: 'male'
        },
        {
          id: 2,
          label: 'female',
          value: 'female'
        },
        {
          id: 3,
          label: 'others',
          value: 'others'
        }
      ],
      source_of_enquiry: 'walk-in',
      gender: 'male'
    };
  }

  static getDerivedStateFromProps(nextProps) {
    if (nextProps.teamMembers && nextProps.lead) {
      return {
        teamMembers: [{
          children: nextProps.teamMembers,
        }],
        lead: { ...nextProps.lead },
        selectedItems: [nextProps.lead.assigned_to],
        mobileNumberAvailable: (nextProps.lead && nextProps.lead.mobile_number) ? nextProps.lead.mobile_number : null,
        emailAvailable: (nextProps.lead && nextProps.lead.email) ? nextProps.lead.email : null,
        pincodeAvailable: (nextProps.lead && nextProps.lead.pincode) ? nextProps.lead.pincode : null,
        source_of_enquiry: nextProps.lead.source_of_enquiry,
        gender: nextProps.lead.gender,
      };
    }
    return null;
  }

  componentDidMount() {
    this.onInitalLoad();
    this.willFocusSubscription = this.props.navigation.addListener(
      'willFocus',
      () => {
        this.onInitalLoad();
      }
    );
  }

  componentWillUnmount() {
    this.willFocusSubscription.remove();
  }

  onSelectedItemsChange = selectedItems => {
    this.setState({
      selectedItems,
      dirty: true,
      lead: {
        ...this.state.lead,
        assigned_to: selectedItems[0]
      }
    });
  }

  onInitalLoad = () => {
    this.props.showIndicator();
    const { navigation, currentUser: { dealerId } } = this.props;
    // const id = this.props.lead && this.props.lead.id ? this.props.lead.id : navigation.getParam('leadId');
    const id = navigation.getParam('leadId');
    // const isGlobalLeadEmpty = lead && Object.keys(lead).length === 0;
    // getting lead only if global lead and param lead id are not same
    if (id && dealerId) {
      Promise.all([
        this.props.getLead(id),
        this.props.getLeadActivities(id),
        this.props.getTeamMembers(dealerId),
        this.props.getLostReasons(),
      ]).then(() => {
        this.props.hideIndicator();
      }).catch(error => {
        console.log(error);
        this.props.hideIndicator();
      });
    } else {
      this.props.hideIndicator();
    }
  }

  selectGender = value => {
    this.setState(() => ({
      dirty: true,
      lead: {
        ...this.state.lead,
        gender: value
      }
    }));
  }

  isEmailValid = () => {
    const { lead } = this.state;
    if (lead && lead.email) {
      return emailValidator(lead.email);
    } else if (this.props.email) {
      return emailValidator(lead.email);
    }
    return true;
  }

  isPincodeValid = () => {
    const { lead } = this.state;
    if (lead && lead.pincode && lead.pincode.length > 0) {
      return pincodeValidator(lead.pincode);
    } else if (this.props.pincode) {
      return pincodeValidator(lead.pincode);
    }
    return true;
  }

  isMobileNumberValid = () => {
    const { lead } = this.state;
    if (lead && lead.mobile_number && lead.mobile_number.length > 0) {
      return landlineOrmobileNumberValidator(lead.mobile_number);
    } else if (this.props.mobileNumber) {
      return landlineOrmobileNumberValidator(lead.mobile_number);
    }
    return true;
  }

  isUserUpdateValidated = () => {
    const { lead, dirty } = this.state;
    return dirty && isAlphaOnly(lead.name) && !isStringEmpty(lead.name) && this.isMobileNumberValid() && this.isEmailValid() && this.isPincodeValid();
  }

  updateLead = () => {
    let {
      lead
    } = this.state;
    lead = {
      ...lead,
      name: lead.name && lead.name.length > 0 ? trimExtraspaces(lead.name) : null,
      mobile_number: lead.mobile_number && lead.mobile_number.length > 0 ? trimExtraspaces(lead.mobile_number) : null,
      email: lead.email && lead.email.length > 0 ? trimExtraspaces(lead.email) : null,
      pincode: lead.pincode && lead.pincode.length > 0 ? trimExtraspaces(lead.pincode) : null,
      source_of_enquiry: this.state.source_of_enquiry,
      gender: this.state.gender,

    };
    const isMobileNumberValid = lead.mobile_number ? landlineOrmobileNumberValidator(lead.mobile_number) : true;
    const isEmailValid = lead.email ? emailValidator(lead.email) : true;
    const isPincodeValid = lead.pincode ? pincodeValidator(lead.pincode) : true;

    if (this.isUserUpdateValidated()) {
      if (!lead.lead_details && !lead.follow_up && !lead.lead_finance_detail) {
        delete lead.lead_details;
        delete lead.follow_up;
        delete lead.lead_finance_detail;
        if (lead.lostReason) {
          delete lead.lostReason;
        }
      }
      if (lead && lead.mobile_number && lead.mobile_number.length < 10 && lead.mobile_number.length === 0) {
        Alert.alert(
          'Alert',
          'Mobile number cannot be empty.',
          [
            {
              text: 'OK',
              onPress: () => {
                lead = {
                  ...lead,
                  mobile_number: this.state.mobileNumberAvailable
                };
                this.setState({
                  lead
                });
                this.props.setLead(lead);
              }
            }
          ],
          { cancelable: false }
        );
      } else {
        this.props.showIndicator();
        this.props.updateLead(lead.id, lead)
          .then(() => {
            this.setState({ dirty: false });
            this.props.setLead(lead);
            this.props.getLeadActivities(lead.id);
            this.props.hideIndicator();
          }).catch(error => {
            this.props.hideIndicator();
            if (error && error.err && !error.err.message.includes('invalidaccesstoken')) {
              Alert.alert(
                'Alert',
                error && error.err ? error.err.message : '',
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      const leadObj = {
                        ...this.props.lead,
                        name: this.props.leadName,
                        mobile_number: this.props.mobileNumber,
                        gender: this.props.leadGender,
                        email: this.props.email,
                        pincode: this.props.pincode
                      };
                      this.setState({
                        dirty: false,
                        lead: leadObj
                      });
                      this.props.setLead(leadObj);
                    }
                  },
                ],
                { cancelable: false }
              );
            }
          });
      }
    } else {
      this.setState({
        dirty: isAlphaOnly(lead.name) && !isStringEmpty(lead.name),
        lead,
        leadFieldError: !isAlphaOnly(lead.name) && isStringEmpty(lead.name),
        mobileFieldError: lead.mobile_number ? !isMobileNumberValid : false,
        emailFieldError: lead.email ? !isEmailValid : false,
        pincodeFieldError: lead.pincode ? !isPincodeValid : false
      });
    }
  }

  handleOnInputChange = (param, value) => {
    const {
      lead, leadFieldError, emailFieldError, pincodeFieldError, mobileFieldError
    } = this.state;
    lead[param] = value;
    this.setState({
      leadFieldError:
        param === 'name' ? !isAlphaOnly(value) : leadFieldError,
      mobileFieldError:
        param === 'mobile_number' && value.length !== 0 ? !landlineOrmobileNumberValidator(value) : mobileFieldError,
      emailFieldError:
        param === 'email' && value.length !== 0 ? !emailValidator(value) : emailFieldError,
      pincodeFieldError:
        param === 'pincode' && value.length !== 0 ? !pincodeValidator(value) : pincodeFieldError,
      lead,
      dirty: isAlphaOnly(lead.name) && !isStringEmpty(lead.name),
    });
  }

  closeLeadHistory = () => {
    this.props.clearLead();
    this.props.clearLeadActivities();
    this.props.navigation.dispatch(NavigationActions.back());
  }

  isFieldEditable = value => {
    const { currentUser } = this.props;
    const { lead } = this.state;
    if (currentUser && currentUser.role === constant.MANAGER && lead && !lead.is_lost) {
      return true;
    } if (!(value && value.length !== 0) && currentUser
      && !(currentUser.role === constant.MANAGER) && lead && !lead.is_lost) {
      return true;
    }
    return false;
  }

  dial = async mobileNumber => {
    const permissionGiven = await checkPermission(PermissionsAndroid.PERMISSIONS.CALL_PHONE);

    if (permissionGiven) {
      if (Platform.OS === 'android') {
        mobileNumber = `tel:${mobileNumber}`;
      }
      Linking.openURL(mobileNumber);
    } else {
      const getPermission = await requestCallPermission();
      if (PermissionsAndroid.RESULTS.GRANTED === getPermission) {
        if (Platform.OS === 'android') {
          mobileNumber = `tel:${mobileNumber}`;
        }
        Linking.openURL(mobileNumber);
      } else if (PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN === getPermission) {
        Alert.alert(
          'Info',
          'Go to Settings and enable phone permissions to make a call.',
          [
            { text: 'Ok', onPress: () => { } },
          ],
          { cancelable: false }
        );
      }
    }
  };

  render() {
    const {
      lead,
      leadFieldError,
      basicErrorMessage,
      mobileErrorMessage,
      mobileFieldError,
      genderErrorMessage,
      genderFieldError,
      teamMembers,
      emailErrorMessage,
      emailFieldError,
      pincodeErrorMessage,
      pincodeFieldError,
      enquirySources,
      source_of_enquiry,
      genderData,
      gender
    } = this.state;
    const {
      mobileNumber, currentUser, email, pincode
    } = this.props;
    return (
      this.props.lostReasonResponse &&
      <View style={styles.container}>
        {/* <Loader showIndicator={this.props.loading} /> */}
        {/* close icon */}
        {
          this.props.lead && this.props.vehicleList && this.props.lostReasonResponse
          && this.props.leadActivitiesResponse && this.props.teamMembers &&
          <View style={styles.body}>
            <View style={{ flexDirection: 'row' }}>
              <View style={{ flex: 1 }}>
                <TouchableOpacity
                  style={{
                    width: 30,
                    height: 30,
                    position: 'absolute',
                    right: 0,
                    top: 0,
                    alignItems: 'center',
                    backgroundColor: '#f26537'
                  }}
                  onPress={this.closeLeadHistory}
                >
                  <Image
                    style={{ resizeMode: 'center', flex: 1 }}
                    source={require('../../assets/images/close.png')}
                  />
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.panelContent}>
              {/* Left pane */}
              <View style={{
                flex: 3,
                flexDirection: 'column',
                marginHorizontal: 15,
                marginVertical: 15,
                backgroundColor: 'white',
                elevation: 5
              }}>
                <Text style={styles.pageTitle}>Lead Details</Text>
                <KeyboardAwareScrollView style={{
                  flex: 2,
                  flexDirection: 'column',
                  marginHorizontal: 10
                }}>
                  <View style={{
                    flex: 1,
                    flexDirection: 'column',
                    marginHorizontal: 15
                  }}>
                    <Dropdown
                      label="Source Of Enquiry"
                      labelFontSize={14}
                      disabled={!(lead && !lead.is_lost && currentUser && currentUser.role === constant.MANAGER)}
                      disabledItemColor="red"
                      containerStyle={[styles.sourceContainer]}
                      fontSize={13}
                      itemTextStyle={{ fontSize: 10, fontFamily: fonts.sourceSansProBoldItalic }}
                      data={enquirySources || []}
                      baseColor={variables.lightGrey}
                      value={source_of_enquiry || ''}
                      // onFocus={lead.enquirySource ? this.props.disableButton : () => {}}
                      onChangeText={value => {
                        this.setState(() => ({
                          source_of_enquiry: value,
                          dirty: true
                        }));
                      }}
                      labelExtractor={({ label }) => label}
                      // eslint-disable-next-line camelcase
                      valueExtractor={({ value }) => value}
                />
                  </View>
                  <View style={{
                    flex: 1,
                    flexDirection: 'column',
                    marginHorizontal: 10
                  }}>
                    {/* <Text style={styles.fieldTitle}>Name</Text> */}
                    <View style={styles.textfieldContainer}>
                      <TextInput
                        param="name"
                        placeholder="Enter the name"
                        placeholderTextColor="#9DA5B9"
                        editable={lead && !lead.is_lost && currentUser && currentUser.role === constant.MANAGER}
                        value={lead && lead.name ? lead.name : ''}
                        onChangeText={value => this.handleOnInputChange('name', value)}
                        style={styles.fieldValue}
                        underlineColorAndroid="transparent"
                        maxLength={50}
                      />
                    </View>
                    {
                      leadFieldError
                      && (
                      <Text style={styles.errorTextStyle}>
                        {basicErrorMessage}
                      </Text>
                      )
                    }
                    {mobileNumber !== null ?
                      <View style={{ flexDirection: 'row' }} >
                        <View style={{
                          width: 40,
                          borderWidth: 1,
                          borderRadius: 6,
                          borderColor: variables.dustyOrange,
                          marginVertical: 5,
                          justifyContent: 'center'
                        }}>
                          <TouchableOpacity
                            onPress={() => { this.dial(lead.mobile_number); }} >
                            <Call
                              style={{ left: 5 }}
                              name="call"
                              size={25}
                              color="#f05b3a" />
                          </TouchableOpacity>
                        </View>
                        <View style={styles.mobilefieldContainer}>
                          {/* <Text style={[styles.fieldTitle, { paddingVertical: 10 }]}>Phone</Text> */}
                          <TextInput
                            param="mobile_number"
                            placeholder="Enter The Phone Number"
                            placeholderTextColor="#9DA5B9"
                            editable={this.isFieldEditable(mobileNumber)}
                            value={lead && lead.mobile_number ? lead.mobile_number : ''}
                            onChangeText={value => this.handleOnInputChange('mobile_number', value)}
                            style={styles.fieldValue}
                            keyboardType="numeric"
                            underlineColorAndroid="transparent"
                            maxLength={10}
                      />
                        </View>
                      </View>
                      :
                      <View style={styles.textfieldContainer}>
                        {/* <Text style={[styles.fieldTitle, { paddingVertical: 10 }]}>Phone</Text> */}
                        <TextInput
                          param="mobile_number"
                          placeholder="Enter The Phone Number"
                          placeholderTextColor="#9DA5B9"
                          editable={this.isFieldEditable(mobileNumber)}
                          value={lead && lead.mobile_number ? lead.mobile_number : ''}
                          onChangeText={value => this.handleOnInputChange('mobile_number', value)}
                          style={styles.fieldValue}
                          keyboardType="numeric"
                          underlineColorAndroid="transparent"
                          maxLength={10}
                      />
                      </View> }

                    {
                        mobileFieldError
                        && (
                        <Text style={[styles.errorTextStyle, { marginHorizontal: 15 }]}>
                          {mobileErrorMessage}
                        </Text>
                        )
                    }
                    <View style={{
                      flex: 1,
                      flexDirection: 'column'
                    }}>
                      <Dropdown
                        label="Gender"
                        labelFontSize={14}
                        disabled={!(lead && !lead.is_lost && currentUser && currentUser.role === constant.MANAGER)}
                        disabledItemColor="red"
                        containerStyle={[styles.sourceContainer]}
                        fontSize={13}
                        itemTextStyle={{ fontSize: 10, fontFamily: fonts.sourceSansProBoldItalic }}
                        data={genderData || []}
                        baseColor={variables.lightGrey}
                        value={gender || 'male'}
                      // onFocus={lead.enquirySource ? this.props.disableButton : () => {}}
                        onChangeText={value => {
                          this.setState(() => ({
                            gender: value,
                            dirty: true
                          }));
                        }}
                        labelExtractor={({ label }) => label}
                      // eslint-disable-next-line camelcase
                        valueExtractor={({ value }) => value}
                />
                    </View>
                    <View style={styles.textfieldContainer}>
                      {/* <Text style={styles.fieldTitle}>Email</Text> */}
                      <TextInput
                        param="email"
                        placeholder="Enter The Email Id"
                        placeholderTextColor="#9DA5B9"
                        editable={this.isFieldEditable(email)}
                        value={lead && lead.email ? lead.email : ''}
                        onChangeText={value => this.handleOnInputChange('email', value)}
                        style={styles.fieldValue}
                        keyboardType="email-address"
                        underlineColorAndroid="transparent"
                      />
                    </View>
                    {
                      emailFieldError
                      && (
                      <Text style={styles.errorTextStyle}>
                        {emailErrorMessage}
                      </Text>
                      )
                    }
                    <View style={styles.textfieldContainer}>
                      {/* <Text style={[styles.fieldTitle, { paddingVertical: 10 }]}>Pincode</Text> */}
                      <TextInput
                        param="pincode"
                        placeholder="Enter The Pincode"
                        placeholderTextColor="#9DA5B9"
                        editable={this.isFieldEditable(pincode)}
                        value={lead && lead.pincode ? lead.pincode : ''}
                        onChangeText={value => this.handleOnInputChange('pincode', value)}
                        style={styles.fieldValue}
                        keyboardType="numeric"
                        underlineColorAndroid="transparent"
                        maxLength={6}
                      />
                    </View>
                    {
                      pincodeFieldError
                      && (
                        <Text style={[styles.errorTextStyle, { marginHorizontal: 15 }]}>
                          {pincodeErrorMessage}
                        </Text>
                      )
                    }
                  </View>

                  <View style={{
                    marginHorizontal: 10, flexDirection: 'column'
                  }}>
                    <Text style={styles.fieldTitle}>Assigned To</Text>
                    {!(lead.is_invoiced || lead.is_lost)
                      ? (
                        <SectionedMultiSelect
                          items={teamMembers || []}
                          disabled={lead && (lead.is_lost || lead.is_invoiced)}
                          styles={{
                            container: styles.dropdownContainer,
                            selectDropdownTextField: styles.selectDropdownTextField,
                            button: styles.confirmBtn,
                            confirmText: styles.confirmText,
                            selectToggle: { paddingHorizontal: 5 }
                          }}
                          showCancelButton="true"
                          uniqueKey="id"
                          subKey="children"
                          displayKey="first_name"
                          single="true"
                          hideSearch="true"
                          expandDropDowns="true"
                          onSelectedItemsChange={this.onSelectedItemsChange}
                          selectedItems={this.state.selectedItems}
                          readOnlyHeadings
                          />
                      )
                      : (
                        <View style={styles.assigneNameView}>
                          <Text >
                            {(lead.assignee && lead.assignee.first_name) ? lead.assignee.first_name : ''}
                          </Text>
                          <View style={styles.assigneeLineSeperator} />
                        </View>
                      )
                        }
                  </View>
                </KeyboardAwareScrollView>
                {
                  lead && !lead.is_lost
                  && (
                  <View style={{
                    alignItems: 'flex-end', marginTop: 10, marginRight: 20, marginBottom: 10
                  }}>
                    <BookTestRideButton
                      customStyles={styles.saveBtnStyle}
                      title="Update"
                      handleSubmit={this.updateLead}
                      disabled={!this.isUserUpdateValidated()}
                    />
                  </View>
                  )
                }
              </View>
              {/* Right pane */}
              <View style={{
                flex: 7,
                marginRight: 15,
                marginVertical: 15,
                backgroundColor: 'white',
                elevation: 5
              }}>
                <LeadHistoryTab navigation={this.props.navigation} lead={this.props.lead} />
              </View>
            </View>
          </View>
        }
      </View>
    );
  }
}

export default LeadHistoryScreen;
