"use client";

import { ArrowUpRight, CheckCircle2, Compass, Lightbulb, TriangleAlert, type LucideIcon } from "lucide-react";
import { GCard } from "@/components/school-parent/garden/ui";
import { GardenFacts } from "@/components/school-admin/garden/blocks";
import type { WorkspaceRow } from "./useResearchWorkspaceModel";

const SOURCE_LABEL: Record<string, string> = {
  texas: "TX research",
  manual: "Added by hand",
  demo: "From a demo",
};

function NoteList({
  icon: Icon,
  tint,
  title,
  items,
}: {
  icon: LucideIcon;
  tint: string;
  title: string;
  items: string[];
}) {
  if (items.length === 0) return null;
  return (
    <div className="rounded-[16px] border-[1.5px] border-[var(--sf-ink)]/10 bg-[var(--sf-paper)] p-4">
      <p className="m-0 flex items-center gap-2 text-[13px] font-extrabold text-[var(--sf-ink)]">
        <span className={`grid h-7 w-7 place-items-center rounded-full ring-1 ring-[var(--sf-ink)]/20 ${tint}`} aria-hidden>
          <Icon className="h-3.5 w-3.5" strokeWidth={2.4} />
        </span>
        {title}
      </p>
      <ul className="m-0 mt-2 list-disc space-y-1 pl-5 text-[13.5px] leading-snug text-[var(--sf-ink)]/80">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

/** Right rail: what we know about the school, and the plan's sourced facts. */
export function SchoolResearchRail({ row }: { row: WorkspaceRow }) {
  const { school, plan } = row;
  return (
    <div className="flex min-w-0 flex-col gap-5" data-testid="research-rail">
      <GCard kicker="Research" title="About the school" headingLevel="h3">
        <GardenFacts
          className="!grid-cols-2"
          items={[
            { label: "Model", value: school.school_model || "Not specified" },
            { label: "Grades", value: school.grades || "Not specified" },
            { label: "Size", value: school.estimated_size || "Not specified" },
            { label: "Confidence", value: school.confidence || "—" },
            { label: "Tuition", value: school.tuition_schedule || "Not published" },
            { label: "Source", value: SOURCE_LABEL[school.source_file] ?? "Expanded research" },
          ]}
        />
        <div className="mt-4 grid gap-3">
          <NoteList icon={CheckCircle2} tint="bg-[var(--sf-mint)]" title="What they do well" items={school.strengths} />
          <NoteList icon={TriangleAlert} tint="bg-[var(--sf-butter)]" title="Gaps to check" items={school.pain_points} />
          {school.software_fit_reason ? (
            <NoteList icon={Lightbulb} tint="bg-[var(--sf-sky)]" title="Why MudKitchen fits" items={[school.software_fit_reason]} />
          ) : null}
        </div>
      </GCard>

      {plan && !plan.doNotEmail ? (
        <GCard kicker={`Plan · researched ${plan.researchedAt}`} title="Sourced facts" headingLevel="h3" index={1}>
          <p className="m-0 flex items-start gap-2 text-[13.5px] font-bold text-[var(--sf-ink)]">
            <Compass className="mt-0.5 h-4 w-4 shrink-0 text-[var(--sf-clay-deep)]" aria-hidden />
            {plan.angle}
          </p>
          <ul className="m-0 mt-3 grid list-none gap-2 p-0">
            {plan.facts.map((fact) => (
              <li key={`${fact.url}-${fact.fact}`} className="rounded-[12px] bg-[var(--sf-cream)] px-3 py-2">
                <p className="m-0 text-[13px] leading-snug text-[var(--sf-ink)]/85">{fact.fact}</p>
                <a
                  href={fact.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-flex items-center gap-1 text-[12px] font-extrabold text-[var(--sf-clay-deep)] hover:underline"
                >
                  {fact.source} · {fact.readOn}
                  <ArrowUpRight className="h-3 w-3" aria-hidden />
                </a>
              </li>
            ))}
          </ul>
          {plan.checkBeforeSending.length > 0 ? (
            <div className="mt-3 rounded-[12px] border-[1.5px] border-[#d9b94a]/50 bg-[var(--sf-butter)]/35 px-3 py-2">
              <p className="m-0 text-[12px] font-extrabold uppercase tracking-[0.12em] text-[#6b4f00]">Check before sending</p>
              <ul className="m-0 mt-1 list-disc space-y-1 pl-4 text-[13px] leading-snug text-[var(--sf-ink)]/85">
                {plan.checkBeforeSending.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </GCard>
      ) : null}
    </div>
  );
}
