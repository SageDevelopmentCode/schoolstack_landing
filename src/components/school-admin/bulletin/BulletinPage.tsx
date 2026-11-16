"use client";

import { CalendarClock, Megaphone, PenLine, Plus } from "lucide-react";
import BulletinPostEditorSheet from "@/components/school-admin/bulletin/BulletinPostEditorSheet";
import BulletinPostList from "@/components/school-admin/bulletin/BulletinPostList";
import { formatBulletinDate } from "@/components/school-admin/bulletin/BulletinPostEditor";
import { useSchoolAdminStoryTheme } from "@/components/school-admin/SchoolAdminStoryShell";
import {
  AdminGardenPage,
  AdminGardenPageHeader,
  AdminGardenPageSkeleton,
  GardenEmptyState,
  GardenFilterChips,
  GardenLoadError,
  GardenStatTiles,
  ROW_INTERACTIVE,
} from "@/components/school-admin/garden/kit";
import { GardenLeadStrip } from "@/components/school-admin/garden/blocks";
import { GCard, GChip, gBtnOutlineSm, gBtnPopSm, gLinkSm } from "@/components/school-parent/garden/ui";
import type { BulletinPost, ProgramOption } from "@/lib/school-bulletin/types";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import {
  BULLETIN_FILTER_LABELS,
  useBulletinModel,
  type BulletinFilter,
  type BulletinModel,
} from "./useBulletinModel";

type BulletinPageProps = {
  organizationId: string;
  branding: OrganizationBranding;
  slug: string;
  schoolName: string;
  previewMode?: boolean;
  initialPosts?: BulletinPost[];
  initialPrograms?: ProgramOption[];
  initialEditorPostId?: string | null;
};

const FILTER_ORDER: BulletinFilter[] = ["all", "active", "scheduled", "draft", "expired", "archived"];

/** Bulletin (admin Garden): announcements on parent and teacher home pages. */
export default function BulletinPage({
  organizationId,
  slug,
  schoolName,
  previewMode = false,
  initialPosts = [],
  initialPrograms = [],
  initialEditorPostId = null,
}: BulletinPageProps) {
  const { theme, C } = useSchoolAdminStoryTheme();
  const model = useBulletinModel({
    organizationId,
    slug,
    previewMode,
    initialPosts,
    initialPrograms,
    initialEditorPostId,
  });
  const { counts } = model;
  const ready = !model.loading && !model.error;
  const showLead = ready && model.latestDraft != null && !model.editorOpen;
  const empty = ready && model.posts.length === 0;

  const subtitle = ready
    ? model.posts.length === 0
      ? `Announcements for ${schoolName} · nothing posted yet`
      : `${counts.active} active · ${counts.scheduled} scheduled · ${counts.draft} ${counts.draft === 1 ? "draft" : "drafts"}`
    : `Announcements for ${schoolName}`;

  const editor = (
    <BulletinPostEditorSheet
      open={model.editorOpen}
      onClose={model.closeEditor}
      organizationId={organizationId}
      slug={slug}
      post={model.editorPost}
      programs={model.programs}
      isNew={model.editorIsNew}
      onSaved={model.handleSaved}
      onDeleted={model.handleDeleted}
      theme={theme}
      C={C}
      presentation={previewMode ? "inline" : "panel"}
    />
  );

  let content;
  if (model.loading) {
    content = <AdminGardenPageSkeleton label="Loading bulletin" layout="table" />;
  } else if (model.error) {
    content = (
      <GCard index={1}>
        <GardenLoadError
          title="Couldn't load the bulletin."
          description={`${model.error} Nothing has changed.`}
          onRetry={() => void model.loadPosts()}
        />
      </GCard>
    );
  } else if (empty) {
    content = (
      <div className="grid items-start gap-5 lg:grid-cols-[1.55fr_1fr]">
        <GCard index={1} kicker="Get started">
          <GardenEmptyState
            icon={Megaphone}
            title="No bulletin posts yet"
            description="Create your first announcement for families and staff. Active posts appear on parent and teacher home pages."
            action={
              <button type="button" className={gBtnPopSm} onClick={model.openNewEditor} data-testid="bulletin-new-first">
                <PenLine className="h-4 w-4" aria-hidden />
                Write your first post
              </button>
            }
          />
        </GCard>
        {previewMode ? editor : null}
      </div>
    );
  } else {
    content = (
      <>
        {showLead && model.latestDraft ? (
          <GardenLeadStrip
            icon={PenLine}
            kicker="Pick up where you left off"
            title={model.latestDraft.title || "Untitled draft"}
            meta={`Draft · updated ${formatBulletinDate(model.latestDraft.updatedAt)} · only admins can see it`}
            cta="Finish this post"
            onClick={() => model.openExistingEditor(model.latestDraft!.id)}
            data-testid="bulletin-continue-draft"
          />
        ) : null}

        <GardenStatTiles
          layout="strip"
          ariaLabel="Bulletin numbers"
          stats={[
            { id: "active", label: "Active", value: counts.active, accent: "forest", onClick: () => model.setFilter("active"), active: model.filter === "active" },
            { id: "scheduled", label: "Scheduled", value: counts.scheduled, accent: "sky", onClick: () => model.setFilter("scheduled"), active: model.filter === "scheduled" },
            { id: "draft", label: "Drafts", value: counts.draft, accent: "gold", onClick: () => model.setFilter("draft"), active: model.filter === "draft" },
            { id: "all", label: "Total posts", value: counts.all, accent: "berry", onClick: () => model.setFilter("all"), active: model.filter === "all" },
          ]}
        />

        <div className="grid items-start gap-5 lg:grid-cols-[1.55fr_1fr]">
          <PostsCard model={model} />
          {previewMode && model.editorOpen ? editor : <ComingUpCard model={model} />}
        </div>
      </>
    );
  }

  return (
    <AdminGardenPage
      theme={theme}
      skinOverlays
      data-testid="admin-bulletin-page"
      overlays={previewMode ? null : editor}
    >
      <AdminGardenPageHeader
        kicker="Communication"
        title={<span className="text-[var(--sf-clay)]">Bulletin</span>}
        subtitle={subtitle}
        refresh={
          previewMode || !ready
            ? undefined
            : {
                onRefresh: () => void model.loadPosts({ silent: true }),
                refreshing: model.refreshing,
                lastUpdatedAt: model.lastUpdatedAt,
                label: "Refresh bulletin",
              }
        }
        actions={
          model.error || model.loading ? null : (
            <button
              type="button"
              className={showLead || empty ? gBtnOutlineSm : gBtnPopSm}
              onClick={model.openNewEditor}
              data-testid="bulletin-new"
            >
              <Plus className="h-4 w-4" aria-hidden />
              New post
            </button>
          )
        }
      />
      {content}
    </AdminGardenPage>
  );
}

function PostsCard({ model }: { model: BulletinModel }) {
  const options = FILTER_ORDER.filter((key) => key === "all" || model.counts[key] > 0 || model.filter === key).map(
    (key) => ({ key, label: BULLETIN_FILTER_LABELS[key], count: model.counts[key] }),
  );

  return (
    <GCard index={2} kicker="Posts" title="Announcements">
      <GardenFilterChips
        options={options}
        value={model.filter}
        onChange={(key) => model.setFilter(key as BulletinFilter)}
        ariaLabel="Filter posts by status"
        className="mb-3"
      />
      {model.visiblePosts.length === 0 ? (
        <div className="rounded-[16px] border-[1.5px] border-dashed border-[var(--sf-ink)]/15 bg-[var(--sf-paper)] px-4 py-6 text-center">
          <p className="m-0 text-[14px] font-extrabold text-[var(--sf-ink)]">
            No {BULLETIN_FILTER_LABELS[model.filter].toLowerCase()} posts.
          </p>
          <button type="button" className={`${gLinkSm} mt-1`} onClick={() => model.setFilter("all")}>
            Show all posts
          </button>
        </div>
      ) : (
        <BulletinPostList
          posts={model.visiblePosts}
          programs={model.programs}
          selectedPostId={model.editorOpen && !model.editorIsNew ? model.selectedPostId : null}
          flashPostId={model.flashPostId}
          onSelect={model.openExistingEditor}
        />
      )}
    </GCard>
  );
}

function ComingUpCard({ model }: { model: BulletinModel }) {
  const upcoming = model.scheduledPosts.slice(0, 4);
  return (
    <GCard
      index={3}
      kicker="Coming up"
      title="Scheduled"
      action={model.scheduledPosts.length > 0 ? <GChip tone="info">{model.scheduledPosts.length}</GChip> : undefined}
    >
      {upcoming.length === 0 ? (
        <div className="flex items-start gap-3 rounded-[16px] bg-[var(--sf-paper)] p-3.5">
          <span
            aria-hidden
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] border-[1.5px] border-[var(--sf-ink)]/12 bg-[var(--sf-sky)]"
          >
            <CalendarClock className="h-4 w-4 text-[var(--sf-ink)]/70" />
          </span>
          <p className="m-0 text-[13px] font-semibold leading-snug text-[var(--sf-soft)]">
            Nothing scheduled. Turn on <b className="text-[var(--sf-ink)]">Schedule publish</b> in a post to send it
            later — it goes out on its own.
          </p>
        </div>
      ) : (
        <ul className="m-0 -mx-2 flex list-none flex-col gap-0.5 p-0">
          {upcoming.map((post) => (
            <li key={post.id}>
              <button type="button" className={ROW_INTERACTIVE} onClick={() => model.openExistingEditor(post.id)}>
                <span
                  aria-hidden
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] border-[1.5px] border-[var(--sf-ink)]/12 bg-[var(--sf-sky)]"
                >
                  <CalendarClock className="h-4 w-4 text-[var(--sf-ink)]/70" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14px] font-extrabold text-[var(--sf-ink)]">{post.title}</span>
                  <span className="block truncate text-[12.5px] font-semibold text-[var(--sf-soft)]">
                    Publishes {formatBulletinDate(post.publishedAt)}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
      <p className="m-0 mt-4 border-t border-[var(--sf-ink)]/[0.08] pt-3 text-[12.5px] font-semibold leading-snug text-[var(--sf-soft)]">
        Active posts appear on parent and teacher home pages. Expired posts hide themselves.
      </p>
    </GCard>
  );
}
