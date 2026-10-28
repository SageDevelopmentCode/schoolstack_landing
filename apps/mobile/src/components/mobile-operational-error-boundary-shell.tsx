import { useRouter, usePathname } from 'expo-router';
import type { ReactNode } from 'react';

import { MobileOperationalErrorBoundary } from '@/components/mobile-operational-error-boundary';

export function MobileOperationalErrorBoundaryShell({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <MobileOperationalErrorBoundary
      pathname={pathname}
      onGoBack={() => {
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace('/portal');
        }
      }}>
      {children}
    </MobileOperationalErrorBoundary>
  );
}
