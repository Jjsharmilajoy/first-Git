/**
 * The Test ride timing screen renders during onboarding. It collects
 * the test ride timings of the dealership. Dealer manager has permission to
 * edit this screen.
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  View, Text, TouchableOpacity, TimePickerAndroid, Picker, Alert
} from 'react-native';
import styles from './testRideTimingsStyles';
import testRideTimings from '../../redux/actions/TestRideTimings/actionCreators';
import ContinueSectionScreen from '../../components/ContinueSection/ContinueSectionScreen';

@connect(state => ({
  user: state.user.currentUser,
  testRidedata: state.rideTimings.data
}), { testRideTimings })

export default class TestRideTimingsScreen extends Component {
  static propTypes = {
    testRideTimings: PropTypes.func.isRequired,
    changeStep: PropTypes.func.isRequired,
    dealer: PropTypes.object,
    user: PropTypes.object.isRequired,
    previousStep: PropTypes.func.isRequired
  }

  static defaultProps = {
    dealer: {}
  }

  constructor(props) {
    super(props);
    this.state = {
      weekdays: this.props.dealer.weekly_holiday || '',
      daysCalculate: [
        {
          id: 1,
          daySlots: 'Monday - Friday',
          startTime: this.splittedTime(this.props.dealer.monday_friday_start, 'startTime', 0),
          endTime: this.splittedTime(this.props.dealer.monday_friday_end, 'endTime', 0),
          methodCall: (param, index) => { this.handleDatePicker(param, index); }
        },
        {
          id: 2,
          daySlots: 'Saturday',
          startTime: this.splittedTime(this.props.dealer.saturday_start, 'startTime', 1),
          endTime: this.splittedTime(this.props.dealer.saturday_end, 'endTime', 1),
          methodCall: (param, index) => { this.handleDatePicker(param, index); }
        },
        {
          id: 3,
          daySlots: 'Sunday',
          startTime: this.splittedTime(this.props.dealer.sunday_start, 'startTime', 2),
          endTime: this.splittedTime(this.props.dealer.sunday_end, 'endTime', 2),
          methodCall: (param, index) => { this.handleDatePicker(param, index); }
        }
      ],
      mondayFridayStart: '',
      mondayFridayEnd: '',
      saturdayStart: '',
      saturdayEnd: '',
      sundayStart: '',
      sundayEnd: '',
      mondayFridayStartValue: this.props.dealer && this.props.dealer.monday_friday_start !== ''
        ? this.props.dealer.monday_friday_start : '',
      mondayFridayEndValue: this.props.dealer && this.props.dealer.monday_friday_end !== ''
        ? this.props.dealer.monday_friday_end : '',
      saturdayStartValue: this.props.dealer && this.props.dealer.saturday_start !== ''
        ? this.props.dealer.saturday_start : '',
      saturdayEndValue: this.props.dealer && this.props.dealer.saturday_end !== ''
        ? this.props.dealer.saturday_end : '',
      sundayStartValue: this.props.dealer && this.props.dealer.sunday_start !== ''
        ? this.props.dealer.sunday_start : '',
      sundayEndValue: this.props.dealer && this.props.dealer.sunday_end !== ''
        ? this.props.dealer.sunday_end : ''
    };
  }

  getCurrentTime = (hour, minute, meridian, slot, param) => {
    if (typeof (minute) === 'number' && minute.toString().length === 1) {
      minute = (`0${minute}`).substring(0, 2);
    }
    switch (slot) {
      case 'Monday - Friday':
        if (param === 'startTime') {
          this.state.mondayFridayStart = `${hour}:${minute} ${meridian}`;
        } else {
          this.state.mondayFridayEnd = `${hour}:${minute} ${meridian}`;
        }
        return `${hour}:${minute} ${meridian}`;
      case 'Saturday':
        if (param === 'startTime') {
          this.state.saturdayStart = `${hour}:${minute} ${meridian}`;
        } else {
          this.state.saturdayEnd = `${hour}:${minute} ${meridian}`;
        }
        return `${hour}:${minute} ${meridian}`;
      case 'Sunday':
        if (param === 'startTime') {
          this.state.sundayStart = `${hour}:${minute} ${meridian}`;
        } else {
          this.state.sundayEnd = `${hour}:${minute} ${meridian}`;
        }
        return `${hour}:${minute} ${meridian}`;
      default:
        this.state.saturdayStart = `${hour}:${minute} ${meridian}`;
    }
  }

  getNumber = value => parseInt(value, 10)

  splittedTime = recievedTime => {
    if (recievedTime === null || recievedTime === '') {
      const hour = '00';
      const minute = '00';
      return this.initialCalculate(parseInt(hour, 10), parseInt(minute, 10));
    }
    const splittedByColon = recievedTime ? recievedTime.split(':') : '';
    const hour = splittedByColon[0];
    const minute = splittedByColon[1];
    return this.initialCalculate(parseInt(hour, 10), parseInt(minute, 10));
  }

  handleDatePicker = (param, index) => {
    TimePickerAndroid.open({
      is24Hour: false,
    }).then(({ action, hour, minute }) => {
      // save here
      if (action !== TimePickerAndroid.dismissedAction) {
        this.deriveDataToSend(index, param, hour, minute);
        this.calculateTime(param, index, hour, minute);
      }
    }).catch(() => {
      console.alert('Cannot open time picker. Please try it again.');
    });
  }

  initialCalculate = (hour, minute) => {
    let meridian;
    if (hour > 12) {
      meridian = 'pm';
      hour -= 12;
    } else if (hour === 0) {
      meridian = 'am';
      hour = 12;
    } else if (hour === 12) {
      meridian = 'pm';
      hour = 12;
    } else if (hour < 12) {
      meridian = 'am';
    }
    if (minute === '00') {
      minute = '0';
    }
    return {
      hour,
      minute,
      meridian
    };
  }

  validateTime = index => {
    let start = [];
    let end = [];
    const {
      mondayFridayStartValue,
      mondayFridayEndValue,
      saturdayStartValue,
      saturdayEndValue,
      sundayStartValue,
      sundayEndValue
    } = this.state;
    switch (index) {
      case 0:
        start = mondayFridayStartValue.split(':');
        end = mondayFridayEndValue.split(':');
        break;
      case 1:
        start = saturdayStartValue.split(':');
        end = saturdayEndValue.split(':');
        break;
      case 2:
        start = sundayStartValue.split(':');
        end = sundayEndValue.split(':');
        break;
      default:
        break;
    }
    if (this.getNumber(start[0]) < this.getNumber(end[0])) {
      return true;
    } if (this.getNumber(start[0]) > this.getNumber(end[0])) {
      return false;
    } if (this.getNumber(start[0]) === this.getNumber(end[0])) {
      if (this.getNumber(start[1]) < this.getNumber(end[1])) {
        return true;
      } if (this.getNumber(start[1]) >= this.getNumber(end[1])) {
        return false;
      }
    }
    return false;
  }

  calculateTime = (param, index, hour, minute) => {
    if (this.validateTime(index)) {
      if (this.state.daysCalculate && this.state.daysCalculate.length > 0) {
        if (hour > 12) {
          this.state.daysCalculate[index][param].meridian = 'pm';
          hour -= 12;
        } else if (hour === 0) {
          this.state.daysCalculate[index][param].meridian = 'am';
          hour = 12;
        } else if (hour === 12) {
          this.state.daysCalculate[index][param].meridian = 'pm';
          hour = 12;
        } else if (hour < 12) {
          this.state.daysCalculate[index][param].meridian = 'am';
        }
        if (minute === '00') {
          minute = '0';
        }
        this.state.daysCalculate[index][param].hour = hour;
        this.state.daysCalculate[index][param].minute = minute;
        this.setState({
          daysCalculate: this.state.daysCalculate
        });
      }
    } else {
      Alert.alert(
        '',
        'Please choose a valid start and end time.',
        [
          {
            text: 'OK',
            onPress: () => {}
          },
        ],
        { cancelable: false }
      );
    }
  }

  deriveDataToSend = (position, param, hour, minute) => {
    let {
      mondayFridayStartValue,
      mondayFridayEndValue,
      saturdayStartValue,
      saturdayEndValue,
      sundayStartValue,
      sundayEndValue
    } = this.state;
    if (minute || minute === 0) {
      if (minute.toString().length === 1) {
        minute = `0${minute}`;
      } else if (minute.toString().length === 2 && minute.toString() === '00') {
        minute = '00';
      }
    }
    switch (position) {
      case 0:
        if (param === 'startTime') {
          mondayFridayStartValue = `${hour}:${minute}`;
        } else {
          mondayFridayEndValue = `${hour}:${minute}`;
        }
        this.setState({
          mondayFridayStartValue,
          mondayFridayEndValue
        });
        break;
      case 1:
        if (param === 'startTime') {
          saturdayStartValue = `${hour}:${minute}`;
        } else {
          saturdayEndValue = `${hour}:${minute}`;
        }
        this.setState({
          saturdayStartValue,
          saturdayEndValue
        });
        break;
      case 2:
        if (param === 'startTime') {
          sundayStartValue = `${hour}:${minute}`;
        } else {
          sundayEndValue = `${hour}:${minute}`;
        }
        this.setState({
          sundayStartValue,
          sundayEndValue
        });
        break;
      default:
        break;
    }
  }

  updateDays = weekdays => {
    this.setState({
      weekdays
    });
  }

  handleSubmit = () => {
    const holiday = this.state.weekdays;
    const { user } = this.props;
    const data = {
      id: user.dealerId,
      monday_friday_start: this.state.mondayFridayStartValue,
      monday_friday_end: this.state.mondayFridayEndValue,
      saturday_start: this.state.saturdayStartValue,
      saturday_end: this.state.saturdayEndValue,
      sunday_start: this.state.sundayStartValue,
      sunday_end: this.state.sundayEndValue,
      weekly_holiday: holiday
    };
    this.props.testRideTimings(data).then(() => {
      this.props.changeStep(5);
    }, err => {
      console.log(err);
    });
  }

  backBtnAction = () => {
    this.props.previousStep(3);
  }

  render() {
    const { daysCalculate } = this.state;
    return (
      <View style={styles.container}>
        <View style={styles.bodyLayout}>
          <View style={styles.innerLayout}>
            <View style={styles.innerSection}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.title]}>Test Ride Timings</Text>
              </View>
            </View>
            <View style={styles.timingsSection}>
              { daysCalculate && daysCalculate.map((days, index) => (
                <View style={styles.timingSelect} key={days.id}>
                  <View style={styles.weekDays}>
                    <Text style={styles.weekDaysTitle}>
                      {' '}
                      { days.daySlots }
                      {' '}
                    </Text>
                  </View>
                  <View>
                    <TouchableOpacity>
                      <Text
                        onPress={() => days.methodCall('startTime', index)}
                        style={styles.timeSlot}
                        >
                        {this.getCurrentTime(
                          days.startTime.hour,
                          days.startTime.minute,
                          days.startTime.meridian,
                          days.daySlots,
                          'startTime'
                        )}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <View>
                    <Text> to </Text>
                  </View>
                  <View>
                    <TouchableOpacity>
                      <Text
                        onPress={() => days.methodCall('endTime', index)}
                        style={styles.timeSlot}
                        >
                        {this.getCurrentTime(
                          days.endTime.hour,
                          days.endTime.minute,
                          days.endTime.meridian,
                          days.daySlots,
                          'endTime'
                        )}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
              }
            </View>
            <View style={styles.weeklyHoliday}>
              <View>
                <Text style={styles.weekDaysTitle}>Holiday on</Text>
              </View>
              <View style={styles.dropDown}>
                <Picker
                  selectedValue={this.state.weekdays}
                  style={styles.dayPicker}
                  mode="dropdown"
                  onValueChange={this.updateDays}
                >
                  <Picker.Item label="Monday" value="Monday" />
                  <Picker.Item label="Tuesday" value="Tuesday" />
                  <Picker.Item label="Wednesday" value="Wednesday" />
                  <Picker.Item label="Thursday" value="Thursday" />
                  <Picker.Item label="Friday" value="Friday" />
                  <Picker.Item label="Saturday" value="Saturday" />
                  <Picker.Item label="Sunday" value="Sunday" />
                  <Picker.Item label="None" value="none" />
                </Picker>
              </View>
            </View>
            <View style={{ backgroundColor: 'white', height: 70 }}>
              <ContinueSectionScreen
                style={styles.continueBtnAction}
                continueBtnAction={this.handleSubmit}
                backBtnAction={this.backBtnAction}
              />
            </View>
          </View>
        </View>
      </View>
    );
  }
}
