import { ArrowRight, Star } from "lucide-react";
import {
  formatPortalPillarSummary,
  type PortalRolePillars,
} from "@/lib/auth/organization-portal-account-links";
import { PortalAccountLinkNode } from "@/components/admin/account-links/PortalAccountLinkNode";

export type PortalAccountLinkDiagramAccount = {
  email: string;
  pillars: PortalRolePillars;
};

export type PortalAccountLinkHubDiagramProps = {
  primary: PortalAccountLinkDiagramAccount;
  linked: PortalAccountLinkDiagramAccount[];
  mergedPillars: PortalRolePillars;
  variant: "preview" | "group";
};

function ConnectorLine() {
  return (
    <div
      className="hidden sm:flex shrink-0 items-center px-1 text-admin-faint"
      aria-hidden
    >
      <div className="h-px w-4 bg-admin-border" />
    </div>
  );
}

function HubBrace() {
  return (
    <div
      className="flex shrink-0 flex-col items-center justify-center px-2 text-admin-faint"
      aria-hidden
    >
      <div className="h-full min-h-[2rem] w-px bg-admin-border sm:min-h-0 sm:h-px sm:w-6 sm:self-center" />
      <span className="my-1 text-[10px] font-medium uppercase tracking-wide text-admin-faint">
        link
      </span>
      <div className="hidden h-px w-6 bg-admin-border sm:block" />
    </div>
  );
}

export function PortalAccountLinkHubDiagram({
  primary,
  linked,
  mergedPillars,
  variant,
}: PortalAccountLinkHubDiagramProps) {
  const outcomeTitle =
    variant === "preview"
      ? "After linking, sign-in unlocks"
      : "Combined portal switcher";

  return (
    <div
      className="rounded-admin-md border border-admin-border bg-admin-bg/80 p-4"
      role="img"
      aria-label={`Link group: primary ${primary.email}, merged access ${formatPortalPillarSummary(mergedPillars)}`}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch lg:gap-3">
        <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="space-y-1">
            <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-admin-accent">
              <Star className="h-3 w-3" aria-hidden />
              Primary login
            </p>
            <PortalAccountLinkNode
              email={primary.email}
              pillars={primary.pillars}
              isPrimary
            />
          </div>

          {linked.length > 0 ? (
            <>
              <ConnectorLine />
              <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                {linked.map((account) => (
                  <div key={account.email} className="space-y-1">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-admin-faint">
                      Linked login
                    </p>
                    <PortalAccountLinkNode
                      email={account.email}
                      pillars={account.pillars}
                    />
                  </div>
                ))}
              </div>
            </>
          ) : null}
        </div>

        <HubBrace />

        <div className="flex min-w-0 flex-1 flex-col justify-center gap-2 border-t border-admin-border pt-4 lg:border-t-0 lg:border-l lg:pl-4 lg:pt-0">
          <div className="flex items-center gap-2 text-admin-muted">
            <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
            <p className="text-xs font-semibold text-admin-text">{outcomeTitle}</p>
          </div>
          <p className="text-sm font-medium text-admin-text font-secondary">
            {formatPortalPillarSummary(mergedPillars)}
          </p>
          {variant === "preview" ? (
            <p className="text-xs text-admin-muted font-secondary">
              Any linked email can still sign in; all see the same combined
              portals.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
