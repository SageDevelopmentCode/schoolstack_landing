export type Portal = "admin" | "teacher" | "parent";
export type FeaturePortal = Portal | "additional";

export type BrandingColors = {
  accent: string;
  accentBright: string;
  accentMid: string;
  accentDark: string;
  accentLight: string;
  accentGlow: string;
  bg: string;
  border: string;
  borderStrong: string;
  textPrimary: string;
  textSecondary: string;
  clay: string;
  clayBg: string;
  clayBorder: string;
  secondaryBtnBorder: string;
};

export type BrandingLogo = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

export type BrandingTypography = {
  headingFont: string;
  bodyFont: string;
};

export type OrganizationBranding = {
  colors: BrandingColors;
  logo: BrandingLogo;
  typography: BrandingTypography;
};

export type AdminFeatures = {
  dashboard: boolean;
  admissions: boolean;
  my_school: boolean;
  committees: boolean;
  schedule: boolean;
  messages: boolean;
  finances: boolean;
  marketing: boolean;
};

export type TeacherFeatures = {
  dashboard: boolean;
  my_students: boolean;
  my_hours: boolean;
  messages: boolean;
  calendar: boolean;
  attendance: boolean;
  feed: boolean;
  payroll: boolean;
  forms_documents: boolean;
};

export type ParentFeatures = {
  portal: boolean;
  billing: boolean;
  messages: boolean;
  calendar: boolean;
  attendance: boolean;
  feed: boolean;
  children: boolean;
  committees: boolean;
};

export type AdditionalFeatures = {
  observation_booking: boolean;
  homeschool_drop_in: boolean;
};

export type OrganizationFeatures = {
  admin: AdminFeatures;
  teacher: TeacherFeatures;
  parent: ParentFeatures;
  feature_nav?: FeatureNavConfig;
  parent_onboarding?: ParentOnboardingConfig;
  apply_auth_entry?: ApplyAuthEntryConfig;
} & Partial<AdditionalFeatures> &
  Record<
    string,
    | boolean
    | AdminFeatures
    | TeacherFeatures
    | ParentFeatures
    | FeatureNavConfig
    | ParentOnboardingConfig
    | ApplyAuthEntryConfig
  >;

export type FeatureNavChildConfig = {
  key: string;
  label?: string;
  icon?: string;
  enabled?: boolean;
};

export type FeatureNavItemConfig = {
  group: string;
  label?: string;
  icon?: string;
  children?: FeatureNavChildConfig[];
};

export type PortalFeatureNav = {
  groups: string[];
  items: Record<string, FeatureNavItemConfig>;
  order?: string[];
};

export type FeatureNavConfig = {
  admin?: PortalFeatureNav;
  teacher?: PortalFeatureNav;
  parent?: PortalFeatureNav;
};

export type ParentOnboardingAutoCompletionType =
  | "billing"
  | "messages"
  | "committees"
  | "children";

export type ParentOnboardingItem = {
  id: string;
  label: string;
  icon?: string;
  target: string;
};

export type ParentOnboardingConfig = {
  items: ParentOnboardingItem[];
};

export type ApplyAuthEntryType = "apply" | "schedule_campus_tour";

export type ApplyAuthEntryOption = {
  id: string;
  type: ApplyAuthEntryType;
  enabled: boolean;
  label?: string;
  description?: string;
};

export type ApplyAuthEntryConfig = {
  options: ApplyAuthEntryOption[];
};

export type OrganizationSettingsRow = {
  organization_id: string;
  branding: OrganizationBranding;
  features: OrganizationFeatures;
  admissions?: import("@/lib/admissions/admissions-org-settings").AdmissionsOrgSettings | Record<string, unknown> | null;
  created_at?: string;
  updated_at?: string;
};

export type BrandingFieldType = "color" | "text" | "number";

export type BrandingFieldDef = {
  path: string;
  label: string;
  type: BrandingFieldType;
  group: string;
};

export type FeatureDef = {
  portal: Portal | "additional";
  key: string;
  label: string;
  description?: string;
};
