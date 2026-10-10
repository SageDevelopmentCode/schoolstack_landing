import type { LucideIcon } from "lucide-react";
import {
  Calendar,
  ClipboardList,
  CreditCard,
  GraduationCap,
  Inbox,
  ListChecks,
  Users,
} from "lucide-react";
import type { CarouselDemoCrop } from "@/components/admin/marketing/carousels/carousel-product-slide";
import {
  PRODUCT_PREVIEW_GROUP_COLORS,
  PRODUCT_PREVIEW_TABS,
  type ProductPreviewTabId,
} from "@/lib/marketing/product-preview-tabs";

export const GET_STARTED_MARKETING_DEMO_HEIGHT = 920;
export const GET_STARTED_PRODUCT_ADMIN_DEMO_HEIGHT = 920;
export const GET_STARTED_PRODUCT_PORTAL_DEMO_HEIGHT = 680;
export const SHOWCASE_COMPACT_PORTAL_HEIGHT = 680;
export const SHOWCASE_PARENT_BILLING_HEIGHT = 680;
export const SHOWCASE_MARKETING_HEIGHT = 660;
export const SHOWCASE_ADMIN_HEIGHT = 800;
export const SHOWCASE_INBOX_HEIGHT = 1000;
export const SHOWCASE_TIMECLOCK_HEIGHT = 600;

export type GetStartedMarketingDemoVariant =
  | "adminHome"
  | "enrollmentApplication"
  | "scheduleTours"
  | "admissionsInbox"
  | "enrollmentChecklist"
  | "parentEnrollment"
  | "tuitionAdmin"
  | "studentsRoster";

export const GET_STARTED_MARKETING_CROPS: Record<
  GetStartedMarketingDemoVariant,
  CarouselDemoCrop
> = {
  adminHome: { zoom: 1.22, originX: 0, originY: 0 },
  enrollmentApplication: { zoom: 1.3, originX: 0, originY: 0.04 },
  scheduleTours: { zoom: 1.2, originX: 0, originY: 0 },
  admissionsInbox: { zoom: 1.22, originX: 0, originY: 0 },
  enrollmentChecklist: { zoom: 1.35, originX: 0, originY: 0.05 },
  parentEnrollment: { zoom: 1.45, originX: 0, originY: 0 },
  tuitionAdmin: { zoom: 1.22, originX: 0, originY: 0 },
  studentsRoster: { zoom: 1.2, originX: 0, originY: 0 },
};

export type GetStartedShowcaseDemoConfig =
  | {
      kind: "productPreview";
      tabId: ProductPreviewTabId;
      contentHeight: number;
      crop?: CarouselDemoCrop;
    }
  | {
      kind: "marketing";
      variant: GetStartedMarketingDemoVariant;
      contentHeight: number;
      crop?: CarouselDemoCrop;
    };

export type GetStartedShowcaseSlideConfig = {
  id: string;
  caption: string;
  label: string;
  description: string;
  icon: LucideIcon;
  accent: string;
  demo: GetStartedShowcaseDemoConfig;
};

/** Get-started carousel only; homepage product tabs keep `product-preview-tabs` copy. */
const GET_STARTED_SHOWCASE_CARD_COPY: Record<
  string,
  { label: string; description: string }
> = {
  "product-website": {
    label: "Need a site that brings in families?",
    description: "Programs, FAQs, team, and apply buttons in one place.",
  },
  "product-enrollment": {
    label: "Still using paper enrollment forms?",
    description:
      "Families fill out forms online with uploads and e-signatures.",
  },
  "product-parents": {
    label: "Hard to collect tuition on time?",
    description: "Families see bills, pay online, and view payment history.",
  },
  "product-teachers": {
    label: "Who's here today?",
    description: "Teachers mark attendance by class and move week to week.",
  },
  "product-timeclock": {
    label: "Track staff hours without spreadsheets?",
    description: "Clock in and out and see weekly and monthly totals.",
  },
  "product-marketing": {
    label: "Want emails to send on their own?",
    description: "Set up emails that go out when families hit each step.",
  },
  "product-admin": {
    label: "One place to run your school?",
    description: "Admissions, billing, and daily work in one dashboard.",
  },
  "marketing-application": {
    label: "What should your apply form ask?",
    description: "Pick the questions and steps families complete when they apply.",
  },
  "marketing-tours": {
    label: "Who's touring this week?",
    description: "Families book visits and your team sees who's coming.",
  },
  "marketing-inbox": {
    label: "Where's that application?",
    description: "Every submission, status, and next step in one inbox.",
  },
  "marketing-checklist-builder": {
    label: "What's left after you accept them?",
    description: "One checklist for forms, agreements, and fees.",
  },
  "marketing-parent-enrollment": {
    label: "What's left to enroll them?",
    description: "Families see forms, agreements, and payments still due.",
  },
  "marketing-tuition": {
    label: "Set up tuition before you bill?",
    description: "Set rates and billing rules before the first invoice.",
  },
  "marketing-students": {
    label: "Who's in which program?",
    description: "Student records, programs, and family links in one roster.",
  },
};

function withShowcaseCopy(
  slide: GetStartedShowcaseSlideConfig,
): GetStartedShowcaseSlideConfig {
  const copy = GET_STARTED_SHOWCASE_CARD_COPY[slide.id];
  if (!copy) return slide;
  return {
    ...slide,
    label: copy.label,
    description: copy.description,
  };
}

const PRODUCT_PREVIEW_CROP: Partial<
  Record<ProductPreviewTabId, CarouselDemoCrop>
> = {
  admin: { zoom: 1.14, originX: 0, originY: 0 },
  website: { zoom: 1.08, originX: 0, originY: 0 },
  enrollment: { zoom: 1.15, originX: 0, originY: 0 },
  parents: { zoom: 1.16, originX: 0, originY: 0.06 },
  teachers: { zoom: 1.14, originX: 0, originY: 0.04 },
  marketing: { zoom: 1.24, originX: 0, originY: 0 },
  timeclock: { zoom: 1.26, originX: 0, originY: 0.02 },
};

const PRODUCT_SHOWCASE_CONTENT_HEIGHT: Partial<
  Record<ProductPreviewTabId, number>
> = {
  admin: SHOWCASE_ADMIN_HEIGHT,
  parents: SHOWCASE_PARENT_BILLING_HEIGHT,
  teachers: SHOWCASE_COMPACT_PORTAL_HEIGHT,
  timeclock: SHOWCASE_TIMECLOCK_HEIGHT,
  marketing: SHOWCASE_MARKETING_HEIGHT,
};

function productPreviewContentHeight(tabId: ProductPreviewTabId): number {
  const showcaseHeight = PRODUCT_SHOWCASE_CONTENT_HEIGHT[tabId];
  if (showcaseHeight != null) return showcaseHeight;
  if (tabId === "website") {
    return GET_STARTED_PRODUCT_ADMIN_DEMO_HEIGHT;
  }
  return GET_STARTED_PRODUCT_PORTAL_DEMO_HEIGHT;
}

const productPreviewSlides: GetStartedShowcaseSlideConfig[] =
  PRODUCT_PREVIEW_TABS.map((tab) => ({
    id: `product-${tab.id}`,
    caption: tab.caption,
    label: tab.label,
    description: tab.description,
    icon: tab.icon,
    accent: PRODUCT_PREVIEW_GROUP_COLORS[tab.group],
    demo: {
      kind: "productPreview",
      tabId: tab.id,
      contentHeight: productPreviewContentHeight(tab.id),
      crop: PRODUCT_PREVIEW_CROP[tab.id],
    },
  }));

const marketingSlides: GetStartedShowcaseSlideConfig[] = [
  {
    id: "marketing-application",
    caption: "Admissions",
    label: "Application builder",
    description:
      "Choose the questions and steps families complete—health, contacts, uploads, and signatures.",
    icon: ClipboardList,
    accent: PRODUCT_PREVIEW_GROUP_COLORS.admin,
    demo: {
      kind: "marketing",
      variant: "enrollmentApplication",
      contentHeight: GET_STARTED_MARKETING_DEMO_HEIGHT,
      crop: GET_STARTED_MARKETING_CROPS.enrollmentApplication,
    },
  },
  {
    id: "marketing-tours",
    caption: "Admissions",
    label: "Campus visits",
    description:
      "Let families book tours and keep your team aligned on who is visiting next.",
    icon: Calendar,
    accent: PRODUCT_PREVIEW_GROUP_COLORS.admin,
    demo: {
      kind: "marketing",
      variant: "scheduleTours",
      contentHeight: GET_STARTED_MARKETING_DEMO_HEIGHT,
      crop: GET_STARTED_MARKETING_CROPS.scheduleTours,
    },
  },
  {
    id: "marketing-inbox",
    caption: "Admissions",
    label: "Admissions inbox",
    description:
      "Review applications in one place with notes, status, and clear next steps.",
    icon: Inbox,
    accent: PRODUCT_PREVIEW_GROUP_COLORS.admin,
    demo: {
      kind: "marketing",
      variant: "admissionsInbox",
      contentHeight: SHOWCASE_INBOX_HEIGHT,
      crop: { zoom: 1.08, originX: 0, originY: 0 },
    },
  },
  {
    id: "marketing-checklist-builder",
    caption: "Enrollment",
    label: "Enrollment checklist",
    description:
      "Define what accepted families complete—agreements, forms, and fees—in one checklist.",
    icon: ListChecks,
    accent: PRODUCT_PREVIEW_GROUP_COLORS.admin,
    demo: {
      kind: "marketing",
      variant: "enrollmentChecklist",
      contentHeight: GET_STARTED_MARKETING_DEMO_HEIGHT,
      crop: GET_STARTED_MARKETING_CROPS.enrollmentChecklist,
    },
  },
  {
    id: "marketing-parent-enrollment",
    caption: "Family portal",
    label: "Family enrollment",
    description:
      "Accepted families see what's left to finish—forms, agreements, and payments—in one view.",
    icon: GraduationCap,
    accent: PRODUCT_PREVIEW_GROUP_COLORS.parent,
    demo: {
      kind: "marketing",
      variant: "parentEnrollment",
      contentHeight: 800,
      crop: { zoom: 1.24, originX: 0, originY: 0 },
    },
  },
  {
    id: "marketing-tuition",
    caption: "Billing",
    label: "Tuition setup",
    description:
      "Configure rates, catalogs, and family billing before you send the first invoice.",
    icon: CreditCard,
    accent: PRODUCT_PREVIEW_GROUP_COLORS.admin,
    demo: {
      kind: "marketing",
      variant: "tuitionAdmin",
      contentHeight: GET_STARTED_MARKETING_DEMO_HEIGHT,
      crop: GET_STARTED_MARKETING_CROPS.tuitionAdmin,
    },
  },
  {
    id: "marketing-students",
    caption: "Roster",
    label: "Student roster",
    description:
      "Keep student records, programs, and family links organized as you grow.",
    icon: Users,
    accent: PRODUCT_PREVIEW_GROUP_COLORS.admin,
    demo: {
      kind: "marketing",
      variant: "studentsRoster",
      contentHeight: GET_STARTED_MARKETING_DEMO_HEIGHT,
      crop: GET_STARTED_MARKETING_CROPS.studentsRoster,
    },
  },
];

export const GET_STARTED_SHOWCASE_SLIDES: GetStartedShowcaseSlideConfig[] = [
  ...productPreviewSlides,
  ...marketingSlides,
].map(withShowcaseCopy);
