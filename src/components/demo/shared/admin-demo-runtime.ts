import type {
  SchoolAdminDemoColors,
  SchoolAdminDemoConfig,
  SchoolAdminDemoCopy,
  SchoolAdminDemoLogo,
} from "@/data/school-demos/demo-dashboard-types";

export let ADMIN_DEMO_COLORS: SchoolAdminDemoColors = {
  bg: "#f7fafc",
  border: "#eeeeee",
  borderStrong: "#769a61",
  accent: "#769a61",
  accentBright: "#5f824f",
  accentLight: "rgba(118, 154, 97, 0.10)",
  secondaryBtnBorder: "rgba(118, 154, 97, 0.22)",
  accentGlow: "rgba(118, 154, 97, 0.12)",
  accentMid: "#644268",
  accentDark: "#1e141f",
  clay: "#efad1f",
  clayBg: "rgba(239, 173, 31, 0.12)",
  clayBorder: "rgba(239, 173, 31, 0.35)",
  textPrimary: "#1e141f",
  textSecondary: "#718096",
};

export let ADMIN_DEMO_COPY: SchoolAdminDemoCopy = {
  schoolName: "Luff Learning Fine Arts Academy",
  schoolShortName: "Luff Learning",
  officeName: "Luff Learning Office",
  locationSubtitle:
    "Luff Learning Fine Arts Academy — Spring, TX · 2026–27 Enrollment",
};

let adminLogo: SchoolAdminDemoLogo = {
  src: "/images/demo/lufflearning/LogoReverse_GreenHeart_1920x1080_Lufflearning.png",
  alt: "Luff Learning Fine Arts Academy",
  width: 220,
  height: 52,
};

let adminCompactRows = 5;

export function getAdminDemoLogo(): SchoolAdminDemoLogo {
  return adminLogo;
}

export function getAdminCompactRows(): number {
  return adminCompactRows;
}

export function applyAdminDemoRuntime(config: SchoolAdminDemoConfig): void {
  ADMIN_DEMO_COLORS = config.colors;
  ADMIN_DEMO_COPY = config.copy;
  adminLogo = config.logo;
  adminCompactRows = config.compactRows;
}
