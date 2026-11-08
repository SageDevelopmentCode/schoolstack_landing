import type { ReactNode } from "react";
import { BOLD_HEADING } from "@/components/home/bright-styles";

type MarketingToolHeroProps = {
  eyebrow: string;
  title: ReactNode;
  description: string;
  headingAs?: "h1" | "h2";
  headingId?: string;
  className?: string;
};

export default function MarketingToolHero({
  eyebrow,
  title,
  description,
  headingAs = "h1",
  headingId,
  className = "mb-10 sm:mb-12",
}: MarketingToolHeroProps) {
  const Heading = headingAs;

  return (
    <header className={className}>
      <p className="font-secondary text-[13px] font-semibold uppercase tracking-widest text-clay">
        {eyebrow}
      </p>
      <Heading
        id={headingId}
        className={`mt-4 max-w-[720px] text-[clamp(2rem,4.2vw,3rem)] ${BOLD_HEADING}`}
      >
        {title}
      </Heading>
      <p className="mt-4 max-w-[640px] font-secondary text-[16px] leading-relaxed text-[#1d1a16]/70">
        {description}
      </p>
    </header>
  );
}
