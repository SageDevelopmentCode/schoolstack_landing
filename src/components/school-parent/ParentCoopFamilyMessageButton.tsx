"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, MessageSquare } from "lucide-react";
import ParentButton from "@/components/school-parent/ui/ParentButton";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import {
  formatParentActionError,
  parentToast,
} from "@/lib/school-parent/parent-toast";

type ParentCoopFamilyMessageButtonProps = {
  theme: ParentThemeTokens;
  organizationId: string;
  programId: string;
  familyId: string;
  familyName: string;
  contactGuardianId: string;
  messagesHref: string;
  previewMode?: boolean;
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
    }
  };

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
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
      ) : (
        <MessageSquare className="h-3.5 w-3.5" aria-hidden />
      )}
      Message
      {previewMode ? " (preview)" : ""}
    </ParentButton>
  );
}
