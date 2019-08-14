/**
 * The Update Inventory Screen shows the inventory details of all the
 * available vehicles in the dealership. It also manages the vehicle's insurance values
 * test ride vehicles count and special offers if any.
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  Dimensions,
  Animated,
  Alert
} from 'react-native';

// Reducer
import { connect } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';

// Action Methods
import {
  getInventoryList,
  getVarientList,
  getInventoryPriceDetails,
  clearVariantDetails,
  clearInventoryList,
  updateInventoryPriceDetails,
  getStockDetails,
  updateStockDetails,
  getIncentiveOfferDetails,
  updateIncentiveOfferDetails,
  getInsurancePriceDetails,
  updateInsurancePriceDetails
} from '../../redux/actions/Inventory/actionCreators';

import { GradientCountTile } from '../../components/tile/Tile';
// Styles
import fonts from '../../theme/fonts';
import styles from './updateInventoryStyles';

// Components
import { BookTestRideButton } from '../../components/button/Button';
import myLeadHeaderStyles from '../LeadDashboard/components/leadHeader/myleadHeaderStyles';
import Loader from '../../components/loader/Loader';
import SpringView from '../../components/animated/SpringView';
import AppHeader from '../../components/header/Header';
import { currencyFormatter, isNumeric, trimExtraspaces } from '../../utils/validations';
import constants from '../../utils/constants';

// Images
import Close from '../../assets/images/close.png';
import SearchIcon from '../../assets/images/search.png';
import {
  callToast
} from '../../redux/actions/Global/actionCreators';

const DEVICE_WIDTH = Dimensions.get('screen').width;
const DEVICE_HEIGHT = Dimensions.get('screen').height;

// Variables
let currentDealerId;
let currentUserId;
let priceData;

const getElementIndexFromArray = (array, element, keys) => {
  let elementIndex = -1;
  array.some((data, index) => {
    let hasMatch = true;
    keys.forEach(key => {
      if (data[key] !== element[key] && hasMatch) {
        hasMatch = false;
      }
    });
    if (hasMatch) {
      elementIndex = index;
    }
    return hasMatch;
  });
  return elementIndex;
};

@connect(
  state => ({
    currentUser: state.user.currentUser,
    inventoryList: state.inventory.inventoryList,
    variantList: state.inventory.variantList,
    variantPriceDetails: state.inventory.variantPriceDetails,
    variantStockList: state.inventory.variantStockList,
    incentiveOfferDetails: state.inventory.incentiveOfferDetails,
    currentVariantVehicleDetails: state.inventory.currentVariantVehicleDetails,
    loading: state.inventory.loadingGroup,
    insurancePriceDetails: state.inventory.insurancePriceDetails,
    showInsuranceSplitUp: state.inventory.isInsuranceSplit
  }),
  {
    getInventoryList,
    getVarientList,
    getInventoryPriceDetails,
    clearVariantDetails,
    clearInventoryList,
    updateInventoryPriceDetails,
    getStockDetails,
    updateStockDetails,
    getIncentiveOfferDetails,
    updateIncentiveOfferDetails,
    getInsurancePriceDetails,
    updateInsurancePriceDetails,
    callToast
  }
)

class UpdateInventoryScreen extends Component {
  static propTypes = {
    getInventoryList: PropTypes.func.isRequired,
    getInventoryPriceDetails: PropTypes.func.isRequired,
    clearVariantDetails: PropTypes.func.isRequired,
    clearInventoryList: PropTypes.func.isRequired,
    updateInventoryPriceDetails: PropTypes.func.isRequired,
    getStockDetails: PropTypes.func.isRequired,
    updateStockDetails: PropTypes.func.isRequired,
    getIncentiveOfferDetails: PropTypes.func.isRequired,
    updateIncentiveOfferDetails: PropTypes.func.isRequired,
    inventoryList: PropTypes.array,
    variantStockList: PropTypes.array,
    variantPriceDetails: PropTypes.object,
    incentiveOfferDetails: PropTypes.object,
    loading: PropTypes.bool.isRequired,
    navigation: PropTypes.object.isRequired,
    getInsurancePriceDetails: PropTypes.func.isRequired,
    insurancePriceDetails: PropTypes.array,
    showInsuranceSplitUp: PropTypes.bool,
    updateInsurancePriceDetails: PropTypes.func.isRequired,
    currentUser: PropTypes.bool.isRequired,
    callToast: PropTypes.func.isRequired
  }

  static defaultProps = {
    showInsuranceSplitUp: true,
    inventoryList: [],
    variantPriceDetails: {},
    variantStockList: [],
    incentiveOfferDetails: {},
    insurancePriceDetails: [],
  }

  static defaulState = {
    exshowroomPrice: '',
    rtoAndOthersPrice: '',
    insurancePrice: '',
    accessoriesPrice: '',
    extendedWarrantyPrice: '',
    unitsAvailableToday: '',
    incentivePerUnitSold: '',
    tabPosition: 1,
    tpPremiun: '',
    compulsoryPACover: '',
    ODPremium_1yr: '',
    ODPremium_5yr: '',
    zeroDepreciation: '',
    insurancePriceDetails: [],
    isUpdateEnabled: false,
    selectedType: 'Price',
    modalVisible: false,
    incentiveOfferObject: {},
    inventoryListMain: null,
    refreshList: false,
    insuranceTotal: ''
  };

  constructor(props) {
    super(props);
    this.animatedValue = new Animated.Value(-100);
    this.state = {
      ...UpdateInventoryScreen.defaulState,
      showInsuranceSplitUp: this.props.showInsuranceSplitUp,
      inventoryListCopy: [],
      currentlySelectedVehicle: {},
      currentlySelectedIndex: 0,
      currentVariantColorList: [],
      /**
       * Default values
       */
      tabLayoutData: [
        {
          id: 1,
          name: 'Price',
        },
        {
          id: 2,
          name: 'Insurance',
        },
        {
          id: 3,
          name: 'Units Available',
        },
        {
          id: 4,
          name: 'Test Ride Vehicles',
        },
        {
          id: 5,
          name: 'Incentive',
        },
        {
          id: 6,
          name: 'Offers',
        },
      ]
    };
    this.willBlurSubscription = this.props.navigation.addListener(
      'willBlur',
      () => {
        this.props.clearInventoryList();
        this.props.clearVariantDetails();
        this.setState({
          ...UpdateInventoryScreen.defaulState
        });
      }
    );
  }

  componentWillUnmount() {
    this.willBlurSubscription.remove();
  }

  componentDidMount() {
    const { currentUser } = this.props;
    if (currentUser && Object.keys('currentUser').length > 0 && currentUser.dealerId && currentUser.dealerId.length > 0) {
      currentDealerId = currentUser.dealerId;
      currentUserId = currentUser.user.id;
      this.props.getInventoryList(currentDealerId)
        .then(() => {
          Object.assign(this.state.inventoryListCopy, this.props.inventoryList);
          this.setState({
            inventoryListMain: this.props.inventoryList,
            searchVal: ''
          });
        }, error => {
          if (error && error.err && !error.err.message.includes('invalidaccesstoken')) {
            Alert.alert(
              'Message',
              error && error.err ? error.err.message : '',
              [
                { text: 'OK', onPress: () => { } },
              ],
              { cancelable: false }
            );
          }
        });
    }
  }

  onTabPress = tabInfo => {
    this.setState({
      tabPosition: tabInfo.id,
      selectedType: tabInfo.name,
      isUpdateEnabled: false
    });
    this.getTabDetails(tabInfo);
  }

  onTap = (val, item, index) => {
    this.getPriceDetails(item, index);
  }

  getTabDetails = tabInfo => {
    switch (tabInfo.name) {
      case 'Price':
        this.getPriceDetails(this.state.currentlySelectedVehicle, this.state.currentlySelectedIndex);
        break;
      case 'Insurance':
        this.getInsuranceDetails(this.state.currentlySelectedVehicle);
        break;
      case 'Units Available':
        this.getcurrentvarientStockDetails(this.state.currentlySelectedVehicle);
        break;
      default:
        this.getIncentiveOfferDetails(this.state.currentlySelectedVehicle);
        break;
    }
  }

  getTabPosition = value => {
    switch (value) {
      case 'Price':
        return 1;
      case 'Insurance':
        return 2;
      case 'Units Available':
        return 3;
      case 'Test Ride Vehicles':
        return 4;
      case 'Incentive':
        return 5;
      case 'Offers':
        return 6;
      default:
        return 1;
    }
  }

  setModalVisible = visible => {
    if (!visible && currentDealerId && currentDealerId.length > 0) {
      this.props.getInventoryList(currentDealerId)
        .then(() => {
          Object.assign(this.state.inventoryListCopy, this.props.inventoryList);
          this.setState({
            inventoryListMain: this.props.inventoryList,
            searchVal: '',
            tabPosition: 1,
            selectedType: 'Price',
            currentlySelectedVehicle: {},
            currentVariantColorList: [],
            incentiveOfferObject: {},
            modalVisible: false
          });
        }, error => {
          if (error && error.err && !error.err.message.includes('invalidaccesstoken')) {
            Alert.alert(
              'Message',
              error && error.err ? error.err.message : '',
              [
                { text: 'OK', onPress: () => { } },
              ],
              { cancelable: false }
            );
          }
        });
    }
  }

  getPriceDetails = (item, index) => {
    this.props.getInventoryPriceDetails(
      item.id,
      item.variant_id,
      currentDealerId
    )
      .then(() => {
        if (this.props.variantPriceDetails && Object.keys(this.props.variantPriceDetails).length !== 0) {
          this.setState({
            insurancePrice: (this.props.variantPriceDetails.insurance != null)
              ? `${this.props.variantPriceDetails.insurance}` : '',
            rtoAndOthersPrice: (this.props.variantPriceDetails.rto_charges != null)
              ? `${this.props.variantPriceDetails.rto_charges}` : '',
            exshowroomPrice: (this.props.variantPriceDetails.ex_showroom_price != null)
              ? `${this.props.variantPriceDetails.ex_showroom_price}` : '',
            accessoriesPrice: (this.props.variantPriceDetails.accessories_price != null)
              ? `${this.props.variantPriceDetails.accessories_price}` : '',
            extendedWarrantyPrice: (this.props.variantPriceDetails.extented_warranty != null)
              ? `${this.props.variantPriceDetails.extented_warranty}` : '',
            incentiveOfferObject: (this.props.incentiveOfferDetails !== null ? this.props.incentiveOfferDetails : ''),
            modalVisible: true,
            currentlySelectedVehicle: item,
            currentlySelectedIndex: index,
            tabPosition: 1,
            selectedType: 'Price'
          });
        } else {
          this.setState({
            exshowroomPrice: '',
            rtoAndOthersPrice: '',
            insurancePrice: '',
            accessoriesPrice: '',
            extendedWarrantyPrice: '',
            currentlySelectedVehicle: item,
            currentlySelectedIndex: index,
          });
        }
      }, error => {
        console.log(error);
      });
  }

  getInsuranceDetails = item => {
    this.props.getInsurancePriceDetails(
      item.id,
      item.variant_id,
      currentDealerId
    )
      .then(() => {
        const insuranceArray = [...this.props.insurancePriceDetails];
        if (this.props.insurancePriceDetails && this.props.insurancePriceDetails.length !== 0) {
          insuranceArray.map(curObj => {
            if (curObj.type === constants.TP_PREMIUM_TYPE) {
              this.state.tpPremiun = curObj.amount;
            } else if (curObj.type === constants.COMPULSORY_PA_COVER_TYPE) {
              this.state.compulsoryPACover = curObj.amount;
            } else if (curObj.type === constants.OD_PREMIUM_TYPE && curObj.validity === 1) {
              this.state.ODPremium_1yr = curObj.amount;
            } else if (curObj.type === constants.OD_PREMIUM_TYPE && curObj.validity === 5) {
              this.state.ODPremium_5yr = curObj.amount;
            } else if (curObj.type === constants.ZERO_DEPRECIATION_TYPE) {
              this.state.zeroDepreciation = curObj.amount;
            } else if (curObj.type === constants.TOTAL_AMOUNT) {
              this.state.insuranceTotal = curObj.amount;
            }
            return curObj;
          });
          this.setState({
            insurancePriceDetails: [...insuranceArray],
            showInsuranceSplitUp: this.props.showInsuranceSplitUp,
            tpPremiun: this.state.tpPremiun,
            insuranceTotal: this.state.insuranceTotal,
            compulsoryPACover: this.state.compulsoryPACover,
            ODPremium_1yr: this.state.ODPremium_1yr,
            ODPremium_5yr: this.state.ODPremium_5yr,
            zeroDepreciation: this.state.zeroDepreciation
          });
        } else {
          this.setState({
            tpPremiun: '',
            compulsoryPACover: '',
            ODPremium_1yr: '',
            ODPremium_5yr: '',
            zeroDepreciation: '',
          });
        }
      }, error => {
        console.log(error);
      });
  }

  getcurrentvarientStockDetails = curvehicle => {
    this.props.getStockDetails(currentDealerId, curvehicle.variant_id).then(() => {
      this.setState({
        currentVariantColorList: this.props.variantStockList,
      });
    }, error => {
      console.log(error);
    });
  }

  getIncentiveOfferDetails = curVehicle => {
    this.props.getIncentiveOfferDetails(currentDealerId, curVehicle.id).then(() => {
      this.setState({
        incentiveOfferObject: {
          ...this.props.incentiveOfferDetails,
        }
      });
    }, error => {
      console.log(error);
    });
  }

  toggleInsuranceView = () => {
    const insuranceArray = [...this.props.insurancePriceDetails];
    insuranceArray.map(curObj => {
      if (curObj.type === constants.TP_PREMIUM_TYPE) {
        this.state.tpPremiun = curObj.amount;
      } else if (curObj.type === constants.COMPULSORY_PA_COVER_TYPE) {
        this.state.compulsoryPACover = curObj.amount;
      } else if (curObj.type === constants.OD_PREMIUM_TYPE && curObj.validity === 1) {
        this.state.ODPremium_1yr = curObj.amount;
      } else if (curObj.type === constants.OD_PREMIUM_TYPE && curObj.validity === 5) {
        this.state.ODPremium_5yr = curObj.amount;
      } else if (curObj.type === constants.ZERO_DEPRECIATION_TYPE) {
        this.state.zeroDepreciation = curObj.amount;
      } else if (curObj.type === constants.TOTAL_AMOUNT) {
        this.state.insuranceTotal = curObj.amount;
      }
      return curObj;
    });
    this.setState(state => ({
      isUpdateEnabled: false,
      showInsuranceSplitUp: !state.showInsuranceSplitUp,
      insurancePriceDetails: [...insuranceArray],
      tpPremiun: this.state.tpPremiun,
      insuranceTotal: this.state.insuranceTotal,
      compulsoryPACover: this.state.compulsoryPACover,
      ODPremium_1yr: this.state.ODPremium_1yr,
      ODPremium_5yr: this.state.ODPremium_5yr,
      zeroDepreciation: this.state.zeroDepreciation
    }));
  }

  InsuranceSplitUp = () => (
    <View style={styles.tabCurrentViewStyle}>
      <View style={styles.eachRowView}>
        <View style={styles.eachRowTitleView}>
          <Text style={styles.detailTextStyle}>TP Premium</Text>
        </View>
        <View style={styles.textInputViewStyle}>
          <Text style={[styles.detailTextInputStyle, { marginHorizontal: 10 }]}>
            {constants.RUPEE}
          </Text>
          <TextInput
            maxLength={7}
            style={styles.fieldContainer}
            keyboardType="numeric"
            onChangeText={text => this.setState({ tpPremiun: text, isUpdateEnabled: true })}
            value={`${this.state.tpPremiun}`}
            underlineColorAndroid="transparent" />
        </View>
      </View>
      <View style={styles.eachRowView}>
        <View style={styles.eachRowTitleView}
              >
          <Text style={styles.detailTextStyle}>Compulsory PA Cover</Text>
        </View>
        <View style={styles.textInputViewStyle}>
          <Text style={[styles.detailTextInputStyle, { marginHorizontal: 10 }]}>
            {constants.RUPEE}
          </Text>
          <TextInput
            maxLength={5}
            style={styles.fieldContainer}
            keyboardType="numeric"
            onChangeText={text => this.setState({ compulsoryPACover: text, isUpdateEnabled: true })}
            value={`${this.state.compulsoryPACover}`}
            underlineColorAndroid="transparent"
                />
        </View>
      </View>
      <View style={styles.eachRowView}>
        <View style={styles.eachRowTitleView}
              >
          <Text style={styles.detailTextStyle}>OD Premium(1 Year)</Text>
        </View>
        <View style={styles.textInputViewStyle}>
          <Text style={[styles.detailTextInputStyle, { marginHorizontal: 10 }]}>
            {constants.RUPEE}
          </Text>
          <TextInput
            maxLength={5}
            style={styles.fieldContainer}
            keyboardType="numeric"
            onChangeText={text => this.setState({ ODPremium_1yr: text, isUpdateEnabled: true })}
            value={`${this.state.ODPremium_1yr}`}
            underlineColorAndroid="transparent"
                />
        </View>
      </View>
      <View style={styles.eachRowView}>
        <View style={styles.eachRowTitleView}
              >
          <Text style={styles.detailTextStyle}>OD Premium(5 Year)</Text>
        </View>
        <View style={styles.textInputViewStyle}>
          <Text style={[styles.detailTextInputStyle, { marginHorizontal: 10 }]}>
            {constants.RUPEE}
          </Text>
          <TextInput
            maxLength={5}
            style={styles.fieldContainer}
            keyboardType="numeric"
            onChangeText={text => this.setState({ ODPremium_5yr: text, isUpdateEnabled: true })}
            value={`${this.state.ODPremium_5yr}`}
            underlineColorAndroid="transparent"
                />
        </View>
      </View>
      <View style={styles.eachRowView}>
        <View style={styles.eachRowTitleView}
              >
          <Text style={styles.detailTextStyle}>Zero Depreciation</Text>
        </View>
        <View style={styles.textInputViewStyle}>
          <Text style={[styles.detailTextInputStyle, { marginHorizontal: 10 }]}>
            {constants.RUPEE}
          </Text>
          <TextInput
            maxLength={5}
            style={styles.fieldContainer}
            keyboardType="numeric"
            onChangeText={text => this.setState({ zeroDepreciation: text, isUpdateEnabled: true })}
            value={`${this.state.zeroDepreciation}`}
            underlineColorAndroid="transparent"
          />
        </View>
      </View>
    </View>
  );

  InsuranceTotal = () => (
    <View style={[styles.eachRowView, { marginVertical: DEVICE_HEIGHT / 6, marginHorizontal: DEVICE_WIDTH / 10 }]}>
      <View style={styles.eachRowTitleView}>
        <Text style={styles.detailTextStyle}>Total Insurance Amount</Text>
      </View>
      <View style={styles.textInputViewStyle}>
        <Text style={[styles.detailTextInputStyle, { marginHorizontal: 10 }]}>
          {constants.RUPEE}
        </Text>
        <TextInput
          maxLength={5}
          style={styles.fieldContainer}
          keyboardType="numeric"
          onChangeText={text => this.setState({ insuranceTotal: text, isUpdateEnabled: trimExtraspaces(text).length !== 0 })}
          value={`${this.state.insuranceTotal}`}
          underlineColorAndroid="transparent"
        />
      </View>
    </View>
  )

  getCurrentView = () => {
    const { inventoryListMain, currentlySelectedIndex, showInsuranceSplitUp } = this.state;
    switch (this.state.selectedType) {
      case 'Price': {
        return (
          <View style={styles.tabCurrentViewStyle}>
            <View style={styles.eachRowView}>
              <View style={styles.eachRowTitleView}>
                <Text style={styles.detailTextStyle}>Ex-Showroom</Text>
              </View>
              <View style={styles.textInputViewStyle}>
                <Text style={[styles.detailTextInputStyle, { marginHorizontal: 10 }]}>
                  {constants.RUPEE}
                </Text>
                <TextInput
                  maxLength={7}
                  style={styles.fieldContainer}
                  keyboardType="numeric"
                  onChangeText={text => this.setState({ exshowroomPrice: text, isUpdateEnabled: true })}
                  value={this.state.exshowroomPrice}
                  underlineColorAndroid="transparent" />
              </View>
            </View>
            <View style={styles.eachRowView}>
              <View style={styles.eachRowTitleView}
              >
                <Text style={styles.detailTextStyle}>Road Tax & other charges</Text>
              </View>
              <View style={styles.textInputViewStyle}>
                <Text style={[styles.detailTextInputStyle, { marginHorizontal: 10 }]}>
                  {constants.RUPEE}
                </Text>
                <TextInput
                  maxLength={5}
                  style={styles.fieldContainer}
                  keyboardType="numeric"
                  onChangeText={text => this.setState({ rtoAndOthersPrice: text, isUpdateEnabled: true })}
                  value={this.state.rtoAndOthersPrice}
                  underlineColorAndroid="transparent"
                />
              </View>
            </View>
            <View style={styles.eachRowView}>
              <View style={styles.eachRowTitleView}
              >
                <Text style={styles.detailTextStyle}>Accessories</Text>
              </View>
              <View style={styles.textInputViewStyle}>
                <Text style={[styles.detailTextInputStyle, { marginHorizontal: 10 }]}>
                  {constants.RUPEE}
                </Text>
                <TextInput
                  maxLength={5}
                  style={styles.fieldContainer}
                  keyboardType="numeric"
                  editable={false}
                  onChangeText={text => this.setState({ accessoriesPrice: text, isUpdateEnabled: true })}
                  value={this.state.accessoriesPrice}
                  underlineColorAndroid="transparent"
                />
              </View>
            </View>
            <View style={styles.eachRowView}>
              <View style={styles.eachRowTitleView}
              >
                <Text style={styles.detailTextStyle}>Extended-warranty</Text>
              </View>
              <View style={styles.textInputViewStyle}>
                <Text style={[styles.detailTextInputStyle, { marginHorizontal: 10 }]}>
                  {constants.RUPEE}
                </Text>
                <TextInput
                  maxLength={5}
                  style={styles.fieldContainer}
                  keyboardType="numeric"
                  onChangeText={text => this.setState({ extendedWarrantyPrice: text, isUpdateEnabled: true })}
                  value={this.state.extendedWarrantyPrice}
                  underlineColorAndroid="transparent"
                />
              </View>
            </View>
          </View>
        );
      }
      case 'Insurance': {
        return (
          <View>
            <View style={styles.insuranceModeContainer}>
              <LinearGradient
                colors={showInsuranceSplitUp ? ['#f16537', '#f79426'] : ['#fff', '#fff']}
                start={{ x: 0.0, y: 2.0 }}
                end={{ x: 1.0, y: 2.0 }}
                style={styles.insuranceRadioButton}
              >
                <TouchableOpacity
                  disabled={showInsuranceSplitUp}
                  activeOpacity={0.5}
                  onPress={this.toggleInsuranceView}
                >

                  <Text style={styles.insuranceRadioName}>Split-Up
                  </Text>
                </TouchableOpacity>
              </LinearGradient>
              <LinearGradient
                colors={!showInsuranceSplitUp ? ['#f16537', '#f79426'] : ['#fff', '#fff']}
                start={{ x: 0.0, y: 2.0 }}
                end={{ x: 1.0, y: 2.0 }}
                style={styles.insuranceRadioButton}
                >
                <TouchableOpacity
                  disabled={!showInsuranceSplitUp}
                  activeOpacity={0.5}
                  onPress={this.toggleInsuranceView}
              >
                  <Text style={styles.insuranceRadioName}>Total
                  </Text>
                </TouchableOpacity>
              </LinearGradient>
            </View>
            {
              showInsuranceSplitUp ?
                <this.InsuranceSplitUp /> :
                <this.InsuranceTotal />
            }
          </View>
        );
      }
      case 'Units Available':
        return (
          <View style={styles.tabCurrentViewStyle}>
            <View>
              <ScrollView style={styles.unitScrollStyles}>
                {this.displayStocksBasedOnColorView()}
              </ScrollView>
            </View>
          </View>
        );
      case 'Test Ride Vehicles':
        return (
          <View style={styles.tabCurrentViewStyle}>
            <View style={styles.eachRowView}>
              <View style={styles.eachRowTitleView}>
                <Text style={styles.detailTextStyle}>Units available </Text>
              </View>
              <View style={styles.textInputViewStyle}>
                <TextInput
                  maxLength={3}
                  style={styles.fieldContainer}
                  keyboardType="numeric"
                  onChangeText={text => {
                    this.testRideUnitAvailableOnChange(text);
                  }
                  }
                  value={(
                    this.state.incentiveOfferObject
                    && Object.keys(this.state.incentiveOfferObject).length !== 0
                    && ('test_ride_vehicle' in this.state.incentiveOfferObject)
                    && (this.state.incentiveOfferObject.test_ride_vehicle != null))
                    ? ((this.state.incentiveOfferObject.test_ride_vehicle).toString())
                    : this.state.unitsAvailableToday}
                  underlineColorAndroid="transparent"
                />
              </View>
            </View>
          </View>
        );
      case 'Incentive':
        return (
          <View style={styles.tabCurrentViewStyle}>
            <View style={[styles.eachRowView, { backgroundColor: '#F6F6F6' }]}>
              <View style={styles.eachRowTitleView}>
                <Text style={styles.onroadPricetextStyle}
                >
On Road price
                </Text>
              </View>
              <View style={styles.textInputViewStyle}>
                <Text style={[styles.detailTextInputStyle, { width: DEVICE_WIDTH * 0.1 }]}>
                  {
                    (inventoryListMain && inventoryListMain.length > 0 && inventoryListMain[currentlySelectedIndex]
                      && Object.keys(inventoryListMain[currentlySelectedIndex]).length !== 0
                      && ('price' in inventoryListMain[currentlySelectedIndex])
                      && inventoryListMain[currentlySelectedIndex].price !== null)
                      ? currencyFormatter(inventoryListMain[currentlySelectedIndex].price && inventoryListMain[currentlySelectedIndex].price.toString())
                      : '0'
                  }
                </Text>
              </View>
            </View>
            <View style={[styles.eachRowView]}>
              <View style={styles.eachRowTitleView}
              >
                <Text style={styles.detailTextStyle}>Incentive per unit sold</Text>
              </View>
              <View style={styles.textInputViewStyle}>
                <Text style={[styles.detailTextInputStyle, { marginHorizontal: 10 }]}>
                  {constants.RUPEE}
                </Text>
                <TextInput
                  maxLength={5}
                  style={styles.fieldContainer}
                  keyboardType="numeric"
                  onChangeText={text => {
                    this.IncentivePerUnitOnChange(text);
                  }
                  }
                  value={(this.state.incentiveOfferObject
                    && Object.keys(this.state.incentiveOfferObject).length !== 0
                    && ('incentive_amount' in this.state.incentiveOfferObject))
                    ? (this.state.incentiveOfferObject && this.state.incentiveOfferObject.incentive_amount && this.state.incentiveOfferObject.incentive_amount.toString())
                    : this.state.incentivePerUnitSold}
                  underlineColorAndroid="transparent"
                />
              </View>
            </View>
            <View style={[styles.eachRowView]}>
              <View style={styles.eachRowTitleView}>
                <Text style={styles.detailTextStyle}>
                  *The incentive is applicable only when the salesperson exceeds the target.
                </Text>
              </View>
            </View>
          </View>
        );
      case 'Offers':
        return (
          <View style={styles.tabCurrentViewStyle}>
            <View style={styles.textInputViewStyle}>
              <TextInput
                style={[styles.offerFieldContainer]}
                maxLength={100}
                multiline
                onChangeText={text => {
                  this.offerTFOnChange(text);
                }
                }
                value={this.getOfferValue()}
                underlineColorAndroid="transparent"
              />
            </View>
          </View>
        );
      default:
        return (
          <View style={{ height: 100 }} />
        );
    }
  }

  getOfferValue = () => {
    if (this.state.incentiveOfferObject
      && Object.keys(this.state.incentiveOfferObject).length !== 0
      && this.state.incentiveOfferObject.offer !== null) {
      return this.state.incentiveOfferObject.offer;
    }
    return this.props.loading ? '' : 'No Offer';
  }

  getTabData = () => (
    <View style={{ flexDirection: 'row', flex: 1 }}>
      {
        this.state.tabLayoutData.map(tab => (
          <TouchableOpacity
            key={tab.id}
            style={this.changeTabColor(tab.id)}
            onPress={() => this.onTabPress(tab)}
          >
            <Text style={this.changeTextColor(tab.id)}>{tab.name}</Text>
          </TouchableOpacity>
        ))
      }
    </View>
  )

  callToast(msg) {
    this.props.callToast(msg);
  }

  closeToast() {
    setTimeout(() => {
      Animated.timing(
        this.animatedValue,
        {
          toValue: -100,
          duration: 350
        }
      ).start();
    }, 2000);
  }

  displayStocksBasedOnColorView = () => {
    const { currentVariantColorList } = this.state;
    return (
      currentVariantColorList.map((currentStock, index) => (
        <View
          style={[styles.eachRowView]}
          key={currentStock.id}>
          <View style={[styles.eachRowTitleView, { marginVertical: 0 }]}>
            <Text style={styles.detailTextStyle}>{currentStock.color}</Text>
          </View>
          <View style={styles.textInputViewStyle}>
            <TextInput
              maxLength={3}
              style={styles.fieldContainer}
              keyboardType="numeric"
              onChangeText={text => {
                this.unitsAvailableTFOnChange(text, index);
              }
              }
              value={(currentVariantColorList[index].dealer_inventories.length !== 0)
                ? currentVariantColorList[index].dealer_inventories[0].stock_available && currentVariantColorList[index].dealer_inventories[0].stock_available.toString() : '0'
              }
              underlineColorAndroid="transparent"
            />
          </View>
        </View>
      ))
    );
  }

  unitsAvailableTFOnChange = (value, index) => {
    const { currentVariantColorList, currentlySelectedVehicle } = this.state;
    if (currentVariantColorList[index].dealer_inventories.length > 0) {
      currentVariantColorList[index].dealer_inventories[0].stock_available = value;
    } else {
      const currentObj = {
        stock_available: value,
        dealer_manager_id: currentUserId,
        dealer_id: currentDealerId,
        variant_colours_id: currentVariantColorList[index].id,
        variant_id: currentlySelectedVehicle.variant_id,
        vehicle_id: currentlySelectedVehicle.id
      };
      currentVariantColorList[index].dealer_inventories.push(currentObj);
    }
    this.setState({
      currentVariantColorList,
      isUpdateEnabled: true
    });
  }

  testRideUnitAvailableOnChange = value => {
    const { incentiveOfferObject, currentlySelectedVehicle } = this.state;
    if (incentiveOfferObject
      && Object.keys(incentiveOfferObject).length !== 0
      && ('test_ride_vehicle' in this.state.incentiveOfferObject)) {
      this.setState({
        incentiveOfferObject: {
          ...incentiveOfferObject,
          test_ride_vehicle: value,
        },
        isUpdateEnabled: true
      });
    } else if (incentiveOfferObject
      && Object.keys(incentiveOfferObject).length !== 0) {
      this.state.incentiveOfferObject.test_ride_vehicle = value;
      this.setState({
        incentiveOfferObject: this.state.incentiveOfferObject,
        isUpdateEnabled: true
      });
    } else {
      const currentObj = {
        test_ride_vehicle: value,
        user_id: currentUserId,
        dealer_id: currentDealerId,
        vehicle_id: currentlySelectedVehicle.id,
      };
      this.setState({
        incentiveOfferObject: {
          ...currentObj
        },
        isUpdateEnabled: true
      });
    }
  }

  testRidesPerSlotOnChange = value => {
    const { incentiveOfferObject, currentlySelectedVehicle } = this.state;
    if (incentiveOfferObject
      && Object.keys(incentiveOfferObject).length !== 0
      && ('slots_per_vechile' in this.state.incentiveOfferObject)) {
      this.setState({
        incentiveOfferObject: {
          ...incentiveOfferObject,
          slots_per_vechile: value
        }
      });
    } else if (incentiveOfferObject
      && Object.keys(incentiveOfferObject).length !== 0) {
      this.state.incentiveOfferObject.slots_per_vechile = value;
      this.setState({
        incentiveOfferObject: this.state.incentiveOfferObject
      });
    } else {
      const currentObj = {
        slots_per_vechile: value,
        user_id: currentUserId,
        dealer_id: currentDealerId,
        vehicle_id: currentlySelectedVehicle.id,
      };
      this.setState({
        incentiveOfferObject: {
          ...currentObj
        }
      });
    }
  }

  IncentivePerUnitOnChange = value => {
    const { incentiveOfferObject } = this.state;
    if (incentiveOfferObject
      && Object.keys(incentiveOfferObject).length !== 0
      && ('incentive_amount' in this.state.incentiveOfferObject)) {
      this.setState({
        incentiveOfferObject: {
          ...incentiveOfferObject,
          incentive_amount: value
        },
        isUpdateEnabled: true
      });
    } else {
      const currentObj = {
        incentive_amount: value,
        user_id: currentUserId,
        dealer_id: currentDealerId,
        vehicle_id: this.state.currentlySelectedVehicle.id,
      };
      this.setState({
        incentiveOfferObject: {
          ...currentObj
        },
        isUpdateEnabled: true
      });
    }
  }

  offerTFOnChange = value => {
    const { incentiveOfferObject } = this.state;
    if (incentiveOfferObject && Object.keys(incentiveOfferObject).length !== 0) {
      this.setState({
        incentiveOfferObject: {
          ...incentiveOfferObject,
          offer: value
        },
        isUpdateEnabled: true
      });
    } else {
      const currentObj = {
        offer: value,
        user_id: currentUserId,
        dealer_id: currentDealerId,
        vehicle_id: this.state.currentlySelectedVehicle.id,
      };
      this.setState({
        incentiveOfferObject: {
          ...currentObj
        },
        isUpdateEnabled: true
      });
    }
  }

  showAlert = () => {
    Alert.alert(
      'Message',
      'Updated successfully!!!',
      [
        { text: 'OK', onPress: () => { } },
      ],
      { cancelable: false }
    );
  }

  validationForUpdateBtn = () => {
    switch (this.state.selectedType) {
      case 'Price':
        return (
          isNumeric(this.state.exshowroomPrice) && isNumeric(this.state.rtoAndOthersPrice)
          && isNumeric(this.state.accessoriesPrice) && isNumeric(this.state.extendedWarrantyPrice)
        );
      case 'Insurance':
        if (this.state.showInsuranceSplitUp) {
          return (
            isNumeric(this.state.tpPremiun) && isNumeric(this.state.compulsoryPACover)
            && isNumeric(this.state.ODPremium_1yr) && isNumeric(this.state.ODPremium_5yr)
            && isNumeric(this.state.zeroDepreciation)
          );
        }
        return isNumeric(this.state.insuranceTotal);
      case 'Units Available':
      {
        let negative = false;
        this.state.currentVariantColorList.map(currentStock => {
          if (currentStock.dealer_inventories.length > 0) {
            if (!isNumeric(currentStock.dealer_inventories[0].stock_available)) {
              negative = true;
            }
          }
          return currentStock;
        });
        if (negative) {
          return false;
        }
        return true;
      }
      case 'Test Ride Vehicles':
        return (
          isNumeric(this.state.incentiveOfferObject && this.state.incentiveOfferObject.test_ride_vehicle ? this.state.incentiveOfferObject.test_ride_vehicle : null)
        );
      case 'Incentive':
        return (
          isNumeric(this.state.incentiveOfferObject && this.state.incentiveOfferObject.incentive_amount ? this.state.incentiveOfferObject.incentive_amount : null)
        );
      case 'Offers':
        if (this.state.incentiveOfferObject && this.state.incentiveOfferObject.offer
          && this.state.incentiveOfferObject.offer.toString() && this.state.incentiveOfferObject.offer.toString().trim().length > 0) {
          return this.state.incentiveOfferObject.offer;
        }
        this.state.incentiveOfferObject.offer = null;
        return true;
      default:
        return true;
    }
  }

  updateBtnAction = () => {
    this.setState({
      isUpdateEnabled: false
    }, () => {
      const isDataValid = this.validationForUpdateBtn();
      if (!isDataValid) {
        Alert.alert(
          'Message',
          'Please provide valid data to update.',
          [
            {
              text: 'OK',
              onPress: () => this.setState({
                isUpdateEnabled: false
              })
            },
          ],
          { cancelable: false }
        );
      } else {
        let insuranceData = [];
        priceData = {
          ex_showroom_price: this.state.exshowroomPrice,
          rto_charges: this.state.rtoAndOthersPrice,
          insurance: this.state.insurancePrice,
          extented_warranty: this.state.extendedWarrantyPrice,
          dealer_id: currentDealerId,
          variant_id: this.state.currentlySelectedVehicle.variant_id,
          vehicle_id: this.state.currentlySelectedVehicle.id,
          onroad_price: (parseInt((this.state.exshowroomPrice.length !== 0 ? this.state.exshowroomPrice : 0), 10)
            + parseInt((this.state.rtoAndOthersPrice.length !== 0 ? this.state.rtoAndOthersPrice : 0), 10)
            + parseInt((this.state.insurancePrice.length !== 0 ? this.state.insurancePrice : 0), 10)
            + parseInt((this.state.accessoriesPrice.length !== 0 ? this.state.accessoriesPrice : 0), 10)).toString(),
        };
        if (this.props.variantPriceDetails !== null) {
          priceData.id = this.props.variantPriceDetails.id;
        }
        const { insurancePriceDetails, showInsuranceSplitUp, insuranceTotal } = this.state;
        if (this.state.selectedType === 'Insurance' && showInsuranceSplitUp) {
          insurancePriceDetails.map(curObj => {
            if (curObj.type === constants.TP_PREMIUM_TYPE) {
              curObj.amount = this.state.tpPremiun;
            } else if (curObj.type === constants.COMPULSORY_PA_COVER_TYPE) {
              curObj.amount = this.state.compulsoryPACover;
            } else if (curObj.type === constants.OD_PREMIUM_TYPE && curObj.validity === 1) {
              curObj.amount = this.state.ODPremium_1yr;
            } else if (curObj.type === constants.OD_PREMIUM_TYPE && curObj.validity === 5) {
              curObj.amount = this.state.ODPremium_5yr;
            } else if (curObj.type === constants.ZERO_DEPRECIATION_TYPE) {
              curObj.amount = this.state.zeroDepreciation;
            }
            return curObj;
          });
          insuranceData = [...insurancePriceDetails];
        } else if (this.state.selectedType === 'Insurance' && !showInsuranceSplitUp) {
          insuranceData = insurancePriceDetails.filter(item => {
            if (item.type === constants.TOTAL_AMOUNT) {
              item.amount = insuranceTotal;
            }
            return item.type === constants.TOTAL_AMOUNT;
          });
          if (insuranceData.length === 0) {
            insuranceData = [{
              amount: insuranceTotal,
              type: constants.TOTAL_AMOUNT
            }];
          }
        }
        const data = {
          insurances: [...insuranceData],
          isInsuranceSplit: showInsuranceSplitUp
        };
        this.setState({
          insurancePriceDetails: [...insuranceData]
        });
        switch (this.state.selectedType) {
          case 'Price':
            this.props.updateInventoryPriceDetails(priceData)
              .then(() => {
                if (currentDealerId && currentDealerId.length > 0) {
                  this.props.getInventoryList(currentDealerId).then(() => {
                    Object.assign(this.state.inventoryListCopy, this.props.inventoryList);
                    this.setState({
                      inventoryListMain: this.props.inventoryList,
                      isUpdateEnabled: false,
                      ...this.getCurrentVehicleIndex()
                    }, () => {
                      this.showAlert();
                    });
                  }, error => {
                    if (error.err && !error.err.message.includes('invalidaccesstoken')) {
                      Alert.alert(
                        'Message',
                        error && error.err ? error.err.message : '',
                        [
                          { text: 'OK', onPress: () => { } },
                        ],
                        { cancelable: false }
                      );
                    }
                  });
                }
              }).catch(error => {
                console.log(error);
              });
            break;
          case 'Insurance':
            this.props.updateInsurancePriceDetails(
              this.state.currentlySelectedVehicle.id,
              this.state.currentlySelectedVehicle.variant_id,
              currentDealerId,
              data
            ).then(() => {
              this.props.getInventoryList(currentDealerId).then(() => {
                Object.assign(this.state.inventoryListCopy, this.props.inventoryList);
                this.setState({
                  inventoryListMain: this.props.inventoryList,
                  insurancePriceDetails: [...this.props.insurancePriceDetails],
                  isUpdateEnabled: false,
                  ...this.getCurrentVehicleIndex()
                }, () => {
                  this.showAlert();
                });
              }).catch(error => {
                console.log(error);
              });
            }).catch(error => {
              if (error) {
                if (error.err && !error.err.message.includes('invalidaccesstoken')) {
                  Alert.alert(
                    'Message',
                    error && error.err ? error.err.message : '',
                    [
                      { text: 'OK', onPress: () => { } },
                    ],
                    { cancelable: false }
                  );
                }
              } else {
                Alert.alert(
                  'Message',
                  'Update Failed !!!!!',
                  [
                    { text: 'OK', onPress: () => { } },
                  ],
                  { cancelable: false }
                );
              }
            });
            break;
          case 'Units Available':
            {
              const stockArrayList = this.state.currentVariantColorList.map(currentStock => {
                let stockArray = {};
                if (currentStock.dealer_inventories.length > 0) {
                  stockArray = {
                    ...currentStock.dealer_inventories[0],
                  };
                }
                return stockArray;
              });
              const newStockArray = stockArrayList.filter(value => Object.keys(value).length !== 0);
              this.props.updateStockDetails(newStockArray)
                .then(() => {
                  this.props.getInventoryList(currentDealerId).then(() => {
                    this.setState({
                      inventoryListMain: this.props.inventoryList,
                      isUpdateEnabled: false,
                      ...this.getCurrentVehicleIndex()
                    }, () => {
                      this.showAlert();
                    });
                  }).catch(error => {
                    console.log(error);
                  });
                }).catch(() => {
                  this.callToast('Update failed !!! ');
                });
            }
            return 2;
          case 'Test Ride Vehicles':
            if (this.state.incentiveOfferObject && this.state.incentiveOfferObject.test_ride_vehicle) {
              if (this.state.incentiveOfferObject.test_ride_vehicle.length === 0) {
                this.state.incentiveOfferObject.test_ride_vehicle = '';
              }
              this.props.updateIncentiveOfferDetails(this.state.incentiveOfferObject)
                .then(() => {
                  this.props.getInventoryList(currentDealerId).then(() => {
                    Object.assign(this.state.inventoryListCopy, this.props.inventoryList);
                    this.setState({
                      inventoryListMain: this.props.inventoryList,
                      isUpdateEnabled: false,
                      incentiveOfferObject: {
                        ...this.state.incentiveOfferObject
                      },
                      ...this.getCurrentVehicleIndex()
                    }, () => {
                      this.showAlert();
                    });
                  }).catch(error => {
                    console.log(error);
                  });
                }).catch(() => {
                  this.callToast('Update failed !!! ');
                });
            } else {
              this.setState({
                incentiveOfferObject: {
                  ...this.state.incentiveOfferObject
                },
                isUpdateEnabled: true,
              });
            }
            return 1;
          case 'Incentive':
            if (this.state.incentiveOfferObject && this.state.incentiveOfferObject.incentive_amount) {
              if (this.state.incentiveOfferObject.incentive_amount.length === 0) {
                this.state.incentiveOfferObject.incentive_amount = '';
              }
              this.props.updateIncentiveOfferDetails(this.state.incentiveOfferObject)
                .then(() => {
                  this.props.getInventoryList(currentDealerId).then(() => {
                    Object.assign(this.state.inventoryListCopy, this.props.inventoryList);
                    this.setState({
                      inventoryListMain: this.props.inventoryList,
                      incentiveOfferObject: {
                        ...this.state.incentiveOfferObject
                      },
                      isUpdateEnabled: false,
                      ...this.getCurrentVehicleIndex()
                    }, () => {
                      this.showAlert();
                    });
                  }).catch(error => {
                    console.log(error);
                  });
                }).catch(() => {
                  this.callToast('Update failed !!! ');
                });
            } else {
              this.setState({
                incentiveOfferObject: {
                  ...this.state.incentiveOfferObject
                },
                isUpdateEnabled: true,
              });
            }
            return 1;
          case 'Offers':
            if (this.state.incentiveOfferObject) {
              this.props.updateIncentiveOfferDetails(this.state.incentiveOfferObject)
                .then(() => {
                  this.props.getInventoryList(currentDealerId).then(() => {
                    Object.assign(this.state.inventoryListCopy, this.props.inventoryList);
                    this.setState({
                      inventoryListMain: this.props.inventoryList,
                      incentiveOfferObject: {
                        ...this.state.incentiveOfferObject
                      },
                      isUpdateEnabled: false,
                      ...this.getCurrentVehicleIndex()
                    }, () => {
                      this.showAlert();
                    });
                  }).catch(error => {
                    console.log(error);
                  });
                }).catch(() => {
                  this.callToast('Update failed !!! ');
                });
            }
            return 1;
          default:
            return 1;
        }
      }
    });
  }

  getCurrentVehicleIndex = () => {
    const currentlySelectedIndex = getElementIndexFromArray(
      this.state.inventoryListCopy,
      this.state.currentlySelectedVehicle,
      ['id', 'variant_id']
    );
    return {
      currentlySelectedIndex
    };
  };

  changeTabColor = id => {
    if (this.state.tabPosition === id) {
      return myLeadHeaderStyles.tabSelectedStyle;
    }
    return myLeadHeaderStyles.tabStyle;
  }

  changeTextColor = id => {
    if (this.state.tabPosition === id) {
      return myLeadHeaderStyles.tabSelectedTextStyle;
    }
    return myLeadHeaderStyles.tabTextStyle;
  }

  searchProduct = (param, value) => this.searchVehicle(value)
    .then(res => {
      this.setState({
        searchVal: value,
        inventoryListMain: res,
        refreshList: !this.state.refreshList,
        currentlySelectedIndex: 0
      });
    }).catch(error => {
      console.log(error);
      this.setState({
        searchVal: value,
        inventoryListMain: null,
        refreshList: !this.state.refreshList
      });
    });

  searchVehicle = value => new Promise((resolve, reject) => {
    const obj = this.state.inventoryListCopy.filter(o => o.name.toLowerCase().includes(value.toLowerCase()));
    if (obj) {
      resolve(obj);
    } else {
      reject(new Error('error'));
    }
  })

  /**
 * Add Button functionality yet to be added
 */
  OnAddBtntap = () => {
  }

  /**
 * Done Button functionality yet to be added
 */
  doneBtnTap = () => {
  }

  _keyExtractor = item => item.id

  renderItem = item => (
    <View style={styles.FlatListCellStyle}>
      <View style={styles.flatListCellViewStyles}>
        <View
          style={styles.productImageViewFlatListCell}
        >
          <Image
            source={{ uri: item.image_url }}
            style={styles.productImageIconFlatListCell}
          />
          <TouchableOpacity
          >
            <Text style={[styles.flatListHeaderViewTextStyle, {
              fontFamily: fonts.sourceSansProSemiBold,
              textAlign: 'left',
            }]}
            >
              {item.name}
            </Text>
            <Text
              style={[styles.flatListHeaderViewTextStyle, {
                textAlign: 'left',
                width: 100
              }]}
              ellipsizeMode="tail"
              numberOfLines={1}
            >
              {item.variant_name}
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.flatListHeaderTitleViewStyle}>
          <TouchableOpacity
          >
            <Text
              style={[styles.flatListHeaderViewTextStyle, { fontSize: 12 }]}
              ellipsizeMode="tail"
              numberOfLines={1}
            >
              {
                item.price === null
                && '0'
              }
              {
                item.price !== null
                && currencyFormatter(item.price).replace(constants.RUPEE, '')
              }
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.flatListHeaderTitleViewStyle}>
          <TouchableOpacity
          >
            <Text
              style={[styles.flatListHeaderViewTextStyle, { fontSize: 12 }]}
              ellipsizeMode="tail"
              numberOfLines={1}
            >
              {
                item.stock_available === null
                && '0'
              }
              {
                item.stock_available !== null
                && item.stock_available
              }
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.flatListHeaderTitleViewStyle}>
          <TouchableOpacity
          >
            <Text
              style={[styles.flatListHeaderViewTextStyle, { fontSize: 12 }]}
              ellipsizeMode="tail"
              numberOfLines={1}
            >
              {
                item.test_ride_vehicle === null
                && '0'
              }
              {
                item.test_ride_vehicle !== null
                && item.test_ride_vehicle
              }
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.flatListHeaderTitleViewStyle}>
          <TouchableOpacity
          >
            <Text
              style={[styles.flatListHeaderViewTextStyle, { fontSize: 12 }]}
              ellipsizeMode="tail"
              numberOfLines={1}
            >
              {
                (item.incentive_amount === null || item.incentive_amount === '0')
                && 'No incentive'
              }
              {
                item.incentive_amount !== null
                && (item.incentive_amount)
              }
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.flatListHeaderTitleViewStyle}>
          <TouchableOpacity
          >
            <Text
              style={[styles.flatListHeaderViewTextStyle, { fontSize: 12 }]}
              ellipsizeMode="tail"
              numberOfLines={1}
            >
              {
                item.offer === null
                && 'No Offer'
              }
              {
                item.offer !== null
                && item.offer
              }
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.flatListHeaderTitleViewStyle}>
          <TouchableOpacity
            onPress={() => this.onTap('Edit', item)}
          >
            <View style={styles.editBtnViewStyle}
            >
              <Text style={styles.flatlistTextEntryView}>
                Edit
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )

  render() {
    const { inventoryListMain, currentlySelectedIndex } = this.state;
    return (
      <View style={styles.mainView}>
        <Loader showIndicator={this.props.loading} />
        <AppHeader navigation={this.props.navigation}>
          <Text style={{
            flex: 1,
            color: 'white',
            paddingHorizontal: 5,
            alignSelf: 'center',
            justifyContent: 'flex-start'
          }}>
              Inventory
          </Text>
        </AppHeader>
        <Modal
          animationType="slide"
          transparent
          visible={this.state.modalVisible}
          onRequestClose={() => {
            this.props.clearInventoryList();
            this.props.clearVariantDetails();
            this.setState({
              ...UpdateInventoryScreen.defaulState,
            }, () => this.setModalVisible(false));
          }}
        >
          <View style={styles.modalMainContainer}>
            <ScrollView style={styles.bikeInfoView}>
              <Image
                source={
                  {
                    uri: inventoryListMain && inventoryListMain.length > 0
                      && inventoryListMain[currentlySelectedIndex].image_url
                  }
                }
                style={styles.vehicleImageStyle}
              />
              <View style={styles.vehicleDetailView}
              >
                <Text style={styles.vehicleNameTextStyle}
                >
                  {inventoryListMain && inventoryListMain.length > 0
                    && inventoryListMain[currentlySelectedIndex].name}
                </Text>
                <Text
                  style={[styles.flatListHeaderViewTextStyle, styles.vehicleVariantTextStyle]}
                  ellipsizeMode="tail"
                  numberOfLines={1}
                >
                  {inventoryListMain && inventoryListMain.length > 0
                    && inventoryListMain[currentlySelectedIndex].variant_name}
                </Text>
              </View>
              <View style={styles.specificationViewStyle}>
                <Text style={styles.specheadertextStyle}>
                  Price
                </Text>
                <Text style={styles.specsDetailTextStyle}>
                  {
                    inventoryListMain && inventoryListMain.length > 0
                    && inventoryListMain[currentlySelectedIndex] === null
                    && '0'
                  }
                  {
                    (inventoryListMain && inventoryListMain.length > 0 && inventoryListMain[currentlySelectedIndex]
                      && Object.keys(inventoryListMain[currentlySelectedIndex]).length !== 0
                      && ('price' in inventoryListMain[currentlySelectedIndex])
                      && inventoryListMain[currentlySelectedIndex].price !== null)
                      ? currencyFormatter(inventoryListMain[currentlySelectedIndex].price && inventoryListMain[currentlySelectedIndex].price.toString())
                      : '0'
                  }
                </Text>
              </View>
              <View style={styles.specificationViewStyle}>
                <Text style={styles.specheadertextStyle}>
                  Units Available
                </Text>
                <Text style={styles.specsDetailTextStyle}>
                  {
                    inventoryListMain && inventoryListMain.length > 0 && inventoryListMain[currentlySelectedIndex] === null
                    && '0'
                  }
                  {
                    (inventoryListMain && inventoryListMain.length > 0 && inventoryListMain[currentlySelectedIndex]
                      && Object.keys(inventoryListMain[currentlySelectedIndex]).length !== 0
                      && ('stock_available' in inventoryListMain[currentlySelectedIndex])
                      && inventoryListMain[currentlySelectedIndex].stock_available !== null)
                      ? (inventoryListMain[currentlySelectedIndex].stock_available.toString())
                      : '0'
                  }
                </Text>
              </View>
              <View style={styles.specificationViewStyle}>
                <Text style={styles.specheadertextStyle}>
                  Test Ride Vehicles
                </Text>
                <Text style={styles.specsDetailTextStyle}>
                  {
                    inventoryListMain && inventoryListMain.length > 0 && inventoryListMain[currentlySelectedIndex] === null
                    && '0'
                  }
                  {
                    (inventoryListMain && inventoryListMain.length > 0 && inventoryListMain[currentlySelectedIndex]
                      && Object.keys(inventoryListMain[currentlySelectedIndex]).length !== 0
                      && ('test_ride_vehicle' in inventoryListMain[currentlySelectedIndex])
                      && inventoryListMain[currentlySelectedIndex].test_ride_vehicle !== null)
                      ? (inventoryListMain[currentlySelectedIndex].test_ride_vehicle.toString())
                      : '0'
                  }
                </Text>
              </View>
              <View style={styles.specificationViewStyle}>
                <Text style={styles.specheadertextStyle}>
                  Incentive/Unit
                </Text>
                <Text style={styles.specsDetailTextStyle}>
                  {
                    inventoryListMain && inventoryListMain.length > 0 && inventoryListMain[currentlySelectedIndex] === null
                    && '0'
                  }
                  {
                    (inventoryListMain && inventoryListMain.length > 0 && inventoryListMain[currentlySelectedIndex]
                      && Object.keys(inventoryListMain[currentlySelectedIndex]).length !== 0
                      && ('incentive_amount' in inventoryListMain[currentlySelectedIndex])
                      && inventoryListMain[currentlySelectedIndex].incentive_amount !== null)
                      ? (inventoryListMain[currentlySelectedIndex].incentive_amount && inventoryListMain[currentlySelectedIndex].incentive_amount.toString())
                      : '0'
                  }
                </Text>
              </View>
              <View style={styles.specificationViewStyle}>
                <Text style={styles.specheadertextStyle}>
                  Offers
                </Text>
                <Text style={styles.specsDetailTextStyle}>
                  {
                    inventoryListMain && inventoryListMain.length > 0 && this.state.inventoryListMain[currentlySelectedIndex].offer === null
                    && 'No offer'
                  }
                  {
                    inventoryListMain && inventoryListMain.length > 0 && this.state.inventoryListMain[currentlySelectedIndex].offer !== null
                    && this.state.inventoryListMain[currentlySelectedIndex].offer
                  }
                </Text>
              </View>
            </ScrollView>
            <View style={styles.rightDetailCategoryView}
            >
              <View style={styles.rightTabViewStyle}>
                {this.getTabData()}
              </View>
              <View style={styles.rightDataContainerView}>
                {this.getCurrentView()}
                <View style={styles.updateBtnViewStyle}
                >
                  <BookTestRideButton
                    title="UPDATE"
                    disabled={!this.state.isUpdateEnabled || this.props.loading}
                    handleSubmit={this.updateBtnAction}
                  />
                </View>
              </View>
            </View>
            <TouchableOpacity
              style={styles.closeBtnView}
              onPress={() => {
                this.props.clearInventoryList();
                this.props.clearVariantDetails();
                this.setState({
                  ...UpdateInventoryScreen.defaulState,
                }, () => this.setModalVisible(false));
              }}
            >
              <Image
                style={{ resizeMode: 'contain' }}
                source={Close}
              />
            </TouchableOpacity>
          </View>
        </Modal>
        <View style={styles.mainContainer}>
          <View style={[styles.overViewStyles]}>
            <Text style={styles.overviewTextStyles}
            >
              Overview - Yesterday,15 Mar 2018
            </Text>
            <View style={[styles.expandableTileContainer, { marginLeft: 20, marginTop: 10 }]}>
              <SpringView
                duration={500}
                springValue={0.1}
                style={styles.springView}>
                <GradientCountTile
                  id={0}
                  colors={['#34cad4', '#34aff9']}
                  tileCount={4}
                  tileText="Units Sold"
                  style={styles.gradientBtnstyle}
                  countStyle={styles.gradientBtncountStyle}
                  textStyle={styles.gradientBtntextStyle}
                />
              </SpringView>
              <SpringView
                duration={500}
                springValue={0.1}
                style={styles.springView}>
                <GradientCountTile
                  id={0}
                  colors={['#c578fa', '#9775fb']}
                  tileCount={4}
                  tileText="Test Rides Booked"
                  style={styles.gradientBtnstyle}
                  countStyle={styles.gradientBtncountStyle}
                  textStyle={styles.gradientBtntextStyle}
                />
              </SpringView>
            </View>
          </View>
          <View style={{ flex: 85 }}>
            <View style={styles.searchViewStyle
            }>
              <Image
                style={styles.searchImageStyle}
                source={SearchIcon} />
              <TextInput
                placeholder="Search for the product"
                style={styles.searchBoxStyle}
                underlineColorAndroid="transparent"
                value={this.state.searchVal}
                selectionColor="#D3D3D3"
                placeholderTextColor="#D3D3D3"
                onChangeText={searchVal => this.searchProduct('search', searchVal)}
              />
            </View>
            <View style={styles.flatListContainerStyle}>
              <View>
                <View style={styles.flatListHeaderViewStyles}>
                  <View style={[styles.flatListHeaderTitleViewStyle, { flex: 2 }]}>
                    <Text style={[styles.flatListHeaderViewTextStyle, { color: 'white' }]}>
                      Product
                    </Text>
                  </View>
                  <View style={styles.flatListHeaderTitleViewStyle}>
                    <Text style={[styles.flatListHeaderViewTextStyle, { color: 'white' }]}>
                      Price (
                      {constants.RUPEE}
)
                    </Text>
                  </View>
                  <View style={styles.flatListHeaderTitleViewStyle}>
                    <Text style={[styles.flatListHeaderViewTextStyle, { color: 'white' }]}>
                      Units Available
                    </Text>
                  </View>
                  <View style={styles.flatListHeaderTitleViewStyle}>
                    <Text style={[styles.flatListHeaderViewTextStyle, { color: 'white' }]}>
                      Test Ride Vehicles
                    </Text>
                  </View>
                  <View style={styles.flatListHeaderTitleViewStyle}>
                    <Text style={[styles.flatListHeaderViewTextStyle, { color: 'white' }]}>
                      Incentive/Unit (
                      {constants.RUPEE}
)
                    </Text>
                  </View>
                  <View style={styles.flatListHeaderTitleViewStyle}>
                    <Text style={[styles.flatListHeaderViewTextStyle, { color: 'white' }]}>
                      Active Offers
                    </Text>
                  </View>
                  <View style={styles.flatListHeaderTitleViewStyle}>
                    <Text style={[styles.flatListHeaderViewTextStyle, { color: 'white' }]} />
                  </View>
                </View>
                <View style={[styles.itemSeparatorStyle, { marginHorizontal: 0 }]} />
                <View>
                  {
                    (this.state.inventoryListMain && this.state.inventoryListMain.length === 0)
                      ? (
                        <View style={styles.noProductsView}>
                          <Text style={styles.noProductsText}>
                          No Products to show
                          </Text>
                        </View>
                      )
                      : (
                        <ScrollView style={styles.flatListViewStyles}>
                          {
                          this.state.inventoryListMain && this.state.inventoryListMain.map((item, index) => (
                            <View style={styles.FlatListCellStyle}>
                              <View style={styles.flatListCellViewStyles}>
                                <View
                                  style={styles.productImageViewFlatListCell}
                                >
                                  <Image
                                    source={{ uri: item.image_url }}
                                    style={styles.productImageIconFlatListCell}
                                  />
                                  <TouchableOpacity
                                  >
                                    <Text style={[styles.flatListHeaderViewTextStyle, {
                                      fontFamily: fonts.sourceSansProSemiBold,
                                      textAlign: 'left',
                                    }]}
                                    >
                                      {item.name}
                                    </Text>
                                    <Text
                                      style={[styles.flatListHeaderViewTextStyle, {
                                        textAlign: 'left',
                                        width: 200
                                      }]}
                                      ellipsizeMode="tail"
                                      numberOfLines={1}
                                    >
                                      {item.variant_name}
                                    </Text>
                                  </TouchableOpacity>
                                </View>
                                <View style={styles.flatListHeaderTitleViewStyle}>
                                  <TouchableOpacity
                                  >
                                    <Text
                                      style={[styles.flatListHeaderViewTextStyle, { fontSize: 12 }]}
                                      ellipsizeMode="tail"
                                      numberOfLines={1}
                                    >
                                      {
                                        item.price === null
                                        && '0'
                                      }
                                      {
                                        item.price !== null
                                        && currencyFormatter(item.price).replace(constants.RUPEE, '')
                                      }
                                    </Text>
                                  </TouchableOpacity>
                                </View>
                                <View style={styles.flatListHeaderTitleViewStyle}>
                                  <TouchableOpacity
                                  >
                                    <Text
                                      style={[styles.flatListHeaderViewTextStyle, { fontSize: 12 }]}
                                      ellipsizeMode="tail"
                                      numberOfLines={1}
                                    >
                                      {
                                        item.stock_available === null
                                        && '0'
                                      }
                                      {
                                        item.stock_available !== null
                                        && item.stock_available
                                      }
                                    </Text>
                                  </TouchableOpacity>
                                </View>
                                <View style={styles.flatListHeaderTitleViewStyle}>
                                  <TouchableOpacity
                                  >
                                    <Text
                                      style={[styles.flatListHeaderViewTextStyle, { fontSize: 12 }]}
                                      ellipsizeMode="tail"
                                      numberOfLines={1}
                                    >
                                      {
                                        item.test_ride_vehicle === null
                                        && '0'
                                      }
                                      {
                                        item.test_ride_vehicle !== null
                                        && item.test_ride_vehicle
                                      }
                                    </Text>
                                  </TouchableOpacity>
                                </View>
                                <View style={styles.flatListHeaderTitleViewStyle}>
                                  <TouchableOpacity
                                  >
                                    <Text
                                      style={[styles.flatListHeaderViewTextStyle, { fontSize: 12 }]}
                                      ellipsizeMode="tail"
                                      numberOfLines={1}
                                    >
                                      {
                                        (item.incentive_amount === null || item.incentive_amount === '0' || item.incentive_amount === '0.00')
                                          ? 'No incentive' : currencyFormatter(item.incentive_amount).replace(constants.RUPEE, '')
                                      }

                                    </Text>
                                  </TouchableOpacity>
                                </View>
                                <View style={styles.flatListHeaderTitleViewStyle}>
                                  <TouchableOpacity
                                  >
                                    <Text
                                      style={[styles.flatListHeaderViewTextStyle, { fontSize: 12 }]}
                                      ellipsizeMode="tail"
                                      numberOfLines={1}
                                    >
                                      {
                                        item.offer === null
                                        && 'No Offer'
                                      }
                                      {
                                        item.offer !== null
                                        && item.offer
                                      }
                                    </Text>
                                  </TouchableOpacity>
                                </View>
                                <View style={styles.flatListHeaderTitleViewStyle}>
                                  <TouchableOpacity
                                    onPress={() => this.onTap('Edit', item, index)}
                                  >
                                    <View style={styles.editBtnViewStyle}
                                    >
                                      <Text style={styles.flatlistTextEntryView}>
                                        Edit
                                      </Text>
                                    </View>
                                  </TouchableOpacity>
                                </View>
                              </View>
                            </View>
                          ))
                        }
                        </ScrollView>
                      )
                  }
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  }
}

export default UpdateInventoryScreen;
