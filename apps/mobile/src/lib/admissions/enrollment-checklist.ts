import type { SupabaseClient } from '@supabase/supabase-js';

import {
  getAgreementSectionProgressLabel,
  parseAgreementSectionSignatures,
} from '@/lib/admissions/enrollment-agreement-progress';

export type EnrollmentChecklistItemType =
  | 'document_sign'
  | 'document_sign_pdf'
  | 'form'
  | 'file_upload'
  | 'payment'
  | 'acknowledgment';

export type EnrollmentChecklistItemStatus = 'not_started' | 'in_progress' | 'completed' | 'waived';

const CHECKLIST_VARIANT_METADATA_KEY = 'variant';

type ChecklistVariantResolution = {
  templateItemId: string;
  variantKey: string;
  resolvedBy: string;
  resolvedAt: string;
};

type EnrollmentChecklistMetadata = {
  variantResolutions?: Record<string, ChecklistVariantResolution>;
  lastActiveTemplateItemId?: string;
};

export type EnrollmentChecklistItem = {
  id: string;
  label: string;
  type: EnrollmentChecklistItemType;
  required: boolean;
  sortOrder: number;
  metadata: Record<string, unknown>;
  document?: {
    kind: string;
    sections?: Array<{ id: string; title: string }>;
  };
};

export type EnrollmentChecklistItemInstance = {
  templateItemId: string;
  status: EnrollmentChecklistItemStatus;
  responses: Record<string, unknown> | null;
};

export type LoadedEnrollmentChecklist = {
  checklistId: string;
  title: string;
  status: string;
  progress: { completed: number; total: number };
  items: EnrollmentChecklistItem[];
  instances: EnrollmentChecklistItemInstance[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseChecklistMetadata(value: unknown): EnrollmentChecklistMetadata {
  if (!isRecord(value)) return {};
  const metadata: EnrollmentChecklistMetadata = {};

  const variantResolutions = value.variantResolutions;
  if (isRecord(variantResolutions)) {
    metadata.variantResolutions =
      variantResolutions as EnrollmentChecklistMetadata['variantResolutions'];
  }

  const lastActiveTemplateItemId = value.lastActiveTemplateItemId;
  if (typeof lastActiveTemplateItemId === 'string' && lastActiveTemplateItemId.trim()) {
    metadata.lastActiveTemplateItemId = lastActiveTemplateItemId;
  }

  return metadata;
}

function readItemVariantDraft(item: EnrollmentChecklistItem): { groupId: string } | null {
  const raw = item.metadata[CHECKLIST_VARIANT_METADATA_KEY];
  if (!isRecord(raw)) return null;
  const groupId = typeof raw.groupId === 'string' ? raw.groupId : '';
  if (!groupId.trim()) return null;
  return { groupId };
}

function isVariantItemSelected(
  item: EnrollmentChecklistItem,
  resolutions: Record<string, ChecklistVariantResolution>,
): boolean {
  const draft = readItemVariantDraft(item);
  if (!draft) return true;
  const resolution = resolutions[draft.groupId];
  return resolution?.templateItemId === item.id;
}

function documentFromTemplateRow(
  kind: string,
  content: Record<string, unknown>,
): EnrollmentChecklistItem['document'] | undefined {
  if (kind === 'pdf') {
    return { kind: 'pdf' };
  }

  const sections = Array.isArray(content.sections)
    ? content.sections
        .filter(isRecord)
        .map((section) => ({
          id: String(section.id ?? ''),
          title: String(section.title ?? ''),
        }))
    : [];

  return { kind: 'inline_sections', sections };
}

function parseTemplateItem(row: Record<string, unknown>): EnrollmentChecklistItem {
  const metadata = isRecord(row.metadata) ? { ...row.metadata } : {};
  const documentTemplates = row.document_templates;
  const documentTemplate = Array.isArray(documentTemplates)
    ? documentTemplates[0]
    : documentTemplates;
  const type = String(row.type ?? 'form') as EnrollmentChecklistItemType;

  let document: EnrollmentChecklistItem['document'];
  if (
    (type === 'document_sign' || type === 'document_sign_pdf') &&
    isRecord(documentTemplate)
  ) {
    document = documentFromTemplateRow(
      String(documentTemplate.kind ?? ''),
      isRecord(documentTemplate.content) ? documentTemplate.content : {},
    );
  }

  return {
    id: String(row.id),
    label: String(row.label ?? 'Checklist item'),
    type,
    required: row.required !== false,
    sortOrder: typeof row.sort_order === 'number' ? row.sort_order : 0,
    metadata,
    document,
  };
}

function parseInstance(row: Record<string, unknown>): EnrollmentChecklistItemInstance {
  return {
    templateItemId: String(row.template_item_id),
    status: String(row.status ?? 'not_started') as EnrollmentChecklistItemStatus,
    responses:
      row.responses && typeof row.responses === 'object' && !Array.isArray(row.responses)
        ? (row.responses as Record<string, unknown>)
        : null,
  };
}

export async function getChecklistForApplication(
  supabase: SupabaseClient,
  applicationId: string,
): Promise<{
  checklistId: string;
  templateId: string;
  status: string;
  metadata: EnrollmentChecklistMetadata;
} | null> {
  const { data, error } = await supabase
    .from('enrollment_checklists')
    .select('id, template_id, status, metadata')
    .eq('application_id', applicationId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    checklistId: String(data.id),
    templateId: String(data.template_id),
    status: String(data.status),
    metadata: parseChecklistMetadata(data.metadata),
  };
}

export function computeChecklistProgress(
  items: EnrollmentChecklistItem[],
  instances: EnrollmentChecklistItemInstance[],
): { completed: number; total: number } {
  const requiredItems = items.filter((item) => item.required);
  const instanceByTemplate = new Map(instances.map((instance) => [instance.templateItemId, instance]));
  let completed = 0;
  for (const item of requiredItems) {
    const instance = instanceByTemplate.get(item.id);
    if (instance?.status === 'completed') completed += 1;
  }
  return { completed, total: requiredItems.length };
}

export function checklistItemTypeLabel(type: EnrollmentChecklistItemType): string {
  switch (type) {
    case 'form':
      return 'Form';
    case 'payment':
      return 'Payment';
    case 'document_sign':
      return 'Signature';
    case 'document_sign_pdf':
      return 'PDF';
    case 'file_upload':
      return 'Upload';
    case 'acknowledgment':
      return 'Acknowledgment';
  }
}

export function buildEnrollmentTimelineMeta(
  item: EnrollmentChecklistItem,
  instance: EnrollmentChecklistItemInstance | undefined,
): string | undefined {
  if (
    instance?.status === 'in_progress' &&
    item.document?.kind === 'inline_sections' &&
    item.document.sections?.length
  ) {
    return getAgreementSectionProgressLabel(
      item.document.sections,
      parseAgreementSectionSignatures(instance.responses),
    );
  }
  return undefined;
}

export async function loadEnrollmentChecklistForApplication(
  supabase: SupabaseClient,
  applicationId: string,
  _organizationId: string,
): Promise<LoadedEnrollmentChecklist | null> {
  const checklist = await getChecklistForApplication(supabase, applicationId);
  if (!checklist) return null;

  const [templateResult, itemsResult, instancesResult] = await Promise.all([
    supabase
      .from('enrollment_checklist_templates')
      .select('name')
      .eq('id', checklist.templateId)
      .maybeSingle(),
    supabase
      .from('enrollment_checklist_template_items')
      .select(
        `
        id,
        label,
        type,
        required,
        sort_order,
        metadata,
        document_templates ( id, kind, content )
      `,
      )
      .eq('template_id', checklist.templateId)
      .order('sort_order', { ascending: true }),
    supabase
      .from('enrollment_checklist_items')
      .select('template_item_id, status, responses')
      .eq('checklist_id', checklist.checklistId)
      .order('created_at', { ascending: true }),
  ]);

  if (templateResult.error) throw templateResult.error;
  if (itemsResult.error) throw itemsResult.error;
  if (instancesResult.error) throw instancesResult.error;

  const allItems = (itemsResult.data ?? []).map((row) =>
    parseTemplateItem(row as Record<string, unknown>),
  );
  const allInstances = (instancesResult.data ?? []).map((row) =>
    parseInstance(row as Record<string, unknown>),
  );

  const resolutions = checklist.metadata.variantResolutions ?? {};
  const items = allItems.filter((item) => isVariantItemSelected(item, resolutions));
  const instances = allInstances.filter((instance) => {
    const templateItem = allItems.find((item) => item.id === instance.templateItemId);
    if (!templateItem) return false;
    return isVariantItemSelected(templateItem, resolutions) && instance.status !== 'waived';
  });

  const progress = computeChecklistProgress(items, instances);

  return {
    checklistId: checklist.checklistId,
    title: String(templateResult.data?.name ?? 'Enrollment checklist'),
    status: checklist.status,
    progress,
    items,
    instances,
  };
}
