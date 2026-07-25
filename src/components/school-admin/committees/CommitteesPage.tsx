"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import { buildAdminThemeTokens } from "@/lib/organization-settings/theme";
import {
  archiveCommittee,
  createCommitteeFromTemplate,
  getCommittee,
  listCommittees,
  listCommitteeTemplates,
} from "@/lib/committees/committees";
import type { Committee, CommitteeListItem, CommitteeTemplate } from "@/lib/committees/types";
import { createClient } from "@/utils/supabase/client";
import { adminToast, formatActionError } from "@/lib/school-admin/admin-toast";
import CommitteeListView from "./CommitteeListView";
import CommitteeWorkspaceShell from "./CommitteeWorkspaceShell";
import CreateCommitteeModal from "./modals/CreateCommitteeModal";
import ArchiveCommitteeModal from "./modals/ArchiveCommitteeModal";
import { parseCommitteeSection } from "./committee-routing";
import SchoolAdminSummaryCardsSkeleton from "@/components/school-admin/skeletons/SchoolAdminSummaryCardsSkeleton";

type CommitteesPageProps = {
  organizationId: string;
  branding: OrganizationBranding;
  schoolName: string;
  slug: string;
};

export default function CommitteesPage({
  organizationId,
  branding,
}: CommitteesPageProps) {
  const C = useMemo(() => buildAdminThemeTokens(branding), [branding]);
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const committeeId = searchParams.get("committee");
  const activeSection = parseCommitteeSection(searchParams.get("section"));

  const [loading, setLoading] = useState(true);
  const [committees, setCommittees] = useState<CommitteeListItem[]>([]);
  const [templates, setTemplates] = useState<CommitteeTemplate[]>([]);
  const [activeCommittee, setActiveCommittee] = useState<Committee | null>(null);
  const [loadingCommittee, setLoadingCommittee] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadList = useCallback(async () => {
    const [list, templateList] = await Promise.all([
      listCommittees(supabase, organizationId),
      listCommitteeTemplates(supabase, organizationId),
    ]);
    setCommittees(list);
    setTemplates(templateList);
  }, [supabase, organizationId]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        await loadList();
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load committees");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadList]);

  useEffect(() => {
    if (!committeeId) {
      setActiveCommittee(null);
      return;
    }

    let cancelled = false;
    (async () => {
      setLoadingCommittee(true);
      setError(null);
      try {
        const committee = await getCommittee(supabase, organizationId, committeeId);
        if (!cancelled) setActiveCommittee(committee);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load committee");
        }
      } finally {
        if (!cancelled) setLoadingCommittee(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [committeeId, supabase, organizationId]);

  const setUrl = useCallback(
    (nextCommitteeId: string | null, section?: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (nextCommitteeId) {
        params.set("committee", nextCommitteeId);
        if (section) params.set("section", section);
        else if (!params.get("section")) params.set("section", "home");
      } else {
        params.delete("committee");
        params.delete("section");
      }
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname);
    },
    [pathname, router, searchParams],
  );

  const handleOpenCommittee = (id: string) => {
    setUrl(id, "home");
  };

  const handleBack = () => {
    setUrl(null);
  };

  const handleSectionChange = (section: string) => {
    if (committeeId) setUrl(committeeId, section);
  };

  const handleCreate = async (input: {
    templateId: string | null;
    platformSlug: string;
    name: string;
    termLabel: string;
  }) => {
    try {
      const created = await createCommitteeFromTemplate(supabase, organizationId, {
        templateId: input.templateId,
        platformSlug: input.platformSlug,
        name: input.name,
        termLabel: input.termLabel,
        status: "active",
      });
      await loadList();
      setUrl(created.id, "home");
      setActiveCommittee(created);
      adminToast.success("Committee created");
    } catch (err) {
      adminToast.error(formatActionError(err, "Failed to create committee."));
      throw err;
    }
  };

  const handleArchive = async () => {
    if (!activeCommittee) return;
    try {
      const updated = await archiveCommittee(
        supabase,
        organizationId,
        activeCommittee.id,
      );
      setActiveCommittee(updated);
      await loadList();
      setShowArchive(false);
      adminToast.success("Committee archived");
    } catch (err) {
      adminToast.error(formatActionError(err, "Failed to archive committee."));
      throw err;
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <SchoolAdminSummaryCardsSkeleton C={C} count={3} />
      </div>
    );
  }

  if (error && !committeeId) {
    return (
      <div className="p-6">
        <p className="text-sm" style={{ color: C.error }}>
          {error}
        </p>
      </div>
    );
  }

  if (committeeId) {
    if (loadingCommittee || !activeCommittee) {
      return (
        <div className="p-6">
          <SchoolAdminSummaryCardsSkeleton C={C} count={2} />
        </div>
      );
    }

    return (
      <>
        <CommitteeWorkspaceShell
          committee={activeCommittee}
          C={C}
          supabase={supabase}
          organizationId={organizationId}
          activeSection={activeSection}
          onSectionChange={handleSectionChange}
          onBack={handleBack}
          onCommitteeChange={setActiveCommittee}
          onArchive={() => setShowArchive(true)}
        />
        <AnimatePresence>
          {showArchive && (
            <ArchiveCommitteeModal
              C={C}
              committee={activeCommittee}
              onClose={() => setShowArchive(false)}
              onConfirm={handleArchive}
            />
          )}
        </AnimatePresence>
      </>
    );
  }

  return (
    <>
      <CommitteeListView
        committees={committees}
        C={C}
        onOpenCommittee={handleOpenCommittee}
        onCreate={() => setShowCreate(true)}
      />
      <AnimatePresence>
        {showCreate && (
          <CreateCommitteeModal
            C={C}
            templates={templates}
            onClose={() => setShowCreate(false)}
            onCreate={handleCreate}
          />
        )}
      </AnimatePresence>
    </>
  );
}
