/**
 * CompareVehicleScreen
 * This file has the compare vehicle screen design layout and also the functionalities are
 * embedded in it.
 * Vehicles from the same or different manufacturer could be compared.
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { NavigationActions } from 'react-navigation';
import {
  View, Alert,
  ScrollView, Text,
  Image, TouchableOpacity,
  FlatList, Animated, Dimensions, Picker
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

// Reducer
import { connect } from 'react-redux';
import { Popover, PopoverController } from 'react-native-modal-popover';
import LinearGradient from 'react-native-linear-gradient';

// Styles
import styles from './compareVehiclesStyles';

// Components
import Loader from '../../components/loader/Loader';
import {
  ButtonWithPlainText,
  BookTestRideButton
} from '../../components/button/Button';

// Images
import nextButton from '../../assets/images/right-arrow_orange.png';
import Close from '../../assets/images/ic_primary_close.png';
import AddIcon from '../../assets/images/ic_primary_addmore.png';
import InstantLeadCreation from '../ProductDetail/InstantLeadCreation';
import backArrow from '../../assets/images/white_back.png';

// Action Methods
import { getVehicleDetails, getSimilarVehicles, getVehiclePropertyList } from '../../redux/actions/CompareVehicles/actionCreators';
import {
  createLeadDetailsObject,
  updateLeadDetailsObject
} from '../../redux/actions/ProductDetail/actionCreators';
import {
  getLead,
  clearLead,
  updateLead,
  disableButton,
  setLead
} from '../../redux/actions/Global/actionCreators';
import { showIndicator, hideIndicator } from '../../redux/actions/Loader/actionCreators';
import { currencyFormatter } from '../../utils/validations';

const DEVICE_WIDTH = Dimensions.get('screen').width;
const DEVICE_HEIGHT = Dimensions.get('screen').height;

/**
 * This sample array is to mock the compare vehicle container's skeleton.
 */
const ComparisonArray = [
  {
    id: '1',
    name: 'AddIcon',
  },
  {
    id: '2',
    name: 'AddIcon',
  },
  {
    id: '3',
    name: 'AddIcon',
  },
];

@connect(
  state => ({
    lead: state.global.lead,
    currentUser: state.user.currentUser,
    vehicleDetail: state.compareVehicles.vehicleDetail,
    vehicleList: state.compareVehicles.vehicleData,
    loading: state.compareVehicles.loadingGroup,
    leadDetailObj: state.ProductDetail.leadDetailObj,
    vehiclePropertyList: state.compareVehicles.vehiclePropertyList,
    buttonState: state.global.buttonState
  }),
  {
    getVehicleDetails,
    getSimilarVehicles,
    getLead,
    createLeadDetailsObject,
    updateLeadDetailsObject,
    clearLead,
    updateLead,
    setLead,
    showIndicator,
    hideIndicator,
    getVehiclePropertyList,
    disableButton
  }
)

export default class CompareVehiclesScreen extends Component {
  static propTypes = {
    getVehicleDetails: PropTypes.func.isRequired,
    getSimilarVehicles: PropTypes.func.isRequired,
    createLeadDetailsObject: PropTypes.func.isRequired,
    updateLeadDetailsObject: PropTypes.func.isRequired,
    vehicleList: PropTypes.object,
    navigation: PropTypes.object.isRequired,
    vehicleDetail: PropTypes.object,
    loading: PropTypes.bool.isRequired,
    currentUser: PropTypes.object.isRequired,
    setLead: PropTypes.object.isRequired,
    clearLead: PropTypes.object.isRequired,
    leadDetailObj: PropTypes.object.isRequired,
    lead: PropTypes.object,
    updateLead: PropTypes.func.isRequired,
    showIndicator: PropTypes.func.isRequired,
    hideIndicator: PropTypes.func.isRequired,
    getVehiclePropertyList: PropTypes.func.isRequired,
    vehiclePropertyList: PropTypes.object,
    disableButton: PropTypes.func.isRequired,
    buttonState: PropTypes.bool.isRequired
  }

  static defaultProps = {
    vehicleDetail: {},
    vehicleList: [],
    lead: {},
    vehiclePropertyList: []
  }

  constructor(props) {
    super(props);
    this.animatedValue = new Animated.Value(3 * (DEVICE_WIDTH / 2));
    this.state = {
      currentVehicleList: [],
      showVehicleName: false,
      isEngineSelected: true,
      isBrakesSelected: false,
      isDimensionSelected: false,
      isFuelEfficiencySelected: false,
      toVal: 0,
      defaultVal: new Animated.Value(-480),
      initialLoad: true
    };
  }

  componentDidMount() {
    const { currentVehicleList } = this.state;
    this.props.getVehiclePropertyList(this.props.currentUser.dealerId).then(() => {
    });
    this.props.getVehicleDetails(this.props.navigation.state.params.vehicleId)
      .then(() => {
        currentVehicleList.push(this.props.vehicleDetail);
        if (this.props.navigation.state.params.variantId) {
          currentVehicleList[currentVehicleList.length - 1].selecedVariantIndex =
          this.props.vehicleDetail.variants.findIndex(obj => obj.id === this.props.navigation.state.params.variantId);
        } else {
          currentVehicleList[currentVehicleList.length - 1].selecedVariantIndex = 0;
        }
        this.setState({
          ...currentVehicleList,
        });
      }).catch(() => {});
  }

  onBikeTypeClicked = rowItem => {
    const { currentVehicleList } = this.state;
    this.closeToast();
    this.props.getVehicleDetails(rowItem.id)
      .then(() => {
        this.updateHighlightsKeys(this.props.vehicleDetail);
        currentVehicleList.push(this.props.vehicleDetail);
        this.updateCurrentVehicleListArray();
      }).catch(() => {
      });
  }

  onPickerChange = (variantIndex, vehicleIndex) => {
    const { currentVehicleList } = this.state;
    currentVehicleList[vehicleIndex].selecedVariantIndex = variantIndex;
    this.setState({
      currentVehicleList: this.state.currentVehicleList
    });
  }

  getComparisontTitle = () => {
    const { currentVehicleList } = this.state;
    let nameStr = '';
    if (currentVehicleList[0]) {
      nameStr = currentVehicleList[0].name;
    }
    if (currentVehicleList[1]) {
      nameStr = `${nameStr} \t vs \t ${currentVehicleList[1].name}`;
    }
    if (currentVehicleList[2]) {
      nameStr = `${nameStr} \t vs \t ${currentVehicleList[2].name}`;
    }
    return (
      nameStr
    );
  }

  getPickerCurrentValue = currentVehicle => {
    if (currentVehicle.selecedVariantIndex) {
      return currentVehicle.variants[currentVehicle.selecedVariantIndex].name;
    }
    return 0;
  }

  gotoProductDetails = item => {
    this.props.disableButton();
    const { navigation } = this.props;
    const variantId = item.selecedVariantIndex ? item.variants[item.selecedVariantIndex].id : item.variants[0].id;
    const variantColorId = item.selecedVariantIndex
      ? item.variants[item.selecedVariantIndex].colors[0].id
      : item.variants[0].colors[0].id;
    navigation.navigate('ProductDetailScreen', {
      vehicleId: item.id,
      variantId,
      variantColorId
    });
  }

  gotoBikePriceDetails = item => {
    this.props.disableButton();
    let currentIndex = -1;
    const lead = JSON.parse(JSON.stringify(this.props.lead));
    const leadDetailObj = {
      dealer_id: this.props.currentUser.dealerId,
      vehicle_id: item.id,
      variant_id: item.selecedVariantIndex ? item.variants[item.selecedVariantIndex].id : item.variants[0].id,
      variant_colour_id: item.selecedVariantIndex ? item.variants[item.selecedVariantIndex].colors[0].id
        : item.variants[0].colors[0].id,
      manufacturer_id: lead.manufacturer_id,
      lead_id: lead.id,
      vehicle_status: 200
    };
    if (lead
      && Object.keys(lead).length !== 0
      && ('lead_details' in lead)
      && lead.lead_details.length !== 0) {
      currentIndex = lead.lead_details.findIndex(eachObj => eachObj.vehicle_id === item.id);
    }
    if (currentIndex !== -1) {
      lead.lead_details[currentIndex] = {
        ...lead.lead_details[currentIndex],
        ...leadDetailObj
      };
    }
    if (lead && lead.id && lead.mobile_number && lead.mobile_number.length === 10) {
      if (currentIndex === -1) {
        this.props.createLeadDetailsObject(lead.id, leadDetailObj)
          .then(() => {
            this.updateLeadStatus(lead);
          });
      } else {
        this.props.navigation.navigate('BikePriceScreen', { leadDetail: lead.lead_details[currentIndex] });
      }
    } else if (lead && lead.id && !lead.mobile_number) {
      Alert.alert(
        'Info',
        'Please tap the lead name to enter the mobile number.',
        [
          { text: 'OK', onPress: () => { } },
        ],
        { cancelable: false }
      );
    } else {
      Alert.alert(
        'Lead Information Unavailable',
        'Please choose an existing lead or create new.',
        [
          { text: 'OK', onPress: () => { } },
        ],
        { cancelable: false }
      );
    }
  }

  updateLeadStatus = lead => {
    lead.status = 400;
    if (!lead.lead_details && !lead.follow_up && !lead.lead_finance_detail) {
      delete lead.lead_details;
      delete lead.follow_up;
      delete lead.lead_finance_detail;
      if (lead.lostReason) {
        delete lead.lostReason;
      }
    }
    this.props.updateLead(lead.id, lead)
      .then(() => {
        this.props.navigation.navigate('BikePriceScreen', { leadDetail: this.props.leadDetailObj });
      }).catch(() => {});
  }

  updateHighlightsKeys = addedVehicle => {
    this.state.currentVehicleList.forEach(currentVehicle => {
      const currentSimilarVehicles = currentVehicle.similarVehicles ? currentVehicle.similarVehicles : [];
      currentSimilarVehicles.forEach(currentSimilar => {
        if (currentSimilar.similar_vehicle_id === addedVehicle.id) {
          currentVehicle.showHignlights = true;
        }
      });
    });
  }

  updateOnDeleteVehicle = deletedVehicle => {
    this.state.currentVehicleList.forEach(currentVehicle => {
      const currentSimilarVehicles = currentVehicle.similarVehicles ? currentVehicle.similarVehicles : [];
      currentSimilarVehicles.forEach(currentSimilar => {
        if (currentSimilar.similar_vehicle_id === deletedVehicle.id) {
          currentVehicle.showHignlights = false;
        }
      });
    });
  }

  //  // Need to check the third vehicle and update the currentvehiclelist Array

  updateCurrentVehicleListArray = () => {
    const { currentVehicleList } = this.state;
    const updatedVehicleList = [];
    updatedVehicleList.push(currentVehicleList[0]);
    if (currentVehicleList.length > 2) {
      const firstVehicle = currentVehicleList[0];
      if (firstVehicle.similarVehicles.length > 0) {
        firstVehicle.similarVehicles.forEach(currentCompetitor => {
          if (currentCompetitor.similar_vehicle_id === currentVehicleList[2].id) {
            updatedVehicleList.push(currentVehicleList[2]);
            updatedVehicleList.push(currentVehicleList[1]);
            this.setState({
              currentVehicleList: updatedVehicleList,
            });
          }
        });
      }
    }
    this.setState({
      currentVehicleList: this.state.currentVehicleList
    });
  }

  openToolTip = (item, index, callback) => {
    this.setState({
      toolTipText: item && item.description ? item.description : ''
    });
    callback();
  }

  specTitleRenderItem = (item, index) => (
    <View style={styles.specTitleFlatListCellView}>
      <PopoverController>
        {({
          openPopover, closePopover, popoverVisible, setPopoverAnchor, popoverAnchorRect
        }) => (
          <React.Fragment>
            <Text style={styles.specFlatListTitleTextStyle}>
              {Object.keys(item).length > 0 && Object.keys(item)[0]}
            </Text>
            {
                item && item.description
                  ? (
                    <TouchableOpacity ref={setPopoverAnchor} onPress={() => this.openToolTip(item, index, openPopover)}>
                      <Icon
                        style={[styles.toolTipStyle]}
                        name="info-circle"
                        size={15}
                        color="orange" />
                    </TouchableOpacity>
                  )
                  : null
              }
            <Popover
              visible={popoverVisible}
              onClose={closePopover}
              fromRect={popoverAnchorRect}
              popoverStyle={{ width: 300 }}
              supportedOrientations={['portrait', 'landscape']}
              >
              <Text>{this.state.toolTipText}</Text>
            </Popover>
          </React.Fragment>
        )}
      </PopoverController>
    </View>
  );

  specValueRenderItem = (item, curreVehicle) => {
    const curreVariant = curreVehicle.variants[(curreVehicle.selecedVariantIndex
      ? curreVehicle.selecedVariantIndex : 0)];
    return (
      <View style={[styles.specValueFlatListCellView, {
        backgroundColor: ((((curreVehicle.showHignlights
          ? curreVehicle.showHignlights : false)
          && curreVariant.highlights
          && curreVariant.highlights.indexOf(Object.values(item)[0]) !== -1))
          ? '#CAE6C3' : '#ececec')
      }]}>
        <Text style={styles.specValueFlatListTitleTextStyle}>
          {
            (curreVariant
              && (Object.values(item)[0] in curreVariant)
              && curreVariant[Object.values(item)[0]] != null)
              ? `${curreVariant[Object.values(item)[0]]}`
              : '--'
          }
        </Text>
      </View>
    );
  }

  callToast() {
    const vehicleIdArray = [];
    if (this.state.currentVehicleList.length > 0) {
      this.state.currentVehicleList.forEach(item => {
        vehicleIdArray.push(item.id);
      });
    }
    this.props.getSimilarVehicles(vehicleIdArray).then(() => {
      this.setState({
        vehicleData: this.props.vehicleList
      });
    }).catch(error => {
      if (error && error.err && !error.err.message.includes('invalidaccesstoken')) {
        Alert.alert(
          '',
          error && error.err ? error.err.message : '',
          [
            { text: 'OK', onPress: () => { } },
          ],
          { cancelable: false }
        );
      }
    });
    Animated.timing(
      this.animatedValue,
      {
        toValue: DEVICE_HEIGHT / 2,
        duration: 350
      }
    ).start(this.closeToast());
  }

  closeToast() {
    Animated.timing(
      this.animatedValue,
      {
        toValue: 3 * (DEVICE_HEIGHT / 2),
        duration: 350
      }
    ).start();
  }

  addMoreVehicleBtnTapped = () => {
    this.callToast();
  }

  updateVariantIndex = deletedindex => {
    const { currentVehicleList } = this.state;
    const deletedVehicle = currentVehicleList[deletedindex];
    currentVehicleList.splice(deletedindex, 1);
    const similarVehicles = deletedVehicle.similarVehicles ? deletedVehicle.similarVehicles : [];
    if (this.props.currentUser.manufacturerId !== deletedVehicle.manufacturer_id) {
      this.updateOnDeleteVehicle(deletedVehicle);
    }
    if (similarVehicles.length > 0) {
      similarVehicles.forEach(currentCompetitor => {
        currentVehicleList.forEach((currentVehicle, index) => {
          if (currentCompetitor.similar_vehicle_id === currentVehicle.id) {
            currentVehicleList.splice(index, 1);
          }
        });
      });
    }
    this.setState({
      currentVehicleList: this.state.currentVehicleList,
    }, () => {
      if (currentVehicleList.length === 2) {
        this.updateHighlightsKeys(currentVehicleList[1]);
      }
      this.closeToast();
    });
  }

  closeBtntapped = (item, index) => {
    this.updateVariantIndex(index);
  }

  _vehicleKeyExtractor = item => item.id

  _vehicleRenderItem = data => {
    const { item } = data;
    return (
      <View>
        <TouchableOpacity
          style={styles.flatlistViewCellStyles}
          onPress={() => this.onBikeTypeClicked(item)}>
          <Image
            style={styles.vehicleImageFlatList}
            resizeMode="center"
            source={
              { uri: item.image_url }}
          />
          <Text
            style={styles.vehiclesFlatListTextStyle}
          >
            {item.name}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  handleScroll = event => {
    if (event.nativeEvent.contentOffset.y > 100) {
      this.setState({
        showVehicleName: true
      });
    } else {
      this.setState({
        showVehicleName: false
      });
    }
  }

  header = () => (
    <View style={styles.headerView}>
      <TouchableOpacity
        onPress={() => this.props.navigation.goBack()}
        style={styles.backbuttonStyle}
        activeOpacity={1}
      >
        <Image
          style={styles.backArrowImageStyle}
          source={backArrow}
        />
      </TouchableOpacity>
      <View style={styles.headerInlineSeperator} />
      <Text style={styles.headerTextStyle}>
        Comparison
        {
          this.state.currentVehicleList.length !== 0
            ? ` : ${this.getComparisontTitle().split('\n').join('')}`
            : ''
        }
      </Text>
      {
        this.props.lead && Object.keys(this.props.lead).length !== 0
        && (
        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end' }}>
          <View
            style={{
              width: 110
            }}
          >
            <LinearGradient
              colors={['#f3842d', '#ef563c']}
              style={{ flex: 1, justifyContent: 'flex-start', flexDirection: 'row' }}
            >
              <TouchableOpacity
                style={{ flexDirection: 'column', margin: 5 }}
                onPress={this.slide}
                activeOpacity={0.6}
              >
                <Text style={styles.leadText}>
                  {this.props.lead.name}
                </Text>
                <Text style={styles.leadText}>
                  {this.props.lead.mobile_number}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  position: 'absolute',
                  top: 10,
                  right: 10
                }}
                onPress={this.props.clearLead}
                activeOpacity={0.6}>
                <Text style={{ justifyContent: 'center', alignSelf: 'center' }}>
                  <Icon name="times" size={16} color="white" />
                </Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </View>
        )
      }
      {
        this.props.lead && Object.keys(this.props.lead).length === 0
        && (
        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end' }}>
          <TouchableOpacity
            style={{
              width: 50,
              marginLeft: 5
            }}
            onPress={this.searchLead}
            activeOpacity={0.6}
          >
            <LinearGradient
              colors={['#f3842d', '#ef563c']}
              style={{ flex: 1, justifyContent: 'center' }}>
              <Text style={{ justifyContent: 'center', alignSelf: 'center' }}>
                <Icon name="search" size={21} color="white" />
              </Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              width: 50,
              marginLeft: 5
            }}
            onPress={this.openCreateLead}
            activeOpacity={0.6}
          >
            <LinearGradient
              colors={['#f3842d', '#ef563c']}
              style={{ flex: 1, justifyContent: 'center' }}>
              <Text style={{ justifyContent: 'center', alignSelf: 'center' }}>
                <Icon name="plus" size={21} color="white" />
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
        )
      }
      <View />
    </View>
  )

  searchLead = () => {
    const { navigation } = this.props;
    if (this.state.toVal === 0 && !this.state.initialLoad) {
      this.slide();
    }
    navigation.navigate('SearchLead', {
      isFilterOpen: false,
      isLeadExists: false,
      selectLead: this.selectLead
    });
  }

  selectLead = lead => {
    this.props.setLead(lead);
    setTimeout(() => {
      this.props.navigation.dispatch(NavigationActions.back());
    }, 300);
  }

  slide = () => {
    if (this.state.toVal === -480) {
      this.state.toVal = 0;
      this.state.defaultVal = new Animated.Value(-480);
    } else if (this.state.initialLoad) {
      this.state.toVal = 0;
      this.state.defaultVal = new Animated.Value(-480);
      this.state.initialLoad = false;
    } else {
      this.state.toVal = -480;
      this.state.defaultVal = new Animated.Value(0);
    }
    this.setState({
      defaultVal: this.state.defaultVal,
      toVal: this.state.toVal
    }, () => {
      Animated.timing(this.state.defaultVal, {
        toValue: this.state.toVal,
        duration: 300
      }).start();
    });
  };

  openCreateLead = () => {
    this.slide();
  }

  renderItem = (item, index) => {
    if (this.state.currentVehicleList[index]) {
      const curreVehicle = this.state.currentVehicleList[index];
      return (
        <View>
          <ScrollView>
          <View style={[styles.vehicleCardView, { backgroundColor: 'white' }]}>
            <TouchableOpacity
              style={styles.closeBtnStyle}
              onPress={() => this.closeBtntapped(item, index)}
            >
              <Image
                style={{ resizeMode: 'center' }}
                source={Close}
              />
            </TouchableOpacity>
            <Text style={styles.currentVehicleNameView}>
              {
                curreVehicle
                  && Object.keys(curreVehicle).length !== 0
                  && ('name' in curreVehicle)
                  && curreVehicle.name !== null
                  ? (curreVehicle.name)
                  : '-'
              }
            </Text>
            <Image
              style={styles.vehicleImageStyle}
              resizeMode="center"
              source={
                {
                  uri: curreVehicle.selecedVariantIndex
                    ? curreVehicle.variants[curreVehicle.selecedVariantIndex].colors[0].image_url
                    : curreVehicle.variants[0].colors[0].image_url
                }}
            />
            <View style={{ flexDirection: 'row' }}>
              {
                this.props.currentUser.manufacturerId === curreVehicle.manufacturer_id
                  ? (
                    <View style={styles.onroadPriceView}
                  >
                      <Text
                        style={styles.vehiclePriceTitleTextStyle}
                    >
                      On-road price
                      </Text>
                      <Text
                        style={styles.vehiclePriceTextStyle}
                    >
                        {curreVehicle
                        && Object.keys(curreVehicle).length !== 0
                        && ('variants' in curreVehicle)
                        && curreVehicle.variants.length !== 0
                        && ('prices' in curreVehicle.variants[curreVehicle.selecedVariantIndex
                          ? curreVehicle.selecedVariantIndex : 0])
                        && Object.keys(curreVehicle.variants[curreVehicle.selecedVariantIndex
                          ? curreVehicle.selecedVariantIndex : 0].prices).length !== 0
                        && ('onroad_price' in curreVehicle.variants[curreVehicle.selecedVariantIndex
                          ? curreVehicle.selecedVariantIndex : 0].prices)
                        && curreVehicle.variants[curreVehicle.selecedVariantIndex
                          ? curreVehicle.selecedVariantIndex : 0].prices.onroad_price !== null
                          ? currencyFormatter(curreVehicle.variants[curreVehicle.selecedVariantIndex
                            ? curreVehicle.selecedVariantIndex : 0].prices.onroad_price)
                          : ' -'}
                      </Text>
                    </View>
                  )
                  : <View style={styles.onroadPriceView} />
              }
              {
                this.props.currentUser.manufacturerId === curreVehicle.manufacturer_id
                && (
                <View style={{ flex: 1, justifyContent: 'flex-end' }}>
                  <ButtonWithPlainText
                    image={nextButton}
                    disabled={this.props.buttonState}
                    style={styles.viewDetailsBtnStyle}
                    textStyle={styles.viewDetailsButtonTextStyle}
                    handleSubmit={() => this.gotoProductDetails(curreVehicle)}
                    title="View Details"
                  />
                </View>
                )
              }
            </View>
            <View style={styles.variantPickerView}>
              <View style={styles.variantPickerBorderView}>

                <Picker
                  style={{ height: 35 }}
                  selectedValue={
                    this.getPickerCurrentValue(curreVehicle)
                  }
                  mode="dropdown"
                  onValueChange={(itemValue, itemIndex) => this.onPickerChange(itemIndex, index)}
                >
                  {
                    curreVehicle.variants && curreVehicle.variants.map(currentVarient => (
                      <Picker.Item label={currentVarient.name} value={currentVarient.name} key={currentVarient.id} />
                    ))
                  }
                </Picker>
              </View>
            </View>
            {
              this.props.currentUser.manufacturerId === curreVehicle.manufacturer_id
              && (
                <BookTestRideButton
                  disabled={this.props.buttonState}
                  customStyles={styles.proceedBtnStyle}
                  customTextStyles={styles.proceedButtonTextStyle}
                  custom
                  title="Proceed"
                  handleSubmit={() => this.gotoBikePriceDetails(curreVehicle)}
                />
              )
            }
          </View>
          </ScrollView>
        </View>
      );
    }
    return (
      <View style={styles.vehicleCardView}>
        {
          this.props.loading
            ? (
              <TouchableOpacity onPress={this.addMoreVehicleBtnTapped} disabled>
                <View style={styles.addVehicleBtnView}
              >
                  <Image
                    style={styles.addImageIconView}
                    source={AddIcon}
                />
                </View>
                <Text style={styles.addNewBtnTextColor}>
                  {'Add More\nVehicles'}
                </Text>
              </TouchableOpacity>
            )
            : (
              <TouchableOpacity onPress={this.addMoreVehicleBtnTapped}>
                <View style={styles.addVehicleBtnView}
              >
                  <Image
                    style={styles.addImageIconView}
                    source={AddIcon}
                />
                </View>
                <Text style={styles.addNewBtnTextColor}>
                  {'Add More\nVehicles'}
                </Text>
              </TouchableOpacity>
            )

        }

      </View>
    );
  }

  render() {
    const refreshFlatList = { buttonState: this.props.buttonState, state: this.state };
    let heightValue;
    if(DEVICE_WIDTH > 960) {
      heightValue = 60;
     } else if(DEVICE_WIDTH < 700){
      heightValue = 120;
     }
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} scrollEnabled={DEVICE_WIDTH > 900 ? false : true}>
      <View>
        <Loader showIndicator={this.props.loading} />
        <Animated.View
          style={[{ backgroundColor: 'white', zIndex: 1 }, {
            transform: [
              {
                translateY: this.state.defaultVal
              }
            ]
          }, {
            alignSelf: 'center',
            marginLeft: 2,
            width: Dimensions.get('screen').width * 0.35,
            height: 480,
            zIndex: 2,
            elevation: 2,
            position: 'absolute',
            right: 0,
            top: 40
          }]}
        >
          <InstantLeadCreation
            dealerId={this.props.currentUser.dealerId}
            slide={this.slide}
            showIndicator={this.props.showIndicator}
            hideIndicator={this.props.hideIndicator}
          />
        </Animated.View>
        {this.header()}

        <ScrollView
          style={styles.scrollContainer}
          onScroll={this.handleScroll}
        >
          
          <View style={styles.vehicleNameViewStyles}>
              <Text style={styles.vehicleNameViewTextStyles}>
                {
                  this.state.currentVehicleList.length !== 0
                  && this.getComparisontTitle()
                }
                {
                  this.state.currentVehicleList.length === 0
                  && 'No vehicles to compare'
                }
              </Text>
            </View>
          <View style={[styles.topCardView, {height: (DEVICE_HEIGHT / 2) + heightValue}]}>
            <FlatList
              keyExtractor={item => item.id}
              data={ComparisonArray}
              renderItem={({ item, index }) => this.renderItem(item, index)}
              extraData={refreshFlatList}
              horizontal
              scrollEnabled
            />
          </View>
          {
            this.state.currentVehicleList.length > 0
            && (
            <View
              style={[styles.specsView, { marginBottom: 100 }]}
              onLayout={this.handleTextLayout}>

              <View style={{ marginTop: 0 }}>
                <TouchableOpacity
                  style={styles.SpecBtnStyle}
                  onPress={() => {
                    this.setState({
                      isEngineSelected: !this.state.isEngineSelected,
                      isDimensionSelected: false,
                      isBrakesSelected: false,
                      isFuelEfficiencySelected: false
                    });
                  }
                  }
                >
                  <Text style={styles.SpecsMainTitleTextStyle}>
                    {this.props.vehiclePropertyList && this.props.vehiclePropertyList.length > 0 &&
                      this.props.vehiclePropertyList[0].group_name}
                  </Text>
                  <View style={styles.showOrHideView}>
                    <Icon
                      style={[styles.arrowImageStyle]}
                      name={
                        this.state.isEngineSelected ? 'angle-up' : 'angle-down'
                      }
                      size={25}
                      color="white" />
                  </View>
                </TouchableOpacity>
                {
                  this.state.isEngineSelected
                  && (
                  <View
                    style={{ flexDirection: 'row' }}
                    >
                    <FlatList
                      style={styles.specTitleFlatListStyle}
                      keyExtractor={item => item.id}
                      data={this.props.vehiclePropertyList && this.props.vehiclePropertyList.length > 0 &&
                      this.props.vehiclePropertyList[0].label_and_value}
                      renderItem={({ item, index }) => this.specTitleRenderItem(item, index)}
                      extraData={this.state}
                      scrollEnabled
                    />
                    {
                      this.state.currentVehicleList[0]
                      && (
                      <FlatList
                        style={styles.vehicleSpecFlatListStyle}
                        keyExtractor={item => item.id}
                        data={this.props.vehiclePropertyList && this.props.vehiclePropertyList.length > 0 &&
                        this.props.vehiclePropertyList[0].label_and_value}
                        renderItem={({ item }) => this.specValueRenderItem(
                          item,
                          this.state.currentVehicleList[0]
                        )}
                        extraData={this.state}
                        scrollEnabled
                        />
                      )
                    }
                    {
                      !this.state.currentVehicleList[0]
                      && <View style={styles.dummyView} />
                    }
                    {
                      this.state.currentVehicleList[1]
                      && (
                      <FlatList
                        style={styles.vehicleSpecFlatListStyle}
                        keyExtractor={item => item.id}
                        data={this.props.vehiclePropertyList && this.props.vehiclePropertyList.length > 0 &&
                        this.props.vehiclePropertyList[0].label_and_value}
                        renderItem={({ item }) => this.specValueRenderItem(
                          item,
                          this.state.currentVehicleList[1]
                        )}
                        extraData={this.state}
                        scrollEnabled
                        />
                      )
                    }
                    {
                      !this.state.currentVehicleList[1]
                      && <View style={styles.dummyView} />
                    }
                    {
                      this.state.currentVehicleList[2]
                      && (
                      <FlatList
                        style={styles.vehicleSpecFlatListStyle}
                        keyExtractor={item => item.id}
                        data={this.props.vehiclePropertyList && this.props.vehiclePropertyList.length > 0 &&
                        this.props.vehiclePropertyList[0].label_and_value}
                        renderItem={({ item }) => this.specValueRenderItem(
                          item,
                          this.state.currentVehicleList[2]

                        )}
                        extraData={this.state}
                        scrollEnabled
                        />
                      )
                    }
                    {
                      !this.state.currentVehicleList[2]
                      && <View style={styles.dummyView} />
                    }
                  </View>
                  )
                }
              </View>

              <View style={{ marginTop: 20 }}>
                <TouchableOpacity
                  style={styles.SpecBtnStyle}
                  onPress={() => {
                    this.setState({
                      isEngineSelected: false,
                      isDimensionSelected: false,
                      isBrakesSelected: !this.state.isBrakesSelected,
                      isFuelEfficiencySelected: false
                    });
                  }
                  }
                >
                  <Text style={styles.SpecsMainTitleTextStyle}>
                    {this.props.vehiclePropertyList && this.props.vehiclePropertyList.length > 0 &&
                      this.props.vehiclePropertyList[1].group_name}
                  </Text>
                  <View style={styles.showOrHideView}>
                    <Icon
                      style={[styles.arrowImageStyle]}
                      name={
                        this.state.isBrakesSelected ? 'angle-up' : 'angle-down'
                      }
                      size={25}
                      color="white" />
                  </View>
                </TouchableOpacity>
                {
                  this.state.isBrakesSelected
                  && (
                  <View
                    style={{ flexDirection: 'row' }}
                    >
                    <FlatList
                      style={styles.specTitleFlatListStyle}
                      keyExtractor={item => item.id}
                      data={this.props.vehiclePropertyList && this.props.vehiclePropertyList.length > 0 &&
                        this.props.vehiclePropertyList[1].label_and_value}
                      renderItem={({ item }) => this.specTitleRenderItem(item)}
                      extraData={this.state}
                      scrollEnabled
                    />
                    {
                      this.state.currentVehicleList[0]
                      && (
                      <FlatList
                        style={styles.vehicleSpecFlatListStyle}
                        keyExtractor={item => item.id}
                        data={this.props.vehiclePropertyList && this.props.vehiclePropertyList.length > 0 &&
                          this.props.vehiclePropertyList[1].label_and_value}
                        renderItem={({ item }) => this.specValueRenderItem(
                          item,
                          this.state.currentVehicleList[0]
                        )}
                        extraData={this.state}
                        scrollEnabled
                        />
                      )
                    }
                    {
                      !this.state.currentVehicleList[0]
                      && <View style={styles.dummyView} />
                    }
                    {
                      this.state.currentVehicleList[1]
                      && (
                      <FlatList
                        style={styles.vehicleSpecFlatListStyle}
                        keyExtractor={item => item.id}
                        data={this.props.vehiclePropertyList && this.props.vehiclePropertyList.length > 0 &&
                          this.props.vehiclePropertyList[1].label_and_value}
                        renderItem={({ item }) => this.specValueRenderItem(
                          item,
                          this.state.currentVehicleList[1]
                        )}
                        extraData={this.state}
                        scrollEnabled
                        />
                      )
                    }
                    {
                      !this.state.currentVehicleList[1]
                      && <View style={styles.dummyView} />
                    }
                    {
                      this.state.currentVehicleList[2]
                      && (
                      <FlatList
                        style={styles.vehicleSpecFlatListStyle}
                        keyExtractor={item => item.id}
                        data={this.props.vehiclePropertyList && this.props.vehiclePropertyList.length > 0 &&
                          this.props.vehiclePropertyList[1].label_and_value}
                        renderItem={({ item }) => this.specValueRenderItem(
                          item,
                          this.state.currentVehicleList[2]
                        )}
                        extraData={this.state}
                        scrollEnabled
                        />
                      )
                    }
                    {
                      !this.state.currentVehicleList[2]
                      && <View style={styles.dummyView} />
                    }
                  </View>
                  )
                }
              </View>
              <View style={{ marginTop: 20 }}>
                <TouchableOpacity
                  style={styles.SpecBtnStyle}
                  onPress={() => {
                    this.setState({
                      isEngineSelected: false,
                      isDimensionSelected: !this.state.isDimensionSelected,
                      isBrakesSelected: false,
                      isFuelEfficiencySelected: false
                    });
                  }
                  }
                >
                  <Text style={styles.SpecsMainTitleTextStyle}>
                    {this.props.vehiclePropertyList && this.props.vehiclePropertyList.length > 0 &&
                      this.props.vehiclePropertyList[2].group_name}
                  </Text>
                  <View style={styles.showOrHideView}>
                    <Icon
                      style={[styles.arrowImageStyle]}
                      name={
                        this.state.isDimensionSelected ? 'angle-up' : 'angle-down'
                      }
                      size={25}
                      color="white" />
                  </View>
                </TouchableOpacity>
                {
                  this.state.isDimensionSelected
                  && (
                  <View
                    style={{ flexDirection: 'row' }}
                    >
                    <FlatList
                      style={styles.specTitleFlatListStyle}
                      keyExtractor={item => item.id}
                      data={this.props.vehiclePropertyList && this.props.vehiclePropertyList.length > 0 &&
                        this.props.vehiclePropertyList[2].label_and_value}
                      renderItem={({ item }) => this.specTitleRenderItem(item)}
                      extraData={this.state}
                      scrollEnabled
                    />
                    {
                      this.state.currentVehicleList[0]
                      && (
                      <FlatList
                        style={styles.vehicleSpecFlatListStyle}
                        keyExtractor={item => item.id}
                        data={this.props.vehiclePropertyList && this.props.vehiclePropertyList.length > 0 &&
                          this.props.vehiclePropertyList[2].label_and_value}
                        renderItem={({ item }) => this.specValueRenderItem(
                          item,
                          this.state.currentVehicleList[0]
                        )}
                        extraData={this.state}
                        scrollEnabled
                        />
                      )
                    }
                    {
                      !this.state.currentVehicleList[0]
                      && <View style={styles.dummyView} />
                    }
                    {
                      this.state.currentVehicleList[1]
                      && (
                      <FlatList
                        style={styles.vehicleSpecFlatListStyle}
                        keyExtractor={item => item.id}
                        data={this.props.vehiclePropertyList && this.props.vehiclePropertyList.length > 0 &&
                          this.props.vehiclePropertyList[2].label_and_value}
                        renderItem={({ item }) => this.specValueRenderItem(
                          item,
                          this.state.currentVehicleList[1]
                        )}
                        extraData={this.state}
                        scrollEnabled
                        />
                      )
                    }
                    {
                      !this.state.currentVehicleList[1]
                      && <View style={styles.dummyView} />
                    }
                    {
                      this.state.currentVehicleList[2]
                      && (
                      <FlatList
                        style={styles.vehicleSpecFlatListStyle}
                        keyExtractor={item => item.id}
                        data={this.props.vehiclePropertyList && this.props.vehiclePropertyList.length > 0 &&
                          this.props.vehiclePropertyList[2].label_and_value}
                        renderItem={({ item }) => this.specValueRenderItem(
                          item,
                          this.state.currentVehicleList[2]
                        )}
                        extraData={this.state}
                        scrollEnabled
                        />
                      )
                    }
                    {
                      !this.state.currentVehicleList[2]
                      && <View style={styles.dummyView} />
                    }
                  </View>
                  )
                }
              </View>
              <View style={{ marginTop: 20, marginBottom: 30 }}>
                <TouchableOpacity
                  style={[styles.SpecBtnStyle]}
                  onPress={() => {
                    this.setState({
                      isEngineSelected: false,
                      isDimensionSelected: false,
                      isBrakesSelected: false,
                      isFuelEfficiencySelected: !this.state.isFuelEfficiencySelected
                    });
                  }
                  }
                >
                  <Text style={styles.SpecsMainTitleTextStyle}>
                    {this.props.vehiclePropertyList && this.props.vehiclePropertyList.length > 0 &&
                      this.props.vehiclePropertyList[3].group_name}
                  </Text>
                  <View style={styles.showOrHideView}>
                    <Icon
                      style={[styles.arrowImageStyle]}
                      name={
                        this.state.isFuelEfficiencySelected ? 'angle-up' : 'angle-down'
                      }
                      size={25}
                      color="white" />
                  </View>
                </TouchableOpacity>
                {
                  this.state.isFuelEfficiencySelected
                  && (
                  <View
                    style={{ flexDirection: 'row' }}
                    >
                    <FlatList
                      style={styles.specTitleFlatListStyle}
                      keyExtractor={item => item.id}
                      data={this.props.vehiclePropertyList && this.props.vehiclePropertyList.length > 0 &&
                        this.props.vehiclePropertyList[3].label_and_value}
                      renderItem={({ item }) => this.specTitleRenderItem(item)}
                      extraData={this.state}
                      scrollEnabled
                    />
                    {
                      this.state.currentVehicleList[0]
                      && (
                      <FlatList
                        style={styles.vehicleSpecFlatListStyle}
                        keyExtractor={item => item.id}
                        data={this.props.vehiclePropertyList && this.props.vehiclePropertyList.length > 0 &&
                          this.props.vehiclePropertyList[3].label_and_value}
                        renderItem={({ item }) => this.specValueRenderItem(
                          item,
                          this.state.currentVehicleList[0]
                        )}
                        extraData={this.state}
                        scrollEnabled
                        />
                      )
                    }
                    {
                      !this.state.currentVehicleList[0]
                      && <View style={styles.dummyView} />
                    }
                    {
                      this.state.currentVehicleList[1]
                      && (
                      <FlatList
                        style={styles.vehicleSpecFlatListStyle}
                        keyExtractor={item => item.id}
                        data={this.props.vehiclePropertyList && this.props.vehiclePropertyList.length > 0 &&
                          this.props.vehiclePropertyList[3].label_and_value}
                        renderItem={({ item }) => this.specValueRenderItem(
                          item,
                          this.state.currentVehicleList[1]
                        )}
                        extraData={this.state}
                        scrollEnabled
                        />
                      )
                    }
                    {
                      !this.state.currentVehicleList[1]
                      && <View style={styles.dummyView} />
                    }
                    {
                      this.state.currentVehicleList[2]
                      && (
                      <FlatList
                        style={styles.vehicleSpecFlatListStyle}
                        keyExtractor={item => item.id}
                        data={this.props.vehiclePropertyList && this.props.vehiclePropertyList.length > 0 &&
                          this.props.vehiclePropertyList[3].label_and_value}
                        renderItem={({ item }) => this.specValueRenderItem(
                          item,
                          this.state.currentVehicleList[2]
                        )}
                        extraData={this.state}
                        scrollEnabled
                        />
                      )
                    }
                    {
                      !this.state.currentVehicleList[2]
                      && <View style={styles.dummyView} />
                    }
                  </View>
                  )
                }
              </View>
            </View>
            )
          }
        </ScrollView>
        <Animated.View style={[styles.VehiclesFlatlistViewStyles, {
          transform: [{ translateY: this.animatedValue }],
        }]}>

          {
            this.props.loading
              ? null
              : (
                <FlatList
                  horizontal
                  keyExtractor={this._vehicleKeyExtractor}
                  data={this.state.vehicleData}
                  renderItem={this._vehicleRenderItem}
                  extraData={this.state}
              />
              )
          }

        </Animated.View>
        {
          (this.state.showVehicleName && this.state.currentVehicleList.length > 0)
          && (
          <View
            style={[styles.vehicleNameHeaderViewStyle]}>
            <Text style={
              [styles.headerVehicleNameTextStyle,
                {
                  marginLeft: 199,
                  borderLeftWidth: this.state.currentVehicleList[0].name ? 1 : 0
                }]}>
              {
                this.state.currentVehicleList[0]
                  && this.state.currentVehicleList[0].name !== null
                  ? this.state.currentVehicleList[0].name : ''
              }
            </Text>
            <Text style={[
              styles.headerVehicleNameTextStyle,
              {
                borderLeftWidth: (this.state.currentVehicleList[0] && this.state.currentVehicleList[0].name) ? 1 : 0
              }
            ]}>
              {
                this.state.currentVehicleList[1]
                  && this.state.currentVehicleList[1].name !== null
                  ? this.state.currentVehicleList[1].name : ''
              }
            </Text>
            <Text style={[
              styles.headerVehicleNameTextStyle,
              {
                borderLeftWidth: (this.state.currentVehicleList[1] && this.state.currentVehicleList[1].name) ? 1 : 0
              }
            ]}>
              {
                this.state.currentVehicleList[2]
                  && this.state.currentVehicleList[2].name !== null
                  ? this.state.currentVehicleList[2].name : ''
              }
            </Text>
          </View>
          )
        }
      </View>
      </ScrollView>
    );
  }
}
