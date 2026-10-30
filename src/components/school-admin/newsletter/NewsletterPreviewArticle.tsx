"use client";

import { Sprout } from "lucide-react";
import { useMemo, type CSSProperties } from "react";
import { weekLabel } from "@/lib/school-admin/newsletter/newsletter-dates";
import {
  MUDKITCHEN_FOOTER_LABEL,
  MUDKITCHEN_LOGO_ALT,
  MUDKITCHEN_SITE_URL,
  NEWSLETTER_MASTHEAD_TAGLINE,
  type NewsletterVisualBranding,
} from "@/lib/school-admin/newsletter/newsletter-branding";
import {
  getNewsletterHeroCoverSrc,
  newsletterHeroCoverCssVars,
} from "@/lib/school-admin/newsletter/newsletter-hero-cover";
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
import NewsletterMediaImage from "./NewsletterMediaImage";
import styles from "./newsletter-workspace.module.css";

type NewsletterPreviewArticleProps = {
  edition: NewsletterEdition;
  school: NewsletterSchoolMeta;
  branding: NewsletterVisualBranding;
  staffMembers?: StaffMemberRecord[];
  template?: NewsletterSchoolTemplate;
  primaryColor?: string;
  className?: string;
};

export default function NewsletterPreviewArticle({
  edition,
  school,
  branding,
  staffMembers = [],
  template,
  primaryColor,
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
  const renderMediaImage = useMemo(() => {
    function renderPreviewMediaImage(props: {
      src: string;
      alt: string;
      className?: string;
      imageClassName?: string;
    }) {
      return <NewsletterMediaImage {...props} />;
    }
    return renderPreviewMediaImage;
  }, []);
  const sections = useMemo(
    () =>
      buildPreviewSections(edition, previewStyles, {
        staff: staffMembers,
        template,
        renderMediaImage,
      }),
    [edition, previewStyles, renderMediaImage, staffMembers, template],
  );
  const title = previewHeroTitle(edition);
  const welcome = getWelcomeValue(edition);
  const signatureLines = school.signature.split("\n");
  const schoolLogoSrc = branding.schoolLogoSrc?.trim();
  const coverSrc = getNewsletterHeroCoverSrc(edition);
  const heroCoverStyle = useMemo((): CSSProperties | undefined => {
    if (!coverSrc) return undefined;
    const vars = newsletterHeroCoverCssVars(coverSrc, primaryColor);
    return {
      "--n-hero-overlay-bottom": vars["--n-hero-overlay-bottom"],
      "--n-hero-overlay-mid": vars["--n-hero-overlay-mid"],
    } as CSSProperties;
  }, [coverSrc, primaryColor]);

  const heroInner = (
    <>
      <div className={styles.nEyebrow}>{weekLabel(edition)}</div>
      <h2>{title}</h2>
      {welcome.trim() ? <p>{welcome}</p> : null}
    </>
  );

  return (
    <article className={`${styles.newsletter} ${className}`.trim()}>
      <div className={styles.nMasthead}>
        <div className={styles.nMastheadSchool}>
          <div className={styles.nSchool}>
            {schoolLogoSrc ? (
              <img
                className={styles.nLogoSchool}
                src={schoolLogoSrc}
                alt={branding.schoolLogoAlt?.trim() || school.name}
              />
            ) : (
              <>
                <Sprout size={15} strokeWidth={1.65} aria-hidden />
                {school.name}
              </>
            )}
          </div>
        </div>
        <div className={styles.nMastheadMk}>
          <img
            className={styles.nLogoMk}
            src={branding.mudkitchenLogoSrc}
            alt={MUDKITCHEN_LOGO_ALT}
          />
          <span className={styles.nMastheadTagline}>{NEWSLETTER_MASTHEAD_TAGLINE}</span>
        </div>
      </div>
      {coverSrc ? (
        <header
          className={`${styles.nHero} ${styles.nHeroCover}`.trim()}
          style={heroCoverStyle}
        >
          <NewsletterMediaImage
            className={styles.nHeroMedia}
            imageClassName="h-full w-full object-cover"
            src={coverSrc}
            alt=""
            decoding="async"
          />
          <div className={styles.nHeroOverlay} aria-hidden />
          <div className={styles.nHeroInner}>{heroInner}</div>
        </header>
      ) : (
        <header className={styles.nHero}>{heroInner}</header>
      )}
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
        <div className={styles.nFooterSignature}>
          {signatureLines.map((line, index) => (
            <span key={`${line}-${index}`}>
              {line}
              {index < signatureLines.length - 1 ? <br /> : null}
            </span>
          ))}
        </div>
        <div className={styles.nFooterMk}>
          <a href={MUDKITCHEN_SITE_URL} target="_blank" rel="noopener noreferrer">
            <img
              className={styles.nLogoMkFooter}
              src={branding.mudkitchenLogoSrc}
              alt={MUDKITCHEN_LOGO_ALT}
            />
            <span>{MUDKITCHEN_FOOTER_LABEL}</span>
          </a>
        </div>
      </footer>
    </article>
  );
}
