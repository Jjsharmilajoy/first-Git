/**
 * A test ride booking confirmation screen that is shown before
 * confirming to book test ride.
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import
{
  View,
  Text,
  Image,
  Alert
} from 'react-native';
import { connect } from 'react-redux';
import { NavigationActions, StackActions } from 'react-navigation';
import moment from 'moment';
import styles from './rideSummaryStyles';
import { BookTestRideButton, SecondaryButton }
  from '../../../components/button/Button';
import { updateTestRideStatus } from '../../../redux/actions/TestRide/actionCreators';
import { updateClickedPosition, setLead, disableButton } from '../../../redux/actions/Global/actionCreators';
import { resetScreens } from '../../../actions/stackActions';
import Loader from '../../../components/loader/Loader';
import AppHeader from '../../../components/header/Header';
import TestRideHeader from '../TestRideHeader/testRideHeader';

@connect(state => ({
  loading: state.testRide.loadingGroup,
  buttonState: state.global.buttonState
}), {
  updateTestRideStatus,
  updateClickedPosition,
  setLead,
  disableButton
})
export default class StartTestRide extends Component {
  static propTypes = {
    updateTestRideStatus: PropTypes.func.isRequired,
    updateClickedPosition: PropTypes.func.isRequired,
    setLead: PropTypes.func.isRequired,
    loading: PropTypes.bool.isRequired,
    navigation: PropTypes.object.isRequired,
    buttonState: PropTypes.bool.isRequired,
    disableButton: PropTypes.func.isRequired
  }

  constructor(props) {
    super(props);
    const { lead, leadDetail, source } = props.navigation.state.params;
    this.state = {
      lead,
      leadDetail,
      source
    };
  }

  gotoTestRide = async () => {
    try {
      const { navigation } = this.props;
      await this.props.updateClickedPosition(5);
      const resetAction = resetScreens({
        index: 0,
        actions: [NavigationActions.navigate({
          routeName: 'Dashboard'
        })],
      });
      navigation.dispatch(resetAction);
    } catch (error) {
      console.log(error);
    }
  }

  confirmTestRideBooking = () => {
    console.log('confirm test ride bookinig:::');
    this.props.disableButton();
    const { leadDetail, source, lead } = this.state;
    const { navigation } = this.props;
    this.props.updateTestRideStatus(leadDetail.id, leadDetail).then(async () => {
      const { lead_details } = lead;
      lead_details[lead_details.findIndex(item => item.id === leadDetail.id)] = leadDetail;
      await this.props.setLead(lead);
      if (source === 'Vehicle-Enquired') {
        navigation.pop(3);
        navigation.navigate('LeadHistory', { leadId: lead.id });
      } else if (source === 'Price-Breakdown') {
        navigation.pop(3);
      } else {
        this.gotoTestRide();
      }
    }, error => {
      if (error && error.err && !error.err.message.includes('invalidaccesstoken')) {
        Alert.alert(
          `${error.err.name}`,
          `${error && error.err ? error.err.message : ''}`,
          [
            {
              text: 'Ok',
              onPress: () => {
                const popAction = StackActions.pop({
                  n: 2,
                });
                this.props.navigation.dispatch(popAction);
              }
            }
          ],
          { cancelable: false }
        );
      }
    });
  }

  cancelBooking = () => {
    const popAction = StackActions.pop({
      n: 3,
    });
    this.props.navigation.dispatch(popAction);
  }

  render() {
    const { lead, leadDetail } = this.state;
    return (
      <View style={{ flex: 1 }}>
        <Loader showIndicator={this.props.loading} />
        <AppHeader
          isLeadExists={false}>
          <TestRideHeader lead={this.state.lead} />
        </AppHeader>
        <View style={styles.container}>
          <View style={styles.bikeSection}>
            <Text style={styles.bikeName}>Test Ride Of {leadDetail.vehicle.name}</Text>
            <View style={{ width: 400, height: 250 }}>
              <Image
                style={{ width: 400, height: 250 }}
                source={{ uri: leadDetail.vehicle.image_url }}
                resizeMode="center"
            />
            </View>
            <Text style={styles.userName}>For {lead.name} is scheduled on</Text>
            <Text style={styles.testRideTime}>
              {`${moment(leadDetail.test_ride_on).utc().format('DD-MMM-YYYY')} ${moment(leadDetail.test_ride_on).utc().format('h:mm a')} - ${moment(leadDetail.test_ride_on).add(30, 'minutes').utc().format('h:mm a')}`}
            </Text>
          </View>
          <View style={styles.footerSection}>
            <SecondaryButton
              disabled={this.props.loading}
              title="Cancel Booking"
              buttonStyle={{ marginHorizontal: 10 }}
              handleSubmit={this.cancelBooking}
            />
            <BookTestRideButton
              disabled={this.props.loading || this.props.buttonState}
              title="CONFIRM"
              handleSubmit={this.confirmTestRideBooking}
              buttonStyle={{ width: 150 }} />
          </View>
        </View>
      </View>
    );
  }
}
