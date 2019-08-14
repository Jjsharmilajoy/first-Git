/**
 * The Lead Dashboard renders the leads of different category.
 */
import React, { Component, Fragment } from 'react';
import {
  View, Text, TouchableOpacity, FlatList, ScrollView
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/FontAwesome';

import moment from 'moment';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Card from '../../components/card/Card';
import {
  getLeads, getExecutives, getCount, clearLeads
} from '../../redux/actions/Leads/actionCreators';
import { getLostReasons } from '../../redux/actions/LeadHistory/actionCreators';
import Loader from '../../components/loader/Loader';
import AppHeader from '../../components/header/Header';
import PaginatedFlatlist from '../../components/paginatedFlatlist/PaginatedFlatlist';
import { homeDashboardHeaderStyles } from '../HomeDashboard/homeDashboardStyles';
import styles from './leadDashboardStyles';
import { callToast } from '../../redux/actions/Global/actionCreators';
import { LeadCategories } from '../../utils/constants';
import { showIndicator, hideIndicator } from '../../redux/actions/Loader/actionCreators';

let inThrottle = false;
const throttle = (func, limit) => () => {
  if (!inThrottle) {
    func.apply(this);
    inThrottle = true;
    setTimeout(() => { inThrottle = false; }, limit);
  }
};

@connect(
  state => ({
    leads: state.leads.leads,
    executives: state.leads.executives,
    count: state.leads.count,
    loading: state.leads.loadingGroup,
    currentUser: state.user.currentUser,
    lostReasonResponse: state.leadHistory.lostReasonResponse,
  }),
  {
    getLeads,
    getExecutives,
    getCount,
    clearLeads,
    callToast,
    showIndicator,
    hideIndicator,
    getLostReasons
  }
)

export default class LeadDashboard extends Component {
  static propTypes = {
    getLeads: PropTypes.func.isRequired,
    leads: PropTypes.array.isRequired,
    getExecutives: PropTypes.func.isRequired,
    getCount: PropTypes.func.isRequired,
    loading: PropTypes.bool.isRequired,
    navigation: PropTypes.object.isRequired,
    currentUser: PropTypes.object.isRequired,
    clearLeads: PropTypes.func.isRequired,
    callToast: PropTypes.func.isRequired,
    executives: PropTypes.array.isRequired,
    showIndicator: PropTypes.func.isRequired,
    hideIndicator: PropTypes.func.isRequired,
    getLostReasons: PropTypes.func.isRequired,
    lostReasonResponse: PropTypes.array
  }

  static defaultProps = {
    lostReasonResponse: []
  }

  static isLeadsArray = (currentTabLeads, leads) => {
    if (Array.isArray(leads)) {
      return [...currentTabLeads, ...leads];
    }
    return { ...leads };
  }

  // eslint-disable-next-line
  static getDerivedStateFromProps(nextProps, prevState) {
    const { count, leads } = nextProps;
    const totalPages = parseInt((count && count.length > 0
      ? parseInt(count[0][prevState.currentTab], 10) : 0) / prevState.numberOfVisibleItems, 10);
    if (count && count.length > 0) {
      return {
        count,
        leads,
        totalPages
      };
    }
    return null;
  }

  constructor(props) {
    super(props);
    this.state = {
      numberOfVisibleItems: 10,
      refreshList: false,
      currentTab: 'new',
      count: [],
      filterObj: {
        count: true
      },
      tabPosition: '1',
      currentTabLeads: [],
      categoryList: [],
      currentLeadReason: 'All',
      leadReasons: [],
      toBeRegistered: 0,
      registered: 0,
      deliveried: 0,
      widthOfLayout: 276,
      cardNumber: 3,
      priceCount: 0,
      productCount: 0,
      serviceCount: 0,
      othersCount: 0,
      notIntrestedCount: 0,
      page: 0,
      totalPages: 0,
      refreshing: false,
      showroomTabLayoutData: [
        {
          id: 1,
          name: 'In Showroom (0)',
        },
        {
          id: 2,
          name: 'Out of Showroom (0)',
        },
      ],
      showroomTabPosition: 1
    };
  }

  componentDidMount() {
    this.onInitalLoad();
    this.willBlurSubscription = this.props.navigation.addListener(
      'willBlur',
      () => { this.props.clearLeads(); }
    );
    this.willFocus = this.props.navigation.addListener(
      'willFocus',
      () => {
        this.onInitalLoad();
      }
    );
  }

  onInitalLoad = () => {
    const { filterObj, currentTab, showroomTabLayoutData } = this.state;
    const { currentUser: { dealerId } } = this.props;
    if (this.props.currentUser && dealerId && currentTab && currentTab.length > 0) {
      this.props.showIndicator();
      Promise.all([
        this.props.getExecutives(dealerId),
        this.props.getCount(filterObj)
      ]).then(() => {
        const overAllCount = `${parseInt(this.state.count[0].new, 10) + parseInt(this.state.count[0].hot, 10) + parseInt(this.state.count[0].warm, 10)
        + parseInt(this.state.count[0].cold, 10) + parseInt(this.state.count[0].invoiced, 10) + parseInt(this.state.count[0].lost, 10)
        + parseInt(this.state.count[0].booked, 10)}`;
        showroomTabLayoutData[0].name = `In Showroom (${overAllCount})`;
        showroomTabLayoutData[1].name = 'Out of Showroom (0)';
        this.setState({
          totalPages: 0,
          page: 0,
          refreshing: false,
          currentTabLeads: [],
          showroomTabLayoutData
        }, () => {
          this.feedData();
        });
        this.props.hideIndicator();
      }).catch(() => {
        this.props.hideIndicator();
      });
    }
  }

  componentWillUnmount() {
    this.props.clearLeads();
    this.willBlurSubscription.remove();
    this.willFocus.remove();
  }

  onSearchProductClick = () => {
    this.props.navigation.navigate('SearchLead', { isFilterOpen: false });
  }

  feedData = () => {
    const {
      currentTab, count, page, numberOfVisibleItems, currentTabLeads, currentLeadReason
    } = this.state;
    let totalCountKey = currentTab;
    if (currentTab === 'lost' || currentTab === 'invoiced') {
      if (currentLeadReason === 'All') {
        totalCountKey = currentTab === 'lost' ? 'lost' : 'invoiced';
      } else {
        totalCountKey = currentLeadReason;
      }
    }
    const totalPages = parseInt((count && count.length > 0
      ? parseInt(count[0][totalCountKey], 10) : 0) / numberOfVisibleItems, 10);
    if (page <= totalPages) {
      this.props.getLeads(currentTab, numberOfVisibleItems, page, currentLeadReason).then(() => {
        this.setState({
          currentTabLeads: LeadDashboard.isLeadsArray(currentTabLeads, this.props.leads),
          totalPages,
          refreshing: false
        });
      }).catch(error => {
        this.setState({
          refreshing: false
        });
        console.log(error);
      });
    } else {
      this.setState({
        refreshing: false
      });
    }
  }

  onShowroomTabPress = tabInfo => {
    if (tabInfo.id === 0) {
      this.setState({
        showroomTabPosition: tabInfo.id,
      });
    }
  }

  onTabPress = tabInfo => {
    if (tabInfo.type === 'lost') {
      this.props.getLostReasons().then(() => {
        this.getLeadReasons(tabInfo.type);
      });
    }
    if (tabInfo.type === 'invoiced') {
      this.getLeadReasons(tabInfo.type);
    }
    this.props.clearLeads();
    this.setState({
      tabPosition: tabInfo.id,
      currentTab: tabInfo.type,
      currentTabLeads: [],
      page: 0,
      refreshList: !this.state.refreshList
    }, () => {
      this.props.getCount(this.state.filterObj).catch(() => { });
      this.feedData();
    });
    this.setState({
      currentLeadReason: 'All'
    });
  }

  onViewLeadClicked = lead => {
    const { currentUser, navigation } = this.props;
    navigation.navigate('LeadHistory', { leadId: lead.id, currentDealerId: currentUser.dealerId });
  }

  onDropDownChange = (updateLead, assignee) => {
    if (assignee) {
      this.props.callToast(`Lead assigned to ${assignee.first_name}`);
    }
  }

  getWidth = layout => {
    const { width } = layout;
    const totalSections = width >= 500 && width <= 750 ? 2 : 3;
    this.setState({
      widthOfLayout: (width / totalSections) - 20,
      cardNumber: totalSections
    });
  }

  setCurrentLeadStatus = currentTab => {
    this.setState({
      currentTab
    });
  }

  getCurrentMonth = () => {
    const locale = 'en-us';
    const objDate = new Date();
    const Year = new Date().getFullYear().toString();
    return `${objDate.toLocaleString(locale, { month: 'short' })}'${Year.substr(Year.length - 2)}`;
  }

  getCountsForEachCategory = (overAllList, tabInfo) => {
   
    if (tabInfo.type === 'invoiced') {
      let {
        toBeRegistered, registered, deliveried
      } = this.state;
      const newArray = [];
      if (('toBeRegistered' in overAllList) && overAllList.toBeRegistered.length !== 0) {
        toBeRegistered = overAllList.toBeRegistered.length;
        newArray.push('toBeRegistered');
      }
      if (('registered' in overAllList) && overAllList.registered.length !== 0) {
        registered = overAllList.registered.length;
        newArray.push('registered');
      }
      if (('deliveried' in overAllList) && overAllList.deliveried.length !== 0) {
        deliveried = overAllList.deliveried.length;
        newArray.push('deliveried');
      }
      this.setState({
        toBeRegistered,
        registered,
        deliveried,
        categoryList: newArray,
        tabPosition: tabInfo.id,
        currentTab: tabInfo.type,
        currentTabLeads: LeadDashboard.isLeadsArray(this.state.currentTabLeads, this.props.leads),
        refreshList: !this.state.refreshList
      });
    } else {
      let {
        priceCount, productCount, serviceCount, othersCount,notIntrestedCount
      } = this.state;
      const newArray = [];
      if (('Product' in overAllList) && overAllList.Product.length !== 0) {
        productCount = overAllList.Product.length;
        newArray.push('Product');
      }
      if (('Price' in overAllList) && overAllList.Price.length !== 0) {
        priceCount = overAllList.Price.length;
        newArray.push('Price');
      }
      if (('Service' in overAllList) && overAllList.Service.length !== 0) {
        serviceCount = overAllList.Service.length;
        newArray.push('Service');
      }
      if (('NotIntrested' in overAllList) && overAllList.NotIntrested.length !== 0) {
        notIntrestedCount = overAllList.NotIntrested.length;
        newArray.push('NotIntrested');
      }
      if (('Others' in overAllList) && overAllList.Others.length !== 0) {
        othersCount = overAllList.Others.length;
        newArray.push('Others');
      }
      this.setState({
        productCount,
        notIntrestedCount,
        priceCount,
        serviceCount,
        othersCount,
        categoryList: newArray,
        tabPosition: tabInfo.id,
        currentTab: tabInfo.type,
        currentTabLeads: LeadDashboard.isLeadsArray(this.state.currentTabLeads, this.props.leads),
        refreshList: !this.state.refreshList
      });
    }
  }

  getLeadOverViewList = () => {
    const { categoryList, currentTabLeads, refreshList } = this.state;
    return (
      <View style={styles.leadOverviewStyle}>
        {
          categoryList.map((currentItem, index) => (
            <View
              style={styles.leadCardOverviewStyle}
                // eslint-disable-next-line
                key={index}>
              <View style={[styles.leadHeaderView]}>
                <Text style={[styles.pendingTextStyle, { flex: 1 }]}>
                  {this.updateCategoryCount(currentItem)}
                </Text>
              </View>
              {
                currentTabLeads && currentTabLeads[currentItem]
                && currentTabLeads[currentItem].length > 0 &&
                <PaginatedFlatlist
                  style={styles.flatListViewStyles}
                  keyExtractor={item => item.id}
                  data={currentTabLeads[currentItem]}
                  renderItem={this.renderLeadCard}
                  extraData={refreshList}
                  // scrollEnabled
                  />
              }
            </View>
          ))
        }
      </View>
    );
  }

  updateCategoryCount = category => {
    switch (category) {
      case 'toBeRegistered':
        return `To Be Registered(${this.state.toBeRegistered})`;
      case 'registered':
        return `Registered(${this.state.registered})`;
      case 'deliveried':
        return `Delivered(${this.state.deliveried})`;
      case 'Product':
        return `Due to Product(${this.state.productCount})`;
      case 'NotIntrested':
        return `Due to NotIntrested(${this.state.notIntrestedCount})`;
      case 'Price':
        return `Due to Price(${this.state.priceCount})`;
      case 'Service':
        return `Due to Service(${this.state.serviceCount})`;
      case 'Others':
        return `Others(${this.state.othersCount})`;
      case 'NEW':
        return `New (${(this.state.count.length > 0) ? this.state.count[0].new : 0})`;
      case 'HOT':
        return `Hot (${(this.state.count.length > 0) ? this.state.count[0].hot : 0})`;
      case 'WARM':
        return `Warm (${(this.state.count.length > 0) ? this.state.count[0].warm : 0})`;
      case 'COLD':
        return `Cold (${(this.state.count.length > 0) ? this.state.count[0].cold : 0})`;
      case 'INVOICED':
        return `Invoiced (${(this.state.count.length > 0) ? this.state.count[0].invoiced : 0})`;
      case 'BOOKED':
        return `Booked (${(this.state.count.length > 0) ? this.state.count[0].booked : 0})`;
      case 'LOST':
        return `Lost (${(this.state.count.length > 0) ? this.state.count[0].lost : 0})`;
      default:
        break;
    }
  }

  renderLeadCard = item => (
    this.state.widthOfLayout !== 0 && (
    <Card
      item={item}
      dropdownData={this.props.executives || []}
      widthOfCard={this.state.widthOfLayout}
      onDropDownChange={(updatedLead, assignee) => this.onDropDownChange(updatedLead, assignee)}
      tab="fresh"
      onViewClicked={() => this.onViewLeadClicked(item)} />
    )
  );

  changeTabColor = id => {
    if (this.state.tabPosition === id) {
      return styles.tabSelectedStyle;
    }
    return styles.tabStyle;
  }

  changeTextColor = id => {
    if (this.state.tabPosition === id) {
      return styles.tabSelectedTextStyle;
    }
    return styles.tabTextStyle;
  }

  changeSpecTabColor = id => {
    if (this.state.specTabPosition === id) {
      return styles.specTabSelectedStyle;
    }
    return styles.SpecTabStyle;
  }

  changeSpecTextColor = id => {
    if (this.state.specTabPosition === id) {
      return styles.specTabSelectedTextStyle;
    }
    return styles.specTabTextStyle;
  }

  getTabData = () => (
    <View style={styles.tabViewStyles}>
      {
        this.state.showroomTabLayoutData.map(tab => (
          <TouchableOpacity
            key={tab.id}
            style={this.state.showroomTabPosition === tab.id ? styles.tabSelectedStyle : styles.tabStyle}
            onPress={() => this.onShowroomTabPress(tab)}
          >
            <Text
              style={this.state.showroomTabPosition === tab.id ? styles.tabSelectedTextStyle : styles.tabTextStyle}
            >
              {tab.name}
            </Text>
          </TouchableOpacity>
        ))
      }
    </View>
  )

  renderLeadCategories = () => (
    <View style={[styles.tabViewStyles]}>
      <ScrollView horizontal>
        {
          LeadCategories.map(tab => (
            <TouchableOpacity
              key={tab.id}
              style={this.changeTabColor(tab.id)}
              onPress={() => this.onTabPress(tab)}
            >
              <Text style={this.changeTextColor(tab.id)}>{this.updateCategoryCount(tab.tabName)}</Text>
            </TouchableOpacity>
          ))
        }
      </ScrollView>
    </View>
  )

  onReasonPress = reasonKey => {
    const { leadReasons } = this.state;
    leadReasons.forEach(item => {
      if (item.reasonKey === reasonKey) {
        item.active = true;
      } else if (item.active === true) {
        item.active = false;
      }
    });
    this.setState({
      currentTabLeads: [],
      refreshing: true,
      currentLeadReason: reasonKey,
      leadReasons,
      page: 0
    }, () => {
      this.feedData();
    });
  }

  renderSubLeadCategories = () => (
    <View style={styles.reasonView}>
      {this.state.leadReasons.map(item => (
        <TouchableOpacity
          style={styles.reasonRowItem}
          onPress={() => { this.onReasonPress(item.reasonKey); }}
        >
          <View
            style={styles.radioNormal}
          >
            { item.active && (<View style={styles.radioSelected} />)}
          </View>
          <Text style={styles.actionLabel}>{item.reasonLabel} ({item.count})</Text>
        </TouchableOpacity>
      ))}
    </View>
  )

  getLeadReasons = currentTab => {
    const reasonButtons = [{
      reasonKey: 'All',
      reasonLabel: 'All',
      active: true,
      count: 0
    }];
    if (currentTab === 'lost') {
      reasonButtons[0].count = this.state.count[0].lost;
      this.props.lostReasonResponse.forEach(item => {
        const reason = item.category.toLowerCase();
        const obj = reasonButtons.find(o => o.reasonLabel === item.category);
     
        if (!obj) {
          const newObj = {
            reasonKey: reason,
            reasonLabel: item.category,
            active: false,
            count: this.state.count[0][reason] || 0
          };
          reasonButtons.push(newObj);
          
        }
      });
    
    } else if (currentTab === 'invoiced') {
      reasonButtons[0].count = this.state.count[0].invoiced;
      const invoiceCategories = ['To Be Registered', 'Registered', 'Delivered'];
      invoiceCategories.forEach(category => {
        let reason = '';
        if (category === 'To Be Registered') {
          reason = 'to_be_registered';
        } else if (category === 'Registered') {
          reason = 'registered';
        } else if (category === 'Delivered') {
          reason = 'delivered';
        }
        const newObj = {
          reasonKey: reason,
          reasonLabel: category,
          active: false,
          count: this.state.count[0][reason] || 0
        };
        reasonButtons.push(newObj);
      });
    }
    this.setState({
      leadReasons: reasonButtons,
      currentLeadReason: 'All'
    });
  }

  _onRefresh = () => {
    const { page, totalPages, currentTabLeads } = this.state;
    if (page <= totalPages && currentTabLeads.length > 0) {
      const pageNumber = page + 1;
      this.setState({ refreshing: true, page: pageNumber }, () => {
        this.feedData();
      });
    } else {
      this.setState({ refreshing: false });
    }
  }

  render() {
    const {
      refreshing, refreshList, currentTabLeads, leadReasons, cardNumber
    } = this.state;
    let fromDashboard = false;
    if (this.props.navigation && this.props.navigation.state && this.props.navigation.state.params) {
      fromDashboard = this.props.navigation.state.params.isStatisticsClicked;
    }
    console.log('fromDashboard', fromDashboard);
    return (
      <Fragment>
        <Loader showIndicator={this.props.loading} />
        <View
          style={{
            flex: 1,
            backgroundColor: 'white'
          }}
          onLayout={event => this.getWidth(event.nativeEvent.layout)}>
          <AppHeader backEnabled={!!fromDashboard} navigation={this.props.navigation}>
            <View style={homeDashboardHeaderStyles.headerContainer}>
              <View style={{ flex: 1, flexDirection: 'row' }}>
                <View style={homeDashboardHeaderStyles.headerTextContent}>
                  <Text style={{ color: 'white', paddingHorizontal: 5 }}>
                    Leads({this.state.count.length > 0 ? this.state.count[0].leads_count : 0})
                  </Text>
                </View>
                <View style={[homeDashboardHeaderStyles.headerDateContent, { display: 'none' }]}>
                  <Text style={{ color: 'white', paddingHorizontal: 5 }} />
                </View>
                <TouchableOpacity
                  style={homeDashboardHeaderStyles.headerSearchContent}
                  onPress={this.onSearchProductClick}>
                  <Text style={{ paddingHorizontal: 10 }}><Icon name="search" size={21} color="white" /></Text>
                  <Text style={homeDashboardHeaderStyles.headerSearchContentText}>
Search for Lead
                  </Text>
                </TouchableOpacity>
                <View style={{ flex: 2, flexDirection: 'row', alignItems: 'center' }} />
              </View>
            </View>
          </AppHeader>
          <Fragment>
            {fromDashboard &&
              <View style={{ height: 50 }}>
                {this.getTabData()}
              </View>
          }
            <View style={{ flex: 9 }}>
              <View style={{ height: 50 }}>
                {this.renderLeadCategories()}
              </View>
              <View style={{ flex: 1 }}>
                {(this.state.currentTab === 'invoiced' || this.state.currentTab === 'lost')
                  && (leadReasons &&
                    <View style={{ height: 50 }}>
                      {this.renderSubLeadCategories()}
                    </View>
                  )
                }
                {
                  this.state.currentTabLeads && this.state.currentTabLeads.length > 0
                    ?
                    (
                      <React.Fragment>
                        <FlatList
                          numColumns={cardNumber}
                          data={currentTabLeads}
                          horizontal={false}
                          extraData={refreshList}
                          keyExtractor={item => item.id}
                          renderItem={({ item }) => this.renderLeadCard(item)}
                          refreshing={refreshing}
                          onEndReached={throttle(this._onRefresh, 1500)}
                          onEndReachedThreshold={0.25}
                          />
                      </React.Fragment>
                    ) :
                    (
                      <View style={{
                        flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center'
                      }}>
                        <Text style={{
                          fontSize: 18,
                          fontFamily: 'SourceSansPro-Bold',
                          color: '#4a4a4a'
                        }}>
                          {!this.props.loading && `No ${this.state.currentTab} Leads Found...`}
                        </Text>
                      </View>
                    )
                }
              </View>
            </View>
          </Fragment>
        </View>
      </Fragment>
    );
  }
}
