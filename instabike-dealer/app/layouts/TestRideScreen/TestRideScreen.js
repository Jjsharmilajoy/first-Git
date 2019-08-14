/**
 * The Test ride component renders the test ride cards under different category
 * such as ongoing, scheduled, completed and cancelled.
 */
import React, { Component } from 'react';
import {
  View, Text, TouchableOpacity, DatePickerAndroid
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import moment from 'moment';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Icon from 'react-native-vector-icons/FontAwesome';
import { toast } from '../../utils/toaster';
import HandleTabNavigation from './components/tabNavigator';
import { SecondaryButton } from '../../components/button/Button';
import { getTestRideBookedLeads, getTestRideCount } from '../../redux/actions/TestRide/actionCreators';
import Loader from '../../components/loader/Loader';
import AppHeader from '../../components/header/Header';
import { homeDashboardHeaderStyles } from '../HomeDashboard/homeDashboardStyles';
import testRideStyles from './testRideStyles';

@connect(
  state => ({
    currentUser: state.user.currentUser,
    loading: state.testRide.loadingGroup,
    count: state.testRide.count
  }),
  {
    getTestRideBookedLeads,
    getTestRideCount
  }
)

export default class TestRideScreen extends Component {
  static propTypes = {
    loading: PropTypes.bool.isRequired,
    navigation: PropTypes.object.isRequired,
    currentUser: PropTypes.object.isRequired,
    count: PropTypes.object.isRequired,
    getTestRideBookedLeads: PropTypes.func.isRequired,
    getTestRideCount: PropTypes.func.isRequired
  }

  constructor(props) {
    super(props);
    this.defaultFilterData = {
      from: moment().utc().subtract(1, 'months').format(),
      to: moment().utc().add(7, 'days').format()
    };
    this.state = {
      currentTab: 'ongoing',
      dateRange: {
        from: moment().utc().subtract(2, 'days').format(),
        to: moment().add(5, 'days').utc().format()
      },
      count: null
    };
  }

  static getDerivedStateFromProps(nextProps) {
    if (nextProps && nextProps.count) {
      return {
        count: nextProps.count
      };
    }
    return null;
  }

  componentDidMount() {
    const { dateRange } = this.state;
    const { currentUser } = this.props;
    if (currentUser) {
      try {
        this.props.getTestRideBookedLeads('ongoing', dateRange)
          .catch(() => { console.log('ERROR ===> ', 'Test ride booked lead failed'); });
        this.props.getTestRideCount(dateRange).then(() => { }, () => { })
          .catch(() => { console.log('ERROR ===> ', 'Test ride count failed'); });
      } catch (error) {
        console.log(error);
      }
    }
  }

  onSearchProductClick = () => {
    this.props.navigation.navigate('SearchLead', { isFilterOpen: false });
  }

  getCount = currentTab => {
    this.setState({
      currentTab
    }, () => {
      this.props.getTestRideCount(this.state.dateRange);
    });
  }

  getCurrentMonth = () => {
    const locale = 'en-us';
    const objDate = moment.add(7, 'days');
    const Year = new Date().getFullYear().toString();
    return `${objDate.toLocaleString(locale, { month: 'short' })}'${Year.substr(Year.length - 2)}`;
  }

  setFilterDate = param => (
    async () => {
      const { dateRange } = this.state;
      const dateToEdit = dateRange[param];
      let range = {};
      if (param === 'from') {
        range = {
          maxDate: new Date(this.defaultFilterData.to),
          minDate: new Date(this.defaultFilterData.from)
        };
      } else {
        range = {
          maxDate: new Date(this.defaultFilterData.to),
          minDate: new Date(this.defaultFilterData.from)
        };
      }
      try {
        const {
          action, year, month, day
        } = await DatePickerAndroid.open({
          date: new Date(dateToEdit),
          mode: 'calendar',
          ...range
        });
        if (action !== DatePickerAndroid.dismissedAction) {
          const retrievedDate = moment({ years: year, months: month, date: day }).utc('+5:30').format();
          if (this.validateDates(dateRange.from, dateRange.to, retrievedDate, param)) {
            dateRange[param] = moment({ years: year, months: month, date: day }).utc('+5:30').format();
            this.setState({ dateRange });
          }
        }
      } catch (error) {
        console.log('Cannot open date picker', error);
      }
    }
  )

  applyFilterDate = () => {
    const { dateRange, currentTab } = this.state;
    try {
      this.props.getTestRideCount(dateRange);
      this.props.getTestRideBookedLeads(currentTab, dateRange);
    } catch (error) {
      console.log(error);
    }
  }

  validateDates = (fromDate, toDate, retrievedDate, param) => {
    const validated = (() => param === 'to'
      ? moment(fromDate).isSameOrBefore(retrievedDate)
      : moment(toDate).isSameOrAfter(retrievedDate))();
    if (!validated) {
      // eslint-disable-next-line  max-len
      toast(`${param === 'from' ? 'Start Date' : 'End Date'} cannot be ${param === 'from' ? 'higher' : 'lower'} than ${moment(param === 'to' ? fromDate : toDate).format('DD MMM YY')} !`);
    }
    return validated;
  }

  render() {
    const { dateRange: { from, to } } = this.state;
    return (
      <View style={{
        flex: 1,
        backgroundColor: 'white'
      }}>
        <Loader showIndicator={this.props.loading} />
        <AppHeader navigation={this.props.navigation}>
          <View style={homeDashboardHeaderStyles.headerContainer}>
            <View style={{ flex: 1, flexDirection: 'row' }}>
              <View style={homeDashboardHeaderStyles.headerTextContent}>
                <Text style={{ color: 'white', paddingHorizontal: 5 }}>
                  Test Rides
                </Text>
              </View>
              <TouchableOpacity
                style={homeDashboardHeaderStyles.headerSearchContent}
                onPress={this.onSearchProductClick}>
                <Text style={{ paddingHorizontal: 10 }}><Icon name="search" size={21} color="white" /></Text>
                <Text style={homeDashboardHeaderStyles.headerSearchContentText}>
Search for Lead
                </Text>
              </TouchableOpacity>
              <View style={{ flex: 2, flexDirection: 'row', alignItems: 'center' }} />
            </View>
          </View>
        </AppHeader>

        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          margin: 10,
          marginTop: 20,
          marginLeft: 20
        }}>
          <View style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'flex-start'
          }}
          >
            <View>
              <TouchableOpacity
                activeOpacity={0.5}
                style={{
                  alignItems: 'center',
                  marginRight: 20,
                }}>
                <LinearGradient
                  colors={['#00C9D3', '#00B4EC']}
                  style={{
                    flexDirection: 'row',
                    borderRadius: 5,
                    paddingVertical: 10,
                    paddingHorizontal: 10
                  }}>
                  <View style={{ marginLeft: 5 }}>
                    <Text
                      style={{
                        fontFamily: 'SourceSansPro-SemiBold',
                        color: 'white',
                        fontSize: 13,
                        lineHeight: 18
                      }}>
Test Rides
                      {'\n'}
                      Scooters
                    </Text>
                  </View>
                  <View style={{ marginLeft: 15 }}>
                    <Text style={{
                      fontFamily: 'SourceSansPro-SemiBold',
                      color: 'white',
                      fontSize: 20
                    }}>
                      {this.props.count && this.props.count.testRideCount
                        ? this.props.count.testRideCount[0].scooter : 0}
                    </Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </View>
            <View>
              <TouchableOpacity
                activeOpacity={0.5}
                style={{
                  alignItems: 'center',
                  marginRight: 20
                }}>
                <LinearGradient
                  colors={['#C57CF5', '#8F7AF6']}
                  style={{
                    flexDirection: 'row',
                    borderRadius: 5,
                    paddingVertical: 10,
                    paddingHorizontal: 10
                  }}>
                  <View style={{ marginLeft: 5 }}>
                    <Text
                      style={{
                        fontFamily: 'SourceSansPro-SemiBold',
                        color: 'white',
                        fontSize: 13,
                        lineHeight: 18
                      }}>
Test Rides
                      {'\n'}
                      Bikes
                    </Text>
                  </View>
                  <View style={{
                    marginLeft: 20,
                    flexDirection: 'row'
                  }}>
                    <Text style={{
                      fontFamily: 'SourceSansPro-SemiBold',
                      color: 'white',
                      fontSize: 20
                    }}>
                      {this.props.count && this.props.count.testRideCount
                        ? this.props.count.testRideCount[0].bike : 0}
                    </Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
          {
            (this.state.currentTab === 'scheduled' || this.state.currentTab === 'completed' || this.state.currentTab === 'cancelled')
            && (
            <View style={{ flexDirection: 'row', alignContent: 'flex-end', justifyContent: 'center' }}>
              <View style={testRideStyles.filterDateContainer}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={this.setFilterDate('from')}
                >
                  <View style={testRideStyles.filterDateContent}>
                    <Text style={testRideStyles.filterDateFormattedText}>
                      {moment(from).format('DD MMM YY')}
                    </Text>
                    <Icon
                      style={[testRideStyles.iconImageStyle]}
                      name="angle-down"
                      size={22}
                      color="#3e3939" />
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={this.setFilterDate('to')}
                >
                  <View style={testRideStyles.filterDateContent}>
                    <Text style={testRideStyles.filterDateFormattedText}>
                      {moment(to).format('DD MMM YY')}
                    </Text>
                    <Icon
                      style={[testRideStyles.iconImageStyle]}
                      name="angle-down"
                      size={22}
                      color="#3e3939" />
                  </View>
                </TouchableOpacity>
              </View>
              <SecondaryButton
                title="Apply"
                iconName=""
                handleSubmit={this.applyFilterDate}
                buttonStyle={{
                  width: 100,
                  height: 40,
                  marginLeft: 10
                }}
              />
            </View>
            )
          }
        </View>
        <View style={{ flex: 9 }}>
          <HandleTabNavigation
            stackNavigation={this.props.navigation}
            loading={this.props.loading}
            getCount={this.getCount}
            dateRange={this.state.dateRange}
            count={this.state.count && this.state.count.leadDetailsCount && this.state.count.leadDetailsCount[0]} />
        </View>
      </View>
    );
  }
}
