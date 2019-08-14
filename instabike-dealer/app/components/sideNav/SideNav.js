import React, { Component } from 'react';
import {
  View, ScrollView, Image, Dimensions
} from 'react-native';
import { connect } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import PropTypes from 'prop-types';
import { ImageTextTile } from '../tile/Tile';
import sideNavStyles from './sideNavStyles';
import { toggleSideNav, disableButton } from '../../redux/actions/Global/actionCreators';
import constants from '../../utils/constants';
import FromTopView from '../animated/FromTopView';

const DEVICE_HEIGHT = Dimensions.get('window').height;

@connect(state => ({
  isSideNavOpen: state.global.isSideNavOpen,
  logoutLoading: state.user.loading,
  buttonState: state.global.buttonState
}), {
  toggleSideNav,
  disableButton
})
class SideNav extends Component {
  static propTypes = {
    tileData: PropTypes.array.isRequired,
    selectedTile: PropTypes.number.isRequired,
    logoutLoading: PropTypes.bool.isRequired,
    currentUser: PropTypes.object.isRequired,
    disableButton: PropTypes.func.isRequired,
    buttonState: PropTypes.bool.isRequired
  }

  constructor(props) {
    super(props);
    this.state = {
      restrictedScreens: {
        teamHeadScreens: ['dealership', 'updateInventory'],
        dealerTeamHeadScreens: ['dealership', 'updateInventory'],
        salesExecutiveScreens: ['team', 'dealership', 'updateInventory'],
        managerScreens: [],
      }
    };
  }

  renderTiles = () => {
    const {
      restrictedScreens: {
        teamHeadScreens,
        dealerTeamHeadScreens,
        salesExecutiveScreens,
        managerScreens
      }
    } = this.state;
    let availableTiles = this.props.tileData;
    const role = this.props.currentUser ? this.props.currentUser.role : '';
    const restrictedScreens = (() => {
      switch (role) {
        case constants.TEAM_HEAD: {
          return teamHeadScreens;
        }
        case constants.DEALER_TEAM_HEAD: {
          return dealerTeamHeadScreens;
        }
        case constants.SALES_EXECUTIVE: {
          return salesExecutiveScreens;
        }
        default:
          return managerScreens;
      }
    })();

    availableTiles = restrictedScreens.length > 0 ? availableTiles.filter(tile => {
      let allowScreen = true;
      restrictedScreens.every(screen => {
        if (tile.key === screen) {
          allowScreen = false;
          return false;
        }
        return true;
      });
      return allowScreen;
    }) : availableTiles;

    return (
      <View style={{ flex: 2 }}>
        {
          availableTiles.map((item, index) => {
            const selectedTile = (this.props.selectedTile === item.id);
            return (
              <View
                style={[sideNavStyles.tile,
                  {
                    borderBottomWidth: (index === availableTiles.length - 1) ? 0 : 1.5,
                    borderBottomColor: '#444444'
                  }]}
                key={item.id}
              >
                <View style={sideNavStyles.tileContainer}>
                  <LinearGradient
                    colors={selectedTile
                      ? ['#ef563c', '#f3842d']
                      : ['#383737', '#383737']
                    }
                    start={{ x: 0.0, y: 0.0 }}
                    end={{ x: 1.0, y: 1.0 }}
                    style={[sideNavStyles.tileGradientBorder]}
                  />
                </View>
                <View style={sideNavStyles.tileImage}>
                  <LinearGradient
                    colors={selectedTile ? ['#5f5f64', '#3e3d3e'] : ['#383737', '#383737']}
                    start={{ x: 0.0, y: 0.0 }}
                    end={{ x: 1.0, y: 1.0 }}
                    style={sideNavStyles.tileGradientText}
                  >
                    <ImageTextTile
                      selected={selectedTile}
                      key={item.id}
                      type={item.type}
                      tile={item}
                      icon={item.icon}
                      disabled={this.props.buttonState}
                      tileImage={item.image}
                      tileClick={() => {
                        if (!this.props.logoutLoading && !selectedTile) {
                          item.handleSubmit(item.id);
                        }
                      }}
                    />
                  </LinearGradient>
                </View>
              </View>
            );
          })
        }
      </View>
    );
  }

  render() {
    return (
      <View style={[sideNavStyles.container]}>
        <View style={{ backgroundColor: '#383737' }}>
          <FromTopView
            initialValue={-DEVICE_HEIGHT}
            toValue={0}
            duration={200}>
            <ScrollView style={{ height: DEVICE_HEIGHT - 88 }} showsVerticalScrollIndicator={false}>
              {this.renderTiles()}
            </ScrollView>
          </FromTopView>
          <View style={[{
            flexDirection: 'row',
            borderTopWidth: 1,
            borderTopColor: '#444444',
            height: 65,
          }]}>
            <View style={[sideNavStyles.tileImage, { height: 65 }]}>
              <LinearGradient
                colors={['#383737', '#383737']}
                start={{ x: 0.0, y: 0.0 }}
                end={{ x: 1.0, y: 1.0 }}
                style={sideNavStyles.tileGradientText}>
                <Image
                  resizeMode="contain"
                  style={{
                    width: 70,
                    height: 30,
                    marginBottom: 10,
                    alignSelf: 'center'
                  }}
                  source={require('../../assets/images/instabikeLogo.png')}
                  activeOpacity={0.5}
                />
              </LinearGradient>
            </View>
          </View>
        </View>
      </View>
    );
  }
}

export default SideNav;
