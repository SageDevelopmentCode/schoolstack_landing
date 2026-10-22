"use client";

import type { ReactNode } from "react";
import AdminCard from "@/components/school-admin/ui/story/AdminCard";
import AdminSectionKicker from "@/components/school-admin/ui/story/AdminSectionKicker";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import { useSubmissionDetailStory } from "./SubmissionDetailStoryContext";

type DetailPanelSectionProps = {
  C: AdminThemeTokens;
  title: string;
  description?: string;
  badge?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
  id?: string;
};

function DetailPanelSectionContent({
  C,
  title,
  description,
  badge,
  actions,
  children,
}: Omit<DetailPanelSectionProps, "className">) {
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="text-sm font-semibold" style={{ color: C.textPrimary }}>
          {title}
        </h4>
        <div className="flex flex-wrap items-center gap-2">
          {actions}
          {badge}
        </div>
      </div>
      {description ? (
        <p className="mt-1 text-xs leading-relaxed" style={{ color: C.textTertiary }}>
          {description}
        </p>
      ) : null}
      {children ? <div className="mt-3">{children}</div> : null}
    </>
  );
}

export default function DetailPanelSection({
  C,
  title,
  description,
  badge,
  actions,
  children,
  className = "",
  id,
}: DetailPanelSectionProps) {
  const { variant, theme } = useSubmissionDetailStory();

  if (variant === "story" && theme) {
    return (
      <AdminCard theme={theme} padding="canvas" className={className} id={id}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <AdminSectionKicker theme={theme}>{title}</AdminSectionKicker>
          {actions || badge ? (
            <div className="flex flex-wrap items-center justify-end gap-2">
              {actions}
              {badge}
            </div>
          ) : null}
        </div>
        {description ? (
          <p className="mt-2 text-xs leading-relaxed" style={{ color: theme.muted }}>
            {description}
          </p>
        ) : null}
        {children ? <div className="mt-3">{children}</div> : null}
      </AdminCard>
    );
  }

  return (
    <section id={id} className={className}>
      <DetailPanelSectionContent
        C={C}
        title={title}
        description={description}
        badge={badge}
        actions={actions}
      >
        {children}
      </DetailPanelSectionContent>
    </section>
  );
}
