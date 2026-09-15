import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useAdminTheme } from '@/contexts/admin-theme-context';
import { Radius } from '@/constants/theme';
import { resolveOrganizationAssetUrl } from '@/lib/resolve-asset-url';

type StudentPhotoSize = 'sm' | 'md' | 'lg' | 'row';

type StudentPhotoProps = {
  name: string;
  photoUrl?: string | null;
  size?: StudentPhotoSize;
  showHealthIndicator?: boolean;
};

const SIZE_MAP: Record<StudentPhotoSize, { dimension: number; fontSize: number }> = {
  sm: { dimension: 32, fontSize: 11 },
  md: { dimension: 40, fontSize: 13 },
  row: { dimension: 44, fontSize: 14 },
  lg: { dimension: 56, fontSize: 18 },
};

const HEALTH_BADGE_SIZE: Record<StudentPhotoSize, { container: number; icon: number }> = {
  sm: { container: 16, icon: 9 },
  md: { container: 18, icon: 10 },
  row: { container: 18, icon: 10 },
  lg: { container: 22, icon: 12 },
};

const HEALTH_INDICATOR_COLOR = '#EF4444';

export function studentInitialsFromName(name: string): string | null {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return null;
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ''}${parts[parts.length - 1][0] ?? ''}`.toUpperCase();
}

export function healthBadgeDimensions(size: StudentPhotoSize): { container: number; icon: number } {
  return HEALTH_BADGE_SIZE[size];
}

export function StudentPhoto({
  name,
  photoUrl,
  size = 'md',
  showHealthIndicator = false,
}: StudentPhotoProps) {
  const theme = useAdminTheme();
  const { dimension, fontSize } = SIZE_MAP[size];
  const { container: badgeSize, icon: iconSize } = HEALTH_BADGE_SIZE[size];
  const resolvedUrl = photoUrl ? resolveOrganizationAssetUrl(photoUrl) : '';
  const initials = studentInitialsFromName(name);
  const photoLabel = name.trim() ? `Photo of ${name.trim()}` : 'Student photo';

  return (
    <View style={styles.wrapper}>
      <View
        style={[
          styles.container,
          {
            width: dimension,
            height: dimension,
            borderRadius: dimension / 2,
            backgroundColor: theme.accentLight,
          },
        ]}
        accessibilityLabel={photoLabel}>
        {resolvedUrl ? (
          <Image
            source={{ uri: resolvedUrl }}
            style={[
              styles.image,
              { width: dimension, height: dimension, borderRadius: dimension / 2 },
            ]}
            contentFit="cover"
            accessibilityLabel={photoLabel}
          />
        ) : initials ? (
          <ThemedText
            type="smallBold"
            style={{ color: theme.accent, fontSize, lineHeight: fontSize + 2 }}>
            {initials}
          </ThemedText>
        ) : null}
      </View>
      {showHealthIndicator ? (
        <View
          accessibilityLabel="Has allergies or medications on file"
          style={[
            styles.healthBadge,
            {
              width: badgeSize,
              height: badgeSize,
              borderRadius: badgeSize / 2,
              backgroundColor: HEALTH_INDICATOR_COLOR,
            },
          ]}>
          <Ionicons name="medical" size={iconSize} color="#FFFFFF" />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
  },
  healthBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#283943',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
    elevation: 2,
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: Radius.pill,
  },
  image: {
    position: 'absolute',
  },
});
