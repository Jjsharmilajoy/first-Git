import React from 'react';
import { Animated, Easing } from 'react-native';
import PropTypes from 'prop-types';

export default class FlexAnimate extends React.Component {
    static propTypes = {
      style: PropTypes.any,
      children: PropTypes.any.isRequired,
      duration: PropTypes.number.isRequired,
      flexValue: PropTypes.number.isRequired,
      delay: PropTypes.number
    }

    static defaultProps = {
      style: null,
      delay: 0
    }

    constructor(props) {
      super(props);
      this.state = {
        fadeAnim: new Animated.Value(0)
      };
    }

    animateTo = (duration, flexValue, delay) => {
      Animated.sequence([
        Animated.delay(delay || 0),
        Animated.timing(
          this.state.fadeAnim,
          {
            toValue: flexValue,
            easing: Easing.linear(),
            duration,
          }
        )
      ]).start();
    }

    render() {
      const { duration, flexValue, delay } = this.props;
      this.animateTo(duration, flexValue, delay);
      const { fadeAnim } = this.state;
      return (
        <Animated.View
          style={[this.props.style, {
            flex: fadeAnim
          }]}
        >
          {this.props.children}
        </Animated.View>
      );
    }
}

