import { cookies } from "next/headers";
import { loadParentHomeContentData } from "@/lib/parent-portal/load-parent-home-content-data";
import { fetchParentFeatureAnnouncements } from "@/lib/parent-portal/parent-feature-announcements";
import type { OrganizationFeatures } from "@/lib/organization-settings/types";
import { resolveParentPortalHomeBulletinLimit } from "@/lib/parent-portal/load-parent-portal-home-api-payload";
import { loadHomeBulletinPosts } from "@/lib/school-bulletin/posts-home";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";
import ParentHomeContentData from "./ParentHomeContentData";

type ParentHomeContentLoaderProps = {
  organizationId: string;
  familyId?: string;
  slug: string;
  features: OrganizationFeatures;
  previewBasePath?: string;
  programId?: string;
  programSlug?: string;
  parentNavBasePath?: string;
  coopModeEnabled?: boolean;
  bulletinEnabled?: boolean;
  fridayBranchSettings?: import("@/lib/school-admin/friday-branch/friday-branch-org-settings").OrganizationFridayBranchSettings | null;
};

export default async function ParentHomeContentLoader({
  organizationId,
  familyId,
  slug,
  features,
  previewBasePath,
  programId,
  programSlug,
  parentNavBasePath,
  coopModeEnabled,
  bulletinEnabled = false,
  fridayBranchSettings,
}: ParentHomeContentLoaderProps) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const admin = createAdminClient();

  const [contentData, bulletinPosts, featureAnnouncements] = await Promise.all([
    familyId
      ? loadParentHomeContentData({
          organizationId,
          familyId,
          slug,
          features,
          previewBasePath,
          programId,
          coopModeEnabled,
          fridayBranchSettings,
          supabase,
        })
      : Promise.resolve(null),
    loadHomeBulletinPosts({
      supabase,
      signedUrlClient: admin,
      organizationId,
      bulletinEnabled,
      viewer: "parent",
      programId,
      limit: resolveParentPortalHomeBulletinLimit(Boolean(coopModeEnabled)),
    }),
    fetchParentFeatureAnnouncements(admin, organizationId, {
      slug,
      features,
      coopModeEnabled: Boolean(coopModeEnabled),
      bulletinEnabled,
      programSlug,
      parentNavBasePath,
      previewBasePath,
    }),
  ]);

  return (
    <ParentHomeContentData
      contentData={contentData}
      bulletinPosts={bulletinPosts}
      featureAnnouncements={featureAnnouncements}
    />
  );
}
