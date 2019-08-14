import { Easing, Animated } from 'react-native';

const Transition = (index, position) => {
  const inputRange = [index - 1, index, index + 0.99, index + 1];

  const opacity = position.interpolate({
    inputRange,
    outputRange: ([0, 1, 1, 0]),
  });

  const translateX = position.interpolate({
    inputRange,
    outputRange: ([50, 0, 0, 0]),
  });
  const translateY = 0;

  return {
    opacity,
    transform: [
      { translateX },
      { translateY }
    ],
  };
};

const TransitionSpec = ({
  duration: 100,
  easing: Easing.bezier(0.2833, 0.99, 0.31833, 0.99),
  timing: Animated.timing,
});

const TransitionConfiguration = () => ({
  transitionSpec: TransitionSpec,
  screenInterpolator: sceneProps => {
    const { position, scene } = sceneProps;
    const { index } = scene;

    return Transition(index, position);
  }
});

export default TransitionConfiguration;
