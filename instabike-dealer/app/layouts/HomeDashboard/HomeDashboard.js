/**
 * The Home component renders the month to date stats of dealership.
 * It also shows the team's performance in invoicing a lead, test ride stats
 * and so on.
 */
import React, { Component } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import PropTypes from 'prop-types';
import moment from 'moment';
import { connect } from 'react-redux';
import {
  Text, View, TouchableOpacity,
  ScrollView, processColor
} from 'react-native';

import Icon from 'react-native-vector-icons/FontAwesome';
import { NavigationActions } from 'react-navigation';

// Components
import SpringView from '../../components/animated/SpringView';
import { GradientCountTile } from '../../components/tile/Tile';

// Styles
import { homeDashboardStyles, homeDashboardHeaderStyles } from './homeDashboardStyles';

// Graphs
import TargetGraph from '../../components/charts/TargetGraph';
import PieChartScreen from '../../components/charts/Pie';

// Card
import TeamPerformance from './TeamPerformance';

// Header HOC
import AppHeader from '../../components/header/Header';

// Constants
import constants from '../../utils/constants';

import { getLeadsMonthlySummaryCount, getTeamPerformance } from '../../redux/actions/HomeDashBoard/actionCreators';

import { getTargetSummary, getLeadSummary } from '../../redux/actions/Target/actionCreators';
import { updateClickedPosition } from '../../redux/actions/Global/actionCreators';
import { resetScreens } from '../../actions/stackActions';
import { currencyFormatter } from '../../utils/validations';
import Loader from '../../components/loader/Loader';
import suzukiBike from '../../assets/images/suzuki/bike.png';
import heroBike from '../../assets/images/hero/bike.png';
import flashBike from '../../assets/images/flash/bike.png';
import suzukiScooter from '../../assets/images/suzuki/scooter.png';
import heroScooter from '../../assets/images/hero/scooter.png';
import flashScooter from '../../assets/images/flash/scooter.png';

let bikeImg = suzukiBike;
if (constants.manufacturer === 'hero') {
  bikeImg = heroBike;
} else if (constants.manufacturer === 'flash') {
  bikeImg = flashBike;
}

let scooterImg = suzukiScooter;
if (constants.manufacturer === 'hero') {
  scooterImg = heroScooter;
} else if (constants.manufacturer === 'flash') {
  scooterImg = flashScooter;
}

@connect(
  state => ({
    loading: state.target.loadingGroup,
    currentUser: state.user.currentUser,
    leadsSummaryCount: state.homeDashboard.leadsSummaryCount,
    targetSummary: state.target.targetSummary,
    leadSummary: state.target.leadSummary,
    teamPerformance: state.homeDashboard.teamPerformance
  }),
  {
    getLeadsMonthlySummaryCount,
    getTargetSummary,
    getLeadSummary,
    getTeamPerformance,
    updateClickedPosition
  }
)
class HomeDashboard extends Component {
  static propTypes = {
    navigation: PropTypes.object.isRequired,
    getLeadsMonthlySummaryCount: PropTypes.func.isRequired,
    updateClickedPosition: PropTypes.func.isRequired,
    currentUser: PropTypes.object,
    getTargetSummary: PropTypes.func.isRequired,
    getLeadSummary: PropTypes.func.isRequired,
    getTeamPerformance: PropTypes.func.isRequired,
    loading: PropTypes.bool.isRequired
  }

  static defaultProps = {
    currentUser: {}
  }

  // eslint-disable-next-line  react/sort-comp
  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.currentUser && nextProps.leadSummary && nextProps.targetSummary
      && nextProps.leadsSummaryCount && nextProps.teamPerformance) {
      const { user } = nextProps.currentUser;
      const {
        pending_leads,
        overdue_leads,
        scheduled_test_ride,
        inprogress_test_ride,
        completed_test_ride,
        incentive_amount,
      } = nextProps.leadSummary;
      const leadDistribution = JSON.parse(JSON.stringify(prevState.leadDistribution));
      const testRideBookings = JSON.parse(JSON.stringify(prevState.testRideBookings));
      /* eslint-disable */
      leadDistribution.values[0].value = parseInt(pending_leads, 10);
      leadDistribution.values[1].value = parseInt(overdue_leads, 10);
      const totalLeads = parseInt(pending_leads, 10) + parseInt(overdue_leads, 10);
      leadDistribution.styledCenterText.text = `${totalLeads ? `${totalLeads} to follow up` : 'No followup\nscheduled'}`;
      leadDistribution.styledCenterText.size = 16;
      leadDistribution.hasData = totalLeads > 0;
      testRideBookings.values[0].value = parseInt(scheduled_test_ride, 10);
      testRideBookings.values[1].value = parseInt(inprogress_test_ride, 10);
      testRideBookings.values[2].value = parseInt(completed_test_ride, 10);
      const ongoingTestRides = inprogress_test_ride;
      const incentiveAmount = incentive_amount ? currencyFormatter(incentive_amount) : '₹ 0';
      const completedTestRide = completed_test_ride;
      const scheduledTestRide = scheduled_test_ride;
      const totalBookings = parseInt(scheduled_test_ride, 10) + parseInt(inprogress_test_ride, 10) + parseInt(completed_test_ride, 10);
      testRideBookings.styledCenterText.text = `${totalBookings ? `${totalBookings} test rides` : 'No booking found'}`;
      testRideBookings.styledCenterText.size = 16;
      /* eslint-enable */
      const scooterSummary = nextProps.targetSummary.filter(summary => !summary.vehicle_type);
      const bikeSummary = nextProps.targetSummary.filter(summary => summary.vehicle_type);
      const targets = HomeDashboard.getTargetSummary(prevState, scooterSummary, bikeSummary, nextProps);
      const {
        followup,
        newLeads,
        invoice,
        bike,
        scooter
      } = nextProps.leadsSummaryCount;
      const {
        todaySummary,
        monthlySummary, targetLabels, currentRole
      } = prevState;
      todaySummary[0].tileCount = newLeads || 0;
      todaySummary[1].tileCount = followup || 0;
      todaySummary[2].tileCount = invoice || 0;
      todaySummary[3].tileCount = incentiveAmount || 0;
      monthlySummary[0].tileCount = bike || 0;
      monthlySummary[1].tileCount = scooter || 0;
      monthlySummary[2].tileCount = ` ${invoice && newLeads ? ((invoice / newLeads) * 100).toFixed(0) : 0} %`;
      const teamMembers = [];
      const { teamPerformance } = nextProps;
      teamPerformance.forEach((teamMember, index) => {
        teamMembers.push(HomeDashboard.getTeamMemberDetails(teamMember, index));
      });
      targetLabels[1] = HomeDashboard.getHeaderLabel(currentRole);
      return {
        leadDistribution,
        testRideBookings,
        ongoingTestRides,
        completedTestRide,
        scheduledTestRide,
        incentiveAmount,
        targetLabels,
        targets,
        todaySummary,
        teamMembers,
        targetsLoaded: true,
        userName: `${user.first_name} ${(user.last_name ? user.last_name : '')}`,
        isDealerManager: nextProps.currentUser.user.user_role[0].role.name === 'DEALER_MANAGER',
        isTeamLead: nextProps.currentUser.user.user_role[0].role.name === 'DEALER_TEAM_HEAD',
        currentRole: nextProps.currentUser.user.user_role[0].role.name,
      };
    }
    return null;
  }

  static getHeaderLabel = currentRole => {
    switch (currentRole) {
      case constants.SALES_EXECUTIVE:
        return 'Sales Target';
      case constants.DEALER_TEAM_HEAD:
        return 'Team Target';
      case constants.MANAGER:
        return 'Dealership Target';
      default:
        return 'Target';
    }
  }

  static getTeamMemberDetails(currentDayTargetDetails, index) {
    const {
      user, followup, followupDone, monthlyUnitsInvoiced, leadsCreated,
      monthlyTargets, monthlyIncentives
    } = currentDayTargetDetails;
    const getFollowUpcount = followupDetails => {
      let count = 0;
      Object.keys(followupDetails).forEach(key => {
        count += followup[key].length;
      });
      return count;
    };
    return {
      id: index,
      userId: user.id,
      name: user.first_name,
      followupDone: parseInt(followupDone, 10) || '0',
      target: followup ? getFollowUpcount(followup) : '0',
      new: followup && followup.NEW ? followup.NEW.length : '0',
      hot: followup && followup.HOT ? followup.HOT.length : '0',
      cold: followup && followup.COLD ? followup.COLD.length : '0',
      warm: followup && followup.WARM ? followup.WARM.length : '0',
      newLeads: parseInt(leadsCreated, 10),
      monthlyUnitsInvoiced: parseInt(monthlyUnitsInvoiced, 10),
      monthlyUnitTarget: monthlyTargets || '0',
      monthlyIncentives: monthlyIncentives || '0',
      user
    };
  }

  static getTargetSummary(prevState, scooterSummaries, bikeSummaries, nextProps) {
    let defaultTargets = JSON.parse(JSON.stringify(prevState.defaultTargets));
    const defaultSummary = {
      vehicle_type: 0,
      manufacturer_target: 0,
      sold_count: 0,
      dealer_target: 0
    };
    const bikeSummary = bikeSummaries && bikeSummaries.length > 0 ? bikeSummaries[0] : defaultSummary;
    const scooterSummary = scooterSummaries && scooterSummaries.length > 0 ? scooterSummaries[0] : defaultSummary;
    if (nextProps.currentUser) {
      const { user } = nextProps.currentUser;
      if (user.user_role[0].role.name !== constants.MANAGER) {
        bikeSummary.manufacturer_target = bikeSummary.dealer_target;
        scooterSummary.manufacturer_target = scooterSummary.dealer_target;
      }
    }

    defaultTargets = defaultTargets.map((target, index) => {
      if (index === 0) {
        target.mt = (bikeSummary.manufacturer_target ? parseInt(bikeSummary.manufacturer_target, 10) : 0)
          + (scooterSummary.manufacturer_target ? parseInt(scooterSummary.manufacturer_target, 10) : 0);
        target.dt = (bikeSummary.dealer_target ? parseInt(bikeSummary.dealer_target, 10) : 0)
          + (scooterSummary.dealer_target ? parseInt(scooterSummary.dealer_target, 10) : 0);
        target.mtd = (bikeSummary.sold_count ? parseInt(bikeSummary.sold_count, 10) : 0)
          + (scooterSummary.sold_count ? parseInt(scooterSummary.sold_count, 10) : 0);
      }
      if (index === 1) {
        target.mtd = bikeSummary.sold_count ? parseInt(bikeSummary.sold_count, 10) : 0;
        target.mt = bikeSummary.manufacturer_target
          ? parseInt(bikeSummary.manufacturer_target, 10) : 0;
        target.dt = bikeSummary.dealer_target
          ? parseInt(bikeSummary.dealer_target, 10) : 0;
      }
      if (index === 2) {
        target.mtd = scooterSummary.sold_count ? parseInt(scooterSummary.sold_count, 10) : 0;
        target.mt = scooterSummary.manufacturer_target ? parseInt(scooterSummary.manufacturer_target, 10) : 0;
        target.dt = scooterSummary.dealer_target ? parseInt(scooterSummary.dealer_target, 10) : 0;
      }
      return target;
    });
    return defaultTargets;
  }

  constructor(props) {
    super(props);
    this.state = {
      // can be enabled later.
      // ongoingTestRides: '',
      // completedTestRide: '',
      // scheduledTestRide: '',
      isDealerManager: false,
      currentRole: '',
      userName: '',
      targetLabels: ['Manufacturer Target', 'Dealer Target', 'Manufacturer, Dealer Target'],
      teamMembers: [],
      // eslint-disable-next-line react/no-unused-state
      defaultTargets: [
        {
          id: 1,
          targetName: 'Overall Completion',
          mtd: 0,
          mt: 0,
          dt: 0,
        },
        {
          id: 2,
          targetName: 'Scooter Target Completion',
          mtd: 0,
          mt: 0,
          dt: 0,
        },
        {
          id: 3,
          targetName: 'Bike Target Completion',
          mtd: 0,
          mt: 0,
          dt: 0,
        }
      ],
      targets: [
        {
          id: 1,
          targetName: 'Overall Completion',
          mtd: 0,
          mt: 0,
          dt: 0,
        },
        {
          id: 2,
          targetName: 'Scooter Target Completion',
          mtd: 0,
          mt: 0,
          dt: 0,
        },
        {
          id: 3,
          targetName: 'Bike Target Completion',
          mtd: 0,
          mt: 0,
          dt: 0,
        }
      ],
      todaySummary: [
        {
          id: 1,
          text: 'Leads created',
          tileCount: '',
          colors: ['#ef563c', '#f3842d'],
          style: {
            flex: 1,
            justifyContent: 'center',
            borderRadius: 5
          },
          containerStyle: {
            width: 150
          },
          countStyle: { fontSize: 23, alignSelf: 'center' },
          textStyle: { fontSize: 15, paddingLeft: 10, fontWeight: '400' },
          onClick: () => {
            const { navigate } = this.props.navigation;
            navigate('LeadDashboard', {
              isStatisticsClicked: true
            });
          }
        },
        {
          id: 2,
          text: 'Leads to follow',
          tileCount: '',
          hasDivide: false,
          colors: ['#0ac7c4', '#51deb7'],
          style: {
            flex: 1,
            justifyContent: 'center',
            borderRadius: 5
          },
          containerStyle: {
            width: 150
          },
          countStyle: { fontSize: 23, alignSelf: 'center' },
          textStyle: { fontSize: 15, paddingLeft: 10, fontWeight: '400' },
          onClick: () => {
            const { navigate } = this.props.navigation;
            navigate('LeadFollowUpScreen');
          }
        },
        {
          id: 3,
          text: 'Units Invoiced',
          tileCount: '',
          colors: ['#9376fd', '#c879fd'],
          style: {
            flex: 1,
            justifyContent: 'center',
            borderRadius: 5
          },
          containerStyle: {
            width: 150
          },
          countStyle: { fontSize: 23, alignSelf: 'center' },
          textStyle: {
            fontSize: 15, paddingTop: 5, paddingLeft: 10, fontWeight: '400'
          }
        },
        {
          id: 4,
          text: 'Incentive Earned',
          tileCount: '',
          hasDivide: true,
          isString: true,
          colors: ['#00b0ff', '#07d0d0'],
          style: {
            flex: 1,
            justifyContent: 'center',
            borderRadius: 5
          },
          containerStyle: {
            width: 200
          },
          countStyle: { fontSize: 14, alignSelf: 'center' },
          textStyle: {
            fontSize: 15, paddingTop: 5, paddingLeft: 10, fontWeight: '400'
          }
        }
      ],
      monthlySummary: [
        {
          id: 1,
          text: '',
          tileCount: '',
          hasDivide: false,
          hasImage: true,
          imgSrc: bikeImg,
          colors: ['white', 'white'],
          style: {
            flex: 1,
            alignContent: 'center',
            justifyContent: 'center',
            borderRadius: 5
          },
          containerStyle: {
            width: 150
          },
          imgStyle: {
            marginTop: 20,
            width: 70,
            height: 80,
            alignSelf: 'center'
          },
          countStyle: {
            color: 'black', alignSelf: 'center', fontWeight: '400', fontSize: 23
          },
          textStyle: { color: '#5a35da', paddingTop: 5, fontWeight: '400' }
        },
        {
          id: 2,
          text: '',
          tileCount: '',
          hasImage: true,
          hasDivide: false,
          imgSrc: scooterImg,
          colors: ['white', 'white'],
          style: {
            flex: 1,
            justifyContent: 'center',
            borderRadius: 5
          },
          containerStyle: {
            width: 150
          },
          imgStyle: {
            marginTop: 15,
            width: 50,
            height: 100,
            padding: 20,
            alignItems: 'center',
            justifyContent: 'center',
          },
          countStyle: {
            color: '#061b8b', alignSelf: 'center', fontWeight: '400', fontSize: 23
          },
          textStyle: { color: '#5a35da', paddingTop: 5 }
        },
        {
          id: 3,
          text: 'Leads Converted',
          tileCount: '',
          isString: true,
          colors: ['#f7f7f7', '#f7f7f7'],
          style: { flex: 1, justifyContent: 'center', borderRadius: 5 },
          countStyle: { color: 'black', paddingLeft: 5 },
          containerStyle: {
            width: 175
          },
          textStyle: {
            color: '#494949', fontSize: 14, paddingTop: 5, fontWeight: '400'
          }
        },
      ],
      leadDistribution: {
        values: [
          { value: 0, label: 'Pending' },
          { value: 0, label: 'Overdue' }
        ],
        styledCenterText: { text: '', color: processColor('black'), size: 25 },
        colors: [
          '#5bccd3',
          '#5c86fd',
          '#afafaf'
        ],
        label: 'Follow up distribution'
      },
      testRideBookings: {
        values: [
          { value: 0, label: 'Scheduled' },
          { value: 0, label: 'Ongoing' },
          { value: 0, label: 'Completed' }
        ],
        styledCenterText: { text: '', color: processColor('black'), size: 50 },
        colors: [
          '#55ff3f',
          '#da6fff',
          '#f6bb45'],
        label: 'Test ride bookings'
      },
    };
  }

  componentDidMount() {
    const dealerId = (this.props.currentUser && this.props.currentUser.dealerId) ? this.props.currentUser.dealerId : '';
    if (dealerId && dealerId.length > 0) {
      this.initialLoad(dealerId);
      this.willFocusSubscription = this.props.navigation.addListener(
        'willFocus',
        () => {
          // eslint-disable-next-line no-shadow
          const dealerId = (this.props.currentUser && this.props.currentUser.dealerId)
            ? this.props.currentUser.dealerId : '';
          if (dealerId && dealerId.length > 0) {
            this.initialLoad(dealerId);
          }
        }
      );
    }
  }

  initialLoad = dealerId => {
    const startOfMonth = moment().startOf('month').format('YYYY-MM-DD');
    const endOfMonth = moment().endOf('month').format('YYYY-MM-DD');
    Promise.all([
      this.props.getLeadsMonthlySummaryCount(),
      this.props.getTargetSummary(dealerId, startOfMonth, endOfMonth),
      this.props.getLeadSummary(dealerId),
      this.props.getTeamPerformance(dealerId)
    ]).catch(() => {});
  }

  componentWillUnmount() {
    if (this.willFocusSubscription) this.willFocusSubscription.remove();
  }

  onCreateNewLeadClicked = () => {
    const {
      navigate
    } = this.props.navigation;
    navigate('CreateNewLead');
  }

  onSearchProductClick = () => {
    this.props.navigation.navigate('SearchLead', { isFilterOpen: false });
  }

  getHeaderText = () => {
    switch (this.state.currentRole) {
      case constants.MANAGER:
        return `Dealership Target Summary for ${moment().format('MMMM')}`;
      default:
        return `Target Summary for ${moment().format('MMMM')}`;
    }
  }

  header = () => {
    const {
      userName
    } = this.state;
    return (
      <View style={homeDashboardHeaderStyles.headerContainer}>
        <View style={{ flex: 1, flexDirection: 'row' }}>
          <View style={homeDashboardHeaderStyles.headerTextContent}>
            <Text style={{ color: 'white', paddingHorizontal: 5 }}>
              {userName}
            </Text>
            <Text style={{ color: 'gray', paddingHorizontal: 5 }} />
          </View>
          <View style={[homeDashboardHeaderStyles.headerDateContent, { display: 'none' }]}>
            <Text style={{ color: 'white', paddingHorizontal: 5 }} />
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
    );
  }

  navigateTo = screen => {
    this.props.navigation.navigate(screen);
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

  gotoTeam = async () => {
    try {
      const { navigation } = this.props;
      await this.props.updateClickedPosition(4);
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

  render() {
    const {
      targets, todaySummary, monthlySummary
    } = this.state;
    return (
      <View style={{ flex: 1 }}>
        <Loader showIndicator={this.props.loading} />
        <AppHeader navigation={this.props.navigation}>
          {this.header()}
        </AppHeader>
        <View style={homeDashboardStyles.mainContainer}>
          <ScrollView>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={[homeDashboardStyles.scrollContainer, {}]}>
                <View style={{
                  height: 30,
                  flexDirection: 'row',
                }}>
                  <View style={{ flex: 1, justifyContent: 'center', position: 'absolute' }}>
                    <Text style={homeDashboardStyles.todaySummaryText}>
                      Month to Date Statistics
                    </Text>
                  </View>
                  <View style={{ flex: 1, justifyContent: 'center' }}>
                    <Text style={homeDashboardStyles.monthlyPerformanceOverView} />
                  </View>
                </View>
                <View style={{
                  height: 65, marginVertical: 5, flexDirection: 'row'
                }}>
                  {todaySummary.map(summary => (
                    <SpringView
                      duration={1000}
                      springValue={0.1}
                      key={summary.id}
                      style={[homeDashboardStyles.summarySpringView, summary.containerStyle]}
                    >
                      <GradientCountTile
                        loading={this.props.loading}
                        id={summary.id}
                        onClick={summary.onClick}
                        colors={summary.colors}
                        tileCount={summary.tileCount}
                        tileText={summary.text}
                        hasDivide={summary.hasDivide}
                        imgStyle={summary.imgStyle}
                        hasImage={summary.hasImage}
                        imgSrc={summary.imgSrc}
                        style={summary.style}
                        isString={summary.isString}
                        countStyle={summary.countStyle}
                        textStyle={summary.textStyle}
                      />
                    </SpringView>))}
                  {monthlySummary.map(summary => (
                    <SpringView
                      key={summary.id}
                      duration={1000}
                      springValue={0.1}
                      style={[homeDashboardStyles.summarySpringView, summary.containerStyle]}
                    >
                      <GradientCountTile
                        loading={this.props.loading}
                        id={summary.id}
                        onClick={summary.onClick}
                        colors={summary.colors}
                        tileCount={summary.tileCount}
                        isString={summary.isString}
                        tileText={summary.text}
                        hasDivide={summary.hasDivide}
                        imgStyle={summary.imgStyle}
                        hasImage={summary.hasImage}
                        imgSrc={summary.imgSrc}
                        style={summary.style}
                        countStyle={summary.countStyle}
                        textStyle={summary.textStyle}
                      />
                    </SpringView>
                  ))}
                  <SpringView
                    duration={1000}
                    springValue={0.1}
                    style={[homeDashboardStyles.summarySpringView, {
                      display: 'none'
                    }]}>
                    <TouchableOpacity
                      activeOpacity={0.5}
                      onPress={() => { }}
                      style={{ flex: 1, justifyContent: 'center' }}>
                      <View style={{ flex: 1, justifyContent: 'center' }}>
                        <Text style={homeDashboardStyles.updateInventory}>
                          Update Inventory
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </SpringView>
                </View>
              </View>
            </ScrollView>
            <TargetGraph
              style={{ paddingTop: 10 }}
              data={{
                targets,
                headerText:
                  this.getHeaderText(),
                role: this.state.currentRole,
                colors: [
                  ['#0ac7c4', '#51deb7'],
                  ['green', 'yellowgreen'],
                  ['#5a35da', '#475fdd'],
                  ['#ef563c', '#f3842d']
                ],
                targetLabels: this.state.targetLabels
              }} />

            {/* Lead Distribution Test Ride */}
            <View style={{
              height: 400,
              flexDirection: 'row',
              marginBottom: 40
            }}>
              <View style={{ flex: 4, marginLeft: 10, marginRight: 0 }}>
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  <Text style={{
                    marginLeft: 20,
                    color: 'black'
                  }}>
                    Leads to Followup as on today
                  </Text>
                  <View style={{ justifyContent: 'flex-end' }}>
                    <View style={[homeDashboardStyles.testRideStatusButton, {
                      width: 120,
                      height: 50,
                      marginRight: 5,
                      marginTop: 10,
                      backgroundColor: '#f3f3f2'
                    }]}>
                      <SpringView
                        fadeIn={false}
                        duration={1000}
                        springValue={0.9}
                        style={[homeDashboardStyles.testRideStatusButtonAnimate,
                          {
                            backgroundColor: '#f3f3f2',
                          }]}>
                        <TouchableOpacity
                          activeOpacity={0.5}
                          onPress={() => this.props.navigation.navigate('LeadFollowUpScreen')}
                          style={{ alignItems: 'center' }}>
                          <LinearGradient
                            colors={['#f49426', '#f37a2f', '#ef563c', '#f15f3a', '#ee4b40']}
                            start={{ x: 0.0, y: 1.0 }}
                            end={{ x: 1.0, y: 1.0 }}
                            style={{ alignItems: 'center', justifyContent: 'center', borderRadius: 5 }}>
                            <View style={homeDashboardStyles.updateInventoryButtonContent}>
                              <View style={{ flex: 8, justifyContent: 'center' }}>
                                <Text style={{ color: '#ef563c', paddingLeft: 10, fontSize: 12 }}>
                                  Manage leads
                                </Text>
                              </View>
                              <View style={{ flex: 2, justifyContent: 'center' }}>
                                <Text style={{ color: '#ef563c', fontSize: 20 }}>
                                  >
                                </Text>
                              </View>
                            </View>
                          </LinearGradient>
                        </TouchableOpacity>
                      </SpringView>
                    </View>
                  </View>
                </View>
                <View style={{ height: 400 }}>
                  <View style={homeDashboardStyles.leadDistributionContent}>
                    <View style={{ elevation: 2, flex: 1 }}>
                      <Text style={{ marginTop: 10, marginLeft: 20, color: '#7f7f7f' }}>
                        {this.state.leadDistribution.label}
                      </Text>
                    </View>
                    <View style={homeDashboardStyles.leadDistributionGraph}>
                      <PieChartScreen
                        holeRadius={this.state.leadDistribution.hasData ? 80 : 90}
                        data={this.state.leadDistribution}
                      />
                    </View>
                    <View style={{
                      elevation: 2, flex: 1.5, padding: 10, flexDirection: 'row'
                    }}>
                      {this.state.leadDistribution.values.map((value, index) => (
                        <View style={[
                          homeDashboardStyles.testRideStatusLabelContent, {
                            marginLeft: index ? 0 : 50,
                            marginRight: index ? 50 : 0,
                            justifyContent: index ? 'flex-start' : 'flex-end'
                          }]}>
                          <View style={{ flex: 1, flexDirection: 'row' }}>
                            <View style={[homeDashboardStyles.leadDistributionLegend, {
                              backgroundColor: this.state.leadDistribution.colors[index]
                            }]}
                            />
                            <View style={homeDashboardStyles.leadDistributionLegendText}>
                              <Text>
                                {`${value.label}(${value.value})`}
                              </Text>
                            </View>
                          </View>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              </View>

              <View style={{ flex: 6, marginRight: 10 }}>
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  <Text style={{
                    marginLeft: 20,
                    color: 'black'
                  }}>
                    Test Ride Today
                  </Text>
                  <View style={{ justifyContent: 'flex-end', marginRight: 20 }}>
                    <View style={[homeDashboardStyles.testRideStatusButton, {
                      width: 150,
                      height: 50,
                      marginTop: 10
                    }]}>
                      <SpringView
                        fadeIn={false}
                        duration={1000}
                        springValue={0.9}
                        style={[homeDashboardStyles.testRideStatusButtonAnimate, { backgroundColor: '#f3f3f2' }]}>
                        <TouchableOpacity
                          activeOpacity={0.5}
                          onPress={this.gotoTestRide}
                          style={{ alignItems: 'center' }}>
                          <LinearGradient
                            colors={['#f49426', '#f37a2f', '#ef563c', '#f15f3a', '#ee4b40']}
                            start={{ x: 0.0, y: 1.0 }}
                            end={{ x: 1.0, y: 1.0 }}
                            style={{ alignItems: 'center', justifyContent: 'center', borderRadius: 5 }}>
                            <View style={homeDashboardStyles.updateInventoryButtonContent}>
                              <View style={{ flex: 8, justifyContent: 'center' }}>
                                <Text style={{ color: '#ef563c', paddingLeft: 10, fontSize: 12 }}>
                                  Manage Bookings
                                </Text>
                              </View>
                              <View style={{ flex: 2, justifyContent: 'center' }}>
                                <Text style={{ color: '#ef563c', fontSize: 20 }}>
                                  >
                                </Text>
                              </View>
                            </View>
                          </LinearGradient>
                        </TouchableOpacity>
                      </SpringView>
                    </View>
                  </View>
                </View>
                <View style={{
                  height: 400
                }}>
                  <View style={[homeDashboardStyles.testRideStatusContent]}>
                    <View style={{ elevation: 2, flex: 1 }}>
                      <Text style={{ marginTop: 10, marginLeft: 20, color: '#7f7f7f' }}>
                        {this.state.testRideBookings.label}
                      </Text>
                    </View>
                    <View style={homeDashboardStyles.testRideStatusChart}>
                      <View style={{
                        flex: 5, paddingLeft: 50, paddingRight: 50, paddingVertical: 30
                      }}>
                        <PieChartScreen data={this.state.testRideBookings} />
                      </View>
                      {/* <View style={{ flex: 5, justifyContent: 'center' }}>
                        <View style={{ flex: 1 }} >
                          <View style={homeDashboardStyles.testRideStatusButton}>
                            <SpringView
                              fadeIn={false}
                              duration={1000}
                              springValue={0.9}
                              style={[homeDashboardStyles.testRideStatusButtonAnimate]} >
                              <TouchableOpacity
                                activeOpacity={0.5}
                                style={{ alignItems: 'center' }} >
                                <LinearGradient
                                  colors={['#55ff3f', '#55ff3f']}
                                  start={{ x: 0.0, y: 1.0 }}
                                  end={{ x: 1.0, y: 1.0 }}
                                  style={{ alignItems: 'center', justifyContent: 'center', borderRadius: 5 }}>
                                  <View style={
                                     [homeDashboardStyles.updateInventoryButtonContent,
                                       { justifyContent: 'center' }]}>
                                    <View style={{ flex: 3, alignItems: 'center' }}>
                                      <Text style={{ color: 'black', paddingLeft: 10, fontSize: 20 }}>
                                        {this.state.scheduledTestRide}
                                      </Text>
                                    </View>
                                    <View style={{ flex: 7, justifyContent: 'center' }}>
                                      <Text style={{ color: 'black', fontSize: 15 }}>
                                      Scheduled
                                      </Text>
                                    </View>
                                  </View>
                                </LinearGradient>
                              </TouchableOpacity>
                            </SpringView>
                          </View>
                        </View>
                        <View style={{ flex: 1 }} >
                          <View style={homeDashboardStyles.testRideStatusButton}>
                            <SpringView
                              fadeIn={false}
                              duration={1000}
                              springValue={0.9}
                              style={[homeDashboardStyles.testRideStatusButtonAnimate]} >
                              <TouchableOpacity
                                activeOpacity={0.5}
                                style={{ alignItems: 'center' }} >
                                <LinearGradient
                                  colors={['#da6fff', '#da6fff']}
                                  start={{ x: 0.0, y: 1.0 }}
                                  end={{ x: 1.0, y: 1.0 }}
                                  style={{ alignItems: 'center', justifyContent: 'center', borderRadius: 5 }}>
                                  <View style={
                                     [homeDashboardStyles.updateInventoryButtonContent,
                                       { justifyContent: 'center' }]}>
                                    <View style={{ flex: 3, alignItems: 'center' }}>
                                      <Text style={{ color: 'black', paddingLeft: 10, fontSize: 20 }}>
                                        {this.state.ongoingTestRides}
                                      </Text>
                                    </View>
                                    <View style={{ flex: 7, justifyContent: 'center' }}>
                                      <Text style={{ color: 'black', fontSize: 15 }}>
                                      Ongoing
                                      </Text>
                                    </View>
                                  </View>
                                </LinearGradient>
                              </TouchableOpacity>
                            </SpringView>
                          </View>
                        </View>
                        <View style={{ flex: 1 }} >
                          <View style={homeDashboardStyles.testRideStatusButton}>
                            <SpringView
                              fadeIn={false}
                              duration={1000}
                              springValue={0.9}
                              style={[homeDashboardStyles.testRideStatusButtonAnimate]} >
                              <TouchableOpacity
                                activeOpacity={0.5}
                                style={{ alignItems: 'center' }} >
                                <LinearGradient
                                  colors={['#f6bb45', '#f6bb45']}
                                  start={{ x: 0.0, y: 1.0 }}
                                  end={{ x: 1.0, y: 1.0 }}
                                  style={{ alignItems: 'center', justifyContent: 'center', borderRadius: 5 }}>
                                  <View style={
                                     [homeDashboardStyles.updateInventoryButtonContent,
                                       { justifyContent: 'center' }]}>
                                    <View style={{ flex: 3, alignItems: 'center' }}>
                                      <Text style={{ color: 'black', paddingLeft: 10, fontSize: 20 }}>
                                        {this.state.completedTestRide}
                                      </Text>
                                    </View>
                                    <View style={{ flex: 7, justifyContent: 'center' }}>
                                      <Text style={{ color: 'black', fontSize: 15 }}>
                                      Completed
                                      </Text>
                                    </View>
                                  </View>
                                </LinearGradient>
                              </TouchableOpacity>
                            </SpringView>
                          </View>
                        </View>
                      </View> */}
                    </View>
                    <View style={homeDashboardStyles.testRideStatusLabel}>
                      {this.state.testRideBookings.values.map((value, index) => (
                        <View style={[
                          homeDashboardStyles.testRideStatusLabelContent, {
                          }]}>
                          <View style={[
                            homeDashboardStyles.testRideStatusLabelContentText, {
                              backgroundColor: this.state.testRideBookings.colors[index]
                            }]} />
                          <View style={{ borderRadius: 50, paddingLeft: 5, alignSelf: 'center' }}>
                            <Text>
                              {`${value.label}(${value.value})`}
                            </Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              </View>
            </View>
            <TeamPerformance
              navigation={this.props.navigation}
              enableTargetEdit={this.state.isDealerManager}
              style={{ display: this.state.isDealerManager || this.state.isTeamLead ? 'flex' : 'none' }}
              teamMembers={this.state.teamMembers}
              onManageTeamClick={this.gotoTeam}
              onEditTargetClick={() => { this.props.navigation.navigate('TargetScreen'); }}
            />
          </ScrollView>
        </View>
      </View>
    );
  }
}

export default HomeDashboard;
