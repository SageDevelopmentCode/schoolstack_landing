import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "School Website Demo",
  description: "Explore a sample microschool website built with MudKitchen.",
  path: "/website-demo",
  noIndex: true,
});

export default function WebsiteDemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
