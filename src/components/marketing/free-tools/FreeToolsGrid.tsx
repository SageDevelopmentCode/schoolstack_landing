import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FREE_TOOLS_HUB_TOOLS } from "@/lib/marketing/free-tools-hub-content";
import { accentIconClasses } from "@/components/marketing/free-tools/free-tools-hub-styles";
import { DARK_PILL } from "@/components/home/bright-styles";

export default function FreeToolsGrid() {
  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3 lg:gap-6">
      {FREE_TOOLS_HUB_TOOLS.map((tool) => (
        <article
          key={tool.id}
          id={`card-${tool.id}`}
          className="flex flex-col overflow-hidden rounded-[28px] border border-black/8 bg-white shadow-[0_12px_40px_rgba(30,60,30,0.06)]"
        >
          <div className="flex flex-1 flex-col px-5 pb-5 pt-5 sm:px-6">
            <div className="mb-5 flex items-center justify-between gap-2.5">
              <span
                className={`grid h-10 w-10 shrink-0 place-items-center rounded-2xl ${accentIconClasses(tool.accent)}`}
              >
                <tool.icon className="h-[19px] w-[19px]" strokeWidth={1.7} aria-hidden />
              </span>
              <span className="font-secondary text-[10px] font-semibold uppercase tracking-widest text-clay">
                {tool.kicker}
              </span>
            </div>
            <h3 className="font-secondary! max-w-[260px] text-[22px] font-bold! leading-[1.15] tracking-[-0.03em]! text-[#1d1a16] lg:text-[24px]">
              {tool.title}
            </h3>
            <p className="mt-3 font-secondary text-[14px] leading-relaxed text-[#1d1a16]/70">
              {tool.description}
            </p>
          </div>
          <footer className="flex flex-col gap-2.5 border-t border-black/8 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <span className="font-secondary text-center text-[11px] text-[#1d1a16]/50 sm:text-left">
              {tool.timeHint}
            </span>
            <Link href={tool.href} className={`${DARK_PILL} h-10 shrink-0 gap-1.5 px-5 text-sm`}>
              {tool.ctaLabel}
              <ArrowRight size={14} aria-hidden />
            </Link>
          </footer>
        </article>
      ))}
    </div>
  );
}
