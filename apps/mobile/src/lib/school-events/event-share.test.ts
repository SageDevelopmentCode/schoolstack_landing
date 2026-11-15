import { buildEventDetailsText, buildEventMapsUrl } from '@/lib/school-events/event-share';
import type { OrganizationEvent } from '@/lib/school-events/types';

const base: OrganizationEvent = {
  id: 'e1',
  organizationId: 'org',
  title: 'Pumpkin patch trip',
  date: '2026-11-18',
  isAllDay: true,
  type: 'field_trip',
  sortOrder: 0,
};

describe('buildEventDetailsText', () => {
  it('includes title, date and time', () => {
    expect(buildEventDetailsText(base)).toBe('Pumpkin patch trip\nWednesday, November 18, 2026 · All day');
  });

  it('adds location and description when present', () => {
    const text = buildEventDetailsText({ ...base, location: ' Green Acres Farm ', description: 'Bring boots.' });
    expect(text.split('\n')).toEqual([
      'Pumpkin patch trip',
      'Wednesday, November 18, 2026 · All day',
      'Green Acres Farm',
      '',
      'Bring boots.',
    ]);
  });
});

describe('buildEventMapsUrl', () => {
  it('uses the native Maps scheme per platform', () => {
    expect(buildEventMapsUrl('12 Oak St, Austin', 'ios')).toBe('maps://?q=12%20Oak%20St%2C%20Austin');
    expect(buildEventMapsUrl('12 Oak St', 'android')).toBe('geo:0,0?q=12%20Oak%20St');
    expect(buildEventMapsUrl('12 Oak St', 'web')).toMatch(/^https:\/\/www\.google\.com\/maps/);
  });
});
