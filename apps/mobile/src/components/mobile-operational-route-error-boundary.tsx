import { useRouter, usePathname, type ErrorBoundaryProps } from 'expo-router';
import { useEffect } from 'react';

import { MobileOperationalErrorFallback } from '@/components/mobile-operational-error-fallback';
import { reportMobileGlobalOperationalError } from '@/lib/mobile-global-error-reporting';

export function MobileOperationalRouteErrorBoundary({
  error,
}: ErrorBoundaryProps) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const trimmedPathname = pathname?.trim();
    reportMobileGlobalOperationalError('react_render_error', error, {
      details: error.stack?.trim().slice(0, 2000),
      metadata: trimmedPathname ? { pathname: trimmedPathname } : undefined,
    });
  }, [error, pathname]);

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/portal');
  };

  return <MobileOperationalErrorFallback onGoBack={handleGoBack} />;
}
