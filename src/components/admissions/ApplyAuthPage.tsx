"use client";

import { useRouter } from "next/navigation";
import ParentPortalSignIn from "@/components/admissions/ParentPortalSignIn";
import type { OrganizationBranding } from "@/lib/organization-settings/types";

type ApplyAuthPageProps = {
  branding: OrganizationBranding;
  schoolName: string;
};

export default function ApplyAuthPage({ branding, schoolName }: ApplyAuthPageProps) {
  const router = useRouter();

  return (
    <ParentPortalSignIn
      branding={branding}
      schoolName={schoolName}
      title="Sign in to your applications"
      subtitle="Enter the email you used when applying. We&apos;ll send you a one-time code."
      onComplete={() => {
        router.refresh();
      }}
    />
  );
}
