import type { SupabaseClient } from "@supabase/supabase-js";
import {
  getProgramPortalDisplayLabel,
  isProgramParentPortalCoopMode,
  isProgramParentPortalIsolated,
  type ProgramParentPortalSettings,
} from "@/lib/admissions/program-parent-portal";
import {
  listAccessibleIsolatedProgramsForUser,
  loadParentPortalNavContextsForUser,
  userHasEnrolledAccessInProgram,
} from "@/lib/admissions/program-parent-portal-access";
import type { ParentPortalContextOption } from "@/lib/organization-settings/resolve-program-parent-features";
import {
  resolveMainParentOrganizationFeatures,
  resolveProgramOrganizationFeatures,
} from "@/lib/organization-settings/resolve-program-parent-features";
import type { OrganizationFeatures, ParentFeatures, PortalFeatureNav } from "@/lib/organization-settings/types";
import {
  resolveMobilePortalEntryPath,
  detectMobilePortalContextFromPathname,
} from "@/lib/parent-portal/mobile-parent-portal-nav";

export type MobileParentPortalProgramContext = {
  programId: string;
  portalSlug: string;
  displayLabel: string;
  coopMode: boolean;
  features: {
    parent: ParentFeatures;
    featureNav?: PortalFeatureNav;
  };
  mobileEntryPath: string;
};

export type MobileParentPortalContextsPayload = {
  contexts: Array<
    ParentPortalContextOption & {
      mobileEntryPath: string;
    }
  >;
  programsByPortalSlug: Record<string, MobileParentPortalProgramContext>;
  redirectAwayFromMainPortal: boolean;
  defaultMobileEntryPath: string;
};

function buildProgramMobileContext(input: {
  slug: string;
  orgFeatures: OrganizationFeatures;
  program: {
    id: string;
    name: string;
    portal_slug: string;
    parent_portal_settings: ProgramParentPortalSettings;
  };
}): MobileParentPortalProgramContext {
  const effectiveFeatures = resolveProgramOrganizationFeatures(
    input.orgFeatures,
    input.program.parent_portal_settings,
  );
  const portalSlug = input.program.portal_slug;
  const contextOption: ParentPortalContextOption = {
    id: `program:${input.program.id}`,
    label: getProgramPortalDisplayLabel(
      input.program.name,
      input.program.parent_portal_settings,
    ),
    portalSlug,
    programId: input.program.id,
  };

  return {
    programId: input.program.id,
    portalSlug,
    displayLabel: contextOption.label,
    coopMode: isProgramParentPortalCoopMode(input.program.parent_portal_settings),
    features: {
      parent: effectiveFeatures.parent,
      featureNav: effectiveFeatures.feature_nav?.parent,
    },
    mobileEntryPath: resolveMobilePortalEntryPath(input.slug, contextOption),
  };
}

export async function loadMobileParentPortalContextsForUser(input: {
  supabase: SupabaseClient;
  userId: string;
  organizationId: string;
  slug: string;
  schoolName: string;
  orgFeatures: OrganizationFeatures;
}): Promise<MobileParentPortalContextsPayload> {
  const contexts = await loadParentPortalNavContextsForUser({
    supabase: input.supabase,
    userId: input.userId,
    organizationId: input.organizationId,
    schoolSlug: input.slug,
    schoolName: input.schoolName,
    orgFeatures: input.orgFeatures,
  });

  const isolatedPrograms = await listAccessibleIsolatedProgramsForUser(
    input.supabase,
    input.userId,
    input.organizationId,
  );

  const programsByPortalSlug: Record<string, MobileParentPortalProgramContext> =
    {};

  for (const program of isolatedPrograms) {
    if (!isProgramParentPortalIsolated(program.parent_portal_settings)) {
      continue;
    }
    const hasAccess = await userHasEnrolledAccessInProgram(
      input.supabase,
      input.userId,
      input.organizationId,
      program.id,
    );
    if (!hasAccess) continue;

    programsByPortalSlug[program.portal_slug] = buildProgramMobileContext({
      slug: input.slug,
      orgFeatures: input.orgFeatures,
      program,
    });
  }

  const contextsWithMobilePaths = contexts.map((context) => ({
    ...context,
    mobileEntryPath: resolveMobilePortalEntryPath(input.slug, context),
  }));

  const hasMain = contexts.some((context) => context.id === "main");
  const hasProgram = contexts.some((context) => context.id.startsWith("program:"));
  const redirectAwayFromMainPortal = !hasMain && hasProgram;
  const defaultMobileEntryPath =
    contextsWithMobilePaths[0]?.mobileEntryPath ??
    resolveMobilePortalEntryPath(input.slug, { id: "main" });

  return {
    contexts: contextsWithMobilePaths,
    programsByPortalSlug,
    redirectAwayFromMainPortal,
    defaultMobileEntryPath,
  };
}

export function resolveActiveMobileProgramContext(input: {
  pathname: string;
  programsByPortalSlug: Record<string, MobileParentPortalProgramContext>;
}): MobileParentPortalProgramContext | null {
  const detected = detectMobilePortalContextFromPathname(input.pathname);
  if (detected.mode !== "program") {
    return null;
  }

  return input.programsByPortalSlug[detected.portalSlug] ?? null;
}

export function resolveMainMobilePortalFeatures(
  orgFeatures: OrganizationFeatures,
): {
  parent: ParentFeatures;
  featureNav?: PortalFeatureNav;
} {
  const mainFeatures = resolveMainParentOrganizationFeatures(orgFeatures);
  return {
    parent: mainFeatures.parent,
    featureNav: mainFeatures.feature_nav?.parent,
  };
}
