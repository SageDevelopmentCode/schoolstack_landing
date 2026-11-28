"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import {
  BLOG_TOPICS,
  type BlogTopic,
  type BlogTopicCluster,
  type BlogTopicFunnel,
  type BlogTopicPriority,
} from "@/lib/marketing/blog-topics";
import {
  addDays,
  buildSchedule,
  compareTopics,
  fetchBlogPosts,
  localToday,
  subscribeNever,
  UP_NEXT_DAYS,
  weekStart,
  type PostRow,
  type TopicStatus,
  type TopicsView,
} from "@/components/admin/marketing/blog-topics-ui";

/*
 * State for Blog topics (/admin/marketing/blog-topics): post status per topic
 * (from the Blog tab), filters, list/schedule view, open rows.
 * The Garden view (BlogTopicsResearch) only renders what this returns.
 */

export function useBlogTopicsModel() {
  const [posts, setPosts] = useState<PostRow[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const today = useSyncExternalStore(subscribeNever, localToday, () => null);
  const [cluster, setCluster] = useState<BlogTopicCluster | "all">("all");
  const [funnel, setFunnel] = useState<BlogTopicFunnel | "all">("all");
  const [priority, setPriority] = useState<BlogTopicPriority | "all">("all");
  const [status, setStatus] = useState<TopicStatus | "all">("all");
  const [query, setQuery] = useState("");
  const [openIds, setOpenIds] = useState<Set<string>>(() => new Set());
  const [view, setView] = useState<TopicsView>("schedule");
  const scrolledToWeek = useRef(false);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      setPosts(await fetchBlogPosts());
      setLoadError(null);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Could not load blog posts.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => void fetchPosts());
  }, [fetchPosts]);

  const statusOf = useCallback(
    (topic: BlogTopic): TopicStatus => {
      const post = posts?.find((p) => p.slug === topic.targetSlug);
      if (!post) return "idea";
      return post.published ? "published" : "draft";
    },
    [posts],
  );

  const sorted = useMemo(() => [...BLOG_TOPICS].sort(compareTopics), []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sorted.filter((topic) => {
      if (cluster !== "all" && topic.cluster !== cluster) return false;
      if (funnel !== "all" && topic.funnel !== funnel) return false;
      if (priority !== "all" && topic.priority !== priority) return false;
      if (status !== "all" && statusOf(topic) !== status) return false;
      if (!q) return true;
      const haystack = [topic.workingTitle, topic.primaryKeyword, ...topic.secondaryKeywords, topic.angle, topic.audience, ...topic.featureSlugs]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [sorted, cluster, funnel, priority, status, query, statusOf]);

  const upNext = useMemo(() => {
    if (!today) return [];
    const limit = addDays(today, UP_NEXT_DAYS);
    return BLOG_TOPICS.filter((t) => t.scheduledFor <= limit && statusOf(t) !== "published").sort((a, b) =>
      a.scheduledFor.localeCompare(b.scheduledFor),
    );
  }, [today, statusOf]);

  const statusCounts = useMemo(() => {
    const result: Record<TopicStatus, number> = { idea: 0, draft: 0, published: 0 };
    for (const topic of BLOG_TOPICS) result[statusOf(topic)] += 1;
    return result;
  }, [statusOf]);

  const toggle = (id: string) =>
    setOpenIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const clearFilters = () => {
    setCluster("all");
    setFunnel("all");
    setPriority("all");
    setStatus("all");
    setQuery("");
  };

  /** Opens a topic from "Up next": clears filters that might hide it, then scrolls to it. */
  const openTopic = (id: string) => {
    setOpenIds((current) => new Set(current).add(id));
    clearFilters();
    window.requestAnimationFrame(() =>
      document.getElementById(`topic-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" }),
    );
  };

  const filtersActive = cluster !== "all" || funnel !== "all" || priority !== "all" || status !== "all" || query.trim() !== "";
  const schedule = useMemo(() => buildSchedule(filtered, !filtersActive), [filtered, filtersActive]);
  const thisWeek = today ? weekStart(today) : null;

  // Open the schedule on the current week (once, after the first render of the schedule).
  useEffect(() => {
    if (view !== "schedule" || !thisWeek || scrolledToWeek.current) return;
    const target = document.getElementById(`week-${thisWeek}`);
    const scroller = target?.closest<HTMLElement>("[data-admin-garden-scroller]");
    if (!target || !scroller) return;
    scrolledToWeek.current = true;
    scroller.scrollTo({ top: target.getBoundingClientRect().top - scroller.getBoundingClientRect().top + scroller.scrollTop - 16 });
  }, [view, thisWeek]);

  return {
    posts,
    loading,
    loadError,
    retry: () => void fetchPosts(),
    today,
    statusOf,
    statusCounts,
    upNext,
    filtered,
    schedule,
    thisWeek,
    view,
    setView,
    cluster,
    setCluster,
    funnel,
    setFunnel,
    priority,
    setPriority,
    status,
    setStatus,
    query,
    setQuery,
    filtersActive,
    clearFilters,
    openIds,
    toggle,
    openTopic,
  };
}
