import { GKicker } from "@/components/school-parent/garden/ui";

type PublicTourGardenHeaderProps = {
  headline: string;
  intro: string;
};

/**
 * Page header (the page's only h1). Deliberately not animated: it's
 * server-rendered above the fold, so it must arrive in its final, readable
 * state, including for reduced-motion visitors.
 */
export default function PublicTourGardenHeader({ headline, intro }: PublicTourGardenHeaderProps) {
  return (
    <header className="text-center lg:text-left">
      <GKicker className="mb-3">Campus visit</GKicker>
      <h1 className="sf-display m-0 text-balance text-[2.35rem] leading-[0.95] text-[var(--sf-ink)] sm:text-[3rem] lg:text-[3.35rem]">
        {headline}
      </h1>
      {intro ? (
        <p className="m-0 mx-auto mt-4 max-w-[520px] text-pretty text-[16px] leading-relaxed text-[var(--sf-soft)] lg:mx-0">
          {intro}
        </p>
      ) : null}
    </header>
  );
}
