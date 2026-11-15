import { formatLongEventDate } from '@/lib/parent/parent-calendar-agenda-utils';
import { formatEventTimeRange } from '@/lib/school-events/calendar-time';
import type { OrganizationEvent } from '@/lib/school-events/types';

/*
 * Ways for a parent to take a school event with them on mobile: a plain-text
 * summary (copy / share) and a native Maps link. Mirrors the web
 * `buildEventDetailsText` in `src/lib/school-events/calendar-event-export.ts`.
 */

export function buildEventDetailsText(event: OrganizationEvent): string {
  const lines = [event.title, `${formatLongEventDate(event.date)} · ${formatEventTimeRange(event)}`];
  if (event.location?.trim()) lines.push(event.location.trim());
  if (event.description?.trim()) lines.push('', event.description.trim());
  return lines.join('\n');
}

/**
 * Native Maps search for a location. Non-http schemes make
 * `openExternalUrlSafely` use `Linking.openURL`, which opens the Maps app
 * itself instead of an in-app browser.
 */
export function buildEventMapsUrl(location: string, platform: 'ios' | 'android' | string): string {
  const query = encodeURIComponent(location.trim());
  if (platform === 'ios') return `maps://?q=${query}`;
  if (platform === 'android') return `geo:0,0?q=${query}`;
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}
