import type { FreeToolsHubStage } from "@/lib/marketing/free-tools-hub-content";
import { FREE_TOOLS_STAGE_SURFACES } from "@/components/marketing/free-tools/free-tools-stage-surfaces";

type FreeToolsStageIconTileProps = {
  stage: FreeToolsHubStage;
};

export default function FreeToolsStageIconTile({ stage }: FreeToolsStageIconTileProps) {
  const surface = FREE_TOOLS_STAGE_SURFACES[stage.id];
  const Icon = stage.flowIcon;

  return (
    <span
      className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] shadow-sm"
      style={{
        backgroundColor: "#EEF2EE",
        color: surface.flowNodeAccent,
      }}
      aria-hidden
    >
      <Icon className="h-[17px] w-[17px]" strokeWidth={1.65} aria-hidden />
    </span>
  );
}
