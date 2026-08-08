import { CANONICAL_SCHOOL_SLUG, CI_LHCI_PAGE_PATHS } from "@/lib/performance/page-manifest";

const SCHOOL_BASE = `/school/${CANONICAL_SCHOOL_SLUG}`;

const MARKETING_CI_PATHS = ["/", "/get-started", "/customers"] as const;

const ADMISSIONS_CI_PATHS = [
  `${SCHOOL_BASE}/apply`,
  `${SCHOOL_BASE}/forms/apply`,
] as const;

const ADMIN_CI_PATHS = [
  `${SCHOOL_BASE}/admin/login`,
  `${SCHOOL_BASE}/admin/dashboard`,
  `${SCHOOL_BASE}/admin/admissions/submissions`,
] as const;

const PARENT_CI_PATHS = [
  `${SCHOOL_BASE}/parent`,
  `${SCHOOL_BASE}/parent/portal`,
  `${SCHOOL_BASE}/parent/billing`,
  `${SCHOOL_BASE}/parent/children`,
] as const;

const GLOBAL_CHANGE_PATTERNS: RegExp[] = [
  /^src\/app\/layout\.tsx$/,
  /^src\/app\/globals\.css$/,
  /^next\.config\.ts$/,
  /^middleware\.ts$/,
  /^package\.json$/,
  /^package-lock\.json$/,
];

const MARKETING_CHANGE_PATTERNS: RegExp[] = [
  /^src\/app\/page\.tsx$/,
  /^src\/app\/get-started\//,
  /^src\/app\/customers\//,
  /^src\/components\/sections\//,
];

const ADMISSIONS_CHANGE_PATTERNS: RegExp[] = [
  /^src\/app\/school\/[^/]+\/apply\//,
  /^src\/app\/school\/[^/]+\/forms\//,
  /^src\/lib\/admissions\//,
];

const ADMIN_CHANGE_PATTERNS: RegExp[] = [
  /^src\/app\/school\/[^/]+\/admin\//,
  /^src\/components\/school-admin\//,
];

const PARENT_CHANGE_PATTERNS: RegExp[] = [
  /^src\/app\/school\/[^/]+\/parent\//,
  /^src\/components\/school-parent\//,
];

function matchesAny(file: string, patterns: RegExp[]): boolean {
  return patterns.some((pattern) => pattern.test(file));
}

function isAppOrPublicFallback(file: string): boolean {
  return file.startsWith("src/") || file.startsWith("public/");
}

function addPaths(target: Set<string>, paths: readonly string[]) {
  for (const path of paths) {
    target.add(path);
  }
}

function expandAuthPaths(selected: Set<string>): void {
  const adminAuthPaths = ADMIN_CI_PATHS.filter(
    (path) => path !== `${SCHOOL_BASE}/admin/login`,
  );
  const parentAuthPaths = PARENT_CI_PATHS.filter((path) => path !== `${SCHOOL_BASE}/parent`);

  if (adminAuthPaths.some((path) => selected.has(path))) {
    selected.add(`${SCHOOL_BASE}/admin/login`);
  }

  if (parentAuthPaths.some((path) => selected.has(path))) {
    selected.add(`${SCHOOL_BASE}/parent`);
  }
}

export function resolveCiPagesFromChangedFiles(changedFiles: string[]): string[] {
  if (!changedFiles.length) {
    return [...CI_LHCI_PAGE_PATHS];
  }

  const selected = new Set<string>();

  for (const file of changedFiles) {
    const normalized = file.replace(/\\/g, "/");

    if (matchesAny(normalized, GLOBAL_CHANGE_PATTERNS)) {
      return [...CI_LHCI_PAGE_PATHS];
    }

    if (matchesAny(normalized, MARKETING_CHANGE_PATTERNS)) {
      addPaths(selected, MARKETING_CI_PATHS);
      continue;
    }

    if (matchesAny(normalized, ADMIN_CHANGE_PATTERNS)) {
      addPaths(selected, ADMIN_CI_PATHS);
      continue;
    }

    if (matchesAny(normalized, ADMISSIONS_CHANGE_PATTERNS)) {
      addPaths(selected, ADMISSIONS_CI_PATHS);
      continue;
    }

    if (matchesAny(normalized, PARENT_CHANGE_PATTERNS)) {
      addPaths(selected, PARENT_CI_PATHS);
      continue;
    }

    if (isAppOrPublicFallback(normalized)) {
      return [...CI_LHCI_PAGE_PATHS];
    }
  }

  if (!selected.size) {
    return [...CI_LHCI_PAGE_PATHS];
  }

  expandAuthPaths(selected);

  return CI_LHCI_PAGE_PATHS.filter((path) => selected.has(path));
}
