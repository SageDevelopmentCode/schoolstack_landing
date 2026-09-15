import { useMemo } from 'react';

import { useAuth } from '@/contexts/auth-context';
import {
  createMobileErrorReporter,
  type MobileErrorReporter,
} from '@/lib/mobile-error-reporter';
import { portalTypeToMobileSurface, type MobilePortalSurface } from '@/lib/mobile-activity';

export type {
  MobileErrorReportOptions,
  MobileErrorReporter,
} from '@/lib/mobile-error-reporter';
export {
  createMobileErrorReporter,
  createParentPortalErrorReporter,
  createSchoolAdminErrorReporter,
} from '@/lib/mobile-error-reporter';

export function useMobileErrorReporter(
  organizationIdOverride?: string | null,
): {
  reportError: MobileErrorReporter;
  surface: MobilePortalSurface | null;
  organizationId: string | null;
} {
  const { portalType, selectedSchool } = useAuth();
  const organizationId = organizationIdOverride ?? selectedSchool?.id ?? null;

  const reportError = useMemo(
    () => createMobileErrorReporter(portalType, organizationId),
    [organizationId, portalType],
  );

  return {
    reportError,
    surface: portalTypeToMobileSurface(portalType),
    organizationId,
  };
}
