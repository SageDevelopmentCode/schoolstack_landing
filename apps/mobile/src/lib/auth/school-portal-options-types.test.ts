import {
  filterSchoolPortalOptionsForMobile,
  portalTypeToAccountPortalId,
  shouldShowMobilePortalSwitcher,
  shouldShowPortalSwitcher,
  type SchoolPortalOption,
} from '@/lib/auth/school-portal-options-types';

describe('shouldShowPortalSwitcher', () => {
  it('returns false for a single portal option', () => {
    const options: SchoolPortalOption[] = [
      { id: 'family_parent', label: 'Parent portal', href: '/school/x/parent' },
    ];
    expect(shouldShowPortalSwitcher(options)).toBe(false);
  });

  it('returns false when there is no staff portal', () => {
    const options: SchoolPortalOption[] = [
      { id: 'family_apply', label: 'My applications', href: '/school/x/apply' },
      { id: 'family_parent', label: 'Parent portal', href: '/school/x/parent' },
    ];
    expect(shouldShowPortalSwitcher(options)).toBe(false);
  });

  it('returns true when staff and family portals are available', () => {
    const options: SchoolPortalOption[] = [
      { id: 'teacher', label: 'Staff portal', href: '/school/x/teacher' },
      { id: 'family_parent', label: 'Parent portal', href: '/school/x/parent' },
    ];
    expect(shouldShowPortalSwitcher(options)).toBe(true);
  });
});

describe('mobile portal options', () => {
  it('filters out family_apply', () => {
    const options: SchoolPortalOption[] = [
      { id: 'teacher', label: 'Staff portal', href: '/school/x/teacher' },
      { id: 'family_apply', label: 'My applications', href: '/school/x/apply' },
      { id: 'family_parent', label: 'Parent portal', href: '/school/x/parent' },
    ];
    expect(filterSchoolPortalOptionsForMobile(options).map((o) => o.id)).toEqual([
      'teacher',
      'family_parent',
    ]);
    expect(shouldShowMobilePortalSwitcher(options)).toBe(true);
  });

  it('hides switcher for parent-only portals after mobile filter', () => {
    const options: SchoolPortalOption[] = [
      { id: 'family_apply', label: 'My applications', href: '/school/x/apply' },
      { id: 'family_parent', label: 'Parent portal', href: '/school/x/parent' },
    ];
    expect(shouldShowMobilePortalSwitcher(options)).toBe(false);
  });
});

describe('portalTypeToAccountPortalId', () => {
  it('maps mobile portal types', () => {
    expect(portalTypeToAccountPortalId('teacher')).toBe('teacher');
    expect(portalTypeToAccountPortalId('parent')).toBe('family_parent');
    expect(portalTypeToAccountPortalId('parent_apply')).toBe('family_apply');
    expect(portalTypeToAccountPortalId('school_admin')).toBe('admin');
    expect(portalTypeToAccountPortalId(null)).toBeNull();
  });
});
