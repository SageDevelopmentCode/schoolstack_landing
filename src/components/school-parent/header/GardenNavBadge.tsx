"use client";

import { formatMessagesUnreadBadge } from "@/components/messages/MessagesNavBadge";

/**
 * Unread count on a Garden nav pill / tile. Accent with an ink ring; flips to
 * white on the active (accent) pill so it never disappears into it.
 */
export default function GardenNavBadge({
  count,
  onAccent = false,
  className = "",
  label,
}: {
  count: number;
  onAccent?: boolean;
  className?: string;
  /** Screen-reader text, e.g. "3 unread". Defaults to "{count} unread". */
  label?: string;
}) {
  if (count <= 0) return null;
  return (
    <span
      className={`inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1.5 text-[10px] font-extrabold leading-none tabular-nums ring-[1.5px] ${
        onAccent
          ? "bg-white text-[var(--sf-clay-deep)] ring-[var(--sf-ink)]/20"
          : "bg-[var(--sf-clay)] text-white ring-[var(--sf-ink)]"
      } ${className}`}
    >
      <span aria-hidden="true">{formatMessagesUnreadBadge(count)}</span>
      <span className="sr-only">{label ?? `${count} unread`}</span>
    </span>
  );
}
