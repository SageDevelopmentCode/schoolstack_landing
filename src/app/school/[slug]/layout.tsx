import type { Metadata } from "next";
import type { ReactNode } from "react";
import { schoolPageMetadata } from "@/lib/og/school-page-metadata";
import { fetchOrganizationWithSettings } from "@/lib/organization-settings/fetch";

type LayoutProps = {
  children: ReactNode;
  params: Promise<{ slug: string }>;
};

/**
 * Default link preview for every `/school/<slug>/**` page (portal logins, shared portal links):
 * the school's own card and name instead of MudKitchen's. Pages with their own preview (tour,
 * application forms, apply) override it. Tab titles are left to each page.
 */
export async function generateMetadata({ params }: Pick<LayoutProps, "params">): Promise<Metadata> {
  const { slug } = await params;
  const org = await fetchOrganizationWithSettings(slug);
  if (!org) return {};
  const metadata = await schoolPageMetadata(org, { title: org.name, page: "portal" });
  return { openGraph: metadata.openGraph, twitter: metadata.twitter };
}

export default function SchoolLayout({ children }: LayoutProps) {
  return children;
}
