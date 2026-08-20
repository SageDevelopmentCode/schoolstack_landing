import type { SupabaseClient } from '@supabase/supabase-js';

export type ApplicationFormSchema = {
  sections: Array<{
    id: string;
    title: string;
    fields?: unknown[];
  }>;
  acknowledgments: Array<{ id: string; label: string }>;
};

export type ApplicationFormFeeConfig = {
  enabled: boolean;
  label?: string;
  amount_cents?: number;
};

export type ApplicationFormPostSubmitConfig = {
  actions: Array<{
    id: string;
    type: string;
    enabled?: boolean;
    required?: boolean;
    label?: string;
  }>;
};

export function parseApplicationFormSchema(raw: unknown): ApplicationFormSchema {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { sections: [], acknowledgments: [] };
  }
  const record = raw as Record<string, unknown>;
  const sections = Array.isArray(record.sections)
    ? record.sections
        .filter((section): section is Record<string, unknown> => Boolean(section && typeof section === 'object'))
        .map((section) => ({
          id: String(section.id ?? ''),
          title: String(section.title ?? ''),
        }))
    : [];
  const acknowledgments = Array.isArray(record.acknowledgments)
    ? record.acknowledgments
        .filter((ack): ack is Record<string, unknown> => Boolean(ack && typeof ack === 'object'))
        .map((ack) => ({
          id: String(ack.id ?? ''),
          label: String(ack.label ?? ''),
        }))
    : [];
  return { sections, acknowledgments };
}

export function parseApplicationFormFeeConfig(raw: unknown): ApplicationFormFeeConfig {
  if (!raw || typeof raw !== 'object') return { enabled: false, label: 'Application fee' };
  const record = raw as Record<string, unknown>;
  return {
    enabled: Boolean(record.enabled),
    label: typeof record.label === 'string' ? record.label : 'Application fee',
    amount_cents: typeof record.amount_cents === 'number' ? record.amount_cents : 0,
  };
}

export function parseApplicationFormPostSubmitConfig(raw: unknown): ApplicationFormPostSubmitConfig {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { actions: [] };
  }
  const record = raw as Record<string, unknown>;
  const actions = Array.isArray(record.actions)
    ? record.actions
        .filter((action): action is Record<string, unknown> => Boolean(action && typeof action === 'object'))
        .map((action) => ({
          id: String(action.id ?? ''),
          type: String(action.type ?? ''),
          enabled: action.enabled !== false,
          required: action.required !== false,
          label: typeof action.label === 'string' ? action.label : undefined,
        }))
    : [];
  return { actions };
}

export function formatFeeAmount(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
}
