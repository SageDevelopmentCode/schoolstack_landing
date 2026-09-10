"use client";

import { createElement } from "react";
import { Check } from "lucide-react";
import { getFeatureIcon } from "@/lib/organization-settings/icon-registry";
import { getParentFeatureIconStyle } from "@/lib/organization-settings/parent-feature-icon-styles";
import type { ResolvedParentOnboardingItem } from "@/lib/organization-settings/parent-onboarding";

type ParentOnboardingItemIconProps = {
  item: ResolvedParentOnboardingItem;
  variant: "sidebar" | "attention";
};

export default function ParentOnboardingItemIcon({
  item,
  variant,
}: ParentOnboardingItemIconProps) {
  const wrapperClassName =
    variant === "sidebar"
      ? "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full"
      : "flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[13px]";

  if (item.completed) {
    return (
      <div className={`${wrapperClassName} bg-emerald-100`}>
        <Check className="h-4 w-4 text-emerald-600" />
      </div>
    );
  }

  const { iconBg, iconColor } = getParentFeatureIconStyle(item.icon ?? "puzzle");
  const icon = getFeatureIcon(item.icon ?? "puzzle");

  return (
    <div className={`${wrapperClassName} ${iconBg}`}>
      {createElement(icon, { className: `h-4 w-4 ${iconColor}` })}
    </div>
  );
}
