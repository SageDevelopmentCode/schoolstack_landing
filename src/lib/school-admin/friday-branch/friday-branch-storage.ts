import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  FridayBranchBlock,
  FridayBranchBlockAccent,
  FridayBranchBlockStatus,
  FridayBranchClass,
  FridayBranchClassDetail,
  FridayBranchClassEnrollment,
  FridayBranchClassEnrollmentStatus,
  FridayBranchClassRosterForEmail,
  FridayBranchRosterEmailRow,
  FridayBranchTimeSlot,
} from "./friday-branch-types";

const BLOCK_ACCENTS = new Set<FridayBranchBlockAccent>(["sky", "berry", "sage", "sun"]);
const BLOCK_STATUSES = new Set<FridayBranchBlockStatus>(["current", "upcoming", "draft"]);

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function newFridayBranchId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "00000000-0000-4000-8000-000000000000";
}

type FridayBranchBlockRow = {
  id: string;
  organization_id: string;
  label: string;
  start_date: string | null;
  end_date: string | null;
  accent: string;
  description: string;
  status: string;
  sort_order: number;
};

type FridayBranchTimeSlotRow = {
  id: string;
  block_id: string;
  organization_id: string;
  time: string;
  sort_order: number;
};

type FridayBranchClassRow = {
  id: string;
  time_slot_id: string;
  organization_id: string;
  name: string;
  location: string;
  age_group: string;
  teacher: string;
  family_visible: boolean;
  capacity: number | null;
  sort_order: number;
};

type FridayBranchScheduleRpcBlock = {
  id: string;
  label: string;
  start_date: string;
  end_date: string;
  accent: FridayBranchBlockAccent;
  description: string;
  status: FridayBranchBlockStatus;
  sort_order: number;
  slots: FridayBranchScheduleRpcSlot[];
};

type FridayBranchScheduleRpcSlot = {
  id: string;
  time: string;
  sort_order: number;
  classes: FridayBranchScheduleRpcClass[];
};

type FridayBranchScheduleRpcClass = {
  id: string;
  name: string;
  location: string;
  age_group: string;
  teacher: string;
  family_visible: boolean;
  capacity: number | null;
  sort_order: number;
};

const ENROLLMENT_STATUSES = new Set<FridayBranchClassEnrollmentStatus>([
  "confirmed",
  "waitlisted",
  "withdrawn",
]);

function isUuid(value: string): boolean {
  return UUID_RE.test(value);
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function parseAccent(value: unknown): FridayBranchBlockAccent | null {
  const accent = asString(value, "sky") as FridayBranchBlockAccent;
  return BLOCK_ACCENTS.has(accent) ? accent : null;
}

function parseStatus(value: unknown): FridayBranchBlockStatus | null {
  const status = asString(value, "draft") as FridayBranchBlockStatus;
  return BLOCK_STATUSES.has(status) ? status : null;
}

function parseIsoDate(value: unknown): string {
  const raw = asString(value).trim();
  if (!raw) return "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return "";
  const [year, month, day] = raw.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  if (Number.isNaN(date.getTime())) return "";
  return raw;
}

function validateDateRange(startDate: string, endDate: string): string | null {
  if (!startDate || !endDate) return null;
  if (endDate < startDate) {
    return "Block end date must be on or after the start date.";
  }
  return null;
}

function parseCapacity(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const num = typeof value === "number" ? value : Number.parseInt(asString(value), 10);
  if (!Number.isFinite(num) || num <= 0) return null;
  return num;
}

function parseEnrollmentStatus(value: unknown): FridayBranchClassEnrollmentStatus {
  const status = asString(value, "confirmed") as FridayBranchClassEnrollmentStatus;
  return ENROLLMENT_STATUSES.has(status) ? status : "confirmed";
}

function mapClassRow(row: FridayBranchClassRow): FridayBranchClass {
  return {
    id: row.id,
    name: row.name,
    location: row.location,
    ageGroup: row.age_group,
    teacher: row.teacher,
    familyVisible: row.family_visible,
    capacity: row.capacity,
  };
}

function mapSlotRow(
  row: FridayBranchTimeSlotRow,
  classes: FridayBranchClass[],
): FridayBranchTimeSlot {
  return {
    id: row.id,
    time: row.time,
    classes,
  };
}

function mapBlockRow(
  row: FridayBranchBlockRow,
  slots: FridayBranchTimeSlot[],
): FridayBranchBlock {
  return {
    id: row.id,
    label: row.label,
    startDate: row.start_date ?? "",
    endDate: row.end_date ?? "",
    accent: parseAccent(row.accent) ?? "sky",
    description: row.description,
    status: parseStatus(row.status) ?? "draft",
    slots,
  };
}

function mapBlocksToRpcPayload(blocks: FridayBranchBlock[]): FridayBranchScheduleRpcBlock[] {
  return blocks.map((block, blockIndex) => ({
    id: block.id,
    label: block.label.trim(),
    start_date: block.startDate,
    end_date: block.endDate,
    accent: block.accent,
    description: (block.description ?? "").trim(),
    status: block.status ?? "draft",
    sort_order: blockIndex,
    slots: block.slots.map((slot, slotIndex) => ({
      id: slot.id,
      time: slot.time.trim(),
      sort_order: slotIndex,
      classes: slot.classes.map((classEntry, classIndex) => ({
        id: classEntry.id,
        name: classEntry.name.trim(),
        location: classEntry.location.trim(),
        age_group: classEntry.ageGroup.trim(),
        teacher: (classEntry.teacher ?? "").trim(),
        family_visible: classEntry.familyVisible ?? true,
        capacity: classEntry.capacity ?? null,
        sort_order: classIndex,
      })),
    })),
  }));
}

export function parseFridayBranchSchedulePayload(blocks: unknown): FridayBranchBlock[] | null {
  if (!Array.isArray(blocks)) return null;

  const parsed: FridayBranchBlock[] = [];

  for (const blockValue of blocks) {
    if (!blockValue || typeof blockValue !== "object") return null;
    const blockRecord = blockValue as Record<string, unknown>;

    const id = asString(blockRecord.id).trim();
    if (!isUuid(id)) return null;

    const accent = parseAccent(blockRecord.accent);
    const status = parseStatus(blockRecord.status);
    if (!accent || !status) return null;

    const startDate = parseIsoDate(blockRecord.startDate);
    const endDate = parseIsoDate(blockRecord.endDate);
    const dateError = validateDateRange(startDate, endDate);
    if (dateError) return null;

    const slotsValue = blockRecord.slots;
    if (!Array.isArray(slotsValue)) return null;

    const slots: FridayBranchTimeSlot[] = [];
    for (const slotValue of slotsValue) {
      if (!slotValue || typeof slotValue !== "object") return null;
      const slotRecord = slotValue as Record<string, unknown>;
      const slotId = asString(slotRecord.id).trim();
      if (!isUuid(slotId)) return null;

      const classesValue = slotRecord.classes;
      if (!Array.isArray(classesValue)) return null;

      const classes: FridayBranchClass[] = [];
      for (const classValue of classesValue) {
        if (!classValue || typeof classValue !== "object") return null;
        const classRecord = classValue as Record<string, unknown>;
        const classId = asString(classRecord.id).trim();
        if (!isUuid(classId)) return null;

        classes.push({
          id: classId,
          name: asString(classRecord.name),
          location: asString(classRecord.location),
          ageGroup: asString(classRecord.ageGroup),
          teacher: asString(classRecord.teacher),
          familyVisible: asBoolean(classRecord.familyVisible, true),
          capacity: parseCapacity(classRecord.capacity),
        });
      }

      slots.push({
        id: slotId,
        time: asString(slotRecord.time),
        classes,
      });
    }

    parsed.push({
      id,
      label: asString(blockRecord.label),
      startDate,
      endDate,
      accent,
      description: asString(blockRecord.description),
      status,
      slots,
    });
  }

  return parsed;
}

export function validateFridayBranchSchedule(blocks: FridayBranchBlock[]): string | null {
  for (const block of blocks) {
    if (!isUuid(block.id)) return "Each block needs a valid id.";
    const dateError = validateDateRange(block.startDate, block.endDate);
    if (dateError) return dateError;

    for (const slot of block.slots) {
      if (!isUuid(slot.id)) return "Each time slot needs a valid id.";
      for (const classEntry of slot.classes) {
        if (!isUuid(classEntry.id)) return "Each class needs a valid id.";
        if (classEntry.capacity != null && classEntry.capacity <= 0) {
          return "Class capacity must be a positive number.";
        }
      }
    }
  }
  return null;
}

function assembleFridayBranchBlocks(
  blockRows: FridayBranchBlockRow[],
  slotRows: FridayBranchTimeSlotRow[],
  classRows: FridayBranchClassRow[],
): FridayBranchBlock[] {
  const classesBySlot = new Map<string, FridayBranchClass[]>();
  for (const row of classRows) {
    const list = classesBySlot.get(row.time_slot_id) ?? [];
    list.push(mapClassRow(row));
    classesBySlot.set(row.time_slot_id, list);
  }

  const slotsByBlock = new Map<string, FridayBranchTimeSlot[]>();
  for (const row of slotRows) {
    const list = slotsByBlock.get(row.block_id) ?? [];
    list.push(mapSlotRow(row, classesBySlot.get(row.id) ?? []));
    slotsByBlock.set(row.block_id, list);
  }

  return blockRows.map((row) => mapBlockRow(row, slotsByBlock.get(row.id) ?? []));
}

export async function loadFridayBranchSchedule(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<FridayBranchBlock[]> {
  const [blocksResult, slotsResult, classesResult] = await Promise.all([
    supabase
      .from("friday_branch_blocks")
      .select("id, organization_id, label, start_date, end_date, accent, description, status, sort_order")
      .eq("organization_id", organizationId)
      .order("sort_order", { ascending: true }),
    supabase
      .from("friday_branch_time_slots")
      .select("id, block_id, organization_id, time, sort_order")
      .eq("organization_id", organizationId)
      .order("sort_order", { ascending: true }),
    supabase
      .from("friday_branch_classes")
      .select("id, time_slot_id, organization_id, name, location, age_group, teacher, family_visible, capacity, sort_order")
      .eq("organization_id", organizationId)
      .order("sort_order", { ascending: true }),
  ]);

  if (blocksResult.error) throw blocksResult.error;
  if (slotsResult.error) throw slotsResult.error;
  if (classesResult.error) throw classesResult.error;

  return assembleFridayBranchBlocks(
    (blocksResult.data ?? []) as FridayBranchBlockRow[],
    (slotsResult.data ?? []) as FridayBranchTimeSlotRow[],
    (classesResult.data ?? []) as FridayBranchClassRow[],
  );
}

export async function saveFridayBranchSchedule(
  supabase: SupabaseClient,
  organizationId: string,
  blocks: FridayBranchBlock[],
): Promise<FridayBranchBlock[]> {
  const validationError = validateFridayBranchSchedule(blocks);
  if (validationError) {
    throw new Error(validationError);
  }

  const payload = mapBlocksToRpcPayload(blocks);
  const { error } = await supabase.rpc("save_friday_branch_schedule", {
    p_organization_id: organizationId,
    p_blocks: payload,
  });

  if (error) throw error;

  return loadFridayBranchSchedule(supabase, organizationId);
}

type FridayBranchClassDetailRow = {
  id: string;
  name: string;
  location: string;
  age_group: string;
  teacher: string;
  family_visible: boolean;
  capacity: number | null;
  friday_branch_time_slots: {
    time: string;
    friday_branch_blocks: {
      label: string;
      start_date: string | null;
      end_date: string | null;
    };
  };
};

type FridayBranchEnrollmentRow = {
  id: string;
  student_id: string;
  family_id: string;
  status: string;
  students:
    | { first_name?: string; last_name?: string }
    | { first_name?: string; last_name?: string }[]
    | null;
  families: { name?: string } | { name?: string }[] | null;
};

type FridayBranchRosterEnrollmentRow = {
  status: string;
  students:
    | { first_name?: string; last_name?: string; grade?: string | null }
    | { first_name?: string; last_name?: string; grade?: string | null }[]
    | null;
  families:
    | {
        name?: string;
        primary_email?: string | null;
        primary_phone?: string | null;
      }
    | {
        name?: string;
        primary_email?: string | null;
        primary_phone?: string | null;
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

export async function loadFridayBranchClassDetail(
  supabase: SupabaseClient,
  organizationId: string,
  classId: string,
): Promise<FridayBranchClassDetail | null> {
  const { data: classRow, error: classError } = await supabase
    .from("friday_branch_classes")
    .select(
      `id, name, location, age_group, teacher, family_visible, capacity,
      friday_branch_time_slots!inner (
        time,
        friday_branch_blocks!inner (
          label, start_date, end_date
        )
      )`,
    )
    .eq("id", classId)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (classError) throw classError;
  if (!classRow) return null;

  const row = classRow as FridayBranchClassDetailRow;
  const slot = relationOne(row.friday_branch_time_slots);
  const block = slot ? relationOne(slot.friday_branch_blocks) : null;
  if (!slot || !block) return null;

  const { data: enrollmentRows, error: enrollmentError } = await supabase
    .from("friday_branch_class_enrollments")
    .select(
      `id, student_id, family_id, status,
      students ( first_name, last_name ),
      families ( name )`,
    )
    .eq("class_id", classId)
    .eq("organization_id", organizationId)
    .neq("status", "withdrawn")
    .order("created_at", { ascending: true });

  if (enrollmentError) throw enrollmentError;

  const enrollments: FridayBranchClassEnrollment[] = (
    (enrollmentRows ?? []) as FridayBranchEnrollmentRow[]
  ).map((enrollment) => {
    const student = relationOne(enrollment.students);
    const family = relationOne(enrollment.families);
    return {
      id: enrollment.id,
      studentId: enrollment.student_id,
      familyId: enrollment.family_id,
      studentName: formatPersonName(student?.first_name, student?.last_name),
      familyName: family?.name?.trim() || "Family",
      status: parseEnrollmentStatus(enrollment.status),
    };
  });

  const activeEnrollments = enrollments.filter((entry) => entry.status !== "withdrawn");

  return {
    class: {
      id: row.id,
      name: row.name,
      location: row.location,
      ageGroup: row.age_group,
      teacher: row.teacher,
      familyVisible: row.family_visible,
      capacity: row.capacity,
    },
    slotTime: slot.time,
    blockLabel: block.label,
    blockDateRange: formatBlockDateRangeLabel(
      block.start_date ?? "",
      block.end_date ?? "",
    ),
    enrollmentCount: activeEnrollments.length,
    enrollments: activeEnrollments,
  };
}

function rosterStatusSortOrder(status: FridayBranchClassEnrollmentStatus): number {
  return status === "confirmed" ? 0 : 1;
}

function formatRosterStatusLabel(status: FridayBranchClassEnrollmentStatus): string {
  return status === "waitlisted" ? "Waitlisted" : "Signed up";
}

export async function loadFridayBranchClassRosterForEmail(
  supabase: SupabaseClient,
  organizationId: string,
  classId: string,
): Promise<FridayBranchClassRosterForEmail | null> {
  const [{ data: orgRow, error: orgError }, detail] = await Promise.all([
    supabase
      .from("organizations")
      .select("name")
      .eq("id", organizationId)
      .maybeSingle(),
    loadFridayBranchClassDetail(supabase, organizationId, classId),
  ]);

  if (orgError) throw orgError;
  if (!detail) return null;

  const { data: enrollmentRows, error: enrollmentError } = await supabase
    .from("friday_branch_class_enrollments")
    .select(
      `status,
      students ( first_name, last_name, grade ),
      families ( name, primary_email, primary_phone )`,
    )
    .eq("class_id", classId)
    .eq("organization_id", organizationId)
    .in("status", ["confirmed", "waitlisted"]);

  if (enrollmentError) throw enrollmentError;

  const rows: FridayBranchRosterEmailRow[] = (
    (enrollmentRows ?? []) as FridayBranchRosterEnrollmentRow[]
  )
    .map((enrollment) => {
      const student = relationOne(enrollment.students);
      const family = relationOne(enrollment.families);
      const status = parseEnrollmentStatus(enrollment.status);
      if (status === "withdrawn") return null;

      return {
        studentName: formatPersonName(student?.first_name, student?.last_name),
        familyName: family?.name?.trim() || "Family",
        grade: student?.grade?.trim() || "—",
        status,
        familyEmail: family?.primary_email?.trim() || "—",
        familyPhone: family?.primary_phone?.trim() || "—",
      };
    })
    .filter((row): row is FridayBranchRosterEmailRow => row !== null)
    .sort((left, right) => {
      const statusDiff =
        rosterStatusSortOrder(left.status) - rosterStatusSortOrder(right.status);
      if (statusDiff !== 0) return statusDiff;
      return left.studentName.localeCompare(right.studentName);
    });

  return {
    schoolName: String(orgRow?.name ?? "School"),
    className: detail.class.name?.trim() || "Class",
    slotTime: detail.slotTime,
    location: detail.class.location?.trim() || "Not set",
    ageGroup: detail.class.ageGroup?.trim() || "Not set",
    teacher: detail.class.teacher?.trim() || "Not assigned",
    blockLabel: detail.blockLabel,
    blockDateRange: detail.blockDateRange,
    rows,
  };
}

export { formatRosterStatusLabel };
