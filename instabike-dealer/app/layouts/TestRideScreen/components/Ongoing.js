import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import TestRideCard from './TestRideCard';
import { getTestRideBookedLeads } from '../../../redux/actions/TestRide/actionCreators';
import { updateLeadDetail } from '../../../redux/actions/LeadHistory/actionCreators';
import PaginatedFlatlist from '../../../components/paginatedFlatlist/PaginatedFlatlist';

@connect(
  state => ({
    leads: state.testRide.testRideAvailedLeads,
    loading: state.testRide.loading
  }),
  {
    getTestRideBookedLeads,
    updateLeadDetail
  }
)

export default class Ongoing extends Component {
  static navigationOptions = props => ({
    title: props.navigation.getParam(
      'Ongoing ',
      `Ongoing (${props.screenProps.count ?
        props.screenProps.count.ongoing : 0})`
    ),
    tabBarOnPress: ({ defaultHandler }) => {
      props.navigation.state.params.onFocus();
      defaultHandler();
    },
    swipeEnabled: false
  })

  static propTypes = {
    getTestRideBookedLeads: PropTypes.func.isRequired,
    updateLeadDetail: PropTypes.func.isRequired,
    leads: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.array
    ]),
    screenProps: PropTypes.object.isRequired,
    navigation: PropTypes.object.isRequired,
    loading: PropTypes.bool.isRequired,
  }

  static defaultProps = {
    leads: []
  }

  constructor(props) {
    super(props);
    this.state = {
      data: [],
      widthOfLayout: 276,
      refreshList: false,
      dateRange: this.props.screenProps.dateRange
    };
  }

  static getDerivedStateFromProps = (nextProps, prevState) => {
    const { dateRange } = nextProps.screenProps;
    const {
      leads
    } = nextProps;
    if (leads && leads.length >= 0) {
      return {
        data: [...leads],
        refreshList: !prevState.refreshList,
        dateRange
      };
    }
    return null;
  }

  componentDidMount() {
    this.props.navigation.setParams({
      onFocus: this.getOngoingLeads.bind(this)
    });
  }

  getOngoingLeads = () => {
    try {
      this.props.getTestRideBookedLeads('ongoing', this.state.dateRange).catch(() => { });
      this.props.screenProps.getCount('ongoing');
    } catch (error) {
      console.log('Error', error);
    }
  }

  getWidth = layout => {
    const { width } = layout;
    this.setState({
      widthOfLayout: (width / 3) - 20
    });
  }

  showCard = item => (
    this.state.widthOfLayout !== 0 &&
    <TestRideCard
      item={item}
      widthOfCard={this.state.widthOfLayout}
      completeTestRide={() => this.completeTestRide(item)}
      tab="ongoing"
      />
  )

  completeTestRide = item => {
    const leadDetail = {
      ...item,
      test_ride_status: 400
    };
    delete leadDetail.vehicle;
    delete leadDetail.lead;
    delete leadDetail.document;
    this.props.updateLeadDetail(item.id, leadDetail).then(() => {
      this.getOngoingLeads();
    }).catch(() => { });
  }

  render() {
    const { data } = this.state;
    return (
      <View
        style={{
          flex: 1,
          paddingVertical: 10,
          backgroundColor: '#F2F2F2'
        }}
        onLayout={event => this.getWidth(event.nativeEvent.layout)}>
        {
          this.state.data && this.state.data.length > 0 ?
            <PaginatedFlatlist
              style={{ marginBottom: 10 }}
              keyExtractor={item => item.id}
              data={data}
              numColumns={3}
              numberOfVisibleItems={6}
              renderItem={this.showCard}
              extraData={this.state.refreshList}
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
                    'No Ongoing Rides Found... '
                }
              </Text>
            </View>
        }
      </View>
    );
  }
}
