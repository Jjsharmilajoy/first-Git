import { PermissionsAndroid } from 'react-native';

export async function requestPermission() {
  try {
    const result = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.CAMERA,
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
    ]);
    if (result[PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE] === PermissionsAndroid.RESULTS.GRANTED
      && result[PermissionsAndroid.PERMISSIONS.CAMERA] === PermissionsAndroid.RESULTS.GRANTED) {
      return PermissionsAndroid.RESULTS.GRANTED;
    } if (result[PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE] === PermissionsAndroid.RESULTS.DENIED
      || result[PermissionsAndroid.PERMISSIONS.CAMERA] === PermissionsAndroid.RESULTS.DENIED) {
      return PermissionsAndroid.RESULTS.DENIED;
    } if (result[PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE]
      === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN
      || result[PermissionsAndroid.PERMISSIONS.CAMERA] === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
      return PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN;
    }
    return PermissionsAndroid.RESULTS.DENIED;
  } catch (err) {
    console.warn(err);
  }
}

export async function requestCallPermission() {
  try {
    const result = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CALL_PHONE);
    if (result === PermissionsAndroid.RESULTS.GRANTED) { return result; }
    if (result === PermissionsAndroid.RESULTS.DENIED) { return result; }
    if (result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) { return result; }
  } catch (err) {
    console.warn(err);
  }
}

export async function checkPermission(value) {
  try {
    return await PermissionsAndroid.check(value);
  } catch (err) {
    console.warn(err);
  }
}

