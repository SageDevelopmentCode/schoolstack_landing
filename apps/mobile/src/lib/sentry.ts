import * as Sentry from '@sentry/react-native';
import Constants from 'expo-constants';

import { isMobileE2e } from '@/lib/e2e';
import { mobileSentryDist, mobileSentryTags } from '@/lib/mobile-build-info';
import { reportUnhandledRejectionFromSentryEvent } from '@/lib/mobile-global-error-reporting';

let sentryInitialized = false;

export const navigationIntegration = Sentry.reactNavigationIntegration({
  enableTimeToInitialDisplay: !isMobileE2e,
});

export function isMobileSentryEnabled(): boolean {
  return sentryInitialized;
}

export function initMobileSentry(): void {
  if (sentryInitialized || isMobileE2e) {
    return;
  }

  const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN?.trim();
  if (!dsn) {
    return;
  }

  const appVersion = Constants.expoConfig?.version?.trim();

  Sentry.init({
    dsn,
    environment: __DEV__ ? 'development' : 'production',
    release: appVersion ? `mudkitchen-mobile@${appVersion}` : undefined,
    dist: mobileSentryDist(),
    tracesSampleRate: __DEV__ ? 1.0 : 0.1,
    enableAutoPerformanceTracing: true,
    enableNativeFramesTracking: !isMobileE2e,
    integrations: [navigationIntegration],
    beforeSend(event) {
      // Unhandled promise rejections are only visible through Sentry's tracker; also notify Discord.
      try {
        reportUnhandledRejectionFromSentryEvent(event);
      } catch {
        // Never block Sentry delivery.
      }
      return event;
    },
    tracePropagationTargets: [/trymudkitchen\.com/i, /localhost/i, /127\.0\.0\.1/i],
  });

  Sentry.setTags(mobileSentryTags());

  sentryInitialized = true;
}

export function mobileApiSpanName(url: string, method: string): string {
  try {
    const path = new URL(url).pathname;
    return `${method.toUpperCase()} ${path}`;
  } catch {
    return `${method.toUpperCase()} ${url}`;
  }
}

export async function withMobileApiSpan<T>(
  url: string,
  method: string,
  run: () => Promise<T>,
): Promise<T> {
  if (!sentryInitialized) {
    return run();
  }

  return Sentry.startSpan(
    {
      name: mobileApiSpanName(url, method),
      op: 'http.client',
      attributes: {
        'http.request.method': method.toUpperCase(),
      },
    },
    run,
  );
}

export { Sentry };

export function captureMobileOperationalPostFailure(path: string, err: unknown): void {
  if (!sentryInitialized) {
    return;
  }

  Sentry.captureMessage(`mobile_api_post_failed:${path}`, {
    level: 'warning',
    extra: {
      path,
      error: err instanceof Error ? err.message : String(err),
    },
  });
}
