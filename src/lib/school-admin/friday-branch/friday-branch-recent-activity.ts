import type { SupabaseClient } from "@supabase/supabase-js";
import type { FridayBranchClassEnrollmentStatus } from "./friday-branch-types";

export type FridayBranchRecentSignupRow = {
  enrollmentId: string;
  classId: string;
  blockId: string;
  className: string;
  slotTime: string;
  blockLabel: string;
  studentName: string;
  familyName: string;
  status: Exclude<FridayBranchClassEnrollmentStatus, "withdrawn">;
  updatedAt: string;
};

type RecentSignupQueryRow = {
  id: string;
  class_id: string;
  block_id: string;
  status: string;
  updated_at: string;
  students:
    | { first_name?: string; last_name?: string }
    | { first_name?: string; last_name?: string }[]
    | null;
  families: { name?: string } | { name?: string }[] | null;
  friday_branch_classes:
    | {
        name: string;
        friday_branch_time_slots:
          | {
              time: string;
              friday_branch_blocks: { label: string } | { label: string }[];
            }
          | {
              time: string;
              friday_branch_blocks: { label: string } | { label: string }[];
            }[]
          | null;
      }
    | {
        name: string;
        friday_branch_time_slots:
          | {
              time: string;
              friday_branch_blocks: { label: string } | { label: string }[];
            }
          | {
              time: string;
              friday_branch_blocks: { label: string } | { label: string }[];
            }[]
          | null;
      }[]
    | null;
};

function relationOne<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? value[0] ?? null : value;
}

function formatPersonName(firstName?: string, lastName?: string): string {
  const name = [firstName, lastName].filter(Boolean).join(" ").trim();
  return name || "Student";
}

function parseRecentSignupStatus(
  value: unknown,
): Exclude<FridayBranchClassEnrollmentStatus, "withdrawn"> {
  return value === "waitlisted" ? "waitlisted" : "confirmed";
}

export function mapFridayBranchRecentSignupRow(
  row: RecentSignupQueryRow,
): FridayBranchRecentSignupRow | null {
  const classRow = relationOne(row.friday_branch_classes);
  const slot = classRow ? relationOne(classRow.friday_branch_time_slots) : null;
  const block = slot ? relationOne(slot.friday_branch_blocks) : null;
  const student = relationOne(row.students);
  const family = relationOne(row.families);

  if (!classRow || !slot || !block) return null;

  return {
    enrollmentId: row.id,
    classId: row.class_id,
    blockId: row.block_id,
    className: classRow.name?.trim() || "Class",
    slotTime: slot.time?.trim() || "Time TBD",
    blockLabel: block.label?.trim() || "Block",
    studentName: formatPersonName(student?.first_name, student?.last_name),
    familyName: family?.name?.trim() || "Family",
    status: parseRecentSignupStatus(row.status),
    updatedAt: row.updated_at,
  };
}

export async function loadFridayBranchRecentSignups(
  supabase: SupabaseClient,
  organizationId: string,
  limit = 12,
): Promise<FridayBranchRecentSignupRow[]> {
  const { data, error } = await supabase
    .from("friday_branch_class_enrollments")
    .select(
      `id, class_id, block_id, status, updated_at,
      students ( first_name, last_name ),
      families ( name ),
      friday_branch_classes!inner (
        name,
        friday_branch_time_slots!inner (
          time,
          friday_branch_blocks!inner ( label )
        )
      )`,
    )
    .eq("organization_id", organizationId)
    .in("status", ["confirmed", "waitlisted"])
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (error) throw error;

  return ((data ?? []) as RecentSignupQueryRow[])
    .map(mapFridayBranchRecentSignupRow)
    .filter((row): row is FridayBranchRecentSignupRow => row !== null);
}
