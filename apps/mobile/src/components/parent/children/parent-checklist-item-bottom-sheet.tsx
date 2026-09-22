import { useCallback, useState } from 'react';

import { ParentEnrollmentChecklistItemPanel } from '@/components/parent/children/parent-enrollment-checklist-item-panel';
import { ParentBottomSheet } from '@/components/parent/parent-bottom-sheet';
import { StatusBadge } from '@/components/ui/status-badge';
import { useAdminTheme } from '@/contexts/admin-theme-context';
import {
  checklistItemStatusLabel,
  checklistItemTypeLabel,
  type EnrollmentChecklistItem,
  type EnrollmentChecklistItemInstance,
  type EnrollmentChecklistItemStatus,
  type LoadedEnrollmentChecklist,
} from '@/lib/admissions/enrollment-checklist';

type ParentChecklistItemBottomSheetProps = {
  visible: boolean;
  item: EnrollmentChecklistItem | null;
  instance: EnrollmentChecklistItemInstance | null;
  checklist: LoadedEnrollmentChecklist | null;
  organizationId: string;
  applicationId: string;
  initialSectionId?: string;
  onChecklistUpdated: (checklist: LoadedEnrollmentChecklist) => void;
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
  checklist,
  organizationId,
  applicationId,
  initialSectionId,
  onChecklistUpdated,
  onClose,
}: ParentChecklistItemBottomSheetProps) {
  const theme = useAdminTheme();
  const [activeChecklist, setActiveChecklist] = useState<LoadedEnrollmentChecklist | null>(checklist);

  const resolvedChecklist = activeChecklist ?? checklist;

  const handleChecklistUpdated = useCallback(
    (nextChecklist: LoadedEnrollmentChecklist) => {
      setActiveChecklist(nextChecklist);
      onChecklistUpdated(nextChecklist);
    },
    [onChecklistUpdated],
  );

  if (!item || !resolvedChecklist) return null;

  const resolvedInstance =
    resolvedChecklist.instances.find((row) => row.templateItemId === item.id) ?? instance;
  if (!resolvedInstance) return null;

  const status = resolvedInstance.status ?? 'not_started';
  const subtitle = `${checklistItemTypeLabel(item.type)}${!item.required ? ' · Optional' : ''}`;

  return (
    <ParentBottomSheet
      visible={visible}
      onClose={onClose}
      title={item.label}
      subtitle={subtitle}
      accessibilityLabel="Close checklist item">
      <StatusBadge label={checklistItemStatusLabel(status)} colors={statusBadgeColors(status, theme)} />
      <ParentEnrollmentChecklistItemPanel
        item={item}
        instance={resolvedInstance}
        checklist={resolvedChecklist}
        organizationId={organizationId}
        applicationId={applicationId}
        initialSectionId={initialSectionId}
        onUpdated={handleChecklistUpdated}
        onClose={onClose}
      />
    </ParentBottomSheet>
  );
}
