import type { SupabaseClient } from "@supabase/supabase-js";
import type { ApplicationSection } from "./application-form-schema";
import {
  getEnrollmentChecklistTemplate,
  type EnrollmentChecklistTemplate,
} from "./enrollment-checklist-templates";
import type {
  ChecklistAcknowledgmentConfig,
  ChecklistFileUploadConfig,
  ChecklistItemType,
  DocumentConfig,
  EnrollmentChecklistItem,
  InlineDocumentConfig,
} from "./enrollment-checklist-schema";
import {
  createChecklistItemKeyForItem,
  isChecklistItemId,
  newChecklistItemId,
} from "./enrollment-checklist-schema";
import { validateVariantGroups } from "./enrollment-checklist-variants";

const METADATA_DOCUMENT_TEMPLATE_ID = "documentTemplateId";
const METADATA_FEE_DEFINITION_ID = "feeDefinitionId";

type TemplateItemRow = {
  id: string;
  template_id: string;
  organization_id: string;
  item_key: string;
  sort_order: number;
  label: string;
  type: ChecklistItemType;
  required: boolean;
  document_template_id: string | null;
  fee_definition_id: string | null;
  form_schema: ApplicationSection | null;
  metadata: Record<string, unknown>;
  document_templates?: {
    id: string;
    kind: string;
    content: Record<string, unknown>;
  } | null;
  fee_definitions?: {
    id: string;
    label: string;
    amount_cents: number;
    code: string;
  } | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function documentFromTemplateRow(
  kind: string,
  content: Record<string, unknown>,
): DocumentConfig | undefined {
  if (kind === "pdf") {
    const doc = {
      kind: "pdf" as const,
      fileName: typeof content.fileName === "string" ? content.fileName : "",
      ...(typeof content.storagePath === "string"
        ? { storagePath: content.storagePath }
        : {}),
      ...(typeof content.mimeType === "string" ? { mimeType: content.mimeType } : {}),
      ...(typeof content.sizeBytes === "number" ? { sizeBytes: content.sizeBytes } : {}),
      ...(content.requireSignature === false
        ? { requireSignature: false }
        : content.requireSignature === true
          ? { requireSignature: true }
          : {}),
    };
    return doc;
  }

  const sections = Array.isArray(content.sections)
    ? content.sections
        .filter(isRecord)
        .map((section) => ({
          id: String(section.id ?? ""),
          title: String(section.title ?? ""),
          body: String(section.body ?? ""),
        }))
    : [];

  const doc: InlineDocumentConfig = { kind: "inline_sections", sections };

  if (content.showWarningBanner === true) {
    doc.showWarningBanner = true;
  }

  if (Array.isArray(content.consentOptions)) {
    doc.consentOptions = content.consentOptions
      .filter(isRecord)
      .map((option) => ({
        value: String(option.value ?? ""),
        label: String(option.label ?? ""),
      }))
      .filter((option) => option.value && option.label);
  }

  return doc;
}

function fileUploadFromMetadata(
  metadata: Record<string, unknown>,
): ChecklistFileUploadConfig | undefined {
  const raw = metadata.fileUpload;
  if (!isRecord(raw)) return undefined;
  return {
    accept: typeof raw.accept === "string" ? raw.accept : ".pdf,.jpg,.jpeg,.png",
    maxFiles: typeof raw.maxFiles === "number" ? raw.maxFiles : 3,
    helpText:
      typeof raw.helpText === "string" ? raw.helpText : "Upload required documents.",
  };
}

function acknowledgmentFromMetadata(
  metadata: Record<string, unknown>,
): ChecklistAcknowledgmentConfig | undefined {
  const raw = metadata.acknowledgment;
  if (!isRecord(raw)) return undefined;
  const config: ChecklistAcknowledgmentConfig = {
    body:
      typeof raw.body === "string"
        ? raw.body
        : "By signing below, I confirm that the information provided is accurate.",
  };
  if (Array.isArray(raw.options)) {
    config.options = raw.options
      .filter(isRecord)
      .map((option) => ({
        value: String(option.value ?? ""),
        label: String(option.label ?? ""),
      }))
      .filter((option) => option.value && option.label);
  }
  return config;
}

export function itemFromRow(row: TemplateItemRow): EnrollmentChecklistItem {
  const metadata = { ...(row.metadata ?? {}) };

  if (row.document_template_id) {
    metadata[METADATA_DOCUMENT_TEMPLATE_ID] = row.document_template_id;
  }
  if (row.fee_definition_id) {
    metadata[METADATA_FEE_DEFINITION_ID] = row.fee_definition_id;
  }

  const item: EnrollmentChecklistItem = {
    id: row.id,
    itemKey: row.item_key,
    label: row.label,
    type: row.type,
    required: row.required,
    metadata,
  };

  if (
    (row.type === "document_sign" || row.type === "document_sign_pdf") &&
    row.document_templates
  ) {
    item.document = documentFromTemplateRow(
      row.document_templates.kind,
      row.document_templates.content ?? {},
    );
  }

  if (row.type === "form" && row.form_schema) {
    item.formSchema = row.form_schema;
  }

  if (row.type === "file_upload") {
    item.fileUpload = fileUploadFromMetadata(metadata);
  }

  if (row.type === "payment" && row.fee_definitions) {
    item.payment = {
      label: row.fee_definitions.label,
      amountCents: row.fee_definitions.amount_cents,
    };
  }

  if (row.type === "acknowledgment") {
    item.acknowledgment = acknowledgmentFromMetadata(metadata);
  }

  return item;
}

function buildItemMetadata(item: EnrollmentChecklistItem): Record<string, unknown> {
  const metadata = { ...item.metadata };
  delete metadata[METADATA_DOCUMENT_TEMPLATE_ID];
  delete metadata[METADATA_FEE_DEFINITION_ID];

  if (item.type === "file_upload" && item.fileUpload) {
    metadata.fileUpload = item.fileUpload;
  }
  if (item.type === "acknowledgment" && item.acknowledgment) {
    metadata.acknowledgment = item.acknowledgment;
  }

  return metadata;
}

function documentContentFromItem(item: EnrollmentChecklistItem): Record<string, unknown> {
  if (!item.document) return {};

  if (item.document.kind === "pdf") {
    const content: Record<string, unknown> = {
      fileName: item.document.fileName,
    };
    if (item.document.storagePath) {
      content.storagePath = item.document.storagePath;
    }
    if (item.document.mimeType) {
      content.mimeType = item.document.mimeType;
    }
    if (item.document.sizeBytes != null) {
      content.sizeBytes = item.document.sizeBytes;
    }
    if (item.document.requireSignature !== undefined) {
      content.requireSignature = item.document.requireSignature;
    }
    return content;
  }

  const content: Record<string, unknown> = {
    sections: item.document.sections,
  };
  if (item.document.showWarningBanner) {
    content.showWarningBanner = true;
  }
  if (item.document.consentOptions?.length) {
    content.consentOptions = item.document.consentOptions;
  }
  return content;
}

async function syncDocumentTemplate(
  supabase: SupabaseClient,
  organizationId: string,
  item: EnrollmentChecklistItem,
  existingDocumentTemplateId: string | null,
): Promise<string | null> {
  if (
    (item.type !== "document_sign" && item.type !== "document_sign_pdf") ||
    !item.document
  ) {
    return null;
  }

  const kind = item.document.kind === "pdf" ? "pdf" : "inline_sections";
  const content = documentContentFromItem(item);
  const payload = {
    name: item.label.trim() || "Agreement",
    kind,
    content,
    status: "published",
  };

  if (existingDocumentTemplateId) {
    const { error } = await supabase
      .from("document_templates")
      .update(payload)
      .eq("id", existingDocumentTemplateId);
    if (error) throw error;
    return existingDocumentTemplateId;
  }

  const { data, error } = await supabase
    .from("document_templates")
    .insert({
      organization_id: organizationId,
      ...payload,
    })
    .select("id")
    .single();

  if (error) throw error;
  return String(data.id);
}

async function syncFeeDefinition(
  supabase: SupabaseClient,
  organizationId: string,
  item: EnrollmentChecklistItem,
  existingFeeDefinitionId: string | null,
): Promise<string | null> {
  if (item.type !== "payment" || !item.payment) return null;

  const payload = {
    organization_id: organizationId,
    code: item.itemKey,
    label: item.payment.label.trim() || item.label.trim() || "Payment",
    amount_cents: item.payment.amountCents,
    active: true,
  };

  if (existingFeeDefinitionId) {
    const { error } = await supabase
      .from("fee_definitions")
      .update({
        code: payload.code,
        label: payload.label,
        amount_cents: payload.amount_cents,
        active: true,
      })
      .eq("id", existingFeeDefinitionId);
    if (error) throw error;
    return existingFeeDefinitionId;
  }

  const { data, error } = await supabase
    .from("fee_definitions")
    .insert(payload)
    .select("id")
    .single();

  if (error) throw error;
  return String(data.id);
}

function validateFormSection(section: ApplicationSection): string[] {
  const errors: string[] = [];
  if (!section.title.trim()) {
    errors.push("Every form step needs a title.");
  }
  for (const field of section.fields) {
    if (!field.label.trim()) {
      errors.push("Every question needs a label.");
    }
    if (
      (field.type === "select" || field.type === "radio") &&
      (!field.options || field.options.length === 0)
    ) {
      errors.push(`"${field.label}" needs at least one option.`);
    }
  }
  return errors;
}

export function validateEnrollmentChecklistItems(
  items: EnrollmentChecklistItem[],
  options?: { paymentsReady?: boolean },
): string[] {
  const errors: string[] = [];

  if (items.length === 0) {
    errors.push("Add at least one checklist item.");
    return errors;
  }

  const itemKeys = new Set<string>();

  for (const item of items) {
    if (!item.label.trim()) {
      errors.push("Every checklist item needs a title.");
    }

    if (itemKeys.has(item.itemKey)) {
      errors.push(`Duplicate item key: ${item.itemKey}`);
    }
    itemKeys.add(item.itemKey);

    switch (item.type) {
      case "document_sign": {
        if (!item.document || item.document.kind !== "inline_sections") {
          errors.push(`"${item.label}" needs agreement content.`);
          break;
        }
        if (item.document.sections.length === 0) {
          errors.push(`"${item.label}" needs at least one agreement section.`);
        }
        for (const section of item.document.sections) {
          if (!section.title.trim() || !section.body.trim()) {
            errors.push(
              `Every agreement section in "${item.label}" needs a title and body.`,
            );
            break;
          }
        }
        break;
      }
      case "document_sign_pdf": {
        if (!item.document || item.document.kind !== "pdf") {
          errors.push(`"${item.label}" needs agreement PDF content.`);
          break;
        }
        if (!item.document.storagePath?.trim()) {
          errors.push(`"${item.label}" needs an uploaded PDF before publishing.`);
        }
        break;
      }
      case "form": {
        if (!item.formSchema) {
          errors.push(`"${item.label}" needs form content.`);
          break;
        }
        errors.push(...validateFormSection(item.formSchema));
        break;
      }
      case "payment": {
        if (!item.payment?.label.trim()) {
          errors.push(`"${item.label}" needs a payment label.`);
        }
        if (
          item.payment &&
          (item.payment.amountCents < 0 || !Number.isFinite(item.payment.amountCents))
        ) {
          errors.push(`"${item.label}" needs a valid payment amount.`);
        }
        if (options?.paymentsReady === false) {
          errors.push(
            "Connect Stripe under Admissions → Payments before publishing a checklist with payment items.",
          );
        }
        break;
      }
      case "acknowledgment": {
        if (!item.acknowledgment?.body.trim()) {
          errors.push(`"${item.label}" needs acknowledgment text.`);
        }
        break;
      }
      default:
        break;
    }
  }

  errors.push(...validateVariantGroups(items));

  return errors;
}

export function hasDuplicateChecklistItemKeys(
  items: EnrollmentChecklistItem[],
): boolean {
  const keys = new Set<string>();
  for (const item of items) {
    if (keys.has(item.itemKey)) {
      return true;
    }
    keys.add(item.itemKey);
  }
  return false;
}

export function ensureUniqueChecklistItemKeys(
  items: EnrollmentChecklistItem[],
): EnrollmentChecklistItem[] {
  const used = new Set<string>();

  return items.map((item) => {
    let key = item.itemKey;

    if (used.has(key)) {
      key = createChecklistItemKeyForItem(item.label, item.id);
      if (used.has(key)) {
        let suffix = 2;
        while (used.has(`${key}_${suffix}`)) {
          suffix += 1;
        }
        key = `${key}_${suffix}`;
      }
    }

    used.add(key);
    return key === item.itemKey ? item : { ...item, itemKey: key };
  });
}

export type EnrollmentChecklistWithItems = {
  template: EnrollmentChecklistTemplate;
  items: EnrollmentChecklistItem[];
};

export async function getEnrollmentChecklistWithItems(
  supabase: SupabaseClient,
  templateId: string,
): Promise<EnrollmentChecklistWithItems | null> {
  const template = await getEnrollmentChecklistTemplate(supabase, templateId);
  if (!template) return null;

  const { data, error } = await supabase
    .from("enrollment_checklist_template_items")
    .select(
      `
      *,
      document_templates ( id, kind, content ),
      fee_definitions ( id, label, amount_cents, code )
    `,
    )
    .eq("template_id", templateId)
    .order("sort_order", { ascending: true });

  if (error) throw error;

  const items = (data ?? []).map((row) =>
    itemFromRow(row as unknown as TemplateItemRow),
  );

  return { template, items };
}

export async function saveEnrollmentChecklistItems(
  supabase: SupabaseClient,
  templateId: string,
  items: EnrollmentChecklistItem[],
): Promise<EnrollmentChecklistItem[]> {
  const template = await getEnrollmentChecklistTemplate(supabase, templateId);
  if (!template) throw new Error("Enrollment checklist not found.");
  if (template.status === "archived") {
    throw new Error("Archived checklists cannot be edited.");
  }

  const normalizedItems = ensureUniqueChecklistItemKeys(items);

  const { data: existingRows, error: existingError } = await supabase
    .from("enrollment_checklist_template_items")
    .select("id, document_template_id, fee_definition_id")
    .eq("template_id", templateId);

  if (existingError) throw existingError;

  const existingById = new Map(
    (existingRows ?? []).map((row) => [
      String(row.id),
      {
        documentTemplateId: row.document_template_id
          ? String(row.document_template_id)
          : null,
        feeDefinitionId: row.fee_definition_id
          ? String(row.fee_definition_id)
          : null,
      },
    ]),
  );

  const incomingIds = new Set(normalizedItems.map((item) => item.id));
  const idsToDelete = (existingRows ?? [])
    .map((row) => String(row.id))
    .filter((id) => !incomingIds.has(id));

  if (idsToDelete.length > 0) {
    const { error: deleteError } = await supabase
      .from("enrollment_checklist_template_items")
      .delete()
      .in("id", idsToDelete);
    if (deleteError) throw deleteError;
  }

  const savedItems: EnrollmentChecklistItem[] = [];

  for (let sortOrder = 0; sortOrder < normalizedItems.length; sortOrder += 1) {
    const item = normalizedItems[sortOrder];
    const existing = existingById.get(item.id);
    const existingDocumentTemplateId =
      (typeof item.metadata[METADATA_DOCUMENT_TEMPLATE_ID] === "string"
        ? item.metadata[METADATA_DOCUMENT_TEMPLATE_ID]
        : null) ?? existing?.documentTemplateId ?? null;
    const existingFeeDefinitionId =
      (typeof item.metadata[METADATA_FEE_DEFINITION_ID] === "string"
        ? item.metadata[METADATA_FEE_DEFINITION_ID]
        : null) ?? existing?.feeDefinitionId ?? null;

    const documentTemplateId = await syncDocumentTemplate(
      supabase,
      template.organizationId,
      item,
      existingDocumentTemplateId,
    );
    const feeDefinitionId = await syncFeeDefinition(
      supabase,
      template.organizationId,
      item,
      existingFeeDefinitionId,
    );

    const rowPayload = {
      template_id: templateId,
      organization_id: template.organizationId,
      item_key: item.itemKey,
      sort_order: sortOrder,
      label: item.label.trim(),
      type: item.type,
      required: item.required,
      document_template_id: documentTemplateId,
      fee_definition_id: feeDefinitionId,
      form_schema: item.type === "form" ? item.formSchema ?? null : null,
      metadata: buildItemMetadata(item),
    };

    const isExisting = existingById.has(item.id);
    let savedRow: TemplateItemRow;

    if (isExisting) {
      const { data, error: updateError } = await supabase
        .from("enrollment_checklist_template_items")
        .update(rowPayload)
        .eq("id", item.id)
        .select(
          `
          *,
          document_templates ( id, kind, content ),
          fee_definitions ( id, label, amount_cents, code )
        `,
        )
        .single();
      if (updateError) throw updateError;
      savedRow = data as unknown as TemplateItemRow;
    } else {
      const itemId = isChecklistItemId(item.id) ? item.id : newChecklistItemId();
      const { data, error: insertError } = await supabase
        .from("enrollment_checklist_template_items")
        .insert({ ...rowPayload, id: itemId })
        .select(
          `
          *,
          document_templates ( id, kind, content ),
          fee_definitions ( id, label, amount_cents, code )
        `,
        )
        .single();
      if (insertError) throw insertError;
      savedRow = data as unknown as TemplateItemRow;
    }

    savedItems.push(itemFromRow(savedRow));
  }

  return savedItems;
}
