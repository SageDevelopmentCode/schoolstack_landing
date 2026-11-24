export {
  A_MIND_OF_MAGIC_AND_REASON_LOGO as A_MIND_OF_MAGIC_AND_REASON_TEACHER_LOGO,
} from "./a-mind-of-magic-and-reason-admin-demo";

export const A_MIND_OF_MAGIC_AND_REASON_TEACHER_OFFICE = "AMOMAR Office";
export const A_MIND_OF_MAGIC_AND_REASON_TEACHER_ACCENT = "#0A4596";
export const A_MIND_OF_MAGIC_AND_REASON_TEACHER_ACCENT_HOVER = "#1A58B0";

export const A_MIND_OF_MAGIC_AND_REASON_TEACHER_PROGRAM_LABELS: Record<string, string> = {
  kTwo: "K–2nd Seekers",
  threeEight: "3rd–8th Seekers",
};

export const A_MIND_OF_MAGIC_AND_REASON_TEACHER_PROGRAM_ORDER = ["kTwo", "threeEight"] as const;

import { A_MIND_OF_MAGIC_AND_REASON_ADMIN_LOGO } from "./a-mind-of-magic-and-reason-admin-demo";
import type { SchoolTeacherDemoConfig } from "./demo-dashboard-types";

export const aMindOfMagicAndReasonTeacherDemoConfig: SchoolTeacherDemoConfig = {
  slug: "a-mind-of-magic-and-reason",
  logo: A_MIND_OF_MAGIC_AND_REASON_ADMIN_LOGO,
  accent: A_MIND_OF_MAGIC_AND_REASON_TEACHER_ACCENT,
  accentHover: A_MIND_OF_MAGIC_AND_REASON_TEACHER_ACCENT_HOVER,
  programLabels: A_MIND_OF_MAGIC_AND_REASON_TEACHER_PROGRAM_LABELS,
  programOrder: A_MIND_OF_MAGIC_AND_REASON_TEACHER_PROGRAM_ORDER,
  copy: {
    officeName: A_MIND_OF_MAGIC_AND_REASON_TEACHER_OFFICE,
  },
};
