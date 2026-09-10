"use client";

import { createElement } from "react";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import { getAdminDocumentationCategoryVisual } from "@/lib/school-admin/admin-documentation-category-visual";

type AdminDocCategoryHeadingProps = {
  category: string;
  theme: ParentThemeTokens;
};

export default function AdminDocCategoryHeading({
  category,
  theme,
}: AdminDocCategoryHeadingProps) {
  const { Icon, iconBg, iconColor } =
    getAdminDocumentationCategoryVisual(category);

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
