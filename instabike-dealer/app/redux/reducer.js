import { combineReducers } from 'redux';
import login from './modules/Login';
import getVehicles from './modules/GetVehicles';
import financier from './modules/Financier';
import inventory from './modules/Inventory';
import onboarding from './modules/Onboarding';
import rideTimings from './modules/RideTimings';
import teamMember from './modules/TeamMember';
import dealerInfo from './modules/DealershipDetails';
import vehicleAccessories from './modules/VehicleAccessories';
import ProductDetail from './modules/ProductDetail';
import filteredVehicles from './modules/filteredVehicles';
import priceBreakdown from './modules/PriceBreakdown';
import target from './modules/Target';
import user from './modules/User';
import global from './modules/Global';
import followUpLeads from './modules/FollowUpLeads';
import newLeadOverView from './modules/NewLeadOverview';
import leads from './modules/Leads';
import leadHistory from './modules/LeadHistory';
import homeDashboard from './modules/HomeDashboard';
import myTeam from './modules/MyTeam';
import compareVehicles from './modules/CompareVehicles';
import testRide from './modules/TestRide';
import myDealership from './modules/MyDealership';
import financierOnboarding from './modules/FinancierOnboarding';
import financierListing from './modules/FinancierListing';
import documentUpload from './modules/DocumentUpload';
import loader from './modules/Loader';
import { LOGOUT_SUCCESS } from './actions/User/actionTypes';
import { ON_APP_LOAD } from './actions/Login/actionTypes';

const rootReducer = combineReducers({
  login,
  getVehicles,
  financier,
  inventory,
  onboarding,
  rideTimings,
  teamMember,
  dealerInfo,
  vehicleAccessories,
  ProductDetail,
  filteredVehicles,
  priceBreakdown,
  target,
  user,
  global,
  followUpLeads,
  newLeadOverView,
  leads,
  leadHistory,
  homeDashboard,
  myTeam,
  compareVehicles,
  testRide,
  myDealership,
  financierOnboarding,
  financierListing,
  documentUpload,
  loader
});

let defaultState = null;

export default (state, action) => {
  switch (action.type) {
    case ON_APP_LOAD:
      defaultState = defaultState || { ...state };
      return state;
    case LOGOUT_SUCCESS:
      state = { ...defaultState };
      return state;
    default:
      break;
  }
  return rootReducer(state, action);
};
