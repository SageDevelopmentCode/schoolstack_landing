const MARQUEE_CSS = `
@keyframes site-garden-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
.site-garden-marquee-row { animation: site-garden-marquee 50s linear infinite; }
.site-garden-marquee:hover .site-garden-marquee-row { animation-play-state: paused; }
@media (prefers-reduced-motion: reduce) {
  .site-garden-marquee-row { animation: none; }
}
`;

/** A strip of washi tape that runs across the page, slightly tilted. */
export default function SiteMarquee({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  const doubled = [...items, ...items];

  return (
    <section className="site-garden-marquee overflow-hidden py-10 @3xl/site:py-14" aria-label="Highlights">
      <style>{MARQUEE_CSS}</style>
      <ul className="sr-only">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <div
        className="-mx-6 border-y-2 border-[var(--sf-ink)] bg-[var(--sf-butter)] py-3.5 shadow-[0_5px_0_0_var(--sf-ink)]"
        style={{ rotate: "-1.4deg" }}
        aria-hidden="true"
      >
        <div className="site-garden-marquee-row flex w-max items-center">
          {doubled.map((item, i) => (
            <span
              key={`${item}-${i}`}
              className="sf-display inline-flex shrink-0 items-center gap-5 whitespace-nowrap pr-5 text-[clamp(1.25rem,2.2cqw,1.8rem)] leading-none text-[var(--sf-ink)]"
            >
              {item}
              <span className="text-[var(--sf-clay)]">✿</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
