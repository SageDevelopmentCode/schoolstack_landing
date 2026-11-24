export {
  A_MIND_OF_MAGIC_AND_REASON_LOGO as A_MIND_OF_MAGIC_AND_REASON_PARENT_LOGO,
  A_MIND_OF_MAGIC_AND_REASON_ADMIN_COLORS,
} from "./a-mind-of-magic-and-reason-admin-demo";

export const A_MIND_OF_MAGIC_AND_REASON_PARENT_ACCENT = "#0A4596";
export const A_MIND_OF_MAGIC_AND_REASON_PARENT_ACCENT_HOVER = "#1A58B0";
export const A_MIND_OF_MAGIC_AND_REASON_PARENT_SCHOOL_NAME = "A Mind of Magic and Reason";
export const A_MIND_OF_MAGIC_AND_REASON_PARENT_SCHOOL_SHORT = "AMOMAR";
export const A_MIND_OF_MAGIC_AND_REASON_PARENT_OFFICE = "AMOMAR Office";

import { A_MIND_OF_MAGIC_AND_REASON_ADMIN_LOGO } from "./a-mind-of-magic-and-reason-admin-demo";
import type { SchoolParentDemoConfig } from "./demo-dashboard-types";

export const aMindOfMagicAndReasonParentDemoConfig: SchoolParentDemoConfig = {
  slug: "a-mind-of-magic-and-reason",
  logo: A_MIND_OF_MAGIC_AND_REASON_ADMIN_LOGO,
  colors: {
    accent: A_MIND_OF_MAGIC_AND_REASON_PARENT_ACCENT,
    accentHover: A_MIND_OF_MAGIC_AND_REASON_PARENT_ACCENT_HOVER,
  },
  copy: {
    schoolName: A_MIND_OF_MAGIC_AND_REASON_PARENT_SCHOOL_NAME,
    schoolShortName: A_MIND_OF_MAGIC_AND_REASON_PARENT_SCHOOL_SHORT,
    officeName: A_MIND_OF_MAGIC_AND_REASON_PARENT_OFFICE,
  },
};
