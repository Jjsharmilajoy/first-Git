/**
 * This component collects the photo of lead's licence and license number and
 * allows lead to start the booked test ride.
 */
import React, { Component } from 'react';
import
{
  View,
  Image,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  PermissionsAndroid
} from 'react-native';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import ImagePicker from 'react-native-image-picker';
import { NavigationActions } from 'react-navigation';
import moment from 'moment';
import SimpleLineIcon from 'react-native-vector-icons/SimpleLineIcons';
import styles from './startTestRideStyles';
import { GradientButtonLarge } from '../../../components/button/Button';
import { uploadDocument, deleteDocumentById,
  updateTestRideStatus } from '../../../redux/actions/TestRide/actionCreators';
import { updateLeadDetail } from '../../../redux/actions/LeadHistory/actionCreators';
import { updateClickedPosition } from '../../../redux/actions/Global/actionCreators';
import { licenceValidator } from '../../../utils/validations';
import { resetScreens } from '../../../actions/stackActions';
import { requestPermission, checkPermission } from '../../../helpers/Permissions';

import tick from '../../../assets/images/tick.png';
import deleteIcon from '../../../assets/images/delete.png';
import add from '../../../assets/images/ic_primary_addmore.png';

import constants from '../../../utils/constants';
import variable from '../../../theme/variables';

@connect(state => ({
  document: state.testRide.document,
  currentUser: state.user.currentUser
}), {
  uploadDocument,
  deleteDocumentById,
  updateLeadDetail,
  updateTestRideStatus,
  updateClickedPosition
})
export default class StartTestRide extends Component {
  static propTypes = {
    navigation: PropTypes.object.isRequired,
    document: PropTypes.object,
    uploadDocument: PropTypes.func.isRequired,
    updateClickedPosition: PropTypes.func.isRequired,
    updateLeadDetail: PropTypes.func.isRequired,
    deleteDocumentById: PropTypes.func.isRequired,
    currentUser: PropTypes.object.isRequired
  }

  static defaultProps = {
    document: null
  }

  constructor(props) {
    super(props);
    this.state = {
      licenses: this.props.navigation.state.params.item.lead.document || [],
      licenseNumber: '',
      item: this.props.navigation.state.params.item
    };
    // stateless variable to handle image picker multiple taps.
    this.imagePickerCalled = false;
  }

  getLeadbackgroundStyle = category => {
    switch (category) {
      case 'NEW':
        return { backgroundColor: variable.fresh };
      case 'HOT':
        return {
          backgroundColor: variable.hot,
          color: variable.charcoalGrey
        };
      case 'WARM':
        return { backgroundColor: variable.warm };
      case 'COLD':
        return { backgroundColor: variable.cold };
      case 'INVOICED':
        return {
          backgroundColor: variable.invoiced,
          color: variable.charcoalGrey
        };
      case 'LOST':
        return { backgroundColor: variable.lost };
      default:
        return { backgroundColor: variable.fresh };
    }
  }

  captureImage = () => {
    const { licenses, item } = this.state;
    const options = {
      quality: 1.0,
      title: 'Select Image',
      storageOptions: {
        skipBackup: true,
        path: 'images'
      }
    };
    ImagePicker.showImagePicker(options, response => {
      if (response.didCancel) {
        this.imagePickerCalled = false;
        console.log('User cancelled image picker');
      } else if (response.error) {
        this.imagePickerCalled = false;
        console.log('ImagePicker Error: ', response.error);
      } else {
        let data = [];
        data = [
          {
            name: 'lead',
            data: JSON.stringify({
              lead_id: item.lead.id,
              type: 'Dealer',
              name: 'driving-license'
            })
          },
          {
            name: 'file',
            filename: response.fileName,
            data: response.data
          }
        ];
        this.props.uploadDocument(item.lead.user_id, data).then(() => {
          licenses.push(this.props.document);
          this.setState({
            licenses
          });
          this.imagePickerCalled = false;
        }).catch(() => {});
      }
    });
  }

  handleImagePicker = async () => {
    if (!this.imagePickerCalled) {
      this.imagePickerCalled = true;
      const permissionGranted = await checkPermission(PermissionsAndroid.PERMISSIONS.CAMERA)
      && await checkPermission(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
      if (permissionGranted) {
        this.captureImage();
      } else {
        const givePermissionRequest = await requestPermission();
        if (PermissionsAndroid.RESULTS.GRANTED === givePermissionRequest) {
          this.captureImage();
        } else if (PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN === givePermissionRequest) {
          console.log('NEVER_ASK_AGAIN');
          Alert.alert(
            'Info',
            'Go to Settings and enable necessary permissions to proceed.',
            [
              { text: 'Ok', onPress: () => {} },
            ],
            { cancelable: false }
          );
        }
      }
    }
  }

  handleChange = value => {
    this.setState({ licenseNumber: value });
  }

  deleteImage = (id, index) => {
    const { licenses } = this.state;
    this.props.deleteDocumentById(id).then(() => {
      licenses.splice(index, 1);
      this.setState({
        licenses
      });
    }).catch(() => {});
  }

  closeStartTestRide = () => {
    this.props.navigation.dispatch(NavigationActions.back());
  }

  startTestRide = () => {
    // if (licenceValidator(this.state.licenseNumber)) {
    const { item } = this.state;
    const { navigation } = this.props;
    const leadDetail = {
      ...item,
      test_ride_status: 300
    };
    delete leadDetail.vehicle;
    delete leadDetail.lead;
    delete leadDetail.document;
    /*
      patch api for updating lead detail is not working
      */
    try {
      this.props.updateLeadDetail(item.id, leadDetail).then(async () => {
        await this.props.updateClickedPosition(5);
        const resetAction = resetScreens({
          index: 0,
          actions: [NavigationActions.navigate({
            routeName: 'Dashboard'
          })],
        });
        navigation.dispatch(resetAction);
      }).catch(() => {});
    } catch (error) {
      console.log(error);
    }
    /*     } else {
      Alert.alert(
        'Invalid Licence Number',
        'Please check the example format.',
        [
          { text: 'Ok', onPress: () => {} },
        ],
        { cancelable: false }
      );
    } */
  }

  render() {
    const { item } = this.state;
    return (
      <View style={styles.container}>
        <View style={{ flexDirection: 'row' }}>
          <View style={{ flex: 1 }} >
            <TouchableOpacity
              style={{
                width: 30,
                height: 30,
                position: 'absolute',
                right: 0,
                top: 0,
                alignItems: 'center',
                backgroundColor: '#f26537'
              }}
              onPress={this.closeStartTestRide}
                >
              <Image
                style={{ resizeMode: 'center', flex: 1 }}
                source={require('../../../assets/images/close.png')}
                  />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.body}>
          <View style={styles.bikeSection}>
            <View style={{
              flex: 0.8, alignItems: 'center', justifyContent: 'center'
            }}>
              <Image
                style={{ width: 150, height: 150 }}
                source={{ uri: item.vehicle.image_url }}
                resizeMode="center"
           />
            </View>
            <Text
              style={
                [styles.category, this.getLeadbackgroundStyle(item.invoiced_on ? 'INVOICED' : item.lead.category)]}>
              {item.invoiced_on ? 'INVOICED' : item.lead.category}
            </Text>
            <View style={styles.bikeDetail}>
              <View style={styles.bikeAssigneeWrapper}>
                <View>
                  <Text style={styles.bikeName}>{item.vehicle.name}</Text>
                  <Text style={[styles.bikeSectionLabelText, { marginTop: 5 }]}>
                    Created at: {
                      moment.utc(item.created_at).utcOffset('+05:30').format('DD-MMM-YYYY')
                    }
                  </Text>
                </View>
                <View style={styles.dropdownWrapper}>
                  <SimpleLineIcon
                    style={styles.userIcon}
                    name="user"
                    size={12}
                    color="#9d9c9c" />
                  <Text style={styles.assigneeName}>
                    {
                item && item.lead ?
                  `${item.lead.assignee.first_name}`
                  :
                  <Text>
                    NA
                  </Text>
                }
                  </Text>
                </View>
              </View>
              <View style={{ marginTop: 20 }}>
                <Text style={styles.bikeSectionLabelText}>Lead Contact</Text>
                <Text style={[styles.bikeSectionTextBold, { marginTop: 5 }]}>{item.lead.mobile_number}</Text>
              </View>
              <View style={{ marginTop: 20 }}>
                <Text style={styles.bikeSectionLabelText}>Test Ride</Text>
                <Text style={[styles.bikeSectionTextBold, { marginTop: 5 }]}>
                  {
                  item && item.test_ride_on ?
                    `${moment(item.test_ride_on).format('DD MMM')}` +
                    ` @ ${moment(item.test_ride_on).utc().format('h:mm a')}`
                    :
                    'NO'
                }
                </Text>
              </View>
              <View style={{ marginTop: 20 }}>
                <Text style={styles.bikeSectionLabelText}>Lead Details</Text>
                <View style={{ marginTop: 5, flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={styles.userDetailText}>{item.lead.name}</Text>
                  <View style={styles.circle} />
                  <Text style={styles.userDetailText}>{item.lead.gender}</Text>
                </View>
              </View>
            </View>
          </View>
          <View style={styles.documentSection}>
            <View>
              <Text style={styles.photoUploadText}>Please upload both sides of the driving license</Text>
              <View style={styles.photoView}>
                {
                this.state.licenses.length !== 0 &&
                this.state.licenses.map(license => (
                  <Image
                    source={{
                      uri: `${constants.BASEURL}` +
                    `/Documents/${license.id}/small?access_token=${this.props.currentUser.documentToken}`
                    }}
                    style={styles.photoStyle} />
                ))
                }
                {
                this.state.licenses.length < 2 ?
                  <TouchableOpacity
                    onPress={() => { this.handleImagePicker(); }}
                    style={styles.addIcon}
                  >
                    <Image source={add} />
                  </TouchableOpacity>
                  :
                  null
              }
              </View>
              {
              this.state.licenses.length !== 0 &&
              this.state.licenses.map((license, index) => (
                <View style={{ flexDirection: 'row', marginTop: 20, alignItems: 'center' }}>
                  <Image source={tick} />
                  <Text style={{ marginLeft: 10 }}>{license.name}</Text>
                  <TouchableOpacity
                    onPress={() => this.deleteImage(license.id, index)}
                    >
                    <View style={styles.deleteImageWrapper}>
                      <Image source={deleteIcon} />
                      <Text style={styles.deleteText}>Delete</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              ))
            }
            </View>
            <View style={{ marginTop: 20 }}>
              <Text style={styles.licenseText}>License Number(Eg. MH1420110062821 or  MH14Z20110062821)</Text>
              <TextInput
                style={styles.licenseInput}
                onChangeText={text => this.handleChange(text)}
                value={this.state.licenseNumber}
                underlineColorAndroid="transparent"
                maxLength={16}
                />
            </View>
            <View style={styles.documentFooter}>
              {
/*                  this.state.licenses && this.state.licenses.length !== 0 &&
                 (licenceValidator(this.state.licenseNumber)) ? */
                <GradientButtonLarge
                  title="Start Test Ride"
                  buttonStyle={{ width: 150 }}
                  handleSubmit={this.startTestRide}
                  />
                  /* :
                  <GradientButtonLarge
                    disabled
                    colors={['#A9A9A9', '#A9A9A9']}
                    title="Start Test Ride"
                    buttonStyle={{ width: 150 }}
                  /> */
              }
            </View>
          </View>

        </View>
      </View>
    );
  }
}
