import { StyleSheet, Text, View } from 'react-native';

import { useParentTheme } from '@/contexts/parent-theme-context';
import { StoryFonts } from '@/constants/story-theme';

type ParentBillingNeedsScheduleBadgeProps = {
  label: string;
  size?: 'sm' | 'md';
};

export function ParentBillingNeedsScheduleBadge({
  label,
  size = 'md',
}: ParentBillingNeedsScheduleBadgeProps) {
  const theme = useParentTheme();

  return (
    <View
      style={[
        styles.badge,
        size === 'sm' && styles.badgeSm,
        { backgroundColor: theme.warningBg, borderColor: theme.warning },
      ]}>
      <Text style={[styles.label, size === 'sm' && styles.labelSm, { color: theme.warning }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeSm: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  label: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  labelSm: {
    fontSize: 9,
  },
});
