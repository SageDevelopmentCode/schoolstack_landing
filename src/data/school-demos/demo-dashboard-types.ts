/** Branding tokens shared by admin dashboard demos. */
export interface SchoolAdminDemoColors {
  bg: string;
  border: string;
  borderStrong: string;
  accent: string;
  accentBright: string;
  accentLight: string;
  secondaryBtnBorder: string;
  accentGlow: string;
  accentMid: string;
  accentDark: string;
  clay: string;
  clayBg: string;
  clayBorder: string;
  textPrimary: string;
  textSecondary: string;
}

export interface SchoolAdminDemoLogo {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  text?: string;
  textClassName?: string;
  logoOnDarkClassName?: string;
}

/** School-specific strings substituted into default admin mock content. */
export interface SchoolAdminDemoCopy {
  schoolName: string;
  schoolShortName: string;
  officeName: string;
  /** e.g. "Spring, TX · 2026–27 Enrollment" */
  locationSubtitle: string;
}

/** Partial overrides for mock data that differs from the canonical Luff demo. */
export interface SchoolAdminDemoContentOverrides {
  demoEvents?: unknown;
  demoLeads?: unknown;
  demoEmails?: unknown;
  admissionsSubtitle?: string;
}

export interface SchoolAdminDemoConfig {
  slug: string;
  logo: SchoolAdminDemoLogo;
  colors: SchoolAdminDemoColors;
  compactRows: number;
  copy: SchoolAdminDemoCopy;
  contentOverrides?: SchoolAdminDemoContentOverrides;
}

export interface SchoolParentDemoColors {
  accent: string;
  accentHover: string;
}

export interface SchoolParentDemoCopy {
  schoolName: string;
  schoolShortName: string;
  officeName: string;
}

export interface SchoolParentDemoConfig {
  slug: string;
  logo: SchoolAdminDemoLogo;
  colors: SchoolParentDemoColors;
  copy: SchoolParentDemoCopy;
  contentOverrides?: Record<string, unknown>;
}

export interface SchoolTeacherDemoCopy {
  officeName: string;
}

export interface SchoolTeacherDemoConfig {
  slug: string;
  logo: SchoolAdminDemoLogo;
  accent: string;
  accentHover: string;
  programLabels: Record<string, string>;
  programOrder: readonly string[];
  copy: SchoolTeacherDemoCopy;
  contentOverrides?: Record<string, unknown>;
}
