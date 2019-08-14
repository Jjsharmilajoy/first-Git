/**
 * This is the parent component that controls the Finance onboarding.
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  View, TouchableOpacity, Image
} from 'react-native';
import { connect } from 'react-redux';
import { NavigationActions } from 'react-navigation';
import SalaryDetailsScreen from './SalaryDetailsScreen';
import DomicileStatusScreen from './DomicileStatusScreen';
// import OfferPreferenceScreen from './OfferpreferenceScreen';
import StepperScreen from '../../components/Stepper/StepperScreen';

@connect(state => ({
  currentUser: state.user.currentUser,
  lead: state.global.lead
}), {
})
class FinanceOnboardingScreen extends Component {
  static propTypes = {
    navigation: PropTypes.object.isRequired,
    lead: PropTypes.object.isRequired
  }

  constructor(props) {
    super(props);
    this.state = {
      position: this.props.navigation.state.params.position,
      lead: this.props.lead,
      stepNameList: ['Salary Details', 'Domicile Status'/* , 'Select Offer' */]
    };
  }

  componentDidMount() {
    this.willFocusSubscription = this.props.navigation.addListener(
      'willFocus',
      () => {
      }
    );
  }

  componentWillUnmount() {
    this.willFocusSubscription.remove();
  }

  continueBtnAction = updatedLead => {
    const { lead } = this.state;
    if (updatedLead && Object.keys(updatedLead).length !== 0) {
      this.setState({
        position: this.state.position += 1,
        lead: updatedLead
      });
    } else {
      this.setState({
        position: this.state.position += 1,
        lead
      });
    }
  }

  backBtnAction = () => {
    this.setState({ position: this.state.position -= 1 });
    if (this.state.position < 0) {
      const {
        navigate
      } = this.props.navigation;
      navigate('Dashboard');
    }
  }

  render() {
    const { position, lead } = this.state;
    return (
      <View style={{ flex: 1 }}>
        <View style={{
          flex: 1,
          flexDirection: 'column',
          elevation: 10,
          backgroundColor: '#fff'
        }}
        >
          <View style={{
            flex: 1.8, elevation: 1, backgroundColor: '#fff', paddingHorizontal: 5, zIndex: 1
          }}
          >
            <StepperScreen position={this.state.position} stepNameList={this.state.stepNameList} />
            <View style={{
              position: 'absolute', top: 0, right: 0, zIndex: 99
            }}
            >
              <TouchableOpacity
                onPress={() => {
                  this.props.navigation.dispatch(NavigationActions.back());
                }}
                activeOpacity={0.5}
              >
                <Image
                  resizeMode="contain"
                  source={require('../../assets/images/close.png')}
                />
              </TouchableOpacity>
            </View>
          </View>
          <View style={{ flex: 8.2 }}>
            {
              position === 0
              && (
              <SalaryDetailsScreen
                handleOnContinue={this.continueBtnAction}
                navigation={this.props.navigation}
                lead={lead}
                />
              )
            }
            {
              position === 1
              && (
              <DomicileStatusScreen
                handleOnContinue={this.continueBtnAction}
                navigation={this.props.navigation}
                lead={lead}
                handleOnBack={this.backBtnAction}
                />
              )
            }
          </View>
        </View>
      </View>
    );
  }
}

export default FinanceOnboardingScreen;
