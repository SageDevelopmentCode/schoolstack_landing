/**
 * Client-safe types and helpers for the /admin/research outreach workspace.
 * Rows come from `public.schools` (202601010001_add_crm_schools_table.sql + later migrations).
 */
import type { OutreachPlan } from "@/data/outreach/types";
import { isCrmStatus, type CrmStatus } from "@/lib/admin-crm/crm-status";
import type { DemoOutreachTouch, OutreachEmailRecord } from "@/lib/admin-crm/demo-outreach-types";

export type ResearchSchool = {
  id: string;
  school_id: string;
  name: string;
  state: string;
  location: string;
  website: string;
  school_model: string;
  grades: string;
  estimated_size: string;
  tuition_schedule: string;
  strengths: string[];
  pain_points: string[];
  software_fit_reason: string;
  priority_score: number;
  confidence: string;
  is_closing: boolean;
  source_file: string;
  crm_status: CrmStatus;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  notes: string;
  last_contacted_at: string | null;
  next_follow_up_at: string | null;
  demo_slug: string | null;
  /** The handwritten letter is written, addressed and stamped, waiting to be posted (null otherwise). */
  letter_ready_at: string | null;
  updated_at: string;
};

/** Sent steps and logged touches for one school (newest first). */
export type SchoolOutreachLog = { emails: OutreachEmailRecord[]; touches: DemoOutreachTouch[] };

export type ResearchWorkspaceData = {
  schools: ResearchSchool[];
  /** Keyed by `schools.id`; schools with no outreach yet are absent. */
  outreach: Record<string, SchoolOutreachLog>;
  /**
   * Outreach plans for these schools, keyed by demo slug. Sent by the server (behind the admin login)
   * because plans carry private snapshot tokens: never import the plan registry into client code.
   */
  plans: Record<string, OutreachPlan>;
};

export const EMPTY_OUTREACH_LOG: SchoolOutreachLog = { emails: [], touches: [] };

/** Fields the workspace may change on a school (PATCH /api/admin/research/schools/[id]). */
export const EDITABLE_SCHOOL_FIELDS = [
  "crm_status",
  "priority_score",
  "demo_slug",
  "website",
  "contact_name",
  "contact_email",
  "contact_phone",
  "notes",
  "next_follow_up_at",
  "letter_ready_at",
] as const;
export type EditableSchoolField = (typeof EDITABLE_SCHOOL_FIELDS)[number];
export type SchoolPatch = Partial<Pick<ResearchSchool, EditableSchoolField>>;

/** Fields for a new school (POST /api/admin/research/schools). */
export type NewSchoolInput = {
  name: string;
  state: string;
  location: string;
  website: string;
  school_model: string;
  grades: string;
  estimated_size: string;
  tuition_schedule: string;
  strengths: string[];
  pain_points: string[];
  software_fit_reason: string;
  priority_score: number;
  confidence: string;
  is_closing: boolean;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  notes: string;
};

function text(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function lines(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string" && v.trim() !== "") : [];
}

/** Normalises a raw `schools` row (nulls → "", unknown status → not_contacted). */
export function toResearchSchool(row: Record<string, unknown>): ResearchSchool {
  const priority = Number(row.priority_score);
  return {
    id: text(row.id),
    school_id: text(row.school_id),
    name: text(row.name),
    state: text(row.state),
    location: text(row.location),
    website: text(row.website),
    school_model: text(row.school_model),
    grades: text(row.grades),
    estimated_size: text(row.estimated_size),
    tuition_schedule: text(row.tuition_schedule),
    strengths: lines(row.strengths),
    pain_points: lines(row.pain_points),
    software_fit_reason: text(row.software_fit_reason),
    priority_score: Number.isFinite(priority) ? Math.min(5, Math.max(1, Math.round(priority))) : 4,
    confidence: text(row.confidence),
    is_closing: row.is_closing === true,
    source_file: text(row.source_file),
    crm_status: isCrmStatus(row.crm_status) ? row.crm_status : "not_contacted",
    contact_name: text(row.contact_name),
    contact_email: text(row.contact_email),
    contact_phone: text(row.contact_phone),
    notes: text(row.notes),
    last_contacted_at: typeof row.last_contacted_at === "string" ? row.last_contacted_at : null,
    next_follow_up_at: typeof row.next_follow_up_at === "string" ? row.next_follow_up_at : null,
    demo_slug: typeof row.demo_slug === "string" && row.demo_slug ? row.demo_slug : null,
    letter_ready_at: typeof row.letter_ready_at === "string" ? row.letter_ready_at : null,
    updated_at: text(row.updated_at),
  };
}

/** Priority first, then name: the list's order. */
export function compareSchools(a: ResearchSchool, b: ResearchSchool): number {
  return b.priority_score - a.priority_score || a.name.localeCompare(b.name);
}

export const PRIORITY_LABEL: Record<number, string> = {
  5: "Hot lead",
  4: "Strong fit",
  3: "Moderate",
  2: "Low",
  1: "Closing",
};

export function slugifySchoolName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
