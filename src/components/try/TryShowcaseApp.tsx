import { STICKERS_BY_DEMO } from "@/components/home/FloatingStickers";
import PhoneCard from "@/components/home-garden/PhoneCard";
import StickerNote from "@/components/home-garden/StickerNote";
import { DOWNLOAD_APP_SLIDES } from "@/lib/marketing/download-app-slides";
import { TRY_APP_COPY } from "@/components/try/try-copy";

/** Right /try panel: a real app screen with two sample notifications. */
export default function TryShowcaseApp() {
  return (
    <section aria-labelledby="try-app-heading" className="relative mx-auto w-full max-w-[18rem]">
      <h2 id="try-app-heading" className="sr-only">
        {TRY_APP_COPY.heading}
      </h2>
      <p aria-hidden="true" className="sf-hand mb-4 text-center text-xl text-[var(--sf-forest)]">
        a peek inside ↓
      </p>
      <div className="relative px-6">
        <PhoneCard slide={DOWNLOAD_APP_SLIDES[0]} tilt={2} sizes="240px" />
        <div aria-hidden="true" className="pointer-events-none absolute -left-6 top-[22%] hidden w-max sm:block">
          <StickerNote sticker={STICKERS_BY_DEMO.parent[0]} tint="bg-[var(--sf-mint)]" tilt={-4} size="sm" />
        </div>
        <div aria-hidden="true" className="pointer-events-none absolute -right-8 top-[58%] hidden w-max sm:block">
          <StickerNote sticker={STICKERS_BY_DEMO.admin[0]} tint="bg-[var(--sf-butter)]" tilt={3} size="sm" />
        </div>
      </div>
    </section>
  );
}
