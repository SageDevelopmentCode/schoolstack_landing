import { fetchWithAuth } from '@/lib/auth/auth-session';
import { createParentPortalErrorReporter } from '@/lib/mobile-error-reporter';
import { ParentPortalApiError } from '@/lib/parent/parent-portal-api';
import { shouldReportMobileOperationalError } from '@/lib/mobile-activity';

jest.mock('@/lib/auth/auth-session', () => ({
  fetchWithAuth: jest.fn(),
}));

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
});
