import type { SupabaseClient } from "@supabase/supabase-js";
import { loadFridayBranchSchedule } from "@/lib/school-admin/friday-branch/friday-branch-storage";
import type {
  FridayBranchBlock,
  FridayBranchBlockStatus,
  FridayBranchClass,
  FridayBranchClassEnrollmentStatus,
} from "@/lib/school-admin/friday-branch/friday-branch-types";
import type {
  ParentFridayBranchBlockSummary,
  ParentFridayBranchClassDetailBundle,
  ParentFridayBranchClassSummary,
  ParentFridayBranchPageBundle,
  ParentFridayBranchStudentEnrollmentState,
  ParentFridayBranchStudentOption,
} from "./types";

const PARENT_VISIBLE_BLOCK_STATUSES = new Set<FridayBranchBlockStatus>([
  "current",
  "upcoming",
]);

const ACTIVE_ENROLLMENT_STATUSES = new Set<FridayBranchClassEnrollmentStatus>([
  "confirmed",
  "waitlisted",
]);

type FamilyEnrollmentRow = {
  id: string;
  class_id: string;
  student_id: string;
  status: string;
};

type ConfirmedCountRow = {
  class_id: string;
  count: number;
};

type ClassContextRow = {
  id: string;
  name: string;
  location: string;
  age_group: string;
  teacher: string;
  family_visible: boolean;
  capacity: number | null;
  time_slot_id: string;
  friday_branch_time_slots: {
    id: string;
    time: string;
    block_id: string;
    friday_branch_blocks: {
      id: string;
      label: string;
      start_date: string | null;
      end_date: string | null;
      status: string;
    };
  };
};

function relationOne<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? value[0] ?? null : value;
}

function parseEnrollmentStatus(value: string): FridayBranchClassEnrollmentStatus {
  if (value === "waitlisted" || value === "withdrawn") return value;
  return "confirmed";
}

function formatBlockDateRangeLabel(startDate: string, endDate: string): string {
  if (!startDate || !endDate) return "Dates TBD";
  const start = new Date(`${startDate}T12:00:00`);
  const end = new Date(`${endDate}T12:00:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return "Dates TBD";

  const startLabel = start.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const endLabel = end.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: start.getFullYear() === end.getFullYear() ? undefined : "numeric",
  });
  return `${startLabel} – ${endLabel}`;
}

export function filterParentVisibleBlocks(blocks: FridayBranchBlock[]): FridayBranchBlock[] {
  return blocks
    .filter((block) => PARENT_VISIBLE_BLOCK_STATUSES.has(block.status ?? "draft"))
    .map((block) => ({
      ...block,
      slots: block.slots
        .map((slot) => ({
          ...slot,
          classes: slot.classes.filter((classEntry) => classEntry.familyVisible !== false),
        }))
        .filter((slot) => slot.classes.length > 0),
    }))
    .filter((block) => block.slots.length > 0);
}

export function computeSpotsRemaining(
  capacity: number | null | undefined,
  confirmedCount: number,
): number | null {
  if (capacity == null) return null;
  return Math.max(0, capacity - confirmedCount);
}

function buildClassSummary(
  classEntry: FridayBranchClass,
  slotId: string,
  slotTime: string,
  confirmedCount: number,
  familyEnrollments: ParentFridayBranchClassSummary["familyEnrollments"],
): ParentFridayBranchClassSummary {
  const capacity = classEntry.capacity ?? null;
  return {
    classId: classEntry.id,
    slotId,
    slotTime,
    name: classEntry.name,
    location: classEntry.location,
    ageGroup: classEntry.ageGroup,
    teacher: classEntry.teacher,
    capacity,
    confirmedCount,
    spotsRemaining: computeSpotsRemaining(capacity, confirmedCount),
    familyEnrollments,
  };
}

async function loadConfirmedCountsByClassId(
  admin: SupabaseClient,
  organizationId: string,
  classIds: string[],
): Promise<Map<string, number>> {
  const counts = new Map<string, number>();
  if (classIds.length === 0) return counts;

  const { data, error } = await admin
    .from("friday_branch_class_enrollments")
    .select("class_id")
    .eq("organization_id", organizationId)
    .eq("status", "confirmed")
    .in("class_id", classIds);

  if (error) throw error;

  for (const row of data ?? []) {
    const classId = String((row as { class_id: string }).class_id);
    counts.set(classId, (counts.get(classId) ?? 0) + 1);
  }

  return counts;
}

async function loadFamilyEnrollments(
  admin: SupabaseClient,
  organizationId: string,
  familyId: string,
  blockIds: string[],
): Promise<Map<string, ParentFridayBranchClassSummary["familyEnrollments"]>> {
  const byClassId = new Map<string, ParentFridayBranchClassSummary["familyEnrollments"]>();
  if (blockIds.length === 0) return byClassId;

  const { data, error } = await admin
    .from("friday_branch_class_enrollments")
    .select("id, class_id, student_id, status")
    .eq("organization_id", organizationId)
    .eq("family_id", familyId)
    .in("block_id", blockIds)
    .in("status", ["confirmed", "waitlisted"]);

  if (error) throw error;

  for (const row of (data ?? []) as FamilyEnrollmentRow[]) {
    const classId = String(row.class_id);
    const list = byClassId.get(classId) ?? [];
    list.push({
      enrollmentId: row.id,
      studentId: row.student_id,
      status: parseEnrollmentStatus(row.status),
    });
    byClassId.set(classId, list);
  }

  return byClassId;
}

export async function loadParentFridayBranchPageBundle(
  admin: SupabaseClient,
  organizationId: string,
  familyId: string,
  studentOptions: ParentFridayBranchStudentOption[],
): Promise<ParentFridayBranchPageBundle> {
  const schedule = await loadFridayBranchSchedule(admin, organizationId);
  const visibleBlocks = filterParentVisibleBlocks(schedule);

  const classIds: string[] = [];
  for (const block of visibleBlocks) {
    for (const slot of block.slots) {
      for (const classEntry of slot.classes) {
        classIds.push(classEntry.id);
      }
    }
  }

  const blockIds = visibleBlocks.map((block) => block.id);
  const [confirmedCounts, familyEnrollmentsByClassId] = await Promise.all([
    loadConfirmedCountsByClassId(admin, organizationId, classIds),
    loadFamilyEnrollments(admin, organizationId, familyId, blockIds),
  ]);

  const blocks: ParentFridayBranchBlockSummary[] = visibleBlocks.map((block) => {
    const classes: ParentFridayBranchClassSummary[] = [];
    for (const slot of block.slots) {
      for (const classEntry of slot.classes) {
        classes.push(
          buildClassSummary(
            classEntry,
            slot.id,
            slot.time,
            confirmedCounts.get(classEntry.id) ?? 0,
            familyEnrollmentsByClassId.get(classEntry.id) ?? [],
          ),
        );
      }
    }
    return { block, classes };
  });

  return {
    blocks,
    studentOptions,
  };
}

async function loadClassContext(
  admin: SupabaseClient,
  organizationId: string,
  classId: string,
): Promise<{
  classId: string;
  blockId: string;
  slotId: string;
  slotTime: string;
  blockLabel: string;
  blockDateRange: string;
  blockStatus: string;
  name: string;
  location: string;
  ageGroup: string;
  teacher?: string;
  familyVisible: boolean;
  capacity: number | null;
} | null> {
  const { data, error } = await admin
    .from("friday_branch_classes")
    .select(
      `id, name, location, age_group, teacher, family_visible, capacity, time_slot_id,
      friday_branch_time_slots!inner (
        id, time, block_id,
        friday_branch_blocks!inner (
          id, label, start_date, end_date, status
        )
      )`,
    )
    .eq("id", classId)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const row = data as unknown as ClassContextRow;
  const slot = relationOne(row.friday_branch_time_slots);
  const block = slot ? relationOne(slot.friday_branch_blocks) : null;
  if (!slot || !block) return null;

  return {
    classId: row.id,
    blockId: block.id,
    slotId: slot.id,
    slotTime: slot.time,
    blockLabel: block.label,
    blockDateRange: formatBlockDateRangeLabel(
      block.start_date ?? "",
      block.end_date ?? "",
    ),
    blockStatus: block.status,
    name: row.name,
    location: row.location,
    ageGroup: row.age_group,
    teacher: row.teacher || undefined,
    familyVisible: row.family_visible,
    capacity: row.capacity,
  };
}

async function loadStudentSlotEnrollmentsInBlock(
  admin: SupabaseClient,
  organizationId: string,
  blockId: string,
  studentId: string,
  excludeClassId?: string,
): Promise<Array<{ classId: string; slotTime: string; status: FridayBranchClassEnrollmentStatus }>> {
  const { data, error } = await admin
    .from("friday_branch_class_enrollments")
    .select(
      `class_id, status,
      friday_branch_classes!inner (
        friday_branch_time_slots!inner ( time )
      )`,
    )
    .eq("organization_id", organizationId)
    .eq("block_id", blockId)
    .eq("student_id", studentId)
    .in("status", ["confirmed", "waitlisted"]);

  if (error) throw error;

  const results: Array<{ classId: string; slotTime: string; status: FridayBranchClassEnrollmentStatus }> = [];
  for (const row of data ?? []) {
    const record = row as unknown as {
      class_id: string;
      status: string;
      friday_branch_classes: {
        friday_branch_time_slots: { time: string } | { time: string }[];
      };
    };
    const classId = String(record.class_id);
    if (excludeClassId && classId === excludeClassId) continue;
    const slot = relationOne(record.friday_branch_classes.friday_branch_time_slots);
    if (!slot) continue;
    results.push({
      classId,
      slotTime: slot.time,
      status: parseEnrollmentStatus(record.status),
    });
  }
  return results;
}

export function buildStudentEnrollmentStates(
  studentOptions: ParentFridayBranchStudentOption[],
  familyEnrollments: Array<{ studentId: string; enrollmentId: string; status: FridayBranchClassEnrollmentStatus }>,
  slotEnrollmentsByStudent: Map<string, Array<{ classId: string; slotTime: string }>>,
  classId: string,
  slotTime: string,
  spotsRemaining: number | null,
): ParentFridayBranchStudentEnrollmentState[] {
  return studentOptions.map((student) => {
    const enrollment = familyEnrollments.find((entry) => entry.studentId === student.id);
    if (enrollment) {
      return {
        studentId: student.id,
        studentName: student.name,
        enrollmentId: enrollment.enrollmentId,
        status: enrollment.status,
        canEnroll: false,
        blockedReason:
          enrollment.status === "waitlisted"
            ? "Already on the waitlist for this class."
            : "Already signed up for this class.",
      };
    }

    const conflicts = (slotEnrollmentsByStudent.get(student.id) ?? []).filter(
      (entry) => entry.classId !== classId && entry.slotTime === slotTime,
    );
    if (conflicts.length > 0) {
      return {
        studentId: student.id,
        studentName: student.name,
        canEnroll: false,
        blockedReason: "Already signed up for another class at this time.",
      };
    }

    if (spotsRemaining === 0) {
      return {
        studentId: student.id,
        studentName: student.name,
        canEnroll: true,
      };
    }

    return {
      studentId: student.id,
      studentName: student.name,
      canEnroll: true,
    };
  });
}

export async function loadParentFridayBranchClassDetail(
  admin: SupabaseClient,
  organizationId: string,
  familyId: string,
  classId: string,
  studentOptions: ParentFridayBranchStudentOption[],
): Promise<ParentFridayBranchClassDetailBundle | null> {
  const context = await loadClassContext(admin, organizationId, classId);
  if (!context) return null;
  if (!PARENT_VISIBLE_BLOCK_STATUSES.has(context.blockStatus as FridayBranchBlockStatus)) {
    return null;
  }
  if (!context.familyVisible) return null;

  const { data: familyEnrollmentRows, error: familyError } = await admin
    .from("friday_branch_class_enrollments")
    .select("id, student_id, status")
    .eq("organization_id", organizationId)
    .eq("family_id", familyId)
    .eq("class_id", classId)
    .in("status", ["confirmed", "waitlisted"]);

  if (familyError) throw familyError;

  const familyEnrollments = ((familyEnrollmentRows ?? []) as Array<{
    id: string;
    student_id: string;
    status: string;
  }>).map((row) => ({
    enrollmentId: row.id,
    studentId: row.student_id,
    status: parseEnrollmentStatus(row.status),
  }));

  const { count: confirmedCount, error: countError } = await admin
    .from("friday_branch_class_enrollments")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", organizationId)
    .eq("class_id", classId)
    .eq("status", "confirmed");

  if (countError) throw countError;

  const spotsRemaining = computeSpotsRemaining(context.capacity, confirmedCount ?? 0);

  const slotEnrollmentsByStudent = new Map<string, Array<{ classId: string; slotTime: string }>>();
  for (const student of studentOptions) {
    const enrollments = await loadStudentSlotEnrollmentsInBlock(
      admin,
      organizationId,
      context.blockId,
      student.id,
      classId,
    );
    slotEnrollmentsByStudent.set(
      student.id,
      enrollments.map((entry) => ({ classId: entry.classId, slotTime: entry.slotTime })),
    );
  }

  const studentStates = buildStudentEnrollmentStates(
    studentOptions,
    familyEnrollments,
    slotEnrollmentsByStudent,
    classId,
    context.slotTime,
    spotsRemaining,
  );

  return {
    classId: context.classId,
    blockId: context.blockId,
    slotId: context.slotId,
    slotTime: context.slotTime,
    blockLabel: context.blockLabel,
    blockDateRange: context.blockDateRange,
    name: context.name,
    location: context.location,
    ageGroup: context.ageGroup,
    teacher: context.teacher,
    capacity: context.capacity,
    confirmedCount: confirmedCount ?? 0,
    spotsRemaining,
    studentStates,
  };
}
