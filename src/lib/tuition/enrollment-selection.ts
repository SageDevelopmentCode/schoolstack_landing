import type { SupabaseClient } from "@supabase/supabase-js";
import {
  assignmentNeedsPaymentPlanSelection,
  getAssignmentForEnrollment,
} from "./assignments";
import { getDefaultRatePlanForProgram, getRatePlanWithDetails } from "./rate-plans";
import type { RatePlanWithDetails, TuitionEnrollmentAssignment } from "./types";

export type EnrollmentTuitionSelectionContext = {
  assignment: TuitionEnrollmentAssignment;
  ratePlan: RatePlanWithDetails;
};

export async function getEnrollmentTuitionSelectionContext(
  supabase: SupabaseClient,
  input: {
    organizationId: string;
    enrollmentId: string;
    programId: string;
  },
): Promise<EnrollmentTuitionSelectionContext | null> {
  let assignment = await getAssignmentForEnrollment(supabase, input.enrollmentId);

  if (!assignment) {
    const ratePlan = await getDefaultRatePlanForProgram(
      supabase,
      input.organizationId,
      input.programId,
    );
    if (!ratePlan || ratePlan.paymentPlans.length <= 1) {
      return null;
    }
    return null;
  }

  if (!assignmentNeedsPaymentPlanSelection(assignment)) {
    return null;
  }

  const ratePlan = await getRatePlanWithDetails(supabase, assignment.ratePlanId);
  if (!ratePlan || ratePlan.paymentPlans.length <= 1) {
    return null;
  }

  return { assignment, ratePlan };
}
