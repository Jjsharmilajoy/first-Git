/**
 * The Lead FollowUp is the parent component. It renders two different
 * components Followup Today and Followup Done.
 */
import React, { Component } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import moment from 'moment';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { getFollowUpCount } from '../../redux/actions/FollowUpLeads/actionCreators';
import styles from './leadFollowUpStyles';
import FollowUpToday from './FollowUpToday';
import FollowUpDone from './FollowUpDone';
import SlideView from '../../components/animated/SlideView';
import AppHeader from '../../components/header/Header';

const { width } = Dimensions.get('screen');
@connect(state => ({
  followCount: state.followUpLeads.followCount
}), {
  getFollowUpCount
})
export default class LeadFollowUp extends Component {
  static propTypes = {
    followCount: PropTypes.object,
    getFollowUpCount: PropTypes.func.isRequired,
    navigation: PropTypes.object.isRequired
  }

  static defaultProps = {
    followCount: {}
  }

  constructor(props) {
    super(props);
    this.state = {
      tabPosition: 0,
    };
  }

  componentDidMount() {
    this.willFocusSubscription = this.props.navigation.addListener(
      'willFocus',
      () => {
        this.props.getFollowUpCount();
      }
    );
  }

  componentWillUnmount() {
    this.willFocusSubscription.remove();
  }

  render() {
    const { followCount } = this.props;
    return (
      <View style={{ flex: 1 }}>
        <AppHeader backEnabled navigation={this.props.navigation}>
          <View style={styles.header}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 20 }}>
              <Text style={styles.headerDate}>To Follow Up: </Text>
              <Text style={styles.headerDate}>
                {
                  moment(new Date(), 'MM-DD-YYYY').format('DD MMM \'YY')
              }
              </Text>
            </View>
            {/* <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text>To Follow Up: </Text>
              <Text>Today</Text>
            </View> */}
          </View>
        </AppHeader>

        <View style={{
          flexDirection: 'row', backgroundColor: 'white', elevation: 4, paddingLeft: 16
        }}>
          <TouchableOpacity onPress={() => { this.setState({ tabPosition: 0 }); }}>
            <Text
              style={(this.state.tabPosition === 0) ? styles.tabSelectedStyle : styles.tabStyle}>

              {`Follow Up (${(followCount && followCount.followup >= 0) ? followCount.followup : ''})`}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => { this.setState({ tabPosition: 1 }); }}>
            <Text
              style={(this.state.tabPosition === 1) ? styles.tabSelectedStyle : styles.tabStyle}>
              {`Follow Up Done (${(followCount && followCount.followupDone >= 0)
                ? followCount.followupDone : ''})`}
            </Text>
          </TouchableOpacity>
        </View>
        <View style={{ flex: 1 }}>
          {
                (this.state.tabPosition === 0)
                  ?
                    <FollowUpToday navigation={this.props.navigation} />
                  :
                    <FollowUpDone navigation={this.props.navigation} />
              }
        </View>
      </View>
    );
  }
}

