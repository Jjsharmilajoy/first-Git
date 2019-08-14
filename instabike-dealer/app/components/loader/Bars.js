import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Animated, ART } from 'react-native';
import AnimatedBar from './AnimatedBar';

const { Surface } = ART;

export default class Bars extends Component {
  static propTypes = {
    size: PropTypes.number,
    colors: PropTypes.array,
    spaceBetween: PropTypes.number
  };

  static defaultProps = {
    spaceBetween: 4,
    size: 20,
    colors: ['#000', '#000', '#000', '#000', '#000']
  };

  state = {
    bars: [
      new Animated.Value(this.props.size),
      new Animated.Value(this.props.size),
      new Animated.Value(this.props.size),
      new Animated.Value(this.props.size),
      new Animated.Value(this.props.size)
    ]
  };

  componentDidMount() {
    this.state.bars.forEach((val, index) => {
      const timer = setTimeout(() => this.animate(index), index * 240);
      this.timers.push(timer);
    });
  }

  componentWillUnmount() {
    this.timers.forEach(timer => clearTimeout(timer));
    this.unmounted = true;
  }

  timers = [];

  animate(index) {
    Animated
      .sequence([
        Animated.timing(this.state.bars[index], {
          toValue: this.props.size * 2.5,
          duration: 600
        }),
        Animated.timing(this.state.bars[index], {
          toValue: this.props.size,
          duration: 600
        })
      ])
      .start(() => {
        if (!this.unmounted) {
          this.animate(index);
        }
      });
  }

  renderBar(index) {
    const { size, spaceBetween, colors } = this.props;
    const width = size / 3;
    const x = (width / 2) + ((width + spaceBetween) * index);

    return (
      <AnimatedBar
        fill={colors[index]}
        width={width}
        height={this.state.bars[index]}
        originY={0.5 * size}
        originX={0.5}
        y={size * 1.5}
        x={x}
    />
    );
  }

  render() {
    const { size, spaceBetween } = this.props;
    const width = ((size / 3) * 5) + (spaceBetween * 4);
    const height = size * 3;
    return (
      <Surface width={width} height={height}>
        {this.renderBar(0)}
        {this.renderBar(1)}
        {this.renderBar(2)}
        {this.renderBar(3)}
        {this.renderBar(4)}
      </Surface>);
  }
}
