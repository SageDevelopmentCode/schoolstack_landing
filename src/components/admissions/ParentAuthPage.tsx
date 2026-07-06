"use client";

import { useRouter } from "next/navigation";
import ParentPortalSignIn from "@/components/admissions/ParentPortalSignIn";
import type { OrganizationBranding } from "@/lib/organization-settings/types";

type ParentAuthPageProps = {
  branding: OrganizationBranding;
  schoolName: string;
};

export default function ParentAuthPage({ branding, schoolName }: ParentAuthPageProps) {
  const router = useRouter();

  return (
    <ParentPortalSignIn
      branding={branding}
      schoolName={schoolName}
      title="Sign in to your parent portal"
      subtitle="Enter the email on your family account. We'll send you a one-time code."
      onComplete={() => {
        router.refresh();
      }}
    />
  );
}
