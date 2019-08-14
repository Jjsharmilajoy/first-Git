import React from 'react';
import {
  View,
  TouchableOpacity,
} from 'react-native';
import PropTypes from 'prop-types';
import LinearGradient from 'react-native-linear-gradient';

const GradientBorderTile = props => (
  <View style={{
    justifyContent: 'center',
    width: props.width,
    height: props.height,
    style: props.style
  }}>
    <TouchableOpacity style={{
      alignItems: 'center',
    }}>
      <LinearGradient
        colors={props.colors}
        start={{ x: 0.0, y: 1.0 }}
        end={{ x: 1.0, y: 1.0 }}
        style={{
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <View style={{
          width: (props.width - (2 * props.borderWidth)),
          height: (props.height - (2 * props.borderWidth)),
          margin: 2,
          flexDirection: 'row',
          backgroundColor: 'white',
        }}>
          {props.children}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  </View>
);

GradientBorderTile.propTypes = {
  colors: PropTypes.string.isRequired,
  children: PropTypes.element,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  borderWidth: PropTypes.number.isRequired,
  style: PropTypes.object
};

GradientBorderTile.defaultProps = {
  children: null,
  style: {}
};

module.exports = {
  GradientBorderTile
};
