"use client";

import { Suspense } from "react";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import type { NewsletterWorkspaceState } from "@/lib/school-admin/newsletter/newsletter-types";
import NewsletterSection from "./NewsletterSection";
import NewsletterOverviewSkeleton from "./NewsletterOverviewSkeleton";

type NewsletterPageProps = {
  organizationId: string;
  slug: string;
  schoolName: string;
  branding: OrganizationBranding;
  galleryEnabled: boolean;
  initialEditionId?: string | null;
  initialWorkspace: NewsletterWorkspaceState;
};

export default function NewsletterPage(props: NewsletterPageProps) {
  return (
    <Suspense fallback={<NewsletterOverviewSkeleton />}>
      <NewsletterSection {...props} />
    </Suspense>
  );
}
