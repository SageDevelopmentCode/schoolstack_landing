"use client";

import { useEffect, useId } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import CommitteeDescriptionExcerpt from "@/components/school-admin/committees/CommitteeDescriptionExcerpt";
import CommitteeWorkspaceSideNav from "@/components/school-admin/committees/CommitteeWorkspaceSideNav";
import AdminChip from "@/components/school-admin/ui/story/AdminChip";
import AdminDisplayHeading from "@/components/school-admin/ui/story/AdminDisplayHeading";
import AdminSectionKicker from "@/components/school-admin/ui/story/AdminSectionKicker";
import ParentChip from "@/components/school-parent/ui/ParentChip";
import type { ParentStoryPillNavItem } from "@/components/school-parent/ui/ParentStoryPillNav";
import type { Committee } from "@/lib/committees/types";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type CommitteeWorkspaceMobileMenuSheetProps = {
  theme: ParentThemeTokens;
  open: boolean;
  committee: Committee;
  variant: "admin" | "parent";
  leaderLine: string | null;
  items: ParentStoryPillNavItem[];
  activeSection: string;
  onSectionChange: (key: string) => void;
  onClose: () => void;
  navTestId?: string;
};

export default function CommitteeWorkspaceMobileMenuSheet({
  theme,
  open,
  committee,
  variant,
  leaderLine,
  items,
  activeSection,
  onSectionChange,
  onClose,
  navTestId = "committee-section-nav",
}: CommitteeWorkspaceMobileMenuSheetProps) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const handleSectionChange = (key: string) => {
    onSectionChange(key);
    onClose();
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[110] lg:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          data-testid="committee-mobile-menu-sheet"
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
            aria-label="Committee sections"
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
              className="flex items-start justify-between gap-3 border-b px-4 py-3"
              style={{ borderColor: theme.line }}
            >
              <div className="min-w-0 flex-1">
                {variant === "admin" ? (
                  <>
                    <AdminSectionKicker theme={theme}>{committee.termLabel}</AdminSectionKicker>
                    <AdminDisplayHeading theme={theme} as="h2" size="section" id={titleId}>
                      {committee.name}
                    </AdminDisplayHeading>
                  </>
                ) : (
                  <>
                    <h2 id={titleId} className="truncate text-base font-bold" style={{ color: theme.ink }}>
                      {committee.name}
                    </h2>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                      <ParentChip theme={theme} tone="info">
                        {committee.termLabel}
                      </ParentChip>
                      <ParentChip theme={theme} tone="success">
                        Member
                      </ParentChip>
                      {committee.status === "archived" ? (
                        <ParentChip theme={theme} tone="info">
                          Archived
                        </ParentChip>
                      ) : null}
                    </div>
                  </>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close committee menu"
                className="shrink-0 border-0 bg-transparent p-0"
              >
                <X className="h-5 w-5" style={{ color: theme.muted }} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4">
              <CommitteeDescriptionExcerpt
                theme={theme}
                committeeName={committee.name}
                description={committee.description}
                leaderLine={leaderLine}
                className="mb-4"
              />

              {variant === "admin" && committee.status === "archived" ? (
                <div className="mb-4">
                  <AdminChip theme={theme} tone="info">
                    Archived
                  </AdminChip>
                </div>
              ) : null}

              <CommitteeWorkspaceSideNav
                theme={theme}
                items={items}
                activeKey={activeSection}
                onChange={handleSectionChange}
                ariaLabel="Committee sections"
                data-testid={navTestId}
              />
            </div>
          </motion.aside>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

type CommitteeWorkspaceMobileMenuButtonProps = {
  theme: ParentThemeTokens;
  currentSectionLabel: string;
  expanded: boolean;
  onClick: () => void;
  buttonRef?: React.RefObject<HTMLButtonElement | null>;
};

export function CommitteeWorkspaceMobileMenuButton({
  theme,
  currentSectionLabel,
  expanded,
  onClick,
  buttonRef,
}: CommitteeWorkspaceMobileMenuButtonProps) {
  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={onClick}
      aria-expanded={expanded}
      aria-haspopup="dialog"
      data-testid="committee-mobile-menu-button"
      className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-bold transition-colors"
      style={{
        borderColor: theme.line,
        backgroundColor: theme.white,
        color: theme.primary,
      }}
    >
      <Menu className="h-4 w-4 shrink-0" aria-hidden />
      <span className="max-w-[8rem] truncate">{currentSectionLabel}</span>
    </button>
  );
}
