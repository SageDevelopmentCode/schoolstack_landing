import type { ComponentProps, ComponentType } from 'react';
import { Platform, StyleSheet, Text, TurboModuleRegistry } from 'react-native';

import type RNDateTimePicker from '@react-native-community/datetimepicker';

export type { DateTimePickerEvent } from '@react-native-community/datetimepicker';

/**
 * The only place allowed to load `@react-native-community/datetimepicker`
 * (enforced by `no-restricted-imports` in eslint.config.mjs).
 *
 * Store builds made before the picker was added have no native code for it, and
 * OTA bundles still reach them (runtime `1.0.0`). On Android, importing the
 * package calls `TurboModuleRegistry.getEnforcing('RNCDatePicker')`, which
 * throws at import time and crashes every route that imports a date field. So
 * we check for the native side first and only `require` the package when it is
 * there. If it is missing, fields render a short "update the app" hint instead.
 */

type DateTimePickerProps = ComponentProps<typeof RNDateTimePicker>;

export const DATE_PICKER_UNAVAILABLE_MESSAGE =
  'Update MudKitchen from the app store to change dates and times.';

function isNativePickerInstalled(): boolean {
  if (Platform.OS === 'android') {
    // The non-throwing twin of the `getEnforcing` call that crashes old builds.
    try {
      return TurboModuleRegistry.get('RNCDatePicker') != null;
    } catch {
      return false;
    }
  }
  // iOS loads the picker as a Fabric view, so importing it never throws. On a build
  // without it the open picker shows "Unimplemented component" but the screen works.
  // We don't probe the component registry here: a false negative would take pickers
  // away from every current iOS build.
  return Platform.OS === 'ios';
}

function loadNativePicker(): ComponentType<DateTimePickerProps> | null {
  if (!isNativePickerInstalled()) return null;
  try {
    const picker = require('@react-native-community/datetimepicker') as {
      default?: ComponentType<DateTimePickerProps>;
    };
    return picker.default ?? null;
  } catch {
    return null;
  }
}

const NativeDateTimePicker = loadNativePicker();

/** False on Android builds that predate the native date picker, and on web. */
export const isDateTimePickerAvailable = NativeDateTimePicker != null;

/**
 * Drop-in for the community `DateTimePicker`. Renders the native picker when the
 * installed build has it; otherwise renders an inline hint so the screen keeps working.
 */
export function DateTimePicker(props: DateTimePickerProps) {
  if (NativeDateTimePicker) {
    return <NativeDateTimePicker {...props} />;
  }
  return (
    <Text accessibilityRole="alert" style={styles.unavailable}>
      {DATE_PICKER_UNAVAILABLE_MESSAGE}
    </Text>
  );
}

const styles = StyleSheet.create({
  unavailable: {
    fontSize: 13,
    lineHeight: 18,
    color: 'rgba(43,36,29,0.60)',
    paddingTop: 4,
  },
});
