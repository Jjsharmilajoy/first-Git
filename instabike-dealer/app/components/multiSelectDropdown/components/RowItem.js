import React, { Component } from 'react';
import {
  View,
  Platform,
  UIManager,
  LayoutAnimation,
  FlatList,
  StyleSheet
} from 'react-native';
import RowSubItem from './RowSubItem';

class RowItem extends Component {
  constructor(props) {
    super(props);
    if (Platform.OS === 'android') {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
    this.state = {
      showSubCategories: false,
      subToggled: null,
    };
  }

  componentDidMount() {
    this._expandDropDowns();
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.selectedItems !== this.props.selectedItems) {
      if (this.props.selectedItems.includes(this.props.item[this.props.uniqueKey]) &&
        !nextProps.selectedItems.includes(this.props.item[this.props.uniqueKey])) {
        return true;
      }
      if (!this.props.selectedItems.includes(this.props.item[this.props.uniqueKey]) &&
        nextProps.selectedItems.includes(this.props.item[this.props.uniqueKey])) {
        return true;
      }

      if (this.state.subToggled !== nextState.subToggled) {
        return true;
      }
    }

    if (this.props.searchTerm !== nextProps.searchTerm) {
      return true;
    }
    if (this.state.showSubCategories !== nextState.showSubCategories) {
      return true;
    }
    if (this.props.mergedStyles !== nextProps.mergedStyles) {
      return true;
    }
    return false;
  }

  _itemSelected = item => {
    const { uniqueKey, selectedItems } = this.props;
    return selectedItems.includes(item[uniqueKey]);
  }

  _toggleItem = (item, hasChildren) => {
    this.props._toggleItem(item, hasChildren);
  }

  _toggleSubItem = item => {
    const { uniqueKey } = this.props;
    const { subToggled } = this.state;
    // we are only concerned about
    // triggering shouldComponentUpdate
    if (subToggled === item[uniqueKey]) {
      this.setState({ subToggled: false });
    } else {
      this.setState({ subToggled: item[uniqueKey] });
    }
    this.props._toggleItem(item, false);
  }

  _expandDropDowns = () => {
    const { expandDropDowns } = this.props;
    if (expandDropDowns) {
      this.setState({ showSubCategories: true });
    }
  }

  _toggleDropDown = () => {
    const { customLayoutAnimation, animateDropDowns } = this.props;
    const animation = customLayoutAnimation || LayoutAnimation.Presets.easeInEaseOut;
    if (animateDropDowns) LayoutAnimation.configureNext(animation);
    this.setState({ showSubCategories: !this.state.showSubCategories });
  }

  _showSubCategoryDropDown = () => {
    const { showDropDowns, searchTerm } = this.props;
    if (searchTerm.length) {
      return true;
    }
    if (showDropDowns) {
      return this.state.showSubCategories;
    }

    return true;
  }

  _dropDownOrToggle = () => {
    const {
      readOnlyHeadings,
      showDropDowns,
      subKey,
      item,
    } = this.props;

    const hasChildren = !!(item[subKey] && item[subKey].length);

    if (readOnlyHeadings && item[subKey] && showDropDowns) {
      this._toggleDropDown();
    } else if (!readOnlyHeadings) {
      this._toggleItem(item, hasChildren);
    }
  }

  _renderSubItemFlatList = ({ item }) => (
    <RowSubItem
      _toggleSubItem={this._toggleSubItem}
      subItem={item}
      highlightedChildren={this.props.highlightedChildren}
      {...this.props}
    />
  )

  _renderSubSeparator = () => (
    <View
      style={[{
        flex: 1,
        height: StyleSheet.hairlineWidth,
        alignSelf: 'stretch',
        backgroundColor: '#dadada',
      }, this.props.mergedStyles.subSeparator]}
    />
  )

  render() {
    const {
      item,
      uniqueKey,
      subKey,
      selectedItems
    } = this.props;
    return (
      <View>
        { item[subKey] && this._showSubCategoryDropDown() &&
          <FlatList
            keyExtractor={i => `${i[uniqueKey]}`}
            data={item[subKey]}
            extraData={selectedItems}
            ItemSeparatorComponent={this._renderSubSeparator}
            renderItem={this._renderSubItemFlatList}
            />
        }
      </View>
    );
  }
}

export default RowItem;
