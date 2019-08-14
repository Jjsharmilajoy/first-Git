import React, { Component, Fragment } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import TestRideCard from './TestRideCard';
import styles from './testRideCardStyles';
import PaginatedFlatlist from '../../../components/paginatedFlatlist/PaginatedFlatlist';
import { getTestRideBookedLeads } from '../../../redux/actions/TestRide/actionCreators';
import { updateLeadDetail } from '../../../redux/actions/LeadHistory/actionCreators';
import { getLead } from '../../../redux/actions/Global/actionCreators';

@connect(
  state => ({
    lead: state.global.lead,
    leads: state.testRide.testRideAvailedLeads,
    loading: state.testRide.loadingGroup,
    count: state.leads.count
  }),
  {
    getTestRideBookedLeads,
    updateLeadDetail,
    getLead
  }
)

export default class InvoicedLeads extends Component {
  static navigationOptions = props => ({
    title: props.navigation.getParam(
      'Scheduled ',
      `Scheduled (${props.screenProps.count ?
        props.screenProps.count.scheduled : 0})`
    ),
    tabBarOnPress: ({ defaultHandler }) => {
      props.navigation.state.params.onFocus();
      defaultHandler();
    },
    swipeEnabled: false
  })

  static propTypes = {
    getTestRideBookedLeads: PropTypes.func.isRequired,
    getLead: PropTypes.func.isRequired,
    navigation: PropTypes.object.isRequired,
    loading: PropTypes.bool.isRequired,
    screenProps: PropTypes.object.isRequired,
    lead: PropTypes.object.isRequired,
    updateLeadDetail: PropTypes.func.isRequired
  }

  // eslint-disable-next-line
  static getDerivedStateFromProps(nextProps, prevState) {
    const { leads } = nextProps;
    const { dateRange } = nextProps.screenProps;
    return {
      data: leads,
      ...InvoicedLeads.getCountsForEachCategory(leads, prevState),
      dateRange,
      refreshList: !prevState.refreshList
    };
  }

  static getCountsForEachCategory(overAllList, prevState) {
    if (overAllList) {
      let {
        pending, overDue
      } = prevState;
      const newArray = [];
      if (('pending' in overAllList)) {
        pending = overAllList.pending.length;
        newArray.push('pending');
      }
      if (('overDue' in overAllList)) {
        overDue = overAllList.overDue.length;
        newArray.push('overDue');
      }
      return {
        pending,
        overDue,
        categoryList: newArray.length > 0 ? newArray : []
      };
    }
  }

  constructor(props) {
    super(props);
    this.state = {
      data: [],
      widthOfLayout: 300,
      categoryList: null,
      pending: 0,
      overDue: 0,
      refreshList: false,
      dateRange: this.props.screenProps.dateRange
    };
  }

  componentDidMount() {
    this.props.navigation.setParams({
      onFocus: this.getScheduledLeads.bind(this)
    });
  }

  getScheduledLeads = () => {
    Promise.all([
      this.props.getTestRideBookedLeads('scheduled', this.state.dateRange).catch(() => { }),
      this.props.screenProps.getCount('scheduled')
    ]).catch(error => {
      console.log('Error', error);
    });
  }

  getLeadOverViewList = () => (
    <View style={styles.leadOverviewStyle}>
      {
        this.state.categoryList && this.state.categoryList.map((currentItem, index) => (
          <View
            style={styles.leadCardOverviewStyle}
            // eslint-disable-next-line
            key={index}>
            <View style={currentItem === 'pending' ?
              [styles.leadHeaderView, { backgroundColor: '#979797' }] : styles.leadHeaderView} >
              <Text style={[styles.pendingTextStyle, { flex: 1 }]}>
                {this.updateCategoryCount(currentItem)}
              </Text>
            </View>
            {
              this.state.data && this.state.data[currentItem] && this.state.data[currentItem].length > 0 ?
                <PaginatedFlatlist
                  style={{ marginBottom: 10 }}
                  keyExtractor={item => item.id}
                  data={this.state.data[currentItem]}
                  renderItem={this.showCard}
                  extraData={this.state.refreshList}
                  numberOfVisibleItems={2}
                />
                :
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={{
                    alignSelf: 'center',
                    fontSize: 18,
                    fontFamily: 'SourceSansPro-Bold',
                    color: '#4a4a4a'
                  }}> {
                    this.props.loading ?
                      '' :
                      `No ${currentItem} Rides Found... `
                  }
                  </Text>
                </View>
            }
          </View>
        ))
      }
    </View>
  )

  getWidth = layout => {
    const { width } = layout;
    this.setState({
      widthOfLayout: (width / 3) - 20
    });
  }

  updateCategoryCount = category => {
    switch (category) {
      case 'pending':
        return `Pending(${this.state.pending})`;
      case 'overDue':
        return `Overdue(${this.state.overDue})`;
      default:
        break;
    }
  }

  showCard = item => (
    <TestRideCard
      item={item}
      dropdownData={this.state.executiveData}
      widthOfCard={this.state.widthOfLayout}
      startTestRide={() => this.startTestRide(item)}
      rescheduleTestRide={() => this.rescheduleTestRide(item)}
      cancelTestRide={() => this.cancelTestRide(item)}
      tab="scheduled"
    />
  )

  startTestRide = item => {
    const { stackNavigation } = this.props.screenProps;
    stackNavigation.navigate('StartTestRide', { item });
  }

  rescheduleTestRide = item => {
    const { stackNavigation } = this.props.screenProps;
    const leadDetail = {
      ...item,
      test_ride_on: null
    };
    this.props.getLead(item.lead_id).then(() => {
      stackNavigation.navigate('TestRideDateSelectionScreen', {
        lead: { ...this.props.lead },
        leadDetail
      });
    }).catch(() => { });
  }

  cancelTestRide = item => {
    const leadDetail = {
      ...item,
      test_ride_status: 500
    };
    delete leadDetail.vehicle;
    delete leadDetail.lead;
    delete leadDetail.document;
    Alert.alert(
      'Cancel Test Ride',
      'Do you want to cancel this test ride?',
      [
        { text: 'Cancel', onPress: () => { }, style: 'cancel' },
        {
          text: 'OK',
          onPress: () =>
            this.props.updateLeadDetail(item.id, leadDetail).then(() => {
              this.getScheduledLeads();
            }).catch(() => { })
        },
      ],
      { cancelable: false }
    );
  }

  render() {
    return (
      <Fragment>
        {
          this.state.categoryList && this.state.categoryList.length > 0 &&
          <ScrollView
            style={{
              flex: 1,
              flexDirection: 'row',
            }}
            scrollEnabled
            horizontal
            overScrollMode="always">
            {this.getLeadOverViewList()}
          </ScrollView>
        }
      </Fragment>
    );
  }
}
