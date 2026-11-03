import {
  formatHoursMinutes,
  formatLiveElapsed,
} from '@/lib/teacher/my-hours/format-duration';

describe('formatHoursMinutes', () => {
  it('formats minutes only', () => {
    expect(formatHoursMinutes(45)).toBe('45m');
  });

  it('formats hours and minutes', () => {
    expect(formatHoursMinutes(125)).toBe('2h 5m');
  });
});

describe('formatLiveElapsed', () => {
  it('formats sub-hour elapsed', () => {
    expect(formatLiveElapsed(65)).toBe('1:05');
  });

  it('formats hour elapsed', () => {
    expect(formatLiveElapsed(3665)).toBe('1:01:05');
  });
});
