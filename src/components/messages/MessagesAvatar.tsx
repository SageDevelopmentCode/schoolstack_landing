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
  photoBackground,
  photoObjectFit = "cover",
  size = "md",
}: {
  name: string;
  color: string;
  photoUrl?: string | null;
  photoBackground?: string | null;
  photoObjectFit?: "cover" | "contain";
  size?: "sm" | "md" | "lg";
}) {
  const sizeClass =
    size === "sm"
      ? "w-8 h-8 text-[10px]"
      : size === "lg"
        ? "w-11 h-11 text-sm"
        : "w-10 h-10 text-xs";

  const trimmedPhotoUrl = photoUrl?.trim() ?? "";
  const showPhoto = Boolean(trimmedPhotoUrl);
  const containLogo = showPhoto && photoObjectFit === "contain";

  return (
    <div
      className={`${sizeClass} rounded-full flex items-center justify-center text-white font-semibold shrink-0 overflow-hidden`}
      style={{
        backgroundColor: containLogo ? (photoBackground ?? "#FFFFFF") : color,
      }}
      aria-hidden={!showPhoto}
      aria-label={showPhoto ? `Photo of ${name}` : undefined}
      role={showPhoto ? "img" : undefined}
    >
      {showPhoto ? (
        <img
          src={trimmedPhotoUrl}
          alt={`Photo of ${name}`}
          className={
            containLogo
              ? "h-[70%] w-[70%] object-contain"
              : "h-full w-full object-cover"
          }
        />
      ) : (
        initialsFromName(name)
      )}
    </div>
  );
}
