import React, { Component } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import PropTypes from 'prop-types';
import close from '../../../../assets/images/close.png';
import { HorizontalTextTile } from '../../../../components/tile/Tile';
import ExpandableTile from '../../../../components/expandableTile/ExpandableTile';
import myLeadHeaderStyles from './myleadHeaderStyles';

const LeadsHeader = props => {
  const _onPressButton = () => (
    props.showSlider()
  );

  const findDimensions = layout => {
    const {
      height
    } = layout;
    props.headerHeight(height);
  };

  return (
    <LinearGradient
      colors={['orange', '#34312f']}
      style={myLeadHeaderStyles.gradientConainer}
    >
      <View style={myLeadHeaderStyles.cardContainer} onLayout={event => { findDimensions(event.nativeEvent.layout); }}>
        <View style={myLeadHeaderStyles.leftContainer}>
          <Text style={myLeadHeaderStyles.staticTextStyle}>Your Leads : </Text>
          <Text style={myLeadHeaderStyles.dateTextStyle}>Today, March 2018</Text>
        </View>
        <View style={myLeadHeaderStyles.rightContainer}>
          <TouchableOpacity style={myLeadHeaderStyles.searchStyle}>
            <Image source={close} />
            <Text>Search lead</Text>
          </TouchableOpacity>
          <TouchableOpacity style={myLeadHeaderStyles.imageOneStyle}>
            <Image source={close} />
          </TouchableOpacity>
          <TouchableOpacity style={myLeadHeaderStyles.imageTwoStyle}>
            <Image source={close} />
          </TouchableOpacity>
          <TouchableOpacity style={myLeadHeaderStyles.imageThreeStyle} onPress={_onPressButton}>
            <Image source={close} />
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
};

LeadsHeader.propTypes = {
  showSlider: PropTypes.func.isRequired,
  headerHeight: PropTypes.func.isRequired
};

class MyLeadHeader extends Component {
  constructor(props) {
    super(props);
    this.state = {
      expandableTileData: [
        {
          titleText: 'Gixxer',
          titleCount: '5'
        },
        {
          titleText: 'Gixxer SF',
          titleCount: '5'
        },
        {
          titleText: 'Intruder',
          titleCount: '5'
        },
        {
          titleText: 'Gixxer',
          titleCount: '5'
        },
        {
          titleText: 'Gixxer',
          titleCount: '5'
        },
        {
          titleText: 'Gixxer',
          titleCount: '5'
        },
      ],
      tabLayoutData: [
        {
          id: 1,
          name: 'Unassigned',
          count: 34,
        },
        {
          id: 2,
          name: 'Fresh',
          count: 34,
        },
        {
          id: 3,
          name: 'Hot',
          count: 34,
        },
        {
          id: 4,
          name: 'Warm',
          count: 34,
        },
        {
          id: 5,
          name: 'Cold',
          count: 34,
        },
        {
          id: 6,
          name: 'Invoiced',
          count: 34,
        },
        {
          id: 7,
          name: 'Lost',
          count: 34,
        },
      ],
      tabPosition: 1
    };
  }

  onTabPress = tabInfo => {
    this.props.activeTab(tabInfo.id);
    this.setState({ tabPosition: tabInfo.id });
  }

  getTabData = () => (
    <View style={{ flexDirection: 'row' }}>
      {
        this.state.tabLayoutData.map(tab => (
          <TouchableOpacity
            key={tab.id}
            style={this.changeTabColor(tab.id)}
            onPress={() => this.onTabPress(tab)}
          >
            <Text style={this.changeTextColor(tab.id)}>{tab.name}({tab.count})</Text>
          </TouchableOpacity>
        ))
      }
    </View>
  )

  changeTabColor(id) {
    if (this.state.tabPosition === id) {
      return myLeadHeaderStyles.tabSelectedStyle;
    }
    return myLeadHeaderStyles.tabStyle;
  }

  changeTextColor(id) {
    if (this.state.tabPosition === id) {
      return myLeadHeaderStyles.tabSelectedTextStyle;
    }
    return myLeadHeaderStyles.tabTextStyle;
  }

  showSlider = () => {
    this.props.showSlider();
  }

  render() {
    return (
      <View>
        <LeadsHeader showSlider={this.showSlider} />
        <View style={myLeadHeaderStyles.container}>
          <View style={myLeadHeaderStyles.rowContainer}>
            <View style={myLeadHeaderStyles.overviewContainer}>
              <Text style={myLeadHeaderStyles.titleTextStyle}>
              Overview
              </Text>
              <View style={myLeadHeaderStyles.overviewTileContainer}>
                <HorizontalTextTile
                  tileStyle={myLeadHeaderStyles.overviewTileOneStyle}
                  tileText={'Unassigned\nLeads'}
                  tileValue="40"
                />
                <HorizontalTextTile
                  tileStyle={myLeadHeaderStyles.overviewTileTwoStyle}
                  tileText={'Hot\nLeads'}
                  tileValue="40"
                />
              </View>
            </View>
            <View style={myLeadHeaderStyles.targetContainer}>
              <Text style={myLeadHeaderStyles.targetTextStyle}>Target Mar-2018</Text>
              <View style={myLeadHeaderStyles.targetTileContainer} >
                <ExpandableTile data={this.state.expandableTileData} />
              </View>
            </View>
          </View>
          <View style={myLeadHeaderStyles.tabContainer} >
            {this.getTabData()}
          </View>
        </View>
      </View>
    );
  }
}

MyLeadHeader.propTypes = {
  activeTab: PropTypes.func,
  showSlider: PropTypes.func.isRequired
};

MyLeadHeader.defaultProps = { activeTab: () => {} };

export default MyLeadHeader;
