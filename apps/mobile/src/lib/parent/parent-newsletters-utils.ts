import type { ParentNewsletterListItem } from '@/lib/parent/parent-newsletters-types';

export function formatNewsletterWeekLabel(edition: Pick<ParentNewsletterListItem, 'week' | 'weekEnd'>): string {
  if (edition.weekEnd && edition.weekEnd !== edition.week) {
    return `${edition.week} – ${edition.weekEnd}`;
  }
  return edition.week;
}

export function formatNewsletterPublishedDate(publishedAt?: string): string | null {
  if (!publishedAt) return null;
  const date = new Date(publishedAt);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
