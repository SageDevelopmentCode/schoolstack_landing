import { ACCENT_HIGHLIGHT, BOLD_HEADING } from "@/components/home/bright-styles";

const DESCRIPTION =
  "Three free tools for enrollment, tuition, and operations. No MudKitchen account required.";

type FreeToolsHeroProps = {
  headingAs?: "h1" | "h2";
  headingId?: string;
};

export default function FreeToolsHero({
  headingAs = "h1",
  headingId,
}: FreeToolsHeroProps) {
  const Heading = headingAs;

  return (
    <div className="hero-copy">
      <p className="font-secondary text-[13px] font-semibold uppercase tracking-widest text-clay">
        Free tools
      </p>
      <Heading
        id={headingId}
        className={`mt-4 text-[clamp(2rem,4.5vw,3.2rem)] ${BOLD_HEADING}`}
      >
        Free tools for <span className={ACCENT_HIGHLIGHT}>microschool founders</span>
      </Heading>
      <p className="mt-5 max-w-[590px] font-secondary text-[16px] leading-relaxed text-[#1d1a16]/70">
        {DESCRIPTION}
      </p>
    </div>
  );
}
