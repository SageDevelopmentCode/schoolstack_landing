import type { Program } from "@/lib/admissions/programs";
import { DEFAULT_PROGRAM_PARENT_PORTAL_SETTINGS } from "@/lib/admissions/program-parent-portal";
import { DEMO_PORTAL_ORG_ID } from "./demo-portal-shared";

const DEMO_CREATED_AT = "2026-06-01T12:00:00.000Z";
const DEMO_UPDATED_AT = "2026-08-20T12:00:00.000Z";

export function buildDemoPrograms(): Program[] {
  return [
    {
      id: "program-primary",
      organization_id: DEMO_PORTAL_ORG_ID,
      name: "Primary Program",
      description:
        "A nurturing foundation for ages 4–6 with hands-on learning, outdoor play, and early literacy.",
      portal_slug: "primary",
      parent_portal_settings: {
        ...DEFAULT_PROGRAM_PARENT_PORTAL_SETTINGS,
        label: "Primary families",
      },
      type: "school_year",
      status: "open",
      start_date: "2026-08-18",
      end_date: "2027-05-22",
      capacity: 24,
      created_at: DEMO_CREATED_AT,
      updated_at: DEMO_UPDATED_AT,
    },
    {
      id: "program-lower",
      organization_id: DEMO_PORTAL_ORG_ID,
      name: "Lower Elementary",
      description:
        "Project-based learning for 1st–3rd grade with mixed-age studios and nature immersion.",
      portal_slug: "lower-elementary",
      parent_portal_settings: {
        mode: "isolated",
        label: "Lower Elementary portal",
        features: {
          billing: true,
          messages: true,
          calendar: true,
        },
      },
      type: "school_year",
      status: "open",
      start_date: "2026-08-18",
      end_date: "2027-05-22",
      capacity: 36,
      created_at: DEMO_CREATED_AT,
      updated_at: DEMO_UPDATED_AT,
    },
    {
      id: "program-coop",
      organization_id: DEMO_PORTAL_ORG_ID,
      name: "Friday Co-op",
      description:
        "Parent-led cooperative enrichment with shared curriculum, supply lists, and teaching rotations.",
      portal_slug: "friday-coop",
      parent_portal_settings: {
        mode: "inherit",
        coop_mode: true,
        label: "Co-op families",
        features: {
          portal: true,
          billing: false,
          messages: true,
          calendar: true,
        },
      },
      type: "school_year",
      status: "waitlist",
      start_date: "2026-08-22",
      end_date: "2027-05-16",
      capacity: 18,
      created_at: DEMO_CREATED_AT,
      updated_at: DEMO_UPDATED_AT,
    },
    {
      id: "program-summer",
      organization_id: DEMO_PORTAL_ORG_ID,
      name: "Summer Discovery Camp",
      description: "Six-week summer camp with weekly themes, field trips, and flexible scheduling.",
      portal_slug: "summer-camp",
      parent_portal_settings: DEFAULT_PROGRAM_PARENT_PORTAL_SETTINGS,
      type: "summer",
      status: "closed",
      start_date: "2026-06-02",
      end_date: "2026-07-18",
      capacity: 40,
      created_at: DEMO_CREATED_AT,
      updated_at: DEMO_UPDATED_AT,
    },
  ];
}

export const DEMO_PROGRAM_PARENT_PORTAL_CONFIG = {
  enabled: true,
  isolated_program_ids: ["program-lower"],
};
