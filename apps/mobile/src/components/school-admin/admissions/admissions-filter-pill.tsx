import { Pressable, StyleSheet, Text } from 'react-native';

import { useParentTheme } from '@/contexts/parent-theme-context';
import { StoryFonts } from '@/constants/story-theme';

type AdmissionsFilterPillProps = {
  active: boolean;
  label: string;
  count?: number;
  onPress: () => void;
};

export function AdmissionsFilterPill({
  active,
  label,
  count,
  onPress,
}: AdmissionsFilterPillProps) {
  const theme = useParentTheme();
  const displayLabel = count != null ? `${label} · ${count}` : label;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[
        styles.pill,
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
    borderRadius: 9,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  label: {
    fontFamily: StoryFonts.body,
    fontSize: 11,
    lineHeight: 14,
  },
});
