import React from 'react';
import {
  View,
  Image,
  Text,
  Dimensions,
} from 'react-native';
import PropTypes from 'prop-types';
import { ButtonWithPlainText } from '../button/Button';
import constants from '../../utils/constants';

const DEVICE_WIDTH = Dimensions.get('window').width;
const DEVICE_HEIGHT = Dimensions.get('window').height;
const BoldText = props => <Text style={{ fontWeight: 'bold', fontSize: 20 }}>{props.children}</Text>;
BoldText.propTypes = {
  children: PropTypes.string.isRequired,
};

const ProductListCard = props => {
  const { item, bookTestRideAction, addToCompareAction } = props;
  return (
    <View style={{
      width: DEVICE_WIDTH - 100,
      backgroundColor: 'white',
      marginLeft: 20,
      marginBottom: 20,
      shadowOffset: {
        width: 3,
        height: 3,
      },
      shadowOpacity: 0.2,
      shadowRadius: 10,
    }}
    >
      <Image
        style={{
          height: DEVICE_HEIGHT - 300,
          marginHorizontal: (DEVICE_WIDTH * 0.05),
          marginTop: ((DEVICE_HEIGHT * 0.05)),
          resizeMode: 'contain'
        }}
        source={{ uri: item.imageUrl }}
      />
      <View style={{
        flexDirection: 'row', flex: 2, alignItems: 'center'
      }}
      >
        <View style={{ flex: 6, flexDirection: 'column' }}>
          <Text style={{
            color: '#2A4F78',
            marginLeft: (DEVICE_WIDTH * 0.06),
            marginRight: 10,
            marginBottom: 10,
            backgroundColor: '#F8FAFF',
            width: (DEVICE_WIDTH * 0.6)
          }}
          >
            {item.description}
          </Text>
          <View style={{
            flexDirection: 'row',
            height: 50,
            justifyContent: 'space-around',
            marginTop: 15,
            alignItems: 'center',
            marginHorizontal: (DEVICE_WIDTH * 0.04)
          }}
          >
            <View style={{ flexDirection: 'row' }}>
              <View style={{
                backgroundColor: '#EAEEF9', width: 40, margin: 5, borderRadius: 5
              }}
              />
              <View style={{
                margin: 5,
                flexDirection: 'column',
                alignItems: 'center',
                alignSelf: 'center'
              }}
              >
                <Text>
                  <BoldText>{item.cc}</BoldText>
cc
                </Text>
                <Text>
                      Engine
                </Text>
              </View>
            </View>
            <View style={{ height: 50, width: 1, backgroundColor: 'gray' }} />
            <View style={{ flexDirection: 'row' }}>
              <View style={{
                backgroundColor: '#EAEEF9', width: 40, margin: 5, borderRadius: 5
              }}
              />
              <View style={{
                margin: 5,
                flexDirection: 'column',
                alignItems: 'center',
                alignSelf: 'center'
              }}
              >
                <Text>
                  <BoldText>{item.weight}</BoldText>
kg
                </Text>
                <Text>
                      Weight
                </Text>
              </View>
            </View>

            <View style={{ height: 50, width: 1, backgroundColor: 'gray' }} />
            <View style={{ flexDirection: 'row' }}>
              <View style={{
                backgroundColor: '#EAEEF9', width: 40, margin: 5, borderRadius: 5
              }}
              />
              {
                !constants.hideMileage &&
                  <View
                    style={{
                      margin: 5,
                      flexDirection: 'column',
                      alignItems: 'center',
                      alignSelf: 'center',
                    }}
                    >
                    <Text>
                      <BoldText>{item.kmpl}</BoldText>
                      {/* kmpl */}
                    </Text>
                    <Text>
                      mileage
                    </Text>
                  </View>
                }
            </View>
            <View style={{ height: 50, width: 1, backgroundColor: 'gray' }} />
            <View>
              <Text>
                      Starting
                {' '}
                {item.rate}
              </Text>
              <View style={{
                flexDirection: 'row',
                backgroundColor: '#EAEEF9',
                borderRadius: 5,
                margin: 5,
                alignItems: 'center'
              }}
              >
                <Text style={{ margin: 5 }}>
                  EMI Option Available
                </Text>
              </View>
            </View>
            <ButtonWithPlainText
              title="Book Test Ride"
              style={{
                height: 40, width: 120, borderRadius: 25, alignItems: 'center', justifyContent: 'center'
              }}
              handleSubmit={bookTestRideAction}
              textStyle={{ color: 'white' }}
            />
            <ButtonWithPlainText
              title="Add To Compare"
              style={{
                height: 40,
                width: 120,
                borderRadius: 25,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                backgroundColor: 'white',
                borderColor: '#2793DC'
              }}
              handleSubmit={addToCompareAction}
              textStyle={{ color: '#2793DC' }}
            />
          </View>
        </View>
      </View>
    </View>
  );
};
ProductListCard.propTypes = {
  item: PropTypes.object.isRequired,
  bookTestRideAction: PropTypes.func.isRequired,
  addToCompareAction: PropTypes.func.isRequired,
};
export default ProductListCard;
