"use client";

import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { useSchoolAdminStoryTheme } from "@/components/school-admin/SchoolAdminStoryShell";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import AdminCard from "@/components/school-admin/ui/story/AdminCard";
import AdminChip from "@/components/school-admin/ui/story/AdminChip";
import AdminDisplayHeading from "@/components/school-admin/ui/story/AdminDisplayHeading";
import AdminSectionKicker from "@/components/school-admin/ui/story/AdminSectionKicker";
import { weekLabel } from "@/lib/school-admin/newsletter/newsletter-dates";
import type { NewsletterEdition, NewsletterWorkspaceState } from "@/lib/school-admin/newsletter/newsletter-types";
import NewsletterNewEditionModal from "./NewsletterNewEditionModal";
import styles from "./newsletter-workspace.module.css";

type NewsletterOverviewPageProps = {
  workspace: NewsletterWorkspaceState;
  onWorkspaceChange: (next: NewsletterWorkspaceState) => void;
  onOpenEdition: (editionId: string) => void;
};

export default function NewsletterOverviewPage({
  workspace,
  onWorkspaceChange,
  onOpenEdition,
}: NewsletterOverviewPageProps) {
  const { theme } = useSchoolAdminStoryTheme();
  const [newModalOpen, setNewModalOpen] = useState(false);

  const editions = useMemo(
    () =>
      [...workspace.editions].sort((a, b) => (b.week || "").localeCompare(a.week || "")),
    [workspace.editions],
  );

  const sourceEdition = editions[0] ?? null;

  const appendEdition = (edition: NewsletterEdition) => {
    onWorkspaceChange({
      ...workspace,
      editions: [edition, ...workspace.editions],
      activeEditionId: edition.id,
    });
    onOpenEdition(edition.id);
  };

  return (
    <main className={styles.workspace}>
      <header className={styles.pagehead}>
        <div>
          <AdminSectionKicker theme={theme}>Communications</AdminSectionKicker>
          <AdminDisplayHeading theme={theme} as="h1" size="display" className="mt-2">
            Newsletters
          </AdminDisplayHeading>
          <p className="mt-2 text-[11px] leading-relaxed" style={{ color: theme.muted }}>
            Draft newsletters in this browser only — nothing is saved to MudKitchen or sent to
            families yet.
          </p>
        </div>
        <div className={styles.headingActions}>
          <AdminButton
            theme={theme}
            variant="primary"
            size="compact"
            onClick={() => setNewModalOpen(true)}
          >
            <Plus size={14} strokeWidth={1.65} aria-hidden />
            New newsletter
          </AdminButton>
        </div>
      </header>

      {editions.length === 0 ? (
        <AdminCard theme={theme} padding="canvas" className="mt-2">
          <p className="text-sm" style={{ color: theme.muted }}>
            No newsletters yet. Create your first draft to get started.
          </p>
          <AdminButton
            theme={theme}
            variant="soft"
            size="compact"
            className="mt-4"
            onClick={() => setNewModalOpen(true)}
          >
            New newsletter
          </AdminButton>
        </AdminCard>
      ) : (
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {editions.map((edition) => (
            <button
              key={edition.id}
              type="button"
              className="cursor-pointer border-0 bg-transparent p-0 text-left"
              onClick={() => {
                onWorkspaceChange({ ...workspace, activeEditionId: edition.id });
                onOpenEdition(edition.id);
              }}
            >
              <AdminCard
                theme={theme}
                padding="none"
                className="h-full transition-transform hover:-translate-y-px"
              >
                <div
                  className={styles.overviewCardBanner}
                  style={
                    edition.coverImage
                      ? undefined
                      : { backgroundColor: theme.primarySoft }
                  }
                >
                  {edition.coverImage ? (
                    <>
                      <img src={edition.coverImage} alt="" />
                      <div className={styles.overviewCardBannerGradient} aria-hidden />
                    </>
                  ) : (
                    <div className={styles.overviewCardPlaceholder}>
                      No cover yet
                    </div>
                  )}
                </div>
                <div className={styles.overviewCardBody}>
                  <div className="flex items-start justify-between gap-3">
                    <AdminDisplayHeading
                      theme={theme}
                      size="section"
                      as="h2"
                      className="!mt-0 line-clamp-2"
                    >
                      {edition.title.trim() || "Untitled newsletter"}
                    </AdminDisplayHeading>
                    <AdminChip
                      theme={theme}
                      tone={edition.status === "published" ? "success" : "warning"}
                    >
                      {edition.status === "published" ? "Published" : "Draft"}
                    </AdminChip>
                  </div>
                  <p
                    className="mt-2 text-[11px] leading-relaxed"
                    style={{ color: theme.muted }}
                  >
                    {weekLabel(edition)}
                  </p>
                </div>
              </AdminCard>
            </button>
          ))}
        </div>
      )}

      <NewsletterNewEditionModal
        open={newModalOpen}
        workspace={workspace}
        sourceEdition={sourceEdition}
        onClose={() => setNewModalOpen(false)}
        onCreated={appendEdition}
      />
    </main>
  );
}
