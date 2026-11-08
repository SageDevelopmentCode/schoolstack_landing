import { HOME_FAQ } from "@/lib/faq";
import { BOLD_HEADING } from "./bright-styles";

export default function BrightFaqSection() {
  return (
    <section id="faq" aria-labelledby="faq-heading" className="bg-white py-24">
      <div className="mx-auto grid max-w-[1180px] gap-12 px-6 lg:grid-cols-[380px_1fr] lg:px-12">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="font-secondary text-[13px] font-semibold uppercase tracking-widest text-clay">FAQ</p>
          <h2
            id="faq-heading"
            className={`mt-3 text-[clamp(2rem,3.6vw,2.9rem)] ${BOLD_HEADING}`}
          >
            Questions from microschool founders
          </h2>
          <p className="mt-4 text-[17px] leading-relaxed text-text-muted">
            Answers for school owners and administrators evaluating software for enrollment, billing, and daily
            operations.
          </p>
        </div>

        <div className="flex flex-col divide-y divide-black/10 border-y border-black/10">
          {HOME_FAQ.map((faq) => (
            <details key={faq.question} className="group py-5">
              <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                <span className="flex items-start justify-between gap-6">
                  <h3 className="font-secondary! text-[17px] font-semibold! leading-snug! tracking-tight! text-[#1d1a16]">
                    {faq.question}
                  </h3>
                  <span
                    aria-hidden="true"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F4F1EC] text-lg text-[#1d1a16] transition-transform duration-200 group-open:rotate-45"
                  >
                    +
                  </span>
                </span>
              </summary>
              <p className="mt-3 pr-12 text-[16px] leading-relaxed text-text-muted">{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
