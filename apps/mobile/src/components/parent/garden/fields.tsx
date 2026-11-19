import { Ionicons } from '@expo/vector-icons';
import { DateTimePicker, type DateTimePickerEvent } from '@/components/native/date-time-picker';
import { forwardRef, useMemo, useState, type ReactNode } from 'react';
import {
  Platform,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';

import { Garden, GardenFonts, useGardenAccent } from '@/components/parent/garden/tokens';
import { GPressable } from '@/components/parent/garden/ui';
import { haptic } from '@/lib/haptics';
import { formatGalleryDateLabel } from '@/lib/school-gallery/format-gallery-date';
import {
  dateToGalleryPhotoDate,
  galleryPhotoDateToDate,
} from '@/lib/school-gallery/gallery-photo-date';

type IoniconName = keyof typeof Ionicons.glyphMap;

/* ------------------------------------------------------------------ */
/* Label + helper/error                                                */
/* ------------------------------------------------------------------ */

function FieldLabel({ label, optional }: { label: string; optional?: boolean }) {
  return (
    <Text style={styles.label}>
      {label}
      {optional ? <Text style={styles.optional}> · optional</Text> : null}
    </Text>
  );
}

function FieldFoot({ helper, error }: { helper?: string; error?: string | null }) {
  if (error) {
    return (
      <View style={styles.footRow} accessibilityLiveRegion="polite">
        <Ionicons name="alert-circle" size={14} color="#7E4533" />
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }
  if (helper) return <Text style={styles.helper}>{helper}</Text>;
  return null;
}

/* ------------------------------------------------------------------ */
/* Text field                                                          */
/* ------------------------------------------------------------------ */

export type GTextFieldProps = Omit<TextInputProps, 'style' | 'onChange'> & {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  helper?: string;
  error?: string | null;
  optional?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** Garden text input: paper face, ink hairline, accent ring while focused, inline error. */
export const GTextField = forwardRef<TextInput, GTextFieldProps>(function GTextField(
  { label, helper, error, optional, disabled = false, multiline, style, onFocus, onBlur, ...rest },
  ref,
) {
  const accent = useGardenAccent();
  const [focused, setFocused] = useState(false);
  const borderColor = error ? '#C2714F' : focused ? accent.clay : Garden.ink15;

  return (
    <View style={[styles.field, style]}>
      <FieldLabel label={label} optional={optional} />
      <TextInput
        ref={ref}
        {...rest}
        multiline={multiline}
        editable={!disabled}
        accessibilityLabel={rest.accessibilityLabel ?? label}
        accessibilityHint={error ?? rest.accessibilityHint}
        placeholderTextColor={Garden.ink60}
        onFocus={(event) => {
          setFocused(true);
          onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          onBlur?.(event);
        }}
        style={[
          styles.input,
          multiline && styles.inputMultiline,
          { borderColor, borderWidth: focused || error ? 2 : 1.5 },
          disabled && styles.inputDisabled,
        ]}
      />
      <FieldFoot helper={helper} error={error} />
    </View>
  );
});

/* ------------------------------------------------------------------ */
/* Choice chips (radio group)                                          */
/* ------------------------------------------------------------------ */

export type GChoiceOption<Id extends string> = {
  id: Id;
  label: string;
  description?: string | null;
  icon?: IoniconName;
  testID?: string;
};

/**
 * A radio group as chips (`layout="wrap"`) or full-width cards (`layout="stack"`).
 * `onBlocked` runs instead of `onChange` while disabled (e.g. the read-only toast).
 */
export function GChoiceChips<Id extends string>({
  label,
  options,
  value,
  onChange,
  layout = 'wrap',
  disabled = false,
  onBlocked,
  helper,
  style,
}: {
  label?: string;
  options: GChoiceOption<Id>[];
  value: Id | null;
  onChange: (id: Id) => void;
  layout?: 'wrap' | 'stack';
  disabled?: boolean;
  onBlocked?: () => void;
  helper?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const accent = useGardenAccent();
  return (
    <View style={[styles.field, style]}>
      {label ? <FieldLabel label={label} /> : null}
      <View
        accessibilityRole="radiogroup"
        accessibilityLabel={label}
        style={layout === 'wrap' ? styles.chipWrap : styles.chipStack}>
        {options.map((option) => {
          const selected = option.id === value;
          return (
            <GPressable
              key={option.id}
              testID={option.testID}
              accessibilityRole="radio"
              accessibilityLabel={
                option.description ? `${option.label}. ${option.description}` : option.label
              }
              accessibilityState={{ checked: selected, disabled }}
              haptic="none"
              pressedScale={0.97}
              onPress={() => {
                if (disabled) {
                  onBlocked?.();
                  return;
                }
                if (selected) return;
                haptic.select();
                onChange(option.id);
              }}
              style={[
                layout === 'wrap' ? styles.chip : styles.choiceCard,
                selected
                  ? { backgroundColor: accent.peach, borderColor: accent.clay }
                  : { backgroundColor: Garden.white, borderColor: Garden.ink15 },
                disabled && !selected && styles.dimmed,
              ]}>
              {layout === 'stack' ? (
                <View
                  style={[
                    styles.radio,
                    { borderColor: selected ? accent.clay : Garden.ink60 },
                  ]}>
                  {selected ? (
                    <View style={[styles.radioDot, { backgroundColor: accent.clay }]} />
                  ) : null}
                </View>
              ) : selected ? (
                <Ionicons name="checkmark" size={14} color={accent.clayDeep} />
              ) : option.icon ? (
                <Ionicons name={option.icon} size={14} color={Garden.ink} />
              ) : null}
              <View style={layout === 'stack' ? styles.choiceCopy : undefined}>
                <Text
                  style={[
                    styles.chipLabel,
                    selected && { color: accent.clayDeep },
                  ]}
                  numberOfLines={layout === 'wrap' ? 1 : 2}>
                  {option.label}
                </Text>
                {layout === 'stack' && option.description ? (
                  <Text style={styles.choiceDescription} numberOfLines={3}>
                    {option.description}
                  </Text>
                ) : null}
              </View>
            </GPressable>
          );
        })}
      </View>
      <FieldFoot helper={helper} />
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Check row + switch row                                              */
/* ------------------------------------------------------------------ */

export function GCheckRow({
  label,
  meta,
  checked,
  onToggle,
  disabled = false,
  onBlocked,
  testID,
}: {
  label: string;
  meta?: string | null;
  checked: boolean;
  onToggle: () => void;
  disabled?: boolean;
  onBlocked?: () => void;
  testID?: string;
}) {
  const accent = useGardenAccent();
  return (
    <GPressable
      testID={testID}
      accessibilityRole="checkbox"
      accessibilityLabel={meta ? `${label}, ${meta}` : label}
      accessibilityState={{ checked, disabled }}
      haptic="select"
      pressedScale={0.99}
      onPress={() => (disabled ? onBlocked?.() : onToggle())}
      style={[styles.checkRow, disabled && styles.dimmed]}>
      <View
        style={[
          styles.checkBox,
          checked
            ? { backgroundColor: accent.clay, borderColor: accent.clay }
            : { backgroundColor: Garden.white, borderColor: Garden.ink60 },
        ]}>
        {checked ? <Ionicons name="checkmark" size={15} color={Garden.white} /> : null}
      </View>
      <View style={styles.choiceCopy}>
        <Text style={styles.chipLabel}>{label}</Text>
        {meta ? <Text style={styles.choiceDescription}>{meta}</Text> : null}
      </View>
    </GPressable>
  );
}

export function GSwitchRow({
  label,
  meta,
  value,
  onValueChange,
  disabled = false,
}: {
  label: string;
  meta?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}) {
  const accent = useGardenAccent();
  return (
    <View style={styles.switchRow}>
      <View style={styles.choiceCopy}>
        <Text style={styles.chipLabel}>{label}</Text>
        {meta ? <Text style={styles.choiceDescription}>{meta}</Text> : null}
      </View>
      <Switch
        accessibilityLabel={label}
        value={value}
        disabled={disabled}
        onValueChange={(next) => {
          haptic.select();
          onValueChange(next);
        }}
        trackColor={{ true: accent.clay, false: Garden.ink15 }}
        thumbColor={Garden.white}
        ios_backgroundColor={Garden.ink15}
      />
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Date field                                                          */
/* ------------------------------------------------------------------ */

/** Same value format and picker behaviour as `StoryDateField` (YYYY-MM-DD), Garden styled. */
export function GDateField({
  label,
  value,
  onChange,
  placeholder = 'Select date',
  disabled = false,
  clearable = false,
  optional,
  helper,
  minimumDate,
  maximumDate,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  clearable?: boolean;
  optional?: boolean;
  helper?: string;
  minimumDate?: Date;
  maximumDate?: Date;
}) {
  const accent = useGardenAccent();
  const [iosOpen, setIosOpen] = useState(false);
  const [androidOpen, setAndroidOpen] = useState(false);

  const pickerDate = useMemo(
    () => galleryPhotoDateToDate(value) ?? minimumDate ?? new Date(),
    [minimumDate, value],
  );
  const hasValue = Boolean(galleryPhotoDateToDate(value));
  const display = hasValue ? formatGalleryDateLabel(value.trim()) : placeholder;
  const showClear = clearable && hasValue && !disabled;

  const apply = (date: Date | undefined) => {
    if (date) onChange(dateToGalleryPhotoDate(date));
  };

  const onPickerChange = (event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === 'android') {
      setAndroidOpen(false);
      if (event.type === 'dismissed') return;
    }
    apply(selected);
  };

  return (
    <View style={styles.field}>
      <FieldLabel label={label} optional={optional} />
      <View style={styles.dateShell}>
        <GPressable
          accessibilityLabel={`${label}, ${display}`}
          accessibilityHint="Opens date picker"
          accessibilityState={{ disabled, expanded: iosOpen }}
          disabled={disabled}
          haptic="select"
          pressedScale={0.99}
          onPress={() =>
            Platform.OS === 'android' ? setAndroidOpen(true) : setIosOpen((open) => !open)
          }
          style={[
            styles.input,
            styles.dateInput,
            {
              borderColor: iosOpen ? accent.clay : Garden.ink15,
              borderWidth: iosOpen ? 2 : 1.5,
            },
            showClear && styles.dateInputWithClear,
            disabled && styles.inputDisabled,
          ]}>
          <Ionicons name="calendar-outline" size={17} color={accent.clayDeep} />
          <Text style={[styles.dateText, !hasValue && styles.placeholder]} numberOfLines={1}>
            {display}
          </Text>
        </GPressable>
        {showClear ? (
          <GPressable
            accessibilityLabel={`Clear ${label}`}
            hitSlop={10}
            onPress={() => {
              onChange('');
              setIosOpen(false);
            }}
            style={styles.clear}>
            <Ionicons name="close-circle" size={20} color={Garden.ink60} />
          </GPressable>
        ) : null}
      </View>
      {Platform.OS === 'ios' && iosOpen && !disabled ? (
        <DateTimePicker
          value={pickerDate}
          mode="date"
          display="inline"
          accentColor={accent.clay}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          onChange={onPickerChange}
        />
      ) : null}
      {Platform.OS === 'android' && androidOpen && !disabled ? (
        <DateTimePicker
          value={pickerDate}
          mode="date"
          display="default"
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          onChange={onPickerChange}
        />
      ) : null}
      <FieldFoot helper={helper} />
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Time field                                                          */
/* ------------------------------------------------------------------ */

function timeValueToDate(value: string): Date {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  const date = new Date();
  date.setHours(match ? Number(match[1]) : 8, match ? Number(match[2]) : 0, 0, 0);
  return date;
}

/** "08:30" → "8:30 AM" (same label as `StoryTimeField`). */
export function formatTimeValue(value: string): string {
  return timeValueToDate(value).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

/**
 * Same value format (`HH:mm`) and picker behaviour as `StoryTimeField` (iOS
 * spinner toggled inline, Android dialog), Garden styled, with an inline error.
 */
export function GTimeField({
  label,
  value,
  onChange,
  error,
  disabled = false,
  testID,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
  disabled?: boolean;
  testID?: string;
}) {
  const accent = useGardenAccent();
  const [iosOpen, setIosOpen] = useState(false);
  const [androidOpen, setAndroidOpen] = useState(false);
  const pickerDate = useMemo(() => timeValueToDate(value), [value]);
  const display = formatTimeValue(value);

  const onPickerChange = (event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === 'android') {
      setAndroidOpen(false);
      if (event.type === 'dismissed') return;
    }
    if (selected) {
      onChange(
        `${String(selected.getHours()).padStart(2, '0')}:${String(selected.getMinutes()).padStart(2, '0')}`,
      );
    }
  };

  return (
    <View style={styles.field}>
      <FieldLabel label={label} />
      <GPressable
        testID={testID}
        accessibilityLabel={`${label}, ${display}`}
        accessibilityHint={iosOpen ? 'Closes time picker' : 'Opens time picker'}
        accessibilityState={{ disabled, expanded: iosOpen }}
        disabled={disabled}
        haptic="select"
        pressedScale={0.99}
        onPress={() =>
          Platform.OS === 'android' ? setAndroidOpen(true) : setIosOpen((open) => !open)
        }
        style={[
          styles.input,
          styles.dateInput,
          {
            borderColor: error ? '#C2714F' : iosOpen ? accent.clay : Garden.ink15,
            borderWidth: iosOpen || error ? 2 : 1.5,
          },
          disabled && styles.inputDisabled,
        ]}>
        <Ionicons name="time-outline" size={17} color={accent.clayDeep} />
        <Text style={[styles.dateText, styles.timeText]} numberOfLines={1}>
          {display}
        </Text>
        <Ionicons name={iosOpen ? 'chevron-up' : 'chevron-down'} size={15} color={Garden.ink60} />
      </GPressable>
      {Platform.OS === 'ios' && iosOpen && !disabled ? (
        <DateTimePicker
          value={pickerDate}
          mode="time"
          display="spinner"
          onChange={onPickerChange}
        />
      ) : null}
      {Platform.OS === 'android' && androidOpen && !disabled ? (
        <DateTimePicker value={pickerDate} mode="time" display="default" onChange={onPickerChange} />
      ) : null}
      <FieldFoot error={error} />
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Inline banner (status inside sheets, where toasts can't show)       */
/* ------------------------------------------------------------------ */

const BANNER_TONES = {
  success: { bg: Garden.mint, fg: Garden.forestDeep, icon: 'checkmark-circle' },
  error: { bg: '#F9E5DA', fg: '#7C2D12', icon: 'alert-circle' },
  info: { bg: Garden.sky, fg: '#1D3F61', icon: 'information-circle' },
  warning: { bg: '#FFF3C4', fg: '#4D3900', icon: 'alert-circle' },
} as const;

/** Status line for use inside a sheet (native modals cover toasts). */
export function GInlineBanner({
  tone,
  title,
  description,
  action,
}: {
  tone: keyof typeof BANNER_TONES;
  title: string;
  description?: string | null;
  action?: ReactNode;
}) {
  const colors = BANNER_TONES[tone];
  return (
    <View
      accessibilityLiveRegion="polite"
      accessibilityRole={tone === 'error' ? 'alert' : undefined}
      style={[styles.banner, { backgroundColor: colors.bg }]}>
      <Ionicons name={colors.icon} size={18} color={colors.fg} />
      <View style={styles.choiceCopy}>
        <Text style={[styles.bannerTitle, { color: colors.fg }]}>{title}</Text>
        {description ? (
          <Text style={[styles.bannerBody, { color: colors.fg }]}>{description}</Text>
        ) : null}
        {action}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: 6 },
  label: { fontFamily: GardenFonts.bodyExtra, fontSize: 14, color: Garden.ink },
  optional: { fontFamily: GardenFonts.bodySemi, fontSize: 13, color: Garden.soft },
  helper: { fontFamily: GardenFonts.bodySemi, fontSize: 12.5, color: Garden.soft, lineHeight: 17 },
  footRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  error: { fontFamily: GardenFonts.bodyBold, fontSize: 13, color: '#7E4533', flex: 1 },
  input: {
    minHeight: 48,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: Garden.paper,
    fontFamily: GardenFonts.bodySemi,
    fontSize: 16,
    color: Garden.ink,
  },
  inputMultiline: { minHeight: 104, textAlignVertical: 'top', paddingTop: 12 },
  inputDisabled: { opacity: 0.6 },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chipStack: { gap: 8 },
  chip: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1.5,
  },
  chipLabel: { fontFamily: GardenFonts.bodyExtra, fontSize: 14, color: Garden.ink },
  choiceCard: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  choiceCopy: { flex: 1, gap: 2 },
  choiceDescription: {
    fontFamily: GardenFonts.bodySemi,
    fontSize: 13,
    lineHeight: 18,
    color: Garden.soft,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Garden.white,
  },
  radioDot: { width: 10, height: 10, borderRadius: 5 },
  dimmed: { opacity: 0.6 },
  checkRow: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  checkBox: {
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  switchRow: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dateShell: { position: 'relative', justifyContent: 'center' },
  dateInput: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dateInputWithClear: { paddingRight: 44 },
  dateText: { flex: 1, fontFamily: GardenFonts.bodyBold, fontSize: 16, color: Garden.ink },
  timeText: { fontVariant: ['tabular-nums'] },
  placeholder: { color: Garden.ink60, fontFamily: GardenFonts.bodySemi },
  clear: {
    position: 'absolute',
    right: 6,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    borderRadius: 14,
    padding: 12,
  },
  bannerTitle: { fontFamily: GardenFonts.bodyExtra, fontSize: 14 },
  bannerBody: { fontFamily: GardenFonts.bodySemi, fontSize: 13, lineHeight: 18 },
});
