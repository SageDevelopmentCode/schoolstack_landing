"use client";

import { initialsFromName } from "@/lib/messages/format";

export type MessagesLayoutVariant = "card" | "embedded";

export default function MessagesAvatar({
  name,
  color,
  size = "md",
}: {
  name: string;
  color: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClass =
    size === "sm"
      ? "w-8 h-8 text-[10px]"
      : size === "lg"
        ? "w-11 h-11 text-sm"
        : "w-10 h-10 text-xs";

  return (
    <div
      className={`${sizeClass} rounded-full flex items-center justify-center text-white font-semibold shrink-0`}
      style={{ backgroundColor: color }}
      aria-hidden
    >
      {initialsFromName(name)}
    </div>
  );
}
