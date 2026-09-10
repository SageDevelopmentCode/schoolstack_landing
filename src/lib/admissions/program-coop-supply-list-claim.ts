import type { SupabaseClient } from "@supabase/supabase-js";
import type { User } from "@supabase/supabase-js";
import {
  assertCoopProgramPortalAccess,
  resolveEnrolledFamilyIdForProgram,
} from "@/lib/admissions/program-coop-family-assignments";
import {
  appendProgramCoopSupplyAssignedFamily,
  removeProgramCoopSupplyAssignedFamily,
  type ProgramCoopSupplyListContext,
} from "@/lib/admissions/program-coop-supply-list-storage";

export type SupplyListClaimContext = ProgramCoopSupplyListContext & {
  itemId: string;
};

export async function resolveSupplyListClaimFamilyId(
  supabase: SupabaseClient,
  user: User,
  organizationId: string,
  programId: string,
): Promise<string> {
  return resolveEnrolledFamilyIdForProgram(
    supabase,
    user.id,
    organizationId,
    programId,
  );
}

export async function assertSupplyListClaimAccess(
  supabase: SupabaseClient,
  user: User,
  organizationId: string,
  programId: string,
): Promise<void> {
  await assertCoopProgramPortalAccess(supabase, user.id, organizationId, programId);
}

export async function claimProgramCoopSupplyItemForParent(
  authSupabase: SupabaseClient,
  writeSupabase: SupabaseClient,
  user: User,
  ctx: SupplyListClaimContext,
): Promise<{ item: Awaited<ReturnType<typeof appendProgramCoopSupplyAssignedFamily>>; familyId: string }> {
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
  const item = await appendProgramCoopSupplyAssignedFamily(
    writeSupabase,
    ctx,
    ctx.itemId,
    familyId,
  );
  return { item, familyId };
}

export async function unclaimProgramCoopSupplyItemForParent(
  authSupabase: SupabaseClient,
  writeSupabase: SupabaseClient,
  user: User,
  ctx: SupplyListClaimContext,
): Promise<{ item: Awaited<ReturnType<typeof removeProgramCoopSupplyAssignedFamily>>; familyId: string }> {
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
  const item = await removeProgramCoopSupplyAssignedFamily(
    writeSupabase,
    ctx,
    ctx.itemId,
    familyId,
  );
  return { item, familyId };
}
