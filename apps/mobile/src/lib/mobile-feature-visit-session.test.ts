import {
  hasRecordedMobileFeatureVisit,
  markMobileFeatureVisitRecorded,
  mobileFeatureVisitSessionKey,
  resetMobileFeatureVisitSession,
} from '@/lib/mobile-feature-visit-session';

describe('mobile feature visit session', () => {
  beforeEach(() => {
    resetMobileFeatureVisitSession();
  });

  afterEach(() => {
    resetMobileFeatureVisitSession();
  });

  it('scopes session keys by organizationId', () => {
    const keyA = mobileFeatureVisitSessionKey('org-a', 'parent_portal', 'messages');
    const keyB = mobileFeatureVisitSessionKey('org-b', 'parent_portal', 'messages');
    expect(keyA).not.toEqual(keyB);
    expect(keyA).toBe('org-a:parent_portal:messages');
    expect(keyB).toBe('org-b:parent_portal:messages');
  });

  it('records visits independently per organization', () => {
    const keyA = mobileFeatureVisitSessionKey('org-a', 'parent_portal', 'messages');
    const keyB = mobileFeatureVisitSessionKey('org-b', 'parent_portal', 'messages');

    markMobileFeatureVisitRecorded(keyA);

    expect(hasRecordedMobileFeatureVisit(keyA)).toBe(true);
    expect(hasRecordedMobileFeatureVisit(keyB)).toBe(false);
  });

  it('clears all recorded visits on reset', () => {
    const keyA = mobileFeatureVisitSessionKey('org-a', 'parent_portal', 'messages');
    const keyB = mobileFeatureVisitSessionKey('org-b', 'teacher_portal', 'calendar');

    markMobileFeatureVisitRecorded(keyA);
    markMobileFeatureVisitRecorded(keyB);

    resetMobileFeatureVisitSession();

    expect(hasRecordedMobileFeatureVisit(keyA)).toBe(false);
    expect(hasRecordedMobileFeatureVisit(keyB)).toBe(false);
  });
});
