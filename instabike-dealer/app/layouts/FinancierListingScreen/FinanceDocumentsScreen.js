/**
 * The Finance Documents Screen component lists all documents that was being
 * selected by the lead to upload.
 */
import React, { Component } from 'react';
import {
  View, Text,
  TouchableOpacity, Picker, Alert, Image, Modal, TextInput, FlatList, ScrollView
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import PropTypes from 'prop-types';

// Reducer
import { connect } from 'react-redux';

// Styles
import styles from './financeDocumentsStyles';

// Header HOC
import AppHeader from '../../components/header/Header';
import Loader from '../../components/loader/Loader';

// Component
import { BookTestRideButton, ButtonWithPlainText } from '../../components/button/Button';
import { currencyFormatter } from '../../utils/validations';

// Storage
import Close from '../../assets/images/close.png';

// Action Methods

import {
  getFinancierRepresentativeList,
  createFinancierLead,
  getFinancierLeadDetails
} from '../../redux/actions/FinancierListing/actionCreators';
import {
  sendOtp,
  resendOtp,
  verifyOtp
} from '../../redux/actions/DocumentUpload/actionCreators';

import { setLead, disableButton } from '../../redux/actions/Global/actionCreators';

const DetailHeaderArray = ['Financier', 'Loan', 'Interest', 'Downpayments', 'EMI', 'Tenure', 'Advance EMI'];

@connect(
  state => ({
    financierRepresentativeList: state.financierListing.financierRepresentativeList,
    financierLead: state.financierListing.financierLead,
    lead: state.global.lead,
    sendOtpObj: state.documentUpload.sendOtpObj,
    resendOtpObj: state.documentUpload.resendOtpObj,
    verifyOtpObj: state.documentUpload.verifyOtpObj,
    currentUser: state.user.currentUser,
    loading: state.financierListing.loadingGroup,
    buttonState: state.global.buttonState
  }),
  {
    getFinancierRepresentativeList,
    createFinancierLead,
    setLead,
    getFinancierLeadDetails,
    sendOtp,
    resendOtp,
    verifyOtp,
    disableButton
  }
)
export default class FinanceDocumentsScreen extends Component {
  static propTypes = {
    navigation: PropTypes.object.isRequired,
    getFinancierRepresentativeList: PropTypes.func.isRequired,
    financierRepresentativeList: PropTypes.array,
    createFinancierLead: PropTypes.func.isRequired,
    lead: PropTypes.object.isRequired,
    financierLead: PropTypes.object,
    setLead: PropTypes.func.isRequired,
    sendOtp: PropTypes.func.isRequired,
    sendOtpObj: PropTypes.object,
    resendOtp: PropTypes.func.isRequired,
    verifyOtp: PropTypes.func.isRequired,
    verifyOtpObj: PropTypes.object,
    currentUser: PropTypes.object.isRequired,
    loading: PropTypes.bool.isRequired,
    buttonState: PropTypes.bool.isRequired,
    disableButton: PropTypes.func.isRequired
  }

  static defaultProps = {
    financierRepresentativeList: [],
    financierLead: {},
    sendOtpObj: {},
    verifyOtpObj: {},
  }

  constructor(props) {
    super(props);
    this.state = {
      lead: this.props.lead,
      disableVerifyBtn: false,
      DocumentsArray: [
        'aadhaar_card',
        'pan_card',
        'passport_size_photograph'],
      optionalDocumentsArray: [
        {
          id: 1,
          name: 'bank_statement',
          label: 'Bank Statement (Last 3 months)',
          isSelected: false
        },
        {
          id: 2,
          name: 'cheque_leaf',
          label: 'Cheque Leaf',
          isSelected: false
        },
        {
          id: 3,
          name: 'credit_card_statement',
          label: 'Credit Card Statement',
          isSelected: false
        },
        {
          id: 4,
          name: 'driving_licence',
          label: 'Driving Licence',
          isSelected: false
        },
        {
          id: 5,
          name: 'eb_card',
          label: 'EB Card',
          isSelected: false
        },
        {
          id: 6,
          name: 'employee_id_card',
          label: 'Employee ID Card',
          isSelected: false
        },
        {
          id: 7,
          name: 'form_16',
          label: 'Form 16',
          isSelected: false
        },
        {
          id: 8,
          name: 'hr_letter',
          label: 'HR Letter',
          isSelected: false
        },
        {
          id: 9,
          name: 'it_returns_latest',
          label: 'IT Returns - Latest',
          isSelected: false
        },
        {
          id: 10,
          name: 'lic_policy',
          label: 'LIC Policy',
          isSelected: false
        },
        {
          id: 11,
          name: 'passport',
          label: 'Passport',
          isSelected: false
        },
        {
          id: 12,
          name: 'ration_card',
          label: 'Ration Card',
          isSelected: false
        },
        {
          id: 13,
          name: 'rental_agreement',
          label: 'Rental Agreement',
          isSelected: false
        },
        {
          id: 14,
          name: 'salary_slip',
          label: 'Salary Slip',
          isSelected: false
        },
        {
          id: 15,
          name: 'utility_bills',
          label: 'Utility Bills',
          isSelected: false
        },
        {
          id: 16,
          name: 'voter_id',
          label: 'Voter ID',
          isSelected: false
        }
      ],
      isFinancierVerified: false,
      currentFinancier: this.props.navigation.state.params.currentFinancier,
      localFinancierRepList: [],
      currentFinancierRep: {},
      isOptionalDocumentReceived: false,
      modalVisible: false,
      otpTF: '',
      currentModel: 'SendOtpView',
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

  componentDidMount() {
    if (this.props.currentUser && this.props.currentUser.dealerId) {
      this.props.getFinancierRepresentativeList(
        this.props.currentUser.dealerId,
        this.state.currentFinancier.id
      ).then(() => {
        if (this.props.financierRepresentativeList.length === 0) {
          this.state.currentFinancierRep = {
            user: {
              id: 1,
              first_name: 'No financier rep'
            }
          };
          this.state.localFinancierRepList = [{
            user: {
              id: 1,
              first_name: 'No financier rep'
            }
          }];
        }
        this.setState({
          localFinancierRepList: this.props.financierRepresentativeList.length === 0
            ? this.state.localFinancierRepList : this.props.financierRepresentativeList,
          currentFinancierRep: this.props.financierRepresentativeList.length === 0
            ? this.state.currentFinancierRep : this.props.financierRepresentativeList[0]
        });
      })
        .catch(error => {
          console.log('ERROR:::', error);
        });
    }
  }

  onPickerChange = currentRep => {
    this.setState({
      currentFinancierRep: currentRep,
    });
  }

  getDetailHeaderArray = () => (
    <View style={styles.detailHeaderView}>
      {
        DetailHeaderArray.map(currentheader => (
          <View style={styles.detailHeaderTitleView}>
            <Text style={styles.detailTitleTextStyle}>
              {currentheader}
            </Text>
          </View>
        ))
      }
    </View>
  )

  getDocumentsArray = () => (
    <ScrollView style={styles.documentsView}>
      {
        this.state.DocumentsArray.map((currentheader, index) => (
          <Text style={[styles.documentsTextStyle, { marginLeft: 10 }]}>
            {index + 1}
.
            {this.textFormatter(currentheader)}
          </Text>
        ))
      }
    </ScrollView>
  )

  getOptionalDocumentsArray = () => (
    <FlatList
      style={[styles.optionaldocsView]}
      keyExtractor={item => item.id}
      data={this.state.optionalDocumentsArray}
      renderItem={({ item, index }) => this.showDocument(item, index)}
      extraData={this.state}
      numColumns={3}

      scrollEnabled
    />
  )

  showDocument = (item, index) => (
    <TouchableOpacity
      style={styles.optionalDocTileStyle}
      onPress={() => {
        this.state.optionalDocumentsArray[index].isSelected = !this.state.optionalDocumentsArray[index].isSelected;
        this.setState({
          optionalDocumentsArray: this.state.optionalDocumentsArray
        });
      }}
    >
      <Icon
        name={(item.isSelected) ? 'check-square-o' : 'square-o'}
        size={22}
        color="#f37e2e" />
      <Text style={styles.documentsTextStyle}>
        {item.label}

      </Text>
    </TouchableOpacity>
  )

  textFormatter = phrase => phrase
    .toLowerCase()
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

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
    </View>
  )

  continueBtnAction = () => {
    if (!this.state.isOptionalDocumentReceived) {
      this.state.optionalDocumentsArray.forEach(currentDoc => {
        if (currentDoc.isSelected) {
          this.state.DocumentsArray.push(currentDoc.name.split(' (')[0]);
        }
      });
      this.setState({
        DocumentsArray: this.state.DocumentsArray,
        isOptionalDocumentReceived: true
      });
    } else if (this.state.isOptionalDocumentReceived
      && this.state.currentFinancierRep && Object.keys(this.state.currentFinancierRep).length > 0
      && this.props.financierRepresentativeList.length > 0) {
      this.setState({
        modalVisible: true
      });
    } else {
      Alert.alert(
        'Alert',
        'Please select a financial representative to proceed.',
        [
          { text: 'OK', onPress: () => { } },
        ],
        { cancelable: false }
      );
    }
  }

  goToDocumentUpload = () => {
    this.props.navigation.navigate(
      'DocumentsUpload',
      {
        financierLeadId: this.props.financierLead.id,
        leadDetailId: this.props.navigation.state.params.leadDetailId,
        fromScreen: 'FromFinanceDocuments'
      }
    );
  }

  updateCurrentView = () => {
    switch (this.state.currentModel) {
      case 'OTPView':
        return (
          <View style={{ flex: 1 }}>
            <View style={styles.OTPTotalViewStyle}>
              <Text style={styles.offerTextStyle}>
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
            }}
            >

              <ButtonWithPlainText
                title="RESEND OTP?"
                disabled={this.props.buttonState}
                style={styles.resendBtnStyle}
                handleSubmit={this.resendOtpBtnTapped}
                textStyle={styles.resendBtnTextStyle}
              />
              <ButtonWithPlainText
                title="VERIFY"
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
              <Text style={styles.offerTextStyle}>
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

  resendOtpBtnTapped = () => {
    this.props.disableButton();
    const { currentFinancierRep } = this.state;
    try {
      if (currentFinancierRep && currentFinancierRep.user
        && currentFinancierRep.user.id && currentFinancierRep.user.id.length > 0) {
        this.props.resendOtp(currentFinancierRep.user.id, this.props.sendOtpObj)
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
          const financierLeadData = {
            tenure: this.state.currentFinancier.tenure,
            loan_amount: this.state.currentFinancier.loan_amount,
            interest_percentage: this.state.currentFinancier.interest_percentage,
            down_payment: this.state.currentFinancier.down_payment,
            emi: this.state.currentFinancier.emi,
            advance_emi: this.state.currentFinancier.advance_emi,
            financier_id: this.state.currentFinancier.id,
            lead_id: this.state.lead.id,
            assigned_to: this.state.currentFinancierRep.user.id,
            lead_detail_id: this.props.navigation.state.params.currentLeadDetailObj.id,
            documents: this.state.DocumentsArray
          };
          this.props.createFinancierLead(this.state.currentFinancier.id, financierLeadData)
            .then(() => {
              this.setState({
                currentModel: 'SendOtpView',
                modalVisible: false,
                disableVerifyBtn: false,
                otpTF: ''
              }, () => {
                this.props.setLead(this.state.lead);
                this.goToDocumentUpload();
              });
            }).catch(error => {
              if (error && error.err && !error.err.message.includes('invalidaccesstoken')) {
                Alert.alert(
                  'Alert',
                  `${error && error.err ? error.err.message : ''}`,
                  [
                    {
                      text: 'OK',
                      onPress: () => {
                        this.setState({
                          disableVerifyBtn: false
                        });
                      }
                    }
                  ],
                  { cancelable: false }
                );
              }
            });
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
                    disableVerifyBtn: false
                  });
                }
              },
            ],
            { cancelable: false }
          );
        }
      }).catch(error => {
        if (error && error.err && !error.err.message.includes('invalidaccesstoken')) {
          Alert.alert(
            'Alert',
            `${error && error.err ? error.err.message : ''}`,
            [
              {
                text: 'OK',
                onPress: () => {
                  this.setState({ disableVerifyBtn: false });
                }
              }
            ],
            { cancelable: false }
          );
        }
      });
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

  render() {
    const currentLeadDetailObj = this.state.lead && this.state.lead.lead_details && this.state.lead.lead_details.length > 0 && this.state.lead.lead_details.find(currentleaddetail => this.props.navigation.state.params.leadDetailId === currentleaddetail.id);
    return (
      <View style={styles.container}>
        <Loader showIndicator={this.props.loading} />
        <AppHeader backEnabled navigation={this.props.navigation} isLeadExists={false}>
          {this.header()}
        </AppHeader>
        <Modal
          animationType="slide"
          transparent
          visible={this.state.modalVisible}
          onRequestClose={() => {
            this.setState({
              modalVisible: false,
              currentModel: 'SendOtpView',
            });
          }}
        >
          <KeyboardAwareScrollView
            keyboardShouldPersistTaps="always">
            <View style={styles.modalconatiner}>
              <TouchableOpacity
                style={styles.closeBtnView}
                onPress={() => {
                  this.setState({
                    modalVisible: false,
                    currentModel: 'SendOtpView',
                  });
                }}
              >
                <Image
                  style={{ resizeMode: 'center' }}
                  source={Close}
                />
              </TouchableOpacity>
              <View style={styles.modalMainContainer}>
                <View style={styles.vehicleDetailView}>
                  <Image
                    source={{
                      uri: (currentLeadDetailObj && currentLeadDetailObj.vehicle
                        && currentLeadDetailObj.vehicle.name) ? currentLeadDetailObj.vehicle.image_url : 'http://'
                    }}
                    style={styles.vehicleImageStyle}
                    resizeMode="contain"
                  />
                  <View style={styles.specificationViewStyle}>
                    <Text style={styles.specsDetailTextStyle}>
                      {(currentLeadDetailObj && currentLeadDetailObj.vehicle
                        && currentLeadDetailObj.vehicle.name) ? currentLeadDetailObj.vehicle.name : ''}
                    </Text>
                  </View>
                  <View style={styles.specificationViewStyle}>
                    <Text style={styles.specheadertextStyle}>
                      Financier
                    </Text>
                    <Text style={styles.specsDetailTextStyle}>
                      {(this.state.currentFinancier
                        && this.state.currentFinancier.name)
                        ? this.state.currentFinancier.name : ''}
                    </Text>
                  </View>
                  <View style={styles.specificationViewStyle}>
                    <Text style={styles.specheadertextStyle}>
                      Loan Amount
                    </Text>
                    <Text style={styles.specsDetailTextStyle}>
                      {this.state.currentFinancier.loan_amount
                        && (`${this.state.currentFinancier.loan_amount}`.includes('.')
                          ? `${this.state.currentFinancier.loan_amount}`.split('.')[0]
                          : `${currencyFormatter(this.state.currentFinancier.loan_amount)}`)
                      }
                    </Text>
                  </View>
                  <View style={styles.specificationViewStyle}>
                    <Text style={styles.specheadertextStyle}>
                      Interest
                    </Text>
                    <Text style={styles.specsDetailTextStyle}>
                      {this.state.currentFinancier.interest_percentage
                        ? (`${this.state.currentFinancier.interest_percentage}%`) : '0'
                      }
                    </Text>
                  </View>
                </View>
                <View style={styles.dataContainerView}>
                  <Text style={styles.offerTextStyle}>
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
        <View style={styles.mainView}>
          <View style={styles.detailSectionView}>
            <View style={{ flex: 1 }}>
              {
                this.getDetailHeaderArray()
              }
            </View>
            <View style={styles.detailValueView}>
              <Text style={styles.detailValueTextStyle}>
                {this.state.currentFinancier.name}
              </Text>
              <Text style={styles.detailValueTextStyle}>
                {currencyFormatter(this.state.currentFinancier.loan_amount)}
              </Text>
              <Text style={styles.detailValueTextStyle}>
                {this.state.currentFinancier.interest_percentage}
%
              </Text>
              <Text style={styles.detailValueTextStyle}>
                {currencyFormatter(this.state.currentFinancier.down_payment)}
              </Text>
              <Text style={styles.detailValueTextStyle}>
                {currencyFormatter(this.state.currentFinancier.emi)}
              </Text>
              <Text style={styles.detailValueTextStyle}>
                {this.state.currentFinancier.tenure}
                {' '}
Month(s)
              </Text>
              <Text style={styles.detailValueTextStyle}>
                {this.state.currentFinancier.advance_emi}
                {' '}
Month(s)
              </Text>
            </View>
          </View>
          <View style={styles.documentsRequiredView}>
            <View>
              <Text style={[styles.detailTitleTextStyle, { fontSize: 18, marginTop: 10 }]}>
                Documents Required
              </Text>
              {
                this.getDocumentsArray()
              }
              {this.state.isOptionalDocumentReceived
                && (
                <Text style={[styles.detailTitleTextStyle, { fontSize: 11, color: '#f16537', marginTop: 10 }]}>
                  ** By clicking “CONTINUE” I hereby confirm my consent to share my contact details to the Financier(s) selected by me.
                </Text>
                )
              }

            </View>
            {!this.state.isOptionalDocumentReceived
              && (
              <View style={styles.optionalDocumentsView}>
                <Text style={[styles.optionalHeadertext, { fontSize: 16, marginVertical: 10 }]}>
                  Optional : Select the ones you can provide
                </Text>
                {
                  this.getOptionalDocumentsArray()
                }
              </View>
              )
            }
          </View>
          <View style={styles.continueSection}>
            <View style={styles.FinRepView}>
              {this.state.isOptionalDocumentReceived
                && (
                <View>
                  <View style={[styles.finrepOverView]}>
                    <Text style={[styles.detailTitleTextStyle, { fontSize: 18, marginVertical: 10 }]}>
                      Financier Representative
                    </Text>
                    <TouchableOpacity
                      style={styles.verifyRepBtn}
                      onPress={() => {
                        this.setState({
                        });
                      }}
                    >
                      <Icon
                        name={(this.state.isFinancierVerified) ? 'check-circle' : 'exclamation-circle'}
                        size={22}
                        color={(this.state.isFinancierVerified) ? '#63a719' : '#f37e2e'}
                      />
                    </TouchableOpacity>
                  </View>
                  {!this.state.isFinancierVerified
                    && (
                    <View
                      style={styles.pickerOverView}
                    >
                      <Picker
                        enabled={this.props.financierRepresentativeList.length !== 0}
                        style={styles.pickerView}
                        selectedValue={(this.state.currentFinancierRep
                          && this.state.currentFinancierRep.user
                          && this.state.currentFinancierRep.user.first_name)
                          ? this.state.currentFinancierRep.user.first_name : ''
                        }
                        mode="dropdown"
                        onValueChange={(itemValue, itemIndex) => this.onPickerChange(this.state.localFinancierRepList[itemIndex])}
                      >
                        {
                          this.state.localFinancierRepList && this.state.localFinancierRepList.map(currentRep => (
                            <Picker.Item
                              label={(currentRep
                                && currentRep.user
                                && currentRep.user.first_name) ? currentRep.user.first_name : ''
                              }
                              value={(currentRep
                                && currentRep.user
                                && currentRep.user.first_name) ? currentRep.user.first_name : ''
                              }
                              key={currentRep.id} />
                          ))
                        }
                      </Picker>
                    </View>
                    )
                  }
                </View>
                )
              }
            </View>
            <View style={styles.continueBtnView}>
              <BookTestRideButton
                customStyles={{ marginRight: 50 }}
                disabled={(this.state.isOptionalDocumentReceived && this.props.financierRepresentativeList.length === 0) || this.props.loading}
                title="CONTINUE"
                handleSubmit={this.continueBtnAction}
              />
            </View>
          </View>
        </View>
      </View>
    );
  }
}
