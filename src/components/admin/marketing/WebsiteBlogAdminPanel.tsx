"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ExternalLink, Plus, Trash2 } from "lucide-react";
import BlogHtmlEditor from "@/components/admin/marketing/BlogHtmlEditor";
import { AdminMasterDetail } from "@/components/admin/ui/AdminMasterDetail";
import { AdminListItem } from "@/components/admin/ui/AdminListItem";
import { AdminListPanelHeader } from "@/components/admin/ui/AdminListPanelHeader";
import { AdminDetailHeader } from "@/components/admin/ui/AdminDetailHeader";
import { AdminDetailSection } from "@/components/admin/ui/AdminDetailSection";
import { AdminDetailLayout } from "@/components/admin/ui/AdminDetailLayout";
import { AdminDetailEmpty } from "@/components/admin/ui/AdminDetailEmpty";
import { AdminEmptyState } from "@/components/admin/ui/AdminEmptyState";
import { AdminPageState } from "@/components/admin/ui/AdminPageState";
import { AdminStatusBadge } from "@/components/admin/ui/AdminStatusBadge";
import { repoBlogPostSourcePath } from "@/content/blog/registry";
import type {
  WebsiteBlogContentSource,
  WebsiteBlogPostListItem,
  WebsiteBlogPostRecord,
} from "@/lib/website-blog/types";

type PostForm = {
  slug: string;
  title: string;
  seoTitle: string;
  metaDescription: string;
  primaryKeyword: string;
  secondaryKeywordsText: string;
  excerpt: string;
  bodyHtml: string;
  contentSource: WebsiteBlogContentSource;
  published: boolean;
  publishedAt: string;
};

const EMPTY_FORM: PostForm = {
  slug: "",
  title: "",
  seoTitle: "",
  metaDescription: "",
  primaryKeyword: "",
  secondaryKeywordsText: "",
  excerpt: "",
  bodyHtml: "<p></p>",
  contentSource: "html",
  published: false,
  publishedAt: "",
};

function recordToForm(post: WebsiteBlogPostRecord): PostForm {
  return {
    slug: post.slug,
    title: post.title,
    seoTitle: post.seoTitle,
    metaDescription: post.metaDescription,
    primaryKeyword: post.primaryKeyword,
    secondaryKeywordsText: post.secondaryKeywords.join("\n"),
    excerpt: post.excerpt,
    bodyHtml: post.bodyHtml,
    contentSource: post.contentSource,
    published: post.published,
    publishedAt: post.publishedAt ?? "",
  };
}

function formToPayload(form: PostForm) {
  return {
    slug: form.slug,
    title: form.title,
    seoTitle: form.seoTitle,
    metaDescription: form.metaDescription,
    primaryKeyword: form.primaryKeyword,
    secondaryKeywords: form.secondaryKeywordsText
      .split(/[\n,]/)
      .map((item) => item.trim())
      .filter(Boolean),
    excerpt: form.excerpt,
    bodyHtml: form.bodyHtml,
    published: form.published,
    publishedAt: form.publishedAt ? new Date(form.publishedAt).toISOString() : null,
  };
}

export default function WebsiteBlogAdminPanel() {
  const [posts, setPosts] = useState<WebsiteBlogPostListItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState<PostForm>(EMPTY_FORM);
  const [isNew, setIsNew] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const loadList = useCallback(async () => {
    const response = await fetch("/api/admin/website-blog-posts");
    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      throw new Error(body?.error ?? "Failed to load blog posts.");
    }
    const data = (await response.json()) as { posts: WebsiteBlogPostListItem[] };
    setPosts(data.posts);
    return data.posts;
  }, []);

  const loadPost = useCallback(async (id: string) => {
    const response = await fetch(`/api/admin/website-blog-posts/${id}`);
    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      throw new Error(body?.error ?? "Failed to load blog post.");
    }
    const data = (await response.json()) as { post: WebsiteBlogPostRecord };
    setForm(recordToForm(data.post));
    setIsNew(false);
  }, []);

  useEffect(() => {
    async function init() {
      try {
        const list = await loadList();
        if (list.length > 0) {
          setSelectedId(list[0].id);
          await loadPost(list[0].id);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load blog posts.");
      } finally {
        setLoading(false);
      }
    }
    void init();
  }, [loadList, loadPost]);

  async function handleSelect(id: string) {
    setSelectedId(id);
    setSaveMessage(null);
    setError(null);
    try {
      await loadPost(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load blog post.");
    }
  }

  function handleNew() {
    setSelectedId(null);
    setIsNew(true);
    setForm(EMPTY_FORM);
    setSaveMessage(null);
    setError(null);
  }

  async function handleSave() {
    setSaving(true);
    setSaveMessage(null);
    setError(null);
    try {
      const payload = formToPayload(form);
      const response = isNew
        ? await fetch("/api/admin/website-blog-posts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch(`/api/admin/website-blog-posts/${selectedId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error ?? "Failed to save blog post.");
      }

      const data = (await response.json()) as { post: WebsiteBlogPostRecord };
      const list = await loadList();
      setSelectedId(data.post.id);
      setIsNew(false);
      setForm(recordToForm(data.post));
      setSaveMessage("Saved.");
      if (!list.some((item) => item.id === data.post.id)) {
        setPosts(list);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save blog post.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!selectedId || isNew) return;
    if (!window.confirm("Delete this blog post? This cannot be undone.")) return;

    setSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/website-blog-posts/${selectedId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error ?? "Failed to delete blog post.");
      }
      const list = await loadList();
      if (list.length > 0) {
        setSelectedId(list[0].id);
        await loadPost(list[0].id);
      } else {
        handleNew();
      }
      setSaveMessage("Deleted.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete blog post.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <AdminPageState variant="loading" />;
  if (error && posts.length === 0 && !isNew) {
    return <AdminPageState variant="error" message={error} />;
  }

  const publicHref = form.slug ? `/blog/${form.slug}` : null;

  return (
    <AdminMasterDetail
      list={
        <>
          <AdminListPanelHeader>
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs text-admin-muted">
                {posts.length} post{posts.length === 1 ? "" : "s"}
              </p>
              <button
                type="button"
                onClick={handleNew}
                className="inline-flex items-center gap-1 rounded-admin-md border border-admin-border px-2 py-1 text-xs font-medium text-admin-text hover:bg-admin-neutral-bg"
              >
                <Plus className="h-3.5 w-3.5" aria-hidden />
                New
              </button>
            </div>
          </AdminListPanelHeader>
          <div className="flex-1 overflow-y-auto">
            {posts.length === 0 ? (
              <AdminEmptyState message="No blog posts yet" />
            ) : (
              posts.map((post) => (
                <AdminListItem
                  key={post.id}
                  selected={selectedId === post.id && !isNew}
                  onClick={() => handleSelect(post.id)}
                  title={post.title}
                  subtitle={post.slug}
                  footer={new Date(post.updatedAt).toLocaleDateString()}
                  badge={
                    <AdminStatusBadge
                      variant={post.published ? "success" : "neutral"}
                      label={post.published ? "Published" : "Draft"}
                    />
                  }
                />
              ))
            )}
          </div>
        </>
      }
      detail={
        isNew || selectedId ? (
          <AdminDetailLayout>
            <AdminDetailHeader
              title={isNew ? "New blog post" : form.title || "Blog post"}
              actions={
                <div className="flex flex-wrap items-center gap-2">
                  {form.published && publicHref ? (
                    <Link
                      href={publicHref}
                      target="_blank"
                      className="inline-flex items-center gap-1 text-xs font-medium text-admin-accent hover:underline"
                    >
                      View live
                      <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                    </Link>
                  ) : null}
                  {!isNew ? (
                    <button
                      type="button"
                      onClick={() => void handleDelete()}
                      disabled={saving}
                      className="inline-flex items-center gap-1 rounded-admin-md border border-admin-border px-2 py-1 text-xs text-admin-muted hover:text-red-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden />
                      Delete
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => void handleSave()}
                    disabled={saving}
                    className="rounded-admin-md bg-admin-accent px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 disabled:opacity-60"
                  >
                    {saving ? "Saving…" : "Save"}
                  </button>
                </div>
              }
            />
            {error ? (
              <p className="px-4 text-sm text-red-600" role="alert">{error}</p>
            ) : null}
            {saveMessage ? (
              <p className="px-4 text-sm text-admin-muted">{saveMessage}</p>
            ) : null}
            <AdminDetailSection title="URL & visibility">
              <div className="grid gap-3">
                <label className="block text-xs text-admin-muted">
                  Slug
                  <input
                    value={form.slug}
                    onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                    className="mt-1 w-full rounded-admin-md border border-admin-border bg-admin-surface px-3 py-2 text-sm text-admin-text"
                    placeholder="simplify-microschool-newsletters"
                  />
                </label>
                <label className="flex items-center gap-2 text-sm text-admin-text">
                  <input
                    type="checkbox"
                    checked={form.published}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, published: e.target.checked }))
                    }
                  />
                  Published (visible on /blog)
                </label>
                <label className="block text-xs text-admin-muted">
                  Published at (optional)
                  <input
                    type="datetime-local"
                    value={
                      form.publishedAt
                        ? new Date(form.publishedAt).toISOString().slice(0, 16)
                        : ""
                    }
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        publishedAt: e.target.value
                          ? new Date(e.target.value).toISOString()
                          : "",
                      }))
                    }
                    className="mt-1 w-full rounded-admin-md border border-admin-border bg-admin-surface px-3 py-2 text-sm text-admin-text"
                  />
                </label>
              </div>
            </AdminDetailSection>
            <AdminDetailSection title="Content">
              <div className="grid gap-3">
                <label className="block text-xs text-admin-muted">
                  Title (public H1)
                  <input
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    className="mt-1 w-full rounded-admin-md border border-admin-border bg-admin-surface px-3 py-2 text-sm text-admin-text"
                  />
                </label>
                <label className="block text-xs text-admin-muted">
                  Excerpt (index card)
                  <textarea
                    value={form.excerpt}
                    onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
                    rows={2}
                    className="mt-1 w-full rounded-admin-md border border-admin-border bg-admin-surface px-3 py-2 text-sm text-admin-text"
                  />
                </label>
                {form.contentSource === "repo" ? (
                  <div className="rounded-admin-md border border-admin-border bg-admin-neutral-bg px-4 py-3 text-sm text-admin-muted">
                    <p className="font-medium text-admin-text">Body lives in the repo</p>
                    <p className="mt-1">
                      Edit this post&apos;s article in{" "}
                      <code className="text-xs bg-admin-surface px-1 py-0.5 rounded">
                        {repoBlogPostSourcePath(form.slug)}
                      </code>
                      . You can embed live product demos there as React components.
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs text-admin-muted mb-1">Body</p>
                    <BlogHtmlEditor
                      value={form.bodyHtml}
                      onChange={(html) => setForm((f) => ({ ...f, bodyHtml: html }))}
                    />
                  </div>
                )}
              </div>
            </AdminDetailSection>
            <AdminDetailSection title="SEO">
              <div className="grid gap-3">
                <label className="block text-xs text-admin-muted">
                  SEO title
                  <input
                    value={form.seoTitle}
                    onChange={(e) => setForm((f) => ({ ...f, seoTitle: e.target.value }))}
                    className="mt-1 w-full rounded-admin-md border border-admin-border bg-admin-surface px-3 py-2 text-sm text-admin-text"
                  />
                </label>
                <label className="block text-xs text-admin-muted">
                  Meta description
                  <textarea
                    value={form.metaDescription}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, metaDescription: e.target.value }))
                    }
                    rows={3}
                    className="mt-1 w-full rounded-admin-md border border-admin-border bg-admin-surface px-3 py-2 text-sm text-admin-text"
                  />
                </label>
                <label className="block text-xs text-admin-muted">
                  Primary keyword
                  <input
                    value={form.primaryKeyword}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, primaryKeyword: e.target.value }))
                    }
                    className="mt-1 w-full rounded-admin-md border border-admin-border bg-admin-surface px-3 py-2 text-sm text-admin-text"
                  />
                </label>
                <label className="block text-xs text-admin-muted">
                  Secondary keywords (one per line)
                  <textarea
                    value={form.secondaryKeywordsText}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, secondaryKeywordsText: e.target.value }))
                    }
                    rows={4}
                    className="mt-1 w-full rounded-admin-md border border-admin-border bg-admin-surface px-3 py-2 text-sm text-admin-text"
                  />
                </label>
              </div>
            </AdminDetailSection>
          </AdminDetailLayout>
        ) : (
          <AdminDetailEmpty message="Select a post or create a new one" />
        )
      }
    />
  );
}
