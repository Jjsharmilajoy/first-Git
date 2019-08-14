/**
 * The Product screen lists all the available vehicles of a particular
 * manufacturer the dealer comes under.
 */
import React, { Component } from 'react';
import {
  KeyboardAvoidingView, Text, TextInput, View, TouchableOpacity, Image, FlatList,
  Alert, Modal
} from 'react-native';
import Close from '../../assets/images/close.png';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import UserInput from '../../components/userInput/UserInput';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/FontAwesome';
import Dimensions from 'Dimensions';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { getVehicles, updatePreferedVehicles } from '../../redux/actions/GetVehicles/actionCreators';
import { clearLead, disableButton } from '../../redux/actions/Global/actionCreators';
import sampleBike from '../../assets/images/bike.png';
import { BookTestRideButton } from '../../components/button/Button';
import styles from './MyProductsStyles';
import Loader from '../../components/loader/Loader';
import AppHeader from '../../components/header/Header';
import { currencyFormatter, emailValidator } from '../../utils/validations';
import { showIndicator, hideIndicator } from '../../redux/actions/Loader/actionCreators';
import constants from '../../utils/constants';
import { sendEmail } from '../../redux/actions/ProductDetail/actionCreators.js';

const DEVICE_WIDTH = Dimensions.get('window').width;

@connect(state => ({
  vehicleList: state.getVehicles.vehicleData,
  loading: state.getVehicles.loadingGroup,
  isSideNavOpen: state.global.isSideNavOpen,
  currentUser: state.user.currentUser,
  buttonState: state.global.buttonState,
}), {
    sendEmail, getVehicles, clearLead, showIndicator, hideIndicator, disableButton, updatePreferedVehicles
  })
export default class MyProductsScreen extends Component {
  static propTypes = {
    getVehicles: PropTypes.func.isRequired,
    clearLead: PropTypes.func.isRequired,
    vehicleList: PropTypes.array,
    navigation: PropTypes.object.isRequired,
    loading: PropTypes.bool.isRequired,
    isSideNavOpen: PropTypes.bool.isRequired,
    currentUser: PropTypes.object.isRequired,
    showIndicator: PropTypes.func.isRequired,
    hideIndicator: PropTypes.func.isRequired,
    updatePreferedVehicles: PropTypes.func.isRequired,
    sendEmail: PropTypes.func.isRequired,
  }

  static defaultProps = {
    vehicleList: [],
  }

  constructor(props) {
    super(props);
    this.state = ({
      activeCheckboxButton: [],
      renderList: false,
      vehicleData: [],
      searchVal: '',
      copy_vehicleData: [],
      currentPopUpView: '',
      modalVisible: false,
      referenceNoText: '',
      emailIdToSend: '',
      userObject: {},
      priceBreakdownData: {},
      item: {},
      loader: false

    });
  }

  isCardClickable = true;

  componentDidMount() {
    this.onInitialLoad();
    this.willFocusSubscription = this.props.navigation.addListener(
      'willFocus',
      () => {
        this.onInitialLoad();
      }
    );
  }

  componentWillUnmount() {
    this.willFocusSubscription.remove();
  }

  onInitialLoad() {
    this.isCardClickable = true;
    const { currentUser } = this.props;
    const { searchVal } = this.state;
    this.props.clearLead();
    if (searchVal) {
      this.searchProduct('search', searchVal);
    } else if (currentUser && currentUser.dealerId && currentUser.dealerId.length > 0) {
      this.props.showIndicator();
      this.props.getVehicles(currentUser.dealerId).then(() => {
        Object.assign(this.state.copy_vehicleData, this.props.vehicleList);
        this.props.hideIndicator();
        this.setState({
          vehicleData: this.props.vehicleList
        });
      }).catch(() => { });
    }
  }

  getCheckboxButtonValue = value => {
    const position = this.state.activeCheckboxButton.map(e => e.id).indexOf(value.id);
    if (position === -1) {
      if (this.state.activeCheckboxButton.length > 2) {
        Alert.alert(
          'Info',
          'Choose only 3 vehicles',
          [
            { text: 'OK', onPress: () => console.log('OK Pressed') },
          ],
          { cancelable: false }
        );
      } else {
        this.state.activeCheckboxButton.push(value);
        this.setState({
          activeCheckboxButton: this.state.activeCheckboxButton,
          renderList: !this.state.renderList,
        });
      }
    } else {
      this.state.activeCheckboxButton.splice(position, 1);
      this.setState({
        activeCheckboxButton: this.state.activeCheckboxButton,
        renderList: !this.state.renderList,
      });
    }
  }

  getSelectedVehicles = () => {
    this.state.activeCheckboxButton.map(eachVehicle => (
      <View>
        <Text>{eachVehicle.name}</Text>
      </View>
    ));
  }

  getDimensions = (e, param) => {
    const { width } = e.nativeEvent.layout;
    switch (param) {
      case 'page':
        this.setState({
          // eslint-disable-next-line react/no-unused-state
          cardSize: width / 3.3
        });
        break;
      default:
        return 0;
    }
  }

  getValueOfPower = item => {
    const val = item.split('@');
    return val[0];
  }

  searchVehicle(value) {
    return new Promise((resolve, reject) => {
      const obj = this.state.copy_vehicleData.filter(o => o.name.toLowerCase().includes(value.toLowerCase()));
      if (obj) {
        resolve(obj);
      } else {
        reject(new Error('error'));
      }
    });
  }

  searchProduct = (param, value) => this.searchVehicle(value)
    .then(res => {
      this.setState({
        searchVal: value,
        vehicleData: res
      });
    }).catch(() => {
      this.setState({
        searchVal: value,
        vehicleData: null
      });
    });

  cancelVehicle = cancelledVehicle => {
    const position = this.state.activeCheckboxButton.map(e => e.id).indexOf(cancelledVehicle.id);
    this.state.activeCheckboxButton.splice(position, 1);
    this.setState({
      activeCheckboxButton: this.state.activeCheckboxButton,
      renderList: !this.state.renderList,
    });
  };

  // after selecting vehicle on click of book test ride
  bookTestRide = () => {
    console.log('Book test ride');
  }

  // After selecting on click of compare button
  compareVehicle = item => {
    if (this.isCardClickable) {
      const { navigation } = this.props;
      const vehicleId = item.id;
      const variantId = (item && item.prices && item.prices.length > 0
        && item.prices[0].variant_id) ? item.prices[0].variant_id : undefined;
      navigation.navigate('CompareVehiclesScreen', { vehicleId, variantId });
      this.isCardClickable = false;
    }
  }

  // Onclick of back image
  goBack = () => {
    console.log('Go to previous screen');
  }

  clearAll = () => {
    this.setState({
      activeCheckboxButton: [],
      renderList: !this.state.renderList
    });
  }

  // To be implemented
  saveLead = () => {
    console.log('Save Lead Clicked');
  }

  // To be implemented
  cardClicked = item => {
    // this.props.disableButton();
    if (this.isCardClickable) {
      const { navigate } = this.props.navigation;
      const variantId = ((item.prices.length > 0) && (item.prices[0].variant_id)) ? item.prices[0].variant_id : undefined;
      navigate('ProductDetailScreen', { vehicleId: item.id, variantId });
      this.isCardClickable = false;
    }
  }

  headerComponent = () => (
    <View style={styles.container}>
      {/* start of Section 1 Left pane */}
      <View style={styles.directionRow}>
        <View style={styles.sectionOneWrapper}>
          <Text style={styles.whiteColor}>
            Products
          </Text>
        </View>
        <View style={{ flexDirection: 'row' }}>
          <Text style={{
            alignContent: 'center',
            alignSelf: 'center',
            paddingHorizontal: 10
          }}>
            <Icon name="search" size={21} color="white" />
          </Text>
          <TextInput
            placeholder="Search for the product"
            style={styles.searchBoxStyle}
            underlineColorAndroid="transparent"
            value={this.state.searchVal}
            selectionColor="white"
            placeholderTextColor="white"
            onChangeText={searchVal => this.searchProduct('search', searchVal)}
          />
        </View>
      </View>
    </View>
  );
  onChangeText = (param, value) => {
    this.setState({ emailIdToSend: value });
  }

  sendEmailTapped = (item) => {
    this.setState({
      modalVisible: true,
      currentPopUpView: constants.EMAIL_POPUPVIEW,
      item: item
    });
  }

  continueBtntapped = (item) => {
    const vehicle_id = item.id;
    const dealer_id = item.prices[0].dealer_id;
    this.setState({
      loader: true
    });
    if (emailValidator(this.state.emailIdToSend)) {
      this.state.userObject.email = this.state.emailIdToSend;
      const data = {
        is_email: true,
        email: this.state.emailIdToSend,

      };
      this.props.sendEmail(
        dealer_id,
        vehicle_id, data
      )
        .then(() => {
          this.setState({ loader: false });
          Alert.alert(
            'Message',
            'Email sent successfully.',
            [
              {
                text: 'OK',
                onPress: () => {
                  this.setState({
                    emailIdToSend: '',
                    modalVisible: false,

                  });
                }
              },
            ],
            { cancelable: false }
          );
        }, error => {
          if (error && error.err && !error.err.message.includes('invalidaccesstoken')) {
            this.setState({ loader: false });
            Alert.alert(
              'Message',
              error && error.err ? error.err.message : '',
              [
                {
                  text: 'ok',
                  onPress: () => {
                  }
                },
              ],
              { cancelable: false }
            );
          }
        });
    } else {
      this.setState({ loader: false });
      Alert.alert(
        'Message',
        'Enter a valid email',
        [
          {
            text: 'OK',
            onPress: () => {
              this.setState({
                emailIdToSend: '',
              });
            }
          },
        ],
        { cancelable: false }
      );
    }
    // Alert.alert('emailIdToSend',this.state.emailIdToSend);
  }

  showCard = item => {
    const { isSideNavOpen } = this.props;
    const maxWidth = (DEVICE_WIDTH - (isSideNavOpen ? 160 : 80)) / 3;
    return (

      <TouchableOpacity
        onPress={() => this.cardClicked(item)}
        // disabled={this.props.buttonState}
        activeOpacity={0.9}
      >

        <View style={[styles.paddingTen]}>
          {/* start of card */}
          <View style={[styles.cardWrapper, {
            width: maxWidth
          }]}>

            <View style={[styles.cardName]}>
              <View style={[styles.paddingTopTen]}>
                <Text style={styles.vehicleName} numberOfLines={1}>
                  {(item.name === null || item.name === undefined) ? 'N/A' : item.name}
                </Text>
              </View>
              <View style={[styles.paddingTopTen, { marginRight: 20 }]}>
                <TouchableOpacity
                  onPress={() => {
                    this.compareVehicle(item);
                  }}
                >
                  <Text style={{ color: '#f36e35' }}>
                    Compare
                  </Text>
                </TouchableOpacity>

              </View>
            </View>
            {/* To make the vehicle as preferred option */}
            {((this.props.currentUser.role === constants.MANAGER) &&
              (item.prices.length > 0 && item.prices[0].is_prefered !== undefined)) ?
              <View style={styles.starContainer} >
                <View style={{ flexDirection: "row", justifyContent: 'space-between' }}>
                  <TouchableOpacity
                    onPress={() => {
                      this.checkboxAction(item);
                    }}>
                    {item.prices[0].is_prefered ?
                      (
                        <Icon
                          style={[{ margin: 5 }]}
                          name="star"
                          size={24}
                          color="#f05b3a" />
                      ) : <Icon
                        style={[{ margin: 5 }]}
                        name="star"
                        size={24}
                      />}
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => { this.sendEmailTapped(item); }}
                    // disabled={this.props.buttonState}
                    style={[styles.emailIconStyle]}
                    activeOpacity={0.5}
                  >
                    <Icon
                      name="paper-plane"
                      size={21}
                      color='#f36e35'
                      style={{ alignSelf: 'center', marginHorizontal: 2 }} />
                  </TouchableOpacity>
                </View>
              </View>
              : null}
            {/* To make the vehicle as preferred  */}
            <View style={styles.bikeCardImage}>
              {/* Bike card image */}
              <View style={[styles.cardImage]}>
                <Image
                  resizeMode="contain"
                  source={
                    (item.image_url === undefined || item.image_url === null)
                      ? sampleBike
                      : { uri: item.image_url }
                  }
                  style={styles.bikeImageResolution}
                />
              </View>
              {/* Right Side of card - image */}
              <View style={styles.cardRightWrapper}>
                {/* displacement start */}
                <View style={styles.displacementWrapper}>
                  <Text
                    style={styles.displacementStyles}
                  >
                    {
                      (item.displacement === null || item.displacement === undefined)
                        ? 'N/A'
                        : `${item.displacement} cc`
                    }
                  </Text>
                </View>
                {/* displacement end */}
                {/* bhp start */}
                <View style={styles.rightPaneWrapper}>
                  <Text style={styles.fuelEfficiencyText}>
                    {(item.bhp === undefined || item.bhp === null)
                      ? 'N/A'
                      : `${this.getValueOfPower(item.bhp)} BHP`}
                  </Text>
                </View>
                {/* bhp end */}
                {/* kmpl start */}
                {
                  (constants.vehicleToHideMileage !== (this.props.currentUser && this.props.currentUser.manufacturerSlug)) &&
                  // !constants.hideMileage &&
                  <View style={styles.rowMarginRight10}>
                    <Text style={styles.weightStyle}>
                      {(item.fuel_efficiency_overall === null || item.fuel_efficiency_overall === undefined)
                        ? 'N/A'
                        : `${item.fuel_efficiency_overall} kmpl`}
                    </Text>
                  </View>
                }
                {/* kmpl end */}
                {/* kg start */}
                <View style={styles.rowMarginRight10}>
                  <Text style={styles.weightStyle}>
                    {(item.overall_weight === null || item.overall_weight === undefined)
                      ? 'N/A'
                      : `${item.overall_weight} kg`}
                  </Text>
                </View>
                {/* kg end */}
              </View>
              {/* End of Right Side of card - image */}
              {/* End of bike card image */}
            </View>
            {/* start of card bottom view */}
            <View style={styles.cardBottomView}>
              {/* start of on road price */}
              <View>
                <Text style={styles.onRoadPrice}>On-road Price</Text>
                <Text style={styles.priceValue}>
                  {(item.prices.length > 0 && item.prices[0].onroad_price !== undefined)
                    ? currencyFormatter(item.prices[0].onroad_price)
                    : 'N/A'
                  }
                </Text>
              </View>
              {/* end of on road price */}
              {/* start of button */}
              {/*               <BookTestRideButton
                style={styles.testRideButtonColor}
                handleSubmit={this.bookTestRide}
                title="Book Test Ride"
                imageStyle={styles.buttonLeftImage}
                textStyle={styles.testRideButtonTextStyle}
              /> */}
              {/* end of button */}
            </View>
            {/* end of card bottom view */}
          </View>
          {/* end of card */}
        </View>
      </TouchableOpacity >
    );
  };

  checkboxAction = item => {
    this.props.updatePreferedVehicles(item.id, item.prices[0].dealer_id).then(() => {
      this.onInitialLoad();
    }).catch();
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        <AppHeader navigation={this.props.navigation}>
          {this.headerComponent()}
        </AppHeader>
        <KeyboardAvoidingView style={styles.flexOne} onLayout={e => this.getDimensions(e, 'page')}>
          {/* Section 1 */}
          <Loader loading={this.props.loading} />
          {/* Section 2 */}
          {(this.state.currentPopUpView === constants.EMAIL_POPUPVIEW)
            && (
              <Modal
                animationType="fade"
                transparent
                visible={this.state.modalVisible}
                onRequestClose={() => this.setState({
                  modalVisible: false,
                  referenceNoText: ''
                })}>
                <View style={styles.modalContentWrapper} />
                <KeyboardAwareScrollView
                  style={{ backgroundColor: 'gray', opacity: 0.9 }}
                  contentContainerStyle={styles.emialModalContent}
                  keyboardShouldPersistTaps="always">
                  <View style={styles.offerTitleModalContent}>
                    <Text style={styles.offerTitleText}>Email:</Text>
                    <View style={styles.modalCloseView}>
                      <TouchableOpacity
                        disabled={this.props.buttonState}
                        onPress={() => {
                          // this.props.disableButton();
                          this.setState({
                            modalVisible: false,
                          });
                        }
                        }>
                        <Image
                          source={Close}
                          style={styles.closeIconDimensions}
                          resizeMode="contain"
                        />
                      </TouchableOpacity>
                    </View>
                    <View style={[styles.line]} />
                  </View>
                  <View style={styles.offerModelContentView}>
                    <Text style={[styles.commentTextStyle, { marginBottom: 10, marginLeft: 0, alignSelf: 'flex-start' }]}>
                      Enter the mail-id
                  </Text>
                    <UserInput
                      numberOfLines={1}
                      placeholder="Email"
                      param="Email"
                      onChange={this.onChangeText}
                      value={this.state.emailIdToSend}
                      containerStyle={styles.otherChargesReasonInputStyle} />
                    <LinearGradient
                      colors={['#f79426', '#f16537']}
                      start={{ x: 0.0, y: 0.0 }}
                      end={{ x: 1.0, y: 1.0 }}>
                      <TouchableOpacity
                        // disabled={this.props.buttonState}
                        onPress={() => { this.continueBtntapped(this.state.item) }}
                      >
                        <Text style={{
                          paddingHorizontal: 15,
                          paddingVertical: 5,
                          color: 'white',
                          fontFamily: 'SourceSansPro-Bold',
                          fontSize: 14
                        }}>
                          Continue
                      </Text>
                        <Loader loading={this.state.loader} />
                      </TouchableOpacity>
                    </LinearGradient>
                  </View> 
                </KeyboardAwareScrollView>
              </Modal>
            )
          }
          {
            (this.state.activeCheckboxButton.length > 0)
              ? (
                <View style={styles.sectionTwoWrapper}>
                  {/* start of Section 2 Left pane */}
                  <View style={styles.directionRow}>
                    {this.state.activeCheckboxButton.map(eachVehicle => (
                      <View
                        key={eachVehicle.item.id}
                        style={styles.vehicleCheckbox}
                        activeOpacity={0.5}
                      >
                        <View style={styles.vehicleNameView}>
                          <Text style={styles.vehicleTextColor}>{eachVehicle.item.name}</Text>
                        </View>
                        <TouchableOpacity
                          onPress={() => this.cancelVehicle(eachVehicle)}
                        >
                          <Icon name="times-circle" size={18} color="#F6673D" />
                        </TouchableOpacity>
                      </View>
                    ))}
                    <View style={styles.compareButtonWrapperCenter}>
                      <TouchableOpacity
                        onPress={this.clearAll}
                        style={styles.clearAllButton}
                      >
                        <Text style={styles.clearAllText}> Clear All </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  {/* end of Section 2 Left pane */}
                  {/* start of Section 2 Right pane */}
                  <View style={styles.directionRow}>
                    <BookTestRideButton
                      // handleSubmit={() => this.compareVehicle()}
                      style={styles.SectionTworightPaneWrapper}
                      activeOpacity={0.5}
                      title="Compare"
                    >
                      <View style={styles.compareButtonWrapper}>
                        <Text style={styles.compareButtonColor}>Compare</Text>
                      </View>
                      <View style={styles.activeVehicleCheckbox}>
                        <Text style={styles.activeCheckBox}>{this.state.activeCheckboxButton.length}</Text>
                      </View>
                    </BookTestRideButton>
                  </View>
                  {/* end of Section 2 Right pane */}
                </View>
              )
              : null
          }
          {/* Section 3 */}
          <View style={[styles.cardListWrapper]}>
            <FlatList
              data={this.state.vehicleData}
              renderItem={({ item }) => this.showCard(item)}
              keyExtractor={item => item.id}
              horizontal={false}
              numColumns={3}
              extraData={this.state || this.props.isSideNavOpen}
            />
          </View>
        </KeyboardAvoidingView>
      </View>
    );
  }
}
