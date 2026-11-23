"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, MessageSquare } from "lucide-react";
import ParentButton from "@/components/school-parent/ui/ParentButton";
import { gBtnOutlineSm } from "@/components/school-parent/garden/ui";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import {
  formatParentActionError,
  parentToast,
} from "@/lib/school-parent/parent-toast";
import { reportPortalOperationalError } from "@/lib/portal-operational-errors";

type ParentCoopFamilyMessageButtonProps = {
  theme: ParentThemeTokens;
  organizationId: string;
  programId: string;
  familyId: string;
  familyName: string;
  contactGuardianId: string;
  messagesHref: string;
  previewMode?: boolean;
  /** "garden" renders the Garden outline button (inside ParentGardenFrame). */
  appearance?: "portal" | "garden";
};

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error ?? "Request failed.");
  }
  return data as T;
}

export default function ParentCoopFamilyMessageButton({
  theme,
  organizationId,
  programId,
  familyId,
  familyName,
  contactGuardianId,
  messagesHref,
  previewMode = false,
  appearance = "portal",
}: ParentCoopFamilyMessageButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (previewMode || loading) return;

    setLoading(true);
    try {
      const data = await fetchJson<{ threadId: string }>(
        "/api/parent-portal/messages/threads",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            organizationId,
            programId,
            contact: {
              key: `guardian:${contactGuardianId}`,
              kind: "guardian",
              guardianId: contactGuardianId,
              familyId,
              name: familyName,
            },
          }),
        },
      );

      const separator = messagesHref.includes("?") ? "&" : "?";
      router.push(`${messagesHref}${separator}thread=${encodeURIComponent(data.threadId)}`);
    } catch (err) {
      parentToast.error(
        formatParentActionError(err, "Could not start that conversation."),
      );
      setLoading(false);
      void reportPortalOperationalError(
        "parent_portal",
        {
          organizationId,
          operation: "messages.start_thread",
          error: "",
        },
        err,
      );
    }
  };

  const icon = loading ? (
    <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
  ) : (
    <MessageSquare className="h-3.5 w-3.5" aria-hidden />
  );

  if (appearance === "garden") {
    return (
      <button
        type="button"
        disabled={previewMode || loading}
        onClick={() => void handleClick()}
        className={`${gBtnOutlineSm} !px-3.5 !py-2 !text-[13px]`}
        aria-label={`Message ${familyName}`}
        aria-busy={loading || undefined}
      >
        {icon}
        Message
        {previewMode ? " (preview)" : ""}
      </button>
    );
  }

  return (
    <ParentButton
      theme={theme}
      variant="outline"
      type="button"
      disabled={previewMode || loading}
      onClick={() => void handleClick()}
      className="!inline-flex !items-center !gap-1.5 !px-2.5 !py-1 !text-[12px]"
      aria-label={`Message ${familyName}`}
    >
      {icon}
      Message
      {previewMode ? " (preview)" : ""}
    </ParentButton>
  );
}
