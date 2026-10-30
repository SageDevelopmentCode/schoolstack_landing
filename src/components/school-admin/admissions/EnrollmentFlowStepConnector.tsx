"use client";

import { useReducedMotion } from "framer-motion";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import "./enrollment-flow-step-connector.css";

type EnrollmentFlowStepConnectorProps = {
  theme: ParentThemeTokens;
  orientation: "horizontal" | "vertical";
  className?: string;
};

export default function EnrollmentFlowStepConnector({
  theme,
  orientation,
  className = "",
}: EnrollmentFlowStepConnectorProps) {
  const reduceMotion = useReducedMotion();
  const stroke = theme.primary ?? "#477455";
  const lineMuted = "#B9CDBD";
  const dashClass = reduceMotion ? "" : "enrollment-flow-connector-dash-animate";
  const chevronClass = reduceMotion ? "" : "enrollment-flow-connector-chevron-animate";

  if (orientation === "vertical") {
    return (
      <div className={`flex justify-center py-1 ${className}`} aria-hidden>
        <svg width="20" height="28" viewBox="0 0 20 28" fill="none">
          <path
            d="M10 2v18"
            stroke={lineMuted}
            strokeWidth="1.5"
            strokeDasharray="4 3"
            strokeLinecap="round"
            className={dashClass}
          />
          <path
            d="M5 18l5 5 5-5"
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

  return (
    <div
      className={`flex shrink-0 items-center justify-center px-1 ${className}`}
      aria-hidden
    >
      <svg width="32" height="16" viewBox="0 0 32 16" fill="none">
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
