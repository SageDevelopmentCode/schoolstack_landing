import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { ActivityIndicator, Alert, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useAdminTheme } from '@/contexts/admin-theme-context';
import { resolveOrganizationAssetUrl } from '@/lib/resolve-asset-url';

type EditableStudentPhotoProps = {
  name: string;
  photoUrl?: string | null;
  size?: number;
  editable?: boolean;
  uploading?: boolean;
  onPhotoSelected?: (uri: string, mimeType?: string) => void;
};

function studentInitialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ''}${parts[parts.length - 1][0] ?? ''}`.toUpperCase();
}

export function EditableStudentPhoto({
  name,
  photoUrl,
  size = 88,
  editable = false,
  uploading = false,
  onPhotoSelected,
}: EditableStudentPhotoProps) {
  const theme = useAdminTheme();
  const resolvedUrl = photoUrl ? resolveOrganizationAssetUrl(photoUrl) : '';

  const handlePress = async () => {
    if (!editable || uploading || !onPhotoSelected) return;

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        'Photo access needed',
        'Allow access to your photo library to upload a profile photo.',
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.82,
    });

    if (result.canceled || !result.assets[0]) return;

    const asset = result.assets[0];
    onPhotoSelected(asset.uri, asset.mimeType ?? 'image/jpeg');
  };

  return (
    <Pressable
      accessibilityRole={editable ? 'button' : undefined}
      accessibilityLabel={editable ? `Change photo for ${name}` : `Photo of ${name}`}
      onPress={() => void handlePress()}
      disabled={!editable || uploading}
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: resolvedUrl ? 'transparent' : theme.accentLight,
        },
      ]}>
      {resolvedUrl ? (
        <Image
          source={{ uri: resolvedUrl }}
          style={{ width: size, height: size, borderRadius: size / 2 }}
          contentFit="cover"
        />
      ) : (
        <ThemedText type="title" style={{ color: theme.accent, fontSize: size * 0.32 }}>
          {studentInitialsFromName(name)}
        </ThemedText>
      )}

      {uploading ? (
        <View style={[styles.overlay, { borderRadius: size / 2 }]}>
          <ActivityIndicator color="#FFFFFF" />
        </View>
      ) : null}

      {editable && !uploading ? (
        <View style={[styles.editBadge, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Ionicons name="camera-outline" size={14} color={theme.accent} />
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  editBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
