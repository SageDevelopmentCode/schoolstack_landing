"use client";

import { useReducedMotion } from "framer-motion";
import { FREE_TOOLS_HUB_THEME } from "@/components/marketing/free-tools/free-tools-hub-theme";
import "./free-tools-stage-flow.css";

type FreeToolsStageFlowConnectorProps = {
  animate: boolean;
  className?: string;
};

export default function FreeToolsStageFlowConnector({
  animate,
  className = "",
}: FreeToolsStageFlowConnectorProps) {
  const theme = FREE_TOOLS_HUB_THEME;
  const stroke = theme.primary ?? "#477455";
  const lineMuted = "#B9CDBD";
  const dashClass = animate ? "free-tools-stage-flow-dash-animate" : "";
  const chevronClass = animate ? "free-tools-stage-flow-chevron-animate" : "";

  return (
    <div
      className={`flex h-11 shrink-0 items-center justify-center ${className}`}
      aria-hidden
    >
      <svg className="h-4 w-8" viewBox="0 0 32 16" fill="none">
        <path
          d="M2 8h20"
          stroke={lineMuted}
          strokeWidth="1.5"
          strokeDasharray="4 3"
          strokeLinecap="round"
          className={dashClass}
        />
        <path
          d="M20 5l5 3-5 3"
          stroke={stroke}
          strokeWidth="1.65"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={chevronClass}
        />
      </svg>
    </div>
  );
}

export function useFreeToolsStageFlowAnimate(): boolean {
  const reduceMotion = useReducedMotion();
  return !reduceMotion;
}
