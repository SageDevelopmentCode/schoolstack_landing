import type { LucideIcon } from "lucide-react";
import {
  ClipboardList,
  GraduationCap,
  ListChecks,
  Telescope,
} from "lucide-react";
import {
  isAdminFeatureEnabled,
  isAdminNavPathEnabled,
  schoolAdminPath,
} from "@/lib/organization-settings/admin-routes";
import { getFeatureIcon } from "@/lib/organization-settings/icon-registry";
import type { OrganizationFeatures } from "@/lib/organization-settings/types";

export type JourneyStageId = "prospects" | "applicants" | "enrolling" | "enrolled";

export type JourneyLink = {
  id: string;
  stageId: JourneyStageId;
  title: string;
  subtitle: string;
  href: string;
  icon: LucideIcon;
  bannerSrc: string;
};

export type JourneySection = {
  id: JourneyStageId;
  label: string;
  description: string;
  icon: LucideIcon;
  links: JourneyLink[];
};

type JourneyLinkDef = {
  id: string;
  title: string;
  subtitle: string;
  iconSlug: string;
  bannerSrc: string;
  href: (slug: string) => string;
  isEnabled: (features: OrganizationFeatures) => boolean;
};

function scheduleTabHref(slug: string, tab: string): string {
  return `${schoolAdminPath(slug, "schedule")}?tab=${tab}`;
}

const APPLICATION_FORM_JOURNEY_FIELDS: Omit<JourneyLinkDef, "id"> = {
  title: "Application form",
  subtitle: "Edit questions, fees, and publish settings for families applying.",
  iconSlug: "git-branch",
  bannerSrc: "/images/stock/ImageOne.webp",
  href: (slug) => `${schoolAdminPath(slug, "admissions", "flows")}?flow=apply`,
  isEnabled: (features) => isAdminNavPathEnabled(features, "admissions", "flows"),
};

function applicationFormJourneyLink(id: string): JourneyLinkDef {
  return { id, ...APPLICATION_FORM_JOURNEY_FIELDS };
}

const JOURNEY_LINK_DEFS: Record<JourneyStageId, JourneyLinkDef[]> = {
  prospects: [
    {
      id: "tours",
      title: "Tours & interviews",
      subtitle: "Set 30-minute tour and interview slots for visiting families.",
      iconSlug: "calendar-days",
      bannerSrc: "/images/stock/Homeschool.webp",
      href: (slug) => scheduleTabHref(slug, "tours"),
      isEnabled: (features) => isAdminFeatureEnabled(features, "schedule"),
    },
    {
      id: "shadow-days",
      title: "Shadow days",
      subtitle: "Open observation and shadow visit days on your calendar.",
      iconSlug: "calendar-days",
      bannerSrc: "/images/stock/Homeschool2.webp",
      href: (slug) => scheduleTabHref(slug, "shadow"),
      isEnabled: (features) => isAdminFeatureEnabled(features, "schedule"),
    },
    {
      id: "all-visits",
      title: "All visits",
      subtitle: "Every booked tour, interview, and shadow day.",
      iconSlug: "calendar-days",
      bannerSrc: "/images/stock/Homeschool3.webp",
      href: (slug) => scheduleTabHref(slug, "visits"),
      isEnabled: (features) => isAdminFeatureEnabled(features, "schedule"),
    },
    {
      id: "school-profile",
      title: "School profile",
      subtitle: "Public page families see: location, photos, and story.",
      iconSlug: "map-pin",
      bannerSrc: "/images/stock/ImageTwelve.webp",
      href: (slug) => schoolAdminPath(slug, "my_school", "school_profile"),
      isEnabled: (features) =>
        isAdminNavPathEnabled(features, "my_school", "school_profile"),
    },
    applicationFormJourneyLink("application-form"),
  ],
  applicants: [
    applicationFormJourneyLink("application-form-applicants"),
    {
      id: "submissions",
      title: "Submissions",
      subtitle: "Review applications, update status, and open family detail.",
      iconSlug: "clipboard-list",
      bannerSrc: "/images/stock/ImageTwo.webp",
      href: (slug) => schoolAdminPath(slug, "admissions", "submissions"),
      isEnabled: (features) =>
        isAdminNavPathEnabled(features, "admissions", "submissions"),
    },
    {
      id: "admissions-payments",
      title: "Admissions payments",
      subtitle: "Application fees and enrollment charges across families.",
      iconSlug: "credit-card",
      bannerSrc: "/images/stock/ImageThree.webp",
      href: (slug) => schoolAdminPath(slug, "admissions", "payments"),
      isEnabled: (features) => isAdminNavPathEnabled(features, "admissions", "payments"),
    },
  ],
  enrolling: [
    {
      id: "enrolling-submissions",
      title: "Submissions",
      subtitle: "Accepted families completing enrollment checklists and deposits.",
      iconSlug: "clipboard-list",
      bannerSrc: "/images/stock/ImageFour.webp",
      href: (slug) => schoolAdminPath(slug, "admissions", "submissions"),
      isEnabled: (features) =>
        isAdminNavPathEnabled(features, "admissions", "submissions"),
    },
    {
      id: "enrollment-flows",
      title: "Enrollment flows & checklists",
      subtitle: "Build checklists and enrollment paths families complete after acceptance.",
      iconSlug: "git-branch",
      bannerSrc: "/images/stock/ImageFive.webp",
      href: (slug) => schoolAdminPath(slug, "admissions", "flows"),
      isEnabled: (features) => isAdminNavPathEnabled(features, "admissions", "flows"),
    },
    {
      id: "enrolling-payments",
      title: "Admissions payments",
      subtitle: "Track enrollment deposits and related charges.",
      iconSlug: "credit-card",
      bannerSrc: "/images/stock/ImageSix.webp",
      href: (slug) => schoolAdminPath(slug, "admissions", "payments"),
      isEnabled: (features) => isAdminNavPathEnabled(features, "admissions", "payments"),
    },
  ],
  enrolled: [
    {
      id: "students",
      title: "My Students",
      subtitle: "Roster, profiles, and enrollment records for current learners.",
      iconSlug: "users",
      bannerSrc: "/images/stock/ImageSeven.webp",
      href: (slug) => schoolAdminPath(slug, "my_school", "students"),
      isEnabled: (features) => isAdminNavPathEnabled(features, "my_school", "students"),
    },
    {
      id: "attendance",
      title: "Attendance",
      subtitle: "Mark daily attendance and review today's roster.",
      iconSlug: "clipboard-list",
      bannerSrc: "/images/stock/ImageEight.webp",
      href: (slug) => schoolAdminPath(slug, "my_school", "attendance"),
      isEnabled: (features) => isAdminNavPathEnabled(features, "my_school", "attendance"),
    },
    {
      id: "classrooms",
      title: "Classrooms",
      subtitle: "Rooms, rosters, and staff assigned to each class.",
      iconSlug: "home",
      bannerSrc: "/images/stock/ImageThirteen.webp",
      href: (slug) => schoolAdminPath(slug, "my_school", "classrooms"),
      isEnabled: (features) => isAdminNavPathEnabled(features, "my_school", "classrooms"),
    },
    {
      id: "tuition",
      title: "Tuition",
      subtitle: "Billing, assignments, and family payment status.",
      iconSlug: "dollar-sign",
      bannerSrc: "/images/stock/ImageNine.webp",
      href: (slug) => schoolAdminPath(slug, "my_school", "tuition"),
      isEnabled: (features) => isAdminNavPathEnabled(features, "my_school", "tuition"),
    },
    {
      id: "programs",
      title: "Programs",
      subtitle: "Programs and offerings enrolled students belong to.",
      iconSlug: "book-open",
      bannerSrc: "/images/stock/ImageTen.webp",
      href: (slug) => schoolAdminPath(slug, "my_school", "programs"),
      isEnabled: (features) => isAdminNavPathEnabled(features, "my_school", "programs"),
    },
    {
      id: "forms-documents",
      title: "Forms & documents",
      subtitle: "School-wide forms and documents for families.",
      iconSlug: "file-text",
      bannerSrc: "/images/stock/ImageFourteen.webp",
      href: (slug) => schoolAdminPath(slug, "my_school", "forms_documents"),
      isEnabled: (features) =>
        isAdminNavPathEnabled(features, "my_school", "forms_documents"),
    },
    {
      id: "newsletters",
      title: "Newsletters",
      subtitle: "Email newsletters to enrolled families and groups.",
      iconSlug: "mail",
      bannerSrc: "/images/stock/Homeschool.webp",
      href: (slug) => schoolAdminPath(slug, "my_school", "newsletters"),
      isEnabled: (features) =>
        isAdminNavPathEnabled(features, "my_school", "newsletters"),
    },
    {
      id: "bulletin",
      title: "Bulletin",
      subtitle: "Flyers and announcements on the family bulletin.",
      iconSlug: "megaphone",
      bannerSrc: "/images/stock/Homeschool2.webp",
      href: (slug) => schoolAdminPath(slug, "bulletin"),
      isEnabled: (features) => isAdminFeatureEnabled(features, "bulletin"),
    },
    {
      id: "photos",
      title: "Photos",
      subtitle: "Albums and photos shared with families.",
      iconSlug: "image",
      bannerSrc: "/images/stock/Homeschool3.webp",
      href: (slug) => schoolAdminPath(slug, "photos"),
      isEnabled: (features) => isAdminFeatureEnabled(features, "photos"),
    },
    {
      id: "messages",
      title: "Messages",
      subtitle: "Write to enrolled families and school groups.",
      iconSlug: "message-square",
      bannerSrc: "/images/stock/ImageEleven.webp",
      href: (slug) => schoolAdminPath(slug, "messages"),
      isEnabled: (features) => isAdminFeatureEnabled(features, "messages"),
    },
  ],
};

const JOURNEY_STAGE_META: Record<
  JourneyStageId,
  { label: string; description: string; icon: LucideIcon }
> = {
  prospects: {
    label: "Prospects",
    description: "Families exploring your school before they apply.",
    icon: Telescope,
  },
  applicants: {
    label: "Applicants",
    description: "Active applications in your admissions pipeline.",
    icon: ClipboardList,
  },
  enrolling: {
    label: "Enrolling",
    description: "Accepted families finishing checklists and enrollment steps.",
    icon: ListChecks,
  },
  enrolled: {
    label: "Enrolled",
    description: "Current students and families in your school community.",
    icon: GraduationCap,
  },
};

const JOURNEY_STAGE_ORDER: JourneyStageId[] = [
  "prospects",
  "applicants",
  "enrolling",
  "enrolled",
];

function mapLinkDef(slug: string, stageId: JourneyStageId, def: JourneyLinkDef): JourneyLink {
  return {
    id: def.id,
    stageId,
    title: def.title,
    subtitle: def.subtitle,
    href: def.href(slug),
    icon: getFeatureIcon(def.iconSlug),
    bannerSrc: def.bannerSrc,
  };
}

export function buildJourneySections(
  slug: string,
  features: OrganizationFeatures,
): JourneySection[] {
  const sections: JourneySection[] = [];

  for (const stageId of JOURNEY_STAGE_ORDER) {
    const defs = JOURNEY_LINK_DEFS[stageId];
    const links = defs
      .filter((def) => def.isEnabled(features))
      .map((def) => mapLinkDef(slug, stageId, def));
    if (links.length === 0) continue;

    const meta = JOURNEY_STAGE_META[stageId];
    sections.push({
      id: stageId,
      label: meta.label,
      description: meta.description,
      icon: meta.icon,
      links,
    });
  }

  return sections;
}

export function journeyLinkCount(sections: JourneySection[]): number {
  return sections.reduce((total, section) => total + section.links.length, 0);
}

export function hasJourneyNavigator(features: OrganizationFeatures): boolean {
  return JOURNEY_STAGE_ORDER.some((stageId) =>
    JOURNEY_LINK_DEFS[stageId].some((def) => def.isEnabled(features)),
  );
}

export type JourneyStageAccent = {
  borderClass: string;
  chipBg: string;
  chipFg: string;
  bannerOverlayClass: string;
  tabInactiveIcon: string;
  tabActiveLabel: string;
};

const JOURNEY_STAGE_ACCENTS: Record<JourneyStageId, JourneyStageAccent> = {
  prospects: {
    borderClass: "border-t-[#7BA3C9]",
    chipBg: "#E3EEF6",
    chipFg: "#4A7A9E",
    bannerOverlayClass:
      "bg-gradient-to-t from-[#7BA3C9]/45 via-[#7BA3C9]/15 to-transparent",
    tabInactiveIcon: "#7BA3C9",
    tabActiveLabel: "#4A7A9E",
  },
  applicants: {
    borderClass: "border-t-[#C9A87B]",
    chipBg: "#F6EDE0",
    chipFg: "#9A7344",
    bannerOverlayClass:
      "bg-gradient-to-t from-[#C9A87B]/45 via-[#C9A87B]/15 to-transparent",
    tabInactiveIcon: "#C9A87B",
    tabActiveLabel: "#9A7344",
  },
  enrolling: {
    borderClass: "border-t-[#9B8BC4]",
    chipBg: "#EDE8F4",
    chipFg: "#6B5A94",
    bannerOverlayClass:
      "bg-gradient-to-t from-[#9B8BC4]/45 via-[#9B8BC4]/15 to-transparent",
    tabInactiveIcon: "#9B8BC4",
    tabActiveLabel: "#6B5A94",
  },
  enrolled: {
    borderClass: "border-t-[#6B9B7A]",
    chipBg: "#E5F0E8",
    chipFg: "#3D6B4A",
    bannerOverlayClass:
      "bg-gradient-to-t from-[#6B9B7A]/45 via-[#6B9B7A]/15 to-transparent",
    tabInactiveIcon: "#6B9B7A",
    tabActiveLabel: "#3D6B4A",
  },
};

export function journeyStageAccent(stageId: JourneyStageId): JourneyStageAccent {
  return JOURNEY_STAGE_ACCENTS[stageId];
}

export function journeyStageAccentBorder(stageId: JourneyStageId): string {
  return journeyStageAccent(stageId).borderClass;
}
