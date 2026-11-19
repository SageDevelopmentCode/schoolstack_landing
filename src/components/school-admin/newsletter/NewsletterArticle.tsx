"use client";

import { useMemo, type MouseEvent } from "react";
import { gardenFontVariables } from "@/components/garden/fonts";
import type { NewsletterVisualBranding } from "@/lib/school-admin/newsletter/newsletter-branding";
import {
  buildNewsletterArticleHtml,
  type NewsletterRegion,
} from "@/lib/school-admin/newsletter/newsletter-render";
import { NEWSLETTER_CSS } from "@/lib/school-admin/newsletter/newsletter-styles";
import type {
  NewsletterEdition,
  NewsletterSchoolMeta,
  NewsletterSchoolTemplate,
} from "@/lib/school-admin/newsletter/newsletter-types";
import type { StaffMemberRecord } from "@/lib/staff/staff-members";

type ArticleStaffMember = Pick<StaffMemberRecord, "id" | "firstName" | "lastName"> &
  Partial<Pick<StaffMemberRecord, "email">>;

export type NewsletterArticleProps = {
  edition: NewsletterEdition;
  school: NewsletterSchoolMeta;
  branding: NewsletterVisualBranding;
  staffMembers?: ArticleStaffMember[];
  template?: NewsletterSchoolTemplate;
  /** School accent. Defaults to `school.primary`. */
  primaryColor?: string;
  /** Builder only: makes every part clickable and shows placeholders. */
  onEditRegion?: (region: NewsletterRegion) => void;
  activeRegion?: NewsletterRegion | null;
  className?: string;
};

/**
 * The Garden newsletter inside the app. Renders the same HTML string as the
 * standalone document (parent full screen, mobile WebView, downloads), so
 * every viewer shows one design. The string is built from escaped data only.
 *
 * `data-garden-skip` / `data-family-preview` keep the admin skin's input and
 * type rules out; `gardenFontVariables` resolves the Garden fonts.
 */
export default function NewsletterArticle({
  edition,
  school,
  branding,
  staffMembers,
  template,
  primaryColor,
  onEditRegion,
  activeRegion = null,
  className = "",
}: NewsletterArticleProps) {
  const editable = Boolean(onEditRegion);
  const html = useMemo(
    () =>
      buildNewsletterArticleHtml(edition, school, {
        staff: staffMembers,
        template,
        branding,
        primaryColor: primaryColor || school.primary,
        editable,
        activeRegion,
      }),
    [edition, school, staffMembers, template, branding, primaryColor, editable, activeRegion],
  );

  function handleClick(event: MouseEvent<HTMLDivElement>) {
    if (!onEditRegion) return;
    const target = event.target as HTMLElement | null;
    const hit = target?.closest<HTMLElement>(".n-edit-hit");
    const region = hit?.dataset.nEdit;
    if (region) onEditRegion(region as NewsletterRegion);
  }

  return (
    <div
      className={`${gardenFontVariables} ${className}`.trim()}
      data-garden-skip=""
      data-family-preview=""
      data-newsletter-article=""
    >
      <style>{NEWSLETTER_CSS}</style>
      {/* Clicks are delegated to the real <button class="n-edit-hit"> elements in the markup. */}
      <div onClick={editable ? handleClick : undefined} dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
