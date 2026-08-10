import type { Metadata } from "next";
import { Raleway } from "next/font/google";
import { sourceSans3 } from "@/lib/fonts";
import { pageMetadata } from "@/lib/metadata";

const raleway = Raleway({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-raleway",
});

export const metadata: Metadata = pageMetadata({
  title: "Homework Hub Website Demo",
  description:
    "A concept admissions landing page for Homework Hub — an award-winning academic learning center serving Pre-K through college and beyond in Melville, NY.",
  path: "/demo/homework-hub",
  noIndex: true,
});

export default function HomeworkHubLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${raleway.variable} ${sourceSans3.variable} [&_.font-heading]:font-[family-name:var(--font-raleway)] [&_.font-secondary]:font-[family-name:var(--font-source-sans)]`}
    >
      {children}
    </div>
  );
}
