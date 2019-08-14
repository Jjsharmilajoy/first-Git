/**
 * Dashboard Screen
 * The Dashboard Screen is the parent component and it renders
 * all the sub components like Home, Leads, Products, Team,
 * Test ride, Inventory.
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { View, Alert, BackHandler, Dimensions } from 'react-native';
// import { StackActions } from 'react-navigation';
import { connect } from 'react-redux';
import LeadDashboard from '../LeadDashboard/LeadDashboard';
import TestRideScreen from '../TestRideScreen/TestRideScreen';
import storage from '../../helpers/AsyncStorage';
import SideNav from '../../components/sideNav/SideNav';
import Home from '../../assets/images/ic_home_selected.png';
import DealerShip from '../../assets/images/ic_mydealership_selected.png';
import Products from '../../assets/images/ic_products_selected.png';
import Team from '../../assets/images/ic_team_selected.png';
import TestRide from '../../assets/images/ic_testride_selected.png';
import updateInventory from '../../assets/images/ic_updateinventory_selected.png';
import Logout from '../../assets/images/Logout.png';
import Lead from '../../assets/images/ic_target_selected.png';
import styles from './dashboardStyles';
import { clearUser, logOutUser, resetSession } from '../../redux/actions/User/actionCreators';
import MyProductsScreen from '../MyProducts/MyProductsScreen';
import HomeDashBoard from '../HomeDashboard/HomeDashboard';
import UpdateInventoryScreen from '../UpdateInventory/UpdateInventoryScreen';
import MyTeam from '../MyTeam/MyTeam';
import MyDealershipScreen from '../MyDealership/MyDealershipScreen';
import { handleSideNav, updateClickedPosition, clearLead, disableButton } from '../../redux/actions/Global/actionCreators';
import {
  clearLeadActivities
} from '../../redux/actions/LeadHistory/actionCreators';
import { resetScreens } from '../../actions/stackActions';
import Loader from '../../components/loader/Loader';
import { shortToast } from '../../utils/toaster';

let backHandlerClickCount = 0;
const DEVICE_WIDTH = Dimensions.get('screen').width;

@connect(state => ({
  currentUser: state.user.currentUser,
  isSideNavOpen: state.global.isSideNavOpen,
  clickedPosition: state.global.clickedPosition,
  isSessionExpired: state.user.isSessionExpired,
  loading: state.user.loadingGroup
}), {
  clearUser,
  handleSideNav,
  logOutUser,
  updateClickedPosition,
  resetSession,
  clearLead,
  clearLeadActivities,
  disableButton
})
export default class DashboardScreen extends Component {
  static propTypes = {
    currentUser: PropTypes.object.isRequired,
    navigation: PropTypes.object.isRequired,
    clearUser: PropTypes.func.isRequired,
    clickedPosition: PropTypes.func.isRequired,
    updateClickedPosition: PropTypes.func.isRequired,
    isSideNavOpen: PropTypes.bool.isRequired,
    loading: PropTypes.bool.isRequired,
    handleSideNav: PropTypes.func.isRequired,
    logOutUser: PropTypes.func.isRequired,
    isSessionExpired: PropTypes.bool.isRequired,
    resetSession: PropTypes.func.isRequired,
    clearLead: PropTypes.func.isRequired,
    clearLeadActivities: PropTypes.func.isRequired,
    disableButton: PropTypes.func.isRequired
  }

  constructor(props) {
    super(props);
    this.state = {
      data: [
        {
          id: 1,
          name: 'Home',
          image: Home,
          icon: 'home',
          key: 'home',
          type: 'Feather',
          handleSubmit: () => this.onSideNavClick(1)
        },
        {
          id: 2,
          name: 'Leads',
          image: Lead,
          icon: 'target',
          key: 'leads',
          type: 'MaterialCommunityIcons',
          handleSubmit: () => this.onSideNavClick(2)
        },
        {
          id: 3,
          name: 'Products',
          image: Products,
          icon: 'handbag',
          key: 'products',
          type: 'SimpleLineIcons',
          handleSubmit: () => this.onSideNavClick(3)
        },
        {
          id: 4,
          name: 'Team',
          image: Team,
          icon: 'user-o',
          key: 'team',
          type: 'FontAwesome',
          handleSubmit: () => this.onSideNavClick(4)
        },
        {
          id: 5,
          name: 'Test Ride',
          image: TestRide,
          icon: 'timer',
          key: 'testRide',
          type: 'MaterialIcons',
          handleSubmit: () => this.onSideNavClick(5)
        },
        {
          id: 6,
          name: 'Inventory',
          icon: 'folder-alt',
          key: 'updateInventory',
          image: updateInventory,
          type: 'SimpleLineIcons',
          handleSubmit: () => this.onSideNavClick(6)
        },
        {
          id: 7,
          name: 'Dealership',
          image: DealerShip,
          icon: 'handshake-o',
          key: 'dealership',
          type: 'FontAwesome',
          handleSubmit: () => this.onSideNavClick(7)
        },
        {
          id: 9,
          name: 'Logout',
          image: Logout,
          key: 'logout',
          icon: 'logout',
          type: 'SimpleLineIcons',
          handleSubmit: this.onLogout
        }
      ],
    };
    this._didFocusSubscription = props.navigation.addListener('didFocus', payload => BackHandler.addEventListener('hardwareBackPress', () => this.onBackButtonPressAndroid(payload)));
  }

  componentDidMount() {
    this.props.clearLead();
    this.props.clearLeadActivities();
    this._willBlurSubscription = this.props.navigation.addListener('willBlur', payload => BackHandler.removeEventListener('hardwareBackPress', () => this.onBackButtonPressAndroid(payload)));
    this.willFocusSubscription = this.props.navigation.addListener(
      'willFocus',
      () => {
        // todo
      }
    );
  }

  componentDidUpdate() {
    const { isSessionExpired } = this.props;
    if (isSessionExpired) {
      this.redirectToLogin();
      this.props.resetSession();
    }
  }

  componentWillUnmount() {
    if (this._didFocusSubscription) {
      this._didFocusSubscription.remove();
    }
    if (this._willBlurSubscription) {
      this._willBlurSubscription.remove();
    }
    backHandlerClickCount = 0;
    this.willFocusSubscription.remove();
  }

  onSideNavClick = position => {
    this.props.disableButton();
    this.props.updateClickedPosition(position);
    this.props.clearLead();
    if (position > 9) {
      this.props.handleSideNav(false);
    }
  }

  onLogout = () => {
    const { currentUser, loading } = this.props;

    if (!loading && currentUser) {
      this.props.logOutUser(currentUser.token).then(() => {
        this.redirectToLogin();
      }, error => {
        console.log('error', error);
        if (error && error.err && !error.err.message.includes('invalidaccesstoken')) {
          Alert.alert(
            'Message',
            'Logout failed...Try again', [{
              text: 'OK',
              onPress: () => { }
            }], {
              cancelable: false
            }
          );
        }
      });
    }
  }

  onBackButtonPressAndroid = () => {
    const { clickedPosition } = this.props;
    backHandlerClickCount += 1;
    if ((clickedPosition !== 1) || !this.props.navigation.isFocused()) {
      if ((backHandlerClickCount < 2)) {
        shortToast('Press again to quit the application!');
      } else {
        BackHandler.exitApp();
      }
    }

    setTimeout(() => {
      backHandlerClickCount = 0;
    }, 2000);

    if (((clickedPosition === 1)
      && (this.props.navigation.isFocused()))) {
      Alert.alert(
        'Exit Application',
        'Do you want to quit application?', [{
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel'
        }, {
          text: 'OK',
          onPress: () => BackHandler.exitApp()
        }], {
          cancelable: false
        }
      );
    } else {
      // this.props.navigation.dispatch(StackActions.pop({
      //   n: 1
      // }));
    }
    return true;
  }

  createNewLead = () => {
    const { navigate } = this.props.navigation;
    navigate('CreateNewLead');
  }

  redirectToLogin = async () => {
    const { navigation } = this.props;
    await storage.clearValues();
    const resetAction = resetScreens({
      index: 0,
      actions: [{ type: 'Navigate', routeName: 'Login' }],
    });
    await navigation.dispatch(resetAction);
  }

  renderMainView = () => {
    switch (this.props.clickedPosition) {
      case 1:
        return (
          <HomeDashBoard
            {...this.props}
            setHeader={this.setHeader} />
        );
      case 2:
        return <LeadDashboard {...this.props} />;
      // this.props.navigation.navigate('LeadHistory', this.props.currentUser);
      // break;
      case 3:
        return (
          <MyProductsScreen
            navigation={this.props.navigation}
            leadOnBoard={this.createNewLead} />
        );
      case 4:
        return (
          <MyTeam
            navigation={this.props.navigation}
        />
        );
      case 5:
        return <TestRideScreen {...this.props} />;
      case 6:
        return (
          <UpdateInventoryScreen
            navigation={this.props.navigation}
        />
        );
      case 7:
        return (
          <MyDealershipScreen
            navigation={this.props.navigation} />
        );
      case 9:
        break;
      default:
        break;
    }
  }

  render() {
    const { isSideNavOpen } = this.props;
    return (
      <View style={styles.container}>
        <Loader loading={this.props.loading} />
        <View style={styles.body}>
          <View style={{ flex: 12, flexDirection: 'row', backgroundColor: '#ECF1F8' }}>
            {isSideNavOpen
            && (
            <SideNav
              navigation={this.props.navigation}
              tileData={this.state.data}
              selectedTile={this.props.clickedPosition}
              currentUser={this.props.currentUser}
              />
            )
          }
            <View style={{ flex: (DEVICE_WIDTH > 900 ? 11 : 8) }}>
              {this.renderMainView()}
            </View>
          </View>
        </View>
      </View>
    );
  }
}
