import React, { Component } from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import { Dropdown } from 'react-native-material-dropdown';
import LinearGradient from 'react-native-linear-gradient';
import PropTypes from 'prop-types';
import FlexAnimate from '../animated/FlexAnimate';
import targetGraphStyles from './targetGraphStyles';
import fonts from '../../theme/fonts';
import constants from '../../utils/constants';

export default class TargetGraph extends Component {
  static calculateTargetSummary = (target, targetLabels) => {
    const {
      mtd
    } = target;
    // actual manufacturer and dealer target
    let { mt, dt } = target;
    // checking to show third common label
    target.isTargetEqual = parseInt(mt, 10) === parseInt(dt, 10);
    const dealerTarget = dt;
    const manufacturerTarget = mt;
    // setting target labels and values based on comparison for higher
    // than one another
    target.targetLabels = targetLabels;
    target.firstValue = mt;
    target.secondValue = dt;

    const swithTargetLabels = (dt < mt) && (mt !== 0);
    const isDealerTargetEmpty = (dt === 0);

    // changing default values to be aligned in ascending order
    if (swithTargetLabels) {
      target.firstValue = dt;
      target.secondValue = mt;
      const [
        primaryTargetLabel,
        secondaryTargetLabel,
        targetEqualLabel
      ] = target.targetLabels;
      mt = dealerTarget;
      dt = manufacturerTarget;
      target.targetLabels = [secondaryTargetLabel, primaryTargetLabel, targetEqualLabel];
    }
    // to show graph percentage based on flex
    target.aboveDt = mtd > dt;
    target.aboveMt = mtd > mt;
    mt = target.isTargetEqual ? 0 : mt;
    target.additionalDealerUnitsSold = target.aboveDt ? mtd - dt : 0;
    const getFixedPerc = x => parseFloat(Number.parseFloat(x).toFixed(0));
    // handling default values if mt is not present
    // calculating percentage for showing text only when dealer target present
    const showPerc = !isDealerTargetEmpty ? getFixedPerc((mtd / dt) * 100) : 0;
    target.showPerc = showPerc === Infinity ? 0 : showPerc;
    // calculating percentage for animating only when dealer target present and
    //  manufacturer target lower than dealer target
    if ((swithTargetLabels && !isDealerTargetEmpty && mt)) {
      const perc = getFixedPerc((mtd / mt) * 100);
      target.perc = perc === Infinity ? 0 : perc;
      target.additionalManagerUnitsSold = target.aboveMt ? mtd - mt : 0;
      target.additionalManagerUnitsSoldPerc = target.aboveMt ? getFixedPerc((target.additionalManagerUnitsSold / (dt - mt)) * 100) : 0;
      target.additionalDealerUnitsSoldPerc = target.aboveDt ? getFixedPerc((target.additionalDealerUnitsSold / (dt - mt)) * 100) : 0;
      // calculating percentage for animating only when dealer target present
    } else if (!swithTargetLabels && !isDealerTargetEmpty && dt) {
      const derivedThirtyPerc = ((mtd / dt) * 100 > 70) ? (30 / dt) * 100 : 0;
      const perc = getFixedPerc((mtd / dt) * 100);
      target.perc = perc === Infinity ? 0 : perc;
      target.additionalManagerUnitsSold = 0;
      target.additionalManagerUnitsSoldPerc = getFixedPerc((mtd / derivedThirtyPerc) * 100);
      target.additionalDealerUnitsSoldPerc = target.aboveDt ? getFixedPerc((target.additionalDealerUnitsSold / (mtd - dt)) * 100) : 0;
    }
    return target;
  }

  static propTypes = {
    data: PropTypes.object.isRequired,
    style: PropTypes.object,
    highlights: PropTypes.object,
    animation: PropTypes.object,
    noDataText: PropTypes.string,
    onChange: PropTypes.func,
    onTargetChange: PropTypes.func,
    targetList: PropTypes.array,
    selectedTarget: PropTypes.object,
    showDropdown: PropTypes.bool,
  }

  static defaultProps = {
    style: null,
    highlights: null,
    animation: null,
    noDataText: null,
    onTargetChange: null,
    onChange: null,
    selectedTarget: null,
    showDropdown: false,
    targetList: null
  }

  constructor(props) {
    super(props);
    let { data: targets } = this.props;
    const { data: { targetLabels } } = this.props;
    if (targets && targets.length > 0) {
      targets = targets.map(data => TargetGraph.calculateTargetSummary(data, targetLabels));
    }
    this.state = {
      targetSummary: targets
    };
  }

  static getDerivedStateFromProps(nextProps) {
    let { data: { targets } } = nextProps;
    const { data: { targetLabels } } = nextProps;
    if (targets && targets.length > 0) {
      targets = targets.map(data => TargetGraph.calculateTargetSummary(data, targetLabels));
      return {
        targetSummary: targets
      };
    }
    return null;
  }

  render() {
    const { targetSummary } = this.state;
    const {
      data: {
        headerText, colors, role, targetLabels
      },
      targetList,
      selectedTarget,
      onTargetChange,
      showDropdown
    } = this.props;
    const {
      style, highlights, animation, noDataText, onChange
    } = this.props;
    console.log(highlights, animation, noDataText, onChange);
    return (
      <View style={[style || {}, { flex: 1 }]}>
        <View style={{
          marginHorizontal: 10,
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <Text style={[targetGraphStyles.targetSummaryHeader, {
            flex: 3,
          }]}>
            {headerText}
          </Text>
          <View style={{
            flex: 2,
            display: showDropdown ? 'flex' : 'none',
            marginBottom: -15,
            marginTop: -20,
            marginLeft: -25
          }}>
            {
              targetList && targetList.length > 0
              && (
              <Dropdown
                data={targetList}
                value={selectedTarget ? selectedTarget.target_name : ''}
                fontSize={14}
                labelFontSize={12}
                dropdownMargins={{ min: 8, max: 16 }}
                itemTextStyle={{ fontSize: 10, fontFamily: fonts.sourceSansProBoldItalic }}
                onChangeText={(value, index, data) => {
                  if (onTargetChange) onTargetChange(value, index, data);
                }}
                labelExtractor={({ name }) => name}
                valueExtractor={({ target_name }) => target_name}
                />
              )
            }
          </View>
          <View style={{ flex: 5 }} />
        </View>
        <View style={{ marginHorizontal: 10 }}>
          <View style={targetGraphStyles.targetSummaryContainer}>
            {
                    targetSummary.map((target, index) => {
                      const gradientColor = (() => {
                        if (index === 0) {
                          return colors[2];
                        }
                        return colors[3];
                      })();
                      const [
                        primaryTargetLabel,
                        secondaryTargetLabel,
                        targetEqualLabel
                      ] = (() => (target.targetLabels && target.targetLabels.length > 0)
                        ? [target.targetLabels[0], target.targetLabels[1], target.targetLabels[2]]
                        : [targetLabels[0], targetLabels[1], targetLabels[2]]
                      )();
                      return (
                        <View style={{ flex: 1, flexDirection: 'row' }} key={target.id}>
                          <View key={target.id} style={{ flex: 1, flexDirection: 'column' }}>

                            {/** First Row View Details* */}
                            <View style={{ flex: 1, flexDirection: 'row' }}>
                              <View style={{ flex: 7 }}>
                                <Text style={targetGraphStyles.targetFirstRowContent}>
                                  {target.targetName}
                                </Text>
                              </View>
                              <View style={{ flex: 3, flexDirection: 'row' }}>
                                <View style={{ flex: target.isTargetEqual ? 4.5 : 7 }}>
                                  {
                                    !target.isTargetEqual
                                    && (
                                    <Text
                                      style={targetGraphStyles.targetFirstRowContentTextInitial}
                                      >
                                      {role === constants.MANAGER ? primaryTargetLabel : ''}
                                    </Text>
                                    )
                                  }
                                </View>
                                <View style={{ flex: target.isTargetEqual ? 5.5 : 3 }}>
                                  {
                                    <Text
                                      style={targetGraphStyles.targetFirstRowContentTextSecondary}
                                      >
                                      {target.isTargetEqual && role === constants.MANAGER
                                        ? targetEqualLabel : secondaryTargetLabel}
                                    </Text>
                                  }
                                </View>
                              </View>
                            </View>

                            {/* 2nd View Bar - Line Graph */}
                            <View style={{
                              flex: 1,
                              padding: 2,
                              flexDirection: 'row',
                              backgroundColor: '#f5f5f5',
                              borderRadius: 5
                            }}
                            >

                              {/* First Layer Of Bar Graph */}
                              <View style={{
                                flex: target.mt
                                 && !target.isTargetEqual ? 7 : 10,
                                borderRadius: 5,
                                flexDirection: 'row'
                              }}>
                                <FlexAnimate
                                  duration={1000}
                                  flexValue={target.perc > 5 ? target.perc / 10 : 0}
                                >
                                  <LinearGradient
                                    colors={gradientColor}
                                    start={{ x: 0.0, y: 0.0 }}
                                    end={{ x: 1.0, y: 1.0 }}
                                    style={
                                      [
                                        targetGraphStyles.targetGradient,
                                        {
                                          height: index === 0 ? 30 : 20
                                        }
                                      ]}
                                  >
                                    <TouchableOpacity
                                      onPress={() => {}}
                                      style={{ alignItems: 'center' }}
                                    >
                                      <Text style={targetGraphStyles.percentagetText}>
                                        {target.showPerc ? target.showPerc : 0}
%
                                      </Text>
                                    </TouchableOpacity>
                                  </LinearGradient>
                                </FlexAnimate>
                                <View style={{ flex: target.perc > 5 ? 10 - (target.perc / 10) : 1 }} />
                              </View>

                              {/* Second Layer Of Bar Graph */}
                              <View style={{ flex: target.mt && !target.isTargetEqual ? 3 : 0 }}>
                                <View style={{ flex: 1, borderRadius: 5, flexDirection: 'row' }}>
                                  {/* Manufacturer Target Line Of Bar Graph */}
                                  <Text style={
                                    [
                                      targetGraphStyles.targetLineGraph,
                                      {
                                        height: index === 0 ? 32 : 22
                                      }
                                    ]}
                                  />

                                  {/* Second Layer Of Bar Graph */}
                                  {/* can be used flex: 10 - (((target.mt / target.dt) * 100) / 10), */}
                                  <View style={targetGraphStyles.primaryTargetFlex}>
                                    {target.additionalManagerUnitsSold > 0
                                    && (
                                    <View style={{ flex: 10, flexDirection: 'row' }}>
                                      <FlexAnimate
                                        style={{}}
                                        duration={1000}
                                        flexValue={target.aboveMt ? target.additionalManagerUnitsSoldPerc / 10 : 10}
                                      >
                                        <LinearGradient
                                          colors={gradientColor}
                                          start={{ x: 0.0, y: 0.0 }}
                                          end={{ x: 1.0, y: 1.0 }}
                                          style={
                                            [
                                              targetGraphStyles.targetGradient, {
                                                height: index === 0 ? 30 : 22
                                              }
                                            ]}
                                        >
                                          <TouchableOpacity
                                            onPress={() => {}}
                                            style={{
                                            }}
                                          >
                                            <Text style={targetGraphStyles.targetOpacity}>
                                              {/* additional Manager units sold- currently not needed */}
                                              {/* + {target.additionalManagerUnitsSold} */}
                                            </Text>
                                          </TouchableOpacity>
                                        </LinearGradient>
                                      </FlexAnimate>
                                      {/* {
                                      !target.aboveDt && */}
                                      <View style={{
                                        flex: target.aboveMt ? 10 - (target.additionalManagerUnitsSoldPerc / 10) : 0
                                      }}
                                      />
                                      {/* } */}
                                    </View>
                                    )
                                    }
                                  </View>

                                  {/* [***Second Layer  of Manufacturer [BAR] **** | ***] */}
                                  {/* flex: (((target.mt / target.dt) * 100) / 10), */}
                                  <View style={{
                                    flex: 3,
                                    borderRadius: 5,
                                    flexDirection: 'row'
                                  }}
                                  >
                                    {/* Dealer Target Line Of Bar Graph -|- */}
                                    <Text style={
                                      [
                                        targetGraphStyles.secondaryTargetContent, {
                                          height: index === 0 ? 32 : 22
                                        }
                                      ]}
                                    />
                                    <View style={{
                                      flex: 10,
                                      marginLeft: 5,
                                      flexDirection: 'row'
                                    }}
                                    >
                                      {target.aboveDt
                                        && (
                                        <FlexAnimate
                                          style={{}}
                                          duration={1000}
                                          flexValue={target.additionalDealerUnitsSoldPerc / 10}
                                          >
                                          <LinearGradient
                                            colors={gradientColor}
                                            start={{ x: 0.0, y: 0.0 }}
                                            end={{ x: 1.0, y: 1.0 }}
                                            style={
                                              [
                                                targetGraphStyles.targetGradient,
                                                {
                                                  height: index === 0 ? 30 : 20,
                                                }]}
                                          >
                                            <TouchableOpacity
                                              onPress={() => {}}
                                              style={{}}
                                            >
                                              <Text style={targetGraphStyles.targetOpacity}>
                                                {/* additional Dealer units sold- currently not needed */}
                                                {/* + {target.additionalDealerUnitsSold} */}
                                              </Text>
                                            </TouchableOpacity>
                                          </LinearGradient>
                                        </FlexAnimate>
                                        )
                                      }
                                      {
                                        <View style={{
                                          flex: target.aboveDt ? (10 - (target.additionalDealerUnitsSoldPerc / 10))
                                            : 10
                                        }}
                                        />
                                      }
                                    </View>
                                  </View>
                                </View>
                              </View>
                            </View>

                            {/* Third Row of single bar */}
                            <View style={{ flex: 1, flexDirection: 'row' }}>
                              <View style={{
                                flex: 7,
                                borderRadius: 5,
                                flexDirection: 'row'
                              }}
                              >
                                <View style={{
                                  flex: target.perc > 5
                                    ? (target.perc < 90 ? target.perc / 10 : 8.8) : 0
                                }}
                                >
                                  {/* <Text style={targetGraphStyles.zeroPercentText}>
                                0
                                  </Text> */}
                                </View>

                                <FlexAnimate
                                  duration={1000}
                                  flexValue={target.perc > 5
                                    ? (target.perc < 90 ? 10 - (target.perc / 10) : 1.2) : 0}
                                  style={{
                                    flexDirection: 'row'
                                  }}
                                >
                                  <Text style={targetGraphStyles.percentText}>
                                    {target.showPerc ? target.showPerc : 0}
%
                                    {target.mtd ? ` (${target.mtd} units)` : ''}
                                  </Text>
                                </FlexAnimate>
                              </View>

                              <View style={{
                                flex: 3
                              }}
                              >
                                <View style={{
                                  flex: 1,
                                  borderRadius: 5,
                                  flexDirection: 'row'
                                }}
                                >
                                  {/** 0* */}

                                  {/* flex: 10 - (((target.mt / target.dt) * 100) / 10), */}
                                  <View style={{
                                    flex: target.mt && !target.isTargetEqual ? 7 : 9,
                                    flexDirection: 'row'
                                  }}
                                  >
                                    {/** SOLD Percentage* */}
                                    <Text style={
                                      [
                                        targetGraphStyles.actualPercentage,
                                        {
                                          width: 200,
                                        }
                                      ]}
                                    >
                                      {!target.isTargetEqual ? `${target.firstValue}` : '' }
                                    </Text>

                                    {
                                      target.additionalDealerUnitsSold > 0
                                      && (
                                      <View style={{ flex: 10, flexDirection: 'row' }}>
                                        <View style={{
                                          flex: target.aboveMt
                                            ? target.additionalDealerUnitsSoldPerc / 10 : 10,
                                        }}
                                        />
                                        <View style={{
                                          flex: !target.aboveMt ? 10
                                          - (target.additionalDealerUnitsSoldPerc / 10) : 0
                                        }}
                                        >
                                          <Text style={
                                            [
                                              targetGraphStyles.actualPercentage,
                                              {
                                                width: 100
                                              }
                                            ]}
                                          >
                                            {/* {target.mtd} */}
                                          </Text>
                                        </View>
                                      </View>
                                      )
                                    }
                                  </View>

                                  {/** Manager Target* */}
                                  {/* flex: (((target.mt / target.dt) * 100) / 10), */}
                                  <View style={{
                                    flex: target.mt && !target.isTargetEqual ? 3 : 1,
                                    borderRadius: 5,
                                    flexDirection: 'row'
                                  }}
                                  >
                                    {/* Dealer Target */}
                                    <Text style={[targetGraphStyles.secondaryTargetActuals]}>
                                      {target.secondValue}
                                    </Text>
                                  </View>
                                </View>
                              </View>
                            </View>
                          </View>
                        </View>
                      );
                    })
                  }
          </View>
        </View>
      </View>);
  }
}

