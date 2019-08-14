import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FlatList, ActivityIndicator } from 'react-native';

class PaginatedFlatlist extends Component {
  static propTypes = {
    numberOfVisibleItems: PropTypes.number,
    numColumns: PropTypes.number,
    horizontal: PropTypes.bool,
    data: PropTypes.array.isRequired,
    extraData: PropTypes.bool.isRequired,
    keyExtractor: PropTypes.func.isRequired,
    renderItem: PropTypes.func.isRequired,
    style: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.array,
    ]),
  }

  static defaultProps = {
    numColumns: 1,
    style: null,
    numberOfVisibleItems: 1,
    horizontal: false
  }

  constructor(props) {
    super(props);
    this.state = {
      extraData: this.props.extraData,
      localData: [],
      data: [...this.props.data],
      totalPages: parseInt((this.props.data && this.props.data.length > 0
        ? this.props.data.length : 0) / this.props.numberOfVisibleItems, 10),
      page: 1,
      refreshing: false
    };
  }

  feed = () => {
    const {
      totalPages, page, data
    } = this.state;
    if (page <= totalPages) {
      const value = data.slice(((page - 1) * this.props.numberOfVisibleItems), page * this.props.numberOfVisibleItems);
      this.setState({
        localData: [...this.state.localData, ...value],
        refreshing: false
      });
    } else {
      this.setState({
        localData: [...data],
        refreshing: false
      });
    }
  }

  componentDidMount() {
    this.feed();
  }

  componentDidUpdate() {
    if (this.props.extraData !== this.state.extraData) {
      /**
       * Updating data when list is refreshed.
       */
      // eslint-disable-next-line
      this.setState({
        extraData: this.props.extraData,
        localData: [],
        data: this.props.data,
        totalPages: parseInt((this.props.data && this.props.data.length > 0
          ? this.props.data.length : 0) / this.props.numberOfVisibleItems, 10),
        page: 1,
        refreshing: false
      }, () => this.feed());
    }
  }

  _onRefresh = () => {
    const { page, totalPages } = this.state;
    if (page < totalPages + 1) {
      const pageNumber = page + 1;
      this.setState({ refreshing: true, page: pageNumber }, () => {
        this.feed();
      });
    } else {
      this.setState({ refreshing: false });
    }
  }

  render() {
    const {
      keyExtractor, renderItem, style, extraData, numColumns, horizontal
    } = this.props;
    const { refreshing, localData } = this.state;
    return (
      <React.Fragment>
        <FlatList
          numColumns={numColumns}
          style={style}
          data={localData}
          horizontal={horizontal}
          extraData={extraData}
          keyExtractor={keyExtractor}
          renderItem={({ item }) => renderItem(item)}
          refreshing={refreshing}
          onEndReached={this._onRefresh}
          />
        { refreshing &&
          <ActivityIndicator size="large" color="#aaa9a9" />
        }
      </React.Fragment>
    );
  }
}

export default PaginatedFlatlist;
