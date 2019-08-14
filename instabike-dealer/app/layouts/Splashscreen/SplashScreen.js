import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { View, Image, StyleSheet } from 'react-native';
import storage from '../../helpers/AsyncStorage';
import variables from '../../theme/variables';
import { setUser } from '../../redux/actions/User/actionCreators';
import { initialAppLoad } from '../../redux/actions/Login/actionCreators';
import { resetScreens } from '../../actions/stackActions';
import constant from '../../utils/constants';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: variables.primaryBackgroundColor,
    justifyContent: 'center',
    alignItems: 'center'
  },
  logo: {
    position: 'absolute',
    width: 300,
    height: 100
  },
});

@connect(
  null,
  { setUser, initialAppLoad }
)
class SplashScreen extends Component {
  static propTypes = {
    navigation: PropTypes.object.isRequired,
    setUser: PropTypes.func.isRequired,
    initialAppLoad: PropTypes.func.isRequired
  }

  componentDidMount() {
    this.props.initialAppLoad();
    const { navigate } = this.props.navigation;
    this.willFocusSubscription = this.props.navigation.addListener(
      'willFocus',
      () => {
        this.props.initialAppLoad();
      }
    );
    let resetAction;
    let onLoadRoute = 'Login';
    storage.getAllKeys((error, response) => {
      if (response.indexOf('currentUser') !== -1) {
        storage.getJsonObject('currentUser', currentUser => {
          let userLoggedIn = false;
          if (currentUser !== undefined
            && currentUser !== null
            && ((currentUser && currentUser.role === constant.MANAGER
              && currentUser.is_onboarding_done)
              || (currentUser && currentUser.role !== constant.MANAGER))) {
            userLoggedIn = true;
          }
          if (userLoggedIn) {
            this.props.setUser(currentUser);
          }
          onLoadRoute = userLoggedIn ? 'Dashboard' : 'Login';
          resetAction = resetScreens({
            index: 0,
            actions: [{ type: 'Navigate', routeName: onLoadRoute }],
          });
        });
      } else {
        resetAction = resetScreens({
          index: 0,
          actions: [{ type: 'Navigate', routeName: 'Login' }],
        });
      }
    });
    setTimeout(() => {
      this.props.navigation.dispatch(resetAction);
      navigate(onLoadRoute);
    }, 1500);
  }

  render() {
    return (
      <View style={styles.container}>
        <Image
          resizeMode="contain"
          style={styles.logo}
          source={require('../../assets/images/instabikeLogo.png')}
        />
      </View>
    );
  }
}

export default SplashScreen;
