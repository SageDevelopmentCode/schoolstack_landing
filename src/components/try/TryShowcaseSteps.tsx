import Link from "next/link";
import { SAGEFIELD_PHOTOS } from "@/components/home-garden/assets";
import Polaroid from "@/components/home-garden/Polaroid";
import { STORY_COPY } from "@/components/home/home-copy";
import { TRY_STEPS_COPY } from "@/components/try/try-copy";

const STEP_TINTS = [
  "bg-[var(--sf-butter)]",
  "bg-[var(--sf-sky)]",
  "bg-[var(--sf-mint)]",
] as const;

/** Left /try panel: the three signup steps, then the Sage Field story. */
export default function TryShowcaseSteps() {
  const photo = SAGEFIELD_PHOTOS.mudKitchen;
  return (
    <div className="space-y-10">
      <section
        aria-labelledby="try-steps-heading"
        className="rounded-[28px] border-2 border-[var(--sf-ink)] bg-white px-6 py-6 shadow-[0_5px_0_0_var(--sf-ink)]"
      >
        <h2 id="try-steps-heading" className="sf-display text-2xl leading-none text-[var(--sf-ink)]">
          {TRY_STEPS_COPY.heading}
        </h2>
        <ol className="mt-5 space-y-4">
          {TRY_STEPS_COPY.steps.map((step, i) => (
            <li key={step.title} className="flex gap-3">
              <span
                aria-hidden="true"
                className={`sf-display flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-[var(--sf-ink)] text-base text-[var(--sf-ink)] ${STEP_TINTS[i]}`}
              >
                {i + 1}
              </span>
              <span className="leading-snug">
                <span className="block font-extrabold text-[var(--sf-ink)]">{step.title}</span>
                <span className="block text-[15px] text-[var(--sf-soft)]">{step.body}</span>
              </span>
            </li>
          ))}
        </ol>
      </section>

      <figure className="flex items-start gap-4">
        <Polaroid
          src={photo.src}
          alt={photo.alt}
          tilt={-3}
          tape="var(--sf-mint)"
          aspect="aspect-[3/4]"
          sizes="120px"
          className="w-28 shrink-0"
        />
        <div className="min-w-0 pt-2">
          <blockquote className="text-[15px] leading-relaxed text-[var(--sf-ink)]/85">
            &ldquo;{STORY_COPY.quote}&rdquo;
          </blockquote>
          <figcaption className="mt-2 text-sm">
            <span className="block font-extrabold text-[var(--sf-ink)]">{STORY_COPY.author.name}</span>
            <span className="block text-[var(--sf-soft)]">{STORY_COPY.author.title}</span>
            <Link
              href={STORY_COPY.href}
              className="mt-1 inline-block rounded-full font-extrabold text-[var(--sf-forest)] underline decoration-[var(--sf-moss)] decoration-2 underline-offset-4 hover:decoration-[var(--sf-forest)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--sf-clay)]/30"
            >
              {STORY_COPY.cta}
            </Link>
          </figcaption>
        </div>
      </figure>
    </div>
  );
}
