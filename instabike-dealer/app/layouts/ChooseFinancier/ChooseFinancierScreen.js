/**
 * Choose Financier Screen
 * This screen is visible for Dealer Manager. The Dealer Manager can add, remove
 * or update financier list.
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  Modal,
  ScrollView
} from 'react-native';
import DraggableFlatList from 'react-native-draggable-flatlist';
import Icon from 'react-native-vector-icons/FontAwesome';

// Reducer
import { connect } from 'react-redux';

// Component
import Loader from '../../components/loader/Loader';
import { GradientButtonLarge } from '../../components/button/Button';

// Images
import Close from '../../assets/images/close.png';
import SmallClose from '../../assets/images/small_close.png';

// Styles
import styles from './chooseFinancierStyles';

// Component
import ContinueSectionScreen from '../../components/ContinueSection/ContinueSectionScreen';

// Storage
import storage from '../../helpers/AsyncStorage';

// Action Methods
import {
  getFinancierList,
  updateFinancierList,
  updateUserStatus
} from '../../redux/actions/Financier/actionCreators';

import { setUser } from '../../redux/actions/User/actionCreators';
import { showIndicator, hideIndicator } from '../../redux/actions/Loader/actionCreators';

@connect(
  state => ({
    addedFinancierList: state.financier.addedFinancierList,
    unaddedFinancierList: state.financier.unaddedFinancierList,
    loading: state.loader.showIndicator,
    currentUser: state.user.currentUser
  }),
  {
    setUser,
    getFinancierList,
    updateFinancierList,
    updateUserStatus,
    showIndicator,
    hideIndicator
  }
)

class ChooseFinancierScreen extends Component {
  static propTypes = {
    getFinancierList: PropTypes.func.isRequired,
    setUser: PropTypes.func.isRequired,
    updateFinancierList: PropTypes.func.isRequired,
    updateUserStatus: PropTypes.func.isRequired,
    addedFinancierList: PropTypes.array,
    unaddedFinancierList: PropTypes.array,
    navigation: PropTypes.object.isRequired,
    currentUser: PropTypes.object.isRequired,
    previousStep: PropTypes.func.isRequired,
    showIndicator: PropTypes.func.isRequired,
    hideIndicator: PropTypes.func.isRequired,
    loading: PropTypes.bool.isRequired
  }

  static defaultProps = {
    addedFinancierList: [],
    unaddedFinancierList: []
  }

  static getDerivedStateFromProps(nextProps) {
    const { addedFinancierList, unaddedFinancierList } = nextProps;
    if (addedFinancierList && unaddedFinancierList) {
      return {
        currentlyAddedFinanciers: addedFinancierList,
        currentlyUnaddedFinanciers: unaddedFinancierList
      };
    }
    return null;
  }

  constructor(props) {
    super(props);
    this.state = {
      disableActionBtn: false,
      selectedArray: [],
      currentlyAddedFinanciers: this.props.addedFinancierList,
      currentlyUnaddedFinanciers: this.props.unaddedFinancierList,
      modalVisible: false,
      refreshFlatList: false
    };
  }

  componentDidMount() {
    const { currentUser: { dealerId } } = this.props;
    if (dealerId) {
      this.props.showIndicator();
      this.props.getFinancierList(dealerId).then(() => {
        this.props.hideIndicator();
      }).catch(error => {
        this.props.hideIndicator();
        console.log('Error.....:', error);
      });
    }
  }

  setModalVisible(visible) {
    this.setState({ modalVisible: visible });
  }

  continueBtnAction = () => {
    this.setState({
      disableActionBtn: true
    });
    const { navigation } = this.props;
    const updatedAddedList = this.state.currentlyAddedFinanciers;
    this.props.showIndicator();
    this.props.updateFinancierList(
      this.props.currentUser.dealerId,
      updatedAddedList
    ).then(() => {
      const temp = {
        is_onboarding_done: true
      };
      this.props.updateUserStatus(this.props.currentUser.userId, temp).then(() => {
        const user = {
          ...this.props.currentUser,
          is_onboarding_done: true,
          user: {
            ...this.props.currentUser.user,
            is_onboarding_done: true
          }
        };
        storage.storeJsonValues('currentUser', user);
        this.props.setUser(user);
        navigation.navigate('Dashboard');
      }).catch(() => {
        this.props.hideIndicator();
      });
    }).catch(error => {
      this.props.hideIndicator();
      console.log('Error.....:', error);
    });
    this.setModalVisible(false);
    this.setState({
      selectedArray: [],
    });
    this.props.hideIndicator();
  }

  backBtnAction = () => {
    this.props.previousStep(4);
  }

  removeFiancierIconTapped = item => {
    const index = this.state.currentlyAddedFinanciers.indexOf(item);
    this.state.currentlyAddedFinanciers.splice(index, 1);
    this.state.currentlyUnaddedFinanciers.push(item);
    this.setState({
      currentlyAddedFinanciers: this.state.currentlyAddedFinanciers,
      currentlyUnaddedFinanciers: this.state.currentlyUnaddedFinanciers,
      refreshFlatList: !this.state.refreshFlatList
    });
  }

  _keyExtractor = item => item.id

  _addFinancierKeyExtractor = item => item.id

  _addMoreBtnClicked = () => {
    this.setModalVisible(true);
  }

  _addNewFinancierBtnClicked = () => {
    this.state.selectedArray.forEach(item => {
      this.state.currentlyAddedFinanciers.splice(this.state.currentlyAddedFinanciers.length, 0, item);
      const currentIndex = this.state.currentlyUnaddedFinanciers.findIndex(eachObj => eachObj.id === item.id);
      if (currentIndex !== -1) {
        this.state.currentlyUnaddedFinanciers.splice(currentIndex, 1);
      }
    });
    this.setState({
      currentlyAddedFinanciers: this.state.currentlyAddedFinanciers,
      currentlyUnaddedFinanciers: this.state.currentlyUnaddedFinanciers,
      selectedArray: [],
      refreshFlatList: !this.state.refreshFlatList
    });
    this.setModalVisible(false);
  }

  OntRadioBtntap = rowItem => {
    this.checkObjectAlreadyExist(rowItem);
  }

  checkObjectAlreadyExist = item => {
    const currentIndex = this.state.selectedArray.findIndex(eachObj => eachObj.id === item.id);
    if (currentIndex === -1) {
      this.state.selectedArray.push(item);
    } else {
      this.state.selectedArray.splice(currentIndex, 1);
    }
    this.setState({
      selectedArray: this.state.selectedArray,
      refreshFlatList: !this.state.refreshFlatList
    });
  }

  addFinancierRenderItem = data => {
    const { item } = data;
    return (
      <TouchableOpacity
        onPress={() => this.OntRadioBtntap(item)}
      >
        <View style={
          (this.state.selectedArray.findIndex(eachObj => eachObj.id === item.id) === -1)
            ? [styles.withoutFinancierSelected] : styles.withFinancierSelected
            }>
          <Image
            style={styles.imageStyle}
            source={
              { uri: item.logo_url }} />
        </View>
      </TouchableOpacity>
    );
  }

  renderItem = ({
    item, move, moveEnd
  }) => (
    <TouchableOpacity
      style={[styles.financierItemContainer]}
      onLongPress={move}
      onPressOut={moveEnd}
      >
      {
          !item.is_manufacturer
          && (
          <TouchableOpacity
            style={[styles.closeIconView, { justifyContent: 'center' }]}
            onPress={() => this.removeFiancierIconTapped(item)}>
            <Image
              style={{ resizeMode: 'center', alignSelf: 'center' }}
              source={SmallClose} />
          </TouchableOpacity>
          )
        }
      <Image
        style={styles.financierItemImageStyle}
        source={
            { uri: item.logo_url }} />
    </TouchableOpacity>
  )

  render() {
    const { disableActionBtn } = this.state;
    return (
      <View style={styles.mainContainer} onLayout={this.findDimensions}>
        <Loader showIndicator={this.props.loading} />
        <Modal
          animationType="slide"
          transparent
          visible={this.state.modalVisible}
          onRequestClose={() => {
            this.setState({
              selectedArray: []
            });
          }}>
          <View style={styles.popUpViewStyle}>
            <View style={[styles.sliderHeaderStyles, { flexDirection: 'row' }]}>
              <Text style={styles.addFinancierHeaderTextStyle}>Add Financiers </Text>
              <TouchableOpacity
                style={styles.closeBtnStyle}
                onPress={() => {
                  this.setModalVisible(!this.state.modalVisible);
                }}>
                <Image
                  style={{ resizeMode: 'center' }}
                  source={Close} />
              </TouchableOpacity>
            </View>
            <View style={styles.seperatorView} />
            <View style={{ flex: 1 }}>
              {(this.state.currentlyUnaddedFinanciers.length > 0)
              && (
              <FlatList
                keyExtractor={this._addFinancierKeyExtractor}
                data={this.state.currentlyUnaddedFinanciers}
                renderItem={this.addFinancierRenderItem}
                extraData={this.state.refreshFlatList}
                horizontal={false}
                numColumns={3} />
              )
            }
              {(this.state.currentlyUnaddedFinanciers.length === 0)
              && (
              <Text style={styles.noFinanciersText}>
                 No financiers to show
              </Text>
              ) }
            </View>
            <GradientButtonLarge
              style={styles.addNewFinancierStyle}
              title="Add Financiers"
              handleSubmit={this._addNewFinancierBtnClicked} />
          </View>
        </Modal>
        <View style={styles.dataContainer}>
          <ScrollView>
            <View>
              <Text style={[styles.textStyles, styles.chooseFianancierTitleTextStyle]}>
              Choose Financiers
              </Text>
              <View style={styles.mainDataContainer}>
                <View style={{ flexDirection: 'row' }}>
                  <Text style={[styles.textStyles, styles.yourFinancierTextStyle]}>
                Your Financiers
                  </Text>
                  <TouchableOpacity
                    style={[styles.addIconImageStyle]}
                    onPress={() => {
                      this.setState({
                        modalVisible: true
                      });
                    }}>
                    <Icon
                      name="plus"
                      size={30}
                      color="white" />
                  </TouchableOpacity>
                </View>
                <View style={styles.seperatorView} />
                <DraggableFlatList
                  style={styles.financierListContainer}
                  keyExtractor={item => `draggable-item-${item}`}
                  data={this.state.currentlyAddedFinanciers}
                  renderItem={this.renderItem}
                  extraData={this.state.refreshFlatList}
                  scrollPercent={5}
                  onMoveEnd={({ data }) => {
                    this.setState({
                      currentlyAddedFinanciers: data
                    }, () => {
                    });
                  }}
                  horizontal />
              </View>
            </View>
          </ScrollView>
          <View style={styles.continuosSectionView}>
            <ContinueSectionScreen
              disableBackBtn={disableActionBtn}
              style={styles.continueBtnAction}
              continueBtnAction={this.continueBtnAction}
              backBtnAction={this.backBtnAction} />
          </View>
        </View>
      </View>
    );
  }
}
export default ChooseFinancierScreen;

