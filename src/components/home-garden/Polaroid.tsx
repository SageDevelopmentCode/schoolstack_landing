import Image from "next/image";
import { Tape } from "@/components/garden/ui";

/** Taped polaroid photo. Straightens and lifts on hover. */
export default function Polaroid({
  src,
  alt,
  tilt = 0,
  tape = "var(--sf-butter)",
  caption,
  aspect = "aspect-[4/5]",
  sizes = "(max-width: 1024px) 220px, 18vw",
  className = "",
  preload = false,
  hover = true,
}: {
  src: string;
  alt: string;
  tilt?: number;
  tape?: string | null;
  caption?: string;
  aspect?: string;
  sizes?: string;
  className?: string;
  preload?: boolean;
  hover?: boolean;
}) {
  return (
    <figure
      className={`sf-polaroid relative ${
        hover ? "transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:!rotate-0 hover:-translate-y-1 hover:scale-[1.03]" : ""
      } ${className}`}
      style={{ rotate: `${tilt}deg` }}
    >
      {tape ? <Tape color={tape} className="-top-3 left-1/2 -translate-x-1/2 -rotate-3" /> : null}
      <div className={`relative ${aspect} overflow-hidden rounded-[3px] bg-[var(--sf-mint)]`}>
        <Image src={src} alt={alt} fill className="object-cover" sizes={sizes} preload={preload} />
      </div>
      {caption ? <figcaption className="sf-hand mt-2 text-center text-[1.05rem] leading-tight text-[var(--sf-ink)]">{caption}</figcaption> : null}
    </figure>
  );
}
