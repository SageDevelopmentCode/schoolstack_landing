import {
  validateApplicationFormNotificationConfig,
  validateApplicationFormSchema,
  validatePublicSlug,
} from "@/lib/admissions/application-form-schema";
import { validateApplySystemSchema } from "@/lib/admissions/apply-system-fields";
import type {
  ChecklistEditableSnapshot,
  EditableFormSnapshot,
} from "@/lib/admissions/editable-snapshots";
import { validateEnrollmentChecklistItems } from "@/lib/admissions/enrollment-checklist-items";
import type { BuilderFocus } from "../builder-focus";

/*
 * "Ready to publish?" for the Enrollment Flows builders. Built ONLY from the
 * checks the publish handlers already run (handlePublish /
 * handleChecklistPublish in ApplicationFormsPage), surfaced before the admin
 * clicks Publish. No new rules live here.
 */

export type ReadinessStatus = "done" | "todo" | "warning";

export type ReadinessItem = {
  id: string;
  status: ReadinessStatus;
  label: string;
  detail?: string;
  /** Where clicking the row takes the admin (apply form builder). */
  target?: BuilderFocus;
  /** Checklist item to select (checklist builder). */
  checklistItemId?: string;
  /** Section the issue belongs to (outline warning dots). */
  stepId?: string;
};

export type FlowReadiness = {
  items: ReadinessItem[];
  /** Items that stop Publish today. */
  blocking: number;
  ready: boolean;
  summary: string;
};

function quotedLabel(message: string): string | null {
  const match = /"([^"]+)"/.exec(message);
  return match ? match[1] : null;
}

function finish(items: ReadinessItem[], summary: string): FlowReadiness {
  const blocking = items.filter((item) => item.status === "todo").length;
  return { items, blocking, ready: blocking === 0, summary };
}

/** Apply / custom form readiness (mirrors handlePublish's checks, in order). */
export function applyFormReadiness(
  editable: EditableFormSnapshot,
  options: { isApplyForm: boolean; stripePaymentsReady: boolean },
): FlowReadiness {
  const { schema } = editable;
  const items: ReadinessItem[] = [];

  // 1. Basics the admin sets on Form settings.
  items.push({
    id: "title",
    status: editable.title.trim() ? "done" : "warning",
    label: editable.title.trim() ? "Form title set" : "Add a form title",
    detail: editable.title.trim() ? undefined : "Families see it as the page heading.",
    target: { kind: "setup" },
  });

  items.push({
    id: "program",
    status: editable.programId ? "done" : "todo",
    label: editable.programId ? "Program chosen" : "Choose a program",
    detail: editable.programId ? undefined : "Each submission is tied to one program.",
    target: { kind: "setup" },
  });

  const slugError = validatePublicSlug(editable.publicSlug);
  items.push({
    id: "slug",
    status: slugError ? "todo" : "done",
    label: slugError ? "Fix the apply link" : "Apply link set",
    detail: slugError ?? "Availability is checked when you publish.",
    target: { kind: "setup" },
  });

  // 2. Steps and questions (same validators as publish).
  const schemaErrors = [
    ...validateApplicationFormSchema(schema),
    ...(options.isApplyForm ? validateApplySystemSchema(schema) : []),
  ];
  const seen = new Set<string>();
  for (const message of schemaErrors) {
    if (seen.has(message)) continue;
    seen.add(message);
    let target: BuilderFocus | undefined;
    let stepId: string | undefined;
    if (message === "Every step needs a title.") {
      const section = schema.sections.find((entry) => !entry.title.trim());
      if (section) {
        target = { kind: "step", stepId: section.id };
        stepId = section.id;
      }
    } else if (message === "Every question needs a label.") {
      for (const section of schema.sections) {
        const field = section.fields.find((entry) => !entry.label.trim());
        if (field) {
          target = { kind: "field", stepId: section.id, fieldId: field.id };
          stepId = section.id;
          break;
        }
      }
    } else if (message === "Every acknowledgment needs text.") {
      target = { kind: "acknowledgments" };
    } else {
      const label = quotedLabel(message);
      if (label) {
        for (const section of schema.sections) {
          const field = section.fields.find((entry) => entry.label === label);
          if (field) {
            target = { kind: "field", stepId: section.id, fieldId: field.id };
            stepId = section.id;
            break;
          }
        }
      }
      if (!target && schema.sections[0]) {
        target = { kind: "step", stepId: schema.sections[0].id };
      }
    }
    items.push({ id: `schema-${seen.size}`, status: "todo", label: message, target, stepId });
  }

  const questionCount = schema.sections.reduce((sum, section) => sum + section.fields.length, 0);
  if (schemaErrors.length === 0) {
    items.push({
      id: "steps",
      status: "done",
      label: `${schema.sections.length} step${schema.sections.length === 1 ? "" : "s"} · ${questionCount} question${
        questionCount === 1 ? "" : "s"
      }`,
      target: schema.sections[0] ? { kind: "step", stepId: schema.sections[0].id } : undefined,
    });
  }

  // 3. Notifications (publish blocks on this too).
  const notificationError = validateApplicationFormNotificationConfig(editable.notificationConfig);
  if (notificationError) {
    items.push({ id: "notifications", status: "todo", label: notificationError, target: { kind: "setup" } });
  }

  // 4. Fee + Stripe (informational: the fee panel already warns about it).
  if (editable.feeConfig.enabled) {
    items.push(
      options.stripePaymentsReady
        ? { id: "fee", status: "done", label: "Application fee ready", target: { kind: "fee" } }
        : {
            id: "fee",
            status: "warning",
            label: "Connect Stripe to collect the fee",
            detail: "Set it up on Admissions → Payments.",
            target: { kind: "fee" },
          },
    );
  }

  const readiness = finish(items, "");
  readiness.summary = readiness.ready
    ? "Ready to publish"
    : `${readiness.blocking} thing${readiness.blocking === 1 ? "" : "s"} to fix`;
  return readiness;
}

/** Enrollment checklist readiness (mirrors handleChecklistPublish's checks). */
export function checklistReadiness(
  editable: ChecklistEditableSnapshot,
  options: { stripePaymentsReady: boolean },
): FlowReadiness {
  const items: ReadinessItem[] = [];

  items.push({
    id: "program",
    status: editable.programId ? "done" : "todo",
    label: editable.programId ? "Program chosen" : "Choose a program",
    detail: editable.programId ? undefined : "Pick it in the toolbar.",
  });

  const errors = validateEnrollmentChecklistItems(editable.items, {
    paymentsReady: options.stripePaymentsReady,
  });
  const seen = new Set<string>();
  for (const message of errors) {
    if (seen.has(message)) continue;
    seen.add(message);
    const label = quotedLabel(message);
    const item = label ? editable.items.find((entry) => entry.label === label) : undefined;
    const untitled =
      message === "Every checklist item needs a title."
        ? editable.items.find((entry) => !entry.label.trim())
        : undefined;
    items.push({
      id: `items-${seen.size}`,
      status: "todo",
      label: message,
      checklistItemId: (item ?? untitled)?.id,
    });
  }

  if (errors.length === 0) {
    const required = editable.items.filter((item) => item.required).length;
    items.push({
      id: "items",
      status: "done",
      label: `${editable.items.length} item${editable.items.length === 1 ? "" : "s"} · ${required} required`,
    });
  }

  const readiness = finish(items, "");
  readiness.summary = readiness.ready
    ? "Ready to publish"
    : `${readiness.blocking} thing${readiness.blocking === 1 ? "" : "s"} to fix`;
  return readiness;
}
