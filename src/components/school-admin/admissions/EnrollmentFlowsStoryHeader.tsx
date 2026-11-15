"use client";

import type { ReactNode } from "react";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import { StatusIcon } from "./ApplicationFormListBadges";
import type { ApplicationFormStatus } from "@/lib/admissions/application-form-schema";

type EnrollmentFlowsStoryHeaderProps = {
  theme: ParentThemeTokens;
  flowTitle?: ReactNode;
  status?: ApplicationFormStatus;
  flowSwitcher?: ReactNode;
  actions?: ReactNode;
};

/** Garden toolbar for the Enrollment Flows builders (title, status, actions). */
export default function EnrollmentFlowsStoryHeader({
  theme: _theme,
  flowTitle,
  status,
  flowSwitcher,
  actions,
}: EnrollmentFlowsStoryHeaderProps) {
  return (
    <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b-[1.5px] border-dashed border-[var(--sf-ink)]/15 bg-white px-4 py-3 sm:px-5">
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">
        {flowSwitcher}
        {flowTitle}
        {status ? <StatusIcon status={status} variant="plain" size="lg" /> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}
