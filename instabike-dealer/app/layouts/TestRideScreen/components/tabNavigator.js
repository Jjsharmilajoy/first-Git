import React from 'react';
import { createMaterialTopTabNavigator } from 'react-navigation';
import PropTypes from 'prop-types';

import Ongoing from './Ongoing';
import Completed from './Completed';
import Cancelled from './Cancelled';
import Scheduled from './Scheduled';

const HandleTabNavigation = props => {
  const newObj = {
    stackNavigation: props.stackNavigation,
    getCount: props.getCount,
    dateRange: props.dateRange,
    count: props.count,
    loading: props.loading
  };
  return (
    <Navigator screenProps={newObj} />
  );
};

HandleTabNavigation.propTypes = {
  stackNavigation: PropTypes.object.isRequired,
  loading: PropTypes.bool.isRequired,
  dateRange: PropTypes.object.isRequired,
  count: PropTypes.object.isRequired,
  getCount: PropTypes.func.isRequired
};

const Navigator = createMaterialTopTabNavigator({
  Ongoing: {
    screen: Ongoing
  },
  Scheduled: {
    screen: Scheduled
  },
  Completed: {
    screen: Completed
  },
  Cancelled: {
    screen: Cancelled
  }
}, {
  animationEnabled: true,
  tabBarOptions: {
    upperCaseLabel: false,
    labelStyle: {
      fontSize: 12,
    },
    tabStyle: {
      width: 120,
    },
    activeTintColor: '#ffa166',
    indicatorStyle: {
      backgroundColor: '#ffa166'
    },
    inactiveTintColor: 'black',
    style: {
      backgroundColor: 'white'
    }
  }
});

export default HandleTabNavigation;
