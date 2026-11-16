import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

export type PickedProfilePhoto = { uri: string; mimeType: string };

/**
 * Ask for photo-library access, then let the user pick and crop one image.
 * Resolves `null` when access is denied (after explaining why) or the picker
 * is cancelled. Shared by `EditableProfilePhoto` and the Garden child photo.
 */
export async function pickProfilePhotoFromLibrary(): Promise<PickedProfilePhoto | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    Alert.alert(
      'Photo access needed',
      'Allow access to your photo library to upload a profile photo.',
    );
    return null;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    quality: 0.82,
  });

  if (result.canceled || !result.assets[0]) return null;
  const asset = result.assets[0];
  return { uri: asset.uri, mimeType: asset.mimeType ?? 'image/jpeg' };
}
