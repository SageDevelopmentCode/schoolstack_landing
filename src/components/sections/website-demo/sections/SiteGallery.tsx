"use client";

import { SITE_CONTAINER } from "../site-garden-theme";
import { SitePolaroid, SiteReveal } from "../garden/SiteKit";

const TILTS = [-3, 2.5, -1.5, 3.5] as const;
const ASPECTS = ["aspect-[4/3]", "aspect-[4/5]", "aspect-square", "aspect-[4/5]"] as const;

/** A little wall of taped polaroids from `mosaicImages`. */
export default function SiteGallery({ images }: { images: string[] }) {
  const tiles = images.slice(0, 4);
  if (tiles.length === 0) return null;

  return (
    <section className="bg-[var(--sf-paper)] pb-24 @3xl/site:pb-32" aria-label="School life photos">
      <ul className={`${SITE_CONTAINER} grid grid-cols-2 items-center gap-x-5 gap-y-8 @3xl/site:grid-cols-4 @3xl/site:gap-x-7`}>
        {tiles.map((src, i) => (
          <SiteReveal key={`${src}-${i}`} as="li" delay={i * 0.08} className={i === 3 ? "hidden @3xl/site:block" : ""}>
            <SitePolaroid
              src={src}
              sizes="(min-width: 1024px) 300px, 45vw"
              tilt={TILTS[i]}
              tape={i}
              imageClassName={ASPECTS[i]}
            />
          </SiteReveal>
        ))}
      </ul>
    </section>
  );
}
