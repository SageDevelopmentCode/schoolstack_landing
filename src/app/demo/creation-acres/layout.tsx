import type { Metadata } from "next";
import { lora, sourceSans3 } from "@/lib/fonts";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Creation Acres Montessori Website Demo",
  description:
    "A concept admissions landing page for Creation Acres Montessori — a Christ-centered Montessori microschool in Mint Hill, NC serving the Charlotte area.",
  path: "/demo/creation-acres",
  noIndex: true,
});

export default function CreationAcresLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${lora.variable} ${sourceSans3.variable} [&_.font-heading]:font-[family-name:var(--font-lora)] [&_.font-secondary]:font-[family-name:var(--font-source-sans)]`}
    >
      {children}
    </div>
  );
}
