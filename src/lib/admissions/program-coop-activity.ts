import type { SupabaseClient } from "@supabase/supabase-js";
import { ACTIVITY_ACTIONS, logActivityEvent } from "@/lib/activity-log";

type CoopActivityActor = {
  actorUserId?: string | null;
  actorName?: string | null;
};

export function shouldLogCoopSupplyActivity(skipActivityLog?: boolean): boolean {
  return !skipActivityLog;
}

export function shouldLogCoopTeachingWeekActivity(options?: {
  skipActivityLog?: boolean;
  parentSignup?: boolean;
}): boolean {
  if (options?.skipActivityLog) return false;
  if (options?.parentSignup) return false;
  return true;
}

type LogProgramCoopSupplyItemInput = CoopActivityActor & {
  organizationId: string;
  programId: string;
  itemId: string;
  itemName: string;
};

export async function logProgramCoopSupplyItemAdded(
  supabase: SupabaseClient,
  input: LogProgramCoopSupplyItemInput,
): Promise<void> {
  const itemName = input.itemName.trim();

  await logActivityEvent(supabase, {
    organizationId: input.organizationId,
    actorType: input.actorUserId ? "school_admin" : "system",
    actorUserId: input.actorUserId ?? null,
    actorName: input.actorName ?? null,
    surface: "school_admin",
    action: ACTIVITY_ACTIONS.COOP_SUPPLY_ITEM_ADDED,
    entityType: "program_coop_supply_item",
    entityId: input.itemId,
    summary: `Added co-op supply item "${itemName}"`,
    metadata: {
      programId: input.programId,
      itemId: input.itemId,
      itemName,
    },
  });
}

export async function logProgramCoopSupplyItemUpdated(
  supabase: SupabaseClient,
  input: LogProgramCoopSupplyItemInput,
): Promise<void> {
  const itemName = input.itemName.trim();

  await logActivityEvent(supabase, {
    organizationId: input.organizationId,
    actorType: input.actorUserId ? "school_admin" : "system",
    actorUserId: input.actorUserId ?? null,
    actorName: input.actorName ?? null,
    surface: "school_admin",
    action: ACTIVITY_ACTIONS.COOP_SUPPLY_ITEM_UPDATED,
    entityType: "program_coop_supply_item",
    entityId: input.itemId,
    summary: `Updated co-op supply item "${itemName}"`,
    metadata: {
      programId: input.programId,
      itemId: input.itemId,
      itemName,
    },
  });
}

type LogProgramCoopTeachingWeekInput = CoopActivityActor & {
  organizationId: string;
  programId: string;
  weekId: string;
  weekName: string;
};

export async function logProgramCoopTeachingWeekAdded(
  supabase: SupabaseClient,
  input: LogProgramCoopTeachingWeekInput,
): Promise<void> {
  const weekName = input.weekName.trim();

  await logActivityEvent(supabase, {
    organizationId: input.organizationId,
    actorType: input.actorUserId ? "school_admin" : "system",
    actorUserId: input.actorUserId ?? null,
    actorName: input.actorName ?? null,
    surface: "school_admin",
    action: ACTIVITY_ACTIONS.COOP_TEACHING_WEEK_ADDED,
    entityType: "program_coop_teaching_schedule_week",
    entityId: input.weekId,
    summary: `Added co-op teaching week "${weekName}"`,
    metadata: {
      programId: input.programId,
      weekId: input.weekId,
      weekName,
    },
  });
}

export async function logProgramCoopTeachingWeekUpdated(
  supabase: SupabaseClient,
  input: LogProgramCoopTeachingWeekInput,
): Promise<void> {
  const weekName = input.weekName.trim();

  await logActivityEvent(supabase, {
    organizationId: input.organizationId,
    actorType: input.actorUserId ? "school_admin" : "system",
    actorUserId: input.actorUserId ?? null,
    actorName: input.actorName ?? null,
    surface: "school_admin",
    action: ACTIVITY_ACTIONS.COOP_TEACHING_WEEK_UPDATED,
    entityType: "program_coop_teaching_schedule_week",
    entityId: input.weekId,
    summary: `Updated co-op teaching week "${weekName}"`,
    metadata: {
      programId: input.programId,
      weekId: input.weekId,
      weekName,
    },
  });
}

type LogProgramCoopCurriculumUpdatedInput = CoopActivityActor & {
  organizationId: string;
  programId: string;
  curriculumId: string;
  fileName: string;
};

export async function logProgramCoopCurriculumUpdated(
  supabase: SupabaseClient,
  input: LogProgramCoopCurriculumUpdatedInput,
): Promise<void> {
  const fileName = input.fileName.trim();

  await logActivityEvent(supabase, {
    organizationId: input.organizationId,
    actorType: input.actorUserId ? "school_admin" : "system",
    actorUserId: input.actorUserId ?? null,
    actorName: input.actorName ?? null,
    surface: "school_admin",
    action: ACTIVITY_ACTIONS.COOP_CURRICULUM_UPDATED,
    entityType: "program_coop_curriculum",
    entityId: input.curriculumId,
    summary: `Updated co-op curriculum "${fileName}"`,
    metadata: {
      programId: input.programId,
      curriculumId: input.curriculumId,
      fileName,
    },
  });
}
