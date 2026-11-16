"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { resolveBulletinDisplayStatus } from "@/lib/school-bulletin/bulletin-audience";
import type {
  BulletinPost,
  BulletinPostDisplayStatus,
  ProgramOption,
} from "@/lib/school-bulletin/types";
import { adminToast, formatActionError } from "@/lib/school-admin/admin-toast";
import { reportPortalOperationalError } from "@/lib/portal-operational-errors";

/*
 * Bulletin view-model (admin Garden). Same list API as before
 * (GET /api/school/{slug}/bulletin). A failed first load shows inline with
 * Try again (never a toast); a manual refresh toasts its result and keeps
 * what's on screen. `previewMode` (marketing demo) never fetches.
 */

export type BulletinFilter = "all" | BulletinPostDisplayStatus;

export const BULLETIN_FILTER_LABELS: Record<BulletinFilter, string> = {
  all: "All",
  active: "Active",
  scheduled: "Scheduled",
  draft: "Drafts",
  expired: "Expired",
  archived: "Archived",
};

const FLASH_MS = 1600;

export function useBulletinModel({
  organizationId,
  slug,
  previewMode,
  initialPosts,
  initialPrograms,
  initialEditorPostId,
}: {
  organizationId: string;
  slug: string;
  previewMode: boolean;
  initialPosts: BulletinPost[];
  initialPrograms: ProgramOption[];
  initialEditorPostId: string | null;
}) {
  const [loading, setLoading] = useState(!previewMode);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState(() => Date.now());
  const [posts, setPosts] = useState<BulletinPost[]>(() => (previewMode ? initialPosts : []));
  const [programs, setPrograms] = useState<ProgramOption[]>(() =>
    previewMode ? initialPrograms : [],
  );
  const [filter, setFilter] = useState<BulletinFilter>("all");
  const [selectedPostId, setSelectedPostId] = useState<string | null>(
    previewMode ? initialEditorPostId : null,
  );
  const [editorOpen, setEditorOpen] = useState(Boolean(previewMode && initialEditorPostId));
  const [editorIsNew, setEditorIsNew] = useState(false);
  const [flashPostId, setFlashPostId] = useState<string | null>(null);
  const flashTimer = useRef<number | null>(null);
  const requestIdRef = useRef(0);
  const reloadRef = useRef<(options?: { silent?: boolean }) => Promise<void>>(async () => {});

  useEffect(
    () => () => {
      if (flashTimer.current) window.clearTimeout(flashTimer.current);
    },
    [],
  );

  const flash = useCallback((postId: string) => {
    setFlashPostId(postId);
    if (flashTimer.current) window.clearTimeout(flashTimer.current);
    flashTimer.current = window.setTimeout(() => setFlashPostId(null), FLASH_MS);
  }, []);

  const loadPosts = useCallback(
    async (options?: { silent?: boolean }) => {
      if (previewMode) return;
      const requestId = ++requestIdRef.current;
      if (options?.silent) setRefreshing(true);
      else {
        setLoading(true);
        setError(null);
      }
      try {
        const response = await fetch(`/api/school/${slug}/bulletin`);
        const data = (await response.json().catch(() => ({}))) as {
          posts?: BulletinPost[];
          programs?: ProgramOption[];
          error?: string;
        };
        if (!response.ok) {
          throw new Error(data.error ?? "Could not load bulletin posts.");
        }
        if (requestId !== requestIdRef.current) return;
        const nextPosts = data.posts ?? [];
        setPosts(nextPosts);
        setPrograms(data.programs ?? []);
        setError(null);
        setLastUpdatedAt(Date.now());
        if (options?.silent) {
          adminToast.dismiss("bulletin-refresh-error");
          const active = nextPosts.filter((p) => resolveBulletinDisplayStatus(p) === "active").length;
          adminToast.success("Bulletin is up to date.", {
            id: "bulletin-refresh",
            description: `${active} active ${active === 1 ? "post" : "posts"} on home pages right now.`,
          });
        }
      } catch (loadError) {
        if (requestId !== requestIdRef.current) return;
        void reportPortalOperationalError(
          "school_admin",
          { organizationId, operation: "bulletin.load", error: "" },
          loadError,
        );
        const message = formatActionError(loadError, "Could not load bulletin posts.");
        if (options?.silent) {
          adminToast.error("Couldn't refresh the bulletin.", {
            id: "bulletin-refresh-error",
            description: `${message} The posts on screen haven't changed.`,
            action: { label: "Retry", onClick: () => void reloadRef.current({ silent: true }) },
          });
        } else {
          setError(message);
        }
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [organizationId, previewMode, slug],
  );

  useEffect(() => {
    reloadRef.current = loadPosts;
  }, [loadPosts]);

  useEffect(() => {
    if (previewMode) return;
    queueMicrotask(() => {
      void loadPosts();
    });
  }, [loadPosts, previewMode]);

  const editorPost = useMemo(() => {
    if (editorIsNew) return null;
    return posts.find((post) => post.id === selectedPostId) ?? null;
  }, [editorIsNew, posts, selectedPostId]);

  const counts = useMemo(() => {
    const result: Record<BulletinFilter, number> = {
      all: posts.length,
      active: 0,
      scheduled: 0,
      draft: 0,
      expired: 0,
      archived: 0,
    };
    for (const post of posts) result[resolveBulletinDisplayStatus(post)] += 1;
    return result;
  }, [posts]);

  const visiblePosts = useMemo(
    () =>
      filter === "all"
        ? posts
        : posts.filter((post) => resolveBulletinDisplayStatus(post) === filter),
    [filter, posts],
  );

  const scheduledPosts = useMemo(
    () =>
      posts
        .filter((post) => resolveBulletinDisplayStatus(post) === "scheduled")
        .sort((a, b) => Date.parse(a.publishedAt ?? "") - Date.parse(b.publishedAt ?? "")),
    [posts],
  );

  const latestDraft = useMemo(
    () =>
      posts
        .filter((post) => post.status === "draft")
        .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))[0] ?? null,
    [posts],
  );

  const openNewEditor = useCallback(() => {
    setSelectedPostId(null);
    setEditorIsNew(true);
    setEditorOpen(true);
  }, []);

  const openExistingEditor = useCallback((postId: string) => {
    setSelectedPostId(postId);
    setEditorIsNew(false);
    setEditorOpen(true);
  }, []);

  const closeEditor = useCallback(() => {
    setEditorOpen(false);
    setEditorIsNew(false);
  }, []);

  const handleSaved = useCallback(
    (post: BulletinPost) => {
      setPosts((current) => {
        const existingIndex = current.findIndex((entry) => entry.id === post.id);
        if (existingIndex === -1) return [post, ...current];
        const next = [...current];
        next[existingIndex] = post;
        return next;
      });
      setSelectedPostId(post.id);
      setEditorIsNew(false);
      flash(post.id);
      // Keep the saved post visible even if the active filter no longer matches it.
      setFilter((current) =>
        current === "all" || current === resolveBulletinDisplayStatus(post) ? current : "all",
      );
    },
    [flash],
  );

  const handleDeleted = useCallback(() => {
    setPosts((current) => current.filter((post) => post.id !== selectedPostId));
    setSelectedPostId(null);
    setEditorOpen(false);
    setEditorIsNew(false);
  }, [selectedPostId]);

  return {
    loading,
    refreshing,
    error,
    lastUpdatedAt,
    loadPosts,
    posts,
    programs,
    visiblePosts,
    counts,
    filter,
    setFilter,
    scheduledPosts,
    latestDraft,
    selectedPostId,
    editorOpen,
    editorIsNew,
    editorPost,
    flashPostId,
    openNewEditor,
    openExistingEditor,
    closeEditor,
    handleSaved,
    handleDeleted,
  };
}

export type BulletinModel = ReturnType<typeof useBulletinModel>;
