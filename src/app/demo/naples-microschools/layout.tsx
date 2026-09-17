import type { Metadata } from "next";
import { fraunces, nunitoSans } from "@/lib/fonts";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Naples MicroSchools Website Demo",
  description:
    "A concept admissions landing page for Naples MicroSchools — a nature-immersive homeschool partner on a working farm in Golden Gate Estates, Florida.",
  path: "/demo/naples-microschools",
  noIndex: true,
});

export default function NaplesMicroschoolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${fraunces.variable} ${nunitoSans.variable} [&_.font-heading]:font-[family-name:var(--font-fraunces)] [&_.font-secondary]:font-[family-name:var(--font-nunito-sans)]`}
    >
      {children}
    </div>
  );
}
