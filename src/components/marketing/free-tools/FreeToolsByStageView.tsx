"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import FreeToolsCompactRow from "@/components/marketing/free-tools/FreeToolsCompactRow";
import FreeToolsStageFlowNav from "@/components/marketing/free-tools/FreeToolsStageFlowNav";
import FreeToolsStageIconTile from "@/components/marketing/free-tools/FreeToolsStageIconTile";
import { FREE_TOOLS_STAGE_SURFACES } from "@/components/marketing/free-tools/free-tools-stage-surfaces";
import {
  FREE_TOOLS_HUB_STAGES,
  freeToolsStageSectionId,
  toolsByStage,
  type FreeToolsHubStageId,
} from "@/lib/marketing/free-tools-hub-content";
import { FREE_TOOLS_HUB_THEME } from "@/components/marketing/free-tools/free-tools-hub-theme";

const theme = FREE_TOOLS_HUB_THEME;

const FULL_BLEED =
  "relative left-1/2 z-0 w-screen max-w-[100vw] -translate-x-1/2 scroll-mt-24";

export default function FreeToolsByStageView() {
  const byStage = toolsByStage();
  const [activeStageId, setActiveStageId] = useState<FreeToolsHubStageId>(
    FREE_TOOLS_HUB_STAGES[0]?.id ?? "prospective_family",
  );
  const scrollFromClickRef = useRef(false);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleStageSelect = useCallback((stageId: FreeToolsHubStageId) => {
    setActiveStageId(stageId);
    scrollFromClickRef.current = true;
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    document
      .getElementById(freeToolsStageSectionId(stageId))
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
    scrollTimeoutRef.current = setTimeout(() => {
      scrollFromClickRef.current = false;
    }, 800);
  }, []);

  useEffect(() => {
    const sectionElements = FREE_TOOLS_HUB_STAGES.map((stage) =>
      document.getElementById(freeToolsStageSectionId(stage.id)),
    ).filter((el): el is HTMLElement => el != null);

    if (sectionElements.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (scrollFromClickRef.current) {
          return;
        }
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        const top = visible[0]?.target;
        if (top?.id) {
          const matched = FREE_TOOLS_HUB_STAGES.find(
            (stage) => freeToolsStageSectionId(stage.id) === top.id,
          );
          if (matched) {
            setActiveStageId(matched.id);
          }
        }
      },
      {
        root: null,
        rootMargin: "-120px 0px -50% 0px",
        threshold: [0, 0.15, 0.35, 0.55],
      },
    );

    for (const element of sectionElements) {
      observer.observe(element);
    }

    return () => {
      observer.disconnect();
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="relative isolate flex flex-col">
      <FreeToolsStageFlowNav
        activeStageId={activeStageId}
        onStageSelect={handleStageSelect}
      />

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
                  <FreeToolsStageIconTile stage={stage} variant="heading" />
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
