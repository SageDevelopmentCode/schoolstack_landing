"use client";

import FreeToolsStageFlowConnector, {
  useFreeToolsStageFlowAnimate,
} from "@/components/marketing/free-tools/FreeToolsStageFlowConnector";
import FreeToolsStageIconTile from "@/components/marketing/free-tools/FreeToolsStageIconTile";
import { FREE_TOOLS_STAGE_SURFACES } from "@/components/marketing/free-tools/free-tools-stage-surfaces";
import {
  FREE_TOOLS_HUB_STAGES,
  freeToolsStageSectionId,
  type FreeToolsHubStageId,
} from "@/lib/marketing/free-tools-hub-content";
import { FREE_TOOLS_HUB_THEME } from "@/components/marketing/free-tools/free-tools-hub-theme";

const theme = FREE_TOOLS_HUB_THEME;

type FreeToolsStageFlowNavProps = {
  activeStageId: FreeToolsHubStageId;
  onStageSelect: (stageId: FreeToolsHubStageId) => void;
};

function StageMapButton({
  stage,
  isActive,
  onSelect,
  className = "",
}: {
  stage: (typeof FREE_TOOLS_HUB_STAGES)[number];
  isActive: boolean;
  onSelect: () => void;
  className?: string;
}) {
  const surface = FREE_TOOLS_STAGE_SURFACES[stage.id];
  const sectionId = freeToolsStageSectionId(stage.id);

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-current={isActive ? "step" : undefined}
      aria-controls={sectionId}
      className={`flex snap-center flex-col items-center gap-2 rounded-[14px] px-1 py-1 text-center transition-colors ${className}`}
      style={{
        fontFamily: theme.fontBody,
        backgroundColor: isActive ? `${surface.flowNodeAccent}12` : "transparent",
      }}
      data-testid={`free-tools-stage-flow-${stage.id}`}
    >
      <FreeToolsStageIconTile stage={stage} variant="nav" isActive={isActive} />
      <span
        className="text-[10px] font-semibold leading-tight sm:text-[11px]"
        style={{ color: isActive ? surface.flowNodeAccent : theme.muted }}
      >
        {stage.flowLabel}
      </span>
    </button>
  );
}

export default function FreeToolsStageFlowNav({
  activeStageId,
  onStageSelect,
}: FreeToolsStageFlowNavProps) {
  const animateConnectors = useFreeToolsStageFlowAnimate();

  return (
    <div
      className="mb-2 rounded-[20px] border border-[#E0E7E0] bg-white p-5 shadow-sm sm:p-6"
      style={{ boxShadow: theme.shadowCard }}
      data-testid="free-tools-stage-flow-nav"
    >
      <p
        className="mb-4 text-center text-[9px] font-extrabold uppercase tracking-[0.14em]"
        style={{ color: "#759077", fontFamily: theme.fontBody }}
      >
        School journey
      </p>

      <div
        className="mx-auto hidden max-w-[960px] grid-cols-11 items-start md:grid"
        role="navigation"
        aria-label="Tool stages"
      >
        {FREE_TOOLS_HUB_STAGES.map((stage, index) => {
          const isActive = activeStageId === stage.id;

          return (
            <div key={stage.id} className="contents">
              <div className="flex justify-center">
                <StageMapButton
                  stage={stage}
                  isActive={isActive}
                  onSelect={() => onStageSelect(stage.id)}
                />
              </div>
              {index < FREE_TOOLS_HUB_STAGES.length - 1 ? (
                <FreeToolsStageFlowConnector
                  animate={animateConnectors}
                  className="w-full min-w-[1.25rem] max-w-[3rem] justify-self-center"
                />
              ) : null}
            </div>
          );
        })}
      </div>

      <div
        className="snap-x snap-mandatory overflow-x-auto pb-1 md:hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="navigation"
        aria-label="Tool stages"
      >
        <div className="mx-auto flex w-max items-start px-1">
          {FREE_TOOLS_HUB_STAGES.map((stage, index) => {
            const isActive = activeStageId === stage.id;

            return (
              <div key={stage.id} className="flex items-start">
                <StageMapButton
                  stage={stage}
                  isActive={isActive}
                  onSelect={() => onStageSelect(stage.id)}
                  className="min-w-[5.5rem] shrink-0"
                />
                {index < FREE_TOOLS_HUB_STAGES.length - 1 ? (
                  <FreeToolsStageFlowConnector animate={animateConnectors} className="w-7" />
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
