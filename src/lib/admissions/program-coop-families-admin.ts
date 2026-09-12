import type { SupabaseClient } from "@supabase/supabase-js";
import { listProgramCoopEnrolledFamilies } from "@/lib/admissions/program-coop-family-assignments";
import type { ProgramCoopFamily, ProgramCoopLearner } from "@/lib/admissions/program-coop-directory";
import {
  computeSupplyListSummary,
  formatSupplyQuantity,
  supplyItemTypeLabel,
  supplyUsageTimingLabel,
  type CoopSupplyListItem,
} from "@/lib/admissions/program-coop-supply-list-mock";
import { listProgramCoopSupplyList } from "@/lib/admissions/program-coop-supply-list-storage";
import {
  countUnfilledTeachingWeeks,
  formatTeachingScheduleDateRange,
  isTeachingWeekPast,
  type CoopTeachingScheduleWeek,
  type TeachingScheduleParentRole,
} from "@/lib/admissions/program-coop-teaching-schedule-mock";
import { listProgramCoopTeachingSchedule } from "@/lib/admissions/program-coop-teaching-schedule-storage";

export type ProgramCoopFamilyPrimaryGuardian = {
  guardianId: string;
  name: string;
  email: string | null;
};

export type ProgramCoopFamilyTeachingWeek = {
  weekId: string;
  weekName: string;
  dateRange: string;
  role: TeachingScheduleParentRole;
  seasonalTheme: string;
  isPast: boolean;
};

export type ProgramCoopFamilyParticipation = {
  supplyItemCount: number;
  teachingWeekCount: number;
  upcomingTeachingWeekCount: number;
  hasSupplyGap: boolean;
  hasTeachingGap: boolean;
  supplyItems: CoopSupplyListItem[];
  teachingWeeks: ProgramCoopFamilyTeachingWeek[];
};

export type ProgramCoopFamilyAdminRow = {
  familyId: string;
  familyName: string;
  learners: ProgramCoopLearner[];
  enrolledAt: string | null;
  primaryGuardian: ProgramCoopFamilyPrimaryGuardian | null;
  supplyItemCount: number;
  teachingWeekCount: number;
  upcomingTeachingWeekCount: number;
  hasSupplyGap: boolean;
  hasTeachingGap: boolean;
  supplyItems: CoopSupplyListItem[];
  teachingWeeks: ProgramCoopFamilyTeachingWeek[];
};

export type ProgramCoopFamiliesAdminSummary = {
  familyCount: number;
  learnerCount: number;
  unassignedSupplyItemCount: number;
  unfilledTeachingWeekCount: number;
};

export type ProgramCoopFamiliesAdminData = {
  families: ProgramCoopFamilyAdminRow[];
  summary: ProgramCoopFamiliesAdminSummary;
  supplyItems: CoopSupplyListItem[];
  scheduleWeeks: CoopTeachingScheduleWeek[];
};

export type ProgramCoopFamiliesFilter = "all" | "needs_supply" | "needs_teaching";

function formatGuardianName(firstName: string, lastName: string): string {
  const parts = [firstName.trim(), lastName.trim()].filter(Boolean);
  return parts.length > 0 ? parts.join(" ") : "Guardian";
}

export function aggregateCoopFamilyParticipation(
  familyId: string,
  supplyItems: CoopSupplyListItem[],
  scheduleWeeks: CoopTeachingScheduleWeek[],
  referenceDate: Date = new Date(),
): ProgramCoopFamilyParticipation {
  const assignedSupplyItems = supplyItems.filter((item) =>
    item.assignedFamilyIds.includes(familyId),
  );

  const teachingWeeks: ProgramCoopFamilyTeachingWeek[] = [];

  for (const week of scheduleWeeks) {
    const isInstructor = week.instructorFamilyIds.includes(familyId);
    const isAssistant = week.assistantFamilyIds.includes(familyId);
    if (!isInstructor && !isAssistant) continue;

    if (isInstructor) {
      teachingWeeks.push({
        weekId: week.id,
        weekName: week.weekName.trim() || "Teaching week",
        dateRange: formatTeachingScheduleDateRange(week.startDate, week.endDate),
        role: "instructor",
        seasonalTheme: week.seasonalTheme.trim(),
        isPast: isTeachingWeekPast(week, referenceDate),
      });
    }

    if (isAssistant) {
      teachingWeeks.push({
        weekId: week.id,
        weekName: week.weekName.trim() || "Teaching week",
        dateRange: formatTeachingScheduleDateRange(week.startDate, week.endDate),
        role: "assistant",
        seasonalTheme: week.seasonalTheme.trim(),
        isPast: isTeachingWeekPast(week, referenceDate),
      });
    }
  }

  const upcomingTeachingWeekCount = teachingWeeks.filter((week) => !week.isPast).length;

  return {
    supplyItemCount: assignedSupplyItems.length,
    teachingWeekCount: teachingWeeks.length,
    upcomingTeachingWeekCount,
    hasSupplyGap: assignedSupplyItems.length === 0,
    hasTeachingGap: upcomingTeachingWeekCount === 0,
    supplyItems: assignedSupplyItems,
    teachingWeeks,
  };
}

export function buildProgramCoopFamiliesAdminSummary(
  families: ProgramCoopFamilyAdminRow[],
  supplyItems: CoopSupplyListItem[],
  scheduleWeeks: CoopTeachingScheduleWeek[],
): ProgramCoopFamiliesAdminSummary {
  const supplySummary = computeSupplyListSummary(supplyItems);

  return {
    familyCount: families.length,
    learnerCount: families.reduce((sum, family) => sum + family.learners.length, 0),
    unassignedSupplyItemCount: supplySummary.itemCount - supplySummary.assignedCount,
    unfilledTeachingWeekCount: countUnfilledTeachingWeeks(scheduleWeeks),
  };
}

function buildAdminRow(
  family: ProgramCoopFamily,
  primaryGuardian: ProgramCoopFamilyPrimaryGuardian | null,
  participation: ProgramCoopFamilyParticipation,
): ProgramCoopFamilyAdminRow {
  return {
    familyId: family.familyId,
    familyName: family.familyName,
    learners: family.learners,
    enrolledAt: family.enrolledAt,
    primaryGuardian,
    supplyItemCount: participation.supplyItemCount,
    teachingWeekCount: participation.teachingWeekCount,
    upcomingTeachingWeekCount: participation.upcomingTeachingWeekCount,
    hasSupplyGap: participation.hasSupplyGap,
    hasTeachingGap: participation.hasTeachingGap,
    supplyItems: participation.supplyItems,
    teachingWeeks: participation.teachingWeeks,
  };
}

async function loadGuardianEmailsById(
  admin: SupabaseClient,
  guardianIds: string[],
): Promise<Map<string, string | null>> {
  const emails = new Map<string, string | null>();
  if (guardianIds.length === 0) return emails;

  const { data, error } = await admin
    .from("guardians")
    .select("id, email")
    .in("id", guardianIds);

  if (error) throw error;

  for (const row of data ?? []) {
    emails.set(
      String(row.id),
      typeof row.email === "string" && row.email.trim() ? row.email.trim() : null,
    );
  }

  return emails;
}

function buildPrimaryGuardiansForFamilies(
  families: ProgramCoopFamily[],
  guardianMaps: {
    familyPrimaryGuardianIds: Map<string, string>;
    familyFirstGuardianIds: Map<string, string>;
    guardians: Map<
      string,
      { firstName: string; lastName: string; familyId?: string | null }
    >;
  },
  guardianEmails: Map<string, string | null>,
): Map<string, ProgramCoopFamilyPrimaryGuardian | null> {
  const result = new Map<string, ProgramCoopFamilyPrimaryGuardian | null>();

  for (const family of families) {
    const guardianId =
      guardianMaps.familyPrimaryGuardianIds.get(family.familyId) ??
      guardianMaps.familyFirstGuardianIds.get(family.familyId) ??
      family.contactGuardianId;

    if (!guardianId) {
      result.set(family.familyId, null);
      continue;
    }

    const display = guardianMaps.guardians.get(guardianId);

    result.set(family.familyId, {
      guardianId,
      name: display
        ? formatGuardianName(display.firstName, display.lastName)
        : "Guardian",
      email: guardianEmails.get(guardianId) ?? null,
    });
  }

  return result;
}

export async function loadProgramCoopFamiliesAdminData(
  supabase: SupabaseClient,
  input: {
    organizationId: string;
    programId: string;
  },
): Promise<ProgramCoopFamiliesAdminData> {
  const [families, supplyResult, scheduleWeeks] = await Promise.all([
    listProgramCoopEnrolledFamilies(supabase, input.organizationId, input.programId),
    listProgramCoopSupplyList(supabase, input.programId),
    listProgramCoopTeachingSchedule(supabase, input.programId),
  ]);

  const supplyItems = supplyResult.items;
  const referenceDate = new Date();

  const { loadFamilyGuardianDisplayMaps } = await import("@/lib/messages/threads");
  const familyIds = families.map((family) => family.familyId);
  const guardianMaps = familyIds.length
    ? await loadFamilyGuardianDisplayMaps(supabase, input.organizationId, familyIds)
    : {
        families: new Map(),
        guardians: new Map(),
        familyPrimaryGuardianIds: new Map(),
        familyFirstGuardianIds: new Map(),
      };

  const guardianIds = [
    ...new Set(
      families
        .map(
          (family) =>
            guardianMaps.familyPrimaryGuardianIds.get(family.familyId) ??
            guardianMaps.familyFirstGuardianIds.get(family.familyId) ??
            family.contactGuardianId,
        )
        .filter((value): value is string => Boolean(value)),
    ),
  ];
  const guardianEmails = await loadGuardianEmailsById(supabase, guardianIds);
  const primaryGuardians = buildPrimaryGuardiansForFamilies(
    families,
    guardianMaps,
    guardianEmails,
  );

  const adminFamilies = families.map((family) =>
    buildAdminRow(
      family,
      primaryGuardians.get(family.familyId) ?? null,
      aggregateCoopFamilyParticipation(
        family.familyId,
        supplyItems,
        scheduleWeeks,
        referenceDate,
      ),
    ),
  );

  return {
    families: adminFamilies,
    summary: buildProgramCoopFamiliesAdminSummary(
      adminFamilies,
      supplyItems,
      scheduleWeeks,
    ),
    supplyItems,
    scheduleWeeks,
  };
}

export function filterProgramCoopFamiliesAdminRows(
  families: ProgramCoopFamilyAdminRow[],
  filter: ProgramCoopFamiliesFilter,
): ProgramCoopFamilyAdminRow[] {
  switch (filter) {
    case "needs_supply":
      return families.filter((family) => family.hasSupplyGap);
    case "needs_teaching":
      return families.filter((family) => family.hasTeachingGap);
    default:
      return families;
  }
}

export function searchProgramCoopFamiliesAdminRows(
  families: ProgramCoopFamilyAdminRow[],
  query: string,
): ProgramCoopFamilyAdminRow[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return families;

  return families.filter((family) => {
    if (family.familyName.toLowerCase().includes(normalized)) return true;
    if (family.primaryGuardian?.name.toLowerCase().includes(normalized)) return true;
    if (family.primaryGuardian?.email?.toLowerCase().includes(normalized)) return true;
    return family.learners.some((learner) =>
      learner.firstName.toLowerCase().includes(normalized),
    );
  });
}

export function formatCoopFamilyLearnersSummary(learners: ProgramCoopLearner[]): string {
  if (learners.length === 0) return "—";
  const names = learners.map((learner) => learner.firstName).join(", ");
  return `${learners.length} · ${names}`;
}

export function formatCoopFamilySupplyItemSummary(item: CoopSupplyListItem): string {
  const typeLabel = supplyItemTypeLabel(item.itemType);
  const whenLabel = supplyUsageTimingLabel(item);
  const quantityLabel = formatSupplyQuantity(item);
  return [typeLabel, whenLabel, quantityLabel].filter(Boolean).join(" · ");
}
