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
};

export default async function ParentHomeContentLoader({
  organizationId,
  familyId,
  slug,
  features,
  previewBasePath,
  programId,
}: ParentHomeContentLoaderProps) {
  const contentData = await loadParentHomeContentData({
    organizationId,
    familyId,
    slug,
    features,
    previewBasePath,
    programId,
  });

  return <ParentHomeContentData contentData={contentData} />;
}
