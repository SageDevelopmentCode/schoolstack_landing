import type {
  SchoolAdminDemoLogo,
  SchoolTeacherDemoConfig,
  SchoolTeacherDemoCopy,
} from "@/data/school-demos/demo-dashboard-types";
import { buildDemoParentThemeTokens } from "@/components/demo/shared/demo-story-theme";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

export let TEACHER_DEMO_COPY: SchoolTeacherDemoCopy = {
  officeName: "Luff Learning Office",
};

export let TEACHER_DEMO_ACCENT = "#769a61";
export let TEACHER_DEMO_ACCENT_HOVER = "#5f824f";
export let TEACHER_DEMO_PROGRAM_LABELS: Record<string, string> = {};
export let TEACHER_DEMO_PROGRAM_ORDER: string[] = [];

export let TEACHER_DEMO_STORY_THEME: ParentThemeTokens = buildDemoParentThemeTokens({
  accent: TEACHER_DEMO_ACCENT,
  accentHover: TEACHER_DEMO_ACCENT_HOVER,
});

let teacherLogo: SchoolAdminDemoLogo = {
  src: "/images/demo/lufflearning/LogoReverse_GreenHeart_1920x1080_Lufflearning.png",
  alt: "Luff Learning Fine Arts Academy",
  width: 220,
  height: 52,
};

export function getTeacherDemoLogo(): SchoolAdminDemoLogo {
  return teacherLogo;
}

export function applyTeacherDemoRuntime(config: SchoolTeacherDemoConfig): void {
  TEACHER_DEMO_COPY = config.copy;
  TEACHER_DEMO_ACCENT = config.accent;
  TEACHER_DEMO_ACCENT_HOVER = config.accentHover;
  TEACHER_DEMO_PROGRAM_LABELS = { ...config.programLabels };
  TEACHER_DEMO_PROGRAM_ORDER = [...config.programOrder];
  teacherLogo = config.logo;
  TEACHER_DEMO_STORY_THEME = buildDemoParentThemeTokens({
    accent: config.accent,
    accentHover: config.accentHover,
  });
}
