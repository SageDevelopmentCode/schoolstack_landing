import type { Metadata } from "next";
import { DM_Serif_Display } from "next/font/google";
import { nunito } from "@/lib/fonts";
import { pageMetadata } from "@/lib/metadata";

const dmSerifDisplay = DM_Serif_Display({
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
  variable: "--font-dm-serif-display",
});

export const metadata: Metadata = pageMetadata({
  title: "Kineo School Website Demo",
  description:
    "A concept admissions landing page for The Kineo School — an accredited K-5 independent school in Kirkland, Washington.",
  path: "/demo/kineo-school",
  noIndex: true,
});

export default function KineoSchoolLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${dmSerifDisplay.variable} ${nunito.variable} [&_.font-heading]:font-[family-name:var(--font-dm-serif-display)] [&_.font-secondary]:font-[family-name:var(--font-nunito)]`}
    >
      {children}
    </div>
  );
}
