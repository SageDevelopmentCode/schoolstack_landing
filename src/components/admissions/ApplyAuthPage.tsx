"use client";

import { useRouter } from "next/navigation";
import ParentPortalSignIn from "@/components/admissions/ParentPortalSignIn";
import type { OrganizationBranding } from "@/lib/organization-settings/types";

type ApplyAuthPageProps = {
  branding: OrganizationBranding;
  schoolName: string;
  organizationId: string;
  organizationSlug: string;
};

export default function ApplyAuthPage({
  branding,
  schoolName,
  organizationId,
  organizationSlug,
}: ApplyAuthPageProps) {
  const router = useRouter();

  return (
    <ParentPortalSignIn
      branding={branding}
      schoolName={schoolName}
      organizationId={organizationId}
      organizationSlug={organizationSlug}
      authPage="/apply"
      title="Sign in to your applications"
      subtitle="Enter the email you used when applying. We&apos;ll send you a one-time code."
      onComplete={() => {
        router.refresh();
      }}
    />
  );
}
