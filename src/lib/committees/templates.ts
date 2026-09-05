import type {
  CommitteeTemplate,
  CommitteeTemplateConfig,
  CommitteeType,
} from "./types";
import { DEFAULT_SECTIONS } from "./types";

export type PlatformTemplateSeed = Omit<CommitteeTemplate, "id" | "organizationId">;

const ANNUAL_SECTIONS = [...DEFAULT_SECTIONS] as CommitteeTemplateConfig["sections"];

export const CUSTOM_COMMITTEE_SLUG = "custom";

export const CUSTOM_COMMITTEE_TEMPLATE: PlatformTemplateSeed = {
  slug: CUSTOM_COMMITTEE_SLUG,
  name: "Custom committee",
  type: "annual_volunteer",
  description:
    "Start from scratch with your own name and description — no preloaded roles or resources.",
  config: {
    sections: ANNUAL_SECTIONS,
    defaultTermLabel: "2025–2026 School Year",
    taskGroups: [{ id: "general", label: "General" }],
    defaultDutyRoles: [],
    defaultResources: [],
  },
};

export const PLATFORM_COMMITTEE_TEMPLATES: PlatformTemplateSeed[] = [
  {
    slug: "annual-volunteer",
    name: "Annual Volunteer Committee",
    type: "annual_volunteer",
    description:
      "School-year volunteer team with seasonal projects, class activities, and community support.",
    config: {
      sections: ANNUAL_SECTIONS,
      defaultTermLabel: "2025–2026 School Year",
      taskGroups: [
        { id: "annual_fall", label: "Fall Project" },
        { id: "annual_spring", label: "Spring Project" },
        { id: "class_projects", label: "Class Projects" },
        { id: "general", label: "General" },
      ],
      defaultDutyRoles: [
        {
          title: "Committee Lead",
          description: "Coordinates planning meetings and overall committee direction.",
        },
        {
          title: "Faculty Liaison",
          description: "School staff coordination and scheduling.",
        },
      ],
    },
  },
  {
    slug: "event",
    name: "Event Committee",
    type: "event",
    description:
      "Seasonal event planning with booth assignments, setup guides, and event-day coordination.",
    config: {
      sections: ANNUAL_SECTIONS,
      defaultTermLabel: "Fall 2025",
      taskGroups: [
        { id: "booths", label: "Booths & Activities" },
        { id: "general", label: "Event Logistics" },
      ],
      defaultDutyRoles: [
        {
          title: "Committee Lead",
          description: "Overall event planning, meetings, and event-day coordination.",
        },
        {
          title: "Booth Coordinator",
          description: "Assigns and supports booth leads for activities and games.",
        },
        {
          title: "Event Logistics Lead",
          description: "Setup schedules, supply collection, and site map coordination.",
        },
      ],
    },
  },
  {
    slug: "long-term-role",
    name: "Long-Term Role Committee",
    type: "long_term_role",
    description:
      "Multi-year parent representatives or coordinators with durable resources and ongoing communication.",
    config: {
      sections: ANNUAL_SECTIONS,
      defaultTermLabel: "2024–2026",
      showGradeColumn: true,
      taskGroups: [{ id: "general", label: "General" }],
      defaultDutyRoles: [
        {
          title: "Committee Lead",
          description: "Coordinates representatives and school communication.",
        },
        {
          title: "Faculty Liaison",
          description: "School staff partner for faculty communication.",
        },
      ],
    },
  },
  {
    slug: "hybrid",
    name: "Hybrid Committee",
    type: "hybrid",
    description:
      "Blend of ongoing initiatives and annual projects connecting school and community.",
    config: {
      sections: ANNUAL_SECTIONS,
      defaultTermLabel: "2025–2026 School Year",
      taskGroups: [
        { id: "initiatives", label: "Initiatives" },
        { id: "annual_projects", label: "Annual Projects" },
        { id: "general", label: "General" },
      ],
      defaultDutyRoles: [
        {
          title: "Committee Lead",
          description: "Coordinates planning and long-term initiatives.",
        },
        {
          title: "Outreach Lead",
          description: "Community partner and stakeholder relationships.",
        },
      ],
    },
  },
];

export function getPlatformTemplateBySlug(slug: string): PlatformTemplateSeed | undefined {
  if (slug === CUSTOM_COMMITTEE_SLUG) return CUSTOM_COMMITTEE_TEMPLATE;
  return PLATFORM_COMMITTEE_TEMPLATES.find((t) => t.slug === slug);
}

export function getPlatformTemplateByType(type: CommitteeType): PlatformTemplateSeed {
  return (
    PLATFORM_COMMITTEE_TEMPLATES.find((t) => t.type === type) ??
    PLATFORM_COMMITTEE_TEMPLATES[0]
  );
}

export function resolveTemplateConfig(
  config: Partial<CommitteeTemplateConfig> | null | undefined,
): CommitteeTemplateConfig {
  return {
    sections: config?.sections?.length ? config.sections : DEFAULT_SECTIONS,
    taskGroups: config?.taskGroups ?? [],
    defaultDutyRoles: config?.defaultDutyRoles ?? [],
    defaultResources: config?.defaultResources ?? [],
    showGradeColumn: config?.showGradeColumn ?? false,
    defaultTermLabel: config?.defaultTermLabel ?? "",
  };
}
