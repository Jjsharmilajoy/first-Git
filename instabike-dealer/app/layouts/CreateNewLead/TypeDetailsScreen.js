/**
 * Type Details Screen
 * The Type Details Screen collects user's choice of interest in vehicle while creating
 * lead.
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  View, Text, Image, TouchableHighlight, Dimensions
} from 'react-native';
import styles from './typeDetailsStyles';
import { isStringEmpty } from '../../utils/validations';
import { BookTestRideButton } from '../../components/button/Button';
import constants from '../../utils/constants';

let bikeThumbnail = require('../../assets/images/suzuki/bike.png');
if (constants.manufacturer === 'hero') {
  bikeThumbnail = require('../../assets/images/hero/bike.png');
} else if (constants.manufacturer === 'flash') {
  bikeThumbnail = require('../../assets/images/flash/bike.png');
}

let scooterThumbnail = require('../../assets/images/suzuki/scooter.png');
if (constants.manufacturer === 'hero') {
  scooterThumbnail = require('../../assets/images/hero/scooter.png');
} else if (constants.manufacturer === 'flash') {
  scooterThumbnail = require('../../assets/images/flash/scooter.png');
}

const DEVICE_WIDTH = Dimensions.get('screen').width;

class TypeDetailsScreen extends Component {
  static propTypes = {
    handleOnContinue: PropTypes.func.isRequired,
    lead: PropTypes.object,
    disableButton: PropTypes.func.isRequired,
    buttonState: PropTypes.bool.isRequired
  }

  static defaultProps = {
    lead: {},
  }

  constructor(props) {
    super(props);
    this.state = {
      typeFieldError: false,
      lead: {
        ...this.props.lead,
        search_criteria_type: this.props.lead && this.props.lead.search_criteria_type ? this.props.lead.search_criteria_type : '0'
      }
    };
  }

  gotoBudget = () => {
    this.props.disableButton();
    const { lead } = this.state;
    if (lead.search_criteria_type) {
      const isTypeSelected = !isStringEmpty(lead.search_criteria_type);
      if (isTypeSelected) {
        this.props.handleOnContinue(lead);
      }
      this.setState({
        typeFieldError: !isTypeSelected
      });
    } else {
      this.setState({
        typeFieldError: true
      });
    }
  }

  selectVehicleType = value => {
    const { lead } = this.state;
    this.setState({
      typeFieldError: false,
      lead: { ...lead, search_criteria_type: value }
    });
  }

  render() {
    const { lead, typeFieldError } = this.state;
    return (
      <View style={styles.container}>
        <View style={{ flex: 1, flexDirection: 'column' }}>
          <View style={{
            flex: 7, flexDirection: 'row', margin: 50
          }}
          >
            <TouchableHighlight
              style={lead.search_criteria_type === '0' ? [styles.selectedCard, styles.bikeCard] : styles.bikeCard}
              underlayColor="#ffff"
              onPress={() => this.selectVehicleType('0')}
            >
              <View style={{ alignItems: 'center' }}>
                <Image
                  source={bikeThumbnail}
                  activeOpacity={0.5}
                  resizeMode="contain"
                  style={(DEVICE_WIDTH >= 640 && DEVICE_WIDTH <= 760) && { width: 90, height: 90 }} />
                <Text style={styles.cardText}>
Bike
                </Text>
              </View>
            </TouchableHighlight>
            <TouchableHighlight
              style={lead.search_criteria_type === '1' ? [styles.selectedCard, styles.scooterCard] : styles.scooterCard}
              underlayColor="#ffff"
              onPress={() => this.selectVehicleType('1')}>
              <View style={{ alignItems: 'center' }}>
                <Image
                  source={scooterThumbnail}
                  activeOpacity={0.5}
                  resizeMode="contain"
                  style={(DEVICE_WIDTH >= 640 && DEVICE_WIDTH <= 760) && { width: 90, height: 90 }}
                />
                <Text style={styles.cardText}>
Scooter
                </Text>
              </View>
            </TouchableHighlight>
          </View>
          {
            typeFieldError
              ? (
                <Text style={[styles.errorTextStyle]}>
Please select vehicle type.
                </Text>
              )
              : <Text style={styles.errorTextStyle} />
            }
          <View style={styles.continueBtnContainer}>
            <View style={{ flex: 1, flexDirection: 'row-reverse', alignItems: 'flex-end' }}>
              <BookTestRideButton
                title="CONTINUE"
                handleSubmit={this.gotoBudget}
                disabled={this.props.buttonState}
              />
            </View>
          </View>
        </View>
      </View>
    );
  }
}

export default TypeDetailsScreen;
