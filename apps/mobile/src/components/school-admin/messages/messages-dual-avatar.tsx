import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { initialsFromName } from '@/lib/messages/format';
import { resolveOrganizationAssetUrl } from '@/lib/resolve-asset-url';
import type { MessageThreadListAvatar } from '@/lib/messages/types';

type MessagesDualAvatarProps = {
  avatars: MessageThreadListAvatar[];
  size?: 'sm' | 'md' | 'lg';
};

const SIZES = {
  sm: { dimension: 32, fontSize: 10 },
  md: { dimension: 40, fontSize: 12 },
  lg: { dimension: 44, fontSize: 14 },
} as const;

export function MessagesDualAvatar({ avatars, size = 'sm' }: MessagesDualAvatarProps) {
  const [first, second] = avatars;
  if (!first || !second) return null;

  const dimensions = SIZES[size];
  const containerWidth = dimensions.dimension + 16;

  const renderAvatar = (avatar: MessageThreadListAvatar) => {
    const resolvedUrl = avatar.profilePhotoUrl
      ? resolveOrganizationAssetUrl(avatar.profilePhotoUrl)
      : '';

    if (resolvedUrl) {
      return (
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
          accessibilityLabel={`Photo of ${avatar.name}`}
        />
      );
    }

    return (
      <ThemedText
        type="smallBold"
        style={{
          color: '#FFFFFF',
          fontSize: dimensions.fontSize,
          lineHeight: dimensions.fontSize + 2,
        }}>
        {initialsFromName(avatar.name)}
      </ThemedText>
    );
  };

  return (
    <View
      style={[styles.container, { width: containerWidth, height: dimensions.dimension }]}
      accessibilityLabel={`${first.name} and ${second.name}`}
      accessibilityRole="image">
      <View
        style={[
          styles.avatar,
          styles.avatarLeft,
          {
            width: dimensions.dimension,
            height: dimensions.dimension,
            borderRadius: dimensions.dimension / 2,
            backgroundColor: first.color,
          },
        ]}>
        {renderAvatar(first)}
      </View>
      <View
        style={[
          styles.avatar,
          styles.avatarRight,
          {
            width: dimensions.dimension,
            height: dimensions.dimension,
            borderRadius: dimensions.dimension / 2,
            backgroundColor: second.color,
          },
        ]}>
        {renderAvatar(second)}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  avatar: {
    position: 'absolute',
    top: 0,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  avatarLeft: {
    left: 0,
  },
  avatarRight: {
    left: 16,
  },
  image: {
    position: 'absolute',
  },
});
