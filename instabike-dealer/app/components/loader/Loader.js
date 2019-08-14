import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  View,
  Modal
} from 'react-native';
import { connect } from 'react-redux';
import Spinner from 'react-native-loading-spinner-overlay';
import Bar from './Bars';
import styles from './styles';

const bar = props => (
  <Bar
    style={{ opacity: props.showIndicator || props.loading ? 1 : 0 }}
    size={10}
    colors={['#dd381c', '#f95303', '#f65f05', '#ef8700', '#fa8f1a']}
  />
);
@connect(state => ({
  status: state && state.global && state.global.connection
}), null)
class Loader extends Component {
  static propTypes = {
    status: PropTypes.bool.isRequired,
    showIndicator: PropTypes.bool.isRequired,
    loading: PropTypes.bool
  }

  static defaultProps = {
    loading: false
  }

  render() {
    const { status, showIndicator, loading } = this.props;
    return (
      <Modal
        transparent
        animationType="none"
        visible={showIndicator || loading}
        onRequestClose={() => {}}
        style={{ opacity: 0 }}>
        <View style={styles.modalBackground}>
          <View style={styles.activityIndicatorWrapper}>
            <View style={[styles.container, styles.horizontal, { opacity: showIndicator || loading ? 1 : 0 }]}>
              <Spinner
                visible={status ? showIndicator || loading : false}
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
  showIndicator: PropTypes.bool.isRequired,
  loading: PropTypes.bool
};

bar.defaultProps = {
  loading: false
};

export default Loader;
