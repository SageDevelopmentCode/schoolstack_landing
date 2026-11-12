import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { Story, StoryRadius, StoryFonts } from '@/constants/story-theme';

type StoryTimeFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
};

export function formatClockLabel(value: string): string {
  const date = dateFromTimeValue(value);
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export function dateFromTimeValue(value: string): Date {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  const date = new Date();
  const hour = match ? Number(match[1]) : 8;
  const minute = match ? Number(match[2]) : 0;
  date.setHours(hour, minute, 0, 0);
  return date;
}

export function timeValueFromDate(date: Date): string {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

export function StoryTimeField({ label, value, onChange }: StoryTimeFieldProps) {
  const [iosPickerOpen, setIosPickerOpen] = useState(false);
  const [androidPickerOpen, setAndroidPickerOpen] = useState(false);
  const pickerDate = useMemo(() => dateFromTimeValue(value), [value]);
  const displayText = formatClockLabel(value);

  const applyPickerDate = (date: Date | undefined) => {
    if (!date) return;
    onChange(timeValueFromDate(date));
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

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}, ${displayText}`}
        accessibilityHint="Opens time picker"
        onPress={() => {
          if (Platform.OS === 'android') {
            setAndroidPickerOpen(true);
            return;
          }
          setIosPickerOpen((open) => !open);
        }}
        style={({ pressed }) => [styles.input, pressed && styles.inputPressed]}>
        <Text style={styles.inputText}>{displayText}</Text>
      </Pressable>
      {Platform.OS === 'ios' && iosPickerOpen ? (
        <DateTimePicker
          value={pickerDate}
          mode="time"
          display="spinner"
          onChange={handlePickerChange}
        />
      ) : null}
      {Platform.OS === 'android' && androidPickerOpen ? (
        <DateTimePicker
          value={pickerDate}
          mode="time"
          display="default"
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
});
