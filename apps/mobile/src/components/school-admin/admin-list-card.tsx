import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { useAdminTheme } from '@/contexts/admin-theme-context';
import { adminCardShadow } from '@/lib/organization-settings/build-admin-theme';
import { Radius, Spacing } from '@/constants/theme';

type AdminListCardProps = {
  children: ReactNode;
  footer?: ReactNode;
};

export function AdminListCard({ children, footer }: AdminListCardProps) {
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
      ]}>
      {children}
      {footer}
    </View>
  );
}

type AdminListCardPressableProps = {
  children: ReactNode;
  onPress: () => void;
};

export function AdminListCardPressable({ children, onPress }: AdminListCardPressableProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.pressableBody, pressed && { opacity: 0.92 }]}>
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  pressableBody: {
    gap: Spacing.two,
  },
});
