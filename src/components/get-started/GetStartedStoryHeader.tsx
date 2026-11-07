import type { ReactNode } from "react";
import { BOLD_HEADING } from "@/components/home/bright-styles";

type GetStartedStoryHeaderProps = {
  kicker?: string;
  title: ReactNode;
  subtitle: string;
  className?: string;
  headingAs?: "h1" | "h2";
  titleId?: string;
  titleClassName?: string;
};

export default function GetStartedStoryHeader({
  kicker,
  title,
  subtitle,
  className = "mb-8",
  headingAs = "h1",
  titleId,
  titleClassName = "text-[clamp(1.75rem,3.5vw,2.35rem)]",
}: GetStartedStoryHeaderProps) {
  const Heading = headingAs;

  return (
    <div className={className}>
      {kicker ? (
        <p className="font-secondary text-[13px] font-semibold uppercase tracking-widest text-clay">
          {kicker}
        </p>
      ) : null}
      <Heading
        id={titleId}
        className={`mt-2 ${titleClassName} ${BOLD_HEADING}`}
      >
        {title}
      </Heading>
      <p className="mt-3 font-secondary text-[16px] leading-relaxed text-[#1d1a16]/70">
        {subtitle}
      </p>
    </div>
  );
}
