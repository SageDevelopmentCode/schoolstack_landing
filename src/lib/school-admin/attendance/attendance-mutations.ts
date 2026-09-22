import type { SupabaseClient } from "@supabase/supabase-js";
import { resolveAttendancePickupSelection } from "./attendance-pickup-contacts";
import type {
  AttendanceAction,
  AttendancePickupSelection,
  AttendanceRecordStatus,
  AttendanceRosterStatus,
  PickupContactSource,
} from "./attendance-types";

export class AttendanceMutationError extends Error {
  code: string;
  status: number;

  constructor(message: string, code: string, status: number) {
    super(message);
    this.name = "AttendanceMutationError";
    this.code = code;
    this.status = status;
  }
}

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function parseAttendanceDate(value: string): string {
  const normalized = value.trim();
  if (!DATE_PATTERN.test(normalized)) {
    throw new AttendanceMutationError(
      "date must be YYYY-MM-DD.",
      "invalid_date",
      400,
    );
  }
  return normalized;
}

export function mapRecordStatusToRosterStatus(
  status: AttendanceRecordStatus | null | undefined,
): AttendanceRosterStatus {
  if (status === "present" || status === "absent" || status === "picked_up") {
    return status;
  }
  return "not_marked";
}

export function validateAttendanceAction(
  currentStatus: AttendanceRosterStatus,
  action: AttendanceAction,
): void {
  if (action === "pickup" && currentStatus !== "present") {
    throw new AttendanceMutationError(
      "Pickup can only be recorded when the student is marked present.",
      "invalid_transition",
      400,
    );
  }
}

export function validatePickupSelection(
  selection: AttendancePickupSelection | null | undefined,
): AttendancePickupSelection {
  const source = selection?.source;
  const contactId = selection?.contactId?.trim() ?? "";

  if (source !== "guardian" && source !== "authorized_contact") {
    throw new AttendanceMutationError(
      "pickupSource must be guardian or authorized_contact.",
      "invalid_pickup_source",
      400,
    );
  }

  if (!contactId) {
    throw new AttendanceMutationError(
      "pickupContactId is required to record pickup.",
      "missing_pickup_contact",
      400,
    );
  }

  return {
    source: source as PickupContactSource,
    contactId,
  };
}

export type UpsertAttendanceRecordInput = {
  organizationId: string;
  studentId: string;
  familyId: string;
  date: string;
  action: AttendanceAction;
  pickupSelection?: AttendancePickupSelection | null;
  recordedByUserId: string;
};

export type UpsertAttendanceRecordResult = {
  status: AttendanceRecordStatus;
  presentAt: string | null;
  absentAt: string | null;
  pickedUpAt: string | null;
  pickedUpByGuardianId: string | null;
  pickedUpByAuthorizedContactId: string | null;
  pickedUpByName: string | null;
};

function buildRecordPayload(
  input: UpsertAttendanceRecordInput,
  nowIso: string,
): Record<string, unknown> {
  const attendanceDate = parseAttendanceDate(input.date);

  if (input.action === "present") {
    return {
      organization_id: input.organizationId,
      student_id: input.studentId,
      family_id: input.familyId,
      attendance_date: attendanceDate,
      status: "present",
      present_at: nowIso,
      absent_at: null,
      picked_up_at: null,
      picked_up_by_guardian_id: null,
      picked_up_by_authorized_contact_id: null,
      picked_up_by_name: null,
      recorded_by_user_id: input.recordedByUserId,
    };
  }

  if (input.action === "absent") {
    return {
      organization_id: input.organizationId,
      student_id: input.studentId,
      family_id: input.familyId,
      attendance_date: attendanceDate,
      status: "absent",
      present_at: null,
      absent_at: nowIso,
      picked_up_at: null,
      picked_up_by_guardian_id: null,
      picked_up_by_authorized_contact_id: null,
      picked_up_by_name: null,
      recorded_by_user_id: input.recordedByUserId,
    };
  }

  throw new AttendanceMutationError(
    "Pickup payload must be built after resolving the selected contact.",
    "invalid_action",
    400,
  );
}

export async function upsertAttendanceRecord(
  admin: SupabaseClient,
  input: UpsertAttendanceRecordInput,
  currentStatus: AttendanceRosterStatus = "not_marked",
): Promise<UpsertAttendanceRecordResult> {
  validateAttendanceAction(currentStatus, input.action);

  const nowIso = new Date().toISOString();
  const attendanceDate = parseAttendanceDate(input.date);

  if (input.action === "pickup") {
    const pickupSelection = validatePickupSelection(input.pickupSelection);
    const resolved = await resolveAttendancePickupSelection(
      admin,
      input.organizationId,
      input.studentId,
      input.familyId,
      pickupSelection.source,
      pickupSelection.contactId,
    );

    const { data: existing, error: existingError } = await admin
      .from("student_attendance_records")
      .select("present_at")
      .eq("student_id", input.studentId)
      .eq("attendance_date", attendanceDate)
      .maybeSingle();

    if (existingError) throw existingError;
    if (!existing?.present_at) {
      throw new AttendanceMutationError(
        "Pickup can only be recorded when the student is marked present.",
        "invalid_transition",
        400,
      );
    }

    const { data, error } = await admin
      .from("student_attendance_records")
      .update({
        status: "picked_up",
        picked_up_at: nowIso,
        picked_up_by_guardian_id: resolved.guardianId,
        picked_up_by_authorized_contact_id: resolved.authorizedContactId,
        picked_up_by_name: resolved.pickedUpByName,
        recorded_by_user_id: input.recordedByUserId,
      })
      .eq("student_id", input.studentId)
      .eq("attendance_date", attendanceDate)
      .select(
        "status, present_at, absent_at, picked_up_at, picked_up_by_guardian_id, picked_up_by_authorized_contact_id, picked_up_by_name",
      )
      .single();

    if (error) throw error;

    return {
      status: data.status as AttendanceRecordStatus,
      presentAt: data.present_at,
      absentAt: data.absent_at,
      pickedUpAt: data.picked_up_at,
      pickedUpByGuardianId: data.picked_up_by_guardian_id,
      pickedUpByAuthorizedContactId: data.picked_up_by_authorized_contact_id,
      pickedUpByName: data.picked_up_by_name,
    };
  }

  const payload = buildRecordPayload(input, nowIso);

  const { data, error } = await admin
    .from("student_attendance_records")
    .upsert(payload, { onConflict: "student_id,attendance_date" })
    .select(
      "status, present_at, absent_at, picked_up_at, picked_up_by_guardian_id, picked_up_by_authorized_contact_id, picked_up_by_name",
    )
    .single();

  if (error) throw error;

  return {
    status: data.status as AttendanceRecordStatus,
    presentAt: data.present_at,
    absentAt: data.absent_at,
    pickedUpAt: data.picked_up_at,
    pickedUpByGuardianId: data.picked_up_by_guardian_id,
    pickedUpByAuthorizedContactId: data.picked_up_by_authorized_contact_id,
    pickedUpByName: data.picked_up_by_name,
  };
}
