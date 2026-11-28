import Link from "next/link";
import { BLOG_TOOLS, type BlogToolId } from "@/lib/marketing/blog-demos";

/** A card in a post that sends readers to one of the free tools. */
export default function BlogToolCallout({ tool, lead }: { tool: BlogToolId; lead?: string }) {
  const meta = BLOG_TOOLS[tool];
  return (
    <aside className="not-prose my-10 rounded-[24px] border-2 border-[var(--sf-ink)] bg-[var(--sf-butter)] p-6 shadow-[0_6px_0_0_var(--sf-ink)] sm:p-7">
      <p className="text-[12px] font-extrabold uppercase tracking-[0.14em] text-[var(--sf-clay-deep)]">Free tool</p>
      <p className="mt-1 text-[22px] font-extrabold leading-tight text-[var(--sf-ink)]">{meta.name}</p>
      <p className="mt-2 text-[16px] leading-relaxed text-[var(--sf-ink)]">{lead ?? meta.pitch}</p>
      <Link
        href={meta.href}
        className="mt-4 inline-flex items-center rounded-full border-2 border-[var(--sf-ink)] bg-[var(--sf-forest)] px-5 py-2.5 text-[15px] font-bold text-white shadow-[0_3px_0_0_var(--sf-ink)] transition-transform hover:-translate-y-0.5"
      >
        {meta.button} →
      </Link>
    </aside>
  );
}
