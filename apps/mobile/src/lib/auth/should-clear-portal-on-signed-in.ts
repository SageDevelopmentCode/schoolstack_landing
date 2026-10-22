/**
 * A late SIGNED_IN must not wipe a portal that setResolvedPortal just saved
 * for this user. Clear when no portal was saved yet, or it was saved for someone else.
 */
export function shouldClearPortalOnSignedIn(input: {
  resolvedUserId: string | null;
  sessionUserId: string;
}): boolean {
  return input.resolvedUserId !== input.sessionUserId;
}
