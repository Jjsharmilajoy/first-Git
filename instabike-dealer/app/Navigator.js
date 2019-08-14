import React, { Component } from 'react';
import { NetInfo } from 'react-native';
import PropTypes from 'prop-types';
import { createStackNavigator } from 'react-navigation';
import { connect } from 'react-redux';
import { updateNetstatus, saveErrors } from './redux/actions/Global/actionCreators';
import NetworkCheck from '../app/utils/Netinfo';

import SplashScreen from './layouts/Splashscreen/SplashScreen';
import LoginScreen from './layouts/Login/LoginScreen';
import DashboardScreen from './layouts/Dashboard/DashboardScreen';
import SlidingExample from './components/slider/Slider';
import BikePriceScreen from './layouts/PriceDetails/BikePriceDetails';
import OnboardingScreen from './layouts/Onboarding/OnboardingScreen';
import ChooseAccessories from './layouts/ChooseAccessories/ChooseVehicleAccessories';
import ProductDetailScreen from './layouts/ProductDetail/ProductDetailScreen';
import CreateNewLeadScreen from './layouts/CreateNewLead/CreateNewLead';
import FilteredProductsScreen from './layouts/FilteredProductsScreen/FilteredProductsScreen';
import EditTarget from './layouts/EditTarget/EditTarget';
import NewLeadsOverview from './layouts/NewLeadsOverview/NewLeadOverview';
import SearchLead from './layouts/SearchLead/SearchLead';
import LeadHistoryScreen from './layouts/LeadHistory/LeadHistoryScreen';
import LeadFollowUp from './layouts/LeadFollowUp/LeadFollowUp';
// import TransitionConfiguration from './helpers/TransistionConfig';
import LeadDashboard from './layouts/LeadDashboard/LeadDashboard';
import CompareVehiclesScreen from './layouts/CompareVehicles/CompareVehiclesScreen';
import StartTestRide from './layouts/TestRide/StartTestRide/StartTestRide';
import RideSummary from './layouts/TestRide/RideSummary/RideSummary';
import TestRideDateSelection from './layouts/TestRide/PickTestRideDate/TestRideDateSelection';
import VehicleSelection from './layouts/TestRide/VehicleSelection/VehicleSelection';
import FinancierListing from './layouts/FinancierListingScreen/FinancierListingScreen';
import FinanceDocuments from './layouts/FinancierListingScreen/FinanceDocumentsScreen';
import DocumentsUpload from './layouts/FinancierListingScreen/DocumentsUploadScreen';
import FinanceOnboarding from './layouts/FinanceLeadOnboarding/FinanceOnboardingScreen';
import OfferPreferenceScreen from './layouts/FinanceLeadOnboarding/OfferpreferenceScreen';
import DomicileStatusScreen from './layouts/FinanceLeadOnboarding/DomicileStatusScreen';
import ApplicationLoader from './components/ApplicationLoader/ApplicationLoader';

const RootStack = createStackNavigator(
  {
    SplashScreen: {
      screen: SplashScreen
    },
    Login: {
      screen: LoginScreen,
    },
    Onboarding: {
      screen: OnboardingScreen,
    },
    Dashboard: {
      screen: DashboardScreen,
    },
    FinanceOnboarding: {
      screen: FinanceOnboarding
    },
    FinancierListing: {
      screen: FinancierListing
    },
    FinanceDocuments: {
      screen: FinanceDocuments
    },
    DocumentsUpload: {
      screen: DocumentsUpload
    },
    TestRideDateSelectionScreen: {
      screen: TestRideDateSelection
    },
    StartTestRide: {
      screen: StartTestRide
    },
    VehicleSelectionScreen: {
      screen: VehicleSelection
    },
    RideSummary: {
      screen: RideSummary
    },
    NewLeadsOverview: {
      screen: NewLeadsOverview
    },
    LeadFollowUpScreen: {
      screen: LeadFollowUp
    },
    LeadHistory: {
      screen: LeadHistoryScreen
    },
    BikePriceScreen: {
      screen: BikePriceScreen
    },
    FilteredProducts: {
      screen: FilteredProductsScreen
    },
    CreateNewLead: {
      screen: CreateNewLeadScreen
    },
    ProductDetailScreen: {
      screen: ProductDetailScreen,
    },
    Slider: {
      screen: SlidingExample
    },
    TargetScreen: {
      screen: EditTarget
    },
    ChooseAccessories: {
      screen: ChooseAccessories
    },
    SearchLead: {
      screen: SearchLead
    },
    LeadDashboard: {
      screen: LeadDashboard
    },
    CompareVehiclesScreen: {
      screen: CompareVehiclesScreen
    },
    OfferPreferenceScreen: {
      screen: OfferPreferenceScreen
    },
    DomicileStatusScreen: {
      screen: DomicileStatusScreen
    }
  },
  {
    headerMode: 'none',
    mode: 'modal'
  },
);

@connect(
  state => ({
    status: state && state.global && state.global.connection,
    errorSaved: state && state.global && state.global.errorSaved,
    currentUser: state && state.user && state.user.currentUser,
    showIndicator: state && state.loader && state.loader.showIndicator
  }),
  {
    updateNetstatus,
    saveErrors,
  }
)

class Main extends Component {
  static propTypes = {
    status: PropTypes.bool,
    updateNetstatus: PropTypes.func.isRequired,
    saveErrors: PropTypes.func.isRequired,
    currentUser: PropTypes.object.isRequired,
    showIndicator: PropTypes.bool
  }

  static defaultProps = {
    status: false,
    showIndicator: false
  }

  componentDidCatch(error, info) {
    console.log(error, ':::::::::::::::', info);
    const { currentUser } = this.props;
    const errorObj = {
      error: error.toString(),
      user_id: currentUser && currentUser.user && currentUser.user.id ?
        currentUser.user.id :
        null
    };
    this.props.saveErrors(errorObj)
      .then(res => {
        console.log('crash report response', res);
      })
      .catch(err => {
        console.log(err);
      });
  }

  componentDidMount() {
    console.disableYellowBox = true;
    NetInfo.isConnected.addEventListener('connectionChange', this._handleNetInfo);
  }

  componentWillUnmount() {
    NetInfo.isConnected.removeEventListener('connectionChange', this._handleNetInfo);
  }

  _handleNetInfo = async isConnected => {
    if (isConnected) {
      // this.animate('green');
      this.props.updateNetstatus(isConnected);
    } else {
      // this.animate('red');
      this.props.updateNetstatus(isConnected);
    }
  }
  render() {
    return (
      <React.Fragment>
        {
          !this.props.status &&
          <NetworkCheck />
        }
        <ApplicationLoader showIndicator={this.props.showIndicator} />
        <RootStack />
      </React.Fragment>
    );
  }
}

export default Main;
