import type { Metadata } from "next";
import { dmSans } from "@/lib/fonts";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Wildcat Microschool Website Demo",
  description:
    "A private website redesign concept for Wildcat Microschool, a homeschool learning pod in Haverhill, New Hampshire.",
  path: "/demo/wildcat-microschool",
  noIndex: true,
});

export default function WildcatMicroschoolLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${dmSans.variable} [&_.font-heading]:font-[family-name:var(--font-dm-sans)] [&_.font-secondary]:font-[family-name:var(--font-dm-sans)]`}
    >
      {children}
    </div>
  );
}
