import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ExternalLink, MapPin, Users } from "lucide-react";
import { FadeInView } from "@/components/ui/FadeInView";
import { BOOK_DEMO_HREF } from "@/lib/marketing/book-demo";
import { ACCENT_HIGHLIGHT, BOLD_HEADING } from "@/components/home/bright-styles";
import { CUSTOMER_STORIES } from "./customers-data";

export default function CustomersBrightPage() {
  return (
    <>
      <section className="bg-white px-3 pb-12 pt-28 md:pt-32 lg:px-6">
        <div className="mx-auto max-w-[1400px] px-3 md:px-6 lg:px-10">
          <FadeInView>
            <p className="font-secondary text-[13px] font-semibold uppercase tracking-widest text-clay">
              Customer stories
            </p>
          </FadeInView>
          <FadeInView delay={0.08}>
            <h1 className={`mt-5 max-w-[680px] text-[clamp(2rem,4.5vw,3.2rem)] ${BOLD_HEADING}`}>
              Real microschools. <span className={ACCENT_HIGHLIGHT}>Real results.</span>
            </h1>
          </FadeInView>
          <FadeInView delay={0.14}>
            <p className="mt-5 max-w-[520px] text-[16px] leading-relaxed text-[#1d1a16]/70">
              These aren&apos;t case studies about pilots or prototypes. Every story here is a school that
              launched, enrolled students, and runs daily operations on MudKitchen.
            </p>
          </FadeInView>
        </div>
      </section>

      <section className="bg-white px-3 pb-20 lg:px-6">
        <div className="mx-auto max-w-[1400px] px-3 md:px-6 lg:px-10">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {CUSTOMER_STORIES.map((story, i) => (
              <FadeInView key={story.href} delay={i * 0.06}>
                <div className="group relative flex h-full flex-col overflow-hidden rounded-[28px] border border-black/8 bg-[#E9F2E4]/35 transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(30,60,30,0.08)]">
                  <a
                    href={story.href}
                    className="absolute inset-0 z-[1]"
                    aria-label={`Read the ${story.name} story`}
                  />

                  {story.image ? (
                    <div className="h-[220px] overflow-hidden border-b border-black/8">
                      <img src={story.image} alt={story.name} className="h-full w-full object-cover" />
                    </div>
                  ) : (
                    <div className="flex h-[220px] items-center justify-center border-b border-black/8 bg-[#F7F5F2]">
                      <Users size={18} className="text-[#1d1a16]/40" />
                    </div>
                  )}

                  <div className="pointer-events-none flex flex-1 flex-col p-6">
                    <div className="mb-1 flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        {story.logo && (
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center">
                            <Image
                              src={story.logo}
                              alt={`${story.name} logo`}
                              width={32}
                              height={32}
                              className="h-full w-full object-contain"
                            />
                          </div>
                        )}
                        <h2 className="font-secondary! text-[1.15rem] font-bold! leading-snug tracking-[-0.02em]! text-[#1d1a16]">
                          {story.name}
                        </h2>
                      </div>
                      <span className="mt-1 flex shrink-0 items-center gap-1 font-secondary text-[11px] text-[#1d1a16]/50">
                        <MapPin size={10} />
                        {story.location}
                      </span>
                    </div>

                    <div className="mb-1 mt-0.5 flex items-center gap-3">
                      <p className="font-secondary text-[13px] text-[#1d1a16]/60">
                        {story.tagline} · {story.ages}
                      </p>
                      {story.website && (
                        <a
                          href={story.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="pointer-events-auto relative z-[2] flex shrink-0 items-center gap-1 font-secondary text-[11px] text-clay transition-colors duration-150 hover:underline"
                        >
                          <ExternalLink size={10} />
                          Website
                        </a>
                      )}
                    </div>

                    <p className="mt-3 flex-1 font-secondary text-[14px] leading-relaxed text-[#1d1a16]/70">
                      {story.description}
                    </p>

                    <div className="mt-5 flex justify-end border-t border-black/8 pt-4">
                      <span className="flex items-center gap-1 font-secondary text-[12px] font-medium text-[#1d1a16]/50 transition-colors duration-150 group-hover:text-clay">
                        Read the story
                        <ArrowRight size={11} />
                      </span>
                    </div>
                  </div>
                </div>
              </FadeInView>
            ))}

            <FadeInView delay={0.06}>
              <div className="flex h-full min-h-[340px] flex-col items-center justify-center rounded-[28px] border border-dashed border-black/15 bg-[#F7F5F2] p-8 text-center">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-2xl border border-black/10 bg-white">
                  <Users size={18} className="text-[#1d1a16]/40" />
                </div>
                <p className="font-secondary text-[14px] font-medium text-[#1d1a16]/70">
                  More stories coming soon
                </p>
                <p className="mt-1.5 max-w-[180px] font-secondary text-[12px] leading-relaxed text-[#1d1a16]/50">
                  New customer stories added as schools go live.
                </p>
              </div>
            </FadeInView>
          </div>

          <FadeInView delay={0.12}>
            <div className="mt-16 rounded-[40px] bg-[#1d1a16] px-8 py-12 text-center md:px-14">
              <h2 className="font-secondary! text-[clamp(1.6rem,3vw,2.2rem)] font-bold! leading-[1.06]! tracking-[-0.04em]! text-white">
                Want your school to be next?
              </h2>
              <p className="mx-auto mt-3 max-w-[440px] text-[16px] leading-relaxed text-white/65">
                Book a demo and see how MudKitchen can support your launch from website to daily
                operations.
              </p>
              <Link
                href={BOOK_DEMO_HREF}
                className="font-secondary mt-7 inline-flex h-12 items-center gap-2 rounded-pill bg-white px-8 text-sm font-semibold text-[#1d1a16] transition-colors hover:bg-[#F8DDCF]"
              >
                Book a demo
                <ArrowRight size={14} aria-hidden />
              </Link>
            </div>
          </FadeInView>
        </div>
      </section>
    </>
  );
}
