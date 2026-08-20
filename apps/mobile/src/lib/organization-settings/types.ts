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

/** Flat branding shape used in list items and auth context. */
export type OrganizationBrandingView = {
  colors: BrandingColors;
  logoSrc: string;
  logoAlt: string;
};
