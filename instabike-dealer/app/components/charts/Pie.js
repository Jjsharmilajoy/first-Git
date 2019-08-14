import React from 'react';
import { StyleSheet, View, processColor } from 'react-native';
import PropTypes from 'prop-types';
import { SafeAreaView } from 'react-navigation';
import { PieChart } from 'react-native-charts-wrapper';

const defaultStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  chart: {
    flex: 1
  }
});

export default class PieChartScreen extends React.Component {
  static propTypes = {
    data: PropTypes.object.isRequired,
    style: PropTypes.object,
    chartBackgroundColor: PropTypes.any,
    highlights: PropTypes.object,
    legend: PropTypes.object,
    entryLabelColor: PropTypes.any,
    entryLabelTextSize: PropTypes.number,
    drawEntryLabels: PropTypes.bool,
    drawGridBackground: PropTypes.object,
    noDataText: PropTypes.string,
    labelCountForce: PropTypes.bool,
    usePercentValues: PropTypes.bool,
    centerTextRadiusPercent: PropTypes.number,
    holeRadius: PropTypes.number,
    holeColor: PropTypes.string,
    transparentCircleRadius: PropTypes.any,
    transparentCircleColor: PropTypes.any,
    maxAngle: PropTypes.object,
    onSelect: PropTypes.func,
    onChange: PropTypes.func,
  }

  static defaultProps = {
    style: null,
    chartBackgroundColor: null,
    highlights: null,
    legend: null,
    entryLabelColor: null,
    entryLabelTextSize: null,
    drawEntryLabels: null,
    drawGridBackground: null,
    noDataText: null,
    labelCountForce: null,
    usePercentValues: null,
    centerTextRadiusPercent: null,
    holeRadius: null,
    holeColor: null,
    transparentCircleRadius: null,
    transparentCircleColor: null,
    maxAngle: null,
    onSelect: null,
    onChange: null,
  }

  // eslint-disable-next-line
  static getDerivedStateFromProps(nextProps, prevState) {
    const data = JSON.parse(JSON.stringify(prevState.data));
    if (nextProps.data) {
      data.dataSets[0].values = nextProps.data.values;
      return {
        data
      };
    }
    return null;
  }

  constructor(props) {
    super(props);

    this.state = {
      legend: {
        enabled: false,
        textSize: 15,
        form: 'CIRCLE',
        position: 'BOTTOM_OF_CHART',
        wordWrapEnabled: true
      },
      data: {
        dataSets: [{
          values: this.props.data.values,
          label: '',
          config: {
            colors: [...(() => this.props.data.colors.map(color => processColor(color)))()],
            valueTextSize: 0,
            valueTextColor: processColor('black'),
            sliceSpace: 2,
            selectionShift: 1
          }
        }],
      },
      highlights: [{ x: 2 }],
      description: {
        text: '',
        textSize: 15,
        textColor: processColor('darkgray')
      }
    };
  }

  handleSelect = () => {
    /** need to use
    const entry = event.nativeEvent;
    if (entry == null) {
      this.setState({ selectedEntry: null });
    } else {
      this.setState({ selectedEntry: JSON.stringify(entry) });
    } * */
  }

  render() {
    const {
      style,
      chartBackgroundColor,
      highlights,
      legend,
      entryLabelColor,
      entryLabelTextSize,
      drawEntryLabels,
      drawGridBackground,
      noDataText,
      labelCountForce,
      usePercentValues,
      centerTextRadiusPercent,
      holeRadius,
      holeColor,
      transparentCircleRadius,
      transparentCircleColor,
      maxAngle,
      onSelect,
      onChange
    } = this.props;
    const { styledCenterText } = this.props.data;
    return (
      <SafeAreaView style={{ flex: 1 }}>
        {/* For Docs ==> https://github.com/wuxudong/react-native-charts-wrapper/blob/master/docs.md */}
        <View style={defaultStyles.container}>
          <PieChart
            style={style || defaultStyles.chart}
            chartBackgroundColor={chartBackgroundColor || processColor('white')}
            chartDescription={this.state.description}
            data={this.state.data}
            highlights={highlights || this.state.highlights}
            legend={legend || this.state.legend}
            entryLabelColor={entryLabelColor || processColor('black')}
            entryLabelTextSize={entryLabelTextSize || 20}
            drawEntryLabels={drawEntryLabels || false}
            animation={{
              durationX: 500,
              durationY: 500,
              easingX: 500,
              easingY: 500
            }}
            drawBorders
            drawGridBackground={drawGridBackground || false}
            borderColor={processColor('black')}
            borderWidth={2}
            dragEnabled
            noDataText={noDataText || 'No Data Available'}
            rotationEnabled
            rotationAngle={45}
            labelCountForce={labelCountForce || false}
            usePercentValues={usePercentValues || false}
            styledCenterText={styledCenterText || { text: '60', color: processColor('black'), size: 50 }}
            centerTextRadiusPercent={centerTextRadiusPercent || 50}
            holeRadius={holeRadius || 80}
            holeColor={holeColor || processColor('white')}
            transparentCircleRadius={transparentCircleRadius || 150}
            transparentCircleColor={transparentCircleColor || processColor('white')}
            maxAngle={maxAngle || 360}
            onSelect={event => {
              if (onSelect) {
                onSelect();
              } else this.handleSelect(event);
            }}
            onChange={event => {
              if (onChange) onChange(event);
            }}
          />
        </View>
      </SafeAreaView>
    );
  }
}
