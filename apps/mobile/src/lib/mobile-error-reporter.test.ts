import { fetchWithAuth } from '@/lib/auth/auth-session';
import {
  createParentPortalErrorReporter,
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
});
