import type { SupabaseClient } from "@supabase/supabase-js";
import { rowToCharge } from "./row-mappers";
import type { ChargeStatus, FamilyBillingSummary, TuitionCharge } from "./types";

export async function listChargesForFamily(
  supabase: SupabaseClient,
  familyId: string,
): Promise<TuitionCharge[]> {
  const { data, error } = await supabase
    .from("tuition_charges")
    .select("*")
    .eq("family_id", familyId)
    .not("status", "eq", "void")
    .order("due_date", { ascending: true });

  if (error) throw error;
  return (data ?? []).map(rowToCharge);
}

export async function listChargesForAssignment(
  supabase: SupabaseClient,
  assignmentId: string,
): Promise<TuitionCharge[]> {
  const { data, error } = await supabase
    .from("tuition_charges")
    .select("*")
    .eq("assignment_id", assignmentId)
    .not("status", "eq", "void")
    .order("due_date", { ascending: true });

  if (error) throw error;
  return (data ?? []).map(rowToCharge);
}

export async function getChargeById(
  supabase: SupabaseClient,
  chargeId: string,
): Promise<TuitionCharge | null> {
  const { data, error } = await supabase
    .from("tuition_charges")
    .select("*")
    .eq("id", chargeId)
    .maybeSingle();

  if (error) throw error;
  return data ? rowToCharge(data) : null;
}

export async function updateChargeStatus(
  supabase: SupabaseClient,
  chargeId: string,
  status: ChargeStatus,
  extra?: { sentAt?: string; paidAt?: string },
): Promise<TuitionCharge> {
  const patch: Record<string, unknown> = { status };
  if (extra?.sentAt) patch.sent_at = extra.sentAt;
  if (extra?.paidAt) patch.paid_at = extra.paidAt;

  const { data, error } = await supabase
    .from("tuition_charges")
    .update(patch)
    .eq("id", chargeId)
    .select("*")
    .single();

  if (error) throw error;
  return rowToCharge(data);
}

export async function markChargePaid(
  supabase: SupabaseClient,
  chargeId: string,
  paidAt?: string,
): Promise<TuitionCharge> {
  return updateChargeStatus(supabase, chargeId, "paid", {
    paidAt: paidAt ?? new Date().toISOString(),
  });
}

export async function markChargeSent(
  supabase: SupabaseClient,
  chargeId: string,
): Promise<TuitionCharge> {
  return updateChargeStatus(supabase, chargeId, "sent", {
    sentAt: new Date().toISOString(),
  });
}

export async function voidCharge(
  supabase: SupabaseClient,
  chargeId: string,
): Promise<TuitionCharge> {
  return updateChargeStatus(supabase, chargeId, "void");
}

export async function listFamilyBillingSummaries(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<FamilyBillingSummary[]> {
  const { data: families, error: familiesError } = await supabase
    .from("families")
    .select("id, name, primary_email")
    .eq("organization_id", organizationId)
    .order("name", { ascending: true });

  if (familiesError) throw familiesError;
  if (!families?.length) return [];

  const familyIds = families.map((f) => String(f.id));

  const [
    { data: billingAccounts },
    { data: assignments },
    { data: charges },
    { data: students },
    { data: enrollments },
    { data: programs },
  ] = await Promise.all([
    supabase
      .from("tuition_billing_accounts")
      .select("*")
      .eq("organization_id", organizationId)
      .in("family_id", familyIds),
    supabase
      .from("tuition_enrollment_assignments")
      .select("id, family_id, enrollment_id, rate_plan_id")
      .eq("organization_id", organizationId)
      .eq("status", "active"),
    supabase
      .from("tuition_charges")
      .select("*")
      .eq("organization_id", organizationId)
      .in("family_id", familyIds)
      .not("status", "eq", "void"),
    supabase
      .from("students")
      .select("id, family_id, first_name, last_name")
      .in("family_id", familyIds),
    supabase
      .from("enrollments")
      .select("id, student_id, program_id, status")
      .eq("organization_id", organizationId)
      .eq("status", "enrolled"),
    supabase
      .from("programs")
      .select("id, name")
      .eq("organization_id", organizationId),
  ]);

  const programMap = new Map(
    (programs ?? []).map((p) => [String(p.id), String(p.name)]),
  );
  const studentMap = new Map(
    (students ?? []).map((s) => [
      String(s.id),
      `${s.first_name} ${s.last_name}`.trim(),
    ]),
  );
  const enrollmentToStudent = new Map(
    (enrollments ?? []).map((e) => [String(e.id), String(e.student_id)]),
  );
  const enrollmentToProgram = new Map(
    (enrollments ?? []).map((e) => [String(e.id), String(e.program_id)]),
  );

  const yearStart = new Date();
  yearStart.setUTCMonth(0, 1);
  yearStart.setUTCHours(0, 0, 0, 0);

  return families.map((family) => {
    const familyId = String(family.id);
    const familyAssignments = (assignments ?? []).filter(
      (a) => String(a.family_id) === familyId,
    );
    const familyCharges = (charges ?? []).filter(
      (c) => String(c.family_id) === familyId,
    );
    const billingAccount = (billingAccounts ?? []).find(
      (b) => String(b.family_id) === familyId,
    );

    const openStatuses = new Set(["scheduled", "sent", "overdue"]);
    const openCharges = familyCharges.filter((c) =>
      openStatuses.has(String(c.status)),
    );
    const balanceDueCents = openCharges.reduce(
      (sum, c) => sum + Number(c.amount_cents),
      0,
    );
    const paidYtdCents = familyCharges
      .filter((c) => c.status === "paid" && new Date(String(c.paid_at)) >= yearStart)
      .reduce((sum, c) => sum + Number(c.amount_cents), 0);

    const nextOpen = openCharges.sort((a, b) =>
      String(a.due_date).localeCompare(String(b.due_date)),
    )[0];

    const hasOverdue = familyCharges.some((c) => c.status === "overdue");
    const hasSent = familyCharges.some((c) => c.status === "sent");

    const children = new Set<string>();
    const programNames = new Set<string>();
    for (const assignment of familyAssignments) {
      const studentId = enrollmentToStudent.get(String(assignment.enrollment_id));
      const programId = enrollmentToProgram.get(String(assignment.enrollment_id));
      if (studentId) {
        const name = studentMap.get(studentId);
        if (name) children.add(name);
      }
      if (programId) {
        const name = programMap.get(programId);
        if (name) programNames.add(name);
      }
    }

    const familyStudentIds = new Set(
      (students ?? [])
        .filter((s) => String(s.family_id) === familyId)
        .map((s) => String(s.id)),
    );
    for (const enrollment of enrollments ?? []) {
      const studentId = String(enrollment.student_id);
      if (!familyStudentIds.has(studentId)) continue;
      const name = studentMap.get(studentId);
      if (name) children.add(name);
      const programId = enrollmentToProgram.get(String(enrollment.id));
      if (programId) {
        const programName = programMap.get(programId);
        if (programName) programNames.add(programName);
      }
    }

    const hasBillingActivity =
      familyAssignments.length > 0 ||
      familyCharges.length > 0 ||
      children.size > 0;

    return {
      familyId,
      familyName: String(family.name),
      primaryEmail:
        typeof family.primary_email === "string" ? family.primary_email : null,
      children: [...children],
      programs: [...programNames],
      balanceDueCents,
      paidYtdCents,
      nextDue: nextOpen
        ? {
            date: String(nextOpen.due_date),
            amountCents: Number(nextOpen.amount_cents),
            label: String(nextOpen.label),
          }
        : null,
      autopayEnabled: Boolean(billingAccount?.autopay_enabled),
      status: hasOverdue
        ? "overdue"
        : hasSent
          ? "invoice_sent"
          : "current",
      assignmentIds: familyAssignments.map((a) => String(a.id)),
      hasBillingActivity,
    } satisfies FamilyBillingSummary & { hasBillingActivity: boolean };
  })
    .filter((summary) => summary.hasBillingActivity)
    .map(({ hasBillingActivity: _ignored, ...summary }) => summary)
    .sort((a, b) => {
      if (b.balanceDueCents !== a.balanceDueCents) {
        return b.balanceDueCents - a.balanceDueCents;
      }
      return a.familyName.localeCompare(b.familyName);
    });
}

export async function getTuitionKpis(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<{
  collectedYtdCents: number;
  outstandingCents: number;
  familiesAtRisk: number;
  activeAssignments: number;
}> {
  const summaries = await listFamilyBillingSummaries(supabase, organizationId);
  const yearStart = new Date();
  yearStart.setUTCMonth(0, 1);

  const { count: activeAssignments, error } = await supabase
    .from("tuition_enrollment_assignments")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", organizationId)
    .eq("status", "active");

  if (error) throw error;

  return {
    collectedYtdCents: summaries.reduce((s, f) => s + f.paidYtdCents, 0),
    outstandingCents: summaries.reduce((s, f) => s + f.balanceDueCents, 0),
    familiesAtRisk: summaries.filter((f) => f.status === "overdue").length,
    activeAssignments: activeAssignments ?? 0,
  };
}
