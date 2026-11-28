import type { SupabaseClient } from "@supabase/supabase-js";
import { listProgramCoopCurriculum } from "@/lib/admissions/program-coop-curriculum-storage";
import { listProgramCoopCurriculumDiscussionMessages } from "@/lib/admissions/program-coop-curriculum-discussion";
import { listProgramCoopFamilies } from "@/lib/admissions/program-coop-directory";
import { buildProgramCoopFamilyNameMap } from "@/lib/admissions/program-coop-family-assignments";
import { listProgramCoopSupplyList } from "@/lib/admissions/program-coop-supply-list-storage";
import { listProgramCoopTeachingSchedule } from "@/lib/admissions/program-coop-teaching-schedule-storage";
import { familyHasEnrolledAccessInProgram } from "@/lib/admissions/program-parent-portal-access";
import {
  isProgramParentPortalCoopMode,
  type ProgramParentPortalSettings,
} from "@/lib/admissions/program-parent-portal";
import {
  assertCoopProgramInAccess,
  resolveCoopFamilyFromAccess,
} from "@/lib/parent-portal/parent-coop-access";
import type { ParentPortalAccess } from "@/lib/parent-portal/parent-portal-access-rpc";
import { createAdminClient } from "@/utils/supabase/admin";

/**
 * Input for the signed-in parent loaders. `access` is the route's `parent_portal_access` snapshot;
 * `withParentPortalRoute({ programScope: "required" })` has already checked the program is in it.
 */
type ParentCoopUserLoaderInput = {
  supabase: SupabaseClient;
  organizationId: string;
  programId: string;
  access: ParentPortalAccess;
};

/**
 * Every family enrolled in the program, read with the admin client: guardians can only read
 * their own enrollments under RLS, and access was established by the route wrapper.
 */
function listEnrolledCoopFamiliesForParent(input: ParentCoopUserLoaderInput) {
  return listProgramCoopFamilies(createAdminClient(), {
    organizationId: input.organizationId,
    programId: input.programId,
    currentFamilyId: "",
  });
}

async function loadProgramCoopSettings(
  supabase: SupabaseClient,
  organizationId: string,
  programId: string,
): Promise<ProgramParentPortalSettings | null> {
  const { data, error } = await supabase
    .from("programs")
    .select("parent_portal_settings")
    .eq("organization_id", organizationId)
    .eq("id", programId)
    .maybeSingle();

  if (error) throw error;
  if (!data?.parent_portal_settings) return null;
  return data.parent_portal_settings as ProgramParentPortalSettings;
}

async function assertCoopProgramForParent(
  supabase: SupabaseClient,
  organizationId: string,
  programId: string,
): Promise<void> {
  const settings = await loadProgramCoopSettings(supabase, organizationId, programId);
  if (!settings || !isProgramParentPortalCoopMode(settings)) {
    throw new Error("coop_not_enabled");
  }
}

export async function loadParentCoopCurriculumPageDataForUser(
  input: ParentCoopUserLoaderInput,
): Promise<{
  curricula: Awaited<ReturnType<typeof listProgramCoopCurriculum>>;
  discussionMessages: Awaited<ReturnType<typeof listProgramCoopCurriculumDiscussionMessages>>;
  currentGuardianId: string | null;
}> {
  assertCoopProgramInAccess(input.access, input.programId);

  const [curricula, discussionMessages] = await Promise.all([
    listProgramCoopCurriculum(input.supabase, input.programId),
    listProgramCoopCurriculumDiscussionMessages(createAdminClient(), {
      organizationId: input.organizationId,
      programId: input.programId,
      curriculumId: null,
    }),
  ]);

  // The snapshot's guardian ids are the signed-in login's own guardian rows (messages are per
  // login), the same row the old guardians -> getGuardianIdForUser lookup returned.
  return {
    curricula,
    discussionMessages,
    currentGuardianId: input.access.guardianIds[0] ?? null,
  };
}

export async function loadParentCoopCurriculumPageDataForFamily(input: {
  supabase: SupabaseClient;
  organizationId: string;
  familyId: string;
  programId: string;
}): Promise<{
  curricula: Awaited<ReturnType<typeof listProgramCoopCurriculum>>;
  discussionMessages: Awaited<ReturnType<typeof listProgramCoopCurriculumDiscussionMessages>>;
  currentGuardianId: string | null;
}> {
  const hasAccess = await familyHasEnrolledAccessInProgram(
    input.supabase,
    input.organizationId,
    input.familyId,
    input.programId,
  );
  if (!hasAccess) {
    throw new Error("forbidden");
  }

  await assertCoopProgramForParent(
    input.supabase,
    input.organizationId,
    input.programId,
  );

  const admin = createAdminClient();
  const { data: guardianRow } = await input.supabase
    .from("guardians")
    .select("id")
    .eq("organization_id", input.organizationId)
    .eq("family_id", input.familyId)
    .limit(1)
    .maybeSingle();

  const [curricula, discussionMessages] = await Promise.all([
    listProgramCoopCurriculum(input.supabase, input.programId),
    listProgramCoopCurriculumDiscussionMessages(admin, {
      organizationId: input.organizationId,
      programId: input.programId,
      curriculumId: null,
    }),
  ]);

  return {
    curricula,
    discussionMessages,
    currentGuardianId: guardianRow?.id ? String(guardianRow.id) : null,
  };
}

export async function loadParentCoopCurriculumDiscussionForFamily(input: {
  supabase: SupabaseClient;
  organizationId: string;
  familyId: string;
  programId: string;
  curriculumId?: string | null;
}): Promise<
  Awaited<ReturnType<typeof listProgramCoopCurriculumDiscussionMessages>>
> {
  const hasAccess = await familyHasEnrolledAccessInProgram(
    input.supabase,
    input.organizationId,
    input.familyId,
    input.programId,
  );
  if (!hasAccess) {
    throw new Error("forbidden");
  }

  await assertCoopProgramForParent(
    input.supabase,
    input.organizationId,
    input.programId,
  );

  const admin = createAdminClient();
  return listProgramCoopCurriculumDiscussionMessages(admin, {
    organizationId: input.organizationId,
    programId: input.programId,
    curriculumId: input.curriculumId,
  });
}

export async function loadParentCoopSupplyListPageDataForUser(
  input: ParentCoopUserLoaderInput,
) {
  assertCoopProgramInAccess(input.access, input.programId);

  const [{ items, colorLegend }, families] = await Promise.all([
    listProgramCoopSupplyList(input.supabase, input.programId),
    listEnrolledCoopFamiliesForParent(input),
  ]);
  const enrolledFamily = resolveCoopFamilyFromAccess(families, input.access.familyIds);

  return {
    items,
    colorLegend,
    currentFamilyId: enrolledFamily.familyId,
    currentFamilyLabel: enrolledFamily.familyName,
    familyNameMap: Object.fromEntries(enrolledFamily.familyNameMap),
  };
}

export async function loadParentCoopSupplyListPageDataForFamily(input: {
  supabase: SupabaseClient;
  organizationId: string;
  familyId: string;
  programId: string;
}) {
  const hasAccess = await familyHasEnrolledAccessInProgram(
    input.supabase,
    input.organizationId,
    input.familyId,
    input.programId,
  );
  if (!hasAccess) {
    throw new Error("forbidden");
  }

  await assertCoopProgramForParent(
    input.supabase,
    input.organizationId,
    input.programId,
  );

  const [{ items, colorLegend }, familyNameMap] = await Promise.all([
    listProgramCoopSupplyList(input.supabase, input.programId),
    buildProgramCoopFamilyNameMap(input.supabase, input.organizationId, input.programId),
  ]);

  const familyName =
    familyNameMap.get(input.familyId) ?? "Your family";

  return {
    items,
    colorLegend,
    currentFamilyId: input.familyId,
    currentFamilyLabel: familyName,
    familyNameMap: Object.fromEntries(familyNameMap),
  };
}

export async function loadParentCoopTeachingSchedulePageDataForUser(
  input: ParentCoopUserLoaderInput,
) {
  assertCoopProgramInAccess(input.access, input.programId);

  const [weeks, families] = await Promise.all([
    listProgramCoopTeachingSchedule(input.supabase, input.programId),
    listEnrolledCoopFamiliesForParent(input),
  ]);
  const enrolledFamily = resolveCoopFamilyFromAccess(families, input.access.familyIds);

  return {
    weeks,
    currentFamilyId: enrolledFamily.familyId,
    currentFamilyLabel: enrolledFamily.familyName,
    familyNameMap: Object.fromEntries(enrolledFamily.familyNameMap),
  };
}

export async function loadParentCoopTeachingSchedulePageDataForFamily(input: {
  supabase: SupabaseClient;
  organizationId: string;
  familyId: string;
  programId: string;
}) {
  const hasAccess = await familyHasEnrolledAccessInProgram(
    input.supabase,
    input.organizationId,
    input.familyId,
    input.programId,
  );
  if (!hasAccess) {
    throw new Error("forbidden");
  }

  await assertCoopProgramForParent(
    input.supabase,
    input.organizationId,
    input.programId,
  );

  const [weeks, familyNameMap] = await Promise.all([
    listProgramCoopTeachingSchedule(input.supabase, input.programId),
    buildProgramCoopFamilyNameMap(input.supabase, input.organizationId, input.programId),
  ]);

  return {
    weeks,
    currentFamilyId: input.familyId,
    currentFamilyLabel: familyNameMap.get(input.familyId) ?? "Your family",
    familyNameMap: Object.fromEntries(familyNameMap),
  };
}
