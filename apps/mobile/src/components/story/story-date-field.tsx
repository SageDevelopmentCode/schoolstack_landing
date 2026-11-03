import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { Story, StoryRadius, StoryFonts } from '@/constants/story-theme';
import { formatGalleryDateLabel } from '@/lib/school-gallery/format-gallery-date';
import {
  dateToGalleryPhotoDate,
  galleryPhotoDateToDate,
} from '@/lib/school-gallery/gallery-photo-date';

type StoryDateFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  minimumDate?: Date;
  maximumDate?: Date;
};

export function StoryDateField({
  label,
  value,
  onChange,
  placeholder = 'Select date',
  disabled = false,
  minimumDate,
  maximumDate,
}: StoryDateFieldProps) {
  const [iosPickerOpen, setIosPickerOpen] = useState(false);
  const [androidPickerOpen, setAndroidPickerOpen] = useState(false);

  const pickerDate = useMemo(() => {
    const parsed = galleryPhotoDateToDate(value);
    if (parsed) return parsed;
    return minimumDate ?? new Date();
  }, [minimumDate, value]);

  const hasValue = Boolean(galleryPhotoDateToDate(value));
  const displayText = hasValue ? formatGalleryDateLabel(value.trim()) : placeholder;

  const applyPickerDate = (date: Date | undefined) => {
    if (!date) return;
    onChange(dateToGalleryPhotoDate(date));
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
    if (disabled) return;
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
        accessibilityHint="Opens date picker"
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={openPicker}
        style={({ pressed }) => [
          styles.input,
          disabled && styles.inputDisabled,
          pressed && !disabled && styles.inputPressed,
        ]}>
        <Text
          style={[styles.inputText, !hasValue && styles.placeholderText]}
          numberOfLines={2}>
          {displayText}
        </Text>
      </Pressable>

      {Platform.OS === 'ios' && iosPickerOpen && !disabled ? (
        <DateTimePicker
          value={pickerDate}
          mode="date"
          display="inline"
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          onChange={handlePickerChange}
        />
      ) : null}

      {Platform.OS === 'android' && androidPickerOpen && !disabled ? (
        <DateTimePicker
          value={pickerDate}
          mode="date"
          display="default"
          minimumDate={minimumDate}
          maximumDate={maximumDate}
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
  inputDisabled: {
    opacity: 0.6,
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
