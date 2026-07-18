import { HOME_FAQ } from "@/lib/faq";

export default function HomeFaqSection() {
  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="bg-surface py-24"
    >
      <div className="max-w-[760px] mx-auto px-6 lg:px-16">
        <p className="text-[13px] font-medium uppercase tracking-widest text-text-muted mb-3">
          FAQ
        </p>
        <h2
          id="faq-heading"
          className="font-display text-[clamp(1.9rem,3.5vw,2.75rem)] leading-[1.05] text-text"
        >
          Questions from microschool founders
        </h2>
        <p className="text-[17px] text-text-muted leading-relaxed mt-4">
          Answers for school owners and administrators evaluating software for
          enrollment, billing, and daily operations.
        </p>

        <div className="mt-10 flex flex-col gap-3">
          {HOME_FAQ.map((faq) => (
            <details
              key={faq.question}
              className="group rounded-2xl border border-border bg-bg px-5 py-4 open:pb-5"
            >
              <summary className="cursor-pointer list-none font-display text-[17px] font-medium text-text leading-snug [&::-webkit-details-marker]:hidden">
                <span className="flex items-start justify-between gap-4">
                  <h3 className="text-[17px] font-medium leading-snug">
                    {faq.question}
                  </h3>
                  <span
                    aria-hidden="true"
                    className="mt-0.5 shrink-0 text-text-faint transition-transform duration-200 group-open:rotate-45"
                  >
                    +
                  </span>
                </span>
              </summary>
              <p className="text-[16px] text-text-muted leading-relaxed mt-3 pr-8">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
