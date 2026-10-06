import { loadParentHomeContentData } from "@/lib/parent-portal/load-parent-home-content-data";
import type { OrganizationFeatures } from "@/lib/organization-settings/types";
import ParentHomeContentData from "./ParentHomeContentData";

type ParentHomeContentLoaderProps = {
  organizationId: string;
  familyId: string;
  slug: string;
  features: OrganizationFeatures;
  previewBasePath?: string;
  programId?: string;
  coopModeEnabled?: boolean;
  fridayBranchSettings?: import("@/lib/school-admin/friday-branch/friday-branch-org-settings").OrganizationFridayBranchSettings | null;
};

export default async function ParentHomeContentLoader({
  organizationId,
  familyId,
  slug,
  features,
  previewBasePath,
  programId,
  coopModeEnabled,
  fridayBranchSettings,
}: ParentHomeContentLoaderProps) {
  const contentData = await loadParentHomeContentData({
    organizationId,
    familyId,
    slug,
    features,
    previewBasePath,
    programId,
    coopModeEnabled,
    fridayBranchSettings,
  });

  return <ParentHomeContentData contentData={contentData} />;
}
