import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import TestRideCard from './TestRideCard';
import { getTestRideBookedLeads } from '../../../redux/actions/TestRide/actionCreators';
import PaginatedFlatlist from '../../../components/paginatedFlatlist/PaginatedFlatlist';

@connect(
  state => ({
    leads: state.testRide.testRideAvailedLeads,
    loading: state.testRide.loading,
  }),
  {
    getTestRideBookedLeads
  }
)

export default class Completed extends Component {
  static navigationOptions = props => ({
    title: props.navigation.getParam(
      'Completed ',
      `Completed (${props.screenProps.count ?
        props.screenProps.count.completed : 0})`
    ),
    tabBarOnPress: ({ defaultHandler }) => {
      props.navigation.state.params.onFocus();
      defaultHandler();
    },
    swipeEnabled: false
  })

  static propTypes = {
    getTestRideBookedLeads: PropTypes.func.isRequired,
    leads: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.array
    ]),
    navigation: PropTypes.object.isRequired,
    loading: PropTypes.bool.isRequired,
    screenProps: PropTypes.object.isRequired
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
    const {
      leads
    } = nextProps;
    const { dateRange } = nextProps.screenProps;
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
      onFocus: this.getCompletedLeads.bind(this)
    });
  }

  getCompletedLeads = () => {
    try {
      this.props.getTestRideBookedLeads('completed', this.state.dateRange).catch(() => { });
      this.props.screenProps.getCount('completed');
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
      tab="completed"
      />
  )

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
            // scrollEnabled
            />
            /*             <FlatList
              data={this.state.data}
              renderItem={({ item }) => this.showCard(item)}
              keyExtractor={item => item.id}
              horizontal={false}
              numColumns={3}
              extraData={this.state.refreshList}
            /> */
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
                    'No Completed Rides Found... '
                }
              </Text>
            </View>
        }
      </View>
    );
  }
}
