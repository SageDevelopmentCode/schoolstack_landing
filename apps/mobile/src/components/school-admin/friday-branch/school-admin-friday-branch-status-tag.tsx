import { StyleSheet, Text, View } from 'react-native';

import type { FridayBranchStatusTagVariant } from '@/lib/school-admin/friday-branch/friday-branch-types';
import { StoryFonts } from '@/constants/story-theme';
import { Radius, Spacing } from '@/constants/theme';

const VARIANT_STYLES: Record<
  FridayBranchStatusTagVariant,
  { backgroundColor: string; color: string }
> = {
  green: { backgroundColor: '#DCFCE7', color: '#166534' },
  blue: { backgroundColor: '#DBEAFE', color: '#1D4ED8' },
  amber: { backgroundColor: '#FEF3C7', color: '#B45309' },
  purple: { backgroundColor: '#EDE9FE', color: '#6D28D9' },
  rose: { backgroundColor: '#FFE4E6', color: '#BE123C' },
};

type SchoolAdminFridayBranchStatusTagProps = {
  label: string;
  variant: FridayBranchStatusTagVariant;
};

export function SchoolAdminFridayBranchStatusTag({
  label,
  variant,
}: SchoolAdminFridayBranchStatusTagProps) {
  const colors = VARIANT_STYLES[variant];

  return (
    <View style={[styles.tag, { backgroundColor: colors.backgroundColor }]}>
      <Text style={[styles.label, { color: colors.color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    alignSelf: 'flex-start',
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.two,
    paddingVertical: 2,
  },
  label: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 10,
    fontWeight: '600',
    lineHeight: 14,
  },
});
