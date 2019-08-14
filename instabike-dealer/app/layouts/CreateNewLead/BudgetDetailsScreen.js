/**
 * Budget Details Screen
 * The Budget Details Screen collects user budget information while creating
 * lead.
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  Text,
  View,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { StackActions, NavigationActions } from 'react-navigation';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import ContinueSectionScreen from '../../components/ContinueSection/ContinueSectionScreen';
import styles from './budgetDetailsStyles';
import { updateLead, setLead } from '../../redux/actions/Global/actionCreators';
import Loader from '../../components/loader/Loader';

const DEVICE_WIDTH = Dimensions.get('screen').width;

const ranges = [{
  id: 0,
  name: 'All',
  values: [0, 1000000]
},
{
  id: 1,
  name: '< ₹ 70k',
  values: [0, 70000]
},
{
  id: 2,
  name: '₹ 70k - ₹ 100k',
  values: [70000, 100000]
},
{
  id: 3,
  name: '> ₹ 100k',
  values: [100000, 1000000]
},
];

@connect(state => ({
  loading: state.global.loadingGroup
}), {
  updateLead, setLead
})
class BudgetDetailsScreen extends Component {
  static propTypes = {
    // handleOnContinue: PropTypes.func.isRequired,
    handleOnBack: PropTypes.func.isRequired,
    updateLead: PropTypes.func.isRequired,
    lead: PropTypes.object,
    loading: PropTypes.bool.isRequired,
    navigation: PropTypes.object.isRequired,
    disableButton: PropTypes.func.isRequired,
    buttonState: PropTypes.bool.isRequired
  }

  static defaultProps = {
    lead: {},
  }

  constructor(props) {
    super(props);
    const { lead } = this.props;
    this.state = {
      values: lead && Object.keys(lead).length !== 0 && lead.search_criteria_budget
        ? this.getBudgetValues(lead.search_criteria_budget) : [0, 1000000],
      lead: {
        ...this.props.lead
      }
    };
  }

  static getDerivedStateFromProps(nextProps) {
    if (nextProps.lead) {
      return {
        lead: nextProps.lead
      };
    }
    return null;
  }

  getBudgetValues = value => {
    const budgetRanges = value.split('-');
    budgetRanges.forEach((range, index) => {
      budgetRanges[index] = parseInt(range, 10);
    });
    return budgetRanges;
  }

  multiSliderValuesChange = values => {
    this.state.lead.search_criteria_budget = `${values[0]}-${values[1]}`;
    this.setState({
      values,
      lead: this.state.lead
    });
  }

  gotoViewProducts = () => {
    this.props.disableButton();
    const { lead } = this.state;
    // const { navigate } = this.props.navigation;
    this.props.updateLead(lead.id, lead).then(() => {
      if (lead.search_criteria_budget === undefined || lead.search_criteria_budget === null) {
        lead.search_criteria_budget = '0-1000000';
      }
      const filterData = {
        type: lead.search_criteria_type,
        typeName: lead.search_criteria_type === '0' ? 'bike' : 'scooter',
        budget: lead.search_criteria_budget,
        orderField: 'fuel_efficiency_overall',
        orderBy: 'desc'
      };
      /**
       * Resting screens so that while clicking back buttton redirects to dashboard screen
       */
      const resetAction = StackActions.reset({
        index: 1,
        actions: [
          NavigationActions.navigate({ routeName: 'Dashboard' }),
          NavigationActions.navigate({
            routeName: 'FilteredProducts',
            params: {
              lead, filterData
            }
          }),
        ],
      });
      this.props.navigation.dispatch(resetAction);
    }, error => {
      console.log(error);
    });
  }

  CustomMarker = () => <View style={styles.customMarker} />;

  render() {
    const { width } = Dimensions.get('window');
    const { values } = this.state;
    return (
      <React.Fragment>
        <View style={styles.container}>
          <Loader showIndicator={this.props.loading} />
          <View style={{ flex: 1, flexDirection: 'column' }}>
            <View style={styles.dataContainer}>
              <Text style={(DEVICE_WIDTH >= 640 && DEVICE_WIDTH <= 760) ? [styles.sliderValue, { marginBottom: 20, marginVertical: 0 }] : styles.sliderValue}>
  ₹
                {this.state.values[0]}
                {' '}
  - ₹
                {this.state.values[1]}
              </Text>
              <View style={(DEVICE_WIDTH >= 640 && DEVICE_WIDTH <= 760) ? [styles.sliderViewStyle, { marginVertical: 0 }] : styles.sliderViewStyle}>
                <MultiSlider
                  style={[styles.sliderStyle, { flex: 1 }]}
                  values={[values[0], values[1]]}
                  onValuesChange={this.multiSliderValuesChange}
                  min={0}
                  max={1000000}
                  step={500}
                  sliderLength={(width / 10) * 8}
                  selectedStyle={styles.selectedStyle}
                  unselectedStyle={styles.unselectedStyle}
                  trackStyle={styles.trackStyle}
                  customMarker={this.CustomMarker}
                  allowOverlap
                  snapped
                />
              </View>
              <View style={styles.amountRangeViewStyle}>
                {/* {
                  ranges && ranges.map((range, index) => (
                    index !== 0
                      ? (
                        <TouchableOpacity
                          style={range.values[0] <= values[0] && range.values[1] >= values[1]
                            ? [styles.selectedCard, styles.buttonStyle] : styles.buttonStyle}
                          onPress={() => {
                            this.state.lead.search_criteria_budget = `${range.values[0]}-${range.values[1]}`;
                            this.setState({
                              values: range.values,
                              lead: this.state.lead
                            });
                          }}
                          activeOpacity={0.5}
                          key={range.id}
                      >
                          <Text>{range.name}</Text>
                        </TouchableOpacity>
                      )
                      : (
                        <TouchableOpacity
                          style={range.values[0] === values[0] && range.values[1] === values[1]
                            ? [styles.selectedCard, styles.buttonStyle] : styles.buttonStyle}
                          onPress={() => {
                            this.state.lead.search_criteria_budget = `${range.values[0]}-${range.values[1]}`;
                            this.setState({
                              values: range.values,
                              lead: this.state.lead
                            });
                          }}
                          activeOpacity={0.5}
                          key={range.id}
                      >
                          <Text>{range.name}</Text>
                        </TouchableOpacity>
                      )

                  ))
                } */}
                {ranges && ranges.map((range, index) => (
                  <TouchableOpacity
                    style={[
                      (index !== 0 ? range.values[0] <= values[0] && range.values[1] >= values[1] :
                        range.values[0] === values[0] && range.values[1] === values[1])
                        ? [styles.selectedCard, styles.buttonStyle] : styles.buttonStyle,
                      (DEVICE_WIDTH >= 640 && DEVICE_WIDTH <= 760) && { paddingVertical: 10, padding: 0 }]
                        }
                    onPress={() => {
                      this.state.lead.search_criteria_budget = `${range.values[0]}-${range.values[1]}`;
                      this.setState({
                        values: range.values,
                        lead: this.state.lead
                      });
                    }}
                    activeOpacity={0.5}
                    key={range.id}
                    >
                    <Text>{range.name}</Text>
                  </TouchableOpacity>
                ))

                }
              </View>

            </View>
            <View style={{ flex: 4, justifyContent: 'flex-start' }}>
              <ContinueSectionScreen
                title="VIEW PRODUCTS"
                disableBackBtn={this.props.buttonState}
                continueBtnAction={() => this.gotoViewProducts()}
                backBtnAction={() => this.props.handleOnBack()}
              />
            </View>
          </View>
        </View>
      </React.Fragment>

    );
  }
}
export default BudgetDetailsScreen;
