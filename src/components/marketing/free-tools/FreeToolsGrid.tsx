import ParentButtonLink from "@/components/school-parent/ui/ParentButtonLink";
import { FREE_TOOLS_HUB_TOOLS } from "@/lib/marketing/free-tools-hub-content";
import { FREE_TOOLS_HUB_THEME } from "@/components/marketing/free-tools/free-tools-hub-theme";
import { accentIconClasses } from "@/components/marketing/free-tools/free-tools-hub-styles";

const theme = FREE_TOOLS_HUB_THEME;

export default function FreeToolsGrid() {
  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3 lg:gap-5">
      {FREE_TOOLS_HUB_TOOLS.map((tool) => (
        <article
          key={tool.id}
          id={`card-${tool.id}`}
          className="flex flex-col overflow-hidden rounded-[22px] border border-[#E0E7E0] bg-white shadow-sm max-md:rounded-[20px]"
          style={{ boxShadow: theme.shadowCard }}
        >
          <div className="flex flex-1 flex-col px-5 pb-5 pt-5 sm:px-6 lg:px-6 max-md:max-[480px]:px-[22px]">
            <div className="mb-5 flex items-center justify-between gap-2.5">
              <span
                className={`grid h-10 w-10 shrink-0 place-items-center rounded-[13px] ${accentIconClasses(tool.accent)}`}
              >
                <tool.icon className="h-[19px] w-[19px]" strokeWidth={1.7} aria-hidden />
              </span>
              <span
                className="text-[9px] font-extrabold uppercase tracking-[0.13em]"
                style={{ color: "#759077" }}
              >
                {tool.kicker}
              </span>
            </div>
            <h3
              className="max-w-[260px] font-heading text-[23px] font-medium leading-[1.14] tracking-[-0.035em] lg:text-[26px]"
              style={{ fontFamily: theme.fontDisplay, color: theme.ink }}
            >
              {tool.title}
            </h3>
            <p
              className="mt-3 text-xs leading-[1.85]"
              style={{ color: theme.muted, fontFamily: theme.fontBody }}
            >
              {tool.description}
            </p>
          </div>
          <footer
            className="flex flex-col gap-2.5 border-t px-5 py-4 sm:px-6 max-md:max-[480px]:block max-md:max-[760px]:min-[481px]:flex-row max-md:max-[760px]:min-[481px]:items-center max-md:max-[760px]:min-[481px]:justify-between max-md:max-[760px]:min-[481px]:bg-[#FCFDFB]"
            style={{ borderColor: "#EDF0E9" }}
          >
            <ParentButtonLink
              theme={theme}
              href={tool.href}
              variant="primary"
              showArrow
              fullWidth
              className="max-md:max-[760px]:min-[481px]:!w-auto max-md:max-[760px]:min-[481px]:min-w-[185px] max-md:max-[760px]:min-[481px]:order-2"
            >
              {tool.ctaLabel}
            </ParentButtonLink>
            <span
              className="text-center text-[9px] leading-[1.5] max-md:max-[760px]:min-[481px]:order-1 max-md:max-[760px]:min-[481px]:text-left max-md:max-[480px]:mt-2.5"
              style={{ color: theme.muted, fontFamily: theme.fontBody }}
            >
              {tool.timeHint}
            </span>
          </footer>
        </article>
      ))}
    </div>
  );
}
