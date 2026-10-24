#!/usr/bin/env node
/**
 * Maps changed files on a branch to portal QA scenario IDs.
 * Keep scenario IDs in sync with e2e/qa/portal-scenarios.ts
 */
import { execSync } from "node:child_process";
import { parseArgs } from "node:util";

const { values } = parseArgs({
  options: {
    base: { type: "string", default: "origin/main" },
    uncommitted: { type: "boolean", default: false },
    cached: { type: "boolean", default: false },
  },
});

const BASE = values.base ?? "origin/main";

const COMMITTEE_SCENARIO_IDS = [
  "committee-messages",
  "committee-home",
  "committee-tasks",
  "committee-members",
  "committee-resources",
  "committee-calendar",
];

const PARENT_COOP_SCENARIO_IDS = [
  "parent-coop-portal-home",
  "parent-coop-curriculum",
  "parent-coop-supply-list",
  "parent-coop-teaching-schedule",
];

const TEACHER_COMMITTEE_SCENARIO_IDS = [
  "teacher-committee-messages",
  "teacher-committee-home",
  "teacher-committee-tasks",
  "teacher-committee-members",
  "teacher-committee-resources",
  "teacher-committee-calendar",
];

const TEACHER_SCENARIO_IDS = [
  "teacher-dashboard",
  "teacher-messages",
  "teacher-my-students",
  "teacher-classroom-signups",
  "teacher-classroom-signup-detail",
  "teacher-forms-documents",
  "teacher-calendar",
  "teacher-attendance",
  "teacher-committees-list",
  ...TEACHER_COMMITTEE_SCENARIO_IDS,
  "teacher-my-hours",
  "teacher-feed",
  "teacher-payroll",
];

/** All golden scenario IDs (portal-qa capture). */
export const GOLDEN_SCENARIO_IDS = [
  ...COMMITTEE_SCENARIO_IDS,
  "parent-messages-inbox",
  "parent-home",
  "parent-billing",
  "parent-committees-list",
  "parent-calendar",
  "parent-attendance",
  "parent-children",
  "parent-children-health",
  "parent-children-pickup",
  "parent-classroom-signups",
  "parent-classroom-signup-detail",
  "parent-forms-documents",
  "parent-friday-branch",
  "parent-feed",
  "parent-notifications",
  ...PARENT_COOP_SCENARIO_IDS,
  ...TEACHER_SCENARIO_IDS,
  "admin-dashboard",
  "admin-admissions-submissions",
];

const BASELINE_SHELL_PATTERNS = [
  /^src\/components\/school-parent\/SchoolParentBaseline\.tsx$/,
  /^src\/components\/school-parent\/SchoolParentPageShell\.tsx$/,
  /^src\/components\/school-teacher\/SchoolTeacherBaseline\.tsx$/,
  /^src\/components\/school-admin\/committees\/CommitteeWorkspaceLayout\.tsx$/,
  /^src\/components\/school-admin\/committees\/sections\//,
  /^src\/components\/messages\//,
  /^src\/components\/school-parent\/committees\//,
];

const LAYOUT_CRITICAL_PATTERNS = [
  ...BASELINE_SHELL_PATTERNS,
  /^src\/components\/school-parent\//,
  /^src\/components\/classroom-signups\/parent\//,
  /^src\/components\/classroom-signups\/teacher\//,
  /^src\/components\/school-teacher\//,
  /^src\/components\/school-teacher\/messages\//,
  /^e2e\/qa\//,
  /^e2e\/fixtures\/portal-qa-parent-seed/,
  /^src\/app\/school\/[^/]+\/parent\//,
  /^src\/app\/school\/[^/]+\/teacher\//,
  /^src\/app\/school\/[^/]+\/admin\//,
  /^src\/app\/admin\/\(preview\)\/preview\//,
];

/** Path prefix / regex → scenario IDs (order: more specific first). */
const SCENARIO_RULES = [
  {
    scenarios: [...COMMITTEE_SCENARIO_IDS, ...TEACHER_COMMITTEE_SCENARIO_IDS],
    patterns: [
      /CommitteeWorkspaceLayout/,
      /CommitteeMessagesSection/,
      /CommitteeTasksSection/,
      /CommitteeMembersSection/,
      /school-admin\/committees\//,
      /school-parent\/committees\//,
      /portal-committees\//,
      /parent\/committees/,
      /teacher\/committees/,
    ],
  },
  {
    scenarios: PARENT_COOP_SCENARIO_IDS,
    patterns: [
      /school-parent\/curriculum\//,
      /school-parent\/supply-list\//,
      /school-parent\/teaching-schedule\//,
      /program-coop/,
      /parent\/p\//,
    ],
  },
  {
    scenarios: ["parent-classroom-signups", "parent-classroom-signup-detail"],
    patterns: [/classroom-signups\/parent/, /parent\/classroom_signups/],
  },
  {
    scenarios: ["parent-forms-documents"],
    patterns: [/school-parent\/forms-documents/, /parent\/forms_documents/],
  },
  {
    scenarios: ["parent-friday-branch"],
    patterns: [/friday-branch/, /parent\/friday_branch/],
  },
  {
    scenarios: ["parent-calendar"],
    patterns: [/school-parent\/calendar/, /parent\/calendar/],
  },
  {
    scenarios: ["parent-attendance"],
    patterns: [/school-parent\/attendance/, /parent\/attendance/],
  },
  {
    scenarios: ["parent-children", "parent-children-health", "parent-children-pickup"],
    patterns: [
      /school-parent\/children/,
      /school-parent\/health/,
      /school-parent\/pickup/,
      /parent\/children/,
    ],
  },
  {
    scenarios: ["parent-notifications"],
    patterns: [/parent\/notifications/, /ParentNotificationSettings/],
  },
  {
    scenarios: ["parent-feed"],
    patterns: [/parent\/feed/, /SchoolParentComingSoon/],
  },
  {
    scenarios: ["parent-messages-inbox"],
    patterns: [
      /school-parent\/messages\//,
      /MessagesInboxLayout/,
      /parent\/messages/,
    ],
  },
  {
    scenarios: ["parent-billing"],
    patterns: [/school-parent\/billing\//, /parent\/billing/],
  },
  {
    scenarios: ["parent-committees-list"],
    patterns: [/parent\/committees/, /school-parent\/committees\//],
  },
  {
    scenarios: ["parent-home"],
    patterns: [
      /parent-portal-home/,
      /SchoolParentPageShell/,
      /SchoolParentBaseline/,
      /parent\/\(protected\)\/\(school\)\/page\.tsx$/,
      /parent\/portal/,
    ],
  },
  {
    scenarios: ["teacher-classroom-signups", "teacher-classroom-signup-detail"],
    patterns: [/classroom-signups\/teacher/, /teacher\/classroom_signups/],
  },
  {
    scenarios: ["teacher-forms-documents"],
    patterns: [/school-teacher\/forms-documents/, /teacher\/forms_documents/],
  },
  {
    scenarios: ["teacher-calendar"],
    patterns: [/TeacherCalendarPage/, /teacher\/calendar/],
  },
  {
    scenarios: ["teacher-attendance"],
    patterns: [/TeacherAttendancePage/, /teacher\/attendance/],
  },
  {
    scenarios: ["teacher-my-students"],
    patterns: [/TeacherMyStudentsPage/, /teacher\/my_students/],
  },
  {
    scenarios: ["teacher-committees-list"],
    patterns: [/teacher\/committees/, /school-teacher\/committees/],
  },
  {
    scenarios: ["teacher-my-hours", "teacher-feed", "teacher-payroll"],
    patterns: [/teacher\/my_hours/, /teacher\/feed/, /teacher\/payroll/, /SchoolTeacherComingSoon/],
  },
  {
    scenarios: ["teacher-messages"],
    patterns: [/school-teacher\/messages\//, /teacher\/messages/],
  },
  {
    scenarios: ["teacher-dashboard"],
    patterns: [/TeacherDashboardPage/, /teacher\/dashboard/],
  },
  {
    scenarios: ["admin-admissions-submissions"],
    patterns: [/admin\/admissions\/submissions/, /admissions-submissions/],
  },
  {
    scenarios: ["admin-dashboard"],
    patterns: [/school-admin\/.*[Dd]ashboard/, /admin\/dashboard/],
  },
];

function gitLines(command) {
  try {
    return execSync(command, { encoding: "utf8" })
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

function collectChangedPaths() {
  const paths = new Set();
  for (const file of gitLines(`git diff --name-only ${BASE}...HEAD`)) {
    paths.add(file);
  }
  if (values.uncommitted) {
    for (const file of gitLines("git diff --name-only HEAD")) {
      paths.add(file);
    }
  }
  if (values.cached || values.uncommitted) {
    for (const file of gitLines("git diff --name-only --cached")) {
      paths.add(file);
    }
  }
  return [...paths];
}

function matchesAny(path, patterns) {
  return patterns.some((p) => (p instanceof RegExp ? p.test(path) : path.startsWith(p)));
}

function resolveScenarios(paths) {
  const scenarioSet = new Set();
  const triggers = [];

  let expandedToGolden = false;

  for (const path of paths) {
    if (
      !matchesAny(path, LAYOUT_CRITICAL_PATTERNS) &&
      !path.startsWith("src/") &&
      !path.startsWith("e2e/")
    ) {
      continue;
    }

    if (matchesAny(path, BASELINE_SHELL_PATTERNS)) {
      expandedToGolden = true;
      triggers.push({ path, reason: "baseline_or_shell" });
      continue;
    }

    for (const rule of SCENARIO_RULES) {
      if (matchesAny(path, rule.patterns)) {
        for (const id of rule.scenarios) {
          scenarioSet.add(id);
        }
        triggers.push({ path, scenarios: rule.scenarios });
        break;
      }
    }
  }

  if (expandedToGolden) {
    for (const id of GOLDEN_SCENARIO_IDS) {
      scenarioSet.add(id);
    }
  }

  const scenarios = [...scenarioSet].sort();
  return { scenarios, triggers, expandedToGolden };
}

const changedPaths = collectChangedPaths();
const { scenarios, triggers, expandedToGolden } = resolveScenarios(changedPaths);

const output = {
  base: BASE,
  changedPathCount: changedPaths.length,
  portalRelatedPathCount: changedPaths.filter((p) =>
    matchesAny(p, LAYOUT_CRITICAL_PATTERNS),
  ).length,
  scenarios,
  expandedToGolden,
  triggers,
  goldenScenarioIds: GOLDEN_SCENARIO_IDS,
};

process.stdout.write(`${JSON.stringify(output, null, 2)}\n`);
