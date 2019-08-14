/**
 * Create New Lead
 * This file is the parent component and it renders the other steps
 * of lead creation
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  View, TouchableOpacity, Image
} from 'react-native';
import { connect } from 'react-redux';
import TypeDetailsScreen from './TypeDetailsScreen';
import BudgetDetailsScreen from './BudgetDetailsScreen';
import BasicDetailsScreen from './BasicDetailsScreen';
import StepperScreen from '../../components/Stepper/StepperScreen';
import { clearLead, disableButton } from '../../redux/actions/Global/actionCreators';

@connect(state => ({
  currentUser: state.user.currentUser,
  buttonState: state.global.buttonState
}), {
  clearLead,
  disableButton
})
class CreateNewLeadScreen extends Component {
  static propTypes = {
    navigation: PropTypes.object.isRequired,
    clearLead: PropTypes.func.isRequired,
    currentUser: PropTypes.object.isRequired,
    disableButton: PropTypes.func.isRequired,
    buttonState: PropTypes.bool.isRequired
  }

  constructor(props) {
    super(props);
    this.state = {
      position: 0,
      lead: {},
      dealerId: this.props.currentUser.dealerId,
      stepNameList: ['Basic Details', 'Type', 'Budget']
    };
  }

  componentDidMount() {
    this.props.clearLead();
    this.willFocusSubscription = this.props.navigation.addListener(
      'willFocus',
      () => {
        this.props.clearLead();
      }
    );
  }

  componentWillUnmount() {
    this.props.clearLead();
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
    const { position, dealerId, lead } = this.state;
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
                  this.props.navigation.goBack();
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
              <BasicDetailsScreen
                handleOnContinue={this.continueBtnAction}
                navigation={this.props.navigation}
                dealerId={dealerId}
                />
              )
            }
            {
              position === 1
              && (
              <TypeDetailsScreen
                handleOnContinue={this.continueBtnAction}
                lead={lead}
                handleOnBack={this.backBtnAction}
                buttonState={this.props.buttonState}
                disableButton={this.props.disableButton}
                />
              )
            }
            {
              position === 2
              && (
              <BudgetDetailsScreen
                handleOnContinue={this.continueBtnAction}
                handleOnBack={this.backBtnAction}
                lead={lead}
                navigation={this.props.navigation}
                dealerId={dealerId}
                buttonState={this.props.buttonState}
                disableButton={this.props.disableButton}
                />
              )
            }
          </View>
        </View>
      </View>
    );
  }
}

export default CreateNewLeadScreen;
