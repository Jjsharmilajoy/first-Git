/**
 * The SearchLead component renders the global lead search activity.
 */
import React, { Component, Fragment } from 'react';
import {
  View,
  Text,
  ScrollView,
  Picker,
  Image,
  FlatList,
  Dimensions,
  TextInput,
  Animated,
  TouchableOpacity,
  DatePickerAndroid,
  Alert
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import moment from 'moment';
import PropTypes from 'prop-types';
import Icon from 'react-native-vector-icons/FontAwesome';
import EvilIcon from 'react-native-vector-icons/EvilIcons';
import { connect } from 'react-redux';
import styles from './searchLeadStyles';
import { getFollowUpAssignee, updateLead } from '../../redux/actions/FollowUpLeads/actionCreators';
import { searchLead, clearLeads, clearSearchText } from '../../redux/actions/Leads/actionCreators';
import { disableButton } from '../../redux/actions/Global/actionCreators';
import { getVehicles } from '../../redux/actions/GetVehicles/actionCreators';
import tickIcon from '../../assets/images/tick.png';
import comment from '../../assets/images/comments_ic.png';
import avatar from '../../assets/images/avatar.png';
import view from '../../assets/images/ic_primary_view_icon.png';
import Loader from '../../components/loader/Loader';
import AppHeader from '../../components/header/Header';
import { isNumeric } from '../../utils/validations';
import { BookTestRideButton } from '../../components/button/Button';
import { toast } from '../../utils/toaster';
import Card from '../../components/card/Card';
import variable from '../../theme/variables';

const DEVICE_WIDTH = Dimensions.get('screen').width;

const { width } = Dimensions.get('screen');
@connect(state => ({
  loading: state.leads.loadingGroup,
  // state.followUpLeads.loadingGroup ||
  leads: state.leads.searchedLeads,
  searchLoading: state.leads.searchLoading,
  searchLoaded: state.leads.searchLoaded,
  leadOwners: state.followUpLeads.assignees,
  currentUser: state.user.currentUser,
  products: state.getVehicles.vehicleData,
  buttonState: state.global.buttonState
}), {
  getFollowUpAssignee,
  getVehicles,
  updateLead,
  searchLead,
  clearLeads,
  disableButton,
  clearSearchText
})
export default class SearchLead extends Component {
  static propTypes = {
    leads: PropTypes.any,
    leadOwners: PropTypes.array,
    searchLead: PropTypes.func.isRequired,
    getVehicles: PropTypes.func.isRequired,
    clearSearchText: PropTypes.func.isRequired,
    getFollowUpAssignee: PropTypes.func.isRequired,
    updateLead: PropTypes.func.isRequired,
    loading: PropTypes.bool.isRequired,
    navigation: PropTypes.object.isRequired,
    currentUser: PropTypes.object.isRequired,
    clearLeads: PropTypes.func.isRequired,
    searchLoading: PropTypes.bool.isRequired,
    searchLoaded: PropTypes.bool.isRequired
  }

  static defaultProps = {
    leads: {},
    leadOwners: []
  }

  constructor(props) {
    super(props);
    this.defaultFilterData = {
      fromDate: moment().subtract(2, 'months').format('YYYY-MM-DD'),
      toDate: moment().format('YYYY-MM-DD'),
      dealer: true,
      interestedVehicles: [],
      owner: [],
      orderField: 'created_at',
      orderBy: 'desc',
      mobile_number: '',
      name: '',
      filterBy: ''
    };
    this.state = {
      currentFilterBy: '',
      selectedVehicle: null,
      refreshFlatList: false,
      filterOpen: false,
      onFilterFromNavigationInit: true,
      initialLoad: true,
      searchValue: '',
      toVal: 10,
      leadOwners: [],
      products: [],
      filterData: JSON.parse(JSON.stringify(this.defaultFilterData)),
      defaultVal: new Animated.Value(-450),
      currentStepValue: new Animated.Value(width),
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const { onFilterFromNavigationInit, refreshFlatList } = prevState;
    const {
      filterData, leadOwners, products,
    } = prevState;
    // applying filter as higher priority than setting leads and owners in state.
    if (nextProps.leadOwners && nextProps.leadOwners.length > 0
      && nextProps.navigation.state.params.ownerId && filterData.owner.length === 0
      && onFilterFromNavigationInit) {
      const { ownerId } = nextProps.navigation.state.params;
      filterData.owner = [ownerId];
      nextProps.searchLead(filterData).catch(() => {});
      const markedLeadOwners = nextProps.leadOwners.map(owner => {
        owner.marked = owner.id === ownerId;
        owner.filtered = owner.id === ownerId;
        return owner;
      });
      return {
        filterData,
        leadOwners: markedLeadOwners,
        onFilterFromNavigationInit: false
      };
    }
    if (((nextProps.leadOwners.length && leadOwners.length !== nextProps.leadOwners.length)
        || (nextProps.products.length && products.length !== nextProps.products.length))) {
      return {
        leadOwners: leadOwners.length ? leadOwners : nextProps.leadOwners,
        products: nextProps.products,
        refreshFlatList: !refreshFlatList
      };
    }
    return null;
  }

  componentDidMount() {
    this.initializeFilterData();
    this.willFocusSubscription = this.props.navigation.addListener(
      'willFocus',
      () => {
        const { ownerId } = this.props.navigation.state.params;
        if (this.isFilterApplied() && !ownerId) {
          this.applyFilter();
        }
        this.animate({ endValue: 0, duration: this.props.navigation.state.params.isFilterOpen ? 0 : 200 });
      }
    );
    this.willBlurSubscription = this.props.navigation.addListener(
      'willBlur',
      () => {
        setTimeout(() => {
          this.props.clearLeads();
        }, 1000);
        this.setState({
          searchValue: ''
        });
      }
    );
  }

  componentWillUnmount() {
    this.props.clearLeads();
    this.willFocusSubscription.remove();
    this.willBlurSubscription.remove();
    this.props.clearSearchText();
  }

  // Vehicle
  onVehicleFilter= (vehicleDetails, index) => {
    const { filterData, refreshFlatList } = this.state;
    let { products } = this.state;
    products = products.map((product, productIndex) => {
      product.marked = index === productIndex ? !product.marked : false;
      return product;
    });

    this.setState({
      products,
      filterData,
      refreshFlatList: !refreshFlatList
    });
  }

  onViewLeadClicked = lead => {
    try {
      const { currentUser: { dealerId } } = this.props;
      this.props.navigation.navigate(
        'LeadHistory',
        { leadId: lead.id, currentDealerId: dealerId }
      );
    } catch (error) {
      console.log('Cannot View Lead Details', error);
    }
  }

  // OWNER
  // eslint-disable-next-line
  setOwnersInFilter = (ownerDetails, index) => {
    const { leadOwners, filterData } = this.state;
    leadOwners[index].marked = !ownerDetails.marked;
    this.setState({ leadOwners, filterData });
  }

  applyFilter = () => {
    const {
      filterData, filterOpen, searchValue
    } = this.state;
    let selectedVehicle = null;
    let { leadOwners, products } = this.state;
    filterData.owner = [];
    filterData.interestedVehicles = [];
    leadOwners = leadOwners.map(owner => {
      owner.filtered = owner.marked;
      if (owner.filtered) {
        filterData.owner.push(owner.id);
      }
      return owner;
    });
    products = products.map(product => {
      product.filtered = product.marked;
      if (product.filtered) {
        selectedVehicle = product;
        filterData.interestedVehicles = [product.id];
      }
      return product;
    });
    if (filterOpen) {
      this.slide();
    }
    this.setState({
      currentFilterBy: filterData.filterBy,
      leadOwners,
      selectedVehicle,
      products
    }, () => {
      const { owner, interestedVehicles } = filterData;
      if ((owner.length + interestedVehicles.length) > 0 || searchValue.length > 0) {
        this.props.searchLead(filterData).catch(() => {});
      } else {
        this.props.clearLeads();
      }
    });
  }

  markFilteredItems = () => {
    const {
      filterData,
      leadOwners, products, refreshFlatList, currentFilterBy
    } = this.state;
    leadOwners.map(owner => {
      owner.marked = owner.filtered;
      return owner;
    });
    products.map(product => {
      product.marked = product.filtered;
      return product;
    });
    filterData.filterBy = currentFilterBy;
    this.setState({
      leadOwners,
      products,
      filterData,
      refreshFlatList: !refreshFlatList
    });
  }

  setFilterLeadType = param => {
    const { filterData } = this.state;
    filterData.filterBy = param;
    this.setState({
      filterData
    });
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
          mode: 'calendar'
        });
        if (action !== DatePickerAndroid.dismissedAction) {
          const retrievedDate = moment({ years: year, months: month, date: day }).format('YYYY-MM-DD');
          if (this.validateDates(filterData.fromDate, filterData.toDate, retrievedDate, param)) {
            filterData[param] = moment({ years: year, months: month, date: day }).format('YYYY-MM-DD');
            this.setState({ filterData });
          }
        }
      } catch (error) {
        console.log('Cannot open date picker', error);
      }
    }
  )

  getLeadbackgroundStyle = leadTypeList => {
    switch (leadTypeList) {
      case 'NEW':
        return { backgroundColor: variable.fresh };
      case 'HOT':
        return { backgroundColor: variable.hot };
      case 'WARM':
        return { backgroundColor: variable.warm };
      case 'COLD':
        return { backgroundColor: variable.cold };
      case 'booked':
        return { backgroundColor: variable.booked };
      case 'invoiced':
        return { backgroundColor: variable.invoiced };
      case 'lost':
        return { backgroundColor: variable.lost };
      default: {
        return { backgroundColor: variable.fresh };
      }
    }
  }

  getLeadTextColor = leadType => {
    switch (leadType) {
      case 'HOT':
        return { color: variable.black };
      case 'invoiced':
        return { color: variable.black };
      default:
        return { color: 'white' };
    }
  }

  getDropDownValue = assignToId => {
    const val = this.state.leadOwners.filter(assigee => assignToId === assigee.id);
    let name;
    if (val.length > 0) {
      name = val[0].first_name;
    } else {
      name = 'Select';
    }
    return name;
  }

  onDropDownChange = (updatedLead, assignee) => {
    toast(`lead assigned to ${assignee.first_name}`);
    const { filterData } = this.state;
    if (filterData.owner.length > 0) {
      this.props.searchLead(filterData).catch(() => {});
      this.applyFilter();
    }
  }

  cancelFilterData = (type, index, item) => {
    if (type === 'user') {
      this.setOwnersInFilter(item, index);
    } else {
      this.onVehicleFilter(item, index);
    }
    this.applyFilter();
  }

  isFilterApplied = () => {
    const { filterData } = this.state;
    const {
      searchValue,
      fromDate,
      toDate,
      interestedVehicles,
      mobile_number,
      name,
      owner,
      filterBy
    } = filterData;
    return !(fromDate === this.defaultFilterData.fromDate
      && toDate === this.defaultFilterData.toDate
      // eslint-disable-next-line  camelcase
      && !searchValue && !mobile_number
      && !interestedVehicles.length
      && !owner.length
      && !name
      && filterBy === '');
  }

  initializeFilterData = () => {
    try {
      const { currentUser: { dealerId } } = this.props;
      Promise.all([
        this.props.getFollowUpAssignee(dealerId),
        this.props.getVehicles(dealerId)
      ]).then(() => {}).catch(() => {});
      if (this.props.navigation.state.params.isFilterOpen) {
        this.slide();
      }
    } catch (error) {
      console.log('Cannot fetch leadOwners', error);
    }
  }

  openFilter=() => {
    const { filterOpen } = this.state;
    if (filterOpen) {
      this.markFilteredItems();
    }
    this.slide();
  }

  searchBtnTapped = () => {
    try {
      if (this.state.filterData.mobile_number.length > 0
        || this.state.filterData.name.length > 0
        || this.state.filterData.filterBy.length > 0) {
        this.props.searchLead(this.state.filterData).catch(() => {});
      } else {
        this.props.clearLeads();
      }
    } catch (error) {
      console.log(error);
    }
  }

  slide = () => {
    const { filterOpen } = this.state;
    if (this.state.toVal === -450) {
      this.state.toVal = 10;
      this.state.defaultVal = new Animated.Value(-450);
    } else if (this.state.initialLoad) {
      this.state.toVal = 10;
      this.state.defaultVal = new Animated.Value(-450);
      this.state.initialLoad = false;
    } else {
      this.state.toVal = -450;
      this.state.defaultVal = new Animated.Value(10);
    }
    this.setState({
      defaultVal: this.state.defaultVal,
      toVal: this.state.toVal,
      filterOpen: !filterOpen
    }, () => {
      Animated.timing(this.state.defaultVal, {
        toValue: this.state.toVal,
        duration: 300
      }).start();
    });
  };

  animate = ({ endValue, duration }) => {
    Animated.timing(
      this.state.currentStepValue,
      {
        toValue: endValue,
        duration
      }
    ).start();
  }

  _keyExtractor = item => item.id

  updateLeadDetail = (lead, index) => {
    lead.assigned_to = this.state.leadOwners[index].id;
    delete lead.lead_details;
    this.props.updateLead(lead.id, lead).then(() => {
      this.applyFilter();
    }).catch(() => {});
  }

  resetFilter= () => {
    let { products, leadOwners } = this.state;
    products = products.map(product => ({ ...product, filtered: false, marked: false }));
    leadOwners = leadOwners.map(owner => ({ ...owner, filtered: false, marked: false }));
    this.setState({
      filterData: JSON.parse(JSON.stringify(this.defaultFilterData)),
      products,
      searchValue: '',
      leadOwners
    }, () => {
      this.props.clearLeads();
    });
  }

  searchLead = searchValue => {
    const { filterData } = this.state;
    const isNumber = isNumeric(searchValue);
    filterData.mobile_number = isNumber ? searchValue : '';
    filterData.name = !isNumber ? searchValue : '';
    this.setState({ searchValue, filterData });
  }

  showLeadAlert = (lead, index) => {
    Alert.alert(
      'Message',
      `Do you want to change the lead to ${this.props.leadOwners[index].first_name}`,
      [
        { text: 'Cancel', onPress: () => {}, style: 'cancel' },
        {
          text: 'OK',
          onPress: () => {
            this.updateLeadDetail(lead, index).then(() => {
              setTimeout(() => {
                this.setState();
              }, 1000);
            }).catch(() => {});
          }
        },
      ],
      { cancelable: false }
    );
  }

  validateDates=(fromDate, toDate, retrievedDate, param) => {
    const validated = (() => param === 'toDate'
      ? moment(fromDate).isSameOrBefore(retrievedDate)
      : moment(toDate).isSameOrAfter(retrievedDate))();
    if (!validated) {
      // eslint-disable-next-line  max-len
      toast(`${param === 'fromDate' ? 'Start Date' : 'End Date'} cannot be ${param === 'fromDate' ? 'higher' : 'lower'} than ${moment(param === 'toDate' ? fromDate : toDate).format('DD MMM YY')} !`);
    }
    return validated;
  }

  renderCards = () => Object.keys(this.props.leads).map(currentItem => (
    this.props.leads[currentItem].length > 0
      ? (
        <View key={currentItem} style={styles.cardContainer}>
          <View style={[styles.overdueHeader, this.getLeadbackgroundStyle(currentItem)]}>
            <Text
              style={[styles.overdueText,
                this.getLeadTextColor(currentItem)]}>
              {`${currentItem.toUpperCase()} (${this.props.leads[currentItem] && this.props.leads[currentItem].length})`}
            </Text>
          </View>
          {
            this.props.leads[currentItem] && this.props.leads[currentItem].length > 0
            && (
            <FlatList
              keyExtractor={this._keyExtractor}
              data={this.props.leads[currentItem]}
              renderItem={({ item }) => this.renderItem(item, currentItem)}
              />
            )
          }
        </View>
      )
      : null
  ));

  renderItem = (item, currentItem) => (
    <Card
      item={item}
      searchKey={this.state.filterData && this.state.filterData.interestedVehicles
      && this.state.filterData.interestedVehicles.length > 0 ? this.state.filterData.interestedVehicles[0] : ''}
      dropdownData={this.state.leadOwners}
      widthOfCard={(DEVICE_WIDTH / 3) - 20}
      selectedVehicle={this.state.selectedVehicle}
      onDropDownChange={(updatedLead, assignee) => this.onDropDownChange(updatedLead, assignee)}
      isLeadExists={this.props.navigation.state.params.isLeadExists}
      onSelectClicked={this.props.navigation.state.params.selectLead}
      tab={currentItem.toLowerCase()}
      onViewClicked={() => { this.onViewLeadClicked(item); }} />
  )

  renderItems = item => (
    <View style={styles.card}>
      <View style={styles.bikeNameContainer}>
        <Text style={styles.bikeName}>
          {
          (item && item.lead_details && item.lead_details.length > 0 && item.lead_details.vehicle
            && item.lead_details.vehicle.length > 0 && item.lead_details.vehicle[0].name)
            ? item.lead_details.vehicle[0].name : 'NA'
        }
        </Text>
        <View style={styles.namePicker}>
          <View style={styles.assigneePicker}>
            <Image source={avatar} resizeMode="contain" style={{ marginLeft: 10 }} />
            <Picker
              selectedValue={this.getDropDownValue(item.assigned_to)}
              style={{ height: 25, flex: 1 }}
              mode="dropdown"
              disabled
              onValueChange={(itemValue, itemIndex) => {
                this.showLeadAlert(item, itemIndex);
              }}>
              {
                this.state.leadOwners.map(assigee => (
                  <Picker.Item key={assigee.id} label={assigee.first_name} value={assigee.first_name} />
                ))
              }
            </Picker>
          </View>
        </View>
      </View>
      <View style={styles.followCommentView}>
        <View style={styles.followView}>
          <View style={{ borderRadius: 2, paddingHorizontal: 8, paddingVertical: 4 }}>
            <View style={styles.followUpLabelView}>
              <Image source={tickIcon} resizeMode="contain" />
              <Text style={styles.followUpGreenLabel}>Follow up</Text>
            </View>
            <View style={styles.followUpDateView}>
              <Text style={[styles.followUpGreyDate, styles.followUpDateGreyBorder]}>
                {
                (item && item.next_followup_on)
                  ? moment.utc(item.next_followup_on).utcOffset('+05:30').format('LT') : 'NA'
              }
              </Text>
              <Text style={styles.followUpGreyDate}>
                {
                (item && item.next_followup_on)
                  ? moment.utc(item.next_followup_on).utcOffset('+05:30').format('D MMM') : 'NA'
              }
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.commentView}>
          <View style={styles.commentLabelView}>
            <Image source={comment} resizeMode="contain" />
            <Text style={styles.commentLabel}>
              {
              (item && item.comments_count) ? `Comment (${item.comments_count})` : 'Comments (0)'
            }
            </Text>
          </View>
          <Text style={styles.addCommentLabel} />
        </View>
      </View>
      <View style={styles.testRideLeadContactView}>
        <View style={styles.testRideView}>
          <Text style={styles.cardSectionLabel}>Test Ride</Text>
          <Text style={styles.testRideStatus}>
            {
            (item && item.lead_details
              && item.lead_details.length > 0
              && item.lead_details[0].test_ride_status)
              ? moment.utc(item.lead_details[0].test_ride_status).utcOffset('+05:30').format('D MMM') : 'NA'
          }
          </Text>
        </View>
        <View style={styles.contactView}>
          <Text style={styles.cardSectionLabel}>Lead Contact</Text>
          <Text style={styles.testRideStatus}>
            {
            (item && item.mobile_number)
              ? item.mobile_number : 'NA'
          }
          </Text>
        </View>
      </View>
      <View style={styles.leadDetailsView}>
        <Text style={styles.cardSectionLabel}>
          Finance Option
        </Text>
        <View style={styles.userDetailsView}>
          <Text style={styles.userName}>
            {item.financier_lead.length > 0 ? 'Yes' : 'No'}
          </Text>
        </View>
      </View>
      <View style={styles.leadDetailsView}>
        <Text style={styles.cardSectionLabel}>Lead Details</Text>
        <View style={styles.userDetailsView}>
          <Text style={styles.userName}>{item.name}</Text>
          <View style={styles.greyCircle} />
          <Text style={styles.userName}>{item.gender}</Text>
        </View>
      </View>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => { this.onViewLeadClicked(item); }}>
        <View style={styles.viewButton}>
          <Image source={view} resizeMode="contain" />
          <Text style={styles.view}>VIEW</Text>
        </View>
      </TouchableOpacity>
    </View>
  )

  renderVehicle = ({ item, index }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => this.onVehicleFilter(item, index)}>
      <View style={
        !item.marked ? [styles.withoutVehicleSelected] : styles.withVehicleSelected
        }>
        <LinearGradient
          colors={item.marked ? ['#ff8e3e', '#ff743f', '#fd5742', '#fb4645'] : ['white', 'white']}
          start={{ x: 0.0, y: 1.0 }}
          end={{ x: 1.0, y: 1.0 }}
          style={{
            flex: 1,
            borderRadius: 4
          }}>
          <View style={{
            backgroundColor: 'white',
            alignItems: 'center',
            flex: 1,
            justifyContent: 'center',
            margin: item.marked ? 2 : 0
          }}>
            <Image
              style={styles.imageStyle}
              source={
              { uri: item.image_url }}
            />
            <Text style={{ fontSize: 10, color: '#4a4a4a', alignSelf: 'center' }}>{item.name}</Text>
          </View>
        </LinearGradient>
      </View>
    </TouchableOpacity>
  )

  renderFilteredChips = () => {
    const { filterData: { owner, interestedVehicles }, filterOpen } = this.state;
    const isFilterAppliedWithOwnersAndVehicle = owner
      && interestedVehicles && (owner.length + interestedVehicles.length > 0);
    const totalLeads = (() => {
      let length = 0;
      Object.keys(this.props.leads).forEach(key => {
        length += this.props.leads[key].length;
      });
      return length;
    })();
    if (this.isFilterApplied() && !filterOpen && isFilterAppliedWithOwnersAndVehicle) {
      const {
        leadOwners, products
      } = this.state;
      return (
        <View style={{
          height: 55,
          marginHorizontal: 20,
          width: DEVICE_WIDTH - 50,
          backgroundColor: '#ffffff'
        }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.sectionTwoWrapper}>
              {/* start of Section 2 Left pane */}
              <View style={styles.directionRow}>
                {leadOwners && leadOwners.length > 0
                  && leadOwners.map((user, index) => (
                    <Fragment>
                      {
                        user.filtered
                        && (
                        <View
                          // eslint-disable-next-line
                          key={index}
                          style={styles.vehicleCheckbox}
                          activeOpacity={0.5}>
                          <View style={styles.vehicleNameView}>
                            <Text style={styles.vehicleTextColor}>{user.first_name}</Text>
                          </View>
                          <TouchableOpacity
                            onPress={() => this.cancelFilterData('user', index, user)}
                          >
                            <Icon name="times-circle" size={18} color="#F6673D" />
                          </TouchableOpacity>
                        </View>
                        )
                      }
                    </Fragment>
                  ))}
                {
              products && products.length > 0
              && products.map((vehicle, index) => (
                <Fragment>
                  {
                    vehicle.filtered
                    && (
                    <View
                      // eslint-disable-next-line
                    key={index}
                      style={styles.vehicleCheckbox}
                      activeOpacity={0.5}>
                      <View style={styles.vehicleNameView}>
                        <Text style={styles.vehicleTextColor}>
                          {vehicle.name}
                          {' '}
                          {totalLeads && totalLeads > 0
                            ? `(${totalLeads})` : ''}
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => this.cancelFilterData('vehicle', index, vehicle)}
                      >
                        <Icon name="times-circle" size={18} color="#F6673D" />
                      </TouchableOpacity>
                    </View>
                    )
                  }
                </Fragment>))
            }
                <View style={styles.compareButtonWrapperCenter}>
                  <TouchableOpacity
                    onPress={this.resetFilter}
                    style={styles.clearAllButton}>
                    <Text style={styles.clearAllText}> Clear All </Text>
                  </TouchableOpacity>
                </View>
              </View>
              {/* end of Section 2 Left pane */}
            </View>
          </ScrollView>
        </View>
      );
    }
  }

  showLeadLoadingMessages = () => {
    if (Object.keys(this.props.leads).length > 0) {
      return '';
    } else if (this.props.searchLoading && !this.props.searchLoaded) {
      return 'Searching';
    } else if (!this.props.searchLoading && this.props.searchLoaded) {
      return 'No leads found...!';
    } else if (this.state.searchValue.toString().length === 0) {
      return 'Type to search...!';
    } else if (this.state.searchValue.toString().length > 0) {
      return 'Tap on search icon to search...!';
    }
  }

  render() {
    const hasData = Object.keys(this.props.leads).length > 0;
    const {
      searchValue, currentStepValue, filterOpen, filterData
    } = this.state;
    const {
      fromDate, toDate, filterBy
    } = filterData;
    const { loading, navigation } = this.props;
    return (
      <View style={styles.container}>
        <Loader showIndicator={loading} />
        <AppHeader
          backEnabled
          isLeadExists={navigation.state.params.isLeadExists}
          navigation={this.props.navigation}>
          <View style={{ flex: 1, flexDirection: 'row' }}>
            <Animated.View
              style={{
                flex: 1,
                flexDirection: 'row',
                transform: [{
                  translateX: currentStepValue
                }],
              }}>
              <View style={styles.appHeaderTextContent}>
                <TextInput
                  placeholder="Enter name/phonenumber and hit search button..."
                  style={{
                    height: 40, color: 'white', flex: 1
                  }}
                  underlineColorAndroid="transparent"
                  autoComplete="false"
                  autoFocus={!this.props.navigation.state.params.isFilterOpen}
                  value={searchValue}
                  selectionColor="white"
                  placeholderTextColor="white"
                  onChangeText={this.searchLead}
            />
              </View>
            </Animated.View>
            <TouchableOpacity
              onPress={this.searchBtnTapped}
              actveOpacity={0.8}
              style={styles.filterIcon}>
              <Text style={{ paddingHorizontal: 10, alignSelf: 'center' }}>
                <Icon name="search" size={21} color="white" />
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={this.openFilter}
              actveOpacity={0.8}
              style={styles.filterIcon}>
              <Text style={{ paddingHorizontal: 10, alignSelf: 'center' }}>
                <Icon name="sliders" size={21} color="white" />
              </Text>
            </TouchableOpacity>
          </View>
        </AppHeader>
        <Animated.View
          style={[{
            backgroundColor: 'white',
            top: -100,
            zIndex: filterOpen ? 1 : -1
          }, {
            transform: [
              {
                translateY: this.state.defaultVal
              }
            ]
          }, {
            width: Dimensions.get('screen').width * 0.859,
          }, styles.filterContainer]}
          >
          <View style={{ flex: 1, borderRadius: 2 }}>
            <View style={styles.filterContent}>
              <Text style={styles.filterHeaderText}>
Filter
                {this.state.toval}
              </Text>
              <TouchableOpacity
                activeOpacity={0.8}
                style={[styles.filterCloseIcon]}
                onPress={() => {
                  this.markFilteredItems();
                  this.slide();
                }}>
                <Text style={{ alignSelf: 'center', fontWeight: '600' }}>
                  <EvilIcon name="close" size={21} color="#e14e0e" />
                </Text>
              </TouchableOpacity>
            </View>
            <View style={{ flex: 8.5, flexDirection: 'row' }}>
              <View style={{ flex: 1 }}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={styles.showLeadText}>
Show Leads From
                  </Text>
                </View>
                <View style={{ flex: 5 }}>
                  <View style={styles.filterDateContainer}>
                    <TouchableOpacity
                      style={{ flex: 1 }}
                      activeOpacity={0.8}
                      onPress={this.setFilterDate('fromDate')}
                      >
                      <View style={styles.filterDateContent}>
                        <Text style={styles.filterDateText}>Start date</Text>
                        <Text style={styles.filterDateFormattedText}>
                          {moment(fromDate).format('DD MMM YY')}
                        </Text>
                      </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={{ flex: 1 }}
                      activeOpacity={0.8}
                      onPress={this.setFilterDate('toDate')}>
                      <View style={styles.filterDateContent}>
                        <Text style={styles.filterDateText}>End date</Text>
                        <Text style={styles.filterDateFormattedText}>
                          {moment(toDate).format('DD MMM YY')}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={{ flex: 4, justifyContent: 'center', alignItems: 'center' }}>
                  <View style={styles.checkBoxView}>
                    <TouchableOpacity
                      onPress={() => this.setFilterLeadType('created')}
                      style={styles.checkBoxTouchable}>
                      { filterBy === 'created'
                        && (
                        <LinearGradient
                          colors={['#f37731', '#f16138', '#f05b3a']}
                          style={styles.checkBoxSelectedTouchable} />
                        )
                      }
                    </TouchableOpacity>
                    <Text style={styles.leadsFilterText}>
                    Created Leads
                    </Text>
                  </View>
                  <View style={styles.checkBoxView}>
                    <TouchableOpacity
                      onPress={() => this.setFilterLeadType('booked')}
                      style={styles.checkBoxTouchable}>
                      { filterBy === 'booked'
                        && (
                        <LinearGradient
                          colors={['#f37731', '#f16138', '#f05b3a']}
                          style={styles.checkBoxSelectedTouchable} />
                        )
                      }
                    </TouchableOpacity>
                    <Text style={styles.leadsFilterText}>
                    Booked Leads
                    </Text>
                  </View>
                  <View style={styles.checkBoxView}>
                    <TouchableOpacity
                      onPress={() => this.setFilterLeadType('invoiced')}
                      style={styles.checkBoxTouchable}>
                      { filterBy === 'invoiced'
                        && (
                        <LinearGradient
                          colors={['#f37731', '#f16138', '#f05b3a']}
                          style={styles.checkBoxSelectedTouchable} />
                        )
                      }
                    </TouchableOpacity>
                    <Text style={styles.leadsFilterText}>
                    Invoiced Leads
                    </Text>
                  </View>
                  <View
                    style={[styles.checkBoxView, { paddingRight: 25 }]}>
                    <TouchableOpacity
                      onPress={() => this.setFilterLeadType('lost')}
                      style={styles.checkBoxTouchable}>
                      { filterBy === 'lost'
                        && (
                        <LinearGradient
                          colors={['#f37731', '#f16138', '#f05b3a']}
                          style={styles.checkBoxSelectedTouchable} />
                        )
                      }
                    </TouchableOpacity>
                    <Text style={styles.leadsFilterText}>
                    Lost Leads
                    </Text>
                  </View>
                </View>
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flex: 1 }}>
                  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={styles.leadsOwnerHeader}>Leads owned by</Text>
                  </View>
                  <View style={{ flex: 9 }}>
                    <View style={styles.leadsOwnerContent}>
                      <ScrollView showsVerticalScrollIndicator={false}>
                        {this.state.leadOwners.map((owner, index) => (
                          <View
                            key={owner.id}
                            style={styles.leadsOwnerTouchableView}>
                            <TouchableOpacity
                              onPress={() => this.setOwnersInFilter(owner, index)}
                              style={[styles.checkBoxTouchable, {
                                borderRadius: 2
                              }]}>
                              { owner.marked
                                && (
                                <Icon
                                  style={[{ margin: 1 }]}
                                  name="check"
                                  size={12}
                                  color="#f05b3a" />
                                )
                              }
                            </TouchableOpacity>
                            <Text style={styles.leadsOwnerTouchableText}>
                              {owner.first_name}
                            </Text>
                          </View>
                        ))}
                      </ScrollView>
                    </View>
                  </View>
                </View>
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={styles.leadsOwnedHeaderText}>Interested Vehicles</Text>
                </View>
                <View style={{ flex: 9 }}>
                  <View style={styles.leadsOwnedFlatListView}>
                    <ScrollView showsVerticalScrollIndicator={false}>
                      <FlatList
                        keyExtractor={data => data.id}
                        data={this.state.products}
                        renderItem={this.renderVehicle}
                        extraData={this.state.refreshFlatList}
                        horizontal={false}
                        numColumns={2}
                      />
                    </ScrollView>
                  </View>
                </View>
              </View>
            </View>
            <View style={styles.resetFilterView}>
              <TouchableOpacity
                style={{ justifyContent: 'center', paddingBottom: 7, marginRight: 10 }}
                activeOpacity={0.8}
                onPress={() => this.resetFilter()}>
                <Text style={styles.resetFilterText}>
                  Reset Filters
                </Text>
              </TouchableOpacity>
              <BookTestRideButton
                disabled={this.filterData}
                handleSubmit={() => this.applyFilter()}
                title="Apply Filter" />
            </View>
          </View>
        </Animated.View>
        { this.renderFilteredChips()}
        { !hasData
          ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{
                alignSelf: 'center',
                fontSize: 18,
                fontFamily: 'SourceSansPro-Bold',
                color: '#4a4a4a'
              }}>
                {
                  this.showLeadLoadingMessages(this.props.leads)
                }
              </Text>
            </View>
          )
          : (
            <ScrollView horizontal contentContainerStyle={styles.scrollContainer}>
              {
              hasData
              && this.renderCards()
            }
            </ScrollView>
          )
        }

      </View>
    );
  }
}

