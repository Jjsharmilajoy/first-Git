/**
 * The Onboarding Screen is the parent component that controls the five
 * onboarding steps. this screen is available for Dealer Manager for the
 * very first time.
 */
import React, { Component } from 'react';
import {
  Image, View, Text } from 'react-native';
import { connect } from 'react-redux';
import { NavigationActions } from 'react-navigation';
import PropTypes from 'prop-types';
import storage from '../../helpers/AsyncStorage';
import styles from './onboardingStyles';
import instaBikeLogo from '../../assets/images/instabikeLogo.png';
import ChooseFinancierScreen from '../ChooseFinancier/ChooseFinancierScreen';
import DealershipDetails from '../DealershipDetails/DealershipDetails';
import { getDealerDetailsById } from '../../redux/actions/Onboarding/actionCreators';
import TestRideTimingsScreen from '../TestRideTimings/TestRideTimingsScreen';
import TeamMemberScreen from '../TeamMember/TeamMemberScreen';
import ChooseAccessories from '../ChooseAccessories/ChooseVehicleAccessories';
import { capitalizeFirstLetter } from '../../utils/validations';
import Loader from '../../components/loader/Loader';
import { resetSession } from '../../redux/actions/User/actionCreators';
import { resetScreens } from '../../actions/stackActions';
import constants from '../../utils/constants';

let manufacturerLogo = require('../../assets/images/suzuki/logo.png');
if (constants.manufacturer === 'hero') {
  manufacturerLogo = require('../../assets/images/hero/logo.png');
} else if (constants.manufacturer === 'flash') {
  manufacturerLogo = require('../../assets/images/flash/logo.png');
}

@connect(
  state => ({
    dealer: state.onboarding.dealer,
    loading: state.onboarding.loadingGroup,
    currentUser: state.user.currentUser,
    isSessionExpired: state.user.isSessionExpired,
  }),
  {
    getDealerDetailsById,
    resetSession
  }
)
class OnboardingScreen extends Component {
  static propTypes = {
    dealer: PropTypes.object,
    isSessionExpired: PropTypes.bool.isRequired,
    navigation: PropTypes.object.isRequired,
    loading: PropTypes.bool.isRequired,
    getDealerDetailsById: PropTypes.func.isRequired,
    resetSession: PropTypes.func.isRequired,
    currentUser: PropTypes.object.isRequired
  }

  static defaultProps = {
    dealer: null
  }

  constructor(props) {
    super(props);
    this.state = {
      user: null
    };
  }

  static getDerivedStateFromProps(nextProps) {
    const { currentUser, navigation, dealer } = nextProps;
    if (currentUser && navigation && dealer) {
      return {
        dealer,
        user: { ...nextProps.currentUser.user, role: nextProps.currentUser.role },
        position: navigation && navigation.state
          && navigation.state.params && navigation.state.params.toSend > 0 ? navigation.state.params.toSend : 1
      };
    }
    return null;
  }

  componentDidMount() {
    const { currentUser } = this.props;
    this.props.getDealerDetailsById(currentUser.dealerId).catch(error => {
      console.log('errorrr', error);
    });
  }

  componentDidUpdate() {
    const { isSessionExpired } = this.props;
    if (isSessionExpired) {
      this.redirectToLogin();
      this.props.resetSession();
    }
  }

  redirectToLogin = async () => {
    const { navigation } = this.props;
    await storage.clearValues();
    const resetAction = resetScreens({
      index: 0,
      actions: [{ type: 'Navigate', routeName: 'Login' }],
    });
    await navigation.dispatch(resetAction);
  }

  /**
   * Change position step
   */
  changeStep = value => {
    const { navigation } = this.props;
    const resetAction = resetScreens({
      index: 0,
      actions: [NavigationActions.navigate({
        routeName: 'Onboarding',
        params: { toSend: value }
      })],
    });
    navigation.dispatch(resetAction);
  }

  updateUser = user => {
    this.setState({
      user
    });
  }

  previousStep = value => {
    const { navigation } = this.props;
    const resetAction = resetScreens({
      index: 0,
      actions: [NavigationActions.navigate({
        routeName: 'Onboarding',
        params: { toSend: value }
      })],
    });
    navigation.dispatch(resetAction);
  }

  updateCurrentScreen = () => {
    const { user } = this.state;
    switch (this.state.position) {
      case 1:
        return (
          this.props.dealer !== null && this.props.dealer !== undefined
          && (
          <DealershipDetails
            changeStep={this.changeStep}
            user={user}
            updateUser={this.updateUser}
            />
          )
        );
      case 2:
        return (
          <TeamMemberScreen
            changeStep={this.changeStep}
            previousStep={this.previousStep}
          />
        );
      case 3:
        return (
          <ChooseAccessories changeStep={this.changeStep} navigation={this.props.navigation} />
        );
      case 4:
        return (
          this.props.dealer !== null && this.props.dealer !== undefined
          && (
          <TestRideTimingsScreen
            dealer={this.props.dealer}
            changeStep={this.changeStep}
            previousStep={this.previousStep}
            />
          )
        );
      case 5:
        return (
          <ChooseFinancierScreen
            changeStep={this.changeStep}
            navigation={this.props.navigation}
            previousStep={this.previousStep}
          />
        );
      default:
        return (
          this.props.dealer !== null && this.props.dealer !== undefined
          && (
          <DealershipDetails
            dealer={this.props.dealer}
            changeStep={this.changeStep}
            user={user}
            updateUser={this.updateUser}
            />
          )
        );
    }
  }

  render() {
    const { user, dealer } = this.state;
    return (
      <View style={styles.mainContainer}>
        <Loader showIndicator={this.props.loading} />
        <View style={styles.headerView}>
          <View style={styles.brandLogoView}>
            <Image
              style={styles.brandLogoImage}
              source={manufacturerLogo}
            />
            <Text style={{ color: 'white', fontSize: 12 }}>
              {dealer && dealer.dealer_category ? dealer.dealer_category.name : ''}
            </Text>
          </View>
          <View style={styles.seperatorView} />
          {
            user
            && (
            <Text style={{ color: 'white', marginHorizontal: 20, fontSize: 10 }}>
              { user.last_name ? `${user.first_name} ${user.last_name}` : `${user.first_name}`}
            </Text>
            )
          }
          <Text style={{ color: 'white', fontSize: 12 }}>
            {
              user
              && capitalizeFirstLetter(user.role)
            }
          </Text>
          <View style={{
            flexDirection: 'row', justifyContent: 'flex-end', flex: 1
          }}
          >
            <Text style={{
              color: 'white', fontSize: 16, fontWeight: 'bold'
            }}
            >
              STEP
              {' '}
              {this.state.position}
/5
            </Text>
          </View>
        </View>
        <View style={styles.dataContainer}>
          <View style={styles.mainDataContainer}>
            {this.updateCurrentScreen()}
          </View>
        </View>
        <View style={styles.footerView}>
          <View style={styles.privacyPolicyView}>
            {/*             <ButtonWithPlainText
              title="Privacy Policy"
              style={{ backgroundColor: 'transparent' }}
              textStyle={{ fontSize: 10 }}
              handleSubmit={this.privacyPolicyBtnAction}
            />
            <View style={styles.seperatorView} />
            <ButtonWithPlainText
              title="Terms & Conditions"
              style={{ backgroundColor: 'transparent' }}
              textStyle={{ fontSize: 10 }}
              handleSubmit={this.termsAndConditionBtnAction}
            /> */}
          </View>
          <View style={styles.logoView}>
            <Text style={{ color: 'white', fontSize: 10 }}>
          Powered by
            </Text>
            <Image
              style={styles.logoImage}
              source={instaBikeLogo}
            />
          </View>
        </View>
      </View>
    );
  }
}
export default OnboardingScreen;
