import type { SupabaseClient } from "@supabase/supabase-js";
import {
  schemaToDbJson,
  type ApplicationFormFeeConfig,
  type ApplicationFormNotificationConfig,
  type ApplicationFormPostSubmitConfig,
  type ApplicationFormSchema,
  type ApplicationFormVersion,
} from "./application-form-schema";

export type ApplicationFormChangeSummary = {
  changedFields: string[];
  changes: string[];
};

function formatFeeAmount(cents: number | undefined): string {
  const value = (cents ?? 0) / 100;
  return `$${value.toFixed(2)}`;
}

function stableJson(value: unknown): string {
  return JSON.stringify(value);
}

function summarizeSchemaChanges(
  before: ApplicationFormSchema,
  after: ApplicationFormSchema,
): string[] {
  const changes: string[] = [];
  const beforeSections = new Map(before.sections.map((section) => [section.id, section]));
  const afterSections = new Map(after.sections.map((section) => [section.id, section]));

  for (const [id, section] of afterSections) {
    if (!beforeSections.has(id)) {
      changes.push(`Added section “${section.title}”`);
    }
  }

  for (const [id, section] of beforeSections) {
    if (!afterSections.has(id)) {
      changes.push(`Removed section “${section.title}”`);
    }
  }

  for (const [id, afterSection] of afterSections) {
    const beforeSection = beforeSections.get(id);
    if (!beforeSection) continue;

    if (beforeSection.title !== afterSection.title) {
      changes.push(
        `Renamed section “${beforeSection.title}” to “${afterSection.title}”`,
      );
    }

    const beforeFields = new Map(
      beforeSection.fields.map((field) => [field.id, field]),
    );
    const afterFields = new Map(
      afterSection.fields.map((field) => [field.id, field]),
    );

    for (const [fieldId, field] of afterFields) {
      if (!beforeFields.has(fieldId)) {
        changes.push(`Added field “${field.label}” in “${afterSection.title}”`);
      }
    }

    for (const [fieldId, field] of beforeFields) {
      if (!afterFields.has(fieldId)) {
        changes.push(
          `Removed field “${field.label}” from “${afterSection.title}”`,
        );
      }
    }

    for (const [fieldId, afterField] of afterFields) {
      const beforeField = beforeFields.get(fieldId);
      if (!beforeField) continue;

      const fieldChanges: string[] = [];
      if (beforeField.label !== afterField.label) {
        fieldChanges.push("label");
      }
      if (beforeField.type !== afterField.type) {
        fieldChanges.push("type");
      }
      if (Boolean(beforeField.required) !== Boolean(afterField.required)) {
        fieldChanges.push("required");
      }
      if (stableJson(beforeField.options) !== stableJson(afterField.options)) {
        fieldChanges.push("options");
      }
      if (beforeField.helpText !== afterField.helpText) {
        fieldChanges.push("help text");
      }

      if (fieldChanges.length > 0) {
        changes.push(
          `Updated field “${afterField.label}” in “${afterSection.title}” (${fieldChanges.join(", ")})`,
        );
      }
    }
  }

  const beforeAcks = new Map(
    before.acknowledgments.map((ack) => [ack.id, ack.label]),
  );
  const afterAcks = new Map(
    after.acknowledgments.map((ack) => [ack.id, ack.label]),
  );

  for (const [id, label] of afterAcks) {
    if (!beforeAcks.has(id)) {
      changes.push(`Added acknowledgment “${label}”`);
    }
  }

  for (const [id, label] of beforeAcks) {
    if (!afterAcks.has(id)) {
      changes.push(`Removed acknowledgment “${label}”`);
    }
  }

  for (const [id, afterLabel] of afterAcks) {
    const beforeLabel = beforeAcks.get(id);
    if (beforeLabel && beforeLabel !== afterLabel) {
      changes.push(`Updated acknowledgment “${afterLabel}”`);
    }
  }

  return changes;
}

function summarizeFeeConfigChanges(
  before: ApplicationFormFeeConfig,
  after: ApplicationFormFeeConfig,
): string[] {
  const changes: string[] = [];

  if (before.enabled !== after.enabled) {
    changes.push(
      after.enabled ? "Enabled application fee" : "Disabled application fee",
    );
  }

  if (before.amount_cents !== after.amount_cents) {
    changes.push(
      `Application fee changed from ${formatFeeAmount(before.amount_cents)} to ${formatFeeAmount(after.amount_cents)}`,
    );
  }

  if ((before.label ?? "Application fee") !== (after.label ?? "Application fee")) {
    changes.push("Updated application fee label");
  }

  if (before.required_to_submit !== after.required_to_submit) {
    changes.push(
      after.required_to_submit
        ? "Application fee is now required to submit"
        : "Application fee is no longer required to submit",
    );
  }

  return changes;
}

function summarizeNotificationConfigChanges(
  before: ApplicationFormNotificationConfig,
  after: ApplicationFormNotificationConfig,
): string[] {
  if (
    stableJson(before.submission_notify_emails) ===
    stableJson(after.submission_notify_emails)
  ) {
    return [];
  }
  return ["Updated submission notification emails"];
}

function summarizePostSubmitConfigChanges(
  before: ApplicationFormPostSubmitConfig,
  after: ApplicationFormPostSubmitConfig,
): string[] {
  const changes: string[] = [];
  const beforeActions = new Map(before.actions.map((action) => [action.id, action]));
  const afterActions = new Map(after.actions.map((action) => [action.id, action]));

  for (const [id, action] of afterActions) {
    if (!beforeActions.has(id)) {
      changes.push(`Added post-submit step “${action.title ?? action.type}”`);
    }
  }

  for (const [id, action] of beforeActions) {
    if (!afterActions.has(id)) {
      changes.push(`Removed post-submit step “${action.title ?? action.type}”`);
    }
  }

  for (const [id, afterAction] of afterActions) {
    const beforeAction = beforeActions.get(id);
    if (!beforeAction) continue;

    if (stableJson(beforeAction) !== stableJson(afterAction)) {
      changes.push(
        `Updated post-submit step “${afterAction.title ?? afterAction.type}”`,
      );
    }
  }

  return changes;
}

export function summarizeApplicationFormChanges(
  before: ApplicationFormVersion,
  after: ApplicationFormVersion,
): ApplicationFormChangeSummary {
  const changedFields: string[] = [];
  const changes: string[] = [];

  if (before.title !== after.title) {
    changedFields.push("title");
    changes.push(`Title changed from “${before.title}” to “${after.title}”`);
  }

  if ((before.intro ?? "") !== (after.intro ?? "")) {
    changedFields.push("intro");
    changes.push("Updated form introduction");
  }

  if (before.program_id !== after.program_id) {
    changedFields.push("program_id");
    changes.push("Updated linked program");
  }

  if ((before.public_slug ?? "") !== (after.public_slug ?? "")) {
    changedFields.push("public_slug");
    changes.push(
      `Public URL slug changed from “${before.public_slug ?? "(none)"}” to “${after.public_slug ?? "(none)"}”`,
    );
  }

  const schemaChanges = summarizeSchemaChanges(before.schema, after.schema);
  if (schemaChanges.length > 0) {
    changedFields.push("schema");
    changes.push(...schemaChanges);
  }

  const feeChanges = summarizeFeeConfigChanges(before.fee_config, after.fee_config);
  if (feeChanges.length > 0) {
    changedFields.push("fee_config");
    changes.push(...feeChanges);
  }

  const notificationChanges = summarizeNotificationConfigChanges(
    before.notification_config,
    after.notification_config,
  );
  if (notificationChanges.length > 0) {
    changedFields.push("notification_config");
    changes.push(...notificationChanges);
  }

  const postSubmitChanges = summarizePostSubmitConfigChanges(
    before.post_submit_config,
    after.post_submit_config,
  );
  if (postSubmitChanges.length > 0) {
    changedFields.push("post_submit_config");
    changes.push(...postSubmitChanges);
  }

  return { changedFields, changes };
}

async function nextRevisionNumber(
  supabase: SupabaseClient,
  formVersionId: string,
): Promise<number> {
  const { data, error } = await supabase
    .from("application_form_version_revisions")
    .select("revision_number")
    .eq("form_version_id", formVersionId)
    .order("revision_number", { ascending: false })
    .limit(1);

  if (error) throw error;
  return (data?.[0]?.revision_number ?? 0) + 1;
}

export type ApplicationFormRevisionRow = {
  id: string;
  form_version_id: string;
  organization_id: string;
  activity_event_id: string | null;
  revision_number: number;
  changed_fields: string[];
  change_summary: string[];
  created_at: string;
};

export async function insertApplicationFormRevision(
  supabase: SupabaseClient,
  input: {
    form: ApplicationFormVersion;
    changeSummary: ApplicationFormChangeSummary;
    activityEventId: string | null;
    createdByUserId?: string | null;
  },
): Promise<string> {
  const revisionNumber = await nextRevisionNumber(supabase, input.form.id);

  const { data, error } = await supabase
    .from("application_form_version_revisions")
    .insert({
      form_version_id: input.form.id,
      organization_id: input.form.organization_id,
      activity_event_id: input.activityEventId,
      revision_number: revisionNumber,
      title: input.form.title,
      intro: input.form.intro,
      program_id: input.form.program_id,
      public_slug: input.form.public_slug,
      status: input.form.status,
      schema: schemaToDbJson(input.form.schema),
      fee_config: input.form.fee_config,
      post_submit_config: input.form.post_submit_config,
      notification_config: input.form.notification_config,
      changed_fields: input.changeSummary.changedFields,
      change_summary: input.changeSummary.changes,
      created_by_user_id: input.createdByUserId ?? null,
    })
    .select("id")
    .single();

  if (error) throw error;
  return String(data.id);
}

export async function getApplicationFormRevisionByActivityEventId(
  supabase: SupabaseClient,
  activityEventId: string,
): Promise<ApplicationFormRevisionRow | null> {
  const { data, error } = await supabase
    .from("application_form_version_revisions")
    .select(
      "id, form_version_id, organization_id, activity_event_id, revision_number, changed_fields, change_summary, created_at",
    )
    .eq("activity_event_id", activityEventId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    id: String(data.id),
    form_version_id: String(data.form_version_id),
    organization_id: String(data.organization_id),
    activity_event_id:
      data.activity_event_id === null ? null : String(data.activity_event_id),
    revision_number: Number(data.revision_number),
    changed_fields: Array.isArray(data.changed_fields)
      ? data.changed_fields.map(String)
      : [],
    change_summary: Array.isArray(data.change_summary)
      ? data.change_summary.map(String)
      : [],
    created_at: String(data.created_at),
  };
}
