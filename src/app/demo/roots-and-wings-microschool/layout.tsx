import type { Metadata } from "next";
import { lora, nunitoSans } from "@/lib/fonts";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Roots and Wings Microschool Website Demo",
  description:
    "A concept admissions landing page for Roots and Wings Microschool — a small, private microschool in North Mesa led by a state-certified teacher with personalized K–8 learning.",
  path: "/demo/roots-and-wings-microschool",
  noIndex: true,
});

export default function RootsAndWingsMicroschoolLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${lora.variable} ${nunitoSans.variable} [&_.font-heading]:font-[family-name:var(--font-lora)] [&_.font-secondary]:font-[family-name:var(--font-nunito-sans)]`}
    >
      {children}
    </div>
  );
}
