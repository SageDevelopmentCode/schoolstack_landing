import FreeToolsCompactRow from "@/components/marketing/free-tools/FreeToolsCompactRow";
import FreeToolsStageIconTile from "@/components/marketing/free-tools/FreeToolsStageIconTile";
import { FREE_TOOLS_STAGE_SURFACES } from "@/components/marketing/free-tools/free-tools-stage-surfaces";
import {
  FREE_TOOLS_HUB_STAGES,
  freeToolsStageSectionId,
  toolsByStage,
} from "@/lib/marketing/free-tools-hub-content";
import { FREE_TOOLS_HUB_THEME } from "@/components/marketing/free-tools/free-tools-hub-theme";

const theme = FREE_TOOLS_HUB_THEME;

const FULL_BLEED =
  "relative left-1/2 z-0 w-screen max-w-[100vw] -translate-x-1/2 scroll-mt-24";

export default function FreeToolsByStageView() {
  const byStage = toolsByStage();

  return (
    <div className="relative isolate flex flex-col">
      <div className="flex flex-col">
        {FREE_TOOLS_HUB_STAGES.map((stage) => {
          const tools = byStage.get(stage.id) ?? [];
          const surface = FREE_TOOLS_STAGE_SURFACES[stage.id];
          const sectionId = freeToolsStageSectionId(stage.id);

          return (
            <section
              key={stage.id}
              id={sectionId}
              aria-labelledby={`free-tools-stage-heading-${stage.id}`}
              className={`${FULL_BLEED} ${surface.sectionClassName}`}
            >
              <div className="mx-auto max-w-[1180px] px-4 py-8 sm:px-7 lg:px-8">
                <h3
                  id={`free-tools-stage-heading-${stage.id}`}
                  className="flex items-center gap-3 font-heading text-[19px] font-medium tracking-[-0.035em] sm:text-[21px]"
                  style={{ fontFamily: theme.fontDisplay, color: theme.ink }}
                >
                  <FreeToolsStageIconTile stage={stage} />
                  {stage.label}
                </h3>
                {tools.length > 0 ? (
                  <ul className="mt-3.5 flex list-none flex-col gap-2.5 p-0">
                    {tools.map((tool) => (
                      <li key={tool.id}>
                        <FreeToolsCompactRow tool={tool} surface={surface} />
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
