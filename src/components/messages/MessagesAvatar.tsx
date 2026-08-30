"use client";

import { initialsFromName } from "@/lib/messages/format";

export type MessagesLayoutVariant =
  | "card"
  | "embedded"
  | "parent-story"
  | "admin-story";

export default function MessagesAvatar({
  name,
  color,
  photoUrl,
  size = "md",
}: {
  name: string;
  color: string;
  photoUrl?: string | null;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClass =
    size === "sm"
      ? "w-8 h-8 text-[10px]"
      : size === "lg"
        ? "w-11 h-11 text-sm"
        : "w-10 h-10 text-xs";

  const trimmedPhotoUrl = photoUrl?.trim() ?? "";

  return (
    <div
      className={`${sizeClass} rounded-full flex items-center justify-center text-white font-semibold shrink-0 overflow-hidden`}
      style={{ backgroundColor: color }}
      aria-hidden={!trimmedPhotoUrl}
      aria-label={trimmedPhotoUrl ? `Photo of ${name}` : undefined}
      role={trimmedPhotoUrl ? "img" : undefined}
    >
      {trimmedPhotoUrl ? (
        <img
          src={trimmedPhotoUrl}
          alt={`Photo of ${name}`}
          className="h-full w-full object-cover"
        />
      ) : (
        initialsFromName(name)
      )}
    </div>
  );
}
