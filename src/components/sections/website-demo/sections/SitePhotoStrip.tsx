import Image from "next/image";
import { Tape } from "@/components/garden/ui";
import { SITE_TAPES } from "../site-garden-theme";

const STRIP_CSS = `
@keyframes site-garden-strip { from { transform: translateX(0); } to { transform: translateX(-50%); } }
.site-garden-strip { animation: site-garden-strip 56s linear infinite; }
.site-garden-strip:hover { animation-play-state: paused; }
@media (prefers-reduced-motion: reduce) { .site-garden-strip { animation: none; } }
`;

const TILTS = ["-3deg", "2deg", "-1.5deg", "3deg"] as const;

/** A slow washing line of taped polaroids from `stripImages` (decorative). */
export default function SitePhotoStrip({ images }: { images: string[] }) {
  if (images.length === 0) return null;
  const doubled = [...images, ...images];

  return (
    <section className="overflow-hidden py-16" aria-hidden="true">
      <style>{STRIP_CSS}</style>
      <div className="site-garden-strip flex w-max items-center gap-7 px-4 py-4">
        {doubled.map((src, i) => (
          <div
            key={`${src}-${i}`}
            className="sf-polaroid relative w-56 shrink-0 @3xl/site:w-72"
            style={{ rotate: TILTS[i % TILTS.length] }}
          >
            <Tape color={SITE_TAPES[i % SITE_TAPES.length]} className="-top-3 left-1/2 h-5 w-14 -translate-x-1/2 -rotate-2" />
            <div className="relative aspect-[4/3] overflow-hidden rounded-[3px]">
              <Image src={src} fill sizes="288px" className="object-cover" alt="" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
