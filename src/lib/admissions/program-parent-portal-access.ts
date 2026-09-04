import type { SupabaseClient } from "@supabase/supabase-js";
import { getFamilyIdsForUser } from "./application-auth";
import {
  getProgramByPortalSlug,
  getProgramPortalDisplayLabel,
  isProgramParentPortalIsolated,
  parseProgramParentPortalSettings,
  type ProgramParentPortalSettings,
} from "./program-parent-portal";
import {
  resolveProgramOrganizationFeatures,
  type ParentPortalContextOption,
} from "@/lib/organization-settings/resolve-program-parent-features";
import type { OrganizationFeatures } from "@/lib/organization-settings/types";
import { getParentPortalHomeHref } from "@/lib/organization-settings/parent-nav";
import {
  buildParentPortalContextOptionsWithEntryHrefs,
  resolveDefaultParentPortalEntryHrefFromContexts,
  shouldRedirectAwayFromMainParentPortal,
} from "./program-parent-portal-context-switch";

async function getStudentIdsForFamilies(
  supabase: SupabaseClient,
  organizationId: string,
  familyIds: string[],
): Promise<string[]> {
  if (familyIds.length === 0) return [];

  const { data, error } = await supabase
    .from("students")
    .select("id")
    .eq("organization_id", organizationId)
    .in("family_id", familyIds);

  if (error) throw error;
  return (data ?? []).map((row) => String(row.id));
}

export async function userHasEnrolledAccessInProgram(
  supabase: SupabaseClient,
  userId: string,
  organizationId: string,
  programId: string,
): Promise<boolean> {
  const familyIds = await getFamilyIdsForUser(supabase, userId, organizationId);
  const studentIds = await getStudentIdsForFamilies(
    supabase,
    organizationId,
    familyIds,
  );
  if (studentIds.length === 0) return false;

  const { data, error } = await supabase
    .from("enrollments")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("program_id", programId)
    .eq("status", "enrolled")
    .in("student_id", studentIds)
    .limit(1);

  if (error) throw error;
  return (data ?? []).length > 0;
}

export async function familyHasEnrolledAccessInProgram(
  supabase: SupabaseClient,
  organizationId: string,
  familyId: string,
  programId: string,
): Promise<boolean> {
  const studentIds = await getStudentIdsForFamilies(supabase, organizationId, [
    familyId,
  ]);
  if (studentIds.length === 0) return false;

  const { data, error } = await supabase
    .from("enrollments")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("program_id", programId)
    .eq("status", "enrolled")
    .in("student_id", studentIds)
    .limit(1);

  if (error) throw error;
  return (data ?? []).length > 0;
}

export type EnrolledProgramPortalSummary = {
  id: string;
  name: string;
  portal_slug: string;
  parent_portal_settings: ProgramParentPortalSettings;
};

async function listEnrolledProgramsForStudentIds(
  supabase: SupabaseClient,
  organizationId: string,
  studentIds: string[],
): Promise<EnrolledProgramPortalSummary[]> {
  if (studentIds.length === 0) return [];

  const { data: enrollments, error: enrollmentError } = await supabase
    .from("enrollments")
    .select("program_id")
    .eq("organization_id", organizationId)
    .eq("status", "enrolled")
    .in("student_id", studentIds);

  if (enrollmentError) throw enrollmentError;

  const programIds = [
    ...new Set(
      (enrollments ?? [])
        .map((row) => (row.program_id ? String(row.program_id) : null))
        .filter((id): id is string => Boolean(id)),
    ),
  ];
  if (programIds.length === 0) return [];

  const { data: programs, error: programError } = await supabase
    .from("programs")
    .select("id, name, portal_slug, parent_portal_settings")
    .eq("organization_id", organizationId)
    .in("id", programIds);

  if (programError) throw programError;

  return (programs ?? [])
    .map((row) => ({
      id: String(row.id),
      name: String(row.name),
      portal_slug: String(row.portal_slug),
      parent_portal_settings: parseProgramParentPortalSettings(
        row.parent_portal_settings,
      ),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function listEnrolledProgramsForFamily(
  supabase: SupabaseClient,
  organizationId: string,
  familyId: string,
): Promise<EnrolledProgramPortalSummary[]> {
  const studentIds = await getStudentIdsForFamilies(supabase, organizationId, [
    familyId,
  ]);
  return listEnrolledProgramsForStudentIds(supabase, organizationId, studentIds);
}

export async function listEnrolledProgramsForUser(
  supabase: SupabaseClient,
  userId: string,
  organizationId: string,
): Promise<EnrolledProgramPortalSummary[]> {
  const familyIds = await getFamilyIdsForUser(supabase, userId, organizationId);
  const studentIds = await getStudentIdsForFamilies(
    supabase,
    organizationId,
    familyIds,
  );
  return listEnrolledProgramsForStudentIds(supabase, organizationId, studentIds);
}

export function familyHasMainPortalEnrollment(
  enrolledPrograms: EnrolledProgramPortalSummary[],
): boolean {
  return enrolledPrograms.some(
    (program) => !isProgramParentPortalIsolated(program.parent_portal_settings),
  );
}

export async function userHasMainPortalEnrollment(
  supabase: SupabaseClient,
  userId: string,
  organizationId: string,
): Promise<boolean> {
  const enrolledPrograms = await listEnrolledProgramsForUser(
    supabase,
    userId,
    organizationId,
  );
  return familyHasMainPortalEnrollment(enrolledPrograms);
}

export async function familyHasMainPortalEnrollmentForFamily(
  supabase: SupabaseClient,
  organizationId: string,
  familyId: string,
): Promise<boolean> {
  const enrolledPrograms = await listEnrolledProgramsForFamily(
    supabase,
    organizationId,
    familyId,
  );
  return familyHasMainPortalEnrollment(enrolledPrograms);
}

export function buildParentPortalContextOptions(
  schoolName: string,
  enrolledPrograms: EnrolledProgramPortalSummary[],
): ParentPortalContextOption[] {
  const isolatedPrograms = enrolledPrograms.filter((program) =>
    isProgramParentPortalIsolated(program.parent_portal_settings),
  );

  const contexts: ParentPortalContextOption[] = [];

  if (familyHasMainPortalEnrollment(enrolledPrograms)) {
    contexts.push({ id: "main", label: schoolName });
  }

  for (const program of isolatedPrograms) {
    contexts.push({
      id: `program:${program.id}`,
      label: getProgramPortalDisplayLabel(
        program.name,
        program.parent_portal_settings,
      ),
      portalSlug: program.portal_slug,
      programId: program.id,
    });
  }

  return contexts;
}

export async function listAccessibleIsolatedProgramsForFamily(
  supabase: SupabaseClient,
  organizationId: string,
  familyId: string,
): Promise<
  Array<{
    id: string;
    name: string;
    portal_slug: string;
    parent_portal_settings: ProgramParentPortalSettings;
  }>
> {
  const enrolledPrograms = await listEnrolledProgramsForFamily(
    supabase,
    organizationId,
    familyId,
  );
  return enrolledPrograms.filter((program) =>
    isProgramParentPortalIsolated(program.parent_portal_settings),
  );
}

export async function listAccessibleIsolatedProgramsForUser(
  supabase: SupabaseClient,
  userId: string,
  organizationId: string,
): Promise<
  Array<{
    id: string;
    name: string;
    portal_slug: string;
    parent_portal_settings: ProgramParentPortalSettings;
  }>
> {
  const enrolledPrograms = await listEnrolledProgramsForUser(
    supabase,
    userId,
    organizationId,
  );
  return enrolledPrograms.filter((program) =>
    isProgramParentPortalIsolated(program.parent_portal_settings),
  );
}

export type LoadedProgramParentPortalContext = {
  programId: string;
  programName: string;
  portalSlug: string;
  displayLabel: string;
  settings: ProgramParentPortalSettings;
  effectiveFeatures: OrganizationFeatures;
  parentNavBasePath: string;
};

export async function loadProgramParentPortalContext(input: {
  supabase: SupabaseClient;
  organizationId: string;
  schoolSlug: string;
  programSlug: string;
  orgFeatures: OrganizationFeatures;
  previewParentBasePath?: string;
}): Promise<LoadedProgramParentPortalContext | null> {
  const program = await getProgramByPortalSlug(
    input.supabase,
    input.organizationId,
    input.programSlug,
  );
  if (!program || !isProgramParentPortalIsolated(program.parent_portal_settings)) {
    return null;
  }

  const parentNavBasePath = input.previewParentBasePath
    ? `${input.previewParentBasePath}/p/${program.portal_slug}`
    : `/school/${input.schoolSlug}/parent/p/${program.portal_slug}`;

  return {
    programId: program.id,
    programName: program.name,
    portalSlug: program.portal_slug,
    displayLabel: getProgramPortalDisplayLabel(
      program.name,
      program.parent_portal_settings,
    ),
    settings: program.parent_portal_settings,
    effectiveFeatures: resolveProgramOrganizationFeatures(
      input.orgFeatures,
      program.parent_portal_settings,
    ),
    parentNavBasePath,
  };
}

export async function listParentPortalContextsForUser(
  supabase: SupabaseClient,
  userId: string,
  organizationId: string,
  schoolName: string,
): Promise<ParentPortalContextOption[]> {
  const enrolledPrograms = await listEnrolledProgramsForUser(
    supabase,
    userId,
    organizationId,
  );
  return buildParentPortalContextOptions(schoolName, enrolledPrograms);
}

function enrichParentPortalContextsWithEntryHrefs(input: {
  slug: string;
  schoolName: string;
  orgFeatures: OrganizationFeatures;
  contexts: ParentPortalContextOption[];
  isolatedPrograms: Array<{
    id: string;
    parent_portal_settings: ProgramParentPortalSettings;
  }>;
  previewParentBasePath?: string;
}): ParentPortalContextOption[] {
  const programSettingsById = new Map(
    input.isolatedPrograms.map((program) => [program.id, program.parent_portal_settings]),
  );

  return buildParentPortalContextOptionsWithEntryHrefs({
    slug: input.slug,
    schoolName: input.schoolName,
    orgFeatures: input.orgFeatures,
    contexts: input.contexts,
    programSettingsById,
    previewParentBasePath: input.previewParentBasePath,
  });
}

export async function loadParentPortalNavContextsForUser(input: {
  supabase: SupabaseClient;
  userId: string;
  organizationId: string;
  schoolSlug: string;
  schoolName: string;
  orgFeatures: OrganizationFeatures;
}): Promise<ParentPortalContextOption[]> {
  const enrolledPrograms = await listEnrolledProgramsForUser(
    input.supabase,
    input.userId,
    input.organizationId,
  );
  const contexts = buildParentPortalContextOptions(
    input.schoolName,
    enrolledPrograms,
  );
  const isolatedPrograms = enrolledPrograms.filter((program) =>
    isProgramParentPortalIsolated(program.parent_portal_settings),
  );

  return enrichParentPortalContextsWithEntryHrefs({
    slug: input.schoolSlug,
    schoolName: input.schoolName,
    orgFeatures: input.orgFeatures,
    contexts,
    isolatedPrograms,
  });
}

export async function loadParentPortalNavContextsForFamily(input: {
  supabase: SupabaseClient;
  organizationId: string;
  familyId: string;
  schoolSlug: string;
  schoolName: string;
  orgFeatures: OrganizationFeatures;
  previewParentBasePath?: string;
}): Promise<ParentPortalContextOption[]> {
  const enrolledPrograms = await listEnrolledProgramsForFamily(
    input.supabase,
    input.organizationId,
    input.familyId,
  );
  const contexts = buildParentPortalContextOptions(
    input.schoolName,
    enrolledPrograms,
  );
  const isolatedPrograms = enrolledPrograms.filter((program) =>
    isProgramParentPortalIsolated(program.parent_portal_settings),
  );

  return enrichParentPortalContextsWithEntryHrefs({
    slug: input.schoolSlug,
    schoolName: input.schoolName,
    orgFeatures: input.orgFeatures,
    contexts,
    isolatedPrograms,
    previewParentBasePath: input.previewParentBasePath,
  });
}

export async function listParentPortalContextsForFamily(
  supabase: SupabaseClient,
  organizationId: string,
  familyId: string,
  schoolName: string,
): Promise<ParentPortalContextOption[]> {
  const enrolledPrograms = await listEnrolledProgramsForFamily(
    supabase,
    organizationId,
    familyId,
  );
  return buildParentPortalContextOptions(schoolName, enrolledPrograms);
}

function mainParentPortalFallbackHref(
  schoolSlug: string,
  orgFeatures: OrganizationFeatures,
  previewParentBasePath?: string,
): string {
  const mainBasePath = previewParentBasePath ?? `/school/${schoolSlug}/parent`;
  return (
    getParentPortalHomeHref(
      schoolSlug,
      orgFeatures.parent,
      orgFeatures.feature_nav?.parent,
      mainBasePath,
    ) ?? `${mainBasePath}/portal`
  );
}

export async function resolveDefaultParentPortalEntryHrefForUser(input: {
  supabase: SupabaseClient;
  userId: string;
  organizationId: string;
  schoolSlug: string;
  schoolName: string;
  orgFeatures: OrganizationFeatures;
}): Promise<string> {
  const contexts = await loadParentPortalNavContextsForUser(input);
  return resolveDefaultParentPortalEntryHrefFromContexts(
    contexts,
    mainParentPortalFallbackHref(input.schoolSlug, input.orgFeatures),
  );
}

export async function resolveDefaultParentPortalEntryHrefForFamily(input: {
  supabase: SupabaseClient;
  organizationId: string;
  familyId: string;
  schoolSlug: string;
  schoolName: string;
  orgFeatures: OrganizationFeatures;
  previewParentBasePath?: string;
}): Promise<string> {
  const contexts = await loadParentPortalNavContextsForFamily(input);
  return resolveDefaultParentPortalEntryHrefFromContexts(
    contexts,
    mainParentPortalFallbackHref(
      input.schoolSlug,
      input.orgFeatures,
      input.previewParentBasePath,
    ),
  );
}

export { shouldRedirectAwayFromMainParentPortal };
