/**
 * The Team Performance Component renders the team member's
 * performance card in Home Dashboard.
 */
import React, { Component } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import {
  Text, View, TouchableOpacity, FlatList
} from 'react-native';
import Dimensions from 'Dimensions';
import FlexAnimate from '../../components/animated/FlexAnimate';
import SpringView from '../../components/animated/SpringView';
import teamPerformanceCardStyles from './temPerformanceStyles';
import { currencyFormatter } from '../../utils/validations';
// Variables
import variable from '../../theme/variables';

const DEVICE_WIDTH = Dimensions.get('screen').width;

@connect(state => ({
  isSideNavOpen: state.global.isSideNavOpen,
  currentUser: state.user.currentUser
}), null)
class TeamPerformance extends Component {
  static propTypes = {
    navigation: PropTypes.object.isRequired,
    teamMembers: PropTypes.array.isRequired,
    onManageTeamClick: PropTypes.func.isRequired,
    onEditTargetClick: PropTypes.func.isRequired,
    isSideNavOpen: PropTypes.bool.isRequired,
    style: PropTypes.object.isRequired,
    enableTargetEdit: PropTypes.bool.isRequired,
    currentUser: PropTypes.object.isRequired
  }

  constructor(props) {
    super(props);
    this.state = {
    };
  }

  onCreateNewLeadClicked = () => {
    const {
      navigate
    } = this.props.navigation;
    navigate('CreateNewLead');
  }

  onTeamMemberClick = item => {
    const { navigate } = this.props.navigation;
    navigate('SearchLead', { isFilterOpen: false, ownerId: item.userId });
  }

  getTeamMembers = teamMembers => {
    const { currentUser } = this.props;
    const teamMembersWithoutDealer = [];
    teamMembers.forEach(teamMember => {
      if (!(teamMember.userId === currentUser && currentUser.user.id
        && currentUser.role === 'DEALER_MANAGER')) {
        teamMembersWithoutDealer.push(teamMember);
      }
    });
    return teamMembersWithoutDealer;
  }

  renderTeamDetailCard = teamDetail => {
    const { isSideNavOpen } = this.props;
    const maxWidth = (DEVICE_WIDTH - (isSideNavOpen ? 160 : 100)) / 3;
    const targetSoldPercentage = (teamDetail.monthlyUnitsInvoiced && teamDetail.monthlyUnitTarget > 0
      ? (((teamDetail.monthlyUnitsInvoiced / teamDetail.monthlyUnitTarget) * 100) / 10).toFixed(1) : 0);
    const colors = [
      ['#5a35da', '#475fdd'],
      ['#0ac7c4', '#51deb7'],
      ['green', 'yellowgreen'],
      ['#ef563c', '#f3842d']
    ];
    const [colorZero] = colors;
    const activeGradientColor = colorZero;
    /** if (targetSoldPercentage >= 10) {
      activeGradientColor = colorThree;
    } else if (targetSoldPercentage >= 9) {
      activeGradientColor = colorTwo;
    } else if (targetSoldPercentage >= 8) {
      activeGradientColor = colorOne;
    } else if (targetSoldPercentage >= 5) {
      activeGradientColor = colorZero;
    }* */

    return (
      <TouchableOpacity
        onPress={() => this.onTeamMemberClick(teamDetail)}
        style={[teamPerformanceCardStyles.container, {
          maxWidth
        }]}>
        <View style={teamPerformanceCardStyles.headerStyle}>
          <View style={teamPerformanceCardStyles.userImageStyle}>
            <Text style={teamPerformanceCardStyles.userImageText}>
              {
                teamDetail.user && teamDetail.user.user_role.length > 0
                  // eslint-disable-next-line
                  ? `${teamDetail.user.user_role[0].role.name.split('')[0].toUpperCase()}${teamDetail.user.user_role[0].role.name.split('_')[1].split('')[0].toUpperCase()}`
                  : 'NA'}
            </Text>
          </View>
        </View>
        <View style={teamPerformanceCardStyles.nameContainer}>
          <Text
            ellipsizeMode="tail"
            numberOfLines={1}
            style={[teamPerformanceCardStyles.nameStyle]}>
            {teamDetail.name.toUpperCase()}
          </Text>
          <View style={[teamPerformanceCardStyles.activeUser, { display: 'none' }]} />
        </View>
        <View style={teamPerformanceCardStyles.followUpContainer}>
          <Text style={teamPerformanceCardStyles.followUpText}>Follow Up</Text>
          <Text style={teamPerformanceCardStyles.followUpDoneText}>
            {teamDetail.followupDone}
            <Text style={teamPerformanceCardStyles.followUpTarget}>
/
              {teamDetail.target}
            </Text>
          </Text>
        </View>
        <View style={[teamPerformanceCardStyles.dealerTargetPillContainer]}>
          {
            teamDetail.new
            && (
            <View style={[teamPerformanceCardStyles.dealerTargetPillContent, { backgroundColor: variable.fresh }]}>
              <Text style={teamPerformanceCardStyles.dealerTargetPillContentLabel}>New</Text>
              <Text style={teamPerformanceCardStyles.dealerTargetPillContentValue}>{teamDetail.new}</Text>
            </View>
            )
          }
          {
            teamDetail.hot
            && (
            <View style={[teamPerformanceCardStyles.dealerTargetPillContent, { backgroundColor: variable.hot }]}>
              <Text style={teamPerformanceCardStyles.dealerTargetPillContentLabel}>Hot</Text>
              <Text style={teamPerformanceCardStyles.dealerTargetPillContentValue}>{teamDetail.hot}</Text>
            </View>
            )
          }
          {
            teamDetail.warm
            && (
            <View style={[teamPerformanceCardStyles.dealerTargetPillContent, { backgroundColor: variable.warm }]}>
              <Text style={teamPerformanceCardStyles.dealerTargetPillContentLabel}>Warm</Text>
              <Text style={teamPerformanceCardStyles.dealerTargetPillContentValue}>{teamDetail.warm}</Text>
            </View>
            )
          }
          {
            teamDetail.cold
            && (
            <View style={[teamPerformanceCardStyles.dealerTargetPillContent, { backgroundColor: variable.cold }]}>
              <Text style={teamPerformanceCardStyles.dealerTargetPillContentLabel}>Cold</Text>
              <Text style={teamPerformanceCardStyles.dealerTargetPillContentValue}>{teamDetail.cold}</Text>
            </View>
            )
          }
        </View>
        <View style={teamPerformanceCardStyles.newLeadsContainer}>
          <Text style={teamPerformanceCardStyles.newLeadsLabel}>
New Leads
          </Text>
          <Text style={teamPerformanceCardStyles.newLeadsValue}>
            {teamDetail.newLeads}
          </Text>
        </View>
        <View style={teamPerformanceCardStyles.monthlyUnitsContainer}>
          <Text style={teamPerformanceCardStyles.monthlyUnitsLabel}>Incentive</Text>
          <Text style={teamPerformanceCardStyles.monthlyUnitsValue}>
            {currencyFormatter(`${teamDetail.monthlyIncentives}` || '0')}
          </Text>
        </View>
        <View style={teamPerformanceCardStyles.monthlyUnitsContainer}>
          <Text style={teamPerformanceCardStyles.monthlyUnitsLabel}>Monthly Units Invoiced</Text>
          <Text style={teamPerformanceCardStyles.monthlyUnitsValue}>
            {teamDetail.monthlyUnitsInvoiced}
            <Text style={teamPerformanceCardStyles.monthlyUnitsTagetValue}>
/
              {teamDetail.monthlyUnitTarget}
            </Text>
          </Text>
        </View>
        <View style={teamPerformanceCardStyles.monthlyUnitsPerformance}>
          <FlexAnimate
            duration={1000}
            flexValue={targetSoldPercentage / 10}>
            <LinearGradient
              colors={activeGradientColor}
              start={{ x: 0.0, y: 0.0 }}
              end={{ x: 1.0, y: 1.0 }}
              style={[teamPerformanceCardStyles.monthlyUnitsPerformanceGradient, {
                borderTopRightRadius: teamDetail.monthlyUnitsInvoiced < teamDetail.monthlyUnitTarget
                  ? 0 : 4,
                borderBottomRightRadius: teamDetail.monthlyUnitsInvoiced < teamDetail.monthlyUnitTarget
                  ? 0 : 4
              }]}>
              <TouchableOpacity
                onPress={() => { }}
                style={{ alignItems: 'center' }}>
                <Text style={{
                  position: 'absolute', color: 'white', fontSize: 10, justifyContent: 'center'
                }}>
                  {targetSoldPercentage ? `${targetSoldPercentage * 10}%` : ''}
                </Text>
              </TouchableOpacity>
            </LinearGradient>
          </FlexAnimate>
        </View>
      </TouchableOpacity>
    );
  }

  render() {
    const teamMembers = this.getTeamMembers(this.props.teamMembers);
    return (
      <View style={[{
        margin: 20,
      }, this.props.style]}>
        <View style={{
          height: 50, justifyContent: 'space-between', flexDirection: 'row'
        }}>
          <Text style={teamPerformanceCardStyles.teamPerformance}>
Your Team's Performance: Today
          </Text>
          <View style={{ flex: 3, flexDirection: 'row' }}>
            <View style={{
              flex: 1,
              opacity: this.props.enableTargetEdit ? 1 : 0,
              borderRadius: 4,
            }}>
              <SpringView
                fadeIn={false}
                duration={1000}
                springValue={0.9}
                style={teamPerformanceCardStyles.teamPerformanceSpringButton}>
                <TouchableOpacity
                  activeOpacity={0.5}
                  style={{ alignItems: 'center' }}
                  onPress={() => { if (this.props.enableTargetEdit) this.props.onEditTargetClick(); }}>
                  <LinearGradient
                    colors={['#ef5842', '#f05b3c', '#f16636', '#f37632', '#f3842b']}
                    start={{ x: 0.0, y: 1.0 }}
                    end={{ x: 1.0, y: 1.0 }}
                    style={{ alignItems: 'center', justifyContent: 'center', borderRadius: 5 }}>
                    <View style={teamPerformanceCardStyles.teamPerformanceEditTargetLinearButton}>
                      <View style={{ flex: 7, justifyContent: 'center' }}>
                        <Text style={{ color: 'white', paddingLeft: 20, fontSize: 15 }}>
                          Edit Targets
                        </Text>
                      </View>
                      <View style={{ flex: 2, justifyContent: 'center' }}>
                        <Text style={{ color: 'white', fontSize: 20 }}>></Text>
                      </View>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              </SpringView>
            </View>
            <View style={{ flex: 1, borderRadius: 4 }}>
              <SpringView
                fadeIn={false}
                duration={1000}
                springValue={0.9}
                style={teamPerformanceCardStyles.teamPerformanceSpringButton}>
                <TouchableOpacity
                  activeOpacity={0.5}
                  style={{ alignItems: 'center' }}
                  onPress={this.props.onManageTeamClick}>
                  <LinearGradient
                    colors={['#00FFFF', '#17C8FF', '#329BFF', '#4C64FF', '#6536FF', '#8000FF']}
                    start={{ x: 0.0, y: 1.0 }}
                    end={{ x: 1.0, y: 1.0 }}
                    style={{ alignItems: 'center', justifyContent: 'center', borderRadius: 5 }}>
                    <View style={teamPerformanceCardStyles.teamPerformanceEditLinearButton}>
                      <View style={{ flex: 7, justifyContent: 'center' }}>
                        <Text style={{ color: '#4C64FF', paddingLeft: 10, fontSize: 15 }}>
                          Manage Team
                        </Text>
                      </View>
                      <View style={{ flex: 2, justifyContent: 'center' }}>
                        <Text style={{ color: '#4C64FF', fontSize: 20 }}>></Text>
                      </View>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              </SpringView>
            </View>
          </View>
        </View>
        <View style={{ marginTop: 10 }}>
          {
            teamMembers && teamMembers.length > 0
              ? (
                <FlatList
                  data={teamMembers}
                  renderItem={({ item }) => this.renderTeamDetailCard(item)}
                  keyExtractor={item => item.id}
                  horizontal={false}
                  numColumns={3}
                  extraData={this.props.isSideNavOpen}
              />
              )
              : (
                <View style={{ flex: 1, justifyContent: 'center' }}>
                  <Text style={{ color: '#494949', fontSize: 13, alignSelf: 'center' }}>No TeamMember found</Text>
                </View>
              )
          }
        </View>
      </View>
    );
  }
}

export default TeamPerformance;
