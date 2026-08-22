import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { initialsFromName } from '@/lib/messages/format';

type MessagesAvatarProps = {
  name: string;
  color: string;
  size?: 'sm' | 'md' | 'lg';
};

const SIZES = {
  sm: { dimension: 32, fontSize: 10 },
  md: { dimension: 40, fontSize: 12 },
  lg: { dimension: 44, fontSize: 14 },
} as const;

export function MessagesAvatar({ name, color, size = 'md' }: MessagesAvatarProps) {
  const dimensions = SIZES[size];

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
      <ThemedText
        type="smallBold"
        style={{ color: '#FFFFFF', fontSize: dimensions.fontSize, lineHeight: dimensions.fontSize + 2 }}>
        {initialsFromName(name)}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
