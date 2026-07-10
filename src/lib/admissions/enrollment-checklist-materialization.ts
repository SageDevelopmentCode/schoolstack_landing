import type { SupabaseClient } from "@supabase/supabase-js";
import {
  ACTIVITY_ACTIONS,
  logActivityEvent,
} from "@/lib/activity-log";
import { getEnrollmentChecklistWithItems } from "./enrollment-checklist-items";
import type {
  ChecklistItemInstanceStatus,
  EnrollmentChecklistItem,
  EnrollmentChecklistItemInstance,
  EnrollmentChecklistMetadata,
} from "./enrollment-checklist-schema";
import { getItemVariantConfig } from "./enrollment-checklist-schema";
import { getPublishedEnrollmentChecklistForProgram } from "./enrollment-checklist-templates";
import {
  buildVariantResolutions,
  getVariantGroups,
  isVariantItemSelected,
  type VariantResolutionMap,
  validateResolutionMap,
} from "./enrollment-checklist-variants";

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
  const variantResolutions = record.variantResolutions;
  if (
    !variantResolutions ||
    typeof variantResolutions !== "object" ||
    Array.isArray(variantResolutions)
  ) {
    return {};
  }
  return { variantResolutions: variantResolutions as EnrollmentChecklistMetadata["variantResolutions"] };
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

export async function recomputeChecklistStatus(
  supabase: SupabaseClient,
  checklistId: string,
): Promise<void> {
  const { data: checklist, error: checklistError } = await supabase
    .from("enrollment_checklists")
    .select("id, template_id, metadata, application_id")
    .eq("id", checklistId)
    .maybeSingle();

  if (checklistError) throw checklistError;
  if (!checklist) return;

  const loaded = await getEnrollmentChecklistWithItems(
    supabase,
    String(checklist.template_id),
  );
  if (!loaded) return;

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
    await finalizeEnrollmentIfComplete(supabase, checklistId);
  }
}

async function finalizeEnrollmentIfComplete(
  supabase: SupabaseClient,
  checklistId: string,
): Promise<void> {
  const { data: checklist, error: checklistError } = await supabase
    .from("enrollment_checklists")
    .select("id, enrollment_id, application_id, organization_id")
    .eq("id", checklistId)
    .maybeSingle();

  if (checklistError) throw checklistError;
  if (!checklist?.enrollment_id) return;

  const enrollmentId = String(checklist.enrollment_id);

  const { data: enrollment, error: enrollmentError } = await supabase
    .from("enrollments")
    .select("id, student_id, status")
    .eq("id", enrollmentId)
    .maybeSingle();

  if (enrollmentError) throw enrollmentError;
  if (!enrollment || enrollment.status === "enrolled") return;

  const { error: enrollmentUpdateError } = await supabase
    .from("enrollments")
    .update({ status: "enrolled" })
    .eq("id", enrollmentId);

  if (enrollmentUpdateError) throw enrollmentUpdateError;

  if (enrollment.student_id) {
    await supabase
      .from("students")
      .update({ status: "enrolled" })
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

export async function completeChecklistPaymentFromWebhook(
  supabase: SupabaseClient,
  input: {
    instanceId: string;
    organizationId: string;
    actorUserId?: string | null;
    checkoutSessionId?: string;
    paymentIntentId?: string;
  },
): Promise<void> {
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
    return;
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

  await completeChecklistItem(supabase, {
    instanceId,
    actorUserId: input.actorUserId ?? undefined,
    organizationId,
  });
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
): Promise<void> {
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

  await recomputeChecklistStatus(supabase, checklistId);

  void logActivityEvent(supabase, {
    organizationId,
    actorType: "parent",
    actorUserId,
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
