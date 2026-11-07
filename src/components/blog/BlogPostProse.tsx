import type { ReactNode } from "react";

const PROSE_CLASS =
  "blog-post-prose font-secondary text-[17px] leading-relaxed text-[#1d1a16]/70 [&_h2]:font-secondary! [&_h2]:text-[clamp(1.35rem,2.5vw,1.75rem)] [&_h2]:font-bold! [&_h2]:leading-tight [&_h2]:tracking-[-0.03em]! [&_h2]:text-[#1d1a16] [&_h2]:mt-12 [&_h2]:mb-4 [&_h3]:font-secondary! [&_h3]:text-lg [&_h3]:font-bold! [&_h3]:text-[#1d1a16] [&_p]:mt-4 [&_p:first-child]:mt-0 [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_a]:text-clay [&_a]:underline [&_strong]:font-semibold [&_strong]:text-[#1d1a16]";

export default function BlogPostProse({ children }: { children: ReactNode }) {
  return <div className={PROSE_CLASS}>{children}</div>;
}
