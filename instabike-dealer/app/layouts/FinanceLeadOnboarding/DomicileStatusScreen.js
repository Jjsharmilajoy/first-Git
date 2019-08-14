/**
 * This screen collects the domicle status of the lead
 * while creating a financial lead.
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  View, Text, Image, TouchableHighlight
} from 'react-native';
import { updateLead, setLead } from '../../redux/actions/Global/actionCreators';
import Loader from '../../components/loader/Loader';

// Styles
import styles from './domicileStatusStyles';

// Validations

import { isStringEmpty } from '../../utils/validations';

// Components
import ContinueSectionScreen from '../../components/ContinueSection/ContinueSectionScreen';

@connect(
  state => ({
    loading: state.global.loadingGroup
  }),
  {
    updateLead,
    setLead
  }
)
class DomicileStatusScreen extends Component {
  static propTypes = {
    handleOnBack: PropTypes.func.isRequired,
    lead: PropTypes.object,
    updateLead: PropTypes.func.isRequired,
    setLead: PropTypes.func.isRequired,
    navigation: PropTypes.object.isRequired,
    loading: PropTypes.bool.isRequired,
  }

  static defaultProps = {
    lead: {},
  }

  constructor(props) {
    super(props);
    this.state = {
      typeFieldError: false,
      lead: {
        ...this.props.lead
      }
    };
  }

  onBackPress = () => {
    const { lead } = this.state;
    lead.income_range = null;
    this.props.setLead(lead);
    this.props.handleOnBack();
    return true;
  }

  gotoOfferPreferences = () => {
    const { lead } = this.state;
    this.props.updateLead(lead.id, lead).then(() => {
      if (lead.domicile_status) {
        const isTypeSelected = !isStringEmpty(lead.domicile_status);
        if (isTypeSelected) {
          this.gotoFinancierListing();
        }
        this.setState({
          typeFieldError: !isTypeSelected
        });
      } else {
        this.setState({
          typeFieldError: true
        });
      }
    }).catch(() => {});
  }

  gotoFinancierListing = () => {
    const { navigate } = this.props.navigation;
    navigate('FinancierListing', {
      performaInvoiceId: this.props.navigation.state.params.performaInvoiceId,
      leadDetailId: this.props.navigation.state.params.leadDetailId,
      onRoadPrice: this.props.navigation.state.params.onRoadPrice,
      downpayment: this.state.downPaymentvalue,
      currentLeadDetailObj: this.props.navigation.state.params.currentLeadDetailObj,
      previousScreen: 'FinancierOnboarding'
    });
  }

  selectDomicileType = value => {
    const { lead } = this.state;
    this.setState({
      typeFieldError: false,
      lead: { ...lead, domicile_status: value }
    });
  }

  render() {
    const { lead, typeFieldError } = this.state;
    return (
      <View style={styles.container}>
        <Loader showIndicator={this.props.loading} />
        <View style={{ flex: 1, flexDirection: 'column' }}>
          <View style={{
            flex: 7, flexDirection: 'row', margin: 50
          }}
          >
            <TouchableHighlight
              style={lead.domicile_status === '0' ? [styles.selectedCard, styles.ownHouseCard] : styles.ownHouseCard}
              underlayColor="#ffff"
              onPress={() => this.selectDomicileType('0')}
            >
              <View style={{ alignItems: 'center' }}>
                <Image
                  source={require('../../assets/images/OwnHouse.png')}
                  activeOpacity={0.5}
                  resizeMode="contain"
                />
                <Text style={styles.cardText}>
Own House
                </Text>
              </View>
            </TouchableHighlight>
            <TouchableHighlight
              style={lead.domicile_status === '1'
                ? [styles.selectedCard, styles.rentedhouseCard] : styles.rentedhouseCard}
              underlayColor="#ffff"
              onPress={() => this.selectDomicileType('1')}>
              <View style={{ alignItems: 'center' }}>
                <Image
                  source={require('../../assets/images/RentedHouse.png')}
                  activeOpacity={0.5}
                  resizeMode="contain"
                />
                <Text style={styles.cardText}>
Rented House
                </Text>
              </View>
            </TouchableHighlight>
          </View>
          {
            typeFieldError
              ? (
                <Text style={[styles.errorTextStyle]}>
Please select domicile status.
                </Text>
              )
              : <Text style={styles.errorTextStyle} />
            }
          <View style={styles.continueBtnContainer}>
            <ContinueSectionScreen
              title="Continue"
              disabled={this.props.loading}
              continueBtnAction={this.gotoOfferPreferences}
              backBtnAction={() => this.onBackPress()}
            />
          </View>
        </View>
      </View>
    );
  }
}

export default DomicileStatusScreen;
