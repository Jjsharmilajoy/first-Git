/**
 * This component renders the Dealership information like monthly performance, updating dealership
 * profile, updating dealer accessories and so on. It is only visible
 * for Dealer Manager.
 */
import React, { Component } from 'react';
import {
  ScrollView,
  KeyboardAvoidingView,
  Text,
  View,
  TouchableOpacity,
  Image,
  FlatList,
  Modal,
  Alert,
  Animated,
  DatePickerAndroid,
  TimePickerAndroid,
  TextInput
} from 'react-native';
import { connect } from 'react-redux';
import { Buffer } from 'buffer';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/FontAwesome';
import PropTypes from 'prop-types';
import DraggableFlatList from 'react-native-draggable-flatlist';
import moment from 'moment';
import {
  getFinancierList,
  updateFinancierList,
  updateUserStatus
} from '../../redux/actions/Financier/actionCreators';
import { setUser } from '../../redux/actions/User/actionCreators';
import UserInput from '../../components/userInput/UserInput';
import {
  emailValidator, mobileNumberValidator,
  passwordStrengthValidator, isAlphaOnly, trimExtraspaces
} from '../../utils/validations';
import { toast } from '../../utils/toaster';
import TargetGraph from '../../components/charts/TargetGraph';
import AppHeader from '../../components/header/Header';
import Close from '../../assets/images/small_close.png';
import largeClose from '../../assets/images/close.png';
import { SecondaryButton, GradientButtonLarge } from '../../components/button/Button';
import suzukiLogo from '../../assets/images/suzuki/logo.png';
import heroLogo from '../../assets/images/hero/logo.png';
import flashLogo from '../../assets/images/flash/logo.png';
import { styles, HeaderStyles } from './myDealershipStyles';
import { getDealerTargets, getTargetSummary } from '../../redux/actions/Target/actionCreators';
import { updatePassword } from '../../redux/actions/Login/actionCreators';
import loadDealership from '../../redux/actions/DealershipDetails/actionCreators';
import Loader from '../../components/loader/Loader';
import teamMemberStyles from '../TeamMember/teamMemberStyles';
import SectionedMultiSelect from '../../components/multiSelectDropdown/sectioned-multi-select';
import constants from '../../utils/constants';
import storage from '../../helpers/AsyncStorage';
import {
  loadProductSummary,
  loadProducts, updateDealershipDetails, sendLeadReport
} from '../../redux/actions/MyDealership/actionCreators';
import { showIndicator, hideIndicator } from '../../redux/actions/Loader/actionCreators';

let manufacturerLogo = suzukiLogo;
if (constants.manufacturer === 'hero') {
  manufacturerLogo = heroLogo;
} else if (constants.manufacturer === 'flash') {
  manufacturerLogo = flashLogo;
}

let isPasswordValid;
@connect(state => ({
  resetLoading: state.login.loadingGroup,
  newAuthToken: state.login.newAuthToken,
  currentUser: state.user.currentUser,
  targetSummary: state.target.targetSummary,
  dealerDetail: state.dealerInfo.detail,
  userDetail: state.financier.data,
  addedFinancierList: state.financier.addedFinancierList,
  dealerTargets: state.target.dealerTargets,
  loading: state.target.loadingGroup || state.financier.loadingGroup || state.myDealership.loadingGroup,
  unaddedFinancierList: state.financier.unaddedFinancierList,
  productSummary: state.myDealership.productSummary,
  productList: state.myDealership.productList,
  isSideNavOpen: state.global.isSideNavOpen,
  leadreportObj: state.myDealership.leadreportObj,
}), {
  updatePassword,
  setUser,
  getTargetSummary,
  loadDealership,
  getFinancierList,
  updateFinancierList,
  getDealerTargets,
  updateUserStatus,
  updateDealershipDetails,
  loadProductSummary,
  loadProducts,
  sendLeadReport,
  showIndicator,
  hideIndicator
})
class MyDealershipScreen extends Component {
  static propTypes = {
    navigation: PropTypes.object.isRequired,
    dealerDetail: PropTypes.object,
    currentUser: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.number,
      PropTypes.array,
    ]).isRequired,
    // eslint-disable-next-line
    userDetail: PropTypes.array,
    addedFinancierList: PropTypes.array,
    unaddedFinancierList: PropTypes.array,
    loadDealership: PropTypes.func.isRequired,
    setUser: PropTypes.func.isRequired,
    updatePassword: PropTypes.func.isRequired,
    updateUserStatus: PropTypes.func.isRequired,
    updateDealershipDetails: PropTypes.func.isRequired,
    loadProductSummary: PropTypes.func.isRequired,
    loadProducts: PropTypes.func.isRequired,
    getFinancierList: PropTypes.func.isRequired,
    updateFinancierList: PropTypes.func.isRequired,
    showIndicator: PropTypes.func.isRequired,
    hideIndicator: PropTypes.func.isRequired,
    getDealerTargets: PropTypes.func.isRequired,
    dealerTargets: PropTypes.array.isRequired,
    loading: PropTypes.bool.isRequired,
    newAuthToken: PropTypes.string.isRequired,
    getTargetSummary: PropTypes.func.isRequired,
    productSummary: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.array,
    ]),
    // eslint-disable-next-line
    productList: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.array,
    ]),
    isSideNavOpen: PropTypes.bool.isRequired,
    resetLoading: PropTypes.bool.isRequired,
    sendLeadReport: PropTypes.func.isRequired,
    leadreportObj: PropTypes.object,
  }

  static defaultProps = {
    addedFinancierList: [],
    unaddedFinancierList: [],
    userDetail: [],
    dealerDetail: {},
    productSummary: [],
    productList: [],
    leadreportObj: {}
  }

  static getHeaderLabel = currentRole => {
    switch (currentRole) {
      case constants.SALES_EXECUTIVE:
        return 'Sales Target';
      case constants.DEALER_TEAM_HEAD:
        return 'Team Target';
      case constants.MANAGER:
        return 'Dealership Target';
      default:
        return 'Target';
    }
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.currentUser && prevState.userName === '') {
      const { user } = nextProps.currentUser;
      if (user && user.user_role.length > 0 && user.user_role[0].role) {
        return {
          isDealerManager: user.user_role[0].role.name === 'DEALER_MANAGER',
          userName: `${user.first_name} ${user.last_name}`,
          currentRole: user.user_role[0].role.name,
        };
      }
    }
    if (nextProps.targetSummary && nextProps.dealerDetail
      && nextProps.productList && nextProps.dealerDetail
      && nextProps.userDetail) {
      const { dealerDetail, userDetail } = nextProps;
      const scooterSummary = nextProps.targetSummary.filter(summary => !summary.vehicle_type);
      const bikeSummary = nextProps.targetSummary.filter(summary => summary.vehicle_type);
      const targets = MyDealershipScreen.getTargetSummary(prevState, scooterSummary, bikeSummary);
      const { targetLabels, currentRole } = prevState;
      targetLabels[1] = MyDealershipScreen.getHeaderLabel(currentRole);
      return {
        targets,
        targetLabels,
        vehicleList: [{
          children: nextProps.productList
        }],
        ...MyDealershipScreen.getManagerDetailsMapped(dealerDetail),
        dealerDetail,
        userDetail
      };
    }
    return null;
  }

  static getTargetSummary(prevState, scooterSummaries, bikeSummaries) {
    let defaultTargets = JSON.parse(JSON.stringify(prevState.defaultTargets));
    const defaultSummary = {
      vehicle_type: 0,
      manufacturer_target: 0,
      sold_count: 0,
      dealer_target: 0
    };
    const bikeSummary = bikeSummaries && bikeSummaries.length > 0 ? bikeSummaries[0] : defaultSummary;
    const scooterSummary = scooterSummaries && scooterSummaries.length > 0 ? scooterSummaries[0] : defaultSummary;

    defaultTargets = defaultTargets.map((target, index) => {
      if (index === 0) {
        target.mt = (bikeSummary.manufacturer_target ? parseInt(bikeSummary.manufacturer_target, 10) : 0)
          + (scooterSummary.manufacturer_target ? parseInt(scooterSummary.manufacturer_target, 10) : 0);
        target.dt = (bikeSummary.dealer_target ? parseInt(bikeSummary.dealer_target, 10) : 0)
          + (scooterSummary.dealer_target ? parseInt(scooterSummary.dealer_target, 10) : 0);
        target.mtd = (bikeSummary.sold_count ? parseInt(bikeSummary.sold_count, 10) : 0)
          + (scooterSummary.sold_count ? parseInt(scooterSummary.sold_count, 10) : 0);
      }
      if (index === 1) {
        target.mtd = bikeSummary.sold_count ? parseInt(bikeSummary.sold_count, 10) : 0;
        target.mt = bikeSummary.manufacturer_target
          ? parseInt(bikeSummary.manufacturer_target, 10) : 0;
        target.dt = bikeSummary.dealer_target
          ? parseInt(bikeSummary.dealer_target, 10) : 0;
      }
      if (index === 2) {
        target.mtd = scooterSummary.sold_count ? parseInt(scooterSummary.sold_count, 10) : 0;
        target.mt = scooterSummary.manufacturer_target ? parseInt(scooterSummary.manufacturer_target, 10) : 0;
        target.dt = scooterSummary.dealer_target ? parseInt(scooterSummary.dealer_target, 10) : 0;
      }
      return target;
    });
    return defaultTargets;
  }

  static getManagerDetailsMapped(dealerDetail) {
    return {
      userName: dealerDetail.managers && dealerDetail.managers.length > 0
        ? `${dealerDetail.managers[0].first_name} ${dealerDetail.managers[0].last_name !== null
          ? dealerDetail.managers[0].last_name : ''}` : '',
      landline_no: dealerDetail && dealerDetail.landline_no && dealerDetail.landline_no.length > 0
        ? dealerDetail.landline_no : '',
      first_name: dealerDetail.managers && dealerDetail.managers.length > 0
        ? dealerDetail.managers[0].first_name : '',
      last_name: dealerDetail.managers && dealerDetail.managers.length > 0
        ? dealerDetail.managers[0].last_name : '',
      mobile_no: dealerDetail && dealerDetail.mobile_no && dealerDetail.mobile_no.length > 0
        ? dealerDetail.mobile_no.split(',') : '',
      email: dealerDetail && dealerDetail.email && dealerDetail.email.length > 0
        ? dealerDetail.email.split(',') : '',
    };
  }

  constructor(props) {
    super(props);
    this.animatedValue = new Animated.Value(-70);
    this.defaultFilterData = {
      fromDate: moment().subtract(6, 'months').format(),
      toDate: moment().format()
    };
    this.state = ({
      isFinancierUpdated: false,
      showError: false,
      errorTitle: '',
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
      showNewPass: true,
      showConfirmPass: true,
      showOldPass: true,
      selectedTarget: null,
      userName: '',
      first_name: '',
      last_name: '',
      landline_no: '',
      selectedArray: [],
      currentlyAddedFinanciers: this.props.addedFinancierList,
      currentlyUnaddedFinanciers: this.props.unaddedFinancierList,
      modalVisible: false,
      showProfileModal: false,
      refreshFlatList: false,
      firstNameError: false,
      lastNameError: false,
      toastMessage: '',
      mobile_no: [''],
      mobile_no_value: '',
      mobileError: 'Invalid Mobile Number',
      showMobileError: [],

      email: [''],
      email_value: '',
      emailError: 'Enter a valid Email Id',
      showEmailError: [],
      dealershipInfo: this.props.dealerDetail,
      vehicleIds: [],
      filterData: JSON.parse(JSON.stringify(this.defaultFilterData)),
      targetLabels: ['Manufacturer Target', 'Dealer Target', 'Manufacturer, Dealer Target'],
      leadReportFromDate: '',
      leadReportFromtime: '',
      leadReportToDate: '',
      leadReportTotime: '',
      leadReportFromHours: 0,
      leadReportFromMinutes: 0,
      leadReportFromDay: 0,
      leadReportFromMonths: 0,
      leadReportFromYears: 0,
      leadReportToHours: 0,
      leadReportToMinutes: 0,
      leadReportToDay: 0,
      leadReportToMonths: 0,
      leadReportToYears: 0,
      leadReportEmail: '',
      defaultTargets: [
        {
          id: 1,
          targetName: 'Overall Completion',
          mtd: 0,
          mt: 0,
          dt: 0,
        },
        {
          id: 2,
          targetName: 'Scooter Target Completion',
          mtd: 0,
          mt: 0,
          dt: 0,
        },
        {
          id: 3,
          targetName: 'Bike Target Completion',
          mtd: 0,
          mt: 0,
          dt: 0,
        }
      ],
      targets: [
        {
          id: 1,
          targetName: 'Overall Completion',
          mtd: 0,
          mt: null,
          dt: null,
        },
        {
          id: 2,
          targetName: 'Scooter Target Completion',
          mtd: 0,
          mt: null,
          dt: null,
        },
        {
          id: 3,
          targetName: 'Bike Target Completion',
          mtd: 0,
          mt: null,
          dt: null,
        }
      ]
    });
  }

  componentDidMount() {
    const { currentUser } = this.props;
    if (currentUser && Object.keys('currentUser').length > 0 && currentUser.dealerId && currentUser.dealerId.length > 0) {
      const { dealerId } = currentUser;
      this.props.showIndicator();
      this.props.getDealerTargets(dealerId).then(() => {
        const lastManufacturerTargetDetails = this.props.dealerTargets &&
        this.props.dealerTargets.length > 0
          ? this.props.dealerTargets[0] : null;
        let startOfMonth = moment().startOf('month').format('YYYY-MM-DD');
        let endOfMonth = moment().endOf('month').format('YYYY-MM-DD');
        if (lastManufacturerTargetDetails) {
          startOfMonth = moment(lastManufacturerTargetDetails.target_from_date).format('YYYY-MM-DD');
          endOfMonth = moment(lastManufacturerTargetDetails.target_to_date).format('YYYY-MM-DD');
        }
        this.props.getTargetSummary(dealerId, startOfMonth, endOfMonth);
      }).catch(() => {});

      Promise.all([
        this.props.loadDealership(dealerId),
        this.props.getFinancierList(dealerId)
      ]).then(() => {
        this.setState({
          currentlyAddedFinanciers: this.props.addedFinancierList.slice(),
          currentlyUnaddedFinanciers: this.props.unaddedFinancierList.slice()
        });
        const { filterData: { fromDate, toDate } } = this.state;
        const data = {
          start: fromDate,
          end: toDate
        };
        this.props.loadProducts(dealerId, data);
        this.props.hideIndicator();
      }).catch(error => {
        this.props.hideIndicator();
        console.log('Error', error);
      });
    }
  }

  // eslint-disable-next-line
  onTargetSelect = (value, index, targets) => {
    const { dealerId } = this.props.currentUser;
    this.setState({
      selectedTarget: targets[index]
    }, () => {
      this.props.getTargetSummary(dealerId, targets[index].fromDate, targets[index].toDate);
    });
  }

  static getHeaderLabel = currentRole => {
    switch (currentRole) {
      case constants.SALES_EXECUTIVE:
        return 'Sales Target';
      case constants.DEALER_TEAM_HEAD:
        return 'Team Target';
      case constants.MANAGER:
        return 'Dealership Target';
      default:
        return 'Target';
    }
  }

  onSearchProductClick = () => {
    this.props.navigation.navigate('SearchLead', { isFilterOpen: false });
  }

  onSelectedItemsChange = vehicleIds => {
    this.setState({
      vehicleIds,
    });
  }

  setDefaultUserDetails = () => {
    this.setState({
      showProfileModal: false,
      ...MyDealershipScreen.getManagerDetailsMapped(this.props.dealerDetail),
    });
  }

  setModalVisible(visible) {
    this.setState({ modalVisible: visible });
  }

  setFilterDate = param => (
    async () => {
      const { filterData } = this.state;
      const dateToEdit = filterData[param];
      try {
        const {
          action, year, month, day
        } = await DatePickerAndroid.open({
          date: new Date(dateToEdit),
          mode: 'calendar',
          maxDate: new Date(),
          minDate: new Date(this.defaultFilterData.fromDate)
        });
        if (action !== DatePickerAndroid.dismissedAction) {
          const retrievedDate = moment({ years: year, months: month, date: day }).format();
          if (this.validateDates(filterData.fromDate, filterData.toDate, retrievedDate, param)) {
            filterData[param] = moment({ years: year, months: month, date: day }).format();
            this.setState({ filterData });
          }
        }
      } catch (error) {
        console.log('Cannot open date picker', error);
      }
    }
  )

  callToast(msg) {
    this.setState({
      toastMessage: msg
    });
    Animated.timing(
      this.animatedValue,
      {
        toValue: 30,
        duration: 350
      }
    ).start(this.closeToast());
  }

  closeToast() {
    setTimeout(() => {
      Animated.timing(
        this.animatedValue,
        {
          toValue: -70,
          duration: 350
        }
      ).start();
    }, 2000);
  }

  validateDates = (fromDate, toDate, retrievedDate, param) => {
    const validated = (() => param === 'toDate'
      ? moment(fromDate).isSameOrBefore(retrievedDate)
      : moment(toDate).isSameOrAfter(retrievedDate))();
    if (!validated) {
      // eslint-disable-next-line  max-len
      toast(`${param === 'fromDate' ? 'Start Date' : 'End Date'} cannot be ${param === 'fromDate' ? 'higher' : 'lower'} than ${moment(param === 'toDate' ? fromDate : toDate).format('DD MMM YY')} !`);
    }
    return validated;
  }

  productView = item => {
    const { isSideNavOpen } = this.props;
    const maxWidth = (isSideNavOpen ? 260 : 290);
    return (
      <View style={[styles.product_card, {
        width: maxWidth
      }]}>
        <View style={{ flex: 1.45 }}>
          <Text style={styles.product_name}>{item && item.name}</Text>
          <Image
            resizeMode="contain"
            source={{ uri: item && item.image_url }}
            style={styles.bikeImageResolution}
          />
        </View>
        <View style={{ flex: 1 }}>
          <View style={styles.units_sold}>
            <LinearGradient
              colors={['#c879fd', '#9376fd']}
              start={{ x: 0.0, y: 0.0 }}
              end={{ x: 1.0, y: 1.0 }}
              style={{ borderRadius: 5, paddingHorizontal: 5, paddingVertical: 2 }}
            >
              <Text style={styles.units_sold_title}>Units Sold</Text>
              <Text style={styles.units_value}>{item && item.unitsSold}</Text>
            </LinearGradient>
          </View>
          <View style={styles.leads_created}>
            <Text style={styles.leads_created_title}>Leads Created</Text>
            <Text style={styles.leads_created_value}>{item && item.leadsCreated}</Text>
          </View>
          <View style={styles.leads_created}>
            <Text style={styles.leads_created_title}>Test Ride Booked</Text>
            <Text style={styles.leads_created_value}>{item && item.ridesBooked}</Text>
          </View>
        </View>
      </View>);
  }

  header = () => {
    const {
      userName
    } = this.state;
    return (
      <View style={HeaderStyles.headerContainer}>
        <View style={{ flex: 1, flexDirection: 'row' }}>
          <View style={HeaderStyles.headerTextContent}>
            <Text style={{ color: 'white', paddingHorizontal: 5 }}>
              {userName}
            </Text>
            <Text style={{ color: 'gray', paddingHorizontal: 5 }} />
          </View>
          <View style={[HeaderStyles.headerDateContent, { display: 'none' }]}>
            <Text style={{ color: 'white', paddingHorizontal: 5 }} />
          </View>
          <TouchableOpacity
            style={HeaderStyles.headerSearchContent}
            onPress={this.onSearchProductClick}>
            <Text style={{ paddingHorizontal: 10 }}><Icon name="search" size={21} color="white" /></Text>
            <Text style={HeaderStyles.headerSearchContentText}>
Search for Lead
            </Text>
          </TouchableOpacity>
          <View style={{ flex: 2, flexDirection: 'row', alignItems: 'center' }} />
        </View>
      </View>
    );
  }

  removeFiancierIconTapped = item => {
    const index = this.state.currentlyAddedFinanciers.indexOf(item);
    this.state.currentlyAddedFinanciers.splice(index, 1);
    this.state.currentlyUnaddedFinanciers.push(item);
    this.setState({
      currentlyAddedFinanciers: this.state.currentlyAddedFinanciers,
      currentlyUnaddedFinanciers: this.state.currentlyUnaddedFinanciers,
      refreshFlatList: !this.state.refreshFlatList
    });
  }

  _keyExtractor = item => item.id

  _addFinancierKeyExtractor = item => item.id

  _addMoreBtnClicked = () => {
    this.setModalVisible(true);
  }

  _addNewFinancierBtnClicked = () => {
    this.state.selectedArray.forEach(item => {
      this.state.currentlyAddedFinanciers.splice(this.state.currentlyAddedFinanciers.length, 0, item);
      const currentIndex = this.state.currentlyUnaddedFinanciers.findIndex(eachObj => eachObj.id === item.id);
      if (currentIndex !== -1) {
        this.state.currentlyUnaddedFinanciers.splice(currentIndex, 1);
      }
    });
    this.setState({
      currentlyAddedFinanciers: this.state.currentlyAddedFinanciers,
      currentlyUnaddedFinanciers: this.state.currentlyUnaddedFinanciers,
      selectedArray: [],
      refreshFlatList: !this.state.refreshFlatList
    });
    this.setModalVisible(false);
  }

  OntRadioBtntap = rowItem => {
    this.checkObjectAlreadyExist(rowItem);
  }

  checkObjectAlreadyExist = item => {
    const currentIndex = this.state.selectedArray.findIndex(eachObj => eachObj.id === item.id);
    if (currentIndex === -1) {
      this.state.selectedArray.push(item);
    } else {
      this.state.selectedArray.splice(currentIndex, 1);
    }
    this.setState({
      selectedArray: this.state.selectedArray,
      refreshFlatList: !this.state.refreshFlatList
    });
  }

  addFinancierRenderItem = data => {
    const { item } = data;
    return (
      <TouchableOpacity
        onPress={() => this.OntRadioBtntap(item)}
      >
        <View style={
          (this.state.selectedArray.findIndex(eachObj => eachObj.id === item.id) === -1)
            ? [styles.withoutFinancierSelected] : styles.withFinancierSelected
        }>
          <Image
            style={styles.imageStyle}
            source={
              { uri: item.logo_url }} />
        </View>
      </TouchableOpacity>
    );
  }

  handleOnInputChange = (param, value, index) => {
    if (param === 'firstname') {
      this.setState({ first_name: value, firstNameError: !(isAlphaOnly(value)) });
    } else if (param === 'lastname') {
      this.setState({ last_name: value, lastNameError: value.length > 0 ? !(isAlphaOnly(value)) : false });
    } else if (param === 'email') {
      const { email, showEmailError } = this.state;
      email[index] = value;
      showEmailError[index] = false;
      this.setState({
        dealershipInfo: {
          ...this.state.dealershipInfo,
          email: email.join(),
        },
        email,
        showEmailError
      });
    } else if (param === 'mobile_no') {
      const { mobile_no, showMobileError } = this.state;
      mobile_no[index] = value;
      showMobileError[index] = false;
      this.setState({
        dealershipInfo: {
          ...this.state.dealershipInfo,
          mobile_no: mobile_no.join(),
        },
        mobile_no,
        showMobileError
      });
    } else if (param === 'newPassword') {
      this.setState({
        newPassword: value,
        showError: false
      });
    } else if (param === 'confirmPassword') {
      this.setState({
        confirmPassword: value,
        showError: false
      });
    } else if (param === 'oldPassword') {
      this.setState({
        oldPassword: value
      });
    } else if (param === 'landline_no') {
      this.setState({
        landline_no: value
      });
    }
  }

  handleResetPassword = () => {
    const { confirmPassword, newPassword, oldPassword } = this.state;
    const { user, dealerId } = this.props.currentUser;
    if (newPassword && confirmPassword && oldPassword) {
      if (isPasswordValid.length && isPasswordValid.alphaNumeric && isPasswordValid.specialChar) {
        if (confirmPassword === newPassword) {
          const data = {
            oldPassword,
            newPassword
          };
          const key = Buffer.from(JSON.stringify(data)).toString('base64');
          const inputData = {
            key
          };
          this.props.updatePassword(user.id, dealerId, inputData).then(() => {
            if (this.props.newAuthToken !== null) {
              const currentUser = {
                ...this.props.currentUser,
                token: this.props.newAuthToken
              };
              storage.storeJsonValues('currentUser', currentUser);
              this.props.setUser(currentUser);
              this.setState({
                showResetPasswordModal: false,
                newPassword: '',
                confirmPassword: '',
                oldPassword: ''
              });
            }
          }).catch(error => {
            if (error && error.err && !error.err.message.includes('invalidaccesstoken')) {
              Alert.alert(
                'Alert',
                error && error.err ? error.err.message : '',
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      this.setState({
                        newPassword: '',
                        confirmPassword: '',
                        oldPassword: ''
                      });
                    }
                  },
                ],
                { cancelable: false }
              );
            }
          });
        } else {
          this.setState({
            showError: true,
            errorTitle: 'Password mismatch'
          });
        }
      }
    } else {
      this.setState({
        showError: true,
        errorTitle: 'Please enter the password'
      });
    }
  }

  validate = () => {
    const {
      mobile_no,
      email
    } = this.state;
    const showMobileError = [];
    const showEmailError = [];
    mobile_no.forEach((mobileNumber, index) => {
      showMobileError[index] = !mobileNumberValidator(mobileNumber);
    });
    email.forEach((emailObj, index) => {
      showEmailError[index] = !emailValidator(emailObj);
    });
    let isNameError = false;
    if (!isAlphaOnly(this.state.first_name.trim())) {
      isNameError = true;
    }
    this.setState({
      showMobileError,
      showEmailError,
      firstNameError: isNameError,
      lastNameError: (this.state.last_name && this.state.last_name.length > 0)
        ? !(isAlphaOnly(this.state.last_name)) : false
    });
    if (!showEmailError.includes(true) && !showMobileError.includes(true) && !isNameError) {
      return true;
    }
  }

  updateDealership = () => {
    if (this.validate() && !this.state.lastNameError) {
      const userId = this.props.currentUser && this.props.currentUser.user ? this.props.currentUser.user.id : '';
      const temp = {
        first_name: trimExtraspaces(this.state.first_name || ''),
        last_name: trimExtraspaces(this.state.last_name || '')
      };
      const landline = this.state.landline_no;
      this.props.updateUserStatus(userId, temp)
        .then(() => {
          const currentUser = {
            ...this.props.currentUser,
            user: {
              ...this.props.currentUser.user,
              first_name: this.props.userDetail.first_name || '',
              last_name: this.props.userDetail.last_name || '',
              email: this.props.userDetail.email || '',
              mobile_no: this.props.userDetail.mobile_no || ''
            }
          };
          this.props.setUser(currentUser);
          storage.storeJsonValues('currentUser', currentUser);
          const data = {
            id: (currentUser && currentUser.dealerId) ? currentUser.dealerId : '',
            mobile_no: this.state.mobile_no_value,
            email: this.state.email_value,
            landline_no: landline
          };
          this.props.updateDealershipDetails(data).then(async () => {
            await this.props.loadDealership(this.props.currentUser.dealerId).then(() => { }, () => { });
            this.setState({
              userName: `${this.state.first_name} ${this.state.last_name}`,
              mobile_no: this.state.mobile_no_value,
              email: this.state.email_value,
              landline_no: this.state.landline_no,
              showProfileModal: false,
            });
          });
        }).catch(() => { });
    }
  }

  goToAccessories = () => {
    const { navigation: { navigate } } = this.props;
    navigate('ChooseAccessories', { from: 'myDealership' });
  }

  showModal = () => {
    this.setState({
      showProfileModal: true,
      first_name: this.state.first_name,
      last_name: this.state.last_name,
      landline_no: this.state.landline_no,
      email_value: this.state.email,
      mobile_no_value: this.state.mobile_no,
      lastNameError: false,
      firstNameError: false,
      dealershipInfo: this.props.dealerDetail
    });
  }

  openResetPassword = () => {
    this.setState({
      showResetPasswordModal: true
    });
  }

  updateBtnAction = () => {
    this.setState({
      isFinancierUpdated: true
    });
    const { dealerId } = this.props.currentUser;
    const updatedAddedList = this.state.currentlyAddedFinanciers;
    this.props.updateFinancierList(
      dealerId,
      updatedAddedList
    ).then(() => {
      this.setState({
        currentlyAddedFinanciers: this.props.addedFinancierList.slice(),
        currentlyUnaddedFinanciers: this.props.unaddedFinancierList.slice(),
        isFinancierUpdated: false
      });
      this.callToast('Updated Successfully !!! ');
    }).catch(error => {
      this.callToast('Updated Failed !!! ');
      console.log('Error.....:', error);
    });
    this.setModalVisible(false);
  }

  applyProductFilter = () => {
    const { dealerId } = this.props.currentUser;
    const { filterData: { fromDate, toDate }, vehicleIds } = this.state;
    const data = {
      vehicleIds,
      start: fromDate,
      end: toDate
    };
    this.props.loadProductSummary(dealerId, data).catch(error => {
      console.log('Error.....:', error);
    });
  }

  validateLeadReportDateRange = () => {
    const {
      leadReportFromYears, leadReportFromMonths, leadReportFromDay, leadReportFromMinutes, leadReportFromHours,
      leadReportToYears, leadReportToMonths, leadReportToDay, leadReportToMinutes, leadReportToHours,
      leadReportFromDate, leadReportFromtime, leadReportToDate, leadReportTotime
    } = this.state;
    const fromdate = moment({
      years: leadReportFromYears,
      months: leadReportFromMonths,
      date: leadReportFromDay,
      hours: leadReportFromHours,
      minutes: leadReportFromMinutes
    }).utc().format();
    const todate = moment({
      years: leadReportToYears,
      months: leadReportToMonths,
      date: leadReportToDay,
      hours: leadReportToHours,
      minutes: leadReportToMinutes
    }).utc().format();
    if (leadReportFromDate.length > 0 && leadReportFromtime.length > 0
      && leadReportToDate.length > 0 && leadReportTotime && fromdate < todate) {
      return true;
    }
    return false;
  }

  sendLeadReport = () => {
    if (this.validateLeadReportDateRange()) {
      if (emailValidator(this.state.leadReportEmail)) {
        const {
          leadReportFromYears, leadReportFromMonths, leadReportFromDay, leadReportFromMinutes, leadReportFromHours,
          leadReportToYears, leadReportToMonths, leadReportToDay, leadReportToMinutes, leadReportToHours
        } = this.state;
        const fromdate = moment({
          years: leadReportFromYears,
          months: leadReportFromMonths,
          date: leadReportFromDay,
          hours: leadReportFromHours,
          minutes: leadReportFromMinutes
        }).format();
        const todate = moment({
          years: leadReportToYears,
          months: leadReportToMonths,
          date: leadReportToDay,
          hours: leadReportToHours,
          minutes: leadReportToMinutes
        }).format();

        const data = {
          from: fromdate,
          to: todate,
          email: this.state.leadReportEmail
        };
        this.props.sendLeadReport(this.props.currentUser.dealerId, data).then(() => {
          Alert.alert(
            'Message',
            this.props.leadreportObj.message,
            [
              {
                text: 'OK',
                onPress: () => {
                  this.setState({
                    leadReportFromDate: '',
                    leadReportFromtime: '',
                    leadReportToDate: '',
                    leadReportTotime: '',
                    leadReportFromHours: 0,
                    leadReportFromMinutes: 0,
                    leadReportFromDay: 0,
                    leadReportFromMonths: 0,
                    leadReportFromYears: 0,
                    leadReportToHours: 0,
                    leadReportToMinutes: 0,
                    leadReportToDay: 0,
                    leadReportToMonths: 0,
                    leadReportToYears: 0,
                    leadReportEmail: '',
                  });
                }
              },
            ],
            { cancelable: false }
          );
        }).catch(() => { });
      } else {
        Alert.alert(
          'Alert',
          'Enter a valid email',
          [
            { text: 'OK', onPress: () => { } },
          ],
          { cancelable: false }
        );
      }
    } else {
      Alert.alert(
        'Alert',
        'Enter a valid date/time',
        [
          { text: 'OK', onPress: () => { } },
        ],
        { cancelable: false }
      );
    }
  }

  displayPhoneNumber = () => {
    const {
      mobile_no, mobileError, showMobileError
    } = this.state;
    return (
      mobile_no.map((mobileNumber, index) => (
        <View
          style={{
            flex: 0.7, flexDirection: 'row', alignContent: 'flex-start'
          }}
          // eslint-disable-next-line
          key={index}
        >
          <UserInput
            param="mobile_no"
            placeholder="Enter Phone Number"
            autoCapitalize="none"
            returnKeyType="done"
            keyboardType="phone-pad"
            value={mobileNumber}
            onChange={(param, value) => this.handleOnInputChange(param, value, index)}
            autoCorrect={false}
            containerStyle={styles.fieldContainer}
            textStyle={styles.fieldValue}
            showError={showMobileError[index]}
            errorTitle={mobileError}
            maxLength={10}
            errorStyle={{ marginLeft: 10 }}
          />
          {
            index !== 0
            && (
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginHorizontal: 15,
                marginBottom: 15
              }}
              onPress={() => this.removePhoneNumber(index)}
              activeOpacity={0.5}
            >
              <Image source={require('../../assets/images/delete.png')} />
            </TouchableOpacity>
            )
          }
        </View>
      ))
    );
  }

  addPhoneNumber = () => {
    const { mobile_no } = this.state;
    mobile_no.push('');
    this.setState({
      mobile_no
    });
  }

  removePhoneNumber = index => {
    const { mobile_no, dealershipInfo } = this.state;
    mobile_no.splice(index, 1);
    this.setState({
      dealershipInfo: {
        ...dealershipInfo,
        mobile_no: mobile_no.join()
      },
      mobile_no
    });
  }

  displayEmail = () => {
    const { email, showEmailError, emailError } = this.state;
    return (
      email.map((emailObj, index) => (
        <View
          style={{
            flex: 0.7, flexDirection: 'row', alignContent: 'flex-start'
          }}
          // eslint-disable-next-line
          key={index}
        >
          <UserInput
            param="email"
            placeholder="Enter E-mail Id"
            autoCapitalize="none"
            returnKeyType="done"
            value={emailObj}
            onChange={(param, value) => this.handleOnInputChange(param, value, index)}
            autoCorrect={false}
            containerStyle={styles.fieldContainer}
            textStyle={styles.fieldValue}
            showError={showEmailError[index]}
            errorTitle={emailError}
            errorStyle={{ marginLeft: 10 }}
          />
          {
            index !== 0
            && (
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'flex-start',
                marginHorizontal: 10,
                marginVertical: 10,
              }}
              onPress={() => this.removeEmail(index)}
              activeOpacity={0.5}
            >
              <Image source={require('../../assets/images/delete.png')} />
            </TouchableOpacity>
            )
          }
        </View>
      ))
    );
  }

  addEmail = () => {
    const { email } = this.state;
    email.push('');
    this.setState({
      email
    });
  }

  removeEmail = index => {
    const { email, dealershipInfo } = this.state;
    email.splice(index, 1);
    this.setState({
      dealershipInfo: {
        ...dealershipInfo,
        email: email.join()
      },
      email
    });
  }

  handleFromDatePicker = () => {
    try {
      DatePickerAndroid.open({
        date: new Date(),
        maxDate: new Date()
      }).then(({
        action, year, month, day
      }) => {
        if (action !== DatePickerAndroid.dismissedAction) {
          const date = moment({ years: year, months: month, date: day }).format('DD MMM, YYYY');
          this.setState({
            leadReportFromDate: date, leadReportFromYears: year, leadReportFromMonths: month, leadReportFromDay: day
          });
        }
      });
    } catch ({ code, message }) {
      console.log('Cannot open date picker', message);
    }
  }

  handleFromTimePicker = () => {
    try {
      TimePickerAndroid.open({
        is24Hour: false
      }).then(({
        action, hour, minute
      }) => {
        if (action !== TimePickerAndroid.dismissedAction) {
          const time = moment({ hours: hour, minutes: minute }).format('LT');
          this.setState({ leadReportFromtime: time, leadReportFromHours: hour, leadReportFromMinutes: minute });
        }
      });
    } catch ({ code, message }) {
      console.log('Cannot open date picker', message);
    }
  }

  handleToDatePicker = () => {
    try {
      DatePickerAndroid.open({
        date: new Date(),
        maxDate: new Date()
      }).then(({
        action, year, month, day
      }) => {
        if (action !== DatePickerAndroid.dismissedAction) {
          const date = moment({ years: year, months: month, date: day }).format('DD MMM, YYYY');
          this.setState({
            leadReportToDate: date, leadReportToYears: year, leadReportToMonths: month, leadReportToDay: day
          });
        }
      });
    } catch ({ code, message }) {
      console.log('Cannot open date picker', message);
    }
  }

  handleToTimePicker = () => {
    try {
      TimePickerAndroid.open({
        is24Hour: false
      }).then(({
        action, hour, minute
      }) => {
        if (action !== TimePickerAndroid.dismissedAction) {
          const time = moment({ hours: hour, minutes: minute }).format('LT');
          this.setState({ leadReportTotime: time, leadReportToHours: hour, leadReportToMinutes: minute });
        }
      });
    } catch ({ code, message }) {
      console.log('Cannot open date picker', message);
    }
  }

  renderItem = ({
    item, move, moveEnd
  }) => (
    <TouchableOpacity
      style={[styles.financierItemContainer]}
      onLongPress={move}
      onPressOut={moveEnd}
      >
      {
          !item.is_manufacturer
          && (
          <TouchableOpacity
            style={styles.closeIconView}
            onPress={() => this.removeFiancierIconTapped(item)}>
            <Image
              style={{ alignSelf: 'center' }}
              resizeMode="center"
              source={Close} />
          </TouchableOpacity>
          )
        }
      <Image
        style={styles.financierItemImageStyle}
        source={
            { uri: item.logo_url }} />
    </TouchableOpacity>
  )

  render() {
    const { dealerDetail, dealerTargets } = this.props;
    const {
      filterData: { fromDate, toDate }, vehicleList,
      mobile_no, email, newPassword, showError, errorTitle, isFinancierUpdated
    } = this.state;
    isPasswordValid = passwordStrengthValidator(newPassword);
    return (
      <View style={{ flex: 1 }}>
        <Loader showIndicator={this.props.loading} />
        <AppHeader navigation={this.props.navigation}>
          {this.header()}
        </AppHeader>
        <Modal
          animationType="slide"
          transparent
          visible={this.state.modalVisible}
          onRequestClose={() => {
            this.setState({
              selectedArray: []
            });
          }}>
          <View style={styles.popUpViewStyle}>
            <View style={[styles.sliderHeaderStyles, { flexDirection: 'row' }]}>
              <Text style={styles.addFinancierHeaderTextStyle}>Add Financiers </Text>
              <TouchableOpacity
                style={styles.closeBtnStyle}
                onPress={() => {
                  this.setModalVisible(!this.state.modalVisible);
                }}>
                <Image
                  style={{ resizeMode: 'contain' }}
                  source={largeClose} />
              </TouchableOpacity>
            </View>
            <View style={styles.seperatorView} />
            <View style={{ flex: 1 }}>
              {(this.state.currentlyUnaddedFinanciers.length > 0)
                && (
                <FlatList
                  keyExtractor={this._addFinancierKeyExtractor}
                  data={this.state.currentlyUnaddedFinanciers}
                  renderItem={this.addFinancierRenderItem}
                  extraData={this.state.refreshFlatList}
                  horizontal={false}
                  numColumns={3} />
                )
              }
              {(this.state.currentlyUnaddedFinanciers.length === 0)
                && (
                <Text style={styles.noFinanciersText}>
                  No financiers to show
                </Text>
                )}
            </View>
            {this.state.currentlyUnaddedFinanciers.length > 0
              && (
              <GradientButtonLarge
                style={styles.addNewFinancierStyle}
                title="Add Financiers"
                handleSubmit={this._addNewFinancierBtnClicked} />
              )
            }
          </View>
        </Modal>
        {
          this.state.showResetPasswordModal
            ? (
              <Modal
                transparent
                visible={this.state.showResetPasswordModal}
                onRequestClose={() => this.setState({
                  showResetPasswordModal: false,
                  oldPassword: '',
                  newPassword: '',
                  confirmPassword: ''
                })}
                onShow={this.onModalShow}
            >
                <View style={[teamMemberStyles.backgroundOverlay]} />
                <KeyboardAwareScrollView
                  style={[styles.popUpViewStyle, styles.resetViewStyle]}
                  keyboardShouldPersistTaps="always"
              >
                  <View style={teamMemberStyles.addViewHeader}>
                    <Text style={[teamMemberStyles.addMemberTextStyle, styles.resetHeaderText]}>
                    Reset Password
                    </Text>
                    <TouchableOpacity
                      onPress={() => this.setState({
                        showResetPasswordModal: false,
                      })}
                      style={teamMemberStyles.hideModalStyle}
                  >
                      <Image source={largeClose} resizeMode="contain" style={teamMemberStyles.closeButton} />
                    </TouchableOpacity>
                  </View>
                  <View style={{ paddingHorizontal: 40, marginVertical: 15 }}>
                    <View style={{ marginHorizontal: 40 }}>
                      <UserInput
                        param="oldPassword"
                        placeholder="Old Password"
                        secureTextEntry={this.state.showOldPass}
                        autoCapitalize="none"
                        returnKeyType="done"
                        value={this.state.oldPassword}
                        onChange={this.handleOnInputChange}
                        autoCorrect={false}
                        containerStyle={styles.userInputContainer}
                        maxLength={30}
                        showGradient
                    />
                      <TouchableOpacity
                        style={{ position: 'absolute', right: 25, top: 15 }}
                        onPress={() => { this.setState({ showOldPass: !this.state.showOldPass }); }}
                        activeOpacity={0.5}
                    >
                        <Icon
                          name={this.state.showOldPass ? 'eye-slash' : 'eye'}
                          size={18}
                          color={this.state.showOldPass ? '#a4a4a4' : '#f3842d'} />
                      </TouchableOpacity>
                    </View>
                    <View style={{ marginHorizontal: 40 }}>
                      <UserInput
                        param="newPassword"
                        placeholder="New Password"
                        secureTextEntry={this.state.showNewPass}
                        autoCapitalize="none"
                        returnKeyType="done"
                        value={this.state.newPassword}
                        onChange={this.handleOnInputChange}
                        autoCorrect={false}
                        containerStyle={styles.userInputContainer}
                        maxLength={30}
                        showGradient
                    />
                      <TouchableOpacity
                        style={{ position: 'absolute', right: 25, top: 15 }}
                        onPress={() => { this.setState({ showNewPass: !this.state.showNewPass }); }}
                        activeOpacity={0.5}
                    >
                        <Icon
                          name={this.state.showNewPass ? 'eye-slash' : 'eye'}
                          size={18}
                          color={this.state.showNewPass ? '#a4a4a4' : '#f3842d'} />
                      </TouchableOpacity>
                    </View>
                    <View style={{ marginHorizontal: 40 }}>
                      <UserInput
                        param="confirmPassword"
                        placeholder="Re-Type New Password"
                        returnKeyType="done"
                        autoCapitalize="none"
                        secureTextEntry={this.state.showConfirmPass}
                        value={this.state.confirmPassword}
                        onChange={this.handleOnInputChange}
                        autoCorrect={false}
                        containerStyle={styles.userInputContainer}
                        maxLength={30}
                        showError={showError}
                        errorTitle={errorTitle}
                        showGradient
                    />
                      <TouchableOpacity
                        style={{ position: 'absolute', right: 25, top: 15 }}
                        onPress={() => { this.setState({ showConfirmPass: !this.state.showConfirmPass }); }}
                        activeOpacity={0.5}
                    >
                        <Icon
                          name={this.state.showConfirmPass ? 'eye-slash' : 'eye'}
                          size={18}
                          color={this.state.showConfirmPass ? '#a4a4a4' : '#f3842d'} />
                      </TouchableOpacity>
                    </View>

                    <View style={{ marginHorizontal: 40, flexDirection: 'column', marginBottom: 10 }}>
                      <Text
                        style={isPasswordValid.length
                          ? { color: '#008000', fontSize: 10 }
                          : { color: '#a4a4a4', fontSize: 10 }}
                    >
                      8 Characters
                      </Text>
                      <Text
                        style={isPasswordValid.alphaNumeric
                          ? { color: '#008000', fontSize: 10 }
                          : { color: '#a4a4a4', fontSize: 10 }}
                    >
                      1 Alpha-Numeric
                      </Text>
                      <Text
                        style={isPasswordValid.specialChar
                          ? { color: '#008000', fontSize: 10 }
                          : { color: '#a4a4a4', fontSize: 10 }}
                    >
                      1 Special Character
                      </Text>
                    </View>
                    <View style={{
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      marginHorizontal: 40
                    }}>
                      <GradientButtonLarge
                        title="Submit"
                        loaderStyle={{ left: 30, position: 'absolute' }}
                        disabled={this.props.loading}
                        loadingText="Submitting..."
                        loading={this.props.resetLoading}
                        handleSubmit={this.handleResetPassword}
                    />
                    </View>
                  </View>
                </KeyboardAwareScrollView>
              </Modal>
            )
            : null
        }

        {
          this.state.showProfileModal
            ? (
              <Modal
                transparent
                visible={this.state.showProfileModal}
                onRequestClose={this.setDefaultUserDetails}
                onShow={this.onModalShow}
            >
                <View style={[teamMemberStyles.backgroundOverlay]} />
                <KeyboardAwareScrollView
                  style={teamMemberStyles.teamAddView}
                  keyboardShouldPersistTaps="always"
              >
                  <View style={[teamMemberStyles.flexOne]}>
                    <View style={teamMemberStyles.addViewHeader}>
                      <Text style={teamMemberStyles.addMemberTextStyle}>
                      Edit Dealership Details
                      </Text>
                      <TouchableOpacity
                        onPress={this.setDefaultUserDetails}
                        style={teamMemberStyles.hideModalStyle}
                    >
                        <Image source={largeClose} resizeMode="contain" style={teamMemberStyles.closeButton} />
                      </TouchableOpacity>
                    </View>
                    <View style={[teamMemberStyles.memberInfoView]}>
                      <View style={{ flexDirection: 'row' }}>
                        <Text style={teamMemberStyles.nameText}>First Name</Text>
                        <Text style={teamMemberStyles.requiredStyle}>*</Text>
                      </View>
                      <UserInput
                        containerStyle={teamMemberStyles.nameInput}
                        param="firstname"
                        placeholder="Enter The First Name"
                        onChange={this.handleOnInputChange}
                        value={this.state.first_name}
                        showError={this.state.firstNameError}
                        textStyle={styles.fieldValue}
                        errorTitle="Enter a valid name"
                    />
                      <View style={{ flexDirection: 'row' }}>
                        <Text style={teamMemberStyles.nameText}>Last Name</Text>
                      </View>
                      <UserInput
                        containerStyle={teamMemberStyles.nameInput}
                        param="lastname"
                        placeholder="Enter The Last Name"
                        onChange={this.handleOnInputChange}
                        value={this.state.last_name}
                        showError={this.state.lastNameError}
                        textStyle={styles.fieldValue}
                        errorTitle="Enter a valid name"
                    />
                      <View style={[teamMemberStyles.nameTextView]}>
                        <Text style={teamMemberStyles.nameText}>Email ID</Text>
                        <Text style={teamMemberStyles.requiredStyle}>*</Text>
                      </View>
                      {this.displayEmail()}
                      {
                      email.length < 3
                      && (
                      <TouchableOpacity
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'flex-start',
                          marginBottom: 10,
                        }}
                        onPress={this.addEmail}
                        activeOpacity={0.5}
                      >
                        <Image source={require('../../assets/images/add_o.png')} />
                        <Text style={[styles.addInfo]}>Add Email ID</Text>
                      </TouchableOpacity>
                      )
                    }
                      <View style={teamMemberStyles.nameTextView}>
                        <Text style={teamMemberStyles.nameText}>Phone Number</Text>
                        <Text style={teamMemberStyles.requiredStyle}>*</Text>
                      </View>
                      {this.displayPhoneNumber()}
                      {
                      mobile_no.length < 3
                      && (
                      <TouchableOpacity
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'flex-start',
                          marginBottom: 10
                        }}
                        onPress={this.addPhoneNumber}
                        activeOpacity={0.5}
                      >
                        <Image source={require('../../assets/images/add_o.png')} />
                        <Text style={[styles.addInfo]}>Add Phone Number</Text>
                      </TouchableOpacity>
                      )
                    }
                      <View style={{ flexDirection: 'row' }}>
                        <Text style={teamMemberStyles.nameText}>Landline Number</Text>
                      </View>
                      <UserInput
                        param="landline_no"
                        placeholder="Enter landline number"
                        autoCapitalize="none"
                        returnKeyType="done"
                        containerStyle={teamMemberStyles.nameInput}
                        onChange={this.handleOnInputChange}
                        value={this.state.landline_no}
                        textStyle={styles.fieldValue}
                      />
                      <View style={teamMemberStyles.modalButtonViewStyle}>
                        <GradientButtonLarge
                          title="Save Details"
                          style={teamMemberStyles.modalButtonStyle}
                          handleSubmit={this.updateDealership}
                      />
                      </View>
                    </View>
                  </View>
                </KeyboardAwareScrollView>
              </Modal>
            )
            : null
        }
        <KeyboardAvoidingView style={styles.container}>
          <ScrollView style={styles.body}>
            <View style={styles.bodyContent}>
              {/* Section 1 */}
              <View style={styles.dealer_sec}>
                <View style={styles.dealer_hdr_sec}>
                  <Text style={styles.dealer_title}>
                    {dealerDetail && dealerDetail.name}
                  </Text>
                  <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                    <SecondaryButton
                      title="Reset Password"
                      iconName="key"
                      handleSubmit={this.openResetPassword}
                      buttonStyle={{
                        width: 150,
                        height: 40,
                        marginRight: 10
                      }}
                    />
                    <SecondaryButton
                      title="Update Accessories"
                      handleSubmit={this.goToAccessories}
                      buttonStyle={{
                        width: 150,
                        height: 40,
                        marginRight: 10
                      }}
                    />
                    <SecondaryButton
                      title="Edit Profile"
                      iconName="edit"
                      handleSubmit={this.showModal}
                      buttonStyle={{
                        width: 150,
                        height: 40
                      }}
                    />
                  </View>
                </View>
                <View style={styles.dealer_det_sec}>
                  <Image
                    source={manufacturerLogo} 
                    resizeMode='contain'
                    style={{ width: 150, height: 180 }}
                  />
                  {/*                   <LinearGradient
                    colors={['#ebebeb', '#d8d8d8', '#c5c5c5', '#bbbbbb']}
                    start={{ x: 0.0, y: 1.0 }}
                    end={{ x: 1.0, y: 1.0 }}
                    style={styles.dealer_logo}>
                    <Image source={Logo} style={{ width: 140, height: 150 }} />
                  </LinearGradient> */}
                  <View style={{ flex: 1, flexDirection: 'row' }}>
                    <View style={{ flex: 1, marginLeft: 30 }}>
                      <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                        <Text style={styles.dealer_det_title}>Dealer Manager</Text>
                        <Text style={styles.dealer_det_desc}>
                          {this.state.userName}
                        </Text>
                      </View>
                      <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                        <Text style={styles.dealer_det_title}>Contact</Text>
                        <Text style={styles.dealer_det_desc}>
                          {this.state.mobile_no ? this.state.mobile_no.join(', ') : ''}
                        </Text>
                      </View>
                      <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                        <Text style={styles.dealer_det_title}>Email Id</Text>
                        <Text style={styles.dealer_det_desc}>
                          {this.state.email ? this.state.email.join(', ') : ''}
                        </Text>
                      </View>
                      <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                        <Text style={styles.dealer_det_title}>Landline</Text>
                        <Text style={styles.dealer_det_desc}>
                          {dealerDetail
                            && `${dealerDetail.landline_no}`}
                        </Text>
                      </View>
                      <View style={{ flexDirection: 'row' }}>
                        <Text style={styles.dealer_det_title}>Address</Text>
                        <View>
                          <Text style={styles.dealer_det_desc}>
                            {dealerDetail
                              && `${dealerDetail.address_line_1}`}
                          </Text>
                          <Text style={styles.dealer_det_desc}>
                            {dealerDetail
                              && `${dealerDetail.address_line_2} ${dealerDetail.city
                              && dealerDetail.city.name}-${dealerDetail.pincode}`}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
              <View style={{ flex: 1 }}>
                <TargetGraph
                  style={{}}
                  onTargetChange={this.onTargetSelect}
                  targetList={dealerTargets && dealerTargets.length > 0
                    ? dealerTargets : [this.state.selectedTarget]}
                  selectedTarget={this.state.selectedTarget ? this.state.selectedTarget : dealerTargets[0]}
                  showDropdown
                  data={{
                    targets: this.state.targets,
                    headerText:
                      `${this.state.isDealerManager ? 'Dealership' : ''} Target Summary  for`,
                    role: this.state.currentRole,
                    colors: [
                      ['#0ac7c4', '#51deb7'],
                      ['green', 'yellowgreen'],
                      ['#5a35da', '#475fdd'],
                      ['#ef563c', '#f3842d']
                    ],
                    targetLabels: this.state.targetLabels
                  }} />
              </View>
              <View style={{ flexDirection: 'row' }}>
                <Text style={styles.yourFinancierTextStyle}>Your Financiers</Text>
                <View style={{
                  flexDirection: 'row', justifyContent: 'flex-end', flex: 1, marginRight: 30
                }}>
                  <SecondaryButton
                    title="Add"
                    iconName=""
                    handleSubmit={() => this.setState({
                      modalVisible: true
                    })}
                    buttonStyle={{
                      width: 100,
                      height: 40,
                      marginHorizontal: 20
                    }}
                  />
                  <SecondaryButton
                    title="Update"
                    iconName=""
                    disabled={JSON.stringify(this.props.addedFinancierList)
                      === JSON.stringify(this.state.currentlyAddedFinanciers) || isFinancierUpdated}
                    handleSubmit={this.updateBtnAction}
                    buttonStyle={{
                      width: 100,
                      height: 40,
                    }}
                  />
                </View>
              </View>
              <View style={styles.mainDataContainer}>
                <DraggableFlatList
                  style={styles.financierListContainer}
                  keyExtractor={(item, index) => `draggable-item-${index}`}
                  data={this.state.currentlyAddedFinanciers}
                  renderItem={this.renderItem}
                  extraData={this.state.refreshFlatList}
                  scrollPercent={5}
                  onMoveEnd={({ data }) => {
                    this.setState({
                      currentlyAddedFinanciers: data
                    }, () => {
                    });
                  }}
                  horizontal />
              </View>
              <View style={styles.product_sum_sec}>
                <View style={styles.product_sum_pos_set}>
                  <Text style={styles.product_sum_title}>Product Summary</Text>
                  <View style={styles.filter_rgt_sec}>
                    <SectionedMultiSelect
                      items={vehicleList || []}
                      styles={{
                        container: styles.dropdownContainer,
                        selectDropdownTextField: styles.selectDropdownTextField,
                        button: styles.confirmBtn,
                        confirmText: styles.confirmText,
                        selectToggle: styles.selectToggle
                      }}
                      uniqueKey="id"
                      subKey="children"
                      displayKey="name"
                      selectText="Select Vehicles"
                      hideSearch
                      expandDropDowns
                      onSelectedItemsChange={this.onSelectedItemsChange}
                      selectedItems={this.state.vehicleIds}
                      readOnlyHeadings
                    />
                    <View style={styles.filterDateContainer}>
                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={this.setFilterDate('fromDate')}
                      >
                        <View style={styles.filterDateContent}>
                          <Text style={styles.filterDateFormattedText}>
                            {moment(fromDate).format('DD MMM YY')}
                          </Text>
                          <Icon
                            style={[styles.greenTickImageStyle]}
                            name="angle-down"
                            size={22}
                            color="#3e3939" />
                        </View>
                      </TouchableOpacity>
                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={this.setFilterDate('toDate')}>
                        <View style={styles.filterDateContent}>
                          <Text style={styles.filterDateFormattedText}>
                            {moment(toDate).format('DD MMM YY')}
                          </Text>
                          <Icon
                            style={[styles.greenTickImageStyle]}
                            name="angle-down"
                            size={22}
                            color="#3e3939" />
                        </View>
                      </TouchableOpacity>
                    </View>
                    <SecondaryButton
                      title="Apply"
                      iconName=""
                      handleSubmit={this.applyProductFilter}
                      buttonStyle={{
                        width: 100,
                        height: 40,
                        marginLeft: 10
                      }}
                    />
                  </View>
                </View>
                <View style={{
                  // marginLeft: -5,
                  marginTop: 20,
                  padding: 5
                }}>
                  <FlatList
                    data={this.props.productSummary}
                    renderItem={({ item, index }) => this.productView(item, index)}
                    extraData={this.state.renderList || this.props.isSideNavOpen}
                    horizontal={false}
                    numColumns={3} />
                </View>
              </View>
              <View style={{ margin: 20, backgroundColor: 'white', paddingVertical: 10 }}>
                {/* <Text style={[styles.product_sum_title, { margin: 20, fontSize: 30 }]}>Lead Report</Text> */}
                <Text style={[styles.detailTextInputStyle, { margin: 10 }]}>Lead Report</Text>
                <View style={{ flexDirection: 'row' }}>
                  <View style={{ flexDirection: 'row' }}>
                    <View style={styles.dateTimeView}>
                      <View style={{ flexDirection: 'row', marginVertical: 10 }}>
                        <TouchableOpacity
                          style={{ flexDirection: 'row' }}
                          onPress={() => { this.handleFromDatePicker(); }}>
                          <Text style={[styles.actionLabel, {
                            marginRight: 10,
                            elevation: 2,
                            backgroundColor: '#f2f2f2',
                            margin: 2,
                            paddingHorizontal: 10,
                            paddingVertical: 2,
                            color: '#4a4a4a',
                            borderRadius: 2,
                            width: 90
                          }]}>
From Date
                          </Text>
                        </TouchableOpacity>
                        <Text style={[styles.actionLabel, { marginRight: 10, width: 90 }]}>
                          {this.state.leadReportFromDate}
                        </Text>
                      </View>
                      <View style={{ flexDirection: 'row' }}>
                        <TouchableOpacity
                          style={{ flexDirection: 'row' }}
                          onPress={() => { this.handleFromTimePicker(); }}>
                          <Text style={[styles.actionLabel, {
                            marginRight: 10,
                            elevation: 2,
                            backgroundColor: '#f2f2f2',
                            margin: 2,
                            borderRadius: 2,
                            paddingHorizontal: 10,
                            paddingVertical: 2,
                            color: '#4a4a4a',
                            width: 90
                          }]}>
From Time
                          </Text>
                        </TouchableOpacity>
                        <Text style={[styles.actionLabel, { marginRight: 10, width: 90 }]}>
                          {this.state.leadReportFromtime}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.dateTimeView}>
                      <View style={{ flexDirection: 'row', marginVertical: 10 }}>
                        <TouchableOpacity
                          style={{ flexDirection: 'row' }}
                          onPress={() => { this.handleToDatePicker(); }}>
                          <Text style={[styles.actionLabel, {
                            marginRight: 10,
                            elevation: 2,
                            backgroundColor: '#f2f2f2',
                            margin: 2,
                            paddingHorizontal: 10,
                            paddingVertical: 2,
                            color: '#4a4a4a',
                            borderRadius: 2,
                            width: 90
                          }]}>
To Date
                          </Text>
                        </TouchableOpacity>
                        <Text style={[styles.actionLabel, { marginRight: 10, width: 90 }]}>
                          {this.state.leadReportToDate}
                        </Text>
                      </View>
                      <View style={{ flexDirection: 'row' }}>
                        <TouchableOpacity
                          style={{ flexDirection: 'row' }}
                          onPress={() => { this.handleToTimePicker(); }}>
                          <Text style={[styles.actionLabel, {
                            marginRight: 10,
                            elevation: 2,
                            backgroundColor: '#f2f2f2',
                            margin: 2,
                            borderRadius: 2,
                            paddingHorizontal: 10,
                            paddingVertical: 2,
                            color: '#4a4a4a',
                            width: 90
                          }]}>
To Time
                          </Text>
                        </TouchableOpacity>
                        <Text style={[styles.actionLabel, { marginRight: 10, width: 90 }]}>
                          {this.state.leadReportTotime}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View style={{ width: 200 }}>
                    <View style={styles.textInputContainer}>
                      <Text style={[styles.detailTextInputStyle]}>

                        Email
                      </Text>
                      <TextInput
                        style={styles.emailFieldContainer}
                        onChangeText={text => this.setState({ leadReportEmail: text })}
                        value={`${this.state.leadReportEmail}`}
                        underlineColorAndroid="transparent" />
                    </View>
                  </View>
                  <View style={styles.leadReportApplyView}>
                    <SecondaryButton
                      title="Send"
                      iconName=""
                      handleSubmit={this.sendLeadReport}
                      buttonStyle={{
                        width: 80,
                        height: 40,
                      }}
                    />
                  </View>

                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
        <Animated.View style={[styles.toastView, {
          transform: [{ translateY: this.animatedValue }],
        }]}>
          <Text style={styles.toastTextStyle}>
            {this.state.toastMessage}
          </Text>
        </Animated.View>
      </View>
    );
  }
}

export default MyDealershipScreen;
