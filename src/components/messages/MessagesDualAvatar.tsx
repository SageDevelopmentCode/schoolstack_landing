"use client";

import { initialsFromName } from "@/lib/messages/format";
import type { MessageThreadListAvatar } from "@/lib/messages/types";

export default function MessagesDualAvatar({
  avatars,
  size = "sm",
  ringClassName = "ring-white",
}: {
  avatars: MessageThreadListAvatar[];
  size?: "sm" | "md" | "lg";
  ringClassName?: string;
}) {
  const [first, second] = avatars;
  if (!first || !second) return null;

  const sizeClass =
    size === "sm"
      ? "h-8 w-8 text-[10px]"
      : size === "lg"
        ? "h-11 w-11 text-sm"
        : "h-10 w-10 text-xs";

  const label = `${first.name} and ${second.name}`;
  const ringClass = `ring-2 ${ringClassName}`;

  const renderAvatar = (avatar: MessageThreadListAvatar) => {
    const photoUrl = avatar.profilePhotoUrl?.trim() ?? "";
    if (photoUrl) {
      return (
        <img
          src={photoUrl}
          alt={`Photo of ${avatar.name}`}
          className="h-full w-full object-cover"
        />
      );
    }
    return initialsFromName(avatar.name);
  };

  return (
    <div
      className="relative h-8 w-[2.75rem] shrink-0"
      aria-label={label}
      role="img"
    >
      <div
        className={`absolute left-0 top-0 ${sizeClass} flex items-center justify-center rounded-full font-semibold text-white overflow-hidden ${ringClass}`}
        style={{ backgroundColor: first.color }}
        aria-hidden
      >
        {renderAvatar(first)}
      </div>
      <div
        className={`absolute left-4 top-0 ${sizeClass} flex items-center justify-center rounded-full font-semibold text-white overflow-hidden ${ringClass}`}
        style={{ backgroundColor: second.color }}
        aria-hidden
      >
        {renderAvatar(second)}
      </div>
    </div>
  );
}
