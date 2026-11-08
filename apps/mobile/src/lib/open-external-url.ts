import { Alert, Linking } from 'react-native';
import { openBrowserAsync, WebBrowserPresentationStyle } from 'expo-web-browser';

import type { MobileErrorReporter } from '@/lib/mobile-error-reporter';

export type OpenExternalUrlOptions = {
  /** Operation name sent to Discord on failure. Default `open_external_url`. */
  operation?: string;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  /** Alert title when opening fails. Pass `null` to skip the alert. */
  errorTitle?: string | null;
  errorMessage?: string;
};

function describeUrlTarget(url: string): string {
  if (url.startsWith('data:')) return 'data';
  if (url.startsWith('file:')) return 'file';
  try {
    return new URL(url).host || 'unknown';
  } catch {
    return 'invalid_url';
  }
}

/**
 * Opens a link in the in-app browser (http/https) or via the OS (mailto:, tel:, ...). Never throws:
 * failures are reported through `reportError` (Discord via the mobile operational-errors API) and
 * the user gets a friendly alert instead of a silent no-op or an unhandled rejection.
 */
export async function openExternalUrlSafely(
  url: string,
  /** Pass `null` before sign-in (no school context): the user still gets the alert. */
  reportError: MobileErrorReporter | null,
  options: OpenExternalUrlOptions = {},
): Promise<boolean> {
  try {
    if (/^https?:\/\//i.test(url)) {
      await openBrowserAsync(url, {
        presentationStyle: WebBrowserPresentationStyle.AUTOMATIC,
      });
    } else {
      await Linking.openURL(url);
    }
    return true;
  } catch (err) {
    reportError?.(options.operation ?? 'open_external_url', err, {
      entityType: options.entityType,
      entityId: options.entityId,
      metadata: { urlTarget: describeUrlTarget(url), ...(options.metadata ?? {}) },
    });
    if (options.errorTitle !== null) {
      Alert.alert(
        options.errorTitle ?? 'Could not open link',
        options.errorMessage ?? 'Please try again, or open this from the MudKitchen website.',
      );
    }
    return false;
  }
}
