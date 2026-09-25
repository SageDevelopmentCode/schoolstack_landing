import { shouldClearPersistedPortalOnAuthEvent } from '@/lib/auth/should-clear-persisted-portal';

describe('shouldClearPersistedPortalOnAuthEvent', () => {
  it('does not clear on INITIAL_SESSION when no session was established', () => {
    expect(
      shouldClearPersistedPortalOnAuthEvent({
        event: 'INITIAL_SESSION',
        wasExplicitSignOut: false,
        hadEstablishedSession: false,
      }),
    ).toBe(false);
  });

  it('clears on SIGNED_OUT after a session was established', () => {
    expect(
      shouldClearPersistedPortalOnAuthEvent({
        event: 'SIGNED_OUT',
        wasExplicitSignOut: false,
        hadEstablishedSession: true,
      }),
    ).toBe(true);
  });

  it('clears on explicit sign-out regardless of event', () => {
    expect(
      shouldClearPersistedPortalOnAuthEvent({
        event: 'INITIAL_SESSION',
        wasExplicitSignOut: true,
        hadEstablishedSession: false,
      }),
    ).toBe(true);
  });

  it('does not clear on SIGNED_OUT before any session was established', () => {
    expect(
      shouldClearPersistedPortalOnAuthEvent({
        event: 'SIGNED_OUT',
        wasExplicitSignOut: false,
        hadEstablishedSession: false,
      }),
    ).toBe(false);
  });
});
