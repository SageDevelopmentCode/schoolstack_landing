"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Bell } from "lucide-react";
import { G_FOCUS } from "@/components/school-parent/garden/ui";

/**
 * Notifications bell for the Garden header. Gives one gentle wiggle when the
 * unread count goes up while the page is open (never under reduced motion).
 */
export default function GardenBellButton({
  unreadCount,
  onClick,
}: {
  unreadCount: number;
  onClick: () => void;
}) {
  const reduce = useReducedMotion() === true;
  const previous = useRef(unreadCount);
  const [wiggleKey, setWiggleKey] = useState(0);

  useEffect(() => {
    if (unreadCount > previous.current && !reduce) {
      queueMicrotask(() => setWiggleKey((key) => key + 1));
    }
    previous.current = unreadCount;
  }, [unreadCount, reduce]);

  const label =
    unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications";

  return (
    <span className="group/bell relative inline-flex">
      <button
        type="button"
        onClick={onClick}
        aria-label={label}
        data-testid="parent-header-notifications"
        className={`relative inline-flex h-10 w-10 items-center justify-center rounded-full border-[1.5px] border-[var(--sf-ink)]/15 bg-white text-[var(--sf-ink)] shadow-[0_2px_0_0_rgba(43,36,29,0.08)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--sf-ink)]/35 ${G_FOCUS}`}
      >
        <motion.span
          key={wiggleKey}
          className="inline-flex"
          initial={wiggleKey > 0 ? { rotate: 0 } : false}
          animate={wiggleKey > 0 ? { rotate: [0, -16, 13, -9, 5, 0] } : undefined}
          transition={{ duration: 0.7, ease: "easeInOut" }}
          style={{ transformOrigin: "50% 15%" }}
        >
          <Bell className="h-[18px] w-[18px]" strokeWidth={2.3} aria-hidden />
        </motion.span>
        {unreadCount > 0 ? (
          <span
            aria-hidden="true"
            className="absolute -right-1 -top-1 inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[var(--sf-clay)] px-1 text-[10px] font-extrabold leading-none tabular-nums text-white ring-[1.5px] ring-[var(--sf-ink)]"
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        ) : null}
      </button>
      <span
        role="presentation"
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-full z-[130] mt-2 hidden -translate-x-1/2 whitespace-nowrap rounded-full bg-[var(--sf-ink)] px-2.5 py-1 text-[11.5px] font-extrabold text-white opacity-0 shadow-md transition-opacity duration-150 sm:block group-hover/bell:opacity-100 group-has-[:focus-visible]/bell:opacity-100"
      >
        {unreadCount > 0 ? `${unreadCount} unread` : "Notifications"}
      </span>
    </span>
  );
}
