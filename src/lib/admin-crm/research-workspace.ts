import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getOutreachPlan } from "@/data/outreach";
import type { OutreachPlan } from "@/data/outreach/types";
import { schoolDemoRegistry } from "@/data/school-demos";
import { isCrmStatus } from "@/lib/admin-crm/crm-status";
import { listSchoolOutreachLogs } from "@/lib/admin-crm/demo-outreach";
import { parseOptionalDate } from "@/lib/admin-crm/demo-outreach-api";
import {
  compareSchools,
  slugifySchoolName,
  toResearchSchool,
  type NewSchoolInput,
  type ResearchSchool,
  type ResearchWorkspaceData,
  type SchoolPatch,
} from "@/lib/admin-crm/research-types";

/** Schools (closing ones left out) plus their outreach logs, for /admin/research. */
export async function loadResearchWorkspace(supabase: SupabaseClient): Promise<ResearchWorkspaceData> {
  const [schoolsResult, outreach] = await Promise.all([
    supabase.from("schools").select("*").order("priority_score", { ascending: false }),
    listSchoolOutreachLogs(supabase),
  ]);
  if (schoolsResult.error) throw schoolsResult.error;
  const schools = ((schoolsResult.data ?? []) as Record<string, unknown>[])
    .map(toResearchSchool)
    .filter((s) => !s.is_closing)
    .sort(compareSchools);
  const plans: Record<string, OutreachPlan> = {};
  for (const school of schools) {
    const plan = researchPlanFor(school.demo_slug);
    if (plan && school.demo_slug) plans[school.demo_slug] = plan;
  }
  return { schools, outreach, plans };
}

/** The outreach plan for a demo slug, or null. Server-only: plans carry private snapshot tokens. */
export function researchPlanFor(slug: string | null): OutreachPlan | null {
  return slug ? getOutreachPlan(slug) : null;
}

export class ResearchInputError extends Error {}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function cleanText(value: unknown, field: string, max = 2000): string {
  if (value === null || value === undefined) return "";
  if (typeof value !== "string") throw new ResearchInputError(`${field} must be text.`);
  const trimmed = value.trim();
  if (trimmed.length > max) throw new ResearchInputError(`${field} is too long.`);
  return trimmed;
}

function cleanPriority(value: unknown): number {
  const n = Number(value);
  if (!Number.isInteger(n) || n < 1 || n > 5) throw new ResearchInputError("Priority must be 1–5.");
  return n;
}

function cleanEmail(value: unknown): string {
  const email = cleanText(value, "Email", 320).toLowerCase();
  if (email && !EMAIL_RE.test(email)) throw new ResearchInputError("Enter a valid email address.");
  return email;
}

/** Validates a PATCH body into a column update. Unknown keys are ignored. */
export function parseSchoolPatch(body: Record<string, unknown>): SchoolPatch {
  const patch: SchoolPatch = {};
  if ("crm_status" in body) {
    if (!isCrmStatus(body.crm_status)) throw new ResearchInputError("Unknown status.");
    patch.crm_status = body.crm_status;
  }
  if ("priority_score" in body) patch.priority_score = cleanPriority(body.priority_score);
  if ("demo_slug" in body) {
    const slug = body.demo_slug;
    if (slug === null || slug === "") patch.demo_slug = null;
    else if (typeof slug === "string" && Object.prototype.hasOwnProperty.call(schoolDemoRegistry, slug)) patch.demo_slug = slug;
    else throw new ResearchInputError("Unknown demo.");
  }
  if ("website" in body) patch.website = cleanText(body.website, "Website", 500);
  if ("contact_name" in body) patch.contact_name = cleanText(body.contact_name, "Contact name", 200);
  if ("contact_email" in body) patch.contact_email = cleanEmail(body.contact_email);
  if ("contact_phone" in body) patch.contact_phone = cleanText(body.contact_phone, "Phone", 50);
  if ("notes" in body) patch.notes = cleanText(body.notes, "Notes", 10000);
  if ("next_follow_up_at" in body) {
    const parsed = parseOptionalDate(body.next_follow_up_at);
    if (!parsed.ok) throw new ResearchInputError("Follow-up must be a date.");
    patch.next_follow_up_at = parsed.value ?? null;
  }
  if ("letter_ready_at" in body) {
    const parsed = parseOptionalDate(body.letter_ready_at);
    if (!parsed.ok) throw new ResearchInputError("Letter ready must be a date.");
    patch.letter_ready_at = parsed.value ?? null;
  }
  if (Object.keys(patch).length === 0) throw new ResearchInputError("Nothing to update.");
  return patch;
}

export async function updateResearchSchool(
  supabase: SupabaseClient,
  id: string,
  patch: SchoolPatch,
): Promise<ResearchSchool | null> {
  const { data, error } = await supabase.from("schools").update(patch).eq("id", id).select("*");
  if (error) throw error;
  const row = ((data ?? []) as Record<string, unknown>[])[0];
  return row ? toResearchSchool(row) : null;
}

function cleanLines(value: unknown, field: string): string[] {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value)) throw new ResearchInputError(`${field} must be a list.`);
  return value.map((v) => cleanText(v, field, 500)).filter(Boolean);
}

export function parseNewSchool(body: Record<string, unknown>): NewSchoolInput {
  const input: NewSchoolInput = {
    name: cleanText(body.name, "Name", 200),
    state: cleanText(body.state, "State", 40).toUpperCase(),
    location: cleanText(body.location, "Location", 200),
    website: cleanText(body.website, "Website", 500),
    school_model: cleanText(body.school_model, "School model", 200),
    grades: cleanText(body.grades, "Grades", 200),
    estimated_size: cleanText(body.estimated_size, "Size", 200),
    tuition_schedule: cleanText(body.tuition_schedule, "Tuition", 500),
    strengths: cleanLines(body.strengths, "Strengths"),
    pain_points: cleanLines(body.pain_points, "Pain points"),
    software_fit_reason: cleanText(body.software_fit_reason, "Why MudKitchen fits", 2000),
    priority_score: body.priority_score === undefined ? 4 : cleanPriority(body.priority_score),
    confidence: cleanText(body.confidence, "Confidence", 40),
    is_closing: body.is_closing === true,
    contact_name: cleanText(body.contact_name, "Contact name", 200),
    contact_email: cleanEmail(body.contact_email),
    contact_phone: cleanText(body.contact_phone, "Phone", 50),
    notes: cleanText(body.notes, "Notes", 10000),
  };
  if (!input.name || !input.state || !input.location || !input.website || !input.school_model) {
    throw new ResearchInputError("Fill in the name, state, location, website and school model.");
  }
  return input;
}

export async function createResearchSchool(supabase: SupabaseClient, input: NewSchoolInput): Promise<ResearchSchool> {
  const base = slugifySchoolName(input.name) || "school";
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const schoolId = attempt === 0 ? base : `${base}-${Date.now().toString(36)}${attempt}`;
    const { data, error } = await supabase
      .from("schools")
      .insert({ ...input, school_id: schoolId, source_file: "manual", crm_status: "not_contacted" })
      .select("*")
      .single();
    if (!error) return toResearchSchool(data as Record<string, unknown>);
    if (error.code !== "23505") throw error;
  }
  throw new ResearchInputError("A school with this name already exists.");
}
