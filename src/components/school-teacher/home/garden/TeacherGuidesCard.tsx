"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, ChevronRight } from "lucide-react";
import { GCard, GKicker, gLinkSm } from "@/components/school-parent/garden/ui";
import { ROW_INTERACTIVE } from "@/components/school-admin/dashboard/garden/shared";
import type { TeacherDashboardModel } from "../useTeacherDashboardModel";

/** Index of help: category columns of guide rows that open the guide panel. */
export default function TeacherGuidesCard({ model }: { model: TeacherDashboardModel }) {
  if (model.howToGuides.length === 0) return null;
  return (
    <GCard
      index={5}
      kicker="How-to guides"
      title="Step-by-step help"
      action={
        <Link href={model.documentationHref} className={gLinkSm}>
          View full how-to guides <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      }
      data-testid="teacher-dashboard-guides"
    >
      <div className="grid gap-x-6 gap-y-5 md:grid-cols-2 xl:grid-cols-3">
        {model.groupedHowToGuides.map((group) => (
          <section key={group.category} aria-label={group.category} className="min-w-0">
            <GKicker className="mb-1.5 px-3">{group.category}</GKicker>
            <ul className="m-0 flex list-none flex-col p-0">
              {group.guides.map((guide) => (
                <li key={guide.id}>
                  <button type="button" onClick={() => model.openGuide(guide)} className={`${ROW_INTERACTIVE} !py-2.5`}>
                    <span
                      aria-hidden="true"
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-[var(--sf-paper)] ring-[1.5px] ring-[var(--sf-ink)]/10"
                    >
                      <BookOpen className="h-4 w-4 text-[var(--sf-ink)]/70" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[14px] font-extrabold leading-snug text-[var(--sf-ink)]">{guide.title}</span>
                      <span className="block truncate text-[12px] font-semibold text-[var(--sf-soft)]">
                        {guide.steps.length} step{guide.steps.length === 1 ? "" : "s"}
                      </span>
                    </span>
                    <ChevronRight className="h-4 w-4 shrink-0 text-[var(--sf-ink)]/40 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </GCard>
  );
}
