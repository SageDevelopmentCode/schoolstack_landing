import { useEffect } from 'react';

import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';
import { isMobileE2e } from '@/lib/e2e';
import {
  installMobileUncaughtErrorHandler,
  reportMobileUncaughtError,
  setMobileGlobalErrorReporter,
} from '@/lib/mobile-global-error-reporting';

export function MobileGlobalErrorReportingBridge() {
  const { reportError } = useMobileErrorReporter();

  useEffect(() => {
    if (isMobileE2e) {
      setMobileGlobalErrorReporter(null);
      return;
    }
    setMobileGlobalErrorReporter(reportError);
    return () => setMobileGlobalErrorReporter(null);
  }, [reportError]);

  useEffect(() => {
    if (isMobileE2e) {
      return;
    }

    // Uncaught JS exceptions (the previous handler — red box / Sentry — still runs).
    const uninstallUncaughtHandler = installMobileUncaughtErrorHandler();

    // Hermes/React Native rarely dispatch `unhandledrejection` on globalThis; rejections are also
    // forwarded from Sentry's rejection tracker (see `initMobileSentry`).
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      reportMobileUncaughtError('unhandled_promise_rejection', event.reason);
    };

    const hasEventTarget = typeof globalThis.addEventListener === 'function';
    if (hasEventTarget) {
      globalThis.addEventListener('unhandledrejection', handleUnhandledRejection);
    }

    return () => {
      uninstallUncaughtHandler();
      if (hasEventTarget) {
        globalThis.removeEventListener('unhandledrejection', handleUnhandledRejection);
      }
    };
  }, []);

  return null;
}
