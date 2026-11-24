import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { isCrmStatus, type CrmStatus } from "@/lib/admin-crm/crm-status";
import {
  isOutreachChannel,
  isOutreachDirection,
  isOutreachEmailStatus,
  nextStatusAfterTouch,
  type DemoOutreach,
  type DemoOutreachTouch,
  type OutreachChannel,
  type OutreachDirection,
  type OutreachEmailRecord,
} from "@/lib/admin-crm/demo-outreach-types";
import { fetchAllPostgrestRows } from "@/lib/supabase/fetch-all-rows";

export type SchoolRow = {
  id: string;
  demo_slug: string | null;
  crm_status: string;
  last_contacted_at: string | null;
  next_follow_up_at: string | null;
  contact_name: string;
  contact_email: string;
  website: string | null;
  updated_at: string;
};

type EmailRow = {
  id: string;
  school_id: string;
  step_id: string;
  channel: string;
  to_email: string | null;
  subject: string;
  status: string;
  error: string | null;
  sent_at: string;
};

type TouchRow = {
  id: string;
  school_id: string;
  channel: string;
  direction: string;
  note: string;
  occurred_at: string;
};

const SCHOOL_COLUMNS =
  "id, demo_slug, crm_status, last_contacted_at, next_follow_up_at, contact_name, contact_email, website, updated_at";
const TOUCH_COLUMNS = "id, school_id, channel, direction, note, occurred_at";
const EMAIL_COLUMNS = "id, school_id, step_id, channel, to_email, subject, status, error, sent_at";

function toEmailRecord(row: EmailRow): OutreachEmailRecord {
  return {
    id: row.id,
    stepId: row.step_id,
    channel: row.channel === "social" ? "social" : "email",
    toEmail: row.to_email,
    subject: row.subject ?? "",
    status: isOutreachEmailStatus(row.status) ? row.status : "failed",
    error: row.error,
    sentAt: row.sent_at,
  };
}

/** Outreach emails/social notes per school, newest first. */
export async function listOutreachEmails(
  supabase: SupabaseClient,
  schoolIds: string[],
): Promise<Map<string, OutreachEmailRecord[]>> {
  const bySchool = new Map<string, OutreachEmailRecord[]>();
  if (schoolIds.length === 0) return bySchool;

  const { data, error } = await supabase
    .from("crm_outreach_emails")
    .select(EMAIL_COLUMNS)
    .in("school_id", schoolIds)
    .order("sent_at", { ascending: false });
  if (error) throw error;

  for (const row of (data ?? []) as EmailRow[]) {
    const list = bySchool.get(row.school_id) ?? [];
    list.push(toEmailRecord(row));
    bySchool.set(row.school_id, list);
  }
  return bySchool;
}

function toTouch(row: TouchRow): DemoOutreachTouch {
  return {
    id: row.id,
    channel: isOutreachChannel(row.channel) ? row.channel : "other",
    direction: isOutreachDirection(row.direction) ? row.direction : "outbound",
    note: row.note ?? "",
    occurredAt: row.occurred_at,
  };
}

function toOutreach(row: SchoolRow, touches: DemoOutreachTouch[], emails: OutreachEmailRecord[]): DemoOutreach {
  return {
    schoolId: row.id,
    crmStatus: isCrmStatus(row.crm_status) ? row.crm_status : "not_contacted",
    lastContactedAt: row.last_contacted_at,
    nextFollowUpAt: row.next_follow_up_at,
    contactName: row.contact_name ?? "",
    contactEmail: row.contact_email ?? "",
    website: row.website ?? "",
    touches,
    emails,
  };
}

async function listTouches(supabase: SupabaseClient, schoolIds: string[]): Promise<Map<string, DemoOutreachTouch[]>> {
  const bySchool = new Map<string, DemoOutreachTouch[]>();
  if (schoolIds.length === 0) return bySchool;

  const { data, error } = await supabase
    .from("crm_outreach_touches")
    .select(TOUCH_COLUMNS)
    .in("school_id", schoolIds)
    .order("occurred_at", { ascending: false });
  if (error) throw error;

  for (const row of (data ?? []) as TouchRow[]) {
    const list = bySchool.get(row.school_id) ?? [];
    list.push(toTouch(row));
    bySchool.set(row.school_id, list);
  }
  return bySchool;
}

/** Outreach state for every CRM school linked to a demo, keyed by demo slug. */
export async function listDemoOutreach(supabase: SupabaseClient): Promise<Record<string, DemoOutreach>> {
  const { data, error } = await supabase
    .from("schools")
    .select(SCHOOL_COLUMNS)
    .not("demo_slug", "is", null)
    .order("updated_at", { ascending: false });
  if (error) throw error;

  // If several CRM rows point at one demo, the most recently updated one wins.
  const bySlug = new Map<string, SchoolRow>();
  for (const row of (data ?? []) as SchoolRow[]) {
    if (row.demo_slug && !bySlug.has(row.demo_slug)) bySlug.set(row.demo_slug, row);
  }

  const ids = [...bySlug.values()].map((row) => row.id);
  const [touches, emails] = await Promise.all([listTouches(supabase, ids), listOutreachEmails(supabase, ids)]);
  const result: Record<string, DemoOutreach> = {};
  for (const [slug, row] of bySlug) {
    result[slug] = toOutreach(row, touches.get(row.id) ?? [], emails.get(row.id) ?? []);
  }
  return result;
}

export async function getSchoolForDemo(supabase: SupabaseClient, demoSlug: string): Promise<SchoolRow | null> {
  const { data, error } = await supabase
    .from("schools")
    .select(SCHOOL_COLUMNS)
    .eq("demo_slug", demoSlug)
    .order("updated_at", { ascending: false })
    .limit(1);
  if (error) throw error;
  return ((data ?? []) as SchoolRow[])[0] ?? null;
}

/**
 * The CRM school linked to a demo, creating a minimal CRM row when the demo has none yet
 * (so it also shows up on /admin/research).
 */
export async function ensureSchoolForDemo(
  supabase: SupabaseClient,
  demo: { slug: string; schoolName: string },
): Promise<SchoolRow> {
  const existing = await getSchoolForDemo(supabase, demo.slug);
  if (existing) return existing;

  const schoolKey = `demo-${demo.slug}`;
  const { data, error } = await supabase
    .from("schools")
    .insert({
      school_id: schoolKey,
      name: demo.schoolName,
      state: "",
      location: "",
      website: "",
      school_model: "",
      source_file: "demo",
      demo_slug: demo.slug,
    })
    .select(SCHOOL_COLUMNS)
    .single();
  if (!error) return data as SchoolRow;
  if (error.code !== "23505") throw error;

  // A row we created earlier was since unlinked in the CRM: relink it rather than overwrite it.
  const { data: relinked, error: relinkError } = await supabase
    .from("schools")
    .update({ demo_slug: demo.slug })
    .eq("school_id", schoolKey)
    .select(SCHOOL_COLUMNS)
    .single();
  if (relinkError) throw relinkError;
  return relinked as SchoolRow;
}

export async function loadOutreach(supabase: SupabaseClient, schoolId: string): Promise<DemoOutreach> {
  const { data, error } = await supabase.from("schools").select(SCHOOL_COLUMNS).eq("id", schoolId).single();
  if (error) throw error;
  const [touches, emails] = await Promise.all([listTouches(supabase, [schoolId]), listOutreachEmails(supabase, [schoolId])]);
  return toOutreach(data as SchoolRow, touches.get(schoolId) ?? [], emails.get(schoolId) ?? []);
}

export async function updateDemoOutreach(
  supabase: SupabaseClient,
  schoolId: string,
  patch: { crmStatus?: CrmStatus; nextFollowUpAt?: string | null },
): Promise<DemoOutreach> {
  const updates: Record<string, unknown> = {};
  if (patch.crmStatus !== undefined) updates.crm_status = patch.crmStatus;
  if (patch.nextFollowUpAt !== undefined) updates.next_follow_up_at = patch.nextFollowUpAt;

  if (Object.keys(updates).length > 0) {
    const { error } = await supabase.from("schools").update(updates).eq("id", schoolId);
    if (error) throw error;
  }
  return loadOutreach(supabase, schoolId);
}

export type LogTouchInput = {
  channel: OutreachChannel;
  direction: OutreachDirection;
  note: string;
  occurredAt: string;
  /** undefined = leave the follow-up date alone; null = clear it. */
  nextFollowUpAt?: string | null;
  createdBy?: string | null;
};

export async function logDemoOutreachTouch(
  supabase: SupabaseClient,
  school: Pick<SchoolRow, "id" | "crm_status" | "last_contacted_at">,
  input: LogTouchInput,
): Promise<DemoOutreach> {
  const { error: insertError } = await supabase.from("crm_outreach_touches").insert({
    school_id: school.id,
    channel: input.channel,
    direction: input.direction,
    note: input.note,
    occurred_at: input.occurredAt,
    created_by: input.createdBy ?? null,
  });
  if (insertError) throw insertError;

  const current: CrmStatus = isCrmStatus(school.crm_status) ? school.crm_status : "not_contacted";
  const updates: Record<string, unknown> = {};
  const nextStatus = nextStatusAfterTouch(current, input.direction);
  if (nextStatus !== current) updates.crm_status = nextStatus;

  // last_contacted_at = our latest outbound touch (a backdated log never moves it backwards).
  if (
    input.direction === "outbound" &&
    (!school.last_contacted_at || new Date(input.occurredAt) > new Date(school.last_contacted_at))
  ) {
    updates.last_contacted_at = input.occurredAt;
  }
  if (input.nextFollowUpAt !== undefined) updates.next_follow_up_at = input.nextFollowUpAt;

  if (Object.keys(updates).length > 0) {
    const { error } = await supabase.from("schools").update(updates).eq("id", school.id);
    if (error) throw error;
  }
  return loadOutreach(supabase, school.id);
}

/** Deletes a touch and returns the school's refreshed outreach (null when the touch didn't exist). */
export async function deleteDemoOutreachTouch(
  supabase: SupabaseClient,
  touchId: string,
): Promise<DemoOutreach | null> {
  const { data, error } = await supabase
    .from("crm_outreach_touches")
    .delete()
    .eq("id", touchId)
    .select("school_id");
  if (error) throw error;
  const schoolId = ((data ?? []) as { school_id: string }[])[0]?.school_id;
  return schoolId ? loadOutreach(supabase, schoolId) : null;
}

/**
 * Every school's sent steps and logged touches, keyed by `schools.id` (for /admin/research).
 * Pages past PostgREST's row cap so older steps and mailed letters stay in each history.
 */
export async function listSchoolOutreachLogs(
  supabase: SupabaseClient,
): Promise<Record<string, { emails: OutreachEmailRecord[]; touches: DemoOutreachTouch[] }>> {
  const [emailRows, touchRows] = await Promise.all([
    fetchAllPostgrestRows(async (from, to) =>
      supabase
        .from("crm_outreach_emails")
        .select(EMAIL_COLUMNS)
        .order("sent_at", { ascending: false })
        .order("id", { ascending: false })
        .range(from, to),
    ),
    fetchAllPostgrestRows(async (from, to) =>
      supabase
        .from("crm_outreach_touches")
        .select(TOUCH_COLUMNS)
        .order("occurred_at", { ascending: false })
        .order("id", { ascending: false })
        .range(from, to),
    ),
  ]);

  const result: Record<string, { emails: OutreachEmailRecord[]; touches: DemoOutreachTouch[] }> = {};
  const entry = (schoolId: string) => (result[schoolId] ??= { emails: [], touches: [] });
  for (const row of emailRows as EmailRow[]) entry(row.school_id).emails.push(toEmailRecord(row));
  for (const row of touchRows as TouchRow[]) entry(row.school_id).touches.push(toTouch(row));
  return result;
}
