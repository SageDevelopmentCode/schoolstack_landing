import type { SupabaseClient } from "@supabase/supabase-js";
import {
  ACTIVITY_ACTIONS,
  logActivityEvent,
} from "@/lib/activity-log";
import {
  allAgreementSectionsSigned,
  buildAgreementResponsesPatch,
  mergeAgreementSectionSignature,
  parseAgreementSectionSignatures,
  parseAmendmentNotice,
  parsePendingResignSectionIds,
} from "./enrollment-agreement-progress";
import { getEnrollmentChecklistWithItems } from "./enrollment-checklist-items";
import type {
  ChecklistItemInstanceStatus,
  ChecklistVariantResolution,
  EnrollmentChecklistItem,
  EnrollmentChecklistItemInstance,
  EnrollmentChecklistMetadata,
  EnrollmentContractSection,
} from "./enrollment-checklist-schema";
import {
  hasPaymentBreakdown,
  sumPaymentLineItems,
} from "./enrollment-checklist-schema";
import {
  recordAdminBypassEnrollmentPayment,
} from "@/lib/stripe/application-payments";
import { getItemVariantConfig } from "./enrollment-checklist-schema";
import { getPublishedEnrollmentChecklistForProgram } from "./enrollment-checklist-templates";
import {
  buildDefaultResolutions,
  buildVariantResolutions,
  getVariantGroups,
  isVariantItemSelected,
  type VariantResolutionMap,
  validateResolutionMap,
} from "./enrollment-checklist-variants";
import { tryAutoAssignTuitionForEnrollment } from "@/lib/tuition/enrollment-hook";

const ENROLLED_STUDENT_STATUS = "active" as const;

export type NewlyCompletedEnrollment = {
  applicationId: string;
  enrollmentId: string;
};

export class EnrollmentMaterializationError extends Error {
  code: string;
  status: number;

  constructor(message: string, code: string, status: number) {
    super(message);
    this.name = "EnrollmentMaterializationError";
    this.code = code;
    this.status = status;
  }
}

export type StartedEnrollment = {
  enrollmentId: string;
  checklistId: string;
  applicationId: string;
};

function parseChecklistMetadata(value: unknown): EnrollmentChecklistMetadata {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }
  const record = value as Record<string, unknown>;
  const metadata: EnrollmentChecklistMetadata = {};

  const variantResolutions = record.variantResolutions;
  if (
    variantResolutions &&
    typeof variantResolutions === "object" &&
    !Array.isArray(variantResolutions)
  ) {
    metadata.variantResolutions =
      variantResolutions as EnrollmentChecklistMetadata["variantResolutions"];
  }

  const lastActiveTemplateItemId = record.lastActiveTemplateItemId;
  if (typeof lastActiveTemplateItemId === "string" && lastActiveTemplateItemId.trim()) {
    metadata.lastActiveTemplateItemId = lastActiveTemplateItemId;
  }

  return metadata;
}

export async function getChecklistForApplication(
  supabase: SupabaseClient,
  applicationId: string,
): Promise<{
  checklistId: string;
  enrollmentId: string;
  templateId: string;
  status: string;
  metadata: EnrollmentChecklistMetadata;
} | null> {
  const { data, error } = await supabase
    .from("enrollment_checklists")
    .select("id, enrollment_id, template_id, status, metadata")
    .eq("application_id", applicationId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    checklistId: String(data.id),
    enrollmentId: String(data.enrollment_id),
    templateId: String(data.template_id),
    status: String(data.status),
    metadata: parseChecklistMetadata(data.metadata),
  };
}

export async function startEnrollmentFromApplication(
  supabase: SupabaseClient,
  input: {
    applicationId: string;
    variantResolutions: VariantResolutionMap;
    actorUserId: string;
  },
): Promise<StartedEnrollment> {
  const { applicationId, variantResolutions, actorUserId } = input;

  const { data: application, error: appError } = await supabase
    .from("applications")
    .select("id, organization_id, program_id, student_id, status, family_id")
    .eq("id", applicationId)
    .maybeSingle();

  if (appError) throw appError;
  if (!application) {
    throw new EnrollmentMaterializationError(
      "Application not found.",
      "not_found",
      404,
    );
  }

  if (application.status !== "accepted") {
    throw new EnrollmentMaterializationError(
      "Only accepted applications can start enrollment.",
      "invalid_status",
      400,
    );
  }

  if (!application.student_id || !application.program_id) {
    throw new EnrollmentMaterializationError(
      "Application is missing student or program information.",
      "incomplete_application",
      400,
    );
  }

  const existing = await getChecklistForApplication(supabase, applicationId);
  if (existing) {
    throw new EnrollmentMaterializationError(
      "Enrollment has already been started for this application.",
      "already_started",
      400,
    );
  }

  const loaded = await getPublishedEnrollmentChecklistForProgram(
    supabase,
    String(application.organization_id),
    String(application.program_id),
  );

  if (!loaded) {
    throw new EnrollmentMaterializationError(
      "No published enrollment checklist is linked to this program.",
      "no_checklist",
      400,
    );
  }

  const { template, items } = loaded;
  const groups = getVariantGroups(items);
  const resolutionErrors = validateResolutionMap(items, variantResolutions);
  if (resolutionErrors.length > 0) {
    throw new EnrollmentMaterializationError(
      resolutionErrors[0],
      "invalid_resolutions",
      400,
    );
  }

  const resolvedAt = new Date().toISOString();
  const variantResolutionRecord = buildVariantResolutions(
    items,
    variantResolutions,
    resolvedAt,
  );

  const metadata: EnrollmentChecklistMetadata = {
    variantResolutions: variantResolutionRecord,
  };

  const { data: enrollment, error: enrollmentError } = await supabase
    .from("enrollments")
    .insert({
      organization_id: application.organization_id,
      student_id: application.student_id,
      program_id: application.program_id,
      status: "pending",
    })
    .select("id")
    .single();

  if (enrollmentError) {
    if (enrollmentError.code === "23505") {
      throw new EnrollmentMaterializationError(
        "This student already has an enrollment for this program.",
        "duplicate_enrollment",
        400,
      );
    }
    throw enrollmentError;
  }

  const enrollmentId = String(enrollment.id);

  const { data: checklist, error: checklistError } = await supabase
    .from("enrollment_checklists")
    .insert({
      organization_id: application.organization_id,
      enrollment_id: enrollmentId,
      application_id: applicationId,
      template_id: template.id,
      status: "in_progress",
      metadata,
    })
    .select("id")
    .single();

  if (checklistError) throw checklistError;

  const checklistId = String(checklist.id);

  const itemRows = items.map((item) => {
    const variant = getItemVariantConfig(item);
    const isSelected = isVariantItemSelected(item, variantResolutionRecord);
    const status: ChecklistItemInstanceStatus = variant && !isSelected ? "waived" : "not_started";
    const paymentStatus = item.type === "payment" && status !== "waived" ? "pending" : "not_required";

    return {
      checklist_id: checklistId,
      organization_id: application.organization_id,
      template_item_id: item.id,
      item_key: item.itemKey,
      status,
      payment_status: paymentStatus,
    };
  });

  const { error: itemsError } = await supabase
    .from("enrollment_checklist_items")
    .insert(itemRows);

  if (itemsError) throw itemsError;

  const { error: statusError } = await supabase
    .from("applications")
    .update({ status: "enrolling" })
    .eq("id", applicationId);

  if (statusError) throw statusError;

  if (application.family_id) {
    await tryAutoAssignTuitionForEnrollment(supabase, {
      organizationId: String(application.organization_id),
      enrollmentId,
      familyId: String(application.family_id),
      programId: String(application.program_id),
      assignedByUserId: actorUserId,
    });
  }

  void logActivityEvent(supabase, {
    organizationId: String(application.organization_id),
    actorType: "school_admin",
    actorUserId,
    surface: "school_admin",
    action: ACTIVITY_ACTIONS.ENROLLMENT_STARTED,
    entityType: "application",
    entityId: applicationId,
    summary: "Enrollment checklist started",
    metadata: {
      checklistId,
      enrollmentId,
      variantResolutions: variantResolutionRecord,
    },
  });

  return { enrollmentId, checklistId, applicationId };
}

export type MarkedEnrollment = {
  enrollmentId: string;
  applicationId: string;
};

function resolveEnrollmentPaymentDetails(
  templateItem: EnrollmentChecklistItem,
): { amountCents: number; label: string } | null {
  if (templateItem.type !== "payment") return null;

  let payment = templateItem.payment;
  if (!payment) {
    const raw = templateItem.metadata.payment;
    if (raw && typeof raw === "object" && !Array.isArray(raw)) {
      const record = raw as Record<string, unknown>;
      const amountCents =
        typeof record.amountCents === "number" ? record.amountCents : 0;
      const label = typeof record.label === "string" ? record.label : templateItem.label;
      if (amountCents > 0) {
        payment = { label, amountCents };
      }
    }
  }

  if (!payment) return null;

  const amountCents = hasPaymentBreakdown(payment)
    ? sumPaymentLineItems(payment.lineItems)
    : payment.amountCents;

  if (amountCents <= 0) return null;

  return {
    amountCents,
    label: payment.label.trim() || templateItem.label,
  };
}

async function directEnrollWithoutChecklist(
  supabase: SupabaseClient,
  input: {
    application: {
      id: string;
      organization_id: string;
      program_id: string;
      student_id: string;
      family_id: string | null;
      status: string;
    };
    actorUserId: string;
    note?: string;
    leaveChecklistIncomplete?: boolean;
  },
): Promise<MarkedEnrollment> {
  const { application, actorUserId, note, leaveChecklistIncomplete } = input;
  const applicationId = String(application.id);
  const studentId = String(application.student_id);
  const programId = String(application.program_id);

  const { data: existingEnrollment, error: existingEnrollmentError } = await supabase
    .from("enrollments")
    .select("id, status")
    .eq("student_id", studentId)
    .eq("program_id", programId)
    .maybeSingle();

  if (existingEnrollmentError) throw existingEnrollmentError;

  let enrollmentId: string;

  if (existingEnrollment) {
    if (existingEnrollment.status === "enrolled") {
      if (application.status !== "accepted" && application.status !== "enrolling") {
        throw new EnrollmentMaterializationError(
          "This student is already enrolled in this program.",
          "already_enrolled",
          400,
        );
      }

      enrollmentId = String(existingEnrollment.id);
    } else {
      enrollmentId = String(existingEnrollment.id);
      const { error: enrollmentUpdateError } = await supabase
        .from("enrollments")
        .update({ status: "enrolled" })
        .eq("id", enrollmentId);

      if (enrollmentUpdateError) throw enrollmentUpdateError;
    }
  } else {
    const { data: enrollment, error: enrollmentError } = await supabase
      .from("enrollments")
      .insert({
        organization_id: application.organization_id,
        student_id: studentId,
        program_id: programId,
        status: "enrolled",
      })
      .select("id")
      .single();

    if (enrollmentError) {
      if (enrollmentError.code === "23505") {
        throw new EnrollmentMaterializationError(
          "This student already has an enrollment for this program.",
          "duplicate_enrollment",
          400,
        );
      }
      throw enrollmentError;
    }

    enrollmentId = String(enrollment.id);
  }

  const { error: studentUpdateError } = await supabase
    .from("students")
    .update({ status: ENROLLED_STUDENT_STATUS })
    .eq("id", studentId);

  if (studentUpdateError) throw studentUpdateError;

  const { data: updatedApplication, error: statusError } = await supabase
    .from("applications")
    .update({ status: "enrolled" })
    .eq("id", applicationId)
    .in("status", ["accepted", "enrolling"])
    .select("id")
    .maybeSingle();

  if (statusError) throw statusError;
  if (!updatedApplication) {
    throw new EnrollmentMaterializationError(
      "Application status changed before enrollment could be completed.",
      "invalid_status",
      400,
    );
  }

  void logActivityEvent(supabase, {
    organizationId: String(application.organization_id),
    actorType: "school_admin",
    actorUserId,
    surface: "school_admin",
    action: ACTIVITY_ACTIONS.ENROLLMENT_COMPLETED,
    entityType: "enrollment",
    entityId: enrollmentId,
    summary: leaveChecklistIncomplete
      ? "Student marked as enrolled (checklist left unchanged)"
      : "Student marked as enrolled (no checklist configured)",
    metadata: {
      applicationId,
      bypassedChecklist: true,
      ...(leaveChecklistIncomplete ? { leaveChecklistIncomplete: true } : {}),
      ...(note ? { note } : {}),
    },
  });

  if (application.family_id) {
    await tryAutoAssignTuitionForEnrollment(supabase, {
      organizationId: String(application.organization_id),
      enrollmentId,
      familyId: String(application.family_id),
      programId,
      assignedByUserId: actorUserId,
    });
  }

  return { enrollmentId, applicationId };
}

export async function adminBypassCompleteEnrollmentChecklist(
  supabase: SupabaseClient,
  input: {
    checklistId: string;
    organizationId: string;
    actorUserId: string;
    note?: string;
  },
): Promise<void> {
  const { checklistId, organizationId, actorUserId, note } = input;
  const bypassedAt = new Date().toISOString();

  const { data: checklist, error: checklistError } = await supabase
    .from("enrollment_checklists")
    .select("id, template_id, application_id")
    .eq("id", checklistId)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (checklistError) throw checklistError;
  if (!checklist) {
    throw new EnrollmentMaterializationError(
      "Enrollment checklist not found.",
      "not_found",
      404,
    );
  }

  const loaded = await getEnrollmentChecklistWithItems(
    supabase,
    String(checklist.template_id),
  );
  if (!loaded) {
    throw new EnrollmentMaterializationError(
      "Enrollment checklist template not found.",
      "not_found",
      404,
    );
  }

  const { data: instanceRows, error: instanceError } = await supabase
    .from("enrollment_checklist_items")
    .select("id, template_item_id, status, payment_status, responses")
    .eq("checklist_id", checklistId)
    .neq("status", "waived");

  if (instanceError) throw instanceError;

  const applicationId = checklist.application_id
    ? String(checklist.application_id)
    : null;

  for (const row of instanceRows ?? []) {
    const templateItem = loaded.items.find(
      (item) => item.id === String(row.template_item_id),
    );
    if (!templateItem) continue;

    if (templateItem.type === "payment") {
      if (row.payment_status !== "paid") {
        const existingResponses =
          row.responses &&
          typeof row.responses === "object" &&
          !Array.isArray(row.responses)
            ? (row.responses as Record<string, unknown>)
            : {};

        const { error: paymentUpdateError } = await supabase
          .from("enrollment_checklist_items")
          .update({
            payment_status: "paid",
            responses: {
              ...existingResponses,
              adminBypass: true,
              bypassedByUserId: actorUserId,
              bypassedAt,
              ...(note ? { note } : {}),
            },
          })
          .eq("id", row.id);

        if (paymentUpdateError) throw paymentUpdateError;
      }

      if (applicationId) {
        const paymentDetails = resolveEnrollmentPaymentDetails(templateItem);
        if (paymentDetails) {
          const payment = await recordAdminBypassEnrollmentPayment(supabase, {
            organizationId,
            applicationId,
            enrollmentChecklistItemId: String(row.id),
            amountCents: paymentDetails.amountCents,
            label: paymentDetails.label,
            actorUserId,
            paidAt: bypassedAt,
          });

          if (payment) {
            void logActivityEvent(supabase, {
              organizationId,
              actorType: "school_admin",
              actorUserId,
              surface: "school_admin",
              action: ACTIVITY_ACTIONS.APPLICATION_PAYMENT_COMPLETED,
              entityType: "enrollment_checklist_item",
              entityId: String(row.id),
              summary: `Enrollment payment recorded ($${(paymentDetails.amountCents / 100).toFixed(2)})`,
              metadata: {
                applicationId,
                paymentId: payment.id,
                amountCents: paymentDetails.amountCents,
                adminBypass: true,
              },
            });
          }
        }
      }
    }

    if (row.status === "completed") continue;

    await completeChecklistItem(supabase, {
      instanceId: String(row.id),
      actorUserId,
      organizationId,
      responses: { adminBypass: true },
    });
  }

  await recomputeChecklistStatus(supabase, checklistId);
}

export async function markApplicationAsEnrolled(
  supabase: SupabaseClient,
  input: {
    applicationId: string;
    actorUserId: string;
    note?: string;
    completeChecklist?: boolean;
  },
): Promise<MarkedEnrollment> {
  const { applicationId, actorUserId, note } = input;
  const completeChecklist = input.completeChecklist !== false;

  const { data: application, error: appError } = await supabase
    .from("applications")
    .select("id, organization_id, program_id, student_id, status, family_id")
    .eq("id", applicationId)
    .maybeSingle();

  if (appError) throw appError;
  if (!application) {
    throw new EnrollmentMaterializationError(
      "Application not found.",
      "not_found",
      404,
    );
  }

  if (application.status === "enrolled") {
    throw new EnrollmentMaterializationError(
      "Application is already enrolled.",
      "already_enrolled",
      400,
    );
  }

  if (application.status !== "accepted" && application.status !== "enrolling") {
    throw new EnrollmentMaterializationError(
      "Only accepted or enrolling applications can be marked as enrolled.",
      "invalid_status",
      400,
    );
  }

  if (!application.student_id || !application.program_id) {
    throw new EnrollmentMaterializationError(
      "Application is missing student or program information.",
      "incomplete_application",
      400,
    );
  }

  const organizationId = String(application.organization_id);
  const programId = String(application.program_id);
  const existingChecklist = await getChecklistForApplication(supabase, applicationId);
  const publishedChecklist = await getPublishedEnrollmentChecklistForProgram(
    supabase,
    organizationId,
    programId,
  );

  if ((publishedChecklist || existingChecklist) && !completeChecklist) {
    return directEnrollWithoutChecklist(supabase, {
      application: {
        id: String(application.id),
        organization_id: String(application.organization_id),
        program_id: programId,
        student_id: String(application.student_id),
        family_id: application.family_id ? String(application.family_id) : null,
        status: String(application.status),
      },
      actorUserId,
      note,
      leaveChecklistIncomplete: Boolean(publishedChecklist || existingChecklist),
    });
  }

  if (publishedChecklist || existingChecklist) {
    let checklistId: string;
    let enrollmentId: string;

    if (!existingChecklist) {
      if (application.status !== "accepted") {
        throw new EnrollmentMaterializationError(
          "Only accepted applications can start enrollment.",
          "invalid_status",
          400,
        );
      }

      if (!publishedChecklist) {
        throw new EnrollmentMaterializationError(
          "No published enrollment checklist is linked to this program.",
          "no_checklist",
          400,
        );
      }

      const defaultResolutions = buildDefaultResolutions(
        getVariantGroups(publishedChecklist.items),
      );
      const started = await startEnrollmentFromApplication(supabase, {
        applicationId,
        variantResolutions: defaultResolutions,
        actorUserId,
      });
      checklistId = started.checklistId;
      enrollmentId = started.enrollmentId;
    } else {
      checklistId = existingChecklist.checklistId;
      enrollmentId = existingChecklist.enrollmentId;
    }

    await adminBypassCompleteEnrollmentChecklist(supabase, {
      checklistId,
      organizationId,
      actorUserId,
      note,
    });

    void logActivityEvent(supabase, {
      organizationId,
      actorType: "school_admin",
      actorUserId,
      surface: "school_admin",
      action: ACTIVITY_ACTIONS.ENROLLMENT_COMPLETED,
      entityType: "enrollment",
      entityId: enrollmentId,
      summary: "Student marked as enrolled (checklist completed by admin)",
      metadata: {
        applicationId,
        checklistId,
        adminBypassCompletedChecklist: true,
        ...(note ? { note } : {}),
      },
    });

    return { enrollmentId, applicationId };
  }

  return directEnrollWithoutChecklist(supabase, {
    application: {
      id: String(application.id),
      organization_id: String(application.organization_id),
      program_id: programId,
      student_id: String(application.student_id),
      family_id: application.family_id ? String(application.family_id) : null,
      status: String(application.status),
    },
    actorUserId,
    note,
  });
}

export type LoadedEnrollmentChecklist = {
  checklistId: string;
  enrollmentId: string;
  applicationId: string;
  templateId: string;
  status: string;
  title: string;
  items: EnrollmentChecklistItem[];
  instances: EnrollmentChecklistItemInstance[];
  metadata: EnrollmentChecklistMetadata;
};

function instanceFromRow(row: Record<string, unknown>): EnrollmentChecklistItemInstance {
  const responses =
    row.responses &&
    typeof row.responses === "object" &&
    !Array.isArray(row.responses)
      ? (row.responses as Record<string, unknown>)
      : {};

  return {
    id: String(row.id),
    checklistId: String(row.checklist_id),
    templateItemId: String(row.template_item_id),
    itemKey: String(row.item_key),
    status: row.status as ChecklistItemInstanceStatus,
    paymentStatus: row.payment_status as EnrollmentChecklistItemInstance["paymentStatus"],
    responses,
  };
}

export async function loadEnrollmentChecklistInstances(
  supabase: SupabaseClient,
  checklistId: string,
): Promise<EnrollmentChecklistItemInstance[]> {
  const { data, error } = await supabase
    .from("enrollment_checklist_items")
    .select("id, checklist_id, template_item_id, item_key, status, payment_status, responses")
    .eq("checklist_id", checklistId)
    .order("created_at", { ascending: true });

  if (error) throw error;

  return (data ?? []).map((row) => instanceFromRow(row as Record<string, unknown>));
}

export function enrollmentPaymentPollSucceeded(
  previous: EnrollmentChecklistItemInstance[],
  next: EnrollmentChecklistItemInstance[],
): boolean {
  const previousById = new Map(previous.map((instance) => [instance.id, instance]));

  for (const instance of next) {
    const prior = previousById.get(instance.id);
    if (!prior) continue;

    if (instance.paymentStatus === "paid" && prior.paymentStatus !== "paid") {
      return true;
    }

    if (
      instance.status === "completed" &&
      prior.status !== "completed" &&
      instance.paymentStatus === "paid"
    ) {
      return true;
    }
  }

  return false;
}

export async function loadEnrollmentChecklistForApplication(
  supabase: SupabaseClient,
  applicationId: string,
  organizationId: string,
): Promise<LoadedEnrollmentChecklist | null> {
  const checklistRow = await getChecklistForApplication(supabase, applicationId);
  if (!checklistRow) return null;

  const loaded = await getEnrollmentChecklistWithItems(
    supabase,
    checklistRow.templateId,
  );
  if (!loaded) return null;

  const { data: instanceRows, error: instanceError } = await supabase
    .from("enrollment_checklist_items")
    .select("*")
    .eq("checklist_id", checklistRow.checklistId)
    .order("created_at", { ascending: true });

  if (instanceError) throw instanceError;

  const instances = (instanceRows ?? []).map((row) =>
    instanceFromRow(row as Record<string, unknown>),
  );

  const resolutions = checklistRow.metadata.variantResolutions ?? {};
  const visibleItems = loaded.items.filter((item) =>
    isVariantItemSelected(item, resolutions),
  );

  const visibleInstances = instances.filter((instance) => {
    const templateItem = loaded.items.find((item) => item.id === instance.templateItemId);
    if (!templateItem) return false;
    return isVariantItemSelected(templateItem, resolutions) && instance.status !== "waived";
  });

  return {
    checklistId: checklistRow.checklistId,
    enrollmentId: checklistRow.enrollmentId,
    applicationId,
    templateId: checklistRow.templateId,
    status: checklistRow.status,
    title: loaded.template.name,
    items: visibleItems,
    instances: visibleInstances,
    metadata: checklistRow.metadata,
  };
}

export async function loadEnrollmentChecklistsForApplications(
  supabase: SupabaseClient,
  applicationIds: string[],
): Promise<Record<string, LoadedEnrollmentChecklist | null>> {
  const uniqueIds = [...new Set(applicationIds.filter(Boolean))];
  const result: Record<string, LoadedEnrollmentChecklist | null> = {};
  if (uniqueIds.length === 0) return result;

  for (const applicationId of uniqueIds) {
    result[applicationId] = null;
  }

  const { data: checklistRows, error } = await supabase
    .from("enrollment_checklists")
    .select("id, enrollment_id, application_id, template_id, status, metadata")
    .in("application_id", uniqueIds);

  if (error) throw error;
  if (!checklistRows?.length) return result;

  const checklistIds = checklistRows.map((row) => String(row.id));
  const templateIds = [...new Set(checklistRows.map((row) => String(row.template_id)))];

  const templateCache = new Map<
    string,
    Awaited<ReturnType<typeof getEnrollmentChecklistWithItems>>
  >();
  for (const templateId of templateIds) {
    const loaded = await getEnrollmentChecklistWithItems(supabase, templateId);
    if (loaded) {
      templateCache.set(templateId, loaded);
    }
  }

  const { data: instanceRows, error: instanceError } = await supabase
    .from("enrollment_checklist_items")
    .select("*")
    .in("checklist_id", checklistIds)
    .order("created_at", { ascending: true });

  if (instanceError) throw instanceError;

  const instancesByChecklist = new Map<string, EnrollmentChecklistItemInstance[]>();
  for (const row of instanceRows ?? []) {
    const checklistId = String(row.checklist_id);
    const existing = instancesByChecklist.get(checklistId) ?? [];
    existing.push(instanceFromRow(row as Record<string, unknown>));
    instancesByChecklist.set(checklistId, existing);
  }

  for (const row of checklistRows) {
    const applicationId = String(row.application_id);
    const templateId = String(row.template_id);
    const loaded = templateCache.get(templateId);
    if (!loaded) continue;

    const checklistRow = {
      checklistId: String(row.id),
      enrollmentId: String(row.enrollment_id),
      templateId,
      status: String(row.status),
      metadata: parseChecklistMetadata(row.metadata),
    };

    const instances = instancesByChecklist.get(checklistRow.checklistId) ?? [];
    const resolutions = checklistRow.metadata.variantResolutions ?? {};
    const visibleItems = loaded.items.filter((item) =>
      isVariantItemSelected(item, resolutions),
    );
    const visibleInstances = instances.filter((instance) => {
      const templateItem = loaded.items.find(
        (item) => item.id === instance.templateItemId,
      );
      if (!templateItem) return false;
      return (
        isVariantItemSelected(templateItem, resolutions) &&
        instance.status !== "waived"
      );
    });

    result[applicationId] = {
      checklistId: checklistRow.checklistId,
      enrollmentId: checklistRow.enrollmentId,
      applicationId,
      templateId,
      status: checklistRow.status,
      title: loaded.template.name,
      items: visibleItems,
      instances: visibleInstances,
      metadata: checklistRow.metadata,
    };
  }

  return result;
}

export function computeChecklistProgress(
  items: EnrollmentChecklistItem[],
  instances: EnrollmentChecklistItemInstance[],
): { completed: number; total: number } {
  const requiredItems = items.filter((item) => item.required);
  const instanceByTemplate = new Map(
    instances.map((instance) => [instance.templateItemId, instance]),
  );

  let completed = 0;
  for (const item of requiredItems) {
    const instance = instanceByTemplate.get(item.id);
    if (instance?.status === "completed") {
      completed += 1;
    }
  }

  return { completed, total: requiredItems.length };
}

export type EnrollmentProgressSummaryTone =
  | "complete"
  | "in_progress"
  | "not_started";

export type EnrollmentPaymentSummary = {
  hasPaymentItems: boolean;
  allPaid: boolean;
  allWaived: boolean;
};

export type EnrollmentProgressSummary = {
  label: string;
  tone: EnrollmentProgressSummaryTone;
  completed: number;
  total: number;
  checklistStatus: string;
  paymentSummary: EnrollmentPaymentSummary | null;
};

export function summarizeEnrollmentPaymentStatus(
  items: EnrollmentChecklistItem[],
  instances: EnrollmentChecklistItemInstance[],
): EnrollmentPaymentSummary {
  const paymentItems = items.filter((item) => item.required && item.type === "payment");
  if (paymentItems.length === 0) {
    return { hasPaymentItems: false, allPaid: false, allWaived: false };
  }

  const instanceByTemplate = new Map(
    instances.map((instance) => [instance.templateItemId, instance]),
  );

  let waivedCount = 0;
  let paidCount = 0;

  for (const item of paymentItems) {
    const instance = instanceByTemplate.get(item.id);
    if (!instance) continue;

    if (instance.status === "waived" || instance.paymentStatus === "waived") {
      waivedCount += 1;
    } else if (
      instance.paymentStatus === "paid" ||
      instance.status === "completed"
    ) {
      paidCount += 1;
    }
  }

  const total = paymentItems.length;

  return {
    hasPaymentItems: true,
    allWaived: waivedCount === total,
    allPaid: paidCount === total,
  };
}

export function summarizeEnrollmentProgress(
  completed: number,
  total: number,
  checklistStatus: string,
  paymentSummary: EnrollmentPaymentSummary | null = null,
): EnrollmentProgressSummary {
  const label = `${completed}/${total} complete`;

  let tone: EnrollmentProgressSummaryTone;
  if (total > 0 && completed === total) {
    tone = "complete";
  } else if (completed > 0) {
    tone = "in_progress";
  } else {
    tone = "not_started";
  }

  return { label, tone, completed, total, checklistStatus, paymentSummary };
}

function filterVisibleChecklistItemsAndInstances(
  templateItems: EnrollmentChecklistItem[],
  instances: EnrollmentChecklistItemInstance[],
  resolutions: Record<string, ChecklistVariantResolution>,
): {
  items: EnrollmentChecklistItem[];
  instances: EnrollmentChecklistItemInstance[];
} {
  const visibleItems = templateItems.filter((item) =>
    isVariantItemSelected(item, resolutions),
  );
  const visibleInstances = instances.filter((instance) => {
    const templateItem = templateItems.find(
      (item) => item.id === instance.templateItemId,
    );
    if (!templateItem) return false;
    return (
      isVariantItemSelected(templateItem, resolutions) &&
      instance.status !== "waived"
    );
  });

  return { items: visibleItems, instances: visibleInstances };
}

export async function listEnrollmentProgressForApplications(
  supabase: SupabaseClient,
  organizationId: string,
  applicationIds: string[],
): Promise<Map<string, EnrollmentProgressSummary>> {
  const result = new Map<string, EnrollmentProgressSummary>();
  if (applicationIds.length === 0) return result;

  const { data: checklistRows, error: checklistError } = await supabase
    .from("enrollment_checklists")
    .select("id, application_id, template_id, status, metadata")
    .eq("organization_id", organizationId)
    .in("application_id", applicationIds);

  if (checklistError) throw checklistError;
  if (!checklistRows || checklistRows.length === 0) return result;

  const checklists = checklistRows.map((row) => ({
    checklistId: String(row.id),
    applicationId: String(row.application_id),
    templateId: String(row.template_id),
    status: String(row.status),
    metadata: parseChecklistMetadata(row.metadata),
  }));

  const checklistIds = checklists.map((checklist) => checklist.checklistId);
  const { data: instanceRows, error: instanceError } = await supabase
    .from("enrollment_checklist_items")
    .select("*")
    .in("checklist_id", checklistIds);

  if (instanceError) throw instanceError;

  const instancesByChecklistId = new Map<
    string,
    EnrollmentChecklistItemInstance[]
  >();
  for (const row of instanceRows ?? []) {
    const checklistId = String(row.checklist_id);
    const existing = instancesByChecklistId.get(checklistId) ?? [];
    existing.push(instanceFromRow(row as Record<string, unknown>));
    instancesByChecklistId.set(checklistId, existing);
  }

  const templateCache = new Map<
    string,
    Awaited<ReturnType<typeof getEnrollmentChecklistWithItems>>
  >();
  const uniqueTemplateIds = [...new Set(checklists.map((checklist) => checklist.templateId))];

  for (const templateId of uniqueTemplateIds) {
    const loaded = await getEnrollmentChecklistWithItems(supabase, templateId);
    templateCache.set(templateId, loaded);
  }

  for (const checklist of checklists) {
    const loaded = templateCache.get(checklist.templateId);
    if (!loaded) {
      result.set(
        checklist.applicationId,
        summarizeEnrollmentProgress(0, 0, checklist.status),
      );
      continue;
    }

    const resolutions = checklist.metadata.variantResolutions ?? {};
    const instances = instancesByChecklistId.get(checklist.checklistId) ?? [];
    const { items: visibleItems, instances: visibleInstances } =
      filterVisibleChecklistItemsAndInstances(
        loaded.items,
        instances,
        resolutions,
      );

    const progress = computeChecklistProgress(visibleItems, visibleInstances);
    const paymentSummary = summarizeEnrollmentPaymentStatus(
      visibleItems,
      visibleInstances,
    );
    result.set(
      checklist.applicationId,
      summarizeEnrollmentProgress(
        progress.completed,
        progress.total,
        checklist.status,
        paymentSummary.hasPaymentItems ? paymentSummary : null,
      ),
    );
  }

  return result;
}

export async function recomputeChecklistStatus(
  supabase: SupabaseClient,
  checklistId: string,
): Promise<NewlyCompletedEnrollment | null> {
  const { data: checklist, error: checklistError } = await supabase
    .from("enrollment_checklists")
    .select("id, template_id, metadata, application_id")
    .eq("id", checklistId)
    .maybeSingle();

  if (checklistError) throw checklistError;
  if (!checklist) return null;

  const loaded = await getEnrollmentChecklistWithItems(
    supabase,
    String(checklist.template_id),
  );
  if (!loaded) return null;

  const metadata = parseChecklistMetadata(checklist.metadata);
  const resolutions = metadata.variantResolutions ?? {};
  const visibleItems = loaded.items.filter((item) =>
    isVariantItemSelected(item, resolutions),
  );

  const { data: instanceRows, error: instanceError } = await supabase
    .from("enrollment_checklist_items")
    .select("template_item_id, status")
    .eq("checklist_id", checklistId)
    .neq("status", "waived");

  if (instanceError) throw instanceError;

  const instances = (instanceRows ?? []).map((row) => ({
    templateItemId: String(row.template_item_id),
    status: String(row.status),
  }));

  const requiredItems = visibleItems.filter((item) => item.required);
  const allComplete = requiredItems.every((item) => {
    const instance = instances.find((row) => row.templateItemId === item.id);
    return instance?.status === "completed";
  });

  const newStatus = allComplete ? "completed" : "in_progress";

  await supabase
    .from("enrollment_checklists")
    .update({ status: newStatus })
    .eq("id", checklistId);

  if (allComplete) {
    return finalizeEnrollmentIfComplete(supabase, checklistId);
  }

  return null;
}

export type EnrollmentAgreementAmendment = {
  applicationId: string;
  checklistItemInstanceId: string;
  templateItemId: string;
  checklistItemLabel: string;
  amendmentNotice: string;
  pendingResignSectionIds: string[];
};

export async function listEnrollmentAgreementAmendmentsForApplications(
  supabase: SupabaseClient,
  organizationId: string,
  applicationIds: string[],
): Promise<Map<string, EnrollmentAgreementAmendment[]>> {
  const result = new Map<string, EnrollmentAgreementAmendment[]>();
  const uniqueIds = [...new Set(applicationIds.filter(Boolean))];
  if (uniqueIds.length === 0) return result;

  for (const applicationId of uniqueIds) {
    result.set(applicationId, []);
  }

  const { data: checklistRows, error: checklistError } = await supabase
    .from("enrollment_checklists")
    .select("id, application_id, template_id")
    .eq("organization_id", organizationId)
    .in("application_id", uniqueIds);

  if (checklistError) throw checklistError;
  if (!checklistRows?.length) return result;

  const checklistIds = checklistRows.map((row) => String(row.id));
  const templateIds = [...new Set(checklistRows.map((row) => String(row.template_id)))];

  const templateLabelByItemId = new Map<string, string>();
  for (const templateId of templateIds) {
    const loaded = await getEnrollmentChecklistWithItems(supabase, templateId);
    if (!loaded) continue;
    for (const item of loaded.items) {
      templateLabelByItemId.set(item.id, item.label);
    }
  }

  const { data: instanceRows, error: instanceError } = await supabase
    .from("enrollment_checklist_items")
    .select("id, checklist_id, template_item_id, responses")
    .eq("organization_id", organizationId)
    .in("checklist_id", checklistIds);

  if (instanceError) throw instanceError;

  const checklistIdToApplicationId = new Map(
    checklistRows.map((row) => [String(row.id), String(row.application_id)]),
  );

  for (const row of instanceRows ?? []) {
    const responses =
      row.responses &&
      typeof row.responses === "object" &&
      !Array.isArray(row.responses)
        ? (row.responses as Record<string, unknown>)
        : {};

    const pendingResignSectionIds = parsePendingResignSectionIds(responses);
    const amendmentNotice = parseAmendmentNotice(responses);
    if (pendingResignSectionIds.length === 0 || !amendmentNotice) continue;

    const applicationId = checklistIdToApplicationId.get(String(row.checklist_id));
    if (!applicationId) continue;

    const templateItemId = String(row.template_item_id);
    const existing = result.get(applicationId) ?? [];
    existing.push({
      applicationId,
      checklistItemInstanceId: String(row.id),
      templateItemId,
      checklistItemLabel:
        templateLabelByItemId.get(templateItemId) ?? "Enrollment agreement",
      amendmentNotice,
      pendingResignSectionIds,
    });
    result.set(applicationId, existing);
  }

  return result;
}

export async function requestEnrollmentAgreementResign(
  supabase: SupabaseClient,
  input: {
    organizationId: string;
    documentTemplateId: string;
    sectionIds: string[];
    message?: string;
  },
): Promise<{ affectedInstanceCount: number }> {
  const { organizationId, documentTemplateId, sectionIds, message } = input;
  const uniqueSectionIds = [...new Set(sectionIds.filter(Boolean))];
  if (uniqueSectionIds.length === 0) {
    throw new EnrollmentMaterializationError(
      "At least one agreement section is required.",
      "invalid_section",
      400,
    );
  }

  const amendmentNotice =
    message?.trim() ||
    "An enrollment agreement section was updated. Please review and re-sign.";

  const { data: templateItems, error: templateItemsError } = await supabase
    .from("enrollment_checklist_template_items")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("document_template_id", documentTemplateId);

  if (templateItemsError) throw templateItemsError;

  const templateItemIds = (templateItems ?? []).map((row) => String(row.id));
  if (templateItemIds.length === 0) {
    return { affectedInstanceCount: 0 };
  }

  const { data: instances, error: instancesError } = await supabase
    .from("enrollment_checklist_items")
    .select("id, checklist_id, responses, status")
    .eq("organization_id", organizationId)
    .in("template_item_id", templateItemIds)
    .eq("status", "completed");

  if (instancesError) throw instancesError;

  let affectedInstanceCount = 0;
  const affectedChecklistIds = new Set<string>();

  for (const instance of instances ?? []) {
    const existingResponses =
      instance.responses &&
      typeof instance.responses === "object" &&
      !Array.isArray(instance.responses)
        ? (instance.responses as Record<string, unknown>)
        : {};

    const existingSignatures = parseAgreementSectionSignatures(existingResponses);
    const filteredSignatures = existingSignatures.filter(
      (signature) => !uniqueSectionIds.includes(signature.sectionId),
    );

    const nextResponses: Record<string, unknown> = {
      ...existingResponses,
      sectionSignatures: filteredSignatures,
      amendmentNotice,
      pendingResignSectionIds: uniqueSectionIds,
    };

    const { error: updateError } = await supabase
      .from("enrollment_checklist_items")
      .update({
        status: "in_progress",
        completed_at: null,
        completed_by_user_id: null,
        responses: nextResponses,
      })
      .eq("id", instance.id);

    if (updateError) throw updateError;

    affectedInstanceCount += 1;
    affectedChecklistIds.add(String(instance.checklist_id));
  }

  for (const checklistId of affectedChecklistIds) {
    await recomputeChecklistStatus(supabase, checklistId);
  }

  return { affectedInstanceCount };
}

async function finalizeEnrollmentIfComplete(
  supabase: SupabaseClient,
  checklistId: string,
): Promise<NewlyCompletedEnrollment | null> {
  const { data: checklist, error: checklistError } = await supabase
    .from("enrollment_checklists")
    .select("id, enrollment_id, application_id, organization_id")
    .eq("id", checklistId)
    .maybeSingle();

  if (checklistError) throw checklistError;
  if (!checklist?.enrollment_id) return null;

  const enrollmentId = String(checklist.enrollment_id);

  const { data: enrollment, error: enrollmentError } = await supabase
    .from("enrollments")
    .select("id, student_id, program_id, status, organization_id")
    .eq("id", enrollmentId)
    .maybeSingle();

  if (enrollmentError) throw enrollmentError;
  if (!enrollment) return null;

  let becameEnrolled = false;

  if (enrollment.status !== "enrolled") {
    const { error: enrollmentUpdateError } = await supabase
      .from("enrollments")
      .update({ status: "enrolled" })
      .eq("id", enrollmentId);

    if (enrollmentUpdateError) throw enrollmentUpdateError;

    becameEnrolled = true;

    if (enrollment.student_id) {
      await supabase
        .from("students")
        .update({ status: ENROLLED_STUDENT_STATUS })
        .eq("id", enrollment.student_id);
    }

    void logActivityEvent(supabase, {
      organizationId: String(checklist.organization_id),
      actorType: "system",
      surface: "system",
      action: ACTIVITY_ACTIONS.ENROLLMENT_COMPLETED,
      entityType: "enrollment",
      entityId: enrollmentId,
      summary: "Enrollment checklist completed",
      metadata: {
        checklistId,
        applicationId: checklist.application_id ?? null,
      },
    });
  }

  if (checklist.application_id) {
    await supabase
      .from("applications")
      .update({ status: "enrolled" })
      .eq("id", checklist.application_id)
      .eq("status", "enrolling");
  }

  if (becameEnrolled && enrollment.student_id) {
    const { data: student, error: studentError } = await supabase
      .from("students")
      .select("family_id")
      .eq("id", enrollment.student_id)
      .maybeSingle();

    if (!studentError && student?.family_id && enrollment.program_id) {
      await tryAutoAssignTuitionForEnrollment(supabase, {
        organizationId: String(enrollment.organization_id),
        enrollmentId,
        familyId: String(student.family_id),
        programId: String(enrollment.program_id),
      });
    }
  }

  if (becameEnrolled && checklist.application_id) {
    return {
      applicationId: String(checklist.application_id),
      enrollmentId,
    };
  }

  return null;
}

export async function completeChecklistPaymentFromWebhook(
  supabase: SupabaseClient,
  input: {
    instanceId: string;
    organizationId: string;
    actorUserId?: string | null;
    checkoutSessionId?: string;
    paymentIntentId?: string;
  },
): Promise<NewlyCompletedEnrollment | null> {
  const { instanceId, organizationId, checkoutSessionId, paymentIntentId } = input;

  const { data: instance, error: instanceError } = await supabase
    .from("enrollment_checklist_items")
    .select("id, checklist_id, status, payment_status, responses")
    .eq("id", instanceId)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (instanceError) throw instanceError;
  if (!instance) {
    throw new EnrollmentMaterializationError(
      "Checklist item not found.",
      "not_found",
      404,
    );
  }

  if (instance.payment_status === "paid" && instance.status === "completed") {
    return null;
  }

  const existingResponses =
    instance.responses &&
    typeof instance.responses === "object" &&
    !Array.isArray(instance.responses)
      ? (instance.responses as Record<string, unknown>)
      : {};

  const { error: paymentUpdateError } = await supabase
    .from("enrollment_checklist_items")
    .update({
      payment_status: "paid",
      responses: {
        ...existingResponses,
        checkoutSessionId: checkoutSessionId ?? existingResponses.checkoutSessionId,
        paymentIntentId: paymentIntentId ?? existingResponses.paymentIntentId,
      },
    })
    .eq("id", instanceId);

  if (paymentUpdateError) throw paymentUpdateError;

  return completeChecklistItem(supabase, {
    instanceId,
    actorUserId: input.actorUserId ?? undefined,
    organizationId,
  });
}

function parseInlineAgreementSections(content: unknown): EnrollmentContractSection[] {
  if (!content || typeof content !== "object" || Array.isArray(content)) {
    return [];
  }
  const record = content as Record<string, unknown>;
  if (!Array.isArray(record.sections)) return [];

  return record.sections
    .filter(
      (section): section is Record<string, unknown> =>
        typeof section === "object" && section !== null && !Array.isArray(section),
    )
    .map((section) => ({
      id: String(section.id ?? ""),
      title: String(section.title ?? ""),
      body: String(section.body ?? ""),
    }))
    .filter((section) => section.id.length > 0);
}

function parseInlineDocumentConsentOptions(
  content: unknown,
): { value: string; label: string }[] {
  if (!content || typeof content !== "object" || Array.isArray(content)) {
    return [];
  }
  const record = content as Record<string, unknown>;
  if (!Array.isArray(record.consentOptions)) return [];

  return record.consentOptions
    .filter(
      (option): option is Record<string, unknown> =>
        typeof option === "object" && option !== null && !Array.isArray(option),
    )
    .map((option) => ({
      value: String(option.value ?? ""),
      label: String(option.label ?? ""),
    }))
    .filter((option) => option.value && option.label);
}

export async function saveAgreementSectionSignature(
  supabase: SupabaseClient,
  input: {
    instanceId: string;
    sectionId: string;
    signerName: string;
    consentValue?: string;
    actorUserId?: string;
    organizationId: string;
  },
): Promise<{
  status: ChecklistItemInstanceStatus;
  responses: Record<string, unknown>;
  newlyCompletedEnrollment: NewlyCompletedEnrollment | null;
}> {
  const { instanceId, sectionId, signerName, consentValue, actorUserId, organizationId } =
    input;
  const trimmedSignerName = signerName.trim();
  if (!trimmedSignerName) {
    throw new EnrollmentMaterializationError(
      "Signature is required.",
      "signature_required",
      400,
    );
  }

  const { data: instance, error: instanceError } = await supabase
    .from("enrollment_checklist_items")
    .select(
      `
      id,
      checklist_id,
      template_item_id,
      status,
      responses,
      organization_id,
      enrollment_checklists!inner (
        application_id,
        template_id,
        metadata
      )
    `,
    )
    .eq("id", instanceId)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (instanceError) throw instanceError;
  if (!instance) {
    throw new EnrollmentMaterializationError(
      "Checklist item not found.",
      "not_found",
      404,
    );
  }

  if (instance.status === "waived") {
    throw new EnrollmentMaterializationError(
      "This checklist item does not apply.",
      "waived",
      400,
    );
  }

  const existingResponses =
    instance.responses &&
    typeof instance.responses === "object" &&
    !Array.isArray(instance.responses)
      ? (instance.responses as Record<string, unknown>)
      : {};

  const pendingResignSectionIds = parsePendingResignSectionIds(existingResponses);
  const isResigningSection = pendingResignSectionIds.includes(sectionId);

  if (instance.status === "completed" && !isResigningSection) {
    throw new EnrollmentMaterializationError(
      "This agreement has already been completed.",
      "already_completed",
      400,
    );
  }

  const { data: templateItem, error: templateItemError } = await supabase
    .from("enrollment_checklist_template_items")
    .select(
      `
      type,
      document_templates (
        kind,
        content,
        content_revision
      )
    `,
    )
    .eq("id", instance.template_item_id)
    .maybeSingle();

  if (templateItemError) throw templateItemError;
  if (!templateItem || templateItem.type !== "document_sign") {
    throw new EnrollmentMaterializationError(
      "This checklist item does not support agreement sections.",
      "invalid_item_type",
      400,
    );
  }

  const documentTemplate = templateItem.document_templates as
    | { kind?: string; content?: unknown; content_revision?: number }
    | { kind?: string; content?: unknown; content_revision?: number }[]
    | null;
  const documentRow = Array.isArray(documentTemplate)
    ? documentTemplate[0]
    : documentTemplate;

  if (!documentRow || documentRow.kind !== "inline_sections") {
    throw new EnrollmentMaterializationError(
      "This checklist item does not support agreement sections.",
      "invalid_item_type",
      400,
    );
  }

  const sections = parseInlineAgreementSections(documentRow.content);
  if (sections.length === 0) {
    throw new EnrollmentMaterializationError(
      "No agreement sections are configured.",
      "no_sections",
      400,
    );
  }

  if (!sections.some((section) => section.id === sectionId)) {
    throw new EnrollmentMaterializationError(
      "Agreement section not found.",
      "invalid_section",
      400,
    );
  }

  const consentOptions = parseInlineDocumentConsentOptions(documentRow.content);
  const trimmedConsentValue = consentValue?.trim() ?? "";

  const checklist = instance.enrollment_checklists as
    | {
        application_id?: string;
        template_id?: string;
        metadata?: unknown;
      }
    | {
        application_id?: string;
        template_id?: string;
        metadata?: unknown;
      }[]
    | null;
  const checklistRow = Array.isArray(checklist) ? checklist[0] : checklist;
  const checklistId = String(instance.checklist_id);

  const existingSignatures = parseAgreementSectionSignatures(existingResponses);
  const sectionSignatures = mergeAgreementSectionSignature(
    existingSignatures,
    sectionId,
    trimmedSignerName,
  );
  const isComplete = allAgreementSectionsSigned(sections, sectionSignatures);
  const nextPendingResignSectionIds = isComplete
    ? []
    : pendingResignSectionIds.filter((id) => id !== sectionId);
  const signedContentRevision =
    typeof documentRow.content_revision === "number"
      ? documentRow.content_revision
      : null;

  if (isComplete && consentOptions.length > 0) {
    if (
      !trimmedConsentValue ||
      !consentOptions.some((option) => option.value === trimmedConsentValue)
    ) {
      throw new EnrollmentMaterializationError(
        "Please select a permission option before completing this agreement.",
        "consent_required",
        400,
      );
    }
  }

  const responsesPatch = buildAgreementResponsesPatch(
    existingResponses,
    sectionSignatures,
    isComplete ? trimmedSignerName : undefined,
    isComplete && trimmedConsentValue ? trimmedConsentValue : undefined,
    {
      clearAmendment: isComplete,
      signedContentRevision:
        isComplete && signedContentRevision != null ? signedContentRevision : undefined,
    },
  );

  if (nextPendingResignSectionIds.length > 0) {
    responsesPatch.pendingResignSectionIds = nextPendingResignSectionIds;
    const existingNotice = parseAmendmentNotice(existingResponses);
    if (existingNotice) {
      responsesPatch.amendmentNotice = existingNotice;
    }
  }

  const patch: Record<string, unknown> = {
    status: isComplete ? "completed" : "in_progress",
    responses: responsesPatch,
  };

  if (isComplete) {
    patch.completed_at = new Date().toISOString();
    if (actorUserId) {
      patch.completed_by_user_id = actorUserId;
    }
  } else {
    patch.completed_at = null;
    patch.completed_by_user_id = null;
  }

  const { error: updateError } = await supabase
    .from("enrollment_checklist_items")
    .update(patch)
    .eq("id", instanceId);

  if (updateError) throw updateError;

  const newlyCompletedEnrollment = await recomputeChecklistStatus(supabase, checklistId);

  if (isComplete) {
    void logActivityEvent(supabase, {
      organizationId,
      actorType: "parent",
      actorUserId,
      actorName: trimmedSignerName,
      surface: "parent_portal",
      action: ACTIVITY_ACTIONS.ENROLLMENT_CHECKLIST_ITEM_COMPLETED,
      entityType: "enrollment_checklist_item",
      entityId: instanceId,
      summary: "Completed an enrollment checklist item",
      metadata: {
        checklistId,
        applicationId: checklistRow?.application_id ?? null,
        templateItemId: instance.template_item_id,
      },
    });
  }

  return {
    status: isComplete ? "completed" : "in_progress",
    responses: patch.responses as Record<string, unknown>,
    newlyCompletedEnrollment,
  };
}

export async function saveChecklistItemDraft(
  supabase: SupabaseClient,
  input: {
    instanceId: string;
    responses: Record<string, unknown>;
    organizationId: string;
  },
): Promise<{ status: string; responses: Record<string, unknown> }> {
  const { instanceId, responses, organizationId } = input;

  const { data: instance, error: instanceError } = await supabase
    .from("enrollment_checklist_items")
    .select("id, checklist_id, template_item_id, status, responses, organization_id")
    .eq("id", instanceId)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (instanceError) throw instanceError;
  if (!instance) {
    throw new EnrollmentMaterializationError(
      "Checklist item not found.",
      "not_found",
      404,
    );
  }

  if (instance.status === "waived") {
    throw new EnrollmentMaterializationError(
      "This checklist item does not apply.",
      "waived",
      400,
    );
  }

  if (instance.status === "completed") {
    throw new EnrollmentMaterializationError(
      "Completed checklist items cannot be saved as drafts.",
      "already_completed",
      400,
    );
  }

  const { data: templateItem, error: templateItemError } = await supabase
    .from("enrollment_checklist_template_items")
    .select("type")
    .eq("id", instance.template_item_id)
    .maybeSingle();

  if (templateItemError) throw templateItemError;

  if (templateItem?.type !== "form") {
    throw new EnrollmentMaterializationError(
      "Only form checklist items support draft saves.",
      "invalid_item_type",
      400,
    );
  }

  const existingResponses =
    instance.responses &&
    typeof instance.responses === "object" &&
    !Array.isArray(instance.responses)
      ? (instance.responses as Record<string, unknown>)
      : {};

  const nextResponses = {
    ...existingResponses,
    ...responses,
  };

  const checklistId = String(instance.checklist_id);

  const { error: updateError } = await supabase
    .from("enrollment_checklist_items")
    .update({
      status: "in_progress",
      responses: nextResponses,
      completed_at: null,
      completed_by_user_id: null,
    })
    .eq("id", instanceId);

  if (updateError) throw updateError;

  await recomputeChecklistStatus(supabase, checklistId);

  return {
    status: "in_progress",
    responses: nextResponses,
  };
}

export async function saveEnrollmentChecklistActiveItem(
  supabase: SupabaseClient,
  input: {
    checklistId: string;
    templateItemId: string;
    organizationId: string;
  },
): Promise<void> {
  const { checklistId, templateItemId, organizationId } = input;

  const { data: checklist, error: checklistError } = await supabase
    .from("enrollment_checklists")
    .select("id, metadata")
    .eq("id", checklistId)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (checklistError) throw checklistError;
  if (!checklist) {
    throw new EnrollmentMaterializationError(
      "Enrollment checklist not found.",
      "not_found",
      404,
    );
  }

  const metadata = parseChecklistMetadata(checklist.metadata);
  const nextMetadata = {
    ...metadata,
    lastActiveTemplateItemId: templateItemId,
  };

  const { error: updateError } = await supabase
    .from("enrollment_checklists")
    .update({ metadata: nextMetadata })
    .eq("id", checklistId);

  if (updateError) throw updateError;
}

export async function completeChecklistItem(
  supabase: SupabaseClient,
  input: {
    instanceId: string;
    responses?: Record<string, unknown>;
    signerName?: string;
    actorUserId?: string;
    organizationId: string;
  },
): Promise<NewlyCompletedEnrollment | null> {
  const { instanceId, responses, signerName, actorUserId, organizationId } = input;

  const { data: instance, error: instanceError } = await supabase
    .from("enrollment_checklist_items")
    .select(
      `
      id,
      checklist_id,
      template_item_id,
      status,
      payment_status,
      responses,
      organization_id,
      enrollment_checklists!inner (
        application_id,
        template_id,
        metadata
      )
    `,
    )
    .eq("id", instanceId)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (instanceError) throw instanceError;
  if (!instance) {
    throw new EnrollmentMaterializationError(
      "Checklist item not found.",
      "not_found",
      404,
    );
  }

  if (instance.status === "waived") {
    throw new EnrollmentMaterializationError(
      "This checklist item does not apply.",
      "waived",
      400,
    );
  }

  const checklist = instance.enrollment_checklists as
    | {
        application_id?: string;
        template_id?: string;
        metadata?: unknown;
      }
    | {
        application_id?: string;
        template_id?: string;
        metadata?: unknown;
      }[]
    | null;

  const checklistRow = Array.isArray(checklist) ? checklist[0] : checklist;
  const checklistId = String(instance.checklist_id);
  const templateId = checklistRow?.template_id
    ? String(checklistRow.template_id)
    : null;

  if (templateId) {
    const { data: templateItem, error: templateItemError } = await supabase
      .from("enrollment_checklist_template_items")
      .select("type")
      .eq("id", instance.template_item_id)
      .maybeSingle();

    if (templateItemError) throw templateItemError;

    if (templateItem?.type === "payment" && instance.payment_status !== "paid") {
      throw new EnrollmentMaterializationError(
        "Payment must be completed before marking this item done.",
        "payment_required",
        400,
      );
    }
  }

  const existingResponses =
    instance.responses &&
    typeof instance.responses === "object" &&
    !Array.isArray(instance.responses)
      ? (instance.responses as Record<string, unknown>)
      : {};

  const patch: Record<string, unknown> = {
    status: "completed",
    completed_at: new Date().toISOString(),
  };

  if (actorUserId) {
    patch.completed_by_user_id = actorUserId;
  }

  if (responses || signerName) {
    patch.responses = {
      ...existingResponses,
      ...(responses ?? {}),
      ...(signerName ? { signerName } : {}),
    };
  }

  const { error: updateError } = await supabase
    .from("enrollment_checklist_items")
    .update(patch)
    .eq("id", instanceId);

  if (updateError) throw updateError;

  void logActivityEvent(supabase, {
    organizationId,
    actorType: "parent",
    actorUserId,
    actorName: signerName?.trim() || undefined,
    surface: "parent_portal",
    action: ACTIVITY_ACTIONS.ENROLLMENT_CHECKLIST_ITEM_COMPLETED,
    entityType: "enrollment_checklist_item",
    entityId: instanceId,
    summary: "Completed an enrollment checklist item",
    metadata: {
      checklistId,
      applicationId: checklistRow?.application_id ?? null,
      templateItemId: instance.template_item_id,
    },
  });

  return recomputeChecklistStatus(supabase, checklistId);
}

export async function getStartEnrollmentPreview(
  supabase: SupabaseClient,
  applicationId: string,
  organizationId: string,
): Promise<{
  groups: ReturnType<typeof getVariantGroups>;
  sharedItems: EnrollmentChecklistItem[];
  templateName: string;
} | null> {
  const { data: application, error } = await supabase
    .from("applications")
    .select("program_id, status")
    .eq("id", applicationId)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (error) throw error;
  if (!application?.program_id) return null;

  const loaded = await getPublishedEnrollmentChecklistForProgram(
    supabase,
    organizationId,
    String(application.program_id),
  );
  if (!loaded) return null;

  const groups = getVariantGroups(loaded.items);
  const sharedItems = loaded.items.filter((item) => !getItemVariantConfig(item));

  return {
    groups,
    sharedItems,
    templateName: loaded.template.name,
  };
}
