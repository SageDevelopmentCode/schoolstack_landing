"use client";

import Link from "next/link";
import NewsletterMediaImage from "@/components/school-admin/newsletter/NewsletterMediaImage";
import adminStyles from "@/components/school-admin/newsletter/newsletter-workspace.module.css";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import { weekLabel } from "@/lib/school-admin/newsletter/newsletter-dates";
import type { PublishedNewsletterSummary } from "@/lib/school-admin/newsletter/newsletter-db";

type ParentNewsletterEditionCardProps = {
  edition: PublishedNewsletterSummary;
  href: string;
  theme: ParentThemeTokens;
};

export default function ParentNewsletterEditionCard({
  edition,
  href,
  theme,
}: ParentNewsletterEditionCardProps) {
  const title = edition.title.trim() || weekLabel(edition);
  const week = weekLabel(edition);

  return (
    <Link
      href={href}
      className="block h-full overflow-hidden rounded-2xl border transition-colors hover:bg-black/[0.02]"
      style={{ borderColor: theme.line, backgroundColor: theme.white }}
    >
      <div
        className={adminStyles.overviewCardBanner}
        style={edition.coverImage ? undefined : { backgroundColor: theme.primarySoft }}
      >
        {edition.coverImage ? (
          <>
            <NewsletterMediaImage
              src={edition.coverImage}
              alt=""
              className="absolute inset-0 h-full w-full"
              imageClassName="h-full w-full object-cover"
            />
            <div className={adminStyles.overviewCardBannerGradient} aria-hidden />
          </>
        ) : (
          <div className={adminStyles.overviewCardPlaceholder}>No cover yet</div>
        )}
      </div>
      <div className={adminStyles.overviewCardBody}>
        <h2
          className="font-serif text-lg font-semibold leading-snug line-clamp-2"
          style={{ color: theme.ink }}
        >
          {title}
        </h2>
        <p className="mt-2 text-[11px] leading-relaxed" style={{ color: theme.muted }}>
          {week}
        </p>
      </div>
    </Link>
  );
}
