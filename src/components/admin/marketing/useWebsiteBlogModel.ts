"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  WebsiteBlogContentSource,
  WebsiteBlogPostListItem,
  WebsiteBlogPostRecord,
} from "@/lib/website-blog/types";
import { useAdminAction } from "@/components/school-admin/garden/useAdminAction";

/*
 * State for the website blog editor (/admin/marketing/blog): the post list,
 * the selected post (?id= in the URL), the form with a saved baseline so
 * unsaved changes show, save / create / delete with the admin feedback contract.
 */

export type PostForm = {
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

export const EMPTY_FORM: PostForm = {
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

/** Tiptap normalises HTML, so compare forms without whitespace noise. */
function sameForm(a: PostForm, b: PostForm) {
  return JSON.stringify(a) === JSON.stringify(b);
}

async function readError(response: Response, fallback: string): Promise<Error> {
  const body = (await response.json().catch(() => null)) as { error?: string } | null;
  return new Error(body?.error ?? fallback);
}

/** `?id=` without a navigation (no server re-render, no history entry). */
function writeIdParam(id: string | null) {
  const url = new URL(window.location.href);
  if (id) url.searchParams.set("id", id);
  else url.searchParams.delete("id");
  window.history.replaceState(window.history.state, "", url.toString());
}

export type BlogStatusFilter = "all" | "published" | "draft";

export function useWebsiteBlogModel() {
  const [posts, setPosts] = useState<WebsiteBlogPostListItem[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [form, setForm] = useState<PostForm>(EMPTY_FORM);
  const [baseline, setBaseline] = useState<PostForm>(EMPTY_FORM);
  const [postLoading, setPostLoading] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [filter, setFilter] = useState<BlogStatusFilter>("all");
  const postRequest = useRef(0);
  const action = useAdminAction();

  const loadList = useCallback(async () => {
    const response = await fetch("/api/admin/website-blog-posts");
    if (!response.ok) throw await readError(response, "Failed to load blog posts.");
    const data = (await response.json()) as { posts: WebsiteBlogPostListItem[] };
    setPosts(data.posts);
    return data.posts;
  }, []);

  const loadPost = useCallback(async (id: string) => {
    const request = ++postRequest.current;
    setPostLoading(true);
    setPostError(null);
    try {
      const response = await fetch(`/api/admin/website-blog-posts/${id}`);
      if (!response.ok) throw await readError(response, "Failed to load blog post.");
      const data = (await response.json()) as { post: WebsiteBlogPostRecord };
      if (request !== postRequest.current) return;
      const next = recordToForm(data.post);
      setForm(next);
      setBaseline(next);
      setIsNew(false);
      setSavedAt(null);
    } catch (error) {
      if (request !== postRequest.current) return;
      setPostError(error instanceof Error ? error.message : "Failed to load blog post.");
    } finally {
      if (request === postRequest.current) setPostLoading(false);
    }
  }, []);

  const init = useCallback(async () => {
    setListLoading(true);
    setListError(null);
    try {
      const list = await loadList();
      const wanted = new URLSearchParams(window.location.search).get("id");
      const first = list.find((post) => post.id === wanted) ?? list[0];
      if (first) {
        setSelectedId(first.id);
        writeIdParam(first.id);
        void loadPost(first.id);
      }
    } catch (error) {
      setListError(error instanceof Error ? error.message : "Failed to load blog posts.");
    } finally {
      setListLoading(false);
    }
  }, [loadList, loadPost]);

  useEffect(() => {
    queueMicrotask(() => void init());
  }, [init]);

  const dirty = !postLoading && !postError && (isNew || selectedId != null) && !sameForm(form, baseline);

  const select = useCallback(
    (id: string) => {
      setSelectedId(id);
      setIsNew(false);
      writeIdParam(id);
      void loadPost(id);
    },
    [loadPost],
  );

  const startNew = useCallback(() => {
    postRequest.current += 1;
    setSelectedId(null);
    setIsNew(true);
    setForm(EMPTY_FORM);
    setBaseline(EMPTY_FORM);
    setPostError(null);
    setPostLoading(false);
    setSavedAt(null);
    writeIdParam(null);
  }, []);

  const discard = useCallback(() => setForm(baseline), [baseline]);

  const update = useCallback(<K extends keyof PostForm>(key: K, value: PostForm[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  }, []);

  const save = useCallback(async () => {
    const creating = isNew;
    const id = selectedId;
    const payload = formToPayload(form);
    const result = await action.run(
      async () => {
        const response = creating
          ? await fetch("/api/admin/website-blog-posts", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            })
          : await fetch(`/api/admin/website-blog-posts/${id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });
        if (!response.ok) throw await readError(response, "Failed to save blog post.");
        const data = (await response.json()) as { post: WebsiteBlogPostRecord };
        const next = recordToForm(data.post);
        setSelectedId(data.post.id);
        setIsNew(false);
        setForm(next);
        setBaseline(next);
        setSavedAt(Date.now());
        writeIdParam(data.post.id);
        await loadList().catch(() => undefined);
        return data.post;
      },
      {
        key: "blog-save",
        id: "marketing-blog-save",
        success: (post) => ({
          title: creating ? "Post created." : "Post saved.",
          description: post.published ? `Live on /blog/${post.slug}.` : "Draft — not on /blog yet.",
        }),
        error: { title: "Couldn't save the post.", description: "Your edits are still here; nothing on /blog changed." },
      },
    );
    // Flash the saved row (a new post only has its id once the save returns).
    if (result.ok) action.flash(result.result.id);
    return result;
  }, [action, form, isNew, selectedId, loadList]);

  const remove = useCallback(async () => {
    if (!selectedId || isNew) return { ok: false as const };
    const id = selectedId;
    const title = form.title || "The post";
    const wasLive = baseline.published;
    return action.run(
      async () => {
        const response = await fetch(`/api/admin/website-blog-posts/${id}`, { method: "DELETE" });
        if (!response.ok) throw await readError(response, "Failed to delete blog post.");
        const list = await loadList();
        if (list.length > 0) {
          select(list[0].id);
        } else {
          startNew();
        }
      },
      {
        key: "blog-delete",
        id: "marketing-blog-delete",
        success: { title: "Post deleted.", description: wasLive ? `${title} is off /blog.` : `${title} was a draft, so /blog didn't change.` },
        error: { title: "Couldn't delete the post.", description: `${title} is still there.` },
      },
    );
  }, [action, baseline.published, form.title, isNew, loadList, select, selectedId, startNew]);

  const counts = useMemo(
    () => ({
      all: posts.length,
      published: posts.filter((post) => post.published).length,
      draft: posts.filter((post) => !post.published).length,
    }),
    [posts],
  );
  const visiblePosts = useMemo(
    () =>
      filter === "all" ? posts : posts.filter((post) => (filter === "published" ? post.published : !post.published)),
    [filter, posts],
  );

  return {
    posts,
    visiblePosts,
    counts,
    filter,
    setFilter,
    listLoading,
    listError,
    retryList: () => void init(),
    selectedId,
    isNew,
    form,
    update,
    dirty,
    discard,
    savedAt,
    postLoading,
    postError,
    retryPost: () => {
      if (selectedId) void loadPost(selectedId);
    },
    select,
    startNew,
    save,
    remove,
    saving: action.pendingKey === "blog-save",
    deleting: action.pendingKey === "blog-delete",
    flashId: action.lastSavedKey,
  };
}
