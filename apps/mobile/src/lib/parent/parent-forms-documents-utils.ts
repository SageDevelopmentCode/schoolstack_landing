import type {
  ParentFormDetail,
  ParentFormFilterStatus,
  ParentFormListItem,
  ParentFormListStatus,
  TeacherFormField,
} from '@/lib/parent/parent-forms-documents-types';
import type { ParentHomeData } from '@/lib/parent/parent-portal-api';

export function classifyParentFormListStatus(
  status: ParentFormListItem['response']['status'],
): ParentFormListStatus {
  return status === 'signed' ? 'signed' : 'needs_action';
}

export function filterParentFormsByStatus(
  items: ParentFormListItem[],
  filter: ParentFormFilterStatus,
): ParentFormListItem[] {
  if (filter === 'all') return items;
  return items.filter((item) => item.listStatus === filter);
}

export function areBuilderFieldValuesComplete(
  fields: TeacherFormField[],
  fieldValues: Record<string, string | boolean | string[]>,
): boolean {
  for (const field of fields) {
    if (!field.required) continue;

    const value = fieldValues[field.id];
    if (field.type === 'checkbox') {
      if (value !== true) return false;
      continue;
    }

    if (field.type === 'multiple_choice') {
      const selected = Array.isArray(value) ? value : [];
      if (selected.length === 0) return false;
      continue;
    }

    const text = typeof value === 'string' ? value.trim() : '';
    if (!text) return false;
  }

  return true;
}

export function countParentFormsByStatus(items: ParentFormListItem[]): {
  all: number;
  needs_action: number;
  signed: number;
} {
  return {
    all: items.length,
    needs_action: items.filter((item) => item.listStatus === 'needs_action').length,
    signed: items.filter((item) => item.listStatus === 'signed').length,
  };
}

export function formatFormDueDate(dueDate: string): string {
  const [year, month, day] = dueDate.split('-').map(Number);
  const parsed = new Date(year, (month ?? 1) - 1, day ?? 1);
  return parsed.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatFormSignedDate(signedAt: string): string {
  return new Date(signedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function parseStoredSignerName(
  responses: Record<string, unknown> | null | undefined,
): string {
  const raw = responses?.signerName;
  return typeof raw === 'string' ? raw.trim() : '';
}

export function patchParentHomeAfterFormSigned(
  data: ParentHomeData,
  detail: ParentFormDetail,
): ParentHomeData {
  const formId = detail.form.id;
  const signedAt = detail.response.signedAt;

  const formAttentionItems = (data.formAttentionItems ?? []).filter(
    (item) => item.formId !== formId,
  );

  let formSnapshot = data.formSnapshot;
  if (formSnapshot) {
    const items = formSnapshot.items.map((item) =>
      item.formId === formId
        ? {
            ...item,
            listStatus: 'signed' as const,
            responseStatus: 'signed' as const,
            signedAt: signedAt ?? item.signedAt,
          }
        : item,
    );
    formSnapshot = {
      ...formSnapshot,
      items,
      counts: {
        all: items.length,
        needsAction: items.filter((item) => item.listStatus === 'needs_action').length,
        signed: items.filter((item) => item.listStatus === 'signed').length,
      },
    };
  }

  return {
    ...data,
    formAttentionItems,
    formSnapshot,
  };
}
