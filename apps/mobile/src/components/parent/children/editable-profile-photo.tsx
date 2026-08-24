import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { ActivityIndicator, Alert, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius } from '@/constants/theme';
import { useAdminTheme } from '@/contexts/admin-theme-context';
import { resolveOrganizationAssetUrl } from '@/lib/resolve-asset-url';

type ProfilePhotoShape = 'circle' | 'square';

export type EditableProfilePhotoProps = {
  name: string;
  photoUrl?: string | null;
  size?: number;
  shape?: ProfilePhotoShape;
  editable?: boolean;
  uploading?: boolean;
  showEditHint?: boolean;
  onPhotoSelected?: (uri: string, mimeType?: string) => void;
};

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ''}${parts[parts.length - 1][0] ?? ''}`.toUpperCase();
}

function getBorderRadius(shape: ProfilePhotoShape, size: number): number {
  return shape === 'circle' ? size / 2 : Radius.lg;
}

export function EditableProfilePhoto({
  name,
  photoUrl,
  size = 88,
  shape = 'circle',
  editable = false,
  uploading = false,
  showEditHint = false,
  onPhotoSelected,
}: EditableProfilePhotoProps) {
  const theme = useAdminTheme();
  const resolvedUrl = photoUrl ? resolveOrganizationAssetUrl(photoUrl) : '';
  const borderRadius = getBorderRadius(shape, size);
  const showDashedBorder = editable && !uploading;

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

  const badgeSize = size >= 80 ? 28 : 24;
  const badgeIconSize = size >= 80 ? 14 : 12;
  const badgeOffset = size >= 80 ? -6 : -4;

  const photoContent = (
    <View style={[styles.photoWrapper, { width: size, height: size }]}>
      <Pressable
        accessibilityRole={editable ? 'button' : undefined}
        accessibilityLabel={editable ? `Change photo for ${name}` : `Photo of ${name}`}
        onPress={() => void handlePress()}
        disabled={!editable || uploading}
        style={[
          styles.photoContainer,
          {
            width: size,
            height: size,
            borderRadius,
            backgroundColor: resolvedUrl ? 'transparent' : theme.accentLight,
          },
          showDashedBorder
            ? {
                borderWidth: 2,
                borderStyle: 'dashed',
                borderColor: theme.accent,
              }
            : null,
        ]}>
        {resolvedUrl ? (
          <Image
            source={{ uri: resolvedUrl }}
            style={{ width: size, height: size, borderRadius }}
            contentFit="cover"
          />
        ) : (
          <ThemedText type="title" style={{ color: theme.accent, fontSize: size * 0.32 }}>
            {initialsFromName(name)}
          </ThemedText>
        )}

        {uploading ? (
          <View style={[styles.overlay, { borderRadius }]}>
            <ActivityIndicator color="#FFFFFF" />
          </View>
        ) : null}
      </Pressable>

      {editable && !uploading ? (
        <View
          style={[
            styles.editBadge,
            {
              width: badgeSize,
              height: badgeSize,
              borderRadius: badgeSize / 2,
              bottom: badgeOffset,
              right: badgeOffset,
              backgroundColor: theme.accent,
              borderColor: '#FFFFFF',
            },
          ]}>
          <Ionicons name="camera-outline" size={badgeIconSize} color="#FFFFFF" />
        </View>
      ) : null}
    </View>
  );

  if (!showEditHint) {
    return photoContent;
  }

  return (
    <View style={styles.wrapper}>
      {photoContent}
      {editable && !uploading ? (
        <ThemedText type="small" style={{ color: theme.accent, fontSize: 11 }}>
          Change photo
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    gap: 6,
  },
  photoWrapper: {
    position: 'relative',
    overflow: 'visible',
  },
  photoContainer: {
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
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
