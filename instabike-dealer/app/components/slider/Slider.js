import React, { Component } from 'react';
import {
  View,
  Animated,
} from 'react-native';
import PropTypes from 'prop-types';
import styles from './sliderStyles';

export default class SlidingExample extends Component {
  constructor(props) {
    super(props);
    this.state = ({
      x: new Animated.Value(this.props.width),
    });
  }

  slide = () => {
    Animated.timing(this.state.x, {
      toValue: this.props.endingPoint,
    }).start();
  };

  render() {
    // In practice you wanna toggle this.slide() after some props validation, I hope
    this.slide();
    return (
      <View>
        <View style={[styles.sliderView, { width: this.props.width }]} />
        <Animated.View
          style={[this.props.style, {
            transform: [
              {
                translateX: this.state.x
              }
            ]
          }, {
            width: this.props.sliderWidth
          }]}
        >
          {/* Your content, such as this.props.children */}
          {this.props.content}
        </Animated.View>
      </View>
    );
  }
}

SlidingExample.propTypes = {
  width: PropTypes.number.isRequired,
  endingPoint: PropTypes.number.isRequired,
  sliderWidth: PropTypes.number.isRequired,
  content: PropTypes.node.isRequired,
  style: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.number,
    PropTypes.array
  ]),
};

SlidingExample.defaultProps = {
  style: null
};
