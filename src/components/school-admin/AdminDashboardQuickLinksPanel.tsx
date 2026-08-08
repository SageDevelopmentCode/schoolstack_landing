"use client";

import { useCallback, useState } from "react";
import {
  ArrowUpRight,
  Check,
  Copy,
  CreditCard,
  FileText,
  Loader2,
  type LucideIcon,
} from "lucide-react";
import { schoolAdminPath } from "@/lib/organization-settings/admin-routes";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import { adminToast } from "@/lib/school-admin/admin-toast";
import type { AdmissionsSetupStepStatus } from "@/lib/school-admin/admissions-setup-status";
import { fetchStripeConnectDashboardUrl } from "@/lib/stripe/open-stripe-dashboard";
import { SITE_URL } from "@/lib/site";

type AdminDashboardQuickLinksPanelProps = {
  organizationId: string;
  slug: string;
  C: AdminThemeTokens;
  stripeStepStatus: AdmissionsSetupStepStatus;
  applyFormPublicPath: string | null;
};

type QuickLinkRowProps = {
  C: AdminThemeTokens;
  icon: LucideIcon;
  label: string;
  subtitle: string;
  resolveUrl: () => string | Promise<string>;
  muted?: boolean;
};

function toAbsoluteUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  return `${SITE_URL}${path}`;
}

function QuickLinkRow({
  C,
  icon: Icon,
  label,
  subtitle,
  resolveUrl,
  muted = false,
}: QuickLinkRowProps) {
  const [loadingAction, setLoadingAction] = useState<"open" | "copy" | null>(null);
  const [copied, setCopied] = useState(false);

  const handleOpen = useCallback(async () => {
    setLoadingAction("open");
    try {
      const url = await resolveUrl();
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to open link.";
      adminToast.error(message);
    } finally {
      setLoadingAction(null);
    }
  }, [resolveUrl]);

  const handleCopy = useCallback(async () => {
    setLoadingAction("copy");
    try {
      const url = await resolveUrl();
      await navigator.clipboard.writeText(url);
      setCopied(true);
      adminToast.success("Link copied");
      window.setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not copy link.";
      adminToast.error(message);
    } finally {
      setLoadingAction(null);
    }
  }, [resolveUrl]);

  const isLoading = loadingAction !== null;

  return (
    <div
      role="button"
      tabIndex={0}
      className={`flex items-center gap-2.5 rounded-sm py-2.5 transition-colors ${
        isLoading ? "cursor-wait" : "cursor-pointer"
      }`}
      style={{
        opacity: muted ? 0.75 : 1,
      }}
      onClick={() => {
        if (!isLoading) void handleOpen();
      }}
      onKeyDown={(e) => {
        if (isLoading) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          void handleOpen();
        }
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = C.elevated;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "transparent";
      }}
    >
      <Icon
        className="h-4 w-4 shrink-0"
        style={{ color: muted ? C.textTertiary : C.accent }}
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium leading-tight" style={{ color: C.textPrimary }}>
          {label}
        </p>
        <p
          className="truncate text-[11px] leading-tight"
          style={{ color: C.textTertiary }}
        >
          {subtitle}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-0.5">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            void handleCopy();
          }}
          disabled={isLoading}
          className="cursor-pointer rounded-sm p-1 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
          style={{ color: copied ? C.success : C.textTertiary }}
          aria-label={`Copy ${label} link`}
        >
          {loadingAction === "copy" ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : copied ? (
            <Check className="h-3.5 w-3.5" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            void handleOpen();
          }}
          disabled={isLoading}
          className="cursor-pointer rounded-sm p-1 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
          style={{ color: C.textTertiary }}
          aria-label={`Open ${label}`}
        >
          {loadingAction === "open" ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <ArrowUpRight className="h-3.5 w-3.5" />
          )}
        </button>
      </div>
    </div>
  );
}

export default function AdminDashboardQuickLinksPanel({
  organizationId,
  slug,
  C,
  stripeStepStatus,
  applyFormPublicPath,
}: AdminDashboardQuickLinksPanelProps) {
  const paymentsHref = schoolAdminPath(slug, "admissions", "payments");
  const applyFlowsHref = `${schoolAdminPath(slug, "admissions", "flows")}?flow=apply`;
  const paymentsAbsoluteUrl = toAbsoluteUrl(paymentsHref);
  const applyFlowsAbsoluteUrl = toAbsoluteUrl(applyFlowsHref);
  const applyAbsoluteUrl = applyFormPublicPath
    ? toAbsoluteUrl(applyFormPublicPath)
    : null;

  const resolveStripeUrl = useCallback(async () => {
    if (stripeStepStatus === "completed") {
      return fetchStripeConnectDashboardUrl(organizationId);
    }
    return paymentsAbsoluteUrl;
  }, [organizationId, paymentsAbsoluteUrl, stripeStepStatus]);

  const stripeLink =
    stripeStepStatus === "completed"
      ? {
          label: "Stripe dashboard",
          subtitle: "Manage payouts and payment settings",
        }
      : stripeStepStatus === "in_progress"
        ? {
            label: "Finish Stripe setup",
            subtitle: "Complete verification to accept payments",
          }
        : {
            label: "Connect Stripe",
            subtitle: "Set up payments for application fees",
          };

  return (
    <aside
      className="flex w-full shrink-0 flex-col border-t px-3 py-5 lg:w-72 lg:self-stretch lg:border-t-0 lg:border-l"
      style={{ backgroundColor: C.surface, borderColor: C.border }}
      aria-label="Quick links"
    >
      <p
        className="text-xs font-semibold uppercase tracking-wide"
        style={{ color: C.textTertiary }}
      >
        Quick links
      </p>

      <div className="mt-3 flex flex-1 flex-col space-y-1">
        <QuickLinkRow
          C={C}
          icon={CreditCard}
          label={stripeLink.label}
          subtitle={stripeLink.subtitle}
          resolveUrl={resolveStripeUrl}
        />

        {applyAbsoluteUrl ? (
          <QuickLinkRow
            C={C}
            icon={FileText}
            label="Apply page"
            subtitle="Public form families use to apply"
            resolveUrl={() => applyAbsoluteUrl}
          />
        ) : (
          <QuickLinkRow
            C={C}
            icon={FileText}
            label="Publish apply form"
            subtitle="Create and publish your application form"
            resolveUrl={() => applyFlowsAbsoluteUrl}
            muted
          />
        )}
      </div>
    </aside>
  );
}
