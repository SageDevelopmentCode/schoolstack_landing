"use client";
// THROWAWAY verification lab — delete before committing.
import { DemoOutreachFunnel } from "@/components/admin/demos/DemoOutreachFunnel";
import type { DemoCard } from "@/components/admin/demos/DemoOutreachBoard";
import type { DemoOutreach } from "@/lib/admin-crm/demo-outreach-types";
const store: Record<string, DemoOutreach> = {
  "wonderhere-lakeland": { schoolId: "w", crmStatus: "not_contacted", lastContactedAt: null, nextFollowUpAt: null, contactName: "Jo Smith", contactEmail: "jo@example.com", website: "https://wonderhere.example", touches: [], emails: [] },
};
declare global { interface Window { __copied?: string[] } }
if (typeof window !== "undefined" && !window.__copied) {
  window.__copied = [];
  Object.defineProperty(navigator, "clipboard", { value: { writeText: async (t: string) => { window.__copied!.push(t); } }, configurable: true });
}
export default function LabClient({ demos }: { demos: DemoCard[] }) {
  return <div className="bg-admin-bg h-screen flex flex-col"><DemoOutreachFunnel demos={demos} initialOutreach={store} /></div>;
}
