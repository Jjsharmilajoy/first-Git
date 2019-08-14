import React, { Component, Fragment } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Switch,
  Image,
  DatePickerAndroid,
  TimePickerAndroid,
  Alert,
  Modal,
  Dimensions
} from 'react-native';
import { connect } from 'react-redux';
import moment from 'moment';
import PropTypes from 'prop-types';
import LinearGradient from 'react-native-linear-gradient';
import styles from './leadDetailActionStyles';
import Timeline from '../../components/timeline/Timeline';
import unselectedIcon from '../../assets/images/ic_unselected.png';
import selectedIcon from '../../assets/images/ic_selected.png';
import moveToIcon from '../../assets/images/ic_move_to.png';
import {
  postLeadFollowUp,
  updateLeadFollowUp,
  postComment,
  getLeadActivities,
  lostLead,
  getLostReasons
} from '../../redux/actions/LeadHistory/actionCreators';
import { BookTestRideButton, SecondaryButton } from '../../components/button/Button';

import { getLead, setLead, updateLead, disableButton } from '../../redux/actions/Global/actionCreators';
// import Loader from '../../components/loader/Loader';
import { showIndicator, hideIndicator } from '../../redux/actions/Loader/actionCreators';

// Variables
import variable from '../../theme/variables';
import Close from '../../assets/images/close.png';
import { trimExtraspaces } from '../../utils/validations';

const DEVICE_WIDTH = Dimensions.get('screen').width;
const UTC_OFFSET = '+5:30';
@connect(state => ({
  loading: state.leadHistory.loadingGroup,
  lead: state.leadHistory.lead,
  leadResponse: state.global.lead,
  updateLeadResponse: state.leadHistory.updateLeadResponse,
  lostReasonResponse: state.leadHistory.lostReasonResponse,
  leadActivitiesResponse: state.leadHistory.leadActivitiesResponse,
  updateLeadFollowResponse: state.leadHistory.updateLeadFollowResponse,
  buttonState: state.global.buttonState
}), {
    getLead,
    setLead,
    postLeadFollowUp,
    updateLead,
    updateLeadFollowUp,
    postComment,
    getLeadActivities,
    lostLead,
    showIndicator,
    hideIndicator,
    getLostReasons,
    disableButton
  })
export default class LeadDetailAction extends Component {
  static navigationOptions = props => ({
    tabBarOnPress: ({ defaultHandler }) => {
      props.navigation.state.params.onFocus();
      defaultHandler();
    },
    swipeEnabled: false
  })

  static propTypes = {
    loading: PropTypes.bool.isRequired,
    setLead: PropTypes.func.isRequired,
    leadResponse: PropTypes.object,
    lead: PropTypes.object,
    screenProps: PropTypes.object.isRequired,
    getLostReasons: PropTypes.func.isRequired,
    lostReasonResponse: PropTypes.array,
    updateLeadFollowUp: PropTypes.func.isRequired,
    updateLead: PropTypes.func.isRequired,
    postComment: PropTypes.func.isRequired,
    postLeadFollowUp: PropTypes.func.isRequired,
    getLeadActivities: PropTypes.func.isRequired,
    lostLead: PropTypes.func.isRequired,
    getLead: PropTypes.func.isRequired,
    // eslint-disable-next-line
    navigation: PropTypes.func.isRequired.length,
    updateLeadFollowResponse: PropTypes.object,
    showIndicator: PropTypes.func.isRequired,
    hideIndicator: PropTypes.func.isRequired,
    disableButton: PropTypes.func.isRequired,
    buttonState: PropTypes.bool.isRequired
  }

  static defaultProps = {
    leadResponse: {},
    lead: {},
    lostReasonResponse: [],
    updateLeadFollowResponse: {}
  }

  constructor(props) {
    super(props);
    this.state = {
      comment: '',
      categoryIndex: 0,
      scheduleFollowUp: false,
      date: '',
      time: '',
      reasons: {},
      isExpand: [],
      followUpDone: false,
      hours: 0,
      minutes: 0,
      day: 0,
      months: 0,
      years: 0,
      reasonId: null,
      leadActivitiesResponse: [],
      modalVisible: false,
      folloupComment: '',
      lost_reason_text: null,
      dirty: true,
      subExt: false
    };
  }

  static getDerivedStateFromProps(nextProps) {
    const { leadResponse, leadActivitiesResponse, lostReasonResponse } = nextProps;
    const { isMobileNumberAvailable, isFinancierLead } = nextProps.screenProps;
    if (leadActivitiesResponse
      && lostReasonResponse && leadResponse) {
      const index = LeadDetailAction.getIndex(leadResponse);
      return {
        categoryIndex: index,
        leadResponse: {
          ...leadResponse,
        },
        reasonId: leadResponse && leadResponse.lost_reason_id,
        leadActivitiesResponse: nextProps.leadActivitiesResponse,
        lostReasonResponse: nextProps.lostReasonResponse,
        isMobileNumberAvailable,
        isFinancierLead
      };
    }
    return null;
  }

  componentDidMount() {
    this.props.navigation.setParams({
      onFocus: this.onTabActive.bind(this)
    });
    this.onTabActive();
  }

  onTabActive = () => {
    const { screenProps } = this.props;
    const reasons = {};
    const isExpand = [];
    this.props.showIndicator();
    Promise.all([
      this.props.getLeadActivities(screenProps.navigation.state.params.leadId),
      this.props.getLostReasons()
    ]).then(() => {
      this.props.lostReasonResponse.forEach(item => {
        if (reasons[item.category]) {
          item.active = false;
          reasons[item.category].push(item);
        } else {
          item.active = false;
          isExpand.push(false);
          reasons[item.category] = [];
          reasons[item.category].push(item);
        }
      });
      this.setState({
        reasons,
        isExpand,
        comment: '',
        date: '',
        time: '',
        scheduleFollowUp: false
      });
    }).catch(error => { console.log(error); });
    this.props.hideIndicator();
  }

  onFollowUpSwitch = value => {
    this.setState({
      scheduleFollowUp: value, date: '', time: '', dirty: false
    });
  }

  getLeadActivities = () => {
    const { leadResponse } = this.props;
    return this.props.getLeadActivities(leadResponse.id);
  }

  getCategoriesColor = category => {
    switch (category) {
      case 'NEW':
        return { backgroundColor: variable.fresh };
      case 'HOT':
        return { backgroundColor: variable.hot };
      case 'WARM':
        return { backgroundColor: variable.warm };
      case 'COLD':
        return { backgroundColor: variable.cold };
      case 'INVOICED':
        return { backgroundColor: variable.invoiced };
      case 'LOST':
        return { backgroundColor: variable.lost };
      default:
        return { backgroundColor: variable.fresh };
    }
  }

  getCategoryView = rowData => {
    if (rowData.type === 'Change Category') {
      if (rowData.move_to && rowData.move_from) {
        return (
          <View style={styles.categoryView}>
            <Text style={[styles.categoryLabel, this.getCategoriesColor(rowData.move_from)]}>{rowData.move_from}</Text>
            <Image source={moveToIcon} resizeMode="contain" style={{ marginHorizontal: 10 }} />
            <Text style={[styles.categoryLabel, this.getCategoriesColor(rowData.move_to)]}>{rowData.move_to}</Text>
          </View>
        );
      }
    } else if (rowData.type === 'Lead Transfered') {
      return (
        <View style={styles.categoryView}>
          <Text style={[styles.categoryLabel, { color: '#838383' }]}>To: </Text>
          <Text style={[styles.categoryLabel, { color: '#838383' }]}>{rowData.move_to}</Text>
        </View>
      );
    } else {
      return (
        <Text style={[styles.categoryLabel, this.getCategoriesColor(rowData.move_to)]}>{rowData.move_to}</Text>
      );
    }
  }

  static getIndex(leadResponse) {
    if (leadResponse.is_booked) {
      return 6;
    }
    if (leadResponse.is_invoiced) {
      return 5;
    }
    if (leadResponse.is_lost) {
      return 4;
    }
    if (leadResponse.status < 600 && !leadResponse.is_booked) {
      switch (leadResponse.category) {
        case 'NEW':
          return 0;
        case 'HOT':
          return 1;
        case 'WARM':
          return 2;
        case 'COLD':
          return 3;
        default:
          break;
      }
    }
  }

  chooseCategory = value => {
    if (value === 4) {
      if (this.state.isFinancierLead) {
        Alert.alert(
          'Info',
          'Lead cannot be lost as vehicle loan is applied.',
          // 'Lead cannot be lost as vehicle loan is under processing.',
          [
            {
              text: 'Ok',
              onPress: () => { }
            }
          ],
          { cancelable: false }
        );
      } else {
        this.setState({
          categoryIndex: value,
          dirty: false,
        });
      }
    } else {
      const keys = Object.keys(this.state.reasons);
      const reasonId = null;
      const { leadResponse } = this.props;
      leadResponse.is_lost = false;
      keys.forEach(item => {
        this.state.reasons[item].forEach(keyItem => {
          keyItem.active = false;
        });
      });
      this.setState({
        categoryIndex: value,
        dirty: false,
        isExpand: [],
        reasons: this.state.reasons,
        lost_reason_text: null,
        reasonId,
        isExpandRe: []
      });
    }
  }

  scheduleFollowUp = () => {
    const {
      years, months, day, minutes, hours
    } = this.state;
    const { leadResponse } = this.state;
    const date = moment({
      years, months, date: day, hours, minutes
    }).utc().format();
    const followUpData = {
      follow_up_at: date,
      comment: trimExtraspaces(this.state.comment)
    };
    return this.props.postLeadFollowUp(leadResponse.id, followUpData)
      .catch(() => { });
  }

  validate = () => {
    const { lost_reason_text } = this.state;
    let valid = lost_reason_text ? trimExtraspaces(lost_reason_text).length > 0 : true;
    let message = null;
    const { categoryIndex, reasonId } = this.state;
    if (categoryIndex === 4 && reasonId === null) {
      valid = false;
    }
    if (this.state.scheduleFollowUp) {
      if (this.state.date.length > 0 && this.state.time.length > 0) {
        const {
          years, months, day, minutes, hours
        } = this.state;
        const selectedDate = moment({
          years, months, date: day, hours, minutes
        }).utc();
        const currentDate = moment().utc();
        if (selectedDate.isBefore(currentDate)) {
          message = 'Selected time cannot be current time or past time.';
          valid = false;
        }
        // checking for both values not to exist.
      } else if (!this.state.date.length && categoryIndex !== 4) {
        message = 'Please select a valid date.!';
        valid = false;
      } else if (!this.state.time.length && categoryIndex !== 4) {
        message = 'Please select a valid time.!';
        valid = false;
      }
    }
    if (message) {
      Alert.alert(
        '',
        message,
        [
          { text: 'Ok', onPress: () => { } },
        ],
        { cancelable: false }
      );
    }
    return valid;
  }

  handleConfirmFollowUp = () => {
    const {
      folloupComment
    } = this.state;
    let { leadResponse } = this.state;
    const followUp = leadResponse.follow_up[0];
    const confirmData = {
      id: followUp.id,
      is_completed: true,
      comment: trimExtraspaces(folloupComment)
    };
    this.props.updateLeadFollowUp(leadResponse.id, followUp.id, confirmData)
      .then(() => {
        leadResponse = {
          ...this.state.leadResponse,
          follow_up: this.props.lead.follow_up,
          next_followup_on: this.props.lead.next_followup_on,
          last_followup_on: this.props.updateLeadFollowResponse.completed_at
        };
        this.props.setLead(leadResponse);
        this.setState({
          followUpDone: false
        });
        this.getLeadActivities();
      }).catch(error => {
        console.log(error);
      });
  }

  handleRadioChange = (currentItem, currentIndex) => {
    const keys = Object.keys(this.state.reasons);
    console.log("reasonsssssssssssssss", this.state.reasons);

    let reasonId = null;
    keys.forEach(item => {
      this.state.reasons[item].forEach((keyItem, keyIndex) => {
        if (item === currentItem && keyIndex === currentIndex) {
          console.log("this.state.reasons[item]", keyItem);
          keyItem.active = true;
          if (keyItem.reason === "Bought from competition") {
            this.setState({
              subExt: true
            });
          };
          reasonId = keyItem.id;
        } else {
          keyItem.active = false;
        }
      });
    });
    this.setState({
      reasons: this.state.reasons,
      lost_reason_text: null,
      reasonId,
      date: '',
      time: ''
    });
  }

  handleTimePicker = () => {
    try {
      TimePickerAndroid.open({
        is24Hour: false
      }).then(({
        action, hour, minute
      }) => {
        if (action !== TimePickerAndroid.dismissedAction) {
          const time = moment({ hours: hour, minutes: minute }).format('LT');
          this.setState({ time, hours: hour, minutes: minute });
        }
      });
    } catch ({ code, message }) {
      console.log('Cannot open date picker', message);
    }
  }

  handleDatePicker = () => {
    try {
      DatePickerAndroid.open({
        date: new Date(),
        minDate: new Date()
      }).then(({
        action, year, month, day
      }) => {
        if (action !== DatePickerAndroid.dismissedAction) {
          const date = moment({ years: year, months: month, date: day }).format('DD MMM, YYYY');
          this.setState({
            date, years: year, months: month, day
          });
        }
      });
    } catch ({ code, message }) {
      console.log('Cannot open date picker', message);
    }
  }

  handleInvoice = value => {
    Alert.alert(
      '',
      `Lead cannot be moved to ${value} here.`,
      [
        { text: 'Ok', onPress: () => { } },
      ],
      { cancelable: false }
    );
  }

  handleDoneClick = async () => {
    this.props.disableButton();
    const { leadResponse } = this.state;
    const {
      categoryIndex, reasonId, lost_reason_text
    } = this.state;
    delete leadResponse.lead_details;
    delete leadResponse.comments_count;
    switch (categoryIndex) {
      case 0:
        // NEW
        leadResponse.category = 'NEW';
        leadResponse.is_lost = false;
        break;
      case 1:
        // HOT
        leadResponse.category = 'HOT';
        leadResponse.is_lost = false;
        break;
      case 2:
        // WARM
        leadResponse.category = 'WARM';
        leadResponse.is_lost = false;
        break;
      case 3:
        // COLD
        leadResponse.category = 'COLD';
        leadResponse.is_lost = false;
        break;
      case 4:
        // LOST
        leadResponse.is_lost = true;
        break;
      default:
        break;
    }
    const doesLostReasonValid = lost_reason_text && trimExtraspaces(lost_reason_text).length > 0;
    if (this.validate()) {
      this.props.showIndicator();
      if (leadResponse.is_lost) {
        const data = { text: doesLostReasonValid ? trimExtraspaces(lost_reason_text) : null };
        await this.props.lostLead(leadResponse.id, reasonId, data)
          .catch(error => { console.log(error); });
      } else {
        await this.props.updateLead(leadResponse.id, leadResponse)
          .catch(error => { console.log(error); });
        if (this.state.scheduleFollowUp && this.state.date.length > 0 && this.state.time.length > 0) {
          await this.scheduleFollowUp();
        }
        if (trimExtraspaces(this.state.comment).length > 0) {
          const commentData = {
            comment: trimExtraspaces(this.state.comment)
          };
          await this.props.postComment(leadResponse.id, commentData)
            .catch(error => { console.log(error); });
        }
        this.setState({
          comment: '',
          date: '',
          time: '',
          reasonId: null,
          lost_reason_text: null,
          scheduleFollowUp: false,
          dirty: true
        });
      }
      await this.props.getLead(leadResponse.id);
      await this.getLeadActivities();
      this.props.hideIndicator();
    } else if (categoryIndex === 4 && (reasonId === null || !doesLostReasonValid)) {
      Alert.alert(
        '',
        'Please select or comment the lost reason to continue',
        [
          {
            text: 'Ok',
            onPress: () => {
              leadResponse.is_lost = false;
              this.setState({
                lost_reason_text: null,
                reasonId: null
              });
            }
          },
        ],
        { cancelable: false }
      );
    }
  }

  cancelBtnAction = () => {
    this.props.disableButton();
    this.setState({
      modalVisible: false,
      folloupComment: ''
    });
  }

  okBtnAction = () => {
    this.props.disableButton();
    if (this.state.folloupComment.length > 0) {
      const commentData = {
        comment: trimExtraspaces(this.state.folloupComment)
      };
      this.props.showIndicator();
      this.props.postComment(this.state.leadResponse.id, commentData).then(() => {
        this.handleConfirmFollowUp();
      });
      this.setState({
        modalVisible: false
      });
      this.props.hideIndicator();
    } else {
      Alert.alert(
        'Message',
        'Please provide the comments to proceed further',
        [
          { text: 'Ok', onPress: () => { } },
        ],
        { cancelable: false }
      );
    }
  }

  renderTime = rowData => (
    <View style={{ width: 50 }}>
      <Text style={styles.timelineDay}>{moment(rowData.created_at).utc(UTC_OFFSET).format('DD')}</Text>
      <Text style={styles.timelineMonth}>{moment(rowData.created_at).utc(UTC_OFFSET).format('MMM')}</Text>
      <Text style={styles.timelineTime}>{moment(rowData.created_at).utc(UTC_OFFSET).format('LT')}</Text>
    </View>
  )

  renderReasons = () => {
    const { leadResponse } = this.props;
    if (leadResponse.lost_reason_id === null) {
      const keys = Object.keys(this.state.reasons);
      return keys.map((currentItem, currentIndex) => (
        <View>
          <TouchableOpacity
            style={styles.reasonHeader}
            onPress={() => {
              this.state.isExpand[currentIndex] = !this.state.isExpand[currentIndex];
              this.setState({
                isExpand: this.state.isExpand
              });
            }}>
            <Text style={styles.actionLabel}>{currentItem}</Text>
          </TouchableOpacity>
          {
            (this.state.isExpand[currentIndex]) && currentItem !== 'Others' &&
            (
              <View style={styles.reasonView}>
                {
                  this.state.reasons[currentItem].map((item, index) => (
                    <TouchableOpacity
                      style={styles.reasonRowItem}
                      onPress={() => { this.handleRadioChange(currentItem, index); }} >
                      <View
                        style={styles.radioNormal} >
                        {
                          item.active
                            ? (
                              <View style={styles.radioSelected} />
                            )
                            : null
                        }
                      </View>
                      <Text style={styles.actionLabel}>{item.reason}</Text>
                      {this.state.subExt && item.reason === 'Bought from competition' ?
                        <TextInput
                          style={{
                            width: 280, borderColor: '#D8D8D8',
                            borderWidth: 2,
                            borderRadius: 2,
                            backgroundColor: '#FBFBFB', margin: 5
                          }}
                          placeholder="Enter other competitive"
                          returnKeyType="done"
                          editable={leadResponse && !leadResponse.is_lost}
                          onChangeText={text => {
                            this.setState(state => ({
                              reasons: state.reasons,
                              lost_reason_text: text,
                            }));
                          }}
                          value={this.state.lost_reason_text}
                          underlineColorAndroid="transparent"
                        /> : null
                      }
                    </TouchableOpacity>
                  ))}
              </View>
            )
          }
          {
            (this.state.isExpand[currentIndex]) && currentItem === 'Others' &&
            (
              <View style={styles.reasonView}>
                <View style={[styles.commentView, { marginHorizontal: 20, marginBottom: 10 }]}>
                  <TextInput
                    returnKeyType="done"
                    style={{ height: 80 }}
                    textAlignVertical="top"
                    placeholder="Enter lost reason"
                    multiline
                    numberOfLines={5}
                    editable={leadResponse && !leadResponse.is_lost}
                    onChangeText={text => {
                      const reasonKeys = Object.keys(this.state.reasons);
                      reasonKeys.forEach(item => {
                        this.state.reasons[item].forEach(keyItem => {
                          keyItem.active = false;
                        });
                      });
                      this.setState(state => ({
                        reasons: state.reasons,
                        lost_reason_text: text,
                        dirty: false,
                        reasonId: state.reasons && state.reasons.Others && state.reasons.Others.length > 0 && state.reasons.Others[0].id,
                      }));
                    }}
                    value={this.state.lost_reason_text}
                    underlineColorAndroid="transparent" />
                </View>
              </View>
            )
          }
        </View>
      ));
    }
    const lostReasonId = leadResponse.lost_reason_id;
    let reason = '';
    if (lostReasonId) {
      this.props.lostReasonResponse.forEach(item => {
        if (item.id === lostReasonId && item.category !== 'Others') {
          // eslint-disable-next-line
          reason = item.reason;
        } else if (item.id === lostReasonId && item.category === 'Others') {
          reason = this.props.leadResponse.lost_reason_text;
        }
      });
      return (
        <View>
          <Text style={[styles.reasonLabel, { marginTop: 20 }]}>{`Reason: ${reason}`}</Text>
        </View>
      );
    }
  }

  renderCategories = () => {
    const { leadResponse } = this.props;
    const { categoryIndex, isMobileNumberAvailable } = this.state;
    return (
      <Fragment>
        {/* viewing all categories based on lead to be financier lead and
           lead to have mobile number */}
        {leadResponse.status < 600
          && (
            <View style={styles.moveToView}>
              <ScrollView horizontal>
                {/* viewing new category only when lead is new */}
                {
                  leadResponse.category === 'NEW' && !leadResponse.is_booked
                    ? (
                      <TouchableOpacity onPress={() => this.chooseCategory(0)}>
                        <Text style={[(categoryIndex === 0)
                          ? [styles.categoriesTextActivated, { backgroundColor: variable.fresh }]
                          : styles.categoriesTextNormal, { marginRight: 20 }]}>
                          New
                    </Text>
                      </TouchableOpacity>
                    )
                    : null
                }
                {/* viewing categories based on lead mobile number availability */}
                {
                  isMobileNumberAvailable && !leadResponse.is_booked
                    ? (
                      <Fragment>
                        <TouchableOpacity onPress={() => this.chooseCategory(1)}>
                          <Text style={[(categoryIndex === 1)
                            ? [styles.categoriesTextActivated, { backgroundColor: variable.hot, color: variable.black }]
                            : styles.categoriesTextNormal, { marginRight: 20 }]}>
                            Hot
                      </Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => this.chooseCategory(2)}>
                          <Text style={[(categoryIndex === 2)
                            ? [styles.categoriesTextActivated, { backgroundColor: variable.warm }]
                            : styles.categoriesTextNormal, { marginRight: 20 }]}>
                            Warm
                      </Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => this.chooseCategory(3)}>
                          <Text style={[(categoryIndex === 3)
                            ? [styles.categoriesTextActivated, { backgroundColor: variable.cold }]
                            : styles.categoriesTextNormal, { marginRight: 20 }]}>
                            Cold
                      </Text>
                        </TouchableOpacity>
                      </Fragment>
                    )
                    : null
                }
                {/* restricting lost category for financier lead */}
                {
                  <TouchableOpacity onPress={() => this.chooseCategory(4)}>
                    <Text style={[(categoryIndex === 4)
                      ? [styles.categoriesTextActivated, { backgroundColor: variable.lost }]
                      : styles.categoriesTextNormal, { marginRight: 20 }]}>
                      Lost
                  </Text>
                  </TouchableOpacity>
                }
                {
                  isMobileNumberAvailable
                    ? (
                      <TouchableOpacity onPress={() => { this.handleInvoice('invoiced'); }}>
                        <Text style={[(categoryIndex === 5)
                          ? [styles.categoriesTextActivated, { backgroundColor: variable.invoiced, color: variable.black }]
                          : styles.categoriesTextNormal, { marginRight: 20 }]}>
                          Invoiced
                    </Text>
                      </TouchableOpacity>
                    )
                    : null
                }
                {
                  isMobileNumberAvailable
                    ? (
                      <TouchableOpacity
                        onPress={() => { this.handleInvoice('booked'); }}
                        disabled={leadResponse.is_booked}
                      >
                        <Text style={[(categoryIndex === 6)
                          ? [styles.categoriesTextActivated, { backgroundColor: variable.booked, color: variable.black }]
                          : styles.categoriesTextNormal, { marginRight: 20 }]}>
                          Booked
                    </Text>
                      </TouchableOpacity>
                    )
                    : null
                }
              </ScrollView>
            </View>
          )
        }
        {/* viewing only invoiced category if lead is invoiced */}
        {
          (categoryIndex === 5 && leadResponse.is_invoiced)
          && (
            <View style={styles.moveToView}>
              <TouchableOpacity
                disabled
              >
                <Text style={[(categoryIndex === 5)
                  ? [styles.categoriesTextActivated,
                  { backgroundColor: variable.invoiced, color: variable.black }]
                  : styles.categoriesTextNormal, { marginRight: 20 }]}>
                  Invoiced
              </Text>
              </TouchableOpacity>
            </View>
          )
        }
        {/* viewing only lost category if lead is lost */}
        {
          (categoryIndex === 4 && leadResponse.is_lost)
          && (
            <View style={styles.moveToView}>
              <TouchableOpacity
                disabled
              >
                <Text style={[(categoryIndex === 4)
                  ? [styles.categoriesTextActivated, { backgroundColor: variable.lost }]
                  : styles.categoriesTextNormal, { marginRight: 20 }]}>
                  Lost
              </Text>
              </TouchableOpacity>
            </View>
          )
        }
      </Fragment>
    );
  }

  renderDetail = rowData => (
    <View style={styles.timelineCard}>
      {
        rowData.financier_id && rowData.lead_detail
        && (
          <View>
            <View style={{
              flexDirection: 'row',
            }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.actionLabel}>
                  {
                    (rowData.type)
                      ? rowData.type : ''
                  }
                </Text>
              </View>
              <View style={[styles.categoryWrapper, { flex: 2 }]}>
                <Image
                  source={{ uri: rowData.financier.logo_url }}
                  resizeMode="contain"
                  style={{
                    width: 75,
                    height: 35
                  }}
                />
              </View>
            </View>
            <View style={{
              flex: 2,
              flexDirection: 'row',
              justifyContent: 'flex-start'
            }}>
              <Text style={styles.bikeName}>{rowData.lead_detail.vehicle.name}</Text>
              <Image
                source={{ uri: rowData.lead_detail.vehicle.image_url }}
                resizeMode="contain"
                style={{
                  width: 150,
                  height: 75
                }}
              />
            </View>
            {
              rowData.comment
              && <Text style={styles.commentLabel}>{`Lost Reason:  "${rowData.comment}"`}</Text>
            }
            <View style={{
              flex: 1,
              flexDirection: 'row'
            }}>
              <Text
                style={[styles.doneBy, { alignSelf: 'flex-start' }]}>
                {`Done by: ${rowData.doneBy.first_name}`}
              </Text>
              <Text
                style={[styles.doneBy, { alignSelf: 'flex-end' }]}>
                {`Financial Representative: ${rowData.move_to}`}
              </Text>
            </View>
          </View>
        )
      }
      {
        (!rowData.financier_id && rowData.lead_detail
          && (rowData.lead_detail.test_ride_on || rowData.lead_detail.booked_on))
        && (
          <View>
            <View style={{
              flexDirection: 'row'
            }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.actionLabel}>
                  {
                    (rowData.type)
                      ? rowData.type : ''
                  }
                </Text>
              </View>
              <View style={[styles.categoryWrapper, { flex: 1 }]}>
                {
                  this.getCategoryView(rowData)
                }
              </View>
            </View>
            <View style={{
              flex: 2,
              flexDirection: 'row',
              justifyContent: DEVICE_WIDTH > 900 ? 'flex-start' : 'center'
            }}>
              <Text style={styles.bikeName}>{rowData.lead_detail.vehicle.name}</Text>
              <Image
                source={{ uri: rowData.lead_detail.vehicle.image_url }}
                resizeMode="contain"
                style={{
                  width: 150,
                  height: 75
                }}
              />
              {DEVICE_WIDTH > 900 &&
                <View style={{
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  <Text style={styles.vehicleName}>
                    {rowData.type === 'Booked'
                      ? ` ${moment(rowData.lead_detail.booked_on).utc(UTC_OFFSET).format('DD-MMM-YYYY')} \n`
                      + ` ${moment(rowData.lead_detail.booked_on).utc(UTC_OFFSET).format('h:mm a')}`
                      : ` ${moment(rowData.comment).utc().format('DD-MMM-YYYY')} \n`
                      + ` ${moment(rowData.comment).utc().format('h:mm a')}`
                      + ` - ${moment(rowData.comment).add(30, 'minutes')
                        .utc().format('h:mm a')}`}
                  </Text>
                </View>}
            </View>
            {DEVICE_WIDTH < 900 &&
              <View style={{
                justifyContent: 'flex-start',
                marginTop: 7
              }}>
                <Text style={styles.vehicleName}>
                  {rowData.type === 'Booked'
                    ? ` ${moment(rowData.lead_detail.booked_on).utc(UTC_OFFSET).format('DD-MMM-YYYY')} \n`
                    + ` ${moment(rowData.lead_detail.booked_on).utc(UTC_OFFSET).format('h:mm a')}`
                    : ` ${moment(rowData.comment).utc().format('DD-MMM-YYYY')} \n`
                    + ` ${moment(rowData.comment).utc().format('h:mm a')}`
                    + ` - ${moment(rowData.comment).add(30, 'minutes')
                      .utc().format('h:mm a')}`}
                </Text>
              </View>}
            <View style={{
              flex: 1,
              flexDirection: 'row'
            }}>
              <Text
                style={[styles.doneBy, { alignSelf: 'flex-start' }]}>
                {`Done by: ${rowData.doneBy.first_name}`}
              </Text>
            </View>
          </View>
        )
      }
      {
        !rowData.financier_id && !rowData.lead_detail
        && (
          <View>
            <View style={{
              flexDirection: 'row',
            }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.actionLabel}>
                  {
                    (rowData.type)
                      ? rowData.type : ''
                  }
                </Text>
              </View>
              <View style={[styles.categoryWrapper, { flex: 1 }]}>
                {
                  this.getCategoryView(rowData)
                }
              </View>
            </View>
            {
              (rowData.type === 'Comments Added')
                ? <Text style={styles.commentLabel}>{`"${rowData.comment}"`}</Text>
                : null
            }
            <Text style={styles.doneBy}>{`Done by: ${rowData.doneBy.first_name}`}</Text>
          </View>
        )
      }
    </View>
  )

  render() {
    const {
      categoryIndex, leadResponse, isMobileNumberAvailable
    } = this.state;
    return (
      <ScrollView contentContainerStyle={styles.container}>
        {/* <Loader showIndicator={this.props.loading} /> */}
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
              <View style={{ flexDirection: 'row' }}>
                <Text style={styles.reasonTitleText}>Follow Up Details</Text>
                <TouchableOpacity
                  style={[styles.closeBtnView, { alignItems: 'center', width: 40 }]}
                  disabled={this.props.buttonState}
                  onPress={() => {
                    this.props.disableButton();
                    this.setState({
                      modalVisible: false,
                      folloupComment: ''
                    });
                  }}>
                  <Image
                    style={{ resizeMode: 'center' }}
                    source={Close} />
                </TouchableOpacity>
              </View>
              <Text style={styles.commentTextStyle}>Comment:</Text>
              <TextInput
                // maxLength={100}
                textAlignVertical="top"
                style={styles.fieldContainer}
                onChangeText={text => this.setState({ folloupComment: text })}
                value={this.state.folloupComment}
                underlineColorAndroid="transparent" />
              <View style={{ flexDirection: 'row', marginVertical: 20 }}>
                <View style={{ flex: 1, alignItems: 'center' }}>
                  <BookTestRideButton
                    title="Ok"
                    disabled={this.props.loading || this.props.buttonState}
                    customStyles={styles.okBtnStyle}
                    customTextStyles={styles.okBtnTextStyle}
                    handleSubmit={this.okBtnAction} />
                </View>
                <View style={{ flex: 1, alignItems: 'center' }}>
                  <SecondaryButton
                    title="Cancel"
                    textStyle={styles.cancelBtnTextStyle}
                    buttonStyle={styles.cancelBtnStyle}
                    disabled={this.props.buttonState}
                    handleSubmit={this.cancelBtnAction} />
                </View>
              </View>
            </View>
          </View>
        </Modal>
        <View style={styles.commentWrapper}>
          <Text style={styles.actionLabel}>Add Comment</Text>
          <View style={styles.commentView}>
            <TextInput
              returnKeyType="done"
              style={{ height: 80 }}
              textAlignVertical="top"
              numberOfLines={4}
              editable={leadResponse && !leadResponse.is_lost}
              onChangeText={text => this.setState({ comment: text, dirty: false })}
              value={this.state.comment}
              underlineColorAndroid="transparent" />
          </View>
        </View>
        <View style={styles.moveToWrapper}>
          <Text style={styles.actionLabel}>Move To</Text>
          {this.renderCategories()}
        </View>
        {(categoryIndex === 4) && this.renderReasons()}
        {
          (categoryIndex !== 4) && (
            (leadResponse && leadResponse.follow_up && leadResponse.follow_up.length > 0)
              ? (
                <View style={styles.followUpDateView}>
                  <View style={styles.dateView}>
                    <Text style={styles.actionLabel}>Date & Time: </Text>
                    <Text style={[styles.actionLabel, { marginLeft: 10 }]}>
                      {
                        (leadResponse && leadResponse.follow_up && leadResponse.follow_up.length > 0
                          && leadResponse.follow_up[0].follow_up_at)
                        && moment(leadResponse.follow_up[0].follow_up_at).utc('+5:30').format('DD MMM, YYYY  LT')
                      }
                    </Text>
                  </View>
                  <View style={styles.followUpDone}>
                    <Text style={[styles.actionLabel, { marginRight: 10 }]}>Follow Up Done</Text>
                    {

                      <TouchableOpacity onPress={() => {
                        this.setState({ modalVisible: true, folloupComment: '' }, () => {
                          // Alert.alert(
                          //   '',
                          //   'Do you want to close the existing Follow Up?',
                          //   [
                          //     {
                          //       text: 'Ok',
                          //       onPress: () => {
                          //         this.handleConfirmFollowUp();
                          //       }
                          //     },
                          //     {
                          //       text: 'Cancel',
                          //       onPress: () => { this.setState({ followUpDone: false }); },
                          //       style: 'cancel'
                          //     }
                          //   ],
                          //   { cancelable: false }
                          // );
                        });
                      }}>
                        {
                          (this.state.followUpDone)
                            ? <Image source={selectedIcon} style={{ width: 15, height: 15 }} resizeMode="contain" />
                            : <Image source={unselectedIcon} style={{ width: 15, height: 15 }} resizeMode="contain" />
                        }
                      </TouchableOpacity>
                    }
                  </View>
                </View>
              )
              : (
                <View style={styles.scheduleFollowView}>
                  {
                    isMobileNumberAvailable
                    && (leadResponse && leadResponse.follow_up && leadResponse.follow_up.length === 0)
                    && (
                      <View style={styles.newScheduleView}>
                        <Text style={[styles.actionLabel, { marginRight: 10 }]}>Schedule Follow Up?</Text>
                        <Switch
                          onValueChange={this.onFollowUpSwitch}
                          value={this.state.scheduleFollowUp}
                          thumbTintColor="#f2f2f2"
                          onTintColor="#6fc511" />
                      </View>
                    )
                  }
                  {(this.state.scheduleFollowUp)
                    && (
                      <View style={styles.dateTimeView}>
                        <TouchableOpacity style={{ flexDirection: 'row' }} onPress={() => { this.handleDatePicker(); }}>
                          <Text style={[styles.actionLabel, {
                            marginRight: 10,
                            elevation: 2,
                            backgroundColor: '#f2f2f2',
                            margin: 2,
                            paddingHorizontal: 10,
                            paddingVertical: 2,
                            color: '#4a4a4a',
                            borderRadius: 2
                          }]}>
                            Select Date
                      </Text>
                        </TouchableOpacity>
                        <Text style={[styles.actionLabel, { marginRight: 10, width: 90 }]}>{this.state.date}</Text>
                        <TouchableOpacity style={{ flexDirection: 'row' }} onPress={() => { this.handleTimePicker(); }}>
                          <Text style={[styles.actionLabel, {
                            marginRight: 10,
                            elevation: 2,
                            backgroundColor: '#f2f2f2',
                            margin: 2,
                            borderRadius: 2,
                            paddingHorizontal: 10,
                            paddingVertical: 2,
                            color: '#4a4a4a'
                          }]}>
                            Select Time
                      </Text>
                        </TouchableOpacity>
                        <Text style={[styles.actionLabel, { marginRight: 10, width: 90 }]}>{this.state.time}</Text>
                      </View>
                    )
                  }
                </View>
              )
          )
        }
        {
          leadResponse && !leadResponse.is_lost
          && (
            <View style={{ alignItems: 'flex-end', marginRight: 20, marginTop: 20 }}>
              <TouchableOpacity
                disabled={this.state.dirty || this.props.buttonState}
                onPress={this.handleDoneClick}>
                <LinearGradient
                  colors={['#f79426', '#f16537']}
                  start={{ x: 0.0, y: 0.0 }}
                  end={{ x: 1.0, y: 1.0 }}>
                  <Text style={{
                    paddingHorizontal: 15,
                    paddingVertical: 5,
                    color: 'white',
                    fontFamily: 'SourceSansPro-Bold',
                    fontSize: 14
                  }}>
                    DONE
                </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )
        }
        <View>
          <Text style={styles.activityText}>
            Activities
          </Text>
          {!this.props.loading
            && (this.state.leadActivitiesResponse.length > 0)
            ? (
              <View style={{ marginTop: 30 }}>
                <Timeline
                  style={styles.list}
                  data={this.state.leadActivitiesResponse}
                  circleColor="#cdd7d7"
                  lineColor="#cdd7d7"
                  renderDetail={this.renderDetail}
                  renderTime={this.renderTime}
                />
              </View>
            )
            : <Text style={[styles.actionLabel, { alignSelf: 'center' }]}>No activities available</Text>
          }
        </View>
      </ScrollView>
    );
  }
}
