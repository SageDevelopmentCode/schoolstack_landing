import type { Metadata } from "next";
import { dmSans, nunitoSans } from "@/lib/fonts";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Kinder Academy Prep School Website Demo",
  description:
    "A concept admissions landing page for Kinder Academy Prep School — a private early-childhood microschool in Georgetown, Texas for ages 4–8 and K–3 with personalized, play-based learning.",
  path: "/demo/kinder-academy-prep-school",
  noIndex: true,
});

export default function KinderAcademyPrepSchoolLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${dmSans.variable} ${nunitoSans.variable} [&_.font-heading]:font-[family-name:var(--font-nunito-sans)] [&_.font-secondary]:font-[family-name:var(--font-dm-sans)]`}
    >
      {children}
    </div>
  );
}
