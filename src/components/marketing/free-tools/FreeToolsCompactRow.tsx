import ParentButtonLink from "@/components/school-parent/ui/ParentButtonLink";
import type { FreeToolsStageSurface } from "@/components/marketing/free-tools/free-tools-stage-surfaces";
import type { FreeToolsHubTool } from "@/lib/marketing/free-tools-hub-content";
import { FREE_TOOLS_HUB_THEME } from "@/components/marketing/free-tools/free-tools-hub-theme";
import { accentIconClasses } from "@/components/marketing/free-tools/free-tools-hub-styles";

const theme = FREE_TOOLS_HUB_THEME;

const DEFAULT_CARD_SURFACE = "border-[#E0E7E0] bg-white";

type FreeToolsCompactRowProps = {
  tool: FreeToolsHubTool;
  surface?: FreeToolsStageSurface;
};

export default function FreeToolsCompactRow({ tool, surface }: FreeToolsCompactRowProps) {
  const Icon = tool.icon;
  const cardSurface = surface?.cardClassName ?? DEFAULT_CARD_SURFACE;

  return (
    <article
      className={`flex flex-col gap-3 rounded-[14px] border px-3.5 py-3 shadow-sm sm:flex-row sm:items-center sm:gap-4 sm:px-4 ${cardSurface}`}
      style={{ boxShadow: theme.shadowCard }}
    >
      <div className="flex min-w-0 flex-1 items-start gap-3 sm:items-center">
        <span
          className={`grid h-8 w-8 shrink-0 place-items-center rounded-[10px] ${accentIconClasses(tool.accent)}`}
        >
          <Icon className="h-4 w-4" strokeWidth={1.7} aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p
            className="text-[9px] font-extrabold uppercase tracking-[0.13em]"
            style={{ color: "#759077" }}
          >
            {tool.kicker}
          </p>
          <h4
            className="mt-0.5 font-heading text-[16px] font-medium leading-snug tracking-[-0.03em] sm:text-[17px]"
            style={{ fontFamily: theme.fontDisplay, color: theme.ink }}
          >
            {tool.title}
          </h4>
          <p
            className="mt-0.5 line-clamp-2 text-[11px] leading-[1.65] sm:line-clamp-1"
            style={{ color: theme.muted, fontFamily: theme.fontBody }}
          >
            {tool.description}
          </p>
        </div>
      </div>
      <ParentButtonLink
        theme={theme}
        href={tool.href}
        variant="primary"
        showArrow
        fullWidth={false}
        className="w-full shrink-0 sm:w-auto sm:min-w-[160px]"
      >
        {tool.ctaLabel}
      </ParentButtonLink>
    </article>
  );
}
