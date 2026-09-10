import type { SupabaseClient } from "@supabase/supabase-js";
import { getFamilyUserProfile, userHasEnrolledAccess } from "@/lib/admissions/parent-portal-access";
import {
  appendProgramCoopSupplyAssignedFamily,
  removeProgramCoopSupplyAssignedFamily,
  type ProgramCoopSupplyListContext,
} from "@/lib/admissions/program-coop-supply-list-storage";
import { normalizeSupplyFamilyName } from "@/lib/admissions/program-coop-supply-list-mock";
import { getFamilyIdsForUser } from "@/lib/messages/api-helpers";
import type { User } from "@supabase/supabase-js";

export type SupplyListClaimContext = ProgramCoopSupplyListContext & {
  itemId: string;
};

export async function resolveSupplyListClaimParentName(
  supabase: SupabaseClient,
  user: User,
  organizationId: string,
): Promise<string> {
  const profile = await getFamilyUserProfile(supabase, user.id, organizationId, user);
  const parentName = normalizeSupplyFamilyName(profile.displayName);
  if (!parentName) {
    throw new Error("No parent name found for this account.");
  }
  return parentName;
}

export async function assertSupplyListClaimAccess(
  supabase: SupabaseClient,
  user: User,
  organizationId: string,
): Promise<void> {
  const hasAccess = await userHasEnrolledAccess(supabase, user.id, organizationId);
  if (!hasAccess) {
    throw new Error("You do not have access to the supply list.");
  }

  const familyIds = await getFamilyIdsForUser(supabase, user.id, organizationId);
  if (familyIds.length === 0) {
    throw new Error("No family found for this account.");
  }
}

export async function claimProgramCoopSupplyItemForParent(
  authSupabase: SupabaseClient,
  writeSupabase: SupabaseClient,
  user: User,
  ctx: SupplyListClaimContext,
): Promise<{ item: Awaited<ReturnType<typeof appendProgramCoopSupplyAssignedFamily>>; parentName: string }> {
  await assertSupplyListClaimAccess(authSupabase, user, ctx.organizationId);
  const parentName = await resolveSupplyListClaimParentName(
    authSupabase,
    user,
    ctx.organizationId,
  );
  const item = await appendProgramCoopSupplyAssignedFamily(
    writeSupabase,
    ctx,
    ctx.itemId,
    parentName,
  );
  return { item, parentName };
}

export async function unclaimProgramCoopSupplyItemForParent(
  authSupabase: SupabaseClient,
  writeSupabase: SupabaseClient,
  user: User,
  ctx: SupplyListClaimContext,
): Promise<{ item: Awaited<ReturnType<typeof removeProgramCoopSupplyAssignedFamily>>; parentName: string }> {
  await assertSupplyListClaimAccess(authSupabase, user, ctx.organizationId);
  const parentName = await resolveSupplyListClaimParentName(
    authSupabase,
    user,
    ctx.organizationId,
  );
  const item = await removeProgramCoopSupplyAssignedFamily(
    writeSupabase,
    ctx,
    ctx.itemId,
    parentName,
  );
  return { item, parentName };
}
