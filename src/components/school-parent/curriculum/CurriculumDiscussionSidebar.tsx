"use client";

import { useEffect, useMemo, useRef } from "react";
import type { ProgramCoopCurriculumDiscussionMessage } from "@/lib/admissions/program-coop-curriculum-discussion";
import {
  getProgramCoopCurriculumTabLabel,
  type ProgramCoopCurriculumRecord,
} from "@/lib/admissions/program-coop-curriculum-storage";
import CurriculumDiscussionPanel from "@/components/school-parent/curriculum/CurriculumDiscussionPanel";
import type { CurriculumThread } from "@/components/school-parent/curriculum/useCurriculumThread";
import GSidePanel from "@/components/school-parent/garden/GSidePanel";
import { G_TOGGLE, G_TOGGLE_OFF, G_TOGGLE_ON } from "@/components/school-parent/garden/ui";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

const GENERAL_DISCUSSION_KEY = "general";

type ThreadItem = {
  key: string;
  label: string;
  fullLabel: string;
  testId: string;
};

type CurriculumDiscussionSidebarProps = {
  theme: ParentThemeTokens;
  open: boolean;
  onClose: () => void;
  organizationId: string;
  programId: string;
  curricula: ProgramCoopCurriculumRecord[];
  activeCurriculumId: string | null;
  onActiveCurriculumIdChange: (curriculumId: string | null) => void;
  /** Server-loaded messages by thread key ("general" or a guide id). */
  initialThreadMessages: Record<string, ProgramCoopCurriculumDiscussionMessage[]>;
  currentGuardianId?: string | null;
  previewMode?: boolean;
  /** The reader's thread for its open guide: reused when the drawer shows that guide. */
  readerThread?: CurriculumThread;
  /** Reader page (for "About page N") and jump-to-page from page pills. */
  currentPage?: number | null;
  onJumpToPage?: (page: number) => void;
};

/*
 * Co-op discussion drawer on the Garden GSidePanel (own frame, Escape, focus
 * return). Thread chips (General + one per guide) sit in `headerBelow`; guide
 * titles can be long, so they are truncated chips in a scrolling row rather
 * than a GTabBar. The chat fills the body edge to edge.
 */
export default function CurriculumDiscussionSidebar({
  theme,
  open,
  onClose,
  organizationId,
  programId,
  curricula,
  activeCurriculumId,
  onActiveCurriculumIdChange,
  initialThreadMessages,
  currentGuardianId = null,
  previewMode = false,
  readerThread,
  currentPage = null,
  onJumpToPage,
}: CurriculumDiscussionSidebarProps) {
  const activeChipRef = useRef<HTMLButtonElement>(null);

  const activeGuide = useMemo(
    () => curricula.find((record) => record.id === activeCurriculumId) ?? null,
    [activeCurriculumId, curricula],
  );

  const threadItems = useMemo((): ThreadItem[] => {
    const items: ThreadItem[] = [
      {
        key: GENERAL_DISCUSSION_KEY,
        label: "General",
        fullLabel: "General co-op chat",
        testId: "curriculum-discussion-thread-general",
      },
    ];

    for (const guide of curricula) {
      const fullLabel = getProgramCoopCurriculumTabLabel(guide);
      items.push({
        key: guide.id,
        label: fullLabel,
        fullLabel,
        testId: `curriculum-discussion-thread-${guide.id}`,
      });
    }

    return items;
  }, [curricula]);

  const activeThreadKey = activeCurriculumId ?? GENERAL_DISCUSSION_KEY;
  const discussionCurriculumId =
    activeThreadKey === GENERAL_DISCUSSION_KEY ? null : activeThreadKey;

  const subtitle =
    discussionCurriculumId && activeGuide
      ? `Discussion for ${getProgramCoopCurriculumTabLabel(activeGuide)}`
      : "General co-op chat";

  // Bring the active thread chip into view (opening on a later guide).
  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(
      () => activeChipRef.current?.scrollIntoView({ block: "nearest", inline: "nearest" }),
      80,
    );
    return () => window.clearTimeout(timer);
  }, [activeThreadKey, open]);

  const threadTabs =
    curricula.length > 0 ? (
      <nav
        className="-mx-1 flex max-w-none gap-1.5 overflow-x-auto px-1 py-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        aria-label="Discussion threads"
        role="tablist"
        data-testid="curriculum-discussion-thread-tabs"
      >
        {threadItems.map((item) => {
          const active = item.key === activeThreadKey;
          return (
            <button
              key={item.key}
              ref={active ? activeChipRef : undefined}
              type="button"
              role="tab"
              title={item.fullLabel}
              aria-selected={active}
              data-testid={item.testId}
              onClick={() =>
                onActiveCurriculumIdChange(
                  item.key === GENERAL_DISCUSSION_KEY ? null : item.key,
                )
              }
              className={`${G_TOGGLE} ${active ? G_TOGGLE_ON : G_TOGGLE_OFF} max-w-full shrink-0 cursor-pointer focus-visible:ring-offset-0`}
            >
              <span className="block max-w-[10rem] truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>
    ) : null;

  return (
    <GSidePanel
      theme={theme}
      open={open}
      onClose={onClose}
      kicker="Curriculum"
      title="Co-op discussion"
      subtitle={
        <span className="block truncate" title={subtitle}>
          {subtitle}
        </span>
      }
      closeLabel="Close discussion"
      testId="curriculum-discussion-sidebar"
      panelId="curriculum-discussion-sidebar"
      headerBelow={threadTabs}
    >
      {/* The chat owns its scroll + composer: cancel the drawer body padding. */}
      <div
        className="-mx-5 -mt-5 flex min-h-0 flex-1 flex-col sm:-mx-6"
        style={{ marginBottom: "calc(-1 * max(1.25rem, env(safe-area-inset-bottom)))" }}
      >
        <CurriculumDiscussionPanel
          key={discussionCurriculumId ?? GENERAL_DISCUSSION_KEY}
          organizationId={organizationId}
          programId={programId}
          curriculumId={discussionCurriculumId}
          initialMessages={initialThreadMessages[discussionCurriculumId ?? GENERAL_DISCUSSION_KEY]}
          thread={
            readerThread && readerThread.curriculumId === discussionCurriculumId ? readerThread : undefined
          }
          currentPage={discussionCurriculumId ? currentPage : null}
          onJumpToPage={
            discussionCurriculumId && onJumpToPage
              ? (page) => {
                  onJumpToPage(page);
                  onClose();
                }
              : undefined
          }
          currentGuardianId={currentGuardianId}
          previewMode={previewMode}
          embedded
        />
      </div>
    </GSidePanel>
  );
}
