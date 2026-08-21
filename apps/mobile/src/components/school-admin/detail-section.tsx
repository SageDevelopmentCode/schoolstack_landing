import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useAdminTheme } from '@/contexts/admin-theme-context';
import { Spacing } from '@/constants/theme';

type DetailSectionProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

export function DetailSection({ title, description, children }: DetailSectionProps) {
  const theme = useAdminTheme();

  return (
    <View style={styles.section}>
      <ThemedText type="badge" style={{ color: theme.accent }}>
        {title}
      </ThemedText>
      {description ? (
        <ThemedText type="small" style={{ color: theme.textTertiary }}>
          {description}
        </ThemedText>
      ) : null}
      <View style={styles.body}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: Spacing.two,
  },
  body: {
    gap: Spacing.two,
  },
});
