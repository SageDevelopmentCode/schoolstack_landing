import { useCallback, useMemo } from 'react';

import { useAuth } from '@/contexts/auth-context';
import type { PortalType } from '@/lib/auth/resolve-portal';
import {
  parseMobileOperationalError,
  portalTypeToMobileSurface,
  reportMobileOperationalError,
  type MobilePortalSurface,
} from '@/lib/mobile-activity';

export type MobileErrorReportOptions = {
  error?: string;
  code?: string;
  details?: string;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  notify?: boolean;
  responseStatus?: number;
};

export type MobileErrorReporter = (
  operation: string,
  err: unknown,
  options?: MobileErrorReportOptions,
) => void;

export function createMobileErrorReporter(
  portalType: PortalType | null,
  organizationId: string | null | undefined,
): MobileErrorReporter {
  const surface = portalTypeToMobileSurface(portalType);
  const orgId = organizationId?.trim() ?? '';

  return (operation, err, options = {}) => {
    if (!surface || !orgId || !operation.trim()) {
      return;
    }

    const parsed = parseMobileOperationalError(err);

    void reportMobileOperationalError(
      {
        organizationId: orgId,
        surface,
        operation,
        error: options.error ?? parsed.message,
        code: options.code ?? parsed.code,
        details: options.details ?? parsed.details,
        entityType: options.entityType,
        entityId: options.entityId,
        metadata: options.metadata,
        notify: options.notify,
      },
      err,
      options.responseStatus,
    );
  };
}

export function createParentPortalErrorReporter(
  organizationId: string | null | undefined,
): MobileErrorReporter {
  return createMobileErrorReporter('parent', organizationId);
}

export function createSchoolAdminErrorReporter(
  organizationId: string | null | undefined,
): MobileErrorReporter {
  return createMobileErrorReporter('school_admin', organizationId);
}

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
