import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  Animated,
  Dimensions,
  Modal
} from 'react-native';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { updateNetstatus } from '../redux/actions/Global/actionCreators';
import storage from '../helpers/AsyncStorage';

const { width } = Dimensions.get('window');
const barWidth = width;
const barHeight = 40;

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
    color: 'white'
  }
});

@connect(state => ({
  status: state && state.global && state.global.connection
}), {
  updateNetstatus
})
export default class NetworkCheck extends Component {
  static propTypes = {
    status: PropTypes.bool.isRequired,
    updateNetstatus: PropTypes.func.isRequired
  }

  constructor(props) {
    super(props);
    this.state = {
      barColor: 'red'
    };
    this.animatedValue = new Animated.Value(0);
  }

  animate = color => {
    this.setState({ barColor: color });
    this.animatedValue.setValue(0);
    Animated.timing(
      this.animatedValue,
      {
        toValue: 0,
        duration: 1000
      }
    ).start(() => this.reverseAnimate());
  }

  reverseAnimate = () => {
    setTimeout(() => {
      Animated.timing(
        this.animatedValue,
        {
          toValue: width,
          duration: 1000
        }
      ).start();
    }, 1000);
  }

  _handleNetInfo = async isConnected => {
    storage.storeStringValues('connectionStatus', JSON.stringify(isConnected));
    if (isConnected) {
      // this.animate('green');
      this.props.updateNetstatus(isConnected);
    } else {
      // this.animate('red');
      this.props.updateNetstatus(isConnected);
    }
  }

  render() {
    const movingPos = this.animatedValue;
    const { barColor } = this.state;
    return (
      <Modal
        transparent
        animationType="none"
        visible={!this.props.status}
        onRequestClose={() => {}}
        style={{ opacity: 0.5 }} >
        <Animated.View
          style={{
            transform: [{ translateX: movingPos }],
            position: 'absolute',
            bottom: 0,
            zIndex: 999,
            height: barHeight,
            width: barWidth,
            backgroundColor: barColor
          }} >
          <Text style={styles.welcome}>
            { this.props.status ? 'Connected with Internet.' : 'No Internet Connection!' }
          </Text>
        </Animated.View>
      </Modal>
    );
  }
}
