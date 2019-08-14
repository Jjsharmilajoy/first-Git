/**
 * The Test Ride Date selection renders the different avaliable dates and
 * time slots for the selected date to book test ride for a vehicle.
 */
import React, { Component } from 'react';
import
{
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert
} from 'react-native';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import moment from 'moment';
import styles from './testRideDateStyles';
import { getTestRideDates, getTestRideSlots, clearTestRideSlots } from '../../../redux/actions/TestRide/actionCreators';
import { ButtonWithLeftImage, BookTestRideButton } from '../../../components/button/Button';
import backButton from '../../../assets/images/backArrow.png';
import Loader from '../../../components/loader/Loader';
import AppHeader from '../../../components/header/Header';
import TestRideHeader from '../TestRideHeader/testRideHeader';
import { disableButton } from '../../../redux/actions/Global/actionCreators';

const SATURDAY = 'Saturday';
const SUNDAY = 'Sunday';

@connect(state => ({
  loading: state.testRide.loadingGroup,
  dealerId: state.user.currentUser.dealerId,
  testRideDates: state.testRide.testRideDates,
  testRideSlots: state.testRide.testRideSlots,
  buttonState: state.global.buttonState
}), {
  getTestRideDates,
  getTestRideSlots,
  clearTestRideSlots,
  disableButton
})
export default class TestRideDateSelection extends Component {
  static propTypes = {
    getTestRideDates: PropTypes.func.isRequired,
    getTestRideSlots: PropTypes.func.isRequired,
    clearTestRideSlots: PropTypes.func.isRequired,
    loading: PropTypes.bool.isRequired,
    dealerId: PropTypes.string.isRequired,
    testRideDates: PropTypes.object,
    navigation: PropTypes.object.isRequired,
    disableButton: PropTypes.func.isRequired,
    buttonState: PropTypes.bool.isRequired
  }

  static defaultProps = {
    testRideDates: {},
  }

  constructor(props) {
    super(props);
    this.state = {
      lead: {
        ...this.props.navigation.state.params.lead
      },
      dateSelectedIndex: -1,
      slotSelectedIndex: null,
      refreshList: false,
      testRideSlots: {},
      leadDetail: this.props.navigation.state.params.leadDetail
    };
  }

  static getDerivedStateFromProps(nextProps) {
    if (nextProps.testRideSlots && nextProps.navigation.state.params.leadDetail) {
      const {
        testRideSlots, navigation
      } = nextProps;
      if (navigation.state.params.lead && navigation.state.params.leadDetail) {
        return {
          testRideSlots,
          lead: navigation.state.params.lead,
          leadDetail: navigation.state.params.leadDetail,
          source: navigation.state.params.source
        };
      }
    }
    return null;
  }

  componentDidMount() {
    const { navigation } = this.props;
    const { leadDetail } = navigation.state.params;
    try {
      if (this.props.dealerId && this.props.dealerId.length > 0 && leadDetail) {
        this.props.getTestRideDates(this.props.dealerId, leadDetail.vehicle_id);
      }
    } catch (error) {
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
    }
  }

  componentWillUnmount() {
    this.props.clearTestRideSlots();
  }

  getSlotsAsPerDate = item => {
    let day;
    const { leadDetail } = this.state;
    if (leadDetail) {
      if (item.day_name === SATURDAY) {
        day = 'saturday';
      } else if (item.day_name === SUNDAY) {
        day = 'sunday';
      } else {
        day = 'monday_friday';
      }

      const slotData = {
        day_name: day,
        date: moment(item.days).format('YYYY-MM-DD'),
        test_ride_vehicle: item.test_ride_vehicle
      };
      this.props.getTestRideSlots(this.props.dealerId, leadDetail.vehicle_id, slotData)
        .then(() => {
        })
        .catch(error => {
          console.log(error);
        });
    }
  }

  calculateSlotAvailable = item => item.total_slots - parseInt(item.total_booked, 10)

  continueToBookTestRide = () => {
    let { leadDetail } = this.state;
    const { navigation } = this.props;
    if (this.state.dateSelectedIndex >= 0 && leadDetail.test_ride_on) {
      leadDetail = {
        ...this.state.leadDetail,
        booked_on: new Date(),
        test_ride_status: 200
      };
      navigation.navigate('RideSummary', {
        lead: this.state.lead,
        leadDetail,
        source: this.state.source
      });
      this.props.disableButton();
    } else {
      Alert.alert(
        '',
        'Select a date and a time-slot',
        [
          {
            text: 'Ok',
            onPress: () => {},
          }
        ],
        { cancelable: false }
      );
    }
  }

  gotoPrevious = () => {
    this.props.disableButton();
    const { navigation } = this.props;
    navigation.goBack();
  }

  renderSlotItem = (item, index) => {
    const { testRideSlots } = this.state;
    const availableSlots = testRideSlots.vehiclePerSlot * testRideSlots.slots.length;
    const doesSlotNotAvailable = parseInt(testRideSlots.vehiclePerSlot, 10) <= parseInt(item.booked_count, 10);
    const available = availableSlots - (item.booked_count !== null ? parseInt(item.booked_count, 10) : 0)
      - (item.ended_slot !== null ? parseInt(item.ended_slot, 10) : 0);
    return (
      (available !== 0) ?
        <TouchableOpacity
          disabled={doesSlotNotAvailable || moment().utc('+5:30').isSameOrAfter(item.slotTo)}
          onPress={() => {
            this.setState({
              slotSelectedIndex: index,
              refreshList: !this.state.refreshList,
              leadDetail: {
                ...this.state.leadDetail,
                test_ride_on: testRideSlots.slots[index].slotFrom
              }
            });
          }}
          style={[(this.state.slotSelectedIndex === index)
            ? styles.slotSelectedView :
            (doesSlotNotAvailable || moment().utc('+5:30').isSameOrAfter(item.slotTo) ?
              [styles.slotView, styles.disabled] : styles.slotView)
          ]}>
          <Text style={styles.day}>
            {`${moment(item.slotFrom).utc().format('h:mm a')}` +
            ` - ${moment(item.slotTo).utc().format('h:mm a')}`}
          </Text>
        </TouchableOpacity>
        :
        null
    );
  }

  renderDate = (item, index) => {
    if (item.is_holiday) {
      return (
        <TouchableOpacity
          disabled
          style={[styles.dateView, styles.disabled]}
        >
          <Text style={styles.day}>{item.day_name}</Text>
          <Text style={styles.date}>{moment(item.days).format('DD')}</Text>
          <Text style={styles.slotStatus}>Holiday</Text>
        </TouchableOpacity>
      );
    }
    return (
      <TouchableOpacity
        onPress={() => {
          this.setState({ dateSelectedIndex: index, slotSelectedIndex: null });
          this.getSlotsAsPerDate(item);
        }}
        style={(this.state.dateSelectedIndex === index)
          ? styles.dateSelectedView : styles.dateView}>
        <Text style={styles.day}>{item.day_name}</Text>
        <Text style={styles.date}>{moment(item.days).format('DD')}</Text>
        <Text style={styles.slotStatus}>{this.calculateSlotAvailable(item)} Slots Left</Text>
      </TouchableOpacity>
    );
  }

  render() {
    const { testRideSlots, lead } = this.state;
    return (
      <View style={styles.container}>
        <Loader showIndicator={this.props.loading} />
        <AppHeader
          isLeadExists={false}>
          <TestRideHeader lead={lead} />
        </AppHeader>
        <View style={styles.headerView}>
          <Text style={styles.selectDate}>Select a date</Text>
        </View>
        <View style={styles.mainView}>
          <View>
            <Text style={styles.testRideLabel}>Select Date</Text>
            <ScrollView horizontal contentContainerStyle={{ alignItems: 'center', paddingVertical: 5 }}>
              {

             (this.props.testRideDates && this.props.testRideDates.testRideData
              && this.props.testRideDates.testRideData.length > 0) ?
               this.props.testRideDates.testRideData.map((item, index) => (
                 this.renderDate(item, index)
               ))
               :
               <View style={{ height: 90 }} />
          }
            </ScrollView>
          </View>
          {/*           <Text style={[styles.slotStatus]}>
            {
              Number.isNaN(this.calculateSlotAvailable()) ?
                null
                :
                `${this.calculateSlotAvailable()} Slots Left`
            }
          </Text> */}
          {
            (testRideSlots && testRideSlots.slots
              && testRideSlots.slots.length > 0) ?
                <View>
                  <Text style={styles.testRideLabel}>Select Slot</Text>
                  <View style={styles.slotWrapper}>
                    <FlatList
                      data={testRideSlots.slots}
                      renderItem={({ item, index }) =>
                        this.renderSlotItem(item, index)}
                      numColumns={6}
                      extraData={this.state.refreshList}
                    />
                  </View>
                </View>
              :
              null
          }
        </View>
        <View style={styles.footerView}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 40 }}>
            <ButtonWithLeftImage
              disabled={this.props.buttonState}
              image={backButton}
              style={[styles.backButtonStyle, { flex: 0.1 }]}
              textStyle={styles.backButtonTextStyle}
              title=" Back"
              handleSubmit={this.gotoPrevious}
            />
            <BookTestRideButton
              disabled={this.props.buttonState}
              title="Continue"
              buttonStyle={{ width: 150 }}
              handleSubmit={this.continueToBookTestRide}
              />
          </View>
        </View>
      </View>
    );
  }
}
