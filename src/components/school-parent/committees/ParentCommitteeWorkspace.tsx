"use client";

import { useEffect, useMemo, useState } from "react";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import type { Committee } from "@/lib/committees/types";
import { parseCommitteeSection } from "@/components/school-admin/committees/committee-routing";
import ParentCommitteeWorkspaceShell from "@/components/school-parent/committees/ParentCommitteeWorkspaceShell";
import ParentCommitteeWorkspaceSkeleton from "@/components/school-parent/committees/ParentCommitteeWorkspaceSkeleton";
import type { CommitteesApiNamespace } from "@/components/portal-committees/PortalCommitteesPage";
import { createClient } from "@/utils/supabase/client";
import {
  reportPortalOperationalError,
  type PortalOperationalSurface,
} from "@/lib/portal-operational-errors";

type ParentCommitteeWorkspaceProps = {
  committeeId: string;
  organizationId: string;
  schoolSlug: string;
  theme: ParentThemeTokens;
  activeSection: string;
  initialCommittee?: Committee;
  previewMode?: boolean;
  apiNamespace?: CommitteesApiNamespace;
  operationalSurface?: PortalOperationalSurface;
  onSectionChange: (section: string) => void;
  onBack: () => void;
};

export default function ParentCommitteeWorkspace({
  committeeId,
  organizationId,
  schoolSlug,
  theme,
  activeSection,
  initialCommittee,
  previewMode = false,
  apiNamespace = "parent-portal",
  operationalSurface = "parent_portal",
  onSectionChange,
  onBack,
}: ParentCommitteeWorkspaceProps) {
  const supabase = useMemo(() => createClient(), []);
  const [committee, setCommittee] = useState<Committee | null>(initialCommittee ?? null);
  const [currentMemberId, setCurrentMemberId] = useState<string | undefined>();
  const [loading, setLoading] = useState(!initialCommittee && !previewMode);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (cancelled || !user) return;

      const member = (initialCommittee ?? committee)?.members.find(
        (entry) => entry.userId === user.id && entry.status === "active",
      );
      if (member) {
        setCurrentMemberId(member.id);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [committee, initialCommittee, supabase]);

  useEffect(() => {
    if (initialCommittee) {
      setCommittee(initialCommittee);
      setLoading(false);
      return;
    }
    if (previewMode) {
      setError("Committee workspace preview is unavailable for this selection.");
      setLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      let res: Response | undefined;
      try {
        const params = new URLSearchParams({ organizationId });
        res = await fetch(`/api/${apiNamespace}/committees/${committeeId}?${params}`);
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
            operationalSurface,
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
  }, [apiNamespace, committeeId, initialCommittee, operationalSurface, organizationId, previewMode]);

  if (loading) {
    return <ParentCommitteeWorkspaceSkeleton theme={theme} variant="workspace" />;
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
      schoolSlug={schoolSlug}
      activeSection={parseCommitteeSection(activeSection)}
      onSectionChange={onSectionChange}
      onBack={onBack}
      onCommitteeChange={setCommittee}
      currentMemberId={currentMemberId}
      previewMode={previewMode}
      portalApiNamespace={apiNamespace}
      backLabel="My committees"
    />
  );
}
