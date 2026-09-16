import { Pressable, StyleSheet, Text } from 'react-native';

import { useParentTheme } from '@/contexts/parent-theme-context';
import { StoryFonts } from '@/constants/story-theme';

type AdmissionsFilterPillProps = {
  active: boolean;
  label: string;
  count?: number;
  onPress: () => void;
  size?: 'default' | 'large';
};

export function AdmissionsFilterPill({
  active,
  label,
  count,
  onPress,
  size = 'default',
}: AdmissionsFilterPillProps) {
  const theme = useParentTheme();
  const displayLabel = count != null ? `${label} · ${count}` : label;
  const isLarge = size === 'large';

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[
        styles.pill,
        isLarge ? styles.pillLarge : styles.pillDefault,
        active
          ? {
              backgroundColor: '#E9F2EA',
              borderColor: '#BCD4C1',
            }
          : {
              backgroundColor: theme.white,
              borderColor: '#DCE4DC',
            },
      ]}>
      <Text
        style={[
          styles.label,
          isLarge ? styles.labelLarge : styles.labelDefault,
          active
            ? { color: theme.primary, fontWeight: '700' }
            : { color: '#5D6D73', fontWeight: '500' },
        ]}>
        {displayLabel}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    borderWidth: 1,
  },
  pillDefault: {
    borderRadius: 9,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  pillLarge: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 44,
    justifyContent: 'center',
  },
  label: {
    fontFamily: StoryFonts.body,
  },
  labelDefault: {
    fontSize: 11,
    lineHeight: 14,
  },
  labelLarge: {
    fontSize: 13,
    lineHeight: 18,
  },
});
