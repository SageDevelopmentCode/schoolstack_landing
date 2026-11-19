"use client";

import { useCallback, useMemo, useState } from "react";
import SchoolDemoWordmark, { type SchoolDemoLogo } from "@/components/demo/SchoolDemoWordmark";
import { AdminFilterChip } from "@/components/admin/ui/AdminFilterChip";
import { AdminSelect } from "@/components/admin/ui/AdminSelect";
import { CRM, CRM_STATUSES, crmStatusLabel, type CrmStatus } from "@/lib/admin-crm/crm-status";
import { isFollowUpDue, type DemoOutreach } from "@/lib/admin-crm/demo-outreach-types";
import { DemoOutreachDrawer } from "@/components/admin/demos/DemoOutreachDrawer";
import { formatAgo, formatShortDate } from "@/components/admin/demos/demo-outreach-format";

export type DemoCard = {
  slug: string;
  schoolName: string;
  logo: SchoolDemoLogo;
  description: string;
  href: string;
  themePrimary: string;
};

type Filter = "all" | "due" | CrmStatus;
type Sort = "default" | "follow_up" | "last_touch";

const NOT_CONTACTED: CrmStatus = "not_contacted";

function statusOf(outreach: DemoOutreach | undefined): CrmStatus {
  return outreach?.crmStatus ?? NOT_CONTACTED;
}

function lastTouchAt(outreach: DemoOutreach | undefined): string | null {
  return outreach?.touches[0]?.occurredAt ?? outreach?.lastContactedAt ?? null;
}

export function DemoOutreachBoard({
  demos,
  initialOutreach,
  loadError,
}: {
  demos: DemoCard[];
  initialOutreach: Record<string, DemoOutreach>;
  loadError?: string | null;
}) {
  const [outreach, setOutreach] = useState(initialOutreach);
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<Sort>("default");
  const [openSlug, setOpenSlug] = useState<string | null>(null);

  const setOne = useCallback((slug: string, next: DemoOutreach | undefined) => {
    setOutreach((prev) => {
      const copy = { ...prev };
      if (next) copy[slug] = next;
      else delete copy[slug];
      return copy;
    });
  }, []);

  const counts = useMemo(() => {
    const byStatus = Object.fromEntries(CRM_STATUSES.map((s) => [s, 0])) as Record<CrmStatus, number>;
    let due = 0;
    for (const demo of demos) {
      const o = outreach[demo.slug];
      byStatus[statusOf(o)] += 1;
      if (o && isFollowUpDue(o.nextFollowUpAt)) due += 1;
    }
    return { byStatus, due };
  }, [demos, outreach]);

  const visible = useMemo(() => {
    const filtered = demos.filter((demo) => {
      const o = outreach[demo.slug];
      if (filter === "all") return true;
      if (filter === "due") return Boolean(o && isFollowUpDue(o.nextFollowUpAt));
      return statusOf(o) === filter;
    });
    if (sort === "default") return filtered;

    const key = (demo: DemoCard) => {
      const o = outreach[demo.slug];
      const iso = sort === "follow_up" ? o?.nextFollowUpAt : lastTouchAt(o);
      return iso ? new Date(iso).getTime() : null;
    };
    // Follow-ups: soonest first. Last touch: most recent first. Missing dates go last.
    return [...filtered].sort((a, b) => {
      const ka = key(a);
      const kb = key(b);
      if (ka === null && kb === null) return 0;
      if (ka === null) return 1;
      if (kb === null) return -1;
      return sort === "follow_up" ? ka - kb : kb - ka;
    });
  }, [demos, outreach, filter, sort]);

  const contacted = demos.length - counts.byStatus.not_contacted;
  const openDemo = openSlug ? demos.find((d) => d.slug === openSlug) ?? null : null;

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold text-admin-text">Demos</h1>
          <p className="text-sm text-admin-muted mt-1">
            School-branded interactive walkthroughs · {contacted} of {demos.length} contacted
            {counts.byStatus.replied > 0 ? ` · ${counts.byStatus.replied} replied` : ""}
            {counts.due > 0 ? ` · ${counts.due} follow-up${counts.due === 1 ? "" : "s"} due` : ""}
          </p>
        </header>

        {loadError ? (
          <p className="mb-4 text-sm rounded-admin-md border border-admin-error-border bg-admin-error-bg text-admin-error px-3 py-2">
            Couldn&apos;t load outreach statuses: {loadError}. Cards show as Not Contacted until it loads.
          </p>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div className="flex flex-wrap items-center gap-1.5">
            <AdminFilterChip label="All" count={demos.length} active={filter === "all"} onClick={() => setFilter("all")} />
            <AdminFilterChip
              label="Follow-up due"
              count={counts.due}
              active={filter === "due"}
              onClick={() => setFilter("due")}
            />
            {CRM_STATUSES.filter((s) => counts.byStatus[s] > 0 || filter === s).map((s) => (
              <AdminFilterChip
                key={s}
                label={crmStatusLabel(s)}
                count={counts.byStatus[s]}
                active={filter === s}
                onClick={() => setFilter(s)}
              />
            ))}
          </div>
          <AdminSelect
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            aria-label="Sort demos"
            triggerClassName="text-xs"
          >
            <option value="default">Default order</option>
            <option value="follow_up">Next follow-up first</option>
            <option value="last_touch">Latest touch first</option>
          </AdminSelect>
        </div>

        {demos.length === 0 ? (
          <p className="text-sm text-admin-faint">No demos configured.</p>
        ) : visible.length === 0 ? (
          <p className="text-sm text-admin-faint">No demos match this filter.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {visible.map((demo) => (
              <DemoCardView
                key={demo.slug}
                demo={demo}
                outreach={outreach[demo.slug]}
                onOpen={() => setOpenSlug(demo.slug)}
              />
            ))}
          </div>
        )}
      </div>

      <DemoOutreachDrawer
        demo={openDemo}
        outreach={openDemo ? outreach[openDemo.slug] : undefined}
        onClose={() => setOpenSlug(null)}
        onChange={setOne}
      />
    </div>
  );
}

function DemoCardView({
  demo,
  outreach,
  onOpen,
}: {
  demo: DemoCard;
  outreach: DemoOutreach | undefined;
  onOpen: () => void;
}) {
  const status = statusOf(outreach);
  const style = CRM[status];
  const touchCount = outreach?.touches.length ?? 0;
  const lastTouch = lastTouchAt(outreach);
  const followUp = outreach?.nextFollowUpAt ?? null;
  const due = isFollowUpDue(followUp);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
      aria-label={`${demo.schoolName}: ${crmStatusLabel(status)}. Open outreach details`}
      className="group flex flex-col rounded-admin-md border border-admin-border bg-admin-surface overflow-hidden cursor-pointer transition-all duration-150 hover:border-admin-accent/30 hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-admin-accent/30"
    >
      <div className="h-1 shrink-0" style={{ backgroundColor: demo.themePrimary }} />
      <div className="flex flex-col flex-1 p-5 gap-4">
        <div className="h-10 flex items-center justify-between gap-3">
          <div className="min-w-0 flex items-center">
            <SchoolDemoWordmark logo={demo.logo} className="max-h-10 w-auto object-contain" />
          </div>
          <span
            className={`shrink-0 inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-admin-md border ${style.pill}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
            {crmStatusLabel(status)}
          </span>
        </div>
        <div className="flex-1">
          <h2 className="text-sm font-semibold text-admin-text leading-snug">{demo.schoolName}</h2>
          <p className="text-xs text-admin-muted mt-1.5 line-clamp-2 leading-relaxed">{demo.description}</p>
        </div>
        {lastTouch || followUp ? (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-admin-muted">
            {lastTouch ? (
              <span>
                Last touch {formatAgo(lastTouch)}
                {touchCount > 0 ? ` · ${touchCount} touch${touchCount === 1 ? "" : "es"}` : ""}
              </span>
            ) : null}
            {followUp ? (
              <span
                className={
                  due
                    ? "font-medium text-admin-warning bg-admin-warning-bg border border-admin-warning-border rounded-admin-sm px-1.5"
                    : ""
                }
              >
                {due ? "Follow up due " : "Follow up "}
                {formatShortDate(followUp)}
              </span>
            ) : null}
          </div>
        ) : null}
        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] font-medium text-admin-faint px-2 py-0.5 rounded-admin-sm bg-admin-bg border border-admin-border">
            {demo.slug}
          </span>
          <a
            href={demo.href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            className="text-xs font-medium text-admin-muted hover:text-admin-accent transition-colors"
          >
            Open demo →
          </a>
        </div>
      </div>
    </div>
  );
}
