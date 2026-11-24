"use client";

import { ChevronRight, FileText, Mail, MailCheck, Monitor, SearchX, type LucideIcon } from "lucide-react";
import { GChip, G_FOCUS } from "@/components/school-parent/garden/ui";
import { GardenSearchInput } from "@/components/school-admin/garden/blocks";
import { ROW_INTERACTIVE } from "@/components/school-admin/garden/kit";
import { SCHOOL_TRAITS, SCHOOL_TRAIT_LABEL, journeyChip, journeyNextLine, type SchoolTrait } from "./research-ui";
import { listFilterLabel, type ListFilter, type WorkspaceRow } from "./useResearchWorkspaceModel";

const TRAIT_ICON: Record<SchoolTrait, LucideIcon> = { demo: Monitor, snapshot: FileText, letter: Mail };

/** Multi-select "Has" chips: show only schools that have every chip that's on. */
function TraitFilters({
  traits,
  counts,
  onToggle,
  onClear,
}: {
  traits: SchoolTrait[];
  counts: Record<SchoolTrait, number>;
  onToggle: (trait: SchoolTrait) => void;
  onClear: () => void;
}) {
  return (
    <div role="group" aria-label="Show schools that have" className="mt-2 flex flex-wrap items-center gap-1.5 px-1" data-testid="research-trait-filters">
      <span className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-[var(--sf-soft)]">Has</span>
      {SCHOOL_TRAITS.map((trait) => {
        const active = traits.includes(trait);
        const Icon = TRAIT_ICON[trait];
        return (
          <button
            key={trait}
            type="button"
            aria-pressed={active}
            onClick={() => onToggle(trait)}
            className={`inline-flex min-h-[30px] items-center gap-1 rounded-full border-[1.5px] px-2.5 py-0.5 text-[12.5px] font-extrabold transition-all duration-200 ${
              active
                ? "border-[var(--sf-ink)] bg-[var(--sf-clay)] text-white shadow-[0_2px_0_0_var(--sf-ink)]"
                : "border-[var(--sf-ink)]/15 bg-white text-[var(--sf-ink)]/70 hover:border-[var(--sf-ink)]/35 hover:text-[var(--sf-ink)]"
            } ${G_FOCUS}`}
          >
            <Icon className="h-3.5 w-3.5" aria-hidden />
            {SCHOOL_TRAIT_LABEL[trait]}
            <span className={`tabular-nums ${active ? "text-white/80" : "text-[var(--sf-soft)]"}`}>{counts[trait]}</span>
          </button>
        );
      })}
      {traits.length > 0 ? (
        <button type="button" onClick={onClear} className={`rounded-full px-1.5 text-[12px] font-extrabold text-[var(--sf-clay-deep)] hover:underline ${G_FOCUS}`}>
          Clear
        </button>
      ) : null}
    </div>
  );
}

const PRIORITY_CHIP: Record<number, string> = {
  5: "bg-[var(--sf-mint)] text-[var(--sf-forest)]",
  4: "bg-[var(--sf-sky)] text-[#24507a]",
  3: "bg-[var(--sf-butter)] text-[#6b4f00]",
  2: "bg-[var(--sf-ink)]/[0.06] text-[var(--sf-ink)]/70",
  1: "bg-[var(--sf-ink)]/[0.06] text-[var(--sf-ink)]/70",
};

export function SchoolList({
  rows,
  selectedId,
  flashId,
  onSelect,
  search,
  onSearch,
  filter,
  onResetFilter,
  traits,
  traitCounts,
  onToggleTrait,
  onClearTraits,
}: {
  rows: WorkspaceRow[];
  selectedId: string | null;
  flashId: string | null;
  onSelect: (id: string) => void;
  search: string;
  onSearch: (value: string) => void;
  filter: ListFilter;
  onResetFilter: () => void;
  traits: SchoolTrait[];
  traitCounts: Record<SchoolTrait, number>;
  onToggleTrait: (trait: SchoolTrait) => void;
  onClearTraits: () => void;
}) {
  return (
    <section
      aria-label="Schools"
      className="flex min-h-0 flex-col rounded-[24px] border-[1.5px] border-[var(--sf-ink)]/12 bg-white shadow-[0_3px_0_0_rgba(43,36,29,0.08)] xl:sticky xl:top-4 xl:max-h-[calc(100dvh-6rem)]"
    >
      <div className="border-b border-[var(--sf-ink)]/[0.08] p-3">
        <GardenSearchInput
          value={search}
          onChange={onSearch}
          placeholder="Search schools, contacts, notes…"
          label="Search schools"
          data-testid="research-search"
        />
        <TraitFilters traits={traits} counts={traitCounts} onToggle={onToggleTrait} onClear={onClearTraits} />
        <p className="m-0 mt-2 px-1 text-[12px] font-bold text-[var(--sf-soft)]" aria-live="polite">
          <span className="tabular-nums">{rows.length}</span> {rows.length === 1 ? "school" : "schools"} · {listFilterLabel(filter)}
          {traits.length > 0 ? ` · ${traits.map((t) => SCHOOL_TRAIT_LABEL[t]).join(" + ")}` : ""}
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="flex flex-col items-start gap-2 p-5">
          <SearchX className="h-5 w-5 text-[var(--sf-soft)]" aria-hidden />
          <p className="m-0 text-[14px] font-extrabold text-[var(--sf-ink)]">No schools match this filter.</p>
          <button
            type="button"
            onClick={() => {
              onSearch("");
              onResetFilter();
              onClearTraits();
            }}
            className="text-sm font-extrabold text-[var(--sf-clay-deep)] hover:underline"
          >
            Show the whole pipeline
          </button>
        </div>
      ) : (
        <ul className="m-0 min-h-0 flex-1 list-none overflow-y-auto p-1.5" data-testid="research-school-list">
          {rows.map(({ school, journey }) => {
            const chip = journeyChip(journey);
            const next = journeyNextLine(journey);
            const selected = school.id === selectedId;
            const flashing = school.id === flashId;
            return (
              <li key={school.id}>
                <button
                  type="button"
                  onClick={() => onSelect(school.id)}
                  aria-current={selected ? "true" : undefined}
                  className={`${ROW_INTERACTIVE} !items-start ${
                    selected ? "bg-[var(--sf-accent-wash)] shadow-[inset_3px_0_0_0_var(--sf-clay)]" : ""
                  } ${flashing ? "!bg-[var(--sf-mint)]" : ""}`}
                >
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5">
                      <span className="truncate text-[14.5px] font-extrabold text-[var(--sf-ink)]">{school.name}</span>
                      {school.demo_slug ? (
                        <Monitor className="h-3.5 w-3.5 shrink-0 text-[var(--sf-forest)]" aria-label="Has a demo" />
                      ) : null}
                      {journey.letter ? (
                        journey.letter.mailedAt ? (
                          <span title="Handwritten letter mailed" className="inline-flex shrink-0">
                            <MailCheck className="h-3.5 w-3.5 text-[var(--sf-forest)]" aria-label="Letter mailed" />
                          </span>
                        ) : (
                          <span title="Handwritten letter to write and mail" className="inline-flex shrink-0">
                            <Mail className="h-3.5 w-3.5 text-[var(--sf-clay-deep)]" strokeWidth={2.4} aria-label="Handwritten letter to mail" />
                          </span>
                        )
                      ) : null}
                    </span>
                    <span className="mt-0.5 block truncate text-[12.5px] font-semibold text-[var(--sf-soft)]">
                      {[school.location, school.state].filter(Boolean).join(" · ") || "No location"}
                    </span>
                    <span className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      <GChip tone={chip.tone}>{chip.label}</GChip>
                      {next && journey.next?.dueAt ? (
                        <span className={`text-[12px] font-bold ${journey.due ? "text-[var(--sf-clay-deep)]" : "text-[var(--sf-soft)]"}`}>
                          {next.split(" · ")[1]}
                        </span>
                      ) : null}
                    </span>
                  </span>
                  <span className="flex shrink-0 flex-col items-end gap-1">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-extrabold tabular-nums ${PRIORITY_CHIP[school.priority_score] ?? PRIORITY_CHIP[2]}`}
                      title="Priority"
                    >
                      P{school.priority_score}
                    </span>
                    <ChevronRight className="h-4 w-4 text-[var(--sf-ink)]/30 transition-transform group-hover:translate-x-0.5" aria-hidden />
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
