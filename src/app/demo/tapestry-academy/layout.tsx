import type { Metadata } from "next";
import { dmSans, fraunces } from "@/lib/fonts";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Tapestry Academy | Microschool & Homeschool Programs in Boca Raton, FL",
  description:
    "Tapestry Academy offers flexible microschool and homeschool programs for Grades K–12 in East Boca Raton—personalized learning, hands-on projects, mentorship, and community.",
  path: "/demo/tapestry-academy",
  noIndex: true,
});

export default function TapestryAcademyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${fraunces.variable} ${dmSans.variable} [&_.font-heading]:font-[family-name:var(--font-fraunces)] [&_.font-secondary]:font-[family-name:var(--font-dm-sans)]`}
    >
      {children}
    </div>
  );
}
