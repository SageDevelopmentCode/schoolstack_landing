import Link from "next/link";
import { formatProgressEntryDate } from "@/lib/organization-progress";
import type { ResolvedParentFeatureAnnouncement } from "@/lib/parent-portal/parent-feature-announcements";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import ParentCard from "@/components/school-parent/ui/ParentCard";
import ParentDisplayHeading from "@/components/school-parent/ui/ParentDisplayHeading";
import ParentSectionKicker from "@/components/school-parent/ui/ParentSectionKicker";

type ParentHomeFeatureAnnouncementsSectionProps = {
  theme: ParentThemeTokens;
  announcements: ResolvedParentFeatureAnnouncement[];
};

export default function ParentHomeFeatureAnnouncementsSection({
  theme,
  announcements,
}: ParentHomeFeatureAnnouncementsSectionProps) {
  return (
    <ParentCard theme={theme} className="p-5 sm:p-6">
      <ParentSectionKicker theme={theme}>What&apos;s new</ParentSectionKicker>
      <ParentDisplayHeading
        theme={theme}
        as="h3"
        size="section"
        className="mt-1.5 text-[19px] leading-tight"
      >
        New features for you
      </ParentDisplayHeading>

      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {announcements.map((announcement) => (
          <article
            key={announcement.id}
            className="flex h-full flex-col rounded-[14px] border border-[#E9EFEA] bg-gradient-to-br from-[#FFFDF8] to-[#F4F7F4] p-4"
          >
            <time
              className="text-[10px] font-semibold uppercase tracking-[0.04em]"
              style={{ color: theme.muted }}
              dateTime={announcement.publishedAt}
            >
              {formatProgressEntryDate(announcement.publishedAt)}
            </time>
            <h4
              className="mt-1.5 font-heading text-[15px] font-semibold leading-snug tracking-[-0.02em]"
              style={{ fontFamily: theme.fontDisplay, color: theme.ink }}
            >
              {announcement.title}
            </h4>
            <p
              className="mt-2 flex-1 text-xs leading-relaxed"
              style={{ color: theme.muted }}
            >
              {announcement.description}
            </p>
            <Link
              href={announcement.href}
              className="mt-3 inline-flex w-fit items-center rounded-[10px] border px-[13px] py-[10px] text-xs font-bold no-underline transition-transform hover:-translate-y-px"
              style={{
                backgroundColor: theme.white,
                color: theme.primary,
                borderColor: "#B9CDBD",
              }}
            >
              {announcement.ctaLabel}
            </Link>
          </article>
        ))}
      </div>
    </ParentCard>
  );
}
