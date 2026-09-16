import type {
  SchoolAdminDemoLogo,
  SchoolParentDemoColors,
  SchoolParentDemoCopy,
  SchoolParentDemoConfig,
} from "@/data/school-demos/demo-dashboard-types";
import { buildDemoParentThemeTokens } from "@/components/demo/shared/demo-story-theme";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

export let PARENT_DEMO_COPY: SchoolParentDemoCopy = {
  schoolName: "Luff Learning Fine Arts Academy",
  schoolShortName: "Luff Learning",
  officeName: "Luff Learning Office",
};

export let PARENT_DEMO_COLORS: SchoolParentDemoColors = {
  accent: "#769a61",
  accentHover: "#5f824f",
};

export let PARENT_DEMO_STORY_THEME: ParentThemeTokens = buildDemoParentThemeTokens({
  accent: PARENT_DEMO_COLORS.accent,
  accentHover: PARENT_DEMO_COLORS.accentHover,
});

let parentLogo: SchoolAdminDemoLogo = {
  src: "/images/demo/lufflearning/LogoReverse_GreenHeart_1920x1080_Lufflearning.png",
  alt: "Luff Learning Fine Arts Academy",
  width: 220,
  height: 52,
};

export function getParentDemoLogo(): SchoolAdminDemoLogo {
  return parentLogo;
}

export function applyParentDemoRuntime(config: SchoolParentDemoConfig): void {
  PARENT_DEMO_COPY = config.copy;
  PARENT_DEMO_COLORS = config.colors;
  parentLogo = config.logo;
  PARENT_DEMO_STORY_THEME = buildDemoParentThemeTokens({
    accent: config.colors.accent,
    accentHover: config.colors.accentHover,
  });
}
