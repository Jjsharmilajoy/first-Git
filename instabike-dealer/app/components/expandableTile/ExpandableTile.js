import React, { Component } from 'react';
import { View, Animated } from 'react-native';
import Dimensions from 'Dimensions';
import PropTypes from 'prop-types';
import styles from './expandableTileStyles';
import { HorizontalTouchableTextTile } from '../tile/Tile';

const DEVICE_WIDTH = Dimensions.get('window').width;

class ExpandableTile extends Component {
  static propTypes = {
    data: PropTypes.array.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = {
      showExpandedTiles: false,
      currentStepValue: new Animated.Value(0),
      currentFlexValue: new Animated.Value(0)
    };
  }

  componentDidMount() {
    const { showExpandedTiles } = this.state;
    this.animate({
      endValue: showExpandedTiles ? -100 : 0,
      duration: 100
    });
  }

  summaryTileClick = () => {
    const { showExpandedTiles } = this.state;
    this.setState({
      showExpandedTiles: !(showExpandedTiles),
      currentFlexValue: new Animated.Value(showExpandedTiles ? 0 : 1)
    }, () => {
      this.animate({
        endValue: showExpandedTiles ? -100 : 0,
        duration: 100
      });
    });
  }

  animate = ({ endValue, duration }) => {
    const { showExpandedTiles } = this.state;
    Animated.parallel([
      Animated.timing(
        this.state.currentStepValue,
        {
          toValue: endValue,
          duration
        }
      ),
      Animated.timing(
        this.state.currentFlexValue,
        {
          toValue: showExpandedTiles ? 1 : 0,
          duration
        }
      )]).start();
  }

  showExpandedTiles() {
    const { data } = this.props;
    const { currentStepValue, currentFlexValue } = this.state;
    return (
      <Animated.View style={[
        {
          flex: 1,
          zIndex: 9,
          opacity: currentFlexValue,
          transform: [{
            translateX: currentStepValue
          }],
          elevation: 5,
          borderRadius: 0,
          shadowOffset: {
            width: 3,
            height: 3,
          },
          shadowOpacity: 0.2,
          shadowRadius: 10
        }
      ]}>
        <View style={{ flex: 1, flexDirection: 'row' }}>
          <HorizontalTouchableTextTile
            tileText={data[1].label}
            count={data[1].count}
            colors={['#ffffff', '#ffffff']}
            containerStyle={{ flex: 1, justifyContent: 'space-between', paddingHorizontal: 15 }}
            leftTextStyle={{ color: '#494949' }}
            rightTextStyle={{ color: '#494949', fontWeight: '600' }}
            tileClick={() => {}}
            tileStyle={[{
              borderRadius: 0,
              flex: 1
            }, styles.shadowTile]}
            />
          <HorizontalTouchableTextTile
            colors={['#ffffff', '#ffffff']}
            tileText={data[2].label}
            count={data[2].count}
            containerStyle={{ flex: 1, justifyContent: 'space-between', paddingHorizontal: 15 }}
            leftTextStyle={{ color: '#494949' }}
            rightTextStyle={{ color: '#494949', fontWeight: '500' }}
            tileClick={() => {}}
            tileStyle={[{
              flex: 1,
              borderTopRightRadius: 5,
              borderBottomRightRadius: 5,
              justifyContent: 'center',
              backgroundColor: 'white'
            }, styles.shadowTile]}
            />
        </View>
      </Animated.View>
    );
  }

  render() {
    const { data } = this.props;
    return (
      <View style={{
        flex: 1,
        flexDirection: 'row',
        marginHorizontal: 5
      }}>
        <HorizontalTouchableTextTile
          tileText={data[0].label}
          tileClick={this.summaryTileClick}
          tileTotalCount=""
          count={data[0].count}
          containerStyle={{ flex: 1, justifyContent: 'space-between', paddingHorizontal: 15 }}
          leftTextStyle={{ color: 'white' }}
          rightTextStyle={{ color: 'white', fontWeight: '600' }}
          colors={['#4fced4', '#4ec4dd', '#4dbbea', '#4eb7fd']}
          tileStyle={[{
            borderRadius: this.state.showExpandedTiles ? 0 : 5,
            borderTopLeftRadius: 5,
            borderBottomLeftRadius: 5,
            zIndex: 999,
            width: (DEVICE_WIDTH - 100) / 6,
          }, styles.shadowTile]}
        />
        {this.showExpandedTiles()}
      </View>
    );
  }
}

export default ExpandableTile;
