import type { FreeToolsHubStage } from "@/lib/marketing/free-tools-hub-content";
import { FREE_TOOLS_STAGE_SURFACES } from "@/components/marketing/free-tools/free-tools-stage-surfaces";

type FreeToolsStageIconTileProps = {
  stage: FreeToolsHubStage;
  variant: "nav" | "heading";
  isActive?: boolean;
};

export default function FreeToolsStageIconTile({
  stage,
  variant,
  isActive = false,
}: FreeToolsStageIconTileProps) {
  const surface = FREE_TOOLS_STAGE_SURFACES[stage.id];
  const Icon = stage.flowIcon;

  const sizeClass =
    variant === "nav" ? "h-11 w-11 rounded-[14px] shadow-sm" : "h-10 w-10 rounded-[12px] shadow-sm";
  const iconClass = variant === "nav" ? "h-[18px] w-[18px]" : "h-[17px] w-[17px]";

  const activeNav = variant === "nav" && isActive;

  return (
    <span
      className={`grid shrink-0 place-items-center ${sizeClass}`}
      style={{
        backgroundColor: activeNav ? surface.flowNodeAccent : "#EEF2EE",
        color: activeNav ? "#FFFFFF" : surface.flowNodeAccent,
        boxShadow: activeNav ? `0 4px 14px ${surface.flowNodeAccent}40` : undefined,
      }}
      aria-hidden={variant === "heading"}
    >
      <Icon className={iconClass} strokeWidth={1.65} aria-hidden />
    </span>
  );
}
