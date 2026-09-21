import { ADMIN_DEMO_COPY, getAdminDemoLogo } from "@/components/demo/shared/admin-demo-runtime";
import {
  PARENT_DEMO_COLORS,
  PARENT_DEMO_COPY,
  getParentDemoLogo,
} from "@/components/demo/shared/parent-demo-runtime";
import {
  TEACHER_DEMO_ACCENT,
  TEACHER_DEMO_ACCENT_HOVER,
  getTeacherDemoLogo,
} from "@/components/demo/shared/teacher-demo-runtime";
import { DEFAULT_BRANDING, DEFAULT_FEATURES } from "@/lib/organization-settings/catalog";
import type { FamilyUserProfile } from "@/lib/admissions/parent-portal-access";
import type { StaffUserProfile } from "@/lib/staff/teacher-portal-access";
import type {
  OrganizationBranding,
  OrganizationFeatures,
} from "@/lib/organization-settings/types";
import type { SchoolAdminDemoCopy } from "./demo-dashboard-types";
import {
  DEMO_ADMIN_ORG_ID,
  DEMO_ADMIN_SLUG,
} from "./demo-admin-dashboard-summary";

export const DEMO_PORTAL_ORG_ID = DEMO_ADMIN_ORG_ID;
export const DEMO_PORTAL_SLUG = DEMO_ADMIN_SLUG;
export const DEMO_TEACHER_STAFF_ID = "demo-teacher-staff";

export const DEMO_TEACHER_FEATURES: OrganizationFeatures = {
  ...DEFAULT_FEATURES,
  admin: {
    ...DEFAULT_FEATURES.admin,
    bulletin: true,
  },
};

export const DEMO_ADMIN_FEATURES: OrganizationFeatures = DEFAULT_FEATURES;

export const DEMO_TEACHER_USER_PROFILE: StaffUserProfile = {
  email: "jordan.taylor@demo.mudkitchen.app",
  displayName: "Jordan Taylor",
  profilePhotoUrl: null,
};

export const DEMO_PARENT_FEATURES: OrganizationFeatures = {
  ...DEFAULT_FEATURES,
  admin: {
    ...DEFAULT_FEATURES.admin,
    bulletin: true,
  },
};

export const DEMO_PARENT_USER_PROFILE: FamilyUserProfile = {
  email: "sarah.mitchell@example.com",
  displayName: "Sarah Mitchell",
  profilePhotoUrl: null,
};

export function resolveDemoSchoolName(copy?: Partial<SchoolAdminDemoCopy>): string {
  return copy?.schoolName ?? ADMIN_DEMO_COPY.schoolName ?? "Mud Kitchen School";
}

export function buildDemoTeacherBranding(
  accent = TEACHER_DEMO_ACCENT,
  accentHover = TEACHER_DEMO_ACCENT_HOVER,
): OrganizationBranding {
  const logo = getTeacherDemoLogo();
  return {
    ...DEFAULT_BRANDING,
    colors: {
      ...DEFAULT_BRANDING.colors,
      accent,
      accentDark: accentHover,
      accentBright: accentHover,
    },
    logo: {
      src: logo.src,
      alt: logo.alt,
      width: logo.width ?? 220,
      height: logo.height ?? 52,
    },
  };
}

export function buildDemoAdminBranding(): OrganizationBranding {
  const logo = getAdminDemoLogo();
  return {
    ...DEFAULT_BRANDING,
    logo: {
      src: logo.src,
      alt: logo.alt,
      width: logo.width ?? 220,
      height: logo.height ?? 52,
    },
  };
}

export function buildDemoParentBranding(
  accent = PARENT_DEMO_COLORS.accent,
  accentHover = PARENT_DEMO_COLORS.accentHover,
): OrganizationBranding {
  const logo = getParentDemoLogo();
  return {
    ...DEFAULT_BRANDING,
    colors: {
      ...DEFAULT_BRANDING.colors,
      accent,
      accentDark: accentHover,
      accentBright: accentHover,
    },
    logo: {
      src: logo.src,
      alt: logo.alt,
      width: logo.width ?? 220,
      height: logo.height ?? 52,
    },
  };
}

export function resolveDemoParentSchoolName(): string {
  return PARENT_DEMO_COPY.schoolName ?? "Mud Kitchen School";
}
