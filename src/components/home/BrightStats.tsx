import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FadeInView } from "@/components/ui/FadeInView";
import { STORY_COPY } from "./home-copy";

export default function BrightStats() {
  return (
    <section className="bg-white px-3 lg:px-6">
      <FadeInView>
        <div className="mx-auto grid max-w-[1400px] gap-10 rounded-[40px] bg-[#1d1a16] px-8 py-14 text-white lg:grid-cols-[1fr_auto] lg:items-center lg:px-16">
          <div className="grid grid-cols-3 gap-6">
            {STORY_COPY.stats.map((stat) => (
              <div key={stat.label}>
                <div className="font-secondary whitespace-nowrap text-[clamp(1.8rem,5vw,4.2rem)] font-bold leading-none tracking-[-0.04em]">
                  {stat.number}
                </div>
                <div className="font-secondary mt-3 text-[13px] text-white/60 md:text-[15px]">{stat.label}</div>
              </div>
            ))}
          </div>
          <Link
            href={STORY_COPY.href}
            className="font-secondary group inline-flex items-center gap-3 text-[15px] font-semibold text-white/90 hover:text-white"
          >
            {STORY_COPY.location}
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition-colors group-hover:bg-clay">
              <ArrowRight size={16} aria-hidden />
            </span>
          </Link>
        </div>
      </FadeInView>
    </section>
  );
}
