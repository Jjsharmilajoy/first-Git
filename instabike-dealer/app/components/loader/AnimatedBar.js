import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Animated, ART } from 'react-native';

const { Shape, Path } = ART;

// eslint-disable-next-line react/prefer-stateless-function
class Bar extends Component {
  render() {
    const { width, height } = this.props;
    const path = Path()
      .moveTo(width / -2, height * -1.5)
      .line(0, height)
      .line(width, 0)
      .line(0, height)
      .line(-width, 0)
      .close();
    return <Shape {...this.props} d={path} />;
  }
}

Bar.propTypes = {
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired
};

export default Animated.createAnimatedComponent(Bar);
