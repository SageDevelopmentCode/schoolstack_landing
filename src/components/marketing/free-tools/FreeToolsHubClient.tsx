import FreeToolsHero from "@/components/marketing/free-tools/FreeToolsHero";
import FreeToolsGrid from "@/components/marketing/free-tools/FreeToolsGrid";
import FreeToolsFaqSection from "@/components/marketing/free-tools/FreeToolsFaqSection";
import FreeToolsProductCta from "@/components/marketing/free-tools/FreeToolsProductCta";
import ParentSectionKicker from "@/components/school-parent/ui/ParentSectionKicker";
import { FREE_TOOLS_HUB_THEME } from "@/components/marketing/free-tools/free-tools-hub-theme";

const theme = FREE_TOOLS_HUB_THEME;

export default function FreeToolsHubClient() {
  return (
    <>
      <section className="pb-8">
        <FreeToolsHero />
      </section>

      <section id="tools" className="scroll-mt-24">
        <header
          className="mb-5 flex items-end justify-between gap-6 border-t pt-7"
          style={{ borderColor: theme.line }}
        >
          <div>
            <ParentSectionKicker theme={theme}>The toolkit</ParentSectionKicker>
            <h2
              className="mt-2 font-heading text-[27px] font-medium leading-[1.16] tracking-[-0.035em]"
              style={{ fontFamily: theme.fontDisplay, color: theme.ink }}
            >
              Choose the question you’re working through.
            </h2>
            <p
              className="mt-2 text-xs leading-[1.7]"
              style={{ color: theme.muted, fontFamily: theme.fontBody }}
            >
              Each tool has one job—and a clear next step.
            </p>
          </div>
          <span
            className="hidden pb-1 text-[10px] sm:block"
            style={{ color: theme.muted, fontFamily: theme.fontBody }}
          >
            Three tools. No spreadsheet to build.
          </span>
        </header>

        <FreeToolsGrid />
      </section>

      <FreeToolsFaqSection />
      <FreeToolsProductCta />
    </>
  );
}
