import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { initialsFromName } from '@/lib/messages/format';
import { resolveOrganizationAssetUrl } from '@/lib/resolve-asset-url';

type MessagesAvatarProps = {
  name: string;
  color: string;
  photoUrl?: string | null;
  size?: 'sm' | 'md' | 'lg';
};

const SIZES = {
  sm: { dimension: 32, fontSize: 10 },
  md: { dimension: 40, fontSize: 12 },
  lg: { dimension: 44, fontSize: 14 },
} as const;

export function MessagesAvatar({ name, color, photoUrl, size = 'md' }: MessagesAvatarProps) {
  const dimensions = SIZES[size];
  const resolvedUrl = photoUrl ? resolveOrganizationAssetUrl(photoUrl) : '';

  return (
    <View
      style={[
        styles.avatar,
        {
          width: dimensions.dimension,
          height: dimensions.dimension,
          borderRadius: dimensions.dimension / 2,
          backgroundColor: color,
        },
      ]}>
      {resolvedUrl ? (
        <Image
          source={{ uri: resolvedUrl }}
          style={[
            styles.image,
            {
              width: dimensions.dimension,
              height: dimensions.dimension,
              borderRadius: dimensions.dimension / 2,
            },
          ]}
          contentFit="cover"
          accessibilityLabel={`Photo of ${name}`}
        />
      ) : (
        <ThemedText
          type="smallBold"
          style={{
            color: '#FFFFFF',
            fontSize: dimensions.fontSize,
            lineHeight: dimensions.fontSize + 2,
          }}>
          {initialsFromName(name)}
        </ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: {
    position: 'absolute',
  },
});
