import React from 'react';
import { Text } from 'react-native';
import PropTypes from 'prop-types';

export default class CounterAnimate extends React.Component {
    static propTypes = {
      count: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number
      ]),
      delay: PropTypes.number,
      textStyle: PropTypes.oneOfType([
        PropTypes.object,
        PropTypes.array
      ]),
    };

    static defaultProps = {
      count: 0,
      delay: 0,
      textStyle: {}
    };

    constructor(props) {
      super(props);
      this.state = {
        count: this.props.count,
        currentStep: 0,
      };
      this.counterInterval = null;
      this.countDelayRatio = 1;
    }

    componentDidMount() {
      if (this.props.count) {
        this.animateCounter();
      }
    }

    componentWillReceiveProps() {
      const { count } = this.props;
      if (count && (count !== this.state.count)) {
        // Updating new count for animating
        // eslint-disable-next-line
        this.setState({ count }, this.animateCounter);
      }
    }

    stepUp = () => {
      let { currentStep } = this.state;
      const { count } = this.state;
      if (currentStep < count) {
        currentStep += (count > 400) ? 30 : 2;
        currentStep = (currentStep >= count) ? count : currentStep;
        this.setState({ currentStep });
      } else if (this.counterInterval) {
        clearInterval(this.counterInterval);
      }
    }

    animateCounter = () => {
      const { count } = this.state;
      const { delay } = this.props;
      this.countDelayRatio = (count < 400) ? (delay / count) : (delay / count) * 5;
      if (count && parseInt(count, 10)) {
        this.counterInterval = setInterval(() => {
          this.stepUp();
        }, this.countDelayRatio);
      } else {
        this.setState({ currentStep: count });
      }
    }

    render() {
      const {
        currentStep
      } = this.state;
      return (
        <Text style={this.props.textStyle}>
          {currentStep}
        </Text>
      );
    }
}
