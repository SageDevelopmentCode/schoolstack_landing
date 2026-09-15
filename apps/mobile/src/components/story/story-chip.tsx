import { StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { useParentTheme } from '@/contexts/parent-theme-context';
import { StoryFonts } from '@/constants/story-theme';

export type StoryChipTone = 'success' | 'warning' | 'alert' | 'info';

type StoryChipProps = {
  tone: StoryChipTone;
  label: string;
  style?: ViewStyle;
};

function chipColors(tone: StoryChipTone, theme: ReturnType<typeof useParentTheme>) {
  switch (tone) {
    case 'success':
      return { bg: theme.successBg, color: theme.success };
    case 'warning':
      return { bg: theme.warningBg, color: theme.warning };
    case 'alert':
      return { bg: theme.alertBg, color: theme.alert };
    case 'info':
      return { bg: theme.infoBg, color: theme.info };
  }
}

export function StoryChip({ tone, label, style }: StoryChipProps) {
  const theme = useParentTheme();
  const colors = chipColors(tone, theme);

  return (
    <View style={[styles.chip, { backgroundColor: colors.bg }, style]}>
      <Text style={[styles.label, { color: colors.color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  label: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.44,
    textTransform: 'uppercase',
  },
});
