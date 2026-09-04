import type { SupabaseClient } from "@supabase/supabase-js";
import { FEATURE_CATALOG, DEFAULT_FEATURES } from "@/lib/organization-settings/catalog";
import type { OrganizationFeatures, ParentFeatures, PortalFeatureNav } from "@/lib/organization-settings/types";
import { describeParentPortalMessagesScope } from "@/lib/messages/message-audience";
import { describeParentPortalCalendarScope } from "@/lib/school-events/event-audience";
import type { ProgramPortalGovernanceOptions } from "./program-parent-portal-governance";
import { slugifyFormTitle } from "./application-form-schema";

export type ProgramPortalFeatureScopeTooltip = {
  variant: "isolation" | "shared";
  content: string;
};

export type ProgramParentPortalMode = "inherit" | "isolated";

export type ProgramParentPortalSettings = {
  mode: ProgramParentPortalMode;
  coop_mode?: boolean;
  label?: string;
  features?: Partial<ParentFeatures>;
  feature_nav?: {
    parent?: PortalFeatureNav;
  };
};

/** Expanded portal config used by the Programs editor UI. */
export type ProgramParentPortalEditorState = {
  features: Partial<ParentFeatures>;
  coop_mode?: boolean;
  label?: string;
  feature_nav?: ProgramParentPortalSettings["feature_nav"];
};

export const DEFAULT_PROGRAM_PARENT_PORTAL_SETTINGS: ProgramParentPortalSettings = {
  mode: "inherit",
};

const PARENT_FEATURE_CATALOG_KEYS = FEATURE_CATALOG.filter(
  (entry) => entry.portal === "parent",
).map((entry) => entry.key);

/** Parent portal features always enabled and not shown as program toggles. */
export const PROGRAM_PORTAL_ALWAYS_ON_PARENT_FEATURES = [
  "portal",
] as const satisfies readonly (keyof ParentFeatures)[];

const ALWAYS_ON_PARENT_FEATURE_KEYS = new Set<string>(
  PROGRAM_PORTAL_ALWAYS_ON_PARENT_FEATURES,
);

export function getOrgEnabledParentCatalogKeys(
  orgParentFeatures: ParentFeatures,
): (keyof ParentFeatures)[] {
  return PARENT_FEATURE_CATALOG_KEYS.filter(
    (key) =>
      Boolean((orgParentFeatures as Record<string, boolean>)[key]) &&
      !ALWAYS_ON_PARENT_FEATURE_KEYS.has(key),
  ) as (keyof ParentFeatures)[];
}

export function suggestProgramPortalSlug(programName: string): string {
  const slug = slugifyFormTitle(programName);
  return slug || "program";
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function parseProgramParentPortalSettings(
  value: unknown,
): ProgramParentPortalSettings {
  if (!isPlainObject(value)) {
    return { ...DEFAULT_PROGRAM_PARENT_PORTAL_SETTINGS };
  }

  const mode = value.mode === "isolated" ? "isolated" : "inherit";
  const label =
    typeof value.label === "string" && value.label.trim()
      ? value.label.trim()
      : undefined;

  let features: Partial<ParentFeatures> | undefined;
  if (isPlainObject(value.features)) {
    features = {};
    for (const [key, enabled] of Object.entries(value.features)) {
      if (typeof enabled === "boolean") {
        (features as Record<string, boolean>)[key] = enabled;
      }
    }
  }

  let feature_nav: ProgramParentPortalSettings["feature_nav"];
  if (isPlainObject(value.feature_nav) && isPlainObject(value.feature_nav.parent)) {
    feature_nav = {
      parent: value.feature_nav.parent as PortalFeatureNav,
    };
  }

  const coop_mode = value.coop_mode === true ? true : undefined;

  return {
    mode,
    ...(coop_mode ? { coop_mode } : {}),
    ...(label ? { label } : {}),
    ...(features ? { features } : {}),
    ...(feature_nav ? { feature_nav } : {}),
  };
}

export function isProgramParentPortalIsolated(
  settings: ProgramParentPortalSettings,
): boolean {
  return settings.mode === "isolated";
}

export function isProgramParentPortalCoopMode(
  settings: ProgramParentPortalSettings,
): boolean {
  return settings.mode === "isolated" && settings.coop_mode === true;
}

function isolatedPortalSettingsFromEditor(
  editor: ProgramParentPortalEditorState,
  normalizedFeatures: Partial<ParentFeatures>,
): ProgramParentPortalSettings {
  return {
    mode: "isolated",
    features: normalizedFeatures,
    ...(editor.coop_mode ? { coop_mode: true } : {}),
    ...(editor.label?.trim() ? { label: editor.label.trim() } : {}),
    ...(editor.feature_nav ? { feature_nav: editor.feature_nav } : {}),
  };
}

export function getProgramPortalDisplayLabel(
  programName: string,
  settings: ProgramParentPortalSettings,
): string {
  return settings.label?.trim() || programName;
}

export function getProgramPortalFeatureScopeBadgeLabel(
  featureKey: keyof ParentFeatures,
): string | null {
  switch (featureKey) {
    case "portal":
    case "calendar":
    case "children":
      return "This program only";
    case "messages":
      return "This program + school office";
    default:
      return null;
  }
}

export function getProgramPortalFeatureScopeTooltip(
  featureKey: keyof ParentFeatures,
): ProgramPortalFeatureScopeTooltip | null {
  switch (featureKey) {
    case "portal":
    case "calendar":
      return {
        variant: "isolation",
        content: describeParentPortalCalendarScope(true),
      };
    case "messages":
      return {
        variant: "isolation",
        content: describeParentPortalMessagesScope(true),
      };
    case "children":
      return {
        variant: "isolation",
        content: "Shows only children enrolled in this program.",
      };
    case "billing":
      return {
        variant: "shared",
        content:
          "Billing stays org-wide — same invoices and balances as the main portal.",
      };
    case "feed":
      return {
        variant: "shared",
        content: "School feed stays org-wide for now.",
      };
    default:
      return null;
  }
}

export function defaultIsolatedProgramParentFeatures(
  orgParentFeatures: ParentFeatures,
): Partial<ParentFeatures> {
  return getDefaultProgramPortalFeatureToggles(orgParentFeatures);
}

export function getDefaultProgramPortalFeatureToggles(
  orgParentFeatures: ParentFeatures,
): Partial<ParentFeatures> {
  const result: Partial<ParentFeatures> = {};

  for (const key of getOrgEnabledParentCatalogKeys(orgParentFeatures)) {
    result[key] = true;
  }

  return result;
}

function featureToggleMapsEqual(
  a: Partial<ParentFeatures>,
  b: Partial<ParentFeatures>,
  orgParentFeatures: ParentFeatures,
): boolean {
  for (const key of getOrgEnabledParentCatalogKeys(orgParentFeatures)) {
    if (Boolean(a[key]) !== Boolean(b[key])) {
      return false;
    }
  }
  return true;
}

function hasCustomPortalNav(editor: ProgramParentPortalEditorState): boolean {
  const feedLabel = editor.feature_nav?.parent?.items?.feed?.label?.trim();
  return Boolean(feedLabel);
}

export function expandProgramPortalSettingsForEditor(
  settings: ProgramParentPortalSettings,
  orgParentFeatures: ParentFeatures,
): ProgramParentPortalEditorState {
  const defaults = getDefaultProgramPortalFeatureToggles(orgParentFeatures);

  if (settings.mode !== "isolated") {
    return {
      features: { ...defaults },
    };
  }

  return {
    features: {
      ...defaults,
      ...(settings.features ?? {}),
    },
    ...(settings.coop_mode ? { coop_mode: true } : {}),
    ...(settings.label ? { label: settings.label } : {}),
    ...(settings.feature_nav ? { feature_nav: settings.feature_nav } : {}),
  };
}

export function programPortalSettingsMatchOrg(
  editor: ProgramParentPortalEditorState,
  orgParentFeatures: ParentFeatures,
): boolean {
  const defaults = getDefaultProgramPortalFeatureToggles(orgParentFeatures);
  if (!featureToggleMapsEqual(editor.features, defaults, orgParentFeatures)) {
    return false;
  }
  if (editor.label?.trim()) {
    return false;
  }
  if (hasCustomPortalNav(editor)) {
    return false;
  }
  return true;
}

export function wouldUseIsolatedProgramPortal(
  editor: ProgramParentPortalEditorState,
  orgFeatures: OrganizationFeatures,
  governance?: ProgramPortalGovernanceOptions,
): boolean {
  if (governance && !governance.isolationAllowed) {
    return false;
  }
  if (governance?.isolationAllowed) {
    return true;
  }
  const orgParent = orgFeatures.parent ?? DEFAULT_FEATURES.parent;
  return !programPortalSettingsMatchOrg(editor, orgParent);
}

export function deriveProgramPortalSettingsFromEditor(
  editor: ProgramParentPortalEditorState,
  orgFeatures: OrganizationFeatures,
  governance?: ProgramPortalGovernanceOptions,
): ProgramParentPortalSettings {
  const orgParent = orgFeatures.parent ?? DEFAULT_FEATURES.parent;

  if (governance && !governance.isolationAllowed) {
    return { mode: "inherit" };
  }

  const normalizedFeatures: Partial<ParentFeatures> = {};
  for (const key of getOrgEnabledParentCatalogKeys(orgParent)) {
    normalizedFeatures[key] = Boolean(editor.features[key]);
  }
  if (orgParent.portal) {
    normalizedFeatures.portal = true;
  }

  if (governance?.isolationAllowed) {
    return isolatedPortalSettingsFromEditor(editor, normalizedFeatures);
  }

  if (programPortalSettingsMatchOrg(editor, orgParent)) {
    return { mode: "inherit" };
  }

  return isolatedPortalSettingsFromEditor(editor, normalizedFeatures);
}

export function programPortalEditorStatesEqual(
  a: ProgramParentPortalEditorState,
  b: ProgramParentPortalEditorState,
  orgFeatures: OrganizationFeatures,
  governance?: ProgramPortalGovernanceOptions,
): boolean {
  return (
    JSON.stringify(deriveProgramPortalSettingsFromEditor(a, orgFeatures, governance)) ===
    JSON.stringify(deriveProgramPortalSettingsFromEditor(b, orgFeatures, governance))
  );
}

export function emptyProgramPortalEditorState(
  orgParentFeatures: ParentFeatures,
): ProgramParentPortalEditorState {
  return {
    features: getDefaultProgramPortalFeatureToggles(orgParentFeatures),
  };
}

export async function ensureUniqueProgramPortalSlug(
  supabase: SupabaseClient,
  organizationId: string,
  baseSlug: string,
  excludeProgramId?: string,
): Promise<string> {
  const normalized = suggestProgramPortalSlug(baseSlug);
  let candidate = normalized;
  let suffix = 2;

  while (true) {
    let query = supabase
      .from("programs")
      .select("id")
      .eq("organization_id", organizationId)
      .eq("portal_slug", candidate)
      .limit(1);

    if (excludeProgramId) {
      query = query.neq("id", excludeProgramId);
    }

    const { data, error } = await query.maybeSingle();
    if (error) throw error;
    if (!data) return candidate;

    candidate = `${normalized}-${suffix}`;
    suffix += 1;
  }
}

export async function getProgramByPortalSlug(
  supabase: SupabaseClient,
  organizationId: string,
  portalSlug: string,
): Promise<{
  id: string;
  name: string;
  portal_slug: string;
  parent_portal_settings: ProgramParentPortalSettings;
} | null> {
  const { data, error } = await supabase
    .from("programs")
    .select("id, name, portal_slug, parent_portal_settings")
    .eq("organization_id", organizationId)
    .eq("portal_slug", portalSlug)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    id: String(data.id),
    name: String(data.name),
    portal_slug: String(data.portal_slug),
    parent_portal_settings: parseProgramParentPortalSettings(
      data.parent_portal_settings,
    ),
  };
}
