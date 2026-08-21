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
};

const SIZE_MAP: Record<StudentPhotoSize, { dimension: number; fontSize: number }> = {
  sm: { dimension: 32, fontSize: 11 },
  md: { dimension: 40, fontSize: 13 },
  row: { dimension: 44, fontSize: 14 },
  lg: { dimension: 56, fontSize: 18 },
};

function studentInitialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ''}${parts[parts.length - 1][0] ?? ''}`.toUpperCase();
}

export function StudentPhoto({ name, photoUrl, size = 'md' }: StudentPhotoProps) {
  const theme = useAdminTheme();
  const { dimension, fontSize } = SIZE_MAP[size];
  const resolvedUrl = photoUrl ? resolveOrganizationAssetUrl(photoUrl) : '';

  return (
    <View
      style={[
        styles.container,
        {
          width: dimension,
          height: dimension,
          borderRadius: dimension / 2,
          backgroundColor: theme.accentLight,
        },
      ]}>
      {resolvedUrl ? (
        <Image
          source={{ uri: resolvedUrl }}
          style={[styles.image, { width: dimension, height: dimension, borderRadius: dimension / 2 }]}
          contentFit="cover"
          accessibilityLabel={`Photo of ${name}`}
        />
      ) : (
        <ThemedText
          type="smallBold"
          style={{ color: theme.accent, fontSize, lineHeight: fontSize + 2 }}>
          {studentInitialsFromName(name)}
        </ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
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
