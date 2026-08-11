import type { Metadata } from "next";
import { dmSerifDisplay, openSans } from "@/lib/fonts";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Austin Micro School Website Demo",
  description:
    "A concept admissions landing page for Austin Micro School — an accredited K-12 microschool in South Austin focused on hands-on learning and leadership development.",
  path: "/demo/austin-micro-school",
  noIndex: true,
});

export default function AustinMicroSchoolLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${dmSerifDisplay.variable} ${openSans.variable} [&_.font-heading]:font-[family-name:var(--font-dm-serif-display)] [&_.font-secondary]:font-[family-name:var(--font-open-sans)]`}
    >
      {children}
    </div>
  );
}
