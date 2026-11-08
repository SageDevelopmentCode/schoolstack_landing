"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, ExternalLink, Globe, MapPin, Users } from "lucide-react";
import { FadeInView } from "@/components/ui/FadeInView";
import { BOOK_DEMO_HASH_HREF } from "@/lib/marketing/book-demo";
import { ACCENT_HIGHLIGHT, BOLD_HEADING, DARK_PILL, OUTLINE_PILL } from "@/components/home/bright-styles";

const ease = [0.16, 1, 0.3, 1] as const;

const PROOF_ITEMS = [
  { icon: MapPin, text: "Real private microschool in Round Rock, Texas." },
  { icon: Users, text: "Ages 4–11, with live programs and tuition published online." },
  { icon: Globe, text: "Website, enrollment, and operations supporting an active launch." },
];

export default function SagefieldHero() {
  return (
    <section className="overflow-hidden bg-white px-3 pb-8 pt-28 md:pt-32 lg:px-6">
      <div className="mx-auto max-w-[1400px] rounded-[40px] bg-[#E9F2E4] px-6 py-12 md:px-10 lg:px-14 lg:py-16">
        <FadeInView>
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center">
              <Image
                src="/images/SageFieldLogo.png"
                alt="Sage Field logo"
                width={32}
                height={32}
                className="h-full w-full object-contain"
              />
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-pill bg-white px-3.5 py-1.5 font-secondary text-[11px] font-semibold uppercase tracking-widest text-clay">
              Customer Story
            </span>
            <span className="font-secondary text-[11px] uppercase tracking-widest text-[#1d1a16]/50">
              Sage Field · Round Rock, TX
            </span>
            <a
              href="https://www.sagefield.co"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 font-secondary text-[11px] text-clay hover:underline"
            >
              <ExternalLink size={10} />
              sagefield.co
            </a>
          </div>
        </FadeInView>

        <div className="max-w-[780px]">
          <motion.h1
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease }}
            className={`text-[clamp(2rem,4.5vw,3.4rem)] ${BOLD_HEADING}`}
          >
            How Sage Field launched and grew from{" "}
            <span className={ACCENT_HIGHLIGHT}>0 to 35 students</span> in under 3 months.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease, delay: 0.12 }}
            className="mt-6 max-w-[620px] font-secondary text-[17px] leading-relaxed text-[#1d1a16]/70"
          >
            Sage Field is an outdoor-focused private microschool in Round Rock, Texas. We helped power
            the launch with the website, enrollment experience, tuition setup, staff workflows, family
            communication, and back-office operations needed to run a real school from day one.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease, delay: 0.22 }}
            className="mt-9 flex flex-wrap items-center gap-3"
          >
            <a href={BOOK_DEMO_HASH_HREF} className={DARK_PILL}>
              Book a demo
              <ArrowRight size={14} aria-hidden />
            </a>
            <a
              href="#outcomes"
              className="font-secondary text-sm font-semibold text-clay underline underline-offset-2 transition-colors hover:text-[#1d1a16]"
            >
              See what&apos;s inside the platform
            </a>
            <a
              href="#live-site"
              className={`${OUTLINE_PILL} h-11 px-5 text-sm`}
            >
              View their live site
            </a>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease, delay: 0.34 }}
          className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-3"
        >
          {PROOF_ITEMS.map(({ icon: Icon, text }) => (
            <div
              key={text}
              className="flex items-start gap-3 rounded-[20px] border border-black/8 bg-white px-5 py-4"
            >
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#F4F1EC]">
                <Icon size={15} className="text-clay" />
              </div>
              <p className="font-secondary text-[13.5px] leading-snug text-[#1d1a16]/70">{text}</p>
            </div>
          ))}
        </motion.div>

        <FadeInView delay={0.4}>
          <div className="mt-14 grid grid-cols-1 gap-3 sm:grid-cols-[2fr_1fr]">
            <div className="h-[320px] overflow-hidden rounded-[24px] lg:h-[420px]">
              <Image
                src="/images/sagefield/entrance.jpg"
                alt="Sage Field school entrance with flowers"
                width={900}
                height={600}
                className="h-full w-full object-cover"
                priority
              />
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex-1 overflow-hidden rounded-[24px]">
                <Image
                  src="/images/sagefield/garden.jpg"
                  alt="Sage Field outdoor garden area"
                  width={500}
                  height={400}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex-1 overflow-hidden rounded-[24px]">
                <Image
                  src="/images/sagefield/kids-running.jpg"
                  alt="Students at Sage Field"
                  width={500}
                  height={400}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>
        </FadeInView>
      </div>
    </section>
  );
}
