import { ApplicationFormStepReadOnly } from '@/components/school-admin/submission-detail/application-form-step-read-only';
import { StatusBadge } from '@/components/ui/status-badge';
import { useAdminTheme } from '@/contexts/admin-theme-context';
import type { ApplicationDetail } from '@/lib/admissions/application-detail';
import type { ApplicationFormStepWithStatus } from '@/lib/admissions/application-form-steps';
import { checklistItemStatusLabel } from '@/lib/admissions/enrollment-checklist';

import { ParentBottomSheet } from '@/components/parent/parent-bottom-sheet';

type ParentApplicationStepBottomSheetProps = {
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

export function ParentApplicationStepBottomSheet({
  visible,
  step,
  detail,
  feeStatus,
  onClose,
}: ParentApplicationStepBottomSheetProps) {
  const theme = useAdminTheme();

  if (!step || !detail) return null;

  const badgeColors = stepStatusBadgeStyle(step.status, theme);

  return (
    <ParentBottomSheet
      visible={visible}
      onClose={onClose}
      title={step.label}
      subtitle={checklistItemStatusLabel(step.status)}
      accessibilityLabel="Close step details">
      <StatusBadge label={checklistItemStatusLabel(step.status)} colors={badgeColors} />
      <ApplicationFormStepReadOnly step={step} detail={detail} feeStatus={feeStatus} />
    </ParentBottomSheet>
  );
}
