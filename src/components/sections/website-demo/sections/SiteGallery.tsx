"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { DEMO_CONTAINER, STORY_EASE } from "../bright-demo-theme";

const TILE_CLASSES = [
  "@3xl/site:col-span-2 @3xl/site:row-span-2",
  "@3xl/site:col-span-2",
  "",
  "hidden @3xl/site:block",
] as const;

/** Bento photo gallery from `mosaicImages`. */
export default function SiteGallery({ images }: { images: string[] }) {
  const tiles = images.slice(0, 4);
  if (tiles.length === 0) return null;

  return (
    <section className="bg-white pb-20 @3xl/site:pb-28" aria-label="School life photos">
      <div
        className={`${DEMO_CONTAINER} grid auto-rows-[180px] grid-cols-2 gap-3 @3xl/site:auto-rows-[220px] @3xl/site:grid-cols-4`}
      >
        {tiles.map((src, i) => (
          <motion.div
            key={`${src}-${i}`}
            className={`group relative overflow-hidden rounded-[28px] ring-1 ring-black/[0.06] ${i === 0 ? "col-span-2 row-span-2" : ""} ${TILE_CLASSES[i]}`}
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: i * 0.08, ease: STORY_EASE }}
          >
            <Image
              src={src}
              fill
              sizes="(min-width: 1024px) 600px, 50vw"
              className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              alt=""
            />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
