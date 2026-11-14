"use client";

import { ArrowRight, Building2 } from "lucide-react";
import NavigationLink from "@/components/school/shared/NavigationLink";
import { DateStamp, GCard, GIcon, gBtnButterSm } from "@/components/school-parent/garden/ui";
import { formatScheduledVisitWhenLabel } from "@/lib/admissions/admissions-availability";
import type { FamilyScheduledVisit } from "@/lib/admissions/family-tour-booking";

/*
 * Campus visits: the page's one dark card. Upcoming visits as tickets (two
 * per row from `sm`) plus the schedule-tour call to action.
 */

export default function ApplyVisitsCard({
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
        <ul className="m-0 grid list-none gap-3 p-0 sm:grid-cols-2">
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
        <div
          className={`flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between ${
            visits.length > 0 ? "mt-5 border-t border-dashed border-white/25 pt-4" : ""
          }`}
        >
          <div className="flex min-w-0 items-start gap-3">
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
          <div className="shrink-0">
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
