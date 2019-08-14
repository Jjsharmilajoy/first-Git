import React from 'react';
import { Animated, Text, View } from 'react-native';
import PropTypes from 'prop-types';
import LinearGradient from 'react-native-linear-gradient';
import Constants from '../../utils/constants';

export default class Toast extends React.Component {
    static propTypes = {
      style: PropTypes.object,
      message: PropTypes.string,
      index: PropTypes.number.isRequired,
      clearMessage: PropTypes.func.isRequired
    }

    static defaultProps = {
      style: null,
      message: ''
    }

    constructor(props) {
      super(props);
      const { message } = this.props;
      this.state = {
        toastMessage: message
      };
      this.animatedValue = new Animated.Value(-100);
      this.animatedWidth = new Animated.Value(0);
      this.fadeAnim = new Animated.Value(0);
    }

    componentDidMount() {
      const { toastMessage } = this.state;
      if (toastMessage) {
        this.callToast(toastMessage);
      }
    }

    /**
     * Animating the view with message
     */
    callToast() {
      const { index } = this.props;
      Animated.parallel([
        Animated.timing(
          this.animatedWidth,
          {
            toValue: 200,
            duration: 3000
          }
        ),
        Animated.timing(
          this.fadeAnim,
          {
            toValue: 1,
            duration: 350
          }
        ),
        Animated.timing(
          this.animatedValue,
          {
            toValue: (index * 70) + 30,
            duration: 350
          }
        )
      ]).start(this.closeToast());
    }

    /**
     * closing and setting the default values for
     * animation and toastmessage in reducer
     */
    closeToast() {
      const { index } = this.props;
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(
            this.animatedValue,
            {
              toValue: -100,
              duration: 200
            }
          ),
          Animated.timing(
            this.fadeAnim,
            {
              toValue: 0,
              duration: 200
            }
          )
        ]).start(() => {
          this.props.clearMessage(index);
        });
      }, Constants.TOAST_SHOW_LENGTH);
    }

    render() {
      const { style } = this.props;
      return (
        <Animated.View style={[{
          backgroundColor: 'white',
          opacity: this.fadeAnim,
          height: 50,
          elevation: 3,
          shadowColor: 'gray',
          shadowOffset: { width: 3, height: 0 },
          minWidth: 200,
          right: 30,
          top: 50,
          position: 'absolute',
          borderTopLeftRadius: 3,
          borderTopRightRadius: 3,
        }, {
          transform: [{ translateY: this.animatedValue }],
        }, style]}>
          <View style={{
            justifyContent: 'center',
            height: 47,
            padding: 10,
          }}>
            <Text style={{
              color: '#4a4a4a',
              fontSize: 12,
              fontWeight: 'bold'
            }}>
              {this.state.toastMessage}
            </Text>
          </View>
          <Animated.View
            style={{
              width: this.animatedWidth,
              borderBottomRightRadius: 3,
              borderBottomLeftRadius: 3
            }}>
            <LinearGradient
              colors={['#f49426', '#f37a2f', '#ef563c', '#f15f3a', '#ee4b40']}
              start={{ x: 0.0, y: 0.0 }}
              end={{ x: 1.0, y: 1.0 }}
              style={{
                borderRadius: 3,
                height: 3
              }} />
          </Animated.View>
        </Animated.View>
      );
    }
}
