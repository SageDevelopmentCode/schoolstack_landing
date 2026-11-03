import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { Story, StoryRadius, StoryFonts } from '@/constants/story-theme';
import {
  dateFromDateTimeLocalValue,
  dateToDateTimeLocalValue,
  formatDateTimeLocalDisplay,
} from '@/lib/school-bulletin/bulletin-audience';

type StoryDateTimeFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minimumDate?: Date;
};

export function StoryDateTimeField({
  label,
  value,
  onChange,
  placeholder = 'Select date and time',
  minimumDate,
}: StoryDateTimeFieldProps) {
  const [iosPickerOpen, setIosPickerOpen] = useState(false);
  const [androidPickerOpen, setAndroidPickerOpen] = useState(false);

  const pickerDate = useMemo(() => {
    const parsed = dateFromDateTimeLocalValue(value);
    if (parsed) return parsed;
    const fallback = minimumDate ?? new Date();
    return fallback;
  }, [minimumDate, value]);

  const displayText = formatDateTimeLocalDisplay(value, placeholder);
  const hasValue = Boolean(value.trim());

  const applyPickerDate = (date: Date | undefined) => {
    if (!date) return;
    onChange(dateToDateTimeLocalValue(date));
  };

  const handlePickerChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setAndroidPickerOpen(false);
      if (event.type === 'dismissed') return;
      applyPickerDate(selectedDate);
      return;
    }

    applyPickerDate(selectedDate);
  };

  const openPicker = () => {
    if (Platform.OS === 'android') {
      setAndroidPickerOpen(true);
      return;
    }
    setIosPickerOpen((open) => !open);
  };

  const accessibilityValue = hasValue ? displayText : placeholder;

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}, ${accessibilityValue}`}
        accessibilityHint="Opens date and time picker"
        onPress={openPicker}
        style={({ pressed }) => [styles.input, pressed && styles.inputPressed]}>
        <Text
          style={[styles.inputText, !hasValue && styles.placeholderText]}
          numberOfLines={2}>
          {displayText}
        </Text>
      </Pressable>

      {Platform.OS === 'ios' && iosPickerOpen ? (
        <DateTimePicker
          value={pickerDate}
          mode="datetime"
          display="spinner"
          minimumDate={minimumDate}
          onChange={handlePickerChange}
        />
      ) : null}

      {Platform.OS === 'android' && androidPickerOpen ? (
        <DateTimePicker
          value={pickerDate}
          mode="datetime"
          display="default"
          minimumDate={minimumDate}
          onChange={handlePickerChange}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: 6,
  },
  label: {
    fontFamily: StoryFonts.bodyMedium,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    color: Story.ink,
  },
  input: {
    minHeight: 44,
    justifyContent: 'center',
    backgroundColor: Story.white,
    borderWidth: 1,
    borderColor: Story.line,
    borderRadius: StoryRadius.input,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  inputPressed: {
    opacity: 0.9,
  },
  inputText: {
    fontFamily: StoryFonts.body,
    fontSize: 15,
    lineHeight: 20,
    color: Story.ink,
  },
  placeholderText: {
    color: Story.muted,
  },
});
