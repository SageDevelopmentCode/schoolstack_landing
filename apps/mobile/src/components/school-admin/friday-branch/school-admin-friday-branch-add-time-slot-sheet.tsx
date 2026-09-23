import { useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

import { StoryBottomSheet } from '@/components/story/story-bottom-sheet';
import { StoryButton } from '@/components/story/story-button';
import { AdmissionsFilterPill } from '@/components/school-admin/admissions/admissions-filter-pill';
import { StoryTextField } from '@/components/story/story-text-field';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { buildFridayBranchClassSavePayload } from '@/lib/school-admin/friday-branch/friday-branch-class-save';
import type { FridayBranchTimeSlot } from '@/lib/school-admin/friday-branch/friday-branch-types';
import {
  createEmptyClass,
  getAvailableQuickPickTimes,
  slotTimeExists,
  suggestNextSlotTime,
  type FridayBranchFirstClassSeed,
} from '@/lib/school-admin/friday-branch/friday-branch-utils';
import { StoryFonts } from '@/constants/story-theme';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { Spacing } from '@/constants/theme';

export type FridayBranchAddTimeSlotPayload = {
  time: string;
  firstClass?: FridayBranchFirstClassSeed;
};

type SchoolAdminFridayBranchAddTimeSlotSheetProps = {
  visible: boolean;
  slots: FridayBranchTimeSlot[];
  saving?: boolean;
  onClose: () => void;
  onSave: (payload: FridayBranchAddTimeSlotPayload) => Promise<void>;
};

export function SchoolAdminFridayBranchAddTimeSlotSheet({
  visible,
  slots,
  saving = false,
  onClose,
  onSave,
}: SchoolAdminFridayBranchAddTimeSlotSheetProps) {
  const theme = useParentTheme();
  const [time, setTime] = useState('9:00');
  const [className, setClassName] = useState('');
  const [location, setLocation] = useState('');
  const [ageGroup, setAgeGroup] = useState('');
  const [teacher, setTeacher] = useState('');
  const [priceInput, setPriceInput] = useState('');
  const [priceError, setPriceError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setTime(suggestNextSlotTime(slots));
    setClassName('');
    setLocation('');
    setAgeGroup('');
    setTeacher('');
    setPriceInput('');
    setPriceError(null);
  }, [slots, visible]);

  const quickPicks = useMemo(() => getAvailableQuickPickTimes(slots), [slots]);
  const isBusy = saving || isSaving;

  const handleSave = async () => {
    if (isBusy) return;

    const trimmedTime = time.trim();
    if (!trimmedTime) {
      Alert.alert('Time required', 'Enter a time for this slot.');
      return;
    }

    if (slotTimeExists(slots, trimmedTime)) {
      Alert.alert('Time already used', 'Choose a different time for this block.');
      return;
    }

       let firstClass: FridayBranchFirstClassSeed | undefined;
    if (
      className.trim() ||
      location.trim() ||
      ageGroup.trim() ||
      teacher.trim() ||
      priceInput.trim()
    ) {
      const draftClass = createEmptyClass();
      draftClass.name = className.trim();
      draftClass.location = location.trim();
      draftClass.ageGroup = ageGroup.trim();
      draftClass.teacher = teacher.trim();

      const payload = buildFridayBranchClassSavePayload(draftClass, priceInput);
      if ('error' in payload) {
        setPriceError(payload.error);
        return;
      }

      firstClass = {
        id: payload.id,
        name: payload.name,
        location: payload.location,
        ageGroup: payload.ageGroup,
        teacher: payload.teacher,
        priceCents: payload.priceCents,
      };
    }

    setIsSaving(true);
    try {
      await onSave({ time: trimmedTime, firstClass });
      onClose();
    } catch {
      // Parent surfaces the error.
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <StoryBottomSheet visible={visible} onClose={onClose} accessibilityLabel="Close add time slot">
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={[styles.title, { color: theme.ink }]}>Add time slot</Text>
        <Text style={[styles.subtitle, { color: theme.muted }]}>
          Set the time and optionally add the first class in this slot.
        </Text>

        <StoryTextField
          label="Time"
          value={time}
          onChangeText={setTime}
          placeholder="9:00"
          autoCapitalize="none"
        />

        {quickPicks.length > 0 ? (
          <View style={styles.quickPicks}>
            {quickPicks.map((pick) => (
              <AdmissionsFilterPill
                key={pick}
                label={pick}
                active={time === pick}
                onPress={() => setTime(pick)}
              />
            ))}
          </View>
        ) : null}

        <StoryTextField
          label="First class name (optional)"
          value={className}
          onChangeText={setClassName}
          placeholder="e.g. Bookworms"
        />
        <StoryTextField
          label="Location"
          value={location}
          onChangeText={setLocation}
          placeholder="e.g. La Casita"
        />
        <StoryTextField
          label="Age group"
          value={ageGroup}
          onChangeText={setAgeGroup}
          placeholder="e.g. K–3"
        />
        <StoryTextField
          label="Class leader"
          value={teacher}
          onChangeText={setTeacher}
          placeholder="Staff or volunteer"
        />
        <StoryTextField
          label="Price (optional)"
          value={priceInput}
          onChangeText={(value) => {
            setPriceInput(value);
            setPriceError(null);
          }}
          placeholder="0.00"
          keyboardType="decimal-pad"
        />
        {priceError ? <Text style={[styles.error, { color: theme.alert }]}>{priceError}</Text> : null}

        <View style={styles.actions}>
          <StoryButton label="Cancel" variant="outline" previewSafe onPress={onClose} />
          <StoryButton
            label={isBusy ? 'Saving…' : 'Add slot'}
            previewSafe
            disabled={isBusy}
            onPress={() => void handleSave()}
          />
        </View>
      </ScrollView>
    </StoryBottomSheet>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingBottom: Spacing.six,
    gap: Spacing.four,
  },
  title: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 18,
    fontWeight: '600',
  },
  subtitle: {
    fontFamily: StoryFonts.body,
    fontSize: 13,
    lineHeight: 18,
    marginTop: -Spacing.two,
  },
  quickPicks: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    marginTop: -Spacing.two,
  },
  error: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
    lineHeight: 16,
  },
  actions: {
    gap: Spacing.three,
  },
});
