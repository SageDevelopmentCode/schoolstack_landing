/** Shared setup for scripts/outreach/*: loads .env.local and gives a service-role Supabase client. */
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { config } from "dotenv";
import { schoolDemoHref, schoolDemoRegistry } from "@/data/school-demos";
import { createAdminClient } from "@/utils/supabase/admin";

config({ path: resolve(process.cwd(), ".env.local"), quiet: true });

export function adminClient() {
  return createAdminClient();
}

export const SCHOOL_COLUMNS =
  "id, school_id, name, state, location, website, crm_status, demo_slug, contact_name, contact_email, priority_score, is_closing, updated_at";

export type CrmSchool = {
  id: string;
  school_id: string;
  name: string;
  state: string | null;
  location: string | null;
  website: string | null;
  crm_status: string;
  demo_slug: string | null;
  contact_name: string | null;
  contact_email: string | null;
  priority_score: number | null;
  is_closing: boolean | null;
  updated_at: string;
};

export function hasDemoConfig(slug: string): boolean {
  return Object.prototype.hasOwnProperty.call(schoolDemoRegistry, slug);
}

export function demoRouteExists(slug: string): boolean {
  return existsSync(resolve(process.cwd(), "src/app", `${schoolDemoHref(slug).slice(1)}/page.tsx`));
}

export function planFileExists(slug: string): boolean {
  return existsSync(resolve(process.cwd(), "src/data/outreach", `${slug}.ts`));
}

export function auditReportExists(slug: string): boolean {
  return existsSync(resolve(process.cwd(), ".site-audits", `${slug}.md`));
}

/** "www.example.org" from any URL-ish string. */
export function hostOf(url: string | null | undefined): string {
  if (!url) return "";
  try {
    return new URL(url.startsWith("http") ? url : `https://${url}`).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}
