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
};

export default async function ParentHomeContentLoader({
  organizationId,
  familyId,
  slug,
  features,
  previewBasePath,
  programId,
  coopModeEnabled,
}: ParentHomeContentLoaderProps) {
  const contentData = await loadParentHomeContentData({
    organizationId,
    familyId,
    slug,
    features,
    previewBasePath,
    programId,
    coopModeEnabled,
  });

  return <ParentHomeContentData contentData={contentData} />;
}
