/**
 * This Component renders the exchange vehicle slider. The representative
 * can make an entry of the exchange vehicle using this component.
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  View, Modal, Text, TextInput, TouchableOpacity, Image, Switch, ScrollView, Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import constants from '../../utils/constants';

// Styles
import styles from './offerPreferenceStyles';

// Components
import { ButtonWithPlainText } from '../../components/button/Button';
import ContinueSectionScreen from '../../components/ContinueSection/ContinueSectionScreen';
import SectionedMultiSelect from '../../components/multiSelectDropdown/sectioned-multi-select';

// Images
import Close from '../../assets/images/close.png';

// Action Methods
import {
  createExchangeVehicle,
  getExchangeVehicle,
  updateExchangeVehicle,
  getManufacturerList,
  getExchangeVehicleList,
  // getExchangeVariantList,
  getExchangePrice
} from '../../redux/actions/FinanceOnboarding/actionCreators';

// Storage
import { isNumeric } from '../../utils/validations';

@connect(
  state => ({
    exchangeVehicle: state.financierOnboarding.exchangeVehicle,
    manufacturerList: state.financierOnboarding.manufacturerList,
    exchangeVehicleList: state.financierOnboarding.exchangeVehicleList,
    exchangePrice: state.financierOnboarding.exchangePrice,
    lead: state.global.lead,
    currentUser: state.user.currentUser,
  }),
  {
    createExchangeVehicle,
    getExchangeVehicle,
    updateExchangeVehicle,
    getManufacturerList,
    getExchangeVehicleList,
    getExchangePrice
  }
)

export default class OfferpreferenceScreen extends Component {
  static propTypes = {
    handleOnBack: PropTypes.func.isRequired,
    navigation: PropTypes.object.isRequired,
    createExchangeVehicle: PropTypes.func.isRequired,
    exchangeVehicle: PropTypes.object,
    getExchangeVehicle: PropTypes.func.isRequired,
    updateExchangeVehicle: PropTypes.func.isRequired,
    getManufacturerList: PropTypes.func.isRequired,
    getExchangeVehicleList: PropTypes.func.isRequired,
    exchangeVehicleList: PropTypes.array,
    getExchangePrice: PropTypes.func.isRequired,
    exchangePrice: PropTypes.array,
    lead: PropTypes.object.isRequired,
    currentUser: PropTypes.object.isRequired,
  }

  static defaultProps = {
    exchangeVehicle: {},
    exchangeVehicleList: [],
    exchangePrice: {}
  }

  constructor() {
    super();
    this.state = {
      modalVisible: false,
      downPaymentvalue: '0',
      kmsDriven: null,
      excVehicleYear: null,
      exchangeValueAmount: '0',
      exchageVehicleDetails: null,
      lead: {},
      selectedManufacturerItems: [],
      selectedVehicleModelItems: [],
      selectedVariantItems: [],
      dirty: false
    };
  }

  static getDerivedStateFromProps(nextProps) {
    if (nextProps.lead && Object.keys(nextProps.lead).length > 0
     && nextProps.exchangeVehicle) {
      return {
        lead: nextProps.lead,
        downPaymentvalue: `${parseInt(nextProps.navigation.state.params.onRoadPrice, 10) * 0.25}`,
        localManufacturerList: [{
          children: nextProps.manufacturerList,
        }],
        localVehicleModelList: [{
          children: nextProps.exchangeVehicleList
        }],
      };
    }
  }

  componentDidMount() {
    const { lead } = this.props;
    if (this.props.currentUser && this.props.currentUser.dealerId) {
      this.props.getExchangeVehicle(
        this.props.currentUser.dealerId,
        lead.id,
        this.props.navigation.state.params.performaInvoiceId
      ).then(() => {
        this.setState({
          exchageVehicleDetails: (this.props.exchangeVehicle
            && Object.keys(this.props.exchangeVehicle).length !== 0)
            ? this.props.exchangeVehicle : null,
          exchangeValueAmount: (this.props.exchangeVehicle && Object.keys(this.props.exchangeVehicle).length !== 0
           && ('quoted_value' in this.props.exchangeVehicle) && this.props.exchangeVehicle.quoted_value !== null)
            ? this.props.exchangeVehicle.quoted_value : '0',
          kmsDriven: (this.props.exchangeVehicle && Object.keys(this.props.exchangeVehicle).length !== 0
           && ('kilometers_used' in this.props.exchangeVehicle) && this.props.exchangeVehicle.kilometers_used !== null)
            ? this.props.exchangeVehicle.kilometers_used : null,
          excVehicleYear: (this.props.exchangeVehicle && Object.keys(this.props.exchangeVehicle).length !== 0
           && ('variant_year' in this.props.exchangeVehicle) && this.props.exchangeVehicle.variant_year !== null)
            ? this.props.exchangeVehicle.variant_year : null,
          selectedManufacturerItems: (this.props.exchangeVehicle
             && Object.keys(this.props.exchangeVehicle).length !== 0
           && ('manufacturer' in this.props.exchangeVehicle) && this.props.exchangeVehicle.manufacturer !== null)
            ? [this.props.exchangeVehicle.manufacturer] : [],
          selectedVehicleModelItems: (this.props.exchangeVehicle
             && Object.keys(this.props.exchangeVehicle).length !== 0
           && ('vehicle' in this.props.exchangeVehicle) && this.props.exchangeVehicle.vehicle !== null)
            ? [this.props.exchangeVehicle.vehicle] : [],
          selectedVariantItems: (this.props.exchangeVehicle && Object.keys(this.props.exchangeVehicle).length !== 0
           && ('variant' in this.props.exchangeVehicle) && this.props.exchangeVehicle.variant !== null)
            ? [this.props.exchangeVehicle.variant] : [],
        });
      }).then(() => {
        if ((this.props.exchangeVehicle && Object.keys(this.props.exchangeVehicle).length !== 0
         && ('vehicle' in this.props.exchangeVehicle) && this.props.exchangeVehicle.vehicle !== null)) {
          const data = {
            manufacturer: this.props.exchangeVehicle.manufacturer
          };
          return this.props.getExchangeVehicleList(data).then(() => {
            this.setState({
              localVehicleModelList: this.props.exchangeVehicleList
            });
          });
        }
      });
    }
  }

  onexchangeVehicleSwitch = () => {
    this.props.getManufacturerList()
      .then(() => {
        this.showModelView(true);
      }).catch(() => {});
  }

  onDeleteIconPress = () => {
    const { lead } = this.state;
    if (this.props.currentUser && this.props.currentUser.dealerId) {
      const { exchageVehicleDetails } = this.state;
      exchageVehicleDetails.status = 'Inactive';
      this.props.updateExchangeVehicle(this.props.currentUser.dealerId, lead.id, exchageVehicleDetails).then(() => {
        this.setState({
          exchageVehicleDetails: null,
          exchangeValueAmount: '0',
          selectedManufacturerItems: [],
          selectedVehicleModelItems: [],
          selectedVariantItems: [],
          kmsDriven: null,
          excVehicleYear: null,
        });
      });
    }
  }

  onSelectedManufacturerItemsChange = selectedManufacturerItems => {
    this.setState({
      dirty: true,
      selectedManufacturerItems,
      selectedVehicleModelItems: []
    }, () => {
      this.getVehicleModelList(selectedManufacturerItems[0]);
    });
  }

  onSelectedVehicleModelItemsChange = selectedVehicleModelItems => {
    this.setState({
      dirty: true,
      selectedVehicleModelItems
    }, () => {
    });
  }

  onSelectedVariantItemsChange = selectedVariantItems => {
    this.setState({
      dirty: true,
      selectedVariantItems
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

  showModelView = visible => {
    this.setState({ modalVisible: visible });
  }

  gotoFinancierListing = () => {
    const { navigate } = this.props.navigation;
    navigate('FinancierListing', {
      performaInvoiceId: this.props.navigation.state.params.performaInvoiceId,
      leadDetailId: this.props.navigation.state.params.leadDetailId,
      onRoadPrice: this.props.navigation.state.params.onRoadPrice,
      downpayment: this.state.downPaymentvalue,
      currentLeadDetailObj: this.props.navigation.state.params.currentLeadDetailObj

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
    if (this.state.selectedManufacturerItems.length > 0
      && this.state.selectedVehicleModelItems.length > 0
       && this.state.kmsDriven
        && this.state.excVehicleYear
         && this.state.exchangeValueAmount) {
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
        if (this.state.exchageVehicleDetails && Object.keys(this.state.exchageVehicleDetails).length !== 0
           && ('id' in this.state.exchageVehicleDetails)) {
          exchangeVehicleObj.id = this.state.exchageVehicleDetails.id;
          this.props.updateExchangeVehicle(this.props.currentUser.dealerId, lead.id, exchangeVehicleObj).then(() => {
            this.setState({
              exchageVehicleDetails: (this.props.exchangeVehicle
                   && Object.keys(this.props.exchangeVehicle).length !== 0)
                ? this.props.exchangeVehicle : null,
              exchangeValueAmount: (this.props.exchangeVehicle
                   && Object.keys(this.props.exchangeVehicle).length !== 0
                 && ('quoted_value' in this.props.exchangeVehicle)
                  && this.props.exchangeVehicle.quoted_value !== null)
                ? this.props.exchangeVehicle.quoted_value : '0',
              kmsDriven: (this.props.exchangeVehicle && Object.keys(this.props.exchangeVehicle).length !== 0
                 && ('kilometers_used' in this.props.exchangeVehicle)
                  && this.props.exchangeVehicle.kilometers_used !== null)
                ? this.props.exchangeVehicle.kilometers_used : null,
              excVehicleYear: (this.props.exchangeVehicle && Object.keys(this.props.exchangeVehicle).length !== 0
                 && ('variant_year' in this.props.exchangeVehicle) && this.props.exchangeVehicle.variant_year !== null)
                ? this.props.exchangeVehicle.variant_year : null,
              selectedManufacturerItems: (this.props.exchangeVehicle
                   && Object.keys(this.props.exchangeVehicle).length !== 0
                 && ('manufacturer' in this.props.exchangeVehicle) && this.props.exchangeVehicle.manufacturer !== null)
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
              dirty: false
            });
          });
        } else {
          this.props.createExchangeVehicle(this.props.currentUser.dealerId, lead.id, exchangeVehicleObj).then(() => {
            this.setState({
              exchageVehicleDetails: (this.props.exchangeVehicle
                   && Object.keys(this.props.exchangeVehicle).length !== 0)
                ? this.props.exchangeVehicle : null,
              exchangeValueAmount: (this.props.exchangeVehicle
                   && Object.keys(this.props.exchangeVehicle).length !== 0
                 && ('quoted_value' in this.props.exchangeVehicle)
                  && this.props.exchangeVehicle.quoted_value !== null)
                ? this.props.exchangeVehicle.quoted_value : '0',
              kmsDriven: (this.props.exchangeVehicle && Object.keys(this.props.exchangeVehicle).length !== 0
                 && ('kilometers_used' in this.props.exchangeVehicle)
                  && this.props.exchangeVehicle.kilometers_used !== null)
                ? this.props.exchangeVehicle.kilometers_used : null,
              excVehicleYear: (this.props.exchangeVehicle && Object.keys(this.props.exchangeVehicle).length !== 0
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
                 && ('variant' in this.props.exchangeVehicle) && this.props.exchangeVehicle.variant !== null)
                ? [this.props.exchangeVehicle.variant] : [],
              modalVisible: false,
              dirty: false
            });
          });
        }
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

  render() {
    return (
      <View style={styles.container}>
        <Modal
          animationType="slide"
          transparent
          visible={this.state.modalVisible}
          onRequestClose={() => {
            this.setState({
              modalVisible: false,
              dirty: false,
              exchangeValueAmount: (this.state.exchageVehicleDetails !== null
                 && Object.keys(this.state.exchageVehicleDetails).length > 0) ? this.state.exchangeValueAmount : '0',
              selectedManufacturerItems: (this.state.exchageVehicleDetails !== null
                 && Object.keys(this.state.exchageVehicleDetails).length > 0) ? this.state.selectedManufacturerItems : [],
              selectedVehicleModelItems: (this.state.exchageVehicleDetails !== null
                 && Object.keys(this.state.exchageVehicleDetails).length > 0) ? this.state.selectedVehicleModelItems : [],
              selectedVariantItems: (this.state.exchageVehicleDetails !== null
                 && Object.keys(this.state.exchageVehicleDetails).length > 0) ? this.state.selectedVariantItems : [],
              kmsDriven: (this.state.exchageVehicleDetails !== null
                && Object.keys(this.state.exchageVehicleDetails).length > 0) ? this.state.kmsDriven : null,
              excVehicleYear: (this.state.exchageVehicleDetails !== null
                && Object.keys(this.state.exchageVehicleDetails).length > 0) ? this.state.excVehicleYear : null
            });
          }}
        >
          <View style={styles.modalContainer}>
            <ScrollView>
              <View style={styles.modalDataContainer}>
                <TouchableOpacity
                  style={styles.closeBtnView}
                  onPress={() => {
                    this.setState({
                      modalVisible: false,
                      dirty: false,
                      exchangeValueAmount: (this.state.exchageVehicleDetails !== null
                         && Object.keys(this.state.exchageVehicleDetails).length > 0)
                        ? this.state.exchangeValueAmount : '0',
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
                            disabled={(this.state.selectedManufacturerItems.length === 0)}
                            readOnlyHeadings
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
                        onChangeText={text => this.setState({ excVehicleYear: text, dirty: true })}
                        value={this.state.excVehicleYear}
                        underlineColorAndroid="transparent" />
                    </View>
                    <View style={styles.dropDowmOverView}>
                      <Text style={[styles.detailTextInputStyle]}>
                      Kms driven
                      </Text>
                      <TextInput
                        maxLength={5}
                        style={[styles.fieldContainer, { width: 200 }]}
                        keyboardType="numeric"
                        onChangeText={text => this.setState({ kmsDriven: text, dirty: true })}
                        value={(this.state.kmsDriven) ? (`${this.state.kmsDriven}`.includes('.')
                          ? `${this.state.kmsDriven}`.split('.')[0] : `${this.state.kmsDriven}`) : ''}
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
                          style={[styles.fieldContainer, styles.exchangeValueDropDown]}
                          keyboardType="numeric"
                          onChangeText={text => this.setState({ exchangeValueAmount: text, dirty: true })}
                          value={(this.state.exchangeValueAmount)
                            ? (`${this.state.exchangeValueAmount}`.includes('.')
                              ? `${this.state.exchangeValueAmount}`.split('.')[0]
                              : `${this.state.exchangeValueAmount}`) : ''}
                          underlineColorAndroid="transparent" />
                      </View>
                    </View>
                  </View>
                  <View style={styles.saveBtnView}>
                    <ButtonWithPlainText
                      disabled={!this.state.dirty}
                      title="Save"
                      style={[styles.calculateExchangeBtnStyle,
                        { width: 200, backgroundColor: this.state.dirty ? '#f37730' : 'gray' }]}
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
        <View style={{ flex: 1, flexDirection: 'column' }}>
          <View style={{
            flex: 7, margin: 50
          }}
           >
            <Text style={[styles.detailTextInputStyle]}>
           Downpayment Amount
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={[styles.detailTextInputStyle]}>
                {constants.RUPEE}
              </Text>
              <TextInput
                style={[styles.fieldContainer, { marginLeft: 10 }]}
                keyboardType="numeric"
                onChangeText={text => this.setState({ downPaymentvalue: text })}
                value={this.state.downPaymentvalue}
                underlineColorAndroid="transparent" />
            </View>
            {this.state.exchageVehicleDetails
            && (
            <View style={{
              marginVertical: 50
            }}
              >
              <Text style={[styles.detailTextInputStyle]}>
              Exchange value
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={[styles.detailTextInputStyle, { marginRight: 10 }]}>
                  {constants.RUPEE}
                </Text>
                <TextInput
                  style={[styles.fieldContainer]}
                  editable={false}
                  keyboardType="numeric"
                  onChangeText={text => this.setState({ exchangeValueAmount: text })}
                  value={(this.state.exchangeValueAmount)
                    ? (`${this.state.exchangeValueAmount}`.includes('.')
                      ? `${this.state.exchangeValueAmount}`.split('.')[0] : `${this.state.exchangeValueAmount}`) : '0'}
                  underlineColorAndroid="transparent" />
                <TouchableOpacity
                  style={styles.deleteIconView}
                  onPress={() => this.onDeleteIconPress()}
            >
                  <Icon
                    name="trash"
                    size={21}
                    color="#ff7561"
                    style={styles.thrashIconStyle} />
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                onPress={this.onexchangeVehicleSwitch}
                style={styles.editBtnViewStyle}
                >
                <View>
                  <Text style={styles.editBtntextStyle}>
                                    Edit
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
            )
}
            {!this.state.exchageVehicleDetails
            && (
            <View style={styles.exchangeOldBikeViewStyle}>
              <Text style={[styles.detailTextInputStyle, { alignSelf: 'center' }]}>
            Do you want to exchange an old bike?
              </Text>
              <Switch
                style={{ marginLeft: 20 }}
                onValueChange={this.onexchangeVehicleSwitch}
                thumbTintColor="#f2f2f2"
                onTintColor="#6fc511" />
            </View>
            )
}
          </View>
          <View style={styles.continueBtnContainer}>
            <ContinueSectionScreen
              title="Continue"
              continueBtnAction={this.gotoFinancierListing}
              backBtnAction={this.props.handleOnBack}
            />
          </View>
        </View>
      </View>
    );
  }
}
