import type { SupabaseClient } from "@supabase/supabase-js";
import type { User } from "@supabase/supabase-js";
import { resolveSupplyListClaimFamilyId } from "@/lib/admissions/program-coop-supply-list-claim";
import { assertSupplyListClaimAccess } from "@/lib/admissions/program-coop-supply-list-claim";
import {
  appendProgramCoopTeachingScheduleParent,
  removeProgramCoopTeachingScheduleParent,
  type ProgramCoopTeachingScheduleContext,
} from "@/lib/admissions/program-coop-teaching-schedule-storage";
import type { TeachingScheduleParentRole } from "@/lib/admissions/program-coop-teaching-schedule-mock";

export type TeachingScheduleSignupContext = ProgramCoopTeachingScheduleContext & {
  weekId: string;
  role: TeachingScheduleParentRole;
};

export async function signupProgramCoopTeachingScheduleForParent(
  authSupabase: SupabaseClient,
  writeSupabase: SupabaseClient,
  user: User,
  ctx: TeachingScheduleSignupContext,
): Promise<{ week: Awaited<ReturnType<typeof appendProgramCoopTeachingScheduleParent>>; familyId: string }> {
  await assertSupplyListClaimAccess(
    authSupabase,
    user,
    ctx.organizationId,
    ctx.programId,
  );
  const familyId = await resolveSupplyListClaimFamilyId(
    authSupabase,
    user,
    ctx.organizationId,
    ctx.programId,
  );
  const week = await appendProgramCoopTeachingScheduleParent(
    writeSupabase,
    ctx,
    ctx.weekId,
    ctx.role,
    familyId,
    { parentSignup: true },
  );
  return { week, familyId };
}

export async function withdrawProgramCoopTeachingScheduleForParent(
  authSupabase: SupabaseClient,
  writeSupabase: SupabaseClient,
  user: User,
  ctx: TeachingScheduleSignupContext,
): Promise<{ week: Awaited<ReturnType<typeof removeProgramCoopTeachingScheduleParent>>; familyId: string }> {
  await assertSupplyListClaimAccess(
    authSupabase,
    user,
    ctx.organizationId,
    ctx.programId,
  );

  const familyId = await resolveSupplyListClaimFamilyId(
    authSupabase,
    user,
    ctx.organizationId,
    ctx.programId,
  );
  const week = await removeProgramCoopTeachingScheduleParent(
    writeSupabase,
    ctx,
    ctx.weekId,
    ctx.role,
    familyId,
  );
  return { week, familyId };
}
