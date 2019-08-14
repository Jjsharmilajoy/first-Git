
import React, { Component } from 'react';
import {
  StyleSheet,
  ListView,
  Image,
  View,
  Text,
  TouchableOpacity,
  ScrollView
} from 'react-native';

const defaultCircleSize = 16;
const defaultCircleColor = '#007AFF';
const defaultLineWidth = 2;
const defaultLineColor = '#007AFF';
const defaultTimeTextColor = 'black';
const defaultDotColor = 'white';
const defaultInnerCircle = 'none';

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  listview: {
    flex: 1
  },
  sectionHeader: {
    marginBottom: 15,
    backgroundColor: '#007AFF',
    height: 30,
    justifyContent: 'center'
  },
  sectionHeaderText: {
    color: '#FFF',
    fontSize: 18,
    alignSelf: 'center'
  },
  rowContainer: {
    flexDirection: 'row',
    flex: 1,
    // alignItems: 'stretch',
    justifyContent: 'center'
  },
  timeContainer: {
    minWidth: 45
  },
  time: {
    textAlign: 'right',
    color: defaultTimeTextColor
  },
  circle: {
    width: 16,
    height: 16,
    borderRadius: 10,
    position: 'absolute',
    left: -8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: defaultDotColor
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  details: {
    borderLeftWidth: defaultLineWidth,
    flexDirection: 'column',
    flex: 1,
    paddingBottom: 20
  },
  detail: { },
  description: {
    // marginTop: 10
  },
  separator: {
    height: 1,
    backgroundColor: '#aaa',
    marginTop: 10,
    marginBottom: 10
  }
});

const ds = new ListView.DataSource({
  rowHasChanged: (r1, r2) => r1 !== r2,
  sectionHeaderHasChanged: (s1, s2) => s1 !== s2
});

export default class Timeline extends Component {
  constructor(props, context) {
    super(props, context);
    this._renderRow = this._renderRow.bind(this);
    this.renderTime = (this.props.renderTime
      ? this.props.renderTime
      : this._renderTime
    ).bind(this);
    this.renderDetail = (this.props.renderDetail
      ? this.props.renderDetail
      : this._renderDetail
    ).bind(this);
    this.renderCircle = (this.props.renderCircle
      ? this.props.renderCircle
      : this._renderCircle
    ).bind(this);
    this.renderEvent = this._renderEvent.bind(this);

    this.state = {
      data: this.props.data,
      dataSource: ds.cloneWithRows(this.props.data),
      x: 0,
      width: 0
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      data: nextProps.data,
      dataSource: ds.cloneWithRows(nextProps.data)
    });
  }

  _renderRow(rowData, sectionID, rowID) {
    let content = null;

    switch (this.props.columnFormat) {
      case 'single-column-left':
        content = (
          
          <ScrollView horizontal contentContainerStyle={[styles.rowContainer, this.props.rowContainerStyle]}>
            {this.renderTime(rowData, sectionID, rowID)}
            {this.renderEvent(rowData, sectionID, rowID)}
            {this.renderCircle(rowData, sectionID, rowID)}
          </ScrollView>
        );
        break;
      case 'single-column-right':
        content = (
          <View style={[styles.rowContainer, this.props.rowContainerStyle]}>
            {this.renderEvent(rowData, sectionID, rowID)}
            {this.renderTime(rowData, sectionID, rowID)}
            {this.renderCircle(rowData, sectionID, rowID)}
          </View>
        );
        break;
      case 'two-column':
        content = rowID % 2 === 0 ? (
          <View style={[styles.rowContainer, this.props.rowContainerStyle]}>
            {this.renderTime(rowData, sectionID, rowID)}
            {this.renderEvent(rowData, sectionID, rowID)}
            {this.renderCircle(rowData, sectionID, rowID)}
          </View>
        ) : (
          <View style={[styles.rowContainer, this.props.rowContainerStyle]}>
            {this.renderEvent(rowData, sectionID, rowID)}
            {this.renderTime(rowData, sectionID, rowID)}
            {this.renderCircle(rowData, sectionID, rowID)}
          </View>
        );
        break;
      default:
        break;
    }
    return <View key={rowID}>{content}</View>;
  }

  _renderTime(rowData, sectionID, rowID) {
    if (!this.props.showTime) {
      return null;
    }
    let timeWrapper = null;
    switch (this.props.columnFormat) {
      case 'single-column-left':
        timeWrapper = {
          alignItems: 'flex-end'
        };
        break;
      case 'single-column-right':
        timeWrapper = {
          alignItems: 'flex-start'
        };
        break;
      case 'two-column':
        timeWrapper = {
          flex: 1,
          alignItems: rowID % 2 === 0 ? 'flex-end' : 'flex-start'
        };
        break;
      default:
        break;
    }
    return (
      <View style={timeWrapper}>
        <View style={[styles.timeContainer, this.props.timeContainerStyle]}>
          <Text style={[styles.time, this.props.timeStyle]}>
            {rowData.time}
          </Text>
        </View>
      </View>
    );
  }

  _renderEvent(rowData, sectionID, rowID) {
    const lineWidth = rowData.lineWidth
      ? rowData.lineWidth
      : this.props.lineWidth;
    const isLast = this.props.renderFullLine
      ? !this.props.renderFullLine
      : this.state.data.slice(-1)[0] === rowData;
    const lineColor = isLast
      ? 'rgba(0,0,0,0)'
      : rowData.lineColor ? rowData.lineColor : this.props.lineColor;
    let opStyle = null;

    switch (this.props.columnFormat) {
      case 'single-column-left':
        opStyle = {
          borderColor: lineColor,
          borderLeftWidth: lineWidth,
          borderRightWidth: 0,
          marginLeft: 20,
          paddingLeft: 20
        };
        break;
      case 'single-column-right':
        opStyle = {
          borderColor: lineColor,
          borderLeftWidth: 0,
          borderRightWidth: lineWidth,
          marginRight: 20,
          paddingRight: 20
        };
        break;
      case 'two-column':
        opStyle = rowID % 2 === 0
          ? {
            borderColor: lineColor,
            borderLeftWidth: lineWidth,
            borderRightWidth: 0,
            marginLeft: 20,
            paddingLeft: 20
          }
          : {
            borderColor: lineColor,
            borderLeftWidth: 0,
            borderRightWidth: lineWidth,
            marginRight: 20,
            paddingRight: 20
          };
        break;
      default:
        break;
    }

    return (
      <View
        style={[styles.details, opStyle]}
        onLayout={evt => {
          if (!this.state.x && !this.state.width) {
            const { x, width } = evt.nativeEvent.layout;
            this.setState({ x, width });
          }
        }}
      >
        <TouchableOpacity
          disabled={this.props.onEventPress === null}
          style={[this.props.detailContainerStyle]}
          onPress={() => this.props.onEventPress ? this.props.onEventPress(rowData) : null
          }
        >
          <View style={styles.detail}>
            {this.renderDetail(rowData, sectionID, rowID)}
          </View>
          {this._renderSeparator()}
        </TouchableOpacity>
      </View>
    );
  }

  _renderDetail(rowData) {
    const title = rowData.description ? (
      <View>
        <Text style={[styles.title, this.props.titleStyle]}>
          {rowData.title}
        </Text>
        <Text style={[styles.description, this.props.descriptionStyle]}>
          {rowData.description}
        </Text>
      </View>
    ) : (
      <Text style={[styles.title, this.props.titleStyle]}>{rowData.title}</Text>
    );
    return <View style={styles.container}>{title}</View>;
  }

  _renderCircle(rowData) {
    const circleSize = rowData.circleSize
      ? rowData.circleSize
      : this.props.circleSize ? this.props.circleSize : defaultCircleSize;
    const circleColor = rowData.circleColor
      ? rowData.circleColor
      : this.props.circleColor ? this.props.circleColor : defaultCircleColor;
    const lineWidth = rowData.lineWidth
      ? rowData.lineWidth
      : this.props.lineWidth ? this.props.lineWidth : defaultLineWidth;

    let circleStyle = null;

    switch (this.props.columnFormat) {
      case 'single-column-left':
        circleStyle = {
          width: this.state.x ? circleSize : 0,
          height: this.state.x ? circleSize : 0,
          borderRadius: circleSize / 2,
          backgroundColor: circleColor,
          left: this.state.x - ((circleSize / 2) + ((lineWidth - 1) / 2))
        };
        break;
      case 'single-column-right':
        circleStyle = {
          width: this.state.width ? circleSize : 0,
          height: this.state.width ? circleSize : 0,
          borderRadius: circleSize / 2,
          backgroundColor: circleColor,
          left: this.state.width - ((circleSize / 2) + ((lineWidth - 1) / 2))
        };
        break;
      case 'two-column':
        circleStyle = {
          width: this.state.width ? circleSize : 0,
          height: this.state.width ? circleSize : 0,
          borderRadius: circleSize / 2,
          backgroundColor: circleColor,
          left: this.state.width - ((circleSize / 2) + ((lineWidth - 1) / 2))
        };
        break;
      default:
        break;
    }

    let innerCircle = null;
    switch (this.props.innerCircle) {
      case 'icon':
        innerCircle = (
          <Image
            source={rowData.icon || this.props.icon}
            style={[{
              height: circleSize,
              width: circleSize
            }, this.props.iconStyle]}
          />
        );
        break;
      case 'dot':
        innerCircle = (
          <View style={[styles.dot, {
            height: circleSize / 2,
            width: circleSize / 2,
            borderRadius: circleSize / 4,
            backgroundColor: rowData.dotColor
              ? rowData.dotColor
              : this.props.dotColor ? this.props.dotColor : defaultDotColor
          }]} />
        );
        break;
      default:
        break;
    }
    return (
      <View style={[styles.circle, circleStyle, this.props.circleStyle]}>
        {innerCircle}
      </View>
    );
  }

  _renderSeparator() {
    if (!this.props.separator) {
      return null;
    }
    return <View style={[styles.separator, this.props.separatorStyle]} />;
  }

  render() {
    return (
      <View style={[styles.container, this.props.style]}>
        <ListView
          // eslint-disable-next-line react/no-string-refs
          ref="listView"
          style={[styles.listview, this.props.listViewStyle]}
          dataSource={this.state.dataSource}
          renderRow={this._renderRow}
          automaticallyAdjustContentInsets={false}
          {...this.props.options}
        />
      </View>
    );
  }
}

Timeline.defaultProps = {
  circleSize: defaultCircleSize,
  circleColor: defaultCircleColor,
  lineWidth: defaultLineWidth,
  lineColor: defaultLineColor,
  innerCircle: defaultInnerCircle,
  columnFormat: 'single-column-left',
  separator: false,
  showTime: true
};
