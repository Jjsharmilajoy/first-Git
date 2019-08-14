/**
 * This Component renders the instant lead creation activity available in
 * product details screen and compare vehicle screen.
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  View,
  Image,
  Text,
  TouchableHighlight,
  TextInput,
  Alert,
  ScrollView,
  Dimensions
} from 'react-native';
import { Dropdown } from 'react-native-material-dropdown';
import styles from '../LeadHistory/leadHistoryStyles';
import variables from '../../theme/variables';
import fonts from '../../theme/fonts';

import {
  // mobileNumberValidator,
  isStringEmpty,
  isAlphaOnly,
  trimExtraspaces,
  landlineOrmobileNumberValidator,
  emailValidator,
  pincodeValidator
} from '../../utils/validations';
import { BookTestRideButton, SecondaryButton } from '../../components/button/Button';
import { setLead, createLead, updateLead } from '../../redux/actions/Global/actionCreators';
import constant from '../../utils/constants';

const DEVICE_WIDTH = Dimensions.get('screen').width;

@connect(state => ({
  currentUser: state.user.currentUser,
  lead: state.global.lead,
  leadName: state.global.name,
  leadGender: state.global.gender,
  mobileNumber: state.global.mobileNumber,
  email: state.global.email,
  pincode: state.global.pincode
}), {
  createLead,
  setLead,
  updateLead
})
class InstantLeadCreation extends Component {
  static propTypes = {
    currentUser: PropTypes.object.isRequired,
    dealerId: PropTypes.string.isRequired,
    createLead: PropTypes.func.isRequired,
    setLead: PropTypes.func.isRequired,
    updateLead: PropTypes.func.isRequired,
    slide: PropTypes.func.isRequired,
    lead: PropTypes.object,
    mobileNumber: PropTypes.string.isRequired,
    leadGender: PropTypes.string.isRequired,
    leadName: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    pincode: PropTypes.string.isRequired,
    showIndicator: PropTypes.func.isRequired,
    hideIndicator: PropTypes.func.isRequired,
    disableButton: PropTypes.func.isRequired,
    buttonState: PropTypes.bool.isRequired
  }

  static defaultProps = {
    lead: null,
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
      source_of_enquiry: 'walk-in',
      pincodeErrorMessage: 'Invalid Pincode',
      emailErrorMessage: 'Invalid Email',
      genderErrorMessage: 'Select gender',
      basicErrorMessage: 'Enter a valid name',
      mobileErrorMessage: 'Invalid Mobile Number',
      dirty: false,
      disableBtnAction: false,
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
      ]
    };
  }

  static getDerivedStateFromProps(nextProps) {
    const { lead } = nextProps;
    if (lead && Object.keys('lead').length > 0) {
      return {
        lead: {
          ...lead
        },
        source_of_enquiry: lead ? lead.source_of_enquiry : 'walk-in',
        name: lead ? lead.name : '',
        mobileNumber: lead ? lead.mobile_number : null,
        gender: lead ? lead.gender : '',
        email: lead ? lead.email : null,
        pincode: lead ? lead.pincode : null,
        isMobileNumberAvailable: lead && lead.mobile_number
      };
    }
    return null;
  }

  handleOnInputChange = (param, value) => {
    const { lead, leadFieldError } = this.state;
    lead[param] = value;
    this.setState({
      dirty: true,
      leadFieldError:
        param === 'name' ? !isAlphaOnly(lead[param]) : leadFieldError,
      mobileFieldError:
        param === 'mobile_number' && lead[param].length !== 0 ? !landlineOrmobileNumberValidator(lead[param]) : false,
      emailFieldError:
        param === 'email' && lead[param].length !== 0 ? !emailValidator(lead[param]) : false,
      pincodeFieldError:
        param === 'pincode' && lead[param].length !== 0 ? !pincodeValidator(lead[param]) : false,
      lead,
      name: param === 'name' ? value : lead.name,
      mobileNumber: param === 'mobile_number' ? value : lead.mobile_number,
      email: param === 'email' ? value : lead.email,
      pincode: param === 'pincode' ? value : lead.pincode
      // disableBtnAction: false
    });
  }

  createNewLead = () => {
    const {
      name, gender, mobileNumber, email, pincode, source_of_enquiry
    } = this.state;
    const { dealerId } = this.props;
    const data = {
      name: trimExtraspaces(name),
      gender,
      mobile_number: trimExtraspaces(mobileNumber),
      email: trimExtraspaces(email),
      pincode: trimExtraspaces(pincode),
      source_of_enquiry
    };
    const isMobileNumberValid = mobileNumber ? landlineOrmobileNumberValidator(mobileNumber) : true;
    const isNameValid = isAlphaOnly(name) && !isStringEmpty(name);
    const isGenderSelected = !isStringEmpty(gender);
    const isEmailValid = email ? emailValidator(email) : true;
    const isPincodeValid = pincode ? pincodeValidator(pincode) : true;
    if (isMobileNumberValid && isNameValid && dealerId.length > 0 && isGenderSelected && isEmailValid && isPincodeValid) {
      this.setState({
        disableBtnAction: true
      });
      this.props.showIndicator();
      this.props.createLead(dealerId, data).then(() => {
        this.props.hideIndicator();
        this.props.setLead(this.props.lead);
        this.setState({
          dirty: false,
          name: '',
          mobileNumber: null,
          gender: '',
          email: null,
          pincode: null,
          disableBtnAction: false,
          lead: {
            ...this.props.lead
          },
          leadFieldError: false,
          mobileFieldError: false,
          genderFieldError: false,
          pincodeFieldError: false,
          emailFieldError: false
        });
        this.props.slide();
      }, error => {
        this.props.hideIndicator();
        if (error && error.err && !error.err.message.includes('invalidaccesstoken')) {
          Alert.alert(
            'Message',
            error && error.err ? error.err.message : '',
            [
              { text: 'OK', onPress: () => { this.setState({ disableBtnAction: false }); } },
            ],
            { cancelable: false }
          );
        }
      });
    } else {
      this.setState({
        disableBtnAction: false,
        dirty: false,
        name: data.name,
        gender: data.gender,
        mobileNumber: data.mobile_number,
        email: data.email,
        pincode: data.pincode,
        pincodeFieldError: data.pincode ? !isPincodeValid : false,
        leadFieldError: !isNameValid,
        mobileFieldError: data.mobile_number ? !isMobileNumberValid : false,
        emailFieldError: data.email ? !isEmailValid : false,
        genderFieldError: !isGenderSelected
      });
    }
  }

  updateLeadInfo = () => {
    const {
      lead
    } = this.state;
    const isNameValid = isAlphaOnly(lead.name) && !isStringEmpty(lead.name);
    const isMobileNumberValid = lead.mobile_number ? landlineOrmobileNumberValidator(lead.mobile_number) : true;
    const isEmailValid = lead.email ? emailValidator(lead.email) : true;
    const isPincodeValid = lead.pincode ? pincodeValidator(lead.pincode) : true;
    if (lead && isNameValid && isMobileNumberValid && isEmailValid && isPincodeValid) {
      if (this.state.isMobileNumberAvailable && lead && lead.mobile_number && lead.mobile_number.length < 10) {
        Alert.alert(
          'Alert',
          'Mobile number cannot be empty.',
          [
            { text: 'OK', onPress: () => { this.setState({ disableBtnAction: false }); } }
          ],
          { cancelable: false }
        );
      } else {
        this.setState({
          disableBtnAction: true
        });
        this.props.showIndicator();
        this.props.updateLead(lead.id, lead)
          .then(() => {
            this.props.hideIndicator();
            this.setState({
              dirty: false,
              disableBtnAction: false
            });
            this.props.setLead(lead);
            this.props.slide();
          })
          .catch(error => {
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
                        lead: leadObj,
                        disableBtnAction: false
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
    }
  }

  selectGender = value => {
    this.setState({
      dirty: true,
      genderFieldError: false,
      gender: value,
      lead: {
        ...this.state.lead,
        gender: value
      }
    });
  }

  cancelLeadCreation = () => {
    this.setState({
      name: this.props.lead ? this.props.lead.name : '',
      mobileNumber: this.props.lead ? this.props.lead.mobile_number : null,
      gender: this.props.lead ? this.props.lead.gender : '',
      email: this.props.email ? this.props.lead.email : null,
      pincode: this.props.pincode ? this.props.lead.pincode : null,
      lead: {
        ...this.props.lead
      },
      leadFieldError: false,
      mobileFieldError: false,
      genderFieldError: false,
      emailFieldError: false,
      pincodeFieldError: false
    });
    this.props.slide();
  }

  enableFieldEdit = value => {
    const { lead } = this.state;
    if (lead && lead.is_lost) {
      return false;
    } if (!value) {
      return true;
    }
    return false;
  }

  render() {
    const {
      name, gender, mobileNumber, email, pincode, lead, pincodeFieldError, pincodeErrorMessage, enquirySources,
      leadFieldError, mobileFieldError, genderFieldError,genderData,
      basicErrorMessage, mobileErrorMessage, genderErrorMessage,
      disableBtnAction, emailErrorMessage, emailFieldError, source_of_enquiry
    } = this.state;
    const { currentUser } = this.props;
    const isNewLead = this.props.lead && !this.props.lead.id;
    const isDealerManager = (currentUser && currentUser.role === constant.MANAGER);
    const editPermissions = {
      source_of_enquiry: false,
      name: false,
      phone: false,
      gender: false,
      email: false,
      pincode: false
    };
    editPermissions.name = (isNewLead || isDealerManager)
      || !(this.props.lead && Object.keys(this.props.lead).length > 0
        && this.props.lead.name && this.props.lead.name.length > 0);
    editPermissions.phone = (isNewLead || isDealerManager)
      || this.enableFieldEdit(this.props.lead.mobile_number);
    editPermissions.gender = (isNewLead || isDealerManager);
    editPermissions.email = (isNewLead || isDealerManager)
      || this.enableFieldEdit(this.props.lead.email);
    editPermissions.pincode = (isNewLead || isDealerManager)
      || this.enableFieldEdit(this.props.lead.pincode);
    editPermissions.source_of_enquiry = (isNewLead || isDealerManager)
      || this.enableFieldEdit(this.props.lead.source_of_enquiry);

    return (
      <View style={{
        flex:  DEVICE_WIDTH > 900 ? 1 :0.6,
        flexDirection: 'column',
        marginHorizontal: 10,
        marginVertical: 10,
        backgroundColor: 'white'
      }}>
        {
          lead && lead.id ?
            <Text style={[styles.pageTitle, { marginBottom: 5 }]}>Lead Details</Text>
            :
            <Text style={[styles.pageTitle, { marginBottom: 5 }]}>Create New Lead</Text>
          }
        <ScrollView style={{
          flex: 0.8,
          flexDirection: 'column',
          marginLeft: 10,
          marginTop: 5
        }}>
          <View style={{
            // flex: 1,
            flexDirection: 'column',
            marginHorizontal: 15
          }}>
            <Dropdown
              label="Source Of Enquiry22"
              labelFontSize={14}
              disabled={!editPermissions.source_of_enquiry}
              disabledItemColor="red"
              containerStyle={[styles.sourceContainer]}
              fontSize={13}
              itemTextStyle={{ fontSize: 10, fontFamily: fonts.sourceSansProBoldItalic }}
              data={enquirySources || []}
              baseColor={variables.lightGrey}
              value={source_of_enquiry || ''}
              onFocus={lead.enquirySource ? this.props.disableButton : () => {}}
              onChangeText={value => {
                this.setState(state => ({
                  lead: {
                    ...state.lead,
                    source_of_enquiry: value
                  },
                  source_of_enquiry: value,
                  dirty: true
                }));
              }}
              labelExtractor={({ label }) => label}
                      // eslint-disable-next-line camelcase
              valueExtractor={({ value }) => value}
                />
          </View>
          <View style={styles.instantTextfieldContainer}>
            {/* <Text style={[styles.fieldTitle]}>Name</Text> */}
            <TextInput
              param="name"
              placeholder="Enter the name"
              placeholderTextColor="#9DA5B9"
              editable={editPermissions.name}
              value={lead ? lead.name : name}
              onChangeText={value => this.handleOnInputChange('name', value)}
              style={[styles.fieldValue, { height: 35 }]}
              underlineColorAndroid="transparent"
              maxLength={50}
              />
          </View>
          {
          leadFieldError &&
            (
              <Text style={[styles.errorTextStyle, { marginHorizontal: 10 }]}>
                {basicErrorMessage}
              </Text>
            )
          }
          <View style={styles.instantTextfieldContainer}>
            {/* <Text style={[styles.fieldTitle]}>Mobile Number</Text> */}
            <TextInput
              keyboardType="numeric"
              param="mobile_number"
              placeholder="Enter Phone Number."
              editable={editPermissions.phone}
              placeholderTextColor="#9DA5B9"
              value={lead ? lead.mobile_number : mobileNumber}
              onChangeText={value => this.handleOnInputChange('mobile_number', value)}
              style={[styles.fieldValue, { height: 35 }]}
              underlineColorAndroid="transparent"
              maxLength={10}
            />
          </View>
          {
          mobileFieldError &&
            (
              <Text style={[styles.errorTextStyle, { marginHorizontal: 10 }]}>
                {mobileErrorMessage}
              </Text>
            )
          }
          {/* <View style={[styles.gender, { marginHorizontal: 10, marginVertical: 10, flexDirection: 'column' }]}>
            <View style={{
              flexDirection: 'row',
              marginLeft: 5
            }}
              >
              <TouchableHighlight
                style={gender === 'male' || lead.gender === 'male'
                  ? [styles.selectedCard, styles.genderCard] : styles.genderCard}
                underlayColor="#f16537"
                onPress={() => this.selectGender('male')}
                disabled={!editPermissions.gender}
                >
                <View style={{ alignItems: 'center' }}>
                  <Image
                    source={require('../../assets/images/male.png')}
                    activeOpacity={0.5}
                    resizeMode="contain"
                    style={{ width: 40, height: 30 }}
                    />
                </View>
              </TouchableHighlight>
              <TouchableHighlight
                style={[gender === 'female' || lead.gender === 'female' ? [styles.selectedCard, styles.genderCard]
                  : styles.genderCard, { paddingHorizontal: 16 }]}
                underlayColor="#f16537"
                onPress={() => this.selectGender('female')}
                disabled={!editPermissions.gender}>
                <View style={{ alignItems: 'center' }}>
                  <Image
                    source={require('../../assets/images/female.png')}
                    activeOpacity={0.5}
                    style={{ width: 30, height: 30 }}
                    resizeMode="center"
                    />
                </View>
              </TouchableHighlight>
              <TouchableHighlight
                style={gender === 'others' || lead.gender === 'others'
                  ? [styles.selectedCard, styles.genderCard]
                  : styles.genderCard}
                underlayColor="#f16537"
                onPress={() => this.selectGender('others')}
                disabled={!editPermissions.gender}>
                <View style={{
                  alignItems: 'center', justifyContent: 'center', width: 40, height: 40
                }}>
                  <Text style={[styles.cardText, { textAlign: 'center' }]}>
Others
                  </Text>
                </View>
              </TouchableHighlight>
            </View>
            {
              genderFieldError &&
                (
                  <Text style={[styles.errorTextStyle]}>
                    {genderErrorMessage}
                  </Text>
                )
            }
          </View> */}
                      <View style={{ justifyContent: 'center', marginHorizontal: 10 }}>
              <Dropdown
                label="Gender"
                labelFontSize={14}
                disabled={this.props.buttonState}
                disabledItemColor="red"
                containerStyle={[styles.sourceContainer, { marginVertical: 0 }]}
                fontSize={13}
                itemTextStyle={{ fontSize: 10, fontFamily: fonts.sourceSansProBoldItalic }}
                data={genderData || []}
                baseColor={variables.titleColor}
                value={gender || ''}
                onFocus={lead.gender ? this.props.disableButton : () => {}}
                onChangeText={value => {
                  this.setState(() => ({
                    gender: value
                  }));
                }}
                labelExtractor={({ label }) => label}
                      // eslint-disable-next-line camelcase
                valueExtractor={({ value }) => value}
                />
                     {
              genderFieldError &&
                (
                  <Text style={[styles.errorTextStyle]}>
                    {genderErrorMessage}
                  </Text>
                )
            }
            </View>
          <View style={styles.instantTextfieldContainer}>
            {/* <Text style={[styles.fieldTitle]}>Email</Text> */}
            <TextInput
              keyboardType="email-address"
              param="email"
              placeholder="Enter Email"
              editable={editPermissions.email}
              placeholderTextColor="#9DA5B9"
              value={lead ? lead.email : email}
              onChangeText={value => this.handleOnInputChange('email', value)}
              style={[styles.fieldValue, { height: 35 }]}
              underlineColorAndroid="transparent"
              maxLength={50}
            />
          </View>
          {
          emailFieldError &&
            (
              <Text style={[styles.errorTextStyle, { marginHorizontal: 10 }]}>
                {emailErrorMessage}
              </Text>
            )
          }
          <View style={styles.instantTextfieldContainer}>
            {/* <Text style={[styles.fieldTitle]}>Pincode</Text> */}
            <TextInput
              keyboardType="numeric"
              param="pincode"
              placeholder="Enter Pincode"
              editable={editPermissions.pincode}
              placeholderTextColor="#9DA5B9"
              value={lead ? lead.pincode : pincode}
              onChangeText={value => this.handleOnInputChange('pincode', value)}
              style={[styles.fieldValue, { height: 35 }]}
              underlineColorAndroid="transparent"
              maxLength={6}
            />
          </View>
          {
          pincodeFieldError &&
            (
              <Text style={[styles.errorTextStyle, { marginHorizontal: 10 }]}>
                {pincodeErrorMessage}
              </Text>
            )
          }
        </ScrollView>
        <View style={{
          flex: 0.2,
          marginLeft: 10,
          marginTop: 10,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'flex-end',
          top: DEVICE_WIDTH> 900 ? 10 : 1,
          right: 15
          }}>
          <SecondaryButton
            buttonStyle={{ width: 75, marginHorizontal: 5 }}
            title="Cancel"
            handleSubmit={this.cancelLeadCreation}
          />
          {
            lead && lead.id
            && (
            <BookTestRideButton
              disabled={!this.state.dirty || disableBtnAction}
              customStyles={styles.saveBtnStyle}
              title="Update"
              handleSubmit={this.updateLeadInfo}
              />
            )
          }
          {
            lead && !lead.id
            && (
            <BookTestRideButton
              disabled={disableBtnAction}
              customStyles={styles.saveBtnStyle}
              title="Create"
              handleSubmit={this.createNewLead}
              />
            )
          }
        </View>
      </View>
    );
  }
}

export default InstantLeadCreation;
