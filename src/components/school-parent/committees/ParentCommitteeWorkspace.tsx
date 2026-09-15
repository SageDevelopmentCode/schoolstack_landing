"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import type { Committee } from "@/lib/committees/types";
import { parseCommitteeSection } from "@/components/school-admin/committees/committee-routing";
import ParentCommitteeWorkspaceShell from "@/components/school-parent/committees/ParentCommitteeWorkspaceShell";
import { createClient } from "@/utils/supabase/client";
import { reportPortalOperationalError } from "@/lib/portal-operational-errors";

type ParentCommitteeWorkspaceProps = {
  committeeId: string;
  organizationId: string;
  theme: ParentThemeTokens;
  activeSection: string;
  initialCommittee?: Committee;
  onSectionChange: (section: string) => void;
  onBack: () => void;
};

export default function ParentCommitteeWorkspace({
  committeeId,
  organizationId,
  theme,
  activeSection,
  initialCommittee,
  onSectionChange,
  onBack,
}: ParentCommitteeWorkspaceProps) {
  const supabase = useMemo(() => createClient(), []);
  const [committee, setCommittee] = useState<Committee | null>(initialCommittee ?? null);
  const [loading, setLoading] = useState(!initialCommittee);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialCommittee) return;

    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      let res: Response | undefined;
      try {
        const params = new URLSearchParams({ organizationId });
        res = await fetch(
          `/api/parent-portal/committees/${committeeId}?${params}`,
        );
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data.error ?? "Failed to load committee.");
        }
        if (!cancelled) setCommittee(data.committee);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load committee.");
          setCommittee(null);
          void reportPortalOperationalError(
            "parent_portal",
            {
              organizationId,
              operation: "committees.load_workspace",
              error: "",
            },
            err,
            res?.status,
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [committeeId, organizationId, initialCommittee]);

  if (loading) {
    return (
      <div
        className="flex min-h-full items-center justify-center gap-2 p-12 text-sm"
        style={{ color: theme.muted, backgroundColor: theme.paper }}
      >
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading committee…
      </div>
    );
  }

  if (error || !committee) {
    return (
      <div className="min-h-full p-6" style={{ backgroundColor: theme.paper }}>
        <p className="text-sm" style={{ color: theme.alert }}>
          {error ?? "Committee not found."}
        </p>
      </div>
    );
  }

  return (
    <ParentCommitteeWorkspaceShell
      committee={committee}
      theme={theme}
      supabase={supabase}
      organizationId={organizationId}
      activeSection={parseCommitteeSection(activeSection)}
      onSectionChange={onSectionChange}
      onBack={onBack}
      onCommitteeChange={setCommittee}
      backLabel="My committees"
    />
  );
}
