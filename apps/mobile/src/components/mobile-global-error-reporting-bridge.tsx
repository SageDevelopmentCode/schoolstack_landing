import { useEffect } from 'react';

import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';
import { isMobileE2e } from '@/lib/e2e';
import {
  reportMobileGlobalOperationalError,
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

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      reportMobileGlobalOperationalError('unhandled_promise_rejection', event.reason);
    };

    if (typeof globalThis.addEventListener === 'function') {
      globalThis.addEventListener('unhandledrejection', handleUnhandledRejection);
      return () => globalThis.removeEventListener('unhandledrejection', handleUnhandledRejection);
    }

    return undefined;
  }, [reportError]);

  return null;
}
