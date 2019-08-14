/**
 * This screen collects lead salary details when the lead opts
 * for finance.
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  View, Text, Image, TouchableHighlight, TouchableOpacity, FlatList
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { updateLead } from '../../redux/actions/Global/actionCreators';
import { BookTestRideButton } from '../../components/button/Button';
import Loader from '../../components/loader/Loader';

// Styles
import styles from './salaryDetailsStyles';

// Validations
import { isStringEmpty } from '../../utils/validations';

// constants
import constants from '../../utils/constants';

@connect(
  state => ({
    lead: state.global.lead,
    loading: state.global.loadingGroup
  }),
  {
    updateLead,
  }
)

class SalaryDetailsScreen extends Component {
  static propTypes = {
    handleOnContinue: PropTypes.func.isRequired,
    lead: PropTypes.object,
    updateLead: PropTypes.func.isRequired,
    loading: PropTypes.bool.isRequired
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
      },
      showSalaryView: false,
      showSalaryRange: true,
      selectedIndex: null
    };
  }

  static getDerivedStateFromProps(nextProps) {
    if (nextProps.lead) {
      return {
        lead: nextProps.lead,
      };
    }
    return null;
  }

  gotoDomicileStatus = () => {
    const { lead } = this.state;
    if (lead.income_range === null && lead.income_status === '0') {
      this.setState({
        showSalaryView: true
      });
    } else {
      this.props.updateLead(lead.id, lead).then(() => {
        if (lead.income_status) {
          const isTypeSelected = !isStringEmpty(lead.income_status);
          if (isTypeSelected) {
            this.props.handleOnContinue(lead);
            this.setState({
              typeFieldError: !isTypeSelected
            });
          }
        } else {
          this.setState({
            typeFieldError: true
          });
        }
      }).catch(() => {});
    }
  }

  selectIncomeType = value => {
    const { lead } = this.state;
    this.setState({
      typeFieldError: false,
      lead: { ...lead, income_status: value }
    });
  }

  selectIncomeRangeType = index => {
    const selectedRange = constants.SalaryRange[index];
    const { lead } = this.state;
    this.setState({
      selectedIndex: index,
      typeFieldError: false,
      lead: { ...lead, income_range: `${selectedRange.salary_from} - ${selectedRange.salary_To}` }
    });
  }

  renderSeparator = () => (
    <View
      style={{
        height: 1,
        width: '100%',
        backgroundColor: '#CED0CE',
        marginLeft: '0%'
      }}
      />
  );

  renderItem = (item, index) => (
    <TouchableOpacity
      onPress={() => this.selectIncomeRangeType(index)}
      style={{
        flex: 1, backgroundColor: '#f4f4f4', height: 40, flexDirection: 'row'
      }}>
      <Icon
        name={(this.state.selectedIndex === index) ? 'dot-circle-o' : 'circle-thin'}
        size={22}
        style={{
          alignSelf: 'center', justifyContent: 'center', marginLeft: 10, marginRight: 5
        }}
        color="#f37e2e" />
      <Text style={styles.detailValueTextStyle}>
        {item.name}
      </Text>
    </TouchableOpacity>
  )

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
              style={lead.income_status === '0' ? [styles.selectedCard, styles.salariedCard] : styles.salariedCard}
              underlayColor="#ffff"
              onPress={() => this.selectIncomeType('0')}
            >
              <View style={{ alignItems: 'center' }}>
                <Image
                  source={require('../../assets/images/salaried.png')}
                  activeOpacity={0.5}
                  resizeMode="contain"
                />
                <Text style={styles.cardText}>
Salaried Employee
                </Text>
              </View>
            </TouchableHighlight>
            {this.state.showSalaryView
            && (
            <View>
              <TouchableOpacity
                style={styles.salaryRangeBtnView}
                onPress={() => {
                  this.setState({
                    showSalaryRange: !this.state.showSalaryRange
                  });
                }
        }
              >
                <Text style={styles.salaryRangeHeaderTextStyle}>
              Choose Monthly Income Range
                </Text>
                <View style={styles.showSalaryWrapper}>
                  <Icon
                    style={[styles.arrowImageStyle]}
                    name={
                  this.state.showSalaryRange ? 'angle-up' : 'angle-down'
                }
                    size={25}
                    color="white" />
                </View>
              </TouchableOpacity>
              { this.state.showSalaryRange
              && (
              <FlatList
                ItemSeparatorComponent={this.renderSeparator}
                keyExtractor={this._keyExtractor}
                data={constants.SalaryRange}
                renderItem={({ item, index }) => this.renderItem(item, index)}
                extraData={this.state}
                />
              )
            }
            </View>
            )
            }
            {!this.state.showSalaryView
              && (
              <TouchableHighlight
                style={lead.income_status === '1' ? [styles.selectedCard, styles.selfEmployedCard] : styles.selfEmployedCard}
                underlayColor="#ffff"
                onPress={() => this.selectIncomeType('1')}>
                <View style={{ alignItems: 'center' }}>
                  <Image
                    source={require('../../assets/images/selfemployed.png')}
                    activeOpacity={0.5}
                    resizeMode="contain"
                />
                  <Text style={styles.cardText}>
Self - Employed
                  </Text>
                </View>
              </TouchableHighlight>
              )
            }
          </View>
          {
            typeFieldError
              ? (
                <Text style={[styles.errorTextStyle]}>
Please select nature of job.
                </Text>
              )
              : <Text style={styles.errorTextStyle} />
            }
          <View style={styles.continueBtnContainer}>
            <View style={{ flexDirection: 'row-reverse', alignItems: 'flex-end' }}>
              <BookTestRideButton
                title="Continue"
                disabled={this.props.loading}
                handleSubmit={this.gotoDomicileStatus}
              />
            </View>
          </View>
        </View>
      </View>
    );
  }
}

export default SalaryDetailsScreen;
