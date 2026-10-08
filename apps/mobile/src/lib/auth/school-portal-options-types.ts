import type { PortalType } from '@/lib/auth/resolve-portal';

export type AccountPortalId = 'admin' | 'teacher' | 'family_apply' | 'family_parent';

export type SchoolPortalOption = {
  id: AccountPortalId;
  label: string;
  href: string;
};

export const ACCOUNT_PORTAL_SWITCHER_SECTION_TITLE = 'Account';

export function shouldShowPortalSwitcher(options: SchoolPortalOption[]): boolean {
  const hasStaffPortal = options.some(
    (option) => option.id === 'admin' || option.id === 'teacher',
  );
  return hasStaffPortal && options.length >= 2;
}

/** Mobile does not offer "My applications" as a portal switch target. */
export function filterSchoolPortalOptionsForMobile(
  options: SchoolPortalOption[],
): SchoolPortalOption[] {
  return options.filter((option) => option.id !== 'family_apply');
}

export function shouldShowMobilePortalSwitcher(options: SchoolPortalOption[]): boolean {
  return shouldShowPortalSwitcher(filterSchoolPortalOptionsForMobile(options));
}

export function portalTypeToAccountPortalId(
  portalType: PortalType | null,
): AccountPortalId | null {
  switch (portalType) {
    case 'school_admin':
      return 'admin';
    case 'teacher':
      return 'teacher';
    case 'parent_apply':
      return 'family_apply';
    case 'parent':
      return 'family_parent';
    default:
      return null;
  }
}

export function accountPortalIdToPortalType(id: AccountPortalId): PortalType {
  switch (id) {
    case 'admin':
      return 'school_admin';
    case 'teacher':
      return 'teacher';
    case 'family_apply':
      return 'parent_apply';
    case 'family_parent':
      return 'parent';
  }
}
