import type { SupabaseClient } from "@supabase/supabase-js";
import {
  familyHasMainPortalEnrollment,
  listEnrolledProgramsForFamily,
  type EnrolledProgramPortalSummary,
} from "@/lib/admissions/program-parent-portal-access";
import {
  getProgramByPortalSlug,
  isProgramParentPortalCoopMode,
  isProgramParentPortalIsolated,
} from "@/lib/admissions/program-parent-portal";
import { schoolParentRootPath } from "@/lib/organization-settings/parent-routes";

export type ParentNotificationContext =
  | {
      mode: "main";
      slug: string;
      parentNavBasePath: string;
      applyBasePath: string;
    }
  | {
      mode: "program";
      slug: string;
      programId: string;
      programSlug: string;
      parentNavBasePath: string;
      applyBasePath: string;
      coopModeEnabled: boolean;
    };

export function buildMainParentNotificationContext(
  slug: string,
  options?: {
    parentNavBasePath?: string;
    applyBasePath?: string;
  },
): ParentNotificationContext {
  return {
    mode: "main",
    slug,
    parentNavBasePath: options?.parentNavBasePath ?? schoolParentRootPath(slug),
    applyBasePath: options?.applyBasePath ?? `/school/${slug}/apply`,
  };
}

export function buildProgramParentNotificationContext(
  slug: string,
  programId: string,
  programSlug: string,
  coopModeEnabled: boolean,
  options?: {
    parentNavBasePath?: string;
    applyBasePath?: string;
  },
): ParentNotificationContext {
  return {
    mode: "program",
    slug,
    programId,
    programSlug,
    coopModeEnabled,
    parentNavBasePath:
      options?.parentNavBasePath ??
      `/school/${slug}/parent/p/${programSlug}`,
    applyBasePath: options?.applyBasePath ?? `/school/${slug}/apply`,
  };
}

export function parseParentNotificationContextFromSearchParams(
  slug: string,
  searchParams: URLSearchParams,
  defaults?: {
    parentNavBasePath?: string;
    applyBasePath?: string;
  },
): ParentNotificationContext {
  const mode = searchParams.get("mode")?.trim();
  const parentNavBasePath =
    searchParams.get("parentNavBasePath")?.trim() ||
    defaults?.parentNavBasePath;
  const applyBasePath =
    searchParams.get("applyBasePath")?.trim() || defaults?.applyBasePath;

  if (mode === "program") {
    const programId = searchParams.get("programId")?.trim() ?? "";
    const programSlug = searchParams.get("programSlug")?.trim() ?? "";
    const coopModeEnabled =
      searchParams.get("coopModeEnabled")?.trim() === "true";

    if (programId && programSlug) {
      return buildProgramParentNotificationContext(
        slug,
        programId,
        programSlug,
        coopModeEnabled,
        { parentNavBasePath, applyBasePath },
      );
    }
  }

  return buildMainParentNotificationContext(slug, {
    parentNavBasePath,
    applyBasePath,
  });
}

export async function resolveParentNotificationContextForApi(
  supabase: SupabaseClient,
  input: {
    organizationId: string;
    slug: string;
    searchParams: URLSearchParams;
  },
): Promise<ParentNotificationContext | null> {
  const mode = input.searchParams.get("mode")?.trim();

  if (mode === "program") {
    const programSlug = input.searchParams.get("programSlug")?.trim() ?? "";
    if (!programSlug) {
      return buildMainParentNotificationContext(input.slug);
    }

    const program = await getProgramByPortalSlug(
      supabase,
      input.organizationId,
      programSlug,
    );
    if (!program) {
      return null;
    }

    return buildProgramParentNotificationContext(
      input.slug,
      program.id,
      program.portal_slug,
      isProgramParentPortalCoopMode(program.parent_portal_settings),
    );
  }

  return buildMainParentNotificationContext(input.slug);
}

export function buildNotificationContextsFromEnrolledPrograms(
  slug: string,
  enrolledPrograms: EnrolledProgramPortalSummary[],
  options?: {
    applyBasePath?: string;
    previewParentBasePath?: string;
  },
): ParentNotificationContext[] {
  const applyBasePath = options?.applyBasePath ?? `/school/${slug}/apply`;
  const contexts: ParentNotificationContext[] = [];

  if (familyHasMainPortalEnrollment(enrolledPrograms)) {
    contexts.push(
      buildMainParentNotificationContext(slug, {
        parentNavBasePath:
          options?.previewParentBasePath ?? schoolParentRootPath(slug),
        applyBasePath,
      }),
    );
  }

  for (const program of enrolledPrograms) {
    if (!isProgramParentPortalCoopMode(program.parent_portal_settings)) {
      continue;
    }

    const programSlug = program.portal_slug;
    const parentNavBasePath = options?.previewParentBasePath
      ? `${options.previewParentBasePath}/p/${programSlug}`
      : `/school/${slug}/parent/p/${programSlug}`;

    contexts.push(
      buildProgramParentNotificationContext(
        slug,
        program.id,
        programSlug,
        true,
        { parentNavBasePath, applyBasePath },
      ),
    );
  }

  if (contexts.length === 0) {
    for (const program of enrolledPrograms) {
      if (!isProgramParentPortalIsolated(program.parent_portal_settings)) {
        continue;
      }
      const programSlug = program.portal_slug;
      const parentNavBasePath = options?.previewParentBasePath
        ? `${options.previewParentBasePath}/p/${programSlug}`
        : `/school/${slug}/parent/p/${programSlug}`;

      contexts.push(
        buildProgramParentNotificationContext(
          slug,
          program.id,
          programSlug,
          isProgramParentPortalCoopMode(program.parent_portal_settings),
          { parentNavBasePath, applyBasePath },
        ),
      );
    }
  }

  return contexts;
}

export async function resolveParentNotificationContexts(
  supabase: SupabaseClient,
  input: {
    organizationId: string;
    slug: string;
    familyId: string;
    applyBasePath?: string;
    previewParentBasePath?: string;
  },
): Promise<ParentNotificationContext[]> {
  const enrolledPrograms = await listEnrolledProgramsForFamily(
    supabase,
    input.organizationId,
    input.familyId,
  );

  return buildNotificationContextsFromEnrolledPrograms(
    input.slug,
    enrolledPrograms,
    {
      applyBasePath: input.applyBasePath,
      previewParentBasePath: input.previewParentBasePath,
    },
  );
}
