import React, { Component } from 'react';
import propTypes from 'prop-types';
import {
  View, ScrollView, Text, FlatList
} from 'react-native';
import { ButtonWithRightImageForDropdown, ButtonHighlightWithPlainText } from '../button/Button';
import dropDownIcon from '../../assets/images/ic_arrow_1x.png';
import dropdownStyles from './dropdownStyles';

export default class DropDown extends Component {
  constructor(props) {
    super(props);
    this.state = ({
      showDropDown: false,
      dataSource: []
    });
  }

  componentWillMount() {
    this.setState({
      dataSource: this.props.data,
    });
  }

  _onPress = item => {
    this.props.selectedDropdownValue(item);
    this.setState({
      showDropDown: false
    });
  }

  showDropDown = () => {
    this.setState({
      showDropDown: !this.state.showDropDown
    });
  }

  renderItem = ({ item }) => (
    <ButtonHighlightWithPlainText
      style={dropdownStyles.buttonStyle}
      textStyle={dropdownStyles.textStyle}
      handleSubmit={() => this._onPress(item)}
      title={item.key}
    />
  )

  render() {
    return (
      <View style={
        [
          dropdownStyles.dropdownWrapper,
          {
            right: this.props.absoluteRightValue,
            width: this.props.width,
            top: this.props.absoluteTopValue
          },
          {
            shadowOffset: {
              width: 6,
              height: 6,
            },
            shadowOpacity: 0.2,
            shadowRadius: 10
          }
        ]
      }
      >
        <View>
          <Text style={dropdownStyles.dropDownLabel}>
            {this.props.label}
            {' '}
:
          </Text>
        </View>
        <ButtonWithRightImageForDropdown
          title={this.props.defaultValue}
          style={dropdownStyles.buttonWithRightImageStyle}
          textStyle={[dropdownStyles.buttonWithRightImageTextStyle,
            { width: this.props.textboxWidth }]}
          handleSubmit={this.showDropDown}
          image={dropDownIcon}
        />
        {this.state.showDropDown
          ? (
            <ScrollView
              style={[
                dropdownStyles.scrollViewStyle,
                {
                  width: this.props.scrollViewWidth,
                  shadowOffset: {
                    width: 6,
                    height: 6,
                  },
                  shadowOpacity: 0.2,
                  shadowRadius: 10
                }
              ]}
          >
              <FlatList
                data={this.state.dataSource}
                listKey={({ item }) => item.id}
                renderItem={this.renderItem}
            />
            </ScrollView>
          )
          : null
        }
      </View>
    );
  }
}

DropDown.propTypes = {
  defaultValue: propTypes.string,
  data: propTypes.array.isRequired,
  absoluteRightValue: propTypes.number.isRequired,
  absoluteTopValue: propTypes.number,
  width: propTypes.number.isRequired,
  label: propTypes.string.isRequired,
  scrollViewWidth: propTypes.number.isRequired,
  selectedDropdownValue: propTypes.func.isRequired,
  textboxWidth: propTypes.number
};

DropDown.defaultProps = {
  defaultValue: 'price',
  absoluteTopValue: null,
  textboxWidth: 45
};
