import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EnrollmentChecklistItemReadOnly } from '@/components/school-admin/submission-detail/enrollment-checklist-item-read-only';
import { StatusBadge } from '@/components/ui/status-badge';
import { ThemedText } from '@/components/themed-text';
import { useAdminTheme } from '@/contexts/admin-theme-context';
import { Spacing } from '@/constants/theme';
import {
  checklistItemStatusLabel,
  checklistItemTypeLabel,
  type EnrollmentChecklistItem,
  type EnrollmentChecklistItemInstance,
  type EnrollmentChecklistItemStatus,
} from '@/lib/admissions/enrollment-checklist';

type EnrollmentChecklistStepDetailSheetProps = {
  visible: boolean;
  item: EnrollmentChecklistItem | null;
  instance: EnrollmentChecklistItemInstance | null;
  onClose: () => void;
};

function statusBadgeColors(
  status: EnrollmentChecklistItemStatus,
  theme: ReturnType<typeof useAdminTheme>,
) {
  if (status === 'completed' || status === 'waived') {
    return { backgroundColor: theme.successBg, color: theme.success };
  }
  if (status === 'in_progress') {
    return { backgroundColor: theme.accentLight, color: theme.accent };
  }
  return { backgroundColor: theme.elevated, color: theme.textSecondary };
}

export function EnrollmentChecklistStepDetailSheet({
  visible,
  item,
  instance,
  onClose,
}: EnrollmentChecklistStepDetailSheetProps) {
  const theme = useAdminTheme();
  const insets = useSafeAreaInsets();

  if (!item) return null;
  const status = instance?.status ?? 'not_started';

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.container, { backgroundColor: theme.bg, paddingTop: insets.top }]}>
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <Pressable accessibilityRole="button" onPress={onClose}>
            <ThemedText type="small" style={{ color: theme.accent }}>
              Close
            </ThemedText>
          </Pressable>
          <ThemedText type="smallBold" style={{ color: theme.textPrimary }}>
            Checklist item
          </ThemedText>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.titleRow}>
            <ThemedText type="subtitle" style={{ color: theme.textPrimary, flex: 1 }}>
              {item.label}
            </ThemedText>
            <StatusBadge
              label={checklistItemStatusLabel(status)}
              colors={statusBadgeColors(status, theme)}
            />
          </View>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            {checklistItemTypeLabel(item.type)}
            {!item.required ? ' · Optional' : ''}
          </ThemedText>
          <EnrollmentChecklistItemReadOnly item={item} instance={instance} />
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerSpacer: {
    width: 48,
  },
  content: {
    padding: Spacing.four,
    gap: Spacing.three,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
});
