"use client";

import Image from "next/image";
import { FadeInView } from "@/components/ui/FadeInView";
import { MUDKITCHEN_MARKETING_STORY_THEME } from "@/lib/marketing/mudkitchen-story-theme";

const theme = MUDKITCHEN_MARKETING_STORY_THEME;

const BENTO = [
  {
    title: "Messages & updates",
    body: "Stay in sync with teachers and admins without digging through email.",
    src: "/images/illustrations/Letters.webp",
    width: 200,
    height: 200,
  },
  {
    title: "Enrollment journey",
    body: "See application and checklist progress for your whole family.",
    src: "/images/illustrations/FolderWithLeaf.webp",
    width: 200,
    height: 200,
  },
  {
    title: "Tuition & billing",
    body: "Pay on time with clear balances and payment history.",
    src: "/images/illustrations/Tray.webp",
    width: 200,
    height: 200,
  },
  {
    title: "Forms & attendance",
    body: "Complete school forms and follow attendance from one place.",
    src: "/images/illustrations/Plant.webp",
    width: 200,
    height: 200,
  },
] as const;

const POLAROIDS = [
  {
    src: "/images/stock/ImageOne.webp",
    alt: "Children learning together in a classroom",
    rotate: -4,
    offsetY: 8,
  },
  {
    src: "/images/stock/ImageEleven.webp",
    alt: "Microschool community gathering",
    rotate: 3,
    offsetY: 0,
  },
  {
    src: "/images/stock/Homeschool2.webp",
    alt: "Hands-on learning at a small school",
    rotate: -2,
    offsetY: 12,
  },
] as const;

export default function DownloadInsideSection() {
  return (
    <section className="border-t border-black/[0.06] bg-[#F0E6D8]/40 py-20 sm:py-24">
      <div className="mx-auto max-w-[1100px] px-6 lg:px-8">
        <FadeInView>
          <div className="text-center">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-text-faint font-secondary">
              What&apos;s inside
            </p>
            <h2 className="mt-2 font-display text-[clamp(1.75rem,3.5vw,2.5rem)] leading-tight text-accent">
              Built for real{" "}
              <em className="text-clay not-italic">school days.</em>
            </h2>
            <p className="mx-auto mt-3 max-w-[540px] text-[15px] leading-relaxed text-text-muted font-secondary">
              The same calm tools families use on the web—messages, tuition,
              enrollment, and more—in a pocket-sized app.
            </p>
          </div>
        </FadeInView>

        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          {BENTO.map((card, index) => (
            <FadeInView key={card.title} delay={index * 0.06}>
              <article
                className="group flex h-full gap-4 rounded-[22px] border border-black/[0.06] bg-white/90 p-5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition duration-300 motion-safe:hover:scale-[1.02] motion-safe:hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] sm:p-6"
                style={{ boxShadow: theme.shadowCard }}
              >
                <div className="shrink-0">
                  <Image
                    src={card.src}
                    alt=""
                    aria-hidden
                    width={card.width}
                    height={card.height}
                    className="h-20 w-20 object-contain opacity-90 sm:h-24 sm:w-24"
                    loading="lazy"
                  />
                </div>
                <div className="min-w-0">
                  <h3 className="font-display text-lg text-accent">{card.title}</h3>
                  <p className="mt-1.5 text-[14px] leading-relaxed text-text-muted font-secondary">
                    {card.body}
                  </p>
                </div>
              </article>
            </FadeInView>
          ))}
        </div>

        <FadeInView delay={0.15} className="mt-16">
          <div className="flex flex-wrap items-end justify-center gap-6 sm:gap-8">
            {POLAROIDS.map((frame) => (
              <figure
                key={frame.src}
                className="w-[min(100%,220px)] shrink-0 rounded-sm bg-white p-2 pb-8 shadow-[0_12px_40px_rgba(43,36,29,0.12)] transition motion-safe:hover:scale-[1.02] motion-safe:hover:rotate-0"
                style={{
                  transform: `rotate(${frame.rotate}deg) translateY(${frame.offsetY}px)`,
                }}
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-[#E8DFD3]">
                  <Image
                    src={frame.src}
                    alt={frame.alt}
                    fill
                    className="object-cover"
                    sizes="220px"
                    loading="lazy"
                  />
                </div>
              </figure>
            ))}
          </div>
        </FadeInView>
      </div>
    </section>
  );
}
