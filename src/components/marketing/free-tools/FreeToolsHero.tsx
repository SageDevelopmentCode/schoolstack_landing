import { FREE_TOOLS_HUB_THEME } from "@/components/marketing/free-tools/free-tools-hub-theme";

const theme = FREE_TOOLS_HUB_THEME;

const TITLE = "Free tools for microschool founders";
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
  const headingClassName =
    headingAs === "h1"
      ? "font-heading text-[clamp(2.25rem,4.5vw,3.3125rem)] font-medium leading-[1.06] tracking-[-0.04em]"
      : "font-heading text-[clamp(1.9rem,3.5vw,2.75rem)] font-medium leading-[1.08] tracking-[-0.04em]";

  return (
    <div className="hero-copy">
      <Heading
        id={headingId}
        className={headingClassName}
        style={{ fontFamily: theme.fontDisplay, color: theme.ink }}
      >
        {TITLE}
      </Heading>
      <p
        className="mt-5 max-w-[590px] text-sm leading-[1.85]"
        style={{ color: theme.muted, fontFamily: theme.fontBody }}
      >
        {DESCRIPTION}
      </p>
    </div>
  );
}
