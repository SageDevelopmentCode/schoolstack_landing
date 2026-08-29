#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const parentFile = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../src/components/demo/shared/SchoolParentDashboardDemo.tsx",
);
const teacherFile = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../src/components/demo/shared/SchoolTeacherDashboardDemo.tsx",
);

let parent = fs.readFileSync(parentFile, "utf8");
parent = parent.replace(
  `import { LUFF_LEARNING_PARENT_LOGO } from "@/data/school-demos/luff-learning-parent-demo";`,
  `import type { SchoolParentDemoConfig } from "@/data/school-demos/demo-dashboard-types";
import {
  PARENT_DEMO_COPY,
  applyParentDemoRuntime,
  getParentDemoLogo,
} from "@/components/demo/shared/parent-demo-runtime";`,
);
parent = parent.replaceAll("LUFF_LEARNING_PARENT_LOGO", "getParentDemoLogo()");
parent = parent.replaceAll(
  '"Luff Learning Fine Arts Academy"',
  "PARENT_DEMO_COPY.schoolName",
);
parent = parent.replaceAll(
  '"Luff Learning Fine Arts Academy Office"',
  "PARENT_DEMO_COPY.officeName",
);
parent = parent.replace(
  "export default function LuffLearningParentDashboardDemo({",
  "export default function SchoolParentDashboardDemo({\n  config,",
);
parent = parent.replace(
  `}: {
  disableTour?: boolean`,
  `}: {
  config: SchoolParentDemoConfig;
  disableTour?: boolean`,
);
parent = parent.replace(
  /export default function SchoolParentDashboardDemo\(\{[\s\S]*?\) \{\n/,
  (m) => `${m}  applyParentDemoRuntime(config);\n`,
);
fs.writeFileSync(parentFile, parent);

let teacher = fs.readFileSync(teacherFile, "utf8");
teacher = teacher.replace(
  /import \{[\s\S]*?\} from "@\/data\/school-demos\/luff-learning-teacher-demo";\n/,
  `import type { SchoolTeacherDemoConfig } from "@/data/school-demos/demo-dashboard-types";
import {
  TEACHER_DEMO_COPY,
  TEACHER_DEMO_PROGRAM_LABELS,
  TEACHER_DEMO_PROGRAM_ORDER,
  applyTeacherDemoRuntime,
  getTeacherDemoLogo,
} from "@/components/demo/shared/teacher-demo-runtime";
`,
);
teacher = teacher.replace(
  "const PROGRAM_LABELS = LUFF_LEARNING_TEACHER_PROGRAM_LABELS;\n",
  "",
);
teacher = teacher.replace(
  "const PROGRAM_ORDER = [...LUFF_LEARNING_TEACHER_PROGRAM_ORDER];\n",
  "",
);
teacher = teacher.replaceAll(
  /(?<!TEACHER_DEMO_)PROGRAM_LABELS/g,
  "TEACHER_DEMO_PROGRAM_LABELS",
);
teacher = teacher.replaceAll(
  /(?<!TEACHER_DEMO_)PROGRAM_ORDER/g,
  "TEACHER_DEMO_PROGRAM_ORDER",
);
teacher = teacher.replaceAll("LUFF_LEARNING_TEACHER_LOGO", "getTeacherDemoLogo()");
teacher = teacher.replaceAll("LUFF_LEARNING_TEACHER_OFFICE", "TEACHER_DEMO_COPY.officeName");
teacher = teacher.replace(
  /export default function \w+TeacherDashboardDemo\(\{/,
  "export default function SchoolTeacherDashboardDemo({\n  config,",
);
teacher = teacher.replace(
  `}: {
  disableTour?: boolean`,
  `}: {
  config: SchoolTeacherDemoConfig;
  disableTour?: boolean`,
);
teacher = teacher.replace(
  /export default function SchoolTeacherDashboardDemo\(\{[\s\S]*?\) \{\n/,
  (m) =>
    `${m}  applyTeacherDemoRuntime(config);\n`,
);
fs.writeFileSync(teacherFile, teacher);
console.log("Transformed parent and teacher shared demos");
