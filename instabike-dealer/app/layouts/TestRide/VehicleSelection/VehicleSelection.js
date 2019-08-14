/**
 * This Component lists number of vehicles that are available for test ride
 * for a particular lead.
 */
import React, { Component } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity
} from 'react-native';
import PropTypes from 'prop-types';
import styles from './vehicleSelectionStyles';
import { ButtonWithLeftImage, BookTestRideButton }
  from '../../../components/button/Button';
import AppHeader from '../../../components/header/Header';
import TestRideHeader from '../TestRideHeader/testRideHeader';
import backButton from '../../../assets/images/backArrow.png';

export default class VehicleSelection extends Component {
  static propTypes = {
    navigation: PropTypes.object.isRequired,
  }

  static defaultProps = {
  }

  constructor(props) {
    super(props);
    const { navigation } = this.props;
    this.state = {
      refreshList: false,
      enquiredVehicles: [],
      lead: null,
      vehicleId: navigation.state.params.leadDetail.vehicle_id,
      leadDetailId: navigation.state.params.leadDetail.id
    };
  }

  static getDerivedStateFromProps(nextProps) {
    if (nextProps.navigation) {
      const {
        lead, enquiredVehicles, leadDetail, source
      } = nextProps.navigation.state.params;
      if (lead && enquiredVehicles && leadDetail) {
        return {
          lead,
          leadDetail,
          vehicleId: leadDetail.vehicle_id,
          enquiredVehicles,
          source
        };
      }
    }
  }

  gotoDateSelection = () => {
    const { leadDetail, lead, source } = this.state;
    const { navigation } = this.props;
    navigation.navigate('TestRideDateSelectionScreen', { lead, leadDetail, source });
  }

  gotoPrevious = () => {
    const { navigation } = this.props;
    navigation.goBack();
  }

  renderItem = item => (
    (!item.test_ride_status || item.test_ride_status === 500) &&
    (item && item.vehicle && item.vehicle.dealer_vehicles.length > 0 &&
      item.vehicle.dealer_vehicles[0].test_ride_vehicle > 0) ?
        <View style={styles.bikeRowStyle}>
          <TouchableOpacity
            onPress={() => {
              this.setState({
                vehicleId: item.vehicle.id,
                leadDetailId: item.id,
                refreshList: !this.state.refreshList,
                leadDetail: item
              });
            }}>
            <Image
              source={{ uri: item.vehicle.image_url }}
              resizeMode="center"
              style={(this.state.leadDetailId === item.id) ? styles.bikeActivated :
                [styles.bike, (this.state.vehicleId !== '') ? { opacity: 0.3 } : null]} />
          </TouchableOpacity>
          <Text
            style={(this.state.leadDetailId === item.id) ?
              styles.textSelected : styles.text}>{item.vehicle.name}
          </Text>
        </View>
      :
      null
  )

  render() {
    const { enquiredVehicles } = this.state;
    return (
      <View style={styles.container}>
        <AppHeader
          isLeadExists={false}>
          <TestRideHeader lead={this.state.lead} />
        </AppHeader>
        <View style={styles.headerView}>
          <Text style={styles.bikeText}>Bike Selection</Text>
        </View>
        <View style={styles.mainView}>
          <FlatList
            horizontal
            keyExtractor={item => item.id}
            data={enquiredVehicles}
            extraData={this.state.refreshList}
            renderItem={({ item, index }) => this.renderItem(item, index)} />
        </View>
        <View style={styles.footerView}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 40 }}>
            <ButtonWithLeftImage
              image={backButton}
              style={[styles.backButtonStyle, { flex: 0.1 }]}
              textStyle={styles.backButtonTextStyle}
              title=" Back"
              handleSubmit={this.gotoPrevious}
            />
            <BookTestRideButton
              title="Continue"
              buttonStyle={{ width: 150 }}
              handleSubmit={this.gotoDateSelection} />
          </View>
        </View>
      </View>
    );
  }
}
