"use client";

import { ImageIcon, Newspaper, PenLine, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { AdminGardenPageHeader, GardenEmptyState, GardenFilterChips } from "@/components/school-admin/garden/kit";
import { GardenLeadStrip } from "@/components/school-admin/garden/blocks";
import { gFade } from "@/components/school-parent/garden/motion";
import { GCard, GChip, G_FOCUS, gBtnOutlineSm, gBtnPopSm } from "@/components/school-parent/garden/ui";
import { weekLabel } from "@/lib/school-admin/newsletter/newsletter-dates";
import {
  createNewsletterEditionApi,
  updateNewsletterEditionApi,
} from "@/lib/school-admin/newsletter/newsletter-api-client";
import type { NewsletterEdition, NewsletterWorkspaceState } from "@/lib/school-admin/newsletter/newsletter-types";
import { adminToast, formatActionError } from "@/lib/school-admin/admin-toast";
import NewsletterMediaImage from "./NewsletterMediaImage";
import NewsletterNewEditionModal from "./NewsletterNewEditionModal";
import styles from "./newsletter-workspace.module.css";

type NewsletterOverviewPageProps = {
  slug: string;
  workspace: NewsletterWorkspaceState;
  onWorkspaceChange: (next: NewsletterWorkspaceState) => void;
  onOpenEdition: (editionId: string) => void;
};

type StatusFilter = "all" | "draft" | "published";

/** Newsletters overview (Garden): editions grid, drafts first-step strip, new edition. */
export default function NewsletterOverviewPage({
  slug,
  workspace,
  onWorkspaceChange,
  onOpenEdition,
}: NewsletterOverviewPageProps) {
  const reduce = useReducedMotion() === true;
  const [newModalOpen, setNewModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [filter, setFilter] = useState<StatusFilter>("all");

  const editions = useMemo(
    () => [...workspace.editions].sort((a, b) => (b.week || "").localeCompare(a.week || "")),
    [workspace.editions],
  );
  const drafts = editions.filter((e) => e.status !== "published");
  const published = editions.length - drafts.length;
  const visible = filter === "all" ? editions : editions.filter((e) => (filter === "published") === (e.status === "published"));
  const sourceEdition = editions[0] ?? null;
  const latestDraft = drafts[0] ?? null;

  const open = (edition: NewsletterEdition) => {
    onWorkspaceChange({ ...workspace, activeEditionId: edition.id });
    onOpenEdition(edition.id);
  };

  const handleEditionCreated = async (input: {
    week: string;
    cloneFromEditionId?: string;
    patchAfterCreate?: (edition: NewsletterEdition) => NewsletterEdition;
  }) => {
    setCreating(true);
    try {
      let edition = await createNewsletterEditionApi(slug, {
        week: input.week,
        cloneFromEditionId: input.cloneFromEditionId,
      });
      if (input.patchAfterCreate) {
        edition = input.patchAfterCreate(edition);
        edition = await updateNewsletterEditionApi(slug, edition.id, edition);
      }
      onWorkspaceChange({
        ...workspace,
        editions: [edition, ...workspace.editions],
        activeEditionId: edition.id,
      });
      onOpenEdition(edition.id);
      setNewModalOpen(false);
      adminToast.dismiss("newsletter-create-error");
      adminToast.success("New newsletter started.", {
        id: "newsletter-create",
        description: `${weekLabel(edition)} is open in the editor. It stays a draft until you publish.`,
      });
    } catch (err) {
      adminToast.error("Couldn't start the newsletter.", {
        id: "newsletter-create-error",
        description: `${formatActionError(err, "Something went wrong.")} Nothing was created.`,
        action: { label: "Retry", onClick: () => void handleEditionCreated(input) },
      });
    } finally {
      setCreating(false);
    }
  };

  const subtitle =
    editions.length === 0
      ? "Write a weekly update for families and publish it to the parent portal."
      : [
          `${editions.length} newsletter${editions.length === 1 ? "" : "s"}`,
          `${published} published`,
          drafts.length ? `${drafts.length} draft${drafts.length === 1 ? "" : "s"}` : null,
        ]
          .filter(Boolean)
          .join(" · ");

  return (
    <>
      <AdminGardenPageHeader
        kicker="My school"
        title={
          <>
            <span className="text-[var(--sf-clay)]">Newsletters</span>
          </>
        }
        subtitle={subtitle}
        actions={
          editions.length > 0 ? (
            <button type="button" className={latestDraft ? gBtnOutlineSm : gBtnPopSm} onClick={() => setNewModalOpen(true)} data-testid="newsletter-new">
              <Plus className="h-4 w-4" aria-hidden />
              New newsletter
            </button>
          ) : null
        }
      />

      <p className="m-0 -mt-1 max-w-[80ch] text-[13px] font-semibold leading-relaxed text-[var(--sf-soft)]">
        Drafts are stored in MudKitchen when you click Save in the editor. Publishing makes the edition available in the parent
        portal; you can optionally notify families by email and push.
      </p>

      {latestDraft ? (
        <GardenLeadStrip
          icon={PenLine}
          kicker={`Pick up where you left off${drafts.length > 1 ? ` · ${drafts.length} drafts` : ""}`}
          title={latestDraft.title.trim() || "Untitled newsletter"}
          meta={`${weekLabel(latestDraft)} · Draft`}
          cta="Continue editing"
          onClick={() => open(latestDraft)}
          data-testid="newsletter-continue-draft"
        />
      ) : null}

      {editions.length === 0 ? (
        <GCard index={1} kicker="Get started">
          <GardenEmptyState
            icon={Newspaper}
            title="No newsletters yet"
            description="Create your first draft to get started."
            action={
              <button type="button" className={gBtnPopSm} onClick={() => setNewModalOpen(true)} data-testid="newsletter-new-first">
                <Plus className="h-4 w-4" aria-hidden />
                New newsletter
              </button>
            }
          />
        </GCard>
      ) : (
        <>
          {published > 0 && drafts.length > 0 ? (
            <GardenFilterChips
              ariaLabel="Filter newsletters"
              value={filter}
              onChange={(key) => setFilter(key as StatusFilter)}
              options={[
                { key: "all", label: "All", count: editions.length },
                { key: "draft", label: "Drafts", count: drafts.length },
                { key: "published", label: "Published", count: published },
              ]}
            />
          ) : null}
          <ul className="m-0 grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((edition, i) => {
              const isPublished = edition.status === "published";
              return (
                <motion.li key={edition.id} {...gFade(1 + i * 0.3, reduce)}>
                  <button
                    type="button"
                    onClick={() => open(edition)}
                    className={`group flex h-full w-full flex-col overflow-hidden rounded-[24px] border-[1.5px] border-[var(--sf-ink)]/12 bg-white text-left shadow-[0_3px_0_0_rgba(43,36,29,0.08)] transition-all hover:-translate-y-0.5 hover:border-[var(--sf-ink)]/30 ${G_FOCUS}`}
                    aria-label={`${edition.title.trim() || "Untitled newsletter"}, ${isPublished ? "published" : "draft"}. ${isPublished ? "Open" : "Continue editing"}`}
                  >
                    <div className="relative h-[140px] w-full overflow-hidden bg-[var(--sf-accent-wash)]">
                      {edition.coverImage ? (
                        <NewsletterMediaImage
                          src={edition.coverImage}
                          alt=""
                          className="absolute inset-0 h-full w-full"
                          imageClassName="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center gap-1.5 text-[12.5px] font-extrabold text-[var(--sf-clay-deep)]/70">
                          <ImageIcon className="h-4 w-4" aria-hidden />
                          No cover yet
                        </div>
                      )}
                      <GChip tone={isPublished ? "success" : "warning"} className="absolute left-3 top-3 shadow-sm">
                        {isPublished ? "Published" : "Draft"}
                      </GChip>
                    </div>
                    <div className="flex flex-1 flex-col gap-1 px-4 py-3.5">
                      <span className="sf-display line-clamp-2 text-[1.15rem] leading-snug text-[var(--sf-ink)]">
                        {edition.title.trim() || "Untitled newsletter"}
                      </span>
                      <span className="text-[12.5px] font-semibold text-[var(--sf-soft)]">{weekLabel(edition)}</span>
                      <span className="mt-auto pt-2 text-[12.5px] font-extrabold text-[var(--sf-clay-deep)] group-hover:underline">
                        {isPublished ? "Open" : "Continue editing"}
                      </span>
                    </div>
                  </button>
                </motion.li>
              );
            })}
          </ul>
        </>
      )}

      {/* The modal's styles read the editor's CSS variables (.workspace). */}
      <div className={`${styles.workspace} !p-0`}>
      <NewsletterNewEditionModal
        open={newModalOpen}
        workspace={workspace}
        sourceEdition={sourceEdition}
        creating={creating}
        onClose={() => setNewModalOpen(false)}
        onCreate={handleEditionCreated}
      />
      </div>
    </>
  );
}
