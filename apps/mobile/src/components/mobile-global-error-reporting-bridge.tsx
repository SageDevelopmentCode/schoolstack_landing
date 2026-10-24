import { useEffect, useMemo } from 'react';

import { useAuth } from '@/contexts/auth-context';
import { isMobileE2e } from '@/lib/e2e';
import { createMobileErrorReporter } from '@/lib/mobile-error-reporter';
import {
  reportMobileGlobalOperationalError,
  setMobileGlobalErrorReporter,
} from '@/lib/mobile-global-error-reporting';

export function MobileGlobalErrorReportingBridge() {
  const { portalType, selectedSchool } = useAuth();
  const organizationId = selectedSchool?.id ?? null;

  const reportError = useMemo(
    () => createMobileErrorReporter(portalType, organizationId),
    [organizationId, portalType],
  );

  if (isMobileE2e) {
    setMobileGlobalErrorReporter(null);
  } else {
    setMobileGlobalErrorReporter(reportError);
  }

  useEffect(() => {
    return () => setMobileGlobalErrorReporter(null);
  }, []);

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
  }, []);

  return null;
}
