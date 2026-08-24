import { EnrollmentChecklistItemReadOnly } from '@/components/school-admin/submission-detail/enrollment-checklist-item-read-only';
import { StatusBadge } from '@/components/ui/status-badge';
import { useAdminTheme } from '@/contexts/admin-theme-context';
import {
  checklistItemStatusLabel,
  checklistItemTypeLabel,
  type EnrollmentChecklistItem,
  type EnrollmentChecklistItemInstance,
  type EnrollmentChecklistItemStatus,
} from '@/lib/admissions/enrollment-checklist';

import { ParentBottomSheet } from '@/components/parent/parent-bottom-sheet';

type ParentChecklistItemBottomSheetProps = {
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

export function ParentChecklistItemBottomSheet({
  visible,
  item,
  instance,
  onClose,
}: ParentChecklistItemBottomSheetProps) {
  const theme = useAdminTheme();

  if (!item) return null;

  const status = instance?.status ?? 'not_started';
  const subtitle = `${checklistItemTypeLabel(item.type)}${!item.required ? ' · Optional' : ''}`;

  return (
    <ParentBottomSheet
      visible={visible}
      onClose={onClose}
      title={item.label}
      subtitle={subtitle}
      accessibilityLabel="Close checklist item">
      <StatusBadge label={checklistItemStatusLabel(status)} colors={statusBadgeColors(status, theme)} />
      <EnrollmentChecklistItemReadOnly item={item} instance={instance} />
    </ParentBottomSheet>
  );
}
