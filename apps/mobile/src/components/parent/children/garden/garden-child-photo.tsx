import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Garden, GardenFonts, PANEL_TINTS, useGardenAccent } from '@/components/parent/garden/tokens';
import { GPressable } from '@/components/parent/garden/ui';
import { pickProfilePhotoFromLibrary } from '@/lib/profile-photo/pick-profile-photo';
import { resolveOrganizationAssetUrl } from '@/lib/resolve-asset-url';

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ''}${parts[parts.length - 1][0] ?? ''}`.toUpperCase();
}

/**
 * Polaroid-style child photo (a slight tilt is allowed on photos). When
 * `editable`, a camera badge opens the photo library; `onBlocked` runs instead
 * in read-only preview.
 */
export function GardenChildPhoto({
  name,
  photoUrl,
  size = 96,
  editable,
  uploading,
  readOnly,
  onBlocked,
  onPicked,
}: {
  name: string;
  photoUrl: string | null;
  size?: number;
  editable: boolean;
  uploading: boolean;
  readOnly: boolean;
  onBlocked: () => void;
  onPicked: (uri: string, mimeType?: string) => void;
}) {
  const accent = useGardenAccent();
  const resolved = photoUrl ? resolveOrganizationAssetUrl(photoUrl) : '';
  const inner = size - 10;

  const pick = async () => {
    if (readOnly) {
      onBlocked();
      return;
    }
    const picked = await pickProfilePhotoFromLibrary();
    if (picked) onPicked(picked.uri, picked.mimeType);
  };

  return (
    <View style={{ width: size + 8, height: size + 8 }}>
      <View
        accessible
        accessibilityRole="image"
        accessibilityLabel={`Photo of ${name}`}
        style={[styles.polaroid, { width: size, transform: [{ rotate: '-3deg' }] }]}>
        {resolved ? (
          <Image
            source={{ uri: resolved }}
            style={{ width: inner, height: inner, borderRadius: 4 }}
            contentFit="cover"
            transition={180}
          />
        ) : (
          <View style={[styles.initials, { width: inner, height: inner, backgroundColor: PANEL_TINTS[0] }]}>
            <Text style={[styles.initialsText, { fontSize: Math.round(inner * 0.34) }]}>
              {initials(name)}
            </Text>
          </View>
        )}
        {uploading ? (
          <View style={styles.overlay} accessibilityLabel="Uploading photo">
            <ActivityIndicator color={Garden.white} />
          </View>
        ) : null}
      </View>
      {editable && !uploading ? (
        <GPressable
          accessibilityLabel={`Change photo for ${name}`}
          accessibilityHint="Opens your photo library"
          onPress={() => void pick()}
          hitSlop={10}
          style={[styles.badge, { backgroundColor: accent.clay }]}>
          <Ionicons name="camera" size={16} color={Garden.white} />
        </GPressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  polaroid: {
    backgroundColor: Garden.white,
    padding: 5,
    paddingBottom: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Garden.ink12,
    shadowColor: Garden.ink,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  initials: { borderRadius: 4, alignItems: 'center', justifyContent: 'center' },
  initialsText: { fontFamily: GardenFonts.display, color: Garden.ink },
  overlay: {
    ...StyleSheet.absoluteFill,
    borderRadius: 6,
    backgroundColor: 'rgba(43,36,29,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: Garden.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
