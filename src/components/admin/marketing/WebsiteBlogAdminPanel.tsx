"use client";

import { useState } from "react";
import { ExternalLink, FileText, Plus, Trash2 } from "lucide-react";
import { GConfirmDialog } from "@/components/school-parent/garden/GDialog";
import { GChip, gBtnOutlineSm, gLinkSm } from "@/components/school-parent/garden/ui";
import {
  AdminGardenPage,
  AdminGardenPageSkeleton,
  BusyLabel,
  GardenEmptyState,
  GardenField,
  GardenLoadError,
  GardenNotice,
  GardenSaveBar,
  GardenSection,
  GardenSwitch,
  gBtnDangerSm,
  gInputClass,
  useGardenFieldId,
} from "@/components/school-admin/garden/kit";
import { GARDEN_LIST_DETAIL_GRID, GardenRecordList } from "@/components/school-admin/garden/blocks";
import BlogHtmlEditor from "@/components/admin/marketing/BlogHtmlEditor";
import { repoBlogPostSourcePath } from "@/content/blog/registry";
import { MUDKITCHEN_ADMIN_GARDEN_THEME as THEME } from "@/components/admin/garden/theme";
import { MarketingGardenHeader } from "@/components/admin/marketing/garden/MarketingGardenHeader";
import { useWebsiteBlogModel, type BlogStatusFilter, type PostForm } from "@/components/admin/marketing/useWebsiteBlogModel";

const DETAIL_ID = "marketing-blog-detail";

/** /admin/marketing/blog: website blog posts, list + editor. */
export default function WebsiteBlogAdminPanel() {
  const model = useWebsiteBlogModel();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [pendingSwitch, setPendingSwitch] = useState<string | "new" | null>(null);

  const requestSelect = (id: string | "new") => {
    if (model.dirty) {
      setPendingSwitch(id);
      return;
    }
    if (id === "new") model.startNew();
    else model.select(id);
  };

  const subtitle = model.listLoading
    ? "Loading posts…"
    : `${model.counts.published} published · ${model.counts.draft} ${model.counts.draft === 1 ? "draft" : "drafts"}`;

  return (
    <AdminGardenPage
      theme={THEME}
      data-testid="marketing-blog"
      overlays={
        <>
          <GConfirmDialog
            theme={THEME}
            open={confirmDelete}
            destructive
            title="Delete this blog post?"
            description={`${model.form.title || "This post"} ${model.form.published ? "comes off /blog and " : ""}is deleted for good. This cannot be undone.`}
            confirmLabel="Delete post"
            loadingLabel="Deleting…"
            loading={model.deleting}
            icon={<Trash2 className="h-5 w-5" aria-hidden />}
            onClose={() => setConfirmDelete(false)}
            onConfirm={() => {
              void model.remove().then((result) => {
                if (result.ok) setConfirmDelete(false);
              });
            }}
            confirmTestId="marketing-blog-delete-confirm"
          />
          <GConfirmDialog
            theme={THEME}
            open={pendingSwitch != null}
            title="Discard unsaved changes?"
            description={`Your edits to ${model.form.title || "this post"} haven't been saved.`}
            confirmLabel="Discard changes"
            cancelLabel="Keep editing"
            onClose={() => setPendingSwitch(null)}
            onConfirm={() => {
              const target = pendingSwitch;
              setPendingSwitch(null);
              model.discard();
              if (target === "new") model.startNew();
              else if (target) model.select(target);
            }}
          />
        </>
      }
    >
      <MarketingGardenHeader
        title={
          <>
            Website <span className="text-[var(--sf-clay)]">blog</span>
          </>
        }
        subtitle={subtitle}
        actions={
          <button type="button" className={gBtnOutlineSm} onClick={() => requestSelect("new")} data-testid="marketing-blog-new">
            <Plus className="h-4 w-4" aria-hidden />
            New post
          </button>
        }
      />

      {model.listLoading ? (
        <AdminGardenPageSkeleton label="Loading blog posts" layout="split" />
      ) : model.listError && model.posts.length === 0 ? (
        <GardenLoadError title="Couldn't load blog posts." description={model.listError} onRetry={model.retryList} />
      ) : (
        <div className={GARDEN_LIST_DETAIL_GRID}>
          <GardenRecordList
            title="Posts"
            kicker="Website"
            items={model.visiblePosts.map((post) => ({
              id: post.id,
              title: post.title || "Untitled post",
              meta: `/blog/${post.slug} · ${new Date(post.updatedAt).toLocaleDateString()}`,
              chip: post.published ? { tone: "success", label: "Published" } : { tone: "neutral", label: "Draft" },
              searchText: post.slug,
              leading: (
                <span
                  aria-hidden
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] border-[1.5px] border-[var(--sf-ink)]/15 ${
                    post.published ? "bg-[var(--sf-mint)]" : "bg-[var(--sf-butter)]"
                  }`}
                >
                  <FileText className="h-4 w-4 text-[var(--sf-ink)]/75" strokeWidth={2.4} />
                </span>
              ),
            }))}
            selectedId={model.isNew ? null : model.selectedId}
            onSelect={(id) => requestSelect(id)}
            flashId={model.flashId}
            searchPlaceholder="Search titles and slugs"
            searchLabel="Search blog posts"
            filters={{
              options: [
                { key: "all", label: "All", count: model.counts.all },
                ...(model.counts.published ? [{ key: "published", label: "Published", count: model.counts.published }] : []),
                ...(model.counts.draft ? [{ key: "draft", label: "Drafts", count: model.counts.draft }] : []),
              ],
              value: model.filter,
              onChange: (key) => model.setFilter(key as BlogStatusFilter),
              ariaLabel: "Show posts",
            }}
            noun={{ one: "post", many: "posts" }}
            emptyState={
              <GardenEmptyState
                icon={FileText}
                title="No blog posts yet"
                action={
                  <button type="button" className={gBtnOutlineSm} onClick={() => requestSelect("new")}>
                    <Plus className="h-4 w-4" aria-hidden />
                    New post
                  </button>
                }
              />
            }
            detailAnchorId={DETAIL_ID}
            data-testid="marketing-blog-list"
          />

          <div id={DETAIL_ID} className="flex min-w-0 scroll-mt-6 flex-col gap-4">
            {model.isNew || model.selectedId ? (
              model.postError ? (
                <GardenLoadError title="Couldn't load this post." description={model.postError} onRetry={model.retryPost} retrying={model.postLoading} />
              ) : model.postLoading ? (
                <AdminGardenPageSkeleton label="Loading the post" layout="main-rail" />
              ) : (
                <PostEditor model={model} onDelete={() => setConfirmDelete(true)} />
              )
            ) : (
              <GardenEmptyState title="Select a post or create a new one" />
            )}
          </div>
        </div>
      )}
    </AdminGardenPage>
  );
}

type Model = ReturnType<typeof useWebsiteBlogModel>;

function PostEditor({ model, onDelete }: { model: Model; onDelete: () => void }) {
  const { form, update } = model;
  const publicHref = form.slug ? `/blog/${form.slug}` : null;
  const ids = {
    slug: useGardenFieldId("blog-slug"),
    publishedAt: useGardenFieldId("blog-published-at"),
    title: useGardenFieldId("blog-title"),
    excerpt: useGardenFieldId("blog-excerpt"),
    seoTitle: useGardenFieldId("blog-seo-title"),
    meta: useGardenFieldId("blog-meta"),
    keyword: useGardenFieldId("blog-keyword"),
    secondary: useGardenFieldId("blog-secondary"),
  };
  const text = (key: keyof PostForm) => (event: { target: { value: string } }) => update(key, event.target.value as never);

  return (
    <>
      <section className="flex min-w-0 flex-col gap-6 rounded-[24px] border-[1.5px] border-[var(--sf-ink)]/12 bg-white p-5 shadow-[0_3px_0_0_rgba(43,36,29,0.08)] sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="m-0 text-[11px] font-extrabold uppercase tracking-[0.16em] text-[var(--sf-soft)]">
              {model.isNew ? "New post" : form.published ? "Published post" : "Draft"}
            </p>
            <h2 className="sf-display m-0 mt-1 text-[1.5rem] leading-[1.1] text-[var(--sf-ink)]">
              {model.isNew ? "New blog post" : form.title || "Blog post"}
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {form.published && publicHref && !model.isNew ? (
              <a href={publicHref} target="_blank" rel="noreferrer" className={gLinkSm}>
                View live <ExternalLink className="h-3.5 w-3.5" aria-hidden />
              </a>
            ) : null}
            {!model.isNew ? (
              <button type="button" onClick={onDelete} disabled={model.saving || model.deleting} className={gBtnDangerSm}>
                <BusyLabel busy={model.deleting} busyLabel="Deleting…" icon={<Trash2 className="h-4 w-4" aria-hidden />}>
                  Delete
                </BusyLabel>
              </button>
            ) : null}
          </div>
        </div>

        <GardenSection title="URL & visibility" id="blog-url">
          <div className="grid gap-4">
            <GardenField id={ids.slug} label="Slug" hint={form.slug ? `trymudkitchen.com/blog/${form.slug}` : undefined}>
              <input id={ids.slug} value={form.slug} onChange={text("slug")} className={gInputClass()} placeholder="simplify-microschool-newsletters" data-garden-skip />
            </GardenField>
            <div className="rounded-[16px] bg-[var(--sf-paper)] px-4 py-3">
              <GardenSwitch
                checked={form.published}
                onChange={(next) => update("published", next)}
                label="Published"
                description="Visible on /blog"
              />
            </div>
            <GardenField id={ids.publishedAt} label="Published at" optional>
              <input
                id={ids.publishedAt}
                type="datetime-local"
                value={form.publishedAt ? new Date(form.publishedAt).toISOString().slice(0, 16) : ""}
                onChange={(event) => update("publishedAt", event.target.value ? new Date(event.target.value).toISOString() : "")}
                className={gInputClass()}
                data-garden-skip
              />
            </GardenField>
          </div>
        </GardenSection>

        <GardenSection title="Content" id="blog-content">
          <div className="grid gap-4">
            <GardenField id={ids.title} label="Title" hint="The public H1.">
              <input id={ids.title} value={form.title} onChange={text("title")} className={gInputClass()} data-garden-skip />
            </GardenField>
            <GardenField id={ids.excerpt} label="Excerpt" hint="Shown on the /blog index card.">
              <textarea id={ids.excerpt} value={form.excerpt} onChange={text("excerpt")} rows={2} className={gInputClass()} data-garden-skip />
            </GardenField>
            {form.contentSource === "repo" ? (
              <GardenNotice tone="info" title="Body lives in the repo">
                Edit this post&apos;s article in{" "}
                <code className="rounded-[6px] bg-white px-1.5 py-0.5 text-[12px] font-bold">{repoBlogPostSourcePath(form.slug)}</code>. You can
                embed live product demos there as React components.
              </GardenNotice>
            ) : (
              <div>
                <p className="m-0 mb-1.5 text-[13px] font-extrabold text-[var(--sf-ink)]">Body</p>
                <BlogHtmlEditor value={form.bodyHtml} onChange={(html) => update("bodyHtml", html)} />
              </div>
            )}
          </div>
        </GardenSection>

        <GardenSection title="SEO" id="blog-seo">
          <div className="grid gap-4">
            <GardenField id={ids.seoTitle} label="SEO title" counter={{ value: form.seoTitle.length, max: 60 }}>
              <input id={ids.seoTitle} value={form.seoTitle} onChange={text("seoTitle")} className={gInputClass()} data-garden-skip />
            </GardenField>
            <GardenField id={ids.meta} label="Meta description" counter={{ value: form.metaDescription.length, max: 160 }}>
              <textarea id={ids.meta} value={form.metaDescription} onChange={text("metaDescription")} rows={3} className={gInputClass()} data-garden-skip />
            </GardenField>
            <GardenField id={ids.keyword} label="Primary keyword">
              <input id={ids.keyword} value={form.primaryKeyword} onChange={text("primaryKeyword")} className={gInputClass()} data-garden-skip />
            </GardenField>
            <GardenField id={ids.secondary} label="Secondary keywords" hint="One per line.">
              <textarea
                id={ids.secondary}
                value={form.secondaryKeywordsText}
                onChange={text("secondaryKeywordsText")}
                rows={4}
                className={gInputClass()}
                data-garden-skip
              />
            </GardenField>
          </div>
        </GardenSection>
        {model.isNew ? null : (
          <p className="m-0 flex items-center gap-2 text-[12.5px] font-semibold text-[var(--sf-soft)]">
            {form.published ? <GChip tone="success">Published</GChip> : <GChip tone="neutral">Draft</GChip>}
            Changes go live when you save.
          </p>
        )}
      </section>

      <GardenSaveBar
        dirty={model.dirty}
        saving={model.saving}
        savedAt={model.savedAt}
        onSave={() => void model.save()}
        onDiscard={model.discard}
        saveLabel={model.isNew ? "Create post" : "Save post"}
        data-testid="marketing-blog-save-bar"
      />
    </>
  );
}
