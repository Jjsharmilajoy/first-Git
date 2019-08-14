import React from 'react';
import PropTypes from 'prop-types';
import { Text, View, Dimensions } from 'react-native';
import styles from './stepperStyles';

const Stepper = props => {
  const { position } = props;
  return (
    <View style={styles.container}>
      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
        {props.stepNameList.map((obj, index) => (
          <View style={{ flex: 1 }}>
            {(index + 1 <= props.stepNameList.length && index !== 0)
              && (
              <View style={[styles.progress, {
                top: (Dimensions.get('screen').width > 900 ? '40%' : '35%'),
                width: ((Dimensions.get('screen').width / (props.stepNameList.length)) / 2),
                left: 0
              }]}>
                <View style={(index <= position) ? [styles.bar, styles.inProgress] : styles.bar} />
              </View>
              )
            }
            <View style={styles.detailImage}>
              <View style={position >= 0 ? [styles.circle, styles.inProgress] : styles.circle}>
                <Text style={position >= 0 ? [styles.circleText, styles.modifyPositionText]
                  : styles.circleText}>
                  {index + 1}
                </Text>
              </View>
              <Text style={position >= 0 ? [styles.title, styles.modifyText] : styles.title}>{obj}</Text>
            </View>
            {
                (index + 1 !== props.stepNameList.length && index !== props.stepNameList.length)
              && (
              <View style={[styles.progress,
                {
                  top: (Dimensions.get('screen').width > 900 ? '40%' : '35%'),
                  width: ((Dimensions.get('screen').width / (props.stepNameList.length)) / 2),
                  left: ((Dimensions.get('screen').width / (props.stepNameList.length)) / 2)
                }]}>
                <View style={(index < position) ? [styles.bar, styles.inProgress] : styles.bar} />
              </View>
              )
            }
          </View>
        ))
        }
      </View>
    </View>
  );
};

Stepper.propTypes = {
  position: PropTypes.number.isRequired,
  stepNameList: PropTypes.array.isRequired
};

export default Stepper;
