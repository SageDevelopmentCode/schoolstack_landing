import Image from "next/image";

const STRIP_CSS = `
@keyframes demo-site-strip { from { transform: translateX(0); } to { transform: translateX(-50%); } }
.demo-site-strip { animation: demo-site-strip 48s linear infinite; }
.demo-site-strip:hover { animation-play-state: paused; }
@media (prefers-reduced-motion: reduce) { .demo-site-strip { animation: none; } }
`;

const ROTATIONS = ["-rotate-2", "rotate-1", "-rotate-1", "rotate-2"] as const;

/** Slow-scrolling row of tilted photos from `stripImages`. */
export default function SitePhotoStrip({ images }: { images: string[] }) {
  if (images.length === 0) return null;
  const doubled = [...images, ...images];

  return (
    <section className="overflow-hidden bg-white py-16" aria-label="More photos">
      <style>{STRIP_CSS}</style>
      <div className="demo-site-strip flex w-max items-center gap-5 px-3">
        {doubled.map((src, i) => (
          <div
            key={`${src}-${i}`}
            className={`relative h-44 w-60 shrink-0 overflow-hidden rounded-[24px] border-[5px] border-white shadow-[var(--demo-shadow-card)] @3xl/site:h-56 @3xl/site:w-80 ${ROTATIONS[i % ROTATIONS.length]}`}
          >
            <Image src={src} fill sizes="320px" className="object-cover" alt="" />
          </div>
        ))}
      </div>
    </section>
  );
}
