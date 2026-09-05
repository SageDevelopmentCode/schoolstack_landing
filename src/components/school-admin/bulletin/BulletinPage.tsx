"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import BulletinPostEditorSheet from "@/components/school-admin/bulletin/BulletinPostEditorSheet";
import BulletinPostList from "@/components/school-admin/bulletin/BulletinPostList";
import { SchoolAdminSplitPaneSkeleton } from "@/components/school-admin/skeletons";
import { useSchoolAdminStoryTheme } from "@/components/school-admin/SchoolAdminStoryShell";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import AdminDisplayHeading from "@/components/school-admin/ui/story/AdminDisplayHeading";
import AdminMetricCard from "@/components/school-admin/ui/story/AdminMetricCard";
import AdminSectionKicker from "@/components/school-admin/ui/story/AdminSectionKicker";
import { resolveBulletinDisplayStatus } from "@/lib/school-bulletin/bulletin-audience";
import type { BulletinPost, ProgramOption } from "@/lib/school-bulletin/types";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import { adminToast, formatActionError } from "@/lib/school-admin/admin-toast";

type BulletinPageProps = {
  organizationId: string;
  branding: OrganizationBranding;
  slug: string;
  schoolName: string;
};

export default function BulletinPage({
  slug,
  schoolName,
}: BulletinPageProps) {
  const { theme, C } = useSchoolAdminStoryTheme();
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<BulletinPost[]>([]);
  const [programs, setPrograms] = useState<ProgramOption[]>([]);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorIsNew, setEditorIsNew] = useState(false);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/school/${slug}/bulletin`);
      const data = (await response.json()) as {
        posts?: BulletinPost[];
        programs?: ProgramOption[];
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error ?? "Could not load bulletin posts.");
      }

      setPosts(data.posts ?? []);
      setPrograms(data.programs ?? []);
    } catch (error) {
      adminToast.error(formatActionError(error, "Could not load bulletin posts."));
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    queueMicrotask(() => {
      void loadPosts();
    });
  }, [loadPosts]);

  const editorPost = useMemo(() => {
    if (editorIsNew) return null;
    return posts.find((post) => post.id === selectedPostId) ?? null;
  }, [editorIsNew, posts, selectedPostId]);

  const metrics = useMemo(() => {
    const active = posts.filter(
      (post) => resolveBulletinDisplayStatus(post) === "active",
    ).length;
    const drafts = posts.filter((post) => post.status === "draft").length;
    const scheduled = posts.filter(
      (post) => resolveBulletinDisplayStatus(post) === "scheduled",
    ).length;

    return { active, drafts, scheduled, total: posts.length };
  }, [posts]);

  const openNewEditor = () => {
    setSelectedPostId(null);
    setEditorIsNew(true);
    setEditorOpen(true);
  };

  const openExistingEditor = (postId: string) => {
    setSelectedPostId(postId);
    setEditorIsNew(false);
    setEditorOpen(true);
  };

  const closeEditor = () => {
    setEditorOpen(false);
    setEditorIsNew(false);
  };

  const handleSaved = (post: BulletinPost) => {
    setPosts((current) => {
      const existingIndex = current.findIndex((entry) => entry.id === post.id);
      if (existingIndex === -1) {
        return [post, ...current];
      }
      const next = [...current];
      next[existingIndex] = post;
      return next;
    });
    setSelectedPostId(post.id);
    setEditorIsNew(false);
  };

  const handleDeleted = () => {
    if (selectedPostId) {
      setPosts((current) => current.filter((post) => post.id !== selectedPostId));
    }
    setSelectedPostId(null);
    closeEditor();
  };

  if (loading) {
    return <SchoolAdminSplitPaneSkeleton C={C} label="Loading bulletin" />;
  }

  return (
    <>
      <div
        className="mx-auto max-w-[1350px] px-[clamp(25px,4vw,56px)] py-[30px] pb-14"
        style={{ color: theme.ink }}
      >
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <AdminSectionKicker theme={theme}>Bulletin</AdminSectionKicker>
            <AdminDisplayHeading theme={theme} as="h1">
              Announcements for {schoolName}
            </AdminDisplayHeading>
            <p className="mt-2 max-w-2xl text-sm text-[#65747A]">
              Publish school updates with optional flyers. Active posts appear on
              parent and teacher home pages.
            </p>
          </div>
          <AdminButton type="button" theme={theme} onClick={openNewEditor}>
            <Plus className="h-4 w-4" />
            New post
          </AdminButton>
        </div>

        <div className="mb-6 grid gap-3 md:grid-cols-4">
          <AdminMetricCard theme={theme} label="Active" value={String(metrics.active)} accent="forest" />
          <AdminMetricCard theme={theme} label="Drafts" value={String(metrics.drafts)} accent="gold" />
          <AdminMetricCard
            theme={theme}
            label="Scheduled"
            value={String(metrics.scheduled)}
            accent="sky"
          />
          <AdminMetricCard theme={theme} label="Total posts" value={String(metrics.total)} accent="berry" />
        </div>

        <BulletinPostList
          posts={posts}
          programs={programs}
          selectedPostId={editorOpen && !editorIsNew ? selectedPostId : null}
          onSelect={openExistingEditor}
        />
      </div>

      <BulletinPostEditorSheet
        open={editorOpen}
        onClose={closeEditor}
        slug={slug}
        post={editorPost}
        programs={programs}
        isNew={editorIsNew}
        onSaved={handleSaved}
        onDeleted={handleDeleted}
        C={C}
      />
    </>
  );
}
