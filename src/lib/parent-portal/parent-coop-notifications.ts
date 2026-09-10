import type { SupabaseClient } from "@supabase/supabase-js";
import {
  isSupplyFamilyAssigned,
  normalizeSupplyFamilyName,
} from "@/lib/admissions/program-coop-supply-list-mock";
import { getProgramCoopCurriculumTabLabel } from "@/lib/admissions/program-coop-curriculum-storage";
import { normalizeTeachingParentName } from "@/lib/admissions/program-coop-teaching-schedule-mock";
import type { ParentNotificationContext } from "@/lib/parent-portal/parent-notification-context";

export type CoopParentActivityNotification = {
  id: string;
  action: string;
  title: string;
  summary: string;
  detail: string;
  createdAt: string;
  href: string;
  ctaLabel: string;
  category: "coop";
};

export const COOP_SUPPLY_ITEM_ADDED_ACTION = "coop.supply_item.added";
export const COOP_SUPPLY_ITEM_ASSIGNED_ACTION = "coop.supply_item.assigned";
export const COOP_TEACHING_WEEK_ADDED_ACTION = "coop.teaching_week.added";
export const COOP_TEACHING_WEEK_UPDATED_ACTION = "coop.teaching_week.updated";
export const COOP_TEACHING_WEEK_SCHEDULED_ACTION = "coop.teaching_week.scheduled";
export const COOP_CURRICULUM_UPDATED_ACTION = "coop.curriculum.updated";

const COOP_ASSIGNMENT_GRACE_MS = 120_000;
const COOP_UPDATE_THRESHOLD_MS = 1_000;

type SupplyItemRow = {
  id: string;
  name: string;
  assigned_families: string[] | null;
  created_at: string;
  updated_at: string;
};

type TeachingWeekRow = {
  id: string;
  week_name: string;
  start_date: string;
  parent_instructors: string[] | null;
  parent_assistants: string[] | null;
  created_at: string;
  updated_at: string;
};

type CurriculumRow = {
  id: string;
  file_name: string;
  display_name: string | null;
  updated_at: string;
};

export type CoopPageFetchOptions = {
  limit: number;
  cursor: { createdAt: string; id: string } | null;
};

function capCoopNotificationsForPage(
  notifications: CoopParentActivityNotification[],
  pageFetch?: CoopPageFetchOptions,
): CoopParentActivityNotification[] {
  if (!pageFetch) return notifications;

  const filtered = pageFetch.cursor
    ? notifications.filter((notification) => {
        const created = new Date(notification.createdAt).getTime();
        const cursorCreated = new Date(pageFetch.cursor!.createdAt).getTime();
        if (created < cursorCreated) return true;
        if (created > cursorCreated) return false;
        return notification.id < pageFetch.cursor!.id;
      })
    : notifications;

  return [...filtered]
    .sort((left, right) => {
      const leftCreated = new Date(left.createdAt).getTime();
      const rightCreated = new Date(right.createdAt).getTime();
      if (leftCreated !== rightCreated) {
        return rightCreated - leftCreated;
      }
      return right.id.localeCompare(left.id);
    })
    .slice(0, pageFetch.limit + 1);
}

function familyNameMatches(
  parentNames: ReadonlyArray<string>,
  candidate: string,
): boolean {
  return parentNames.some((name) =>
    isSupplyFamilyAssigned([name], candidate),
  );
}

function isLikelySupplySelfClaim(
  row: SupplyItemRow,
  parentNames: ReadonlyArray<string>,
): boolean {
  const created = new Date(row.created_at).getTime();
  const updated = new Date(row.updated_at).getTime();
  if (updated - created > COOP_ASSIGNMENT_GRACE_MS) return false;

  const assigned = row.assigned_families ?? [];
  if (assigned.length !== 1) return false;
  return familyNameMatches(parentNames, assigned[0]!);
}

function formatTeachingWeekLabel(row: TeachingWeekRow): string {
  const weekName = row.week_name?.trim();
  if (weekName) return weekName;
  return `Week of ${row.start_date}`;
}

function buildCoopNotification(input: {
  id: string;
  action: string;
  title: string;
  summary: string;
  detail: string;
  createdAt: string;
  href: string;
  ctaLabel: string;
}): CoopParentActivityNotification {
  return {
    ...input,
    category: "coop",
  };
}

function coopFeatureHref(
  parentNavBasePath: string,
  feature: "supply_list" | "teaching_schedule" | "curriculum",
): string {
  return `${parentNavBasePath}/${feature}`;
}

export async function fetchFamilyParentDisplayNames(
  supabase: SupabaseClient,
  familyId: string,
  organizationId: string,
): Promise<string[]> {
  const { data, error } = await supabase
    .from("guardians")
    .select("first_name, last_name")
    .eq("family_id", familyId)
    .eq("organization_id", organizationId);

  if (error) throw error;

  const names = new Set<string>();
  for (const row of data ?? []) {
    const firstName = String(row.first_name ?? "").trim();
    const lastName = String(row.last_name ?? "").trim();
    const fullName = normalizeSupplyFamilyName(`${firstName} ${lastName}`.trim());
    if (fullName) names.add(fullName);
    if (firstName) names.add(normalizeSupplyFamilyName(firstName));
  }

  return [...names];
}

export async function fetchCoopProgramNotifications(
  supabase: SupabaseClient,
  ctx: Extract<ParentNotificationContext, { mode: "program" }>,
  familyId: string,
  parentNames: ReadonlyArray<string>,
  rangeStart: Date,
  pageFetch?: CoopPageFetchOptions,
): Promise<CoopParentActivityNotification[]> {
  if (!ctx.coopModeEnabled) return [];

  const organizationId = await resolveOrganizationIdForProgram(
    supabase,
    ctx.programId,
  );
  if (!organizationId) return [];

  const [supplyItems, teachingWeeks, curriculumRows] = await Promise.all([
    fetchSupplyItems(supabase, ctx.programId, rangeStart),
    fetchTeachingWeeks(supabase, ctx.programId, rangeStart),
    fetchCurriculumRows(supabase, ctx.programId, rangeStart),
  ]);

  const notifications: CoopParentActivityNotification[] = [];

  for (const row of supplyItems) {
    const createdAt = row.created_at;
    if (new Date(createdAt) >= rangeStart) {
      notifications.push(
        buildCoopNotification({
          id: `coop:supply:added:${ctx.programId}:${row.id}`,
          action: COOP_SUPPLY_ITEM_ADDED_ACTION,
          title: "New supply list item",
          summary: row.name,
          detail: `New supply list item: ${row.name}`,
          createdAt,
          href: coopFeatureHref(ctx.parentNavBasePath, "supply_list"),
          ctaLabel: "View supply list",
        }),
      );
    }

    const assignedFamilies = row.assigned_families ?? [];
    const familyAssigned = assignedFamilies.some((name) =>
      familyNameMatches(parentNames, name),
    );
    const updatedAt = row.updated_at;
    const wasUpdatedAfterCreate =
      new Date(updatedAt).getTime() - new Date(row.created_at).getTime() >
      COOP_UPDATE_THRESHOLD_MS;

    if (
      familyAssigned &&
      wasUpdatedAfterCreate &&
      new Date(updatedAt) >= rangeStart &&
      !isLikelySupplySelfClaim(row, parentNames)
    ) {
      notifications.push(
        buildCoopNotification({
          id: `coop:supply:assigned:${ctx.programId}:${row.id}:${updatedAt}`,
          action: COOP_SUPPLY_ITEM_ASSIGNED_ACTION,
          title: "Supply list assignment",
          summary: row.name,
          detail: `You were assigned: ${row.name}`,
          createdAt: updatedAt,
          href: coopFeatureHref(ctx.parentNavBasePath, "supply_list"),
          ctaLabel: "View supply list",
        }),
      );
    }
  }

  for (const row of teachingWeeks) {
    const weekLabel = formatTeachingWeekLabel(row);
    const createdAt = row.created_at;
    const updatedAt = row.updated_at;
    const wasUpdatedAfterCreate =
      new Date(updatedAt).getTime() - new Date(createdAt).getTime() >
      COOP_UPDATE_THRESHOLD_MS;

    if (new Date(createdAt) >= rangeStart) {
      notifications.push(
        buildCoopNotification({
          id: `coop:teaching:added:${ctx.programId}:${row.id}`,
          action: COOP_TEACHING_WEEK_ADDED_ACTION,
          title: "Teaching schedule week added",
          summary: weekLabel,
          detail: `Teaching schedule week added: ${weekLabel}`,
          createdAt,
          href: coopFeatureHref(ctx.parentNavBasePath, "teaching_schedule"),
          ctaLabel: "View schedule",
        }),
      );
    } else if (wasUpdatedAfterCreate && new Date(updatedAt) >= rangeStart) {
      notifications.push(
        buildCoopNotification({
          id: `coop:teaching:updated:${ctx.programId}:${row.id}:${updatedAt}`,
          action: COOP_TEACHING_WEEK_UPDATED_ACTION,
          title: "Teaching schedule updated",
          summary: weekLabel,
          detail: `Teaching schedule updated: ${weekLabel}`,
          createdAt: updatedAt,
          href: coopFeatureHref(ctx.parentNavBasePath, "teaching_schedule"),
          ctaLabel: "View schedule",
        }),
      );
    }

    if (!wasUpdatedAfterCreate || new Date(updatedAt) < rangeStart) {
      continue;
    }

    const instructorMatch = (row.parent_instructors ?? []).some((name) =>
      familyNameMatches(parentNames, normalizeTeachingParentName(name)),
    );
    const assistantMatch = (row.parent_assistants ?? []).some((name) =>
      familyNameMatches(parentNames, normalizeTeachingParentName(name)),
    );

    if (instructorMatch || assistantMatch) {
      const roleLabel = instructorMatch ? "instructor" : "assistant";
      notifications.push(
        buildCoopNotification({
          id: `coop:teaching:scheduled:${ctx.programId}:${row.id}:${updatedAt}:${roleLabel}`,
          action: COOP_TEACHING_WEEK_SCHEDULED_ACTION,
          title: "Teaching schedule assignment",
          summary: weekLabel,
          detail: `You were scheduled as ${roleLabel}: ${weekLabel}`,
          createdAt: updatedAt,
          href: coopFeatureHref(ctx.parentNavBasePath, "teaching_schedule"),
          ctaLabel: "View schedule",
        }),
      );
    }
  }

  for (const row of curriculumRows) {
    const label = getProgramCoopCurriculumTabLabel({
      displayName: row.display_name,
      fileName: row.file_name,
    });
    notifications.push(
      buildCoopNotification({
        id: `coop:curriculum:${ctx.programId}:${row.id}:${row.updated_at}`,
        action: COOP_CURRICULUM_UPDATED_ACTION,
        title: "Curriculum updated",
        summary: label,
        detail: `Curriculum updated: ${label}`,
        createdAt: row.updated_at,
        href: coopFeatureHref(ctx.parentNavBasePath, "curriculum"),
        ctaLabel: "View curriculum",
      }),
    );
  }

  void familyId;
  return capCoopNotificationsForPage(notifications, pageFetch);
}

async function resolveOrganizationIdForProgram(
  supabase: SupabaseClient,
  programId: string,
): Promise<string | null> {
  const { data, error } = await supabase
    .from("programs")
    .select("organization_id")
    .eq("id", programId)
    .maybeSingle();

  if (error) throw error;
  return data?.organization_id ? String(data.organization_id) : null;
}

async function fetchSupplyItems(
  supabase: SupabaseClient,
  programId: string,
  rangeStart: Date,
): Promise<SupplyItemRow[]> {
  const { data, error } = await supabase
    .from("program_coop_supply_items")
    .select("id, name, assigned_families, created_at, updated_at")
    .eq("program_id", programId)
    .or(
      `created_at.gte.${rangeStart.toISOString()},updated_at.gte.${rangeStart.toISOString()}`,
    )
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as SupplyItemRow[];
}

async function fetchTeachingWeeks(
  supabase: SupabaseClient,
  programId: string,
  rangeStart: Date,
): Promise<TeachingWeekRow[]> {
  const { data, error } = await supabase
    .from("program_coop_teaching_schedule_weeks")
    .select(
      "id, week_name, start_date, parent_instructors, parent_assistants, created_at, updated_at",
    )
    .eq("program_id", programId)
    .or(
      `created_at.gte.${rangeStart.toISOString()},updated_at.gte.${rangeStart.toISOString()}`,
    )
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as TeachingWeekRow[];
}

async function fetchCurriculumRows(
  supabase: SupabaseClient,
  programId: string,
  rangeStart: Date,
): Promise<CurriculumRow[]> {
  const { data, error } = await supabase
    .from("program_coop_curriculum")
    .select("id, file_name, display_name, updated_at")
    .eq("program_id", programId)
    .gte("updated_at", rangeStart.toISOString())
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as CurriculumRow[];
}
