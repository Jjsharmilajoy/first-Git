/* eslint-disable no-template-curly-in-string */
import React, { Component } from 'react';
import {
  View, Text, Image, Picker, TouchableOpacity, Dimensions, Alert, Linking, Platform, PermissionsAndroid
} from 'react-native';
import lodash from 'lodash';
import PropTypes from 'prop-types';
import moment from 'moment';
import Icon from 'react-native-vector-icons/FontAwesome';
import Call from 'react-native-vector-icons/Zocial';
import { connect } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import { ButtonWithLeftImage } from '../button/Button';
import { updateLead } from '../../redux/actions/FollowUpLeads/actionCreators';
import { disableButton } from '../../redux/actions/Global/actionCreators';
import ViewIcon from '../../assets/images/ic_primary_view_icon.png';
import avatar from '../../assets/images/avatar.png';
import styles from '../../layouts/NewLeadsOverview/newLeadOverviewStyles';
import cardStyles from './cardStyles';
import variables from '../../theme/variables';
import { checkPermission, requestCallPermission } from '../../helpers/Permissions';

const DEVICE_WIDTH = Dimensions.get('screen').width;

@connect(state => ({
  updateResponse: state.followUpLeads.updateResponse,
  buttonState: state.global.buttonState
}), {
  updateLead,
  disableButton
})

export default class Card extends Component {
  static propTypes = {
    item: PropTypes.object.isRequired,
    searchOn: PropTypes.bool,
    isLeadExists: PropTypes.bool,
    dropdownData: PropTypes.array,
    widthOfCard: PropTypes.number,
    updateLead: PropTypes.func.isRequired,
    onDropDownChange: PropTypes.func.isRequired,
    tab: PropTypes.string,
    onViewClicked: PropTypes.func.isRequired,
    onSelectClicked: PropTypes.func.isRequired,
    searchKey: PropTypes.string,
    disableButton: PropTypes.func.isRequired,
    buttonState: PropTypes.bool.isRequired
  }

  static defaultProps = {
    dropdownData: [],
    widthOfCard: 0,
    searchOn: false,
    tab: 'fresh',
    isLeadExists: true,
    searchKey: ''
  }

  constructor(props) {
    super(props);
    this.state = ({
    });
  }

  getLabel = labelDefault => {
    switch (this.props.tab) {
      case 'invoiced':
        return 'Invoiced';
      case 'lost':
        return 'Lead Lost';
      default:
        return labelDefault;
    }
  }

  getRespectiveDate = (item, date) => {
    switch (this.props.tab) {
      case 'invoiced':
        return moment.utc(item.invoiced_on).utcOffset('+05:30').format('LT');
      case 'lost':
        return moment.utc(item.lost_on).utcOffset('+05:30').format('LT');
      default:
        return moment.utc(date).utcOffset('+05:30').format('LT');
    }
  }

  getRespectiveMonth = (item, date) => {
    switch (this.props.tab) {
      case 'invoiced':
        return moment.utc(item.invoiced_on).utcOffset('+5:30').format('D MMM');
      case 'lost':
        return moment.utc(item.lost_on).utcOffset('+5:30').format('D MMM');
      default:
        return moment.utc(date).utcOffset('+05:30').format('D MMM');
    }
  }

  dial = async mobileNumber => {
    const permissionGiven = await checkPermission(PermissionsAndroid.PERMISSIONS.CALL_PHONE);

    if (permissionGiven) {
      if (Platform.OS === 'android') {
        mobileNumber = `tel:${mobileNumber}`;
      }
      Linking.openURL(mobileNumber);
    } else {
      const getPermission = await requestCallPermission();
      if (PermissionsAndroid.RESULTS.GRANTED === getPermission) {
        if (Platform.OS === 'android') {
          mobileNumber = `tel:${mobileNumber}`;
        }
        Linking.openURL(mobileNumber);
      } else if (PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN === getPermission) {
        Alert.alert(
          'Info',
          'Go to Settings and enable phone permissions to make a call.',
          [
            { text: 'Ok', onPress: () => { } },
          ],
          { cancelable: false }
        );
      }
    }
  };

  getCurrentLeadStatus = item => {
    if (item.last_followup_on !== null) {
      return (
        <View style={{ flex: 1 }}>
          <View style={cardStyles.directionRow}>
            {
              this.props.tab === 'lost'
                ? (
                  <Icon
                    style={[styles.greenTickImageStyle]}
                    name="times-circle"
                    size={20}
                    color="#D5180D" />
                )
                : (
                  <Icon
                    style={[styles.greenTickImageStyle, cardStyles.lostIconAlignment]}
                    name="check-circle"
                    size={20}
                    color="#89ce59" />
                )
            }

            <Text style={[styles.leadCreatedTextStyle, cardStyles.leadCreatedTextStyle,
              this.props.tab === 'lost' ? cardStyles.leadLostColor : null]}>
              Follow Up Done
            </Text>
          </View>
          <View style={cardStyles.dateStyle}>
            <Text style={styles.timeTextStyle}>
              {
                this.getRespectiveDate(item, item.last_followup_on)
              }
            </Text>
            <View style={cardStyles.monthStyle} />
            <Text style={styles.timeTextStyle}>
              {
                this.getRespectiveMonth(item, item.last_followup_on)
              }
            </Text>
          </View>
        </View>
      );
    } if (item.next_followup_on !== null) {
      return (
        <View style={{ flex: 1 }}>
          <View style={cardStyles.directionRow}>
            {
              this.props.tab === 'lost'
                ? (
                  <Icon
                    style={[styles.greenTickImageStyle, cardStyles.lostIconAlignment]}
                    name="times-circle"
                    size={20}
                    color="#D5180D" />
                )
                : (
                  <Icon
                    style={[styles.greenTickImageStyle, cardStyles.lostIconAlignment]}
                    name="check-circle-o"
                    size={20}
                    color="#8c8c8c" />
                )
            }
            <Text style={[styles.leadCreatedTextStyle, cardStyles.leadCreatedTextColor,
              this.props.tab === 'lost' ? cardStyles.leadLostColor : null]}>
              Next Follow Up
            </Text>
          </View>
          <View style={cardStyles.dateStyle}>
            <Text style={styles.timeTextStyle}>
              {
                this.props.tab === 'invoiced'
                  ? moment(item.next_followup_on).utc('+5:30').format('LT')
                  : this.getRespectiveDate(item, item.next_followup_on)
              }
            </Text>
            <View style={cardStyles.monthStyle} />
            <Text style={styles.timeTextStyle}>
              {
                this.props.tab === 'invoiced'
                  ? moment(item.next_followup_on).utc('+5:30').format('D MMM')
                  : this.getRespectiveMonth(item, item.next_followup_on)
              }
            </Text>
          </View>
        </View>
      );
    }
    return (
      <View style={{ flex: 1 }}>
        <View style={cardStyles.directionRow}>
          {
            this.props.tab === 'lost'
              ? (
                <Icon
                  style={[styles.greenTickImageStyle, cardStyles.lostIconAlignment]}
                  name="times-circle"
                  size={20}
                  color="#D5180D" />
              )
              : (
                <Icon
                  style={[styles.greenTickImageStyle, cardStyles.lostIconAlignment]}
                  name="check-circle"
                  size={20}
                  color="#63a719" />
              )
          }
          <Text style={[styles.leadCreatedTextStyle, cardStyles.leadCreatedTextStyle,
            this.props.tab === 'lost' ? cardStyles.leadLostColor : null]}>
            {
              this.getLabel('Lead Created')
            }
          </Text>
        </View>
        <View style={cardStyles.dateStyle}>
          <Text style={styles.timeTextStyle}>
            {
              this.getRespectiveDate(item, item.created_at)
            }
          </Text>
          <View style={cardStyles.monthStyle} />
          <Text style={styles.timeTextStyle}>
            {
              this.getRespectiveMonth(item, item.created_at)
            }
          </Text>
        </View>
      </View>
    );
  }

  getExecutiveForSelectedLead = (value, index, item) => {
    Alert.alert(
      'Message',
      `Do you want to change the lead to ${value}`,
      [
        { text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
        { text: 'OK', onPress: () => this.updateLeadDetails(index, item) },
      ],
      { cancelable: false }
    );
  }

  updateLeadDetails = (index, item) => {
    item.assigned_to = this.props.dropdownData[index].id;
    const temp = {};
    Object.assign(temp, item);
    if (!temp.lead_details && !temp.follow_up && !temp.lead_finance_detail) {
      delete temp.lead_details;
      delete temp.follow_up;
      delete temp.lead_finance_detail;
      if (temp.lostReason) {
        delete temp.lostReason;
      }
    }
    this.props.updateLead(item.id, temp).then(({ response }) => {
      this.props.onDropDownChange(response, this.props.dropdownData[index]);
    }).catch(() => {});
  }

  currentlySelectedExecutive = item => {
    if (item && (item.is_invoiced || item.is_lost)) {
      return item.assignee && item.assignee.first_name ? item.assignee.first_name : '';
    }
    const tempObj = this.props.dropdownData.filter(eachDropDownData => eachDropDownData.id === item.assigned_to);
    if (tempObj.length > 0) {
      return tempObj[0].first_name;
    }
    return null;
  }

  commentsBtnTapped = () => {
    this.props.disableButton();
    this.props.onViewClicked();
  }

  addCommentsBtnTapped = () => {
    this.props.disableButton();
    this.props.onViewClicked();
  }

  cardSelected = item => {
    this.props.disableButton();
    this.props.onSelectClicked(item);
  }

  viewCard = () => {
    this.props.disableButton();
    this.props.onViewClicked();
  }

  render() {
    const { item, searchKey } = this.props;
    let index = 0;
    if (searchKey.length > 0) {
      index = lodash.findIndex(item.lead_details, obj => obj.vehicle.id === searchKey);
    }
    if (item && item.is_invoiced) {
      index = lodash.findIndex(item.lead_details, obj => obj.invoiced_on != null);
    }
    if (index === -1) {
      index = 0;
    }
    return (
      <View style={[
        // this.props.widthOfCard !== 0 ? {
        //   width: this.props.widthOfCard,
        // } : cardStyles.flexOne,
        // cardStyles.cardContainer
        this.props.widthOfCard !== 0 && {
          width: this.props.widthOfCard
        },
        cardStyles.cardContainer
      ]}
      >
        {
          this.props.searchOn
            ? (
              <View>
                <Text>Tag</Text>
              </View>
            )
            : null
        }
        <View style={cardStyles.cardWrapper}>
          <View style={cardStyles.leadDetailsCountWrapper}>
            <View style={cardStyles.flexOne}>
              <Text style={cardStyles.leadDetailsCountText}>
                {
                  (item
                    && Object.keys(item).length !== 0
                    && ('lead_details' in item)
                    && item.lead_details.length !== 0
                    && ('vehicle' in item.lead_details[0])
                    && Object.keys(item.lead_details[index].vehicle).length !== 0
                    && ('name' in item.lead_details[index].vehicle))
                    ? `${item.lead_details[index].vehicle.name} ${item.lead_details.length > 1
                      ? ` + ${item.lead_details.length - 1}` : ''}` : 'NA'}
              </Text>
            </View>
          </View>
          <View style={cardStyles.generalCardsWrapper}>
            <Image
              source={avatar}
              style={cardStyles.generalCardsAvatar}
            />
            <View style={{ flex: 6 }}>
              {!(item && (item.is_invoiced || item.is_lost))
                ? (
                  <Picker
                    selectedValue={this.currentlySelectedExecutive(item)}
                    mode="dropdown"
                    enabled={!(this.props.tab === 'invoiced' || this.props.tab === 'lost')}
                    style={cardStyles.generalCardsDropdown}
                    onValueChange={(itemValue, itemIndex) => this.getExecutiveForSelectedLead(itemValue, itemIndex, item)}
                >
                    {
                    this.props.dropdownData.map(eachExecutive => (
                      <Picker.Item
                        key={eachExecutive.id}
                        label={eachExecutive.first_name}
                        value={eachExecutive.first_name} />
                    ))
                  }
                  </Picker>
                )
                : (
                  <Text style={{
                    textAlignVertical: 'center', flex: 1, marginLeft: 10
                  }}>
                    {this.currentlySelectedExecutive(item)}
                  </Text>
                )
              }
            </View>
          </View>
        </View>
        <View style={cardStyles.currentLeadStatusWrapper}>
          {this.getCurrentLeadStatus(item)}
          <View style={cardStyles.currentLeadStatusComments}>
            <TouchableOpacity
              disabled={this.props.buttonState}
              onPress={() => this.commentsBtnTapped()}>
              <View style={cardStyles.directionRow}>
                <Icon name="commenting" size={21} color="#ff7561" />
                <Text style={[styles.leadCreatedTextStyle, cardStyles.countColor]}>
                  {`Comment(${item.comments_count})`}
                </Text>
              </View>
            </TouchableOpacity>
            <View style={cardStyles.directionRow}>
              <TouchableOpacity
                disabled={this.props.buttonState}
                onPress={() => this.addCommentsBtnTapped()}>
                <Text style={[styles.timeTextStyle, cardStyles.addCommentText]}>
                  Add comment
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        {
          this.props.tab === 'lost'
            ? item && item.lostReason
              ? (
                <View>
                  <Text
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    style={cardStyles.lostReason}
                  >
                    {item.lostReason.category === 'Others' ? item.lost_reason_text : item.lostReason.reason}
                  </Text>
                </View>
              )
              : (
                <View>
                  <Text style={cardStyles.lostReasonDefaultText}>
                  NA
                  </Text>
                </View>
              )
            : null
        }
        <View style={cardStyles.testRideViewWrapper}>
          <View style={cardStyles.testRideViewWrapperSpacing}>
            <Text style={cardStyles.testRideText}>
              Test Ride
              {' '}
              {
                (item
                  && Object.keys(item).length !== 0
                  && ('testRideStatus' in item)
                  && item.testRideStatus > 0) && `(${item.testRideStatus})`}
            </Text>
            <Text style={cardStyles.leadDetailsCount}>
              {
                (item
                  && Object.keys(item).length !== 0
                  && ('testRideStatus' in item)
                  && item.testRideStatus > 0) ? 'Taken' : 'Not Taken'}
            </Text>
          </View>
          <View style={cardStyles.leadContactWrapper}>
            <Text style={cardStyles.leadContactText}>
              Lead Contact
            </Text>
            {item.mobile_number !== null ?
              <View style={{ flexDirection: 'row' }}>
                <View style={{ paddingRight: 5 }}>
                  <TouchableOpacity
                    onPress={() => { this.dial(item.mobile_number); }}>
                    <Call
                      style={[{ margin: 1 }]}
                      name="call"
                      size={17}
                      color="#f05b3a" />
                  </TouchableOpacity>
                </View>
                <View >
                  <Text style={cardStyles.leadContactNumber}>
                    {item.mobile_number}
                  </Text>
                </View>
              </View> : null }
          </View>
        </View>
        <View style={cardStyles.leadDetailsWrapper}>
          <Text style={cardStyles.leadDetailsText}>
            Finance Option
          </Text>
          <View style={cardStyles.leadNameWrapper}>
            <Text style={cardStyles.leadNameStyle}>
              {item.financier_lead.length > 0 ? 'Yes' : 'No'}
            </Text>
          </View>
        </View>
        {/* Lead Details */}
        <View style={cardStyles.leadDetailsWrapper}>
          <Text style={cardStyles.leadDetailsText}>
            Lead Details
          </Text>
          <View style={cardStyles.leadNameWrapper}>
            <Text style={cardStyles.leadNameStyle}>
              {item.name}
            </Text>
            {/* If location is asked in future, can uncomment this */}
            {/* {
              item.location ?
                <View style={{
                  flexDirection: 'row'
                }}>
                  <View style={{
                    borderColor: '#D9D9D9',
                    borderWidth: 5,
                    // backgroundColor: '#D9D9D9',
                    borderRadius: 5,
                    marginTop: 5,
                    marginBottom: 7,
                    marginHorizontal: 10
                  }} />
                  <Text style={{
                    color: '#464646',
                    fontSize: 12,
                    fontFamily: 'SourceSansPro-Regular'
                  }}>{item.location}
                  </Text>

                </View>
                :
                null
            } */}
            {
              item.gender
                ? (
                  <View style={cardStyles.directionRow}>
                    <View style={cardStyles.genderView} />
                    <Text style={cardStyles.genderText}>
                      {item.gender}
                    </Text>
                  </View>
                )
                : null
            }
          </View>
        </View>
        {/* View Button */}
        <LinearGradient
          colors={['#FFEEE5', '#FFEEE5']}
          style={cardStyles.viewButtonWrapper}>
          {
            !this.props.isLeadExists && !item.is_invoiced && !item.is_lost
            && (
            <ButtonWithLeftImage
              disabled={this.props.buttonState}
              image={ViewIcon}
              style={[{ width: (DEVICE_WIDTH / 3) - 40 },
                cardStyles.buttonView, { borderRightWidth: 1, borderColor: variables.dustyOrange }
              ]}
              textStyle={cardStyles.buttonText}
              handleSubmit={() => this.cardSelected(item)}
              title="SELECT"
              />
            )
          }
          <ButtonWithLeftImage
            disabled={this.props.buttonState}
            image={ViewIcon}
            style={[{ width: (DEVICE_WIDTH / 3) - 40 },
              cardStyles.buttonView
            ]}
            textStyle={cardStyles.buttonText}
            handleSubmit={() => { this.viewCard(); }}
            title="VIEW"
          />
        </LinearGradient>
      </View>
    );
  }
}
