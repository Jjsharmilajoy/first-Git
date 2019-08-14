/**
 * The Bike Price Details give detailed price split up of the selected vehicle.
 * Features like emailing proforma invoice, exchange vehicle and so on are
 * available in this screen.
 */
import React, { Component } from 'react';
import {
  View,
  ScrollView,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  Picker,
  Modal,
  TextInput,
  Alert,
  Switch,
  DatePickerAndroid,
  TimePickerAndroid
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Dropdown } from 'react-native-material-dropdown';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import RNPrint from 'react-native-print';
import moment from 'moment';
import { Popover, PopoverController } from 'react-native-modal-popover';
import Icon from 'react-native-vector-icons/FontAwesome';
import { StackActions, NavigationActions } from 'react-navigation';
import LinearGradient from 'react-native-linear-gradient';
import {
  createOffer,
  deleteOffer,
  createOtherCharges,
  deleteOtherCharges,
  sendEmail,
  sendSms,
  getUser,
  updateProformaAccessories,
  updateProformaColor,
  getProformaInvoice,
  getVehicleDetails
} from '../../redux/actions/PriceBreakdown/actionCreators';
import {
  persistVehicleDetails
} from '../../redux/actions/ProductDetail/actionCreators';

import styles from './bikePriceStyles';
import {
  BookTestRideButton,
  ButtonWithPlainText,
  ButtonWithRightImage,
  SecondaryButton
} from '../../components/button/Button';
import UserInput from '../../components/userInput/UserInput';
import offerTickIcon from '../../assets/images/ic_offer_applied.png';
import backIcon from '../../assets/images/ic_back.png';
import editIcon from '../../assets/images/edit.png';
import saveIcon from '../../assets/images/ic_save.png';
import offerIcon from '../../assets/images/ic_offer.png';
import selectedCb from '../../assets/images/ic_selected.png';
import unselectedCb from '../../assets/images/ic_unselected.png';
import Loader from '../../components/loader/Loader';
import {
  getLead, setLead, callToast, updateClickedPosition, clearLead, disableButton
} from '../../redux/actions/Global/actionCreators';
import {
  getFinancierLeadDetails,
  updateFinancierLeadDetails,
  sendOtp,
  resendOtp,
  verifyOtp
} from '../../redux/actions/DocumentUpload/actionCreators';
import Close from '../../assets/images/close.png';
import { resetScreens } from '../../actions/stackActions';
import {
  currencyFormatter, isNumeric, interestValidator, emailValidator, trimExtraspaces
} from '../../utils/validations';
import constants from '../../utils/constants';
import offerImage from '../../assets/images/OfferImage.png';

import {
  createExchangeVehicle,
  getExchangeVehicle,
  updateExchangeVehicle,
  getManufacturerList,
  getExchangeVehicleList,
  getExchangePrice
} from '../../redux/actions/FinanceOnboarding/actionCreators';

import {
  updateLeadDetail,
  postLeadFollowUp,
  updateLeadFollowUp,
  updateLeadDetailStatus,
  postComment
} from '../../redux/actions/LeadHistory/actionCreators';

import {
  getFinancierRepresentativeList,
} from '../../redux/actions/FinancierListing/actionCreators';

import SectionedMultiSelect from '../../components/multiSelectDropdown/sectioned-multi-select';
import { showIndicator, hideIndicator } from '../../redux/actions/Loader/actionCreators';

import variables from '../../theme/variables';
import fonts from '../../theme/fonts';

const AdvancedEmiArray = ['0', '1', '2', '3'];

@connect(state => ({
  createOfferResponse: state.priceBreakdown.createOfferResponse,
  deleteOfferResponse: state.priceBreakdown.deleteOfferResponse,
  createOtherChargeResponse: state.priceBreakdown.createOtherChargeResponse,
  deleteOtherChargeResponse: state.priceBreakdown.deleteOtherChargeResponse,
  accessoriesResponse: state.priceBreakdown.accessoriesResponse,
  updateResponse: state.priceBreakdown.updateResponse,
  proformaResponse: state.priceBreakdown.proformaResponse,
  vehicleResponse: state.priceBreakdown.vehicleResponse,
  // global loader
  globalLoading: state.loader.showIndicator,
  // local loader
  loading: state.priceBreakdown.loadingGroup || state.financierOnboarding.loadingGroup
  || state.leadHistory.loadingGroup || state.financierListing.loadingGroup,
  lead: state.global.lead,
  financierLead: state.documentUpload.financierLead,
  sendOtpObj: state.documentUpload.sendOtpObj,
  resendOtpObj: state.documentUpload.resendOtpObj,
  verifyOtpObj: state.documentUpload.verifyOtpObj,
  exchangeVehicle: state.financierOnboarding.exchangeVehicle,
  manufacturerList: state.financierOnboarding.manufacturerList,
  exchangeVehicleList: state.financierOnboarding.exchangeVehicleList,
  exchangePrice: state.financierOnboarding.exchangePrice,
  leadDetail: state.leadHistory.leadDetail,
  sendEmailResponse: state.priceBreakdown.sendEmailResponse,
  sendSmsResponse: state.priceBreakdown.sendSmsResponse,
  userObjResponse: state.priceBreakdown.userObjResponse,
  leadResponse: state.leadHistory.lead,
  updateLeadResponse: state.leadHistory.updateLeadResponse,
  currentUser: state.user.currentUser,
  financierRepresentativeList: state.financierListing.financierRepresentativeList,
  buttonState: state.global.buttonState
}), {
  getLead,
  clearLead,
  setLead,
  createOffer,
  deleteOffer,
  createOtherCharges,
  deleteOtherCharges,
  sendEmail,
  sendSms,
  getUser,
  updateProformaAccessories,
  updateProformaColor,
  getProformaInvoice,
  getVehicleDetails,
  getFinancierLeadDetails,
  updateFinancierLeadDetails,
  sendOtp,
  resendOtp,
  verifyOtp,
  createExchangeVehicle,
  getExchangeVehicle,
  updateExchangeVehicle,
  getManufacturerList,
  getExchangeVehicleList,
  getExchangePrice,
  updateLeadDetail,
  postLeadFollowUp,
  updateLeadFollowUp,
  callToast,
  updateLeadDetailStatus,
  postComment,
  updateClickedPosition,
  persistVehicleDetails,
  showIndicator,
  getFinancierRepresentativeList,
  hideIndicator,
  disableButton
})

class BikePriceDetails extends Component {
  static propTypes = {
    createOffer: PropTypes.func.isRequired,
    updateLeadDetail: PropTypes.func.isRequired,
    updateClickedPosition: PropTypes.func.isRequired,
    deleteOffer: PropTypes.func.isRequired,
    clearLead: PropTypes.func.isRequired,
    createOtherCharges: PropTypes.func.isRequired,
    deleteOtherCharges: PropTypes.func.isRequired,
    updateProformaAccessories: PropTypes.func.isRequired,
    getVehicleDetails: PropTypes.func.isRequired,
    updateProformaColor: PropTypes.func.isRequired,
    getProformaInvoice: PropTypes.func.isRequired,
    proformaResponse: PropTypes.object,
    createOfferResponse: PropTypes.object,
    deleteOfferResponse: PropTypes.object,
    createOtherChargeResponse: PropTypes.object,
    deleteOtherChargeResponse: PropTypes.object,
    updateResponse: PropTypes.object,
    vehicleResponse: PropTypes.object,
    accessoriesResponse: PropTypes.object,
    loading: PropTypes.bool.isRequired,
    globalLoading: PropTypes.bool.isRequired,
    navigation: PropTypes.object.isRequired,
    lead: PropTypes.object.isRequired,
    getLead: PropTypes.func.isRequired,
    setLead: PropTypes.func.isRequired,
    getFinancierLeadDetails: PropTypes.func.isRequired,
    financierLead: PropTypes.object,
    updateFinancierLeadDetails: PropTypes.func.isRequired,
    sendOtp: PropTypes.func.isRequired,
    sendOtpObj: PropTypes.object,
    resendOtp: PropTypes.func.isRequired,
    verifyOtp: PropTypes.func.isRequired,
    verifyOtpObj: PropTypes.object,
    createExchangeVehicle: PropTypes.func.isRequired,
    exchangeVehicle: PropTypes.object,
    getExchangeVehicle: PropTypes.func.isRequired,
    updateExchangeVehicle: PropTypes.func.isRequired,
    getExchangeVehicleList: PropTypes.func.isRequired,
    exchangeVehicleList: PropTypes.array,
    getExchangePrice: PropTypes.func.isRequired,
    exchangePrice: PropTypes.object,
    getManufacturerList: PropTypes.func.isRequired,
    leadDetail: PropTypes.object,
    sendEmail: PropTypes.func.isRequired,
    sendEmailResponse: PropTypes.object,
    sendSms: PropTypes.func.isRequired,
    sendSmsResponse: PropTypes.object,
    getUser: PropTypes.func.isRequired,
    userObjResponse: PropTypes.object,
    postLeadFollowUp: PropTypes.func.isRequired,
    updateLeadFollowUp: PropTypes.func.isRequired,
    callToast: PropTypes.func.isRequired,
    updateLeadDetailStatus: PropTypes.func.isRequired,
    postComment: PropTypes.func.isRequired,
    currentUser: PropTypes.object.isRequired,
    persistVehicleDetails: PropTypes.func.isRequired,
    showIndicator: PropTypes.func.isRequired,
    hideIndicator: PropTypes.func.isRequired,
    getFinancierRepresentativeList: PropTypes.func.isRequired,
    financierRepresentativeList: PropTypes.array,
    disableButton: PropTypes.func.isRequired,
    buttonState: PropTypes.bool.isRequired,
  }

  static defaultProps = {
    proformaResponse: {},
    createOfferResponse: {},
    deleteOfferResponse: {},
    createOtherChargeResponse: {},
    deleteOtherChargeResponse: {},
    updateResponse: {},
    vehicleResponse: {},
    accessoriesResponse: {},
    financierLead: {},
    sendOtpObj: {},
    verifyOtpObj: {},
    exchangeVehicle: {},
    exchangeVehicleList: [],
    exchangePrice: {},
    leadDetail: {},
    sendEmailResponse: {},
    sendSmsResponse: {},
    userObjResponse: {},
    financierRepresentativeList: [],
  }

  constructor(props) {
    super(props);
    this.state = {
      tempNonMandatoryAccessoryStorage: [],
      refreshList: false,
      modalVisible: false,
      offerValue: '',
      variantIndex: 0,
      variantValue: '',
      colorIndex: 0,
      mandatoryAccesoriesPrice: 0,
      nonMandatoryAccesoriesPrice: 0,
      isAccessory: false,
      priceBreakdownData: {},
      bikeDetails: {},
      totalOfferAmount: 0,
      totalOtherChargesAmount: 0,
      lead: this.props.lead,
      localfinancierLead: {},
      AdvancedEmiVal: '',
      emiVal: '',
      tenureVal: '',
      ROIVal: '',
      dirty: false,
      DetailHeaderArray: ['Financier', 'Loan', 'Interest', 'Downpayments', 'EMI', 'Tenure', 'Advance EMI'],
      currentModel: 'SendOtpView',
      otpTF: '',
      kmsDriven: null,
      excVehicleYear: null,
      exchangeValueAmount: '0',
      exchageVehicleDetails: null,
      selectedManufacturerItems: [],
      selectedVehicleModelItems: [],
      selectedVariantItems: [],
      isFollowUpComment: false,
      reasonText: '',
      availInsurance: true,
      totalInsuranceCharge: 0,
      isInsuranceForOneYearSelected: false,
      isFiveYearSelected: false,
      isZeroDepreciationSelected: false,
      isTPPremiumSelected: false,
      isCompulsaryPACoverSelected: false,
      isExtendedWarrantyEnabled: false,
      pristineSplitInsuranceState: {},
      otherChargesReasonText: '',
      otherChargesAmount: '',
      emailIdToSend: '',
      userObject: {},
      offerReasontext: '',
      insurances: [],
      showInsuranceSplitUp: true,
      date: '',
      time: '',
      scheduleFollowUp: false,
      hours: 0,
      minutes: 0,
      day: 0,
      months: 0,
      years: 0,
      followUpDone: false,
      referenceNoText: '',
      currentRefView: 'Invoice',
      loanAmount: '',
      downpayment: '',
      isFinanceOptionTapped: false,
      currentPopUpView: '',
      disableVerifyBtn: false,
      currentFinancierRep: {},
      bikeRemarks: null,
      bikeCondition: null,
      bikeConditions: [
        {
          id: 1,
          label: 'Excellent',
          value: 'Excellent'
        },
        {
          id: 2,
          label: 'Good',
          value: 'Good'
        },
        {
          id: 3,
          label: 'Satisfactory',
          value: 'Satisfactory'
        },
        {
          id: 3,
          label: 'Poor',
          value: 'Poor'
        }
      ]
    };
  }

  static getDerivedStateFromProps(nextProps) {
    if (nextProps.lead && nextProps.exchangeVehicle
      && nextProps.manufacturerList && nextProps.proformaResponse) {
      return {
        lead: {
          ...nextProps.lead
        },
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
    this.willFocusSubscription = this.props.navigation.addListener(
      'willFocus',
      () => {
        this.onInitialLoad();
      }
    );
  }

  componentWillUnmount() {
    this.willFocusSubscription.remove();
  }

  onInitialLoad = () => {
    let priceBreakdown;
    const leadId = this.props.navigation.state.params.leadDetail.lead_id;
    const leadDetailId = this.props.navigation.state.params.leadDetail.id;
    let proformaVariantIndex = 0;
    let proformaColorIndex = 0;
    let proformaVariantValue = '';
    let variantId;
    let colorId;
    this.props.showIndicator();
    Promise.all([
      this.props.getLead(leadId),
      this.props.getProformaInvoice(leadId, leadDetailId),
      this.props.getVehicleDetails(this.props.navigation.state.params.leadDetail.vehicle_id)
    ]).then(() => {
      const currentLeadDetailObj = Object.keys(this.props.lead).length > 0 && this.props.lead.lead_details &&
      this.props.lead.lead_details.length > 0 && this.props.lead.lead_details.find(currentleaddetail => this.props.navigation.state.params.leadDetail.id === currentleaddetail.id);
      if (currentLeadDetailObj.financier_lead.length > 0) {
        return this.props.getFinancierLeadDetails(currentLeadDetailObj.financier_lead[0].id);
      }
    }).then(() => {
      const { lead } = this.state;
      if (this.props.currentUser && this.props.currentUser.dealerId && this.props.proformaResponse
        && this.props.proformaResponse.proformaInvoice && this.props.proformaResponse.proformaInvoice.id) {
        return this.props.getExchangeVehicle(
          this.props.currentUser.dealerId,
          lead.id,
          this.props.proformaResponse.proformaInvoice.id
        );
      }
    }).then(() => {
      if ((this.props.exchangeVehicle
        && Object.keys(this.props.exchangeVehicle).length !== 0
        && ('vehicle' in this.props.exchangeVehicle) && this.props.exchangeVehicle.vehicle !== null)) {
        const data = {
          manufacturer: this.props.exchangeVehicle.manufacturer
        };
        return this.props.getExchangeVehicleList(data);
      }
    })
      .then(() => {
        const currentLeadDetailObj = Object.keys(this.props.lead).length > 0 && this.props.lead.lead_details &&
        this.props.lead.lead_details.length > 0 && this.props.lead.lead_details.find(currentleaddetail => this.props.navigation.state.params.leadDetail.id === currentleaddetail.id);
        priceBreakdown = { ...this.props.proformaResponse };
        priceBreakdown.nonMandatoryAccessories.map(item => {
          priceBreakdown.proformaInvoice.proforma_invoice_accessory.forEach(invoiceItem => {
            if (invoiceItem.dealer_accessory.id === item.id) {
              item.isChecked = true;
            }
          });
          item.isChecked = item.isChecked || false;
          return item;
        });
        variantId = currentLeadDetailObj.variant_id;
        // variantId = priceBreakdown.proformaInvoice.variant_id;
        colorId = currentLeadDetailObj.variant_colour_id;
        this.props.vehicleResponse.variants.forEach((variant, index) => {
          if (variant.id === variantId) {
            proformaVariantIndex = index;
            proformaVariantValue = variant.name;
          }
          variant.colors.forEach((color, colorIndex) => {
            if (color.id === colorId) {
              proformaColorIndex = colorIndex;
            }
          });
        });
        if (this.props.financierLead && this.props.financierLead.status === 500
          && this.state.DetailHeaderArray.length === 7) {
          this.state.DetailHeaderArray.push('');
        }
        const vehicle_price = priceBreakdown
              && priceBreakdown.proformaInvoice && priceBreakdown.proformaInvoice.vehicle_price
              && priceBreakdown.proformaInvoice.vehicle_price;
        const totalInsurance = vehicle_price.vehicle_insurances.filter(item => item.type === constants.TOTAL_AMOUNT);

        const leadDetail = priceBreakdown
        && priceBreakdown.proformaInvoice && priceBreakdown.proformaInvoice.lead_detail
        && priceBreakdown.proformaInvoice.lead_detail;
        const premium_validity = leadDetail.od_premium_validity;
        const isTPPremiumSelected = leadDetail.tp_premium;
        const isCompulsaryPACoverSelected = leadDetail.compulsory_pa_cover;
        const isZeroDepreciationSelected = leadDetail.zero_depreciation;
        const isExtendedWarrantyEnabled = leadDetail.extended_warranty;
        const isInsuranceForOneYearSelected = premium_validity === 1;
        const isFiveYearSelected = premium_validity === 5;
        this.setState({
          localVehicleModelList: this.props.exchangeVehicleList,
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
          bikeCondition: (this.props.exchangeVehicle
            && Object.keys(this.props.exchangeVehicle).length !== 0
            && ('condition' in this.props.exchangeVehicle)
            && this.props.exchangeVehicle.condition !== null)
            ? this.props.exchangeVehicle.condition : null,
          bikeRemarks: (this.props.exchangeVehicle
            && Object.keys(this.props.exchangeVehicle).length !== 0
            && ('remarks' in this.props.exchangeVehicle)
            && this.props.exchangeVehicle.remarks !== null)
            ? this.props.exchangeVehicle.remarks : null,
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
          DetailHeaderArray: this.state.DetailHeaderArray,
          localfinancierLead: Object.keys(this.props.lead).length > 0 && this.props.lead.lead_details &&
          this.props.lead.lead_details.length > 0 && this.props.lead.lead_details
            .find(currentleaddetail => this.props.navigation.state.params.leadDetail.id === currentleaddetail.id).financier_lead.length > 0 ?
            { ...this.props.financierLead } : {},
          AdvancedEmiVal: `${this.props.financierLead.advance_emi}`,
          emiVal: `${this.props.financierLead.emi}`,
          tenureVal: this.props.financierLead.tenure,
          ROIVal: this.props.financierLead.interest_percentage,
          refreshList: !this.state.refreshList,
          loanAmount: this.props.financierLead.loan_amount,
          downpayment: `${this.props.financierLead.down_payment}`,
          priceBreakdownData: priceBreakdown,
          insurances: vehicle_price.vehicle_insurances,
          showInsuranceSplitUp: vehicle_price.is_insurance_split,
          isFiveYearSelected,
          isInsuranceForOneYearSelected,
          isTPPremiumSelected,
          isCompulsaryPACoverSelected,
          isZeroDepreciationSelected,
          isExtendedWarrantyEnabled,
          totalInsuranceCharge: totalInsurance.length > 0 ? totalInsurance[0].amount : 0,
          availInsurance: (priceBreakdown
            && priceBreakdown.proformaInvoice && priceBreakdown.proformaInvoice.lead_detail
            && priceBreakdown.proformaInvoice.lead_detail.total_insurance_amount) ?
            priceBreakdown.proformaInvoice.lead_detail.total_insurance_amount !== 0 : false,
          emailIdToSend: (priceBreakdown
              && priceBreakdown.proformaInvoice && priceBreakdown.proformaInvoice.lead
              && priceBreakdown.proformaInvoice.lead.email) ? priceBreakdown.proformaInvoice.lead.email : '',
          totalOfferAmount:
              this.getTotalOfferAmount(priceBreakdown.proformaInvoice.proforma_invoice_offer),
          totalOtherChargesAmount:
              this.getTotalOtherChargesAmount(priceBreakdown.proformaInvoice.proforma_invoice_other_charges),
          bikeDetails: this.props.vehicleResponse,
          variantIndex: proformaVariantIndex,
          variantValue: proformaVariantValue,
          colorIndex: proformaColorIndex,
          mandatoryAccesoriesPrice:
              this.getTotalAccessoryPrice(priceBreakdown.mandatoryAccessories, []),
          nonMandatoryAccesoriesPrice:
              this.getTotalAccessoryPrice([], priceBreakdown.proformaInvoice.proforma_invoice_accessory),
          pristineSplitInsuranceState: this.getPristineSplitInsuranceState(leadDetail)
        });
        this.props.hideIndicator();
      })
      .catch(err => {
        console.log(err);
      });
  }

  onDeleteIconPress = () => {
    // this.props.disableButton();
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
      })
        .catch(() => { });
    }
  }

  onexchangeVehicleSwitch = () => {
    // this.props.disableButton();
    this.props.getManufacturerList()
      .then(() => {
        this.setState({
          currentPopUpView: constants.EXCHANGE_POPUPVIEW,
          modalVisible: true
        }, () => {
        });
      });
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

  getDetailHeaderArray = () => (
    <View style={[styles.detailHeaderView, { flex: 1 }]}>
      {
        this.state.DetailHeaderArray.map(currentheader => (
          <View style={styles.detailHeaderTitleView}>
            <Text style={styles.detailTitleTextStyle}>
              {currentheader}
            </Text>
          </View>
        ))
      }
    </View>
  )

  getTotalOfferAmount = offers => {
    let totalOffer = 0;
    if (offers.length > 0) {
      offers.forEach(item => {
        totalOffer += Number(item.amount);
      });
    }
    return totalOffer;
  }

  getTotalOtherChargesAmount = otherCharges => {
    let totalOtherCharges = 0;
    if (otherCharges.length > 0) {
      otherCharges.forEach(item => {
        totalOtherCharges += Number(item.amount);
      });
    }
    return totalOtherCharges;
  }

  getTotalAccessoryPrice = (mandatoryAccessories, nonMandatoryAccessories) => {
    let totalPrice = 0;
    if (mandatoryAccessories.length > 0) {
      mandatoryAccessories.forEach(item => {
        totalPrice += Number(item.price || 0);
      });
    }
    if (nonMandatoryAccessories.length > 0) {
      nonMandatoryAccessories.forEach(item1 => {
        totalPrice += Number(item1.dealer_accessory.price || 0);
      });
    }
    return totalPrice;
  }

  getVehicleModelList = item => {
    const data = {
      manufacturer: item
    };
    this.props.getExchangeVehicleList(data).then(() => {
    });
  }

  onChangeText = (param, value) => {
    if (param === 'offer') {
      this.setState({ offerValue: value });
    }
    if (param === 'otherChargesAmount') {
      this.setState({ otherChargesAmount: value });
    }
    if (param === 'otherChargesReasonText') {
      this.setState({ otherChargesReasonText: value });
    }
    if (param === 'Email') {
      this.setState({ emailIdToSend: value });
    }
    if (param === 'Offer reason') {
      this.setState({ offerReasontext: value });
    }
  }

  onModalShow = () => {
    // // this.props.disableButton();
    const { priceBreakdownData, tempNonMandatoryAccessoryStorage } = this.state;
    // const temp = priceBreakdownData.nonMandatoryAccessories.slice();
    // let temp = [];
    priceBreakdownData.nonMandatoryAccessories.map(item => {
      priceBreakdownData.proformaInvoice.proforma_invoice_accessory.forEach(invoiceItem => {
        if (invoiceItem.dealer_accessory.id === item.id) {
          item.isChecked = true;
        }
      });
      item.isChecked = item.isChecked || false;
      return item;
    });
    Object.assign(tempNonMandatoryAccessoryStorage, priceBreakdownData.nonMandatoryAccessories);
    this.setState({
      priceBreakdownData,
      isAccessory: true,
      currentPopUpView: constants.ACCESSORIES_POPUPVIEW,
      // tempNonMandatoryAccessoryStorage: temp,
      modalVisible: true
    });
  }

  extendedWarrantyBtnTapped = () => {
    // this.props.disableButton();
    const { priceBreakdownData } = this.state;
    priceBreakdownData.nonMandatoryAccessories.map(item => {
      priceBreakdownData.proformaInvoice.proforma_invoice_accessory
        .forEach(invoiceItem => {
          if (invoiceItem.dealer_accessory.id === item.id) {
            item.isChecked = true;
          }
        });
      item.isChecked = item.isChecked || false;
      return item;
    });
    this.setState(
      {
        priceBreakdownData,
        isExtendedWarrantyEnabled: !this.state.isExtendedWarrantyEnabled
      },
      () => {
        this.updateProformaAccessories();
      }
    );
  }

  otherChargesAddBtnTapped = () => {
    // this.props.disableButton();
    this.setState({
      modalVisible: true,
      currentPopUpView: constants.OTHERCHARGES_POPUPVIEW,
    });
  }

  insuranceBtnTapped = () => {
    // this.props.disableButton();
    this.setState({
      currentPopUpView: constants.INSURANCE_POPVIEW,
      modalVisible: true
    });
  }

  onPickerChange = currentItem => {
    this.setState({
      AdvancedEmiVal: currentItem,
      dirty: true
    });
  }

  updateProformaInvoice = index => {
    const { bikeDetails, colorIndex, priceBreakdownData } = this.state;
    if (this.props.currentUser && this.props.currentUser.dealerId) {
      const colorData = {
        dealer_id: this.props.currentUser.dealerId,
        vehicle_id: bikeDetails.id,
        variant_id: bikeDetails.variants[index].id,
        variant_colour_id: bikeDetails.variants[index].colors[colorIndex].id
      };
      this.props.persistVehicleDetails({
        currentVariantDetails: bikeDetails.variants[index],
        currentVehicleColorObject: bikeDetails.variants[index].colors[colorIndex]
      });
      this.props.updateProformaColor(priceBreakdownData.proformaInvoice.id, colorData)
        .then(() => {
          if (this.state.lead && this.state.lead.lead_details && this.state.lead.lead_details.length > 0) {
            this.state.lead.lead_details.map(currentLeadDeatil => {
              if (this.props.navigation.state.params.leadDetail.id === currentLeadDeatil.id) {
                currentLeadDeatil.variant_id = bikeDetails.variants[index].id;
                currentLeadDeatil.variant_colour_id = bikeDetails.variants[index].colors[colorIndex].id;
              }
              return currentLeadDeatil;
            });
          }
          this.props.setLead(this.state.lead);
          const priceBreakdown = {
            ...this.props.updateResponse
          };
          const leadDetail = priceBreakdown
            && priceBreakdown.proformaInvoice && priceBreakdown.proformaInvoice.lead_detail
            && priceBreakdown.proformaInvoice.lead_detail;
          const premium_validity = leadDetail.od_premium_validity;
          const insurances = priceBreakdown
          && priceBreakdown.proformaInvoice && priceBreakdown.proformaInvoice.vehicle_price
          && priceBreakdown.proformaInvoice.vehicle_price.vehicle_insurances;
          const totalInsurance = insurances.filter(item => item.type === constants.TOTAL_AMOUNT);
          this.setState({
            insurances,
            isFiveYearSelected: premium_validity === 5,
            isInsuranceForOneYearSelected: premium_validity === 1,
            isCompulsaryPACoverSelected: leadDetail.compulsory_pa_cover,
            isZeroDepreciationSelected: leadDetail.zero_depreciation,
            isExtendedWarrantyEnabled: leadDetail.extended_warranty,
            emailIdToSend: (priceBreakdown
                && priceBreakdown.proformaInvoice && priceBreakdown.proformaInvoice.lead
                && priceBreakdown.proformaInvoice.lead.email) ? priceBreakdown.proformaInvoice.lead.email : '',
            variantIndex: index,
            colorIndex: 0,
            showInsuranceSplitUp: priceBreakdown
            && priceBreakdown.proformaInvoice && priceBreakdown.proformaInvoice.vehicle_price
            && priceBreakdown.proformaInvoice.vehicle_price.is_insurance_split,
            totalInsuranceCharge: totalInsurance.length > 0 ? totalInsurance[0].amount : 0,
            availInsurance: (priceBreakdown
              && priceBreakdown.proformaInvoice && priceBreakdown.proformaInvoice.lead_detail
              && priceBreakdown.proformaInvoice.lead_detail.total_insurance_amount) ?
              priceBreakdown.proformaInvoice.lead_detail.total_insurance_amount !== 0 : false,
            priceBreakdownData: priceBreakdown,
            totalOfferAmount:
              this.getTotalOfferAmount(priceBreakdown.proformaInvoice.proforma_invoice_offer),
            totalOtherChargesAmount:
              this.getTotalOtherChargesAmount(priceBreakdown.proformaInvoice.proforma_invoice_other_charges)
          });
        }).catch(error => {
          console.log(error);
        });
    }
  }

  updateProformaInvoiceColor = index => {
    // this.props.disableButton();
    const {
      bikeDetails, priceBreakdownData, variantIndex
    } = this.state;
    if (this.props.currentUser && this.props.currentUser.dealerId) {
      const colorData = {
        dealer_id: this.props.currentUser.dealerId,
        vehicle_id: bikeDetails.id,
        variant_id: bikeDetails.variants[variantIndex].id,
        variant_colour_id: bikeDetails.variants[variantIndex].colors[index].id
      };
      this.props.persistVehicleDetails({
        currentVariantDetails: bikeDetails.variants[variantIndex],
        currentVehicleColorObject: bikeDetails.variants[variantIndex].colors[index]
      });
      this.props.updateProformaColor(
        priceBreakdownData.proformaInvoice.id,
        colorData
      )
        .then(() => {
          let leadDetails;
          if (this.state.lead && this.state.lead.lead_details && this.state.lead.lead_details.length > 0) {
            leadDetails = this.state.lead.lead_details.map(currentLeadDeatil => {
              if (this.props.navigation.state.params.leadDetail.id === currentLeadDeatil.id) {
                currentLeadDeatil.variant_id = bikeDetails.variants[variantIndex].id;
                currentLeadDeatil.variant_colour_id = bikeDetails.variants[variantIndex].colors[index].id;
              }
              return currentLeadDeatil;
            });
          }
          this.setState({
            lead: {
              ...this.state.lead,
              lead_details: leadDetails
            },
            colorIndex: index,
            priceBreakdownData: this.props.updateResponse,
            totalOfferAmount:
              this.getTotalOfferAmount(this.props.updateResponse.proformaInvoice.proforma_invoice_offer),
            totalOtherChargesAmount:
              this.getTotalOtherChargesAmount(this.props.updateResponse.proformaInvoice.proforma_invoice_other_charges)
          }, () => {
            this.props.setLead(this.state.lead);
          });
        }).catch(error => {
          console.log(error);
        });
    }
  }

  createBikeOffer = () => {
    // this.props.disableButton();
    const { priceBreakdownData } = this.state;
    if (trimExtraspaces(this.state.offerReasontext).length > 0) {
      if (isNumeric(this.state.offerValue)) {
        if (priceBreakdownData.proformaInvoice.id) {
          const offerData = {
            amount: Number(this.state.offerValue),
            name: this.state.offerReasontext,
            proforma_invoice_id: priceBreakdownData.proformaInvoice.id
          };
          this.props.createOffer(priceBreakdownData.proformaInvoice.id, offerData)
            .then(() => {
              this.setState({
                priceBreakdownData: this.props.createOfferResponse,
                totalOfferAmount:
                  this.getTotalOfferAmount(this.props.createOfferResponse.proformaInvoice.proforma_invoice_offer),
                modalVisible: false
              });
            })
            .catch(error => {
              console.log(error);
            });
        }
      } else {
        Alert.alert(
          'Alert',
          'Plese enter a valid amount',
          [
            { text: 'OK', onPress: () => { } },
          ],
          { cancelable: false }
        );
      }
    } else {
      Alert.alert(
        'Message',
        'Description should not be empty',
        [
          { text: 'OK', onPress: () => { } },
        ],
        { cancelable: false }
      );
    }
  }

  createBikeOtherCharges = () => {
    // this.props.disableButton();
    const { priceBreakdownData } = this.state;
    if (trimExtraspaces(this.state.otherChargesReasonText).length > 0) {
      if (isNumeric(this.state.otherChargesAmount)) {
        if (priceBreakdownData.proformaInvoice.id) {
          const otherChargesData = {
            amount: Number(this.state.otherChargesAmount),
            name: trimExtraspaces(this.state.otherChargesReasonText),
            proforma_invoice_id: priceBreakdownData.proformaInvoice.id
          };
          this.props.createOtherCharges(priceBreakdownData.proformaInvoice.id, otherChargesData)
            .then(() => {
              this.setState({
                priceBreakdownData: this.props.createOtherChargeResponse,
                otherChargesAmount: '',
                otherChargesReasonText: '',
                totalOtherChargesAmount:
                  // eslint-disable-next-line
                  this.getTotalOtherChargesAmount(this.props.createOtherChargeResponse.proformaInvoice.proforma_invoice_other_charges),
                modalVisible: false,
              });
            })
            .catch(error => {
              console.log(error);
            });
        }
      } else {
        Alert.alert(
          'Message',
          'Plese enter valid amount',
          [
            { text: 'OK', onPress: () => { } },
          ],
          { cancelable: false }
        );
      }
    } else {
      Alert.alert(
        'Message',
        'Reason should not be empty',
        [
          { text: 'OK', onPress: () => { } },
        ],
        { cancelable: false }
      );
    }
  }

  validateBikeOffer = () => {
    const values = [0 - 9];
    return values.test(this.state.offerValue);
  }

  deleteBikeOffer = item => {
    // this.props.disableButton();
    this.props.deleteOffer(item.proforma_invoice_id, item.id)
      .then(() => {
        this.setState({
          priceBreakdownData: this.props.deleteOfferResponse,
          mandatoryAccesoriesPrice:
            this.getTotalAccessoryPrice(
              this.props.deleteOfferResponse.mandatoryAccessories,
              []
            ),
          nonMandatoryAccesoriesPrice:
            this.getTotalAccessoryPrice(
              [],
              this.props.deleteOfferResponse.proformaInvoice.proforma_invoice_accessory
            ),
          totalOfferAmount:
            // eslint-disable-next-line
            this.getTotalOfferAmount(this.props.deleteOfferResponse.proformaInvoice.proforma_invoice_offer)
        });
      }).catch(error => {
        console.log(error);
      });
  }

  deleteBikeOtherCharges = item => {
    // // this.props.disableButton();
    this.props.deleteOtherCharges(item.proforma_invoice_id, item.id)
      .then(() => {
        this.setState({
          priceBreakdownData: this.props.deleteOtherChargeResponse,
          mandatoryAccesoriesPrice:
            this.getTotalAccessoryPrice(
              this.props.deleteOtherChargeResponse.mandatoryAccessories,
              []
            ),
          nonMandatoryAccesoriesPrice:
            this.getTotalAccessoryPrice(
              [],
              this.props.deleteOtherChargeResponse.proformaInvoice.proforma_invoice_accessory
            ),
          totalOfferAmount:
            this.getTotalOfferAmount(this.props.deleteOtherChargeResponse.proformaInvoice.proforma_invoice_offer),
          totalOtherChargesAmount:
            // eslint-disable-next-line
            this.getTotalOtherChargesAmount(this.props.deleteOtherChargeResponse.proformaInvoice.proforma_invoice_other_charges)
        });
      }).catch(error => {
        console.log(error);
      });
  }

  continueBtntapped = () => {
    // this.props.disableButton();
    if (emailValidator(this.state.emailIdToSend)) {
      this.state.userObject.email = this.state.emailIdToSend;
      const data = {
        is_email: true,
        email: this.state.emailIdToSend
      };
      this.props.sendEmail(
        this.state.priceBreakdownData.proformaInvoice.dealer_id,
        this.state.priceBreakdownData.proformaInvoice.id, data
      ).then(() => {
        Alert.alert(
          'Message',
          'Email sent successfully.',
          [
            {
              text: 'OK',
              onPress: () => {
                this.setState({
                  emailIdToSend: '',
                  modalVisible: false
                });
              }
            },
          ],
          { cancelable: false }
        );
      }, error => {
        if (error && error.err && !error.err.message.includes('invalidaccesstoken')) {
          Alert.alert(
            'Message',
            error && error.err ? error.err.message : '',
            [
              {
                text: 'ok',
                onPress: () => {
                }
              },
            ],
            { cancelable: false }
          );
        }
      });
    } else {
      Alert.alert(
        'Message',
        'Enter a valid email',
        [
          {
            text: 'OK',
            onPress: () => {
              this.setState({
                emailIdToSend: ''
              });
            }
          },
        ],
        { cancelable: false }
      );
    }
  }

  onHandlePrintOut = () => {
    this.props.disableButton(5000);
    const data = {
      is_email: false
    };
    const { priceBreakdownData } = this.state;
    const { dealerId } = this.props.currentUser;
    if (dealerId && priceBreakdownData && priceBreakdownData.proformaInvoice && priceBreakdownData.proformaInvoice.id) {
      this.props.sendEmail(
        dealerId,
        priceBreakdownData.proformaInvoice.id, data
      ).then(() => {
        if (this.props.sendEmailResponse && this.props.sendEmailResponse.html) {
          this.printHTML(this.props.sendEmailResponse.html);
        }
      }).catch(error => {
        console.log(error);
      });
    }
  }

  sendMessage = () => {
    const { priceBreakdownData } = this.state;
    const { dealerId } = this.props.currentUser;
    if (dealerId && priceBreakdownData && priceBreakdownData.proformaInvoice && priceBreakdownData.proformaInvoice.id) {
      this.props.sendSms(
        dealerId,
        priceBreakdownData.proformaInvoice.id, {}
      ).then(() => {
        Alert.alert(
          'Message',
          this.props.sendSmsResponse,
          [ { text: 'OK' } ],
          { cancelable: false }
        );
      }).catch(error => {
        console.log('smsError', error);
      });
    }
  }

  invoiceBtnTapped = () => {
    // this.props.disableButton();
    Alert.alert(
      '',
      'Would you like to invoice the vehicle?',
      [
        {
          text: 'Yes',
          onPress: () => {
            if (Object.keys(this.state.localfinancierLead).length !== 0
              && this.state.localfinancierLead.status !== 520) {
              Alert.alert(
                'Info',
                // 'Vehicle is under loan processing',
                'Vehicle cannot be invoiced as loan is applied.',
                [
                  {
                    text: 'Ok',
                    onPress: () => { }
                  },
                  {
                    text: 'Cancel',
                    onPress: () => { },
                    style: 'cancel'
                  }
                ],
                { cancelable: false }
              );
            } else {
              this.setState({
                currentPopUpView: constants.REFERENCE_POPUPVIEW,
                modalVisible: true,
                currentRefView: 'Invoice'
              });
            }
          }
        },
        {
          text: 'No',
          onPress: () => {
          },
          style: 'cancel'
        },
      ],
      { cancelable: false }
    );
  }

  checkForFinanceOptiontOfOtherLeaddetails = item => {
    let findLeadExist = false;
    if (this.props.lead && this.props.lead.lead_details) {
      this.props.lead.lead_details.map(currentEnq => {
        if (currentEnq.vehicle_id !== item.vehicle_id) {
          if (currentEnq && ('financier_lead' in currentEnq) &&
            currentEnq.financier_lead.length > 0) {
            findLeadExist = true;
          }
        }
        return currentEnq;
      });
    }
    return findLeadExist;
  }

  invoicingLead = () => {
    const { lead } = this.props;
    const getMessage = name => `lead ${name} updated successfully!!`;
    const currentLeadDetailObj = Object.keys(this.props.lead).length > 0 && this.props.lead.lead_details &&
    this.props.lead.lead_details.length > 0 && this.props.lead.lead_details
        .find(currentleaddetail => this.props.navigation.state.params.leadDetail.id === currentleaddetail.id);
    if (this.props.lead.lead_details.length === 1) {
      this.props.updateLeadDetailStatus(lead.id, currentLeadDetailObj.id, {
        markAsNew: false,
        invoice_id: trimExtraspaces(this.state.referenceNoText)
      })
        .then(async ({ response }) => {
          try {
            const updatedLead = response;
            await this.props.setLead(updatedLead);
            await this.props.callToast(`lead ${updatedLead.name} updated successfully!!`);
            // if (this.props.navigation.state.params.fromScreen === 'FromFilterProducts' ||
            // this.props.navigation.state.params.fromScreen === 'fromUploadDocument') {
            await this.props.updateClickedPosition(1);
            const resetAction = StackActions.reset({
              index: 2,
              actions: [
                NavigationActions.navigate({ routeName: 'Dashboard' }),
                NavigationActions.navigate({ routeName: 'NewLeadsOverview' }),
                NavigationActions.navigate({
                  routeName: 'LeadHistory',
                  params: {
                    leadId: this.props.lead.id,
                    variantValue: this.state.variantValue,
                    currentDealerId: this.props.currentUser.dealerId
                  }
                }),
              ],
            });
            this.props.navigation.dispatch(resetAction);
            // } else {
            //   const { navigation } = this.props;
            //   navigation.pop(2);
            // }
            this.setState({
              referenceNoText: ''
            });
          } catch (error) {
            console.log(error);
          }
        }, error => {
          if (error && error.err && !error.err.message.includes('invalidaccesstoken')) {
            Alert.alert(
              '',
              error && error.err ? error.err.message : '',
              [
                {
                  text: 'ok',
                  onPress: () => {
                    this.setState({
                      referenceNoText: ''
                    });
                  }
                },
              ],
              { cancelable: false }
            );
          }
        });
    } else {
      Alert.alert(
        '',
        'Would you like to buy any other enquired vehicle(s)?',
        [
          {
            text: 'Yes',
            onPress: () => this.props.updateLeadDetailStatus(lead.id, currentLeadDetailObj.id, {
              markAsNew: true,
              invoice_id: this.state.referenceNoText
            })
              .then(async ({ response }) => {
                try {
                  const updatedLead = response;
                  await this.props.setLead(updatedLead);
                  await this.props.callToast(getMessage(updatedLead.name));
                  // if (this.props.navigation.state.params.fromScreen === 'FromFilterProducts') {
                  this.props.updateClickedPosition(1);
                  const resetAction = StackActions.reset({
                    index: 2,
                    actions: [
                      NavigationActions.navigate({ routeName: 'Dashboard' }),
                      NavigationActions.navigate({ routeName: 'NewLeadsOverview' }),
                      NavigationActions.navigate({
                        routeName: 'LeadHistory',
                        params: {
                          variantValue: this.state.variantValue,
                          leadId: this.props.lead.id,
                          currentDealerId: this.props.currentUser.dealerId
                        }
                      }),
                    ],
                  });
                  this.props.navigation.dispatch(resetAction);
                  // } else {
                  //   const { navigation } = this.props;
                  //   navigation.pop(2);
                  // }
                  this.setState({
                    referenceNoText: ''
                  });
                } catch (error) {
                  console.log(error);
                }
              }, error => {
                if (error && error.err && !error.err.message.includes('invalidaccesstoken')) {
                  Alert.alert(
                    '',
                    error && error.err ? error.err.message : '',
                    [
                      {
                        text: 'ok',
                        onPress: () => {
                        }
                      },
                    ],
                    { cancelable: false }
                  );
                }
              })
          },
          {
            text: 'No',
            onPress: () => {
              if (!this.checkForFinanceOptiontOfOtherLeaddetails(currentLeadDetailObj)) {
                this.props.updateLeadDetailStatus(
                  lead.id, currentLeadDetailObj.id,
                  { markAsNew: false, invoice_id: this.state.referenceNoText }
                ).then(async ({ response }) => {
                  const updatedLead = response;
                  this.props.setLead(updatedLead);
                  this.props.callToast(getMessage(updatedLead.name));
                  // const { navigation } = this.props;
                  // navigation.pop(2);
                  await this.props.updateClickedPosition(1);
                  const resetAction = StackActions.reset({
                    index: 2,
                    actions: [
                      NavigationActions.navigate({ routeName: 'Dashboard' }),
                      NavigationActions.navigate({ routeName: 'NewLeadsOverview' }),
                      NavigationActions.navigate({
                        routeName: 'LeadHistory',
                        params: {
                          leadId: this.props.lead.id,
                          variantValue: this.state.variantValue,
                          currentDealerId: this.props.currentUser.dealerId
                        }
                      }),
                    ],
                  });
                  this.props.navigation.dispatch(resetAction);
                  this.setState({
                    referenceNoText: ''
                  });
                }, error => {
                  if (error && error.err && !error.err.message.includes('invalidaccesstoken')) {
                    Alert.alert(
                      '',
                      error && error.err ? error.err.message : '',
                      [
                        {
                          text: 'ok',
                          onPress: () => {
                          }
                        },
                      ],
                      { cancelable: false }
                    );
                  }
                });
              } else {
                Alert.alert(
                  'Info',
                  'Loan is applied for other vehicles.',
                  // 'Loan is under process for the other vehicles.',
                  [
                    {
                      text: 'Ok',
                      onPress: () => {
                        this.setState({
                          referenceNoText: ''
                        });
                      }
                    },
                  ],
                  { cancelable: false }
                );
              }
            },
            style: 'cancel'
          }
        ],
        { cancelable: false }
      );
    }
  }

  bookBtnTapped = () => {
    // this.props.disableButton();
    this.setState({
      currentPopUpView: constants.REFERENCE_POPUPVIEW,
      modalVisible: true,
      currentRefView: 'Book'
    });
  }

  goToDocumentUpload = () => {
    const { navigation } = this.props;
    const leadId = this.props.navigation.state.params.leadDetail.lead_id;
    const leadDetailId = this.props.navigation.state.params.leadDetail.id;
    const performaInvoiceId = this.props.proformaResponse.proformaInvoice.id;
    const currentLeadDetailObj = Object.keys(this.props.lead).length > 0 && this.props.lead.lead_details &&
    this.props.lead.lead_details.length > 0 && this.props.lead.lead_details
        .find(currentLeadDetail => leadDetailId === currentLeadDetail.id);
    const onRoadPrice = this.state.bikeDetails && this.state.bikeDetails.variants
      && this.state.bikeDetails.variants[this.state.variantIndex].prices.onroad_price;
    const financierLeadId = currentLeadDetailObj.financier_lead[0].id;
    navigation.navigate('DocumentsUpload', {
      leadId, leadDetailId, performaInvoiceId, financierLeadId, onRoadPrice, currentLeadDetailObj
    });
  }

  goToFinancierOnBoarding = () => {
    // this.props.disableButton();
    const { navigation, lead } = this.props;
    // const { lead } = this.state;
    const leadId = this.props.navigation.state.params.leadDetail.lead_id;
    const leadDetailId = this.props.navigation.state.params.leadDetail.id;
    const performaInvoiceId = this.props.proformaResponse.proformaInvoice.id;
    const currentLeadDetailObj = Object.keys(this.props.lead).length > 0 && this.props.lead.lead_details &&
    this.props.lead.lead_details.length > 0 && this.props.lead.lead_details
        .find(currentLeadDetail => leadDetailId === currentLeadDetail.id);
    const onRoadPrice = this.state.bikeDetails && this.state.bikeDetails.variants
      && this.state.bikeDetails.variants[this.state.variantIndex].prices.onroad_price;
    if (currentLeadDetailObj.financier_lead && currentLeadDetailObj.financier_lead.length > 0) {
      if (this.props.currentUser && this.props.currentUser.dealerId) {
        this.props.getFinancierRepresentativeList(
          this.props.currentUser.dealerId,
          this.state.localfinancierLead.financier.id
        ).then(() => {
          let currentFinancierRep;
          if (this.props.financierRepresentativeList.length === 0) {
            currentFinancierRep = {
              user: {
                id: 1,
                first_name: 'No financier rep'
              }
            };
          }
          this.setState({
            currentFinancierRep: this.props.financierRepresentativeList.length === 0
              ? currentFinancierRep : { ...this.props.financierRepresentativeList[0] },
            currentPopUpView: constants.UPDATE_EMI_POPUPVIEW,
            modalVisible: true,
            currentModel: 'SendOtpView',
            AdvancedEmiVal: `${this.state.localfinancierLead.advance_emi}`,
            emiVal: `${this.state.localfinancierLead.emi}`,
            tenureVal: this.state.localfinancierLead.tenure,
            loanAmount: `${this.props.financierLead.loan_amount}`,
            downpayment: `${this.props.financierLead.down_payment}`,
            ROIVal: this.state.localfinancierLead.interest_percentage,
            isFinanceOptionTapped: true
          });
        })
          .catch(error => {
            console.log('ERROR:::', error);
          });
      }
    } else if (lead.income_status !== null && lead.domicile_status !== null) {
      navigation.navigate('FinancierListing', {
        leadId, leadDetailId, performaInvoiceId, onRoadPrice, currentLeadDetailObj
      });
    } else if (lead.income_status !== null && lead.domicile_status === null) {
      navigation.navigate('FinanceOnboarding', {
        leadId, leadDetailId, performaInvoiceId, onRoadPrice, currentLeadDetailObj, position: 1
      });
    } else {
      navigation.navigate('FinanceOnboarding', {
        leadId, leadDetailId, performaInvoiceId, onRoadPrice, currentLeadDetailObj, position: 0
      });
    }
  }

  removeFinanceBtntapped = () => {
    // this.props.disableButton();
    this.setState({
      currentPopUpView: constants.REMOVEFINANCE_POPUPVIEW,
      modalVisible: true,
      currentRefView: 'reason',
      reasonText: '',
      referenceNoText: ''
    });
  }

  okBtnAction = () => {
    this.props.disableButton();
    if (this.state.isFollowUpComment) {
      if (trimExtraspaces(this.state.reasonText).length > 0) {
        const commentData = {
          comment: trimExtraspaces(this.state.reasonText)
        };
        this.props.postComment(this.state.lead.id, commentData).then(() => {
          this.handleConfirmFollowUp(commentData);
        }).catch(() => { });
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
    } else {
      const leadDetailId = this.props.navigation.state.params.leadDetail.id;
      const currentDetailObjIndex = Object.keys(this.props.lead).length > 0 && this.props.lead.lead_details &&
      this.props.lead.lead_details.length > 0 && this.props.lead.lead_details
          .findIndex(currentLeadDetail => leadDetailId === currentLeadDetail.id);
      const { reasonText, currentRefView, referenceNoText } = this.state;
      const currentDetailObj = { ...this.props.lead.lead_details[currentDetailObjIndex] };
      if ((currentRefView === 'reason' && trimExtraspaces(reasonText).length > 0) || trimExtraspaces(referenceNoText).length > 0) {
        if (currentRefView === 'reason') {
          const finLeadObj = {
            id: (currentDetailObj && currentDetailObj.financier_lead
              && currentDetailObj.financier_lead.length > 0) ? currentDetailObj.financier_lead[0].id : 0,
            lost_reason: 'Others',
            lost_reason_comment: trimExtraspaces(reasonText).length > 0 ? reasonText : 'Not Interested',
            lost_on: moment.utc(new Date()).utcOffset('+05:30').format(),
            status: 930
          };
          this.props.updateFinancierLeadDetails(currentDetailObj.financier_lead[0].id, finLeadObj)
            .then(() => {
              const lead_details = [...this.state.lead.lead_details];
              lead_details[currentDetailObjIndex].financier_lead = [];
              this.state.lead.lead_details[currentDetailObjIndex].financier_lead = [];
              const lead = {
                ...this.props.lead,
                lead_details
              };
              this.setState(
                {
                  modalVisible: false,
                  offerValue: '',
                  totalOfferAmount: 0,
                  totalOtherChargesAmount: 0,
                  lead,
                  localfinancierLead: {},
                  AdvancedEmiVal: '',
                  emiVal: '',
                  tenureVal: '',
                  loanAmount: '',
                  downpayment: '',
                  ROIVal: '',
                  reasonText: ''
                },
                () => {
                  this.props.setLead(lead);
                  this.onInitialLoad();
                }
              );
            }).catch(() => { });
        } else if (currentRefView === 'Invoice' || currentRefView === 'Book') {
          let lead_details = [];
          if (this.state.currentRefView === 'Book') {
            lead_details = [...this.state.lead.lead_details];
            lead_details[currentDetailObjIndex].vehicle_status = 450;
            lead_details[currentDetailObjIndex].booking_id = trimExtraspaces(this.state.referenceNoText);
          }
          this.setState({
            lead: {
              ...this.state.lead,
              lead_details
            },
            modalVisible: false,
            reasonText: '',
          }, () => {
            if (this.state.currentRefView === 'Invoice' && trimExtraspaces(this.state.referenceNoText).length > 0) {
              this.invoicingLead();
            } else {
              this.updateLeadDetail(this.state.lead.lead_details[currentDetailObjIndex], currentDetailObjIndex);
            }
          });
        }
      } else {
        let msgDes = '';
        if (this.state.currentRefView === 'reason') {
          msgDes = 'Please provide reason to remove finance';
        } else if (this.state.currentRefView === 'Invoice') {
          msgDes = 'Please provide the Invoice reference Number';
        } else {
          msgDes = 'Please provide the booking reference Number';
        }
        Alert.alert(
          'Info',
          msgDes,
          [
            { text: 'Ok', onPress: () => { } },
          ],
          { cancelable: false }
        );
      }
    }
  }

  updateLeadDetail = (leadDetailObj, index) => {
    const { variantIndex, colorIndex, bikeDetails } = this.state;
    leadDetailObj.variant_colour_id = bikeDetails && bikeDetails.variants
      && bikeDetails.variants[variantIndex].colors[colorIndex].id;
    this.props.updateLeadDetail(this.props.lead.id, leadDetailObj)
      .then(({ response }) => {
        const leadDetails = [...this.props.lead.lead_details];
        leadDetails[index] = {
          ...response
        };
        this.setState({
          referenceNoText: '',
        }, () => {
          const lead = {
            ...this.props.lead,
            lead_details: leadDetails
          };
          this.props.setLead(lead);
        });
      }).catch(() => { });
  }

  cancelBtnAction = () => {
    // this.props.disableButton();
    this.setState({
      referenceNoText: '',
      modalVisible: false,
      reasonText: '',
      isFollowUpComment: false
    });
  }

  getPristineSplitInsuranceState = leadDetail => {
    const premium_validity = leadDetail.od_premium_validity;
    return {
      isTPPremiumSelected: leadDetail.tp_premium,
      isCompulsaryPACoverSelected: leadDetail.compulsory_pa_cover,
      isZeroDepreciationSelected: leadDetail.zero_depreciation,
      isExtendedWarrantyEnabled: leadDetail.extended_warranty,
      // totalInsuranceCharge: leadDetail.total_insurance_amount,
      isInsuranceForOneYearSelected: premium_validity === 1,
      isFiveYearSelected: premium_validity === 5,
      availInsurance: this.state.availInsurance
    };
  }
  updateProformaAccessories = () => {
    // // this.props.disableButton();
    const {
      priceBreakdownData,
      isFiveYearSelected,
      isInsuranceForOneYearSelected,
      isZeroDepreciationSelected,
      isTPPremiumSelected,
      isCompulsaryPACoverSelected,
      totalInsuranceCharge,
      showInsuranceSplitUp,
      availInsurance
    } = this.state;
    const currentObj = Object.keys(this.props.lead).length > 0 && this.props.lead.lead_details &&
    this.props.lead.lead_details.length > 0 && this.props.lead.lead_details
        .find(currentLeadDetail => priceBreakdownData.proformaInvoice.lead_detail.id === currentLeadDetail.id);
    const leadDetail = {
      ...currentObj,
      zero_depreciation: isZeroDepreciationSelected,
      extended_warranty: this.state.isExtendedWarrantyEnabled
    };
    if (isFiveYearSelected) {
      leadDetail.od_premium_validity = 5;
    } else if (isInsuranceForOneYearSelected) {
      leadDetail.od_premium_validity = 1;
    } else {
      leadDetail.od_premium_validity = 0;
    }
    leadDetail.compulsory_pa_cover = isCompulsaryPACoverSelected;
    leadDetail.tp_premium = isTPPremiumSelected;
    if (availInsurance) {
      if (showInsuranceSplitUp) {
        leadDetail.total_insurance_amount = this.getInsurancePrice(leadDetail);
      } else {
        leadDetail.total_insurance_amount = totalInsuranceCharge;
      }
    } else {
      leadDetail.total_insurance_amount = 0;
    }
    const pristineSplitInsuranceState = this.getPristineSplitInsuranceState(leadDetail);
    const accessories = [];
    if (priceBreakdownData.nonMandatoryAccessories.length > 0) {
      priceBreakdownData.nonMandatoryAccessories.forEach(item => {
        if (item.isChecked) {
          delete item.isChecked;
          accessories.push(item);
        }
      });
    }
    this.props.showIndicator();
    this.props.updateLeadDetail(leadDetail.id, leadDetail)
      .then(({ response }) => {
        const index = Object.keys(this.props.lead).length > 0 && this.props.lead.lead_details &&
        this.props.lead.lead_details.length > 0 && this.props.lead.lead_details
            .findIndex(currentLeadDetail => response.id === currentLeadDetail.id);
        const lead_details = [...this.props.lead.lead_details];
        lead_details[index] = {
          ...response
        };
        const lead = {
          ...this.props.lead,
          lead_details
        };
        this.setState({
          lead
        }, () => {
          this.props.setLead(lead);
        });
        return this.props.updateProformaAccessories(priceBreakdownData.proformaInvoice.id, accessories);
      })
      .then(() => {
        this.props.hideIndicator();
        this.setState({
          modalVisible: false,
          priceBreakdownData: this.props.accessoriesResponse,
          mandatoryAccesoriesPrice:
          this.getTotalAccessoryPrice(
            this.props.accessoriesResponse.mandatoryAccessories,
            []
          ),
          nonMandatoryAccesoriesPrice:
          this.getTotalAccessoryPrice(
            [],
            this.props.accessoriesResponse.proformaInvoice.proforma_invoice_accessory
          ),
          pristineSplitInsuranceState
        });
      }).catch(error => {
        this.props.hideIndicator();
        console.log(error);
      });
  }

  bookTestRide = () => {
    // this.props.disableButton();
    let { leadDetail } = this.props.navigation.state.params;
    const currentLeadDetailObj = Object.keys(this.props.lead).length > 0 && this.props.lead.lead_details &&
    this.props.lead.lead_details.length > 0 && this.props.lead.lead_details
        .find(currentleaddetail => this.props.navigation.state.params.leadDetail.id === currentleaddetail.id);
    leadDetail = {
      ...currentLeadDetailObj,
      test_ride_on: null
    };
    if (leadDetail && leadDetail.vehicle && leadDetail.vehicle.dealer_vehicles
      && leadDetail.vehicle.dealer_vehicles.length > 0
      && leadDetail.vehicle.dealer_vehicles[0].test_ride_vehicle > 0) {
      this.props.navigation.navigate(
        'VehicleSelectionScreen',
        {
          variantValue: this.state.variantValue,
          lead: this.props.lead,
          leadDetail,
          enquiredVehicles: this.props.lead.lead_details,
          source: 'Price-Breakdown'
        }
      );
    } else {
      Alert.alert(
        'Info',
        'No test ride vehicles available.',
        [
          { text: 'Ok', onPress: () => { } },
        ],
        { cancelable: false }
      );
    }
  }

  enableTestRide = () => {
    const leadDetail = Object.keys(this.props.lead).length > 0
      && this.props.lead.lead_details && this.props.lead.lead_details.length > 0 && this.props.lead.lead_details
        .find(currentleaddetail => this.props.navigation.state.params.leadDetail.id === currentleaddetail.id);
    if (leadDetail && leadDetail.test_ride_status === 200) {
      return (
        <View style={[styles.onRoadView,
          { flexDirection: 'column', marginLeft: 12 }]}>
          <Text style={styles.onRoadPriceLabel}>
            Test Ride
          </Text>
          <Text style={[styles.onRoadPriceLabel, { alignSelf: 'flex-start' }]}>
            {
              // eslint-disable-next-line
              `${moment(leadDetail.test_ride_on).utc().format('DD-MMM-YYYY')} \n ${moment(leadDetail.test_ride_on).utc().format('h:mm a')} - ${moment(leadDetail.test_ride_on).add(30, 'minutes').utc().format('h:mm a')}`
            }
          </Text>
        </View>
      );
    } if (leadDetail && leadDetail.test_ride_status === 400) {
      return (
        <SecondaryButton
          iconName="check"
          iconColor="green"
          iconSize={12}
          disabled
          title="Testride Taken"
          buttonStyle={[styles.testRideStatus, { width: 120 }]}
          handleSubmit={() => { }}
        />
      );
    } if (leadDetail
      && leadDetail.test_ride_status !== 200
      && leadDetail.test_ride_status !== 400 && leadDetail.test_ride_status !== 300) {
      return (
        <SecondaryButton
          // disabled={this.props.loading || this.props.buttonState}
          disabled={this.props.loading}
          title="Book a test ride"
          buttonStyle={styles.continueBtnStyle}
          handleSubmit={this.bookTestRide}
      />
      );
    }
  }

  savingPercentage = offerAmount => {
    const { priceBreakdownData } = this.state;
    const onRoadPrice = priceBreakdownData.proformaInvoice.vehicle_price.onroad_price;
    const savingPerc = (offerAmount / onRoadPrice) * 100;
    return (
      <Text style={styles.savingPercentageBold}>
        {' '}
        {savingPerc.toFixed(2)}
        %
        {' '}
      </Text>
    );
  }

  _keyExtractor = item => item.id;

  updateCurrentView = () => {
    switch (this.state.currentModel) {
      case 'EditEmiView':
        return (
          <ScrollView>
            <View style={{
              flex: 1
            }}>
              <View style={styles.textInputOverView}>
                <View style={styles.textInputContainer}>
                  <Text style={[styles.detailTextInputStyle]}>
                    Loan Amount
                  </Text>
                  <TextInput
                    keyboardType="numeric"
                    maxLength={6}
                    style={styles.fieldContainer}
                    onChangeText={text => this.setState({
                      loanAmount: text, dirty: true
                    })}
                    value={`${this.state.loanAmount}`}
                    underlineColorAndroid="transparent" />
                </View>
                <View style={styles.textInputContainer}>
                  <Text style={[styles.detailTextInputStyle]}>
                    Downpayment
                  </Text>
                  <TextInput
                    keyboardType="numeric"
                    maxLength={6}
                    style={styles.fieldContainer}
                    onChangeText={text => this.setState({ downpayment: text, dirty: true })}
                    value={this.state.downpayment}
                    underlineColorAndroid="transparent" />
                </View>
              </View>
              <View style={styles.textInputOverView}>
                <View style={styles.textInputContainer}>
                  <Text style={[styles.detailTextInputStyle]}>
                    Tenure
                  </Text>
                  <TextInput
                    keyboardType="numeric"
                    maxLength={2}
                    style={styles.fieldContainer}
                    onChangeText={text => this.setState({ tenureVal: text, dirty: true })}
                    value={`${this.state.tenureVal}`}
                    underlineColorAndroid="transparent" />
                </View>
                <View style={styles.textInputContainer}>
                  <Text style={[styles.detailTextInputStyle]}>
                    Advanced EMI
                  </Text>
                  <View style={styles.pickerOverView}>
                    <Picker
                      style={{ height: 35 }}
                      selectedValue={
                        this.state.AdvancedEmiVal
                          ? this.state.AdvancedEmiVal : 0
                      }
                      mode="dropdown"
                      onValueChange={itemValue => this.onPickerChange(itemValue)}
                    >
                      {
                        AdvancedEmiArray && AdvancedEmiArray.map(currentItem => (
                          <Picker.Item
                            label={currentItem}
                            value={currentItem}
                            key={currentItem} />
                        ))
                      }
                    </Picker>
                  </View>
                </View>
              </View>
              <View style={styles.textInputOverView}>
                <View style={styles.textInputContainer}>
                  <Text style={[styles.detailTextInputStyle]}>
                    EMI
                  </Text>
                  <TextInput
                    keyboardType="numeric"
                    style={styles.fieldContainer}
                    onChangeText={text => this.setState({ emiVal: text, dirty: true })}
                    value={this.state.emiVal}
                    underlineColorAndroid="transparent" />
                </View>
                <ButtonWithPlainText
                  // disabled={!this.state.dirty || this.props.buttonState}
                  disabled={!this.state.dirty}
                  title="DONE"
                  style={[styles.doneBtnStyle, { backgroundColor: (this.state.dirty) ? '#f37730' : 'gray' }]}
                  handleSubmit={() => { this.doneBtnTapped(); }}
                  textStyle={styles.doneBtnTextStyle}
                />
              </View>
            </View>
          </ScrollView>
        );
      case 'OTPView':
        return (
          <View style={{ flex: 1 }}>
            <View style={styles.OTPTotalViewStyle}>
              <Text style={[styles.offerTextStyle, { fontSize: 16, marginHorizontal: 20, marginVertical: 10 }]}>
                {`Enter the OTP sent to the number ending with '${this.state.currentFinancierRep
                    && this.state.currentFinancierRep.user
                    && this.state.currentFinancierRep.user.mobile_no
                  ? (this.state.currentFinancierRep.user.mobile_no).substring(6) : ''}'`}
              </Text>
              <View style={styles.OTPInputView}>
                <TextInput
                  maxLength={4}
                  keyboardType="numeric"
                  underlineColorAndroid="transparent"
                  style={styles.otpTF}
                  onChangeText={text => this.setState({ otpTF: text })}
                  value={this.state.otpTF}
                />
              </View>
            </View>
            <View style={{
              flexDirection: 'row', height: 60, marginTop: 10, justifyContent: 'space-between', marginHorizontal: 30,
            }}>
              <ButtonWithPlainText
                title="RESEND OTP?"
                // disabled={this.props.loading || this.props.buttonState}
                disabled={this.props.buttonState}
                style={styles.resendBtnStyle}
                handleSubmit={this.resendOtpBtnTapped}
                textStyle={styles.resendBtnTextStyle}
              />
              <ButtonWithPlainText
                title="VERIFY"
                // disabled={this.props.loading || this.state.disableVerifyBtn || this.props.buttonState}
                disabled={this.props.buttonState || this.state.disableVerifyBtn}
                style={styles.verifyBtnStyle}
                handleSubmit={this.verifyBtnTapped}
                textStyle={styles.verifyBtnTextStyle}
              />
            </View>
          </View>
        );
      case 'SendOtpView':
        return (
          <View style={{ flex: 1 }}>
            <View style={styles.OTPTotalViewStyle}>
              <Text style={[styles.offerTextStyle, { fontSize: 16, marginHorizontal: 20, marginVertical: 10 }]}>
                {`Representative from ${this.state.currentFinancier
                  && this.state.currentFinancier.name
                  ? this.state.currentFinancier.name : ''}`}
              </Text>
              <View style={styles.nameTextView}>
                <Text style={[styles.nameTextStyle, { paddingRight: 10, marginLeft: 20 }]}>
                  {this.state.currentFinancierRep
                    && this.state.currentFinancierRep.user
                    && this.state.currentFinancierRep.user.first_name
                    ? this.state.currentFinancierRep.user.first_name : ''}
                </Text>
                <View style={styles.nameNumberSeperator} />
                <Text style={[styles.nameTextStyle, { paddingLeft: 10 }]}>
                  {this.state.currentFinancierRep
                    && this.state.currentFinancierRep.user
                    && this.state.currentFinancierRep.user.mobile_no
                    ? this.state.currentFinancierRep.user.mobile_no : ''}
                </Text>
              </View>
            </View>
            <View style={{
              flexDirection: 'row', height: 60, marginTop: 10, justifyContent: 'flex-end', marginHorizontal: 30,
            }}
            >
              <ButtonWithPlainText
                title="SEND OTP"
                // disabled={this.props.loading || this.props.buttonState}
                disabled={this.props.buttonState}
                style={styles.verifyBtnStyle}
                handleSubmit={() => this.sendOtpBtntapped()}
                textStyle={styles.verifyBtnTextStyle}
              />
            </View>
          </View>
        );
      default:
    }
  }

  calculateEmiValue = () => {
    let errMessage = '';
    if (!isNumeric(this.state.loanAmount) || this.state.loanAmount === '0') {
      errMessage = 'Invalid loanAmount';
    } else if (!isNumeric(this.state.downpayment) || parseInt(this.state.downpayment, 10) < 0) {
      errMessage = 'Invalid downpayment';
    } else if (!isNumeric(this.state.tenureVal) || this.state.tenureVal === '0') {
      errMessage = 'Invalid tenure';
    } else if (!interestValidator(this.state.ROIVal) || this.state.ROIVal === '0') {
      errMessage = 'Invalid rate of interest';
    }
    if (errMessage.length !== 0) {
      Alert.alert(
        'Info',
        errMessage,
        [
          {
            text: 'OK',
            onPress: () => {
              this.setState({
                dirty: true,
              });
            }
          },
        ],
        { cancelable: false }
      );
    }
  }

  onTotalInsuranceChange = (param, value) => {
    this.setState({
      [param]: value
    });
  }

  resendOtpBtnTapped = () => {
    const { currentFinancierRep } = this.state;
    try {
      this.props.disableButton();
      if (currentFinancierRep && currentFinancierRep.user
        && currentFinancierRep.user.id && currentFinancierRep.user.id.length > 0) {
        this.props.resendOtp(this.state.currentFinancierRep.user.id, this.props.sendOtpObj)
          .then(res => {
            if (res.response && res.response.pinId) {
              Alert.alert(
                'Message',
                'OTP Sent Successfully', [{
                  text: 'OK',
                  onPress: () => { }
                }], {
                  cancelable: false
                }
              );
            } else if (res.response && res.response.message.includes('Sending Failed')) {
              Alert.alert(
                'Message',
                'Failed to send OTP, Please try again later', [{
                  text: 'OK',
                  onPress: () => { }
                }], {
                  cancelable: false
                }
              );
            }
          });
      }
    } catch (error) {
      console.log(error);
    }
  }

  verifyBtnTapped = () => {
    this.props.disableButton();
    this.setState({
      disableVerifyBtn: true
    });
    const data = {
      pinId: this.props.sendOtpObj.pinId,
      pin: this.state.otpTF
    };
    this.props.verifyOtp(this.state.currentFinancierRep.user.id, data)
      .then(() => {
        if (this.props.verifyOtpObj && this.props.verifyOtpObj.verified) {
          if (this.state.isFinanceOptionTapped) {
            this.setState({
              currentModel: 'EditEmiView',
              disableVerifyBtn: false,
              otpTF: '',
              dirty: false,
              isFinanceOptionTapped: false,
              modalVisible: false
            }, () => {
              this.goToDocumentUpload();
            });
          } else {
            this.setState({
              currentModel: 'EditEmiView',
              otpTF: '',
              dirty: false,
              disableVerifyBtn: false,
            });
          }
        } else {
          Alert.alert(
            'Alert',
            'Please enter valid OTP',
            [
              {
                text: 'OK',
                onPress: () => {
                  this.setState({
                    otpTF: '',
                    disableVerifyBtn: false,
                  });
                }
              },
            ],
            { cancelable: false }
          );
        }
      })
      .catch(() => { });
  }

  sendOtpBtntapped = () => {
    this.props.disableButton();
    this.props.sendOtp(this.state.currentFinancierRep.user.id).then(() => {
      if (this.props.sendOtpObj && this.props.sendOtpObj.pinId) {
        Alert.alert(
          'Message',
          'OTP Sent Successfully', [{
            text: 'OK',
            onPress: () => {
              this.setState({
                currentModel: 'OTPView',
              });
            }
          }], {
            cancelable: false
          }
        );
      } else if (this.props.sendOtpObj && this.props.sendOtpObj.message.includes('Sending Failed')) {
        Alert.alert(
          'Message',
          'Failed to send OTP, Please try again later', [{
            text: 'OK',
            onPress: () => { }
          }], {
            cancelable: false
          }
        );
      }
    }).catch(() => { });
  }

  doneBtnTapped = () => {
    // this.props.disableButton();
    let errMessage = '';
    if (!isNumeric(this.state.loanAmount) || this.state.loanAmount === '0') {
      errMessage = 'Invalid loanAmount';
    } else if (!isNumeric(this.state.downpayment) || parseInt(this.state.downpayment, 10) < 0) {
      errMessage = 'Invalid downpayment';
    } else if (!isNumeric(this.state.tenureVal) || this.state.tenureVal === '0') {
      errMessage = 'Invalid tenure';
    } else if (!interestValidator(this.state.ROIVal) || this.state.ROIVal === '0') {
      errMessage = 'Invalid rate of interest';
    } else if (!isNumeric(this.state.emiVal) || this.state.emiVal === '0') {
      errMessage = 'Invalid Emi value';
    }
    if (errMessage.length === 0) {
      const { localfinancierLead } = this.state;
      localfinancierLead.emi = this.state.emiVal;
      localfinancierLead.interest_percentage = this.state.ROIVal;
      localfinancierLead.tenure = this.state.tenureVal;
      localfinancierLead.down_payment = this.state.downpayment;
      localfinancierLead.loan_amount = this.state.loanAmount;
      localfinancierLead.advance_emi = this.state.AdvancedEmiVal;
      this.props.updateFinancierLeadDetails(this.state.localfinancierLead.id, localfinancierLead).then(() => {
        this.setState({
          localfinancierLead: {
            ...this.props.financierLead
          },
          modalVisible: false,
          currentModel: 'SendOtpView',
          dirty: false
        });
      }).catch(() => { });
    } else {
      Alert.alert(
        'Info',
        errMessage,
        [
          {
            text: 'OK',
            onPress: () => {
              this.setState({
                dirty: true,
              });
            }
          },
        ],
        { cancelable: false }
      );
    }
  }

  renderItem = item => (
    <View style={styles.offerView}>
      <View style={styles.offerAppliedView}>
        <View style={styles.offerBackground}>
          <Image source={offerTickIcon} resizeMode="contain" />
          <Text style={styles.offerAppliedText}>{item.name}</Text>
        </View>
        <TouchableOpacity
          // disabled={this.props.buttonState}
          style={styles.deleteView}
          onPress={() => {
            this.deleteBikeOffer(item);
          }}>
          <Icon
            name="trash"
            size={18}
            color="#EF7432"
            style={{ alignSelf: 'center', marginHorizontal: 5 }} />
        </TouchableOpacity>
        <View style={{ flexDirection: 'row-reverse', alignItems: 'center', flex: 1 }}>
          <Text style={[styles.offerTextStyle, { color: '#6fc511' }]}>
            (-) &#8377;
            {item.amount}
          </Text>
        </View>
      </View>
      <Text style={[styles.offerSavingText, { display: 'none' }]}>
        You are saving
        {this.savingPercentage(item.amount)}
        on the On-Road Price
      </Text>
      <View style={styles.line} />
    </View>
  )

  renderOtherChargesItem = item => (
    <View style={styles.offerView}>
      <View style={styles.offerAppliedView}>
        <View style={styles.otherChargesBackground}>
          <Text style={styles.offerAppliedText}>{item.name}</Text>
        </View>
        <TouchableOpacity
          // disabled={this.props.buttonState}
          style={styles.deleteView}
          onPress={() => {
            this.deleteBikeOtherCharges(item);
          }}>
          <Icon
            name="trash"
            size={18}
            color="#EF7432"
            style={{ alignSelf: 'center', marginHorizontal: 5 }} />
        </TouchableOpacity>
        <View style={{ flexDirection: 'row-reverse', alignItems: 'center', flex: 1 }}>
          <Text style={[styles.offerTextStyle]}>
            (+) &#8377;
            {item.amount}
          </Text>
        </View>
      </View>
    </View>
  )

  renderAccessoryItem = item => (
    <View style={styles.accessoryRowView}>
      <Text style={styles.accessoryNameText}>{item.name}</Text>
      <Text style={styles.accessoryPriceText}>{currencyFormatter(Number(item.price || 0))}</Text>
      <TouchableOpacity
        // disabled={this.props.buttonState}
        onPress={() => {
          // this.props.disableButton();
          item.isChecked = !item.isChecked;
          this.setState({
            refreshList: !this.state.refreshList
          });
        }}
        style={styles.checkBoxView}
      >
        {
          item.isChecked
            ? <Image source={selectedCb} resizeMode="contain" />
            : <Image source={unselectedCb} resizeMode="contain" />
        }
      </TouchableOpacity>
    </View>
  )

  getInsurancePrice = leadDetail => {
    let insuranceAmount = 0;
    this.state.insurances.forEach(currentObj => {
      if (currentObj.type === 'zero_depreciation'
        && leadDetail.zero_depreciation) {
        insuranceAmount += parseInt(currentObj.amount, 10);
      } else if (currentObj.type === 'od_premium'
        && (`${leadDetail.od_premium_validity}`
          === `${currentObj.validity}`)) {
        insuranceAmount += parseInt(currentObj.amount, 10);
      } else if ((currentObj.type === 'compulsory_pa_cover' && leadDetail.compulsory_pa_cover)
        || (currentObj.type === 'tp_premium' && leadDetail.tp_premium)) {
        insuranceAmount += parseInt(currentObj.amount, 10);
      }
    });
    return insuranceAmount;
  }

  saveExchangeBtnAction = () => {
    // this.props.disableButton();
    const { lead, bikeCondition, bikeRemarks } = this.state;
    if (this.props.proformaResponse && this.props.proformaResponse.proformaInvoice && this.props.proformaResponse.proformaInvoice.id) {
      if (this.state.exchangeValueAmount && this.state.exchangeValueAmount !== '0'
        && isNumeric(this.state.exchangeValueAmount)) {
        const exchangeVehicleObj = {
          manufacturer: this.state.selectedManufacturerItems[0],
          vehicle: this.state.selectedVehicleModelItems[0],
          variant: this.state.selectedVariantItems[0],
          kilometers_used: this.state.kmsDriven,
          variant_year: this.state.excVehicleYear,
          quoted_value: this.state.exchangeValueAmount,
          lead_id: lead.id,
          proforma_invoice_id: this.props.proformaResponse.proformaInvoice.id,
          remarks: bikeRemarks,
          condition: bikeCondition
        };
        if (this.props.currentUser && this.props.currentUser.dealerId) {
          if (this.state.exchageVehicleDetails
            && Object.keys(this.state.exchageVehicleDetails).length !== 0
            && ('id' in this.state.exchageVehicleDetails)) {
            exchangeVehicleObj.id = this.state.exchageVehicleDetails.id;
            this.props.updateExchangeVehicle(this.props.currentUser.dealerId, lead.id, exchangeVehicleObj).then(() => {
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
                dirty: false,
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
                dirty: false,
              });
            });
          }
        }
      } else {
        Alert.alert(
          'Alert',
          'Please enter a valid amount',
          [
            { text: 'OK', onPress: () => { } },
          ],
          { cancelable: false }
        );
      }
    }
  }

  calculateExchangeValue = () => {
    // this.props.disableButton();
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
          }).catch(() => { });
        } else {
          Alert.alert(
            'Alert',
            'Please enter valid kms',
            [
              { text: 'OK', onPress: () => { } },
            ],
            { cancelable: false }
          );
        }
      } else {
        Alert.alert(
          'Alert',
          'Please enter valid year',
          [
            { text: 'OK', onPress: () => { } },
          ],
          { cancelable: false }
        );
      }
    } else {
      Alert.alert(
        'Alert',
        'All fields are mandatory',
        [
          { text: 'OK', onPress: () => { } },
        ],
        { cancelable: false }
      );
    }
  }

  printHTML = html => {
    RNPrint.print({
      html
    });
  }

  sendEmailTapped = () => {
    // this.props.disableButton();
    const { priceBreakdownData } = this.state;
    if (priceBreakdownData && priceBreakdownData.proformaInvoice
      && priceBreakdownData.proformaInvoice.lead && priceBreakdownData.proformaInvoice.lead.user_id) {
      this.props.getUser(this.state.priceBreakdownData.proformaInvoice.lead.user_id).then(() => {
        this.setState({
          modalVisible: true,
          currentPopUpView: constants.EMAIL_POPUPVIEW,
          userObject: this.props.userObjResponse,
          emailIdToSend: priceBreakdownData.proformaInvoice.lead.email
/*           emailIdToSend: (this.props.userObjResponse.email && this.props.userObjResponse.email !== null)
            ? this.props.userObjResponse.email : '' */
        });
      }).catch(() => { });
    }
  }

  onFollowUpSwitch = value => {
    this.setState({ scheduleFollowUp: value, date: '', time: '' });
  }

  handleDatePicker = () => {
    // this.props.disableButton();
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

  handleTimePicker = () => {
    // this.props.disableButton();
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

  handleDoneClick = async () => {
    this.props.disableButton();
    if (this.validate()) {
      if (this.state.scheduleFollowUp && this.state.date.length > 0 && this.state.time.length > 0) {
        await this.scheduleFollowUp();
      }
      await this.setState({
        date: '',
        time: '',
        scheduleFollowUp: false
      });
    }
  }

  validate = () => {
    let valid = true;
    let message = null;
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
          message = 'Selected time cannot be current time or past time.!';
          valid = false;
        }
        // checking for both values not to exist.
      } else if (!this.state.date.length) {
        message = 'Please select a valid date.!';
        valid = false;
      } else if (!this.state.time.length) {
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

  scheduleFollowUp = () => {
    const {
      years, months, day, minutes, hours
    } = this.state;
    const { lead } = this.state;
    const date = moment({
      years, months, date: day, hours, minutes
    }).utc().format();
    const followUpData = {
      follow_up_at: date,
      comment: trimExtraspaces(this.state.comment)
    };
    return this.props.postLeadFollowUp(lead.id, followUpData)
      .then(() => {
        this.props.getLead(lead.id).then(() => {
        });
      }).catch(() => { });
  }

  handleConfirmFollowUp = commentData => {
    const { lead } = this.state;
    const followUp = lead.follow_up[0];
    const confirmData = {
      ...commentData,
      id: followUp.id,
      is_completed: true,
    };
    this.props.updateLeadFollowUp(lead.id, followUp.id, confirmData)
      .then(() => {
        this.props.getLead(lead.id).then(() => {
          this.setState({
            followUpDone: false,
            modalVisible: false,
            isFollowUpComment: false,
          });
        });
      }).catch(error => {
        console.log(error);
      });
  }

  gotoHome = async () => {
    // this.props.disableButton();
    try {
      const { navigation } = this.props;
      await this.props.updateClickedPosition(1);
      this.props.clearLead();
      const resetAction = resetScreens({
        index: 0,
        actions: [NavigationActions.navigate({
          routeName: 'Dashboard'
        })],
      });
      navigation.dispatch(resetAction);
    } catch (error) {
      console.log(error);
    }
  }

  isVehicleBooked = () => {
    const { lead } = this.props;
    const currentObj = lead && lead.lead_details && lead.lead_details.length > 0
    && lead.lead_details.find(eachObj => eachObj.vehicle_id === this.props.navigation.state.params.leadDetail.vehicle_id);
    if ((currentObj && currentObj.vehicle_status >= 450)) {
      return true;
    }
    return false;
  }

  render() {
    const {
      variantIndex, colorIndex, priceBreakdownData, totalOfferAmount,
      totalOtherChargesAmount, bikeDetails, insurances, refreshList
    } = this.state;
    const leadDetailObj = Object.keys(this.props.lead).length > 0 && this.props.lead.lead_details
      .find(currentleaddetail => this.props.navigation.state.params.leadDetail.id === currentleaddetail.id);
    return (
      <View style={styles.container}>
        <Loader showIndicator={this.props.loading && !this.props.globalLoading} />
        {(this.state.currentPopUpView === constants.REFERENCE_POPUPVIEW)
          && (
            <Modal
              animationType="slide"
              transparent
              visible={this.state.modalVisible}
              onRequestClose={() => {
                this.setState({
                  modalVisible: false,
                  referenceNoText: '',
                });
              }}>
              <View style={styles.removeFinancierContainer}>
                <View style={styles.removeFinancierView}>
                  <View style={{ flexDirection: 'row' }}>
                    <Text style={styles.reasonTitleText}>
                      To {this.state.currentRefView}
                    </Text>
                    <TouchableOpacity
                      // disabled={this.props.buttonState}
                      style={[styles.closeBtnView, { alignSelf: 'flex-end', width: 40 }]}
                      onPress={() => {
                        // this.props.disableButton();
                        this.setState({
                          modalVisible: false,
                          referenceNoText: ''
                        });
                      }}>
                      <Image
                        resizeMode="center"
                        source={Close}
                        style={styles.closeIconDimensions}
                        />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.commentTextStyle}> Reference No:</Text>
                  <TextInput
                    maxLength={100}
                    style={styles.reasonFieldContainer}
                    onChangeText={text => this.setState({ referenceNoText: text })}
                    value={this.state.referenceNoText}
                    underlineColorAndroid="transparent" />
                  <View style={{ flexDirection: 'row', marginVertical: 20 }}>
                    <View style={{ flex: 1, alignItems: 'center' }}>
                      <BookTestRideButton
                        title="Ok"
                        disabled={this.props.loading || this.props.buttonState}
                        // disabled={this.props.loading}
                        customStyles={styles.okBtnStyle}
                        customTextStyles={styles.okBtnTextStyle}
                        handleSubmit={this.okBtnAction} />
                    </View>
                    <View style={{ flex: 1, alignItems: 'center' }}>
                      <SecondaryButton
                        title="Cancel"
                        // disabled={this.props.buttonState}
                        textStyle={styles.cancelBtnTextStyle}
                        buttonStyle={styles.cancelBtnStyle}
                        handleSubmit={this.cancelBtnAction} />
                    </View>
                  </View>
                </View>
              </View>
            </Modal>
          )
        }
        {(this.state.currentPopUpView === constants.EMAIL_POPUPVIEW)
          && (
            <Modal
              animationType="fade"
              transparent
              visible={this.state.modalVisible}
              onRequestClose={() => this.setState({
                modalVisible: false,
                otherChargesAmount: '',
                otherChargesReasonText: ''
              })}>
              <View style={styles.modalContentWrapper} />
              <KeyboardAwareScrollView
                style={{ backgroundColor: 'gray', opacity: 0.9 }}
                contentContainerStyle={styles.emialModalContent}
                keyboardShouldPersistTaps="always">
                <View style={styles.offerTitleModalContent}>
                  <Text style={styles.offerTitleText}>Email:</Text>
                  <View style={styles.modalCloseView}>
                    <TouchableOpacity
                      disabled={this.props.buttonState}
                      onPress={() => {
                        // this.props.disableButton();
                        this.setState({
                          modalVisible: false,
                          otherChargesAmount: '',
                          otherChargesReasonText: ''
                        });
                      }
                      }>
                      <Image
                        source={Close}
                        style={styles.closeIconDimensions}
                        resizeMode="contain"
                      />
                    </TouchableOpacity>
                  </View>
                  <View style={[styles.line]} />
                </View>
                <View style={styles.offerModelContentView}>
                  <Text style={[styles.commentTextStyle, { marginBottom: 10, marginLeft: 0, alignSelf: 'flex-start' }]}>
                    Enter the mail-id
                  </Text>
                  <UserInput
                    numberOfLines={1}
                    placeholder="Email"
                    param="Email"
                    onChange={this.onChangeText}
                    value={this.state.emailIdToSend}
                    containerStyle={styles.otherChargesReasonInputStyle} />
                  <LinearGradient
                    colors={['#f79426', '#f16537']}
                    start={{ x: 0.0, y: 0.0 }}
                    end={{ x: 1.0, y: 1.0 }}>
                    <TouchableOpacity
                      // disabled={this.props.buttonState}
                      onPress={this.continueBtntapped}
                      >
                      <Text style={{
                        paddingHorizontal: 15,
                        paddingVertical: 5,
                        color: 'white',
                        fontFamily: 'SourceSansPro-Bold',
                        fontSize: 14
                      }}>
                        Continue
                      </Text>
                    </TouchableOpacity>
                  </LinearGradient>
                </View>
              </KeyboardAwareScrollView>
            </Modal>
          )
        }
        {(this.state.currentPopUpView === constants.OTHERCHARGES_POPUPVIEW)
          && (
            <Modal
              animationType="fade"
              transparent
              visible={this.state.modalVisible}
              onRequestClose={() => this.setState({
                modalVisible: false,
                otherChargesAmount: '',
                otherChargesReasonText: ''
              })}>
              <View style={styles.modalContentWrapper} />
              <KeyboardAwareScrollView
                style={{ backgroundColor: 'gray', opacity: 0.9 }}
                contentContainerStyle={styles.offerModalContent}
                keyboardShouldPersistTaps="always">
                <View style={[styles.offerTitleModalContent, { backgroundColor: 'white' }]}>
                  <Text style={styles.offerTitleText}>Other Charges:</Text>
                  <View style={styles.modalCloseView}>
                    <TouchableOpacity
                      // disabled={this.props.buttonState}
                      onPress={() => {
                        // // this.props.disableButton();
                        this.setState({
                          modalVisible: false,
                          currentPopUpView: constants.OTHERCHARGES_POPUPVIEW,
                          otherChargesAmount: '',
                          otherChargesReasonText: ''
                        });
                      }
                    }>
                      <Image
                        source={Close}
                        style={styles.closeIconDimensions}
                        resizeMode="contain"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={[styles.line]} />
                <View style={[styles.offerModelContentView, { backgroundColor: 'white' }]}>
                  <UserInput
                    numberOfLines={1}
                    placeholder="Reason"
                    param="otherChargesReasonText"
                    onChange={this.onChangeText}
                    value={this.state.otherChargesReasonText}
                    containerStyle={styles.otherChargesReasonInputStyle} />
                  <UserInput
                    maxLength={5}
                    numberOfLines={1}
                    placeholder="Amount"
                    param="otherChargesAmount"
                    keyboardType="numeric"
                    onChange={this.onChangeText}
                    value={this.state.otherChargesAmount}
                    containerStyle={styles.otherChargesReasonInputStyle} />
                  <LinearGradient
                    colors={['#f79426', '#f16537']}
                    start={{ x: 0.0, y: 0.0 }}
                    end={{ x: 1.0, y: 1.0 }}>
                    <TouchableOpacity
                      // disabled={this.props.buttonState}
                      onPress={this.createBikeOtherCharges}
                    >
                      <Text style={{
                        paddingHorizontal: 15,
                        paddingVertical: 5,
                        color: 'white',
                        fontFamily: 'SourceSansPro-Bold',
                        fontSize: 14
                      }}>
                        APPLY
                      </Text>
                    </TouchableOpacity>
                  </LinearGradient>
                </View>
              </KeyboardAwareScrollView>
            </Modal>
          )
        }
        {(this.state.currentPopUpView === constants.INSURANCE_POPVIEW)
          && (
            <Modal
              animationType="fade"
              transparent
              visible={this.state.modalVisible}
              onRequestClose={() => this.setState({
                modalVisible: false,
                showInsuranceSplitUp: priceBreakdownData
                && priceBreakdownData.proformaInvoice && priceBreakdownData.proformaInvoice.vehicle_price
                && priceBreakdownData.proformaInvoice.vehicle_price.is_insurance_split,
                isFiveYearSelected: priceBreakdownData.proformaInvoice.lead_detail.od_premium_validity === 5,
                isInsuranceForOneYearSelected: priceBreakdownData.proformaInvoice.lead_detail.od_premium_validity === 1,
                isZeroDepreciationSelected: priceBreakdownData.proformaInvoice.lead_detail.zero_depreciation
              })}
            >
              <View style={styles.modalContentWrapper} />
              <View style={[styles.accessoryModalContent, { height: 400 }]}>
                <View>
                  <Text style={styles.accessoryText}>Insurance</Text>
                  <View style={[styles.line]} />
                </View>
                <View style={styles.modalCloseView}>
                  <TouchableOpacity
                    style={styles.closeIconDimensions}
                    // disabled={this.props.buttonState}
                    onPress={() => {
                      const insuranceState = this.state.pristineSplitInsuranceState;
                      this.setState({
                        availInsurance: !this.state.availInsurance,
                        modalVisible: false,
                        ...insuranceState
                      });
                    }}
                  >
                    <Image
                      source={Close}
                      style={styles.closeIconDimensions}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                </View>

                <ScrollView style={{ height: 400 }}>
                  <View style={[styles.accessoriesView, { paddingHorizontal: 10 }]}>
                    <View style={[styles.accessoryRowView, { paddingHorizontal: 5, marginBottom: 10 }]}>
                      {
                      this.state.showInsuranceSplitUp &&
                        <View style={{ flexDirection: 'row', flex: 1, justifyContent: 'center' }}>
                          <Text
                            style={[styles.accessoryNameText, {
                              flex: 0, paddingHorizontal: 10, fontSize: 15, fontWeight: 'bold'
                            }]}
                          >
                            Insurance split-up
                          </Text>
                          <TouchableOpacity
                            // disabled={this.props.buttonState}
                            onPress={() => {
                              // this.props.disableButton();
                              let insuranceState = {};
                              if (!this.state.availInsurance) {
                                insuranceState = this.state.pristineSplitInsuranceState;
                              }
                              this.setState({
                                ...insuranceState,
                                availInsurance: !this.state.availInsurance,
                              });
                            }}
                            style={[styles.checkBoxView,
                              {
                                flex: 0,
                                borderRadius: 50
                              }]}
                          >
                            {
                              this.state.availInsurance
                                ? <Image
                                  style={{
                                    width: 20,
                                    height: 20,
                                    borderRadius: 50,
                                    borderColor: '#6aec5130',
                                    borderWidth: 1
                                  }}
                                  source={selectedCb}
                                  resizeMode="contain"
                                />
                                : <View
                                  style={{
                                    width: 20,
                                    height: 20,
                                    borderRadius: 50,
                                    borderWidth: 1,
                                    borderColor: '#ff6912'
                                  }}
                                />
                            }
                          </TouchableOpacity>
                        </View>
                      }
                      {
                        !this.state.showInsuranceSplitUp &&
                        <View style={{ flexDirection: 'row', flex: 1, justifyContent: 'center' }}>
                          <Text
                            style={[styles.accessoryNameText, {
                              flex: 0, paddingHorizontal: 10, fontSize: 15, fontWeight: 'bold'
                            }]}
                          >
                            Total Insurance
                          </Text>
                          <TouchableOpacity
                            // disabled={this.props.buttonState}
                            onPress={() => {
                              // this.props.disableButton();
                              this.setState({
                                availInsurance: !this.state.availInsurance
                              });
                            }}
                            style={[styles.checkBoxView,
                              {
                                flex: 0,
                                borderRadius: 50
                              }]}
                          >
                            {
                              this.state.availInsurance
                                ? <Image
                                  style={{
                                    width: 20,
                                    height: 20,
                                    borderRadius: 50
                                  }}
                                  source={selectedCb}
                                  resizeMode="contain"
                                />
                                : <View
                                  style={{
                                    width: 20,
                                    height: 20,
                                    borderRadius: 50,
                                    borderWidth: 1,
                                    borderColor: '#ff6912'
                                  }}
                                />
                            }
                          </TouchableOpacity>
                        </View>
                      }
                    </View>
                    {
                      this.state.showInsuranceSplitUp &&
                      <View style={{ flexDirection: 'column' }}>
                        {
                          insurances && insurances.map(insurance => (
                            insurance.type === constants.TP_PREMIUM_TYPE
                              ? (
                                <View style={styles.accessoryRowView}>
                                  <Text style={[styles.accessoryNameText, { flex: 0.5 }]}>
                                    {constants.TP_PREMIUM}
                                  </Text>
                                  <Text style={[styles.accessoryPriceText, { marginLeft: 10 }]}>
                                    {currencyFormatter(insurance.amount)}
                                  </Text>
                                  <TouchableOpacity
                                    disabled
                                    onPress={() => {
                                      // this.props.disableButton();
                                      this.setState({
                                        refreshList: !this.state.refreshList,
                                        isTPPremiumSelected: !this.state.isTPPremiumSelected
                                      });
                                    }}
                                    style={[styles.checkBoxView, { alignItems: 'flex-end' }]}
                                  >
                                    {
                                      this.state.isTPPremiumSelected
                                        ? <Image source={selectedCb} resizeMode="contain" />
                                        : <Image source={unselectedCb} resizeMode="contain" />
                                    }
                                  </TouchableOpacity>
                                </View>
                              ) : null
                          ))
                        }

                        {
                          insurances && insurances.map(insurance => (
                            insurance.type === constants.COMPULSORY_PA_COVER_TYPE
                              ? (
                                <View style={styles.accessoryRowView}>
                                  <Text style={[styles.accessoryNameText, { flex: 0.5 }]}>
                                    {constants.COMPULSORY_PA_COVER}
                                  </Text>
                                  <Text style={[styles.accessoryPriceText, { marginLeft: 10 }]}>
                                    {currencyFormatter(insurance.amount)}
                                  </Text>
                                  <TouchableOpacity
                                    disabled
                                    onPress={() => {
                                      // this.props.disableButton();
                                      this.setState({
                                        refreshList: !this.state.refreshList,
                                        isCompulsaryPACoverSelected: !this.state.isCompulsaryPACoverSelected
                                      });
                                    }}
                                    style={[styles.checkBoxView, { alignItems: 'flex-end' }]}
                                  >
                                    {
                                      this.state.isCompulsaryPACoverSelected
                                        ? <Image source={selectedCb} resizeMode="contain" />
                                        : <Image source={unselectedCb} resizeMode="contain" />
                                    }
                                  </TouchableOpacity>
                                </View>
                              ) : null
                          ))
                        }

                        <View style={styles.accessoryRowView}>
                          {
                            insurances && insurances.map(insurance => (
                              insurance.type === constants.OD_PREMIUM_TYPE && insurance.validity === 1
                                ? (
                                  <View style={{ flexDirection: 'row', marginVertical: 20 }}>
                                    <Text style={[styles.accessoryNameText, { flex: 1, marginRight: 20 }]}>
                                      {constants.OD_PREMIUM}
                                    </Text>
                                    <Text style={styles.accessoryPriceText}>
                                      {currencyFormatter(insurance.amount)}
                                    </Text>
                                    <Text style={styles.accessoryPriceText}>
                                      {insurance.validity}
                                      {' '}
                                      Year
                                    </Text>
                                    <TouchableOpacity
                                      disabled={!this.state.availInsurance}
                                      onPress={() => {
                                        // this.props.disableButton();
                                        this.setState({
                                          refreshList: !this.state.refreshList,
                                          isFiveYearSelected: false,
                                          isInsuranceForOneYearSelected: true
                                        });
                                      }}
                                      style={styles.checkBoxView}
                                    >
                                      {
                                        this.state.isInsuranceForOneYearSelected
                                          ? <Image source={selectedCb} resizeMode="contain" />
                                          : <Image source={unselectedCb} resizeMode="contain" />
                                      }
                                    </TouchableOpacity>
                                  </View>
                                ) : null
                            ))
                          }
                        </View>
                        <View style={styles.accessoryRowView}>
                          {
                            insurances && insurances.map(insurance => (
                              insurance.type === constants.OD_PREMIUM_TYPE && insurance.validity === 5
                                ? (
                                  <View style={{ flexDirection: 'row', marginVertical: 20 }}>
                                    <Text style={[styles.accessoryNameText, { flex: 1, marginRight: 20 }]}>
                                      {constants.OD_PREMIUM}
                                    </Text>
                                    <Text style={styles.accessoryPriceText}>
                                      {currencyFormatter(insurance.amount)}
                                    </Text>
                                    <Text style={styles.accessoryPriceText}>
                                      {insurance.validity}
                                      {' '}
                                      Years
                                    </Text>
                                    <TouchableOpacity
                                      disabled={!this.state.availInsurance}
                                      onPress={() => {
                                        // this.props.disableButton();
                                        this.setState({
                                          refreshList: !this.state.refreshList,
                                          isFiveYearSelected: true,
                                          isInsuranceForOneYearSelected: false
                                        });
                                      }}
                                      style={styles.checkBoxView}
                                    >
                                      {
                                        this.state.isFiveYearSelected
                                          ? <Image source={selectedCb} resizeMode="contain" />
                                          : <Image source={unselectedCb} resizeMode="contain" />
                                      }
                                    </TouchableOpacity>
                                  </View>
                                ) : null
                            ))
                          }
                        </View>
                        <View style={styles.accessoryRowView}>
                          {
                            insurances && insurances.map(insurance => (
                              insurance.type === constants.ZERO_DEPRECIATION_TYPE
                                ? (
                                  <View style={{ flexDirection: 'row', marginVertical: 20 }}>
                                    <Text style={[styles.accessoryNameText, { flex: 0.5, marginRight: 20 }]}>
                                      {constants.ZERO_DEPRECIATION}
                                    </Text>
                                    <Text style={[styles.accessoryPriceText, { marginLeft: 10 }]}>
                                      {currencyFormatter(insurance.amount)}
                                    </Text>
                                    <TouchableOpacity
                                      disabled={!this.state.availInsurance}
                                      onPress={() => {
                                        // this.props.disableButton();
                                        this.setState({
                                          refreshList: !this.state.refreshList,
                                          isZeroDepreciationSelected: !this.state.isZeroDepreciationSelected
                                        });
                                      }}
                                      style={[styles.checkBoxView, { alignItems: 'flex-end' }]}
                                    >
                                      {
                                        this.state.isZeroDepreciationSelected
                                          ? <Image source={selectedCb} resizeMode="contain" />
                                          : <Image source={unselectedCb} resizeMode="contain" />
                                      }
                                    </TouchableOpacity>
                                  </View>
                                ) : null
                            ))
                          }
                        </View>
                      </View>
                    }
                    {
                      !this.state.showInsuranceSplitUp &&
                        <View style={styles.accessoryRowView}>
                          <View style={{ flexDirection: 'row', flex: 1, justifyContent: 'center' }}>
                            <Text style={{ justifyContent: 'center', fontSize: 15, alignSelf: 'center' }}>{constants.RUPEE}</Text>
                            <View style={styles.totalInsuranceStyle}>
                              <Text style={{ alignSelf: 'center', padding: 10, fontSize: 18, fontWeight: 'bold' }}>
                                {this.state.totalInsuranceCharge}
                              </Text>
                            </View>
                          </View>
                        </View>
                    }
                  </View>
                </ScrollView>
                <View style={[styles.line]} />
                <View style={styles.applyButtonStyle}>
                  <LinearGradient
                    colors={['#f79426', '#f16537']}
                    start={{ x: 0.0, y: 0.0 }}
                    end={{ x: 1.0, y: 1.0 }}>
                    <TouchableOpacity
                      onPress={() => {
                        // // this.props.disableButton();
                        priceBreakdownData.nonMandatoryAccessories.map(item => {
                          priceBreakdownData.proformaInvoice.proforma_invoice_accessory.forEach(invoiceItem => {
                            if (invoiceItem.dealer_accessory.id === item.id) {
                              item.isChecked = true;
                            }
                          });
                          item.isChecked = item.isChecked || false;
                          return item;
                        });
                        this.updateProformaAccessories();
                      }}>
                      <Text style={{
                        paddingHorizontal: 15,
                        paddingVertical: 5,
                        color: 'white',
                        fontFamily: 'SourceSansPro-Bold',
                        fontSize: 14
                      }}>
                        APPLY
                      </Text>
                    </TouchableOpacity>
                  </LinearGradient>
                </View>
              </View>
            </Modal>
          )
        }
        {((this.state.currentPopUpView === constants.REMOVEFINANCE_POPUPVIEW) ||
          (this.state.currentPopUpView === constants.FOLLOWUP_POPUPVIEW))
          && (
            <Modal
              animationType="slide"
              transparent
              visible={this.state.modalVisible}
              onRequestClose={() => {
                this.setState({
                  modalVisible: false,
                  isFollowUpComment: false,
                  reasonText: ''
                });
              }}>
              <View style={styles.removeFinancierContainer}>
                <View style={styles.removeFinancierView}>
                  <View style={{ flexDirection: 'row' }}>
                    <Text style={styles.reasonTitleText}>
                      {this.state.isFollowUpComment ? 'Followup details' : 'Reason'}
                    </Text>
                    <TouchableOpacity
                      disabled={this.props.buttonState}
                      style={[styles.closeBtnView, { alignSelf: 'flex-end', width: 40 }]}
                      onPress={() => {
                        this.props.disableButton();
                        this.setState({
                          modalVisible: false,
                          isFollowUpComment: false,
                          reasonText: '',
                        });
                      }}>
                      <Image
                        resizeMode="center"
                        source={Close}
                        style={styles.closeIconDimensions}
                      />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.commentTextStyle}> Comment:</Text>
                  <TextInput
                    maxLength={100}
                    style={styles.reasonFieldContainer}
                    onChangeText={text => this.setState({ reasonText: text })}
                    value={this.state.reasonText}
                    underlineColorAndroid="transparent" />
                  <View style={{ flexDirection: 'row', marginVertical: 20 }}>
                    <View style={{ flex: 1, alignItems: 'center' }}>
                      <BookTestRideButton
                        title="Ok"
                        disabled={this.props.loading || this.props.buttonState}
                        // disabled={this.props.loading}
                        customStyles={styles.okBtnStyle}
                        customTextStyles={styles.okBtnTextStyle}
                        handleSubmit={this.okBtnAction} />
                    </View>
                    <View style={{ flex: 1, alignItems: 'center' }}>
                      <SecondaryButton
                        title="Cancel"
                        // disabled={this.props.buttonState}
                        textStyle={styles.cancelBtnTextStyle}
                        buttonStyle={styles.cancelBtnStyle}
                        handleSubmit={this.cancelBtnAction} />
                    </View>
                  </View>
                </View>
              </View>
            </Modal>
          )
        }
        {(this.state.currentPopUpView === constants.EXCHANGE_POPUPVIEW)
          && (
            <Modal
              animationType="slide"
              transparent
              visible={this.state.modalVisible}
              onRequestClose={() => {
                this.setState({
                  modalVisible: false,
                  dirty: false,
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
              }}>
              <View style={[styles.modalContainer, { opacity: 0.9 }]}>
                <ScrollView style={styles.scrollViewContainer}>
                  <View style={styles.modalDataContainer}>
                    <TouchableOpacity
                      // disabled={this.props.buttonState}
                      style={styles.closeBtnView}
                      onPress={() => {
                        // this.props.disableButton();
                        this.setState({
                          modalVisible: false,
                          dirty: false,
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
                        resizeMode="center"
                        source={Close}
                        style={styles.closeIconDimensions}
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
                                single="true"
                                separator="true"
                                subSeparator="true"
                                uniqueKey="manufacturer"
                                subKey="children"
                                displayKey="manufacturer"
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
                                single="true"
                                separator="true"
                                subSeparator="true"
                                uniqueKey="vehicle"
                                subKey="children"
                                displayKey="vehicle"
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
                            onChangeText={text => this.setState({ excVehicleYear: text, dirty: true })}
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
                            onChangeText={text => this.setState({ kmsDriven: text, dirty: true })}
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
                          // disabled={this.props.buttonState}
                          style={[styles.calculateBtnStyle, { width: 200 }]}
                          handleSubmit={
                            () => this.calculateExchangeValue()
                          }
                          textStyle={styles.calculateBtnTextStyle}
                        />
                      </View>
                    </View>
                    <View style={styles.exchangeVehicleDetailView}>
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
                              onChangeText={text => this.setState({ exchangeValueAmount: text, dirty: true })}
                              value={(this.state.exchangeValueAmount)
                                ? (`${this.state.exchangeValueAmount}`.includes('.')
                                  ? `${this.state.exchangeValueAmount}`.split('.')[0]
                                  : `${this.state.exchangeValueAmount}`) : ''}
                              underlineColorAndroid="transparent" />
                          </View>
                        </View>
                        <View style={styles.dropDowmOverView}>
                          <Dropdown
                            label="Condition"
                            labelFontSize={14}
                            disabled={this.props.buttonState}
                            disabledItemColor="red"
                            containerStyle={{ flex: 1 }}
                            fontSize={13}
                            itemTextStyle={{ fontSize: 10, fontFamily: fonts.sourceSansProBoldItalic }}
                            data={this.state.bikeConditions || []}
                            baseColor={variables.lightGrey}
                            value={this.state.bikeCondition || ''}
                            // onFocus={lead.enquirySource ? this.props.disableButton : () => {}}
                            onChangeText={value => {
                              this.setState(() => ({
                                bikeCondition: value
                              }));
                            }}
                            labelExtractor={({ label }) => label}
                            // eslint-disable-next-line camelcase
                            valueExtractor={({ value }) => value}
                          />
                        </View>
                      </View>
                      <View style={styles.ecxhangeDetailOverView}>
                        <View style={styles.vehicleDropDownView}>
                          <View style={styles.dropDowmOverView}>
                            <View style={styles.commentWrapper}>
                              <Text style={styles.actionLabel}>Remarks</Text>
                              <View style={styles.commentView}>
                                <TextInput
                                  returnKeyType="done"
                                  style={{ height: 80 }}
                                  textAlignVertical="top"
                                  numberOfLines={4}
                                  editable={true}
                                  onChangeText={text => this.setState({ bikeRemarks: text, dirty: false })}
                                  value={this.state.bikeRemarks}
                                  underlineColorAndroid="transparent" />
                              </View>
                            </View>
                          </View>
                        </View>
                        <View style={{
                          margin: 10, marginTop: 30, flex: 1, flexDirection: 'row-reverse'
                        }}>
                          <ButtonWithPlainText
                            title="Save"
                            // disabled={this.state.exchangeValueAmount === '0' || this.state.exchangeValueAmount.length === 0 || this.props.buttonState}
                            disabled={this.state.exchangeValueAmount === '0' || this.state.exchangeValueAmount.length === 0}
                            style={[styles.calculateExchangeBtnStyle, {
                              width: 200,
                              backgroundColor: (this.state.exchangeValueAmount === '0'
                                || this.state.exchangeValueAmount.length === 0) ? 'gray' : '#f37730'
                            }]}
                            handleSubmit={
                              () => this.saveExchangeBtnAction()
                            }
                            textStyle={styles.calculateExchangeBtnTextStyle}
                          />
                        </View>
                      </View>
                    </View>
                  </View>
                </ScrollView>
              </View>
            </Modal>
          )
        }
        {((this.state.currentPopUpView === constants.OFFER_POPUPVIEW) || (this.state.currentPopUpView === constants.ACCESSORIES_POPUPVIEW))
          && (
            <Modal
              animationType="fade"
              transparent
              visible={this.state.modalVisible}
              onRequestClose={() => {
                priceBreakdownData.nonMandatoryAccessories = priceBreakdownData.nonMandatoryAccessories.map(item => {
                  item.isChecked = false;
                  return item;
                });
                this.setState({ modalVisible: false, priceBreakdownData, refreshList: !refreshList });
              }
            }
            >
              <View style={styles.modalContentWrapper} />
              {
                this.state.isAccessory
                  ? (
                    <View
                      style={styles.accessoryModalContent}
                    >
                      <View style={styles.modalCloseView}>
                        <TouchableOpacity
                          // disabled={this.props.buttonState}
                          onPress={() => {
                            // this.props.disableButton();
                            priceBreakdownData.nonMandatoryAccessories = priceBreakdownData.nonMandatoryAccessories.map(item => {
                              item.isChecked = false;
                              return item;
                            });
                            this.setState({ modalVisible: false, priceBreakdownData, refreshList: !refreshList });
                          }}
                        >
                          <Image
                            source={Close}
                            style={styles.closeIconDimensions}
                            resizeMode="contain"
                          />
                        </TouchableOpacity>
                      </View>
                      <View>
                        <Text style={styles.accessoryText}>Accessories</Text>
                        <View style={[styles.line]} />
                      </View>
                      <View style={styles.accessoriesView}>
                        {
                          priceBreakdownData.nonMandatoryAccessories
                            && priceBreakdownData.nonMandatoryAccessories.length > 0
                            ? (
                              <FlatList
                                keyExtractor={this._keyExtractor}
                                data={priceBreakdownData.nonMandatoryAccessories}
                                renderItem={({ item }) => this.renderAccessoryItem(item)}
                                extraData={this.state.refreshList}
                              />
                            )
                            : (
                              <Text style={{ color: '#f16537', marginVertical: 20 }}>
                                Please update the accessories list for the vehicle.
                              </Text>
                            )
                        }
                      </View>
                      <View style={[styles.line]} />
                      <View style={styles.applyButtonStyle}>
                        {
                          priceBreakdownData.nonMandatoryAccessories
                          && priceBreakdownData.nonMandatoryAccessories.length > 0
                          && (
                            <LinearGradient
                              colors={['#f79426', '#f16537']}
                              start={{ x: 0.0, y: 0.0 }}
                              end={{ x: 1.0, y: 1.0 }}>
                              <TouchableOpacity
                                // disabled={this.props.buttonState}
                                onPress={this.updateProformaAccessories}
                                >
                                <Text style={{
                                  paddingHorizontal: 15,
                                  paddingVertical: 5,
                                  color: 'white',
                                  fontFamily: 'SourceSansPro-Bold',
                                  fontSize: 14
                                }}>
                                  APPLY
                                </Text>
                              </TouchableOpacity>
                            </LinearGradient>
                          )
                        }
                      </View>
                    </View>
                  )
                  : (
                    <KeyboardAwareScrollView
                      style={{ backgroundColor: 'gray', opacity: 0.9 }}
                      contentContainerStyle={styles.offerModalContent}
                      keyboardShouldPersistTaps="always"
                    >
                      <View style={styles.offerTitleModalContent}>
                        <Text style={styles.offerTitleText}>Offer:</Text>
                        <View style={styles.modalCloseView}>
                          <TouchableOpacity
                            // disabled={this.props.buttonState}
                            onPress={() => {
                              // this.props.disableButton();
                              this.setState({ modalVisible: false });
                            }}>
                            <Image
                              source={Close}
                              style={styles.closeIconDimensions}
                              resizeMode="contain"
                            />
                          </TouchableOpacity>
                        </View>
                        <View style={[styles.line]} />
                      </View>
                      <View style={styles.offerModelContentView}>
                        <UserInput
                          maxLength={20}
                          numberOfLines={1}
                          placeholder="Offer description"
                          param="Offer reason"
                          onChange={this.onChangeText}
                          value={this.state.offerReasontext}
                          containerStyle={styles.offerInputStyle}
                        />
                        <UserInput
                          maxLength={5}
                          numberOfLines={1}
                          placeholder="Offer Amount"
                          param="offer"
                          keyboardType="numeric"
                          onChange={this.onChangeText}
                          value={this.state.offerValue}
                          containerStyle={styles.offerInputStyle}
                        />
                        <View style={[styles.line]} />
                        <LinearGradient
                          colors={['#f79426', '#f16537']}
                          start={{ x: 0.0, y: 0.0 }}
                          end={{ x: 1.0, y: 1.0 }}>
                          <TouchableOpacity
                            // disabled={this.props.buttonState}
                            onPress={() => { this.createBikeOffer(); }}
                          >
                            <Text style={{
                              paddingHorizontal: 15,
                              paddingVertical: 5,
                              color: 'white',
                              fontFamily: 'SourceSansPro-Bold',
                              fontSize: 14
                            }}>
                              APPLY
                            </Text>
                          </TouchableOpacity>
                        </LinearGradient>
                      </View>
                    </KeyboardAwareScrollView>
                  )
              }

            </Modal>
          )
        }
        {(this.state.currentPopUpView === constants.UPDATE_EMI_POPUPVIEW)
          && (
            <Modal
              animationType="slide"
              transparent
              visible={this.state.modalVisible}
              onRequestClose={() => {
                this.setState({
                  modalVisible: false,
                  currentModel: 'SendOtpView',
                  AdvancedEmiVal: `${this.props.financierLead.advance_emi}`,
                  emiVal: `${this.props.financierLead.emi}`,
                  tenureVal: this.props.financierLead.tenure,
                  downpayment: `${this.props.financierLead.down_payment}`,
                  loanAmount: `${this.props.financierLead.loan_amount}`,
                  ROIVal: this.props.financierLead.interest_percentage,
                  dirty: false,
                  isFinanceOptionTapped: false,
                });
              }}
            >
              <KeyboardAwareScrollView keyboardShouldPersistTaps="always">
                <View style={styles.modalconatiner}>
                  <TouchableOpacity
                    // disabled={this.props.buttonState}
                    style={styles.closeBtnView}
                    onPress={() => {
                      // this.props.disableButton();
                      this.setState({
                        modalVisible: false,
                        currentModel: 'SendOtpView',
                        AdvancedEmiVal: `${this.props.financierLead.advance_emi}`,
                        emiVal: `${this.props.financierLead.emi}`,
                        tenureVal: this.props.financierLead.tenure,
                        downpayment: `${this.props.financierLead.down_payment}`,
                        loanAmount: `${this.props.financierLead.loan_amount}`,
                        ROIVal: this.props.financierLead.interest_percentage,
                        dirty: false,
                        isFinanceOptionTapped: false,
                      });
                    }}
                  >
                    <Image
                      resizeMode="center"
                      source={Close}
                      style={styles.closeIconDimensions}
                    />
                  </TouchableOpacity>
                  <View style={styles.modalMainContainer}>
                    <View style={styles.vehicleDetailView}>
                      <Image
                        source={{
                          uri: (leadDetailObj && leadDetailObj.vehicle
                            && leadDetailObj.vehicle.name) ? leadDetailObj.vehicle.image_url : 'http://'
                        }}
                        style={styles.vehicleImageStyle}
                        resizeMode="contain"
                      />
                      <View style={styles.specificationViewStyle}>
                        <Text style={styles.specsDetailTextStyle}>
                          {(leadDetailObj && leadDetailObj.vehicle
                            && leadDetailObj.vehicle.name) ? leadDetailObj.vehicle.name : ''}
                        </Text>
                      </View>
                      <View style={styles.specificationViewStyle}>
                        <Text style={styles.specheadertextStyle}>
                          Financier
                        </Text>
                        <Text style={styles.specsDetailTextStyle}>
                          {(this.state.localfinancierLead
                            && this.state.localfinancierLead.financier
                            && this.state.localfinancierLead.financier.name)
                            ? this.state.localfinancierLead.financier.name : ''}
                        </Text>
                      </View>
                      <View style={styles.specificationViewStyle}>
                        <Text style={styles.specheadertextStyle}>
                          Loan Amount
                        </Text>
                        <Text style={styles.specsDetailTextStyle}>
                          {this.state.localfinancierLead.loan_amount
                            && (`${this.state.localfinancierLead.loan_amount}`.includes('.')
                              ? `${this.state.localfinancierLead.loan_amount}`.split('.')[0]
                              : `${currencyFormatter(this.state.localfinancierLead.loan_amount)}`)
                          }
                        </Text>
                      </View>
                      <View style={styles.specificationViewStyle}>
                        <Text style={styles.specheadertextStyle}>
                          Interest
                        </Text>
                        <Text style={styles.specsDetailTextStyle}>
                          {this.state.ROIVal}%
                        </Text>
                      </View>
                    </View>
                    <View style={styles.dataContainerView}>
                      <Text style={[styles.offerTextStyle, { fontSize: 16, marginHorizontal: 20, marginVertical: 10 }]}>
                        Finance options
                      </Text>
                      <View style={styles.seperator} />
                      <View style={{ flex: 1 }}>
                        {
                            this.updateCurrentView()
                        }
                      </View>
                    </View>
                  </View>
                </View>
              </KeyboardAwareScrollView>
            </Modal>
          )
        }
        <View style={styles.header}>
          <TouchableOpacity
            // disabled={this.props.buttonState}
            style={styles.headerBack}
            onPress={() => {
              // this.props.disableButton();
              if (this.props.navigation.state.params.fromScreen === 'fromUploadDocument') {
                const resetAction = StackActions.reset({
                  index: 1,
                  actions: [
                    NavigationActions.navigate({ routeName: 'Dashboard' }),
                    NavigationActions.navigate({ routeName: 'NewLeadsOverview' }),
                  ],
                });
                this.props.navigation.dispatch(resetAction);
              } else {
                this.props.navigation.goBack();
              }
            }}>
            <Image source={backIcon} resizeMode="contain" />
          </TouchableOpacity>
          <View style={styles.headerNameView}>
            {
              (priceBreakdownData.proformaInvoice && priceBreakdownData.proformaInvoice.lead)
                ? (priceBreakdownData.proformaInvoice.lead.name)
                  ? <Text style={styles.nameText}>{priceBreakdownData.proformaInvoice.lead.name}</Text>
                  : <Text style={styles.nameText}>N/A</Text>
                : null
            }
            <Text style={[styles.nameText, { marginLeft: 12 }]}>
              {
                (priceBreakdownData.proformaInvoice && priceBreakdownData.proformaInvoice.lead)
                  ? (priceBreakdownData.proformaInvoice.lead.mobile_number)
                    ? <Text style={styles.nameText}>{priceBreakdownData.proformaInvoice.lead.mobile_number}</Text>
                    : <Text style={styles.nameText}>N/A</Text>
                  : null
              }
            </Text>
          </View>
          <View style={styles.headerBikeValueStyle}>
            {
              (bikeDetails.manufacturer)
                ? (bikeDetails.manufacturer && bikeDetails.name && bikeDetails.manufacturer.display_name)
                  ? (
                    <Text style={styles.headerBikeValueTextStyle}>
                      {bikeDetails.manufacturer.display_name}
                      {' '}
                      {bikeDetails.name}
                    </Text>
                  )
                  : <Text style={styles.headerBikeValueTextStyle}>N/A</Text>
                : null
            }
          </View>
          <View style={styles.headerBikeValueStyle}>
            <Text style={styles.headerBikeValueTextStyle}>
              {
                (priceBreakdownData.proformaInvoice && priceBreakdownData.proformaInvoice.vehicle_price)
                  ? (priceBreakdownData.proformaInvoice.vehicle_price.onroad_price)
                    ? (
                      <Text style={styles.nameText}>
                        {currencyFormatter(priceBreakdownData.proformaInvoice.vehicle_price.onroad_price)}
                      </Text>
                    )
                    : <Text style={styles.nameText}>N/A</Text>
                  : null
              }
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.headerBikeValueStyle, { opacity: 0.2 }]}
            // disabled={this.props.loading || this.props.buttonState}
            disabled={this.props.loading}
            onPress={() => {
              // this.props.disableButton();
              this.setState({
                modalVisible: true,
                offerValue: '',
                offerReasontext: '',
                isAccessory: false,
                currentPopUpView: constants.OFFER_POPUPVIEW
              });
            }}
            activeOpacity={0.8}
          >
            <Image source={offerIcon} resizeMode="contain" />
          </TouchableOpacity>
          <TouchableOpacity
            // disabled={this.props.buttonState}
            style={[styles.emailIconStyle, { opacity: 0.2 }]}
            onPress={this.sendMessage}
            activeOpacity={0.8}
          >
            <Icon
              name="commenting"
              size={21}
              color="white"
              style={{ alignSelf: 'center', marginHorizontal: 2 }} />
          </TouchableOpacity>
          <TouchableOpacity
            // disabled={this.props.buttonState}
            style={[styles.emailIconStyle]}
            onPress={this.sendEmailTapped}
            activeOpacity={0.5}
          >
            <Icon
              name="paper-plane"
              size={21}
              color="white"
              style={{ alignSelf: 'center', marginHorizontal: 2 }} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.emailIconStyle]}
            onPress={this.onHandlePrintOut}
            disabled={this.props.loading || this.props.buttonState}
            // disabled={this.props.loading}
            activeOpacity={0.7}
          >
            <Icon
              name="print"
              size={21}
              color="white"
              style={{ alignSelf: 'center', marginHorizontal: 2 }} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.exchangeBikeValueStyle}
            // disabled={this.props.loading || this.props.buttonState}
            disabled={this.props.loading}
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
                    {/* /- */}
                  </Text>
                    {/*            {
                    Object.keys(this.state.localfinancierLead).length === 0
                    && ( */}
                  <TouchableOpacity
                    // disabled={Object.keys(this.state.localfinancierLead).length !== 0 || this.props.buttonState}
                    // disabled={Object.keys(this.state.localfinancierLead).length !== 0}
                    style={{ alignItems: 'center', justifyContent: 'center' }}
                    onPress={() => this.onDeleteIconPress()}>
                    <Icon
                      name="trash"
                      // disabled={Object.keys(this.state.localfinancierLead).length !== 0}
                      size={21}
                      color="white"
                      style={{ alignSelf: 'center', marginHorizontal: 5 }}
                    />
                  </TouchableOpacity>
                  {/*   )
                  } */}
                </View>
              )
            }
          </TouchableOpacity>
          <ButtonWithRightImage
            title="Go To Home"
            // disabled={this.props.buttonState}
            style={styles.goToHome}
            handleSubmit={this.gotoHome}
          />
          <View style={styles.saveView}>
            <Image source={saveIcon} resizeMode="contain" />
          </View>
        </View>
        <ScrollView>
          <View style={styles.mainContainer}>
            {Object.keys(this.state.localfinancierLead).length !== 0
              && (
                <View style={{
                  flex: 3, backgroundColor: 'white', marginVertical: 10, elevation: 3
                }}>
                  <View style={styles.detailSectionView}>
                    <View style={{ flex: 1 }}>
                      {this.getDetailHeaderArray()}
                    </View>
                    <View style={styles.detailValueView}>
                      <Text style={styles.detailValueTextStyle}>
                        {(this.state.localfinancierLead
                          && this.state.localfinancierLead.financier
                          && this.state.localfinancierLead.financier.name)
                          ? this.state.localfinancierLead.financier.name : ''
                        }
                      </Text>
                      <Text style={styles.detailValueTextStyle}>
                        {this.state.localfinancierLead.loan_amount
                          && (`${this.state.localfinancierLead.loan_amount}`.includes('.')
                            ? `${this.state.localfinancierLead.loan_amount}`.split('.')[0]
                            : `${currencyFormatter(this.state.localfinancierLead.loan_amount)}`)}
                      </Text>
                      <Text style={styles.detailValueTextStyle}>
                        {this.state.localfinancierLead.interest_percentage}
                        %
                      </Text>
                      <Text style={styles.detailValueTextStyle}>
                        {this.state.localfinancierLead.down_payment
                          && (`${this.state.localfinancierLead.down_payment}`.includes('.')
                            ? `${this.state.localfinancierLead.down_payment}`.split('.')[0]
                            : `${currencyFormatter(this.state.localfinancierLead.down_payment)}`)}
                      </Text>
                      <Text style={styles.detailValueTextStyle}>
                        {this.state.localfinancierLead.emi
                          && (`${this.state.localfinancierLead.emi}`.includes('.')
                            ? `${this.state.localfinancierLead.emi}`.split('.')[0]
                            : `${currencyFormatter(this.state.localfinancierLead.emi)}`)}
                      </Text>
                      <Text style={styles.detailValueTextStyle}>
                        {this.state.localfinancierLead.tenure}
                        {' '}
                        Months
                      </Text>
                      <Text style={styles.detailValueTextStyle}>
                        {this.state.localfinancierLead.advance_emi
                          && (`${this.state.localfinancierLead.advance_emi}`.includes('.')
                            ? `${this.state.localfinancierLead.advance_emi}`.split('.')[0]
                            : `${this.state.localfinancierLead.advance_emi}`)}
                        {' '}
                        Month(s)
                      </Text>
                      {this.state.localfinancierLead.status === 500
                        && (
                          <View style={styles.detailValueTextStyle}>
                            <TouchableOpacity
                              // disabled={this.props.loading || this.props.buttonState}
                              disabled={this.props.loading}
                              onPress={() => {
                                // this.props.disableButton();
                                if (this.props.currentUser && this.props.currentUser.dealerId) {
                                  this.props.getFinancierRepresentativeList(
                                    this.props.currentUser.dealerId,
                                    this.state.localfinancierLead.financier.id
                                  ).then(() => {
                                    let currentFinancierRep;
                                    if (this.props.financierRepresentativeList.length === 0) {
                                      currentFinancierRep = {
                                        user: {
                                          id: 1,
                                          first_name: 'No financier rep'
                                        }
                                      };
                                    /* this.state.currentFinancierRep = {
                                        user: {
                                          id: 1,
                                          first_name: 'No financier rep'
                                        }
                                      }; */
                                    }
                                    this.setState({
                                      currentFinancierRep: this.props.financierRepresentativeList.length === 0
                                        ? currentFinancierRep : { ...this.props.financierRepresentativeList[0] },
                                      currentPopUpView: constants.UPDATE_EMI_POPUPVIEW,
                                      modalVisible: true,
                                      currentModel: 'SendOtpView',
                                      AdvancedEmiVal: `${this.state.localfinancierLead.advance_emi}`,
                                      emiVal: `${this.state.localfinancierLead.emi}`,
                                      tenureVal: this.state.localfinancierLead.tenure,
                                      loanAmount: `${this.props.financierLead.loan_amount}`,
                                      downpayment: `${this.props.financierLead.down_payment}`,
                                      ROIVal: this.state.localfinancierLead.interest_percentage,
                                    });
                                  })
                                    .catch(error => {
                                      console.log('ERROR:::', error);
                                    });
                                }
                              }
                              }
                            >
                              <View style={styles.financierEditBtnViewStyle}>
                                <Text style={styles.editBtnTextViewStyle}>
                                  Edit
                                </Text>
                              </View>
                            </TouchableOpacity>
                          </View>
                        )
                      }
                    </View>
                  </View>
                </View>
              )}
            <View style={{ flex: 8, flexDirection: 'row' }}>
              <View style={[styles.bikeContainer]}>
                <View style={styles.bikeHeader}>
                  <View style={{ flex: 1 }}>
                    {
                      (bikeDetails.manufacturer)
                        ? (bikeDetails.manufacturer.display_name)
                          ? <Text style={styles.bikeNameText}>{bikeDetails.manufacturer.display_name.toUpperCase()}</Text>
                          : <Text style={styles.bikeNameText}>N/A</Text>
                        : null
                    }
                    {
                      <Text style={styles.bikeModelText}>{(bikeDetails.name) ? bikeDetails.name : ''}</Text>
                    }
                  </View>
                  <View style={styles.bikeSpecsView}>
                    <View style={{ marginRight: 20 }}>
                      <View style={styles.bikeSpecValueView}>
                        {
                          (
                            bikeDetails.variants
                          )
                            ? (bikeDetails.variants.length > 0
                              && bikeDetails.variants[variantIndex].displacement)
                              ? (
                                <Text style={styles.bikeSpecsBoldText}>
                                  {bikeDetails.variants[variantIndex].displacement}
                                </Text>
                              )
                              : <Text style={styles.bikeSpecsBoldText}>N/A</Text>
                            : null
                        }
                        {/* <Text style={styles.bikeSpecLightText}>
                          cc
                        </Text> */}
                      </View>
                      <Text style={styles.specLabelText}>Engine</Text>
                    </View>
                    {
                      constants.vehicleToHideMileage !== (this.props.currentUser && this.props.currentUser.manufacturerSlug) &&
                      // !constants.hideMileage &&
                      <View style={{ marginRight: 20 }}>
                        <View style={styles.bikeSpecValueView}>
                          {
                            (bikeDetails.variants
                              && bikeDetails.variants.length > 0
                              && bikeDetails.variants[variantIndex].fuel_efficiency_overall
                            )
                              ? (bikeDetails.variants.length > 0
                                && bikeDetails.variants[variantIndex].fuel_efficiency_overall)
                                ? (
                                  <Text style={styles.bikeSpecsBoldText}>
                                    {bikeDetails.variants[variantIndex].fuel_efficiency_overall}
                                  </Text>
                                )
                                : <Text style={styles.bikeSpecsBoldText}>N/A</Text>
                              : <Text style={styles.bikeSpecsBoldText}>N/A</Text>
                          }
                          {/*                  <Text style={styles.bikeSpecLightText}>
                            kmpl
                          </Text> */}
                        </View>
                        <Text style={styles.specLabelText}>Mileage</Text>
                      </View>
                    }
                    <View>
                      <View style={styles.bikeSpecValueView}>
                        {
                          (bikeDetails.variants)
                            ? (bikeDetails.variants.length > 0
                              && bikeDetails.variants[variantIndex].overall_weight)
                              ? (
                                <Text style={styles.bikeSpecsBoldText}>
                                  {bikeDetails.variants[variantIndex].overall_weight}
                                </Text>
                              )
                              : <Text style={styles.bikeSpecsBoldText}>N/A</Text>
                            : null
                        }
                        {/* <Text style={styles.bikeSpecLightText}>
                          kg
                        </Text> */}
                      </View>
                      <Text style={styles.specLabelText}>Weight</Text>
                    </View>
                  </View>
                </View>
                {this.props.proformaResponse && Object.keys(this.props.proformaResponse).length > 0
                  && this.props.proformaResponse.offer
                  && this.props.proformaResponse.offer.offer && this.props.proformaResponse.offer.offer.length > 0
                  && (
                    <View
                      style={styles.toolTipViewStyle}>
                      <PopoverController>
                        {({
                          openPopover, closePopover,
                          popoverVisible, setPopoverAnchor, popoverAnchorRect
                        }) => (
                          <React.Fragment>
                            {
                                this.props.proformaResponse
                                  && this.props.proformaResponse.offer
                                  && this.props.proformaResponse.offer.offer
                                  && this.props.proformaResponse.offer.offer.length > 0
                                  && (
                                    this.props.proformaResponse.offer.offer.toLowerCase() === 'no offer'
                                    || this.props.proformaResponse.offer.offer.toLowerCase() === 'no offers'
                                    || this.props.proformaResponse.offer.offer.toLowerCase() === 'nooffers'
                                    || this.props.proformaResponse.offer.offer.toLowerCase() === 'nooffer'
                                  )
                                  ? null
                                  : (
                                    <React.Fragment>
                                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <TouchableOpacity
                                          // disabled={this.props.buttonState}
                                          style={styles.toolTipBtnStyle}
                                          ref={setPopoverAnchor}
                                          onPress={() => {
                                            // this.props.disableButton();
                                            this.setState({
                                              toolTipText: this.props.proformaResponse
                                              && this.props.proformaResponse.offer
                                              && this.props.proformaResponse.offer.offer
                                              && this.props.proformaResponse.offer.offer.length > 0
                                                ? this.props.proformaResponse.offer.offer : 'No offer'
                                            });
                                            openPopover();
                                          }}>
                                          <Image
                                            style={styles.toolTipImageStyle}
                                            resizeMode="contain"
                                            source={offerImage}
                                        />
                                        </TouchableOpacity>
                                      </View>
                                      <Popover
                                        visible={popoverVisible}
                                        onClose={closePopover}
                                        fromRect={popoverAnchorRect}
                                        supportedOrientations={['portrait', 'landscape']}
                                    >
                                        <Text>{this.state.toolTipText}</Text>
                                      </Popover>
                                    </React.Fragment>
                                  )
                              }
                          </React.Fragment>
                        )}
                      </PopoverController>
                    </View>
                  )
                }
                {
                  ((bikeDetails.variants && bikeDetails.variants.length > 0)
                    && (bikeDetails.variants[variantIndex].colors[colorIndex].image_url))
                    ? (
                      <Image
                        source={{ uri: bikeDetails.variants[variantIndex].colors[colorIndex].image_url }}
                        resizeMode="contain"
                        style={styles.bikeImageStyle}
                      />
                    )
                    : <View style={styles.bikeImageStyle} />
                }
                <View style={styles.bikePriceView}>
                  {
                    Object.keys(this.state.localfinancierLead).length !== 0
                      ? (
                        <View style={styles.variantView}>
                          <View style={{
                            flexDirection: 'row',
                            justifyContent: 'flex-start',
                            marginLeft: 10
                          }}>
                            <Icon
                              name="circle"
                              size={15}
                              color="#7ed321"
                              style={{ alignSelf: 'center', marginHorizontal: 2 }} />
                            <Text style={styles.priceText}>
                              {this.state.variantValue}
                              {' '}
                            </Text>
                          </View>
                        </View>
                      )
                      : (
                        <View style={styles.variantDropdownView}>
                          <Picker
                            enabled={!this.isVehicleBooked()}
                            selectedValue={this.state.variantValue}
                            mode="dropdown"
                            style={{ height: 20 }}
                            onValueChange={(itemValue, itemIndex) => {
                              this.setState(
                                {
                                  variantValue: itemValue,
                                  colorIndex: 0
                                },
                                () => this.updateProformaInvoice(itemIndex)
                              );
                            }}
                          >
                            {
                              (bikeDetails.variants && bikeDetails.variants.length > 0)
                                ? bikeDetails.variants.map(item => (
                                  <Picker.Item label={item.name} value={item.name} key={item.id} />
                                ))
                                : null
                            }
                          </Picker>
                        </View>
                      )
                  }
                  <View
                    style={[styles.availableColorView]}
                  >
                    <Text style={styles.availableColorText}>Available Colors</Text>
                    <ScrollView horizontal contentContainerStyle={styles.colorView}>
                      {
                        (bikeDetails.variants
                          && bikeDetails.variants.length > 0
                          && bikeDetails.variants[variantIndex]
                          && bikeDetails.variants[variantIndex].colors.length > 0
                        )
                          ? bikeDetails.variants[variantIndex].colors.map((color, index) => (
                            <TouchableOpacity
                              // disabled={this.props.buttonState}
                              key={color}
                              style={{ marginRight: 10 }}
                              onPress={() => {
                                this.updateProformaInvoiceColor(index);
                              }}
                            >
                              {
                                (color.color_codes.length > 0)
                                  ? (
                                    <View style={(index === colorIndex)
                                      ? styles.colorSelectedView : styles.colorNormalView}>
                                      {
                                        color.color_codes.map(colorCodes => (
                                          <View style={{ flex: 1, backgroundColor: `${colorCodes}` }} />
                                        ))
                                      }
                                    </View>
                                  )
                                  : null
                              }
                            </TouchableOpacity>
                          ))
                          : null
                      }
                    </ScrollView>
                  </View>
                  <View style={styles.onRoadPriceView}>
                    <Text style={styles.availableColorText}>On Road Price</Text>
                    {
                      (bikeDetails.variants)
                        ? (bikeDetails.variants.length > 0 && bikeDetails.variants[variantIndex].prices
                          && bikeDetails.variants[variantIndex].prices.onroad_price)
                          ? (
                            <View>
                              <Text style={styles.bikePrice}>
                                {currencyFormatter(bikeDetails.variants[variantIndex].prices.onroad_price)}
                              </Text>
                              <Text style={styles.bikePriceLabel}>onwards</Text>
                            </View>
                          )
                          : <Text style={styles.bikePrice}>N/A</Text>
                        : null
                    }
                  </View>
                  {
                    this.enableTestRide()
                  }
                </View>

                {(this.props.lead && this.props.lead.follow_up && this.props.lead.follow_up.length > 0)
                  ? (
                    <View style={styles.followUpDateView}>
                      <View style={styles.dateView}>
                        <Text style={styles.actionLabel}>Date & Time: </Text>
                        <Text style={[styles.actionLabel, { marginLeft: 10 }]}>
                          {
                            (this.props.lead && this.props.lead.follow_up && this.props.lead.follow_up.length > 0
                              && this.props.lead.follow_up[0].follow_up_at)
                            && moment(this.props.lead.follow_up[0].follow_up_at).utc('+5:30').format('DD MMM, YYYY  LT')
                          }
                        </Text>
                      </View>
                      <View style={styles.followUpDone}>
                        <Text style={[styles.actionLabel, { marginRight: 10 }]}>Follow Up Done</Text>
                        {
                          <TouchableOpacity
                            // disabled={this.props.buttonState}
                            style={{
                              width: 30, height: 30, alignItems: 'center', justifyContent: 'center'
                            }}
                            onPress={() => {
                              // this.props.disableButton();
                              this.setState({
                                isFollowUpComment: true,
                                reasonText: '',
                                modalVisible: true,
                                currentPopUpView: constants.FOLLOWUP_POPUPVIEW
                              });
                            }}>
                            {
                              (this.state.followUpDone)
                                ? <Image source={selectedCb} style={{ width: 20, height: 20 }} resizeMode="contain" />
                                : <Image source={unselectedCb} style={{ width: 20, height: 20 }} resizeMode="contain" />
                            }
                          </TouchableOpacity>
                        }
                      </View>
                    </View>
                  )
                  : (
                    <View style={styles.scheduleFollowView}>
                      {
                        (this.props.lead && this.props.lead.follow_up && this.props.lead.follow_up.length === 0)
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
                            <TouchableOpacity
                              // disabled={this.props.loading || this.props.buttonState}
                              disabled={this.props.loading}
                              style={{ flexDirection: 'row' }}
                              onPress={() => { this.handleDatePicker(); }}>
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
                            <TouchableOpacity
                              // disabled={this.props.buttonState}
                              style={{ flexDirection: 'row' }}
                              onPress={() => { this.handleTimePicker(); }}
                            >
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
                }

                {
                  this.props.lead && !this.props.lead.is_lost && this.state.scheduleFollowUp
                  && (
                    <View style={{ alignItems: 'flex-end', margin: 10 }}>
                      <TouchableOpacity
                        disabled={this.props.buttonState}
                        onPress={this.handleDoneClick}
                      >
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
              </View>
              <View style={styles.breakdownContainer}>
                <View style={styles.line} />
                <Text style={styles.priceBreakdownText}>Price Breakdown</Text>
                <View style={styles.line} />
                <ScrollView>
                  <View style={{ marginHorizontal: 14, marginVertical: 10 }}>
                    <View style={styles.breakdownLabelView}>
                      <Text style={styles.priceText}>Ex-Showroom Price</Text>
                      {
                        (
                          priceBreakdownData.proformaInvoice
                          && priceBreakdownData.proformaInvoice.vehicle_price
                        )
                          ? (priceBreakdownData.proformaInvoice.vehicle_price.ex_showroom_price)
                            ? (
                              <Text style={styles.priceText}>
                                {currencyFormatter(priceBreakdownData.proformaInvoice.vehicle_price.ex_showroom_price)}
                              </Text>
                            )
                            : (
                              <Text style={styles.priceText}>
                                N/A
                              </Text>
                            )
                          : null
                      }
                    </View>
                    <View style={styles.breakdownLabelView}>
                      <Text style={styles.priceText}>Road tax & other charges</Text>
                      {
                        (
                          priceBreakdownData.proformaInvoice
                          && priceBreakdownData.proformaInvoice.vehicle_price
                        )
                          ? (priceBreakdownData.proformaInvoice.vehicle_price.rto_charges)
                            ? (
                              <Text style={styles.priceText}>
                                {currencyFormatter(priceBreakdownData.proformaInvoice.vehicle_price.rto_charges)}
                              </Text>
                            )
                            : (
                              <Text style={styles.priceText}>
                                N/A
                              </Text>
                            )
                          : null
                      }
                    </View>
                    {/* <View style={styles.breakdownLabelView}>
                      <Text style={styles.priceText}>Road Tax</Text>
                      {
                        (
                          priceBreakdownData.proformaInvoice
                          && priceBreakdownData.proformaInvoice.vehicle_price
                        )
                          ? (priceBreakdownData.proformaInvoice.vehicle_price.road_safety_tax)
                            ? (
                              <Text style={styles.priceText}>
                                {currencyFormatter(priceBreakdownData.proformaInvoice.vehicle_price.road_safety_tax)}
                              </Text>
                            )
                            : (
                              <Text style={styles.priceText}>
                                {currencyFormatter('0')}
                              </Text>
                            )
                          : null
                      }
                    </View> */}
                    <View style={[styles.breakdownLabelView]}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={styles.priceText}>Insurance</Text>
                        <TouchableOpacity
                          // disabled={this.props.loading || this.props.buttonState}
                          disabled={this.props.loading}
                          style={styles.accessoryTappableIcon}
                          onPress={() => {
                            this.insuranceBtnTapped();
                          }}>
                          <Image
                            source={editIcon}
                            style={styles.accessoryImageIcon}
                            resizeMode="contain" />
                        </TouchableOpacity>
                      </View>
                      {
                        priceBreakdownData.proformaInvoice
                        && priceBreakdownData.proformaInvoice.lead_detail ?
                          (
                            <Text style={styles.priceText}>
                              {currencyFormatter(priceBreakdownData.proformaInvoice.lead_detail.total_insurance_amount)}
                            </Text>
                          )
                          : (
                            <Text style={styles.priceText}>
                              {currencyFormatter('0')}
                            </Text>
                          )
                      }
                    </View>
                    <View style={[styles.breakdownLabelView]}>
                      <View style={{ flexDirection: 'row' }}>
                        <Text style={styles.priceText}>
                          Extended  warranty
                                                (
                          {(currencyFormatter((priceBreakdownData
                            && priceBreakdownData.proformaInvoice
                            && priceBreakdownData.proformaInvoice.vehicle_price
                            && priceBreakdownData.proformaInvoice.vehicle_price.extented_warranty)
                            ? priceBreakdownData.proformaInvoice.vehicle_price.extented_warranty : '0'))}
                          )
                        </Text>
                        {
                          // Object.keys(this.state.localfinancierLead).length === 0
                          // && (
                          <TouchableOpacity
                              // disabled={Object.keys(this.state.localfinancierLead).length !== 0}
                            // disabled={this.props.buttonState}
                            onPress={this.extendedWarrantyBtnTapped}>
                            <Image
                              source={this.state.isExtendedWarrantyEnabled ? selectedCb : unselectedCb}
                              style={{ marginLeft: 10, width: 15, height: 15 }}
                              resizeMode="contain" />
                          </TouchableOpacity>
                          // )
                        }
                      </View>
                      <Text style={styles.priceText}>
                        {currencyFormatter((priceBreakdownData
                          && priceBreakdownData.proformaInvoice
                          && priceBreakdownData.proformaInvoice.lead_detail
                          && priceBreakdownData.proformaInvoice.lead_detail.extended_warranty
                          && priceBreakdownData.proformaInvoice.vehicle_price
                          && priceBreakdownData.proformaInvoice.vehicle_price.extented_warranty)
                          ? priceBreakdownData.proformaInvoice.vehicle_price.extented_warranty : '0')}
                      </Text>
                    </View>
                    <View style={styles.line} />
                      <View style={[styles.onRoadView]}>
                        <Text style={styles.onRoadPriceLabel}>On Road Price</Text>
                        {
                          (
                            priceBreakdownData.proformaInvoice
                            && priceBreakdownData.proformaInvoice.vehicle_price && priceBreakdownData.proformaInvoice.lead_detail
                          )
                            ? (priceBreakdownData.proformaInvoice.vehicle_price.onroad_price)
                              ? (
                                <Text style={[styles.onRoadPrice]}>
                                  {currencyFormatter(parseInt(priceBreakdownData.proformaInvoice.vehicle_price.ex_showroom_price, 10)
                                    + parseInt(priceBreakdownData.proformaInvoice.vehicle_price.rto_charges, 10)
                                    // + parseInt(priceBreakdownData.proformaInvoice.vehicle_price.road_safety_tax, 10)
                                    + parseInt(priceBreakdownData.proformaInvoice.lead_detail.total_insurance_amount, 10)
                                    // + parseInt(this.state.mandatoryAccesoriesPrice, 10)
                                    + Number(priceBreakdownData.proformaInvoice.lead_detail.extended_warranty
                                      ? priceBreakdownData.proformaInvoice.vehicle_price.extented_warranty : 0))
                                    }
                                </Text>
                              )
                              : (
                                <Text style={[styles.onRoadPrice]}>
                                  N/A
                                </Text>
                              )
                            : null
                        }
                      </View>
                    <View style={styles.line} />
                    <View style={styles.breakdownLabelView}>
                      <View style={{ flexDirection: 'row' }}>
                        <Text style={styles.priceText}>Manufacturer Accessories</Text>
                      </View>
                      <Text style={styles.priceText}>
                        &#8377;
                        {this.state.mandatoryAccesoriesPrice}
                      </Text>
                    </View>
                    <View style={{ marginLeft: 5 }}>
                      {
                        (priceBreakdownData.mandatoryAccessories
                          && priceBreakdownData.mandatoryAccessories.length > 0)
                          ? priceBreakdownData.mandatoryAccessories.map(item => (
                            <View
                              key={item.id}
                              style={styles.accessoryTextView}>
                              <View style={{ flexDirection: 'row' }}>
                                <Icon
                                  name="circle"
                                  size={8}
                                  color="#EF7432"
                                  style={{ alignSelf: 'center', marginHorizontal: 2 }} />
                                <Text style={styles.priceText}>
                                  {' '}
                                  {item.name}
                                </Text>
                              </View>
                              <Text style={styles.priceText}>{currencyFormatter(item.price)}</Text>
                            </View>
                          ))
                          : null
                      }
                    </View>
                  </View>

                  <View style={[styles.breakdownLabelView, { marginHorizontal: 15 }]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={styles.priceText}>Dealer Accessories</Text>
                      <TouchableOpacity
                        // disabled={this.props.loading || this.props.buttonState}
                        disabled={this.props.loading}
                        style={styles.accessoryTappableIcon}
                        onPress={() => {
                          this.onModalShow();
                        }}>
                        <Image source={editIcon} style={styles.accessoryImageIcon} resizeMode="contain" />
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.priceText}>
                      {currencyFormatter(this.state.nonMandatoryAccesoriesPrice)}
                    </Text>
                  </View>
                  <View style={{ marginLeft: 5 }}>
                    {
                      (priceBreakdownData.proformaInvoice
                        && priceBreakdownData.proformaInvoice.proforma_invoice_accessory.length > 0
                      )
                        ? priceBreakdownData.proformaInvoice.proforma_invoice_accessory.map(item => (
                          <View key={item.id} style={[styles.accessoryTextView, { marginHorizontal: 15 }]}>
                            <View style={{ flexDirection: 'row' }}>
                              <Icon
                                name="circle"
                                size={8}
                                color="#EF7432"
                                style={{ alignSelf: 'center', marginHorizontal: 2 }} />
                              <Text style={styles.priceText}>
                                {' '}
                                {item.dealer_accessory.name}
                              </Text>
                            </View>
                            <Text style={styles.priceText}>
                              {currencyFormatter(item.dealer_accessory.price)}
                            </Text>
                          </View>
                        ))
                        : null
                    }
                  </View>
                  <View style={[styles.breakdownLabelView, { marginHorizontal: 15 }]}>
                    <Text style={styles.priceText}>Exchange value</Text>
                    <Text style={styles.priceText}>
                      (-)  &#8377;
                      {' '}
                      {(this.state.exchangeValueAmount)
                        ? (`${this.state.exchangeValueAmount}`.includes('.')
                          ? `${this.state.exchangeValueAmount}`.split('.')[0]
                          : `${this.state.exchangeValueAmount}`) : '0'}
                    </Text>
                  </View>
                  <View>
                    <View style={[styles.breakdownLabelView, { marginHorizontal: 15 }]}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={[styles.onRoadPriceLabel, { fontSize: 12 }]}>Other Charges</Text>
                        <TouchableOpacity
                          style={[styles.accessoryTappableIcon]}
                          // disabled={this.props.loading || this.props.buttonState}
                          disabled={this.props.loading}
                          onPress={() => {
                            this.otherChargesAddBtnTapped();
                          }}>
                          <Icon
                            name="plus-circle"
                            size={18}
                            color="#EF7432"
                            style={styles.accessoryImageIcon}
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                    <View style={styles.line} />
                    <FlatList
                      keyExtractor={this._keyExtractor}
                      data={(priceBreakdownData.proformaInvoice
                        && priceBreakdownData.proformaInvoice.proforma_invoice_other_charges.length > 0)
                        ? priceBreakdownData.proformaInvoice.proforma_invoice_other_charges : []}
                      renderItem={({ item }) => this.renderOtherChargesItem(item)}
                      extraData={this.state.refreshList}
                    />
                    <View style={styles.line} />
                  </View>
                  <View>
                    <FlatList
                      keyExtractor={this._keyExtractor}
                      data={(priceBreakdownData.proformaInvoice
                        && priceBreakdownData.proformaInvoice.proforma_invoice_offer.length > 0)
                        ? priceBreakdownData.proformaInvoice.proforma_invoice_offer : []}
                      renderItem={({ item }) => this.renderItem(item)}
                      extraData={this.state.refreshList}
                    />
                  </View>
                  <View style={styles.amountPayableView}>
                    <View>
                      <Text style={styles.onRoadPriceLabel}>Total Amount Payable</Text>
                      <Text style={styles.bikePriceLabel}>*Taxes as applicable</Text>
                    </View>
                    {
                      (
                        priceBreakdownData.proformaInvoice
                        && priceBreakdownData.proformaInvoice.vehicle_price && priceBreakdownData.proformaInvoice.lead_detail
                      )
                        ? (priceBreakdownData.proformaInvoice.vehicle_price.onroad_price)
                          ? (
                            <Text style={styles.onRoadPrice}>
                              {currencyFormatter((
                                Number(parseInt(priceBreakdownData.proformaInvoice.vehicle_price.ex_showroom_price, 10)
                                + parseInt(priceBreakdownData.proformaInvoice.vehicle_price.rto_charges, 10)
                                // + parseInt(priceBreakdownData.proformaInvoice.vehicle_price.road_safety_tax, 10)
                                + parseInt(priceBreakdownData.proformaInvoice.lead_detail.total_insurance_amount, 10)
                                + parseInt(this.state.mandatoryAccesoriesPrice, 10))
                                + Number(this.state.nonMandatoryAccesoriesPrice)
                                + Number(priceBreakdownData.proformaInvoice.lead_detail.extended_warranty
                                  ? priceBreakdownData.proformaInvoice.vehicle_price.extented_warranty : 0)
                                + Number(totalOtherChargesAmount))
                                - (Number(totalOfferAmount)
                                + Number(this.state.exchangeValueAmount)))}
                            </Text>
                          )
                          : (
                            <Text style={styles.onRoadPrice}>
                              N/A
                            </Text>
                          )
                        : null
                    }
                  </View>
                  {Object.keys(this.state.localfinancierLead).length !== 0
                    && (
                      <View style={{ flexDirection: 'column' }}>
                        <View style={styles.line} />
                        <Text style={[styles.onRoadPriceLabel, { marginHorizontal: 15, marginTop: 10 }]}>Finance</Text>
                        <View style={[styles.breakdownLabelView, { marginHorizontal: 15 }]}>
                          <Text style={styles.priceText}>Loan amount</Text>
                          <Text style={styles.priceText}>
                            &#8377;
                            {' '}
                            {this.state.localfinancierLead.loan_amount
                              && (`${this.state.localfinancierLead.loan_amount}`.includes('.')
                                // eslint-disable-next-line
                                ? currencyFormatter(`${this.state.localfinancierLead.loan_amount}`.split('.')[0]).replace(constants.RUPEE, '') :
                                currencyFormatter(this.state.localfinancierLead.loan_amount).replace(constants.RUPEE, '')
                              )}
                          </Text>
                        </View>
                        <View style={[styles.breakdownLabelView, { marginHorizontal: 15 }]}>
                          <Text style={styles.priceText}>Downpayment</Text>
                          <Text style={styles.priceText}>
                            &#8377;
                            {' '}
                            {this.state.localfinancierLead.down_payment
                              && (`${this.state.localfinancierLead.down_payment}`.includes('.')
                                // eslint-disable-next-line
                                ? currencyFormatter(`${this.state.localfinancierLead.down_payment}`.split('.')[0]).replace(constants.RUPEE, '') :
                                currencyFormatter(this.state.localfinancierLead.down_payment).replace(constants.RUPEE, '')
                              )}
                          </Text>
                        </View>
                        <View style={[styles.breakdownLabelView, { marginHorizontal: 15 }]}>
                          <Text style={styles.priceText}>Advance EMI</Text>
                          <Text style={styles.priceText}>
                            &#8377;
                            {' '}
                            {this.state.localfinancierLead.advance_emi
                              && (`${this.state.localfinancierLead.advance_emi}`.includes('.')
                                ? currencyFormatter(`${(Number(this.state.localfinancierLead.advance_emi)
                                  * Number(this.state.localfinancierLead.emi))}`).replace(constants.RUPEE, '')
                                : currencyFormatter(`${(Number(this.state.localfinancierLead.advance_emi)
                                  * Number(this.state.localfinancierLead.emi))}`).replace(constants.RUPEE, ''))}
                          </Text>
                        </View>
                        <View style={[styles.breakdownLabelView, { marginHorizontal: 15 }]}>
                          <Text style={styles.priceText}>EMI</Text>
                          <Text style={styles.priceText}>
                            &#8377;
                            {' '}
                            {this.state.localfinancierLead.emi
                              && (`${this.state.localfinancierLead.emi}`.includes('.')
                                // eslint-disable-next-line
                                ? currencyFormatter(`${this.state.localfinancierLead.emi}`.split('.')[0]).replace(constants.RUPEE, '') :
                                currencyFormatter(this.state.localfinancierLead.emi).replace(constants.RUPEE, '')
                              )}
                          </Text>
                        </View>
                        <Text style={[styles.bikePriceLabel, { marginHorizontal: 10 }]}>
                          * The finance offer given above is indicative and subject to change
                        </Text>
                      </View>
                    )
                  }
                  <View style={styles.line} />
                </ScrollView>
                <View style={{ alignItems: 'center', marginTop: 20, marginBottom: 20 }}>
                  <Text style={styles.helpFinanceText}>WOULD YOU LIKE TO?</Text>
                  <View style={{ marginTop: 10, flexDirection: 'row' }}>
                    <BookTestRideButton
                      // disabled={this.props.loading || this.props.buttonState}
                      disabled={this.props.loading}
                      title="INVOICE"
                      handleSubmit={() => this.invoiceBtnTapped('invoice')} />
                    {leadDetailObj && leadDetailObj.booking_id === null
                      && (
                        <SecondaryButton
                          // disabled={this.props.loading || this.props.buttonState}
                          disabled={this.props.loading}
                          title="BOOK"
                          buttonStyle={styles.removefinancierBtnStyle}
                          handleSubmit={this.bookBtnTapped} />
                      )
                    }
                  </View>
                </View>
                <View style={{ marginTop: 5, marginBottom: 5, marginLeft: 20 }}>
                  {leadDetailObj && leadDetailObj.booking_id !== null
                    && (
                      <Text>
                        Booking Ref No:
                        {leadDetailObj.booking_id}
                      </Text>
                    )
                  }
                </View>
                <View style={{ alignItems: 'center', marginTop: 20, marginBottom: 20 }}>
                  {
                    (Object.keys(this.state.localfinancierLead).length === 0
                    || (Object.keys(this.state.localfinancierLead).length !== 0
                      && this.state.localfinancierLead.status !== 520)) &&
                      <Text style={styles.helpFinanceText}>NEED HELP WITH FINANCING?</Text>
                  }
                  <View style={{ marginTop: 10, flexDirection: 'row' }}>
                    {
                      (Object.keys(this.state.localfinancierLead).length === 0
                        || (Object.keys(this.state.localfinancierLead).length !== 0
                          && this.state.localfinancierLead.status !== 520))
                      && (
                        <BookTestRideButton
                          // disabled={this.props.loading || this.props.buttonState}
                          disabled={this.props.loading}
                          title="FINANCE OPTIONS"
                          handleSubmit={this.goToFinancierOnBoarding} />
                      )
                    }
                    {
                      Object.keys(this.state.localfinancierLead).length !== 0
                      && this.state.localfinancierLead.status === 500
                      && this.props.lead && !this.props.lead.is_lost
                      && (
                        <SecondaryButton
                          // disabled={this.props.loading || this.props.buttonState}
                          disabled={this.props.loading}
                          title="REMOVE FINANCE"
                          buttonStyle={styles.removefinancierBtnStyle}
                          handleSubmit={this.removeFinanceBtntapped} />
                      )
                    }
                  </View>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }
}

export default BikePriceDetails;
