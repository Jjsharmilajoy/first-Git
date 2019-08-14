import React from 'react';
import { Animated } from 'react-native';
import PropTypes from 'prop-types';

export default class SlideView extends React.Component {
    static propTypes = {
      style: PropTypes.object,
      children: PropTypes.any.isRequired,
      duration: PropTypes.number.isRequired,
      endValue: PropTypes.number.isRequired,
    }

    static defaultProps = {
      style: PropTypes.object,
    }

    static getDerivedStateFromProps(nextProps) {
      if (nextProps) {
        return {
          currentStepValue: new Animated.Value(nextProps.startValue),
        };
      }
      return null;
    }

    constructor(props) {
      super(props);
      this.state = {
      };
    }

    componentDidMount() {
      this.animate({
        endValue: this.props.endValue,
        duration: 0
      });
    }

    componentDidUpdate() {
      this.animate({
        endValue: this.props.endValue,
        duration: this.props.duration
      });
    }

    animate = ({ endValue, duration }) => {
      Animated.timing(
        this.state.currentStepValue,
        {
          toValue: endValue,
          duration
        }
      ).start();
    }

    render() {
      const { currentStepValue } = this.state;
      return (
        <Animated.View
          style={[this.props.style,
            {
              transform: [{
                translateX: currentStepValue
              }],
            }
          ]}>
          {this.props.children}
        </Animated.View>
      );
    }
}

