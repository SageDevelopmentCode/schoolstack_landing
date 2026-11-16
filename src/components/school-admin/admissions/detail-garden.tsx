"use client";

import { forwardRef, type ButtonHTMLAttributes, type CSSProperties } from "react";
import {
  getAdminButtonStyle,
  type AdminButtonVariant,
} from "@/lib/organization-settings/admin-button-styles";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import { gBtnOutlineSm, gBtnPopSm } from "@/components/school-parent/garden/ui";
import { gBtnDangerSm } from "@/components/school-admin/garden/kit";
import { useSubmissionDetailStory } from "./SubmissionDetailStoryContext";
import { useAdminGardenSkin } from "@/components/school-admin/garden/skin";

/*
 * Detail-panel sections are shared by Admissions (Garden) and Students,
 * Staff, Teacher and Schedule (story). Sections read the variant from
 * SubmissionDetailStoryContext and pick their button look here, so the
 * business logic stays in one component.
 */

export type DetailButtonKind = AdminButtonVariant;

const STORY_BUTTON_CLASS =
  "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-opacity disabled:opacity-60";

export function useIsGardenDetail(): boolean {
  const skin = useAdminGardenSkin();
  return useSubmissionDetailStory().variant === "garden" || skin != null;
}

export function detailButtonProps(
  garden: boolean,
  kind: DetailButtonKind,
  C: AdminThemeTokens,
  storyClassName = STORY_BUTTON_CLASS,
): { className: string; style?: CSSProperties } {
  if (garden) {
    return {
      className:
        kind === "primary" ? gBtnPopSm : kind === "danger" ? gBtnDangerSm : gBtnOutlineSm,
      // Note: "primary" stays the toy button: detail sections show one primary at a time.
    };
  }
  return { className: storyClassName, style: getAdminButtonStyle(C, kind) };
}

/**
 * Drop-in for `<button style={getAdminButtonStyle(C, kind)}>` in shared
 * detail sections: story look by default, Garden buttons inside the
 * Admissions Garden drawer.
 */
export const DetailButton = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & {
    kind: DetailButtonKind;
    C: AdminThemeTokens;
    storyClassName?: string;
  }
>(function DetailButton({ kind, C, storyClassName, className, style, ...rest }, ref) {
  const garden = useIsGardenDetail();
  const props = detailButtonProps(garden, kind, C, storyClassName ?? className ?? STORY_BUTTON_CLASS);
  return (
    <button
      ref={ref}
      {...rest}
      className={props.className}
      style={garden ? undefined : { ...props.style, ...style }}
    />
  );
});
