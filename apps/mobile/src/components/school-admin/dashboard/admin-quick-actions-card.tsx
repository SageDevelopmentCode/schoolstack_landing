import * as Clipboard from 'expo-clipboard';
import { useCallback, useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { AdminCard } from '@/components/admin/admin-card';
import { ThemedText } from '@/components/themed-text';
import { useAdminTheme } from '@/contexts/admin-theme-context';
import { Spacing } from '@/constants/theme';
import { resolveWebUrl } from '@/lib/admissions/school-apply-url';
import type { DashboardQuickAction } from '@/lib/school-admin/dashboard-summary-types';

type AdminQuickActionsCardProps = {
  actions: DashboardQuickAction[];
  onPressLink: (action: Extract<DashboardQuickAction, { kind: 'link' }>) => void;
};

function CopyApplyLinkRow({
  action,
  index,
}: {
  action: Extract<DashboardQuickAction, { kind: 'copy-apply-link' }>;
  index: number;
}) {
  const theme = useAdminTheme();
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    const absoluteUrl = resolveWebUrl(action.applyFormPublicPath);
    try {
      await Clipboard.setStringAsync(absoluteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      Alert.alert('Could not copy link', 'Please try again.');
    }
  }, [action.applyFormPublicPath]);

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => void handleCopy()}
      style={({ pressed }) => [
        styles.row,
        index > 0 && styles.rowBorder,
        pressed && { opacity: 0.85 },
      ]}>
      <ThemedText type="smallBold" style={{ color: theme.textPrimary }}>
        {copied ? 'Link copied' : action.title}
      </ThemedText>
      <ThemedText type="small" style={{ color: theme.textSecondary, marginTop: 2 }}>
        {action.subtitle}
      </ThemedText>
    </Pressable>
  );
}

export function AdminQuickActionsCard({ actions, onPressLink }: AdminQuickActionsCardProps) {
  const theme = useAdminTheme();

  if (actions.length === 0) return null;

  return (
    <AdminCard>
      <ThemedText type="badge" style={{ color: theme.textTertiary, letterSpacing: 1.2 }}>
        QUICK ACTIONS
      </ThemedText>
      <ThemedText type="title" style={{ color: theme.textPrimary }}>
        Keep moving
      </ThemedText>

      <View style={styles.list}>
        {actions.map((action, index) => {
          if (action.kind === 'copy-apply-link') {
            return <CopyApplyLinkRow key={action.id} action={action} index={index} />;
          }

          return (
            <Pressable
              key={action.id}
              accessibilityRole="button"
              onPress={() => onPressLink(action)}
              style={({ pressed }) => [
                styles.row,
                index > 0 && styles.rowBorder,
                pressed && { opacity: 0.85 },
              ]}>
              <ThemedText type="smallBold" style={{ color: theme.textPrimary }}>
                {action.title}
              </ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary, marginTop: 2 }}>
                {action.subtitle}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>
    </AdminCard>
  );
}

const styles = StyleSheet.create({
  list: {
    marginTop: Spacing.two,
  },
  row: {
    paddingVertical: Spacing.three,
  },
  rowBorder: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E9EFEA',
  },
});
