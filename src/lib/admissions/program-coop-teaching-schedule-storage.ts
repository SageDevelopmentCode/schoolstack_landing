import type { SupabaseClient } from "@supabase/supabase-js";
import {
  logProgramCoopTeachingWeekAdded,
  logProgramCoopTeachingWeekUpdated,
  shouldLogCoopTeachingWeekActivity,
} from "./program-coop-activity";
import {
  canAddTeachingAssignedParent,
  canParentSignUpForTeachingRole,
  newCoopTeachingScheduleWeek,
  type CoopTeachingScheduleWeek,
  type TeachingScheduleParentRole,
} from "./program-coop-teaching-schedule-mock";
import {
  mergeAssignedFamiliesOnAdminSave,
  ProgramCoopSignupConflictError,
  ProgramCoopStorageConflictError,
} from "./program-coop-storage-errors";

export type ProgramCoopTeachingScheduleContext = {
  organizationId: string;
  programId: string;
};

type ProgramCoopTeachingScheduleWeekRow = {
  id: string;
  program_id: string;
  organization_id: string;
  start_date: string;
  end_date: string;
  instructor_family_ids: string[];
  assistant_family_ids: string[];
  week_name: string;
  seasonal_theme: string;
  character_lesson: string;
  celebration_event: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

const WEEK_SELECT =
  "id, program_id, organization_id, start_date, end_date, instructor_family_ids, assistant_family_ids, week_name, seasonal_theme, character_lesson, celebration_event, sort_order, created_at, updated_at";

function mapWeekRow(row: ProgramCoopTeachingScheduleWeekRow): CoopTeachingScheduleWeek {
  return {
    id: row.id,
    startDate: row.start_date,
    endDate: row.end_date,
    instructorFamilyIds: row.instructor_family_ids ?? [],
    assistantFamilyIds: row.assistant_family_ids ?? [],
    weekName: row.week_name,
    seasonalTheme: row.seasonal_theme,
    characterLesson: row.character_lesson,
    celebrationEvent: row.celebration_event,
    updatedAt: row.updated_at,
  };
}

function weekToInsertRow(
  week: CoopTeachingScheduleWeek,
  ctx: ProgramCoopTeachingScheduleContext,
  sortOrder: number,
) {
  return {
    id: week.id,
    program_id: ctx.programId,
    organization_id: ctx.organizationId,
    start_date: week.startDate,
    end_date: week.endDate,
    instructor_family_ids: week.instructorFamilyIds,
    assistant_family_ids: week.assistantFamilyIds,
    week_name: week.weekName.trim(),
    seasonal_theme: week.seasonalTheme.trim(),
    character_lesson: week.characterLesson.trim(),
    celebration_event: week.celebrationEvent?.trim() ? week.celebrationEvent.trim() : null,
    sort_order: sortOrder,
  };
}

async function nextWeekSortOrder(
  supabase: SupabaseClient,
  programId: string,
): Promise<number> {
  const { data, error } = await supabase
    .from("program_coop_teaching_schedule_weeks")
    .select("sort_order")
    .eq("program_id", programId)
    .order("sort_order", { ascending: false })
    .limit(1);

  if (error) throw error;
  if (!data?.length) return 0;
  return (data[0] as { sort_order: number }).sort_order + 1;
}

export async function listProgramCoopTeachingSchedule(
  supabase: SupabaseClient,
  programId: string,
): Promise<CoopTeachingScheduleWeek[]> {
  const { data, error } = await supabase
    .from("program_coop_teaching_schedule_weeks")
    .select(WEEK_SELECT)
    .eq("program_id", programId)
    .order("start_date", { ascending: true })
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) throw error;
  return ((data ?? []) as ProgramCoopTeachingScheduleWeekRow[]).map(mapWeekRow);
}

export async function getProgramCoopTeachingScheduleWeek(
  supabase: SupabaseClient,
  ctx: ProgramCoopTeachingScheduleContext,
  weekId: string,
): Promise<CoopTeachingScheduleWeek | null> {
  const { data, error } = await supabase
    .from("program_coop_teaching_schedule_weeks")
    .select(WEEK_SELECT)
    .eq("id", weekId)
    .eq("program_id", ctx.programId)
    .eq("organization_id", ctx.organizationId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return mapWeekRow(data as ProgramCoopTeachingScheduleWeekRow);
}

export type ProgramCoopTeachingScheduleWriteOptions = {
  skipActivityLog?: boolean;
  parentSignup?: boolean;
};

export type ProgramCoopTeachingScheduleAdminSaveInput = {
  draft: CoopTeachingScheduleWeek;
  savedBaseline: CoopTeachingScheduleWeek;
};

export async function insertProgramCoopTeachingScheduleWeek(
  supabase: SupabaseClient,
  ctx: ProgramCoopTeachingScheduleContext,
  partial?: Partial<CoopTeachingScheduleWeek>,
): Promise<CoopTeachingScheduleWeek> {
  const base = newCoopTeachingScheduleWeek();
  const week: CoopTeachingScheduleWeek = {
    ...base,
    ...partial,
    id: crypto.randomUUID(),
  };
  const sortOrder = await nextWeekSortOrder(supabase, ctx.programId);

  const { data, error } = await supabase
    .from("program_coop_teaching_schedule_weeks")
    .insert(weekToInsertRow(week, ctx, sortOrder))
    .select(WEEK_SELECT)
    .single();

  if (error) throw error;
  const mapped = mapWeekRow(data as ProgramCoopTeachingScheduleWeekRow);

  void logProgramCoopTeachingWeekAdded(supabase, {
    organizationId: ctx.organizationId,
    programId: ctx.programId,
    weekId: mapped.id,
    weekName: mapped.weekName,
  });

  return mapped;
}

export async function upsertProgramCoopTeachingScheduleWeek(
  supabase: SupabaseClient,
  ctx: ProgramCoopTeachingScheduleContext,
  week: CoopTeachingScheduleWeek,
  options?: ProgramCoopTeachingScheduleWriteOptions,
): Promise<CoopTeachingScheduleWeek> {
  const { data: existing, error: existingError } = await supabase
    .from("program_coop_teaching_schedule_weeks")
    .select("sort_order")
    .eq("id", week.id)
    .maybeSingle();

  if (existingError) throw existingError;

  const sortOrder =
    existing && typeof (existing as { sort_order: number }).sort_order === "number"
      ? (existing as { sort_order: number }).sort_order
      : await nextWeekSortOrder(supabase, ctx.programId);

  const { data, error } = await supabase
    .from("program_coop_teaching_schedule_weeks")
    .upsert(weekToInsertRow(week, ctx, sortOrder), { onConflict: "id" })
    .select(WEEK_SELECT)
    .single();

  if (error) throw error;
  const mapped = mapWeekRow(data as ProgramCoopTeachingScheduleWeekRow);

  if (shouldLogCoopTeachingWeekActivity(options)) {
    const logInput = {
      organizationId: ctx.organizationId,
      programId: ctx.programId,
      weekId: mapped.id,
      weekName: mapped.weekName,
    };

    if (existing) {
      void logProgramCoopTeachingWeekUpdated(supabase, logInput);
    } else {
      void logProgramCoopTeachingWeekAdded(supabase, logInput);
    }
  }

  return mapped;
}

export async function saveProgramCoopTeachingScheduleWeekAdmin(
  supabase: SupabaseClient,
  ctx: ProgramCoopTeachingScheduleContext,
  input: ProgramCoopTeachingScheduleAdminSaveInput,
): Promise<CoopTeachingScheduleWeek> {
  const { draft, savedBaseline } = input;

  if (!savedBaseline.updatedAt) {
    throw new ProgramCoopStorageConflictError();
  }

  const { data: existing, error: existingError } = await supabase
    .from("program_coop_teaching_schedule_weeks")
    .select("sort_order, instructor_family_ids, assistant_family_ids, updated_at")
    .eq("id", draft.id)
    .eq("program_id", ctx.programId)
    .eq("organization_id", ctx.organizationId)
    .maybeSingle();

  if (existingError) throw existingError;
  if (!existing) {
    throw new Error("Teaching week not found.");
  }

  const existingRow = existing as {
    sort_order: number;
    instructor_family_ids: string[];
    assistant_family_ids: string[];
  };

  const mergedWeek: CoopTeachingScheduleWeek = {
    ...draft,
    instructorFamilyIds: mergeAssignedFamiliesOnAdminSave(
      existingRow.instructor_family_ids ?? [],
      savedBaseline.instructorFamilyIds,
      draft.instructorFamilyIds,
    ),
    assistantFamilyIds: mergeAssignedFamiliesOnAdminSave(
      existingRow.assistant_family_ids ?? [],
      savedBaseline.assistantFamilyIds,
      draft.assistantFamilyIds,
    ),
  };

  const patch = weekToInsertRow(mergedWeek, ctx, existingRow.sort_order);

  const { data, error } = await supabase
    .from("program_coop_teaching_schedule_weeks")
    .update(patch)
    .eq("id", draft.id)
    .eq("program_id", ctx.programId)
    .eq("organization_id", ctx.organizationId)
    .eq("updated_at", savedBaseline.updatedAt)
    .select(WEEK_SELECT)
    .maybeSingle();

  if (error) throw error;
  if (!data) {
    throw new ProgramCoopStorageConflictError();
  }

  const mapped = mapWeekRow(data as ProgramCoopTeachingScheduleWeekRow);

  void logProgramCoopTeachingWeekUpdated(supabase, {
    organizationId: ctx.organizationId,
    programId: ctx.programId,
    weekId: mapped.id,
    weekName: mapped.weekName,
  });

  return mapped;
}

export async function deleteProgramCoopTeachingScheduleWeek(
  supabase: SupabaseClient,
  weekId: string,
): Promise<void> {
  const { error } = await supabase
    .from("program_coop_teaching_schedule_weeks")
    .delete()
    .eq("id", weekId);

  if (error) throw error;
}

function familyIdsForRole(
  week: CoopTeachingScheduleWeek,
  role: TeachingScheduleParentRole,
): string[] {
  return role === "instructor" ? week.instructorFamilyIds : week.assistantFamilyIds;
}

export async function appendProgramCoopTeachingScheduleParent(
  supabase: SupabaseClient,
  ctx: ProgramCoopTeachingScheduleContext,
  weekId: string,
  role: TeachingScheduleParentRole,
  familyId: string,
  options?: { parentSignup?: boolean },
): Promise<CoopTeachingScheduleWeek> {
  const trimmedFamilyId = familyId.trim();
  if (!trimmedFamilyId) {
    throw new Error("This week cannot accept another sign-up for that role.");
  }

  const { data, error } = await supabase.rpc(
    "append_program_coop_teaching_schedule_parent",
    {
      p_week_id: weekId,
      p_program_id: ctx.programId,
      p_organization_id: ctx.organizationId,
      p_role: role,
      p_family_id: trimmedFamilyId,
      p_enforce_single_slot: options?.parentSignup === true,
    },
  );

  if (error) throw error;

  const rows = (data ?? []) as ProgramCoopTeachingScheduleWeekRow[];
  if (rows.length > 0) {
    return mapWeekRow(rows[0]);
  }

  const week = await getProgramCoopTeachingScheduleWeek(supabase, ctx, weekId);
  if (!week) {
    throw new Error("Teaching week not found.");
  }

  const currentFamilyIds = familyIdsForRole(week, role);
  if (options?.parentSignup && !canParentSignUpForTeachingRole(currentFamilyIds)) {
    throw new ProgramCoopSignupConflictError("This role is already filled.");
  }
  if (!canAddTeachingAssignedParent(currentFamilyIds, familyId)) {
    throw new ProgramCoopSignupConflictError(
      "This week cannot accept another sign-up for that role.",
    );
  }

  throw new ProgramCoopSignupConflictError(
    "This week cannot accept another sign-up for that role.",
  );
}

export async function removeProgramCoopTeachingScheduleParent(
  supabase: SupabaseClient,
  ctx: ProgramCoopTeachingScheduleContext,
  weekId: string,
  role: TeachingScheduleParentRole,
  familyId: string,
): Promise<CoopTeachingScheduleWeek> {
  const trimmedFamilyId = familyId.trim();
  if (!trimmedFamilyId) {
    throw new Error("You are not signed up for this role.");
  }

  const { data, error } = await supabase.rpc("remove_program_coop_teaching_schedule_parent", {
    p_week_id: weekId,
    p_program_id: ctx.programId,
    p_organization_id: ctx.organizationId,
    p_role: role,
    p_family_id: trimmedFamilyId,
  });

  if (error) throw error;

  const rows = (data ?? []) as ProgramCoopTeachingScheduleWeekRow[];
  if (rows.length > 0) {
    return mapWeekRow(rows[0]);
  }

  throw new Error("You are not signed up for this role.");
}
