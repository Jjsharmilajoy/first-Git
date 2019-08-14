/**
 * The Financier Listing Component lists all the finance options based on EMI
 * and tenure.
 */
import React, { Component } from 'react';
import {
  View, Text, TouchableOpacity, TextInput, Modal, ScrollView, Image, Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { StackActions } from 'react-navigation';

import PropTypes from 'prop-types';

// Reducer
import { connect } from 'react-redux';

// Styles
import styles from './financierListingStyles';
import MyTeamStyles from '../MyTeam/MyTeamStyles';

// Header HOC
import AppHeader from '../../components/header/Header';
import Loader from '../../components/loader/Loader';

// Component
import SectionedMultiSelect from '../../components/multiSelectDropdown/sectioned-multi-select';
import { ButtonWithPlainText, BookTestRideButton } from '../../components/button/Button';
import { currencyFormatter, isNumeric } from '../../utils/validations';

// Images
import Close from '../../assets/images/close.png';

// Action Methods
import {
  createExchangeVehicle,
  getExchangeVehicle,
  updateExchangeVehicle,
  getManufacturerList,
  getExchangeVehicleList,
  getExchangePrice
} from '../../redux/actions/FinanceOnboarding/actionCreators';

import { getFinancierList } from '../../redux/actions/FinancierListing/actionCreators';
import { updateLead } from '../../redux/actions/Global/actionCreators';
import constants from '../../utils/constants';

const DetailHeaderArray = ['Nature of Job', 'Domicile Status', 'Advance EMI', 'Tenure', ''];

@connect(
  state => ({
    exchangeVehicle: state.financierOnboarding.exchangeVehicle,
    lead: state.global.lead,
    financierList: state.financierListing.financierList,
    manufacturerList: state.financierOnboarding.manufacturerList,
    exchangeVehicleList: state.financierOnboarding.exchangeVehicleList,
    exchangePrice: state.financierOnboarding.exchangePrice,
    currentUser: state.user.currentUser,
    loading: state.financierOnboarding.loadingGroup,
  }),
  {
    createExchangeVehicle,
    getExchangeVehicle,
    updateExchangeVehicle,
    getFinancierList,
    updateLead,
    getManufacturerList,
    getExchangeVehicleList,
    getExchangePrice
  }
)
export default class FinancierListingScreen extends Component {
  static propTypes = {
    navigation: PropTypes.object.isRequired,
    createExchangeVehicle: PropTypes.func.isRequired,
    exchangeVehicle: PropTypes.object,
    getExchangeVehicle: PropTypes.func.isRequired,
    updateExchangeVehicle: PropTypes.func.isRequired,
    lead: PropTypes.object.isRequired,
    getFinancierList: PropTypes.func.isRequired,
    financierList: PropTypes.array,
    updateLead: PropTypes.func.isRequired,
    getManufacturerList: PropTypes.func.isRequired,
    getExchangeVehicleList: PropTypes.func.isRequired,
    exchangeVehicleList: PropTypes.array,
    getExchangePrice: PropTypes.func.isRequired,
    exchangePrice: PropTypes.array,
    currentUser: PropTypes.object.isRequired,
    loading: PropTypes.bool.isRequired,
  }

  static defaultProps = {
    exchangeVehicle: {},
    financierList: [],
    exchangeVehicleList: [],
    exchangePrice: {}
  }

  constructor(props) {
    super(props);
    this.state = {
      lead: this.props.lead,
      currentSortBy: '',
      selectedIndex: null,
      salaryCatagories: [{
        children: constants.salaryCategoryArray
      }],
      domicileStatusList: [{
        children: constants.domicileStatusArray
      }],
      advanceEmiList: [{
        children: constants.AdvanceEmiArray
      }],
      tenureList: [{
        children: constants.TenureArray
      }],
      selectedDomicileStatus: [],
      selectedAdvanceEmi: ['0'],
      selectedTenure: ['6'],
      modalVisible: false,
      downPaymentvalue: (this.props.navigation.state.params.downpayment
        ? (this.props.navigation.state.params.downpayment
           && (this.props.navigation.state.params.downpayment === 0
             || this.props.navigation.state.params.downpayment === ''))
          ? `${parseInt(this.props.navigation.state.params.onRoadPrice, 10) * 0.25}`
          : `${parseInt(this.props.navigation.state.params.downpayment, 10)}`
        : `${parseInt(this.props.navigation.state.params.onRoadPrice, 10) * 0.25}`),
      kmsDriven: null,
      excVehicleYear: null,
      exchangeValueAmount: '0',
      exchageVehicleDetails: null,
      selectedItems: [],
      localFinancierList: null,
      selectedManufacturerItems: [],
      selectedVehicleModelItems: [],
      selectedVariantItems: [],
      isApplyEnabled: false
    };
  }

  static getDerivedStateFromProps(nextProps) {
    if (nextProps.lead
      && nextProps.exchangeVehicle && nextProps.manufacturerList && nextProps.exchangeVehicleList
       && nextProps.financierList) {
      return {
        lead: nextProps.lead,
        selectedItems: [nextProps.lead.income_range],
        selectedDomicileStatus: [(nextProps.lead.domicile_status === 0) ? '0' : '1'],
        localManufacturerList: [{
          children: nextProps.manufacturerList,
        }],
        localVehicleModelList: [{
          children: nextProps.exchangeVehicleList
        }],
      };
    }
    return null;
  }

  componentDidMount() {
    const { lead } = this.state;
    if (this.props.currentUser && this.props.currentUser.dealerId) {
      Promise.all([
        this.props.getExchangeVehicle(
          this.props.currentUser.dealerId,
          lead.id, this.props.navigation.state.params.performaInvoiceId
        ),
        this.getUpdatedFinancierList()
      ])
        .then(() => {
          if ((this.props.exchangeVehicle
            && Object.keys(this.props.exchangeVehicle).length !== 0)) {
            this.setState({
              exchageVehicleDetails: (this.props.exchangeVehicle
                && Object.keys(this.props.exchangeVehicle).length !== 0)
                ? this.props.exchangeVehicle : null,
              exchangeValueAmount: (this.props.exchangeVehicle
                && Object.keys(this.props.exchangeVehicle).length !== 0
                  && ('quoted_value' in this.props.exchangeVehicle)
                  && this.props.exchangeVehicle.quoted_value !== null)
                ? this.props.exchangeVehicle.quoted_value : '0',
              kmsDriven: (this.props.exchangeVehicle
                && Object.keys(this.props.exchangeVehicle).length !== 0
                  && ('kilometers_used' in this.props.exchangeVehicle)
                  && this.props.exchangeVehicle.kilometers_used !== null)
                ? this.props.exchangeVehicle.kilometers_used : null,
              excVehicleYear: (this.props.exchangeVehicle
                && Object.keys(this.props.exchangeVehicle).length !== 0
                  && ('variant_year' in this.props.exchangeVehicle)
                  && this.props.exchangeVehicle.variant_year !== null)
                ? this.props.exchangeVehicle.variant_year : null,
              selectedManufacturerItems: (this.props.exchangeVehicle
                && Object.keys(this.props.exchangeVehicle).length !== 0
                  && ('manufacturer' in this.props.exchangeVehicle)
                  && this.props.exchangeVehicle.manufacturer !== null)
                ? [this.props.exchangeVehicle.manufacturer] : [],
              selectedVehicleModelItems: (this.props.exchangeVehicle
                && Object.keys(this.props.exchangeVehicle).length !== 0
                  && ('vehicle' in this.props.exchangeVehicle)
                  && this.props.exchangeVehicle.vehicle !== null)
                ? [this.props.exchangeVehicle.vehicle] : [],
              selectedVariantItems: (this.props.exchangeVehicle
                && Object.keys(this.props.exchangeVehicle).length !== 0
                  && ('variant' in this.props.exchangeVehicle)
                  && this.props.exchangeVehicle.variant !== null)
                ? [this.props.exchangeVehicle.variant] : [],
            });
          }
          if ((this.props.exchangeVehicle
            && Object.keys(this.props.exchangeVehicle).length !== 0
              && ('vehicle' in this.props.exchangeVehicle) && this.props.exchangeVehicle.vehicle !== null)) {
            const data = {
              manufacturer: this.props.exchangeVehicle.manufacturer
            };
            this.props.getExchangeVehicleList(data).then(() => {
              this.setState({
                localVehicleModelList: this.props.exchangeVehicleList,
              });
            });
          }
        })
        .catch(() => {});
      //   .catch(() => {});
    }
  }

  onPickerChange = () => {
    this.setState({
      currentVehicleList: this.state.currentVehicleList
    });
  }

  onDeleteIconPress = () => {
    const { lead } = this.state;
    if (this.props.currentUser && this.props.currentUser.dealerId) {
      const { exchageVehicleDetails } = this.state;
      exchageVehicleDetails.status = 'Inactive';
      Promise.all([
        this.props.updateExchangeVehicle(this.props.currentUser.dealerId, lead.id, exchageVehicleDetails),
        this.getUpdatedFinancierList()
      ]).then(() => {
        this.setState({
          exchageVehicleDetails: null,
          exchangeValueAmount: '0',
          selectedManufacturerItems: [],
          selectedVehicleModelItems: [],
          selectedVariantItems: [],
          kmsDriven: null,
          excVehicleYear: null,
          isApplyEnabled: true
        });
      }).catch(() => {});
    }
  }

  onSelectedSalaryDetailItemsChange = selectedItems => {
    this.setState({
      selectedItems,
      lead: {
        ...this.state.lead,
        income_range: selectedItems[0]
      },
      isApplyEnabled: true
    });
  }

  onSelectedManufacturerItemsChange = selectedManufacturerItems => {
    this.setState({
      selectedManufacturerItems,
      selectedVehicleModelItems: []
    }, () => {
      this.getVehicleModelList(selectedManufacturerItems[0]);
    });
  }

  onSelectedVehicleModelItemsChange = selectedVehicleModelItems => {
    this.setState({
      selectedVehicleModelItems
    }, () => {
    });
  }

  onSelectedVariantItemsChange = selectedVariantItems => {
    this.setState({
      selectedVariantItems
    });
  }

  onSelectedDomicileStatusItemsChange = selectedDomicileStatus => {
    this.setState({
      selectedDomicileStatus,
      lead: {
        ...this.state.lead,
        domicile_status: selectedDomicileStatus[0]
      },
      isApplyEnabled: true
    });
  }

  onSelectedTenureItemsChange = selectedTenure => {
    this.setState({
      selectedTenure,
      isApplyEnabled: true,
      localFinancierList: selectedTenure[0].name === 'None' ? null : this.state.localFinancierList,
    });
  }

  onSelectedAdvanceEmiItemsChange = selectedAdvanceEmi => {
    this.setState({
      selectedAdvanceEmi,
      isApplyEnabled: true
    });
  }

  onexchangeVehicleSwitch = () => {
    this.props.getManufacturerList()
      .then(() => {
        this.showModelView(true);
      }).catch(() => {});
  }

  onDownPaymentTextChange = text => {
    this.setState({
      downPaymentvalue: text,
      isApplyEnabled: true
    });
  }

  getVehicleModelList = item => {
    try {
      const data = {
        manufacturer: item
      };
      this.props.getExchangeVehicleList(data);
    } catch (error) {
      console.log(error);
    }
  }

  getCurrentSalaryValueIndex = currentSalary => {
    constants.salaryCategoryArray.forEach(salarayItem => {
      if ((currentSalary) === salarayItem.salary) {
        return salarayItem;
      }
    });
  }

  getDetailHeaderArray = () => (
    <View style={styles.detailHeaderView}>
      {
      DetailHeaderArray.map((currentheader, index) => (
        <View
          style={
          [styles.detailHeaderTitleView,
            {
              flex: (currentheader === 'Tenure' || currentheader === 'Advance EMI' || currentheader === '')
                ? 0.5 : ((currentheader === 'Offer Preferences') ? 2 : 1)
            }
          ]
          }
          // eslint-disable-next-line react/no-array-index-key
          key={index}
          >
          <Text style={styles.detailTitleTextStyle}>
            {currentheader}
          </Text>
        </View>
      ))
    }
    </View>
  )

  getUpdatedFinancierList = () => {
    const currentSalaryObj = constants.salaryCategoryArray
      .find(currentCategory => this.state.selectedItems[0] === currentCategory.salary);
    const currentDomicileObj = constants.domicileStatusArray
      .find(currentCategory => this.state.selectedDomicileStatus[0] === currentCategory.id);
    const currentTenureObj = constants.TenureArray
      .find(currentCategory => this.state.selectedTenure[0] === currentCategory.id);
    const currentAdvancedEmiObj = constants.AdvanceEmiArray
      .find(currentCategory => this.state.selectedAdvanceEmi[0] === currentCategory.id);

    if (currentTenureObj.name === 'None') {
      this.setState({
        localFinancierList: null
      });
    } else {
      const filterDataobj = {
        proforma_invoice_id: this.props.navigation.state.params.performaInvoiceId,
        down_payment: (this.state.downPaymentvalue === '') ? 0 : parseInt(this.state.downPaymentvalue, 10),
        income_status: (currentSalaryObj.type === 'Salaried') ? 0 : 1,
        income_range: (currentSalaryObj.type === 'Salaried') ? currentSalaryObj.salary : null,
        domicile_status: (currentDomicileObj.name === 'Own House') ? 0 : 1,
        tenure_from: currentTenureObj.tenure_from,
        tenure_to: currentTenureObj.tenure_to,
        advance_emi: currentAdvancedEmiObj.name,
      };
      if (this.props.currentUser && this.props.currentUser.dealerId) {
        this.props.getFinancierList(this.props.currentUser.dealerId, filterDataobj).then(() => {
          this.setState({
            localFinancierList: this.props.financierList,
            selectedIndex: null,
          });
        })
          .catch(() => {});
      }
    }
  };

  updateLead = () => {
    const { lead } = this.state;
    this.props.updateLead(lead.id, lead).then(() => {
      this.setState(
        {
          isApplyEnabled: false
        },
        () => {
          this.getUpdatedFinancierList();
        }
      );
    }, error => {
      console.log(error);
    });
  }

  calculateExchangeValue = () => {
    if (this.state.selectedManufacturerItems.length > 0
      && this.state.selectedVehicleModelItems.length > 0
      && this.state.kmsDriven
      && this.state.excVehicleYear) {
      if (isNumeric(this.state.excVehicleYear)) {
        if (isNumeric(this.state.kmsDriven)) {
          const data = {
            manufacturer: this.state.selectedManufacturerItems[0],
            vehicle: this.state.selectedVehicleModelItems[0],
            variant: this.state.selectedVariantItems[0],
            model: this.state.excVehicleYear,
            km_used: this.state.kmsDriven
          };
          this.props.getExchangePrice(data).then(() => {
            this.setState({
              exchangeValueAmount: this.props.exchangePrice && Object.keys(this.props.exchangePrice).length > 0
                ? this.props.exchangePrice.amount : '0'
            });
          });
        } else {
          Alert.alert(
            'Alert',
            'Please enter valid kms',
            [
              { text: 'OK', onPress: () => {} },
            ],
            { cancelable: false }
          );
        }
      } else {
        Alert.alert(
          'Alert',
          'Please enter valid year',
          [
            { text: 'OK', onPress: () => {} },
          ],
          { cancelable: false }
        );
      }
    } else {
      Alert.alert(
        'Alert',
        'All fields are mandatory',
        [
          { text: 'OK', onPress: () => {} },
        ],
        { cancelable: false }
      );
    }
  }

    saveExchangeBtnAction = () => {
      const { lead } = this.state;
      if (this.state.exchangeValueAmount && this.state.exchangeValueAmount !== '0' && isNumeric(this.state.exchangeValueAmount)) {
        const exchangeVehicleObj = {
          manufacturer: this.state.selectedManufacturerItems[0],
          vehicle: this.state.selectedVehicleModelItems[0],
          variant: this.state.selectedVariantItems[0],
          kilometers_used: this.state.kmsDriven,
          variant_year: this.state.excVehicleYear,
          quoted_value: this.state.exchangeValueAmount,
          lead_id: lead.id,
          proforma_invoice_id: this.props.navigation.state.params.performaInvoiceId
        };
        if (this.props.currentUser && this.props.currentUser.dealerId) {
          if (this.state.exchageVehicleDetails
            && Object.keys(this.state.exchageVehicleDetails).length !== 0
            && ('id' in this.state.exchageVehicleDetails)) {
            exchangeVehicleObj.id = this.state.exchageVehicleDetails.id;
            Promise.all([
              this.props.updateExchangeVehicle(this.props.currentUser.dealerId, lead.id, exchangeVehicleObj),
              this.getUpdatedFinancierList()
            ])
              .then(() => {
                this.setState({
                  exchageVehicleDetails: (this.props.exchangeVehicle
                    && Object.keys(this.props.exchangeVehicle).length !== 0) ? this.props.exchangeVehicle : null,
                  exchangeValueAmount: (this.props.exchangeVehicle
                    && Object.keys(this.props.exchangeVehicle).length !== 0
                    && ('quoted_value' in this.props.exchangeVehicle)
                      && this.props.exchangeVehicle.quoted_value !== null)
                    ? this.props.exchangeVehicle.quoted_value : '0',
                  kmsDriven: (this.props.exchangeVehicle
                    && Object.keys(this.props.exchangeVehicle).length !== 0
                    && ('kilometers_used' in this.props.exchangeVehicle)
                      && this.props.exchangeVehicle.kilometers_used !== null)
                    ? this.props.exchangeVehicle.kilometers_used : null,
                  excVehicleYear: (this.props.exchangeVehicle
                    && Object.keys(this.props.exchangeVehicle).length !== 0
                    && ('variant_year' in this.props.exchangeVehicle) && this.props.exchangeVehicle.variant_year !== null)
                    ? this.props.exchangeVehicle.variant_year : null,
                  selectedManufacturerItems: (this.props.exchangeVehicle
                    && Object.keys(this.props.exchangeVehicle).length !== 0
                    && ('manufacturer' in this.props.exchangeVehicle)
                      && this.props.exchangeVehicle.manufacturer !== null)
                    ? [this.props.exchangeVehicle.manufacturer] : [],
                  selectedVehicleModelItems: (this.props.exchangeVehicle
                    && Object.keys(this.props.exchangeVehicle).length !== 0
                    && ('vehicle' in this.props.exchangeVehicle) && this.props.exchangeVehicle.vehicle !== null)
                    ? [this.props.exchangeVehicle.vehicle] : [],
                  selectedVariantItems: (this.props.exchangeVehicle
                    && Object.keys(this.props.exchangeVehicle).length !== 0
                    && ('variant' in this.props.exchangeVehicle) && this.props.exchangeVehicle.variant !== null)
                    ? [this.props.exchangeVehicle.variant] : [],
                  modalVisible: false,
                  isApplyEnabled: true
                });
              })
              .catch(() => {});
          } else {
            Promise.all([
              this.props.createExchangeVehicle(this.props.currentUser.dealerId, lead.id, exchangeVehicleObj),
              this.getUpdatedFinancierList()
            ])
              .then(() => {
                this.setState({
                  exchageVehicleDetails: (this.props.exchangeVehicle
                    && Object.keys(this.props.exchangeVehicle).length !== 0)
                    ? this.props.exchangeVehicle : null,
                  exchangeValueAmount: (this.props.exchangeVehicle
                  && Object.keys(this.props.exchangeVehicle).length !== 0
                    && ('quoted_value' in this.props.exchangeVehicle)
                    && this.props.exchangeVehicle.quoted_value !== null)
                    ? this.props.exchangeVehicle.quoted_value : '0',
                  kmsDriven: (this.props.exchangeVehicle
                    && Object.keys(this.props.exchangeVehicle).length !== 0
                    && ('kilometers_used' in this.props.exchangeVehicle)
                      && this.props.exchangeVehicle.kilometers_used !== null)
                    ? this.props.exchangeVehicle.kilometers_used : null,
                  excVehicleYear: (this.props.exchangeVehicle
                    && Object.keys(this.props.exchangeVehicle).length !== 0
                    && ('variant_year' in this.props.exchangeVehicle)
                      && this.props.exchangeVehicle.variant_year !== null)
                    ? this.props.exchangeVehicle.variant_year : null,
                  selectedManufacturerItems: (this.props.exchangeVehicle
                    && Object.keys(this.props.exchangeVehicle).length !== 0
                    && ('manufacturer' in this.props.exchangeVehicle)
                      && this.props.exchangeVehicle.manufacturer !== null)
                    ? [this.props.exchangeVehicle.manufacturer] : [],
                  selectedVehicleModelItems: (this.props.exchangeVehicle
                    && Object.keys(this.props.exchangeVehicle).length !== 0
                    && ('vehicle' in this.props.exchangeVehicle)
                      && this.props.exchangeVehicle.vehicle !== null)
                    ? [this.props.exchangeVehicle.vehicle] : [],
                  selectedVariantItems: (this.props.exchangeVehicle
                    && Object.keys(this.props.exchangeVehicle).length !== 0
                    && ('variant' in this.props.exchangeVehicle)
                      && this.props.exchangeVehicle.variant !== null)
                    ? [this.props.exchangeVehicle.variant] : [],
                  modalVisible: false,
                  isApplyEnabled: true
                });
              })
              .catch(() => {});
          }
        }
      } else {
        Alert.alert(
          'Alert',
          'Please enter a valid amount',
          [
            { text: 'OK', onPress: () => {} },
          ],
          { cancelable: false }
        );
      }
    }

  showModelView = visible => {
    this.setState({ modalVisible: visible });
  }

  continueBtnAction = () => {
    if (this.state.selectedIndex !== null) {
      this.props.navigation.navigate('FinanceDocuments', {
        currentFinancier: this.state.localFinancierList[this.state.selectedIndex],
        leadDetailId: this.props.navigation.state.params.leadDetailId,
        currentLeadDetailObj: this.props.navigation.state.params.currentLeadDetailObj
      });
    } else {
      Alert.alert(
        'Alert',
        'Select a financier to proceed.',
        [
          { text: 'OK', onPress: () => {} },
        ],
        { cancelable: false }
      );
    }
  }

  backBtnAction = () => {
  }

  header = () => (
    <View style={styles.headerContainer}>
      <View style={styles.headerNameView}>
        {
          this.state.lead
            ? <Text style={styles.nameText}>{this.state.lead.name}</Text>
            : <Text style={styles.nameText}>N/A</Text>
        }
        <Text style={[styles.nameText, { marginLeft: 12 }]}>
          {
          this.state.lead
            ? (this.state.lead.mobile_number)
              ? <Text style={styles.nameText}>{this.state.lead.mobile_number}</Text>
              : <Text style={styles.nameText}>N/A</Text>
            : null
        }
        </Text>
      </View>
      <TouchableOpacity
        style={styles.headerSearchContent}
        onPress={this.onexchangeVehicleSwitch}>
        <Text style={{ paddingHorizontal: 10 }}><Icon name="motorcycle" size={21} color="white" /></Text>
        {this.state.exchageVehicleDetails
          && (
          <View style={{ flexDirection: 'row' }}>
            <Text style={styles.exchangeContentText}>
              {(this.props.exchangeVehicle
                          && Object.keys(this.props.exchangeVehicle).length !== 0
                          && ('quoted_value' in this.props.exchangeVehicle)
                            && this.props.exchangeVehicle.quoted_value !== null)
                ? (`${this.props.exchangeVehicle.quoted_value}`.includes('.')
                  ? `${this.props.exchangeVehicle.quoted_value}`.split('.')[0]
                  : currencyFormatter(this.props.exchangeVehicle.quoted_value)) : `${constants.RUPEE} 0`}
/-
            </Text>
            <TouchableOpacity
              style={{ alignItems: 'center', justifyContent: 'center' }}
              onPress={() => this.onDeleteIconPress()}
 >
              <Icon
                name="trash"
                size={21}
                color="white"
                style={{ alignSelf: 'center', marginHorizontal: 5 }} />
            </TouchableOpacity>
          </View>
          )
        }
      </TouchableOpacity>
    </View>
  )

  _keyExtractor = item => item.id;

  sortTeam = keyValue => {
    let { currentSortBy } = this.state;
    if (this.state.localFinancierList && this.state.localFinancierList.length > 0) {
      if (currentSortBy.includes('_asc')) {
        currentSortBy = `${keyValue}_desc`;
        this.state.localFinancierList.sort((obj1, obj2) => obj1[keyValue] - obj2[keyValue]);
      } else if (currentSortBy.includes('_desc') || currentSortBy === '') {
        currentSortBy = `${keyValue}_asc`;
        this.state.localFinancierList.sort((obj1, obj2) => obj2[keyValue] - obj1[keyValue]);
      }
      this.setState({
        localFinancierList: this.state.localFinancierList,
        currentSortBy
      });
    }
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
      onPress={() => { this.setState({ selectedIndex: index }); }}
      style={styles.cellContainer}>
      <View
        style={styles.iconView}>
        <Icon
          name={(this.state.selectedIndex === index) ? 'dot-circle-o' : 'circle-thin'}
          size={22}
          color="#f37e2e" />
      </View>
      <Text style={styles.detailValueTextStyle}>
        {item.name}
      </Text>
      <Text style={styles.detailValueTextStyle}>
        {item.loan_amount}
      </Text>
      <Text style={styles.detailValueTextStyle}>
        {item.rate_of_interest}
      </Text>
      <Text style={styles.detailValueTextStyle}>
        {item.down_payment}
      </Text>
      <Text style={styles.detailValueTextStyle}>
        {item.emi}
      </Text>
      <Text style={styles.detailValueTextStyle}>
        {item.advance_emi}
      </Text>
      <Text style={styles.detailValueTextStyle}>
        {item.tenure}
      </Text>
    </TouchableOpacity>
  )

  render() {
    return (
      <View style={styles.conatainer}>
        <Loader showIndicator={this.props.loading} />
        <AppHeader
          backEnabled
          navigation={this.props.navigation}
          isLeadExists={false}
          onBackClick={() => {
            const { navigation } = this.props;
            if (navigation.state && navigation.state.params
              && navigation.state.params.previousScreen === 'FinancierOnboarding') {
              navigation.dispatch(StackActions.pop({
                n: 2
              }));
            } else {
              navigation.dispatch(StackActions.pop({
                n: 1
              }));
            }
          }}
        >
          {this.header()}
        </AppHeader>
        <Modal
          animationType="slide"
          transparent
          visible={this.state.modalVisible}
          onRequestClose={() => {
            this.setState({
              modalVisible: false,
              exchangeValueAmount: (this.props.exchangeVehicle
                && Object.keys(this.props.exchangeVehicle).length !== 0
                 && ('quoted_value' in this.props.exchangeVehicle)
                  && this.props.exchangeVehicle.quoted_value !== null)
                ? this.props.exchangeVehicle.quoted_value : '0',
              selectedManufacturerItems: (this.state.exchageVehicleDetails !== null
                 && Object.keys(this.state.exchageVehicleDetails).length > 0)
                ? this.state.selectedManufacturerItems : [],
              selectedVehicleModelItems: (this.state.exchageVehicleDetails !== null
                 && Object.keys(this.state.exchageVehicleDetails).length > 0)
                ? this.state.selectedVehicleModelItems : [],
              selectedVariantItems: (this.state.exchageVehicleDetails !== null
                 && Object.keys(this.state.exchageVehicleDetails).length > 0)
                ? this.state.selectedVariantItems : [],
              kmsDriven: (this.state.exchageVehicleDetails !== null
                 && Object.keys(this.state.exchageVehicleDetails).length > 0)
                ? this.state.kmsDriven : null,
              excVehicleYear: (this.state.exchageVehicleDetails !== null
                 && Object.keys(this.state.exchageVehicleDetails).length > 0)
                ? this.state.excVehicleYear : null
            });
          }}
        >
          <View style={[styles.modalContainer, { opacity: 0.9 }]}>
            <ScrollView>
              <View style={styles.modalDataContainer}>
                <TouchableOpacity
                  style={styles.closeBtnView}
                  onPress={() => {
                    this.setState({
                      modalVisible: false,
                      exchangeValueAmount: (this.props.exchangeVehicle
                        && Object.keys(this.props.exchangeVehicle).length !== 0
                         && ('quoted_value' in this.props.exchangeVehicle)
                          && this.props.exchangeVehicle.quoted_value !== null)
                        ? this.props.exchangeVehicle.quoted_value : '0',
                      selectedManufacturerItems: (this.state.exchageVehicleDetails !== null
                         && Object.keys(this.state.exchageVehicleDetails).length > 0)
                        ? this.state.selectedManufacturerItems : [],
                      selectedVehicleModelItems: (this.state.exchageVehicleDetails !== null
                         && Object.keys(this.state.exchageVehicleDetails).length > 0)
                        ? this.state.selectedVehicleModelItems : [],
                      selectedVariantItems: (this.state.exchageVehicleDetails !== null
                         && Object.keys(this.state.exchageVehicleDetails).length > 0)
                        ? this.state.selectedVariantItems : [],
                      kmsDriven: (this.state.exchageVehicleDetails !== null
                         && Object.keys(this.state.exchageVehicleDetails).length > 0)
                        ? this.state.kmsDriven : null,
                      excVehicleYear: (this.state.exchageVehicleDetails !== null
                         && Object.keys(this.state.exchageVehicleDetails).length > 0) ? this.state.excVehicleYear : null
                    });
                  }}
            >
                  <Image
                    style={{ resizeMode: 'center' }}
                    source={Close}
              />
                </TouchableOpacity>
                <Text style={[styles.modalHeaderText]}>
              Exchange Value
                </Text>
                <View style={styles.exchangeVehicleDetailView}>
                  <View style={styles.vehicleDropDownView}>
                    <View style={styles.dropDowmOverView}>
                      <Text style={[styles.detailTextInputStyle]}>
                      Manufacturer
                      </Text>
                      <View style={styles.PickerView}>
                        <View style={styles.PickerBorderView}>
                          <SectionedMultiSelect
                            items={this.state.localManufacturerList || []}
                            styles={{
                              container: [styles.dropdownContainer, { maxHeight: 200 }],
                              selectDropdownTextField: styles.selectDropdownTextField,
                              button: styles.confirmBtn,
                              confirmText: styles.confirmText,
                            }}
                            showCancelButton="true"
                            separator="true"
                            subSeparator="true"
                            uniqueKey="manufacturer"
                            subKey="children"
                            displayKey="manufacturer"
                            single
                            hideSearch
                            expandDropDowns
                            onSelectedItemsChange={this.onSelectedManufacturerItemsChange}
                            selectedItems={this.state.selectedManufacturerItems}
                            readOnlyHeadings
                            colors={{
                            }}
                    />
                        </View>
                      </View>
                    </View>
                    <View style={styles.dropDowmOverView}>
                      <Text style={[styles.detailTextInputStyle]}>
                      Model
                      </Text>
                      <View style={styles.PickerView}>
                        <View style={styles.PickerBorderView}>
                          <SectionedMultiSelect
                            items={this.state.localVehicleModelList || []}
                            styles={{
                              container: [styles.dropdownContainer, { maxHeight: 200 }],
                              selectDropdownTextField: styles.selectDropdownTextField,
                              button: styles.confirmBtn,
                              confirmText: styles.confirmText
                            }}
                            showCancelButton="true"
                            separator="true"
                            subSeparator="true"
                            uniqueKey="vehicle"
                            subKey="children"
                            displayKey="vehicle"
                            single
                            hideSearch
                            expandDropDowns
                            onSelectedItemsChange={this.onSelectedVehicleModelItemsChange}
                            selectedItems={this.state.selectedVehicleModelItems}
                            readOnlyHeadings
                            disabled={(this.state.selectedManufacturerItems.length === 0)}
                            colors={{
                            }}
                    />
                        </View>
                      </View>
                    </View>
                  </View>
                  <View style={styles.vehicleDropDownView}>
                    <View style={styles.dropDowmOverView}>
                      <Text style={[styles.detailTextInputStyle]}>
                      Year of manufacture
                      </Text>
                      <TextInput
                        maxLength={4}
                        style={[styles.fieldContainer, { width: 200 }]}
                        keyboardType="numeric"
                        onChangeText={text => this.setState({ excVehicleYear: text })}
                        value={this.state.excVehicleYear}
                        underlineColorAndroid="transparent" />
                    </View>
                    <View style={{ margin: 20, flex: 1 }}>
                      <Text style={[styles.detailTextInputStyle]}>
                      Kms driven
                      </Text>
                      <TextInput
                        maxLength={5}
                        style={[styles.fieldContainer, { width: 200 }]}
                        keyboardType="numeric"
                        onChangeText={text => this.setState({ kmsDriven: text })}
                        value={(this.state.kmsDriven) ? (`${this.state.kmsDriven}`.includes('.')
                          ? `${this.state.kmsDriven}`.split('.')[0]
                          : `${this.state.kmsDriven}`) : ''}
                        underlineColorAndroid="transparent" />
                    </View>
                    <View style={{ margin: 20, flex: 1 }} />
                  </View>
                  <View style={styles.calculateBtnView}>
                    <ButtonWithPlainText
                      title="Calculate"
                      style={[styles.calculateBtnStyle, { width: 200 }]}
                      handleSubmit={
                        () => this.calculateExchangeValue()
                      }
                      textStyle={styles.calculateBtnTextStyle}
                  />
                  </View>
                </View>
                <View style={styles.ecxhangeDetailOverView}>
                  <View style={styles.vehicleDropDownView}>
                    <View style={styles.dropDowmOverView}>
                      <Text style={[styles.detailTextInputStyle, { marginBottom: 10 }]}>
                    Exchange Value
                      </Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={[styles.detailTextInputStyle]}>
                          {constants.RUPEE}
                        </Text>
                        <TextInput
                          maxLength={5}
                          style={[styles.fieldContainer, { width: 300, marginLeft: 10, marginTop: 0 }]}
                          keyboardType="numeric"
                          onChangeText={text => this.setState({ exchangeValueAmount: text })}
                          value={(this.state.exchangeValueAmount)
                            ? (`${this.state.exchangeValueAmount}`.includes('.')
                              ? `${this.state.exchangeValueAmount}`.split('.')[0]
                              : `${this.state.exchangeValueAmount}`) : ''}
                          underlineColorAndroid="transparent" />
                      </View>
                    </View>
                  </View>
                  <View style={{
                    margin: 10, marginTop: 30, flex: 1, flexDirection: 'row-reverse'
                  }}>
                    <ButtonWithPlainText
                      title="Save"
                      disabled={this.state.exchangeValueAmount === '0' || this.state.exchangeValueAmount.length === 0}
                      style={[styles.calculateExchangeBtnStyle,
                        {
                          width: 200,
                          backgroundColor: (this.state.exchangeValueAmount === '0'
                        || this.state.exchangeValueAmount.length === 0) ? 'gray' : '#f37730'
                        }
                      ]}
                      handleSubmit={
                        () => this.saveExchangeBtnAction()
                      }
                      textStyle={styles.calculateExchangeBtnTextStyle}
                  />
                  </View>
                </View>
              </View>
            </ScrollView>
          </View>
        </Modal>
        <View style={styles.detailsSection}>
          <View style={styles.detailSectionView}>
            <View style={{ flex: 2 }}>
              {
            this.getDetailHeaderArray()
            }
            </View>
            <View style={[styles.detailValueView, { flex: 2 }]}>
              <View style={styles.PickerView}>
                <View style={styles.PickerBorderView}>
                  <SectionedMultiSelect
                    items={this.state.salaryCatagories || []}
                    styles={{
                      container: [styles.dropdownContainer, { maxHeight: 200 }],
                      selectDropdownTextField: styles.selectDropdownTextField,
                      button: styles.confirmBtn,
                      confirmText: styles.confirmText
                    }}
                    showCancelButton="true"
                    separator="true"
                    subSeparator="true"
                    uniqueKey="salary"
                    subKey="children"
                    displayKey="name"
                    single
                    hideSearch
                    expandDropDowns
                    onSelectedItemsChange={this.onSelectedSalaryDetailItemsChange}
                    selectedItems={this.state.selectedItems}
                    readOnlyHeadings
                    colors={{
                    }}
                  />
                </View>
              </View>
              <View style={styles.PickerView}>
                <View style={styles.PickerBorderView}>

                  <SectionedMultiSelect
                    items={this.state.domicileStatusList || []}
                    styles={{
                      container: [styles.dropdownContainer, { maxHeight: 200 }],
                      selectDropdownTextField: styles.selectDropdownTextField,
                      button: styles.confirmBtn,
                      confirmText: styles.confirmText
                    }}
                    showCancelButton="true"
                    separator="true"
                    subSeparator="true"
                    uniqueKey="id"
                    subKey="children"
                    displayKey="name"
                    single
                    hideSearch
                    expandDropDowns
                    onSelectedItemsChange={this.onSelectedDomicileStatusItemsChange}
                    selectedItems={this.state.selectedDomicileStatus}
                    readOnlyHeadings
                    colors={{
                    }}
                  />
                </View>
              </View>
              <View style={[styles.PickerView, { flex: 0.5 }]}>
                <View style={styles.PickerBorderView}>
                  <SectionedMultiSelect
                    items={this.state.advanceEmiList || []}
                    styles={{
                      container: [styles.dropdownContainer, { maxHeight: 200 }],
                      selectDropdownTextField: styles.selectDropdownTextField,
                      button: styles.confirmBtn,
                      confirmText: styles.confirmText
                    }}
                    showCancelButton="true"
                    separator="true"
                    subSeparator="true"
                    uniqueKey="id"
                    subKey="children"
                    displayKey="name"
                    single
                    hideSearch
                    expandDropDowns
                    onSelectedItemsChange={this.onSelectedAdvanceEmiItemsChange}
                    selectedItems={this.state.selectedAdvanceEmi}
                    readOnlyHeadings
                    colors={{
                    }}
                  />
                </View>
              </View>
              <View style={[styles.PickerView, { flex: 0.5 }]}>
                <View style={styles.PickerBorderView}>

                  <SectionedMultiSelect
                    items={this.state.tenureList || []}
                    styles={{
                      container: [styles.dropdownContainer, { maxHeight: 200 }],
                      selectDropdownTextField: styles.selectDropdownTextField,
                      button: styles.confirmBtn,
                      confirmText: styles.confirmText
                    }}
                    showCancelButton="true"
                    separator="true"
                    subSeparator="true"
                    uniqueKey="id"
                    subKey="children"
                    displayKey="name"
                    single
                    hideSearch
                    expandDropDowns
                    onSelectedItemsChange={this.onSelectedTenureItemsChange}
                    selectedItems={this.state.selectedTenure}
                    readOnlyHeadings
                    colors={{
                    }}
                  />
                </View>
              </View>
              <View style={[styles.PickerView, { flex: 0.5 }]}>
                <ButtonWithPlainText
                  title="Apply"
                  disabled={!this.state.isApplyEnabled}
                  style={
                    [styles.ApplyBtnStyle,
                      { backgroundColor: this.state.isApplyEnabled ? '#EF7432' : 'gray' }]
                  }
                  handleSubmit={
                    () => {
                      this.updateLead();
                    }
                  }
                  textStyle={
                    styles.ApplyBtnTextStyle
                  }
                  />
              </View>
            </View>

          </View>
        </View>
        <View style={styles.bankListSection}>
          <View style={{
            marginHorizontal: 30, marginTop: 20, marginBottom: 40, elevation: 10, backgroundColor: 'white'
          }}>
            <View style={[MyTeamStyles.tableWrapper, { backgroundColor: '#e9e9e9', elevation: 0, marginTop: 0 }]}>
              <View style={[MyTeamStyles.tableHeaderWrapper]}>
                <View style={[MyTeamStyles.flexOneRow, { flex: 2 }]}>
                  <Text style={MyTeamStyles.textSpacing}>Financier</Text>
                </View>
                <View style={[MyTeamStyles.flexOneRow]}>
                  <TouchableOpacity
                    style={{ flexDirection: 'row', alignItems: 'center' }}
                    onPress={() => this.sortTeam('loan_amount')}
                >
                    <Text style={MyTeamStyles.textSpacing}>
Loan(
                      {constants.RUPEE}
)
                    </Text>
                    <Icon
                      name={`sort${!this.state.currentSortBy
                        ? '' : this.state.currentSortBy === 'loan_amount_asc' ? '-desc'
                          : (this.state.currentSortBy === 'loan_amount_desc' ? '-asc' : '')}`}
                      size={15}
                      color="#f37e2e" />
                  </TouchableOpacity>
                </View>
                <View style={MyTeamStyles.flexOneRow}>
                  <TouchableOpacity
                    style={{ flexDirection: 'row', alignItems: 'center' }}
                    onPress={() => this.sortTeam('down_payment')}
                >
                    <Text style={MyTeamStyles.textSpacing}>
Downpayments(
                      {constants.RUPEE}
)
                    </Text>
                    <Icon
                      name={`sort${!this.state.currentSortBy
                        ? '' : this.state.currentSortBy === 'down_payment_asc' ? '-desc'
                          : (this.state.currentSortBy === 'down_payment_desc' ? '-asc' : '')}`}
                      size={15}
                      color="#f37e2e" />
                  </TouchableOpacity>
                </View>
                <View style={[MyTeamStyles.flexOneRow]}>
                  <TouchableOpacity
                    style={{ flexDirection: 'row', alignItems: 'center' }}
                    onPress={() => this.sortTeam('emi')}
                >
                    <Text style={MyTeamStyles.textSpacing}>
EMI(
                      {constants.RUPEE}
)
                    </Text>
                    <Icon
                      name={`sort${!this.state.currentSortBy
                        ? '' : this.state.currentSortBy === 'emi_asc' ? '-desc'
                          : (this.state.currentSortBy === 'emi_desc' ? '-asc' : '')}`}
                      size={15}
                      color="#f37e2e" />
                  </TouchableOpacity>
                </View>
                <View style={MyTeamStyles.flexOneRow}>
                  <Text style={MyTeamStyles.textSpacing}>Advanced EMI</Text>
                </View>
                <View style={MyTeamStyles.flexOneRow}>
                  <TouchableOpacity
                    style={{ flexDirection: 'row', alignItems: 'center' }}
                    onPress={() => this.sortTeam('tenure')}
                >
                    <Text style={MyTeamStyles.textSpacing}>Tenure</Text>
                    <Icon
                      name={`sort${!this.state.currentSortBy
                        ? '' : this.state.currentSortBy === 'tenure_asc' ? '-desc'
                          : (this.state.currentSortBy === 'tenure_desc' ? '-asc' : '')}`}
                      size={15}
                      color="#f37e2e" />
                  </TouchableOpacity>
                </View>
              </View>
              {/* table header end */}
              {/* table body */}
            </View>
            { this.state.localFinancierList && this.state.localFinancierList.length === 0
              ? (
                <View style={styles.newLeadsView}>
                  <Text style={styles.noLeadsText}>
                    No financier to show
                  </Text>
                </View>
              )
              : (
                <View>
                  {
                constants.TenureArray
                  .find(currentCategory => this.state.selectedTenure[0] === currentCategory.id).name === 'None'
                  ? (
                    <View style={styles.newLeadsView}>
                      <Text style={[MyTeamStyles.textSpacing, { fontSize: 18 }]}>
                          Please  select  the  tenure  to  view  finance  options
                      </Text>
                    </View>
                  )
                  : (
                    <ScrollView style={{ marginBottom: 10 }}>
                      {
                        this.state.localFinancierList && this.state.localFinancierList.map((item, index) => (
                          <TouchableOpacity
                            onPress={() => { this.setState({ selectedIndex: index }); }}
                            style={{
                              flex: 1, backgroundColor: 'white', height: 40, flexDirection: 'row'
                            }}>
                            <View
                              style={{
                                flex: 0.3, alignItems: 'center', justifyContent: 'center', width: 50
                              }}>
                              <Icon
                                name={(this.state.selectedIndex === index) ? 'dot-circle-o' : 'circle-thin'}
                                size={22}
                                color="#f37e2e" />
                            </View>
                            <Text style={[styles.detailValueTextStyle, { flex: 2, marginLeft: 10 }]}>
                              {item && item.name ? item.name : ''}
                            </Text>
                            <Text style={styles.detailValueTextStyle}>
                              {currencyFormatter(item && item.loan_amount ? item.loan_amount : 0).replace(constants.RUPEE, '')}
                            </Text>
                            <Text style={styles.detailValueTextStyle}>
                              {currencyFormatter(item && item.down_payment ? item.down_payment : 0).replace(constants.RUPEE, '')}
                            </Text>
                            <Text style={styles.detailValueTextStyle}>
                              {currencyFormatter(item && item.emi ? item.emi : 0).replace(constants.RUPEE, '')}
                            </Text>
                            <Text style={[styles.detailValueTextStyle]}>
                              {item.advance_emi}
                            </Text>
                            <Text style={[styles.detailValueTextStyle, { textAlign: 'center' }]}>
                              {item && item.tenure ? item.tenure : '' }
                            </Text>
                          </TouchableOpacity>
                        ))
                      }
                    </ScrollView>
                  )
                }
                </View>
              )
            }
          </View>
        </View>
        <View style={styles.continueSection}>
          <View style={styles.continueBtnView}>
            <BookTestRideButton
              disabled={this.state.selectedIndex === null || this.props.loading}
              title="CONTINUE"
              handleSubmit={this.continueBtnAction}
            />
          </View>
        </View>
      </View>
    );
  }
}
