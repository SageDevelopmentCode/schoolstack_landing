import { buildParentHomeGreeting } from '@/components/parent/home/use-parent-home-dashboard-model';

jest.mock('@/contexts/parent-theme-context', () => ({}));

describe('buildParentHomeGreeting', () => {
  it('uses the hour for the prefix and emoji', () => {
    expect(buildParentHomeGreeting('Ada Lovelace', new Date(2026, 10, 14, 8)).prefix).toBe(
      'Good morning',
    );
    expect(buildParentHomeGreeting('Ada Lovelace', new Date(2026, 10, 14, 13)).emoji).toBe('🌤️');
    expect(buildParentHomeGreeting('Ada Lovelace', new Date(2026, 10, 14, 19)).prefix).toBe(
      'Good evening',
    );
  });

  it('builds the first name and family label from the display name', () => {
    const greeting = buildParentHomeGreeting('Ada  King Lovelace', new Date(2026, 10, 14, 9));
    expect(greeting.firstName).toBe('Ada');
    expect(greeting.familyLabel).toBe('The Lovelace family');
    expect(greeting.todayLabel).toContain('November 14');
  });

  it('falls back when there is no last name', () => {
    expect(buildParentHomeGreeting('Ada').familyLabel).toBe('Your family');
    expect(buildParentHomeGreeting('').firstName).toBe('');
  });
});
