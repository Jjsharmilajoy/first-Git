import { StackActions } from 'react-navigation';
/**
  Import appropriate Method we need an pass it as a functional parameter as below
  Ex:
  import { pushScreen } from stackActions.js
  this.props.navigation.dispatch(pushScreen({
    routeName: 'Profile',
    params: {
      myUserId: 9,
    }
  }))
* */

/**
  Resets the screen stack with the provided stack actions
  Index relate to current active screen in stack.
  import { NavigationActions } from 'react-navigation';
  index: 1
  actions: [
    NavigationActions.navigate({ routeName: 'Profile' }),
    NavigationActions.navigate({ routeName: 'Settings' }),
  ],
 */
export const resetScreens = ({ index, actions }) => StackActions.reset({
  index, actions
});

/* *
Eg: RouteObj
  {
    routeName: 'Profile',
    params: {
      myUserId: 9,
    }
  }
* */
export const pushScreen = routeObject => StackActions.push(routeObject);

/**
 Pops the screens from current Navigation stack where
 numberOfScreens denote the screens to be popped out
 */
export const popScreens = numberOfScreens => StackActions.pop({
  n: numberOfScreens
});

export const popToTop = () => StackActions.popToTop();

/**
  Replaces the screen with key so that
  nextTime when we call navigate the screens can be diffrent
 */
export const replaceScreen = resetScreenObj => {
  const {
    key, newKey, routeName, params, action
  } = resetScreenObj;
  return StackActions.reset({
    key,
    newKey,
    routeName,
    params,
    action
  });
};
