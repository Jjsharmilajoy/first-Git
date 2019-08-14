import React from 'react';
import {
  View,
} from 'react-native';
import PropTypes from 'prop-types';
import styles from './continueSectionStyles';
import { ButtonWithLeftImage, BookTestRideButton } from '../button/Button';
import backButton from '../../assets/images/backArrow.png';

const ContinueSectionScreen = props => {
  const { continueBtnAction, backBtnAction } = props;
  return (
    <View style={{ flex: 1, flexDirection: 'column' }}>
      <View style={[styles.imageContainer, { flex: 5 }]}>
        <View style={[styles.box1]}>
          <View style={styles.btnFirstWhiteBox}>
            <ButtonWithLeftImage
              disabled={props.disableBackBtn}
              image={backButton}
              style={styles.backButtonStyle}
              textStyle={styles.backButtonTextStyle}
              handleSubmit={backBtnAction}
              title=" Back"
            />
          </View>
        </View>
        <View style={[styles.box, styles.box2]}>
          <View style={styles.btnSecondWhiteBox}>
            <BookTestRideButton
              disabled={props.disableBackBtn}
              style={styles.continueBtnStyle}
              title={props.title ? props.title : 'CONTINUE'}
              handleSubmit={continueBtnAction}
            />
          </View>
        </View>
      </View>
    </View>
  );
};

ContinueSectionScreen.propTypes = {
  continueBtnAction: PropTypes.func.isRequired,
  backBtnAction: PropTypes.func.isRequired,
  disableBackBtn: PropTypes.bool,
  title: PropTypes.string
};

ContinueSectionScreen.defaultProps = {
  title: '',
  disableBackBtn: false
};

export default ContinueSectionScreen;
