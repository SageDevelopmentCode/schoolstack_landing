"use client";

import { useId, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { formatMessagesUnreadBadge } from "@/components/messages/MessagesNavBadge";
import { G_FOCUS } from "@/components/school-parent/garden/ui";

export type GardenCommitteeNavItem = {
  key: string;
  label: string;
  icon?: ReactNode;
  testId?: string;
  /** The section is mounting for the first time. */
  pending?: boolean;
  unreadCount?: number;
  isNew?: boolean;
};

/**
 * Vertical Garden tab list for the committee workspace: the active section
 * sits on an accent pill that glides between rows (framer layoutId), unread
 * counts show as accent badges, and a spinner marks a section that is loading.
 */
export default function GardenCommitteeSectionNav({
  items,
  activeKey,
  onChange,
  ariaLabel,
  "data-testid": testId,
}: {
  items: GardenCommitteeNavItem[];
  activeKey: string;
  onChange: (key: string) => void;
  ariaLabel: string;
  "data-testid"?: string;
}) {
  const reduce = useReducedMotion() === true;
  const pillId = useId();

  return (
    <nav role="tablist" aria-label={ariaLabel} aria-orientation="vertical" data-testid={testId} className="flex flex-col gap-1">
      {items.map((item) => {
        const active = item.key === activeKey;
        const unread = item.unreadCount ?? 0;
        return (
          <button
            key={item.key}
            type="button"
            role="tab"
            aria-selected={active}
            aria-current={active ? "true" : undefined}
            aria-busy={item.pending || undefined}
            disabled={item.pending}
            data-testid={item.testId}
            onClick={() => onChange(item.key)}
            className={`relative flex w-full items-center gap-2.5 rounded-full px-3.5 py-2.5 text-left text-[14px] font-extrabold transition-colors duration-200 disabled:cursor-wait ${
              active
                ? "text-white"
                : "text-[var(--sf-ink)]/70 hover:bg-[var(--sf-accent-wash)] hover:text-[var(--sf-ink)]"
            } ${G_FOCUS} focus-visible:ring-offset-0`}
          >
            {active ? (
              <motion.span
                layoutId={`committee-nav-pill-${pillId}`}
                aria-hidden="true"
                className="absolute inset-0 rounded-full bg-[var(--sf-clay)] shadow-[0_2px_0_0_var(--sf-ink)]"
                transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 34 }}
              />
            ) : null}
            <span className="relative flex min-w-0 flex-1 items-center gap-2.5">
              <span aria-hidden="true" className="flex shrink-0 [&_svg]:h-4 [&_svg]:w-4 [&_svg]:[stroke-width:2.4]">
                {item.icon}
              </span>
              <span className="min-w-0 flex-1 truncate">{item.label}</span>
              {item.pending ? (
                <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" aria-hidden data-testid="parent-committee-tab-loading" />
              ) : unread > 0 ? (
                <span
                  className={`inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full px-1.5 text-[11px] font-extrabold leading-none ${
                    active ? "bg-white text-[var(--sf-clay-deep)]" : "bg-[var(--sf-clay)] text-white"
                  }`}
                >
                  <span className="sr-only">, </span>
                  {formatMessagesUnreadBadge(unread)}
                  <span className="sr-only"> unread</span>
                </span>
              ) : item.isNew ? (
                <span
                  className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide ${
                    active ? "bg-white/90 text-[var(--sf-forest)]" : "bg-[var(--sf-mint)] text-[var(--sf-forest)]"
                  }`}
                >
                  New!
                </span>
              ) : null}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
