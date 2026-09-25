let explicitSignOutPending = false;

/** Marks the next Supabase SIGNED_OUT as user- or app-initiated (not unexpected session loss). */
export function markExplicitMobileSignOut(): void {
  explicitSignOutPending = true;
}

export function consumeExplicitMobileSignOut(): boolean {
  if (!explicitSignOutPending) {
    return false;
  }
  explicitSignOutPending = false;
  return true;
}
