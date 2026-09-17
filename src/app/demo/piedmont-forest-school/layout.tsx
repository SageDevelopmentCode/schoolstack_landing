import type { Metadata } from "next";
import { fraunces, nunitoSans } from "@/lib/fonts";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Piedmont Forest School Website Demo",
  description:
    "A concept admissions landing page for Piedmont Forest School — an inclusive, year-round forest school community in Winston-Salem, North Carolina.",
  path: "/demo/piedmont-forest-school",
  noIndex: true,
});

export default function PiedmontForestSchoolLayout({
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
