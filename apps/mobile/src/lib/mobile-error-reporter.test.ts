import { fetchWithAuth } from '@/lib/auth/auth-session';
import {
  createParentPortalErrorReporter,
  createSchoolAdminErrorReporter,
  createTeacherPortalErrorReporter,
  isBenignMobileErrorCode,
} from '@/lib/mobile-error-reporter';
import { ParentPortalApiError } from '@/lib/parent/parent-portal-api';
import { shouldReportMobileOperationalError } from '@/lib/mobile-activity';

jest.mock('@/lib/auth/auth-session', () => ({
  fetchWithAuth: jest.fn(),
}));

describe('isBenignMobileErrorCode', () => {
  it('skips known benign billing race codes', () => {
    expect(isBenignMobileErrorCode('already_paid')).toBe(true);
    expect(isBenignMobileErrorCode('already_completed')).toBe(true);
    expect(isBenignMobileErrorCode('friday_branch_paused')).toBe(true);
    expect(isBenignMobileErrorCode('upload_failed')).toBe(false);
  });
});

describe('createParentPortalErrorReporter', () => {
  beforeEach(() => {
    jest.mocked(fetchWithAuth).mockReset();
  });

  it('skips posting operational errors for parent portal 4xx', () => {
    const err = new ParentPortalApiError(
      'Friday Branch signup is paused.',
      403,
      'friday_branch_paused',
    );
    expect(shouldReportMobileOperationalError(err, err.status)).toBe(false);

    const reportError = createParentPortalErrorReporter('org-1');
    reportError('friday_branch.load', err);

    expect(fetchWithAuth).not.toHaveBeenCalled();
  });

  it('skips posting operational errors for benign API codes', () => {
    const err = new ParentPortalApiError('Charge already paid.', 409, 'already_paid');
    const reportError = createParentPortalErrorReporter('org-1');
    reportError('parent_billing_checkout', err);

    expect(fetchWithAuth).not.toHaveBeenCalled();
  });

  it('posts operational errors for parent gallery 5xx failures', () => {
    jest.mocked(fetchWithAuth).mockResolvedValue(new Response(null, { status: 204 }));

    const err = new ParentPortalApiError('Failed to load gallery photos.', 500, 'internal_error');
    const reportError = createParentPortalErrorReporter('org-1');
    reportError('parent_gallery_list', err);

    expect(fetchWithAuth).toHaveBeenCalledWith(
      expect.stringContaining('/api/mobile/operational-errors'),
      expect.objectContaining({
        method: 'POST',
      }),
    );
  });
});

describe('createSchoolAdminErrorReporter', () => {
  beforeEach(() => {
    jest.mocked(fetchWithAuth).mockReset();
  });

  it('posts operational errors for school admin failures', async () => {
    jest.mocked(fetchWithAuth).mockResolvedValue(new Response(null, { status: 204 }));

    const reportError = createSchoolAdminErrorReporter('org-1');
    reportError('committees.load_workspace', new Error('Failed to load committee.'));

    expect(fetchWithAuth).toHaveBeenCalledWith(
      expect.stringContaining('/api/mobile/operational-errors'),
      expect.objectContaining({
        method: 'POST',
      }),
    );
  });
});

describe('createTeacherPortalErrorReporter', () => {
  beforeEach(() => {
    jest.mocked(fetchWithAuth).mockReset();
  });

  it('posts operational errors for teacher portal failures', () => {
    jest.mocked(fetchWithAuth).mockResolvedValue(new Response(null, { status: 204 }));

    const reportError = createTeacherPortalErrorReporter('org-1');
    reportError('teacher.activity_notifications.unread_count_failed', new Error('Network error'));

    expect(fetchWithAuth).toHaveBeenCalledWith(
      expect.stringContaining('/api/mobile/operational-errors'),
      expect.objectContaining({
        method: 'POST',
      }),
    );
  });
});
