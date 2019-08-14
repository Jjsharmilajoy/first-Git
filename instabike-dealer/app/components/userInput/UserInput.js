import React from 'react';
import PropTypes from 'prop-types';
import {
  View, TextInput, Image, Text
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import userInputStyles from './userInputStyles';

const UserInput = props => (
  <View style={props.boxStyle}>
    <View style={[userInputStyles.inputWrapper, props.containerStyle]}>
      {
        props.frontImage
          ? (
            <Image
              source={props.frontImage}
              style={userInputStyles.inlineImg}
          />
          )
          : null
      }
      <TextInput
        style={[userInputStyles.input,
          props.textInputStyle, props.frontImage ? { paddingLeft: 20 } : null, props.textStyle]}
        placeholder={props.placeholder}
        placeholderTextColor="#9DA5B9"
        secureTextEntry={props.secureTextEntry}
        onChangeText={value => props.onChange ? props.onChange(props.param, value) : ''}
        underlineColorAndroid="transparent"
        value={props.value}
        keyboardType={props.keyboardType}
        multiline={props.multiline}
        numberOfLines={props.numberOfLines}
        editable={props.editable}
        maxLength={props.maxLength}
      />
      {
        props.rearImage
          ? (
            <Image
              source={props.rearImage}
              style={userInputStyles.rearInlineImg}
          />
          )
          : null
      }
      {
        props.showGradient
        && (
        <LinearGradient
          colors={['#f79426', '#f16537']}
          style={{
            width: 300,
            height: 3
          }}
          start={{ x: 0.0, y: 1.0 }}
          end={{ x: 1.0, y: 1.0 }} />
        )
      }
    </View>
    {
      props.showError
        ? (
          <Text style={[userInputStyles.errorTextStyle, props.errorStyle]}>
            {props.errorTitle}
          </Text>
        )
        : <Text style={userInputStyles.errorTextStyle} />
    }
  </View>

);

UserInput.propTypes = {
  containerStyle: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.array,
    PropTypes.number,
  ]),
  textInputStyle: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.number,
  ]),
  textStyle: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.number,
  ]),
  errorStyle: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.number,
  ]),
  keyboardType: PropTypes.string,
  multiline: PropTypes.bool,
  numberOfLines: PropTypes.number,
  placeholder: PropTypes.string.isRequired,
  secureTextEntry: PropTypes.bool,
  onChange: PropTypes.func,
  param: PropTypes.string,
  value: PropTypes.string.isRequired,
  frontImage: PropTypes.number,
  rearImage: PropTypes.number,
  editable: PropTypes.bool,
  showGradient: PropTypes.bool,
  maxLength: PropTypes.number,
  errorTitle: PropTypes.string,
  showError: PropTypes.bool,
  boxStyle: PropTypes.number
};

UserInput.defaultProps = {
  maxLength: 1000,
  keyboardType: 'default',
  param: '',
  onChange: null,
  multiline: false,
  numberOfLines: 1,
  textInputStyle: null,
  errorStyle: null,
  containerStyle: null,
  textStyle: null,
  secureTextEntry: false,
  frontImage: null,
  rearImage: null,
  editable: true,
  showGradient: false,
  errorTitle: '',
  showError: false,
  boxStyle: null
};

export default UserInput;
