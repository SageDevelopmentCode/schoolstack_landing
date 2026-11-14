"use client";

import { ArrowRight, Building2 } from "lucide-react";
import NavigationLink from "@/components/school/shared/NavigationLink";
import {
  DateStamp,
  GCard,
  GIcon,
  GStatTile,
  gBtnButterSm,
  gBtnOutlineSm,
} from "@/components/school-parent/garden/ui";
import { formatScheduledVisitWhenLabel } from "@/lib/admissions/admissions-availability";
import type { FamilyScheduledVisit } from "@/lib/admissions/family-tour-booking";

/*
 * Apply dashboard right rail: campus visits (the page's one dark card, as
 * tickets) with the schedule-tour call to action, an at-a-glance summary,
 * and the parent-portal starter for enrolled families.
 */

export function ApplyVisitsCard({
  index,
  visits,
  showScheduleTourCta,
  scheduleTourTitle,
  scheduleTourSubtitle,
  scheduleTourHref,
  previewMode,
}: {
  index: number;
  visits: FamilyScheduledVisit[];
  showScheduleTourCta: boolean;
  scheduleTourTitle: string;
  scheduleTourSubtitle: string;
  scheduleTourHref: string;
  previewMode: boolean;
}) {
  if (visits.length === 0 && !showScheduleTourCta) return null;

  return (
    <GCard
      index={index}
      tone="dark"
      kicker="Campus visits"
      title={visits.length > 0 ? "Upcoming visits" : scheduleTourTitle}
      data-testid="apply-visits-card"
    >
      {visits.length > 0 ? (
        <ul className="m-0 flex list-none flex-col gap-3 p-0">
          {visits.map((visit) => (
            <li key={visit.id} className="sf-ticket flex items-stretch rounded-2xl bg-[var(--sf-paper)] text-[var(--sf-ink)]">
              <div className="flex items-center py-2.5 pl-5 pr-3">
                <DateStamp date={visit.scheduledDate} size="sm" />
              </div>
              <div className="my-3 border-l-[1.5px] border-dashed border-[var(--sf-ink)]/20" aria-hidden="true" />
              <div className="min-w-0 flex-1 px-4 py-3 pr-6">
                <h3 className="m-0 text-[15px] font-extrabold leading-snug">{visit.title}</h3>
                <p className="m-0 text-[13px] font-semibold text-[var(--sf-soft)]">
                  {formatScheduledVisitWhenLabel({
                    schedulingMode: visit.schedulingMode,
                    scheduledDate: visit.scheduledDate,
                    startTimeSlot: visit.startTimeSlot,
                    durationMinutes: visit.durationMinutes,
                  })}
                </p>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      {showScheduleTourCta ? (
        <div className={visits.length > 0 ? "mt-5 border-t border-dashed border-white/25 pt-4" : ""}>
          <div className="flex items-start gap-3">
            <GIcon size="sm" className="!ring-white/70">
              <Building2 />
            </GIcon>
            <div className="min-w-0">
              {visits.length > 0 ? (
                <h3 className="m-0 text-[15px] font-extrabold text-white">{scheduleTourTitle}</h3>
              ) : null}
              <p className="m-0 text-[14px] leading-relaxed text-white/80">{scheduleTourSubtitle}</p>
            </div>
          </div>
          <div className="mt-4">
            {previewMode ? (
              <span aria-disabled="true" className={`${gBtnButterSm} cursor-not-allowed opacity-60`}>
                Schedule tour
              </span>
            ) : (
              <NavigationLink href={scheduleTourHref} className={gBtnButterSm}>
                Schedule tour <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </NavigationLink>
            )}
          </div>
        </div>
      ) : null}
    </GCard>
  );
}

export function ApplySummaryCard({
  index,
  applicationCount,
  enrolledCount,
  pendingRequiredCount,
  onPendingClick,
}: {
  index: number;
  applicationCount: number;
  enrolledCount: number;
  pendingRequiredCount: number;
  onPendingClick?: () => void;
}) {
  if (applicationCount === 0) return null;
  return (
    <GCard index={index} kicker="At a glance" className="overflow-hidden">
      <div className="-mx-5 -mb-5 -mt-1 grid grid-cols-3 divide-x-[1.5px] divide-[var(--sf-ink)]/10 border-t-[1.5px] border-[var(--sf-ink)]/10 sm:-mx-6 sm:-mb-6">
        <GStatTile value={applicationCount} label={applicationCount === 1 ? "Application" : "Applications"} />
        <GStatTile value={enrolledCount} label="Enrolled" />
        <GStatTile
          value={pendingRequiredCount}
          label={pendingRequiredCount === 1 ? "Step to do" : "Steps to do"}
          accent={pendingRequiredCount > 0}
          onClick={pendingRequiredCount > 0 ? onPendingClick : undefined}
        />
      </div>
    </GCard>
  );
}

export function ApplyPortalStarterCard({
  index,
  parentPortalHref,
}: {
  index: number;
  parentPortalHref: string;
}) {
  return (
    <GCard index={index} tone="paper" kicker="Parent portal" title="Looking for your children's school updates?">
      <p className="m-0 text-[14px] font-semibold leading-relaxed text-[var(--sf-soft)]">
        The parent portal is now your home for daily school life, messages,
        tuition, and family events.
      </p>
      <div className="mt-4">
        <NavigationLink href={parentPortalHref} className={gBtnOutlineSm}>
          Open parent portal <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </NavigationLink>
      </div>
    </GCard>
  );
}
