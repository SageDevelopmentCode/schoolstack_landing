export type AuthStateChangeEvent =
  | 'INITIAL_SESSION'
  | 'SIGNED_IN'
  | 'SIGNED_OUT'
  | 'TOKEN_REFRESHED'
  | 'USER_UPDATED'
  | 'PASSWORD_RECOVERY'
  | string;

export type ShouldClearPersistedPortalInput = {
  event: AuthStateChangeEvent;
  wasExplicitSignOut: boolean;
  hadEstablishedSession: boolean;
};

/**
 * Portal SecureStore keys should survive transient auth storage read failures
 * (e.g. missing encryption key on first launch). Clear them only on real sign-out.
 */
export function shouldClearPersistedPortalOnAuthEvent(
  input: ShouldClearPersistedPortalInput,
): boolean {
  if (input.wasExplicitSignOut) {
    return true;
  }

  return input.event === 'SIGNED_OUT' && input.hadEstablishedSession;
}
