"use client";

import { createElement } from "react";
import { getParentDocumentationCategoryVisual } from "@/lib/parent-portal/parent-documentation-category-visual";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type ParentDocCategoryHeadingProps = {
  category: string;
  theme: ParentThemeTokens;
};

export default function ParentDocCategoryHeading({
  category,
  theme,
}: ParentDocCategoryHeadingProps) {
  const { Icon, iconBg, iconColor } =
    getParentDocumentationCategoryVisual(category);

  return (
    <div className="mb-2 flex items-center gap-1.5">
      <div
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md ${iconBg}`}
        aria-hidden="true"
      >
        {createElement(Icon, { className: `h-3 w-3 ${iconColor}` })}
      </div>
      <h4
        className="text-[10px] font-semibold uppercase tracking-[0.04em]"
        style={{ color: theme.muted }}
      >
        {category}
      </h4>
    </div>
  );
}
