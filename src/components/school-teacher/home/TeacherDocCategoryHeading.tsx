"use client";

import { createElement } from "react";
import { getTeacherDocumentationCategoryVisual } from "@/lib/school-teacher/teacher-documentation-category-visual";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type TeacherDocCategoryHeadingProps = {
  category: string;
  theme: ParentThemeTokens;
};

export default function TeacherDocCategoryHeading({
  category,
  theme,
}: TeacherDocCategoryHeadingProps) {
  const { Icon, iconBg, iconColor } =
    getTeacherDocumentationCategoryVisual(category);

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
