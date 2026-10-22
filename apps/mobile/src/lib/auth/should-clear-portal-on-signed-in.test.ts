import { shouldClearPortalOnSignedIn } from '@/lib/auth/should-clear-portal-on-signed-in';

describe('shouldClearPortalOnSignedIn', () => {
  it('keeps a portal that was just saved for this user', () => {
    expect(
      shouldClearPortalOnSignedIn({
        resolvedUserId: 'user-1',
        sessionUserId: 'user-1',
      }),
    ).toBe(false);
  });

  it('clears when no portal has been saved for this sign-in', () => {
    expect(
      shouldClearPortalOnSignedIn({
        resolvedUserId: null,
        sessionUserId: 'user-1',
      }),
    ).toBe(true);
  });

  it('clears when the saved portal belongs to a different user', () => {
    expect(
      shouldClearPortalOnSignedIn({
        resolvedUserId: 'user-1',
        sessionUserId: 'user-2',
      }),
    ).toBe(true);
  });
});
