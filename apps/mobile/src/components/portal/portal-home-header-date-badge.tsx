import { StyleSheet, Text, View } from 'react-native';

import { useParentTheme } from '@/contexts/parent-theme-context';
import { StoryFonts } from '@/constants/story-theme';
import { Radius, Spacing } from '@/constants/theme';

const ON_PRIMARY_BADGE_BG = 'rgba(255, 255, 255, 0.18)';
const ON_PRIMARY_BADGE_BORDER = 'rgba(255, 255, 255, 0.35)';

type PortalHomeHeaderDateBadgeProps = {
  label: string;
};

export function PortalHomeHeaderDateBadge({ label }: PortalHomeHeaderDateBadgeProps) {
  const theme = useParentTheme();

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: ON_PRIMARY_BADGE_BG,
          borderColor: ON_PRIMARY_BADGE_BORDER,
        },
      ]}>
      <Text style={[styles.label, { color: theme.white }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: Radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.two,
    paddingVertical: 6,
  },
  label: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  },
});
