import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { createMaterialTopTabNavigator } from 'react-navigation';
import {
  Alert
} from 'react-native';
import VehicleEnquired from './VehicleEnquired';
import fonts from '../../theme/fonts';
import variables from '../../theme/variables';
import LeadActions from './LeadDetailAction';
// import Loader from '../../components/loader/Loader';
import { landlineOrmobileNumberValidator } from '../../utils/validations';

@connect(
  state => ({
    lead: state.global.lead
    // loading: state.global.loadingGroup
  }),
  null
)
class LeadHistoryTab extends Component {
  static propTypes = {
    lead: PropTypes.object.isRequired
    // loading: PropTypes.bool.isRequired
  }

  render() {
    const { navigation } = this.props;
    const data = {
      navigation,
      dealerId: navigation.getParam('currentDealerId'),
      leadId: navigation.getParam('leadId'),
      lead: {
        ...this.props.lead
      },
      isMobileNumberAvailable: landlineOrmobileNumberValidator(this.props.lead
        && this.props.lead.mobile_number ? this.props.lead.mobile_number : ''),
      isFinancierLead: (() => {
        let isFinancierLead = false;
        if (this.props.lead && this.props.lead.lead_details) {
          this.props.lead.lead_details.every(leadDetail => {
            isFinancierLead = leadDetail.financier_lead && leadDetail.financier_lead.length;
            return !isFinancierLead;
          });
        }
        return isFinancierLead;
      })()
    };

    return (
      <React.Fragment>
        {
          <Navigator screenProps={data} />
        }
      </React.Fragment>
    );
  }
}

LeadHistoryTab.propTypes = {
  navigation: PropTypes.object.isRequired,
};

const Navigator = createMaterialTopTabNavigator({
  Actions: LeadActions,
  'Vehicle(s)': VehicleEnquired,
}, {
  swipeEnabled: false,
  tabBarOptions: {
    activeTintColor: variables.mango,
    inactiveTintColor: variables.lightGrey,
    upperCaseLabel: false,
    style: {
      backgroundColor: 'white',
    },
    labelStyle: {
      fontSize: 12,
      fontFamily: fonts.sourceSansProSemiBold,
    },
    tabStyle: {
      width: 100,
      height: 40
    },
    indicatorStyle: {
      backgroundColor: variables.mango,
    }
  },
  navigationOptions: navigation => ({
    tabBarOnPress: scene => {
      const { lead } = navigation.screenProps;
      if (scene.navigation && scene.navigation.state.key.includes('Vehicle(s)')
       && lead && !lead.mobile_number) {
        Alert.alert(
          'Alert',
          'Mobile number is mandatory to proceed.',
          [
            { text: 'OK', onPress: () => {} },
          ],
          { cancelable: false }
        );
      } else {
        scene.defaultHandler();
      }
    },
  }),
});

export default LeadHistoryTab;
