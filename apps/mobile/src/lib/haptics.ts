import { requireOptionalNativeModule } from 'expo';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

import { isMobileE2e } from '@/lib/e2e';

/**
 * Safe haptic feedback. A no-op on web, under E2E, and on native builds that
 * were made before `expo-haptics` was added (no `ExpoHaptics` module). Never throws.
 */
const hapticsAvailable =
  Platform.OS !== 'web' && !isMobileE2e && requireOptionalNativeModule('ExpoHaptics') != null;

function run(effect: () => Promise<void>) {
  if (!hapticsAvailable) return;
  try {
    void effect().catch(() => {});
  } catch {
    // Haptics are best-effort feedback; failures are never user-visible.
  }
}

export const haptic = {
  /** Light tap for presses. */
  tap: () => run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)),
  /** Selection tick for tab / chip / stepper changes. */
  select: () => run(() => Haptics.selectionAsync()),
  /** Firmer tap for primary actions. */
  press: () => run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)),
  success: () => run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),
  warning: () => run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)),
  error: () => run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)),
};
