import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { fetchOrganizationWithSettings } from "@/lib/organization-settings/fetch";

export const dynamic = "force-dynamic";

type LayoutProps = {
  children: ReactNode;
  params: Promise<{ slug: string }>;
};

export default async function SchoolApplyLayout({ children, params }: LayoutProps) {
  const { slug } = await params;
  const org = await fetchOrganizationWithSettings(slug);

  if (!org || org.plan === "free") {
    notFound();
  }

  return children;
}
