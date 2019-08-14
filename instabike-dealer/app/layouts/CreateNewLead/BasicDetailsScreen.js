/**
 * Basic Details Screen
 * The Basic Details Screen collects user basic information while creating
 * lead.
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  View, Text, Alert
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Dropdown } from 'react-native-material-dropdown';
import { connect } from 'react-redux';
import UserInput from '../../components/userInput/UserInput';
import { BookTestRideButton } from '../../components/button/Button';
import styles from './basicDetailsStyles';
import {
  isAlphaOnly,
  isStringEmpty,
  trimExtraspaces,
  landlineOrmobileNumberValidator,
  emailValidator,
  pincodeValidator
} from '../../utils/validations';
import { createLead, clearLead, disableButton } from '../../redux/actions/Global/actionCreators';
import Loader from '../../components/loader/Loader';
import variables from '../../theme/variables';
import fonts from '../../theme/fonts';

@connect(state => ({
  lead: state.global.lead,
  loading: state.global.loadingGroup,
  buttonState: state.global.buttonState
}), {
  createLead,
  clearLead,
  disableButton
})
class BasicDetailsScreen extends Component {
  static propTypes = {
    handleOnContinue: PropTypes.func.isRequired,
    dealerId: PropTypes.string.isRequired,
    createLead: PropTypes.func.isRequired,
    lead: PropTypes.object,
    loading: PropTypes.bool.isRequired,
    navigation: PropTypes.object.isRequired,
    clearLead: PropTypes.func.isRequired,
    disableButton: PropTypes.func.isRequired,
    buttonState: PropTypes.bool.isRequired
  }

  static defaultProps = {
    lead: {},
  }

  constructor(props) {
    super(props);
    this.state = {
      lead: {},
      gender: 'male',
      name: '',
      mobileNumber: '',
      email: '',
      pincode: '',
      source_of_enquiry: 'walk-in',
      pincodeFieldError: false,
      leadFieldError: false,
      mobileFieldError: false,
      emailFieldError: false,
      genderFieldError: false,
      basicErrorMessage: 'Enter a valid name.',
      mobileErrorMessage: 'Invalid Mobile Number.',
      emailErrorMessage: 'Invalid Email Id.',
      pincodeErrorMessage: 'Invalid Pincode.',
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

  static getDerivedStateFromProps(nextProps, prevState) {
    const { lead } = nextProps;
    if (!prevState.lead && lead) {
      return {
        lead,
        gender: lead && Object.keys(lead).length !== 0 ? lead.gender : 'male',
        name: lead && Object.keys(lead).length !== 0 ? lead.name : '',
        mobileNumber: lead && Object.keys(lead).length !== 0 ? lead.mobile_number : '',
        email: lead && Object.keys(lead).length !== 0 ? lead.email : '',
        pincode: lead && Object.keys(lead).length !== 0 ? lead.pincode : ''
      };
    }
    return null;
  }

  componentDidMount() {
    this.props.clearLead();
    this.willFocusSubscription = this.props.navigation.addListener(
      'willFocus',
      () => {
        this.setState({
          lead: null
        }, () => this.props.clearLead());
      }
    );
  }

  componentWillUnmount() {
    this.props.clearLead();
    this.willFocusSubscription.remove();
  }

  handleOnInputChange = (param, value) => {
    if (param === 'name') {
      if (!isAlphaOnly(value.trim())) {
        this.setState({
          leadFieldError: true,
          name: value,
          lead: {
            ...this.state.lead,
            name: value
          }
        });
      } else {
        this.setState({
          leadFieldError: false,
          name: value,
          lead: {
            ...this.state.lead,
            name: value
          }
        });
      }
    } else if (param === 'mobile_no') {
      if (!landlineOrmobileNumberValidator(value)) {
        this.setState({
          mobileFieldError: value.length !== 0,
          mobileNumber: value,
          lead: {
            ...this.state.lead,
            mobile_number: value
          }
        });
      } else {
        this.setState({
          mobileFieldError: false,
          mobileNumber: value,
          lead: {
            ...this.state.lead,
            mobile_number: value
          }
        });
      }
    } else if (param === 'email') {
      if (!emailValidator(value)) {
        this.setState({
          emailFieldError: value.length !== 0,
          email: value,
          lead: {
            ...this.state.lead,
            email: value
          }
        });
      } else {
        this.setState({
          emailFieldError: false,
          email: value,
          lead: {
            ...this.state.lead,
            email: value
          }
        });
      }
    } else if (param === 'pincode') {
      if (!pincodeValidator(value)) {
        this.setState({
          pincodeFieldError: value.length !== 0,
          pincode: value,
          lead: {
            ...this.state.lead,
            pincode: value
          }
        });
      } else {
        this.setState({
          pincodeFieldError: false,
          pincode: value,
          lead: {
            ...this.state.lead,
            pincode: value
          }
        });
      }
    }
  }

  createNewLead = () => {
    this.props.disableButton();
    const {
      name, gender, mobileNumber, email, pincode, source_of_enquiry
    } = this.state;
    const { dealerId } = this.props;
    const data = {
      name: name && name.length > 0 ? trimExtraspaces(name) : null,
      gender,
      mobile_number: mobileNumber && mobileNumber.length > 0 ? trimExtraspaces(mobileNumber) : null,
      email: email && email.length > 0 ? trimExtraspaces(email) : null,
      pincode: pincode && pincode.length > 0 ? trimExtraspaces(pincode) : null,
      source_of_enquiry
    };
    const isMobileNumberValid = data.mobile_number ? landlineOrmobileNumberValidator(data.mobile_number) : true;
    const isNameValid = isAlphaOnly(data.name) && !isStringEmpty(data.name);
    const isGenderSelected = !isStringEmpty(gender);
    const isEmailValid = data.email ? emailValidator(data.email) : true;
    const isPincodeValid = data.pincode ? pincodeValidator(data.pincode) : true;
    if (isMobileNumberValid && isNameValid && isPincodeValid
      && dealerId.length > 0 && isGenderSelected && isEmailValid) {
      this.props.createLead(dealerId, data).then(() => {
        this.props.handleOnContinue(this.props.lead);
      }, error => {
        if (error && error.err && !error.err.message.includes('invalidaccesstoken')) {
          Alert.alert(
            'Message',
            error && error.err ? error.err.message : '',
            [
              { text: 'OK', onPress: () => {} },
            ],
            { cancelable: false }
          );
        }
      });
    }
    this.setState({
      lead: {
        ...this.state.lead,
        name: data.name,
        mobile_number: data.mobile_number,
        email: data.email,
        pincode: data.pincode,
        source_of_enquiry: data.source_of_enquiry
      },
      name: data.name,
      mobileNumber: data.mobile_number,
      email: data.email,
      pincode: data.pincode,
      source_of_enquiry: data.source_of_enquiry,
      emailFieldError: data.email ? !isEmailValid : false,
      pincodeFieldError: data.pincode ? !isPincodeValid : false,
      leadFieldError: !isNameValid,
      mobileFieldError: data.mobile_number ? !isMobileNumberValid : false,
      genderFieldError: !isGenderSelected
    });
  }

  selectGender = value => {
    this.setState({
      genderFieldError: false,
      gender: value
    });
  }

  render() {
    const {
      lead,
      name,
      mobileNumber,
      gender,
      email,
      source_of_enquiry,
      basicErrorMessage,
      leadFieldError,
      mobileErrorMessage,
      mobileFieldError,
      emailErrorMessage,
      emailFieldError,
      pincode,
      pincodeErrorMessage,
      pincodeFieldError,
      enquirySources,
      genderData
    } = this.state;
    return (
      <KeyboardAwareScrollView style={styles.container}>
        <Loader showIndicator={this.props.loading} />
        <View style={{ flexDirection: 'row' }}>
          <View style={{ flexDirection: 'column', flex: 1 }}>
            <View style={{ justifyContent: 'center' }}>
              <Dropdown
                label="Source Of Enquiry"
                labelFontSize={14}
                disabled={this.props.buttonState}
                disabledItemColor="red"
                containerStyle={[styles.sourceContainer]}
                fontSize={13}
                itemTextStyle={{ fontSize: 10, fontFamily: fonts.sourceSansProBoldItalic }}
                data={enquirySources || []}
                baseColor={variables.titleColor}
                value={source_of_enquiry || ''}
                onFocus={lead.enquirySource ? this.props.disableButton : () => {}}
                onChangeText={value => {
                  this.setState(() => ({
                    source_of_enquiry: value
                  }));
                }}
                labelExtractor={({ label }) => label}
                      // eslint-disable-next-line camelcase
                valueExtractor={({ value }) => value}
                />
            </View>
            <View style={styles.nameContainer}>
              <View style={{ flexDirection: 'row' }}>
                <Text style={[styles.fieldTitle, { lineHeight: 22 }]}>Name</Text>
                <Text style={styles.mandatoryField}>*</Text>
              </View>
              <UserInput
                param="name"
                placeholder="Enter Name"
                autoCapitalize="none"
                returnKeyType="done"
                value={lead && lead.name ? lead.name : name}
                onChange={this.handleOnInputChange}
                autoCorrect={false}
                containerStyle={styles.fieldContainer}
                textStyle={styles.fieldValue}
                maxLength={50}
                showError={leadFieldError}
                errorTitle={basicErrorMessage}
                errorStyle={{ marginLeft: 10 }}
                />
            </View>
            <View style={{ justifyContent: 'center' }}>
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
            </View>
            {/* <View style={styles.gender}>
              <View style={{ flexDirection: 'row' }}>
                <Text style={[styles.fieldTitle, { lineHeight: 22 }]}>Gender</Text>
                <Text style={styles.mandatoryField}>*</Text>
              </View>
              <View style={{
                flexDirection: 'row',
                marginLeft: 2
              }}
              >
                <TouchableHighlight
                  style={gender === 'male' ? [styles.selectedCard, styles.genderCard] : styles.genderCard}
                  underlayColor="#fff"
                  onPress={() => this.selectGender('male')}
                >
                  <View style={{ alignItems: 'center' }}>
                    <Image
                      source={require('../../assets/images/male.png')}
                      activeOpacity={0.5}
                      resizeMode="contain"
                      style={{ width: (DEVICE_WIDTH > 900 ? 60 : 45), height: 50 }}
                    />
                  </View>
                </TouchableHighlight>
                <TouchableHighlight
                  style={[gender === 'female' ? [styles.selectedCard, styles.genderCard]
                    : styles.genderCard, { paddingHorizontal: 16 }]}
                  underlayColor="#fff"
                  onPress={() => this.selectGender('female')}
                >
                  <View style={{ alignItems: 'center' }}>
                    <Image
                      source={require('../../assets/images/female.png')}
                      activeOpacity={0.5}
                      style={{ width: (DEVICE_WIDTH > 900 ? 60 : 45), height: 50 }}
                      resizeMode="contain"
                    />
                  </View>
                </TouchableHighlight>
                <TouchableHighlight
                  style={gender === 'others' ? [styles.selectedCard, styles.genderCard]
                    : styles.genderCard}
                  underlayColor="#fff"
                  onPress={() => this.selectGender('others')}
                >
                  <View style={{
                    alignItems: 'center', justifyContent: 'center', width: (DEVICE_WIDTH > 900 ? 60 : 45), height: 50
                  }}>
                    <Text style={[styles.cardText, { textAlign: 'center' }]}>
  Others
                    </Text>
                  </View>
                </TouchableHighlight>
              </View>
              {
              genderFieldError
                ? (
                  <Text style={[styles.errorTextStyle]}>
  Please select gender.
                  </Text>
                )
                : <Text style={styles.errorTextStyle} />
              }
            </View> */}
          </View>
          <View style={{ flexDirection: 'column', flex: 1, marginTop: 15 }}>
            <View style={styles.nameContainer}>
              <View style={{ flexDirection: 'row' }}>
                <Text style={[styles.fieldTitle, { lineHeight: 22 }]}>Phone Number</Text>
              </View>
              <UserInput
                param="mobile_no"
                placeholder="Enter Phone Number"
                autoCapitalize="none"
                returnKeyType="done"
                keyboardType="phone-pad"
                value={lead && lead.mobile_number ? lead.mobile_number : mobileNumber}
                onChange={this.handleOnInputChange}
                autoCorrect={false}
                containerStyle={styles.fieldContainer}
                textStyle={styles.fieldValue}
                showError={mobileFieldError}
                errorTitle={mobileErrorMessage}
                maxLength={10}
                errorStyle={{ marginLeft: 10 }}
                />
            </View>
            <View style={styles.nameContainer}>
              <View style={{ flexDirection: 'row' }}>
                <Text style={[styles.fieldTitle, { lineHeight: 22 }]}>Email</Text>
              </View>
              <UserInput
                param="email"
                placeholder="Enter Email"
                autoCapitalize="none"
                returnKeyType="done"
                keyboardType="email-address"
                value={lead && lead.email ? lead.email : email}
                onChange={this.handleOnInputChange}
                autoCorrect={false}
                containerStyle={styles.fieldContainer}
                textStyle={styles.fieldValue}
                showError={emailFieldError}
                errorTitle={emailErrorMessage}
                errorStyle={{ marginLeft: 10 }}
                />
            </View>
            <View style={styles.nameContainer}>
              <View style={{ flexDirection: 'row' }}>
                <Text style={[styles.fieldTitle, { lineHeight: 22 }]}>Pincode</Text>
              </View>
              <UserInput
                param="pincode"
                placeholder="Enter Pincode"
                autoCapitalize="none"
                returnKeyType="done"
                keyboardType="phone-pad"
                value={lead && lead.pincode ? lead.pincode : pincode}
                onChange={this.handleOnInputChange}
                autoCorrect={false}
                containerStyle={styles.fieldContainer}
                textStyle={styles.fieldValue}
                showError={pincodeFieldError}
                errorTitle={pincodeErrorMessage}
                maxLength={6}
                errorStyle={{ marginLeft: 10 }}
                />
            </View>
          </View>
        </View>
        <View style={styles.continueBtnContainer}>
          <View style={{ alignItems: 'center' }}>
            <BookTestRideButton
              title="CONTINUE"
              disabled={this.props.loading || this.props.buttonState}
              handleSubmit={this.createNewLead}
              />
          </View>
        </View>
      </KeyboardAwareScrollView>
    );
  }
}

export default BasicDetailsScreen;
