import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { fetchOrganizationWithSettings } from "@/lib/organization-settings/fetch";

export const dynamic = "force-dynamic";

type LayoutProps = {
  children: ReactNode;
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: LayoutProps): Promise<Metadata> {
  const { slug } = await params;
  const org = await fetchOrganizationWithSettings(slug);

  if (!org) {
    return { title: "School Not Found" };
  }

  return {
    title: `${org.name} Admin`,
  };
}

export default function SchoolAdminRootLayout({ children }: LayoutProps) {
  return children;
}
