import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FadeInView } from "@/components/ui/FadeInView";
import { STORY_COPY } from "./home-copy";
import { ACCENT_HIGHLIGHT, BOLD_HEADING, DARK_PILL } from "./bright-styles";

export default function BrightStory() {
  return (
    <section id="founder-story" className="bg-white px-3 py-6 lg:px-6">
      <FadeInView>
        <div className="mx-auto grid max-w-[1400px] gap-10 rounded-[40px] bg-[#E9F2E4] px-6 py-14 md:px-12 lg:grid-cols-[1.25fr_1fr] lg:gap-14 lg:px-16 lg:py-20">
          <div className="flex flex-col">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-secondary rounded-pill bg-white px-4 py-1.5 text-[12px] font-semibold text-[#1d1a16]">
                {STORY_COPY.badge}
              </span>
              <span className="font-secondary text-[14px] text-[#1d1a16]/60">{STORY_COPY.location}</span>
            </div>
            <h2 className={`mt-6 text-[clamp(2rem,4.2vw,3.4rem)] ${BOLD_HEADING}`}>
              {STORY_COPY.headlineLead} <span className={ACCENT_HIGHLIGHT}>{STORY_COPY.headlineAccent}</span>
            </h2>
            <p className="mt-5 max-w-[560px] text-[16px] leading-relaxed text-[#1d1a16]/70">{STORY_COPY.body}</p>

            <blockquote className="mt-10 border-l-4 border-clay pl-6">
              <p className="text-[clamp(1.2rem,2vw,1.55rem)] font-semibold leading-snug tracking-[-0.02em] text-[#1d1a16]">
                &ldquo;{STORY_COPY.quote}&rdquo;
              </p>
              <footer className="mt-6 flex items-center gap-3">
                <Image
                  src={STORY_COPY.author.image}
                  alt={STORY_COPY.author.name}
                  width={48}
                  height={48}
                  className="h-12 w-12 rounded-full object-cover ring-4 ring-white"
                />
                <div>
                  <p className="font-secondary text-[15px] font-semibold text-[#1d1a16]">{STORY_COPY.author.name}</p>
                  <p className="font-secondary text-[13px] text-[#1d1a16]/60">{STORY_COPY.author.title}</p>
                </div>
              </footer>
            </blockquote>
          </div>

          <div className="flex flex-col rounded-[28px] bg-white p-6 shadow-[0_24px_60px_rgba(30,60,30,0.10)] md:p-8">
            <div className="flex items-center gap-3">
              <Image
                src={STORY_COPY.school.logo}
                alt={`${STORY_COPY.school.name} logo`}
                width={44}
                height={44}
                className="h-11 w-11 rounded-xl object-cover"
              />
              <div>
                <p className="font-secondary text-[15px] font-bold text-[#1d1a16]">{STORY_COPY.school.name}</p>
                <p className="font-secondary text-[12px] text-[#1d1a16]/50">{STORY_COPY.school.url}</p>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-3 gap-2">
              {STORY_COPY.stats.map((stat) => (
                <div key={stat.label} className="rounded-2xl bg-[#F4F1EC] px-2 py-4 text-center">
                  <div className="font-secondary whitespace-nowrap text-[1.6rem] font-bold leading-none tracking-[-0.03em] text-[#1d1a16]">
                    {stat.number}
                  </div>
                  <div className="font-secondary mt-1.5 text-[11px] leading-snug text-[#1d1a16]/60">{stat.label}</div>
                </div>
              ))}
            </div>
            <p className="font-secondary mt-7 text-[11px] font-semibold uppercase tracking-widest text-[#1d1a16]/40">
              {STORY_COPY.insideLabel}
            </p>
            <ul className="mt-1">
              {STORY_COPY.sections.map((section) => (
                <li key={section} className="flex items-center justify-between border-b border-black/5 py-3 last:border-0">
                  <span className="font-secondary text-[14px] text-[#1d1a16]/75">{section}</span>
                  <ArrowRight size={14} className="text-[#1d1a16]/30" aria-hidden />
                </li>
              ))}
            </ul>
            <Link href={STORY_COPY.href} className={`${DARK_PILL} mt-6 justify-center lg:mt-auto`}>
              {STORY_COPY.cta}
              <ArrowRight size={16} aria-hidden />
            </Link>
          </div>
        </div>
      </FadeInView>
    </section>
  );
}
