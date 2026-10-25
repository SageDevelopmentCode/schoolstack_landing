"use client";

import type { OrganizationBranding } from "@/lib/organization-settings/types";
import NewsletterWorkspace from "./NewsletterWorkspace";

type NewsletterPageProps = {
  organizationId: string;
  slug: string;
  schoolName: string;
  branding: OrganizationBranding;
};

export default function NewsletterPage({
  organizationId,
  slug,
  schoolName,
  branding,
}: NewsletterPageProps) {
  return (
    <NewsletterWorkspace
      organizationId={organizationId}
      slug={slug}
      schoolName={schoolName}
      branding={branding}
    />
  );
}
