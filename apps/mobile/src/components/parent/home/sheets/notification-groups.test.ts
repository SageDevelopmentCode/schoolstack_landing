import { notificationGroupLabel } from '@/components/parent/home/sheets/notification-groups';

describe('notificationGroupLabel', () => {
  const now = new Date(2026, 10, 14, 16, 0);

  it('groups by calendar day like the web drawer', () => {
    expect(notificationGroupLabel(new Date(2026, 10, 14, 8).toISOString(), now)).toBe('Today');
    expect(notificationGroupLabel(new Date(2026, 10, 13, 23).toISOString(), now)).toBe('Yesterday');
    expect(notificationGroupLabel(new Date(2026, 10, 10, 9).toISOString(), now)).toBe(
      'Earlier this week',
    );
    expect(notificationGroupLabel(new Date(2026, 10, 1, 9).toISOString(), now)).toBe('Earlier');
  });

  it('treats bad dates as Earlier', () => {
    expect(notificationGroupLabel('not-a-date', now)).toBe('Earlier');
  });
});
