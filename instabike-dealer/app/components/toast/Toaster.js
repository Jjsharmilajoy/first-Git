import React from 'react';
import { Animated } from 'react-native';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { clearToast } from '../../redux/actions/Global/actionCreators';
import Toast from './Toast';
import Constants from '../../utils/constants';

const globalMessages = [];
let lastMessage = '';

@connect(state => ({
  toastMessage: state.global.toastMessage,
}), {
  clearToast
})
export default class Toaster extends React.Component {
    static propTypes = {
      style: PropTypes.object
    }

    static defaultProps = {
      style: null
    }

    constructor(props) {
      super(props);
      this.state = {
        messages: []
      };
      this.animatedValue = new Animated.Value(-100);
      this.animatedWidth = new Animated.Value(0);
      this.fadeAnim = new Animated.Value(0);
    }

    static getDerivedStateFromProps(nextProps, prevState) {
      const { toastMessage } = nextProps;
      if (toastMessage) {
        // preventing multiple toast messages for session expired.
        if (lastMessage === Constants.SESSION_EXPIRED && toastMessage === Constants.SESSION_EXPIRED) {
          return null;
        }
        nextProps.clearToast();
        globalMessages.push(toastMessage);
        lastMessage = toastMessage;
        return {
          messages: [...prevState.messages, toastMessage]
        };
      }
      return null;
    }

    clearMessage = () => {
      globalMessages.pop();
      if (!globalMessages.length) {
        // setting default values;
        lastMessage = '';
        this.setState({ messages: [] });
      }
    }

    render() {
      const { style } = this.props;
      const { messages } = this.state;
      return (
        <React.Fragment>
          {
            messages.map((message, index) => (
              <Toast
                // eslint-disable-next-line react/no-array-index-key
                key={index}
                style={style}
                index={index}
                message={message}
                clearMessage={this.clearMessage}
                />
            ))
          }
        </React.Fragment>
      );
    }
}
