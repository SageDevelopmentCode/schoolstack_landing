"use client";

import Image from "next/image";
import { Reveal } from "@/components/garden/motion";
import { Pill } from "@/components/garden/ui";
import Polaroid from "@/components/home-garden/Polaroid";
import { SAGEFIELD_PHOTOS, TAPES } from "@/components/home-garden/assets";
import { GALLERY_COPY, SAGEFIELD_LOGO_SRC, SAGEFIELD_SITE_URL } from "./sagefield-copy";

const GALLERY = [SAGEFIELD_PHOTOS.classroom, SAGEFIELD_PHOTOS.primary, SAGEFIELD_PHOTOS.garden, SAGEFIELD_PHOTOS.mudKitchen];
const TILTS = [-3, 2.5, -1.5, 3];

/** Campus photos pinned to the wall as polaroids. */
export default function SagefieldGardenGallery() {
  return (
    <section aria-label={GALLERY_COPY.eyebrow} className="relative bg-[var(--sf-cream)] py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
        <Pill tint="butter">📸 {GALLERY_COPY.eyebrow}</Pill>
        <Reveal className="mt-10 grid grid-cols-2 gap-6 sm:gap-8 lg:grid-cols-4" y={50} stagger={0.1}>
          {GALLERY.map((photo, i) => (
            <Polaroid
              key={photo.src}
              src={photo.src}
              alt={photo.alt}
              tilt={TILTS[i]}
              tape={TAPES[i % TAPES.length]}
              sizes="(max-width: 1024px) 45vw, 280px"
              className={i % 2 === 1 ? "lg:mt-10" : ""}
            />
          ))}
        </Reveal>
        <div className="mt-10 flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white p-1 ring-2 ring-[var(--sf-ink)]">
            <Image src={SAGEFIELD_LOGO_SRC} alt="" width={20} height={20} className="h-full w-full object-contain" />
          </span>
          <a
            href={SAGEFIELD_SITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded text-sm font-extrabold text-[var(--sf-clay-deep)] underline decoration-[var(--sf-moss)] decoration-2 underline-offset-4 hover:decoration-[var(--sf-clay)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--sf-clay)]/30"
          >
            {GALLERY_COPY.site}
          </a>
          <span className="text-sm font-bold text-[var(--sf-soft)]">· {GALLERY_COPY.location}</span>
        </div>
      </div>
    </section>
  );
}
