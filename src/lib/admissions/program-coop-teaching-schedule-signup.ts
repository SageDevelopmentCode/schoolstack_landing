import type { SupabaseClient } from "@supabase/supabase-js";
import type { User } from "@supabase/supabase-js";
import { userHasEnrolledAccess } from "@/lib/admissions/parent-portal-access";
import {
  assertSupplyListClaimAccess,
  resolveSupplyListClaimParentName,
} from "@/lib/admissions/program-coop-supply-list-claim";
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
): Promise<{ week: Awaited<ReturnType<typeof appendProgramCoopTeachingScheduleParent>>; parentName: string }> {
  await assertSupplyListClaimAccess(authSupabase, user, ctx.organizationId);
  const parentName = await resolveSupplyListClaimParentName(
    authSupabase,
    user,
    ctx.organizationId,
  );
  const week = await appendProgramCoopTeachingScheduleParent(
    writeSupabase,
    ctx,
    ctx.weekId,
    ctx.role,
    parentName,
    { parentSignup: true },
  );
  return { week, parentName };
}

export async function withdrawProgramCoopTeachingScheduleForParent(
  authSupabase: SupabaseClient,
  writeSupabase: SupabaseClient,
  user: User,
  ctx: TeachingScheduleSignupContext,
): Promise<{ week: Awaited<ReturnType<typeof removeProgramCoopTeachingScheduleParent>>; parentName: string }> {
  const hasAccess = await userHasEnrolledAccess(authSupabase, user.id, ctx.organizationId);
  if (!hasAccess) {
    throw new Error("You do not have access to the teaching schedule.");
  }

  const parentName = await resolveSupplyListClaimParentName(
    authSupabase,
    user,
    ctx.organizationId,
  );
  const week = await removeProgramCoopTeachingScheduleParent(
    writeSupabase,
    ctx,
    ctx.weekId,
    ctx.role,
    parentName,
  );
  return { week, parentName };
}
