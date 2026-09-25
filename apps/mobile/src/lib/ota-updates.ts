import * as Updates from 'expo-updates';
import { Alert } from 'react-native';

import { isMobileE2e } from '@/lib/e2e';

const UPDATE_TITLE = 'Update available';
const UPDATE_MESSAGE =
  'A new version of MudKitchen is ready. Restart the app to use it.';
const RESTART_LABEL = 'Restart now';
const LATER_LABEL = 'Later';

export function shouldCheckForOtaUpdates(): boolean {
  if (__DEV__ || isMobileE2e) {
    return false;
  }
  return Updates.isEnabled;
}

export async function runOtaUpdateCheck(): Promise<void> {
  try {
    const checkResult = await Updates.checkForUpdateAsync();
    if (!checkResult.isAvailable) {
      return;
    }

    await Updates.fetchUpdateAsync();

    Alert.alert(UPDATE_TITLE, UPDATE_MESSAGE, [
      { text: LATER_LABEL, style: 'cancel' },
      {
        text: RESTART_LABEL,
        onPress: () => {
          void Updates.reloadAsync();
        },
      },
    ]);
  } catch {
    // OTA checks must never block sign-in or portal usage.
  }
}

export async function checkAndPromptForOtaUpdate(): Promise<void> {
  if (!shouldCheckForOtaUpdates()) {
    return;
  }

  await runOtaUpdateCheck();
}
