/** Cache tag for the cross-request organization + settings read (see `fetch.ts`). */
export function organizationSettingsTag(slug: string): string {
  return `org-settings:${slug}`;
}
