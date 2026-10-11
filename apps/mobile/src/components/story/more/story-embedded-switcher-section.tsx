import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useParentTheme } from '@/contexts/parent-theme-context';
import { StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';

type StoryEmbeddedSwitcherSectionProps = {
  kicker?: string;
  children: ReactNode;
};

export function StoryEmbeddedSwitcherSection({ kicker, children }: StoryEmbeddedSwitcherSectionProps) {
  const theme = useParentTheme();

  return (
    <View style={styles.wrap}>
      {kicker ? (
        <Text style={[styles.kicker, { color: theme.muted }]}>{kicker}</Text>
      ) : null}
      <View style={[styles.list, { borderColor: theme.line }]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: Spacing.three,
  },
  kicker: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: Spacing.one,
  },
  list: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});
