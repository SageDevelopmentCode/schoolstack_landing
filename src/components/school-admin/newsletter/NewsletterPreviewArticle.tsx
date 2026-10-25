"use client";

import { Sprout } from "lucide-react";
import { useMemo } from "react";
import { weekLabel } from "@/lib/school-admin/newsletter/newsletter-dates";
import {
  buildPreviewSections,
  previewHasWelcome,
  previewHeroTitle,
} from "@/lib/school-admin/newsletter/newsletter-preview-sections";
import { getWelcomeValue } from "@/lib/school-admin/newsletter/newsletter-template";
import type {
  NewsletterEdition,
  NewsletterSchoolMeta,
  NewsletterSchoolTemplate,
} from "@/lib/school-admin/newsletter/newsletter-types";
import type { StaffMemberRecord } from "@/lib/staff/staff-members";
import styles from "./newsletter-workspace.module.css";

type NewsletterPreviewArticleProps = {
  edition: NewsletterEdition;
  school: NewsletterSchoolMeta;
  staffMembers?: StaffMemberRecord[];
  template?: NewsletterSchoolTemplate;
  className?: string;
};

function layoutModifierClass(layout: NewsletterEdition["layout"]): string {
  if (layout === "brief") return styles.newsletterBrief;
  if (layout === "journal") return styles.newsletterJournal;
  return "";
}

export default function NewsletterPreviewArticle({
  edition,
  school,
  staffMembers = [],
  template,
  className = "",
}: NewsletterPreviewArticleProps) {
  const previewStyles = useMemo(
    () => ({
      nQuote: styles.nQuote,
      nCallout: styles.nCallout,
      nLabel: styles.nLabel,
      nEvent: styles.nEvent,
      nDate: styles.nDate,
      nReminders: styles.nReminders,
      nPhotos: styles.nPhotos,
    }),
    [],
  );
  const sections = useMemo(
    () =>
      buildPreviewSections(edition, previewStyles, {
        staff: staffMembers,
        template,
      }),
    [edition, previewStyles, staffMembers, template],
  );
  const title = previewHeroTitle(edition);
  const welcome = getWelcomeValue(edition);
  const signatureLines = school.signature.split("\n");

  return (
    <article
      className={`${styles.newsletter} ${layoutModifierClass(edition.layout)} ${className}`.trim()}
    >
      <div className={styles.nMasthead}>
        <div className={styles.nSchool}>
          <Sprout size={15} strokeWidth={1.65} aria-hidden />
          {school.name}
        </div>
        <span>School stories</span>
      </div>
      <header className={styles.nHero}>
        <div className={styles.nEyebrow}>{weekLabel(edition)}</div>
        <h2>{title}</h2>
        {welcome.trim() ? <p>{welcome}</p> : null}
      </header>
      <div className={styles.nContent}>
        {sections.length === 0 && !previewHasWelcome(edition) ? (
          <p className={styles.newsEmpty}>Your weekly story will appear here.</p>
        ) : (
          sections.map((section) => (
            <section key={section.title} className={styles.nSection}>
              <h3>{section.title}</h3>
              {section.body}
            </section>
          ))
        )}
      </div>
      <footer className={styles.nFooter}>
        {signatureLines.map((line, index) => (
          <span key={`${line}-${index}`}>
            {line}
            {index < signatureLines.length - 1 ? <br /> : null}
          </span>
        ))}
      </footer>
    </article>
  );
}
