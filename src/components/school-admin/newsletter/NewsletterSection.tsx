"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import AdminPageSkeleton from "@/components/school-admin/AdminPageSkeleton";
import { useSchoolAdminStoryTheme } from "@/components/school-admin/SchoolAdminStoryShell";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import {
  createInitialNewsletterWorkspace,
  loadNewsletterWorkspace,
  saveNewsletterWorkspace,
} from "@/lib/school-admin/newsletter/newsletter-workspace-storage";
import type { NewsletterWorkspaceState } from "@/lib/school-admin/newsletter/newsletter-types";
import { useHydrated } from "@/hooks/useHydrated";
import NewsletterOverviewPage from "./NewsletterOverviewPage";
import NewsletterWorkspace from "./NewsletterWorkspace";

type NewsletterSectionProps = {
  organizationId: string;
  slug: string;
  schoolName: string;
  branding: OrganizationBranding;
  galleryEnabled: boolean;
  initialEditionId?: string | null;
};

export default function NewsletterSection({
  organizationId,
  slug,
  schoolName,
  branding,
  galleryEnabled,
  initialEditionId = null,
}: NewsletterSectionProps) {
  const { theme } = useSchoolAdminStoryTheme();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const editionId = searchParams.get("edition") ?? initialEditionId;
  const workspaceSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hydrated = useHydrated();
  const storageSynced = hydrated;

  const [workspace, setWorkspace] = useState<NewsletterWorkspaceState>(() =>
    createInitialNewsletterWorkspace(organizationId, schoolName, theme.primary),
  );
  const appliedStoredWorkspaceRef = useRef(false);

  useEffect(() => {
    if (!hydrated || appliedStoredWorkspaceRef.current) {
      return;
    }
    appliedStoredWorkspaceRef.current = true;
    queueMicrotask(() => {
      const stored = loadNewsletterWorkspace(organizationId);
      if (stored) {
        setWorkspace(stored);
      }
    });
  }, [hydrated, organizationId]);

  const persistWorkspace = useCallback(
    (next: NewsletterWorkspaceState) => {
      setWorkspace(next);
      if (workspaceSaveTimer.current) clearTimeout(workspaceSaveTimer.current);
      workspaceSaveTimer.current = setTimeout(() => {
        saveNewsletterWorkspace(organizationId, next);
      }, 200);
    },
    [organizationId],
  );

  useEffect(() => {
    return () => {
      if (workspaceSaveTimer.current) clearTimeout(workspaceSaveTimer.current);
    };
  }, []);

  useEffect(() => {
    if (!storageSynced || !editionId) return;
    const exists = workspace.editions.some((e) => e.id === editionId);
    if (!exists) {
      router.replace(pathname);
    }
  }, [storageSynced, editionId, workspace.editions, pathname, router]);

  const openEdition = useCallback(
    (id: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("edition", id);
      router.push(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams],
  );

  const backToOverview = useCallback(() => {
    router.push(pathname);
  }, [pathname, router]);

  if (editionId && !storageSynced) {
    return <AdminPageSkeleton label="Loading newsletter" />;
  }

  if (
    storageSynced &&
    editionId &&
    workspace.editions.some((e) => e.id === editionId)
  ) {
    return (
      <NewsletterWorkspace
        organizationId={organizationId}
        slug={slug}
        schoolName={schoolName}
        branding={branding}
        editionId={editionId}
        workspace={workspace}
        onWorkspaceChange={persistWorkspace}
        onBack={backToOverview}
        galleryEnabled={galleryEnabled}
      />
    );
  }

  return (
    <NewsletterOverviewPage
      workspace={workspace}
      onWorkspaceChange={persistWorkspace}
      onOpenEdition={openEdition}
    />
  );
}
