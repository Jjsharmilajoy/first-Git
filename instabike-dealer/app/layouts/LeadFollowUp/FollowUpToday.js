import React, { Component } from 'react';
import {
  View,
  Text,
  ScrollView,
  Picker,
  Image,
  Alert,
  TouchableOpacity
} from 'react-native';
import moment from 'moment';
import Icon from 'react-native-vector-icons/FontAwesome';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styles from './leadFollowUpStyles';
import { getFollowUpToday, getFollowUpAssignee, updateLead } from '../../redux/actions/FollowUpLeads/actionCreators';
import tickIcon from '../../assets/images/tick.png';
import avatar from '../../assets/images/avatar.png';
import view from '../../assets/images/ic_primary_view_icon.png';
import Loader from '../../components/loader/Loader';
import PaginatedFlatlist from '../../components/paginatedFlatlist/PaginatedFlatlist';
import fonts from '../../theme/fonts';
import { showIndicator, hideIndicator } from '../../redux/actions/Loader/actionCreators';

@connect(state => ({
  followUpTodayResponse: state.followUpLeads.followUpTodayResponse,
  assignees: state.followUpLeads.assignees,
  loading: state.followUpLeads.loadingGroup,
  currentUser: state.user.currentUser
}), {
  getFollowUpToday,
  getFollowUpAssignee,
  updateLead,
  showIndicator,
  hideIndicator
})
export default class FollowUpToday extends Component {
  static propTypes = {
    getFollowUpToday: PropTypes.func.isRequired,
    followUpTodayResponse: PropTypes.object,
    getFollowUpAssignee: PropTypes.func.isRequired,
    assignees: PropTypes.array,
    updateLead: PropTypes.func.isRequired,
    loading: PropTypes.bool.isRequired,
    navigation: PropTypes.object.isRequired,
    currentUser: PropTypes.object.isRequired,
    showIndicator: PropTypes.func.isRequired,
    hideIndicator: PropTypes.func.isRequired
  }

  static defaultProps = {
    followUpTodayResponse: {},
    assignees: [],
  }

  constructor(props) {
    super(props);
    this.dealerId = '';
    this.state = {
      followUpsToday: {},
      refreshList: false,
      categories: []
    };
  }

  componentDidMount() {
    this.getFollowTodayDetails();
    this.willFocusSubscription = this.props.navigation.addListener(
      'willFocus',
      () => {
        this.getFollowTodayDetails();
      }
    );
  }

  componentWillUnmount() {
    this.willFocusSubscription.remove();
  }

  getFollowTodayDetails = () => {
    if (this.props.currentUser && this.props.currentUser.dealerId) {
      this.props.showIndicator();
      Promise.all([
        this.props.getFollowUpAssignee(this.props.currentUser.dealerId),
        this.props.getFollowUpToday()
      ]).then(() => {
        this.setCategories();
        this.props.hideIndicator();
      }).catch(() => {});
    }
  }

  setCategories = () => {
    const { followUpTodayResponse } = this.props;
    const newArray = [];
    if (('overdue' in followUpTodayResponse) && followUpTodayResponse.overdue.length !== 0) {
      newArray.push('overdue');
    }
    if (('pending' in followUpTodayResponse) && followUpTodayResponse.pending.length !== 0) {
      newArray.push('pending');
    }
    this.setState({
      categories: [...newArray],
      followUpsToday: {
        ...followUpTodayResponse
      },
      refreshList: !this.state.refreshList
    });
  }

  getLeadbackgroundStyle = leadTypeList => {
    switch (leadTypeList) {
      case 'pending':
        return { backgroundColor: '#47AC50' };
      case 'overdue':
        return { backgroundColor: '#ffa166' };
      default:
        return { backgroundColor: '#ffa166' };
    }
  }

  getLeadTextColor = leadType => {
    switch (leadType) {
      case 'pending':
        return { color: 'white' };
      case 'overdue':
        return { color: 'white' };
      default:
        return { backgroundColor: 'white' };
    }
  }

  getDropDownValue = item => {
    if (item && (item.is_invoiced || item.is_lost)) {
      return (item.assignee && item.assignee.first_name) ? item.assignee.first_name : '';
    }
    const id = item.assigned_to;
    const val = this.props.assignees.filter(assigee => id === assigee.id);
    let name;
    if (val.length > 0) {
      name = val[0].first_name;
    } else {
      name = 'Select';
    }
    return name;
  }

  _keyExtractor = item => item.id

  updateLeadDetail = (lead, index) => {
    lead.assigned_to = this.props.assignees[index].id;
    delete lead.lead_details;
    this.props.updateLead(lead.id, lead)
      .then(() => {
        this.getFollowTodayDetails();
      });
  }

  showLeadAlert = (lead, index) => {
    Alert.alert(
      'Message',
      `Do you want to change the lead to ${this.props.assignees[index].first_name}`,
      [
        { text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
        { text: 'OK', onPress: () => this.updateLeadDetail(lead, index) },
      ],
      { cancelable: false }
    );
  }

  handleViewButton = lead => {
    this.navigateToLeadScreen(lead);
  }

  navigateToLeadScreen = lead => {
    const { currentUser } = this.props;
    if (currentUser) {
      const { dealerId } = currentUser;

      if (dealerId) {
        this.props.navigation.navigate('LeadHistory', { leadId: lead.id, currentDealerId: dealerId });
      }
    }
  }

  addCommentsBtnTapped = lead => {
    this.navigateToLeadScreen(lead);
  }

  commentsBtnTapped = lead => {
    this.navigateToLeadScreen(lead);
  }

  renderCards = () => this.state.categories.map((currentItem, index) => (
    // eslint-disable-next-line
    <View key={index} style={styles.cardContainer}>
      <View style={[styles.overdueHeader, this.getLeadbackgroundStyle(currentItem)]}>
        <Text
          style={[styles.overdueText,
            this.getLeadTextColor(currentItem)]}>
          {`${currentItem.toUpperCase()} (${this.state.followUpsToday[currentItem].length})`}
        </Text>
      </View>
      {
        this.state.followUpsToday[currentItem] && this.state.followUpsToday[currentItem].length > 0 &&
        <PaginatedFlatlist
          keyExtractor={this._keyExtractor}
          data={this.state.followUpsToday[currentItem]}
          renderItem={this.renderItem}
          extraData={this.state.refreshList}
          numberOfVisibleItems={2}
          />
      }
      {/*       <FlatList
        keyExtractor={this._keyExtractor}
        data={this.state.followUpsToday[currentItem]}
        renderItem={({ item }) => this.renderItem(item)}
      /> */}
    </View>
  ))

  renderItem = item => (
    <View style={styles.card}>
      <View style={styles.bikeNameContainer}>
        <Text style={styles.bikeName}>
          {
            item.lead_details && item.lead_details.length > 0
              ? `${item.lead_details[0].vehicle.name} `
              + `${item.lead_details.length > 1 ? ` + ${item.lead_details.length - 1} ` : ''}`
              : (
                <Text>
                NA
                </Text>
              )
          }
        </Text>
        <View style={styles.namePicker}>
          <View style={styles.assigneePicker}>
            <Image source={avatar} resizeMode="contain" style={{ marginLeft: 10 }} />
            {!(item && (item.is_invoiced || item.is_lost))
              ? (
                <Picker
                  selectedValue={this.getDropDownValue(item)}
                  style={{ height: 25, flex: 1 }}
                  mode="dropdown"
                  onValueChange={(itemValue, itemIndex) => this.showLeadAlert(item, itemIndex)}>
                  {
                  this.props.assignees.map(assigee => (
                    <Picker.Item key={assigee.id} label={assigee.first_name} value={assigee.first_name} />
                  ))
                }
                </Picker>
              )
              : (
                <Text style={{
                  textAlignVertical: 'center', flex: 1, marginLeft: 10
                }}>
                  {this.getDropDownValue(item)}
                </Text>
              )
            }
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
                  ? moment.utc(item.next_followup_on).utcOffset('+05:30').format('D MMMM') : 'NA'
              }
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.commentView}>
          <TouchableOpacity
            onPress={() => this.commentsBtnTapped(item)}
            style={styles.commentLabelView}>
            <Icon name="commenting" size={21} color="#ff7561" />
            <Text style={[styles.commentLabel, { color: '#ff7561' }]}>
              {
              (item && item.comments_count) ? `Comment (${item.comments_count})` : 'Comment (0)'
            }
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => this.addCommentsBtnTapped(item)}>
            <Text style={[styles.addCommentLabel, { color: '#f3795c' }]}>Add Comment</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.testRideLeadContactView}>
        <View style={styles.testRideView}>
          <Text style={styles.cardSectionLabel}>
Test Ride
            {
            (item
              && Object.keys(item).length !== 0
              && ('testRideStatus' in item)
              && item.testRideStatus > 0) && `(${item.testRideStatus})`}
          </Text>
          <Text style={styles.testRideStatus}>
            {
              (item
                && Object.keys(item).length !== 0
                && ('testRideStatus' in item)
                && item.testRideStatus > 0) ? 'Taken' : 'Not Taken'}
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
        style={styles.viewButton}
        onPress={() => { this.handleViewButton(item); }}
      >
        <Image source={view} resizeMode="contain" />
        <Text style={styles.view}>VIEW</Text>
      </TouchableOpacity>
    </View>
  )

  render() {
    return (
      <View style={styles.container}>
        <Loader showIndicator={this.props.loading} />
        {
          (this.props.followUpTodayResponse
            && this.props.followUpTodayResponse.overdue
            && this.props.followUpTodayResponse.pending
            && this.props.followUpTodayResponse.overdue.length === 0
            && this.props.followUpTodayResponse.pending.length === 0)
            ? (
              <View style={{
                flex: 1, alignItems: 'center', justifyContent: 'center'
              }}>
                <Text style={{
                  marginVertical: 80,
                  alignSelf: 'center',
                  fontFamily: fonts.sourceSansProBold,
                  fontSize: 22
                }}
                >
                  No leads to show
                </Text>
              </View>
            )
            : (
              <ScrollView horizontal contentContainerStyle={styles.scrollContainer}>
                {this.renderCards()}
              </ScrollView>
            )
        }
      </View>

    );
  }
}
