"use client";

import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import type { NewsletterVisualBranding } from "@/lib/school-admin/newsletter/newsletter-branding";
import type { NewsletterRegion } from "@/lib/school-admin/newsletter/newsletter-render";
import type {
  NewsletterEdition,
  NewsletterSchoolMeta,
  NewsletterSchoolTemplate,
} from "@/lib/school-admin/newsletter/newsletter-types";
import type { StaffMemberRecord } from "@/lib/staff/staff-members";
import NewsletterArticle from "./NewsletterArticle";

export type PreviewDevice = "desktop" | "mobile";

type NewsletterPreviewPanelProps = {
  theme: ParentThemeTokens;
  edition: NewsletterEdition;
  school: NewsletterSchoolMeta;
  branding: NewsletterVisualBranding;
  device: PreviewDevice;
  staffMembers: StaffMemberRecord[];
  template: NewsletterSchoolTemplate;
  onEditRegion?: (region: NewsletterRegion) => void;
  activeRegion?: NewsletterRegion | null;
  label?: string;
};

/** The newsletter at desktop (760px) or phone (375px) width, as families see it. */
export default function NewsletterPreviewPanel({
  theme,
  edition,
  school,
  branding,
  device,
  staffMembers,
  template,
  onEditRegion,
  activeRegion,
  label = "Family preview",
}: NewsletterPreviewPanelProps) {
  const phone = device === "mobile";
  return (
    <section aria-label={label} className="min-w-0">
      <div
        className={
          phone
            ? "mx-auto w-full max-w-[375px] overflow-hidden rounded-[34px] border-[6px] border-[var(--sf-ink,#2B241D)] bg-[#FFFAF4] shadow-[0_10px_0_0_rgba(43,36,29,0.12)]"
            : "mx-auto w-full max-w-[760px]"
        }
        data-preview-device={device}
      >
        <NewsletterArticle
          edition={edition}
          school={school}
          branding={branding}
          staffMembers={staffMembers}
          template={template}
          primaryColor={theme.primary}
          onEditRegion={onEditRegion}
          activeRegion={activeRegion}
        />
      </div>
    </section>
  );
}
