import { type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useAdminTheme } from '@/contexts/admin-theme-context';
import { adminCardShadow } from '@/lib/organization-settings/build-admin-theme';
import { Radius, Spacing } from '@/constants/theme';

type AdminCardProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function AdminCard({ children, style }: AdminCardProps) {
  const theme = useAdminTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
        },
        adminCardShadow(theme),
        style,
      ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.four,
    gap: Spacing.three,
  },
});
