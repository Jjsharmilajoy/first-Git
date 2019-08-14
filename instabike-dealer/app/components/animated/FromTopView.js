import React from 'react';
import { Animated, Easing } from 'react-native';
import PropTypes from 'prop-types';

export default class FromTopView extends React.Component {
    static propTypes = {
      style: PropTypes.object,
      children: PropTypes.any.isRequired,
      duration: PropTypes.number.isRequired,
      toValue: PropTypes.number.isRequired,
    }

    static defaultProps = {
      style: null,
    }

    constructor(props) {
      super(props);
      this.state = {
      };
    }

    static getDerivedStateFromProps(props) {
      if (props) {
        return {
          currentStepValue: new Animated.Value(props.initialValue),
          currentOpacity: new Animated.Value(0.5)
        };
      }
      return null;
    }

    componentDidMount() {
      this.animate({
        toValue: this.props.toValue,
        duration: this.props.duration
      });
    }

    componentDidUpdate() {
      this.animate({
        toValue: this.props.toValue,
        duration: 0
      });
    }

    animate=({ toValue, duration }) => {
      Animated.parallel([
        Animated.timing(
          this.state.currentOpacity,
          {
            toValue: 1,
            duration,
            easing: Easing.linear()
          }
        ),
        Animated.timing(
          this.state.currentStepValue,
          {
            toValue,
            duration,
            easing: Easing.linear()
          }
        )
      ]).start();
    }

    render() {
      const { currentStepValue, currentOpacity } = this.state;
      return (
        <Animated.View
          style={[this.props.style, {
            transform: [
              { translateY: currentStepValue }
            ],
            opacity: currentOpacity
          }]}
        >
          {this.props.children}
        </Animated.View>
      );
    }
}

