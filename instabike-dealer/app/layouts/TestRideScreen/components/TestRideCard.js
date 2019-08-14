import React, { Component } from 'react';
import { View, Text, Dimensions, TouchableOpacity } from 'react-native';
import PropTypes from 'prop-types';
import moment from 'moment';
import SimpleLineIcon from 'react-native-vector-icons/SimpleLineIcons';
import { connect } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import { ButtonWithLeftImage } from '../../../components/button/Button';
import testRideCardStyles from './testRideCardStyles';

const DEVICE_WIDTH = Dimensions.get('screen').width;

const status = {
  SCHEDULED: 200,
  ONGOING: 300,
  COMPLETED: 400,
  CANCELLED: 500
};

@connect(state => ({
  updateResponse: state.followUpLeads.updateResponse,
}), {

})

class TestRideCard extends Component {
  static propTypes = {
    item: PropTypes.object.isRequired,
    widthOfCard: PropTypes.number,
    startTestRide: PropTypes.func,
    rescheduleTestRide: PropTypes.func,
    completeTestRide: PropTypes.func,
    cancelTestRide: PropTypes.func
  }

  static defaultProps = {
    widthOfCard: 0,
    startTestRide: null,
    rescheduleTestRide: null,
    completeTestRide: null,
    cancelTestRide: null
  }

  constructor(props) {
    super(props);
    this.state = ({
    });
  }

  doesTestRideBookedToday = () => {
    const { item } = this.props;
    const currentDate = moment().format('YYYY-MM-DD');
    const itemDate = moment(item.test_ride_on).utc().format('YYYY-MM-DD');
    return moment(itemDate).isSame(currentDate);
  }

  render() {
    const { item } = this.props;
    const startTestRide = this.doesTestRideBookedToday();
    return (
      <View style={[
        this.props.widthOfCard !== 0 && {
          width: this.props.widthOfCard,
        },
        testRideCardStyles.cardContainer]}>
        <View style={testRideCardStyles.cardWrapper}>
          {
          item && item.test_ride_status === status.SCHEDULED &&
          <TouchableOpacity
            style={{ alignItems: 'center' }}
            activeOpacity={0.5}
            onPress={() => this.props.cancelTestRide(item)}
            >
            <SimpleLineIcon
              style={testRideCardStyles.userIcon}
              name="close"
              size={18}
              color="red" />
          </TouchableOpacity>
        }
          <View style={testRideCardStyles.leadDetailsCountWrapper}>
            <View style={testRideCardStyles.flexOne}>
              <Text
                style={testRideCardStyles.leadDetailsCountText}
                ellipsizeMode="tail"
                numberOfLines={1}
              >
                {
                item && item.vehicle ?
                  `${item.vehicle.name}`
                  :
                  <Text>
                    NA
                  </Text>
                }
              </Text>
            </View>
          </View>
          <View style={testRideCardStyles.assigneeWrapper}>
            <SimpleLineIcon
              style={testRideCardStyles.userIcon}
              name="user"
              size={12}
              color="#9d9c9c" />
            <Text
              style={testRideCardStyles.assigneeName}
            >
              {
                item && item.lead ?
                  `${item.lead.assignee.first_name}`
                  :
                  <Text>
                    NA
                  </Text>
                }
            </Text>
          </View>
        </View>
        <View style={testRideCardStyles.testRideViewWrapper}>
          <View style={testRideCardStyles.testRideViewWrapperSpacing}>
            <Text style={testRideCardStyles.testRideText}>
                Test Ride
            </Text>
            <Text style={testRideCardStyles.leadDetailsCount}>
              {
                item && item.test_ride_on ?
                  `${moment(item.test_ride_on).utc().format('DD MMM')}` +
                   ` @ ${moment(item.test_ride_on).utc().format('h:mm a')}`
                  :
                  'NO'
              }
            </Text>
          </View>
          <View style={testRideCardStyles.leadContactWrapper}>
            <Text style={testRideCardStyles.leadContactText}>
                Lead Contact
            </Text>
            <Text style={testRideCardStyles.leadContactNumber}>
              {item.lead.mobile_number}
            </Text>
          </View>
        </View>
        <View style={testRideCardStyles.leadDetailsWrapper}>
          <Text style={testRideCardStyles.leadDetailsText}>
            Finance Option
          </Text>
          <View style={testRideCardStyles.leadNameWrapper}>
            <Text style={testRideCardStyles.leadNameStyle}>
              {item.lead.financier_lead.length > 0 ? 'Yes' : 'No'}
            </Text>
          </View>
        </View>
        {/* Lead Details */}
        <View style={testRideCardStyles.leadDetailsWrapper}>
          <Text style={testRideCardStyles.leadDetailsText}>Lead Details
          </Text>
          <View style={testRideCardStyles.leadNameWrapper}>
            <Text style={testRideCardStyles.leadNameStyle}>{item.lead.name}
            </Text>
            {
              item.lead.gender ?
                <View style={testRideCardStyles.directionRow}>
                  <View style={testRideCardStyles.genderView} />
                  <Text style={testRideCardStyles.genderText}>{item.lead.gender}
                  </Text>
                </View> :
                null
            }
          </View>
        </View>
        {/* View Button */}
        {
          item.test_ride_status === status.ONGOING &&
          <LinearGradient
            colors={['#ff8e3e', '#ff743f', '#fd5742', '#fb4645']}
            style={testRideCardStyles.viewButtonWrapper}>
            <ButtonWithLeftImage
              style={[{ width: (DEVICE_WIDTH / 3) - 40 },
                testRideCardStyles.buttonView
              ]}
              textStyle={testRideCardStyles.buttonText}
              handleSubmit={() => this.props.completeTestRide(item)}
              title="Test Ride Complete"
          />
          </LinearGradient>
        }
        {
          (item.test_ride_status === status.COMPLETED || item.test_ride_status === status.CANCELLED) &&
          <LinearGradient
            colors={['#ff8e3e', '#ff743f', '#fd5742', '#fb4645']}
            style={testRideCardStyles.viewButtonWrapper}>
            <ButtonWithLeftImage
              disabled
              style={[{ width: (DEVICE_WIDTH / 3) - 40 },
                testRideCardStyles.buttonView
              ]}
              textStyle={testRideCardStyles.buttonText}
            // handleSubmit={() => { this.props.onViewClicked(); }}
              title={item.test_ride_status === status.COMPLETED ? 'COMPLETED' : 'CANCELLED'}
          />
          </LinearGradient>
        }
        {
          item && item.test_ride_status === status.SCHEDULED &&
          <View style={testRideCardStyles.wrapper}>
            <LinearGradient
              colors={['#FFEEE5', '#FFEEE5']}
              style={{
                height: 40,
                borderBottomLeftRadius: 5
              }}
            >
              <ButtonWithLeftImage
                style={[{ width: (DEVICE_WIDTH / 5) - 40 },
                  testRideCardStyles.buttonView
                ]}
                textStyle={[testRideCardStyles.buttonText, { color: '#ff743f' }]}
                handleSubmit={this.props.rescheduleTestRide}
                title="RESCHEDULE"
            />
            </LinearGradient>
            <LinearGradient
              colors={startTestRide ? ['#ff8e3e', '#ff743f', '#fd5742', '#fb4645'] : ['#A9A9A9', '#A9A9A9']}
              style={{
                height: 40,
                borderBottomRightRadius: 5
              }}
            >
              <ButtonWithLeftImage
                style={[{ width: (DEVICE_WIDTH / 5) - 40 },
                  testRideCardStyles.buttonView
                ]}
                textStyle={testRideCardStyles.buttonText}
                handleSubmit={this.props.startTestRide}
                title="START"
                disabled={!startTestRide}
            />
            </LinearGradient>
          </View>
        }
      </View>
    );
  }
}

export default TestRideCard;
