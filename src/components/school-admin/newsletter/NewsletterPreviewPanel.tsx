"use client";

import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import type { NewsletterVisualBranding } from "@/lib/school-admin/newsletter/newsletter-branding";
import type {
  NewsletterEdition,
  NewsletterSchoolMeta,
  NewsletterSchoolTemplate,
} from "@/lib/school-admin/newsletter/newsletter-types";
import type { StaffMemberRecord } from "@/lib/staff/staff-members";
import NewsletterPreviewArticle from "./NewsletterPreviewArticle";
import styles from "./newsletter-workspace.module.css";

export type PreviewDevice = "desktop" | "mobile";

type NewsletterPreviewPanelProps = {
  theme: ParentThemeTokens;
  edition: NewsletterEdition;
  school: NewsletterSchoolMeta;
  branding: NewsletterVisualBranding;
  device: PreviewDevice;
  staffMembers: StaffMemberRecord[];
  template: NewsletterSchoolTemplate;
};

export default function NewsletterPreviewPanel({
  edition,
  school,
  branding,
  device,
  staffMembers,
  template,
}: NewsletterPreviewPanelProps) {
  return (
    <section className={styles.previewColumn} aria-label="Parent preview">
      <div className={styles.previewShell}>
        <div
          className={`${styles.newsletterWrap} ${device === "mobile" ? styles.newsletterWrapMobile : ""}`}
        >
          <NewsletterPreviewArticle
            edition={edition}
            school={school}
            branding={branding}
            staffMembers={staffMembers}
            template={template}
          />
        </div>
      </div>
    </section>
  );
}
