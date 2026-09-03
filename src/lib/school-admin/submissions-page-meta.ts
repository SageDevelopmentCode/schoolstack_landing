import type { SupabaseClient } from "@supabase/supabase-js";
import { APPLICATION_STATUSES_EXCLUDED_FROM_DEFAULT_ALL } from "@/lib/admissions/application-status-ui";
import { fetchLatestSubmittedApplication } from "@/lib/school-admin/dashboard-metrics";

export type SubmissionFormOption = {
  key: string;
  title: string;
};

export type SubmissionPageMeta = {
  statusCounts: Record<string, number>;
  activeSubmissionsCount: number;
  latestSubmitted: Awaited<ReturnType<typeof fetchLatestSubmittedApplication>>;
  formOptions: SubmissionFormOption[];
};

type AdminSubmissionsPageMetaRow = {
  status_counts?: Record<string, number> | null;
  form_options?: SubmissionFormOption[] | null;
  latest_submitted?: {
    id?: string;
    submitted_at?: string | null;
    guardian_name?: string | null;
  } | null;
};

function parseStatusCounts(value: unknown): Record<string, number> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  const counts: Record<string, number> = {};
  for (const [status, count] of Object.entries(value as Record<string, unknown>)) {
    counts[status] = Number(count ?? 0);
  }
  return counts;
}

function parseFormOptions(value: unknown): SubmissionFormOption[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((entry) => {
      if (!entry || typeof entry !== "object") return null;
      const row = entry as { key?: string; title?: string };
      const title = row.title?.trim() || "Application";
      const key = row.key?.trim() || title;
      return { key, title };
    })
    .filter((option): option is SubmissionFormOption => option != null)
    .sort((left, right) => left.title.localeCompare(right.title));
}

function parseLatestSubmitted(
  value: AdminSubmissionsPageMetaRow["latest_submitted"],
): SubmissionPageMeta["latestSubmitted"] {
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
    formOptions: parseFormOptions(row.form_options),
  };
}

export async function fetchSubmissionPageMetaFromRpc(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<SubmissionPageMeta | null> {
  const { data, error } = await supabase.rpc("admin_submissions_page_meta", {
    p_organization_id: organizationId,
  });

  if (error) return null;

  return parseAdminSubmissionsPageMetaRow(
    (data ?? null) as AdminSubmissionsPageMetaRow | null,
  );
}

export async function fetchApplicationSubmissionStatusCounts(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<Record<string, number>> {
  const { data, error } = await supabase
    .from("applications")
    .select("status")
    .eq("organization_id", organizationId);

  if (error) throw error;

  const counts: Record<string, number> = {};
  for (const row of data ?? []) {
    const status = String(row.status);
    counts[status] = (counts[status] ?? 0) + 1;
  }
  return counts;
}

export function countActiveSubmissions(
  statusCounts: Record<string, number>,
): number {
  return Object.entries(statusCounts).reduce((sum, [status, count]) => {
    if (
      APPLICATION_STATUSES_EXCLUDED_FROM_DEFAULT_ALL.some(
        (excluded) => excluded === status,
      )
    ) {
      return sum;
    }
    return sum + count;
  }, 0);
}

export async function fetchApplicationFormOptions(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<SubmissionFormOption[]> {
  const { data, error } = await supabase
    .from("applications")
    .select(
      `
      application_form_versions!inner (
        title,
        public_slug
      )
    `,
    )
    .eq("organization_id", organizationId);

  if (error) throw error;

  const options = new Map<string, string>();
  for (const row of data ?? []) {
    const formVersion = row.application_form_versions as
      | { title?: string; public_slug?: string | null }
      | { title?: string; public_slug?: string | null }[]
      | null;
    const form = Array.isArray(formVersion) ? formVersion[0] : formVersion;
    const title = form?.title ? String(form.title) : "Application";
    const key =
      typeof form?.public_slug === "string" && form.public_slug.trim() !== ""
        ? form.public_slug
        : title;
    if (!options.has(key)) {
      options.set(key, title);
    }
  }

  return [...options.entries()]
    .map(([key, title]) => ({ key, title }))
    .sort((left, right) => left.title.localeCompare(right.title));
}

async function fetchSubmissionPageMetaFallback(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<SubmissionPageMeta> {
  const [statusCounts, latestSubmitted, formOptions] = await Promise.all([
    fetchApplicationSubmissionStatusCounts(supabase, organizationId),
    fetchLatestSubmittedApplication(supabase, organizationId),
    fetchApplicationFormOptions(supabase, organizationId),
  ]);

  return {
    statusCounts,
    activeSubmissionsCount: countActiveSubmissions(statusCounts),
    latestSubmitted,
    formOptions,
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

export { parseAdminSubmissionsPageMetaRow };
