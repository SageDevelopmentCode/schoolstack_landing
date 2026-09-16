import type { PortalType } from '@/lib/auth/resolve-portal';
import {
  parseMobileOperationalError,
  portalTypeToMobileSurface,
  reportMobileOperationalError,
} from '@/lib/mobile-activity';
import { TeacherPortalApiError } from '@/lib/teacher/teacher-portal-api';

function resolveResponseStatus(err: unknown, explicit?: number): number | undefined {
  if (explicit !== undefined) {
    return explicit;
  }

  if (err instanceof TeacherPortalApiError) {
    return err.status;
  }

  return undefined;
}

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
    const responseStatus = resolveResponseStatus(err, options.responseStatus);

    void reportMobileOperationalError(
      {
        organizationId: orgId,
        surface,
        operation,
        error: options.error ?? parsed.message,
        code:
          options.code ??
          parsed.code ??
          (err instanceof TeacherPortalApiError ? err.code : undefined),
        details: options.details ?? parsed.details,
        entityType: options.entityType,
        entityId: options.entityId,
        metadata: options.metadata,
        notify: options.notify,
      },
      err,
      responseStatus,
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

export function createTeacherPortalErrorReporter(
  organizationId: string | null | undefined,
): MobileErrorReporter {
  return createMobileErrorReporter('teacher', organizationId);
}
