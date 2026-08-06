import type { SupabaseClient } from "@supabase/supabase-js";
import {
  allocateCombinedPaymentAmounts,
  type CombinedPaymentAllocation,
} from "@/lib/admissions/combined-enrollment-payment";
import {
  quoteProcessingFee,
  type CheckoutPaymentMethod,
  type ProcessingFeeQuote,
} from "@/lib/stripe/processing-fee";
import { chargeRemainingCents } from "./billing-splits";
import type { TuitionCharge } from "./types";

const OPEN_CHARGE_STATUSES = new Set(["scheduled", "sent", "overdue"]);

export type CombinedTuitionChargeCandidate = {
  charge: TuitionCharge;
  studentName: string;
  amountCents: number;
};

export type CombinedTuitionPaymentQuote = {
  candidates: CombinedTuitionChargeCandidate[];
  combinedQuote: ProcessingFeeQuote;
  allocations: CombinedPaymentAllocation[];
};

export type CombinedTuitionValidationResult =
  | { ok: true; candidates: CombinedTuitionChargeCandidate[] }
  | { ok: false; status: number; error: string; code: string };

export function validateCombinedTuitionChargeIds(input: {
  chargeIds: string[];
  charges: TuitionCharge[];
  allOpenChargesOnDueDate: TuitionCharge[];
}): CombinedTuitionValidationResult {
  const uniqueChargeIds = [...new Set(input.chargeIds)];
  if (uniqueChargeIds.length < 2) {
    return {
      ok: false,
      status: 400,
      error: "Combined checkout requires at least two charges.",
      code: "invalid_charges",
    };
  }

  const chargesById = new Map(input.charges.map((charge) => [charge.id, charge]));
  const selectedCharges = uniqueChargeIds.map((id) => chargesById.get(id) ?? null);

  if (selectedCharges.some((charge) => charge == null)) {
    return {
      ok: false,
      status: 404,
      error: "One or more charges were not found.",
      code: "not_found",
    };
  }

  const charges = selectedCharges as TuitionCharge[];
  const familyIds = new Set(charges.map((charge) => charge.familyId));
  const organizationIds = new Set(charges.map((charge) => charge.organizationId));
  const dueDates = new Set(charges.map((charge) => charge.dueDate));

  if (familyIds.size !== 1 || organizationIds.size !== 1 || dueDates.size !== 1) {
    return {
      ok: false,
      status: 400,
      error: "Combined checkout charges must belong to the same family and due date.",
      code: "invalid_charges",
    };
  }

  for (const charge of charges) {
    if (!OPEN_CHARGE_STATUSES.has(charge.status)) {
      return {
        ok: false,
        status: 400,
        error: "One or more charges are no longer payable.",
        code: "invalid_status",
      };
    }

    if (chargeRemainingCents(charge) <= 0) {
      return {
        ok: false,
        status: 400,
        error: "One or more charges have already been paid.",
        code: "already_paid",
      };
    }
  }

  const expectedIds = new Set(
    input.allOpenChargesOnDueDate
      .filter((charge) => chargeRemainingCents(charge) > 0)
      .map((charge) => charge.id),
  );

  if (
    expectedIds.size < 2 ||
    expectedIds.size !== uniqueChargeIds.length ||
    !uniqueChargeIds.every((id) => expectedIds.has(id))
  ) {
    return {
      ok: false,
      status: 400,
      error: "Combined checkout must include all open charges on the earliest due date.",
      code: "invalid_charges",
    };
  }

  return {
    ok: true,
    candidates: charges.map((charge) => ({
      charge,
      studentName: "Student",
      amountCents: chargeRemainingCents(charge),
    })),
  };
}

export function buildCombinedTuitionPaymentQuote(
  candidates: CombinedTuitionChargeCandidate[],
  paymentMethod: CheckoutPaymentMethod,
): CombinedTuitionPaymentQuote {
  if (candidates.length < 2) {
    throw new Error("Combined tuition checkout requires at least two charges.");
  }

  const netAmounts = candidates.map((candidate) => candidate.amountCents);
  const totalNetCents = netAmounts.reduce((sum, amount) => sum + amount, 0);
  const combinedQuote = quoteProcessingFee(totalNetCents, paymentMethod);
  const allocations = allocateCombinedPaymentAmounts(netAmounts, combinedQuote);

  return {
    candidates,
    combinedQuote,
    allocations,
  };
}

export async function attachStudentNamesToCombinedCandidates(
  supabase: SupabaseClient,
  candidates: CombinedTuitionChargeCandidate[],
): Promise<CombinedTuitionChargeCandidate[]> {
  const chargeIds = candidates.map((candidate) => candidate.charge.id);
  const { data: charges, error: chargesError } = await supabase
    .from("tuition_charges")
    .select("id, assignment_id")
    .in("id", chargeIds);

  if (chargesError) throw chargesError;

  const assignmentIds = [
    ...new Set(
      (charges ?? [])
        .map((charge) =>
          charge.assignment_id ? String(charge.assignment_id) : null,
        )
        .filter((id): id is string => Boolean(id)),
    ),
  ];

  if (assignmentIds.length === 0) {
    return candidates;
  }

  const { data: assignments, error: assignmentsError } = await supabase
    .from("tuition_enrollment_assignments")
    .select("id, enrollment_id")
    .in("id", assignmentIds);

  if (assignmentsError) throw assignmentsError;

  const enrollmentIds = [
    ...new Set(
      (assignments ?? [])
        .map((assignment) =>
          assignment.enrollment_id ? String(assignment.enrollment_id) : null,
        )
        .filter((id): id is string => Boolean(id)),
    ),
  ];

  if (enrollmentIds.length === 0) {
    return candidates;
  }

  const { data: enrollments, error: enrollmentsError } = await supabase
    .from("enrollments")
    .select("id, student_id")
    .in("id", enrollmentIds);

  if (enrollmentsError) throw enrollmentsError;

  const studentIds = [
    ...new Set(
      (enrollments ?? [])
        .map((enrollment) =>
          enrollment.student_id ? String(enrollment.student_id) : null,
        )
        .filter((id): id is string => Boolean(id)),
    ),
  ];

  const studentNameById = new Map<string, string>();
  if (studentIds.length > 0) {
    const { data: students, error: studentsError } = await supabase
      .from("students")
      .select("id, first_name, last_name")
      .in("id", studentIds);

    if (studentsError) throw studentsError;

    for (const student of students ?? []) {
      const firstName =
        typeof student.first_name === "string" ? student.first_name.trim() : "";
      const lastName =
        typeof student.last_name === "string" ? student.last_name.trim() : "";
      const fullName = [firstName, lastName].filter(Boolean).join(" ");
      studentNameById.set(String(student.id), fullName || "Student");
    }
  }

  const enrollmentIdByAssignmentId = new Map(
    (assignments ?? []).map((assignment) => [
      String(assignment.id),
      assignment.enrollment_id ? String(assignment.enrollment_id) : null,
    ]),
  );
  const studentIdByEnrollmentId = new Map(
    (enrollments ?? []).map((enrollment) => [
      String(enrollment.id),
      enrollment.student_id ? String(enrollment.student_id) : null,
    ]),
  );
  const assignmentIdByChargeId = new Map(
    (charges ?? []).map((charge) => [
      String(charge.id),
      charge.assignment_id ? String(charge.assignment_id) : null,
    ]),
  );

  return candidates.map((candidate) => {
    const assignmentId = assignmentIdByChargeId.get(candidate.charge.id);
    const enrollmentId = assignmentId
      ? enrollmentIdByAssignmentId.get(assignmentId)
      : null;
    const studentId = enrollmentId
      ? studentIdByEnrollmentId.get(enrollmentId)
      : null;
    const studentName = studentId ? studentNameById.get(studentId) : null;

    return {
      ...candidate,
      studentName: studentName ?? "Student",
    };
  });
}
