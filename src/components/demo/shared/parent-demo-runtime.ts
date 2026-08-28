import type {
  SchoolAdminDemoLogo,
  SchoolParentDemoColors,
  SchoolParentDemoCopy,
  SchoolParentDemoConfig,
} from "@/data/school-demos/demo-dashboard-types";

export let PARENT_DEMO_COPY: SchoolParentDemoCopy = {
  schoolName: "Luff Learning Fine Arts Academy",
  schoolShortName: "Luff Learning",
  officeName: "Luff Learning Office",
};

export let PARENT_DEMO_COLORS: SchoolParentDemoColors = {
  accent: "#769a61",
  accentHover: "#5f824f",
};

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
}
