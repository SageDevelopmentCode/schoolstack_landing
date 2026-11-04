import { ScrollView, StyleSheet } from 'react-native';

import { StoryBottomSheet } from '@/components/story/story-bottom-sheet';
import { StoryMoreMenuIcon } from '@/components/story/more/story-more-menu-icon';
import { StoryMoreMenuSelectionRow } from '@/components/story/more/story-more-menu-selection-row';
import type { AdminStaffHoursStaffOption } from '@/lib/school-admin/staff-hours/staff-hours-types';

type SchoolAdminStaffHoursStaffPickerSheetProps = {
  visible: boolean;
  options: AdminStaffHoursStaffOption[];
  selectedStaffMemberId: string;
  onClose: () => void;
  onSelect: (staffMemberId: string) => void;
};

export function SchoolAdminStaffHoursStaffPickerSheet({
  visible,
  options,
  selectedStaffMemberId,
  onClose,
  onSelect,
}: SchoolAdminStaffHoursStaffPickerSheetProps) {
  const allSelected = selectedStaffMemberId === '';

  return (
    <StoryBottomSheet
      visible={visible}
      onClose={onClose}
      accessibilityLabel="Close staff filter">
      <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled">
        <StoryMoreMenuSelectionRow
          isFirst
          label="All staff"
          selected={allSelected}
          onPress={() => {
            onSelect('');
            onClose();
          }}
          icon={
            <StoryMoreMenuIcon name="people-outline" iconBg="#FFE4E6" iconColor="#E11D48" />
          }
        />
        {options.map((option) => (
          <StoryMoreMenuSelectionRow
            key={option.id}
            label={option.name}
            selected={selectedStaffMemberId === option.id}
            onPress={() => {
              onSelect(option.id);
              onClose();
            }}
            icon={
              <StoryMoreMenuIcon name="person-outline" iconBg="#E0F2FE" iconColor="#0284C7" />
            }
          />
        ))}
      </ScrollView>
    </StoryBottomSheet>
  );
}

const styles = StyleSheet.create({
  scroll: {
    maxHeight: 420,
  },
});
