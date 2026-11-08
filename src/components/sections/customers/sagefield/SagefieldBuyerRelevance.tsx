import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { FadeInView } from "@/components/ui/FadeInView";
import { BOOK_DEMO_HASH_HREF } from "@/lib/marketing/book-demo";
import { ACCENT_HIGHLIGHT, BOLD_HEADING } from "@/components/home/bright-styles";

const TAKEAWAYS = [
  {
    number: "01",
    headline: "Launch with a real public-facing school presence.",
    body: "Not just an internal system — a website, program pages, tuition, team, and enrollment pathway that families can trust before they ever walk through the door.",
  },
  {
    number: "02",
    headline: "Support tuition, enrollment, and communication the way families expect.",
    body: "Parents can see their account, receive updates, and stay informed without chasing emails. Enrollment is a pathway, not a form.",
  },
  {
    number: "03",
    headline: "Give teachers and administrators a shared operating system.",
    body: "No more fragmented tools. Staff have one workspace. Admins have one dashboard. Everyone sees the same school.",
  },
  {
    number: "04",
    headline: "Start lean and grow without rebuilding your stack.",
    body: "Sage Field launched from zero and scaled to 35 students without switching platforms. The system grew with the school.",
  },
];

export default function SagefieldBuyerRelevance() {
  return (
    <section className="bg-white px-3 py-12 lg:px-6">
      <div className="mx-auto max-w-[1400px] px-3 md:px-6 lg:px-10">
        <div className="mb-14 max-w-[620px]">
          <FadeInView>
            <p className="mb-5 font-secondary text-[13px] font-semibold uppercase tracking-widest text-clay">
              What prospects should notice
            </p>
          </FadeInView>
          <FadeInView delay={0.06}>
            <h2 className={`text-[clamp(1.9rem,3.5vw,2.6rem)] ${BOLD_HEADING}`}>
              What this means <span className={ACCENT_HIGHLIGHT}>for your school.</span>
            </h2>
          </FadeInView>
          <FadeInView delay={0.12}>
            <p className="mt-4 font-secondary text-[16px] leading-relaxed text-[#1d1a16]/70">
              Sage Field&apos;s story isn&apos;t just about one school. It&apos;s a model for what&apos;s
              possible when a microschool launches with operational infrastructure that actually matches
              how the school runs.
            </p>
          </FadeInView>
        </div>

        <div className="mb-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {TAKEAWAYS.map(({ number, headline, body }, i) => (
            <FadeInView key={number} delay={0.06 + i * 0.08}>
              <div className="h-full rounded-[28px] border border-black/8 bg-white p-7">
                <span className="font-mono text-[11px] font-semibold text-[#1d1a16]/40">{number}</span>
                <h3 className="font-secondary! mt-3 mb-3 text-[1.05rem] font-bold! leading-snug tracking-[-0.02em]! text-[#1d1a16]">
                  {headline}
                </h3>
                <p className="font-secondary text-[14px] leading-relaxed text-[#1d1a16]/70">{body}</p>
              </div>
            </FadeInView>
          ))}
        </div>

        <FadeInView delay={0.14}>
          <div className="rounded-[40px] bg-[#1d1a16] px-8 py-10 text-center md:px-14">
            <h2 className="font-secondary! text-[clamp(1.7rem,3.2vw,2.4rem)] font-bold! leading-[1.06]! tracking-[-0.04em]! text-white">
              Ready to launch like <span className="text-clay">Sage Field?</span>
            </h2>
            <p className="mx-auto mt-4 max-w-[480px] font-secondary text-[16px] leading-relaxed text-white/65">
              See how the platform can support your microschool from website to daily operations.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a
                href={BOOK_DEMO_HASH_HREF}
                className="font-secondary inline-flex h-12 items-center gap-2 rounded-pill bg-white px-8 text-sm font-semibold text-[#1d1a16] transition-colors hover:bg-[#F8DDCF]"
              >
                Book a demo
                <ArrowRight size={14} aria-hidden />
              </a>
              <Link
                href="/#product"
                className="font-secondary text-sm font-semibold text-white/70 transition-colors hover:text-white"
              >
                Explore the platform
              </Link>
            </div>
            <p className="mt-5 font-secondary text-[13px] text-white/45">
              No commitment. No sales pressure. Just a conversation.
            </p>
          </div>
        </FadeInView>
      </div>
    </section>
  );
}
