import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MARKETING_FREE_TOOLS } from "@/lib/marketing/free-tools";
import { FadeInView } from "@/components/ui/FadeInView";

export default function FreeToolsGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {MARKETING_FREE_TOOLS.map((tool, index) => (
        <FadeInView key={tool.href} delay={index * 0.06}>
          <div
            className="group relative flex flex-col h-full rounded-2xl border border-border bg-surface hover:-translate-y-1 hover:shadow-md transition-all duration-200 overflow-hidden p-6"
          >
            <Link
              href={tool.href}
              className="absolute inset-0 z-[1]"
              aria-label={tool.title}
            />
            <div className="flex items-start justify-between gap-3">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-clay/10 text-clay"
                aria-hidden
              >
                <tool.icon size={20} strokeWidth={1.75} />
              </div>
              {tool.badge ? (
                <span className="relative z-[2] rounded-pill bg-bg px-2.5 py-0.5 text-[11px] font-medium text-text-muted">
                  {tool.badge}
                </span>
              ) : null}
            </div>
            <h2 className="font-display text-lg font-semibold text-text mt-4 pr-6">
              {tool.title}
            </h2>
            <p className="text-sm font-secondary text-text-muted leading-relaxed mt-2 flex-1">
              {tool.description}
            </p>
            <span
              className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-clay group-hover:gap-2 transition-all duration-200"
            >
              Open tool
              <ArrowRight size={14} aria-hidden />
            </span>
          </div>
        </FadeInView>
      ))}
    </div>
  );
}
