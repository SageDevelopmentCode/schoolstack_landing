import { StyleSheet, Text, View } from 'react-native';

import { useParentTheme } from '@/contexts/parent-theme-context';
import { StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';

type PortalHomeHeaderGreetingProps = {
  prefix: string;
  name: string;
  emoji?: string;
};

export function PortalHomeHeaderGreeting({ prefix, name, emoji }: PortalHomeHeaderGreetingProps) {
  const theme = useParentTheme();
  const accessibilityLabel = emoji ? `${prefix} ${name}. ${emoji}` : `${prefix} ${name}.`;

  return (
    <View
      accessible
      accessibilityRole="header"
      accessibilityLabel={accessibilityLabel}
      style={styles.container}>
      <Text style={[styles.prefix, { color: theme.white }]} numberOfLines={1}>
        {prefix},
      </Text>
      <Text style={[styles.name, { color: theme.white }]} numberOfLines={1}>
        {name}. {emoji ?? ''}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.one,
  },
  prefix: {
    fontFamily: StoryFonts.display,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600',
    letterSpacing: -0.54,
  },
  name: {
    fontFamily: StoryFonts.display,
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '600',
    letterSpacing: -0.78,
  },
});
