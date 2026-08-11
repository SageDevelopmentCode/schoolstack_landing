"use client";

import { MessageSquare } from "lucide-react";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { MessagesLayoutVariant } from "./MessagesAvatar";

export default function MessagesEmptyState({
  title,
  description,
  C,
  variant = "card",
}: {
  title: string;
  description: string;
  C: AdminThemeTokens;
  variant?: MessagesLayoutVariant;
}) {
  const embedded = variant === "embedded";

  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 text-center ${
        embedded ? "flex-1 min-h-0 p-8" : "flex-1 p-8"
      }`}
    >
      <div
        className={`rounded-full flex items-center justify-center ${
          embedded ? "w-16 h-16" : "w-12 h-12"
        }`}
        style={{ backgroundColor: C.accentLight }}
      >
        <MessageSquare
          className={embedded ? "w-7 h-7" : "w-5 h-5"}
          style={{ color: C.accent }}
        />
      </div>
      <div>
        <p
          className={`font-semibold ${embedded ? "text-base" : "text-sm"}`}
          style={{ color: C.textPrimary }}
        >
          {title}
        </p>
        <p
          className={`mt-1 ${embedded ? "text-sm max-w-sm" : "text-sm"}`}
          style={{ color: C.textSecondary }}
        >
          {description}
        </p>
      </div>
    </div>
  );
}
