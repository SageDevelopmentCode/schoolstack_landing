import { DEMO_TINTS } from "../bright-demo-theme";

const MARQUEE_CSS = `
@keyframes demo-site-marquee-l { from { transform: translateX(0); } to { transform: translateX(-50%); } }
@keyframes demo-site-marquee-r { from { transform: translateX(-50%); } to { transform: translateX(0); } }
.demo-site-marquee-l { animation: demo-site-marquee-l 46s linear infinite; }
.demo-site-marquee-r { animation: demo-site-marquee-r 52s linear infinite; }
.demo-site-marquee:hover .demo-site-marquee-l,
.demo-site-marquee:hover .demo-site-marquee-r { animation-play-state: paused; }
@media (prefers-reduced-motion: reduce) {
  .demo-site-marquee-l, .demo-site-marquee-r { animation: none; }
}
`;

function Row({ items, direction, offset }: { items: string[]; direction: "l" | "r"; offset: number }) {
  const doubled = [...items, ...items];
  return (
    <div className={`demo-site-marquee-${direction} flex w-max gap-3`}>
      {doubled.map((item, i) => (
        <span
          key={`${item}-${i}`}
          className="font-secondary inline-flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-pill px-5 py-3 text-[15px] font-semibold text-[var(--demo-ink)]"
          style={{ backgroundColor: DEMO_TINTS[(i + offset) % DEMO_TINTS.length] }}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--demo-primary)]" aria-hidden />
          {item}
        </span>
      ))}
    </div>
  );
}

/** Two marquee rows moving in opposite directions with faded edges. */
export default function SiteMarquee({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  const half = Math.ceil(items.length / 2);
  const second = items.length > 3 ? [...items.slice(half), ...items.slice(0, half)] : [...items].reverse();

  return (
    <section className="demo-site-marquee overflow-hidden bg-white pb-20 @3xl/site:pb-24" aria-label="Highlights">
      <style>{MARQUEE_CSS}</style>
      <div className="flex flex-col gap-3 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
        <Row items={items} direction="l" offset={0} />
        <Row items={second} direction="r" offset={2} />
      </div>
    </section>
  );
}
