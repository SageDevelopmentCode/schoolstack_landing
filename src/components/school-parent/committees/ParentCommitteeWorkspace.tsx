"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { Committee } from "@/lib/committees/types";
import CommitteeWorkspaceShell from "@/components/school-admin/committees/CommitteeWorkspaceShell";
import { parseCommitteeSection } from "@/components/school-admin/committees/committee-routing";
import { createClient } from "@/utils/supabase/client";

type ParentCommitteeWorkspaceProps = {
  committeeId: string;
  organizationId: string;
  C: AdminThemeTokens;
  activeSection: string;
  initialCommittee?: Committee;
  onSectionChange: (section: string) => void;
  onBack: () => void;
};

export default function ParentCommitteeWorkspace({
  committeeId,
  organizationId,
  C,
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
      try {
        const params = new URLSearchParams({ organizationId });
        const res = await fetch(
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
        className="flex items-center justify-center gap-2 p-12 text-sm"
        style={{ color: C.textSecondary }}
      >
        <Loader2 className="w-4 h-4 animate-spin" />
        Loading committee…
      </div>
    );
  }

  if (error || !committee) {
    return (
      <div className="p-6">
        <p className="text-sm" style={{ color: C.error }}>
          {error ?? "Committee not found."}
        </p>
      </div>
    );
  }

  return (
    <CommitteeWorkspaceShell
      committee={committee}
      C={C}
      supabase={supabase}
      organizationId={organizationId}
      activeSection={parseCommitteeSection(activeSection)}
      onSectionChange={onSectionChange}
      onBack={onBack}
      onCommitteeChange={setCommittee}
      readOnly
      backLabel="My committees"
    />
  );
}
