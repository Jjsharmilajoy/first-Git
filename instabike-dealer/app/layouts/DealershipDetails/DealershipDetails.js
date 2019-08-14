/**
 * Dealership Details Screen
 * The Dealership Details Screen shows dealership information on the
 * time of on-boarding and it's seen only by Dealer Manager.
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  View, Text, ScrollView, Image, TouchableOpacity
} from 'react-native';
import UserInput from '../../components/userInput/UserInput';
import styles from './dealershipDetailsStyles';
import { BookTestRideButton } from '../../components/button/Button';
import { setUser } from '../../redux/actions/User/actionCreators';
import { saveDealership } from '../../redux/actions/Onboarding/actionCreators';
import {
  mobileNumberValidator,
  emailValidator,
  pincodeValidator,
  isStringEmpty,
  isAlphaNumericOnly,
  isAlphaOnly
} from '../../utils/validations';
import storage from '../../helpers/AsyncStorage';

@connect(state => ({
  dealer: state.onboarding.dealer,
  currentUser: state.user.currentUser
}), {
  saveDealership, setUser
})
class DealershipDetails extends Component {
  static propTypes = {
    currentUser: PropTypes.object.isRequired,
    saveDealership: PropTypes.func.isRequired,
    changeStep: PropTypes.func.isRequired,
    setUser: PropTypes.func.isRequired,
    dealer: PropTypes.object,
    user: PropTypes.object,
  }

  static defaultProps = {
    dealer: null,
    user: null
  }

  constructor(props) {
    super(props);
    this.state = {
      dealershipInfo: { ...this.props.dealer },
      user: this.props.user,
      mobileNumbersList: this.props.dealer
        && this.props.dealer.mobile_no ? this.props.dealer.mobile_no.split(',', 3) : [''],
      emailList: this.props.dealer
        && this.props.dealer.email ? this.props.dealer.email.split(',', 3) : [''],
      showMobileError: [],
      showEmailError: [],
      isPincodeValid: true,
      nameFieldError: false,
      userFieldError: false,
      lastNameError: false,
      addressFieldError: false,
      basicError: 'Field cannot be empty',
      validNameError: 'Enter a valid name',
      pincodeError: 'Pincode must contain 6 digits',
      emailError: 'Enter a valid Email Id',
      mobileError: 'Invalid Mobile Number',
    };
  }

  static getDerivedStateFromProps(nextProps) {
    const {
      dealer, user
    } = nextProps;
    if (dealer && user) {
      const firstName = nextProps.user && nextProps.user.first_name;
      const lastName = nextProps.user && nextProps.user.last_name;
      return {
        firstName,
        lastName,
        dealershipInfo: { ...nextProps.dealer }
      };
    }
    return null;
  }

  handleOnContinue = () => {
    const {
      dealershipInfo,
      mobileNumbersList,
      emailList,
      user,
      nameFieldError,
      addressFieldError,
      userFieldError,
      lastNameError
    } = this.state;
    const showEmailError = [];
    const showMobileError = [];
    if (dealershipInfo) {
      const isPincodeValid = pincodeValidator(dealershipInfo.pincode);
      mobileNumbersList.forEach((mobileNumber, index) => {
        showMobileError[index] = !mobileNumberValidator(mobileNumber);
      });
      emailList.forEach((email, index) => {
        showEmailError[index] = !emailValidator(email);
      });
      this.setState({
        showMobileError,
        showEmailError,
        isPincodeValid,
      });
      if (!nameFieldError && !addressFieldError && !userFieldError && !lastNameError
          && !showEmailError.includes(true)
          && !showMobileError.includes(true)
          && isPincodeValid) {
        const data = {
          dealer: {
            ...dealershipInfo
          },
          user
        };
        this.props.saveDealership(data).then(
          () => {
            const currentUser = {
              ...this.props.currentUser,
              user
            };
            storage.storeJsonValues('currentUser', currentUser);
            this.props.setUser(currentUser);
            this.props.changeStep(2);
          },
          error => {
            console.log(error);
          }
        );
      }
    }
  }

  displayPhoneNumber = () => {
    const {
      mobileNumbersList, mobileError, showMobileError
    } = this.state;
    return (
      mobileNumbersList.map((mobileNumber, index) => (
        <View
          style={{
            flex: 0.7, flexDirection: 'row', alignContent: 'flex-start'
          }}
          // eslint-disable-next-line
          key={index}
        >
          <UserInput
            param="mobile_no"
            placeholder="Enter Phone Number"
            autoCapitalize="none"
            returnKeyType="done"
            keyboardType="phone-pad"
            value={mobileNumber}
            onChange={(param, value) => this.handleOnInputChange(param, value, index)}
            autoCorrect={false}
            containerStyle={styles.fieldContainer}
            textStyle={styles.fieldValue}
            showError={showMobileError[index]}
            errorTitle={mobileError}
            maxLength={10}
            errorStyle={{ marginLeft: 10 }}
          />
          {
            index !== 0
            && (
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginHorizontal: 15,
                marginBottom: 15
              }}
              onPress={() => this.removePhoneNumber(index)}
              activeOpacity={0.5}
              >
              <Image source={require('../../assets/images/delete.png')} />
            </TouchableOpacity>
            )
          }
        </View>
      ))
    );
  }

  addPhoneNumber = () => {
    const { mobileNumbersList } = this.state;
    mobileNumbersList.push('');
    this.setState({
      mobileNumbersList
    });
  }

  removePhoneNumber = index => {
    const { mobileNumbersList, dealershipInfo } = this.state;
    mobileNumbersList.splice(index, 1);
    this.setState({
      dealershipInfo: {
        ...dealershipInfo,
        mobile_no: mobileNumbersList.join()
      },
      mobileNumbersList
    });
  }

  displayEmail = () => {
    const { emailList, showEmailError, emailError } = this.state;
    return (
      emailList.map((email, index) => (
        <View
          style={{
            flex: 0.7, flexDirection: 'row', alignContent: 'flex-start'
          }}
          // eslint-disable-next-line
          key={index}
        >
          <UserInput
            param="email"
            placeholder="Enter E-mail Id"
            autoCapitalize="none"
            returnKeyType="done"
            value={email}
            onChange={(param, value) => this.handleOnInputChange(param, value, index)}
            autoCorrect={false}
            containerStyle={styles.fieldContainer}
            textStyle={styles.fieldValue}
            showError={showEmailError[index]}
            errorTitle={emailError}
            errorStyle={{ marginLeft: 10 }}
          />
          {
            index !== 0
            && (
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginHorizontal: 10,
                marginVertical: 15
              }}
              onPress={() => this.removeEmail(index)}
              activeOpacity={0.5}
              >
              <Image source={require('../../assets/images/delete.png')} />
            </TouchableOpacity>
            )
          }
        </View>
      ))
    );
  }

  addEmail = () => {
    const { emailList } = this.state;
    emailList.push('');
    this.setState({
      emailList
    });
  }

  removeEmail = index => {
    const { emailList, dealershipInfo } = this.state;
    emailList.splice(index, 1);
    this.setState({
      dealershipInfo: {
        ...dealershipInfo,
        email: emailList.join()
      },
      emailList
    });
  }

  handleOnInputChange = (param, value, index) => {
    if (param === 'dealershipname') {
      if (!isAlphaNumericOnly(value.trim())) {
        this.setState({
          nameFieldError: true,
          dealershipInfo: {
            ...this.state.dealershipInfo,
            name: value
          }
        });
      } else {
        this.setState({
          nameFieldError: false,
          dealershipInfo: {
            ...this.state.dealershipInfo,
            name: value
          }
        });
      }
    } else if (param === 'mobile_no') {
      const { mobileNumbersList, showMobileError } = this.state;
      mobileNumbersList[index] = value;
      showMobileError[index] = false;
      this.setState({
        dealershipInfo: {
          ...this.state.dealershipInfo,
          mobile_no: mobileNumbersList.join(),
        },
        mobileNumbersList,
        showMobileError
      });
    } else if (param === 'email') {
      const { emailList, showEmailError } = this.state;
      emailList[index] = value;
      showEmailError[index] = false;
      this.setState({
        dealershipInfo: {
          ...this.state.dealershipInfo,
          email: emailList.join(),
        },
        emailList,
        showEmailError
      });
    } else if (param === 'landline_no') {
      this.setState({
        dealershipInfo: {
          ...this.state.dealershipInfo,
          landline_no: value
        }
      });
    } else if (param === 'address_line_1') {
      if (isStringEmpty(value)) {
        this.setState({
          addressFieldError: true,
          dealershipInfo: {
            ...this.state.dealershipInfo,
            address_line_1: value
          }
        });
      } else {
        this.setState({
          addressFieldError: false,
          dealershipInfo: {
            ...this.state.dealershipInfo,
            address_line_1: value
          }
        });
      }
    } else if (param === 'address_line_2') {
      this.setState({
        dealershipInfo: {
          ...this.state.dealershipInfo,
          address_line_2: value
        }
      });
    } else if (param === 'pincode') {
      if (pincodeValidator(value)) {
        this.setState({
          dealershipInfo: {
            ...this.state.dealershipInfo,
            pincode: value
          },
          isPincodeValid: true
        });
      } else {
        this.setState({
          dealershipInfo: {
            ...this.state.dealershipInfo,
            pincode: value
          },
          isPincodeValid: false
        });
      }
    } else if (param === 'firstname') {
      if (!isAlphaOnly(value.trim())) {
        this.setState({
          userFieldError: true,
          user: {
            ...this.state.user,
          },
          firstName: value
        });
      } else {
        this.setState({
          userFieldError: false,
          user: {
            ...this.state.user,
            first_name: value
          },
          firstName: value
        });
      }
    } else if (param === 'lastname') {
      if (value.length > 0 && !isAlphaOnly(value.trim())) {
        this.setState({
          lastNameError: true,
          user: {
            ...this.state.user,
          },
          lastName: value
        });
      } else {
        this.setState({
          lastNameError: false,
          user: {
            ...this.state.user,
            last_name: value
          },
          lastName: value
        });
      }
    }
  }

  render() {
    const {
      dealershipInfo,
      mobileNumbersList,
      emailList,
      isPincodeValid,
      pincodeError,
      firstName,
      lastName,
      addressFieldError,
      nameFieldError,
      userFieldError,
      basicError,
      validNameError,
      lastNameError
    } = this.state;
    return (
      <View style={styles.container}>
        <View style={styles.bodyLayout}>
          <ScrollView style={styles.form}>
            <Text style={styles.formTitle}>Enter Dealership Details</Text>
            <View style={{ marginVertical: 5 }}>
              <View style={{ flex: 1, flexDirection: 'row' }}>
                <View style={styles.nameBlock}>
                  <View style={{ flexDirection: 'row' }}>
                    <Text style={[styles.fieldTitle, { lineHeight: 22 }]}>Name</Text>
                    <Text style={styles.mandatoryField}>*</Text>
                  </View>
                  <UserInput
                    param="dealershipname"
                    placeholder="Enter Dealer Name"
                    autoCapitalize="none"
                    returnKeyType="done"
                    value={dealershipInfo ? dealershipInfo.name : ''}
                    onChange={this.handleOnInputChange}
                    autoCorrect={false}
                    containerStyle={styles.fieldContainer}
                    textStyle={styles.fieldValue}
                    maxLength={50}
                    showError={nameFieldError}
                    errorTitle={validNameError}
                    errorStyle={{ marginLeft: 10 }}
                  />
                </View>
              </View>
              <View style={{ flex: 1, flexDirection: 'row' }}>
                <View style={styles.salesManagerWrap}>
                  <View style={{ flexDirection: 'row' }}>
                    <Text style={[styles.fieldTitle, { lineHeight: 22 }]}>Manager First Name</Text>
                    <Text style={styles.mandatoryField}>*</Text>
                  </View>
                  <UserInput
                    param="firstname"
                    placeholder="Enter First Name"
                    autoCapitalize="none"
                    returnKeyType="done"
                    value={firstName}
                    onChange={this.handleOnInputChange}
                    autoCorrect={false}
                    containerStyle={styles.fieldContainer}
                    textStyle={styles.fieldValue}
                    maxLength={50}
                    showError={userFieldError}
                    errorTitle={validNameError}
                    errorStyle={{ marginLeft: 10 }}
                  />
                </View>
                <View style={styles.salesManagerWrap}>
                  <View style={{ flexDirection: 'row' }}>
                    <Text style={[styles.fieldTitle, { lineHeight: 22 }]}>Manager Last Name</Text>
                  </View>
                  <UserInput
                    param="lastname"
                    placeholder="Enter Last Name"
                    autoCapitalize="none"
                    returnKeyType="done"
                    value={lastName}
                    onChange={this.handleOnInputChange}
                    autoCorrect={false}
                    containerStyle={styles.fieldContainer}
                    textStyle={styles.fieldValue}
                    maxLength={50}
                    showError={lastNameError}
                    errorTitle={validNameError}
                    errorStyle={{ marginLeft: 10 }}
                  />
                </View>
              </View>
              <View style={{ flex: 1, flexDirection: 'column' }}>
                <View style={styles.detailsWrap}>
                  <View style={{ flexDirection: 'row' }}>
                    <Text style={[styles.fieldTitle, { lineHeight: 22 }]}>Phone</Text>
                    <Text style={styles.mandatoryField}>*</Text>
                  </View>
                  {this.displayPhoneNumber()}
                </View>
                {
                  mobileNumbersList.length < 3
                  && (
                  <TouchableOpacity
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'flex-start',
                      marginLeft: 60,
                      marginBottom: 10
                    }}
                    onPress={this.addPhoneNumber}
                    activeOpacity={0.5}
                    >
                    <Image source={require('../../assets/images/add_o.png')} />
                    <Text style={[styles.addInfo]}>Add Phone Number</Text>
                  </TouchableOpacity>
                  )
                }
              </View>
              <View style={{ flex: 1, flexDirection: 'column' }}>
                <View style={styles.detailsWrap}>
                  <View style={{ flexDirection: 'row' }}>
                    <Text style={[styles.fieldTitle, { lineHeight: 22 }]}>Email Id</Text>
                    <Text style={styles.mandatoryField}>*</Text>
                  </View>
                  {this.displayEmail()}
                </View>
                {
                  emailList.length < 3
                  && (
                  <TouchableOpacity
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'flex-start',
                      marginLeft: 60,
                      marginBottom: 10
                    }}
                    onPress={this.addEmail}
                    activeOpacity={0.5}
                    >
                    <Image source={require('../../assets/images/add_o.png')} />
                    <Text style={[styles.addInfo]}>Add Email ID</Text>
                  </TouchableOpacity>
                  )
                }
              </View>
              <View style={{ flex: 1, flexDirection: 'column' }}>
                <View style={styles.detailsWrap}>
                  <Text style={styles.fieldTitle}>Landline Number</Text>
                  <UserInput
                    param="landline_no"
                    placeholder="Enter landline number"
                    autoCapitalize="none"
                    returnKeyType="done"
                    value={dealershipInfo ? dealershipInfo.landline_no : ''}
                    onChange={this.handleOnInputChange}
                    autoCorrect={false}
                    containerStyle={styles.addressContainer}
                    textStyle={styles.addressText}
                  />
                </View>
                <View style={styles.detailsWrap}>
                  <View style={{ flexDirection: 'row' }}>
                    <Text style={[styles.fieldTitle, { lineHeight: 22 }]}>Address</Text>
                    <Text style={styles.mandatoryField}>*</Text>
                  </View>
                  <UserInput
                    param="address_line_1"
                    placeholder="Enter your address"
                    autoCapitalize="none"
                    returnKeyType="done"
                    value={dealershipInfo ? dealershipInfo.address_line_1 : ''}
                    onChange={this.handleOnInputChange}
                    autoCorrect={false}
                    containerStyle={styles.addressContainer}
                    textStyle={styles.addressText}
                    showError={addressFieldError}
                    errorTitle={basicError}
                    errorStyle={{ marginLeft: 10 }}
                  />
                  <UserInput
                    param="address_line_2"
                    placeholder="Enter your address"
                    autoCapitalize="none"
                    returnKeyType="done"
                    value={dealershipInfo ? dealershipInfo.address_line_2 : ''}
                    onChange={this.handleOnInputChange}
                    autoCorrect={false}
                    containerStyle={styles.addressContainer}
                    textStyle={styles.addressText}
                  />
                </View>
                <View style={styles.locationWrap}>
                  <View style={{ flex: 0.8, flexDirection: 'column' }}>
                    <View style={{ flexDirection: 'row' }}>
                      <Text style={[styles.fieldTitle, { lineHeight: 22 }]}>Zone</Text>
                    </View>
                    <UserInput
                      editable={false}
                      param="zone"
                      placeholder="Enter Zone"
                      autoCapitalize="none"
                      returnKeyType="done"
                      value={
                        dealershipInfo && Object.keys(dealershipInfo).length
                          ? dealershipInfo.zone.name : 0}
                      autoCorrect={false}
                      containerStyle={styles.pincodeContainer}
                      textStyle={styles.pincodeValue}
                  />
                  </View>
                  <View style={{ flex: 0.8, flexDirection: 'column' }}>
                    <View style={{ flexDirection: 'row' }}>
                      <Text style={[styles.fieldTitle, { lineHeight: 22 }]}>State</Text>
                    </View>
                    <UserInput
                      editable={false}
                      param="state"
                      placeholder="Enter State"
                      autoCapitalize="none"
                      returnKeyType="done"
                      value={
                        dealershipInfo && Object.keys(dealershipInfo).length > 0
                          ? dealershipInfo.state.name : 0}
                      autoCorrect={false}
                      containerStyle={styles.pincodeContainer}
                      textStyle={styles.pincodeValue}
                  />
                  </View>
                </View>
                <View style={{
                  flex: 0.8, marginHorizontal: 60, flexDirection: 'row', marginVertical: 10
                }}
                >
                  <View style={{ flex: 0.8, flexDirection: 'column' }}>
                    <View style={{ flexDirection: 'row' }}>
                      <Text style={[styles.fieldTitle, { lineHeight: 22 }]}>City</Text>
                    </View>
                    <UserInput
                      editable={false}
                      param="city"
                      placeholder="Enter City"
                      autoCapitalize="none"
                      returnKeyType="done"
                      value={
                        dealershipInfo && Object.keys(dealershipInfo).length
                          ? dealershipInfo.city.name : 0}
                      autoCorrect={false}
                      containerStyle={styles.pincodeContainer}
                      textStyle={styles.pincodeValue}
                  />
                  </View>
                  <View style={{ flex: 0.8 }}>
                    <View style={{ flexDirection: 'row' }}>
                      <Text style={[styles.fieldTitle, { lineHeight: 22 }]}>Pincode</Text>
                    </View>
                    <UserInput
                      param="pincode"
                      placeholder="Enter Pincode"
                      autoCapitalize="none"
                      returnKeyType="done"
                      keyboardType="numeric"
                      editable={false}
                      value={dealershipInfo && dealershipInfo.pincode ? dealershipInfo.pincode.toString() : ''}
                      onChange={this.handleOnInputChange}
                      autoCorrect={false}
                      containerStyle={styles.pincodeContainer}
                      textStyle={styles.pincodeValue}
                      showError={!isPincodeValid}
                      errorTitle={pincodeError}
                      errorStyle={{ marginLeft: 10 }}
                      maxLength={6}
                    />
                  </View>
                </View>
              </View>
            </View>
            <View style={styles.continueBtnContainer}>
              <View style={{ flexDirection: 'row-reverse', alignItems: 'flex-end' }}>
                <BookTestRideButton
                  title="CONTINUE"
                  handleSubmit={this.handleOnContinue}
                />
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    );
  }
}

export default DealershipDetails;
