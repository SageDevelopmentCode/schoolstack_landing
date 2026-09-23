import {
  SchoolAdminFridayBranchActionsSheet,
  type FridayBranchActionSheetItem,
} from '@/components/school-admin/friday-branch/school-admin-friday-branch-actions-sheet';

type SchoolAdminFridayBranchBlockActionsSheetProps = {
  visible: boolean;
  blockLabel: string;
  onClose: () => void;
  onEditBlock: () => void;
  onDuplicateBlock: () => void;
};

export function SchoolAdminFridayBranchBlockActionsSheet({
  visible,
  blockLabel,
  onClose,
  onEditBlock,
  onDuplicateBlock,
}: SchoolAdminFridayBranchBlockActionsSheetProps) {
  const actions: FridayBranchActionSheetItem[] = [
    {
      label: 'Edit block',
      subtitle: 'Change dates and details',
      icon: 'create-outline',
      iconBg: '#EDE9FE',
      iconColor: '#7C3AED',
      onPress: onEditBlock,
    },
    {
      label: 'Duplicate block',
      subtitle: 'Copy schedule to a new block',
      icon: 'copy-outline',
      iconBg: '#D1FAE5',
      iconColor: '#059669',
      onPress: onDuplicateBlock,
    },
  ];

  return (
    <SchoolAdminFridayBranchActionsSheet
      visible={visible}
      title={blockLabel}
      subtitle="Block actions"
      actions={actions}
      onClose={onClose}
    />
  );
}
