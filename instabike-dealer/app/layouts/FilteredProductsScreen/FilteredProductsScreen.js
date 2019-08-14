/**
 * The Filter Products Screen class renders the filter slider available in the
 * lead search.
 */
import React, { Component } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  Image,
  FlatList,
  Animated,
  Picker,
  Dimensions,
  Alert,
  ScrollView,
  Modal
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import UserInput from '../../components/userInput/UserInput';
import LinearGradient from 'react-native-linear-gradient';
import { NavigationActions } from 'react-navigation';
import Close from '../../assets/images/close.png';
import Icon from 'react-native-vector-icons/FontAwesome';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import cancel from '../../assets/images/cancel.png';
import filter from '../../assets/images/filter.png';
import fonts from '../../theme/fonts';
import { getManufacturerId, getVehicles,sendEmail } from '../../redux/actions/filteredVehicles/actionCreators';
import loadDealership from '../../redux/actions/DealershipDetails/actionCreators';
import { getLead, clearLead } from '../../redux/actions/Global/actionCreators';
import { BookTestRideButton } from '../../components/button/Button';
import Loader from '../../components/loader/Loader';
import styles from './FilteredProductsScreenStyles';
import constants from '../../utils/constants';
import { currencyFormatter, emailValidator } from '../../utils/validations';

const DEVICE_WIDTH = Dimensions.get('screen').width;
const DEVICE_HEIGHT = Dimensions.get('screen').height;

@connect(
  state => ({
    manufacturer_id: state.filteredVehicles.manufacturer_id,
    vehicleList: state.filteredVehicles.vehicleList,
    loading: state.filteredVehicles.loadingGroup,
    lead: state.global.lead,
    dealerDetail: state.dealerInfo.detail,
    currentUser: state.user.currentUser
  }),
  {
    getManufacturerId,
    getVehicles,
    getLead,
    loadDealership,
    clearLead,
    sendEmail
  }
)

export default class FilteredProductsScreen extends Component {
  static propTypes = {
    getManufacturerId: PropTypes.func.isRequired,
    getLead: PropTypes.func.isRequired,
    clearLead: PropTypes.func.isRequired,
    manufacturer_id: PropTypes.string,
    getVehicles: PropTypes.func.isRequired,
    vehicleList: PropTypes.array,
    navigation: PropTypes.object.isRequired,
    loading: PropTypes.bool,
    dealerDetail: PropTypes.object,
    loadDealership: PropTypes.func.isRequired,
    currentUser: PropTypes.object.isRequired,
  }

  static defaultProps = {
    manufacturer_id: null,
    dealerDetail: {},
    vehicleList: [],
    loading: false
  }

  constructor(props) {
    super(props);
    this.state = {
      currentIndex: null,
      name: '',
      mobile: '',
      searchVal: '',
      sliderVal: -375,
      toVal: 0,
      bikeSelected: true,
      defaultVal: new Animated.Value(-375),
      currentDealer: null,
      filterBudget: [
        {
          id: 1,
          name: 'all',
          active: false
        },
        {
          id: 2,
          name: '< Rs 70,000',
          active: false
        },
        {
          id: 3,
          name: 'Rs 70,000 - Rs 1,00,000',
          active: false
        },
        {
          id: 4,
          name: '> Rs 1 lakh',
          active: false
        }
      ],
      filterCapacity: [
        {
          id: 1,
          name: '< 150 cc',
          active: false
        },
        {
          id: 2,
          name: '150cc - 250cc',
          active: false
        },
        {
          id: 3,
          name: '> 250 cc',
          active: false
        }
      ],
      sortData: [{
        id: 1,
        name: 'None',
        value: ''
      },
      {
        id: 2,
        name: 'Mileage',
        value: 'fuel_efficiency_overall'
      },
      {
        id: 3,
        name: 'Power',
        value: 'bhp'
      },
      {
        id: 4,
        name: 'Price',
        value: 'price'
      }
      ],
      filterData: {},
      currentSortName: 'None',
      variantSelected: null,
      vehicleList: null,
      initialLoad: true,
      availableColors: [],
      manufacturerDisplayName: '',
      currentPopUpView: '',
      modalVisible: false,
      emailIdToSend: '',
      userObject: {},
      item: {},
      loader: false
    };
  }

  static getDerivedStateFromProps(nextProps) {
    const { navigation, lead } = nextProps;
    if (navigation && navigation.state && navigation.state.params && nextProps.lead
      && navigation.state.params.filterData) {
      const { filterData } = nextProps.navigation.state.params;
      return {
        filterData,
        lead,
        name: lead.name,
        mobile: lead.mobile_number
      };
    }
    return null;
  }

  componentDidMount() {
    // let dealerId;
    const { navigation } = this.props;
    if (constants.vehicleToHideMileage === (this.props.currentUser && this.props.currentUser.manufacturerSlug)) {
      // Removing the mileage from the array
      this.state.sortData.splice(1, 1);
    }
    this.props.getLead(navigation.state.params.lead.id);
    if (this.props.currentUser && this.props.currentUser.dealerId) {
      this.state.currentDealer = this.props.currentUser.dealerId;
      return this.props.getManufacturerId(this.props.currentUser.dealerId)
        .then(() => {
          if (this.state.filterData) {
            const budgetRanges = this.state.filterData.budget.split('-');
            budgetRanges.forEach((range, index) => {
              budgetRanges[index] = parseInt(range, 10);
            });
            if (budgetRanges[0] >= 0 && budgetRanges[1] <= 70000 && !(budgetRanges[0] > 70000) && !(budgetRanges[1] > 70000)) {
              this.state.filterData.budget = '0-70000';
              this.state.filterData.showBudget = '< Rs 70,000';
              this.state.filterBudget[1].active = true;
            } else if (budgetRanges[0] >= 70000 && budgetRanges[1] <= 100000 && !(budgetRanges[0] < 70000) && !(budgetRanges[1] > 100000)) {
              this.state.filterData.budget = '70000-100000';
              this.state.filterData.showBudget = 'Rs 70,000 - Rs 1,00,000';
              this.state.filterBudget[2].active = true;
            } else if (budgetRanges[0] >= 100000 && budgetRanges[1] >= 100000 && !(budgetRanges[0] < 100000) && !(budgetRanges[1] < 100000)) {
              this.state.filterData.budget = '100000-100000000';
              this.state.filterData.showBudget = '> Rs 1 lakh';
              this.state.filterBudget[3].active = true;
            } else {
              // (budgetRanges[0] >= 0 && budgetRanges[0] < 100000 && budgetRanges[1] > 100000)
              this.state.filterData.budget = '';
              this.state.filterData.showBudget = 'all';
              this.state.filterBudget[0].active = true;
            }
          }
          return this.props.getVehicles(this.props.currentUser.dealerId, this.props.manufacturer_id, this.state.filterData);
        }).then(() => {
          this.props.vehicleList.map(eachVehicle => {
            const variants = this.getVariantsInFilterRange(eachVehicle.variants);
            variants.map((eachVariant, index) => {
              if (index === 0) {
                eachVariant.activeVariant = true;
                if (eachVariant.prices !== undefined) {
                  eachVehicle.priceToShow = eachVariant.prices.onroad_price;
                }
              } else {
                eachVariant.activeVariant = false;
              }
              eachVariant.colors.map((eachColor, ind) => {
                if (index === 0 && ind === 0) {
                  eachVehicle.imageToShow = eachColor.image_url;
                  eachColor.activeColor = true;
                } else if (ind === 0) {
                  eachColor.activeColor = true;
                } else {
                  eachColor.activeColor = false;
                }
                return eachColor;
              });
              return eachVariant;
            });
            return eachVehicle;
          });
          this.setState({
            sortData: this.state.sortData,
            filterBudget: this.state.filterBudget,
            filterData: this.state.filterData,
            vehicleList: this.props.vehicleList,
            renderList: !this.state.renderList,
          });
        }).then(() => {
          this.props.loadDealership(this.props.currentUser.dealerId)
            .then(() => {
              this.setState({
                manufacturerDisplayName: this.props.dealerDetail && this.props.dealerDetail.manufacturer
                  && this.props.dealerDetail.manufacturer.display_name
                  ? this.props.dealerDetail.manufacturer.display_name : '',
                renderList: !this.state.renderList,
              });
            })
            .catch(err => {
              console.log('err', err);
            });
        })
        .catch(error => {
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
    }
  }

  getActiveFilter = (data, selectedData, toUpdate) => {
    data.map(eachData => {
      if (eachData.id === selectedData.id) {
        eachData.active = true;
      } else {
        eachData.active = false;
      }
      return data;
    });
    this.state[toUpdate] = data;
    this.setState({
      filterBudget: this.state.filterBudget,
      filterCapacity: this.state.filterCapacity
    });
  }

  getVariantsInFilterRange = variants => {
    const { filterData } = this.state;
    let startingPrice = 0;
    let endingPrice = 0;
    switch (filterData.budget) {
      case '0-70000':
        startingPrice = 0;
        endingPrice = 70000;
        break;
      case '70000-100000':
        startingPrice = 70000;
        endingPrice = 100000;
        break;
      case '100000-100000000':
        startingPrice = 100000;
        endingPrice = 100000000;
        break;
      default:
        startingPrice = 0;
        endingPrice = 100000000;
        break;
    }
    return variants.filter(variant => variant.prices
      && variant.prices.onroad_price > startingPrice && variant.prices.onroad_price < endingPrice);
  }

  getSelectedVariant = (itemValue, item, variantIndex, vehicleIndex) => {
    const vehicleData = this.state.vehicleList;
    vehicleData[vehicleIndex].selectedVariant = itemValue;
    item.variants.map(eachVariant => {
      if (eachVariant.name === itemValue) {
        eachVariant.activeVariant = true;
        item.imageToShow = eachVariant.colors[0].image_url;
        item.priceToShow = eachVariant.prices.onroad_price;
      } else {
        eachVariant.activeVariant = false;
      }
      return eachVariant;
    });
    this.setState({
      renderList: !this.state.renderList,
      vehicleList: vehicleData
    });
  }

  getVehiclesBasedOnSort = (itemValue, itemIndex) => {
    if (this.state.currentSortName !== itemValue) {
      if (itemValue === 'Price') {
        this.state.filterData.orderBy = 'asc';
      } else {
        this.state.filterData.orderBy = 'desc';
      }
      this.state.currentSortName = this.state.sortData[itemIndex].name;
      if (this.state.sortData[itemIndex].value) {
        this.state.filterData.orderField = this.state.sortData[itemIndex].value;
      } else {
        delete this.state.filterData.orderField;
        delete this.state.filterData.orderBy;
      }
      this.getFilteredListData(this.state.filterData);
    }
  }

  getFilteredData = () => {
    if (this.state.filterData.type === '0') {
      this.state.filterData.type = '0';
      this.state.filterData.typeName = 'bike';
    } else if (this.state.filterData.type === '1') {
      this.state.filterData.type = '1';
      this.state.filterData.typeName = 'scooter';
    }
    this.state.filterBudget.map(eachFilterBudget => {
      if (eachFilterBudget.active === true) {
        switch (eachFilterBudget.name) {
          case 'all':
            this.state.filterData.budget = '';
            this.state.filterData.showBudget = 'all';
            break;
          case '< Rs 70,000':
            this.state.filterData.budget = '0-70000';
            this.state.filterData.showBudget = '< Rs 70,000';
            break;
          case 'Rs 70,000 - Rs 1,00,000':
            this.state.filterData.budget = '70000-100000';
            this.state.filterData.showBudget = 'Rs 70,000 - Rs 1,00,000';
            break;
          case '> Rs 1 lakh':
            this.state.filterData.budget = '100000-100000000';
            this.state.filterData.showBudget = '> Rs 1 lakh';
            break;
          default:
            this.state.filterData.budget = '';
            this.state.filterData.showBudget = 'all';
            break;
        }
      }
      return this.state.filterData;
    });
    this.state.filterCapacity.map(eachCapacity => {
      if (eachCapacity.active === true) {
        switch (eachCapacity.name) {
          case '< 150 cc':
            this.state.filterData.engine = '0-150';
            this.state.filterData.showCapacity = '< 150 cc';
            break;
          case '150cc - 250cc':
            this.state.filterData.engine = '150-250';
            this.state.filterData.showCapacity = '150cc - 250cc';
            break;
          case '> 250 cc':
            this.state.filterData.engine = '250-100000';
            this.state.filterData.showCapacity = '> 250 cc';
            break;
          default:
            this.state.filterData.engine = '0-150';
            this.state.filterData.showCapacity = '< 150 cc';
            break;
        }
      }
      return this.state.filterData;
    });
    this.props.getVehicles(this.state.currentDealer, this.props.manufacturer_id, this.state.filterData).then(() => {
      this.props.vehicleList.map(eachVehicle => {
        const variants = this.getVariantsInFilterRange(eachVehicle.variants);
        variants.map((eachVariant, index) => {
          if (index === 0) {
            eachVariant.activeVariant = true;
            if (eachVariant.prices !== undefined) {
              eachVehicle.priceToShow = eachVariant.prices.onroad_price;
            }
          } else {
            eachVariant.activeVariant = false;
          }
          eachVariant.colors.map((eachColor, ind) => {
            if (index === 0 && ind === 0) {
              eachVehicle.imageToShow = eachColor.image_url;
              eachColor.activeColor = true;
            } else if (ind === 0) {
              eachColor.activeColor = true;
            } else {
              eachColor.activeColor = false;
            }
            return eachColor;
          });
          return eachVariant;
        });
        return eachVehicle;
      });
      this.setState({
        vehicleList: this.props.vehicleList,
        renderList: !this.state.renderList
      }, () => {
        this.slide();
        if (this.props.vehicleList.length > 0) {
          this.flatListRef.scrollToIndex({ animated: true, index: 0 });
        }
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
  }

  getFilteredListData = filterData => {
    this.props.getVehicles(this.state.currentDealer, this.props.manufacturer_id, filterData).then(() => {
      this.props.vehicleList.map(eachVehicle => {
        const variants = this.getVariantsInFilterRange(eachVehicle.variants);
        variants.map((eachVariant, index) => {
          if (index === 0) {
            eachVariant.activeVariant = true;
            if (eachVariant.prices !== undefined) {
              eachVehicle.priceToShow = eachVariant.prices.onroad_price;
            }
          } else {
            eachVariant.activeVariant = false;
          }
          eachVariant.colors.map((eachColor, ind) => {
            if (index === 0 && ind === 0) {
              eachVehicle.imageToShow = eachColor.image_url;
              eachColor.activeColor = true;
            } else if (ind === 0) {
              eachColor.activeColor = true;
            } else {
              eachColor.activeColor = false;
            }
            return eachColor;
          });
          return eachVariant;
        });
        return eachVehicle;
      });
      this.setState({
        vehicleList: this.props.vehicleList,
        renderList: !this.state.renderList
      }, () => {
        if (this.props.vehicleList.length > 0) {
          this.flatListRef.scrollToIndex({ animated: true, index: 0 });
        }
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
  }

  slide = () => {
    if (this.state.toVal === -375) {
      this.state.toVal = 0;
      this.state.defaultVal = new Animated.Value(-375);
    } else if (this.state.initialLoad) {
      this.state.toVal = 0;
      this.state.defaultVal = new Animated.Value(-375);
      this.state.initialLoad = false;
    } else {
      this.state.toVal = -375;
      this.state.defaultVal = new Animated.Value(0);
    }
    this.setState({
      defaultVal: this.state.defaultVal,
      toVal: this.state.toVal
    }, () => {
      Animated.timing(this.state.defaultVal, {
        toValue: this.state.toVal,
      }).start();
    });
  };

  openFilter = () => {
    this.slide();
  }

  cancelType = type => {
    switch (type) {
      case 'Type':
        this.state.filterData.type = '';
        this.state.filterData.typeName = null;
        this.getFilteredListData(this.state.filterData);
        break;
      case 'Budget':
        this.state.filterData.budget = '';
        this.state.filterData.showBudget = null;
        this.state.filterBudget.map(eachBudget => {
          eachBudget.active = false;
          return eachBudget;
        });
        this.getFilteredListData(this.state.filterData);
        break;
      case 'Capacity':
        this.state.filterData.engine = '';
        this.state.filterData.showCapacity = null;
        this.state.filterCapacity.map(eachBudget => {
          eachBudget.active = false;
          return eachBudget;
        });
        this.getFilteredListData(this.state.filterData);
        break;
      case 'all':
        this.state.filterData.type = '';
        this.state.filterData.engine = '';
        this.state.filterData.budget = '';
        this.state.filterData.showBudget = null;
        this.state.filterData.showCapacity = null;
        this.state.filterData.typeName = null;
        this.state.filterCapacity.map(eachCapacity => {
          eachCapacity.active = false;
          return eachCapacity;
        });
        this.state.filterBudget.map(eachBudget => {
          eachBudget.active = false;
          return eachBudget;
        });
        this.getFilteredListData(this.state.filterData);
        break;
      default:
        this.getFilteredListData(this.state.filterData);
        break;
    }
  }

  resetFilter = () => {
    this.state.filterData.type = '';
    this.state.filterData.engine = '';
    this.state.filterData.budget = '';
    this.state.filterData.showBudget = null;
    this.state.filterData.showCapacity = null;
    this.state.filterData.typeName = null;
    this.state.filterCapacity.map(eachCapacity => {
      eachCapacity.active = false;
      return eachCapacity;
    });
    this.state.filterBudget.map(eachBudget => {
      eachBudget.active = false;
      return eachBudget;
    });
    this.setState({
      vehicleList: this.props.vehicleList
    });
  }

  showColors = item => (
    <TouchableOpacity
      style={{
        height: 30,
        width: 30,
        marginRight: 10
      }}
      onPress={() => this.selectedColor(item.id, item)}
    >
      {
        item.color_codes.map(eachColorCode => !item.activeColor
          ? (
            <View
              key={eachColorCode}
              style={[styles.activeColorStyle, { backgroundColor: eachColorCode }]}
            />
          )
          : (
            <View
              key={eachColorCode}
              style={[styles.colorStyle, { backgroundColor: eachColorCode }]}
            />
          ))
      }
    </TouchableOpacity>
  )

  showVariants = variantItem => {
    let colorsToSend;
    if (variantItem.activeVariant === true) {
      colorsToSend = variantItem.colors;
      return (
        <FlatList
          data={colorsToSend}
          renderItem={({ item, index }) => this.showColors(item, index)}
          keyExtractor={() => variantItem.id}
          extraData={this.state.renderList}
          horizontal
        />
      );
    }
  }

  searchProduct = (param, value) => this.searchVehicle(value)
    .then(() => {
      this.setState({
        searchVal: value
      });
    }).catch(() => {
      this.setState({
        searchVal: value,
      });
    });

  selectedColor = id => {
    const vehicleData = this.state.vehicleList;
    vehicleData.map(eachVehicle => {
      eachVehicle.variants.map(eachVariant => {
        eachVariant.colors.map(eachColor => {
          if (eachColor.id === id) {
            eachVehicle.imageToShow = eachColor.image_url;
            eachColor.activeColor = true;
          } else {
            eachColor.activeColor = false;
          }
          return eachColor;
        });
        return eachVariant;
      });
      return eachVehicle;
    });
    this.setState({
      renderList: !this.state.renderList,
      vehicleList: vehicleData
    });
  }

  goToProductDetail = item => {
    const { navigate } = this.props.navigation;
    const { id } = this.state.lead;
    const vehicleId = item.id;
    //      const variantId = (item.variants.length > 0 && item.variants[0].id) ? item.variants[0].id : undefined;
    const variants = this.getVariantsInFilterRange(item.variants);
    const variantId = (variants && variants.length > 0 && variants[0].id) ? variants[0].id : undefined;
    navigate('ProductDetailScreen', {
      id, vehicleId, variantId, fromScreen: 'FromFilterProducts'
    });
  }

  gotoCompareVehicle = item => {
    const { navigation } = this.props;
    const vehicleId = item.id;
    const variantId = (item && item.variants && item.variants.length > 0
      && item.variants[0].id) ? item.variants[0].id : undefined;
    navigation.navigate('CompareVehiclesScreen', { vehicleId, variantId });
  }

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
    const dealer_id = this.props.currentUser.dealerId;
    this.setState({
      loader: true
    });
    if (emailValidator(this.state.emailIdToSend)) {
      this.state.userObject.email = this.state.emailIdToSend;
      const data = {
        is_email: true,
        email: this.state.emailIdToSend
      };
      this.props.sendEmail(
       dealer_id,vehicle_id, data
      ).then(() => {
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





  showCard = item => (
    <ScrollView vertical>
      <TouchableOpacity
        activeOpacity={0.5}
        onPress={() => { this.goToProductDetail(item); }}
        style={{
          width: DEVICE_WIDTH * 0.859,
          alignSelf: 'center',
          backgroundColor: 'white',
          marginHorizontal: DEVICE_WIDTH > 850 ? DEVICE_WIDTH * 0.0705 : DEVICE_WIDTH * 0.0405
        }}
      >
        {/* start of the top view bike and text */}
        <View style={{ flexDirection: 'row' }}>
          {/* start of bike image */}
          <View style={{ flex: 1, backgroundColor: 'white', padding: 5 }}>
            {!item.imageToShow
              ? (
                <View>
                  <Text>N/A</Text>
                </View>
              )
              : (
                <Image
                  source={{
                    uri: item.imageToShow
                  }}
                  resizeMode="contain"
                  style={{ height: 250, width: '100%' }}
                />
              )
            }
             
          </View>
          {/* end of bike image */}
          {/* start of text */}
          <View style={{
            flex: 1,
            paddingTop: 20,
            padding: 20,
            backgroundColor: 'white'
          }}
          >
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'flex-end'
            }}
            >
              <View>
                <Text style={{
                  fontFamily: 'SourceSansPro-SemiBold',
                  fontSize: 14
                }}
                >
                  {this.state.manufacturerDisplayName.toUpperCase()}
                </Text>
                <Text style={{
                  fontFamily: 'SourceSansPro-Bold',
                  fontSize: 22
                }}
                >
                  {item.name}
                </Text>
              </View>
              

              {/* dropdown here */}
              <View style={{
                marginRight: 5,
                justifyContent: 'center'
              }}
              >
                {/* May be useful in future */}
                {/* <Picker
                        selectedValue={item.selectedVariant ? item.selectedVariant : item.variants[0]}
                        mode="dropdown"
                        enabled={item.variants.length > 0}
                        style={{
                          height: 35,
                          width: 120
                        }}
                        onValueChange={(itemValue, index) => this.getSelectedVariant(itemValue, item, index, cardIndex)}
                      >
                        {
                        item.variants.length > 0 && item.variants.map(eachVariant => (
                          <Picker.Item key={eachVariant.id} label={eachVariant.name} value={eachVariant.name} />
                        ))
                      }
                      </Picker> */}
                      <TouchableOpacity
                    onPress={() => { this.sendEmailTapped(item); }}
                    // disabled={this.props.buttonState}
                    style={[styles.emailIconStyle]}
                    activeOpacity={0.5}
                  >
                    <Icon
                      name="paper-plane"
                      size={30}
                      color='#f36e35'
                      style={{ alignSelf: 'center', marginHorizontal: 2 }} />
                  </TouchableOpacity>
              </View>
              {/* end of dropdown here */}
            </View>
            <View style={{
              flexDirection: 'row',
              justifyContent: 'flex-start',
              marginTop: 20
            }}
            >
              <View style={{ paddingRight: 10 }}>
                <View style={{ flexDirection: 'row' }}>
                  <Text style={{
                    fontFamily: 'PTSans-Bold',
                    fontSize: 16,
                    color: '#373636'
                  }}>
                    {item.displacement ? item.displacement : 'N/A'}
                  </Text>
                  <Text style={{
                    color: '#867d7d',
                    fontFamily: 'LucidaGrande',
                    fontSize: 12,
                    marginTop: 4
                  }}
                  >
                    {' '}
                    cc
                    </Text>
                </View>
                <Text style={{
                  fontFamily: 'SourceSansPro-Regular',
                  fontSize: 13,
                  color: '#302e2e'
                }}>
                  Engine
                  </Text>
              </View>
              {
                constants.vehicleToHideMileage !== (this.props.currentUser && this.props.currentUser.manufacturerSlug) &&
                // !constants.hideMileage &&
                <View style={{ paddingHorizontal: 10 }}>
                  <View style={{ flexDirection: 'row' }}>
                 
                    <Text style={{
                      fontFamily: 'PTSans-Bold',
                      fontSize: 16,
                      color: '#373636'
                    }}>
                      {item.fuel_efficiency_overall ? item.fuel_efficiency_overall : 'N/A'}
                    </Text>
                    {/*                     <Text style={{
                            color: '#867d7d',
                            fontFamily: 'LucidaGrande',
                            fontSize: 12,
                            marginTop: 4
                          }}
                          >
                            {' '}
                            kmpl
                          </Text> */}
                  </View>
                  <Text style={{
                    fontFamily: 'SourceSansPro-Regular',
                    fontSize: 13,
                    color: '#302e2e'
                  }}>
                    Mileage
                        </Text>
                </View>
              }
              <View style={{ paddingHorizontal: 10 }}>
                <View style={{ flexDirection: 'row' }}>
                  <Text style={{
                    fontFamily: 'PTSans-Bold',
                    fontSize: 16,
                    color: '#373636'
                  }}>
                    {item.overall_weight ? item.overall_weight : 'N/A'}
                  </Text>
                  <Text style={{
                    color: '#867d7d',
                    fontFamily: 'LucidaGrande',
                    fontSize: 12,
                    marginTop: 4
                  }}
                  >
                    {' '}
                    kg
                    </Text>
                </View>
                <Text style={{
                  fontFamily: 'SourceSansPro-Regular',
                  fontSize: 13,
                  color: '#302e2e'
                }}>
                  weight
                  </Text>
              </View>
            </View>
            <View style={{ flexDirection: 'column' }}>
              <Text
                numberOfLines={5}
                style={{
                  paddingVertical: 10,
                  fontSize: 12,
                  color: '#8b8b8b',
                  fontFamily: 'SourceSansPro-Regular'
                }}
              >
                {item.description}
              </Text>
              {/* It might be asked in future */}
              <View style={{ marginVertical: 10 }} />
            </View>
          </View>
          {/* end of text */}
        </View>
        {/* end of the top view bike and text */}
        {/* start of the bottom view price and button */}
        <View style={{
          flexDirection: 'row',
          backgroundColor: 'white',
          paddingBottom: 10
        }}
        >
          <View style={{
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'center',
            paddingBottom: 10
          }}
          >
            <View style={{
              marginRight: 20
            }}
            >
              <Text style={{
                color: '#a4a4a4',
                fontFamily: 'SourceSansPro-Regular',
                fontSize: 11
              }}
              >
                On-Road Price
                </Text>
              <Text style={{
                color: '#34323b',
                fontFamily: 'SourceSansPro-Bold',
                fontSize: 21
              }}
              >
                {
                  !item.priceToShow
                    ? 'N/A'
                    : currencyFormatter(item.priceToShow)
                }
              </Text>
            </View>
          </View>
          <View style={{ flex: 1, alignItems: 'center', flexDirection: 'row' }}>
            <TouchableOpacity
              style={{
                backgroundColor: 'white',
                borderColor: '#f79426',
                borderWidth: 1,
                height: 35,
                width: 120,
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: 15,
                borderRadius: 5
              }}
              onPress={() => this.gotoCompareVehicle(item)}
            >
              <Text style={{
                fontSize: 12,
                fontFamily: 'SourceSansPro-SemiBold',
                color: '#f79426'
              }}
              >
                ADD TO COMPARE
                </Text>
            </TouchableOpacity>
          </View>
        </View>
        {/* end of the bottom view price and button */}
      </TouchableOpacity>
    </ScrollView>
  )

  render() {
    const DEVICE_SIZE = DEVICE_WIDTH > 900;
    return (
      <View>
        <Loader showIndicator={this.props.loading} />
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
        <View style={{
          flexDirection: 'row',
          backgroundColor: '#2B2928',
          zIndex: 2,
          elevation: 2
        }}
        >
          <View>
            <TouchableOpacity onPress={() => {
              this.props.clearLead();
              this.props.navigation.dispatch(NavigationActions.back());
            }}>
              <Image
                source={require('../../assets/images/close_black.png')}
              />
            </TouchableOpacity>
          </View>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            flex: 1
          }}
          >
            {/* Start of left side of the header */}
            <View style={{
              flexDirection: 'row',
              alignItems: 'center'
            }}
            >
              <Text style={{
                color: 'white',
                paddingHorizontal: 10,
                fontSize: 14,
                fontFamily: fonts.sourceSansProRegular
              }}
              >
                {this.state.name}
              </Text>
              <Text style={
                {
                  color: '#ffffff',
                  fontSize: 14,
                  paddingHorizontal: 10,
                  fontFamily: fonts.sourceSansProRegular
                }
              }
              >
                {this.state.mobile}
              </Text>
            </View>
            {/* End of left side of the header */}
            {/* Start of right side of the header */}
            <View style={{
              flex: 1,
              flexDirection: 'row',
              justifyContent: 'flex-end'
            }}
            >
              <TouchableOpacity
                onPress={this.openFilter}
              >
                <Image
                  source={filter}
                  style={{ height: 47 }}
                />
              </TouchableOpacity>
            </View>
            {/* End of right side of the header */}
          </View>
        </View>
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
            width: DEVICE_WIDTH * 0.859,
            height: DEVICE_WIDTH > 900 ? 375 : 300,
            elevation: 2,
            position: 'absolute',
            top: 49,
          }]}
        >
          <ScrollView>
            <View style={{
              flex: 1,
            }}
            >
              <View style={{
                paddingLeft: 40,
                paddingTop: 20,
              }}
              >
                <Text style={{
                  fontFamily: 'SourceSansPro-Bold',
                  fontSize: 15,
                  color: '#4a4a4a'
                }}
                >
                  Filters
                </Text>
              </View>
              <View style={{
                paddingTop: 10,
                justifyContent: 'space-around',
                flexDirection: 'row'
              }}
              >
                <View>
                  <Text style={{
                    fontFamily: 'SourceSansPro-Bold',
                    fontSize: 15,
                    color: '#4a4a4a',
                    paddingBottom: 20
                  }}
                  >
                    Type
                  </Text>
                  <View style={{ flexDirection: DEVICE_WIDTH > 900 ? 'row' : 'column' }}>
                    <TouchableOpacity
                      style={[{
                        backgroundColor: 'white',
                        paddingHorizontal: 40,
                        paddingVertical: 10,
                        elevation: 2
                      }, this.state.filterData.type === '0' ? {
                        borderColor: '#e14e0e',
                        borderWidth: 1
                      }
                        : null]}
                      onPress={() => {
                        this.state.filterData.type = '0';
                        this.setState({
                          filterData: this.state.filterData
                        });
                      }}
                    >
                      <Text style={[{
                        fontSize: 11,
                        fontFamily: 'SourceSansPro-SemiBold'
                      }, this.state.filterData.type === '0' ? {
                        color: '#e14e0e'
                      } : {
                          color: 'black'
                        }]}
                      >
                        Bike
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[{
                        backgroundColor: 'white',
                        elevation: 2,
                        paddingHorizontal: 40,
                        marginLeft: DEVICE_WIDTH > 900 ? 2 : 0,
                        marginTop: DEVICE_WIDTH > 900 ? 0 : 5,
                        paddingVertical: 10
                      }, this.state.filterData.type === '1' ? {
                        borderColor: '#e14e0e',
                        borderWidth: 1
                      } : null]}
                      onPress={() => {
                        this.state.filterData.type = '1';
                        this.setState({
                          filterData: this.state.filterData
                        });
                      }}
                    >
                      <Text style={[{
                        fontSize: 11,
                        fontFamily: 'SourceSansPro-SemiBold'
                      }, this.state.filterData.type === '1' ? {
                        color: '#e14e0e'
                      } : {
                          color: 'black'
                        }]}
                      >
                        Scooter
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <View>
                  <Text style={{
                    fontFamily: 'SourceSansPro-Bold',
                    fontSize: 15,
                    color: '#4a4a4a',
                    paddingBottom: 15
                  }}
                  >
                    Budget
                  </Text>
                  <View style={{
                    backgroundColor: '#F4F4F4',
                    justifyContent: 'space-between',
                    paddingVertical: 10
                  }}
                  >
                    {
                      this.state.filterBudget.map(eachFilterBudget => (
                        <View
                          key={eachFilterBudget.id}
                          style={{
                            flexDirection: 'row',
                            justifyContent: 'flex-start',
                            marginVertical: 15
                          }}
                        >
                          <TouchableOpacity
                            onPress={() => this.getActiveFilter(
                              this.state.filterBudget,
                              eachFilterBudget, 'filterBudget'
                            )}
                            style={{
                              width: 20,
                              height: 20,
                              borderRadius: 15,
                              borderColor: '#ee4b40',
                              borderWidth: 1,
                              marginHorizontal: 10,
                              backgroundColor: '#F4F4F4',
                              justifyContent: 'center',
                              alignItems: 'center'
                            }}
                          >
                            {
                              eachFilterBudget.active
                                ? (
                                  <View style={{
                                    width: 10,
                                    height: 10,
                                    borderRadius: 15,
                                    borderColor: '#ee4b40',
                                    borderWidth: 1,
                                    marginHorizontal: 10,
                                    backgroundColor: '#ee4b40',
                                  }}
                                  />
                                )
                                : null
                            }
                          </TouchableOpacity>
                          <Text style={{
                            marginRight: 40,
                            fontFamily: 'SourceSansPro-Regular',
                            fontSize: 13
                          }}
                          >
                            {eachFilterBudget.name}
                          </Text>
                        </View>
                      ))
                    }
                  </View>
                </View>
                <View>
                  <Text style={{
                    fontFamily: 'SourceSansPro-Bold',
                    fontSize: 15,
                    color: '#4a4a4a',
                    paddingBottom: 15
                  }}
                  >
                    Engine Capacity
                  </Text>
                  <View style={{
                    backgroundColor: '#F4F4F4',
                    justifyContent: 'space-between',
                    paddingVertical: 10
                  }}
                  >
                    {
                      this.state.filterCapacity.map(eachFilterCapacity => (
                        <View
                          key={eachFilterCapacity.id}
                          style={{
                            flexDirection: 'row',
                            justifyContent: 'flex-start',
                            marginVertical: 15
                          }}
                        >
                          <TouchableOpacity
                            onPress={() => this.getActiveFilter(
                              this.state.filterCapacity,
                              eachFilterCapacity, 'filterCapacity'
                            )}
                            style={{
                              width: 20,
                              height: 20,
                              borderRadius: 15,
                              borderColor: '#ee4b40',
                              borderWidth: 1,
                              marginHorizontal: 10,
                              backgroundColor: '#F4F4F4',
                              justifyContent: 'center',
                              alignItems: 'center'
                            }}
                          >
                            {eachFilterCapacity.active
                              ? (
                                <View style={{
                                  width: 10,
                                  height: 10,
                                  borderRadius: 15,
                                  borderColor: '#ee4b40',
                                  borderWidth: 1,
                                  marginHorizontal: 10,
                                  backgroundColor: '#ee4b40',
                                }}
                                />
                              )
                              : null
                            }
                          </TouchableOpacity>
                          <Text style={{
                            marginRight: 55,
                            fontFamily: 'SourceSansPro-Regular',
                            fontSize: 13
                          }}
                          >
                            {eachFilterCapacity.name}
                          </Text>
                        </View>
                      ))
                    }
                  </View>
                </View>
              </View>
              <View style={{
                justifyContent: 'flex-end',
                padding: 20,
                flexDirection: 'row',
                alignItems: 'flex-end'
              }}
              >
                <TouchableOpacity
                  style={{
                    justifyContent: 'center',
                    paddingBottom: 7,
                    marginRight: 10
                  }}
                  onPress={() => this.resetFilter()}
                >
                  <Text style={{
                    color: '#7f7f7f',
                    borderBottomColor: '#7f7f7f',
                    borderBottomWidth: 1,
                  }}
                  >
                    Reset Filters
                  </Text>
                </TouchableOpacity>
                <BookTestRideButton
                  handleSubmit={() => this.getFilteredData()}
                  title="Apply Filter"
                />
              </View>
            </View>
          </ScrollView>
        </Animated.View>
        {/* Main View */}
        <View style={{ justifyContent: 'space-around' }}>
          <View style={{
            elevation: 1,
            alignSelf: 'center',
            height: 65,
            backgroundColor: 'white',
            width: DEVICE_WIDTH * 0.859,
            marginLeft: 2,
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'space-between'
          }}
          >
            <View style={{
              flexDirection: 'row',
              marginHorizontal: 20
            }}
            >
              {this.state.filterData.typeName
                ? (
                  <View style={{
                    flexDirection: 'row',
                    marginRight: 20,
                    borderColor: '#ee4b40',
                    borderWidth: 1,
                    padding: 5,
                    backgroundColor: '#fff7ed',
                    borderRadius: 5,
                  }}
                  >
                    <Text style={{
                      paddingHorizontal: 5,
                      fontFamily: 'SourceSansPro-Regular',
                      fontSize: 12,
                      color: '#191919'
                    }}
                    >
                      Type:
                      </Text>
                    <Text style={{
                      paddingRight: 5,
                      fontFamily: 'SourceSansPro-Regular',
                      fontSize: 12,
                      color: '#191919'
                    }}
                    >
                      {this.state.filterData.typeName}
                    </Text>
                    <TouchableOpacity
                      style={{
                        paddingRight: 5,
                        justifyContent: 'center'
                      }}
                      onPress={() => { this.cancelType('Type'); }}
                    >
                      <Image source={cancel} style={{ height: 10, width: 10 }} />
                    </TouchableOpacity>
                  </View>
                )
                : null
              }
              {this.state.filterData.showBudget
                ? (
                  <View style={{
                    flexDirection: 'row',
                    marginRight: 20,
                    borderColor: '#ee4b40',
                    borderWidth: 1,
                    padding: 5,
                    backgroundColor: '#fff7ed',
                    borderRadius: 5
                  }}
                  >
                    <Text style={{
                      paddingHorizontal: 5,
                      fontFamily: 'SourceSansPro-Regular',
                      fontSize: 12,
                      color: '#191919'
                    }}
                    >
                      Budget:
                      </Text>
                    <Text style={{
                      paddingRight: 5,
                      fontFamily: 'SourceSansPro-Regular',
                      fontSize: 12,
                      color: '#191919'
                    }}
                    >
                      {this.state.filterData.showBudget}
                    </Text>
                    <TouchableOpacity
                      style={{
                        paddingRight: 5,
                        justifyContent: 'center'
                      }}
                      onPress={() => { this.cancelType('Budget'); }}
                    >
                      <Image source={cancel} style={{ height: 10, width: 10 }} />
                    </TouchableOpacity>
                  </View>
                )
                : null
              }
              {this.state.filterData.showCapacity
                ? (
                  <View style={{
                    flexDirection: 'row',
                    marginRight: 20,
                    borderColor: '#ee4b40',
                    borderWidth: 1,
                    padding: 5,
                    backgroundColor: '#fff7ed',
                    borderRadius: 5
                  }}
                  >
                    <Text style={{
                      paddingHorizontal: 5,
                      fontFamily: 'SourceSansPro-Regular',
                      fontSize: 12,
                      color: '#191919'
                    }}
                    >
                      Capacity:
                      </Text>
                    <Text style={{
                      paddingRight: 5,
                      fontFamily: 'SourceSansPro-Regular',
                      fontSize: 12,
                      color: '#191919'
                    }}
                    >
                      {this.state.filterData.showCapacity}
                    </Text>
                    <TouchableOpacity
                      style={{
                        paddingRight: 5,
                        justifyContent: 'center'
                      }}
                      onPress={() => { this.cancelType('Capacity'); }}
                    >
                      <Image source={cancel} style={{ height: 10, width: 10 }} />
                    </TouchableOpacity>
                  </View>
                )
                : null
              }
              {
                (this.state.filterData.showCapacity
                  || this.state.filterData.showBudget
                  || this.state.filterData.typeName)
                  ? (
                    <TouchableOpacity onPress={() => { this.cancelType('all'); }}>
                      <Text style={{
                        marginTop: 4,
                        color: '#7f7f7f',
                        borderBottomColor: '#7f7f7f',
                        borderBottomWidth: 1
                      }}
                      >
                        Clear All
                        </Text>
                    </TouchableOpacity>
                  )
                  : null
              }
            </View>
            <View style={{
              width: 200,
              flexDirection: 'row',
              alignItems: 'center'
            }}
            >
              <Text style={{
                fontSize: 15,
                fontFamily: 'SourceSansPro-Regular',
                color: '#6f6f6f',
                marginRight: 10,
              }}>
                Sort By
                </Text>
              <View style={{
                borderWidth: 1,
                borderColor: 'black',
                padding: 5,
                marginRight: 10,
                width: 140,
                flexDirection: 'row'
              }}
              >
                <Text style={{ alignSelf: 'center' }}>
                  {
                    this.state.currentSortName !== 'None' &&
                    <Icon
                      name={
                        this.state.currentSortName === 'Price'
                          ? 'sort-amount-asc'
                          : 'sort-amount-desc'
                      }
                      size={15}
                      color="red" />
                  }
                </Text>
                <Picker
                  selectedValue={this.state.currentSortName}
                  mode="dropdown"
                  style={{
                    width: 130,
                    height: 20
                  }}
                  onValueChange={(itemValue, itemIndex) => this.getVehiclesBasedOnSort(itemValue, itemIndex)}
                >
                  {
                    this.state.sortData.map(eachSortVal => (
                      <Picker.Item key={eachSortVal.id} label={eachSortVal.name} value={eachSortVal.name} />
                    ))
                  }
                </Picker>
              </View>
            </View>
          </View>
          <View style={{
            marginVertical: 15
          }}
          >
            {
              this.state.vehicleList && this.state.vehicleList.length === 0
                ? (
                  <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: 50 }}>
                    <Text style={{
                      marginVertical: 50,
                      fontFamily: 'SourceSansPro-Bold',
                      fontSize: 22
                    }}
                    >
                      {this.props.loading ? '' : 'No Vehicles to show '}
                    </Text>
                    {!this.props.loading
                      && (
                        <BookTestRideButton
                          handleSubmit={() => this.slide()}
                          title="Click to open Filter"
                        />
                      )
                    }
                  </View>
                )
                : (
                  DEVICE_SIZE ?
                    <FlatList
                      getItemLayout={(data, index) => ({ index })}
                      data={this.state.vehicleList}
                      ref={ref => { this.flatListRef = ref; }}
                      renderItem={({ item, index }) => this.showCard(item, index)}
                      keyExtractor={item => item.id}
                      extraData={this.state.renderList}
                      maxHeight={DEVICE_HEIGHT > 500 ? 600 : DEVICE_HEIGHT * 0.55}
                      horizontal
                    /> :
                    <FlatList
                      getItemLayout={(data, index) => ({ index })}
                      data={this.state.vehicleList}
                      ref={ref => { this.flatListRef = ref; }}
                      renderItem={({ item, index }) => this.showCard(item, index)}
                      keyExtractor={item => item.id}
                      extraData={this.state.renderList}
                      height={DEVICE_HEIGHT > 500 ? 600 : DEVICE_HEIGHT * 0.55}
                      horizontal
                    />
                )
            }
          </View>
        </View>
      </View>
    );
  }
}
