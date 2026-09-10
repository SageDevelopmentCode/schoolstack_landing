"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import type { DashboardQuickAction } from "@/lib/school-admin/dashboard-summary";
import { adminToast } from "@/lib/school-admin/admin-toast";
import AdminDisplayHeading from "./AdminDisplayHeading";
import AdminSectionKicker from "./AdminSectionKicker";

type AdminQuickActionsCardProps = {
  theme: ParentThemeTokens;
  actions: DashboardQuickAction[];
};

function rowBorderStyle(index: number): React.CSSProperties {
  return {
    borderTop: index === 0 ? "none" : "1px solid #E9EFEA",
  };
}

function CopyApplyLinkAction({
  theme,
  action,
  index,
}: {
  theme: ParentThemeTokens;
  action: Extract<DashboardQuickAction, { kind: "copy-apply-link" }>;
  index: number;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    const absoluteUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}${action.applyFormPublicPath}`
        : action.applyFormPublicPath;
    try {
      await navigator.clipboard.writeText(absoluteUrl);
      setCopied(true);
      adminToast.success("Link copied");
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      adminToast.error("Could not copy link.");
    }
  }, [action.applyFormPublicPath]);

  return (
    <button
      type="button"
      onClick={() => void handleCopy()}
      className="block w-full py-[11px] text-left"
      style={rowBorderStyle(index)}
    >
      <b className="block text-xs" style={{ color: theme.ink }}>
        {copied ? "Link copied" : action.title}
      </b>
      <span className="text-[11px]" style={{ color: theme.muted }}>
        {action.subtitle}
      </span>
    </button>
  );
}

export default function AdminQuickActionsCard({
  theme,
  actions,
}: AdminQuickActionsCardProps) {
  return (
    <div className="p-[19px]">
      <AdminSectionKicker theme={theme}>Quick actions</AdminSectionKicker>
      <AdminDisplayHeading
        theme={theme}
        as="h3"
        size="section"
        className="mt-1.5 text-[19px] leading-tight"
      >
        Keep moving
      </AdminDisplayHeading>
      <div className="mt-3">
        {actions.map((action, index) => {
          if (action.kind === "copy-apply-link") {
            return (
              <CopyApplyLinkAction
                key={action.id}
                theme={theme}
                action={action}
                index={index}
              />
            );
          }

          return (
            <Link
              key={action.id}
              href={action.href}
              className="block py-[11px] no-underline"
              style={rowBorderStyle(index)}
            >
              <b className="block text-xs" style={{ color: theme.ink }}>
                {action.title}
              </b>
              <span className="text-[11px]" style={{ color: theme.muted }}>
                {action.subtitle}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
