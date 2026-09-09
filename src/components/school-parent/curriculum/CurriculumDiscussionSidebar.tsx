"use client";

import { useEffect, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import type { ProgramCoopCurriculumDiscussionMessage } from "@/lib/admissions/program-coop-curriculum-discussion";
import {
  getProgramCoopCurriculumTabLabel,
  type ProgramCoopCurriculumRecord,
} from "@/lib/admissions/program-coop-curriculum-storage";
import CurriculumDiscussionPanel from "@/components/school-parent/curriculum/CurriculumDiscussionPanel";
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
  initialMessages: ProgramCoopCurriculumDiscussionMessage[];
  currentGuardianId?: string | null;
  previewMode?: boolean;
};

export default function CurriculumDiscussionSidebar({
  theme,
  open,
  onClose,
  organizationId,
  programId,
  curricula,
  activeCurriculumId,
  onActiveCurriculumIdChange,
  initialMessages,
  currentGuardianId = null,
  previewMode = false,
}: CurriculumDiscussionSidebarProps) {
  const titleId = "curriculum-discussion-sidebar-title";

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

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[110]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          data-testid="curriculum-discussion-sidebar"
        >
          <div
            className="absolute inset-0"
            style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="absolute inset-y-0 right-0 z-[15] flex w-[min(100%,28rem)] max-w-full flex-col overflow-hidden border-l"
            style={{
              backgroundColor: theme.white,
              borderColor: theme.line,
              boxShadow: theme.shadowCard,
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <div
              className="flex shrink-0 flex-col gap-3 border-b px-4 py-3"
              style={{ borderColor: theme.line, backgroundColor: theme.paper }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2
                    id={titleId}
                    className="text-sm font-semibold"
                    style={{ color: theme.ink, fontFamily: theme.fontDisplay }}
                  >
                    Co-op discussion
                  </h2>
                  <p className="mt-0.5 truncate text-xs" style={{ color: theme.muted }} title={subtitle}>
                    {subtitle}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close discussion"
                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border-0 bg-transparent"
                  style={{ color: theme.muted }}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {curricula.length > 0 ? (
                <nav
                  className="flex max-w-full flex-wrap gap-1 overflow-x-auto rounded-lg p-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                  style={{ backgroundColor: "#EAF2EB" }}
                  aria-label="Discussion threads"
                  role="tablist"
                  data-testid="curriculum-discussion-thread-tabs"
                >
                  {threadItems.map((item) => {
                    const active = item.key === activeThreadKey;
                    return (
                      <button
                        key={item.key}
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
                        className="inline-flex max-w-full shrink-0 items-center rounded-lg px-3 py-2 text-[11px] font-bold transition-colors"
                        style={{
                          backgroundColor: active ? theme.white : "transparent",
                          color: active ? theme.primary : "#728079",
                          boxShadow: active ? "0 1px 4px #dbe2dc" : undefined,
                        }}
                      >
                        <span className="block max-w-[9rem] truncate">{item.label}</span>
                      </button>
                    );
                  })}
                </nav>
              ) : null}
            </div>

            <div className="flex min-h-0 flex-1 flex-col">
              <CurriculumDiscussionPanel
                key={discussionCurriculumId ?? GENERAL_DISCUSSION_KEY}
                organizationId={organizationId}
                programId={programId}
                curriculumId={discussionCurriculumId}
                initialMessages={
                  discussionCurriculumId ? [] : initialMessages
                }
                currentGuardianId={currentGuardianId}
                previewMode={previewMode}
                embedded
              />
            </div>
          </motion.aside>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
