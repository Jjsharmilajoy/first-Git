import React from 'react';
import { Animated } from 'react-native';
import PropTypes from 'prop-types';

export default class FadeInView extends React.Component {
    static propTypes = {
      style: PropTypes.object,
      children: PropTypes.any.isRequired,
      duration: PropTypes.number.isRequired,
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

    componentDidMount() {
      const { delay } = this.props;
      Animated.sequence([
        Animated.delay(delay || 0),
        Animated.timing(
          this.state.fadeAnim,
          {
            toValue: 1,
            duration: this.props.duration,
          }
        )
      ]).start();
    }

    render() {
      const { fadeAnim } = this.state;
      return (
        <Animated.View
          style={[this.props.style,
            {
              opacity: fadeAnim,
            }
          ]}
        >
          {this.props.children}
        </Animated.View>
      );
    }
}

