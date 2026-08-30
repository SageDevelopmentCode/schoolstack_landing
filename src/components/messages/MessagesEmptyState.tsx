"use client";

import { MessageSquare } from "lucide-react";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import type { MessagesLayoutVariant } from "./MessagesAvatar";
import {
  isSplitPaneMessagesVariant,
  isStoryMessagesVariant,
} from "@/lib/messages/messages-layout-variant";

export default function MessagesEmptyState({
  title,
  description,
  C,
  theme,
  variant = "card",
}: {
  title: string;
  description: string;
  C: AdminThemeTokens;
  theme?: ParentThemeTokens;
  variant?: MessagesLayoutVariant;
}) {
  const splitPane = isSplitPaneMessagesVariant(variant);
  const parentStory = isStoryMessagesVariant(variant) && theme;

  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 text-center ${
        splitPane ? "flex-1 min-h-0 p-8" : "flex-1 p-8"
      }`}
    >
      <div
        className={`rounded-full flex items-center justify-center ${
          splitPane ? "w-16 h-16" : "w-12 h-12"
        }`}
        style={{
          backgroundColor: parentStory ? theme.primarySoft : C.accentLight,
        }}
      >
        <MessageSquare
          className={splitPane ? "w-7 h-7" : "w-5 h-5"}
          style={{ color: parentStory ? theme.primary : C.accent }}
        />
      </div>
      <div>
        <p
          className={`font-semibold ${splitPane ? "text-base" : "text-sm"}`}
          style={{ color: parentStory ? theme.ink : C.textPrimary }}
        >
          {title}
        </p>
        <p
          className={`mt-1 ${splitPane ? "text-sm max-w-sm" : "text-sm"}`}
          style={{ color: parentStory ? theme.muted : C.textSecondary }}
        >
          {description}
        </p>
      </div>
    </div>
  );
}
