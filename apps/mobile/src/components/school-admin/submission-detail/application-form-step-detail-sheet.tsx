import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ApplicationFormStepReadOnly } from '@/components/school-admin/submission-detail/application-form-step-read-only';
import { StatusBadge } from '@/components/ui/status-badge';
import { ThemedText } from '@/components/themed-text';
import { useAdminTheme } from '@/contexts/admin-theme-context';
import { Spacing } from '@/constants/theme';
import type { ApplicationDetail } from '@/lib/admissions/application-detail';
import type { ApplicationFormStepWithStatus } from '@/lib/admissions/application-form-steps';
import { checklistItemStatusLabel } from '@/lib/admissions/enrollment-checklist';

type ApplicationFormStepDetailSheetProps = {
  visible: boolean;
  step: ApplicationFormStepWithStatus | null;
  detail: ApplicationDetail | null;
  feeStatus: string;
  onClose: () => void;
};

function stepStatusBadgeStyle(
  status: ApplicationFormStepWithStatus['status'],
  theme: ReturnType<typeof useAdminTheme>,
) {
  if (status === 'completed') {
    return { backgroundColor: theme.successBg, color: theme.success };
  }
  if (status === 'in_progress') {
    return { backgroundColor: theme.accentLight, color: theme.accent };
  }
  return { backgroundColor: theme.elevated, color: theme.textSecondary };
}

export function ApplicationFormStepDetailSheet({
  visible,
  step,
  detail,
  feeStatus,
  onClose,
}: ApplicationFormStepDetailSheetProps) {
  const theme = useAdminTheme();
  const insets = useSafeAreaInsets();

  if (!step || !detail) return null;
  const badgeColors = stepStatusBadgeStyle(step.status, theme);

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
            Step details
          </ThemedText>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.titleRow}>
            <ThemedText type="subtitle" style={{ color: theme.textPrimary, flex: 1 }}>
              {step.label}
            </ThemedText>
            <StatusBadge
              label={checklistItemStatusLabel(step.status)}
              colors={badgeColors}
            />
          </View>
          <ApplicationFormStepReadOnly step={step} detail={detail} feeStatus={feeStatus} />
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
    gap: Spacing.four,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
});
