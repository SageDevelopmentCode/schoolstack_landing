"use client";

import { Suspense } from "react";
import AdminPageSkeleton from "@/components/school-admin/AdminPageSkeleton";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import NewsletterSection from "./NewsletterSection";

type NewsletterPageProps = {
  organizationId: string;
  slug: string;
  schoolName: string;
  branding: OrganizationBranding;
  galleryEnabled: boolean;
  initialEditionId?: string | null;
};

export default function NewsletterPage(props: NewsletterPageProps) {
  return (
    <Suspense fallback={<AdminPageSkeleton label="Loading newsletters" />}>
      <NewsletterSection {...props} />
    </Suspense>
  );
}
