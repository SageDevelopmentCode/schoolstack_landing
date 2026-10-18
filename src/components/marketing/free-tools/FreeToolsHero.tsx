import ParentSectionKicker from "@/components/school-parent/ui/ParentSectionKicker";
import { FREE_TOOLS_HUB_THEME } from "@/components/marketing/free-tools/free-tools-hub-theme";

const theme = FREE_TOOLS_HUB_THEME;

export default function FreeToolsHero() {
  return (
    <div className="hero-copy">
      <ParentSectionKicker theme={theme}>Free tools for microschool founders</ParentSectionKicker>
      <h1
        className="mt-3.5 font-heading text-[clamp(2.25rem,4.5vw,3.3125rem)] font-medium leading-[1.06] tracking-[-0.04em]"
        style={{ fontFamily: theme.fontDisplay, color: theme.ink }}
      >
        Big school decisions.
        <br />
        <em className="font-medium italic" style={{ color: theme.primary }}>
          A clearer place to start.
        </em>
      </h1>
      <p
        className="mt-5 max-w-[590px] text-sm leading-[1.85]"
        style={{ color: theme.muted, fontFamily: theme.fontBody }}
      >
        Work out your enrollment target, explore a tuition change, or untangle your
        school’s next operational step. One question at a time.
      </p>
    </div>
  );
}
