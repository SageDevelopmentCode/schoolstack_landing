import { listSchoolDemoOptions } from "@/data/school-demos";
import { DEFAULT_FEATURES } from "@/lib/organization-settings/catalog";
import { buildAdminNavGroups } from "@/lib/organization-settings/admin-nav";
import { schoolAdminPath } from "@/lib/organization-settings/admin-routes";
import { buildParentNavItems } from "@/lib/organization-settings/parent-nav";
import { SITE_URL } from "@/lib/site";
import type { AuditEnvironment, PageTarget } from "./types";

export const CANONICAL_SCHOOL_SLUG = "rooted-meadows-school";

const MARKETING_PAGES: Omit<PageTarget, "id">[] = [
  { category: "marketing", label: "Homepage", path: "/", requiresAuth: "none" },
  { category: "marketing", label: "Get started", path: "/get-started", requiresAuth: "none" },
  { category: "marketing", label: "Customers", path: "/customers", requiresAuth: "none" },
  {
    category: "marketing",
    label: "Customers — Sagefield",
    path: "/customers/sagefield",
    requiresAuth: "none",
  },
  { category: "marketing", label: "Demo school", path: "/demo-school", requiresAuth: "none" },
  { category: "marketing", label: "Website demo", path: "/website-demo", requiresAuth: "none" },
  { category: "marketing", label: "Research", path: "/research", requiresAuth: "none" },
];

function slugifyId(value: string) {
  return value.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase();
}

function buildDemoPages(): PageTarget[] {
  return listSchoolDemoOptions().map((demo) => ({
    id: `demo-${demo.slug}`,
    category: "demo" as const,
    label: `Demo — ${demo.label}`,
    path: `/demo/${demo.slug}`,
    requiresAuth: "none" as const,
  }));
}

function buildSchoolAdminPages(): PageTarget[] {
  const groups = buildAdminNavGroups(DEFAULT_FEATURES.admin);
  const pages: PageTarget[] = [
    {
      id: "school-admin-login",
      category: "school_admin",
      label: "Admin login",
      path: `/school/${CANONICAL_SCHOOL_SLUG}/admin/login`,
      requiresAuth: "none",
    },
  ];

  for (const group of groups) {
    for (const item of group.items) {
      pages.push({
        id: `school-admin-${item.key}`,
        category: "school_admin",
        label: `Admin — ${item.name}`,
        path: schoolAdminPath(CANONICAL_SCHOOL_SLUG, item.key),
        requiresAuth: "school_admin",
      });

      for (const child of item.children ?? []) {
        pages.push({
          id: `school-admin-${item.key}-${child.key}`,
          category: "school_admin",
          label: `Admin — ${item.name} / ${child.name}`,
          path: schoolAdminPath(CANONICAL_SCHOOL_SLUG, item.key, child.key),
          requiresAuth: "school_admin",
        });
      }
    }
  }

  return pages;
}

function buildSchoolParentPages(): PageTarget[] {
  const items = buildParentNavItems(CANONICAL_SCHOOL_SLUG, DEFAULT_FEATURES.parent);
  const pages: PageTarget[] = [
    {
      id: "school-parent-index",
      category: "school_parent",
      label: "Parent portal index",
      path: `/school/${CANONICAL_SCHOOL_SLUG}/parent`,
      requiresAuth: "parent",
    },
  ];

  for (const item of items) {
    pages.push({
      id: `school-parent-${item.key}`,
      category: "school_parent",
      label: `Parent — ${item.name}`,
      path: item.href,
      requiresAuth: "parent",
    });

    for (const child of item.children ?? []) {
      pages.push({
        id: `school-parent-${item.key}-${child.key}`,
        category: "school_parent",
        label: `Parent — ${item.name} / ${child.name}`,
        path: child.href,
        requiresAuth: "parent",
      });
    }
  }

  return pages;
}

function buildAdmissionsPages(): PageTarget[] {
  return [
    {
      id: "admissions-apply",
      category: "admissions",
      label: "Apply portal",
      path: `/school/${CANONICAL_SCHOOL_SLUG}/apply`,
      requiresAuth: "none",
    },
    {
      id: "admissions-apply-form",
      category: "admissions",
      label: "Apply form",
      path: `/school/${CANONICAL_SCHOOL_SLUG}/forms/apply`,
      requiresAuth: "none",
    },
  ];
}

export function getPerformancePageManifest(): PageTarget[] {
  const marketing = MARKETING_PAGES.map((page) => ({
    ...page,
    id: `marketing-${slugifyId(page.path || "home")}`,
  }));

  return [
    ...marketing,
    ...buildDemoPages(),
    ...buildAdmissionsPages(),
    ...buildSchoolAdminPages(),
    ...buildSchoolParentPages(),
  ];
}

export function getPageTargetById(pageId: string): PageTarget | undefined {
  return getPerformancePageManifest().find((page) => page.id === pageId);
}

export function resolvePageBaseUrl(environment: AuditEnvironment): string {
  if (environment === "local" || environment === "ci") {
    return (
      process.env.PERFORMANCE_LOCAL_BASE_URL?.replace(/\/$/, "") ??
      "http://localhost:3000"
    );
  }

  return SITE_URL.replace(/\/$/, "");
}

export function resolvePageUrl(path: string, environment: AuditEnvironment): string {
  const base = resolvePageBaseUrl(environment);
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalizedPath}`;
}

export function filterPagesForRun(
  pageIds: string[] | undefined,
  options?: { publicOnly?: boolean },
): PageTarget[] {
  const manifest = getPerformancePageManifest();
  const selected = pageIds?.length
    ? manifest.filter((page) => pageIds.includes(page.id))
    : manifest;

  if (options?.publicOnly) {
    return selected.filter((page) => page.requiresAuth === "none");
  }

  return selected;
}

export function shouldSkipOnProduction(page: PageTarget): boolean {
  return page.requiresAuth !== "none";
}

/** Paths audited on every GitHub Actions Lighthouse CI run (mobile). */
export const CI_LHCI_PAGE_PATHS = [
  "/",
  "/get-started",
  "/customers",
  `/school/${CANONICAL_SCHOOL_SLUG}/apply`,
  `/school/${CANONICAL_SCHOOL_SLUG}/forms/apply`,
  `/school/${CANONICAL_SCHOOL_SLUG}/admin/login`,
  `/school/${CANONICAL_SCHOOL_SLUG}/admin/dashboard`,
  `/school/${CANONICAL_SCHOOL_SLUG}/admin/admissions/submissions`,
  `/school/${CANONICAL_SCHOOL_SLUG}/parent`,
  `/school/${CANONICAL_SCHOOL_SLUG}/parent/portal`,
  `/school/${CANONICAL_SCHOOL_SLUG}/parent/billing`,
  `/school/${CANONICAL_SCHOOL_SLUG}/parent/children`,
] as const;

export function getCiLighthousePages(): PageTarget[] {
  const manifest = getPerformancePageManifest();
  const byPath = new Map(manifest.map((page) => [page.path, page]));

  return CI_LHCI_PAGE_PATHS.map((path) => {
    const page = byPath.get(path);
    if (!page) {
      throw new Error(`CI Lighthouse path missing from manifest: ${path}`);
    }
    return page;
  });
}

export function resolveCiLighthouseUrls(
  environment: AuditEnvironment = "ci",
): string[] {
  return getCiLighthousePages().map((page) =>
    resolvePageUrl(page.path, environment),
  );
}

export function getCiLighthouseAuthByPath(path: string): PageAuth {
  const normalized =
    path.length > 1 && path.endsWith("/") ? path.slice(0, -1) : path;
  const page = getCiLighthousePages().find(
    (entry) => entry.path === normalized || entry.path === path,
  );
  return page?.requiresAuth ?? "none";
}

export function buildCiLighthouseAuthRoutes(): Record<string, PageAuth> {
  return Object.fromEntries(
    getCiLighthousePages().map((page) => [page.path, page.requiresAuth]),
  );
}
