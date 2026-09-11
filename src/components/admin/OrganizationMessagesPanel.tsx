"use client";

import { useCallback, useState } from "react";
import OrganizationCommitteeMessagesPanel from "@/components/admin/OrganizationCommitteeMessagesPanel";
import OrganizationCoopDiscussionMessagesPanel from "@/components/admin/OrganizationCoopDiscussionMessagesPanel";
import PlatformMessagesModerationInbox from "@/components/admin/PlatformMessagesModerationInbox";

type OrganizationMessagesSource = "portal" | "committees" | "coop";

type OrganizationMessagesPanelProps = {
  organizationId: string;
  organizationName: string;
};

const SOURCE_TABS: { id: OrganizationMessagesSource; label: string }[] = [
  { id: "portal", label: "Portal" },
  { id: "committees", label: "Committees" },
  { id: "coop", label: "Co-op discussion" },
];

export default function OrganizationMessagesPanel({
  organizationId,
  organizationName,
}: OrganizationMessagesPanelProps) {
  const [activeSource, setActiveSource] =
    useState<OrganizationMessagesSource>("portal");
  const [visitedSources, setVisitedSources] = useState<
    Set<OrganizationMessagesSource>
  >(() => new Set(["portal"]));

  const selectSource = useCallback((source: OrganizationMessagesSource) => {
    setActiveSource(source);
    setVisitedSources((prev) => {
      if (prev.has(source)) return prev;
      const next = new Set(prev);
      next.add(source);
      return next;
    });
  }, []);

  return (
    <div className="space-y-4">
      <p className="text-sm text-admin-muted">
        Read-only oversight for {organizationName}. You cannot send or edit messages.
      </p>

      <div className="flex flex-wrap gap-2">
        {SOURCE_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => selectSource(tab.id)}
            className={`rounded-admin-md border px-3 py-1.5 text-sm font-medium transition-colors ${
              activeSource === tab.id
                ? "border-admin-accent bg-admin-accent-soft text-admin-accent"
                : "border-admin-border bg-admin-bg text-admin-muted hover:bg-admin-neutral-bg"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {visitedSources.has("portal") ? (
        <div hidden={activeSource !== "portal"} aria-hidden={activeSource !== "portal"}>
          <PlatformMessagesModerationInbox
            organizationId={organizationId}
            layout="embedded"
          />
        </div>
      ) : null}

      {visitedSources.has("committees") ? (
        <div hidden={activeSource !== "committees"} aria-hidden={activeSource !== "committees"}>
          <OrganizationCommitteeMessagesPanel organizationId={organizationId} />
        </div>
      ) : null}

      {visitedSources.has("coop") ? (
        <div hidden={activeSource !== "coop"} aria-hidden={activeSource !== "coop"}>
          <OrganizationCoopDiscussionMessagesPanel organizationId={organizationId} />
        </div>
      ) : null}
    </div>
  );
}
