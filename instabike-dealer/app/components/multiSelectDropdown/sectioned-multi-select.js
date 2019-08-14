/**
 * The SectionedMultiSelect Component is the same as that of
 * 'react-native-sectioned-multi-select' npm module.
 *
 * For further reference visit https://github.com/renrizzolo/react-native-sectioned-multi-select
 */

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  View,
  TouchableOpacity,
  TouchableNativeFeedback,
  TouchableWithoutFeedback,
  Text,
  TextInput,
  Platform,
  Modal,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { isEqual } from 'lodash';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { RowItem } from './components';

const Touchable = Platform.OS === 'android' ? TouchableNativeFeedback : TouchableOpacity;

const defaultStyles = {
  container: {

  },
  selectToggle: {
    marginTop: 5,
    marginBottom: 15,
    paddingHorizontal: 10,
    paddingVertical: 12,
    borderRadius: 4,
  },
  selectToggleText: {

  },
  item: {
  },
  subItem: {
  },
  itemText: {
    fontSize: 17,
  },
  subItemText: {
    fontSize: 15,
    paddingLeft: 8,
  },
  searchBar: {
    backgroundColor: '#f8f8f8',
    flexDirection: 'row',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  separator: {

  },
  subSeparator: {
    height: 0,
  },
  chipContainer: {

  },
  chipText: {

  },
  chipIcon: {

  },
  searchTextInput: {

  },
  scrollView: {

  },
  button: {

  },
  cancelButton: {

  },
  confirmText: {

  },
  cancelText: {

  },
  toggleIcon: {

  },
  selectedItem: {

  },
};

const defaultColors = {
  primary: '#3f51b5',
  success: '#4caf50',
  text: '#2e2e2e',
  subText: '#848787',
  selectToggleTextColor: '#333',
  searchPlaceholderTextColor: '#999',
  searchSelectionColor: 'rgba(0,0,0,0.2)',
  chipColor: '#848787',
  itemBackground: '#fff',
  subItemBackground: '#ffffff',
  disabled: '#d7d7d7',
};

const noResults = <Text>Sorry, no results</Text>;

const loading = (
  <View style={{ marginTop: 20, alignItems: 'center', justifyContent: 'center' }}>
    <ActivityIndicator />
  </View>
);

// let date = new Date()
class SectionedMultiSelect extends PureComponent {
  static propTypes = {
    single: PropTypes.bool,
    selectedItems: PropTypes.array,
    items: PropTypes.array.isRequired,
    displayKey: PropTypes.string,
    uniqueKey: PropTypes.string.isRequired,
    onSelectedItemsChange: PropTypes.func.isRequired,
    showDropDowns: PropTypes.bool,
    showChips: PropTypes.bool,
    readOnlyHeadings: PropTypes.bool,
    selectText: PropTypes.string,
    selectedText: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.func,
    ]),
    confirmText: PropTypes.string,
    styles: PropTypes.oneOfType([
      PropTypes.array,
      PropTypes.object,
    ]),
    cancelText: PropTypes.string,
    colors: PropTypes.objectOf(PropTypes.string),
    searchPlaceholderText: PropTypes.string,
    noResultsComponent: PropTypes.object,
    loadingComponent: PropTypes.object,
    subItemFontFamily: PropTypes.object,
    itemFontFamily: PropTypes.object,
    searchTextFontFamily: PropTypes.object,
    confirmFontFamily: PropTypes.object,
    showRemoveAll: PropTypes.bool,
    removeAllText: PropTypes.string,
    modalSupportedOrientations: PropTypes.arrayOf(PropTypes.string),
    modalAnimationType: PropTypes.string,
    hideSearch: PropTypes.bool,
    selectChildren: PropTypes.bool,
    highlightChildren: PropTypes.bool,
    itemNumberOfLines: PropTypes.number,
    selectLabelNumberOfLines: PropTypes.number,
    showCancelButton: PropTypes.bool,
    hideSelect: PropTypes.bool,
    alwaysShowSelectText: PropTypes.bool,
    expandDropDowns: PropTypes.bool,
    animateDropDowns: PropTypes.bool,
    filterItems: PropTypes.func,
    disabled: PropTypes.bool
  }

  static defaultProps = {
    disabled: false,
    single: false,
    selectedItems: [],
    displayKey: 'name',
    showDropDowns: true,
    showChips: false,
    readOnlyHeadings: false,
    selectText: 'Select',
    selectedText: 'selected',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    searchPlaceholderText: 'Search ...',
    noResultsComponent: noResults,
    loadingComponent: loading,
    styles: {},
    colors: {},
    itemFontFamily: { fontFamily: Platform.OS === 'android' ? 'normal' : 'Avenir', fontWeight: 'bold' },
    subItemFontFamily: { fontFamily: Platform.OS === 'android' ? 'normal' : 'Avenir', fontWeight: '200' },
    searchTextFontFamily: { fontFamily: Platform.OS === 'android' ? 'normal' : 'Avenir', fontWeight: '200' },
    confirmFontFamily: { fontFamily: Platform.OS === 'android' ? 'normal' : 'Avenir', fontWeight: 'bold' },
    removeAllText: 'Remove all',
    showRemoveAll: false,
    modalSupportedOrientations: ['portrait', 'landscape'],
    modalAnimationType: 'fade',
    hideSearch: false,
    selectChildren: false,
    highlightChildren: false,
    itemNumberOfLines: null,
    selectLabelNumberOfLines: 1,
    showCancelButton: false,
    hideSelect: false,
    alwaysShowSelectText: false,
    expandDropDowns: false,
    animateDropDowns: true,
    filterItems: null,
  }

  constructor(props) {
    super(props);

    this.state = {
      selector: false,
      searchTerm: '',
      highlightedChildren: [],
      styles: StyleSheet.flatten([defaultStyles, props.styles]),
      colors: StyleSheet.flatten([defaultColors, props.colors])
    };
  }

  componentWillReceiveProps(nextProps) {
    if (!isEqual(this.props.styles, nextProps.styles)) {
      this.setState({ styles: StyleSheet.flatten([defaultStyles, nextProps.styles]) });
    }
    if (!isEqual(this.props.colors, nextProps.colors)) {
      this.setState({ colors: StyleSheet.flatten([defaultColors, nextProps.colors]) });
    }
  }

  getProp = (object, key) => object && object[key]

  rejectProp = (items, fn) => items.filter(fn)

  find = (id, items) => {
    if (!items) {
      return {};
    }
    const { uniqueKey, subKey } = this.props;
    let i = 0;
    let found;
    for (; i < items.length; i += 1) {
      if (items[i][uniqueKey] === id) {
        return items[i];
      } if (Array.isArray(items[i][subKey])) {
        found = this.find(id, items[i][subKey]);
        if (found) {
          return found;
        }
      }
    }
  }

  reduceSelected = (array, toSplice) => {
    const { uniqueKey } = this.props;
    array.forEach(curr => {
      if (toSplice.includes(curr[uniqueKey])) {
        toSplice.splice(toSplice.findIndex(el => (
          el === curr[uniqueKey]
        )), 1);
      }
    });
    return toSplice;
  }

  _getSelectLabel = () => {
    const {
      selectText,
      selectedText,
      single,
      selectedItems,
      displayKey,
      alwaysShowSelectText,
      renderSelectText,
    } = this.props;

    if (renderSelectText) {
      return renderSelectText(this.props);
    }

    if (!single && alwaysShowSelectText) {
      return selectText;
    }
    if (!selectedItems || selectedItems.length === 0) {
      return selectText;
    } if (single || selectedItems.length === 1) {
      const item = selectedItems[0];
      const foundItem = this._findItem(item);
      return this.getProp(foundItem, displayKey) || selectText;
    }
    return `${selectText} (${selectedItems.length} ${selectedText})`;
  }

  _filterItems = searchTerm => {
    const {
      items,
      subKey,
      uniqueKey,
      displayKey,
      filterItems,
    } = this.props;

    if (filterItems) {
      return filterItems(searchTerm, items, this.props);
    }
    let filteredItems = [];
    let newFilteredItems = [];

    items.forEach(item => {
      const parts = searchTerm.trim().split(/[[ \][)(\\/?\-:]+/);
      const regex = new RegExp(`(${parts.join('|')})`, 'i');
      if (regex.test(this.getProp(item, displayKey))) {
        filteredItems.push(item);
      }
      if (item[subKey]) {
        const newItem = Object.assign({}, item);
        newItem[subKey] = [];
        item[subKey].forEach(sub => {
          if (regex.test(this.getProp(sub, displayKey))) {
            newItem[subKey] = [...newItem[subKey], sub];
            newFilteredItems = this.rejectProp(filteredItems, singleItem => item[uniqueKey] !== singleItem[uniqueKey]);
            newFilteredItems.push(newItem);
            filteredItems = newFilteredItems;
          }
        });
      }
    });

    return filteredItems;
  }

  _removeItem = item => {
    const {
      uniqueKey,
      selectedItems,
      onSelectedItemsChange,
      highlightChildren,
      onSelectedItemObjectsChange,
    } = this.props;

    const newItems = this.rejectProp(selectedItems, singleItem => (
      item[uniqueKey] !== singleItem
    ));

    if (highlightChildren) this._unHighlightChildren(item[uniqueKey]);
    if (onSelectedItemObjectsChange) this._broadcastItemObjects(newItems);

    // broadcast new selected items state to parent component
    onSelectedItemsChange(newItems);
  }

  _removeAllItems = () => {
    const { onSelectedItemsChange, onSelectedItemObjectsChange } = this.props;
    // broadcast new selected items state to parent component
    onSelectedItemsChange([]);
    this.setState({ highlightedChildren: [] });
    if (onSelectedItemObjectsChange) this._broadcastItemObjects([]);
  }

  _toggleSelector = () => {
    this.setState({
      selector: !this.state.selector,
    });
  }

  _closeSelector = () => {
    this.setState({
      selector: false,
      searchTerm: '',
    });
  }

  _submitSelection = () => {
    const { onConfirm } = this.props;
    this._toggleSelector();
    // reset searchTerm
    this.setState({ searchTerm: '' });
    if (onConfirm) onConfirm();
  }

  _cancelSelection = () => {
    const { onCancel } = this.props;
    // this._removeAllItems()
    this._toggleSelector();
    this.setState({ searchTerm: '' });
    if (onCancel) onCancel();
  }

  _itemSelected = item => {
    const { uniqueKey, selectedItems } = this.props;
    return selectedItems.includes(item[uniqueKey]);
  }

  _toggleItem = (item, hasChildren) => {
    const {
      single,
      uniqueKey,
      selectedItems,
      onSelectedItemsChange,
      selectChildren,
      highlightChildren,
      onSelectedItemObjectsChange,
    } = this.props;

    if (single) {
      this._submitSelection();
      onSelectedItemsChange([item[uniqueKey]]);
      if (onSelectedItemObjectsChange) this._broadcastItemObjects([item[uniqueKey]]);
    } else {
      const selected = this._itemSelected(item);
      let newItems = [];
      if (selected) {
        if (hasChildren) {
          if (selectChildren) {
            newItems = [...this._rejectChildren(item[uniqueKey])];

            newItems = this.rejectProp(newItems, singleItem => (
              item[uniqueKey] !== singleItem
            ));
          } else if (highlightChildren) {
            this._unHighlightChildren(item[uniqueKey]);
            newItems = this.rejectProp(selectedItems, singleItem => (
              item[uniqueKey] !== singleItem
            ));
          } else {
            newItems = this.rejectProp(selectedItems, singleItem => (
              item[uniqueKey] !== singleItem
            ));
          }
        } else {
          newItems = this.rejectProp(selectedItems, singleItem => (
            item[uniqueKey] !== singleItem
          ));
        }
      } else {
        newItems = [...selectedItems, item[uniqueKey]];

        if (hasChildren) {
          if (selectChildren) {
            newItems = [...newItems, ...this._selectChildren(item[uniqueKey])];
          } else if (highlightChildren) {
            this._highlightChildren(item[uniqueKey]);
          }
        }
      }
      // broadcast new selected items state to parent component
      onSelectedItemsChange(newItems);
      if (onSelectedItemObjectsChange) this._broadcastItemObjects(newItems);
    }
  }

  _findItem = id => {
    const { items } = this.props;
    return this.find(id, items);
  }

  _highlightChildren = id => {
    const { items, uniqueKey, subKey } = this.props;
    const { highlightedChildren } = this.state;
    const highlighted = [...highlightedChildren];

    let i = 0;
    for (; i < items.length; i += 1) {
      if (items[i][uniqueKey] === id && Array.isArray(items[i][subKey])) {
        items[i][subKey].forEach(sub => {
          if (!highlighted.includes(sub[uniqueKey])) {
            highlighted.push(sub[uniqueKey]);
          }
        });
      }
    }
    this.setState({ highlightedChildren: highlighted });
  }

  _unHighlightChildren = id => {
    const { items, uniqueKey, subKey } = this.props;
    const { highlightedChildren } = this.state;
    const highlighted = [...highlightedChildren];
    const array = items.filter(item => item[uniqueKey] === id);
    if (!array['0']) {
      return;
    }
    if (array['0'] && !array['0'][subKey]) {
      return;
    }
    const newHighlighted = this.reduceSelected(array['0'][subKey], highlighted);
    this.setState({ highlightedChildren: newHighlighted });
  }

  _selectChildren = id => {
    const {
      items,
      selectedItems,
      uniqueKey,
      subKey,
    } = this.props;

    let i = 0;
    const selected = [];
    for (; i < items.length; i += 1) {
      if (items[i][uniqueKey] === id && Array.isArray(items[i][subKey])) {
        items[i][subKey].forEach(sub => {
          if (!selectedItems.includes(sub[uniqueKey])) {
            selected.push(sub[uniqueKey]);
          }
        });
      }
    }

    // so we have them in state for SubRowItem should update checks
    this._highlightChildren(id);
    return selected;
  }

  _rejectChildren = id => {
    const {
      items,
      selectedItems,
      uniqueKey,
      subKey,
    } = this.props;
    const arrayOfChildren = items.filter(item => item[uniqueKey] === id);
    const selected = [...selectedItems];
    if (!arrayOfChildren['0']) {
      return;
    }
    if (arrayOfChildren['0'] && !arrayOfChildren['0'][subKey]) {
      return;
    }

    const newSelected = this.reduceSelected(arrayOfChildren['0'][subKey], selected);

    // update state for SubRowItem component should update checks
    this._unHighlightChildren(id);
    return newSelected;
  }

  _getSearchTerm = () => this.state.searchTerm

  // get the items back as their full objects instead of an array of ids.
  _broadcastItemObjects = newItems => {
    const {
      onSelectedItemObjectsChange,
    } = this.props;

    const fullItems = [];
    newItems.forEach(singleSelectedItem => {
      const item = this._findItem(singleSelectedItem);
      fullItems.push(item);
    });
    onSelectedItemObjectsChange(fullItems);
  }

  _displaySelectedItems = () => {
    const {
      uniqueKey,
      selectedItems,
      displayKey,
      chipRemoveIconComponent,
    } = this.props;
    const { styles, colors } = this.state;
    return selectedItems.map(singleSelectedItem => {
      const item = this._findItem(singleSelectedItem);

      if (!item || !item[displayKey]) return null;

      return (

        <View
          style={[{
            overflow: 'hidden',
            justifyContent: 'center',
            height: 34,
            borderColor: colors.chipColor,
            borderWidth: 1,
            borderRadius: 20,
            flexDirection: 'row',
            alignItems: 'center',
            paddingLeft: 10,
            margin: 3,
            paddingTop: 0,
            paddingRight: 0,
            paddingBottom: 0,
          }, styles.chipContainer]}
          key={item[uniqueKey]}
        >
          <Text
            numberOfLines={1}
            style={[
              {
                color: colors.chipColor,
                fontSize: 13,
                marginRight: 0,
              },
              styles.chipText]}
          >
            {item[displayKey]}
          </Text>
          <TouchableOpacity
            onPress={() => { this._removeItem(item); }}
            style={{
              borderTopRightRadius: 20,
              borderBottomRightRadius: 20,
            }}
          >
            {chipRemoveIconComponent || (
            <Icon
              name="close"
              style={[{
                color: colors.chipColor,
                fontSize: 16,
                marginHorizontal: 6,
                marginVertical: 7,
              }, styles.chipIcon]}
              />
            )}
          </TouchableOpacity>
        </View>
      );
    });
  }

  _renderSeparator = () => (
    <View
      style={[{
        flex: 1,
        height: StyleSheet.hairlineWidth,
        alignSelf: 'stretch',
        backgroundColor: '#fff',
      }, this.state.styles.separator]}
    />
  )

  _renderFooter = () => {
    const { footerComponent } = this.props;
    return (
      <View>
        {footerComponent && footerComponent}
      </View>
    );
  }

  _renderItemFlatList = ({ item }) => {
    const { styles, colors } = this.state;

    const { searchTerm } = this.state;
    return (
      <View>
        <RowItem
          item={item}
          mergedStyles={styles}
          mergedColors={colors}
          _itemSelected={this._itemSelected}
          searchTerm={searchTerm}
          _toggleItem={this._toggleItem}
          highlightedChildren={this.state.highlightedChildren}
          {...this.props}
        />
      </View>
    );
  }

  render() {
    const {
      items,
      selectedItems,
      uniqueKey,
      confirmText,
      cancelText,
      searchPlaceholderText,
      noResultsComponent,
      loadingComponent,
      searchTextFontFamily,
      confirmFontFamily,
      single,
      showChips,
      removeAllText,
      showRemoveAll,
      modalAnimationType,
      modalSupportedOrientations,
      hideSearch,
      selectToggleIconComponent,
      searchIconComponent,
      showCancelButton,
      hideSelect,
      headerComponent,
      searchAdornment,
      selectLabelNumberOfLines,
      disabled
    } = this.props;

    const {
      searchTerm,
      selector,
      styles,
      colors,
    } = this.state;
    const renderItems = searchTerm ? this._filterItems(searchTerm.trim()) : items;
    const confirmFont = confirmFontFamily.fontFamily && confirmFontFamily;
    const searchTextFont = searchTextFontFamily.fontFamily && searchTextFontFamily;
    return (
      <View>
        <Modal
          supportedOrientations={modalSupportedOrientations}
          animationType={modalAnimationType}
          transparent
          visible={selector}
          onRequestClose={this._closeSelector}
        >
          <View style={[{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }, styles.backdrop]}>
            <View style={[{
              marginBottom: 20,
              borderRadius: 6,
              alignSelf: 'center',
              flex: 1,
              backgroundColor: 'white',
            }, styles.container]}
            >
              {headerComponent && headerComponent}
              {!hideSearch
                && (
                <View style={[{ flexDirection: 'row', paddingVertical: 5 }, styles.searchBar]}>
                  <View style={styles.center}>
                    {searchIconComponent || (
                    <Icon
                      name="search"
                      size={18}
                      style={{ marginHorizontal: 15 }}
                      />
                    )}
                  </View>
                  <TextInput
                    selectionColor={colors.searchSelectionColor}
                    onChangeText={() => this.setState({ searchTerm })}
                    placeholder={searchPlaceholderText}
                    selectTextOnFocus
                    placeholderTextColor={colors.searchPlaceholderTextColor}
                    underlineColorAndroid="transparent"
                    style={[{
                      flex: 1,
                      fontSize: 17,
                      paddingVertical: 8,
                    },
                    searchTextFont,
                    styles.searchTextInput,
                    ]}
                  />
                  {searchAdornment && searchAdornment(searchTerm)}
                </View>
                )
              }

              <View style={[{ margin: 20, flex: 1 }, styles.scrollView]}>
                {(items && items.length)
                  ? (
                    <View>
                      {renderItems.length
                        ? (
                          <FlatList
                            removeClippedSubviews
                            initialNumToRender={5}
                            data={renderItems}
                            extraData={selectedItems}
                            keyExtractor={item => `${item[uniqueKey]}`}
                            ItemSeparatorComponent={this._renderSeparator}
                            ListFooterComponent={this._renderFooter}
                            renderItem={this._renderItemFlatList}
                      />
                        )
                        : (
                          <View>
                            {noResultsComponent}
                          </View>
                        )
                    }
                    </View>
                  )
                  : (
                    <View>
                      {loadingComponent}
                    </View>
                  )
                }
              </View>
              <View style={{ flexDirection: 'row' }}>
                {/*                 {showCancelButton &&
                  <Touchable
                    accessibilityComponentType="button"
                    onPress={this._cancelSelection}
                    >
                    <View
                      style={[{
                        width: 54,
                        flex: Platform.OS === 'android' ? 0 : 1,
                        alignItems: 'center',
                        justifyContent: 'center',
                        paddingVertical: 8,
                        paddingHorizontal: 16,
                        borderRadius: 0,
                        flexDirection: 'row',
                        backgroundColor: colors.cancel,
                      },
                      styles.cancelButton,
                      ]}
                    >
                      {cancelIconComponent || <Icon
                        size={24}
                        name="cancel"
                        style={{ color: 'white' }}
                        />}
                    </View>
                  </Touchable>
                } */}
                {
                  showCancelButton
                  && (
                  <Touchable
                    accessibilityComponentType="button"
                    onPress={this._cancelSelection}
                    style={{ flex: 1 }}
                    >
                    <View
                      style={[{
                        flex: Platform.OS === 'android' ? 1 : 0,
                        alignItems: 'center',
                        justifyContent: 'center',
                        paddingVertical: 8,
                        paddingHorizontal: 16,
                        borderRadius: 0,
                        flexDirection: 'row',
                        backgroundColor: colors.primary,
                      },
                      styles.button,
                      ]}
                  >
                      <Text style={[{ fontSize: 18, color: '#ffffff' }, confirmFont, styles.confirmText]}>
                        {cancelText}
                      </Text>
                    </View>
                  </Touchable>
                  )
                }
                {
                  !single
                  && (
                  <Touchable
                    accessibilityComponentType="button"
                    onPress={this._submitSelection}
                    style={{ flex: 1 }}
                    >
                    <View
                      style={[{
                        flex: Platform.OS === 'android' ? 1 : 0,
                        alignItems: 'center',
                        justifyContent: 'center',
                        paddingVertical: 8,
                        paddingHorizontal: 16,
                        borderRadius: 0,
                        flexDirection: 'row',
                        backgroundColor: colors.primary,
                      },
                      styles.button,
                      ]}
                  >
                      <Text style={[{ fontSize: 18, color: '#ffffff' }, confirmFont, styles.confirmText]}>
                        {confirmText}
                      </Text>
                    </View>
                  </Touchable>
                  )
                }
              </View>
            </View>
          </View>
        </Modal>
        {!hideSelect
          && (
          <TouchableWithoutFeedback
            disabled={disabled}
            onPress={this._toggleSelector}>
            <View
              style={[{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                borderBottomColor: '#a4a4a4',
                borderBottomWidth: 1,
              }, styles.selectToggle]}
            >
              <Text
                disabled={disabled}
                numberOfLines={selectLabelNumberOfLines}
                style={[{
                  flex: 1,
                  fontSize: 16,
                  color: colors.selectToggleTextColor,
                }, styles.selectDropdownTextField]}
              >
                {this._getSelectLabel()}
              </Text>
              {selectToggleIconComponent || (
              <Icon
                size={24}
                name="keyboard-arrow-down"
                style={{ color: colors.selectToggleTextColor }}
                />
              )}
            </View>
          </TouchableWithoutFeedback>
          )
        }
        {
          selectedItems.length > 0 && !single && showChips
            ? (
              <View
                style={{
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  flexDirection: 'row',
                }}
            >
                {selectedItems.length > 1 && showRemoveAll
                  ? (
                    <View
                      style={[{
                        overflow: 'hidden',
                        justifyContent: 'center',
                        height: 34,
                        borderColor: colors.chipColor,
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingLeft: 10,
                        margin: 3,
                        paddingTop: 0,
                        paddingRight: 10,
                        paddingBottom: 0,
                        borderRadius: 20,
                        borderWidth: 1,
                      }, styles.chipContainer]}
                >
                      <TouchableOpacity
                        onPress={() => { this._removeAllItems(); }}
                        style={{
                          borderTopRightRadius: 20,
                          borderBottomRightRadius: 20,
                        }}
                  >
                        <Text
                          style={[
                            {
                              color: colors.chipColor,
                              fontSize: 13,
                              marginRight: 0,
                            },
                            styles.chipText]}
                    >
                          {removeAllText}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )
                  : null
              }
                {this._displaySelectedItems()}
              </View>
            )
            : null
        }
      </View>
    );
  }
}

export default SectionedMultiSelect;
