import type { SupabaseClient } from "@supabase/supabase-js";
import { listProgramCoopCurriculum } from "@/lib/admissions/program-coop-curriculum-storage";
import { listProgramCoopCurriculumDiscussionMessages } from "@/lib/admissions/program-coop-curriculum-discussion";
import {
  buildProgramCoopFamilyNameMap,
  resolveEnrolledFamilyForProgram,
} from "@/lib/admissions/program-coop-family-assignments";
import { listProgramCoopSupplyList } from "@/lib/admissions/program-coop-supply-list-storage";
import { listProgramCoopTeachingSchedule } from "@/lib/admissions/program-coop-teaching-schedule-storage";
import {
  familyHasEnrolledAccessInProgram,
  userHasAccessForProgramPortal,
} from "@/lib/admissions/program-parent-portal-access";
import {
  isProgramParentPortalCoopMode,
  type ProgramParentPortalSettings,
} from "@/lib/admissions/program-parent-portal";
import { getGuardianIdForUser } from "@/lib/messages/messages";
import { createAdminClient } from "@/utils/supabase/admin";

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

export async function loadParentCoopCurriculumPageDataForUser(input: {
  supabase: SupabaseClient;
  userId: string;
  organizationId: string;
  programId: string;
}): Promise<{
  curricula: Awaited<ReturnType<typeof listProgramCoopCurriculum>>;
  discussionMessages: Awaited<ReturnType<typeof listProgramCoopCurriculumDiscussionMessages>>;
  currentGuardianId: string | null;
}> {
  const hasAccess = await userHasAccessForProgramPortal(
    input.supabase,
    input.userId,
    input.organizationId,
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
  let currentGuardianId: string | null = null;
  const { data: guardianRows } = await input.supabase
    .from("guardians")
    .select("id, family_id")
    .eq("organization_id", input.organizationId)
    .eq("user_id", input.userId);

  const firstFamilyId = guardianRows?.[0]?.family_id
    ? String(guardianRows[0].family_id)
    : null;
  if (firstFamilyId) {
    currentGuardianId = await getGuardianIdForUser(
      admin,
      input.userId,
      input.organizationId,
      firstFamilyId,
    );
  }

  const [curricula, discussionMessages] = await Promise.all([
    listProgramCoopCurriculum(input.supabase, input.programId),
    listProgramCoopCurriculumDiscussionMessages(admin, {
      organizationId: input.organizationId,
      programId: input.programId,
      curriculumId: null,
    }),
  ]);

  return { curricula, discussionMessages, currentGuardianId };
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

export async function loadParentCoopSupplyListPageDataForUser(input: {
  supabase: SupabaseClient;
  userId: string;
  organizationId: string;
  programId: string;
}) {
  const hasAccess = await userHasAccessForProgramPortal(
    input.supabase,
    input.userId,
    input.organizationId,
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

  const [{ items, colorLegend }, enrolledFamily, familyNameMap] = await Promise.all([
    listProgramCoopSupplyList(input.supabase, input.programId),
    resolveEnrolledFamilyForProgram(
      input.supabase,
      input.userId,
      input.organizationId,
      input.programId,
    ),
    buildProgramCoopFamilyNameMap(input.supabase, input.organizationId, input.programId),
  ]);

  return {
    items,
    colorLegend,
    currentFamilyId: enrolledFamily.familyId,
    currentFamilyLabel: enrolledFamily.familyName,
    familyNameMap: Object.fromEntries(familyNameMap),
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

export async function loadParentCoopTeachingSchedulePageDataForUser(input: {
  supabase: SupabaseClient;
  userId: string;
  organizationId: string;
  programId: string;
}) {
  const hasAccess = await userHasAccessForProgramPortal(
    input.supabase,
    input.userId,
    input.organizationId,
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

  const [weeks, enrolledFamily, familyNameMap] = await Promise.all([
    listProgramCoopTeachingSchedule(input.supabase, input.programId),
    resolveEnrolledFamilyForProgram(
      input.supabase,
      input.userId,
      input.organizationId,
      input.programId,
    ),
    buildProgramCoopFamilyNameMap(input.supabase, input.organizationId, input.programId),
  ]);

  return {
    weeks,
    currentFamilyId: enrolledFamily.familyId,
    currentFamilyLabel: enrolledFamily.familyName,
    familyNameMap: Object.fromEntries(familyNameMap),
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
