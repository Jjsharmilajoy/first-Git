/**
 * This Component renders the Team member table. The Dealer manager can add or
 * remove team member.
 */
import React, { Component, Fragment } from 'react';
import {
  View,
  Text,
  Modal,
  Image,
  TouchableOpacity,
  Picker,
  Alert,
  FlatList
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import UserInput from '../../components/userInput/UserInput';
import close from '../../assets/images/close.png';
import { emailValidator, mobileNumberValidator, isAlphaOnly } from '../../utils/validations';
import { GradientButtonLarge, ButtonWithLeftImage, GradientButtonWithIcon } from '../../components/button/Button';
import teamMemberStyles from '../TeamMember/teamMemberStyles';
import editIcon from '../../assets/images/edit.png';
import sendIcon from '../../assets/images/send.png';
import deleteIcon from '../../assets/images/delete.png';
import AppHeader from '../../components/header/Header';
import Loader from '../../components/loader/Loader';
import resendIcon from '../../assets/images/ic_resend.png';
import styles from './MyTeamStyles';
import { homeDashboardHeaderStyles } from '../HomeDashboard/homeDashboardStyles';
import constants from '../../utils/constants';
import getTeam from '../../redux/actions/MyTeam/actionCreators';
import {
  createSalesHead,
  createSalesMember,
  sendCredential,
  resendCredential,
  getDirectReportingMember,
  deleteTeamMember,
  editTeamMember,
  editTeamHead
} from '../../redux/actions/TeamMembers/actionCreators';

@connect(
  state => ({
    currentUser: state.user.currentUser,
    team: state.myTeam.team,
    loading: state.myTeam.loadingGroup,
    directReportingMembers: state.teamMember.directReportingMembers
  }),
  {
    createSalesMember,
    getTeam,
    getDirectReportingMember,
    createSalesHead,
    sendCredential,
    resendCredential,
    deleteTeamMember,
    editTeamMember,
    editTeamHead
  }
)
export default class MyTeam extends Component {
  static propTypes = {
    getTeam: PropTypes.func.isRequired,
    team: PropTypes.array,
    createSalesMember: PropTypes.func.isRequired,
    getDirectReportingMember: PropTypes.func.isRequired,
    directReportingMembers: PropTypes.array,
    createSalesHead: PropTypes.func.isRequired,
    loading: PropTypes.bool.isRequired,
    deleteTeamMember: PropTypes.func.isRequired,
    sendCredential: PropTypes.func.isRequired,
    editTeamMember: PropTypes.func.isRequired,
    editTeamHead: PropTypes.func.isRequired,
    navigation: PropTypes.object.isRequired,
    currentUser: PropTypes.object.isRequired
  }

  static defaultProps = {
    team: [],
    directReportingMembers: [],
  }

  static getDerivedStateFromProps(nextProps) {
    const { team, currentUser } = nextProps;
    if (team && currentUser) {
      return {
        teamLeads: nextProps.directReportingMembers,
        role: currentUser.role,
        data: team,
        loggedInUserId: currentUser.user ? currentUser.user.id : ''
      };
    }
    return null;
  }

  constructor(props) {
    super(props);
    this.state = ({
      disableCreateTeamMemberBtn: false,
      role: '',
      defaultRole: '',
      selectedLeadIndex: 0,
      modalVisible: false,
      currentSortBy: '',
      data: [],
      currentId: '',
      teamLeads: [],
      modifyFlatList: false,
      selectedRole: '',
      loggedInUserId: '',
      firstname: '',
      lastname: '',
      mobileNumber: '',
      contactNumber: '',
      email: '',
      isEdit: false,
      selectedLead: '',
      userEditObject: {},
      toggle: false,
      emailError: false,
      mobileNumberError: false,
      contactNumberError: false,
      firstNameError: false,
      lastNameError: false,
      currentLeadManager: '',
      roleError: false,
      pickerClicked: false
    });
  }

  componentDidMount() {
    const { currentUser } = this.props;
    if (currentUser && Object.keys('currentUser').length > 0) {
      const { dealerId } = currentUser;
      if (dealerId) {
        this.props.getTeam(dealerId).catch(err => { console.log(err); });
      }
    }
  }

  onModalShow = () => {
    const { currentUser } = this.props;
    if (currentUser) {
      const { dealerId } = currentUser;
      if (dealerId) {
        this.props.getDirectReportingMember(dealerId)
          .then(() => {
            this.setState({
              teamLeads: this.props.directReportingMembers
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
    }
  }

  getRole = role => {
    if (role && role.length > 0) {
      if (role && role[0].role && role[0].role.name === 'DEALER_TEAM_HEAD') {
        return 'Team Leader';
      } if (role && role[0].role && role[0].role.name === 'DEALER_SALES') {
        return 'Sales Executive';
      } if (role && role[0].role && role[0].role.name === 'DEALER_MANAGER') {
        return 'Dealer Manager';
      }
      return 'NA';
    }
  }

  getSelectTeamLeadView = () => (
    <Fragment>
      <View style={{ flexDirection: 'row', marginTop: 14 }}>
        <Text style={teamMemberStyles.nameText}>Select Team Lead</Text>
        <Text style={teamMemberStyles.requiredStyle}>*</Text>
      </View>
      <View style={teamMemberStyles.nameInput}>
        <Picker
          mode="dropdown"
          selectedValue={this.state.selectedLead}
          onValueChange={(item, index) => {
            this.setState({ selectedLead: item, selectedLeadIndex: index, pickerClicked: true });
          }
          }
        >
          {
            this.state.teamLeads.map(item => (
              <Picker.Item label={item.first_name} value={item.first_name} key={item.id} />
            ))
          }
        </Picker>
      </View>
    </Fragment>
  )

  getTeamLeadDetails = () => {
    const { currentUser } = this.props;
    if (currentUser) {
      const { dealerId } = currentUser;
      if (dealerId) {
        this.props.getDirectReportingMember(dealerId)
          .then(() => {
            // On Edit action
            if (this.state.isEdit) {
              // Checking whether this Team Head has been assigned to any other executive
              const headIndex = this.state.data.findIndex(eachUser => this.state.currentId === eachUser.manager_id);
              // If Team head doesnot have any executive under him
              if (headIndex === -1) {
                if (this.state.teamLeads.length === 1 && this.state.defaultRole === 'Team Leader') {
                  this.setState({
                    selectedRole: 'Team Leader',
                    teamLeads: this.state.teamLeads,
                    roleError: false,
                    toggle: true
                  });
                } else {
                  const index = this.state.teamLeads.findIndex(eachLead => eachLead.id === this.state.currentId);
                  if (index !== -1) {
                    this.state.teamLeads.splice(index, 1);
                  }
                  this.setState({
                    selectedRole: 'Sales Executive',
                    teamLeads: this.state.teamLeads,
                    roleError: false,
                    toggle: true
                  });
                }
                // If Team head has some executive under him
              } else {
                Alert.alert(
                  '',
                  'Please reassign the executives of this head to any other head before changing him as executive.',
                  [
                    { text: 'OK', onPress: () => { } },
                  ],
                  { cancelable: false }
                );
                this.setState({
                  selectedRole: 'Team Leader',
                  teamLeads: this.state.teamLeads,
                  roleError: false,
                  toggle: true
                });
              }
              // On Create action
            } else if (!this.state.isEdit) {
              if (this.state.teamLeads && this.state.teamLeads.length !== 0) {
                this.setState({
                  selectedRole: 'Sales Executive',
                  teamLeads: this.state.teamLeads,
                  roleError: false,
                  toggle: true
                });
              } else if (this.state.teamLeads && this.state.teamLeads.length === 0) {
                this.setState({
                  selectedRole: 'Team Leader',
                  // teamLeads: this.state.teamLeads,
                  roleError: false,
                  toggle: true
                });
              }
            }
          }).catch(() => { });
      }
    }
  }

  getSelectRoleView = () => (
    <Fragment>
      <View style={{ flexDirection: 'row' }}>
        <Text style={teamMemberStyles.nameText}>Select Role</Text>
        <Text style={teamMemberStyles.requiredStyle}>*</Text>
      </View>
      <View style={teamMemberStyles.roleTouchWrapper}>

        <TouchableOpacity
          disabled={!this.state.teamLeads.length > 0}
          onPress={() => this.getTeamLeadDetails()}
        >
          <View style={this.state.selectedRole === 'Sales Executive'
            ? teamMemberStyles.activatedRoleStyle : teamMemberStyles.normalRoleStyle
          }
          >
            <Text style={this.state.selectedRole === 'Sales Executive'
              ? teamMemberStyles.roleActivatedTextColor : teamMemberStyles.roleText}>
              Sales Executive
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => {
          this.setState({
            selectedRole: 'Team Leader',
            roleError: false,
            toggle: true
          });
        }}
        >
          <View style={
            this.state.selectedRole === 'Team Leader'
              ? teamMemberStyles.activatedRoleStyle : teamMemberStyles.normalRoleStyle}
          >
            <Text style={this.state.selectedRole === 'Team Leader'
              ? teamMemberStyles.roleActivatedTextColor : teamMemberStyles.roleText}>
Team Leader
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </Fragment>
  )

  handleOnInputChange = (param, value) => {
    if (param === 'firstname') {
      this.setState({ firstname: value, firstNameError: !isAlphaOnly(value), disableCreateTeamMemberBtn: false });
    } else if (param === 'email') {
      this.setState({ email: value, emailError: false, disableCreateTeamMemberBtn: false });
    } else if (param === 'mobileNumber') {
      this.setState({ mobileNumber: value, mobileNumberError: false, disableCreateTeamMemberBtn: false });
    } else if (param === 'lastname') {
      this.setState({ lastname: value, disableCreateTeamMemberBtn: false, lastNameError: value !== '' && !isAlphaOnly(value) });
    } else if (param === 'contactNumber') {
      this.setState({ contactNumber: value, contactNumberError: false, disableCreateTeamMemberBtn: false });
    }
  }

  editValue = member => {
    const item = {
      ...member
    };
    this.setState({
      firstname: item.first_name,
      lastname: item.last_name,
      email: item.email,
      currentId: item.id,
      defaultRole: this.getRole(item.user_role),
      selectedRole: this.getRole(item.user_role),
      selectedLead: item.manager ? item.manager.first_name : this.props.directReportingMembers[0].first_name,
      currentLeadManager: item.manager_id,
      mobileNumber: item.mobile_no,
      contactNumber: item.official_contact_number,
      modalVisible: true,
      isEdit: true,
      userEditObject: item,
      emailError: false,
      mobileNumberError: false,
      contactNumberError: false,
      disableCreateTeamMemberBtn: false,
      firstNameError: false,
      lastNameError: false,
      roleError: false
    });
  }

  _keyExtractor = item => item.id;

  sendCredentialsView = (item, index) => (
    item.is_credential_send
      ? (
        <View style={teamMemberStyles.flexDirectionRow}>
          <ButtonWithLeftImage
            title="RESEND"
            style={teamMemberStyles.resendButton}
            handleSubmit={() => {
              this.sendCredential(item, index);
            }
          }
            image={resendIcon}
            textStyle={teamMemberStyles.sendCredentialsText}
        />
        </View>
      )
      : (
        <View style={teamMemberStyles.flexDirectionRow}>
          <ButtonWithLeftImage
            title="Send Credentials"
            style={teamMemberStyles.sendCredentialsBtn}
            handleSubmit={() => {
              this.sendCredential(item, index);
            }
          }
            image={sendIcon}
            textStyle={teamMemberStyles.sendCredentialsText}
        />
        </View>
      )
  );

  sendCredential = (user, index) => {
    if (user.email !== '' && emailValidator(user.email)) {
      if (this.props.currentUser && this.props.currentUser.dealerId) {
        return this.props.sendCredential(this.props.currentUser.dealerId, user.id, user)
          .then(() => this.props.getTeam(this.props.currentUser.dealerId)).then(() => {
            this.props.team[index].is_credential_send = true;
            this.setState({
              data: this.props.team,
              modifyFlatList: !this.state.modifyFlatList
            });
          }).catch(() => { });
      }
    }
    Alert.alert(
      '',
      'Please add Email to send credentials',
      [
        { text: 'Okay', onPress: () => { } }
      ],
      { cancelable: false }
    );
  }

  validate = () => {
    let isEmailError = false;
    let isMobileNumberError = false;
    let isContactNumberError = false;
    let isNameError = false;
    let isLastNameError = false;
    let isRoleError = false;
    if (!emailValidator(this.state.email)) {
      isEmailError = true;
    }
    if (!mobileNumberValidator(this.state.mobileNumber)) {
      isMobileNumberError = true;
    }
    if (!mobileNumberValidator(this.state.contactNumber)) {
      isContactNumberError = true;
    }
    if (this.state.firstname === '' || !(isAlphaOnly(this.state.firstname))) {
      isNameError = true;
    }
    if (this.state.lastname !== '' && !(isAlphaOnly(this.state.lastname))) {
      isLastNameError = true;
    }
    if (this.state.selectedRole === '') {
      isRoleError = true;
    }
    this.setState({
      emailError: isEmailError,
      mobileNumberError: isMobileNumberError,
      contactNumberError: isContactNumberError,
      firstNameError: isNameError,
      // lastNameError: this.state.lastname.length > 0 ? isAlphaOnly(this.state.lastname) : false,
      lastNameError: isLastNameError,
      roleError: isRoleError
    });
    if (!isEmailError && !isMobileNumberError && !isContactNumberError && !isNameError && !isRoleError) {
      return true;
    }
  }

  createTeamMember = () => {
    if (this.validate()) {
      this.setState({
        disableCreateTeamMemberBtn: true
      });
      let userID = '';
      let leadId;
      if (this.props.currentUser && this.props.currentUser.userId) {
        // const { userId } = value;
        userID = this.props.currentUser.userId;
        let createTeamObj = {};
        if (this.state.selectedRole === 'Sales Executive') {
          if (this.state.teamLeads[this.state.selectedLeadIndex] === undefined) {
            leadId = this.state.teamLeads[0].id;
          } else {
            leadId = this.state.teamLeads[this.state.selectedLeadIndex].id;
          }
          createTeamObj = {
            first_name: this.state.firstname,
            last_name: this.state.lastname,
            email: this.state.email,
            mobile_no: this.state.mobileNumber,
            official_contact_number: this.state.contactNumber,
            manager_id: leadId,
            user_type_id: this.props.currentUser.dealerId,
          };
          return this.props.createSalesMember(this.props.currentUser.dealerId, createTeamObj)
            .then(() => this.props.getTeam(this.props.currentUser.dealerId)).then(() => {
              this.setState({
                firstname: '',
                lastname: '',
                modalVisible: false,
                pickerClicked: false,
                toggle: false,
                disableCreateTeamMemberBtn: false,
                data: this.props.team,
                modifyFlatList: !this.state.modifyFlatList
              });
            })
            .catch(error => {
              if (error && error.err && !error.err.message.includes('invalidaccesstoken')) {
                Alert.alert(
                  'Message',
                  error && error.err ? error.err.message : '',
                  [
                    {
                      text: 'OK',
                      onPress: () => {
                        this.setState({
                          disableCreateTeamMemberBtn: false
                        });
                      }
                    },
                  ],
                  { cancelable: false }
                );
              }
            });
        } if (this.state.selectedRole === 'Team Leader') {
          createTeamObj = {
            first_name: this.state.firstname,
            last_name: this.state.lastname,
            email: this.state.email,
            mobile_no: this.state.mobileNumber,
            official_contact_number: this.state.contactNumber,
            manager_id: userID,
            user_type_id: this.props.currentUser.dealerId
          };
          return this.props.createSalesHead(this.props.currentUser.dealerId, createTeamObj)
            .then(() => this.props.getTeam(this.props.currentUser.dealerId)).then(() => {
              this.setState({
                firstname: '',
                lastname: '',
                modalVisible: false,
                disableCreateTeamMemberBtn: false,
                pickerClicked: false,
                toggle: false,
                data: this.props.team,
                modifyFlatList: !this.state.modifyFlatList
              });
            })
            .catch(error => {
              if (error && error.err && !error.err.message.includes('invalidaccesstoken')) {
                Alert.alert(
                  'Message',
                  error && error.err ? error.err.message : '',
                  [
                    {
                      text: 'OK',
                      onPress: () => {
                        this.setState({
                          disableCreateTeamMemberBtn: false
                        });
                      }
                    },
                  ],
                  { cancelable: false }
                );
              }
            });
        }
      }
    }
  }

  editSalesMember = () => {
    this.setState({
      disableCreateTeamMemberBtn: true
    });
    let leadId;
    if (
      this.state.pickerClicked === false
      && this.state.selectedRole === 'Sales Executive'
      && this.state.toggle === false
    ) {
      leadId = this.state.currentLeadManager;
    } else if (
      this.state.pickerClicked === false
      && this.state.selectedRole === 'Sales Executive'
      && this.state.toggle === true
    ) {
      leadId = this.state.teamLeads[0].id;
    } else if (
      this.state.pickerClicked === true
      && this.state.selectedRole === 'Sales Executive'
    ) {
      leadId = this.state.teamLeads[this.state.selectedLeadIndex].id;
    }
    let isEmailError = false;
    let isMobileNumberError = false;
    let isContactNumberError = false;
    let isNameError = false;
    let lastNameError = false;
    if (!emailValidator(this.state.email)) {
      isEmailError = true;
    }
    if (!mobileNumberValidator(this.state.mobileNumber)) {
      isMobileNumberError = true;
    }
    if (!mobileNumberValidator(this.state.contactNumber)) {
      isContactNumberError = true;
    }
    if (this.state.firstname === '' || !(isAlphaOnly(this.state.firstname))) {
      isNameError = true;
    }
    if (this.state.lastname !== '' && !(isAlphaOnly(this.state.lastname))) {
      lastNameError = true;
    }
    if (!isNameError && !lastNameError && !isContactNumberError && emailValidator(this.state.email)
      && !isMobileNumberError && this.state.firstname.length > 0) {
      const editData = this.state.userEditObject;
      editData.first_name = this.state.firstname;
      editData.last_name = this.state.lastname;
      editData.email = this.state.email;
      editData.mobile_no = this.state.mobileNumber;
      editData.official_contact_number = this.state.contactNumber;
      editData.manager_id = leadId;
      if (editData.manager) {
        delete editData.manager;
      }
      if (editData.role) {
        delete editData.role;
      }
      if (editData.user_role) {
        delete editData.user_role;
      }
      if (this.state.selectedRole === 'Team Leader') {
        editData.manager_id = this.state.loggedInUserId;
        if (this.props.currentUser && this.props.currentUser.dealerId) {
          return this.props.editTeamHead(editData.id, editData)
            .then(() => this.props.getTeam(this.props.currentUser.dealerId)).then(() => {
              this.setState({
                pickerClicked: false,
                toggle: false,
                data: this.props.team,
                modifyFlatList: !this.state.modifyFlatList,
                disableCreateTeamMemberBtn: false,
                modalVisible: false,
                currentSortBy: ''
              });
            })
            .catch(error => {
              if (error && error.err && !error.err.message.includes('invalidaccesstoken')) {
                Alert.alert(
                  '',
                  error && error.err ? error.err.message : '',
                  [
                    {
                      text: 'OK',
                      onPress: () => {
                        this.setState({
                          disableCreateTeamMemberBtn: false
                        });
                      }
                    },
                  ],
                  { cancelable: false }
                );
              }
            });
        }
      } else if (this.state.role !== 'DEALER_MANAGER') {
        editData.manager_id = this.state.loggedInUserId;
      }
      return this.props.editTeamMember(editData.id, editData)
        .then(() => this.props.getTeam(this.props.currentUser.dealerId).catch(() => {}))
        .then(() => {
          this.setState({
            pickerClicked: false,
            data: this.props.team,
            toggle: false,
            modifyFlatList: !this.state.modifyFlatList,
            disableCreateTeamMemberBtn: false,
            modalVisible: false,
            currentSortBy: ''
          });
        })
        .catch(error => {
          if (error && error.err && !error.err.message.includes('invalidaccesstoken')) {
            Alert.alert(
              '',
              error && error.err ? error.err.message : '',
              [
                {
                  text: 'OK',
                  onPress: () => {
                    this.setState({
                      disableCreateTeamMemberBtn: false
                    });
                  }
                },
              ],
              { cancelable: false }
            );
          }
        });
    }
    this.setState({
      emailError: isEmailError,
      mobileNumberError: isMobileNumberError,
      contactNumberError: isContactNumberError,
      firstNameError: isNameError,
      lastNameError: this.state.lastname.length > 0 ? !isAlphaOnly(this.state.lastname) : false,
      currentSortBy: ''
    });
  }

  deleteSalesMember = (user, index) => this.props.deleteTeamMember(user.id)
    .then(() => {
      this.state.data.splice(index, 1);
      this.setState({
        data: this.state.data,
        modifyFlatList: !this.state.modifyFlatList
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

  showCards = item => {
    const { navigate } = this.props.navigation;
    navigate('SearchLead', { isFilterOpen: false, ownerId: item.id });
  }

  sortTeam = () => {
    let { currentSortBy } = this.state;
    if (this.state.data && this.state.data.length > 0) {
      if (currentSortBy === 'asc') {
        currentSortBy = 'desc';
        this.state.data.sort((a, b) => {
          if (a.first_name.toString().toLowerCase() < b.first_name.toString().toLowerCase()) {
            return -1;
          } if (a.first_name.toString().toLowerCase() < b.first_name.toString().toLowerCase()) {
            return 1;
          }
          return 0;
        });
      } else if (currentSortBy === 'desc' || currentSortBy === '') {
        currentSortBy = 'asc';
        this.state.data.sort((a, b) => {
          if (a.first_name.toString().toLowerCase() > b.first_name.toString().toLowerCase()) {
            return -1;
          } if (a.first_name.toString().toLowerCase() > b.first_name.toString().toLowerCase()) {
            return 1;
          }
          return 0;
        });
      }
    }
    this.setState({
      data: this.state.data,
      modifyFlatList: !this.state.modifyFlatList,
      currentSortBy
    });
  }

  renderHeader = () => (
    <View style={teamMemberStyles.tableHeader}>
      {
        this.state.columns.map(column => (
          <View key={column.id} style={teamMemberStyles.tableHeaderCell}>
            <Text style={teamMemberStyles.tableHeaderText}>{column.label}</Text>
          </View>
        ))
      }
    </View>
  )

  renderItem = (item, index) => (
    <View
      style={[teamMemberStyles.item, { paddingHorizontal: 15 }]}
    >
      <TouchableOpacity
        activeOpacity={0.5}
        style={[teamMemberStyles.cell, { alignItems: 'center' }]}
        onPress={() => this.showCards(item)}
      >
        <Text
          style={[teamMemberStyles.cellText,
            { borderBottomColor: '#f79426', borderBottomWidth: 1 }]}
          ellipsizeMode="tail"
          numberOfLines={1}>
          {item.first_name}
        </Text>
      </TouchableOpacity>
      <View style={teamMemberStyles.cell}>
        <Text
          style={teamMemberStyles.cellText}
          ellipsizeMode="tail"
          numberOfLines={1}>
          {this.getRole(item.user_role)}
        </Text>
      </View>
      <View style={teamMemberStyles.cell}>
        <Text
          style={teamMemberStyles.cellText}
          ellipsizeMode="tail"
          numberOfLines={1}>
          {item.manager && item.manager.first_name ? item.manager.first_name : 'NA'}
        </Text>
      </View>
      <View style={teamMemberStyles.cell}>
        <Text style={teamMemberStyles.cellText} ellipsizeMode="tail" numberOfLines={1}>{item.mobile_no}</Text>
      </View>
      <View style={teamMemberStyles.cell}>
        {this.sendCredentialsView(item, index)}
      </View>
      <View style={[teamMemberStyles.cell, teamMemberStyles.flexDirectionRow]}>
        <TouchableOpacity
          style={teamMemberStyles.editTouchWrapper}
          activeOpacity={0.5}
          onPress={() => {
            this.editValue(item, index);
          }}
        >
          <View style={teamMemberStyles.editView}>
            <Image source={editIcon} />
          </View>
        </TouchableOpacity>
        {
          this.state.role === constants.MANAGER
            ? (
              <TouchableOpacity
                style={teamMemberStyles.deleteTouchWrapper}
                activeOpacity={0.5}
                onPress={() => {
                  Alert.alert(
                    '',
                    'Do you want to delete this team member',
                    [
                      { text: 'DELETE', onPress: () => { this.deleteSalesMember(item, index); } },
                      { text: 'CANCEL', onPress: () => { }, style: 'cancel' }
                    ],
                    { cancelable: false }
                  );
                }}
            >
                <View style={teamMemberStyles.deleteView}>
                  <Image source={deleteIcon} />
                </View>
              </TouchableOpacity>
            )
            : null
        }
      </View>
    </View>
  )

  render() {
    const { disableCreateTeamMemberBtn } = this.state;
    return (
      <Fragment>
        <Loader showIndicator={this.props.loading} />
        <Fragment>
          <AppHeader navigation={this.props.navigation}>
            <View style={homeDashboardHeaderStyles.headerContainer}>
              <View style={{ flex: 1, flexDirection: 'row' }}>
                <View style={homeDashboardHeaderStyles.headerTextContent}>
                  <Text style={{ color: 'white', paddingHorizontal: 5 }}>
                    Team
                  </Text>
                </View>
                <View style={[homeDashboardHeaderStyles.headerDateContent, { display: 'none' }]}>
                  <Text style={{ color: 'white', paddingHorizontal: 5 }} />
                </View>
                <View style={{ flex: 2, flexDirection: 'row', alignItems: 'center' }} />
              </View>
            </View>
          </AppHeader>
          <View style={{
            backgroundColor: '#F2F2F2',
            flex: 1,
            margin: 10,
            padding: 10
          }}>
            {
              this.state.modalVisible
                ? (
                  <Modal
                    transparent
                    visible={this.state.modalVisible}
                    onRequestClose={() => this.setState({
                      modalVisible: false,
                      pickerClicked: false,
                      toggle: false
                    })}
                    onShow={this.onModalShow}
                >
                    <View style={teamMemberStyles.backgroundOverlay} />
                    <KeyboardAwareScrollView
                      style={teamMemberStyles.teamAddView}
                      keyboardShouldPersistTaps="always"
                  >
                      <View style={teamMemberStyles.flexOne}>
                        <View style={teamMemberStyles.addViewHeader}>
                          <Text style={teamMemberStyles.addMemberTextStyle}>
                            {this.state.isEdit
                              ? 'Edit Team Member' : 'Add Team Member'}
                          </Text>
                          <TouchableOpacity
                            onPress={() => {
                              this.setState({
                                modalVisible: false,
                                disableCreateTeamMemberBtn: false,
                                data: this.props.team,
                                modifyFlatList: !this.state.modifyFlatList
                              });
                            }}
                            style={teamMemberStyles.hideModalStyle}
                        >
                            <Image source={close} resizeMode="contain" style={teamMemberStyles.closeButton} />
                          </TouchableOpacity>
                        </View>
                        <View style={teamMemberStyles.memberInfoView}>
                          <View style={{ flexDirection: 'row' }}>
                            <Text style={teamMemberStyles.nameText}>First Name</Text>
                            <Text style={teamMemberStyles.requiredStyle}>*</Text>
                          </View>
                          <UserInput
                            containerStyle={teamMemberStyles.nameInput}
                            param="firstname"
                            placeholder="Enter First Name"
                            onChange={this.handleOnInputChange}
                            value={this.state.firstname}
                            showError={this.state.firstNameError}
                            errorTitle="Enter a valid name"
                        />
                          <View style={{ flexDirection: 'row' }}>
                            <Text style={teamMemberStyles.nameText}>Last Name</Text>
                          </View>
                          <UserInput
                            containerStyle={teamMemberStyles.nameInput}
                            param="lastname"
                            placeholder="Enter Last Name"
                            onChange={this.handleOnInputChange}
                            value={this.state.lastname}
                            showError={this.state.lastNameError}
                            errorTitle="Enter a valid name"
                        />
                          {this.state.role === constants.MANAGER ? this.getSelectRoleView() : null}
                          {
                          this.state.role === constants.MANAGER
                            && this.state.selectedRole === 'Sales Executive' && this.state.teamLeads.length > 0
                            ? this.getSelectTeamLeadView()
                            : null
                        }
                          {
                          this.state.roleError
                            ? <Text style={teamMemberStyles.errorTextStyle}>Role must be selected</Text>
                            : null
                        }
                          <View style={[teamMemberStyles.nameTextView, { marginTop: 14 }]}>
                            <Text style={teamMemberStyles.nameText}>Email ID</Text>
                            <Text style={teamMemberStyles.requiredStyle}>*</Text>
                          </View>
                          <UserInput
                            containerStyle={teamMemberStyles.nameInput}
                            param="email"
                            onChange={this.handleOnInputChange}
                            value={this.state.email}
                            placeholder="Email"
                            showError={this.state.emailError}
                            errorTitle="Enter a valid email"
                        />
                          <View style={teamMemberStyles.nameTextView}>
                            <Text style={teamMemberStyles.nameText}>Phone Number</Text>
                            <Text style={teamMemberStyles.requiredStyle}>*</Text>
                          </View>
                          <UserInput
                            boxStyle={teamMemberStyles.flexOne}
                            param="mobileNumber"
                            onChange={this.handleOnInputChange}
                            placeholder="Mobile Number"
                            keyboardType="numeric"
                            maxLength={10}
                            containerStyle={teamMemberStyles.phoneBorder}
                            value={this.state.mobileNumber.toString()}
                            showError={this.state.mobileNumberError}
                            errorTitle="Enter a valid mobile number"
                          />
                          <View style={teamMemberStyles.nameTextView}>
                            <Text style={teamMemberStyles.nameText}>Official Contact Number</Text>
                            <Text style={teamMemberStyles.requiredStyle}>*</Text>
                          </View>
                          <UserInput
                            boxStyle={teamMemberStyles.flexOne}
                            param="contactNumber"
                            onChange={this.handleOnInputChange}
                            placeholder="Official Contact Number"
                            keyboardType="numeric"
                            maxLength={10}
                            containerStyle={teamMemberStyles.phoneBorder}
                            value={this.state.contactNumber.toString()}
                            showError={this.state.contactNumberError}
                            errorTitle="Enter a valid contact number"
                          />
                          <Text style={teamMemberStyles.passwordText}>
                          The
                            {' '}
                            <Text style={teamMemberStyles.passwordBoldText}>Password</Text>
                            {' '}
                            will be sent via SMS and email to the new member.
                          </Text>
                          <View style={teamMemberStyles.modalButtonViewStyle}>
                            {
                            this.state.isEdit
                              ? (
                                <GradientButtonLarge
                                  title="Save Details"
                                  disabled={this.props.loading || disableCreateTeamMemberBtn}
                                  style={teamMemberStyles.modalButtonStyle}
                                  handleSubmit={this.editSalesMember}
                              />
                              )
                              : (
                                <GradientButtonLarge
                                  title="Add New Member"
                                  disabled={this.props.loading || disableCreateTeamMemberBtn}
                                  style={teamMemberStyles.modalButtonStyle}
                                  handleSubmit={this.createTeamMember}
                              />
                              )
                          }
                          </View>
                        </View>
                      </View>
                    </KeyboardAwareScrollView>
                  </Modal>
                )
                : null
            }
            {/* Add New Member button */}
            {
              this.state.role === constants.MANAGER
                ? (
                  <View style={styles.addButtonAlignment}>
                    {/* <SecondaryButton
                title="Add Team Member"
                iconName="user-o"
                handleSubmit={() => {
                  this.setState({
                    modalVisible: true,
                    isEdit: false,
                    name: '',
                    mobileNumber: '',
                    email: '',
                    selectedRole: '',
                    emailError: false,
                    mobileNumberError: false,
                    nameError: false,
                    roleError: false
                  });
                }}
                buttonStyle={{
                  width: 150,
                  height: 40
                }}
              /> */}
                    <GradientButtonWithIcon
                      style={styles.testRideButtonColor}
                      iconName="user-o"
                      iconColor="white"
                      handleSubmit={() => {
                        this.setState({
                          modalVisible: true,
                          isEdit: false,
                          firstname: '',
                          lastname: '',
                          mobileNumber: '',
                          contactNumber: '',
                          email: '',
                          selectedRole: '',
                          emailError: false,
                          mobileNumberError: false,
                          contactNumberError: false,
                          firstNameError: false,
                          lastNameError: false,
                          roleError: false
                        });
                      }}
                      title="Add Team Member"
                      imageStyle={styles.buttonLeftImage}
                      textStyle={styles.testRideButtonTextStyle}
                  />
                  </View>
                )
                : null
            }
            {/* table start */}
            <View style={styles.tableWrapper}>
              {/* table header   */}
              <View style={[styles.tableHeaderWrapper]}>
                <View style={styles.flexOneRow}>
                  <TouchableOpacity
                    style={{ flexDirection: 'row', alignItems: 'center' }}
                    onPress={() => this.sortTeam()}
                  >
                    <Text style={styles.textSpacing}>Name</Text>
                    <Icon
                      name={`sort${!this.state.currentSortBy ? '' : this.state.currentSortBy === 'asc'
                        ? '-desc' : '-asc'}`}
                      size={15}
                      color="#f37e2e" />
                  </TouchableOpacity>
                </View>
                <View style={[styles.flexOne]}>
                  <Text style={styles.tableHeaderTextStyle}>Role</Text>
                </View>
                <View style={[styles.flexOne]}>
                  <Text style={styles.tableHeaderTextStyle}>Reporting to</Text>
                </View>
                <View style={[styles.flexOne]}>
                  <Text style={styles.tableHeaderTextStyle}>Phone</Text>
                </View>
                <View style={[styles.flexTwo]} />
              </View>
              {/* table header end */}
              {/* table body */}
            </View>
            <View style={[teamMemberStyles.gridContainer, { marginTop: 0 }]}>
              <FlatList
                keyExtractor={this._keyExtractor}
                data={this.state.data}
                renderItem={({ item, index }) => this.renderItem(item, index)}
                extraData={this.state}
              />
            </View>
            {/* table end */}
          </View>
        </Fragment>
      </Fragment>
    );
  }
}
