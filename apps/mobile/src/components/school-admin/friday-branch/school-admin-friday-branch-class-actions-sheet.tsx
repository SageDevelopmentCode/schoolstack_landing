import type { FridayBranchClass } from '@/lib/school-admin/friday-branch/friday-branch-types';

import {
  SchoolAdminFridayBranchActionsSheet,
  type FridayBranchActionSheetItem,
} from '@/components/school-admin/friday-branch/school-admin-friday-branch-actions-sheet';

type SchoolAdminFridayBranchClassActionsSheetProps = {
  visible: boolean;
  classEntry: FridayBranchClass | null;
  onClose: () => void;
  onEditClass: () => void;
  onViewRoster: () => void;
  onSendRoster: () => void;
  onRemoveClass: () => void;
};

export function SchoolAdminFridayBranchClassActionsSheet({
  visible,
  classEntry,
  onClose,
  onEditClass,
  onViewRoster,
  onSendRoster,
  onRemoveClass,
}: SchoolAdminFridayBranchClassActionsSheetProps) {
  const className = classEntry?.name || 'Untitled class';

  const actions: FridayBranchActionSheetItem[] = [
    {
      label: 'Edit class',
      subtitle: 'Update details and flyer',
      icon: 'pencil-outline',
      iconBg: '#EDE9FE',
      iconColor: '#7C3AED',
      onPress: onEditClass,
    },
    {
      label: 'View roster',
      subtitle: 'See enrolled families',
      icon: 'people-outline',
      iconBg: '#E0F2FE',
      iconColor: '#0284C7',
      onPress: onViewRoster,
    },
    {
      label: 'Send roster',
      subtitle: 'Email roster to leader',
      icon: 'mail-outline',
      iconBg: '#D1FAE5',
      iconColor: '#059669',
      onPress: onSendRoster,
    },
    {
      label: 'Remove class',
      subtitle: 'Remove from this time slot',
      icon: 'trash-outline',
      iconBg: '#FFE4E6',
      iconColor: '#E11D48',
      destructive: true,
      onPress: onRemoveClass,
    },
  ];

  return (
    <SchoolAdminFridayBranchActionsSheet
      visible={visible}
      title={className}
      subtitle="Class actions"
      actions={actions}
      onClose={onClose}
    />
  );
}
