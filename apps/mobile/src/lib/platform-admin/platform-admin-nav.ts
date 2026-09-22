import type { Href } from 'expo-router';

export type PlatformAdminTab = 'organizations' | 'impersonate';

export function platformAdminTabRoute(tab: PlatformAdminTab): Href {
  return `/platform-admin/${tab}` as Href;
}

export function getPlatformAdminActiveTab(pathname: string): PlatformAdminTab | null {
  if (pathname.includes('/impersonate')) return 'impersonate';
  if (pathname.includes('/organizations')) return 'organizations';
  return null;
}
