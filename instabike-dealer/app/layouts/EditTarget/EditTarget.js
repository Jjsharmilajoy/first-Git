/**
 * The EditTarget Screen renders the target editing screen of the dealership
 * and only the dealership manager has permissions to set a target
 * for his team member.
 */
import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import PropTypes from 'prop-types';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import {
  View, Text, TouchableOpacity, Modal
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import EvilIcon from 'react-native-vector-icons/EvilIcons';
import Icon from 'react-native-vector-icons/FontAwesome';
import UserInput from '../../components/userInput/UserInput';
import Loader from '../../components/loader/Loader';
import { BookTestRideButton } from '../../components/button/Button';
import { getTargetSummary, getTargetList, updateTargetDetails } from '../../redux/actions/Target/actionCreators';
import Table from '../../components/table/Table';
import AppHeader from '../../components/header/Header';
import editTargetStyles from './editTargetStyles';
import ExpandableTile from '../../components/expandableTile/ExpandableTile';
import { callToast } from '../../redux/actions/Global/actionCreators';
import { isNumeric } from '../../utils/validations';

@connect(
  state => ({
    targetList: state.target.targetList,
    currentUser: state.user.currentUser,
    loading: state.target.loadingGroup,
    targetSummary: state.target.targetSummary,
  }),
  {
    getTargetList,
    updateTargetDetails,
    getTargetSummary,
    callToast
  }
)
export default class Target extends Component {
  static propTypes = {
    getTargetList: PropTypes.func.isRequired,
    callToast: PropTypes.func.isRequired,
    currentUser: PropTypes.object.isRequired,
    navigation: PropTypes.object.isRequired,
    updateTargetDetails: PropTypes.func.isRequired,
    loading: PropTypes.bool.isRequired,
    getTargetSummary: PropTypes.func.isRequired
  }

  static defaultProps = {
  }

  // eslint-disable-next-line
  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.targetList
        && nextProps.targetSummary && nextProps.targetSummary.length > 0) {
      const { totalDealershipTarget } = prevState;
      const { units, scooters, bikes } = Target.getTargets(nextProps.targetList);
      totalDealershipTarget[0].count = units;
      totalDealershipTarget[1].count = scooters;
      totalDealershipTarget[2].count = bikes;
      const scooterSummary = nextProps.targetSummary.filter(summary => summary.vehicle_type);
      const bikeSummary = nextProps.targetSummary.filter(summary => !summary.vehicle_type);
      const totalManufacturerTarget = Target.getTargetSummary(scooterSummary, bikeSummary, prevState.totalManufacturerTarget);
      return {
        targetList: nextProps.targetList,
        onDataChange: !prevState.onDataChange,
        totalDealershipTarget,
        totalManufacturerTarget
      };
    }
    return null;
  }

  static getTargetSummary(scooterSummaries, bikeSummaries, totalManufacturerTarget) {
    const defaultSummary = {
      vehicle_type: 0,
      manufacturer_target: null,
      sold_count: null,
      dealer_target: null
    };
    const bikeSummary = bikeSummaries && bikeSummaries.length > 0 ? bikeSummaries[0] : defaultSummary;
    const scooterSummary = scooterSummaries && scooterSummaries.length > 0 ? scooterSummaries[0] : defaultSummary;
    totalManufacturerTarget[2].count = bikeSummary.manufacturer_target ? parseInt(bikeSummary.manufacturer_target, 10) : 0;
    totalManufacturerTarget[1].count = scooterSummary.manufacturer_target ? parseInt(scooterSummary.manufacturer_target, 10) : 0;
    totalManufacturerTarget[0].count = totalManufacturerTarget[2].count
      + totalManufacturerTarget[1].count;
    return totalManufacturerTarget;
  }

  static getTargets(targetList) {
    let units = 0;
    let scooters = 0;
    let bikes = 0;
    if (targetList && targetList.length > 0) {
      targetList.forEach(target => {
        units += parseInt(target.total_target, 10) ? parseInt(target.total_target, 10) : 0;
        scooters += parseInt(target.scooter, 10) ? parseInt(target.scooter, 10) : 0;
        bikes += parseInt(target.bike, 10) ? parseInt(target.bike, 10) : 0;
      });
    }
    return {
      units,
      scooters,
      bikes
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      targetList: [],
      fromDate: moment().startOf('month').format('YYYY-MM-DD'),
      toDate: moment().endOf('month').format('YYYY-MM-DD'),
      onDataChange: false,
      followUpDate: new Date(),
      currentTargetDetails: {},
      showError: false,
      modalVisible: false,
      pristine: true,
      totalManufacturerTarget: [
        {
          label: 'Units',
          count: 0
        },
        {
          label: 'Scooters',
          count: 0
        },
        {
          label: 'Bikes',
          count: 0
        }
      ],
      totalDealershipTarget: [
        {
          label: 'Units',
          count: 0
        },
        {
          label: 'Scooters',
          count: 0
        },
        {
          label: 'Bikes',
          count: 0
        }
      ]
    };

    this.cols = [
      {
        label: 'Name',
        sortable: true,
        cellStyle: {
          alignContent: 'center'
        },
        dataKey: 'first_name',
        dataType: String,
        headerCellStyle: { textAlign: 'center' },
        textRenderer: this.nameRenderer,
        sortDirectionColor: '',
      },
      {
        label: 'Last Month\nTarget',
        cellStyle: { },
        dataType: Number,
        dataKey: 'last_month_target',
        sortable: true,
        textRenderer: this.textRenderer,
      },
      {
        label: 'Last Month\nCompletion',
        cellStyle: {
          paddingHorizontal: 5
        },
        sortable: true,
        dataType: Number,
        dataKey: 'last_month_achieved',
        textRenderer: this.textRenderer,
      },
      {
        label: 'Scooter',
        cellStyle: { },
        dataKey: 'scooter',
      },
      {
        label: 'Bike',
        cellStyle: { },
        dataKey: 'bike',
      },
      {
        label: 'Target',
        cellStyle: {
          justifyContent: 'center'
        },
        dataKey: 'total_target',
        cellRenderer: (item, index) => (
          <TouchableOpacity
            activeOpacity={0.5}
            onPress={() => this.onTargetEdit(item, index)}
            style={{
              alignItems: 'center',
              position: 'absolute',
              top: 15,
              right: 10,
              zIndex: 99
            }}>
            { item.is_active
              && (
              <View>
                <EvilIcon
                  name="pencil"
                  size={30}
                  color="#f37e2e" />
              </View>
              )
            }
          </TouchableOpacity>)
      }
    ];
  }

  componentDidMount() {
    this.getTargets();
    this.willFocusSubscription = this.props.navigation.addListener(
      'willFocus',
      () => {
        this.getTargets();
      }
    );
  }

  getTargets = () => {
    const { fromDate, toDate } = this.state;
    const { dealerId } = this.props.currentUser;
    Promise.all([
      this.props.getTargetList(dealerId),
      this.props.getTargetSummary(dealerId, fromDate, toDate)
    ]).catch(() => {});
  }

  componentWillUnmount() {
    this.willFocusSubscription.remove();
  }

  onTargetEdit=(data, index) => {
    this.setState({
      currentTargetDetails: Object.assign({}, data),
      currentTargetDetailsIndex: index,
      modalVisible: true,
      showError: false,
      errorMessage: 'Please enter a valid data'
    });
  }

  onSearchProductClick = () => {
    this.props.navigation.navigate('SearchLead', { isFilterOpen: false });
  }

  onTargetUpdate=targetDetails => {
    const { fromDate, toDate } = this.state;
    const updatedTarget = [{
      type: 0,
      fromDate,
      toDate,
      name: moment().format('MMMM'),
      value: targetDetails.bike === '0' ? null : targetDetails.bike
    }, {
      type: 1,
      fromDate,
      toDate,
      name: moment().format('MMMM'),
      value: targetDetails.scooter === '0' ? null : targetDetails.scooter
    }];
    this.props.updateTargetDetails(
      this.props.currentUser.dealerId,
      targetDetails.user_id,
      updatedTarget
    ).then(() => {
      this.props.callToast('Target updated successfully ');
      this.getTargets();
    }).catch(() => {});
    this.setState({
      modalVisible: false,
      pristine: true,
      onDataChange: true,
      currentTargetDetails: {}
    });
  }

  updateTotalTarget = (bike, scooter) => {
    const {
      targetList, totalDealershipTarget, currentTargetDetailsIndex, onDataChange
    } = this.state;
    targetList[currentTargetDetailsIndex].bike = bike;
    targetList[currentTargetDetailsIndex].scooter = scooter;
    targetList[currentTargetDetailsIndex].total_target = parseInt(bike, 10) + parseInt(scooter, 10);
    const { units, scooters, bikes } = Target.getTargets(targetList);
    totalDealershipTarget[0].count = units;
    totalDealershipTarget[1].count = scooters;
    totalDealershipTarget[2].count = bikes;
    this.setState({
      totalDealershipTarget,
      targetList,
      onDataChange: !onDataChange
    });
  }

  handleOnInputChange = (param, value) => {
    const { currentTargetDetails } = this.state;
    let { showError } = this.state;
    currentTargetDetails[param] = value;
    showError = (() => currentTargetDetails.bike.split('').length === 0
       || currentTargetDetails.scooter.split('').length === 0
       || !isNumeric(currentTargetDetails.bike) || !isNumeric(currentTargetDetails.scooter))();
    this.setState({
      currentTargetDetails,
      pristine: false,
      showError
    });
  }

  textRenderer = (data, dataKey) => (
    <Fragment>
      {`${data[dataKey] ? data[dataKey] : '0'}`}
    </Fragment>)

  nameRenderer = data => `${data.first_name ? data.first_name : ''}`

  renderFooter = () => {
    const { totalDealershipTarget } = this.state;
    const targets = JSON.parse(JSON.stringify(totalDealershipTarget));
    if (targets) {
      targets.splice(0, 1);
      targets.push(totalDealershipTarget[0]);
      return (
        <View style={{ flex: 1, flexDirection: 'row' }}>
          <View style={[editTargetStyles.center, { flex: 1 }]}>
            <Text style={{ color: 'black', fontWeight: 'bold' }}>Total target</Text>
          </View>
          <View style={[editTargetStyles.center, { flex: 5 }]}>
            <View style={{ flex: 1 }} />
            <View style={{ flex: 1 }} />
            {
              targets && targets.map(target => (
                <View style={[editTargetStyles.center, { flex: 1 }]} key={`${target.label}`}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: '#4b4b4b' }}>{target.label}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={editTargetStyles.footerCount}>
                      {target.count}
                    </Text>
                  </View>
                </View>))
            }
          </View>
        </View>
      );
    }
  }

  render() {
    const {
      followUpDate, currentTargetDetails, totalDealershipTarget,
      totalManufacturerTarget
    } = this.state;
    // const { loading } = this.props;
    return (
      <Fragment>
        <View style={editTargetStyles.modalAndHeaderWrapper}>
          <Loader showIndicator={this.props.loading} />
          {this.state.modalVisible
          && (
          <Modal
            animationType="fade"
            transparent
            visible={this.state.modalVisible}
            onRequestClose={() => this.setState({
              modalVisible: false,
              showError: false
            })}
            >
            <View style={[editTargetStyles.modalContentWrapper]}>
              <KeyboardAwareScrollView
                contentContainerStyle={[editTargetStyles.modalContent]}
                keyboardShouldPersistTaps="always">
                <View style={[editTargetStyles.modalCloseIcon]}>
                  <LinearGradient
                    colors={['#ef563c', '#f3842d']}
                    start={{ x: 0.0, y: 0.0 }}
                    end={{ x: 1.0, y: 1.0 }}
                    style={[{ borderRadius: 2 }]}>
                    <TouchableOpacity onPress={() => this.setState({ modalVisible: false, showError: false })}>
                      <Text
                        style={editTargetStyles.closeIconDimensions}>
                        <EvilIcon name="close" size={21} color="white" />
                      </Text>
                    </TouchableOpacity>
                  </LinearGradient>
                </View>
                <View style={{ flex: 1 }}>
                  {/* Start of heading and close */}
                  <View style={{ flex: 1, flexDirection: 'row' }}>
                    <Text style={[editTargetStyles.modalHeader]}>
                      Edit Target For:
                      {' '}
                      {currentTargetDetails.first_name}
                    </Text>
                  </View>

                  <View style={{
                    flex: 5, flexDirection: 'row',
                  }}>
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                      <Text style={[editTargetStyles.textStyle, {
                        paddingLeft: 30,
                      }]}>
Scooter
                      </Text>
                      <View style={editTargetStyles.widthHundred}>
                        <UserInput
                          param="scooter"
                          placeholder="Target"
                          autoCapitalize="none"
                          keyboardType="numeric"
                          returnKeyType="done"
                          value={currentTargetDetails.scooter.toString()}
                          onChange={this.handleOnInputChange}
                          autoCorrect={false}
                          textStyle={editTargetStyles.userInputStyle}
                        />
                      </View>
                    </View>
                    <View style={{
                      flex: 1,
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}>
                      <Text style={[editTargetStyles.textStyle, {
                        paddingLeft: 35,
                      }]}>
Bike
                      </Text>
                      <View style={editTargetStyles.widthHundred}>
                        <UserInput
                          param="bike"
                          placeholder="Target"
                          autoCapitalize="none"
                          keyboardType="numeric"
                          returnKeyType="done"
                          value={currentTargetDetails.bike.toString()}
                          onChange={this.handleOnInputChange}
                          autoCorrect={false}
                          textStyle={editTargetStyles.userInputStyle}
                        />
                      </View>
                    </View>
                  </View>
                  <View style={{ justifyContent: 'center', alignContent: 'center' }}>
                    {
                      this.state.showError
                        && (
                        <Text style={editTargetStyles.errorMessage}>
                          {' '}
                          {this.state.errorMessage}
                        </Text>
                        )
                      }
                  </View>
                  <View style={{ flex: 2, justifyContent: 'center', alignContent: 'center' }}>
                    <View style={{ alignSelf: 'center', paddingBottom: 15 }}>
                      <BookTestRideButton
                        disabled={this.state.pristine || this.state.showError}
                        handleSubmit={() => { this.onTargetUpdate(currentTargetDetails); }}
                        title="Update Targets"
                        />
                    </View>
                  </View>
                </View>
              </KeyboardAwareScrollView>
            </View>
          </Modal>
          )
        }
        </View>
        <AppHeader navigation={this.props.navigation} backEnabled>
          <View style={editTargetStyles.headerContainer}>
            <View style={{ flex: 1, flexDirection: 'row' }}>
              <View style={editTargetStyles.headerTextContent}>
                <Text style={{ color: 'white', paddingHorizontal: 5 }}>
                  Target as on:
                </Text>
                <Text style={{ color: 'gray', paddingHorizontal: 5 }}>
                  {moment(followUpDate).format('DD-MMM-YY')}
                </Text>
              </View>
              <TouchableOpacity
                style={editTargetStyles.headerSearchContent}
                onPress={this.onSearchProductClick}>
                <Text style={{ paddingHorizontal: 10 }}><Icon name="search" size={21} color="white" /></Text>
                <Text style={editTargetStyles.headerSearchContentText}>
Search for Lead
                </Text>
              </TouchableOpacity>
              <View style={{ flex: 2, flexDirection: 'row', alignItems: 'center' }} />
            </View>
          </View>
        </AppHeader>
        <View style={{ flex: 1 }}>
          <View style={{
            flex: 2, backgroundColor: 'white', paddingHorizontal: 30, paddingVertical: 10
          }}>
            <View style={{ flex: 3, height: 25, flexDirection: 'row' }}>
              <View style={{ flex: 1, paddingLeft: 10 }}>
                <Text style={{ color: '#494949' }}>Manufacturer Target</Text>
              </View>
              <View style={{ flex: 1, paddingLeft: 10 }}>
                <Text style={{ color: '#494949' }}>Dealership Target</Text>
              </View>
            </View>
            <View />
            <View style={{ flex: 7, flexDirection: 'row' }}>
              <View style={{ flex: 1, flexDirection: 'row' }}>
                <ExpandableTile data={totalManufacturerTarget} />
              </View>
              <View style={{ flex: 1, flexDirection: 'row' }}>
                <ExpandableTile data={totalDealershipTarget} />
              </View>
            </View>
          </View>
          <View style={{ flex: 8, marginHorizontal: 30, marginVertical: 20 }}>
            <Table
              loading={this.props.loading}
              cols={this.cols}
              dataEmptyText="No Targets found"
              data={this.state.targetList}
              onDataChange={this.state.onDataChange}
              renderFooter={this.renderFooter}
              tableBodyStyle={{}}
              />
          </View>
        </View>
      </Fragment>
    );
  }
}
