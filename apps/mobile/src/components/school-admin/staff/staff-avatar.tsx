import { StyleSheet, Text, View } from 'react-native';

import { StoryFonts } from '@/constants/story-theme';
import { initialsFromName } from '@/lib/messages/format';

type StaffAvatarSize = 'row' | 'lg';

const SIZES: Record<StaffAvatarSize, { dimension: number; fontSize: number }> = {
  row: { dimension: 44, fontSize: 13 },
  lg: { dimension: 56, fontSize: 16 },
};

const AVATAR_PALETTE = [
  { bg: '#E2EEE3', color: '#35624D' },
  { bg: '#E3EDF2', color: '#456D7A' },
  { bg: '#F3E2E8', color: '#9C5B73' },
  { bg: '#F3EAD7', color: '#896D30' },
  { bg: '#D7C4E2', color: '#604A72' },
];

function staffAvatarColors(name: string) {
  const source = name.trim() || '?';
  let hash = 0;
  for (let index = 0; index < source.length; index += 1) {
    hash = (hash + source.charCodeAt(index) * (index + 1)) % AVATAR_PALETTE.length;
  }
  return AVATAR_PALETTE[hash];
}

type StaffAvatarProps = {
  name: string;
  size?: StaffAvatarSize;
};

export function StaffAvatar({ name, size = 'row' }: StaffAvatarProps) {
  const dimensions = SIZES[size];
  const colors = staffAvatarColors(name);

  return (
    <View
      style={[
        styles.avatar,
        {
          width: dimensions.dimension,
          height: dimensions.dimension,
          borderRadius: dimensions.dimension / 2,
          backgroundColor: colors.bg,
        },
      ]}>
      <Text
        style={[
          styles.initials,
          {
            color: colors.color,
            fontSize: dimensions.fontSize,
            lineHeight: dimensions.fontSize + 2,
          },
        ]}>
        {initialsFromName(name).slice(0, 2)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontFamily: StoryFonts.bodySemiBold,
    fontWeight: '800',
  },
});
