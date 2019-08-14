import React from 'react';
import { View, Text } from 'react-native';
import PropTypes from 'prop-types';

import styles from './testRideHeaderStyles';

const TestRideHeader = props => {
  const { lead } = props;
  return (
    lead ?
      <View style={styles.headerContainer}>
        <View style={{ flex: 1, flexDirection: 'row' }}>
          <View style={styles.headerTextContent}>
            <Text style={{ color: 'white', paddingHorizontal: 5 }}>
              {lead.name}
            </Text>
            <Text style={{ color: 'gray', paddingHorizontal: 5 }} />
          </View>
          <View style={styles.headerTextContent}>
            <Text style={{ color: 'white', paddingHorizontal: 5 }}>
              {lead.mobile_number}
            </Text>
            <Text style={{ color: 'gray', paddingHorizontal: 5 }} />
          </View>
          <View style={{ flex: 2, flexDirection: 'row', alignItems: 'center' }} />
        </View>
      </View>
      :
      null
  );
};

TestRideHeader.propTypes = {
  lead: PropTypes.object.isRequired,
};

export default TestRideHeader;
