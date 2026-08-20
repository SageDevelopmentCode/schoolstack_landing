import { StyleSheet, View } from 'react-native';

import { useAdminTheme } from '@/contexts/admin-theme-context';
import { Spacing } from '@/constants/theme';

type AdminSectionDividerProps = {
  marginVertical?: number;
};

export function AdminSectionDivider({ marginVertical = Spacing.four }: AdminSectionDividerProps) {
  const theme = useAdminTheme();

  return (
    <View
      style={[
        styles.divider,
        {
          backgroundColor: theme.border,
          marginVertical,
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  divider: {
    height: StyleSheet.hairlineWidth,
    width: '100%',
  },
});
