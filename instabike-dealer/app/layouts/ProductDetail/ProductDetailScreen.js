/**
 * The Product Details Screen show the complete details of product including
 * features, specification, 360 degree image view, etc
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { NavigationActions } from 'react-navigation';
import {
  View,
  TouchableOpacity,
  Image,
  Text,
  FlatList,
  ScrollView,
  Dimensions,
  PanResponder,
  Picker,
  Alert,
  Animated,
  Modal,
  TouchableHighlight
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Popover, PopoverController } from 'react-native-modal-popover';
import Close from '../../assets/images/close.png';

// Reducer
import { connect } from 'react-redux';

// Style
import styles from './productDetailStyles';
import Modalstyles from '../LeadHistory/leadDetailActionStyles';
import constants from '../../utils/constants';
import { showIndicator, hideIndicator } from '../../redux/actions/Loader/actionCreators';

// Action Methods
import {
  getProductDetails,
  get360ImageDetails,
  createLeadDetailsObject,
  updateLeadDetailsObject,
  persistVehicleDetails
} from '../../redux/actions/ProductDetail/actionCreators';
import {
  getLead, clearLead,
  updateLead, setLead
} from '../../redux/actions/Global/actionCreators';

import { getVehiclePropertyList } from '../../redux/actions/CompareVehicles/actionCreators';

// Components
// import Loader from '../../components/loader/Loader';
import {
  ButtonWithLeftImage,
  ButtonWithRightImage,
  SecondaryButton,
  BookTestRideButton
} from '../../components/button/Button';

// Images
import backButton from '../../assets/images/backArrow.png';
import nextButton from '../../assets/images/nextArrow.png';
import GreenTickIcon from '../../assets/images/ic_greentick.png';
import LeftArrowOrange from '../../assets/images/ic_primary_lefticon.png';
import RightArrowOrange from '../../assets/images/ic_primary_righticon.png';
import backArrow from '../../assets/images/white_back.png';
import downArrowOrange from '../../assets/images/ic_primary_scrollbutton.png';
import InstantLeadCreation from './InstantLeadCreation';
import { currencyFormatter } from '../../utils/validations';
import Video from 'react-native-video';

var Sounds = require('react-native-sound');

var Sound = null;
const DEVICE_WIDTH = Dimensions.get('screen').width;
let pointsArr = [];

  @connect(
    state => ({
      productDetail: state.ProductDetail.productDetail,
      images360Array: state.ProductDetail.images360Array,
      leadDetailObj: state.ProductDetail.leadDetailObj,
      lead: state.global.lead,
      loading: state.ProductDetail.loadingGroup || state.compareVehicles.loadingGroup,
      vehicleDetails: state.ProductDetail.vehicleDetails,
      currentUser: state.user.currentUser,
      vehiclePropertyList: state.compareVehicles.vehiclePropertyList,
    }),
    {
      getProductDetails,
      get360ImageDetails,
      updateLead,
      createLeadDetailsObject,
      updateLeadDetailsObject,
      getLead,
      clearLead,
      persistVehicleDetails,
      setLead,
      showIndicator,
      hideIndicator,
      getVehiclePropertyList,
    }
  )

class ProductDetailScreen extends Component {
  static propTypes = {
    getProductDetails: PropTypes.func.isRequired,
    get360ImageDetails: PropTypes.func.isRequired,
    createLeadDetailsObject: PropTypes.func.isRequired,
    updateLeadDetailsObject: PropTypes.func.isRequired,
    getLead: PropTypes.func.isRequired,
    clearLead: PropTypes.func.isRequired,
    updateLead: PropTypes.func.isRequired,
    persistVehicleDetails: PropTypes.func.isRequired,
    productDetail: PropTypes.object,
    images360Array: PropTypes.array,
    lead: PropTypes.object,
    vehicleDetails: PropTypes.object.isRequired,
    navigation: PropTypes.object.isRequired,
    loading: PropTypes.bool.isRequired,
    setLead: PropTypes.func.isRequired,
    currentUser: PropTypes.object.isRequired,
    showIndicator: PropTypes.func.isRequired,
    hideIndicator: PropTypes.func.isRequired,
    getVehiclePropertyList: PropTypes.func.isRequired,
    vehiclePropertyList: PropTypes.object,

  }

  static defaultProps = {
    productDetail: {},
    images360Array: [],
    lead: {},
    vehiclePropertyList: []
  }

  constructor(props) {
    super(props);
    this.state = {
      currentVariantId: '',
      currentColorId: '',
      currentDealerId: '',
      currentProductDetails: {},
      currentVariantArray: [],
      currentVariantDetails: {},
      currentVehicleColorObject: {},
      currentVehicleFeatureArray: [],
      currentFeature: {},
      currentFeatureIndex: 0,
      current360ImagesArray: [],
      toVal: 0,
      defaultVal: new Animated.Value(-480),
      initialLoad: true,
      value: 0,
      tabLayoutData: [
        {
          id: '1',
          name: 'Overview',
        },
        {
          id: '2',
          name: '360',
        },
        {
          id: '3',
          name: 'Features',
        },
        {
          id: '4',
          name: 'Specs',
        },
      ],
      tabPosition: '1',
      specTabPosition: '1',
      selectedType: 'Overview',
      selectedSpecTabType: 'Engine & Transmission',
      isAudioPlayed: false,
      modalVisible: false,
      isVideoPlayed: false,

    };
  }

  static getDerivedStateFromProps(nextProps) {
    if (nextProps && nextProps.lead && nextProps.currentUser && nextProps.currentUser.dealerId) {
      const currentDetailObj = Object.keys(nextProps.lead).length > 0 && nextProps.lead.lead_details
      && nextProps.lead.lead_details.length > 0 && nextProps.lead.lead_details
          .find(currentLeadDetail => nextProps.navigation.state.params.vehicleId === currentLeadDetail.vehicle_id);
      if (currentDetailObj && Object.keys(currentDetailObj).length > 0) {
        return {
          lead: { ...nextProps.lead },
          currentDealerId: nextProps.currentUser.dealerId,
          currentVariantId: currentDetailObj.variant_id,
          currentColorId: currentDetailObj.variant_colour_id,
        };
      }
      return {
        lead: { ...nextProps.lead },
        currentDealerId: nextProps.currentUser.dealerId,
        currentVariantId: nextProps.navigation.state.params.variantId,
        currentColorId: nextProps.navigation.state.params.colorId,
      };
    }
    return null;
  }

  componentDidMount() {
    this.onInitialLoad();
    this.willFocusSubscription = this.props.navigation.addListener(
      'willFocus',
      () => {
        this.onInitialLoad();
      }
    );
    Sound = new Sounds('https://instabikedevdisks.blob.core.windows.net/instabike/flash_motors/Audio/motorcycle-arrive-and-shut-off-01.mp3', Sounds.MAIN_BUNDLE, (error) => {
      Sound.setNumberOfLoops(-1);
    });
  }

  componentWillUnmount() {
    this.props.persistVehicleDetails({});
    this.willFocusSubscription.remove();
  }

  onInitialLoad() {
    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: this._handleStartShouldSetPanResponder,
      onMoveShouldSetPanResponder: this._handleMoveShouldSetPanResponder,
      onPanResponderGrant: this._handlePanResponderGrant,
      onPanResponderMove: this._handlePanResponderMove,
      onPanResponderRelease: this._handlePanResponderEnd,
      onPanResponderTerminate: this._handlePanResponderEnd,
    });
    const { vehicleDetails, lead } = this.props;
    this.props.showIndicator();
    Promise.all([
      this.props.getProductDetails(this.props.navigation.state.params.vehicleId),
      this.props.get360ImageDetails(this.props.navigation.state.params.vehicleId),
      this.props.getVehiclePropertyList(this.props.currentUser.dealerId)
    ]).then(() => {
      const currentVar = this.state.currentVariantId
       && this.props.productDetail.variants
         .find(currentObj => currentObj.id === this.state.currentVariantId)
        ? this.props.productDetail.variants
          .find(currentObj => currentObj.id === this.state.currentVariantId)
        : this.props.productDetail.variants[0];
      this.setState({
        ...vehicleDetails,
        currentProductDetails: this.props.productDetail,
        current360ImagesArray: this.props.images360Array,
        currentVariantArray: (this.props.productDetail
          && Object.keys(this.props.productDetail).length !== 0
          && ('variants' in this.props.productDetail)
          && this.props.productDetail.variants.length !== 0)
          ? this.props.productDetail.variants : [],
        currentVariantDetails: (this.props.productDetail
          && Object.keys(this.props.productDetail).length !== 0
          && ('variants' in this.props.productDetail)
          && this.props.productDetail.variants.length !== 0)
          ? currentVar : {},
        currentVehicleFeatureArray: (this.props.productDetail
            && Object.keys(this.props.productDetail).length !== 0
            && ('features' in this.props.productDetail)
            && this.props.productDetail.features.length !== 0)
          ? this.props.productDetail.features : [],
        currentFeature: (this.props.productDetail
            && Object.keys(this.props.productDetail).length !== 0
            && ('features' in this.props.productDetail)
            && this.props.productDetail.features.length !== 0)
          ? this.props.productDetail.features[0] : {},
        currentVehicleColorObject: (
          this.props.productDetail
          && Object.keys(this.props.productDetail).length !== 0
          && ('variants' in this.props.productDetail)
          && this.props.productDetail.variants.length !== 0
          && this.props.productDetail.variants[0]
           && Object.keys(this.props.productDetail.variants[0]).length !== 0
           && ('colors' in this.props.productDetail.variants[0])
           && this.props.productDetail.variants[0].colors.length !== 0)
          ? (((this.props.productDetail.variants
            .find(currentObj => currentObj.id === this.state.currentVariantId))
            .colors.find(currentObj => currentObj.id === this.state.currentColorId))
            ? this.props.productDetail.variants
              .find(currentObj => currentObj.id === this.state.currentVariantId)
              .colors.find(currentObj => currentObj.id === this.state.currentColorId)
            : this.props.productDetail.variants
              .find(currentObj => currentObj.id === this.state.currentVariantId).colors[0]) : {},
      });
      this.props.images360Array.map(currentImageObj => (
        <Image
          source={{ uri: currentImageObj.image_url }}
          key={currentImageObj.id}
        />
      ));
      this.props.hideIndicator();
    }).catch(() => {
      this.props.hideIndicator();
    });
    const isGlobalLeadEmpty = lead && Object.keys(lead).length === 0;
    // getting lead only if global lead and param lead id are not same
    if ((this.props.navigation.state.params.id && isGlobalLeadEmpty)) {
      this.props.showIndicator();
      this.props.getLead(this.props.navigation.state.params.id).then(() => {
        this.props.hideIndicator();
      }).catch(() => {
        this.props.hideIndicator();
      });
    } else if (this.props.lead) {
      this.props.getLead(this.props.lead.id).then(() => {
        this.props.hideIndicator();
      }).catch(() => {
        this.props.hideIndicator();
      });
    }
  }

  onTabPress = tabInfo => {
    this.setState({
      tabPosition: tabInfo.id,
      selectedType: tabInfo.name
    });
  }

  onSpecTabPress = specTabInfo => {
    this.setState({
      specTabPosition: specTabInfo.id,
      selectedSpecTabType: specTabInfo.group_name
    });
  }

  playMusic = (key) => {
    if(key === 'Play') {
      Sound.play();
    } else {
      Sound.pause();
    }
    this.setState({
      isAudioPlayed: !this.state.isAudioPlayed
    })
} 

  playVideo = (currentFeature) =>{
    const name = currentFeature
      && Object.keys(currentFeature).length !== 0
      && ('name' in currentFeature)
        && currentFeature.name !== null ? currentFeature.name : '';
      if(name === 'ABS (ANTI LOCK BRAKE SYSTEM)') {
        this.setState({ modalVisible: true, isAudioPlayed: false  })
      Sound.stop();
     }
   }

  onPickerChange=bikeVariant => {
    this.setState({
      currentVariantDetails: bikeVariant,
      currentVehicleColorObject: (
        bikeVariant
         && Object.keys(bikeVariant).length !== 0
         && ('colors' in bikeVariant)
         && bikeVariant.colors.length !== 0)
        ? bikeVariant.colors[0] : {},
    });
  }

  getTabData = () => (
    <View style={styles.tabviewStyle}>
      {
        this.state.tabLayoutData.map(tab => (
          <TouchableOpacity
            key={tab.id}
            style={this.changeTabColor(tab.id)}
            onPress={() => this.onTabPress(tab)}
          >
            <Text style={this.changeTextColor(tab.id)}>
              {tab.name}
              {
               tab.name === '360'
                 ? <Text>&deg;</Text> : ''
                 }
            </Text>
          </TouchableOpacity>
        ))
      }
    </View>
  )

  getSpecTabData = () => (
    <View style={styles.specTabviewStyle}>
      {
        this.props.vehiclePropertyList.map(tab => (
          <TouchableOpacity
            key={tab.id}
            style={this.changeSpecTabColor(tab.id)}
            onPress={() => this.onSpecTabPress(tab)}
          >
            <Text style={this.changeSpecTextColor(tab.id)}>{tab.group_name}</Text>
          </TouchableOpacity>
        ))
      }
    </View>
  )

  getCurrentView=() => {
    const BoldText = props => <Text style={{ fontWeight: 'bold', fontSize: 20, color: '#34323b' }}>{props.children}</Text>;
    const { currentProductDetails, currentVariantDetails, currentVehicleColorObject } = this.state;
    switch (this.state.selectedType) {
      case 'Overview': {
        return (
          <View style={styles.DataContainer}>
         
              <TouchableHighlight
              style={styles.mainBikeImageStyle}
              underlayColor = {'transparent'}
              onPress={this.playMusic.bind(this, !this.state.isAudioPlayed ? "Play" : "Pause")}>

            <Image
              style={styles.mainBikeImageStyle}
              resizeMode="contain"
              source={{
                uri: (currentVehicleColorObject
              && Object.keys(currentVehicleColorObject).length !== 0
              && ('image_url' in currentVehicleColorObject)
              && currentVehicleColorObject.image_url !== null) ? currentVehicleColorObject.image_url : 'http://'
              }}
            />
            </TouchableHighlight>
            <View style={[styles.splitViewStyle, { backgroundColor: '#272121' }]}>
              <View style={{ flex: DEVICE_WIDTH > 900 ? 8 : 2 }} />
              <View style={styles.imageBottomView}>
                <ScrollView>
                <View style={{
                  flexDirection: DEVICE_WIDTH > 900 ? 'row' : 'column',
                   height: DEVICE_WIDTH > 900 ? 100 : 180, alignItems: 'center', marginLeft: 20, marginBottom: 10
                }}
                >
                  <View style={{ flex: 1 }}>
                    <FlatList
                      style={[styles.colorFlatListStyle, { height: 20, marginBottom: 0 }]}
                      horizontal
                      keyExtractor={this._KeyExtractor}
                      data={
                      (currentVariantDetails
                        && ('colors' in currentVariantDetails)
                      && Object.keys(currentVariantDetails.colors).length !== 0) ? currentVariantDetails.colors : []
                    }
                      renderItem={this._renderItem}
                      extraData={this.state}
                    />
                    <View style={{
                      flexDirection: 'row',
                      width: 200,
                      borderColor: '#EF7432',
                      borderWidth: 1,
                      height: 40,
                      marginRight: 10,
                      marginBottom: 20,
                      backgroundColor: 'white'
                    }}
                  >
                      <Image
                        style={{
                          height: 20,
                          width: 20,
                          marginLeft: 5,
                          alignSelf: 'center'
                        }}
                        source={GreenTickIcon}
                    />
                      <View style={{
                        flex: 6,
                      }}
                    >
                        <Picker
                          enabled={!this.checkForFinancierLead() && !this.isVehicleBooked()}
                          style={{ height: 35 }}
                          selectedValue={this.state.currentVariantDetails.name}
                          mode="dropdown"
                          onValueChange={(itemValue, itemIndex) => this.onPickerChange(this.state.currentVariantArray[itemIndex])}
                      >
                          {
                        this.state.currentVariantArray && this.state.currentVariantArray.map(currentVarient => (
                          <Picker.Item
                            label={currentVarient.name}
                            value={currentVarient.name}
                            key={currentVarient.id}
                          />
                        ))
                      }
                        </Picker>
                      </View>
                    </View>
                  </View>
                  <View style={{ marginHorizontal: 20}}>
                    <Text
                      style={[styles.detailDescriptionTextStyle,
                        {
                          color: 'white', marginHorizontal: 0, fontSize: 15, marginBottom: 0
                        }
                      ]}
                    >
                      On Road Price (Starting from)
                    </Text>
                    <BookTestRideButton
                      customStyles={[styles.showPriceBreakDownStyle, { marginBottom: 5 }]}
                      customTextStyles={styles.showPriceBreakDownTextStyle}
                      title={
                        (currentVariantDetails
                      && ('prices' in currentVariantDetails)
                      && Object.keys(currentVariantDetails.prices).length !== 0
                      && ('onroad_price' in currentVariantDetails.prices)
                      && currentVariantDetails.prices.onroad_price !== null)
                          ? currencyFormatter(currentVariantDetails.prices.onroad_price)
                          : '0'
                      }
                      disabled={this.props.loading}
                      handleSubmit={() => this._onShowPriceBreakDownBtnClicked()}
                      />
                    {/* <Text
                      style={[styles.detailDescriptionTextStyle,
                        {
                          color: 'white', marginHorizontal: 2, fontSize: 15, marginTop: 0
                        }
                      ]}
                    >
                      Onwards
                    </Text> */}
                  </View>
                </View>
                </ScrollView>
              </View>
            </View>
            <View style={[styles.splitViewStyle, { alignItems: 'flex-start' }]}>
              <View style={styles.dataView}>
                <Text
                  style={styles.bikeNameTextStyle}
                  ellipsizeMode="tail"
                  numberOfLines={2}
                >
                  {(currentProductDetails
                    && Object.keys(currentProductDetails).length !== 0
                    && ('manufacturer' in currentProductDetails)
                    && Object.keys(currentProductDetails.manufacturer).length !== 0
                    && ('display_name' in currentProductDetails.manufacturer))
                    ? (currentProductDetails.manufacturer.display_name).toUpperCase() : ''}
                </Text>
                <Text
                  style={styles.descriptionTextStyle}
                  ellipsizeMode="tail"
                  numberOfLines={2}
                >
                  {Object.keys(currentProductDetails).length !== 0
                   && ('name' in currentProductDetails)
                    && currentProductDetails.name !== null
                    ? currentProductDetails.name.toUpperCase() : '' }
                </Text>
                <View style={styles.detailView}>
                  <View style={{
                    margin: 5,
                    flexDirection: 'column',
                    alignItems: 'center',
                    alignSelf: 'center'
                  }}
                  >
                    <Text style={styles.unitsTextStyle}>
                      <BoldText>
                        {(currentProductDetails
                  && Object.keys(currentProductDetails).length !== 0
                  && ('displacement' in currentProductDetails)
                  && currentProductDetails.displacement !== null) ? (currentProductDetails.displacement).split(' ')[0]
                          : '0'
                    }
                      </BoldText>
                      {' '}
cc
                    </Text>
                    <Text style={styles.detailDescriptionTextStyle}>
                      Engine
                    </Text>
                  </View>
                  <View style={{
                    margin: 5,
                    flexDirection: 'column',
                    alignItems: 'center',
                    alignSelf: 'center'
                  }}
                  >
                    <Text style={styles.unitsTextStyle}>
                      <BoldText>
                        {(currentProductDetails
                  && Object.keys(currentProductDetails).length !== 0
                  && ('overall_weight' in currentProductDetails)
                  && currentProductDetails.overall_weight !== null) ? (currentProductDetails.overall_weight).split('.')[0]
                          : '0'
                    }
                      </BoldText>
                      {' '}
kg
                    </Text>
                    <Text style={styles.detailDescriptionTextStyle}>
                      Weight
                    </Text>
                  </View>
                  <View style={{
                    margin: 5,
                    flexDirection: 'column',
                    alignItems: 'center',
                    alignSelf: 'center'
                  }}
                  >
                    {
                      constants.vehicleToHideMileage !== (this.props.currentUser && this.props.currentUser.manufacturerSlug)
                  // !constants.hideMileage
                  && (
                  <React.Fragment>
                    <Text style={styles.unitsTextStyle}>
                      <BoldText>
                        {(currentProductDetails
                  && Object.keys(currentProductDetails).length !== 0
                  && ('fuel_efficiency_overall' in currentProductDetails)
                  && currentProductDetails.fuel_efficiency_overall !== null)
                          ? (currentProductDetails.fuel_efficiency_overall).split(' ')[0]
                          : '0'
                    }
                      </BoldText>
                      {' '}
                      kmpl
                    </Text>
                    <Text style={styles.detailDescriptionTextStyle}>
                      Mileage
                    </Text>
                  </React.Fragment>
                  )
                  }
                  </View>
                </View>
                <ScrollView style={{ height: 200 }}>
                  <Text
                    style={styles.detailDescriptionTextStyle}
                    ellipsizeMode="tail"
                    // numberOfLines={6}
                  >
                    {currentProductDetails.description}
                  </Text>
                </ScrollView>
                {/* <View style={{
                  flexDirection: 'row', height: 50, marginTop: 10
                }}
                /> */}
                <TouchableOpacity
                  style={styles.downArrowStyle}
                  onPress={() => this.overviewDownArrowTapped()}
                  activeOpacity={1}
                >
                  <Image
                    style={[styles.backArrowImageStyle, { height: 70, width: 70 }]}
                    source={downArrowOrange}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        );
      }
      case '360': {
        const { current360ImagesArray, value } = this.state;
        return (
          <View style={styles.image360View}>
            <TouchableOpacity
              style={styles.image360LeftArrowIcon}
              onPress={() => this.image360LeftArrowtapped()}>
              <Image
                source={LeftArrowOrange}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.image360RightArrowIcon]}
              onPress={() => this.image360RightArrowtapped()}>
              <Image
                source={RightArrowOrange}
              />
            </TouchableOpacity>
            {
              current360ImagesArray.map((eachItem, index) => (
                <Image
                  style={[styles.image360Style, { opacity: (value === index) ? 1 : 0 }]}
                  fadeDuration={0}
                  resizeMode="contain"
                  source={{
                    uri: (eachItem
            && Object.keys(eachItem).length !== 0
            && ('image_url' in eachItem)
            && eachItem.image_url !== null) ? eachItem.image_url : 'http://'
                  }}
                  {...this._panResponder.panHandlers}
          />
              ))
          }
            <TouchableOpacity
              style={[styles.downArrowStyle, { position: 'absolute', bottom: 20, left: (DEVICE_WIDTH / 2) - 35 }]}
              onPress={() => this.image360DownArrowTapped()}
              activeOpacity={1}
            >
              <Image
                style={[styles.backArrowImageStyle, { height: 70, width: 70 }]}
                source={downArrowOrange}
              />
            </TouchableOpacity>
          </View>
        );
      }
      case 'Features': {
        const { currentFeature } = this.state;
        return (
          <View style={styles.DataContainer}>
            <View style={[styles.splitViewStyle,
              {
                backgroundColor: 'white',
              }]}
            >
              <Image
                style={styles.featureImageView}
                resizeMode="center"
                source={{
                  uri: (currentFeature
              && Object.keys(currentFeature).length !== 0
              && ('image_url' in currentFeature)
              && currentFeature.image_url !== null) ? currentFeature.image_url : 'http://'
                }}
              />
            </View>
            <View style={[styles.splitViewStyle,
              {
                backgroundColor: 'white',
              }]}
            >
              <View style={styles.featureRightContentView}>
                <View style={styles.fetureRightDataView}>
                  <Text
                    style={styles.featuresTitleTextStyle}
                    ellipsizeMode="tail"
                    numberOfLines={2}
                   
                    onPress={this.playVideo.bind(this, currentFeature)}
                  >
                    {currentFeature
                      && Object.keys(currentFeature).length !== 0
                      && ('name' in currentFeature)
                        && currentFeature.name !== null ? currentFeature.name : ''}
                  </Text>
               
                  <View style={{ height: 150 }}>
                    <ScrollView>
                      <Text>
                        {currentFeature.description}
                      </Text>
                    </ScrollView>
                  </View>
                  <View style={styles.featureRightDataBtnView}>
                    <ButtonWithLeftImage
                      image={backButton}
                      style={styles.backButtonStyle}
                      textStyle={styles.backButtonTextStyle}
                      handleSubmit={this.backBtnTapped}
                      title="Back"
                    />
                    <ButtonWithRightImage
                      image={nextButton}
                      style={styles.nextBtnStyle}
                      textStyle={styles.nextButtonTextStyle}
                      handleSubmit={() => this.nextBtnTapped()}
                      title="Next"
                    />
                  </View>
                  <TouchableOpacity
                    style={[styles.downArrowStyle, {
                      marginTop: 20,
                      position: 'absolute',
                      bottom: 20,
                      right: 150
                    }]}
                    onPress={() => this.featureDownArrowTapped()}
                    activeOpacity={1}
                  >
                    <Image
                      style={[styles.backArrowImageStyle, { height: 70, width: 70 }]}
                      source={downArrowOrange}
                    />
                  </TouchableOpacity>
                </View>
                <View style={styles.featureRightSliderView}>
                  <Text style={styles.slidertextStyle}>
                    {this.state.currentFeatureIndex + 1}
/
                    {this.state.currentVehicleFeatureArray.length}
                  </Text>
                  <View style={styles.sliderViewStyle}>
                    {this.getSliderView()}
                  </View>
                </View>
              </View>
            </View>
          </View>
        );
      }
      case 'Specs': {
        return (
          <View style={styles.DataContainer}>
            <View style={[styles.splitViewStyle,
              {
                backgroundColor: '#272121',
              }]}
            >
              <View style={styles.specLeftUpperView}>
                <View style={{ flex: 1 }}>
                  {/* <Image
                    style={styles.specVehicleView}
                    resizeMode="center"
                    source={require('../../assets/images/logoBike.png')}
                  /> */}
                </View>
                <View style={styles.specsListView}>
                  {this.getSpecTabData()}
                </View>
              </View>
              <View style={styles.specVehicleDetailView}>
                <View style={{ flexDirection: 'row', flex: 1 }}>
                  <View style={{
                    marginTop: 10, flex: 1, flexDirection: 'row'
                  }}
                  >
                    <View style={styles.dotterView} />
                    <View>
                      <Text style={styles.specBottomTitleStyle}>
                      Width
                      </Text>
                      <Text style={styles.specBottomDesStyle}>
                        {(currentVariantDetails.overall_width !== null)
                          ? currentVariantDetails.overall_width : '--'}
                        {' '}
                        {/* mm */}
                      </Text>
                    </View>
                  </View>
                  <View style={{
                    marginTop: 10, flex: 1, flexDirection: 'row'
                  }}
                  >
                    <View style={styles.dotterView} />
                    <View>
                      <Text style={styles.specBottomTitleStyle}>
                      Weight
                      </Text>
                      <Text style={styles.specBottomDesStyle}>
                        {(currentVariantDetails.overall_weight !== null)
                          ? (currentVariantDetails.overall_weight).split('.')[0] : '--'}
                        {' '}
                        {/* kg */}
                      </Text>
                    </View>
                  </View>
                  <View style={{
                    marginTop: 10, flex: 1, flexDirection: 'row'
                  }}
                  >
                    <View style={styles.dotterView} />
                    <View>
                      <Text style={styles.specBottomTitleStyle}>
                      Height
                      </Text>
                      <Text style={styles.specBottomDesStyle}>
                        {(currentVariantDetails.overall_height !== null)
                          ? currentVariantDetails.overall_height : '--'}
                        {' '}
                        {/* mm */}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
            <View style={[styles.splitViewStyle, { backgroundColor: 'white' }]}>
              {/* <View style={styles.scrollViewStyle}> */}
              { this.getCurrentSpecView() }
              {/* </View> */}
              <TouchableOpacity
                style={[styles.downArrowStyle, { display: 'none', marginTop: 20 }]}
                onPress={() => this.specsDownArrowTapped()}
                activeOpacity={1}
              >
                <Image
                  style={[styles.backArrowImageStyle, { height: 70, width: 70 }]}
                  source={downArrowOrange}
                />
              </TouchableOpacity>
            </View>
          </View>
        );
      }
      case 'Price': {
        return (
          <View style={styles.DataContainer}>
            <Image
              style={styles.breakDownPageImagePosition}
              source={{
                uri: (currentVehicleColorObject
              && Object.keys(currentVehicleColorObject).length !== 0
              && ('image_url' in currentVehicleColorObject)
              && currentVehicleColorObject.image_url !== null) ? currentVehicleColorObject.image_url : 'http://'
              }}
            />
            <View style={[styles.splitViewStyle, { backgroundColor: '#272121' }]}>
              <View style={[styles.breakdownLeftContentView, { height: 120 }]}>
                <View style={{
                  flexDirection: 'column', height: 40, alignItems: 'flex-start', marginLeft: 20
                }}
                >
                  <Text
                    style={[styles.detailDescriptionTextStyle, {
                      color: '#827773', textAlign: 'left'
                    }]}
                  >
                  On Road Price
                  </Text>
                  <Text
                    style={[styles.bikeNameTextStyle, { color: 'white', marginVertical: 10 }]}
                  >
                    {constants.RUPEE}
                    {
                    (currentVariantDetails
                  && ('prices' in currentVariantDetails)
                  && Object.keys(currentVariantDetails.prices).length !== 0
                  && ('onroad_price' in currentVariantDetails.prices)
                  && currentVariantDetails.prices.onroad_price !== null)
                      ? (currentVariantDetails.prices.onroad_price).split('.')[0]
                      : '0'
                  }
                  </Text>
                </View>
                <ButtonWithRightImage
                  image={nextButton}
                  style={styles.showBreakDownButton}
                  textStyle={styles.showBreakDownTextStyle}
                  handleSubmit={() => this._onShowPriceBreakDownBtnClicked()}
                  title="Show Price Breakdown"
                />
              </View>
            </View>
            <View style={[styles.splitViewStyle, { alignItems: 'flex-start' }]}>
              <View style={styles.dataView}>
                <View style={{
                  flexDirection: 'row',
                  width: 200,
                  borderColor: '#EF7432',
                  borderWidth: 1,
                  height: 40,
                  marginRight: 10,
                  marginVertical: 20
                }}
                >
                  <Image
                    style={{
                      height: 20,
                      width: 20,
                      alignSelf: 'center'
                    }}
                    source={GreenTickIcon}
                  />
                  <View style={{
                    flex: 6,
                  }}
                  >
                    <Picker
                      style={{ height: 35 }}
                      selectedValue={this.state.currentVariantDetails.name}
                      mode="dropdown"
                      onValueChange={(itemValue, itemIndex) => this.onPickerChange(this.state.currentVariantArray[itemIndex])}
                    >
                      {
                      this.state.currentVariantArray && this.state.currentVariantArray.map(currentVarient => (
                        <Picker.Item label={currentVarient.name} value={currentVarient.name} key={currentVarient.id} />
                      ))
                    }
                    </Picker>
                  </View>
                </View>
                <Text
                  style={[styles.bikeNameTextStyle, { fontSize: 12 }]}
                  ellipsizeMode="tail"
                  numberOfLines={2}
                >
                  {(currentProductDetails
                    && Object.keys(currentProductDetails).length !== 0
                    && ('manufacturer' in currentProductDetails)
                    && Object.keys(currentProductDetails.manufacturer).length !== 0
                    && ('display_name' in currentProductDetails.manufacturer))
                    ? (currentProductDetails.manufacturer.display_name).toUpperCase() : ''}
                </Text>
                <Text
                  style={[styles.descriptionTextStyle, { fontSize: 16 }]}
                  ellipsizeMode="tail"
                  numberOfLines={2}
                >
                  {Object.keys(currentProductDetails).length !== 0
                   && ('name' in currentProductDetails)
                    && currentProductDetails.name !== null
                    ? currentProductDetails.name.toUpperCase() : '' }
                </Text>
                <View style={[styles.detailView, { height: 60 }]}>
                  <View style={{
                    margin: 5,
                    flexDirection: 'column',
                    alignItems: 'center',
                    alignSelf: 'center'
                  }}
                  >
                    <Text style={styles.unitsTextStyle}>
                      <BoldText>
                        {(currentProductDetails
                  && Object.keys(currentProductDetails).length !== 0
                  && ('displacement' in currentProductDetails)
                  && currentProductDetails.displacement !== null) ? (currentProductDetails.displacement).split(' ')[0]
                          : '0'
                    }
                      </BoldText>
cc
                    </Text>
                    <Text style={styles.detailDescriptionTextStyle}>
                      Engine
                    </Text>
                  </View>
                  <View style={{
                    margin: 5,
                    flexDirection: 'column',
                    alignItems: 'center',
                    alignSelf: 'center'
                  }}
                  >
                    <Text style={styles.unitsTextStyle}>
                      <BoldText>
                        {(currentProductDetails
                  && Object.keys(currentProductDetails).length !== 0
                  && ('overall_weight' in currentProductDetails)
                  && currentProductDetails.overall_weight !== null) ? (currentProductDetails.overall_weight).split(' ')[0]
                          : '0'
                    }
                      </BoldText>
kmpl
                    </Text>
                    <Text style={styles.detailDescriptionTextStyle}>
                      Weight
                    </Text>
                  </View>
                  <View style={{
                    margin: 5,
                    flexDirection: 'column',
                    alignItems: 'center',
                    alignSelf: 'center'
                  }}
                  >
                    {
                      constants.vehicleToHideMileage !== (this.props.currentUser && this.props.currentUser.manufacturerSlug)
                    // !constants.hideMileage
                    && (
                    <React.Fragment>
                      <Text style={styles.unitsTextStyle}>
                        <BoldText>
                          {(currentProductDetails
                    && Object.keys(currentProductDetails).length !== 0
                    && ('fuel_efficiency_overall' in currentProductDetails)
                    && currentProductDetails.fuel_efficiency_overall !== null)
                            ? (currentProductDetails.fuel_efficiency_overall).split(' ')[0]
                            : '0'
                      }
                        </BoldText>
                        {/* kmpl */}
                      </Text>
                      <Text style={styles.detailDescriptionTextStyle}>
                        Mileage
                      </Text>
                    </React.Fragment>
                    )
                    }
                  </View>
                </View>
                <Text
                  style={styles.detailDescriptionTextStyle}
                  ellipsizeMode="tail"
                  numberOfLines={4}
                >
                  {currentProductDetails.description}
                </Text>
                <View style={{
                  flexDirection: 'row', height: 50
                }}
                >
                  <Text style={{ alignSelf: 'center' }}>
                    <BoldText>Available colors</BoldText>
                  </Text>
                  <FlatList
                    style={[styles.colorFlatListStyle, { width: 120, height: 30 }]}
                    horizontal
                    keyExtractor={this._KeyExtractor}
                    data={
                  (currentVariantDetails
                    && ('colors' in currentVariantDetails)
                  && Object.keys(currentVariantDetails.colors).length !== 0) ? currentVariantDetails.colors : []
                }
                    renderItem={this._renderItem}
                    extraData={this.state}
                  />
                </View>
                <View style={{
                  flexDirection: 'row', height: 50, flex: 1
                }}
                >
                  <SecondaryButton
                    title="SCHEDULE TEST RIDE"
                    buttonStyle={styles.scheduleTestRideBtnStyle}
                    handleSubmit={() => this._onScheduleTestRideBtnClicked()}
                    textStyle={styles.scheduleTestRideBtnTextStyle}
                  />
                  <SecondaryButton
                    title="I WANT FINANCE"
                    buttonStyle={styles.financeBtnStyle}
                    handleSubmit={() => this._onIWantFinanceBtnClicked()}
                    textStyle={styles.financeBtnTextStyle}
                  />
                </View>
                <TouchableOpacity
                  style={styles.downArrowStyle}
                  onPress={null}
                  activeOpacity={1}
                >
                  <Image
                    style={[styles.backArrowImageStyle, { height: 70, width: 70 }]}
                    source={downArrowOrange}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        );
      }
      default:
        return (
          <View style={{ height: 100 }} />
        );
    }
  }

  specificationCard = item => {
    const { currentVariantDetails } = this.state;
    const specLabel = Object.keys(item).length > 0 && Object.keys(item)[0] ? Object.keys(item)[0] : '';
    const specKey = Object.values(item).length > 0 && Object.values(item)[0] ? Object.values(item)[0] : '';
    if (item.description) {
      return (
        <View style={{ marginTop: 10, flex: 1 }}>
          <PopoverController>
            {({
              openPopover, closePopover, popoverVisible, setPopoverAnchor, popoverAnchorRect
            }) => (
              <React.Fragment>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={styles.specTitleTextStyle}>
                    {specLabel}
                  </Text>
                  <TouchableOpacity
                    ref={setPopoverAnchor}
                    onPress={() => this.openToolTip(item, 0, openPopover)}>
                    <Icon
                      style={[styles.toolTipStyle]}
                      name="info-circle"
                      size={15}
                      color="orange" />
                  </TouchableOpacity>
                </View>
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
          <Text style={styles.specTitleDesTextStyle}>
            {
              (currentVariantDetails[specKey] !== null) ? currentVariantDetails[specKey] : '--'
            }
          </Text>
        </View>
      );
    }
    return (
      <View style={{ marginTop: 10, flex: 1 }}>
        <Text style={styles.specTitleTextStyle}>
          {specLabel}
        </Text>
        <Text style={styles.specTitleDesTextStyle}>
          {(currentVariantDetails[specKey] !== null)
            ? currentVariantDetails[specKey] : '--'}
        </Text>
      </View>
    );
  }

  getCurrentSpecView=() => {
    let activeData = [];
    if (this.state.selectedSpecTabType === 'Engine & Transmission') {
      activeData = this.props.vehiclePropertyList && this.props.vehiclePropertyList.length > 0 &&
      this.props.vehiclePropertyList[0].label_and_value;
    } else if (this.state.selectedSpecTabType === 'Brakes, Wheels & Suspension') {
      activeData = this.props.vehiclePropertyList && this.props.vehiclePropertyList.length > 0 &&
      this.props.vehiclePropertyList[1].label_and_value;
    } else if (this.state.selectedSpecTabType === 'Dimensions & Chassis') {
      activeData = this.props.vehiclePropertyList && this.props.vehiclePropertyList.length > 0 &&
      this.props.vehiclePropertyList[2].label_and_value;
    } else if (this.state.selectedSpecTabType === 'Features') {
      activeData = this.props.vehiclePropertyList && this.props.vehiclePropertyList.length > 0 &&
      this.props.vehiclePropertyList[3].label_and_value;
    }
    return (
      <FlatList
        style={{ height: 300, margin: 30 }}
        data={activeData}
        renderItem={({ item, index }) => this.specificationCard(item, index)}
        keyExtractor={item => item[Object.keys(item)[0]]}
        horizontal={false}
        numColumns={2}
        extraData={activeData.length}
      />
    );
  }

  getSliderView=() => (
    <View style={{ flex: 1 }}>
      {
        this.state.currentVehicleFeatureArray.map((eachItem, index) => (
          <TouchableOpacity
            style={{ flex: 1, alignItems: 'center' }}
            onPress={() => this.sliderViewTapped(eachItem, index)}
          >
            <View
              style={{
                flex: 1,
                width: 5,
                backgroundColor: (index === this.state.currentFeatureIndex)
                  ? '#f3795c' : 'gray',
                marginVertical: 5,
                borderRadius: 3
              }}
            />
          </TouchableOpacity>
        ))
      }
    </View>
  )

  checkForFinancierLead = () => {
    const { lead } = this.props;
    const currentObj = lead && lead.lead_details && lead.lead_details.length > 0
    && lead.lead_details.find(eachObj => eachObj.vehicle_id === this.props.navigation.state.params.vehicleId);
    const financierLeadObj = (currentObj && currentObj.financier_lead) ? currentObj.financier_lead : [];
    if ((financierLeadObj && financierLeadObj.length) > 0) {
      return true;
    }
    return false;
  }

  isVehicleBooked = () => {
    const { lead } = this.props;
    const currentObj = lead && lead.lead_details && lead.lead_details.length > 0
    && lead.lead_details.find(eachObj => eachObj.vehicle_id === this.props.navigation.state.params.vehicleId);
    if ((currentObj && currentObj.vehicle_status >= 450)) {
      return true;
    }
    return false;
  }

  openToolTip = (item, index, callback) => {
    this.setState({
      toolTipText: item && item.description ? item.description : ''
    });
    callback();
  }

  _KeyExtractor = item => item.id

  _renderItem = data => {
    const { item } = data;
    return (
      <TouchableOpacity
        onPress={() => this.colorViewTapped(item)}
        activeOpacity={1}
        // disabled={this.checkForFinancierLead()}
      >
        <View style={[styles.colorCellStyle,
          {
            backgroundColor: (item
            && Object.keys(item).length !== 0
            && ('color_codes' in item)
            && item.color_codes.length !== 0)
              ? item.color_codes[0]
              : 'white',
            borderColor: (item.id === this.state.currentVehicleColorObject.id) ? '#F17C3A' : 'gray'
          }
        ]}
        >
          {
            item
            && Object.keys(item).length !== 0
            && ('color_codes' in item)
            && item.color_codes.length !== 0
            && this.updateCurrentColorView(item.color_codes)
          }
        </View>
      </TouchableOpacity>
    );
  }

  updateCurrentColorView=item => (
    <View style={{ flex: 1 }}>
      {
        item.map(eachItem => <View style={{ flex: 1, backgroundColor: eachItem }} />)
      }
    </View>
  )

  changeTabColor(id) {
    if (this.state.tabPosition === id) {
      return styles.tabSelectedStyle;
    }
    return styles.tabStyle;
  }

  changeTextColor(id) {
    if (this.state.tabPosition === id) {
      return styles.tabSelectedTextStyle;
    }
    return styles.tabTextStyle;
  }

  changeSpecTabColor(id) {
    if (this.state.specTabPosition === id) {
      return styles.specTabSelectedStyle;
    }
    return styles.SpecTabStyle;
  }

  changeSpecTextColor(id) {
    if (this.state.specTabPosition === id) {
      return styles.specTabSelectedTextStyle;
    }
    return styles.specTabTextStyle;
  }

  _backArrowBtnClicked = () => {
    this.props.navigation.dispatch(NavigationActions.back());
    if(Sound) {
      Sound.stop()
    }
  }

  _onShowPriceBreakDownBtnClicked = () => {
    let currentIndex = -1;
    const {
      currentProductDetails, currentVariantDetails, currentVehicleColorObject, currentDealerId
    } = this.state;
    if (currentProductDetails && currentProductDetails.id && currentVariantDetails
      && currentVariantDetails.id && currentVehicleColorObject && currentVehicleColorObject.id && currentDealerId) {
      const { lead } = this.props;
      if (lead
        && Object.keys(lead).length !== 0
        && ('lead_details' in lead)
        && lead.lead_details.length !== 0) {
        currentIndex = lead.lead_details.findIndex(eachObj => eachObj.vehicle_id === currentProductDetails.id);
      }
      const leadDetailObj = {
        dealer_id: currentDealerId,
        vehicle_id: currentProductDetails.id,
        variant_id: currentVariantDetails.id,
        variant_colour_id: currentVehicleColorObject.id,
        manufacturer_id: lead.manufacturer_id,
        od_premium_validity: 1,
        compulsory_pa_cover: 1,
        tp_premium: 1,
        lead_id: lead.id,
        vehicle_status: currentIndex === -1 ? 200 : lead.lead_details[currentIndex].vehicle_status,
      };
      if (currentIndex !== -1) {
        lead.lead_details[currentIndex] = {
          ...lead.lead_details[currentIndex],
          ...leadDetailObj
        };
      }
      if (lead && lead.id && lead.mobile_number && lead.mobile_number.length !== 0) {
        if (currentIndex === -1) {
          this.props.showIndicator();
          this.props.createLeadDetailsObject(lead.id, leadDetailObj)
            .then(() => {
              this.props.hideIndicator();
              this.props.navigation.navigate(
                'BikePriceScreen',
                {
                  leadDetail: this.props.leadDetailObj,
                  fromScreen: this.props.navigation.state.params.fromScreen
                }
              );
            }).catch(() => {
              this.props.hideIndicator();
            });
        } else {
          this.props.showIndicator();
          this.props.updateLeadDetailsObject(
            lead.lead_details[currentIndex].id,
            lead.lead_details[currentIndex]
          )
            .then(() => {
              this.props.hideIndicator();
              this.props.navigation.navigate(
                'BikePriceScreen',
                {
                  leadDetail: this.props.leadDetailObj,
                  fromScreen: this.props.navigation.state.params.fromScreen
                }
              );
            }).catch(() => {
              this.props.hideIndicator();
            });
        }
      } else if (lead && lead.id && !lead.mobile_number) {
        Alert.alert(
          'Info',
          'Please tap the lead name to enter the mobile number.',
          [
            { text: 'OK', onPress: () => {} },
          ],
          { cancelable: false }
        );
      } else {
        Alert.alert(
          'Lead Information Unavailable',
          'Please choose an existing lead or create new.',
          [
            { text: 'OK', onPress: () => {} },
          ],
          { cancelable: false }
        );
      }
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
    const { currentVariantDetails, currentVehicleColorObject } = this.state;
    this.props.persistVehicleDetails({
      currentVariantDetails,
      currentVehicleColorObject
    });
    this.props.showIndicator();
    this.props.updateLead(lead.id, lead)
      .then(() => {
        this.props.hideIndicator();
        this.props.navigation.navigate(
          'BikePriceScreen',
          {
            leadDetail: this.props.leadDetailObj,
            fromScreen: this.props.navigation.state.params.fromScreen
          }
        );
      }).catch(() => {
        this.props.hideIndicator();
      });
  }

  checkLeadDetailHasLeadDetail = () => {
    const {
      currentProductDetails, currentLeadDetailObject, currentVariantDetails, currentVehicleColorObject, currentDealerId
    } = this.state;
    if (currentLeadDetailObject
        && Object.keys(currentLeadDetailObject).length !== 0
        && ('lead_details' in currentLeadDetailObject)
        && currentLeadDetailObject.lead_details.length !== 0) {
      const currentIndex = currentLeadDetailObject.lead_details.findIndex(eachObj => eachObj.vehicle_id === currentProductDetails.id);
      const leadDetailObj = {
        dealer_id: currentDealerId,
        vehicle_id: currentProductDetails.id,
        variant_id: currentVariantDetails.id,
        variant_colour_id: currentVehicleColorObject.id,
        manufacturer_id: currentLeadDetailObject.manufacturer_id,
        lead_id: currentLeadDetailObject.id
      };
      if (currentIndex === -1) {
        currentLeadDetailObject.lead_details.push({
          ...leadDetailObj
        });
      } else {
        currentLeadDetailObject.lead_details[currentIndex] = {
          ...currentLeadDetailObject.lead_details[currentIndex],
          ...leadDetailObj
        };
      }
      this.setState({
        currentLeadDetailObject
      });
    }
  }

  _onScheduleTestRideBtnClicked =() => {
    console.log('_onScheduleTestRideBtnClicked CLicked');
  }

  _onIWantFinanceBtnClicked =() => {
    console.log('_onIWantFinanceBtnClicked CLicked');
  }

  image360LeftArrowtapped =() => {
    const { value, current360ImagesArray } = this.state;
    let currentVal = value - 1;
    if (currentVal < 0) {
      currentVal = current360ImagesArray.length - 1;
    } else if (currentVal > current360ImagesArray.length) {
      currentVal = 0;
    } else if (currentVal === current360ImagesArray.length) {
      currentVal = 0;
    }
    this.setState({
      value: currentVal
    });
  }

  image360RightArrowtapped =() => {
    const { value, current360ImagesArray } = this.state;
    let currentVal = value + 1;
    if (currentVal < 0) {
      currentVal = current360ImagesArray.length - 1;
    } else if (currentVal > current360ImagesArray.length) {
      currentVal = 0;
    } else if (currentVal === current360ImagesArray.length) {
      currentVal = 0;
    }
    this.setState({
      value: currentVal
    });
  }

  colorViewTapped = item => {
    this.setState({
      currentVehicleColorObject: item
    });
  }

  sliderViewTapped = (item, index) => {
    this.setState({
      currentFeatureIndex: index,
      currentFeature: item
    });
  }

  emiOptionsbtnTapped = () => {
    console.log('EMI OPTIONS View CLicked');
  }

  backBtnTapped = () => {
    // this.props.clearLead();
    let curIndex = this.state.currentFeatureIndex - 1;
    if (curIndex < 0) {
      curIndex = this.state.currentVehicleFeatureArray.length - 1;
    }
    this.setState({
      currentFeatureIndex: curIndex,
      currentFeature: this.state.currentVehicleFeatureArray[curIndex]
    });
  }

  nextBtnTapped = () => {
    let curIndex = this.state.currentFeatureIndex + 1;
    if (curIndex === this.state.currentVehicleFeatureArray.length) {
      curIndex = 0;
    }
    this.setState({
      currentFeatureIndex: curIndex,
      currentFeature: this.state.currentVehicleFeatureArray[curIndex]
    });
  }

  overviewDownArrowTapped = () => {
    this.onTabPress(this.state.tabLayoutData[1]);
  }

  image360DownArrowTapped = () => {
    this.onTabPress(this.state.tabLayoutData[2]);
  }

  featureDownArrowTapped = () => {
    this.onTabPress(this.state.tabLayoutData[3]);
  }

  specsDownArrowTapped = () => {
  }

  _handlePanResponderMove = e => {
    pointsArr.push(e.nativeEvent.locationX);
    this.updateSlider();
  };

  _handlePanResponderEnd = () => {
    pointsArr = [];
  };

  _handleStartShouldSetPanResponder = () => true
  ;

  _handleMoveShouldSetPanResponder = () => true
  ;

  _handlePanResponderGrant = () => {
    // this._highlight();
  };

  updateSlider() {
    const { current360ImagesArray } = this.state;
    const sliderStep = DEVICE_WIDTH / current360ImagesArray.length;
    const firstEle = pointsArr[0];
    const lastEle = pointsArr[pointsArr.length - 1];
    let drag = lastEle - firstEle;
    if (Math.abs(Math.round(drag / sliderStep)) >= 1) {
      pointsArr = [];
      let currentVal = Math.round(this.state.value + Math.round(drag / sliderStep));
      if (currentVal < 0) {
        currentVal = current360ImagesArray.length - 1;
      } else if (currentVal > current360ImagesArray.length) {
        currentVal = 0;
      } else if (currentVal === current360ImagesArray.length) {
        currentVal = 0;
      }
      drag = 0;
      this.setState({
        value: currentVal
      });
    }
  }

  searchLead = () => {
    const { navigation } = this.props;
    const { currentVariantDetails, currentVehicleColorObject } = this.state;
    if (this.state.toVal === 0 && !this.state.initialLoad) {
      this.slide();
    }
    this.props.persistVehicleDetails({
      currentVariantDetails,
      currentVehicleColorObject
    });
    navigation.push('SearchLead', {
      isFilterOpen: false,
      isLeadExists: false,
      selectLead: this.selectLead
    });
  }

  selectLead = lead => {
    this.props.setLead(lead);
    setTimeout(() => {
      this._backArrowBtnClicked();
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

  render() {
    const { currentProductDetails } = this.state;
    return (
      <View style={styles.mainContainer}>
        {/* <Loader loading={this.props.loading} /> */}
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
            dealerId={this.state.currentDealerId}
            slide={this.slide}
            showIndicator={this.props.showIndicator}
            hideIndicator={this.props.hideIndicator}
          />
        </Animated.View>
        <View style={styles.headerView}>
          <TouchableOpacity
            onPress={() => this._backArrowBtnClicked()}
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
            {currentProductDetails.name}
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
                    activeOpacity={0.6}>
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
        <View style={styles.tabViewStyles}>
          {this.getTabData()}
        </View>
        { this.getCurrentView()}

        <ScrollView contentContainerStyle={styles.ModalContainer}>
        <Modal
          animationType="slide"
          transparent
          visible={this.state.modalVisible}
          onRequestClose={() => {
            this.setState({
              modalVisible: false,
              folloupComment: ''
            });
          }}>
          <View style={styles.removeFinancierContainer}>
            <View style={styles.removeFinancierView}>
              <View style={{ alignItems: 'flex-end'}}>
                <TouchableOpacity
                  style={[styles.closeBtnView, { alignItems: 'center', width: 40 }]}
                  disabled={this.props.buttonState}
                  onPress={() => {
                    this.setState({
                      modalVisible: false,
                    });
                  }}>
                  <Image
                    style={{ resizeMode: 'center' }}
                    source={Close} />
                </TouchableOpacity>
              </View>
            <View>

              <Video source={{uri: "https://instabikedevdisks.blob.core.windows.net/instabike/flash_motors/Video/videoplayback.mp4"}}   // Can be a URL or a local file.
                ref={(ref) => {
                  this.player = ref
                }}                                   
                onBuffer={this.onBuffer}             
                onError={error = () => this.videoError(error)}
                paused={this.state.isVideoPlayed}
                style={{ width: DEVICE_WIDTH > 900 ? 500 : 320, height: DEVICE_WIDTH > 900 ? 300 : 150 }} />
            </View>

            <View style={{justifyContent:'center', alignItems:'center', marginTop: DEVICE_WIDTH > 900 ? 0 : 10}}>
              <Icon 
                name={this.state.isVideoPlayed ? "play" : "pause"} 
                size={21} 
                color="white" 
                onPress={() => { this.setState( {isVideoPlayed : !this.state.isVideoPlayed})}}
              />
            </View>
          </View>
          </View>
        </Modal>
      
      </ScrollView> 
      </View>
    );
  }
}
export default ProductDetailScreen;
