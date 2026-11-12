import Image from "next/image";
import type { DownloadAppSlide } from "@/lib/marketing/download-app-slides";
import { Tape } from "@/components/garden/ui";

/** A MudKitchen app-store slide, taped up like a polaroid with its caption. */
export default function PhoneCard({
  slide,
  tilt = 0,
  tape = "var(--sf-mint)",
  className = "",
  sizes = "240px",
  showCaption = true,
}: {
  slide: DownloadAppSlide;
  tilt?: number;
  tape?: string | null;
  className?: string;
  sizes?: string;
  showCaption?: boolean;
}) {
  return (
    <figure
      className={`relative rounded-[26px] bg-white p-2 shadow-[0_1px_2px_rgba(43,36,29,0.06),0_24px_50px_-24px_rgba(43,36,29,0.5)] transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:!rotate-0 hover:-translate-y-1 ${className}`}
      style={{ rotate: `${tilt}deg` }}
    >
      {tape ? <Tape color={tape} className="-top-3 left-1/2 -translate-x-1/2 rotate-2" /> : null}
      <div className="relative aspect-[960/2078] overflow-hidden rounded-[20px]">
        <Image src={slide.src} alt={slide.alt} fill className="object-cover" sizes={sizes} />
      </div>
      {showCaption ? (
        <figcaption className="px-2 pb-1 pt-3 text-center text-sm font-bold leading-snug text-[var(--sf-soft)]">{slide.caption}</figcaption>
      ) : null}
    </figure>
  );
}
