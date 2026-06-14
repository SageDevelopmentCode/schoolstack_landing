import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Product Demo",
  description:
    "Explore MudKitchen's admin, teacher, and parent dashboards — enrollment, billing, reporting, and daily school operations in one unified platform.",
  path: "/demo-school",
});

export default function DemoSchoolLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
