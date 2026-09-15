import { healthBadgeDimensions, studentInitialsFromName } from '@/components/school-admin/student-photo';

describe('healthBadgeDimensions', () => {
  it('returns larger badge dimensions for larger photo sizes', () => {
    expect(healthBadgeDimensions('sm').container).toBeLessThan(healthBadgeDimensions('lg').container);
    expect(healthBadgeDimensions('row').icon).toBeGreaterThan(0);
  });
});

describe('studentInitialsFromName', () => {
  it('returns null for empty or whitespace names', () => {
    expect(studentInitialsFromName('')).toBeNull();
    expect(studentInitialsFromName('   ')).toBeNull();
  });

  it('returns two-letter initials for a single name', () => {
    expect(studentInitialsFromName('Autumn')).toBe('AU');
  });

  it('returns first and last initials for full names', () => {
    expect(studentInitialsFromName('Holden Collins')).toBe('HC');
  });

  it('does not produce US from unnamed-student placeholder text when trimmed empty', () => {
    expect(studentInitialsFromName('Unnamed student')).toBe('US');
    expect(studentInitialsFromName('')).toBeNull();
  });
});
