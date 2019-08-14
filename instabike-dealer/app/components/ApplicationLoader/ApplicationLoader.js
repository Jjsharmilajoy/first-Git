import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  View,
  Modal
} from 'react-native';
import { connect } from 'react-redux';
import Spinner from 'react-native-loading-spinner-overlay';
import Bar from '../loader/Bars';
import styles from '../loader/styles';

const bar = props => (
  <Bar
    style={{ opacity: props.showIndicator ? 1 : 0 }}
    size={10}
    colors={['#dd381c', '#f95303', '#f65f05', '#ef8700', '#fa8f1a']}
  />
);
@connect(state => ({
  status: state && state.global && state.global.connection
}), null)
class ApplicationLoader extends Component {
  static propTypes = {
    status: PropTypes.bool.isRequired,
    showIndicator: PropTypes.bool.isRequired
  }

  render() {
    const { status, showIndicator } = this.props;
    return (
      <Modal
        transparent
        animationType="none"
        visible={showIndicator}
        onRequestClose={() => {}}
        style={{ opacity: 0 }}>
        <View style={styles.modalBackground}>
          <View style={styles.activityIndicatorWrapper}>
            <View style={[styles.container, styles.horizontal, { opacity: showIndicator ? 1 : 0 }]}>
              <Spinner
                visible={status ? showIndicator : false}
                textContent="Loading..."
                customIndicator={bar(this.props)}
                textStyle={styles.spinnerTextStyle}
              />
            </View>
          </View>
        </View>
      </Modal>
    );
  }
}

bar.propTypes = {
  showIndicator: PropTypes.bool.isRequired
};

export default ApplicationLoader;
