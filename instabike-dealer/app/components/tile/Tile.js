import React from 'react';
import PropTypes from 'prop-types';
import LinearGradient from 'react-native-linear-gradient';
import Feather from 'react-native-vector-icons/Feather';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import SimpleLineIcon from 'react-native-vector-icons/SimpleLineIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  View, TouchableOpacity, TouchableWithoutFeedback, Image, Text, ActivityIndicator
} from 'react-native';
import {
  imageTextStyles, horizontalImageTextStyles,
  horizontalTextStyles, tileStyles, gradientCountTile
} from './tileStyles';
// import CounterAnimate from '../animated/CounterAnimate';
import fonts from '../../theme/fonts';

export const ImageTextTile = ({
  tile, tileClick, tileColor, selected, icon, type, disabled
}) => (
  <TouchableOpacity onPress={tileClick} disabled={disabled}>
    <View style={[imageTextStyles.container, tileColor]}>
      { type === 'Feather'
        && <Feather name={icon} size={15} color={selected ? 'white' : '#827773'} />
       }
      { type === 'MaterialCommunityIcons'
        && <MaterialCommunityIcon name={icon} size={15} color={selected ? 'white' : '#827773'} />
       }
      { type === 'SimpleLineIcons'
        && <SimpleLineIcon name={icon} size={15} color={selected ? 'white' : '#827773'} />
       }
      { type === 'FontAwesome'
        && <FontAwesome name={icon} size={15} color={selected ? 'white' : '#827773'} />
       }
      { type === 'MaterialIcons'
        && <MaterialIcon name={icon} size={15} color={selected ? 'white' : '#827773'} />
       }
      <Text style={{
        fontSize: 11,
        marginTop: 5,
        alignSelf: 'center',
        color: selected ? 'white' : '#827773',
        textAlign: 'center',
        fontFamily: fonts.sourceSansProRegular
      }}
      >
        {tile.name}
      </Text>
    </View>
  </TouchableOpacity>
);

ImageTextTile.propTypes = {
  tileColor: PropTypes.number,
  tile: PropTypes.object.isRequired,
  tileClick: PropTypes.func.isRequired,
  type: PropTypes.string.isRequired,
  selected: PropTypes.bool.isRequired,
  icon: PropTypes.string.isRequired,
  disabled: PropTypes.bool
};

ImageTextTile.defaultProps = {
  tileColor: null,
  disabled: false
};

export const HorizontalTextTile = ({ tileText, tileValue, tileStyle }) => (
  <View style={[horizontalTextStyles.container, tileStyle]}>
    <Text style={[horizontalTextStyles.leftTextStyle]}>{tileValue}</Text>
    <Text style={[horizontalTextStyles.rightTextStyle]}>{tileText}</Text>
  </View>
);

HorizontalTextTile.propTypes = {
  tileText: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]),
  tileValue: PropTypes.string,
  tileStyle: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.number
  ])
};

HorizontalTextTile.defaultProps = {
  tileText: ' ',
  tileValue: ' ',
  tileStyle: null
};

export const HorizontalTouchableTextTile = ({
  leftTextStyle, rightTextStyle, tileText, count, tileStyle, tileClick, containerStyle,
  colors
}) => (
  <TouchableWithoutFeedback onPress={tileClick}>
    <LinearGradient
      colors={colors}
      style={tileStyle}>
      <View style={[horizontalTextStyles.container, containerStyle]}>
        <Text style={[horizontalTextStyles.leftTextStyle, leftTextStyle]}>{tileText}</Text>
        <Text style={[horizontalTextStyles.rightTextStyle, rightTextStyle]}>{count}</Text>
        {/* <CounterAnimate
          textStyle={[horizontalTextStyles.rightTextStyle, rightTextStyle]}
          count={count}
          delay={2000} /> */}
      </View>
    </LinearGradient>
  </TouchableWithoutFeedback>
);

HorizontalTouchableTextTile.propTypes = {
  tileText: PropTypes.string,
  count: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]),
  tileStyle: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.number
  ]),
  leftTextStyle: PropTypes.object.isRequired,
  rightTextStyle: PropTypes.object.isRequired,
  tileClick: PropTypes.func,
  colors: PropTypes.array.isRequired,
  containerStyle: PropTypes.object
};

HorizontalTouchableTextTile.defaultProps = {
  tileText: '',
  count: '',
  tileStyle: null,
  tileClick: '',
  containerStyle: null
};

export const HorizontalImageTextTile = ({ tileText, tileStyle, tileCount }) => (
  <View style={[horizontalImageTextStyles.container, tileStyle]}>
    <View style={horizontalImageTextStyles.circle} />
    <View style={horizontalImageTextStyles.rightContainer}>
      <Text style={horizontalImageTextStyles.rightTextStyle}>{tileText}</Text>
      <Text style={horizontalImageTextStyles.countTextStyle}>{tileCount}</Text>
    </View>
  </View>
);

HorizontalImageTextTile.propTypes = {
  tileText: PropTypes.string,
  tileStyle: PropTypes.number,
  tileCount: PropTypes.string
};

HorizontalImageTextTile.defaultProps = {
  tileText: '',
  tileStyle: null,
  tileCount: ''
};

export const CardTile = props => {
  let colorOfTile;
  if (props.data.length === 1) {
    colorOfTile = tileStyles.darkTile;
  } else {
    colorOfTile = tileStyles.lightTile;
  }

  return (
    <View style={[tileStyles.cardTile, colorOfTile]}>
      {props.data.map(text => (<Text key={text.id} style={tileStyles.textSize}>{text.name}</Text>))}
    </View>
  );
};

CardTile.defaultProps = {
  data: [],
};

CardTile.propTypes = {
  data: PropTypes.array
};

export const LinearGradientTile = props => (
  <TouchableOpacity
    onPress={props.handleSubmit}
    activeOpacity={0.5}>
    <LinearGradient
      colors={[props.startColor, props.endColor]}
      style={{
        width: 153,
        height: 52.5,
        borderRadius: 3,
        justifyContent: 'space-between',
        alignContent: 'center'
      }}
      start={{ x: 0.0, y: 1.0 }}
      end={{ x: 1.0, y: 1.0 }}>
      <Text
        style={{
          fontSize: 18,
          fontWeight: 'bold',
          color: '#FFF',
          paddingTop: 10,
          paddingLeft: 10,
          alignSelf: 'flex-start',
          textAlign: 'center',
          fontFamily: 'SourceSansPro-Semibold'
        }}
      >
        {props.count}
      </Text>
      <Text
        style={{
          fontSize: 12,
          paddingBottom: 10,
          paddingRight: 10,
          fontWeight: 'bold',
          color: '#FFF',
          alignSelf: 'flex-end',
          textAlign: 'center',
          fontFamily: 'SourceSansPro-Semibold'
        }}
      >
        {props.text1}
        {' '}
        {props.text2}
      </Text>
    </LinearGradient>
  </TouchableOpacity>
);

LinearGradientTile.propTypes = {
  startColor: PropTypes.string.isRequired,
  endColor: PropTypes.string.isRequired,
  count: PropTypes.string.isRequired,
  text1: PropTypes.string.isRequired,
  text2: PropTypes.string.isRequired,
  handleSubmit: PropTypes.func
};

LinearGradientTile.defaultProps = {
  handleSubmit: null
};

export const GradientCountTile = props => (
  <LinearGradient
    colors={props.colors}
    style={[gradientCountTile.container, props.style]}
    key={props.id}>
    {
      props.loading
        ? <ActivityIndicator color="#ffffff" style={gradientCountTile.loading} />
        : (
          <TouchableOpacity
            onPress={() => { if (props.onClick) props.onClick(); }}
            style={{ flex: 1 }}>
            <View style={gradientCountTile.tileView}>
              <View style={{
                flex: props.hasDivide ? 4 : 6,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
                {
            props.hasImage
            && (
            <Image
              source={props.imgSrc}
              resizeMode="contain"
              style={[props.imgStyle || {}]} />
            )
          }
                <Text style={[gradientCountTile.innerTextStyle, props.textStyle]}>{props.tileText}</Text>
              </View>
              <View style={[gradientCountTile.content, { flex: props.hasDivide ? 6 : 4 }]}>
                {
          // props.isString ?
                  <Text style={[gradientCountTile.countStyle, props.countStyle]}>{props.tileCount}</Text>
            // :
            // <CounterAnimate
            //   textStyle={[gradientCountTile.countStyle, props.countStyle]}
            //   count={parseInt(props.tileCount, 10)}
            //   delay={2000} />
          }
              </View>
            </View>
          </TouchableOpacity>
        )
    }
  </LinearGradient>
);

GradientCountTile.propTypes = {
  colors: PropTypes.array.isRequired,
  tileCount: PropTypes.any.isRequired,
  tileText: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  id: PropTypes.any.isRequired,
  style: PropTypes.object,
  countStyle: PropTypes.object,
  textStyle: PropTypes.object,
  hasDivide: PropTypes.bool,
  hasImage: PropTypes.bool,
  loading: PropTypes.bool,
  // isString: PropTypes.bool,
  imgSrc: PropTypes.any,
  imgStyle: PropTypes.object
};

GradientCountTile.defaultProps = {
  style: null,
  onClick: null,
  countStyle: null,
  textStyle: null,
  hasDivide: false,
  hasImage: false,
  imgSrc: null,
  imgStyle: {},
  // isString: false,
  loading: false
};
