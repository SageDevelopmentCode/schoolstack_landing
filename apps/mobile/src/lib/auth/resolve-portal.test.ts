import {
  getAccountRoleLabel,
  getPortalHeading,
  getPortalLabel,
} from '@/lib/auth/resolve-portal';

describe('getPortalLabel', () => {
  it('returns platform admin label', () => {
    expect(getPortalLabel('platform_admin')).toBe('MudKitchen Admin');
  });

  it('includes school name for school portals', () => {
    expect(getPortalLabel('school_admin', 'Rooted Meadows')).toBe('Rooted Meadows Admin');
    expect(getPortalLabel('teacher', 'Rooted Meadows')).toBe('Rooted Meadows Staff Portal');
    expect(getPortalLabel('parent_apply', 'Rooted Meadows')).toBe('Rooted Meadows Family Portal');
  });

  it('falls back when school name is missing', () => {
    expect(getPortalLabel('school_admin')).toBe('School Admin');
  });
});

describe('getPortalHeading', () => {
  it('returns headings for each portal type', () => {
    expect(getPortalHeading('platform_admin')).toBe('Platform Admin');
    expect(getPortalHeading('school_admin')).toBe('School Admin');
    expect(getPortalHeading('teacher')).toBe('Teacher Portal');
    expect(getPortalHeading('parent_apply')).toBe('Parent / Apply Portal');
  });
});

describe('getAccountRoleLabel', () => {
  it('returns null when portal type is missing', () => {
    expect(getAccountRoleLabel(null, false)).toBeNull();
  });

  it('returns Platform Admin for platform admin sessions viewing a school', () => {
    expect(getAccountRoleLabel('school_admin', true)).toBe('Platform Admin');
  });

  it('returns short role labels for each portal type', () => {
    expect(getAccountRoleLabel('platform_admin', false)).toBe('Platform Admin');
    expect(getAccountRoleLabel('school_admin', false)).toBe('School Admin');
    expect(getAccountRoleLabel('teacher', false)).toBe('Staff');
    expect(getAccountRoleLabel('parent_apply', false)).toBe('Parent');
  });
});
