import type { SupabaseClient } from '@supabase/supabase-js';

import { APPLICATION_STATUSES_EXCLUDED_FROM_DEFAULT_ALL } from '@/lib/admissions/application-status-ui';

export type LatestSubmittedSummary = {
  id: string;
  submittedAt: string | null;
  guardianName: string | null;
};

export type SubmissionPageMeta = {
  statusCounts: Record<string, number>;
  activeSubmissionsCount: number;
  latestSubmitted: LatestSubmittedSummary | null;
};

type AdminSubmissionsPageMetaRow = {
  status_counts?: Record<string, number> | null;
  latest_submitted?: {
    id?: string;
    submitted_at?: string | null;
    guardian_name?: string | null;
  } | null;
};

function parseStatusCounts(value: unknown): Record<string, number> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }

  const counts: Record<string, number> = {};
  for (const [status, count] of Object.entries(value as Record<string, unknown>)) {
    counts[status] = Number(count ?? 0);
  }
  return counts;
}

function parseLatestSubmitted(
  value: AdminSubmissionsPageMetaRow['latest_submitted'],
): LatestSubmittedSummary | null {
  if (!value?.id) return null;

  return {
    id: String(value.id),
    submittedAt: value.submitted_at ? String(value.submitted_at) : null,
    guardianName: value.guardian_name?.trim() ? String(value.guardian_name) : null,
  };
}

function parseAdminSubmissionsPageMetaRow(
  row: AdminSubmissionsPageMetaRow | null,
): SubmissionPageMeta | null {
  if (!row) return null;

  const statusCounts = parseStatusCounts(row.status_counts);
  return {
    statusCounts,
    activeSubmissionsCount: countActiveSubmissions(statusCounts),
    latestSubmitted: parseLatestSubmitted(row.latest_submitted),
  };
}

export async function fetchLatestSubmittedApplication(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<LatestSubmittedSummary | null> {
  const { data, error } = await supabase
    .from('applications')
    .select(
      `
      id,
      submitted_at,
      guardians:primary_guardian_id (
        first_name,
        last_name
      )
    `,
    )
    .eq('organization_id', organizationId)
    .eq('status', 'submitted')
    .order('submitted_at', { ascending: false, nullsFirst: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;

  const guardian = data.guardians as
    | { first_name?: string; last_name?: string }
    | { first_name?: string; last_name?: string }[]
    | null;
  const guardianRow = Array.isArray(guardian) ? guardian[0] : guardian;
  const guardianName = guardianRow
    ? [guardianRow.first_name, guardianRow.last_name].filter(Boolean).join(' ') || null
    : null;

  return {
    id: String(data.id),
    submittedAt: data.submitted_at ? String(data.submitted_at) : null,
    guardianName,
  };
}

export async function fetchApplicationSubmissionStatusCounts(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<Record<string, number>> {
  const { data, error } = await supabase
    .from('applications')
    .select('status')
    .eq('organization_id', organizationId);

  if (error) throw error;

  const counts: Record<string, number> = {};
  for (const row of data ?? []) {
    const status = String(row.status);
    counts[status] = (counts[status] ?? 0) + 1;
  }
  return counts;
}

export function countActiveSubmissions(statusCounts: Record<string, number>): number {
  return Object.entries(statusCounts).reduce((sum, [status, count]) => {
    if (
      APPLICATION_STATUSES_EXCLUDED_FROM_DEFAULT_ALL.some((excluded) => excluded === status)
    ) {
      return sum;
    }
    return sum + count;
  }, 0);
}

export function submissionsPageHasMore(fetchedCount: number, pageSize: number): boolean {
  return fetchedCount === pageSize;
}

async function fetchSubmissionPageMetaFromRpc(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<SubmissionPageMeta | null> {
  const { data, error } = await supabase.rpc('admin_submissions_page_meta', {
    p_organization_id: organizationId,
  });

  if (error) return null;

  return parseAdminSubmissionsPageMetaRow((data ?? null) as AdminSubmissionsPageMetaRow | null);
}

async function fetchSubmissionPageMetaFallback(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<SubmissionPageMeta> {
  const [statusCounts, latestSubmitted] = await Promise.all([
    fetchApplicationSubmissionStatusCounts(supabase, organizationId),
    fetchLatestSubmittedApplication(supabase, organizationId),
  ]);

  return {
    statusCounts,
    activeSubmissionsCount: countActiveSubmissions(statusCounts),
    latestSubmitted,
  };
}

export async function fetchSubmissionPageMeta(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<SubmissionPageMeta> {
  const fromRpc = await fetchSubmissionPageMetaFromRpc(supabase, organizationId);
  if (fromRpc) return fromRpc;

  return fetchSubmissionPageMetaFallback(supabase, organizationId);
}
