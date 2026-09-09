"use client";

import { MessageSquare } from "lucide-react";
import {
  getProgramCoopCurriculumTabLabel,
  type ProgramCoopCurriculumRecord,
} from "@/lib/admissions/program-coop-curriculum-storage";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type CurriculumGuideListPanelProps = {
  theme: ParentThemeTokens;
  curricula: ProgramCoopCurriculumRecord[];
  activeCurriculumId: string;
  onSelect: (curriculumId: string) => void;
  onOpenDiscussion: (curriculumId: string | null) => void;
};

function DiscussionIconButton({
  theme,
  ariaLabel,
  testId,
  onClick,
}: {
  theme: ParentThemeTokens;
  ariaLabel: string;
  testId?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      data-testid={testId}
      onClick={onClick}
      className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border-0 transition-colors"
      style={{
        backgroundColor: theme.primarySoft,
        color: theme.primary,
      }}
    >
      <MessageSquare className="h-3.5 w-3.5" aria-hidden />
    </button>
  );
}

export default function CurriculumGuideListPanel({
  theme,
  curricula,
  activeCurriculumId,
  onSelect,
  onOpenDiscussion,
}: CurriculumGuideListPanelProps) {
  return (
    <aside
      className="flex h-full min-h-0 w-full shrink-0 flex-col border-r px-3 py-3 md:w-56 lg:w-60"
      style={{
        backgroundColor: theme.white,
        borderColor: theme.line,
      }}
      aria-label="Curriculum guides"
      data-testid="curriculum-guide-list"
    >
      <p
        className="mb-2 px-1 text-[11px] font-bold uppercase tracking-wide"
        style={{ color: theme.muted }}
      >
        Guides
      </p>

      <div className="mb-2 flex items-center gap-2">
        <span
          className="min-w-0 flex-1 truncate px-1 text-xs font-semibold"
          style={{ color: theme.ink }}
        >
          General
        </span>
        <DiscussionIconButton
          theme={theme}
          ariaLabel="Open general co-op discussion"
          testId="curriculum-discussion-open-general"
          onClick={() => onOpenDiscussion(null)}
        />
      </div>

      <ul
        className="m-0 flex min-h-0 list-none flex-col gap-1 overflow-y-auto p-0"
        role="tablist"
        aria-label="Curriculum guides"
      >
        {curricula.map((record) => {
          const fullLabel = getProgramCoopCurriculumTabLabel(record);
          const active = record.id === activeCurriculumId;

          return (
            <li key={record.id}>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  role="tab"
                  aria-selected={active}
                  title={fullLabel}
                  data-testid={`curriculum-guide-tab-${record.id}`}
                  onClick={() => onSelect(record.id)}
                  className="min-w-0 flex-1 rounded-md border px-3 py-2.5 text-left text-xs font-semibold transition-colors"
                  style={{
                    borderColor: active ? theme.primary : theme.line,
                    backgroundColor: active ? theme.white : theme.paper,
                    color: active ? theme.primary : theme.ink,
                    boxShadow: active ? "0 1px 4px #dbe2dc" : undefined,
                  }}
                >
                  <span className="block min-w-0 truncate">{fullLabel}</span>
                </button>
                <DiscussionIconButton
                  theme={theme}
                  ariaLabel={`Open discussion for ${fullLabel}`}
                  testId={`curriculum-discussion-open-${record.id}`}
                  onClick={() => onOpenDiscussion(record.id)}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
