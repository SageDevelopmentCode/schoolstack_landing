import Image from "next/image";
import Link from "next/link";
import StarRating from "@/components/garden/StarRating";
import { STORY_COPY } from "@/components/home/home-copy";
import { PARENT_QUOTE, TUITION_RATING } from "@/lib/marketing/social-proof";

/**
 * Quiet proof under the /try form: the tuition rating and a parent quote,
 * then Sabrina's founder quote. No card, no tilt (Calm Garden).
 */
export default function TryProofStrip() {
  const { author } = STORY_COPY;
  return (
    <div className="mt-9 px-1">
      <StarRating label={TUITION_RATING.label} srLabel={TUITION_RATING.srLabel} />
      <figure className="mt-3">
        <blockquote className="text-[15px] leading-relaxed text-[var(--sf-soft)]">
          &ldquo;{PARENT_QUOTE.quote}&rdquo;
        </blockquote>
        <figcaption className="mt-1 text-sm font-extrabold text-[var(--sf-ink)]">
          &mdash; {PARENT_QUOTE.attribution}
        </figcaption>
      </figure>

      <figure className="mt-6 border-t-2 border-dashed border-[var(--sf-ink)]/20 pt-6">
        <blockquote className="text-[15px] leading-relaxed text-[var(--sf-soft)]">
          &ldquo;{STORY_COPY.quote}&rdquo;
        </blockquote>
        <figcaption className="mt-3 flex items-center gap-3">
          <Image
            src={author.image}
            alt=""
            width={40}
            height={40}
            sizes="40px"
            className="h-10 w-10 shrink-0 rounded-full object-cover ring-2 ring-[var(--sf-ink)]"
          />
          <span className="min-w-0 text-sm leading-snug">
            <span className="block font-extrabold text-[var(--sf-ink)]">{author.name}</span>
            <span className="block text-[var(--sf-soft)]">
              {author.title} ·{" "}
              <Link
                href={STORY_COPY.href}
                className="rounded-full font-extrabold text-[var(--sf-forest)] underline decoration-[var(--sf-moss)] decoration-2 underline-offset-4 hover:decoration-[var(--sf-forest)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--sf-clay)]/30"
              >
                {STORY_COPY.cta}
              </Link>
            </span>
          </span>
        </figcaption>
      </figure>
    </div>
  );
}
