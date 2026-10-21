export function organizationSelectorEmptyMessage(
  accessibleSlugs: string[] | null | undefined,
): string {
  if (accessibleSlugs == null) {
    return 'No schools are available for sign-in right now. Please check back later.';
  }
  if (accessibleSlugs.length === 0) {
    return 'You do not have access to any schools for this account. Try signing in with a different account.';
  }
  return "Couldn't load your schools right now. Check your connection and try again.";
}
