import type { SupabaseClient } from "@supabase/supabase-js";

export type OrganizationProgressEntry = {
  id: string;
  entry_date: string;
  phase_number: string;
  phase_title: string;
  title: string;
  summary: string;
  highlights: string[];
};

export function formatProgressEntryDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function parseHighlights(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

export async function fetchOrganizationProgressLog(
  supabase: SupabaseClient,
  orgSlug: string,
): Promise<OrganizationProgressEntry[]> {
  const { data: org, error: orgError } = await supabase
    .from("organizations")
    .select("id")
    .eq("slug", orgSlug)
    .maybeSingle();

  if (orgError || !org) return [];

  const { data, error } = await supabase
    .from("organization_progress_log")
    .select(
      "id, entry_date, phase_number, phase_title, title, summary, highlights",
    )
    .eq("organization_id", org.id)
    .eq("published", true)
    .order("entry_date", { ascending: false });

  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    entry_date: row.entry_date,
    phase_number: row.phase_number,
    phase_title: row.phase_title,
    title: row.title,
    summary: row.summary,
    highlights: parseHighlights(row.highlights),
  }));
}
