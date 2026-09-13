import { formatRelativeTime } from '@/lib/school-admin/format-relative-time';

describe('formatRelativeTime', () => {
  const now = new Date('2026-09-13T12:00:00.000Z');

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(now);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns empty string for invalid dates', () => {
    expect(formatRelativeTime('not-a-date')).toBe('');
  });

  it('returns Just now for timestamps under one minute ago', () => {
    expect(formatRelativeTime('2026-09-13T11:59:30.000Z')).toBe('Just now');
  });

  it('returns minutes ago for timestamps under one hour ago', () => {
    expect(formatRelativeTime('2026-09-13T11:35:00.000Z')).toBe('25m ago');
  });

  it('returns hours ago for timestamps under one day ago', () => {
    expect(formatRelativeTime('2026-09-13T08:00:00.000Z')).toBe('4h ago');
  });

  it('returns Yesterday for timestamps one day ago', () => {
    expect(formatRelativeTime('2026-09-12T12:00:00.000Z')).toBe('Yesterday');
  });

  it('returns days ago for timestamps under one week ago', () => {
    expect(formatRelativeTime('2026-09-10T12:00:00.000Z')).toBe('3d ago');
  });
});
