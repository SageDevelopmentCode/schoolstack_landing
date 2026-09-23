import { Pressable, StyleSheet, View } from 'react-native';

import { ApplicationFormStepReadOnly } from '@/components/school-admin/submission-detail/application-form-step-read-only';
import { BottomSheetShell } from '@/components/story/bottom-sheet-shell';
import { StatusBadge } from '@/components/ui/status-badge';
import { ThemedText } from '@/components/themed-text';
import { useAdminTheme } from '@/contexts/admin-theme-context';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
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

  if (!step || !detail) return null;
  const badgeColors = stepStatusBadgeStyle(step.status, theme);

  return (
    <BottomSheetShell
      visible={visible}
      onClose={onClose}
      backgroundColor={theme.bg}
      borderColor={theme.border}
      handleColor={theme.borderStrong}
      maxHeight="85%"
      scrollContentStyle={styles.content}
      header={
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
      }>
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
    </BottomSheetShell>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
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
