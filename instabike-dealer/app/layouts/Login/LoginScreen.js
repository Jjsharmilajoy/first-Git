import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { NavigationActions } from 'react-navigation';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Buffer } from 'buffer';
import {
  View, Text, TouchableOpacity, Keyboard, BackHandler,
  ScrollView, Alert, KeyboardAvoidingView, Image, Dimensions
} from 'react-native';
import { GradientButtonLarge } from '../../components/button/Button';
import UserInput from '../../components/userInput/UserInput';
import styles from './loginStyles';
import { authUser, resetPassword } from '../../redux/actions/Login/actionCreators';
import { updateClickedPosition, disableButton } from '../../redux/actions/Global/actionCreators';
import { getManufacturerId } from '../../redux/actions/filteredVehicles/actionCreators';
import loadDealership from '../../redux/actions/DealershipDetails/actionCreators';

import { setUser } from '../../redux/actions/User/actionCreators';
import storage from '../../helpers/AsyncStorage';
import { passwordStrengthValidator, isStringEmpty, mobileNumberValidator } from '../../utils/validations';
import { SUPPORT_EMAIL, SUPPORT_MOBILE_NUMBER } from '../../utils/constants';
import { resetScreens } from '../../actions/stackActions';

const instaBikeLogo = require('../../assets/images/instabikeLogo.png');

const DEVICE_WIDTH = Dimensions.get('screen').width;

let isPasswordValid;
@connect(state => ({
  token: state.login.token,
  documentToken: state.login.documentToken,
  currentUser: state.user.currentUser,
  user: state.login.user,
  newAuthToken: state.login.newAuthToken,
  loading: state.login.loadingGroup,
  manufacturerId: state.filteredVehicles.manufacturer_id,
  manufacturerSlug: state.dealerInfo.manufacturerSlug,
  buttonState: state.global.buttonState
}), {
  authUser,
  resetPassword,
  setUser,
  getManufacturerId,
  updateClickedPosition,
  disableButton,
  loadDealership
})
export default class LoginScreen extends Component {
  static propTypes = {
    authUser: PropTypes.func.isRequired,
    updateClickedPosition: PropTypes.func.isRequired,
    getManufacturerId: PropTypes.func.isRequired,
    resetPassword: PropTypes.func.isRequired,
    newAuthToken: PropTypes.string,
    manufacturerId: PropTypes.string,
    manufacturerSlug: PropTypes.string,
    documentToken: PropTypes.string,
    token: PropTypes.string,
    user: PropTypes.object,
    currentUser: PropTypes.object,
    navigation: PropTypes.object.isRequired,
    loading: PropTypes.bool.isRequired,
    setUser: PropTypes.func.isRequired,
    disableButton: PropTypes.func.isRequired,
    buttonState: PropTypes.bool.isRequired,
    loadDealership: PropTypes.func.isRequired
  }

  static defaultProps = {
    token: '',
    documentToken: '',
    user: {},
    currentUser: {},
    newAuthToken: null,
    manufacturerId: null,
    manufacturerSlug: null
  }

  constructor(props) {
    super(props);
    this.state = ({
      password: '',
      username: '',
      newPassword: '',
      confirmPassword: '',
      showPass: true,
      showNewPass: true,
      showConfirmPass: true,
      signIn: true,
      showError: false,
      errorTitle: '',
      isEmailExist: false
    });
  }

  componentDidMount() {
    this.props.updateClickedPosition(1);
  }

  onBackButtonPressAndroid = () => {
    Alert.alert(
      'Exit Application',
      'Do you want to quit application?', [{
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel'
      }, {
        text: 'OK',
        onPress: () => BackHandler.exitApp()
      }], {
        cancelable: false
      }
    );
  }

  handleOnInputChange = (param, value) => {
    if (param === 'username') {
      this.setState({ username: value });
    } else if (param === 'password') {
      this.setState({ password: value });
    } else if (param === 'newPassword') {
      this.setState({ newPassword: value, showError: false });
    } else if (param === 'confirmPassword') {
      this.setState({
        confirmPassword: value,
        showError: false
      });
    }
  }

  handleLoginOptionBtn = () => {
    this.setState({
      isEmailExist: !this.state.isEmailExist,
      username: '',
      password: ''
    });
  }

  handleSubmit = () => {
    this.props.disableButton();
    const { username, password } = this.state;
    let resetAction;
    let data = {
      password
    };
    if (mobileNumberValidator(username) && parseFloat(username)) {
      data = {
        ...data,
        mobile_no: username
      };
    } else {
      data = {
        ...data,
        email: username
      };
    }
    const key = Buffer.from(JSON.stringify(data)).toString('base64');
    const inputData = {
      key
    };
    if ((!isStringEmpty(username) && !isStringEmpty(password))) {
      this.props.authUser(inputData)
        .then(() => {
          const { user } = this.props;
          return this.props.getManufacturerId(user.user_type_id);
        }).then(() => {
          const { user } = this.props;
          return this.props.loadDealership(user.user_type_id);
        })
        .then(() => {
          const { user, token, documentToken } = this.props;
          if (token && token.length > 0) {
            const currentUser = {
              token,
              is_onboarding_done: user.is_onboarding_done,
              dealerId: user.user_type_id,
              user,
              documentToken,
              userId: user.id,
              role: user.user_role && user.user_role.length > 0 && user.user_role[0].role.name,
              manufacturerId: this.props.manufacturerId,
              manufacturerSlug: this.props.manufacturerSlug
            };
            this.props.setUser(currentUser);
            storage.storeJsonValues('currentUser', currentUser);
            Keyboard.dismiss();
            if (user.is_new) {
              this.setState({
                signIn: false,
                username: '',
                password: ''
              });
            } else if (currentUser && currentUser.role === 'DEALER_MANAGER'
              && !user.is_onboarding_done) {
              resetAction = resetScreens({
                index: 0,
                actions: [NavigationActions.navigate({ routeName: 'Onboarding' })]
              });
            } else {
              resetAction = resetScreens({
                index: 0,
                actions: [NavigationActions.navigate({ routeName: 'Dashboard' })]
              });
            }
            if (!user.is_new) {
              setTimeout(() => {
                this.setState({
                  username: '',
                  password: ''
                });
                this.props.navigation.dispatch(resetAction);
              }, 200);
            }
          }
        })
        .catch(error => {
          if (error && error.err && !error.err.message.includes('invalidaccesstoken')) {
            Alert.alert(
              '',
              error && error.err ? error.err.message : '',
              [
                { text: 'OK', onPress: () => { } }
              ],
              { cancelable: false }
            );
          }
        });
    } else {
      Alert.alert(
        'Alert',
        'Please enter the login credentials',
        [
          { text: 'OK', onPress: () => { } }
        ],
        { cancelable: false }
      );
    }
  }

  handleResetPassword = () => {
    this.props.disableButton();
    const { confirmPassword, newPassword } = this.state;
    const {
      navigation, user, token, currentUser
    } = this.props;
    let resetAction;
    if (newPassword && confirmPassword && Object.keys(user).length > 0) {
      if (isPasswordValid.length && isPasswordValid.alphaNumeric && isPasswordValid.specialChar) {
        if (confirmPassword === newPassword) {
          const data = {
            newPassword: confirmPassword
          };
          this.props.resetPassword(user.id, data, token).then(() => {
            const { newAuthToken, documentToken } = this.props;
            if (newAuthToken && newAuthToken.length > 0) {
              const currentUserObj = {
                ...currentUser,
                user: { ...this.props.user },
                token: newAuthToken,
                documentToken
              };
              storage.storeJsonValues('currentUser', currentUserObj);
              this.props.setUser(currentUserObj);
              if (user.user_role[0].role.name === 'DEALER_MANAGER') {
                resetAction = resetScreens({
                  index: 0,
                  actions: [NavigationActions.navigate({ routeName: 'Onboarding' })]
                });
              } else {
                resetAction = resetScreens({
                  index: 0,
                  actions: [NavigationActions.navigate({ routeName: 'Dashboard' })]
                });
              }
              setTimeout(() => {
                navigation.dispatch(resetAction);
              }, 200);
            }
          }).catch(error => {
            if (error && error.err && !error.err.message.includes('invalidaccesstoken')) {
              Alert.alert(
                'Alert',
                error && error.err ? error.err.message : '',
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      this.setState({
                        newPassword: '',
                        confirmPassword: ''
                      });
                    }
                  }
                ],
                { cancelable: false }
              );
            }
          });
        } else {
          this.setState({
            showError: true,
            errorTitle: 'Password mismatch'
          });
        }
      }
    } else {
      this.setState({
        showError: true,
        errorTitle: 'Please enter the password'
      });
    }
  }

  render() {
    const {
      signIn, newPassword, showError, errorTitle, username,
      isEmailExist, password, showPass, showNewPass, showConfirmPass, confirmPassword
    } = this.state;
    isPasswordValid = passwordStrengthValidator(newPassword);
    return (
      <View style={styles.container}>
        <View style={signIn ? styles.loginBody : styles.formBody}>
          <KeyboardAvoidingView style={signIn ? styles.form : styles.formResetPassword}>
            {/* <View style={{ paddingTop: 10, paddingBottom: 10 }}>

            </View> */}
            <View style={DEVICE_WIDTH > 900 ? { flex: 0.2, paddingTop: 10 } : { flex: 0.2 }}>
              <Image
                resizeMode="contain"
                style={{
                  width: 130,
                  height: 55,
                  alignSelf: 'center'
                }}
                source={instaBikeLogo}
              />
              {/* <Text style={{
                color: '#6A777A', fontSize: 20, fontWeight: 'bold', alignSelf: 'center'
              }}>
                {!signIn && 'Reset Your Password'}
              </Text> */}
              {/* <Text style={{ color: '#6A777A', fontSize: 12 }}>To continue to Instabike</Text> */}
            </View>
            <View style={{ flex: DEVICE_WIDTH > 900 ? 0.5 : 0.7, padding: 0 }}>
              <View style={styles.viewHeight}>
                {signIn ?
                  <ScrollView>
                    <UserInput
                      param="username"
                      placeholder={isEmailExist ? 'Email' : 'Mobile Number'}
                      keyboardType={isEmailExist ? 'email-address' : 'phone-pad'}
                      autoCapitalize="none"
                      returnKeyType="done"
                      value={username}
                      onChange={this.handleOnInputChange}
                      autoCorrect={false}
                      containerStyle={styles.userInputContainer}
                      textInputStyle={styles.textInputStyle}
                      maxLength={isEmailExist ? 50 : 10}
                      showGradient
                    />
                    <UserInput
                      secureTextEntry={showPass}
                      param="password"
                      placeholder="Password"
                      returnKeyType="done"
                      autoCapitalize="none"
                      value={password}
                      onChange={this.handleOnInputChange}
                      autoCorrect={false}
                      containerStyle={[styles.userInputContainer]}
                      textInputStyle={styles.textInputStyle}
                      maxLength={30}
                      showGradient
                    />
                    <TouchableOpacity
                      style={{
                        position: 'absolute',
                        right: 20,
                        top: 78,
                        zIndex: 99
                      }}
                      onPress={() => { this.setState({ showPass: !showPass }); }}
                      activeOpacity={0.6}
                      disabled={!(password && password.length > 0)}
                    >
                      <Icon
                        name={showPass ? 'eye-slash' : 'eye'}
                        size={18}
                        color={showPass ? '#a4a4a4' : '#f3842d'} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={{ marginTop: 0 }}
                      disabled={this.props.buttonState}
                      onPress={this.handleLoginOptionBtn}
                      activeOpacity={0.5}
                    >
                      <View style={{ flexDirection: 'row' }}>
                        <Text style={{ color: '#ff8e3e', fontSize: 14, fontWeight: 'bold' }}>
                          {isEmailExist
                            ? 'Sign in with Mobile Number' : 'Sign in with Email'}
                        </Text>
                      </View>
                    </TouchableOpacity>
                    <View style={{ flexDirection: 'row', paddingTop: 8 }}>
                      <GradientButtonLarge
                        disabled={this.props.loading || this.props.buttonState}
                        loadingText="Logging in..."
                        loading={this.props.loading}
                        title="LOGIN"
                        height={!(DEVICE_WIDTH > 900) && 40}
                        handleSubmit={this.handleSubmit}
                      />
                    </View>
                    <View style={{ marginTop: 5, marginBottom: 0 }}>
                      <TouchableOpacity
                        onPress={() => { }}
                        activeOpacity={0.5}
                      >
                        <Text style={{ color: '#989898', paddingBottom: 0 }}>Need Help?  {(DEVICE_WIDTH >= 640 && DEVICE_WIDTH <= 760) &&
                        SUPPORT_MOBILE_NUMBER}
                        </Text>
                      </TouchableOpacity>
                      {!(DEVICE_WIDTH >= 640 && DEVICE_WIDTH <= 760) &&
                      <Text style={{ color: '#989898', paddingBottom: 0 }}>{SUPPORT_MOBILE_NUMBER}</Text>
                      }
                      <Text style={{ color: '#989898', paddingBottom: 0 }}>{SUPPORT_EMAIL}</Text>
                    </View>
                  </ScrollView> :
                  <ScrollView>
                    <UserInput
                      param="newPassword"
                      placeholder="New Password"
                      secureTextEntry={showNewPass}
                      autoCapitalize="none"
                      returnKeyType="done"
                      value={newPassword}
                      onChange={this.handleOnInputChange}
                      autoCorrect={false}
                      containerStyle={styles.userInputContainer}
                      maxLength={30}
                      showGradient
                        />
                    <TouchableOpacity
                      style={{ position: 'absolute', right: 25, top: 15 }}
                      onPress={() => { this.setState({ showNewPass: !showNewPass }); }}
                      activeOpacity={0.5}
                      disabled={!(newPassword && newPassword.length > 0)}
                        >
                      <Icon
                        name={showNewPass ? 'eye-slash' : 'eye'}
                        size={18}
                        color={showNewPass ? '#a4a4a4' : '#f3842d'} />
                    </TouchableOpacity>
                    <UserInput
                      param="confirmPassword"
                      placeholder="Re-Type New Password"
                      returnKeyType="done"
                      autoCapitalize="none"
                      secureTextEntry={showConfirmPass}
                      value={confirmPassword}
                      onChange={this.handleOnInputChange}
                      autoCorrect={false}
                      containerStyle={styles.userInputContainer}
                      maxLength={30}
                      showError={showError}
                      errorTitle={errorTitle}
                      showGradient
                        />
                    <TouchableOpacity
                      style={{ position: 'absolute', right: 25, top: 75 }}
                      onPress={() => { this.setState({ showConfirmPass: !showConfirmPass }); }}
                      activeOpacity={0.5}
                      disabled={!(confirmPassword && confirmPassword.length > 0)}
                        >
                      <Icon
                        name={showConfirmPass ? 'eye-slash' : 'eye'}
                        size={18}
                        color={showConfirmPass ? '#a4a4a4' : '#f3842d'} />
                    </TouchableOpacity>
                    <View style={{ flexDirection: 'column', marginBottom: 10 }}>
                      <Text
                        style={isPasswordValid.length
                          ? { color: '#008000', fontSize: 10 }
                          : { color: '#a4a4a4', fontSize: 10 }}
                          >
                          8 Characters
                      </Text>
                      <Text
                        style={isPasswordValid.alphaNumeric
                          ? { color: '#008000', fontSize: 10 }
                          : { color: '#a4a4a4', fontSize: 10 }}
                          >
                          1 Alpha-Numeric
                      </Text>
                      <Text
                        style={isPasswordValid.specialChar
                          ? { color: '#008000', fontSize: 10 }
                          : { color: '#a4a4a4', fontSize: 10 }}
                          >
                          1 Special Character
                      </Text>
                    </View>
                    <View style={{
                      flexDirection: 'column', alignItems: 'flex-start'
                    }}>
                      <GradientButtonLarge
                        title="RESET"
                        loaderStyle={{ left: 30, position: 'absolute' }}
                        disabled={this.props.loading || this.props.buttonState}
                        loadingText="Resetting password..."
                        loading={this.props.loading}
                        handleSubmit={this.handleResetPassword}
                          />
                    </View>
                    <View style={{ marginTop: 5, marginBottom: 5 }}>
                      <TouchableOpacity
                        onPress={() => { }}
                        activeOpacity={0.5}
                          >
                        <Text style={{ color: '#989898', paddingBottom: 0 }}>Need Help?</Text>
                      </TouchableOpacity>
                      <Text style={{ color: '#989898', paddingBottom: 0 }}>{SUPPORT_MOBILE_NUMBER}</Text>
                      <Text style={{ color: '#989898', paddingBottom: 0 }}>{SUPPORT_EMAIL}</Text>
                    </View>
                  </ScrollView>
                }
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </View>
    );
  }
}
