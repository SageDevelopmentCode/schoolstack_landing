import { ArrowRight, Check } from "lucide-react";
import { FadeInView } from "@/components/ui/FadeInView";
import { BOOK_DEMO_HASH_HREF } from "@/lib/marketing/book-demo";
import { CUSTOM_COPY, PRICING_COPY } from "./home-copy";
import { ACCENT_HIGHLIGHT, BOLD_HEADING, DARK_PILL } from "./bright-styles";

function MarqueeRow({ tags, reverse, duration }: { tags: readonly string[]; reverse?: boolean; duration: string }) {
  return (
    <div className="overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]">
      <div
        className="flex w-max gap-3"
        style={{ animation: `${reverse ? "home2-marquee-right" : "home2-marquee-left"} ${duration} linear infinite` }}
      >
        {[...tags, ...tags].map((tag, i) => (
          <span
            key={`${tag}-${i}`}
            aria-hidden={i >= tags.length}
            className="font-secondary shrink-0 whitespace-nowrap rounded-pill bg-white px-5 py-2.5 text-[15px] font-medium text-[#1d1a16] shadow-[0_4px_14px_rgba(0,0,0,0.05)] ring-1 ring-black/5"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function BrightPricing() {
  const half = Math.ceil(CUSTOM_COPY.tags.length / 2);

  return (
    <>
      <section id="pricing" className="bg-white py-24 lg:py-32">
        <div className="mx-auto grid max-w-[1240px] gap-12 px-5 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:px-10">
          <FadeInView>
            <p className="font-secondary text-[13px] font-semibold uppercase tracking-widest text-clay">{PRICING_COPY.eyebrow}</p>
            <h2 className={`mt-4 text-[clamp(2rem,4.4vw,3.5rem)] ${BOLD_HEADING}`}>
              {PRICING_COPY.headlineLead} <span className={ACCENT_HIGHLIGHT}>{PRICING_COPY.headlineAccent}</span>
            </h2>
            <p className="mt-5 max-w-[520px] text-[17px] leading-relaxed text-[#1d1a16]/70">{PRICING_COPY.body}</p>
            <div className="mt-8 max-w-[520px] rounded-[24px] bg-[#F7F5F2] p-6">
              <p className="font-secondary text-[16px] font-semibold text-[#1d1a16]">{PRICING_COPY.customQuestion}</p>
              <p className="mt-1 text-[15px] text-[#1d1a16]/65">{PRICING_COPY.customBody}</p>
              <a
                href={BOOK_DEMO_HASH_HREF}
                className="font-secondary mt-3 inline-flex items-center gap-1.5 text-[15px] font-semibold text-clay hover:underline"
              >
                {PRICING_COPY.customCta}
                <ArrowRight size={14} aria-hidden />
              </a>
            </div>
          </FadeInView>

          <FadeInView delay={0.1}>
            <div className="rounded-[32px] bg-[#1d1a16] p-8 text-white shadow-[0_40px_100px_rgba(0,0,0,0.18)] md:p-10">
              <p className="font-secondary text-[22px] font-bold tracking-[-0.02em]">{PRICING_COPY.planLabel}</p>
              <p className="mt-2 text-[15px] text-white/65">{PRICING_COPY.planBody}</p>
              <ul className="mt-8 grid gap-x-6 gap-y-3.5 border-t border-white/10 pt-8 sm:grid-cols-2">
                {PRICING_COPY.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5">
                    <span className="mt-[2px] flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10" aria-hidden>
                      <Check size={12} className="text-[#F8DDCF]" />
                    </span>
                    <span className="font-secondary text-[14px] leading-snug text-white/85">{feature}</span>
                  </li>
                ))}
              </ul>
              <a
                href={BOOK_DEMO_HASH_HREF}
                className="font-secondary mt-10 flex h-12 items-center justify-center gap-2 rounded-pill bg-white text-[15px] font-semibold text-[#1d1a16] transition-colors hover:bg-[#F8DDCF]"
              >
                {PRICING_COPY.cta}
                <ArrowRight size={16} aria-hidden />
              </a>
              <p className="mt-3 text-center text-[13px] text-white/50">{PRICING_COPY.ctaNote}</p>
            </div>
          </FadeInView>
        </div>
      </section>

      <section id="custom" className="bg-white px-3 pb-6 lg:px-6">
        <style>{`
          @keyframes home2-marquee-left { from { transform: translateX(0); } to { transform: translateX(-50%); } }
          @keyframes home2-marquee-right { from { transform: translateX(-50%); } to { transform: translateX(0); } }
        `}</style>
        <div className="mx-auto max-w-[1400px] overflow-hidden rounded-[40px] bg-[#EAF1FD] py-20 lg:py-24">
          <FadeInView>
            <div className="mx-auto max-w-[760px] px-5 text-center">
              <h2 className={`text-[clamp(2rem,4.2vw,3.3rem)] ${BOLD_HEADING}`}>
                {CUSTOM_COPY.headlineLead} <span className={ACCENT_HIGHLIGHT}>{CUSTOM_COPY.headlineAccent}</span>
              </h2>
              <p className="mx-auto mt-5 max-w-[58ch] text-[17px] leading-relaxed text-[#1d1a16]/70">{CUSTOM_COPY.body}</p>
            </div>
          </FadeInView>
          <div className="mt-12 flex flex-col gap-3">
            <MarqueeRow tags={CUSTOM_COPY.tags.slice(0, half)} duration="46s" />
            <MarqueeRow tags={CUSTOM_COPY.tags.slice(half)} reverse duration="52s" />
          </div>
          <div className="mt-12 flex justify-center">
            <a href={BOOK_DEMO_HASH_HREF} className={DARK_PILL}>
              {CUSTOM_COPY.cta}
              <ArrowRight size={16} aria-hidden />
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
